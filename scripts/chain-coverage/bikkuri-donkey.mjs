/**
 * びっくりドンキー: 公式店舗検索（www.bikkuri-donkey.com/shop/?from=shop&pref=<都道府県>）。
 * 都道府県ページは実際には全国の全店舗カード（div.shop_wrap）を含み、クライアント側で data-pref で絞る。
 * 各カードの data-search に「絞り込み条件」チェックボックス（name=eqNN / id）のトークンが
 * "__baby_sheet__parking__..." の形で入る（カード内のアイコン表示は一部の条件のみなので data-search を使う）。
 * 家族向け属性: 多目的トイレ / ベビーシート / 車イス入店 / 駐車場 / 小上がり席。
 * 「車イス駐車場」は設備キーに対応が無いので数えない。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.bikkuri-donkey.com/shop_search/';
const LIST = 'https://www.bikkuri-donkey.com/shop/?from=shop&pref=tokyo';
// 絞り込み条件チェックボックスの label 表記（そのまま） → 設備キー。他の条件（Wi-Fi・決済・宅配・喫煙ルーム等）は無視
const LABELS = {
  multiToilet: '多目的トイレ',
  diaperTable: 'ベビーシート',
  stepFree: '車イス入店',
  parking: '駐車場',
  zashiki: '小上がり席',
};
const TOKEN = {
  multiToilet: 'multi_purpose_toilet',
  diaperTable: 'baby_sheet',
  stepFree: 'barrier_free',
  parking: 'parking',
  zashiki: 'raised_floor_seat',
};

export async function crawl() {
  const html = await fetchText(LIST);
  // 絞り込みチェックボックスが今も同じ id で存在することを確認（表記が変わったら止める）
  for (const [k, id] of Object.entries(TOKEN)) {
    const m = html.match(new RegExp(`<input class="btn-check"[^>]*id="${id}">\\s*<label for="${id}">([\\s\\S]*?)</label>`));
    if (!m) throw new Error(`絞り込みチェックボックス ${id} が見つからない`);
    const label = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (label !== LABELS[k]) throw new Error(`${id} の表記が "${label}"（想定 "${LABELS[k]}"）`);
  }
  const stores = [];
  const re = /<div class="col-lg-4 col-md-6 col-12 shop_wrap" name="(shop_\d+)"[^>]*data-search="([^"]*)">[\s\S]*?<h4>([^<]+)<\/h4>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, id, search, name] = m;
    const tokens = new Set(search.split('__').filter(Boolean));
    const facilities = Object.entries(TOKEN).filter(([, t]) => tokens.has(t)).map(([k]) => k);
    stores.push({ name: name.replace(/\s+/g, ' ').trim(), url: `https://www.bikkuri-donkey.com/shop/${id}/`, facilities });
  }
  const cardCount = (html.match(/class="col-lg-4 col-md-6 col-12 shop_wrap"/g) || []).length;
  if (stores.length !== cardCount) throw new Error(`カード ${cardCount} 件のうち ${stores.length} 件しか解析できない`);
  return {
    chain: 'bikkuri-donkey',
    name: 'びっくりドンキー',
    sourceUrl: SOURCE,
    method: '公式店舗検索の都道府県ページ（全国の全店舗カードを含む）から各店舗の data-search（絞り込み条件チェックボックスと同じトークン）を集計',
    note: '絞り込み条件のうち家族向けは上記5項目。「車イス駐車場」は設備キーが無いため数えていない。「小上がり席」を座敷として扱った',
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
