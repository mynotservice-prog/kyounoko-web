/**
 * 一風堂: 公式店舗ページ（stores.ippudo.com、Yext製）。
 * サイトマップ（/sitemap1.xml）の日本語版店舗ページ（パスが数字だけのもの＝国内店。海外は SG014 等の英字コード、
 * 多言語版は /en/ 等の接頭辞つき）を全件取得し、各ページの「サービス」欄の項目を店舗ごとに読む。
 * 「サービス」欄の項目は店舗限定ラーメン・決済・外国語メニュー・お子様用椅子・お子様メニュー・駐車場・駐車サービス等。
 * 「駐車サービスあり」（提携駐車場の割引）は自店の駐車場ではないので数えない。
 * RAMEN EXPRESS 博多一風堂・一風堂KAY 等も一風堂の店舗ページとして載っているので含める。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://stores.ippudo.com/';
const LABELS = {
  kidsChair: 'お子様用椅子あり',
  kidsMenu: 'お子様メニューあり',
  parking: '駐車場あり',
};
const PREF = /^(北海道|東京都|大阪府|京都府|.{2,3}県)$/;

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export async function crawl() {
  const sitemap = await fetchText(`${SOURCE}sitemap1.xml`);
  const ids = [...new Set([...sitemap.matchAll(/<loc>https:\/\/stores\.ippudo\.com\/(\d+)<\/loc>/g)].map((m) => m[1]))];
  if (!ids.length) throw new Error('サイトマップに国内店舗ページが無い');
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const nonJapan = [];
  let noService = 0;
  const seen = {};
  for (const id of ids) {
    const url = `${SOURCE}${id}`;
    const html = await fetchText(url);
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
    const name = title.split('|')[0].trim();
    const region = html.match(/"addressRegion":"([^"]*)"/)?.[1] || html.match(/itemprop="addressRegion"[^>]*>([^<]*)/)?.[1] || '';
    if (!PREF.test(region)) { nonJapan.push(`${name}(${region || '不明'})`); continue; }
    const sec = html.match(/>サービス<span[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
    if (!sec) noService++;
    const items = sec ? [...sec[1].matchAll(/About-listitem">([\s\S]*?)<\/li>/g)].map((m) => decode(m[1]).trim()) : [];
    for (const it of items) seen[it] = (seen[it] || 0) + 1;
    const facilities = items.map((it) => byLabel[it]).filter(Boolean);
    stores.push({ name, url, facilities });
  }
  if (nonJapan.length) throw new Error(`数字パスに国内以外の店舗: ${nonJapan.join('、')}`);
  return {
    chain: 'ippudo',
    name: '一風堂',
    sourceUrl: SOURCE,
    method: '公式店舗ページ（stores.ippudo.com）のサイトマップから国内の日本語版店舗ページを全件取得し、各ページの「サービス」欄の項目を集計',
    total: stores.length,
    note: [
      'RAMEN EXPRESS 博多一風堂・一風堂KAY 等を含む。海外店（英字コードのページ）と多言語版ページは除外',
      `「サービス」欄の項目: ${Object.entries(seen).map(([k, v]) => `${k}${v}`).join('・')}`,
      '「駐車サービスあり」（提携駐車場の割引）は自店の駐車場ではないため数えない',
      noService ? `「サービス」欄が無い店舗 ${noService} 件（該当項目なしとして集計）` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
