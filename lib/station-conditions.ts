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

export type StationConditionSlug =
  | 'rainy'
  | 'private-room'
  | 'baby'
  | 'indie'
  // v2: チェーン系SEOロングテール拡張（ファミレス/回転寿司/焼肉/キッズメニュー）
  | 'famiresu'
  | 'kaitenzushi'
  | 'yakiniku'
  | 'kids-menu'
  // v3: スポット系SEO拡張（駅×遊び場/公園/雨の日）。レストランデータではなく SPOTS を表示
  | 'asobiba'
  | 'kouen'
  | 'ame-asobiba';

/**
 * 条件の種別。restaurant 系はチェーン店/個人店データ、spot 系は SPOTS を表示する。
 */
export type ConditionKind = 'restaurant' | 'spot';

export function getConditionKind(slug: StationConditionSlug): ConditionKind {
  return slug === 'asobiba' || slug === 'kouen' || slug === 'ame-asobiba'
    ? 'spot'
    : 'restaurant';
}

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
  {
    slug: 'famiresu',
    label: 'ファミレス',
    titlePart: 'ファミレスで気軽に',
    metaPart: 'ファミレス（サイゼ・ガスト・ジョナサン等）で子連れランチ',
    description:
      'サイゼリヤ・ガスト・ジョナサン・デニーズ・ロイヤルホスト・ココス・バーミヤンなど、子連れ定番のファミレスだけを抽出。キッズメニュー・ベビーチェア・ボックス席が揃い、ベビーカーでも入りやすい店舗を集めました。',
    tagline: 'キッズメニュー・ベビーチェア完備の子連れ定番ファミレス',
  },
  {
    slug: 'kaitenzushi',
    label: '回転寿司・お寿司',
    titlePart: '回転寿司・お寿司',
    metaPart: '回転寿司（スシロー・くら寿司・はま寿司等）で子連れOK',
    description:
      'スシロー・くら寿司・はま寿司などの回転寿司チェーンと、子連れで使える寿司店を抽出。タッチパネル注文・ボックス席・アレルゲン表示が揃い、子どもが飽きにくいのも回転寿司の魅力です。',
    tagline: 'タッチパネル注文・ボックス席で子どもが飽きにくい',
  },
  {
    slug: 'yakiniku',
    label: '焼肉・しゃぶしゃぶ',
    titlePart: '焼肉・しゃぶしゃぶ',
    metaPart: '焼肉・しゃぶしゃぶ（牛角・しゃぶ葉等）で子連れOK',
    description:
      '牛角・しゃぶ葉などの焼肉・しゃぶしゃぶチェーンと、子連れで使える焼肉店を抽出。個室・座敷ありの店舗が中心で、取り分けやすく特別な日の家族の食事に向いています。',
    tagline: '個室・座敷ありで取り分けやすい焼肉・しゃぶしゃぶ',
  },
  {
    slug: 'kids-menu',
    label: 'キッズメニューあり',
    titlePart: 'キッズメニューあり',
    metaPart: 'キッズメニュー・お子様セットがある子連れ歓迎店',
    description:
      'お子様プレート・キッズセットなど、子ども向けメニューが用意されている店舗だけを抽出。注文に迷わず、子どもの食べる量と好みに合わせやすい、子連れ歓迎の店を集めました。',
    tagline: 'お子様プレート・キッズセットが用意された店',
  },
  // ===== v3: スポット系（駅×遊び場/公園/雨の日） =====
  {
    slug: 'asobiba',
    label: '子連れ遊び場',
    titlePart: '子連れで行ける遊び場',
    metaPart: '室内遊び場・キッズスペース・遊園地・水族館・動物園',
    description:
      '室内遊び場・キッズパーク・動物園・水族館・科学館など、子連れで楽しめる定番スポットを駅周辺で厳選。雨の日でも遊べる屋内施設、ベビーカーで入れる施設、入園料目安まで掲載しています。',
    tagline: '室内遊び場・キッズパーク・動物園・水族館・科学館を網羅',
  },
  {
    slug: 'kouen',
    label: '公園・大型遊具',
    titlePart: '公園・大型遊具',
    metaPart: '大型遊具・じゃぶじゃぶ池・ふわふわドームのある公園',
    description:
      '駅周辺の子連れで楽しめる公園を厳選。大型滑り台・ふわふわドーム・アスレチック・じゃぶじゃぶ池など、子どもが思いきり遊べる遊具のある公園を中心に紹介します。',
    tagline: '大型滑り台・ふわふわドーム・水遊びができる公園',
  },
  {
    slug: 'ame-asobiba',
    label: '雨の日の遊び場',
    titlePart: '雨の日でも遊べる屋内施設',
    metaPart: '雨の日・梅雨・台風でも子連れで遊べる屋内施設',
    description:
      '雨の日・梅雨・台風・真夏の暑い日でも子連れで遊べる屋内施設を駅周辺で厳選。室内遊び場・水族館・科学館・博物館など、天気に左右されずに過ごせるスポットを集めました。',
    tagline: '雨でも・暑くても・寒くても遊べる屋内スポット',
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
 * ファミレス判定用のチェーンslug集合。
 * category だけだと サイゼ(italian)・バーミヤン(chinese) を取りこぼすため明示。
 */
const FAMIRESU_SLUGS = new Set([
  'saizeriya',
  'gusto',
  'jonathan',
  'denny-s',
  'royal-host',
  'cocos',
  'bamiyan',
]);

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
    case 'famiresu':
      return chains.filter(
        (c) => c.category === 'family-restaurant' || FAMIRESU_SLUGS.has(c.slug),
      );
    case 'kaitenzushi':
      return chains.filter((c) => c.category === 'sushi');
    case 'yakiniku':
      return chains.filter((c) => c.category === 'yakiniku');
    case 'kids-menu':
      return chains.filter((c) => c.kidsMenu === true);
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
    case 'famiresu':
      // ファミレスは本質的にチェーン業態。個人店は対象外。
      return [];
    case 'kaitenzushi':
      // 寿司・海鮮ジャンルの個人店もお寿司の選択肢として併載。
      return indies.filter((r) => r.genre === 'sushi');
    case 'yakiniku':
      // 焼肉・韓国（サムギョプサル等）の個人店を併載。
      return indies.filter((r) => r.genre === 'yakiniku' || r.genre === 'korean');
    case 'kids-menu':
      return indies.filter((r) => r.kidsMenu === true);
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
