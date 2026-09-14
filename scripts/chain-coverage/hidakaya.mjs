/**
 * 日高屋: 公式店舗検索（hidakaya.hiday.co.jp/hits/ja/shop/1/、ブランド1=日高屋）。
 * 「店舗一覧から探す」（list.html）で全店舗の詳細ページを列挙し、各詳細ページの「KEY WORD」欄に
 * 並ぶハッシュタグ（お子様メニュー／喫煙ブース／QRコード決済／クレジット決済／電子マネー決済／駐車場あり）を
 * 店舗ごとに集計する。詳細ページにはその店が持つタグだけが並ぶ（checked 固定のチェックボックス）。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const BASE = 'https://hidakaya.hiday.co.jp/hits/ja/shop/1/';
const SOURCE = BASE + 'list.html';
// 公式ハッシュタグ → 設備キー。ここに無いタグ（喫煙ブース・決済系）は無視する
const LABELS = {
  kidsMenu: 'お子様メニュー',
  parking: '駐車場あり',
};

export async function crawl() {
  const list = await fetchText(SOURCE);
  // 店名は <a> 直下のテキストか、長い店名は <span style="font-size:12px"> に包まれる
  const entries = [...list.matchAll(/href="\.\/detail\/(\d+)\.html[^"]*">([\s\S]*?)<\/a>/g)];
  const byTag = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const seen = new Set();
  for (const [, id, rawName] of entries) {
    if (seen.has(id)) continue;
    seen.add(id);
    const url = `${BASE}detail/${id}.html`;
    const html = await fetchText(url);
    const tags = [...html.matchAll(/id="keyword_refa\d+"[^>]*>\s*<label[^>]*>#<span>([^<]+)<\/span>/g)].map((m) => m[1].trim());
    const name = text(rawName).replace(/\s+/g, ' ').trim();
    stores.push({ name, url, facilities: [...new Set(tags.map((t) => byTag[t]).filter(Boolean))] });
  }
  return {
    chain: 'hidakaya',
    name: '日高屋',
    sourceUrl: SOURCE,
    method: '公式店舗検索の「店舗一覧から探す」で日高屋ブランドの全店舗を列挙し、各店舗詳細ページの「KEY WORD」ハッシュタグを集計',
    total: stores.length,
    note: 'ブランド「日高屋」のみ（来来軒・焼鳥日高・台南等は別ブランドIDで対象外）。ハッシュタグは6種（お子様メニュー／喫煙ブース／QRコード決済／クレジット決済／電子マネー決済／駐車場あり）',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
