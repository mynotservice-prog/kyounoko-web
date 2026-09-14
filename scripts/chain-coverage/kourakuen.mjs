/**
 * 幸楽苑: 公式店舗検索 stores.kourakuen.co.jp の都道府県別結果ページ（store/search.html?action=prefSearch&pref=N）に
 * 店舗ごとのタグ（storeListTag: 駐車場あり／フードコート／ビルイン／宅配各社）が並ぶ。
 * 家族向け設備に当たるのは「駐車場あり」だけ。都道府県の一覧は locator トップの pref= リンクから取る（出店は 17 都道府県）。
 * 結果には「餃子の味よし」等の別業態も混ざるので、店名が「幸楽苑」で始まるものだけ数える。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const BASE = 'https://stores.kourakuen.co.jp';
const SOURCE = `${BASE}/`;
const LABELS = { parking: '駐車場あり' };

export async function crawl() {
  const top = await fetchText(SOURCE);
  const prefs = [...new Set([...top.matchAll(/action=prefSearch&(?:amp;)?pref=(\d+)/g)].map((m) => m[1]))];
  if (prefs.length === 0) throw new Error('都道府県リンクが取れない');
  const stores = [];
  const others = {};
  for (const pref of prefs) {
    const html = await fetchText(`${BASE}/store/search.html?action=prefSearch&pref=${pref}`);
    for (const b of html.split('class="storeListItem"').slice(1)) {
      const name = text(b.match(/class="storeListName[^"]*">([\s\S]*?)<\/p>/)?.[1] || '');
      const id = b.match(/href="info\.html\?id=(\d+)"/)?.[1];
      if (!name) continue;
      if (!name.startsWith('幸楽苑')) { others[name.split(' ')[0]] = (others[name.split(' ')[0]] || 0) + 1; continue; }
      const tags = [...b.matchAll(/class="storeListTagItem">([^<]+)</g)].map((m) => m[1].trim());
      stores.push({ name, url: id ? `${BASE}/store/info.html?id=${id}` : undefined, facilities: tags.includes('駐車場あり') ? ['parking'] : [] });
    }
  }
  return {
    chain: 'kourakuen',
    name: '幸楽苑',
    sourceUrl: SOURCE,
    method: '公式店舗検索の都道府県別結果ページ（17都道府県）に並ぶ店舗タグ（駐車場あり）を店舗ごとに集計',
    total: stores.length,
    note: `店名が「幸楽苑」で始まる店舗のみ。除外した別業態: ${Object.entries(others).map(([k, v]) => `${k} ${v}`).join('、') || 'なし'}。タグはほかに「フードコート」「ビルイン」があるが設備キーには対応づけていない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
