/**
 * 魁力屋: 公式店舗検索（shop.kairikiya.co.jp、Nuxt製）。
 * トップページに埋め込まれた __NUXT_DATA__（devalue 形式）の build_data/stores_domestic に国内全店舗と
 * 店舗ごとの contentAttributes（店舗ページの項目と同じ）が入っている。
 *  - 「店舗情報」（絞り込み可）: 駐車場あり・テーブル席あり・テイクアウト → 駐車場ありだけ数える
 *    （「テーブル席あり」は座敷・ボックス席のどちらにも当たらないので数えない）
 *  - 「BOX席」（店舗ページの項目。例「BOX席（4人掛）：5卓」）→ 卓数が1以上書かれている店舗を boxSeat に数える
 * ブランド「ラーメン魁力屋」だけ数え、からたま屋・とりサブロー等の他業態と開業前（open=before_open）は除外する。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.kairikiya.co.jp/';
const BRAND = 'ラーメン魁力屋';
const LABELS = {
  parking: '駐車場あり',
  boxSeat: 'BOX席',
};

/** Nuxt 3 の __NUXT_DATA__（devalue）を素のオブジェクトに戻す */
function devalue(arr) {
  const memo = new Map();
  const WRAP = new Set(['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'NuxtError']);
  const rv = (i) => {
    if (memo.has(i)) return memo.get(i);
    const x = arr[i];
    let r;
    if (Array.isArray(x)) {
      if (typeof x[0] === 'string' && WRAP.has(x[0])) r = typeof x[1] === 'number' ? rv(x[1]) : null;
      else { r = []; memo.set(i, r); for (const j of x) r.push(typeof j === 'number' ? rv(j) : j); return r; }
    } else if (x && typeof x === 'object') {
      r = {}; memo.set(i, r);
      for (const [k, v] of Object.entries(x)) r[k] = typeof v === 'number' ? rv(v) : v;
      return r;
    } else r = x;
    memo.set(i, r);
    return r;
  };
  return rv(0);
}

export async function crawl() {
  const html = await fetchText(SOURCE);
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NUXT_DATA__ が無い');
  const root = devalue(JSON.parse(m[1]));
  const all = root?.data?.['build_data/stores_domestic'];
  if (!Array.isArray(all) || !all.length) throw new Error('stores_domestic が無い');
  const otherBrand = {};
  const notOpen = [];
  const stores = [];
  for (const s of all) {
    const brand = s.brand?.name;
    if (brand !== BRAND) { otherBrand[brand] = (otherBrand[brand] || 0) + 1; continue; }
    if (s.open !== 'open') { notOpen.push(`${s.name}(${s.open})`); continue; }
    const attrs = s.contentAttributes || [];
    const info = attrs.find((a) => a.label === '店舗情報');
    const infoLabels = (info?.list || []).map((l) => l.label);
    const box = attrs.find((a) => a.label === 'BOX席')?.setting?.content?.text || '';
    const facilities = [];
    if (infoLabels.includes('駐車場あり')) facilities.push('parking');
    if ([...box.matchAll(/(\d+)\s*卓/g)].some((x) => Number(x[1]) > 0)) facilities.push('boxSeat');
    stores.push({ name: s.name.replace(/\s+/g, ' ').trim(), url: `${SOURCE}stores/${s.id}`, facilities });
  }
  return {
    chain: 'kairikiya',
    name: '魁力屋',
    sourceUrl: SOURCE,
    method: '公式店舗検索（shop.kairikiya.co.jp）のページに埋め込まれた国内店舗データ（__NUXT_DATA__ の stores_domestic）から、ブランド「ラーメン魁力屋」の営業中店舗の「店舗情報」（駐車場あり）と「BOX席」欄を店舗ごとに集計',
    total: stores.length,
    note: [
      `他ブランド除外: ${Object.entries(otherBrand).map(([k, v]) => `${k}${v}`).join('・') || 'なし'}`,
      notOpen.length ? `開業前等で除外: ${notOpen.join('、')}` : null,
      '「BOX席」は店舗ページの席数欄（例「BOX席（4人掛）：5卓」）に1卓以上の記載がある店舗を数えた（欄が無い店舗はフードコート店等）',
      '「テーブル席あり」は対応する設備項目が無いため数えない',
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
