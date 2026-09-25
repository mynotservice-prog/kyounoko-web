/**
 * ジョイフル: 公式店舗検索（www.joyfull.co.jp/shop）。
 * 都道府県別の結果ページ（/shop?prefecture=<番号>）の各店舗リンク（「もっと見る」で開く分は class に is-hidden が付くが HTML には全件ある）に data-service-ids（サービス絞り込みの番号）が入り、
 * 番号と表記は同じページの「サービスから探す」チェックボックス（name="service_id[]"）で対応づく。
 *   1=駐車場あり 2=24時間営業 4=テイクアウト 5=キャッシュレス決済 6=テーブル決済 8=ジョイフルQRオーダー 9=無料Wi-Fi 10/11=デリバリー
 * 設備に当たるのは「駐車場あり」だけなので parking のみ数える（子ども用の椅子等の項目は無い）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.joyfull.co.jp/shop';
const WANT = { parking: '駐車場あり' };

const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const top = await fetchText(SOURCE);
  const prefs = [...new Set([...top.matchAll(/shop\?prefecture=(\d+)/g)].map((m) => m[1]))];
  if (prefs.length < 20) throw new Error(`都道府県が少なすぎる: ${prefs.length}`);
  let idToKey = null;
  const labels = {};
  const stores = [];
  const seen = new Set();
  for (const p of prefs) {
    const url = `${SOURCE}?prefecture=${p}`;
    const html = await fetchText(url);
    if (!idToKey) {
      const svc = Object.fromEntries([...html.matchAll(/name="service_id\[\]" value="(\d+)"[\s\S]*?<\/label>/g)].map((m) => [clean(m[0].split('/>').slice(1).join('/>')), m[1]]));
      idToKey = {};
      for (const [k, l] of Object.entries(WANT)) {
        if (!svc[l]) throw new Error(`サービス条件に "${l}" が無い（現在: ${Object.keys(svc).join('|')}）`);
        idToKey[svc[l]] = k;
        labels[k] = l;
      }
    }
    const expected = Number(html.match(/<span class="count">(\d+)<\/span>件の店舗があります/)?.[1]);
    let got = 0;
    for (const m of html.matchAll(/<a href="(https:\/\/www\.joyfull\.co\.jp\/shop\/\d+)" class="result-shop-item[^"]*"[^>]*data-service-ids="([^"]*)"[^>]*data-shop-name="([^"]*)"/g)) {
      const [, shopUrl, ids, name] = m;
      got++;
      if (seen.has(shopUrl)) continue;
      seen.add(shopUrl);
      stores.push({ name: name.trim(), url: shopUrl, facilities: ids.split(',').map((x) => idToKey[x.trim()]).filter(Boolean) });
    }
    if (got !== expected) throw new Error(`都道府県 ${p}: 件数表示 ${expected} に対し ${got} 件しか読めていない`);
  }
  return {
    chain: 'joyfull',
    name: 'ジョイフル',
    sourceUrl: SOURCE,
    method: '公式店舗検索の都道府県別結果ページで、各店舗のサービス番号（data-service-ids。「サービスから探す」の絞り込みと同じ）から「駐車場あり」を店舗ごとに集計',
    total: stores.length,
    note: '店舗検索のサービス項目は駐車場・24時間営業・テイクアウト・決済・Wi-Fi・デリバリーのみで、子ども向け設備の項目は無い',
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
