/**
 * 平禄寿司: 焼肉坂井ホールディングスのグループ店舗検索（ys-holdings.co.jp/shop/、ブランド=heiroku-sushi）。
 * 結果一覧（1ページ20件）の各店舗カードに、絞り込み「サービス」と同じ項目のアイコン（li.item_<値>）が並ぶ。
 * 設備に当たる項目は「駐車場」（item_parking）と「多目的トイレ」（item_multi_purpose_toilet）だが、
 * 多目的トイレはグループ共通の検索条件で平禄寿司の該当が0件のため、未入力と区別できず数えない。
 * 海外店は都道府県「海外」（shop-prefectures=overseas）で検索した結果に出る店舗として除外する
 * （国内店の住所は都道府県名を省いた表記が多く、住所からは判別できないため）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const BASE = 'https://ys-holdings.co.jp/shop/';
const QUERY = '?f&shop-prefectures&shop-brand%5B0%5D=heiroku-sushi';
const QUERY_OVERSEAS = '?f=&shop-prefectures=overseas&shop-brand%5B%5D=heiroku-sushi';
const LABELS = { parking: '駐車場' };

const clean = (s) => s.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function listCards(query) {
  const first = await fetchText(BASE + query);
  const listed = Number(first.match(/検索結果\s*(\d+)件/)?.[1] || 0);
  const lastPage = Math.max(1, ...[...first.matchAll(/\/shop\/page\/(\d+)\//g)].map((m) => Number(m[1])));
  const cards = new Map();
  for (let p = 1; p <= lastPage; p++) {
    const html = p === 1 ? first : await fetchText(`${BASE}page/${p}/${query}`);
    for (const m of html.matchAll(/<li class="shop-card">([\s\S]*?)<\/article>/g)) {
      const a = m[1].match(/<h2 class="shop-card_ttl"><a href="([^"]+)">([\s\S]*?)<\/a>/);
      if (a) cards.set(a[1], { url: a[1], name: clean(a[2]), body: m[1] });
    }
  }
  if (cards.size !== listed) throw new Error(`検索結果 ${listed} 件に対し ${cards.size} 件しか取れていない（${query}）`);
  return { first, listed, cards };
}

export async function crawl() {
  const { first, listed, cards } = await listCards(QUERY);
  if (!/shop-service\[\][^>]*value="parking"/.test(first)) throw new Error('絞り込み「サービス」に parking が無い');
  const overseas = await listCards(QUERY_OVERSEAS);
  for (const u of overseas.cards.keys()) if (!cards.has(u)) throw new Error(`海外検索の店舗が全件一覧に無い: ${u}`);
  const stores = [];
  for (const c of cards.values()) {
    if (overseas.cards.has(c.url)) continue;
    stores.push({ name: c.name, url: c.url, facilities: /shop-service_item item_parking\b/.test(c.body) ? ['parking'] : [] });
  }
  return {
    chain: 'heiroku-sushi',
    name: '平禄寿司',
    sourceUrl: BASE + QUERY,
    method: 'グループ店舗検索のブランド「平禄寿司」の結果一覧（全ページ）の店舗カードにある「駐車場」アイコン（絞り込み「サービス」と同じ項目）を店舗ごとに集計',
    total: stores.length,
    note: [
      `一覧 ${listed} 件のうち海外店（都道府県「海外」の検索結果）${overseas.listed} 件を除外`,
      '「多目的トイレ」はグループ共通の検索条件で平禄寿司の該当が0件のため、未入力と区別できず数えない',
    ].join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
