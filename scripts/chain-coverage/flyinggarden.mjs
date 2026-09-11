/**
 * フライングガーデン: 公式「店舗案内」1ページに全店舗が並び、店舗ごとに「特長」アイコンが付く。
 * 凡例（ページ上部）: wheelchair.png=「入口にスロープを設置している店舗です」
 *                   flat.png=「入口に段差がない店舗です」
 *                   baby.png=「女性用トイレにおむつ交換ベッドを設置している店舗です」
 * スロープと段差なしはどちらも「入口の段差がない」ので stepFree にまとめ、内訳は note に書く。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.fgarden.co.jp/restaurant/index.php';
const LABELS = {
  stepFree: '入口にスロープを設置／入口に段差がない',
  diaperTable: '女性用トイレにおむつ交換ベッドを設置',
};

export async function crawl() {
  const html = await fetchText(SOURCE);
  const body = html.slice(html.indexOf('restaurant_intro'));
  const blocks = [...body.matchAll(/<dl class="branch">([\s\S]*?)<\/dl>/g)].map((m) => m[1]);
  let slope = 0;
  let flat = 0;
  const stores = blocks.map((b) => {
    const name = b.match(/<dt class="name"><p>([\s\S]*?)<\/p>/)[1].replace(/<[^>]+>/g, '').trim();
    const icons = new Set([...b.matchAll(/<img src="img\/([^"]+)"/g)].map((m) => m[1]));
    const facilities = [];
    if (icons.has('wheelchair.png')) slope++;
    if (icons.has('flat.png')) flat++;
    if (icons.has('wheelchair.png') || icons.has('flat.png')) facilities.push('stepFree');
    if (icons.has('baby.png')) facilities.push('diaperTable');
    return { name: `フライングガーデン ${name}`, url: SOURCE, facilities };
  });
  return {
    chain: 'flyinggarden',
    name: 'フライングガーデン',
    sourceUrl: SOURCE,
    method: '公式店舗案内ページの全店舗一覧に付く「特長」アイコン（凡例: スロープ設置／段差なし／おむつ交換ベッド）を店舗ごとに集計',
    total: stores.length,
    note: `stepFree の内訳: 入口にスロープ設置 ${slope}店、入口に段差がない ${flat}店（両方のアイコンを持つ店は無い前提で合算）。おむつ交換ベッドは女性用トイレ設置と明記`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
