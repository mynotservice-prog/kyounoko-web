/**
 * サブウェイ: 公式店舗検索（subway.co.jp/shop/search/）。
 * 検索ページに全店舗のカードが並び、各カードの data-tags に絞り込み条件（shopSearchTag）の番号が入る。
 * 絞り込み条件のうち設備キーに対応するのは「キッズセット」（kidsMenu）だけ
 * （朝サブ・昼営業・イートインスペースあり・完全禁煙・決済は対象外）。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://subway.co.jp/shop/search/';
const TAGS = { kidsMenu: 'キッズセット' };

const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const html = await fetchText(SOURCE);
  // 絞り込み条件: <input ... name="shopSearchTag" value="28"> <label ...>キッズセット</label>
  const cond = Object.fromEntries([...html.matchAll(/name="shopSearchTag" value="(\d+)">\s*<label[^>]*>([\s\S]*?)<\/label>/g)].map((m) => [clean(m[2]), m[1]]));
  const keyByTag = {};
  const labels = {};
  for (const [k, l] of Object.entries(TAGS)) {
    if (!cond[l]) throw new Error(`絞り込み条件に "${l}" が無い（現在: ${Object.keys(cond).join('|')}）`);
    keyByTag[cond[l]] = k;
    labels[k] = l;
  }
  const stores = [];
  const seen = new Set();
  for (const m of html.matchAll(/<li class="item card" data-href="([^"]+)" data-id="(\d+)" data-name="([^"]*)"[^>]*data-tags="([^"]*)"/g)) {
    const [, href, id, name, tags] = m;
    if (seen.has(id)) continue;
    seen.add(id);
    const facilities = tags.split(',').map((t) => keyByTag[t.trim()]).filter(Boolean);
    stores.push({ name: name.replace(/\s+/g, ' ').trim(), url: `https://subway.co.jp${href}`, facilities });
  }
  return {
    chain: 'subway',
    name: 'サブウェイ',
    sourceUrl: SOURCE,
    method: '公式店舗検索ページに並ぶ全店舗カードの絞り込みタグ（data-tags。画面の絞り込み条件と同じ番号）から「キッズセット」の有無を店舗ごとに集計',
    total: stores.length,
    note: `絞り込み条件: ${Object.keys(cond).join('・')}。設備キーに対応するのはキッズセットのみ`,
    facilities: tally(stores, labels),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
