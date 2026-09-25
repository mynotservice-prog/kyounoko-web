/**
 * やっぱりステーキ: 公式店舗案内（yapparigroup.jp/shop.html → 地域別ページ shop/<地域>.html）。
 * 各店舗カードの <ul class="shop-icon"> に「○○あり／○○なし」のアイコン（img alt）が全店同じ9項目で並ぶ。
 *   駐車場 / キャッシュレス決済 / 券売機orTTO / AED設置 / テイクアウト / デリバリー / キッズメニュー / チャイルドシート / バリアフリー
 * 設備キーに対応するのは キッズメニューあり→kidsMenu、チャイルドシートあり→kidsChair（店内の子ども用の椅子の意）、
 * 駐車場あり→parking、バリアフリーあり→stepFree。
 * 海外店舗（overseas.html）と姉妹店（group.html）は除外する。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://yapparigroup.jp/shop.html';
const LABELS = {
  kidsMenu: 'キッズメニューあり',
  kidsChair: 'チャイルドシートあり',
  parking: '駐車場あり',
  stepFree: 'バリアフリーあり',
};
const EXCLUDE = { 'overseas.html': '海外店舗', 'group.html': 'やっぱりグループ姉妹店舗' };

const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const top = await fetchText(SOURCE);
  const pages = [...new Set([...top.matchAll(/href="shop\/([a-z_-]+\.html)"/g)].map((m) => m[1]))];
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const excluded = {};
  const seen = new Set();
  let noIcon = 0;
  for (const p of pages) {
    const url = `https://yapparigroup.jp/shop/${p}`;
    const html = await fetchText(url);
    const cards = html.split('<div class="shop-card">').slice(1);
    if (EXCLUDE[p]) { excluded[EXCLUDE[p]] = cards.length; continue; }
    for (const c of cards) {
      const name = clean(c.match(/class="shop-name">([\s\S]*?)<\/h2>/)?.[1] || '');
      const addr = clean(c.match(/class="address">([\s\S]*?)<\/li>/)?.[1] || '');
      if (!name) throw new Error(`店名が取れない: ${url}`);
      if (seen.has(`${name}|${addr}`)) continue;
      seen.add(`${name}|${addr}`);
      const alts = [...(c.match(/<ul class="shop-icon">([\s\S]*?)<\/ul>/)?.[1] || '').matchAll(/alt='([^']*)'/g)].map((m) => m[1].trim());
      if (!alts.length) noIcon++;
      stores.push({ name, url, facilities: alts.map((a) => byLabel[a]).filter(Boolean) });
    }
  }
  return {
    chain: 'yappari-steak',
    name: 'やっぱりステーキ',
    sourceUrl: SOURCE,
    method: '公式店舗案内の地域別ページ（shop/<地域>.html）の店舗カードに並ぶ「あり／なし」アイコンを店舗ごとに集計',
    total: stores.length,
    note: [
      `除外: ${Object.entries(excluded).map(([k, v]) => `${k}${v}件`).join('・')}`,
      '「チャイルドシート」は店内の子ども用の椅子の意としてキッズチェアに対応づけた',
      noIcon ? `アイコンが無い店舗 ${noIcon} 件（該当なしとして集計）` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
