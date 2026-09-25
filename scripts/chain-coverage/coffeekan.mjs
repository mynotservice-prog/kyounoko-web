/**
 * 珈琲館: C-United の公式店舗検索（c-united.co.jp/search/khk/）。
 * 画面は /store/request_search/?bounds=<南,北,西,東> で範囲内の全店舗 JSON を取り、ブラウザ側で絞り込む。
 * 日本全域の範囲で取得し、brand=4（珈琲館）の店舗だけ数える（珈琲館 蔵・CAFE DI ESPRESSO 珈琲館・ベローチェ等は別ブランド）。
 * 絞り込み「特徴」のうち設備に当たるのは「駐車場」だけ。店舗データの parking 欄は台数（文字列）で、
 * 画面の絞り込みは値があれば該当扱い（"0" も該当になる）。ここでは 1 以上の台数が入っている店舗を数え、"0" の店舗数は note に書く。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://c-united.co.jp/search/khk/';
const API = 'https://c-united.co.jp/store/request_search/?bounds=20,50,120,155';
const BRAND = 4;
const LABELS = { parking: '駐車場' };

export async function crawl() {
  const all = await fetchJson(API, { headers: { Referer: SOURCE } });
  if (!Array.isArray(all) || !all.length) throw new Error('店舗データが空');
  const rows = all.filter((s) => s.brand === BRAND);
  const today = new Date().toISOString().slice(0, 10);
  const ymd = (y, m, d) => (y ? `${y}-${String(m || 1).padStart(2, '0')}-${String(d || 1).padStart(2, '0')}` : null);
  const closed = [];
  const notYet = [];
  let zero = 0;
  const stores = [];
  for (const s of rows) {
    const end = ymd(s.open_end_year, s.open_end_month, s.open_end_day);
    const start = ymd(s.open_start_year, s.open_start_month, s.open_start_day);
    if (end && end < today) { closed.push(s.name); continue; }
    if (start && start > today) { notYet.push(s.name); continue; }
    const p = s.parking == null ? '' : String(s.parking).trim();
    if (p === '0') zero++;
    const facilities = /^\d+$/.test(p) && Number(p) > 0 ? ['parking'] : [];
    if (p && !/^\d+$/.test(p)) throw new Error(`parking 欄に想定外の値 "${p}"（${s.name}）`);
    stores.push({ name: `珈琲館 ${s.name}`.replace(/\s+/g, ' ').trim(), url: `https://c-united.co.jp/store/detail/${s.code}/`, facilities });
  }
  return {
    chain: 'coffeekan',
    name: '珈琲館',
    sourceUrl: SOURCE,
    method: '公式店舗検索が読む店舗データ（/store/request_search/、日本全域）から珈琲館ブランドの店舗を取り出し、駐車場欄（台数）に1台以上の値がある店舗を集計',
    total: stores.length,
    note: [
      '珈琲館 蔵・CAFE DI ESPRESSO 珈琲館等の別ブランドは除外',
      zero ? `駐車場欄が「0」の店舗 ${zero} 件は数えない（公式画面の絞り込みでは値があれば該当扱いのため、画面上の件数はこの分多くなる）` : null,
      closed.length ? `閉店日を過ぎた ${closed.length} 件を除外` : null,
      notYet.length ? `開業前 ${notYet.length} 件を除外` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
