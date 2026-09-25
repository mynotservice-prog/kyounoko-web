/**
 * カプリチョーザ: 公式店舗ページ（capricciosa.com/location/）。
 * 店舗一覧から各店舗ページを取得し、店舗ページの【お子様連れのお客様へ】欄（表の全幅行 <th colspan="2">）を読む。欄は全店共通の定型文の組み合わせで、
 * 店舗ごとに載っている文が違う:
 *   ・ミルク用のお湯をご用意しております。
 *   ・離乳食はお持ち込みいただけます。                        → babyFoodBringIn
 *   ・キッズチェア、お子様用の食器をご用意しております。        → kidsChair と kidsCutlery
 *   ・スパゲティは…お子様へのお取り分けにもおすすめです。（メニューの案内なので数えない）
 * 「ミルク用のお湯」は対応する設備キーが無いので数えない（note に件数だけ書く）。
 * 「駐車場」欄は自由記述（有料・提携・近隣・施設駐車場等が混在）で有無の線引きが推測になるため数えない。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://capricciosa.com/location/';
const LABELS = {
  kidsChair: 'キッズチェア、お子様用の食器をご用意しております',
  kidsCutlery: 'キッズチェア、お子様用の食器をご用意しております',
  babyFoodBringIn: '離乳食はお持ち込みいただけます',
};

export async function crawl() {
  const list = await fetchText(SOURCE);
  const urls = [...new Set([...list.matchAll(/href="(https:\/\/capricciosa\.com\/location\/[^"]+\/)"/g)].map((m) => m[1]))];
  if (urls.length < 50) throw new Error(`店舗ページが少なすぎる: ${urls.length}`);
  const stores = [];
  let noBlock = 0;
  let milk = 0;
  const closed = [];
  for (const url of urls) {
    const html = await fetchText(url);
    const name = html.match(/<caption>([\s\S]*?)<\/caption>/)?.[1]?.trim();
    if (!name) throw new Error(`店名が取れない: ${url}`);
    if (/閉店/.test(name)) { closed.push(name); continue; }
    // 欄は店舗詳細の表の <th colspan="2"> に入る（見出し【お子様連れのお客様へ】が無い店舗もあるので、colspan 行を全部見る）
    const t = [...html.matchAll(/<th colspan="2">([\s\S]*?)<\/th>/g)].map((x) => x[1]).join('').replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    if (!/ご用意しております|お持ち込みいただけます/.test(t)) noBlock++;
    const facilities = [];
    if (t.includes('キッズチェア、お子様用の食器をご用意しております')) facilities.push('kidsChair', 'kidsCutlery');
    if (t.includes('離乳食はお持ち込みいただけます')) facilities.push('babyFoodBringIn');
    if (t.includes('ミルク用のお湯をご用意しております')) milk++;
    stores.push({ name, url, facilities });
  }
  return {
    chain: 'capricciosa',
    name: 'カプリチョーザ',
    sourceUrl: SOURCE,
    method: '公式の店舗一覧から全店舗ページを取得し、各ページの【お子様連れのお客様へ】欄にある定型文（キッズチェア・お子様用の食器／離乳食の持ち込み）の有無を店舗ごとに集計',
    total: stores.length,
    note: [
      `【お子様連れのお客様へ】の定型文が無い店舗 ${noBlock} 件（該当なしとして集計）。見出しが無く定型文だけ載る店舗もあるため、店舗詳細の表の全幅行を読んだ`,
      `「ミルク用のお湯をご用意しております」は ${milk} 店に記載（対応する設備キーが無いため集計表には入れない）`,
      '「キッズチェア、お子様用の食器」は1文なので、キッズチェアと子供用カトラリーの両方に同じ店舗数が入る',
      '「駐車場」欄は自由記述（有料・提携・近隣等が混在）のため数えない',
      closed.length ? `閉店表示で除外: ${closed.join('、')}` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
