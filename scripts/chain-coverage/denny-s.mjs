/**
 * デニーズ: 公式店舗検索（shop.dennys.jp、GOGA Store Locator製・すかいらーくと同じ仕組み）。
 * /api/point/ が全店舗を1回で返し、各店舗の extra_fields に絞り込み検索と同じ項目
 * （「ベビーシート」「だれでもトイレ」等）が値 "1" で入る（無い店舗はキー自体が無い）。
 * 集計後、同じAPIに条件を付けた絞り込み件数（サーバ側 total）と突き合わせる。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.dennys.jp/';
const API = `${SOURCE}api/point/`;
// 絞り込み検索の表記 → 設備キー。ここに無い条件（Wi-Fi・コンセント・禁煙・ドリンクバー・出前・EV充電）は無視する
const LABELS = {
  stepFree: '入口段差なしまたはエレベーターあり',
  diaperTable: 'オムツ替えシート',
  privateRoom: 'パーティールームまたは個室あり',
  multiToilet: 'だれでもトイレ',
  parking: '駐車場あり',
};
// 設備キー → 店舗データ側のキー（絞り込み検索の conditions.key）
const FIELDS = {
  stepFree: '入口段差なしまたはエレベーターあり',
  diaperTable: 'ベビーシート',
  privateRoom: 'パーティールームまたは個室あり',
  multiToilet: 'だれでもトイレ',
  parking: '駐車場あり',
};

async function query(conditions) {
  const url = `${API}?backend_filters=${encodeURIComponent(JSON.stringify({ conditions }))}`;
  const d = await fetchJson(url, { headers: { Referer: SOURCE } });
  if (!Array.isArray(d.items) || typeof d.total !== 'number') throw new Error(`想定外の応答: ${url}`);
  if (d.items.length !== d.total) throw new Error(`items(${d.items.length}) と total(${d.total}) が違う: ${url}`);
  return d;
}

export async function crawl() {
  const { items } = await query([]);
  const inactive = items.filter((p) => p.is_active === false);
  const stores = items
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      name: p.name.replace(/[\s　]+/g, ' ').trim(),
      url: `${SOURCE}map/${p.key}/`,
      facilities: Object.entries(FIELDS).filter(([, f]) => p.extra_fields?.[f] === '1').map(([k]) => k),
    }));
  const facilities = tally(stores, LABELS);

  const checks = [];
  for (const [k, f] of Object.entries(FIELDS)) {
    const { total } = await query([{ key: f, is_extra: true, comparison: '=', value: '1' }]);
    if (total !== facilities[k].count) throw new Error(`${k}: 集計 ${facilities[k].count} と公式絞り込み件数 ${total} が不一致`);
    checks.push(`${LABELS[k]}=${total}`);
  }

  return {
    chain: 'denny-s',
    name: 'デニーズ',
    sourceUrl: SOURCE,
    method: '公式店舗検索の店舗API（/api/point/）で全店舗を取得し、各店舗の設備項目（絞り込み検索と同じ項目）を集計',
    total: stores.length,
    note: [
      `各項目は公式絞り込み件数と一致を確認済み（${checks.join('、')}）`,
      '「入口段差なしまたはエレベーターあり」はエレベーターのみの店舗も含む表記。「パーティールームまたは個室あり」も同様に複合表記',
      inactive.length ? `非公開${inactive.length}件を除外` : null,
    ].filter(Boolean).join('。'),
    facilities,
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
