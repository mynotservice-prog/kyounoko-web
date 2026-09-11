/**
 * はま寿司: ゼンショー系公式店舗検索 maps.hama-sushi.co.jp。読み方は _zensho-search.mjs 参照。
 * 検索画面で有効な「サービス・設備」チェックのうち家族向けは「駐車場」「ベビーシート」「多目的トイレ」
 * （「お子様メニュー」「スロープ／エレベーター」のチェックは HTML 上でコメントアウト＝未公開扱い。
 *   「車いす席あり」は席の属性で入口の段差の有無ではないため stepFree には対応させていない）。
 */
import { tally, runAdapter } from './_lib.mjs';
import { crawlZenshoSearch } from './_zensho-search.mjs';

const BASE = 'https://maps.hama-sushi.co.jp';
const SOURCE = `${BASE}/jp/index.html`;
// 設備キー → 公式チェックボックスの value と表示ラベル
const FILTERS = {
  parking: { value: 'parking_flag', label: '駐車場' },
  diaperTable: { value: 'baby_seat', label: 'ベビーシート' },
  multiToilet: { value: 'multipurpose_restroom', label: '多目的トイレ' },
};

export async function crawl() {
  const { stores, brands } = await crawlZenshoSearch({ base: BASE, filters: FILTERS });
  const labels = Object.fromEntries(Object.entries(FILTERS).map(([k, f]) => [k, f.label]));
  return {
    chain: 'hama-sushi',
    name: 'はま寿司',
    sourceUrl: SOURCE,
    method: '公式店舗検索（maps.hama-sushi.co.jp）の検索APIで全店舗を列挙し、「サービス・設備」チェック（駐車場・ベビーシート・多目的トイレ）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    total: stores.length,
    note: `ブランド内訳: ${Object.entries(brands).map(([b, n]) => `${b} ${n}`).join('、')}。「車いす席あり」チェックは席の属性のため設備キーに対応させていない`,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
