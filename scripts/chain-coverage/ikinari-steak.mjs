/**
 * いきなり！ステーキ: 公式店舗検索（ikinaristeak.com/shopinfo/）。
 * 都道府県別一覧（/store_pref/<pref>/）に全店舗のカードが並び、各カードのサービスアイコン
 * （<p class="storeInfoServiceIcon"> の img alt）が「サービスから探す」の絞り込み条件と同じ項目を持つ。
 *   駐車場あり / クレジットカード可 / QRコード決済可 / デリバリーあり / 車いす可 / 子供用椅子あり / ベンチシートあり
 * 設備キーに対応するのは 子供用椅子あり→kidsChair、駐車場あり→parking、車いす可→stepFree。
 * 「ベンチシートあり」は座敷・ボックス席のどちらにも当たらないので数えない。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://ikinaristeak.com/shopinfo/';
const LABELS = {
  kidsChair: '子供用椅子あり',
  parking: '駐車場あり',
  stepFree: '車いす可',
};

const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const top = await fetchText(SOURCE);
  const prefs = [...new Set([...top.matchAll(/store_pref\/([a-z_-]+)/g)].map((m) => m[1]))];
  if (prefs.length < 10) throw new Error(`都道府県ページが少なすぎる: ${prefs.join(',')}`);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const seen = new Set();
  const alts = {};
  for (const pref of prefs) {
    const url = `https://ikinaristeak.com/store_pref/${pref}/`;
    const html = await fetchText(url);
    const cards = html.split('<div class="storeInfoEach ').slice(1);
    for (const c of cards) {
      const name = clean(c.match(/<p class="storeEachTitleText">([\s\S]*?)<\/p>/)?.[1] || '');
      const addr = clean(c.match(/<th>住所<\/th>\s*<td>([\s\S]*?)<\/td>/)?.[1] || '');
      if (!name) throw new Error(`店名が取れない: ${url}`);
      const key = `${name}|${addr}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const icons = [...(c.match(/<p class="storeInfoServiceIcon">([\s\S]*?)<\/p>/)?.[1] || '').matchAll(/alt="([^"]*)"/g)].map((m) => m[1].trim());
      for (const a of icons) alts[a] = (alts[a] || 0) + 1;
      stores.push({ name, url, facilities: icons.map((a) => byLabel[a]).filter(Boolean) });
    }
  }
  for (const l of Object.values(LABELS)) if (!alts[l]) throw new Error(`アイコン "${l}" が1件も無い（表記変更？ 現在: ${Object.keys(alts).join('|')}）`);
  return {
    chain: 'ikinari-steak',
    name: 'いきなり！ステーキ',
    sourceUrl: SOURCE,
    method: `公式店舗検索の都道府県別一覧（/store_pref/<都道府県>/、${prefs.length}ページ）に並ぶ店舗カードのサービスアイコン（「サービスから探す」の絞り込み条件と同じ項目）を店舗ごとに集計`,
    total: stores.length,
    note: `アイコンの内訳: ${Object.entries(alts).map(([k, v]) => `${k}${v}`).join('・')}。「ベンチシートあり」は対応する設備項目が無いため数えない。「車いす可」は入口の段差なし（stepFree）に対応づけた`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
