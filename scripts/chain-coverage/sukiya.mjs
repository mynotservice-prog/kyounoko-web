/**
 * すき家: ゼンショー系公式店舗検索 maps.sukiya.jp。読み方は _zensho-search.mjs 参照。
 * 全店舗数（約2,000）が検索APIの1リクエスト上限（1,750件）を超えるため、検索フォームの「住所で探す」
 * （address= の部分一致）に都道府県名を入れて 47 分割で列挙する（店名の部分一致で分割すると 2 店舗が拾えず不足した）。
 * 分割の合計が条件なし検索のヘッダ件数（検索結果：N件）と一致することを確認する。
 * 検索画面で有効な「サービス・設備」チェックのうち家族向けは「お子様メニュー」「駐車場」のみ
 * （ベビーシート・多目的トイレ等のチェックは HTML 上でコメントアウト＝未公開扱い）。
 */
import { tally, runAdapter } from './_lib.mjs';
import { search } from './_zensho-search.mjs';

const BASE = 'https://maps.sukiya.jp';
const SOURCE = `${BASE}/jp/index.html`;
const LIMIT = 1750; // 検索APIの1リクエスト上限（_zensho-search.mjs の MORELIST + 50）
// 設備キー → 公式チェックボックスの value と表示ラベル
const FILTERS = {
  kidsMenu: { value: 'childrens_menu', label: 'お子様メニュー' },
  parking: { value: 'parking_flag', label: '駐車場' },
};
const PREFS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

/** 条件 params に合う店舗を全件集める。上限超えは住所の都道府県名で 47 分割 */
async function searchAll(params = {}) {
  const first = await search(BASE, params);
  if (first.stores.length >= first.count) return { count: first.count, stores: first.stores };
  const byLink = new Map();
  for (const pref of PREFS) {
    const r = await search(BASE, { ...params, address: pref });
    if (r.count > LIMIT) throw new Error(`${pref} が上限 ${LIMIT} 件を超える（${r.count} 件）`);
    // address は部分一致なので「東京都府中市」が「京都府」にも当たる等の重複が出る。link で重複排除する
    for (const s of r.stores) byLink.set(s.link, s);
  }
  console.error(`  都道府県分割: ${byLink.size}/${first.count} 件（${JSON.stringify(params)}）`);
  if (byLink.size !== first.count) {
    throw new Error(`件数不一致: ヘッダ ${first.count} 件に対し ${byLink.size} 件しか集められなかった（${JSON.stringify(params)}）`);
  }
  return { count: first.count, stores: [...byLink.values()] };
}

export async function crawl() {
  const { stores: all } = await searchAll();
  const has = {};
  for (const [key, f] of Object.entries(FILTERS)) {
    const { stores: hit } = await searchAll({ facility: [f.value] });
    has[key] = new Set(hit.map((s) => s.link));
    for (const l of has[key]) if (!all.some((s) => s.link === l)) throw new Error(`${key} の絞り込み結果に全件に無い店舗がある: ${l}`);
  }
  const stores = all.map((s) => ({
    name: `${s.brand} ${s.name}`.trim(),
    url: s.url,
    facilities: Object.keys(FILTERS).filter((k) => has[k].has(s.link)),
  }));
  const brands = {};
  for (const s of all) brands[s.brand] = (brands[s.brand] || 0) + 1;
  const labels = Object.fromEntries(Object.entries(FILTERS).map(([k, f]) => [k, f.label]));
  return {
    chain: 'sukiya',
    name: 'すき家',
    sourceUrl: SOURCE,
    method: '公式店舗検索（maps.sukiya.jp）の検索APIで全店舗を列挙（1リクエスト上限超えのため「住所で探す」に都道府県名を入れて47分割し、条件なし検索の件数と一致を確認）し、「サービス・設備」チェック（お子様メニュー・駐車場）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    total: stores.length,
    note: `ブランド内訳: ${Object.entries(brands).map(([b, n]) => `${b} ${n}`).join('、')}`,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
