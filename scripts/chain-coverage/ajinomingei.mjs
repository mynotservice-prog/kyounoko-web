/**
 * 味の民芸: 公式サイトの店舗検索（ajino-mingei.co.jp/shop/ → 都道府県ページ /area_cat/<pref>/）。
 * 都道府県ページの店舗一覧表（店舗／住所／電話／営業時間／席数／駐車場／サービス）を全県ぶん読み、
 * 「サービス」列のアイコン（tooltip: 駐車場 有／多目的トイレ 有／ベビーベッド 有／スロープ設置 有）と
 * 「席数」列の「座敷席 N席」を店舗ごとに集計する。
 * 運営会社サガミHDの店舗検索（sagami-holdings.co.jp/gps-search/）は駐車場しか持たないので使わない。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://www.ajino-mingei.co.jp/shop/';
// 公式「サービス」列の tooltip 表記 → 設備キー。席数列の「座敷席」は zashiki
const LABELS = {
  stepFree: 'スロープ設置',
  zashiki: '座敷席',
  diaperTable: 'ベビーベッド',
  multiToilet: '多目的トイレ',
  parking: '駐車場',
};

export async function crawl() {
  const top = await fetchText(SOURCE);
  const prefs = [...new Set([...top.matchAll(/href="(https:\/\/www\.ajino-mingei\.co\.jp\/area_cat\/[a-z]+\/)"/g)].map((m) => m[1]))];
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const seen = new Set();
  const vocab = new Set();
  const seatVocab = new Set();
  for (const pref of prefs) {
    const html = await fetchText(pref);
    const rows = html.split('<tbody>').slice(1).join('').split(/<tr>/).slice(1);
    for (const r of rows) {
      const nameM = r.match(/<p class="storelst_storename">([\s\S]*?)<\/p>/);
      if (!nameM) continue;
      const name = text(nameM[1].replace(/<!--[\s\S]*?-->/g, '')).replace(/\s+/g, ' ').trim();
      if (seen.has(name)) continue;
      seen.add(name);
      const url = (nameM[1].match(/href="([^"]+)"/) || [])[1];
      const cells = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
      const seats = text(cells[4] || '');
      seatVocab.add(seats.replace(/\d+/g, 'N'));
      const facilities = new Set();
      const zm = seats.match(/座敷席\s*(\d+)\s*席/);
      if (zm && Number(zm[1]) > 0) facilities.add('zashiki');
      for (const m of (cells[6] || '').matchAll(/<span class="tooltiptext[^"]*">([\s\S]*?)<\/span>/g)) {
        const t = text(m[1]);
        vocab.add(t);
        const mm = t.match(/^(.+?)\s*(有|無|なし|あり)\s*$/);
        if (!mm) continue;
        const key = byLabel[mm[1].trim()];
        if (key && /有|あり/.test(mm[2])) facilities.add(key);
      }
      stores.push({ name, url, facilities: [...facilities] });
    }
  }
  console.error('サービス列の語彙:', [...vocab].join(' / '));
  console.error('席数列の型:', [...seatVocab].join(' / '));
  return {
    chain: 'ajinomingei',
    name: '味の民芸',
    sourceUrl: SOURCE,
    method: '公式店舗検索の都道府県別店舗一覧表（10都県）を全件取得し、「サービス」列のアイコン（有/無）と「席数」列の座敷席数を集計',
    total: stores.length,
    note: '座敷は「席数」列に「座敷席 N席」（N>0）とある店。「ベビーベッド」は公式表記のままで、設置場所（トイレ内か）は明記されていない',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
