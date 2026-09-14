/**
 * 餃子の王将: 公式店舗検索 map.ohsho.co.jp（Mapion 製 e-map）の「店舗一覧（条件検索）」attr/?t=attr_con。
 * 全件（725 件）を start=<ページ番号>（20 件/ページ）でめくり、店舗ごとの「サービス」アイコン（img alt）を集計する。
 * アイコンは テイクアウトネット予約／デリバリー／順番待ち予約／駐車場有／バリアフリー／フェア開催中／深夜0時以降営業／駅の近く／電子決済 の 9 種。
 * 家族向け設備に当たるのは「駐車場有」「バリアフリー」の 2 つ（同画面の絞り込み parking=1 / barrier_free=1 と同じ属性）。
 * ※ 都道府県ページ（?t=prefectures&lat=..）は座標中心の検索で全件にならないので使わない。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const MAP = 'https://map.ohsho.co.jp';
const SOURCE = `${MAP}/b/ohsho/attr/?t=attr_con`;
const PAGE = 20;
const LABELS = { parking: '駐車場有', stepFree: 'バリアフリー' };
const norm = (s) => s.replace(/<br\s*\/?>/g, '').trim();

export async function crawl() {
  const byAlt = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const first = await fetchText(SOURCE);
  const declared = Number(first.match(/class="number">(\d+)件</)?.[1] || 0);
  if (!declared) throw new Error('件数が読めない');
  const stores = [];
  const seen = new Set();
  const brands = {};
  const pages = Math.ceil(declared / PAGE);
  for (let p = 1; p <= pages; p++) {
    const html = p === 1 ? first : await fetchText(`${SOURCE}&start=${p}`);
    const blocks = html.split(/class="shopBlock(?: spExpand)?"/).slice(1); // shopBlockList（アコーディオン）は別物
    if (!blocks.length) throw new Error(`start=${p} で店舗が取れない`);
    for (const chunk of blocks) {
      const b = chunk.split('<!--/shopBlock-->')[0]; // 最終ブロックの後ろにアイコン凡例（全9種）が続くので切る
      const m = b.match(/<h3 class="shopName"><a href="([^"]+)">([^<]+)<\/a>/);
      if (!m) continue;
      const url = MAP + m[1];
      if (seen.has(url)) continue;
      seen.add(url);
      const name = text(m[2]);
      const brand = name.split(' ')[0];
      brands[brand] = (brands[brand] || 0) + 1;
      const alts = new Set([...b.matchAll(/<img src="\/f\/ohsho\/img\/shop_ic_[^"]+" alt="([^"]+)"/g)].map((x) => norm(x[1])));
      stores.push({ name, url, facilities: [...alts].map((a) => byAlt[a]).filter(Boolean) });
    }
  }
  if (stores.length !== declared) throw new Error(`件数表示 ${declared} と取得 ${stores.length} が一致しない`);
  return {
    chain: 'ohsho',
    name: '餃子の王将',
    sourceUrl: SOURCE,
    method: '公式店舗検索（map.ohsho.co.jp）の店舗一覧を全ページめくり、店舗ごとの「サービス」アイコン（駐車場有・バリアフリー）を集計',
    total: stores.length,
    note: `内訳: ${Object.entries(brands).map(([b, n]) => `${b} ${n}`).join('、')}（GYOZA OHSHO 等の業態も同じ locator に載るのでそのまま含む）。「バリアフリー」の基準は公式に説明がない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
