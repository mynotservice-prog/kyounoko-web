#!/usr/bin/env node
/**
 * KV記事上書き（article:overrides）の棚卸しツール — 読み取り専用。
 *
 * 背景（2026-07-27の事故）:
 *   Admin編集は KV(`article:overrides`) に保存され、記事描画は
 *   `lib/articles.ts` の getFileArticle() が「KVがあればKVを丸ごと採用」する。
 *   つまり **上書きがある記事は content/articles/*.md を編集してデプロイしても本番に出ない。**
 *   モーニング面5本のリライトと7/24の星乃施策が丸一日ぶん死んでいた原因がこれ。
 *   しかも「どの記事が上書きを持っているか」を一覧する手段が存在しなかった。
 *   → 施策を打つ前に必ずこのスクリプトを叩いて、対象slugが上書き状態でないか確認する。
 *
 * 使い方:
 *   node scripts/kv-article-overrides.mjs --list            上書き一覧（既定）
 *   node scripts/kv-article-overrides.mjs --list --only=a,b 対象を絞る
 *   node scripts/kv-article-overrides.mjs --list --json     機械可読（他スクリプトから使う用）
 *   node scripts/kv-article-overrides.mjs --dump            KV生Markdownをファイルへ書き出す（バックアップ）
 *   node scripts/kv-article-overrides.mjs --dump --out=DIR  書き出し先を指定
 *   node scripts/kv-article-overrides.mjs --diff            KV版 vs .md版 の unified diff
 *   node scripts/kv-article-overrides.mjs --diff --only=x   1本だけ差分を見る
 *
 * 本ツールは **KVにもリポジトリのmdにも一切書き込まない**（--dump の出力先ディレクトリのみ）。
 * 上書きの解除は Admin編集画面の「上書きを解除して md に戻す」ボタンから行う
 * （DELETE /api/admin/edit-content = KV版をmdへ書き戻してからKV削除するので無損失）。
 *
 * 必要な env（本番KVに接続する。Vercelの値を .env.local に置けば自動で読む）:
 *   KV_REST_API_URL / KV_REST_API_TOKEN（または UPSTASH_REDIS_REST_URL / _TOKEN）
 *
 * ⚠ 重要な安全装置:
 *   lib/kv-store.ts は KV未設定時にエラーを出さず静かにバンドルJSONへフォールバックする。
 *   同じ挙動をこのスクリプトがすると「KVを読めていないのに上書き0件＝健全」と誤読して
 *   施策を進めてしまう。よってこのスクリプトは
 *     (1) env が無ければ即エラー終了
 *     (2) EXISTS でKVへの疎通を実証してから GET する（通信失敗は必ず異常終了）
 *   の2段構えにしてある。「0件」は必ず「疎通したうえで0件」を意味する。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, 'content/articles');
const KV_KEY = 'article:overrides';

// ---- args ----
const has = (f) => process.argv.includes(f);
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const ONLY = (arg('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const AS_JSON = has('--json');
const MODE = has('--dump') ? 'dump' : has('--diff') ? 'diff' : 'list';

// ---- env（.env.local を軽くパース）----
function loadEnvLocal() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnvLocal();

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// 安全装置(1): env が無い状態を「上書き0件」と誤読させない。
if (!KV_URL || !KV_TOKEN) {
  console.error('✗ KV の接続情報がありません。');
  console.error('  KV_REST_API_URL / KV_REST_API_TOKEN（または UPSTASH_REDIS_REST_URL / _TOKEN）が必要です。');
  console.error('  Vercel → Storage → KV の値を .env.local に置くか、環境変数で渡してください。');
  console.error('');
  console.error('  ※ この状態で「上書き0件」と判断してはいけません。KVを読めていないだけです。');
  console.error('    envが用意できない場合は、本番タイトルとmdタイトルの照合で代替してください:');
  console.error('      curl -s https://kyounoko.jp/article/<slug> | grep -o "<title>[^<]*"');
  process.exit(1);
}

// env確認を通ってから読み込む（依存が無い環境でも上のガイダンスが出るように）。
const { createClient } = await import('@vercel/kv');
const kv = createClient({ url: KV_URL, token: KV_TOKEN });

// 安全装置(2): 疎通を実証してから読む。通信/認証エラーは異常終了させる。
let keyExists;
try {
  keyExists = await kv.exists(KV_KEY);
} catch (err) {
  console.error(`✗ KV への接続に失敗しました: ${err instanceof Error ? err.message : err}`);
  console.error('  URL/TOKEN が正しいか、ネットワークが通っているかを確認してください。');
  console.error('  ※ 接続できない＝上書きの有無は「不明」です。0件ではありません。');
  process.exit(1);
}

let map = {};
if (keyExists) {
  try {
    map = (await kv.get(KV_KEY)) || {};
  } catch (err) {
    console.error(`✗ KV の読み取りに失敗しました: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

// ---- helpers ----
const fmOf = (raw, key) => {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const t = m[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return t ? t[1].trim().replace(/^["']|["']$/g, '') : null;
};
const titleOf = (raw) => fmOf(raw, 'title');

/** slug に対応する md を探す。<slug>.md が大半だが、frontmatter の slug が正。 */
let slugIndex = null;
function findFile(slug) {
  const direct = join(ARTICLES_DIR, `${slug}.md`);
  if (existsSync(direct)) return direct;
  if (!slugIndex) {
    slugIndex = new Map();
    for (const f of readdirSync(ARTICLES_DIR)) {
      if (!f.endsWith('.md')) continue;
      const fp = join(ARTICLES_DIR, f);
      const sm = readFileSync(fp, 'utf8').match(/^slug:\s*(.*)$/m);
      if (sm) slugIndex.set(sm[1].trim().replace(/^["']|["']$/g, ''), fp);
    }
  }
  return slugIndex.get(slug) ?? null;
}

const allSlugs = Object.keys(map).sort();
const slugs = ONLY.length ? allSlugs.filter((s) => ONLY.includes(s)) : allSlugs;

if (ONLY.length) {
  const missing = ONLY.filter((s) => !allSlugs.includes(s));
  if (missing.length && !AS_JSON) {
    console.log(`（--only 指定のうち上書きが無いslug: ${missing.join(', ')}）\n`);
  }
}

const rows = slugs.map((slug) => {
  const kvRaw = map[slug];
  const fp = findFile(slug);
  const fileRaw = fp ? readFileSync(fp, 'utf8') : null;
  const kvTitle = titleOf(kvRaw);
  const fileTitle = fileRaw ? titleOf(fileRaw) : null;
  return {
    slug,
    file: fp ? fp.replace(ROOT + '/', '') : null,
    hasFile: !!fp,
    kvTitle,
    fileTitle,
    titleDiffers: !!fileRaw && kvTitle !== fileTitle,
    identical: !!fileRaw && fileRaw === kvRaw,
    kvBytes: Buffer.byteLength(kvRaw),
    fileBytes: fileRaw ? Buffer.byteLength(fileRaw) : null,
    kvNoindex: fmOf(kvRaw, 'noindex') === 'true',
    fileNoindex: fileRaw ? fmOf(fileRaw, 'noindex') === 'true' : null,
  };
});

// ================= list =================
if (MODE === 'list') {
  if (AS_JSON) {
    console.log(JSON.stringify({ key: KV_KEY, total: allSlugs.length, rows }, null, 2));
    process.exit(0);
  }
  console.log(`KV(${KV_KEY}) 上書き総数: ${allSlugs.length}件（疎通確認済み）`);
  if (ONLY.length) console.log(`--only 絞り込み後: ${rows.length}件`);
  console.log('');
  if (rows.length === 0) {
    console.log('上書きはありません。全記事が md 正＝ファイル編集がそのまま本番に反映されます。');
    process.exit(0);
  }
  for (const r of rows) {
    const flag = !r.hasFile ? '[KVのみ・md無し]' : r.identical ? '[md一致]' : r.titleDiffers ? '[title相違]' : '[本文相違]';
    console.log(`● ${r.slug}  ${flag}`);
    console.log(`   KV title : ${r.kvTitle ?? '(なし)'}`);
    if (r.hasFile) {
      console.log(`   md title : ${r.fileTitle ?? '(なし)'}`);
      console.log(`   size     : KV=${r.kvBytes}B  md=${r.fileBytes}B  Δ=${r.kvBytes - r.fileBytes}B`);
      // noindex はファイル側 true が OR で救済されるが、解除後は md の記述だけが残る。
      if (r.fileNoindex && !r.kvNoindex) {
        console.log('   ⚠ noindex: md=true / KV=false。解除後もmdにnoindexが残るか要確認');
      }
    } else {
      console.log(`   md       : 無し（KVにのみ存在する記事。解除するとページが消える）`);
    }
    console.log('');
  }
  const blocked = rows.filter((r) => r.hasFile && !r.identical);
  console.log('― まとめ ―');
  console.log(`md編集が本番に出ない状態の記事: ${rows.filter((r) => r.hasFile).length}件（うち内容が乖離: ${blocked.length}件）`);
  console.log(`KVにのみ存在する記事          : ${rows.filter((r) => !r.hasFile).length}件`);
  console.log('');
  console.log('解除は Admin編集画面 /admin/articles/<slug>/edit の');
  console.log('「上書きを解除して md に戻す」ボタンから（KV版をmdへ書き戻してから削除＝無損失）。');
  process.exit(0);
}

// ================= dump =================
if (MODE === 'dump') {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '').slice(0, 13);
  const out = arg('out', join(ROOT, '.kv-dump', stamp));
  mkdirSync(out, { recursive: true });
  for (const slug of slugs) {
    const p = join(out, `${slug}.md`);
    writeFileSync(p, map[slug], 'utf8');
    console.log(`✎ ${p}`);
  }
  writeFileSync(join(out, '_index.json'), JSON.stringify({ key: KV_KEY, dumpedAt: new Date().toISOString(), rows }, null, 2));
  console.log(`\n${slugs.length}件を書き出しました: ${out}`);
  console.log('（KVにもリポジトリのmdにも書き込んでいません。バックアップ用途）');
  process.exit(0);
}

// ================= diff =================
if (MODE === 'diff') {
  const targets = rows.filter((r) => r.hasFile && !r.identical);
  const kvOnly = rows.filter((r) => !r.hasFile);
  if (kvOnly.length) {
    console.log(`（md無しでdiff不可: ${kvOnly.map((r) => r.slug).join(', ')}）\n`);
  }
  if (targets.length === 0) {
    console.log('差分のある上書きはありません。');
    process.exit(0);
  }
  const tmp = join(tmpdir(), `kv-override-diff-${process.pid}.md`);
  for (const r of targets) {
    writeFileSync(tmp, map[r.slug], 'utf8');
    console.log(`\n${'='.repeat(70)}`);
    console.log(`● ${r.slug}   (- md / + KV=本番で配信中)`);
    console.log('='.repeat(70));
    try {
      // diff は差分ありで exit code 1 を返すので、それを異常扱いにしない。
      const outText = execFileSync('diff', ['-u', '--label', `md:${r.file}`, '--label', `KV:${r.slug}`, r.file, tmp], {
        encoding: 'utf8',
      });
      console.log(outText || '(差分なし)');
    } catch (err) {
      if (err.status === 1 && typeof err.stdout === 'string') console.log(err.stdout);
      else {
        console.error(`✗ diff 実行失敗: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    }
  }
  console.log(`\n${targets.length}件の差分を表示しました。`);
  process.exit(0);
}
