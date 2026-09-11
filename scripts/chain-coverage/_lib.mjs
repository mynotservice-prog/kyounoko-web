/**
 * チェーン別「設備カバー率センサス」の共通部品。
 *
 * 何を数えるか: 各チェーンの**公式店舗検索**が店舗ごとに公開している設備属性
 * （アイコン・フィルタ・設備欄）を全店舗ぶん取得し、「その設備がある店舗数 / 全店舗数」を出す。
 * 「店舗による」を率で答えるための一次データで、公式FAQの有無照合
 * （reports/chain-db-worklist-2026-09-11.tsv）とは別系統。
 *
 * 出力先: data/chain-coverage/<chain>.json（店舗ごとの生データつき）
 *         data/chain-coverage.json（run.mjs が集約。lib/chain-coverage.ts が読む）
 *
 * 約束（docs/writing-rules.md と同じ思想）:
 *  - 公式店舗検索が**属性として持っている設備だけ**を facilities に入れる。
 *    属性として存在すれば count が 0 でも入れる（「0店」と「未公開」は別）。
 *    属性が無いものは入れない。写真や本文からの推測で埋めない。
 *  - total は「数えた店舗数」。公式が公表する店舗数と食い違う場合は note に書く。
 *  - 各アダプタは crawl() を export し、この形を返す:
 *      { chain, name?, sourceUrl, method, total, note?,
 *        facilities: { [key]: { count, label } },
 *        stores: [{ name, url?, facilities: [key, ...] }] }
 *    stores.facilities の集計と facilities[key].count は一致していなければならない（validate で検査）。
 */
import fs from 'node:fs';
import path from 'node:path';

/** lib/chain-facilities.ts の FacilityKey 12項目 + 店舗検索でよく出る家族向け属性 */
export const FACILITY_KEYS = [
  'stepFree', 'zashiki', 'boxSeat', 'kidsChair', 'kidsMenu', 'kidsCutlery',
  'diaperTable', 'nursingRoom', 'babyFoodBringIn', 'toriwake', 'strollerToSeat', 'allergenInfo',
  // 拡張（店舗検索の属性としては頻出だが、記事の12項目には無いもの）
  'kidsSpace', 'privateRoom', 'multiToilet', 'parking',
];

export const OUT_DIR = 'data/chain-coverage';
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 kyounoko-coverage-census/1.0 (+https://kyounoko.jp/contact)';

export const today = () => new Date().toISOString().slice(0, 10);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 礼儀正しい fetch。既定 400ms 間隔・タイムアウト 25s・失敗は 2 回まで再試行 */
let lastAt = 0;
export async function fetchText(url, { delayMs = 400, retries = 2, headers = {} } = {}) {
  const wait = lastAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(25_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return await r.text();
    } catch (e) {
      if (i >= retries) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}
export async function fetchJson(url, opts) {
  return JSON.parse(await fetchText(url, opts));
}

/** HTMLタグを落として空白を畳む */
export const text = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** stores から facilities の count を機械的に作る（アダプタは label の対応表だけ持てばよい） */
export function tally(stores, labels) {
  const facilities = {};
  for (const [key, label] of Object.entries(labels)) facilities[key] = { count: 0, label };
  for (const s of stores) {
    for (const k of new Set(s.facilities)) {
      if (!facilities[k]) throw new Error(`stores に labels に無いキー "${k}" があります（${s.name}）`);
      facilities[k].count++;
    }
  }
  return facilities;
}

export function validate(result) {
  const errs = [];
  for (const k of ['chain', 'sourceUrl', 'method', 'total', 'facilities', 'stores']) {
    if (result[k] === undefined || result[k] === null) errs.push(`${k} がありません`);
  }
  if (errs.length) return errs;
  // 店舗を列挙できず、公式の絞り込み件数（「スロープあり: 37件」等）しか取れない場合は stores: null を許す。
  // その場合 method に「絞り込み件数」である旨を書き、count は公式表示の件数をそのまま入れる。
  if (result.stores === null) {
    if (!/絞り込み|件数/.test(result.method)) errs.push('stores が null のときは method に絞り込み件数による旨を書く');
    for (const [k, v] of Object.entries(result.facilities)) {
      if (!FACILITY_KEYS.includes(k)) errs.push(`facilities に未知のキー: ${k}`);
      if (!v.label) errs.push(`facilities.${k}.label が空`);
      if (typeof v.count !== 'number') errs.push(`facilities.${k}.count が数値ではない`);
    }
    if (!(result.total > 0)) errs.push('total が 0');
    return errs;
  }
  if (!Array.isArray(result.stores)) errs.push('stores が配列ではありません');
  if (result.total !== result.stores.length) errs.push(`total(${result.total}) と stores.length(${result.stores.length}) が一致しません`);
  const counted = {};
  for (const s of result.stores) {
    if (!s.name) errs.push('name の無い店舗があります');
    for (const k of new Set(s.facilities || [])) {
      if (!FACILITY_KEYS.includes(k)) errs.push(`未知の設備キー: ${k}`);
      counted[k] = (counted[k] || 0) + 1;
    }
  }
  for (const [k, v] of Object.entries(result.facilities)) {
    if (!FACILITY_KEYS.includes(k)) errs.push(`facilities に未知のキー: ${k}`);
    if (!v.label) errs.push(`facilities.${k}.label が空（公式の表記をそのまま入れる）`);
    if ((counted[k] || 0) !== v.count) errs.push(`facilities.${k}.count(${v.count}) が stores の集計(${counted[k] || 0})と一致しません`);
  }
  for (const k of Object.keys(counted)) if (!result.facilities[k]) errs.push(`stores にあるキー ${k} が facilities にありません`);
  if (result.total === 0) errs.push('total が 0（店舗を1件も取れていない）');
  return errs;
}

/** 検査して data/chain-coverage/<chain>.json に保存 */
export function save(result) {
  const errs = validate(result);
  if (errs.length) {
    console.error(`❌ ${result.chain}: ${errs.length}件の問題`);
    for (const e of errs) console.error('  - ' + e);
    process.exit(1);
  }
  const out = { countedAt: today(), ...result };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const p = path.join(OUT_DIR, `${result.chain}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
  const summary = Object.entries(out.facilities)
    .map(([k, v]) => `${k}=${v.count}/${out.total}（${v.label}）`)
    .join(' ');
  console.error(`✅ ${out.chain}: ${out.total}店 ${summary || '（設備属性なし）'} → ${p}`);
  return p;
}

/** アダプタを直接 `node scripts/chain-coverage/<chain>.mjs` で実行したときの共通入口 */
export async function runAdapter(crawl) {
  const result = await crawl();
  save(result);
}
