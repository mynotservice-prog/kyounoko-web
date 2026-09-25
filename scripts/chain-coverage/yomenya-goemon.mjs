/**
 * 洋麺屋五右衛門: 公式の店舗一覧（www.yomenya-goemon.com/store/<地方>/）。
 * 各店舗の <dd class="store_info_memo">（備考）に「お子様メニュー」「FREE Wi-Fi」「サラダバー」等が書かれる。
 * 備考に「お子様メニュー」（半角ｰの表記ゆれ「お子様メニュｰ」を含む）がある店舗を kidsMenu に数える。
 * HTML コメントで非表示にされている店舗（画面に出ない）は数えない。海外（/store/kaigai/）は除外。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.yomenya-goemon.com/store/';
const LABELS = { kidsMenu: 'お子様メニュー' };

const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const top = await fetchText(SOURCE);
  const regions = [...new Set([...top.matchAll(/href="\/store\/([a-z_]+)\/"/g)].map((m) => m[1]))].filter((r) => r !== 'kaigai');
  if (regions.length < 5) throw new Error(`地方ページが少なすぎる: ${regions.join(',')}`);
  const stores = [];
  let hidden = 0;
  const memoSeen = {};
  for (const r of regions) {
    const url = `${SOURCE}${r}/`;
    const raw = await fetchText(url);
    hidden += [...raw.matchAll(/<!--[\s\S]*?-->/g)].reduce((a, m) => a + (m[0].match(/store_info_name/g) || []).length, 0);
    const html = raw.replace(/<!--[\s\S]*?-->/g, '');
    for (const m of html.matchAll(/<li>\s*<dl>([\s\S]*?)<\/dl>\s*<\/li>/g)) {
      const b = m[1];
      if (!b.includes('store_info_name')) continue;
      // 店名の後ろに付く赤字の告知（改装休業・オープン日等）は落とす
      const name = clean((b.match(/class="store_info_name">([\s\S]*?)<\/dt>/)?.[1] || '').replace(/<span[\s\S]*?<\/span>/g, ''));
      const memo = [...b.matchAll(/class="store_info_memo">([\s\S]*?)<\/dd>/g)].map((x) => clean(x[1])).join(' ');
      if (memo) memoSeen[memo] = (memoSeen[memo] || 0) + 1;
      stores.push({ name, url, facilities: /お子様メニュ[ーｰ]/.test(memo) ? ['kidsMenu'] : [] });
    }
  }
  return {
    chain: 'yomenya-goemon',
    name: '洋麺屋五右衛門',
    sourceUrl: SOURCE,
    method: '公式の店舗一覧（国内の地方別ページ）の各店舗の備考欄に「お子様メニュー」とある店舗を集計',
    total: stores.length,
    note: [
      '海外店舗は除外',
      hidden ? `HTMLコメントで非表示の店舗 ${hidden} 件（画面に出ないため数えない）` : null,
      `備考欄の記載の内訳: ${Object.entries(memoSeen).map(([k, v]) => `「${k}」${v}`).join('・')}`,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
