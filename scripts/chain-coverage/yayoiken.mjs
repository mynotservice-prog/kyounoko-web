/**
 * やよい軒: 公式店舗検索 store.yayoiken.com（ほっともっとと同じ Mapion 製 e-map）の「店舗一覧（サービス条件）」ページ。
 * 全件一覧を start= オフセット（20件/ページ）でめくり、各店舗に付くサービス条件アイコン（alt属性）を集計する。
 * アイコン説明モーダルに並ぶのは「朝食メニュー販売／お子様メニュー／駐車場あり／Uber Eats／出前館」の 5 種で、
 * 設備キーに当たるのは お子様メニュー・駐車場あり の 2 つ（検索画面のチェックボックス cond_kidsmenu / cond_parking と同じ属性）。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const BASE = 'https://store.yayoiken.com';
const SOURCE = `${BASE}/b/yayoiken/attr/?t=attr_con`;
const PAGE = 20;
const LABELS = {
  kidsMenu: 'お子様メニュー',
  parking: '駐車場あり',
};

export async function crawl() {
  const byAlt = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const first = await fetchText(SOURCE);
  const declared = Number((first.match(/class="num">(\d+)/) || [])[1]);
  if (!declared) throw new Error('件数が読めない');
  const stores = [];
  const seen = new Set();
  // start= はオフセットではなくページ番号（1 始まり・20 件/ページ）
  const pages = Math.ceil(declared / PAGE);
  for (let start = 1; start <= pages; start++) {
    const html = start === 1 ? first : await fetchText(`${SOURCE}&start=${start}`);
    const items = html.split('<li class="result-list-item">').slice(1);
    if (!items.length) throw new Error(`start=${start} で店舗が取れない`);
    for (const it of items) {
      const href = (it.match(/href="([^"]+)"/) || [])[1];
      const name = text((it.match(/<h3 class="result-ttl">([\s\S]*?)<\/h3>/) || [])[1] || '').replace(/\s+/g, ' ').trim();
      if (!name || !href || seen.has(href)) continue;
      seen.add(href);
      const alts = new Set([...it.matchAll(/<img[^>]*alt="([^"]+)"[^>]*width="52"/g)].map((m) => m[1]));
      stores.push({ name, url: `${BASE}${href}`, facilities: [...alts].map((a) => byAlt[a]).filter(Boolean) });
    }
  }
  if (stores.length !== declared) throw new Error(`件数表示 ${declared} と取得 ${stores.length} が一致しない`);
  return {
    chain: 'yayoiken',
    name: 'やよい軒',
    sourceUrl: SOURCE,
    method: '公式店舗検索（store.yayoiken.com）の店舗一覧を全ページめくり、店舗ごとのサービス条件アイコン（お子様メニュー・駐車場あり）を集計',
    total: stores.length,
    note: `一覧の件数表示 ${declared} 件。アイコンはほかに朝食メニュー販売・Uber Eats・出前館があるが設備キーには対応づけていない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
