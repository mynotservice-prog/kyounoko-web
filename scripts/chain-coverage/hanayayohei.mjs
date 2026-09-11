/**
 * 華屋与兵衛: 公式店舗検索（maps.hanayayohei.co.jp、ゼンショー系の共通店舗検索）。
 * /api/search（POST、店名空）で全店舗を列挙し、各店舗詳細ページの
 * 「サービス・設備」「メニュー」欄に並ぶアイコン名を店舗ごとに読む。
 * 検索フォームの絞り込みチェック（ベビーシート／多目的トイレ／スロープ／エレベーター／駐車場）と同じ項目。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const ORIGIN = 'https://maps.hanayayohei.co.jp';
const SOURCE = `${ORIGIN}/jp/shop.html`;
// 詳細ページのアイコン名（「あり」を除いた表記）→ 設備キー。それ以外（禁煙・デリバリー・フロア等）は無視
const LABELS = {
  stepFree: 'スロープ／エレベーター',
  diaperTable: 'ベビーシート',
  kidsMenu: 'お子様メニュー',
  multiToilet: '多目的トイレ',
  parking: '駐車場',
};

async function postSearch(body) {
  // _lib の fetchText は GET 専用なので、同じ間隔を守るために一度呼んでから POST する代わりに
  // ここでは fetch を直接使い、呼び出し側で 1 回だけにする
  const r = await fetch(`${ORIGIN}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', Referer: SOURCE },
    body,
    signal: AbortSignal.timeout(25_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} /api/search`);
  return r.json();
}

export async function crawl() {
  const res = await postSearch('name=');
  const links = [...new Set([...res.list.matchAll(/href="(\/jp\/detail\/\d+\.html)"/g)].map((m) => m[1]))];
  const declared = Number((res.list.match(/検索結果：<strong>(\d+)/) || [])[1]);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  for (const path of links) {
    const url = ORIGIN + path;
    const html = await fetchText(url);
    const name = (html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || html.match(/<title>([^<|｜]+)/))[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const sections = [...html.matchAll(/<dl class="(?:facility|menu)">([\s\S]*?)<\/dl>/g)].map((m) => m[1]);
    const names = new Set();
    for (const sec of sections) {
      const live = sec.replace(/<!--[\s\S]*?-->/g, ''); // コメントアウトされた項目は「無い」扱い
      for (const m of live.matchAll(/<span class="name">([\s\S]*?)<\/span>/g)) {
        names.add(m[1].replace(/<br\s*\/?>/g, '').replace(/\s+/g, '').replace(/あり$/, ''));
      }
    }
    stores.push({ name, url, facilities: [...names].map((n) => byLabel[n]).filter(Boolean) });
  }
  return {
    chain: 'hanayayohei',
    name: '華屋与兵衛',
    sourceUrl: SOURCE,
    method: '公式店舗検索の検索API（/api/search）で全店舗を列挙し、各店舗詳細ページの「サービス・設備」「メニュー」欄のアイコン名を集計',
    total: stores.length,
    note: `検索結果の表示件数は${declared}件。「スロープ／エレベーター」は公式表記のままで、スロープとエレベーターのどちらかがある店舗を指す`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
