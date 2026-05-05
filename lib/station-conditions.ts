/**
 * 駅×条件のロングテールページ用 定義・フィルタロジック。
 *
 * 各駅ページ（/station/[slug]）に対して、4種類の条件（雨の日/個室/赤ちゃん/個人店のみ）で
 * 絞り込んだサブページ（/station/[slug]/[condition]）を生成するためのデータ。
 *
 * 各条件ごとに該当店舗が0件の駅は generateStaticParams から除外される想定。
 */

import type { Chain } from './station-restaurants';
import type { IndieRestaurant } from './indie-restaurants';

export type StationConditionSlug = 'rainy' | 'private-room' | 'baby' | 'indie';

export type StationCondition = {
  /** URL slug（/station/[slug]/[condition]） */
  slug: StationConditionSlug;
  /** UIラベル（短い） */
  label: string;
  /** タイトル中央部に挿入する文言 */
  titlePart: string;
  /** メタ description 用の見出し */
  metaPart: string;
  /** ページ lead 用の説明（〜120字） */
  description: string;
  /** リード下のサブテキスト（〜60字） */
  tagline: string;
};

export const STATION_CONDITIONS: readonly StationCondition[] = [
  {
    slug: 'rainy',
    label: '雨の日',
    titlePart: '雨の日でも安心',
    metaPart: '雨の日・梅雨・台風でも子連れで使える屋内系',
    description:
      '屋内施設・モール直結・地下街アクセスの店を厳選。傘をさしたまま並ぶ必要のない、ベビーカーでも雨に濡れず移動しやすい店舗を集めました。',
    tagline: 'モール内・駅直結・地下街でアクセスできる店',
  },
  {
    slug: 'private-room',
    label: '個室・座敷',
    titlePart: '個室・座敷でゆったり',
    metaPart: '個室・座敷・仕切り席ありで子連れ歓迎',
    description:
      '個室・座敷・仕切り席ありの店舗だけを抽出。子どもの声や食べこぼしを気にせず、ベビーカーや荷物も置きやすい空間でランチを楽しめます。',
    tagline: '周りを気にせず食事できる仕切り席・個室の店',
  },
  {
    slug: 'baby',
    label: '0-1歳・赤ちゃん連れ',
    titlePart: '0-1歳の赤ちゃん連れOK',
    metaPart: '0-1歳・赤ちゃん連れOK・離乳食持込可',
    description:
      'キッズチェア・離乳食持込OK・ベビーカー入店◎の条件を満たす、赤ちゃん連れに特化した店舗のみを掲載。授乳・おむつ替えで席を立ちやすいレイアウトの店も中心に厳選しました。',
    tagline: 'キッズチェア・離乳食持込・ベビーカー◎が揃う店',
  },
  {
    slug: 'indie',
    label: '個人店・話題店',
    titlePart: '個人店・話題店だけ',
    metaPart: 'チェーン以外の個人店・話題店',
    description:
      'チェーン店を除外し、雑誌・SNSで話題の個人店・実力店だけを掲載。ご当地ならではの一軒で、家族の食事をワンランク豊かにしたい人向け。',
    tagline: 'チェーン以外、ご当地の実力店・人気店だけ',
  },
] as const;

const CONDITION_BY_SLUG = new Map<StationConditionSlug, StationCondition>(
  STATION_CONDITIONS.map((c) => [c.slug, c]),
);

export function getConditionBySlug(slug: string): StationCondition | undefined {
  return CONDITION_BY_SLUG.get(slug as StationConditionSlug);
}

/**
 * 「雨の日」条件で雨に強い店舗かを判定。
 *  - category が 'mall-food' は無条件で含む
 *  - description に「駅直結」「モール」「地下」「ビル」「館」が含まれていれば屋内系とみなす
 */
function isRainyChain(c: Chain): boolean {
  if (c.category === 'mall-food') return true;
  const desc = c.description ?? '';
  return /駅直結|モール|地下|館|ビル内|ショッピングセンター|フードコート/.test(desc);
}

/**
 * 個人店側の雨の日判定。
 *  - description の文字列マッチで屋内系を抽出
 */
function isRainyIndie(r: IndieRestaurant): boolean {
  const desc = r.description ?? '';
  const area = r.area ?? '';
  return /駅直結|モール|地下|館|ビル内|ショッピングセンター|フードコート|アトレ|ルミネ|エキュート|デパ地下|百貨店/.test(
    desc + area,
  );
}

/**
 * チェーン店を条件でフィルタ。
 * 'indie' 条件はチェーンを全除外する（=空配列）。
 */
export function filterChainsByCondition(
  chains: readonly Chain[],
  condition: StationConditionSlug,
): Chain[] {
  switch (condition) {
    case 'rainy':
      return chains.filter(isRainyChain);
    case 'private-room':
      return chains.filter((c) => c.privateRoom === true);
    case 'baby':
      return chains.filter(
        (c) =>
          (c.babyChair === true && c.babyFoodOk === true) || c.stroller === 'good',
      );
    case 'indie':
      return [];
    default:
      return [];
  }
}

/**
 * 個人店を条件でフィルタ。
 * 'indie' 条件は個人店を全件返す。
 */
export function filterIndiesByCondition(
  indies: readonly IndieRestaurant[],
  condition: StationConditionSlug,
): IndieRestaurant[] {
  switch (condition) {
    case 'rainy':
      return indies.filter(isRainyIndie);
    case 'private-room':
      return indies.filter((r) => r.privateRoom === true);
    case 'baby':
      return indies.filter((r) => r.strollerOk === true);
    case 'indie':
      return [...indies];
    default:
      return [];
  }
}

/**
 * 駅×条件のページが「該当店舗を持つか」を判定。
 * generateStaticParams から 0 件の組み合わせを除外する用途。
 */
export function hasMatchingItems(
  chains: readonly Chain[],
  indies: readonly IndieRestaurant[],
  condition: StationConditionSlug,
): boolean {
  const c = filterChainsByCondition(chains, condition);
  const i = filterIndiesByCondition(indies, condition);
  return c.length + i.length > 0;
}
