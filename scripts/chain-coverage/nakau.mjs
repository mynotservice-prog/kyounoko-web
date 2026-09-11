/**
 * なか卯: ゼンショー系公式店舗検索 maps.nakau.co.jp。読み方は _zensho-search.mjs 参照。
 * 検索画面で有効な「サービス・設備」チェックのうち家族向けは「お子様メニュー」「駐車場」のみ
 * （ベビーシート・多目的トイレ等のチェックは HTML 上でコメントアウト＝未公開扱い）。
 */
import { tally, runAdapter } from './_lib.mjs';
import { crawlZenshoSearch } from './_zensho-search.mjs';

const BASE = 'https://maps.nakau.co.jp';
const SOURCE = `${BASE}/jp/index.html`;
// 設備キー → 公式チェックボックスの value と表示ラベル
const FILTERS = {
  kidsMenu: { value: 'childrens_menu', label: 'お子様メニュー' },
  parking: { value: 'parking_flag', label: '駐車場' },
};

export async function crawl() {
  const { stores, brands } = await crawlZenshoSearch({ base: BASE, filters: FILTERS });
  const labels = Object.fromEntries(Object.entries(FILTERS).map(([k, f]) => [k, f.label]));
  return {
    chain: 'nakau',
    name: 'なか卯',
    sourceUrl: SOURCE,
    method: '公式店舗検索（maps.nakau.co.jp）の検索APIで全店舗を列挙し、「サービス・設備」チェック（お子様メニュー・駐車場）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    total: stores.length,
    note: `ブランド内訳: ${Object.entries(brands).map(([b, n]) => `${b} ${n}`).join('、')}`,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
