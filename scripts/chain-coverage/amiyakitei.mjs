/**
 * あみやき亭: 公式「お店を探す」（amiyakitei.jp/search/）が読み込む店舗データ shops.json を使う。
 * 各店舗の「特徴」ラベル（caracter_label_list: テーブル席あり／個室あり／掘りごたつあり／土日祝ランチ営業 等）を
 * 店舗ごとに集計する。1リクエストで全店舗が取れる。
 * shops.json には「あみやき亭」と「あみやき亭PLUS」の2ブランドが入る（公式検索も両方を1画面で扱う）。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://amiyakitei.jp/search/';
const DATA = 'https://amiyakitei.jp/prd/wordpress/wp-content/themes/amiyakitei_brand/data/shops.json';
// 公式「特徴」ラベル → 設備キー。ここに無いラベル（テーブル席あり・土日祝ランチ営業・EPARK順番待ち・特急レーンあり）は無視する
const LABELS = {
  zashiki: '掘りごたつあり',
  privateRoom: '個室あり',
};

export async function crawl() {
  const shops = await fetchJson(DATA);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const stores = [];
  const brands = {};
  for (const s of shops) {
    if (s.close) { closed.push(s.shop_name); continue; }
    brands[s.brandname] = (brands[s.brandname] || 0) + 1;
    const labels = s.caracter_label_list || [];
    stores.push({
      name: s.shop_name.replace(/\s+/g, ' ').trim(),
      url: s.menuurl || undefined,
      facilities: [...new Set(labels.map((l) => byLabel[l]).filter(Boolean))],
    });
  }
  const plus = stores.filter((s) => /plus/i.test(s.name));
  const core = stores.filter((s) => !/plus/i.test(s.name));
  const coreCount = (k) => core.filter((s) => s.facilities.includes(k)).length;
  const plusCount = (k) => plus.filter((s) => s.facilities.includes(k)).length;
  return {
    chain: 'amiyakitei',
    name: 'あみやき亭',
    sourceUrl: SOURCE,
    method: '公式「お店を探す」が読み込む店舗データ（shops.json）の「特徴」ラベルを店舗ごとに集計',
    total: stores.length,
    note: [
      `内訳: ${Object.entries(brands).map(([b, n]) => `${b} ${n}店`).join('、')}（公式検索は両ブランドを1画面で扱うため両方を数えた）`,
      `ブランド別: あみやき亭 ${core.length}店中 掘りごたつあり${coreCount('zashiki')}・個室あり${coreCount('privateRoom')}／あみやき亭PLUS ${plus.length}店中 掘りごたつあり${plusCount('zashiki')}・個室あり${plusCount('privateRoom')}`,
      closed.length ? `閉店フラグ${closed.length}件（${closed.join('、')}）は除外` : '',
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
