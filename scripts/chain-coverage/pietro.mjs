/**
 * ピエトロ（レストラン）: 公式の全国店舗一覧（www.pietro.co.jp/restaurant/all/）。
 * 一覧の各店舗カードに、店舗検索の絞り込み条件と同じ項目（キッズメニュー・バリアフリー・駐車場あり等）が
 * <ul class="category"> で並ぶので、店舗ごとに読む。
 * 店名に「※閉店」とある店舗は除外する。PASTA & TAPAS PIETRO・洋麺屋ピエトロ等の業態も公式一覧の店舗として含める。
 * 「バリアフリー」は stepFree に対応づける。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.pietro.co.jp/restaurant/all/';
const LABELS = {
  kidsMenu: 'キッズメニュー',
  stepFree: 'バリアフリー',
  parking: '駐車場あり',
};

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const html = await fetchText(SOURCE);
  // 絞り込み条件の表記を検証
  const conds = [...html.matchAll(/<label for="checkbox\d+">[\s\S]*?<span>(.*?)<\/span><\/label>/g)].map((m) => decode(m[1]));
  for (const l of Object.values(LABELS)) if (!conds.includes(l)) throw new Error(`絞り込み条件に "${l}" が無い（現在: ${conds.join('|')}）`);
  const listed = Number(html.match(/<span class="number">(\d+)<\/span>/)?.[1]);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const cards = [...html.matchAll(/<li>\s*<a href="(\/restaurant\/detail\/\d+)">([\s\S]*?)<\/a>\s*<\/li>/g)];
  if (cards.length !== listed) throw new Error(`カード数 ${cards.length} と一覧の件数 ${listed} が違う`);
  const closed = [];
  const stores = [];
  for (const [, path, body] of cards) {
    const name = decode(body.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] || '');
    if (/閉店/.test(name)) { closed.push(name); continue; }
    const cats = [...(body.match(/<ul class="category">([\s\S]*?)<\/ul>/)?.[1] || '').matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => decode(m[1]));
    stores.push({ name, url: `https://www.pietro.co.jp${path}`, facilities: cats.map((c) => byLabel[c]).filter(Boolean) });
  }
  return {
    chain: 'pietro',
    name: 'ピエトロ',
    sourceUrl: SOURCE,
    method: '公式の全国店舗一覧（/restaurant/all/）の店舗カードに表示される項目（店舗検索の絞り込み条件と同じ）を店舗ごとに集計',
    total: stores.length,
    note: [
      `一覧 ${listed} 件。閉店表示${closed.length}件（${closed.join('、')}）を除外`,
      'PASTA & TAPAS PIETRO・洋麺屋ピエトロ・PREMIO ピエトロ等の業態を含む',
    ].join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
