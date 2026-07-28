#!/usr/bin/env node
/**
 * 記事内の内部リンクが本当に開けるかを検査する。
 *
 *   node scripts/check-internal-links.mjs           記事の内部リンクを全部見る
 *   node scripts/check-internal-links.mjs --fix     直せるもの（綴り違い）を直す
 *   node scripts/check-internal-links.mjs --offline 本番に問い合わせない（記事リンクだけ見る）
 *
 * ── なぜ必要か（2026-07-28）────────────────────────────────────────────────
 * `](/articles/<slug>)` と複数形で書かれた内部リンクが **15記事・51本** あり、
 * 本番ではすべて404だった。正しいパスは `/article/<slug>`。
 *
 *     https://kyounoko.jp/articles/rikugien-kodzure  → 404
 *     https://kyounoko.jp/article/rikugien-kodzure   → 200
 *
 * リンク先の記事は51本とも実在していた＝綴りだけの問題で、読者もクローラーも
 * 行き止まりに突き当たっていた。**別の作業のついでに偶然見つけた**もので、
 * これがなければ気づかないままだった。だから検査を仕組みにする。
 *
 * ── 検査のしかた ───────────────────────────────────────────────────────────
 * 内部リンクは2種類に分けて、それぞれ確実な方法で見る。
 *
 *   /article/<slug>  … 全体の98%。`content/articles/<slug>.md` の実在で判定する。
 *                      ネットワーク不要なので毎回・全件やっても一瞬で終わる。
 *   それ以外          … /category /spot /data /station など132種。ルート定義や
 *                      データソースが分散していて静的には辿れないので、本番の
 *                      HTTPステータスで判定する（相異なるパスだけ・重複は省く）。
 *
 * リダイレクト（301/308）は「切れてはいないが一手余分」なので、警告として出す。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES = 'content/articles';
const ORIGIN = process.env.CHECK_ORIGIN || 'https://kyounoko.jp';
const FIX = process.argv.includes('--fix');
const OFFLINE = process.argv.includes('--offline');
const CONCURRENCY = 8;

/** 綴り違いとして自動で直せるもの。左を右に読み替える。 */
const RENAMES = [[/^\/articles\//, '/article/']];

const files = readdirSync(ARTICLES).filter((f) => f.endsWith('.md'));
const slugExists = new Set(files.map((f) => f.replace(/\.md$/, '')));

/**
 * 301統合ずみの slug。ファイルは無いが本番では 308 で生きているので、
 * 「切れている」ではなく「一手余分」として扱う。
 * これを見ずにファイルの実在だけで判定すると誤検知が出る（初版で実際に出した）。
 */
const redirectMap = new Map();
if (existsSync('lib/article-redirects.ts')) {
  const src = readFileSync('lib/article-redirects.ts', 'utf8');
  for (const m of src.matchAll(/\{\s*from:\s*'([^']+)'\s*,\s*to:\s*'([^']+)'\s*\}/g)) {
    redirectMap.set(m[1], m[2]);
  }
}

// slug は frontmatter で上書きできるので、そちらも拾う
for (const f of files) {
  const m = readFileSync(join(ARTICLES, f), 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const s = m && m[1].match(/^slug:\s*(.*)$/m);
  if (s) slugExists.add(s[1].trim().replace(/^["']|["']$/g, ''));
}

/** 1ファイルからマークダウンリンクの内部パスを拾う（アンカー・クエリは落とす）。 */
function linksIn(raw) {
  const out = [];
  for (const m of raw.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const path = m[1].split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    out.push({ path, raw: m[1] });
  }
  return out;
}

// ── 収集 ────────────────────────────────────────────────────────────────────
const byPath = new Map(); // path → Set(file)
for (const f of files) {
  for (const { path } of linksIn(readFileSync(join(ARTICLES, f), 'utf8'))) {
    if (!byPath.has(path)) byPath.set(path, new Set());
    byPath.get(path).add(f);
  }
}

const broken = [];   // {path, files, reason}
const redirects = []; // {path, files, code}

// ── ① 記事リンク: ファイルの実在で判定 ──────────────────────────────────────
const articlePaths = [...byPath.keys()].filter((p) => p.startsWith('/article/'));
for (const p of articlePaths) {
  const slug = p.slice('/article/'.length);
  if (slugExists.has(slug)) continue;
  const to = redirectMap.get(slug);
  if (to && slugExists.has(to)) {
    redirects.push({ path: p, files: byPath.get(p), code: `301 → /article/${to}` });
  } else {
    broken.push({ path: p, files: byPath.get(p), reason: `content/articles/${slug}.md が無い` });
  }
}

// ── ② 綴り違い: 直せる形なら直せると分かるように出す ────────────────────────
const renamable = new Map(); // path → 直した後のpath
for (const p of byPath.keys()) {
  for (const [from, to] of RENAMES) {
    if (!from.test(p)) continue;
    const fixed = p.replace(from, to);
    const slug = fixed.startsWith('/article/') ? fixed.slice('/article/'.length) : null;
    if (slug && slugExists.has(slug)) renamable.set(p, fixed);
  }
}

// ── ③ それ以外: 本番のHTTPステータスで判定 ──────────────────────────────────
const otherPaths = [...byPath.keys()].filter(
  (p) => !p.startsWith('/article/') && !renamable.has(p)
);

async function status(path) {
  try {
    const res = await fetch(ORIGIN + path, { redirect: 'manual', headers: { 'user-agent': 'kyounoko-linkcheck' } });
    return res.status;
  } catch {
    return 0;
  }
}

if (!OFFLINE && otherPaths.length) {
  process.stdout.write(`本番で ${otherPaths.length} パスを確認中`);
  const queue = [...otherPaths];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const p = queue.shift();
        const code = await status(p);
        if (code === 404 || code === 410) broken.push({ path: p, files: byPath.get(p), reason: `本番 HTTP${code}` });
        else if (code >= 300 && code < 400) redirects.push({ path: p, files: byPath.get(p), code });
        else if (code === 0) redirects.push({ path: p, files: byPath.get(p), code: '接続不可' });
        process.stdout.write('.');
      }
    })
  );
  process.stdout.write('\n');
}

// ── 出力 ────────────────────────────────────────────────────────────────────
const fmt = (x) => `  ${x.path}\n     ${x.reason ?? 'HTTP' + x.code}（${[...x.files].slice(0, 4).join(', ')}${x.files.size > 4 ? ` ほか${x.files.size - 4}件` : ''}）`;

if (renamable.size) {
  console.log(`\n✗ パスの綴り違い ${renamable.size}種`);
  let total = 0;
  for (const [from, to] of renamable) {
    const n = byPath.get(from).size;
    total += n;
    console.log(`  ${from} → ${to}（${n}記事）`);
  }
  console.log(`  ${FIX ? '→ --fix 指定により書き換えます' : '→ 直すには --fix を付けて再実行'}`);

  if (FIX) {
    let changed = 0;
    for (const f of files) {
      const path = join(ARTICLES, f);
      const before = readFileSync(path, 'utf8');
      let after = before;
      for (const [from, to] of renamable) {
        after = after.split(`](${from}`).join(`](${to}`);
      }
      if (after !== before) {
        writeFileSync(path, after);
        changed++;
      }
    }
    console.log(`  ✅ ${changed}ファイルを書き換えました`);
  }
}

if (broken.length) {
  console.log(`\n✗ たどり着けない内部リンク ${broken.length}種`);
  broken.forEach((b) => console.log(fmt(b)));
}

if (redirects.length) {
  console.log(`\n⚠ リダイレクトされる内部リンク ${redirects.length}種（切れてはいないが一手余分）`);
  redirects.forEach((r) => console.log(fmt(r)));
}

const linkTotal = [...byPath.values()].reduce((a, s) => a + s.size, 0);
console.log(
  `\n内部リンク ${byPath.size}種 / 記事の延べ ${linkTotal}箇所を確認` +
    `（記事リンク ${articlePaths.length}種はファイルの実在、残り ${otherPaths.length}種は${OFFLINE ? '未確認' : '本番のHTTPステータス'}で判定）`
);

if (broken.length || (renamable.size && !FIX)) {
  console.log('\n✗ 切れているリンクがあります。');
  process.exit(1);
}
console.log('✅ 切れている内部リンクはありません。');
