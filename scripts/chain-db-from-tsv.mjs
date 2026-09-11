#!/usr/bin/env node
/**
 * 記入済みの記入シート(TSV)を lib/chain-facilities.ts のエントリに変換する。
 *
 *   node scripts/chain-db-scaffold.mjs --tsv=reports/chain-db-worklist-2026-09-11.tsv   # 生成
 *   （公式ページを見ながら value / note / source_url を埋める）
 *   node scripts/chain-db-from-tsv.mjs reports/chain-db-worklist-2026-09-11.tsv         # 変換
 *   node scripts/chain-db-from-tsv.mjs <tsv> --out=/tmp/entries.ts                      # ファイルへ
 *   node scripts/chain-db-from-tsv.mjs <tsv> --survey-only                              # 記事に出さない調査用として出力
 *
 * `--survey-only` を付けると各エントリに `surveyOnly: true` が入り、攻略記事の判定ボックスと
 * 比較表には出ない（lib/chain-facilities.ts の surveyOnly 参照）。公式照合で埋まるセルが少ないうちは
 * 記事の表を縮めないよう、こちらで登録する。
 *
 * 設計上の約束:
 *  - **value が空欄の項目は出力しない。** 「公式に記載がない」を `no` として書かないため
 *    （docs/writing-rules.md）。items は Partial なので、書かなければ表示されない。
 *  - `value` を入れたのに `source_url` が無い行は **エラーにして出力を止める**。
 *    根拠なしの値がDBに入る経路を作らない。
 *  - 出力は貼り付け用のテキスト。ファイルの自動書き換えはしない（差分を目で見てから入れる）。
 *  - **記事から消える行は extras に引き継ぐ。** DBに登録すると攻略記事の「子連れチェックリスト」
 *    H2節は丸ごと判定ボックスに差し替わる（app/article/[slug]/page.tsx）。12キーに当たる行は
 *    公式照合済みのDB値に置き換え、それ以外の行（子ども料金・温め・煙対策など）と
 *    チェーン固有の「※」注記は extras として残す（2026-09-11 追加）。
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const TSV = args.find((a) => !a.startsWith('--'));
const OUT = (args.find((a) => a.startsWith('--out=')) || '').split('=')[1] || '';
const SURVEY_ONLY = args.includes('--survey-only');
const TODAY = new Date().toISOString().slice(0, 10);

if (!TSV) {
  console.error('usage: node scripts/chain-db-from-tsv.mjs <worklist.tsv> [--out=path]');
  process.exit(1);
}

const lines = fs.readFileSync(TSV, 'utf8').split('\n').filter((l) => l.trim());
const header = lines[0].split('\t');
const idx = Object.fromEntries(header.map((h, i) => [h, i]));
for (const need of ['chain_key', 'chain_name', 'koryaku_slug', 'official_url', 'facility_key', 'value', 'note', 'source_url']) {
  if (!(need in idx)) {
    console.error(`列がありません: ${need}`);
    process.exit(1);
  }
}

const VALID = new Set(['yes', 'no', 'partial', '']);
const existing = fs.readFileSync('lib/chain-facilities.ts', 'utf8');
const registered = new Set([...existing.matchAll(/key: '([^']+)'/g)].map((m) => m[1]));
const articles = new Set(fs.readdirSync('content/articles').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));

const errors = [];
const chains = new Map();

lines.slice(1).forEach((line, n) => {
  const c = line.split('\t');
  const row = (k) => (c[idx[k]] ?? '').trim();
  const key = row('chain_key');
  if (!key) return;
  const value = row('value').toLowerCase();
  if (!VALID.has(value)) {
    errors.push(`${TSV}:${n + 2} value が不正: "${row('value')}"（yes / no / partial / 空欄 のみ）`);
    return;
  }
  if (!chains.has(key)) {
    chains.set(key, {
      key,
      name: row('chain_name'),
      koryakuSlug: row('koryaku_slug'),
      officialUrl: row('official_url'),
      items: [],
      extras: [],
    });
  }
  if (!value) return; // 空欄 = 公式に記載なし → 書かない
  if (!row('source_url')) {
    errors.push(`${TSV}:${n + 2} ${key}.${row('facility_key')} に value があるのに source_url が空`);
    return;
  }
  if (value === 'partial' && !row('note')) {
    errors.push(`${TSV}:${n + 2} ${key}.${row('facility_key')} が partial なのに note が空（何が条件かを書く）`);
    return;
  }
  chains.get(key).items.push({
    facility: row('facility_key'),
    value,
    note: row('note'),
    sourceUrl: row('source_url'),
  });
});

// 12キーに当たる行の見出し。当たらない行（「お子さま向けメニュー」のような詳細も含む）は extras に残す
const KEY_LABEL = [
  /段差|バリアフリー|スロープ/,
  /^(座敷|小上がり|掘りごたつ)/,
  /ボックス|ソファ/,
  /チェア|椅子|いす|イス/,
  /^(キッズメニュー|お子様メニュー|お子さまメニュー|おこさまメニュー|子供メニュー|子どもメニュー)/,
  /カトラリー|食器|スプーン|フォーク/,
  /おむつ|オムツ/,
  /授乳/,
  /離乳食|ベビーフード/,
  /取り分け|取り皿|小皿/,
  /ベビーカー/,
  /アレルゲン|アレルギー/,
];
const plain = (s) => s.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();

/** 攻略記事の「子連れチェックリスト」節のうち、DBの判定ボックスでは出なくなる行を返す */
function extrasFromArticle(slug) {
  const p = `content/articles/${slug}.md`;
  if (!fs.existsSync(p)) return [];
  const md = fs.readFileSync(p, 'utf8').split('\n');
  const start = md.findIndex((l) => /^##\s/.test(l) && l.includes('子連れチェックリスト'));
  if (start === -1) return [];
  let end = start + 1;
  while (end < md.length && !/^##\s/.test(md[end])) end++;
  const sec = md.slice(start + 1, end);

  const out = [];
  const rows = sec
    .filter((l) => l.trim().startsWith('|') && !/^\|\s*[-:| ]+\|?\s*$/.test(l.trim()))
    .slice(1); // 表のヘッダ行
  for (const r of rows) {
    const cells = r.split('|').map((s) => s.trim()).filter(Boolean);
    const label = plain(cells[0] || '');
    if (!label || KEY_LABEL.some((re) => re.test(label))) continue;
    const value = plain(cells.slice(1).join(' / '));
    if (value) out.push({ label, value });
  }
  // チェーン固有の「※」注記だけ残す（判定ボックスの脚注と重なる定型文は捨てる）
  for (const l of sec) {
    const t = plain(l.replace(/^>\s*/, ''));
    if (!l.trim().startsWith('>') || !t.startsWith('※')) continue;
    if (/^※\s*店舗により差があります/.test(t)) continue;
    out.push({ label: 'ポイント', value: t.replace(/^※\s*/, '') });
  }
  return out;
}

// 静的チェック
for (const c of chains.values()) {
  if (registered.has(c.key)) errors.push(`${c.key}: すでに chain-facilities.ts に存在する`);
  if (!c.koryakuSlug || !articles.has(c.koryakuSlug)) {
    errors.push(`${c.key}: koryakuSlug "${c.koryakuSlug}" に対応する記事が無い（判定ボックスが描画されない）`);
  }
  if (!c.name) errors.push(`${c.key}: chain_name が空`);
  c.extras = extrasFromArticle(c.koryakuSlug);
}

if (errors.length) {
  console.error(`\n❌ ${errors.length}件のエラー。修正してから再実行してください。\n`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const v = (it) => {
  const ok = it.value === 'yes' ? 'true' : it.value === 'no' ? 'false' : "'partial'";
  const note = it.note ? `'${esc(it.note)}'` : 'undefined';
  return `      ${it.facility}: V(${ok}, ${note}, { sourceUrl: '${esc(it.sourceUrl)}', verifiedAt: '${TODAY}' }),`;
};

const blocks = [...chains.values()]
  .filter((c) => c.items.length)
  .map((c) => [
    '  {',
    `    key: '${esc(c.key)}',`,
    `    name: '${esc(c.name)}',`,
    c.officialUrl ? `    officialUrl: '${esc(c.officialUrl)}',` : null,
    `    koryakuSlug: '${esc(c.koryakuSlug)}',`,
    `    verifiedAt: '${TODAY}',`,
    `    verifiedMethod: '公式サイト・店舗公開情報の照合',`,
    SURVEY_ONLY ? '    surveyOnly: true,' : null,
    '    items: {',
    ...c.items.map(v),
    '    },',
    ...(c.extras.length
      ? ['    extras: [', ...c.extras.map((e) => `      { label: '${esc(e.label)}', value: '${esc(e.value)}' },`), '    ],']
      : []),
    '  },',
  ].filter(Boolean).join('\n'));

const skipped = [...chains.values()].filter((c) => !c.items.length);
const text = blocks.join('\n');

if (OUT) {
  fs.writeFileSync(OUT, text + '\n');
  console.error(`out: ${OUT}`);
} else {
  console.log(text);
}

const written = [...chains.values()].filter((c) => c.items.length);
console.error('');
console.error(`✅ ${blocks.length} チェーン / ${written.reduce((a, c) => a + c.items.length, 0)} セル / extras ${written.reduce((a, c) => a + c.extras.length, 0)} 行を出力`);
if (skipped.length) {
  console.error(`⏭  値が1つも無いためスキップ: ${skipped.map((c) => c.key).join(' ')}`);
}
console.error('');
console.error('貼り付け先: lib/chain-facilities.ts の CHAIN_FACILITIES 配列末尾');
console.error('※ FacilityValue に sourceUrl / verifiedAt（どちらも optional）が必要。');
console.error('   未対応なら先に型と V() を拡張すること。');
