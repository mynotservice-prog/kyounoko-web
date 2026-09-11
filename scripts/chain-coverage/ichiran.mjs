/**
 * 一蘭: 公式「店舗のご案内」（ichiran.com/shop/）から国内店舗ページ（/shop/<地域>/<店>/）を列挙し、
 * 各店舗ページの「店舗情報」表にある「席数」行（味集中カウンター／テーブル席／個室 の有無・席数）と
 * 「駐車場」行（台数 or なし）を店舗ごとに読む。
 * 「席数」行の下にある注記「※お子様もお食事できる環境です（食器など）」は店舗ごとの div だが
 * 全店同文かどうかは crawl 時に語彙を出力して確認する（設備キーにはしない）。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://ichiran.com/shop/';
// 公式「店舗情報」表の行 → 設備キー。個室は「席数」行の「・個室：」、駐車場は「駐車場」行
const LABELS = {
  privateRoom: '個室',
  parking: '駐車場',
};

function row(html, th) {
  const m = html.match(new RegExp(`<th>${th}</th>\\s*<td>([\\s\\S]*?)</td>`));
  return m ? m[1] : null;
}

export async function crawl() {
  const index = await fetchText(SOURCE);
  const urls = [...new Set([...index.matchAll(/href="(https:\/\/ichiran\.com\/shop\/[a-z]+\/[a-z0-9_-]+\/)"/g)].map((m) => m[1]))];
  const stores = [];
  const noTable = [];
  const seatVocab = new Set();
  const parkingVocab = new Set();
  const attention = new Map();
  for (const url of urls) {
    const html = await fetchText(url);
    const seats = row(html, '席数');
    const parking = row(html, '駐車場');
    if (/\/(testshop|oversea)\//.test(url)) continue; // テスト用ページ・海外店の案内ページ
    const title = text((html.match(/<title>([^<]*)/) || [])[1] || '');
    const name = ('一蘭 ' + title.split(/[|｜]/)[0].trim()).replace(/\s+/g, ' ').trim();
    if (seats === null && parking === null) { noTable.push(url); continue; }
    const facilities = [];
    if (seats !== null) {
      const lines = seats.replace(/<div[\s\S]*?<\/div>/g, '').split(/<br\s*\/?>/).map((s) => text(s)).filter(Boolean);
      for (const l of lines) seatVocab.add(l.replace(/\d+/g, 'N'));
      const priv = lines.find((l) => /^・?個室/.test(l));
      if (priv && !/[:：]\s*(なし|無し|無)\s*$/.test(priv)) facilities.push('privateRoom');
      const att = text((seats.match(/<div class="shop-openattention">([\s\S]*?)<\/div>/) || [])[1] || '');
      attention.set(att, (attention.get(att) || 0) + 1);
    }
    if (parking !== null) {
      const p = text(parking.replace(/<span[\s\S]*?<\/span>/g, '').replace(/<!--[\s\S]*?-->/g, ''));
      parkingVocab.add(p.replace(/\d+/g, 'N'));
      // 「N台」「有」「提携駐車場」等を有り、「なし」「無し」「近隣のコインパーキングをご利用ください」等を無しとする
      const has = /\d+\s*台|有り?|あり|提携|専用/.test(p) && !/^(なし|無し|無|ありません)/.test(p);
      if (has) facilities.push('parking');
    }
    stores.push({ name, url, facilities });
  }
  console.error('席数行の語彙:', [...seatVocab].join(' / '));
  console.error('席数注記:', [...attention.entries()].map(([k, v]) => `「${k}」×${v}`).join(' / '));
  console.error('駐車場行の語彙:', [...parkingVocab].join(' / '));
  console.error('表なし:', noTable.join(' '));
  return {
    chain: 'ichiran',
    name: '一蘭',
    sourceUrl: SOURCE,
    method: '公式「店舗のご案内」から国内店舗ページを全件取得し、各ページの「店舗情報」表の「席数」行（個室の有無）と「駐車場」行（台数/なし）を集計',
    total: stores.length,
    note: [
      '国内店舗のみ（海外店は別サイト）',
      noTable.length ? `店舗情報表が無いページ${noTable.length}件は除外` : '',
      '「個室」は席数行に「個室：N席」等の記載がある店、「駐車場」は駐車場行が「なし」以外の店（台数記載・提携駐車場を含む）',
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
