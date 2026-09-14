/**
 * 炭焼きレストランさわやか: 公式「エリアからさがす」（genkotsu-hb.com/shop/area）で全店舗を列挙し、
 * 各店舗詳細ページの <dt>設備</dt> のアイコン（alt: バリアフリー／多目的トイレ／AED）と
 * 「席数・駐車台数」行（例「78席 53台」）を店舗ごとに読む。サーバー描画なのでJS不要。
 */
import { fetchText, text, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.genkotsu-hb.com/shop/area';
// 公式アイコンの alt／行見出し → 設備キー。AED は無視する
const LABELS = {
  stepFree: 'バリアフリー',
  multiToilet: '多目的トイレ',
  parking: '駐車台数',
};

export async function crawl() {
  const area = await fetchText(SOURCE);
  const urls = [...new Set([...area.matchAll(/href="(https:\/\/www\.genkotsu-hb\.com\/shop\/detail\/\d+)"/g)].map((m) => m[1]))];
  const byAlt = { 'バリアフリー': 'stepFree', '多目的トイレ': 'multiToilet' };
  const stores = [];
  for (const url of urls) {
    const html = await fetchText(url);
    const name = text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split('｜')[0].split('（')[0].trim();
    const opt = html.match(/<dt>設備<\/dt>\s*<dd class="options">([\s\S]*?)<\/dd>/);
    const seats = html.match(/<dt>席数・駐車台数<\/dt>\s*<dd>([\s\S]*?)<\/dd>/);
    if (!opt || !seats) throw new Error(`設備欄が無い: ${url}`);
    const facilities = [...opt[1].matchAll(/alt="([^"]+)"/g)].map((m) => byAlt[m[1]]).filter(Boolean);
    const cars = text(seats[1]).match(/(\d+)\s*台/);
    if (cars && Number(cars[1]) > 0) facilities.push('parking');
    stores.push({ name, url, facilities });
  }
  return {
    chain: 'sawayaka',
    name: '炭焼きレストランさわやか',
    sourceUrl: SOURCE,
    method: '公式「エリアからさがす」で全店舗を列挙し、各店舗詳細ページの「設備」アイコン（alt）と「席数・駐車台数」行を集計',
    total: stores.length,
    note: '設備アイコンはバリアフリー／多目的トイレ／AEDの3種のみ。駐車場は「駐車台数」が1台以上の店舗を数えた。お子様椅子・おむつ交換台等の属性は公式に無い',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
