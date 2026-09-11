/**
 * ブロンコビリー: 公式店舗一覧（www.bronco.co.jp/shop/）→ 各店舗ページ。
 * 店舗ページの設備アイコン（<img src=".../icon_NN.jpg" width="48" alt="設備名">）を集計する。
 * アイコンは全9種: 駐車場 / クレジット可 / ベビーシート / ベビーチェア / 全席禁煙 / 段差なし / 多目的トイレ / 車椅子対応駐車場 / エレベーター。
 * 家族向け5種だけ設備キーに対応づける（車椅子対応駐車場・エレベーターは対応キーが無いので数えない）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.bronco.co.jp/shop/';
// 店舗ページのアイコン alt 表記（そのまま） → 設備キー
const LABELS = {
  parking: '駐車場',
  diaperTable: 'ベビーシート',
  kidsChair: 'ベビーチェア',
  stepFree: '段差なし',
  multiToilet: '多目的トイレ',
};
const KNOWN_ICONS = new Set([...Object.values(LABELS), 'クレジット可', '全席禁煙', '車椅子対応駐車場', 'エレベーター']);
const ALT_TO_KEY = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));

export async function crawl() {
  const list = await fetchText(SOURCE);
  const urls = [...new Set([...list.matchAll(/href="(https:\/\/www\.bronco\.co\.jp\/shop\/[a-z]+\/[a-z_0-9]+\/)"/g)].map((m) => m[1]))];
  if (!urls.length) throw new Error('店舗一覧から店舗URLが取れない');
  const stores = [];
  const unknown = new Set();
  for (const url of urls) {
    const html = await fetchText(url);
    const alts = [...html.matchAll(/icon_\d+\.jpg" width="48" alt="([^"]*)"/g)].map((m) => m[1]);
    if (!alts.length) throw new Error(`設備アイコンが無い: ${url}`);
    for (const a of alts) if (!KNOWN_ICONS.has(a)) unknown.add(a);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    const name = title.split('（')[0].replace(/\s+/g, ' ').trim();
    if (!name) throw new Error(`店名が取れない: ${url}`);
    const facilities = [...new Set(alts.map((a) => ALT_TO_KEY[a]).filter(Boolean))];
    stores.push({ name, url, facilities });
  }
  if (unknown.size) throw new Error(`未知のアイコン: ${[...unknown].join('、')}`);
  return {
    chain: 'bronco-billy',
    name: 'ブロンコビリー',
    sourceUrl: SOURCE,
    method: '公式店舗一覧の全店舗ページを取得し、店舗ページの設備アイコン（alt 表記）を集計',
    note: 'アイコン全9種のうち家族向け5種を集計。「クレジット可」「全席禁煙」「車椅子対応駐車場」「エレベーター」は対応する設備キーが無いため数えていない',
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
