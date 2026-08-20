#!/usr/bin/env node
/**
 * 施設固有の「駐車場あり」断定に営業時間が書かれていない箇所を検出する。
 *
 * ── なぜ作ったか ──────────────────────────────────────────────
 * 2026-08-20 の横断監査で、施設固有の「駐車場あり」断定が 88記事・154箇所あり、
 * **うち86%（132箇所）に営業時間の記載がなかった**。「駐車場あり/なし」自体の
 * 誤りより、この型のほうが桁違いに多い。
 * 多摩の都立公園は 9:00〜17:00 で夜間閉鎖が標準なので、ライトアップ・花火・早朝など
 * **日没後／早朝の行動を勧める記事**と重なると、読者が車で行って現地で停められない。
 * 実際 2026-08-20 に、昭和記念公園（閉園30分前に閉門・開園時間外の留め置き不可）を
 * 夜の花火記事が「駐車場あり」前提で案内していた事故を修正している。
 *
 * ── 何を保証するか ────────────────────────────────────────────
 * 「**夜間・早朝の行動を勧める文脈**で、**特定の施設**の駐車場の存在を断定していて、
 * かつその施設ブロックのどこにも**営業時間の記載がない**」箇所を新たに増やさないこと。
 * 保証しないもの（＝わざと落とさないもの）:
 *   - 「郊外ロードサイド店は駐車場付きが多い」型のチェーン一般論（監査で71記事126箇所）。
 *     特定施設に行かせる断定ではないので実害が小さい。これを落とすと誤検知だらけになり、
 *     ガードごと無視されるようになる。
 *   - 昼間前提の記事の駐車場断定。警告（WARN）としては出すが exit は落とさない。
 *
 * ── 既存分の扱い ──────────────────────────────────────────────
 * 監査時点の未処置分は `data/parking-claims-baseline.json` にベースラインとして持ち、
 * **新規混入だけを exit 1 で落とす**。既存を全部潰すまで赤のままだと運用できないため。
 * 記事を直したらベースラインからも消えるので、`--update-baseline` で更新する
 * （減る方向の更新は歓迎、増える方向の更新は「見逃しの追認」なので理由を書くこと）。
 *
 * 使い方（TypeScript を読まないので素の node で動く。Node 18+）:
 *   node scripts/check-parking-claims.mjs
 *
 *   --all              ベースライン済み・WARN も含めて全件表示
 *   --no-baseline      ベースラインを無視して全 ERROR を出す（棚卸し用）
 *   --update-baseline  現状の ERROR をベースラインに焼き直す（data/ に書き込む）
 *   --slug=xxx         特定記事だけ見る（部分一致）
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = join(ROOT, 'content/articles');
const BASELINE_PATH = join(ROOT, 'data/parking-claims-baseline.json');

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const ALL = process.argv.includes('--all');
const NO_BASELINE = process.argv.includes('--no-baseline');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const SLUG_FILTER = arg('slug', '');

// ── 判定に使う語彙 ────────────────────────────────────────────

/** 「駐車場がある」と断定している形 */
const POSITIVE_RE = [
  /駐車場[^。]{0,6}(あり|有り|完備|併設|多数)/,
  /(有料|無料|大型|地下|屋内|立体|専用|広い|広め)駐車場/,
  /駐車場[^。]{0,20}?(有料|無料|[\d０-９][\d,０-９]*\s*台|¥|￥|[\d０-９]+\s*円)/,
];

/** 「駐車場がない／わからない」＝そもそも断定していない */
const NEGATIVE_RE = [
  /駐車場[^。]{0,12}(なし|無し|ありません|ございません|不可|ではありません|は無い|不要)/,
  /駐車場が(あり|)ませ/,
  /(確認できませ|不明|未確認)/,
];

/**
 * チェーン一般論・動線の話・読者への注意喚起。
 * 特定施設へ行かせる断定ではないので**落とさない**（誤検知を減らす側に倒す）。
 */
const GENERIC_RE = [
  // 一般化の目印
  /多い|多く|傾向|ほとんど|大半|標準|一般的|基本的|場合が|ことが|など|それぞれ|園ごと|店舗ごと/,
  // チェーン・商業施設の話
  /店舗|チェーン|ロードサイド|郊外|モール|商業施設|系は|型は|フードコート/,
  // 動線・混雑・段取りの話（存在の断定ではない）
  /駐車場(から|まで|へ|に着|の有無|情報|を事前|を確保|を探|待ち)|満車|混雑|直結|段差|積み下ろし|停められ/,
  // 設問・見出し・「あるかどうか」の話
  /[?？]|^#{1,6}\s|あるか[、。とど]|あるかどうか|かどうか/,
  // 施設自体の駐車場ではなく周辺のコインパーキングの話（閉鎖時間の実害が薄い）
  /周辺|近隣|近くの|コインパーキング|民間|路上|路肩/,
];

/** 施設固有らしさ（台数・料金・ラベル行のいずれか） */
const SPECIFIC_RE = [
  /[\d０-９][\d,０-９]*\s*台/,
  /¥|￥|[\d０-９]+\s*円|有料|無料/,
];

/** 営業時間の記載とみなす表現 */
const HOURS_RE = [
  /[\d０-９]{1,2}\s*[:：]\s*[\d０-９]{2}/, // 9:00 / 16:30
  /[\d０-９]{1,2}\s*時(半|[\d０-９]{1,2}分)?\s*[〜~ー\-–—から]/, // 9時〜 / 9時半から
  /[〜~ー\-–—]\s*[\d０-９]{1,2}\s*時/, // 〜17時
  /24\s*時間|２４\s*時間|終日/,
  /(開園|開館|営業|利用)時間(内|と同じ|は同じ)/,
  /閉門|閉場|夜間閉鎖|閉園時間の[\d０-９]+分前|時まで|時から/,
];

/** 夜間・早朝の行動を勧める文脈（＝駐車場の営業時間が効いてくる記事・節） */
const NIGHT_RE =
  /ライトアップ|イルミネーション|夜間|夜景|夜の|夜に|夜は|日没|夕暮れ|ナイト|花火|星空|閉園後|開園前|早朝|朝いち|朝一番|始発|車中泊|お泊まり|ナイトズー/;

const test = (res, s) => (Array.isArray(res) ? res.some((r) => r.test(s)) : res.test(s));

// ── 記事のパース ──────────────────────────────────────────────

function parseArticle(raw) {
  const lines = raw.split('\n');
  let front = '';
  let bodyStart = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      front = lines.slice(1, end).join('\n');
      bodyStart = end + 1;
    }
  }
  return { front, body: lines.slice(bodyStart), bodyOffset: bodyStart };
}

/** 見出しごとのブロックに切る（営業時間を探す範囲＝同じ施設ブロック） */
function splitBlocks(bodyLines, bodyOffset) {
  const blocks = [];
  let cur = { heading: '(冒頭)', lines: [], lineNos: [] };
  bodyLines.forEach((line, i) => {
    if (/^#{2,6}\s/.test(line)) {
      if (cur.lines.length) blocks.push(cur);
      cur = { heading: line.replace(/^#+\s*/, '').trim(), lines: [], lineNos: [] };
    }
    cur.lines.push(line);
    cur.lineNos.push(bodyOffset + i + 1);
  });
  if (cur.lines.length) blocks.push(cur);
  return blocks;
}

const normalize = (s) =>
  s
    .replace(/\*\*|__|`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, '')
    .trim();

/** 1行を「1つの主張」の単位に割る（。／表のセル） */
const segmentsOf = (line) =>
  line
    .split(/[。｜|]/)
    .map((s) => s.trim())
    .filter((s) => s.includes('駐車場'));

// ── 検出 ────────────────────────────────────────────────────

function scanArticle(slug, raw) {
  const { front, body, bodyOffset } = parseArticle(raw);
  // 記事全体の意図（タイトル・説明・リード）に夜間/早朝が出るなら記事丸ごと対象
  const articleIsNight = NIGHT_RE.test(front);
  const blocks = splitBlocks(body, bodyOffset);
  const found = [];

  for (const block of blocks) {
    const blockText = block.lines.join('\n');
    const blockHasHours = test(HOURS_RE, blockText);
    const blockIsNight = articleIsNight || NIGHT_RE.test(block.heading) || NIGHT_RE.test(blockText);

    block.lines.forEach((line, i) => {
      if (!line.includes('駐車場')) return;
      if (/^\s*>/.test(line)) return; // 出典の引用行
      for (const seg of segmentsOf(line)) {
        // 長文は施設スペックの断定ではなく地の文の議論（費用の内訳・体験談）なので見ない
        if (normalize(seg).length > 120) continue;
        if (test(NEGATIVE_RE, seg)) continue;
        if (!test(POSITIVE_RE, seg)) continue;
        if (test(GENERIC_RE, seg)) continue; // チェーン一般論・動線の話
        if (!test(SPECIFIC_RE, seg)) continue; // 台数も料金も無い＝ふわっとした言及
        if (blockHasHours) continue; // 同じ施設ブロックに営業時間の記載がある
        found.push({
          slug,
          line: block.lineNos[i],
          heading: block.heading,
          claim: normalize(seg),
          severity: blockIsNight ? 'error' : 'warn',
        });
      }
    });
  }
  return found;
}

// ── 実行 ────────────────────────────────────────────────────

const files = readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !SLUG_FILTER || f.includes(SLUG_FILTER));

const hits = [];
for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  hits.push(...scanArticle(slug, readFileSync(join(ARTICLES_DIR, f), 'utf8')));
}

const key = (h) => `${h.slug}\t${h.claim}`;
const errors = hits.filter((h) => h.severity === 'error');
const warns = hits.filter((h) => h.severity === 'warn');

let baseline = [];
if (!NO_BASELINE && existsSync(BASELINE_PATH)) {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).entries ?? [];
}
const baseSet = new Set(baseline.map((b) => `${b.slug}\t${b.claim}`));
const fresh = errors.filter((h) => !baseSet.has(key(h)));
const known = errors.filter((h) => baseSet.has(key(h)));

if (UPDATE_BASELINE) {
  const entries = errors
    .map((h) => ({ slug: h.slug, claim: h.claim }))
    .sort((a, b) => (a.slug + a.claim).localeCompare(b.slug + b.claim));
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        note:
          '施設固有の駐車場断定に営業時間が無い既知の未処置分。scripts/check-parking-claims.mjs が' +
          'これを除いた新規混入だけを落とす。記事を直したら --update-baseline で減らす。',
        updatedAt: new Date().toISOString().slice(0, 10),
        entries,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`ベースラインを更新: ${entries.length}件 → ${BASELINE_PATH.replace(ROOT + '/', '')}`);
  process.exit(0);
}

console.log(
  `記事 ${files.length}本を走査　` +
    `ERROR ${errors.length}件（うち新規 ${fresh.length} / 既知 ${known.length}）　WARN ${warns.length}件\n`,
);

const show = (list, label) => {
  if (!list.length) return;
  console.log(`── ${label} ${list.length}件 ──`);
  for (const h of list) {
    console.log(`  ${h.slug}:${h.line}  [${h.heading}]`);
    console.log(`    ${h.claim}`);
  }
  console.log('');
};

show(fresh, '❌ 新規（夜間・早朝の文脈で営業時間なし）');
if (ALL) {
  show(known, '既知（ベースライン済み・要処置）');
  show(warns, '⚠️ 昼間前提の記事（参考・exitは落とさない）');
}

if (fresh.length) {
  console.error(
    `❌ 施設固有の駐車場断定が ${fresh.length}件、営業時間なしで新規に入りました。\n` +
      '   夜間・早朝の行動を勧める記事で駐車場に言及するときは、公式で営業時間を確認して本文に書いてください\n' +
      '   （多摩の都立公園は 9:00〜17:00 の夜間閉鎖が標準。読者が現地で停められません）。',
  );
  process.exit(1);
}
console.log('✅ 新規混入なし');
