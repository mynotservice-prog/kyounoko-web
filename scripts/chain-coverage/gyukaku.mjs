/**
 * 牛角: 公式店舗検索（map.reins.co.jp/gyukaku、レインズインターナショナル）。
 * 全店舗一覧ページ（/gyukaku/all）に店舗ごとの data-store JSON が埋め込まれ、絞り込み条件
 * 「サービス」（お子様用備品あり・おむつ交換台あり・授乳スペースあり・座敷あり）が配列で入る。
 * さらに各店舗詳細ページの「備考」欄が全店で同じ定型（駐車場／座席数／個室／バリアフリー／喫煙室／
 * キッズルーム／ドリンクバー の「あり／なし」）なので、そこから駐車場・個室・バリアフリー・キッズルームも読む。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://map.reins.co.jp/gyukaku';
const LIST = `${SOURCE}/all`;
// 一覧の「サービス」絞り込み項目 → 設備キー
const SERVICE_LABELS = {
  kidsChair: 'お子様用備品あり', // 椅子か食器か明示されていない（お子様用の備品）
  diaperTable: 'おむつ交換台あり',
  nursingRoom: '授乳スペースあり',
  zashiki: '座敷あり',
};
// 詳細ページ「備考」欄の定型項目 → 設備キー（「駐車場：あり」等）
const NOTE_LABELS = {
  parking: '駐車場',
  privateRoom: '個室',
  stepFree: 'バリアフリー',
  kidsSpace: 'キッズルーム',
};
const LABELS = { ...SERVICE_LABELS, ...NOTE_LABELS };

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export async function crawl() {
  const html = await fetchText(LIST);
  const byService = Object.fromEntries(Object.entries(SERVICE_LABELS).map(([k, v]) => [v, k]));
  const seen = new Set();
  const stores = [];
  let noTemplate = 0;
  const templateMiss = {};
  for (const m of html.matchAll(/data-store="([^"]*)"[^>]*data-href="(\/gyukaku\/detail\/\d+)"/g)) {
    const url = `https://map.reins.co.jp${m[2]}`;
    if (seen.has(url)) continue;
    seen.add(url);
    const d = JSON.parse(unescape(m[1]));
    const facilities = (d.services || []).map((s) => byService[s]).filter(Boolean);
    // 詳細ページの備考欄
    const detail = await fetchText(url);
    const note = detail.match(/<span class="pre-line-base">([\s\S]*?)<\/span>/)?.[1] || '';
    let hit = 0;
    for (const [k, label] of Object.entries(NOTE_LABELS)) {
      const mm = note.match(new RegExp(`${label}：(あり|なし)`));
      if (!mm) { templateMiss[k] = (templateMiss[k] || 0) + 1; continue; }
      hit++;
      if (mm[1] === 'あり') facilities.push(k);
    }
    if (hit === 0) noTemplate++;
    stores.push({ name: d.store_name.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  const listCount = html.match(/(\d+)\s*件/)?.[1];
  const missNote = Object.entries(templateMiss).map(([k, n]) => `${NOTE_LABELS[k]}${n}`).join('・');
  return {
    chain: 'gyukaku',
    name: '牛角',
    sourceUrl: SOURCE,
    method: '公式店舗検索の全店舗一覧（/gyukaku/all）の店舗ごと data-store JSON にある「サービス」絞り込み項目を集計し、駐車場・個室・バリアフリー・キッズルームは各店舗詳細ページの「備考」欄の定型（○○：あり／なし）から集計',
    note: `一覧の表示件数 ${listCount}。備考欄の定型が無い店舗 ${noTemplate} 件${missNote ? `（項目別欠落: ${missNote}）` : ''}は該当項目「なし」扱い。「お子様用備品あり」は椅子・食器の別が明示されていないため kidsChair に仮置き`,
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
