/**
 * 物語コーポレーション共通の店舗検索（shop.monogatari.co.jp/api/v1、焼肉きんぐ・ゆず庵などが共用）。
 * 各ブランド公式サイトの店舗検索ページは mcShop.umd.cjs が同APIの /shops/?brandId[]=<brand_key> を呼んで一覧を描画し、
 * 店舗詳細ページ（/shop/<shop_code>/）には「店舗設備」（入り口スロープ/車椅子対応のトイレ/おむつ替えシート/店内禁煙…）が
 * サーバー側で描画される。APIの shop_equipments がその元データなので、ここではAPIを1回呼んで店舗ごとに集計する。
 */
import { fetchJson, tally } from './_lib.mjs';

const API = 'https://shop.monogatari.co.jp/api/v1';

/**
 * @param {object} o
 * @param {string} o.chain      設備DBのキー
 * @param {string} o.name       ブランド名
 * @param {string} o.brandKey   API の brand_key（公式ページの MC.ShopModel に書かれている値）
 * @param {string} o.site       公式サイトのオリジン（末尾スラッシュ付き）
 * @param {Record<string,string>} o.labels  設備キー → 公式「店舗設備」の表記
 */
export async function crawlMonogatari({ chain, name, brandKey, site, labels }) {
  const source = `${site}shop/`;
  const data = await fetchJson(`${API}/shops/?brandId[]=${brandKey}&perPage=1000`, {
    headers: { Origin: site.replace(/\/$/, ''), Referer: source, Accept: 'application/json' },
  });
  if (!Array.isArray(data.data) || data.total !== data.data.length) {
    throw new Error(`件数不一致 total=${data.total} got=${data.data?.length}`);
  }
  const byLabel = Object.fromEntries(Object.entries(labels).map(([k, v]) => [v, k]));
  const seen = {};
  const hidden = [];
  const stores = [];
  for (const s of data.data) {
    if (s.not_public_flag) { hidden.push(s.name); continue; }
    const eq = (s.shop_equipments || []).map((e) => e.name);
    for (const n of eq) seen[n] = (seen[n] || 0) + 1;
    const facilities = eq.map((n) => byLabel[n]).filter(Boolean);
    stores.push({ name: s.name.replace(/\s+/g, ' ').trim(), url: `${source}${s.shop_code}/`, facilities });
  }
  const unmapped = Object.entries(seen).filter(([n]) => !byLabel[n]).map(([n, c]) => `${n}${c}店`).join('・');
  return {
    chain,
    name,
    sourceUrl: source,
    method: '公式店舗検索が呼ぶ物語コーポレーション共通の店舗API（/shops/?brandId[]=…）の全件から、店舗詳細ページ「店舗設備」の元データ shop_equipments を店舗ごとに集計',
    total: stores.length,
    note: `非公開フラグ${hidden.length}件（${hidden.join('、')}）は除外。店舗設備のうち設備キーに対応づけていない表記: ${unmapped || 'なし'}。「駐車場」欄は自由記述（台数・階数）のため集計していない`,
    facilities: tally(stores, labels),
    stores,
  };
}
