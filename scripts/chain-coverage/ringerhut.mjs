/**
 * リンガーハット: 公式店舗検索（shop.ringerhut.jp、can-ly製 directory 84）。
 * 検索APIで全店舗を列挙し、各店舗詳細ページの __NEXT_DATA__ にある「サービス」チェック項目
 * （券売機／ドライブスルー／駐車場／冷凍自販機、checked: true/false）を店舗ごとに読む。
 * 詳細ページは2形式あり、「サービス」欄が無い店舗（約3割）は代わりに「駐車場」欄（テキスト、例「19台」）を持つことがある。
 * どちらも無い店舗（フードコート内など）は属性表示なし＝該当なしとして数える。
 * 公式の店舗属性はこの4つ＋駐車場欄だけで、子連れ向け設備（お子様椅子・おむつ交換台等）は無い。
 * ブランド「冷凍自動販売機」（無人販売機の設置場所）は店舗ではないので除外する。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.ringerhut.jp/all/';
const API = 'https://api.site.can-ly.com/v2/directories/84/shops/search';
const LABELS = {
  parking: '駐車場',
};

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: 'https://shop.ringerhut.jp', Referer: SOURCE } });
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const format = { service: 0, parkingText: 0, none: 0 }; // 詳細ページの形式の内訳
  const noneNames = []; // 「サービス」欄も「駐車場」欄も無い店舗（フードコート内店舗など）。属性表示なし＝該当なし扱い
  const parkingTexts = new Set();
  const skippedBrand = {};
  const stores = [];
  for (const s of list.shops) {
    if (s.brand?.name !== 'リンガーハット') { skippedBrand[s.brand?.name || '-'] = (skippedBrand[s.brand?.name || '-'] || 0) + 1; continue; }
    if (s.openStatus === 'IS_PERMANENTLY_CLOSED') { closed.push(s.nameKanji); continue; }
    const url = `https://shop.ringerhut.jp/detail/${s.storeCode}/`;
    const shop = nextData(await fetchText(url)).props.pageProps.shop;
    const cms = shop.cmsItemValues || [];
    const items = cms
      .filter((c) => c.content?.title === 'サービス' && c.content?.checkBoxComposite)
      .flatMap((c) => c.content.checkBoxComposite.items);
    let facilities;
    if (items.length) {
      format.service++;
      facilities = items.filter((it) => it.checked).map((it) => byLabel[it.text]).filter(Boolean);
    } else {
      // 「駐車場」欄（textArea、例「19台」）。空・「なし」・「0台」は該当なし
      const parkingText = cms
        .filter((c) => c.content?.title === '駐車場' && c.content?.textArea)
        .flatMap((c) => c.content.textArea.items.map((it) => it.text.trim()))
        .join(' ')
        .trim();
      if (parkingText) {
        format.parkingText++;
        parkingTexts.add(parkingText);
        facilities = /^(なし|無し|0台)$/.test(parkingText) ? [] : ['parking'];
      } else {
        format.none++;
        noneNames.push(s.nameKanji);
        facilities = [];
      }
    }
    stores.push({ name: s.nameKanji.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  const skipped = Object.entries(skippedBrand).map(([b, n]) => `${b}${n}件`).join('・');
  const noServiceNote = `。詳細ページの形式: 「サービス」チェック欄あり${format.service}件／「駐車場」欄（台数テキスト）のみ${format.parkingText}件／どちらも無し${format.none}件。「駐車場」欄は台数等の記載があれば駐車場ありと数えた（表記例: ${[...parkingTexts].slice(0, 5).join('、')}）${format.none ? `。どちらも無い${format.none}件（${noneNames.slice(0, 8).join('、')}${format.none > 8 ? ' ほか' : ''}）は属性表示なし（該当なし）として数えた` : ''}`;
  return {
    chain: 'ringerhut',
    name: 'リンガーハット',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIでブランド「リンガーハット」の店舗を列挙し、各店舗詳細ページの「サービス」チェック項目（無い店舗は「駐車場」欄）を集計',
    total: stores.length,
    note: `公式の店舗属性は 券売機／ドライブスルー／駐車場／冷凍自販機 の4つ（＋一部店舗の「駐車場」欄）のみ。ブランド外（${skipped}）は除外${closed.length ? `。閉店扱い${closed.length}件（${closed.join('、')}）も除外` : ''}${noServiceNote}`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
