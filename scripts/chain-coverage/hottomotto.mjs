/**
 * ほっともっと: 公式店舗検索（store.hottomotto.com、Mapion製）の「店舗一覧（サービス条件）」ページ。
 * 一覧は 20 件/ページで、「もっと見る」ボタンが GET /b/hottomotto/attr/?t=attr_con&page=more&start=<ページ番号> で
 * 次ページの断片（<li class="result-list-item">…）を取りに行く（start はオフセットではなく 1 始まりのページ番号。
 * 総ページ数を超える番号を渡すとサイト側のエラーページ（HTTP 403）になる）。
 * 各店舗に付くサービス条件アイコン（alt属性）を集計する。
 * アイコンは「駐車場あり／24時間営業／出前館／Uber Eats／ほっともっとからの宅配」の5種で、設備キーに当たるのは駐車場のみ。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://store.hottomotto.com/b/hottomotto/attr/?t=attr_con';
const PAGE = 20;
// 公式アイコンの alt → 設備キー。ここに無い alt（24時間営業・出前館・Uber Eats・宅配）は無視する
const LABELS = {
  parking: '駐車場あり',
};

function parseItems(html) {
  return html.split('<li class="result-list-item">').slice(1);
}

export async function crawl() {
  const byAlt = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const first = await fetchText(SOURCE);
  const declared = Number((first.match(/class="num">(\d+)/) || [])[1]);
  if (!declared) throw new Error('件数が読めない');
  const pages = Math.ceil(declared / PAGE);
  const stores = [];
  const seen = new Set();
  for (let page = 1; page <= pages; page++) {
    const html = page === 1 ? first : await fetchText(`${SOURCE}&page=more&start=${page}`);
    const items = parseItems(html);
    if (!items.length) throw new Error(`page=${page} で店舗が取れない`);
    for (const it of items) {
      const href = (it.match(/href="([^"]+)"/) || [])[1];
      const name = text((it.match(/<h3 class="result-ttl">([\s\S]*?)<\/h3>/) || [])[1] || '').replace(/\s+/g, ' ').trim();
      if (!name || !href) continue;
      if (seen.has(href)) throw new Error(`重複: ${name}（${href}、page=${page}）`);
      seen.add(href);
      const alts = new Set([...it.matchAll(/<img[^>]*alt="([^"]+)"[^>]*width="52"/g)].map((m) => m[1]));
      stores.push({ name, url: `https://store.hottomotto.com${href}`, facilities: [...alts].map((a) => byAlt[a]).filter(Boolean) });
    }
  }
  if (stores.length !== declared) throw new Error(`件数不一致: 一覧の表示件数 ${declared} に対し ${stores.length} 件`);
  return {
    chain: 'hottomotto',
    name: 'ほっともっと',
    sourceUrl: SOURCE,
    method: '公式店舗検索の店舗一覧を「もっと見る」と同じページ取得（page=more&start=ページ番号）で全ページ取得し、各店舗に付くサービス条件アイコン（alt属性）を集計',
    total: stores.length,
    note: `公式一覧の表示件数は${declared}件（全ページの合計と一致）。サービス条件アイコンは駐車場あり／24時間営業／出前館／Uber Eats／宅配の5種のみで、子連れ設備の属性は無い（持ち帰り弁当専門のため）`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
