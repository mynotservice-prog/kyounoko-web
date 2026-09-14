/**
 * スシロー: 公式店舗検索 akindo-sushiro.co.jp/shop/ の「サービスから探す」（mode=service）は
 * サーバ側描画で全店舗（670 件）を 1 ページに返す。各サービスは同じ URL に <name>=1 を付けた絞り込み結果で確定する。
 * サービス一覧: デジロー／駐車場あり／身障者用駐車場／1F店舗（スロープ有り）／2階建て店舗／エレベーター／おむつ替えシート／自動土産ロッカー。
 * 家族向け設備に当たるのは 駐車場あり・1F店舗（スロープ有り）・おむつ替えシート の 3 つ。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const BASE = 'https://www.akindo-sushiro.co.jp/shop/';
const SOURCE = `${BASE}?mode=service`;
const FILTERS = {
  parking: { param: 'parking', label: '駐車場あり' },
  stepFree: { param: 'slope', label: '1F店舗（スロープ有り）' },
  diaperTable: { param: 'diaper_change_sheet', label: 'おむつ替えシート' },
};

function parse(html) {
  const declared = Number(html.match(/result-count__num">(\d+)</)?.[1] || 0);
  const items = [...html.matchAll(/<a href="detail\.php\?id=(\d+)" class="common-shop-list__panel">([\s\S]*?)<\/a>/g)].map((m) => ({
    id: m[1],
    name: text(m[2].match(/common-shop-list__name">([\s\S]*?)<\/div>/)?.[1] || ''),
  }));
  if (declared !== items.length) throw new Error(`件数表示 ${declared} と店舗数 ${items.length} が一致しない`);
  return items;
}

export async function crawl() {
  const all = parse(await fetchText(SOURCE));
  const byId = new Map(all.map((s) => [s.id, { name: `スシロー ${s.name}`, url: `${BASE}detail.php?id=${s.id}`, facilities: [] }]));
  for (const [key, f] of Object.entries(FILTERS)) {
    for (const s of parse(await fetchText(`${SOURCE}&${f.param}=1`))) {
      const st = byId.get(s.id);
      if (!st) throw new Error(`絞り込み結果に全件一覧に無い店舗: ${s.name}`);
      st.facilities.push(key);
    }
  }
  const stores = [...byId.values()];
  const labels = Object.fromEntries(Object.entries(FILTERS).map(([k, f]) => [k, f.label]));
  return {
    chain: 'sushiro',
    name: 'スシロー',
    sourceUrl: SOURCE,
    method: '公式店舗検索の「サービスから探す」全件一覧（670件）を基に、サービス別の絞り込み結果（駐車場あり・1F店舗（スロープ有り）・おむつ替えシート）に含まれる店舗を店舗ごとに集計',
    note: '身障者用駐車場・2階建て店舗・エレベーター・自動土産ロッカー・デジローは設備キーに対応づけていない',
    total: stores.length,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
