/**
 * くら寿司: 公式店舗検索 shop.kurasushi.co.jp の全店一覧（/all、559 件が 1 ページ）に、
 * 店舗ごとの data-store 属性（JSON）として services の ID 配列が入っている。
 * ID と表記の対応は同ページの「サービス・設備で絞り込む」チェックボックス（value=表記, data-id=ID）から取る。
 * 家族向け設備に当たるのは「スロープ対応」「多機能トイレ対応」の 2 つ
 * （「車いす用席対応」「エレベーター設置」「2階以上」は設備キーに対応づけていない。駐車場の属性は無い）。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const BASE = 'https://shop.kurasushi.co.jp';
const SOURCE = `${BASE}/all`;
const LABELS = {
  stepFree: 'スロープ対応',
  multiToilet: '多機能トイレ対応',
};

export async function crawl() {
  const html = await fetchText(SOURCE);
  // チェックボックス value（表記）→ data-id
  const idByLabel = {};
  for (const m of html.matchAll(/<input[^>]*class="[^"]*condition-input[^"]*"[^>]*>/g)) {
    const v = m[0].match(/value="([^"]+)"/)?.[1];
    const id = m[0].match(/data-id="(\d+)"/)?.[1];
    if (v && id) idByLabel[v] = Number(id);
  }
  const keyById = {};
  for (const [k, label] of Object.entries(LABELS)) {
    if (!idByLabel[label]) throw new Error(`チェックボックス「${label}」が見つからない`);
    keyById[idByLabel[label]] = k;
  }
  const declared = Number(html.match(/(\d+)件/)?.[1] || 0);
  const stores = [];
  for (const b of html.split('class="store"').slice(1)) {
    const raw = b.match(/data-store="([^"]+)"/)?.[1];
    const name = text(b.match(/class="sName[^"]*">([\s\S]*?)<\/div>/)?.[1] || '');
    const href = b.match(/href="(\/detail\/\d+)"/)?.[1];
    if (!raw || !name) continue;
    const data = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    const services = Array.isArray(data.services) ? data.services : [];
    stores.push({ name, url: href ? BASE + href : undefined, facilities: [...new Set(services.map((id) => keyById[id]).filter(Boolean))] });
  }
  if (declared && stores.length !== declared) throw new Error(`件数表示 ${declared} と店舗数 ${stores.length} が一致しない`);
  return {
    chain: 'kura-sushi',
    name: 'くら寿司',
    sourceUrl: SOURCE,
    method: '公式店舗検索の全店一覧（/all）に埋め込まれた店舗ごとの services ID を、「サービス・設備で絞り込む」チェック（スロープ対応・多機能トイレ対応）の表記に対応づけて集計',
    note: '店名末尾の【１皿115円～】等の価格帯注記はそのまま。駐車場の属性は locator に無い',
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
