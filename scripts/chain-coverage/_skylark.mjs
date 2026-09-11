/**
 * すかいらーくグループ共通店舗検索（store-info.skylark.co.jp、GOGA Store Locator製）の共通部品。
 * ガスト・バーミヤン・ジョナサン・しゃぶ葉が同じ検索を使う。
 *
 * 店舗データは /api/point/ に backend_filters（カテゴリ=業態コード）を渡すと全件JSONで返る。
 * 各店舗の extra_fields に「座敷フラグ」「おむつ替え台フラグ」等の 0/1 フラグがあり、
 * 画面の「絞り込み検索」ボタン（座敷(大・小) あり 等）はこのフラグで動く。
 * 集計後、同じAPIに設備フラグを付けた絞り込み件数（サーバ側の total）と突き合わせて一致を確認する。
 */
import { fetchJson, tally } from './_lib.mjs';

export const SOURCE = 'https://store-info.skylark.co.jp/';
const API = `${SOURCE}api/point/`;

// 公式「絞り込み検索」の表記 → 設備キー。ここに無い条件（宅配・Wi-Fi・決済・ペット等）は無視する
export const LABELS = {
  stepFree: '車椅子入店可',
  zashiki: '座敷(大・小) あり／小上がり(畳席) あり',
  diaperTable: 'おむつ替え台あり',
  privateRoom: '個室・個室風席あり',
  multiToilet: '多目的トイレあり',
  parking: '駐車場あり',
};
// 設備キー → 店舗データ側のフラグ名（いずれかが "1" なら該当）
const FLAGS = {
  stepFree: ['車椅子対応フラグ'],
  zashiki: ['座敷フラグ', '小上がりフラグ'],
  diaperTable: ['おむつ替え台フラグ'],
  privateRoom: ['個室フラグ'],
  multiToilet: ['多目的トイレフラグ'],
  parking: ['駐車場（有無）フラグ'],
};

const cond = (key, value) => ({ key, is_extra: true, comparison: '=', value });

async function query(conditions) {
  const url = `${API}?backend_filters=${encodeURIComponent(JSON.stringify({ conditions }))}`;
  const d = await fetchJson(url, { headers: { Referer: SOURCE } });
  if (!Array.isArray(d.items) || typeof d.total !== 'number') throw new Error(`想定外の応答: ${url}`);
  if (d.items.length !== d.total) throw new Error(`items(${d.items.length}) と total(${d.total}) が違う（打ち切り？）: ${url}`);
  return d;
}

/**
 * @param {{chain:string, name:string, category:string}} brand  category = 店舗データの「カテゴリ」コード
 */
export async function crawlBrand({ chain, name, category }) {
  const { items } = await query([cond('カテゴリ', category)]);
  const deleted = items.filter((p) => p.extra_fields?.['削除フラグ'] === '1');
  const stores = items
    .filter((p) => p.extra_fields?.['削除フラグ'] !== '1')
    .map((p) => {
      const ef = p.extra_fields || {};
      for (const flags of Object.values(FLAGS)) for (const f of flags) if (!(f in ef)) throw new Error(`フラグ ${f} が無い: ${p.name}`);
      const facilities = Object.entries(FLAGS)
        .filter(([, flags]) => flags.some((f) => ef[f] === '1'))
        .map(([k]) => k);
      return { name: p.name.replace(/\s+/g, ' ').trim(), url: `${SOURCE}map/${p.key}/`, facilities };
    });
  const facilities = tally(stores, LABELS);

  // 公式の絞り込み件数（サーバ側集計）と突き合わせ
  const checks = [];
  for (const [k, flags] of Object.entries(FLAGS)) {
    if (flags.length !== 1) continue; // OR 条件はサーバ側で表現できないので単一フラグだけ照合
    const { total } = await query([cond('カテゴリ', category), cond(flags[0], '1')]);
    if (total !== facilities[k].count) throw new Error(`${name} ${k}: 集計 ${facilities[k].count} と公式絞り込み件数 ${total} が不一致`);
    checks.push(`${LABELS[k]}=${total}`);
  }

  return {
    chain,
    name,
    sourceUrl: SOURCE,
    method: `すかいらーくグループ共通店舗検索の店舗API（/api/point/、カテゴリ=${category}）で全店舗を取得し、各店舗の設備フラグ（絞り込み検索と同じ項目）を集計`,
    total: stores.length,
    note: [
      '「座敷」は絞り込み検索の「座敷(大・小) あり」と「小上がり(畳席) あり」のいずれかに該当する店舗を数えた',
      `単一フラグの項目は公式絞り込み件数と一致を確認済み（${checks.join('、')}）`,
      deleted.length ? `削除フラグ付き${deleted.length}件を除外` : null,
    ].filter(Boolean).join('。'),
    facilities,
    stores,
  };
}
