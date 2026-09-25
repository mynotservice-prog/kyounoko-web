/**
 * アークミール（ステーキのどん・フォルクス）の公式店舗一覧（shop_list.html?pref=0 = 全国）の共通部品。
 * PC 用の表（<!------ PC ------> 以降の table.shoplist_list）の各行に、凡例（shoplist_icon_info*）と同じ
 * 施設アイコン（td.shoplist_icon の img alt: 駐車場／おむつ替え台／スロープ／多目的トイレ／Wifi 等）が並ぶ。
 */
import { fetchText, tally } from './_lib.mjs';

// 公式アイコンの alt → 設備キー（Wifi・モーニング等は対象外）
const ALT_TO_KEY = { '駐車場': 'parking', 'おむつ替え台': 'diaperTable', 'スロープ': 'stepFree', '多目的トイレ': 'multiToilet' };

export async function crawlArcmeal({ chain, name, origin }) {
  const source = `${origin}/shop_list.html?pref=0`;
  const html = await fetchText(source);
  const legend = [...html.matchAll(/<li class="shoplist_icon_info\d">([\s\S]*?)<\/li>/g)].map((m) => m[1].trim());
  for (const l of Object.keys(ALT_TO_KEY)) if (!legend.includes(l)) throw new Error(`凡例に "${l}" が無い（現在: ${legend.join('|')}）`);
  let pc = html.slice(html.indexOf('<!------ PC ------>'));
  pc = pc.slice(0, pc.indexOf('</table>'));
  const rows = [...pc.matchAll(/<tr>\s*<td class="shoplist_name"><a href="(shop_detail\.html\?snum=\d+)">([\s\S]*?)<\/a><\/td>([\s\S]*?)<\/tr>/g)];
  if (!rows.length) throw new Error('店舗行が取れない');
  const labels = Object.fromEntries(Object.entries(ALT_TO_KEY).map(([l, k]) => [k, l]));
  const stores = [];
  const seen = new Set();
  let noIconCell = 0;
  for (const [, href, rawName, rest] of rows) {
    if (seen.has(href)) continue;
    seen.add(href);
    const cell = rest.match(/<td class="shoplist_icon">([\s\S]*?)<\/td>/);
    if (!cell) noIconCell++;
    const alts = cell ? [...cell[1].matchAll(/alt="([^"]*)"/g)].map((m) => m[1].trim()) : [];
    stores.push({ name: rawName.replace(/<[^>]+>/g, '').trim(), url: `${origin}/${href}`, facilities: alts.map((a) => ALT_TO_KEY[a]).filter(Boolean) });
  }
  return {
    chain,
    name,
    sourceUrl: source,
    method: '公式店舗一覧（全国）の表の各店舗行にある施設アイコン（駐車場・おむつ替え台・スロープ・多目的トイレ）を店舗ごとに集計',
    total: stores.length,
    note: [
      `一覧の凡例: ${legend.join('・')}（店内無料Wi-Fi等は対象外）。「スロープ」は入口の段差なし（stepFree）に対応づけた`,
      noIconCell ? `施設欄が無い行 ${noIconCell} 件（該当なしとして集計）` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, labels),
    stores,
  };
}
