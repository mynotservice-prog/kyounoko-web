/**
 * すし銚子丸: 公式店舗検索（stores.choushimaru.co.jp、Yext Pages製）。
 * sitemap1.xml に載る店舗ページ（数字スラッグ）を全件取り、ページ埋め込みの Yext エンティティ
 * データ c_locationFeatures（「設備・サービス」の一覧）を店舗ごとに読む。
 * c_locationFeatures は自由記述の配列なので、語彙として安定して使われている
 * 「スロープ」「多目的トイレ」「駐車場…」だけを設備キーにする（駐車場は台数付き表記が多く、
 * 「駐車場:無し」は数えない）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://stores.choushimaru.co.jp/';
const SITEMAP = 'https://stores.choushimaru.co.jp/sitemap1.xml';
const LABELS = {
  stepFree: 'スロープ',
  multiToilet: '多目的トイレ',
  parking: '駐車場',
};

function entityData(html) {
  const m = html.match(/decodeURIComponent\(["']([^"']+)["']/);
  if (!m) throw new Error('Yext エンティティデータが見つからない');
  return JSON.parse(decodeURIComponent(m[1])).document;
}

function classify(features) {
  const keys = new Set();
  for (const f of features) {
    const t = f.replace(/\s+/g, '');
    if (t === 'スロープ') keys.add('stepFree');
    if (t === '多目的トイレ') keys.add('multiToilet');
    if (/駐車場/.test(t) && !/無し|なし/.test(t)) keys.add('parking');
  }
  return [...keys];
}

export async function crawl() {
  const xml = await fetchText(SITEMAP);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => /\/\d+$/.test(u));
  const stores = [];
  const skipped = { otherBrand: [], takeout: [], closed: [] };
  for (const url of urls) {
    const doc = entityData(await fetchText(url));
    const brand = doc.c_brandName || '';
    const features = doc.c_locationFeatures || [];
    if (!/^すし銚子丸/.test(brand)) { skipped.otherBrand.push(doc.name); continue; }
    if (/テイクアウト/.test(brand)) { skipped.takeout.push(doc.name); continue; }
    if (features.some((f) => /閉店/.test(f))) { skipped.closed.push(doc.name); continue; }
    stores.push({ name: doc.name.replace(/\s+/g, ' ').trim(), url, facilities: classify(features) });
  }
  return {
    chain: 'choushimaru',
    name: 'すし銚子丸',
    sourceUrl: SOURCE,
    method: '公式店舗検索（Yext）のサイトマップから店舗ページを全件取得し、各ページ埋め込みデータの設備・サービス欄（c_locationFeatures）を集計',
    total: stores.length,
    note: `ブランド「すし銚子丸」「すし銚子丸 雅」を対象。テイクアウト専門店${skipped.takeout.length}件・閉店済み${skipped.closed.length}件・別業態（鮨YASUKE等）${skipped.otherBrand.length}件は除外。設備欄は自由記述のため、記載が無い＝設備が無い とは限らない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
