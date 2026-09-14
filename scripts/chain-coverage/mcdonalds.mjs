/**
 * マクドナルド: 公式店舗検索（map.mcdonalds.co.jp）の地図用 JSON API（/api/poi?bounds=…）。
 * 日本全域の bounds を渡すと全店舗が 1 リクエストで返り、各店舗に「提供サービス」19 項目の
 * on/off 配列（condition_values）が付く。項目名は店舗検索トップの絞り込みリスト（data-index 1..19）の順。
 * 家族向け属性は「プレイプレイス（旧プレイランド）」「駐車場あり」の 2 つだけ（お子様椅子・おむつ交換台等は属性なし）。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://map.mcdonalds.co.jp/';
const API = 'https://map.mcdonalds.co.jp/api/poi?bounds=20,122,46,154&uuid=kyounoko-coverage';
// 公式「提供サービス」の項目（data-index 1 始まり）→ 設備キー。ここに無い項目（WiFi・ドライブスルー等）は無視する
const CONDITIONS = [
  'FREE WiFi', '24時間営業', 'ドライブスルー', '客席100席以上', '朝マック', 'McCafé by Barista',
  'バースディパーティ', 'プレイプレイス（旧プレイランド）', 'マックアドベンチャー', '駐車場あり',
  'モバイルオーダー', 'おもてなしリーダー', 'テーブルサービス', 'マックデリバリー',
  'ドライブスルーモバイルオーダー', 'McCafé', 'ケーキ販売店舗', '特殊立地店舗', '特定店舗',
];
const LABELS = {
  kidsSpace: 'プレイプレイス（旧プレイランド）',
  parking: '駐車場あり',
};

export async function crawl() {
  const pois = await fetchJson(API, { headers: { Referer: SOURCE } });
  const idx = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [k, CONDITIONS.indexOf(v)]));
  for (const [k, i] of Object.entries(idx)) if (i < 0) throw new Error(`条件名が見つからない: ${k}`);
  const stores = pois.map((p) => {
    if (!Array.isArray(p.condition_values) || p.condition_values.length !== CONDITIONS.length) {
      throw new Error(`condition_values の長さが想定外: ${p.name}`);
    }
    return {
      name: p.name.trim(),
      url: `${SOURCE}map/${p.key}`,
      facilities: Object.entries(idx).filter(([, i]) => p.condition_values[i] === 1).map(([k]) => k),
    };
  });
  return {
    chain: 'mcdonalds',
    name: 'マクドナルド',
    sourceUrl: SOURCE,
    method: '公式店舗検索の地図用 JSON API（/api/poi、日本全域 bounds）で全店舗を列挙し、各店舗の「提供サービス」on/off 配列を集計',
    note: '「提供サービス」19 項目のうち家族向け属性はプレイプレイスと駐車場のみ。お子様椅子・おむつ交換台等は属性として公開されていない',
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
