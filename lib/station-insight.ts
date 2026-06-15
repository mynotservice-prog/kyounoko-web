/**
 * 駅×条件ページの「実データから計算する固有コンテンツ」ヘルパー。
 *
 * 目的: 駅×条件ページは店舗/スポットを条件で絞った “filtered view” で、
 * 条件違いのページ間で対象が重複し固有プローズが乏しい（＝AdSense「有用性の低い
 * コンテンツ」判定の一因）。そこで
 *   ① 駅・エリアの導入文（駅の実データから生成）
 *   ② 該当セットから集計したインサイト（駅×条件ごとに必ず異なる）
 * を生成し、各ページに「捏造でない・ページ固有の」実質を与える。
 */
import type { Chain } from './station-restaurants';
import type { IndieRestaurant } from './indie-restaurants';
import type { Spot } from './spots';

type Scale = 'terminal' | 'major' | 'minor';

const SCALE_LABEL: Record<Scale, string> = {
  terminal: 'ターミナル駅',
  major: '主要駅',
  minor: '駅',
};

/**
 * 駅の実データ（区名・路線・規模・ファミリー度）から、子連れ目線の導入文を1〜2文生成する。
 * 同一駅の条件ページ間では共通になるが、駅ごとには必ず異なる実在情報。
 */
export function buildStationIntro(args: {
  stationName: string;
  wardName: string;
  lines: string[];
  scale: Scale;
  familyFriendly?: boolean;
}): string {
  const { stationName, wardName, lines, scale, familyFriendly } = args;
  const scaleLabel = SCALE_LABEL[scale];
  const wardPart = wardName ? `${wardName}の` : '';

  const lineText =
    lines.length === 0
      ? ''
      : lines.length <= 2
        ? `${lines.join('・')}が乗り入れ、`
        : `${lines.slice(0, 2).join('・')}など${lines.length}路線が乗り入れ、`;

  let context: string;
  if (familyFriendly === true) {
    context = '公園やスーパー帰りにも立ち寄りやすい、子育て世帯になじみのあるエリアです';
  } else if (familyFriendly === false) {
    context = '繁華街・オフィス街が中心のため、子連れは入りやすい店をあらかじめ決めておくと安心です';
  } else if (scale === 'minor') {
    context = '落ち着いた雰囲気で、ベビーカーでもゆっくり過ごしやすいエリアです';
  } else {
    context = '人の行き来が多いので、ベビーカーなら混雑を避けた時間帯がおすすめです';
  }

  return `${stationName}駅は${wardPart}${scaleLabel}。${lineText}${context}。`;
}

export type InsightStat = { label: string; count: number };
export type Insight = {
  total: number;
  stats: InsightStat[];
  priceText: string | null;
};

/** 価格帯バンド文字列（'〜1,500' '4,000〜' '〜2,000円' 等）から代表値（円）を取り出す。 */
function parsePriceBand(s: string | undefined): number | null {
  if (!s) return null;
  const digits = s.replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function priceRangeText(values: number[]): string | null {
  const nums = values.filter((n) => n > 0).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const min = nums[0];
  const max = nums[nums.length - 1];
  const fmt = (n: number) => n.toLocaleString('ja-JP');
  if (min === max) return `ランチは〜${fmt(max)}円台が中心`;
  return `ランチは${fmt(min)}〜${fmt(max)}円台`;
}

/**
 * 該当レストラン（チェーン＋個人店）の設備内訳を集計する。
 * 駅×条件ごとに必ず異なる、データ由来の固有サマリーになる。
 */
export function buildRestaurantInsight(chains: Chain[], indies: IndieRestaurant[]): Insight {
  const total = chains.length + indies.length;
  const count = (cPred: (c: Chain) => boolean, iPred: (i: IndieRestaurant) => boolean) =>
    chains.filter(cPred).length + indies.filter(iPred).length;

  const raw: InsightStat[] = [
    {
      label: 'ベビーカーで入りやすい',
      count: count((c) => c.stroller === 'good', (i) => !!i.strollerOk),
    },
    { label: 'キッズチェアあり', count: count((c) => !!c.babyChair, (i) => !!i.kidsChair) },
    { label: 'キッズメニューあり', count: count((c) => !!c.kidsMenu, (i) => !!i.kidsMenu) },
    { label: '個室・仕切り席あり', count: count((c) => !!c.privateRoom, (i) => !!i.privateRoom) },
    {
      label: '離乳食持込OK',
      count: count((c) => !!c.babyFoodOk || !!c.bringBabyFood, (i) => !!i.bringBabyFood),
    },
    {
      label: 'おむつ替え台あり',
      count: count((c) => !!c.diaperChangingTable, (i) => !!i.diaperChangingTable),
    },
    { label: '授乳室あり', count: count((c) => !!c.nursingRoom, (i) => !!i.nursingRoom) },
  ];

  const stats = raw.filter((s) => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
  const prices = [
    ...chains.map((c) => parsePriceBand(c.lunchPrice)),
    ...indies.map((i) => parsePriceBand(i.priceLunch)),
  ].filter((n): n is number => n != null);

  return { total, stats, priceText: priceRangeText(prices) };
}

/** 該当スポットの設備内訳を集計する。 */
export function buildSpotInsight(spots: Spot[]): Insight {
  const total = spots.length;
  const yes = (key: keyof NonNullable<Spot['facilities']>) =>
    spots.filter((s) => s.facilities?.[key] === 'yes').length;

  const raw: InsightStat[] = [
    { label: 'おむつ替え台あり', count: yes('diaperChange') },
    { label: '授乳室あり', count: yes('nursingRoom') },
    { label: 'キッズスペースあり', count: yes('kidsSpace') },
    { label: 'ベビーカー貸出あり', count: yes('strollerRental') },
    { label: '多目的トイレあり', count: yes('bathroom') },
  ];

  const stats = raw.filter((s) => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
  return { total, stats, priceText: null };
}

/**
 * Insight を1文の日本語サマリーに変換する（該当0件や内訳なしも安全に処理）。
 * @param unit カウントの単位（レストランは '店'、スポットは '件'）
 */
export function insightToSentence(insight: Insight, conditionLabel: string, unit = '店'): string {
  const { total, stats, priceText } = insight;
  if (total === 0) return '';
  const head = `「${conditionLabel}」の該当は${total}${unit}`;
  const breakdown =
    stats.length > 0
      ? `。内訳は${stats.map((s) => `${s.label}が${s.count}${unit}`).join('・')}`
      : '';
  const price = priceText ? `。${priceText}です` : '。';
  return `${head}${breakdown}${price}`;
}
