/**
 * 安楽亭: 公式店舗検索の全件結果ページに、店舗ごとの取扱サービスがアイコン(title属性)で並ぶ。
 * 参照アダプタ。1ページ・1リクエストで全店舗が取れる。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://anrakutei.jp/map/result/';
// 公式アイコンの title → 設備キー。ここに無い title（食べ放題・WiFi等）は無視する
const LABELS = {
  stepFree: '入口スロープ',
  diaperTable: 'おむつ交換台',
  kidsSpace: 'キッズルーム',
  privateRoom: '個室',
};

export async function crawl() {
  const html = await fetchText(SOURCE);
  const blocks = html.split('<li class="list"').slice(1);
  const byTitle = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = blocks.map((b) => {
    const name = text(b).split(' 住所')[0].replace(/^>?\s*(-->)?\s*/, '').trim();
    const titles = new Set([...b.matchAll(/title="([^"]+)"/g)].map((m) => m[1]));
    return { name, facilities: [...titles].map((t) => byTitle[t]).filter(Boolean) };
  });
  return {
    chain: 'anrakutei',
    name: '安楽亭',
    sourceUrl: SOURCE,
    method: '公式店舗検索の全件結果に表示される取扱サービスアイコンを店舗ごとに集計',
    total: stores.length,
    note: '結果ページには安楽亭以外の運営業態が混在する可能性がある（店名で判別していない）',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
