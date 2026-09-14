/**
 * 天丼てんや: 公式店舗案内（tenya.co.jp/shop/）を 都道府県 → 市区町村 → 店舗ページ と辿り、
 * 各店舗ページの「店舗施設情報」アイコン（<dt class="icon storeInfo"><span class="parking">駐車場あり</span>）を
 * 店舗ごとに読む。海外店舗（/shop/oversea/）は対象外。
 */
import { fetchText, text, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.tenya.co.jp/shop/';
// 公式アイコンの class → 設備キー。ここに無いもの（終日禁煙・朝食メニュー・店舗限定メニュー等）は無視する
const LABELS = {
  kidsMenu: 'お子様メニューあり',
  parking: '駐車場あり',
};
const BY_CLASS = { kids: 'kidsMenu', parking: 'parking' };

export async function crawl() {
  const top = await fetchText(SOURCE);
  const prefs = [...new Set([...top.matchAll(/href="(https:\/\/www\.tenya\.co\.jp\/shop\/[a-z]+\/)"/g)].map((m) => m[1]))]
    .filter((u) => !u.includes('/oversea/'));
  const urls = new Set();
  const addStores = (html) => {
    for (const m of html.matchAll(/href="(\/shop\/[a-z]+\/[a-z0-9_\-/]+\.html)"/g)) {
      if (!m[1].startsWith('/shop/oversea/')) urls.add('https://www.tenya.co.jp' + m[1]);
    }
  };
  for (const p of prefs) {
    const ph = await fetchText(p);
    addStores(ph);
    const cities = [...new Set([...ph.matchAll(/href="(https:\/\/www\.tenya\.co\.jp\/shop\/[a-z]+\/[a-z0-9_-]+\/)"/g)].map((m) => m[1]))];
    for (const c of cities) addStores(await fetchText(c));
  }
  const stores = [];
  for (const url of urls) {
    const html = await fetchText(url);
    const name = text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split('|')[0].trim();
    const icons = [...html.matchAll(/<dt class="icon storeInfo"><span class="([^"]+)">([^<]*)/g)];
    if (!html.includes('店舗施設情報')) throw new Error(`店舗施設情報が無い: ${url}`);
    const facilities = icons.map((m) => BY_CLASS[m[1]]).filter(Boolean);
    stores.push({ name, url, facilities });
  }
  return {
    chain: 'tenya',
    name: '天丼てんや',
    sourceUrl: SOURCE,
    method: '公式店舗案内を都道府県→市区町村→店舗ページと辿り、各店舗ページの「店舗施設情報」アイコンを集計',
    total: stores.length,
    note: '国内店舗のみ（海外店舗は除外）。店舗施設情報のアイコンは 終日禁煙／駐車場あり／お子様メニューあり／朝食メニューあり／おつまみメニューあり／店舗限定メニューあり の6種',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
