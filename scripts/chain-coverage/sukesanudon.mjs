/**
 * 資さんうどん: 公式店舗一覧（sukesanudon.com/map/、20件ずつページ送り）で全店舗を列挙し、
 * 各店舗ページの「設備」欄（<div class="store-info__facility"> … 駐車場あり）を店舗ごとに読む。
 * 一覧の絞り込みフォームにも「設備: 駐車場あり」チェックがある（属性は駐車場のみ）。
 */
import { fetchText, text, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.sukesanudon.com/map/';
const LABELS = {
  parking: '駐車場あり',
};

export async function crawl() {
  const first = await fetchText(SOURCE);
  const pages = Math.max(1, ...[...first.matchAll(/\/map\/page\/(\d+)\//g)].map((m) => Number(m[1])));
  const urls = new Set();
  const collect = (html) => { for (const m of html.matchAll(/href="(https:\/\/www\.sukesanudon\.com\/map\/branch\/\d+\/)"/g)) urls.add(m[1]); };
  collect(first);
  for (let p = 2; p <= pages; p++) collect(await fetchText(`${SOURCE}page/${p}/`));
  const stores = [];
  const vocab = {};
  for (const url of urls) {
    const html = await fetchText(url);
    const name = text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split(/[|｜]/)[0].trim();
    const m = html.match(/store-info__facility">([\s\S]*?)<\/div>/);
    const facilityText = m ? text(m[1]).replace(/^設備\s*/, '') : '';
    vocab[facilityText] = (vocab[facilityText] || 0) + 1;
    const facilities = [];
    if (/駐車場あり/.test(facilityText)) facilities.push('parking');
    stores.push({ name, url, facilities });
  }
  console.error('設備欄の値:', JSON.stringify(vocab));
  return {
    chain: 'sukesanudon',
    name: '資さんうどん',
    sourceUrl: SOURCE,
    method: '公式店舗一覧（20件ずつページ送り）で全店舗を列挙し、各店舗ページの「設備」欄を集計',
    total: stores.length,
    note: '公式の設備属性は「駐車場あり」のみ（設備欄が無い店舗は駐車場なしとして数えた）',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
