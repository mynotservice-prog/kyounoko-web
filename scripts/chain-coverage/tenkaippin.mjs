/**
 * 天下一品: 公式店舗検索（tenkaippin.co.jp/shop/）の都道府県検索（POST /search/）で全店舗を列挙し、
 * 各店舗ページの店舗詳細表の「駐車場」行（例「22台」「なし」）を店舗ごとに読む。
 * 検索フォームの「設備・取扱いサービス」は 駐車場あり／デリバリー の2択のみで、公式の設備属性は駐車場だけ。
 */
import { fetchText, text, tally, runAdapter, UA, sleep } from './_lib.mjs';

const SOURCE = 'https://www.tenkaippin.co.jp/shop/';
const SEARCH = 'https://www.tenkaippin.co.jp/search/';
const LABELS = {
  parking: '駐車場',
};

// _lib.fetchText は GET 専用なので、同じ間隔・同じ UA で POST する
let lastAt = 0;
async function postText(url, body, { delayMs = 400, retries = 2 } = {}) {
  const wait = lastAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { method: 'POST', body, headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', Referer: SOURCE }, signal: AbortSignal.timeout(25_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return await r.text();
    } catch (e) {
      if (i >= retries) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

export async function crawl() {
  const top = await fetchText(SOURCE);
  const sel = top.slice(top.indexOf('name="pref_select"'));
  const prefs = [...sel.slice(0, sel.indexOf('</select>')).matchAll(/<option\s+value="(\d+)">([^<]+)</g)].map((m) => [m[1], m[2]]);
  if (prefs.length < 40) throw new Error(`都道府県の選択肢が少ない: ${prefs.length}`);
  const urls = new Set();
  for (const [code] of prefs) {
    const html = await postText(SEARCH, `pref_select=${code}`);
    for (const m of html.matchAll(/href="(https:\/\/www\.tenkaippin\.co\.jp\/shop\/\d+\/)"/g)) urls.add(m[1]);
  }
  const stores = [];
  const vocab = {};
  for (const url of urls) {
    const html = await fetchText(url);
    const name = text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split(/[|｜]/)[0].trim();
    const m = html.match(/<th>駐車場<\/th>\s*<td>([\s\S]*?)<\/td>/);
    if (!m) throw new Error(`駐車場の行が無い: ${url}`);
    const v = text(m[1]);
    vocab[v.slice(0, 12)] = (vocab[v.slice(0, 12)] || 0) + 1;
    const facilities = [];
    // 「22台」「あり」「有」「共用」等を有り、空欄・「なし」「無」「－」を無しとみなす
    if (v && !/^(なし|無し|無|ー|－|-|×|ありません)/.test(v) && !/^(近隣|周辺|コインパーキング)/.test(v)) facilities.push('parking');
    stores.push({ name, url, facilities });
  }
  console.error('駐車場欄の値:', JSON.stringify(vocab));
  return {
    chain: 'tenkaippin',
    name: '天下一品',
    sourceUrl: SOURCE,
    method: '公式店舗検索の都道府県検索で全店舗を列挙し、各店舗ページの店舗詳細表「駐車場」行を集計',
    total: stores.length,
    note: '公式の設備属性は駐車場のみ。「駐車場」行が空欄・「なし」の店舗は無しとして数えた（近隣コインパーキング案内のみの店舗も無し扱い）',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
