/**
 * 8番らーめん: 公式店舗情報（www.hachiban.jp/shop/）。
 * ページに埋め込まれた dataShop（都道府県→市区町村・店舗）の各店舗に option（"zashiki, slope, children_chair" 等）があり、
 * 同じページの shopOptions が各コードの公式表記とアイコンを定義している（店舗検索の絞り込み条件と同じ）。
 *   zashiki=お座敷あり / slope=入口スロープあり / children_chair=お子様椅子あり / baby_seat=ベビーシートあり / drive_thru=ドライブスルー
 * 「ベビーシートあり」は用途の説明文が無いが、公式アイコン（ic_baby_seat.svg）が乳児を寝かせる台の図柄なので
 * おむつ替え台（diaperTable）に対応づける（ビッグボーイ・ココス等の「ベビーシート」と同じ扱い）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.hachiban.jp/shop/';
const CODES = {
  zashiki: 'zashiki',
  stepFree: 'slope',
  kidsChair: 'children_chair',
  diaperTable: 'baby_seat',
};

export async function crawl() {
  const html = await fetchText(SOURCE);
  const opt = html.match(/const shopOptions = (\{[\s\S]*?\});/);
  const data = html.match(/const dataShop = (\{[\s\S]*?\});\s*\n/);
  if (!opt || !data) throw new Error('shopOptions / dataShop が見つからない');
  const options = Object.values(JSON.parse(opt[1]));
  const codeToName = Object.fromEntries(options.map((o) => [o.code, o.name]));
  const labels = {};
  for (const [k, code] of Object.entries(CODES)) {
    if (!codeToName[code]) throw new Error(`公式の条件に ${code} が無い（現在: ${Object.keys(codeToName).join(',')}）`);
    labels[k] = codeToName[code];
  }
  const byCode = Object.fromEntries(Object.entries(CODES).map(([k, c]) => [c, k]));
  const stores = [];
  const seenIds = new Set();
  for (const blocks of Object.values(JSON.parse(data[1]))) {
    for (const b of blocks) {
      for (const s of b.shop || []) {
        if (seenIds.has(s.id)) continue;
        seenIds.add(s.id);
        const codes = (s.option || '').toLowerCase().split(',').map((x) => x.trim()).filter(Boolean);
        for (const c of codes) if (!codeToName[c]) throw new Error(`未知の option コード ${c}（${s.name}）`);
        stores.push({ name: s.name.replace(/\s+/g, ' ').trim(), url: `https://www.hachiban.jp/shop/detail/?id=${s.id}`, facilities: codes.map((c) => byCode[c]).filter(Boolean) });
      }
    }
  }
  return {
    chain: 'hachiban-ramen',
    name: '8番らーめん',
    sourceUrl: SOURCE,
    method: '公式店舗情報ページに埋め込まれた国内全店舗データ（dataShop）の店舗ごとの設備コード（option。店舗検索の絞り込み条件と同じ）を集計',
    total: stores.length,
    note: `公式の条件: ${options.map((o) => o.name).join('・')}（ドライブスルーは対象外）。「ベビーシートあり」は用途の説明文が無いが、公式アイコンが乳児を寝かせる台の図柄のためおむつ替え台として集計`,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
