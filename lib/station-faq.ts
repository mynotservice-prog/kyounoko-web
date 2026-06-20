/**
 * 駅×条件ページの「実データから計算するページ固有FAQ」ヘルパー。
 *
 * 目的: 駅×条件ページ（特に該当3件前後の境界ページ）は filtered view のため
 * 固有プローズが乏しい。該当店舗/スポットの実データだけから Q&A を組み立てることで、
 *   - ページ固有の実質コンテンツ（実在する店名・件数・設備内訳のみ。捏造ゼロ）
 *   - AEO（ChatGPT/Perplexity 等の AI 検索）が抽出しやすい明示的な Q&A
 *   - FAQPage 構造化データの素材
 * を同時に得る。該当が無い設問は出さない（空の一般論で薄めない）。
 *
 * 注意: ここで返す answer は plain text（markdown 記号なし）。FAQPage JSON-LD に
 * そのまま使えるよう、Google の無効判定を避ける（question>=5字 / answer>=20字）。
 */
import type { Chain } from './station-restaurants';
import type { IndieRestaurant } from './indie-restaurants';
import type { Spot } from './spots';

export type FaqItem = { question: string; answer: string };

/** 店名リストを自然な日本語列挙にする。max超過分は「ほかN店」に丸める。 */
function listNames(names: string[], max = 6): string {
  const uniq = Array.from(new Set(names));
  const shown = uniq.slice(0, max);
  const rest = uniq.length - shown.length;
  return rest > 0 ? `${shown.join('・')}ほか${rest}店` : shown.join('・');
}

/** ランチ価格帯の代表バンドを集計（insight と整合）。 */
function priceBand(values: (string | undefined)[]): string | null {
  const nums = values
    .map((s) => (s ? Number(s.replace(/[^\d]/g, '')) : NaN))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const fmt = (n: number) => n.toLocaleString('ja-JP');
  const min = nums[0];
  const max = nums[nums.length - 1];
  return min === max ? `〜${fmt(max)}円台が中心` : `${fmt(min)}〜${fmt(max)}円台`;
}

/**
 * レストラン系（駅×条件）のページ固有FAQを生成する。
 * 該当チェーン店＋個人店の実データのみから、最大6問を組む。
 */
export function buildRestaurantFaq(
  stationName: string,
  conditionLabel: string,
  chains: Chain[],
  indies: IndieRestaurant[],
): FaqItem[] {
  const total = chains.length + indies.length;
  if (total === 0) return [];

  const faq: FaqItem[] = [];
  const allNames = [...chains.map((c) => c.name), ...indies.map((i) => i.name)];

  // 1) 件数（常に出す）
  const price = priceBand([...chains.map((c) => c.lunchPrice), ...indies.map((i) => i.priceLunch)]);
  faq.push({
    question: `${stationName}駅で「${conditionLabel}」に合う子連れOKランチ・カフェは何件ありますか？`,
    answer:
      `現在${total}店を掲載しています（チェーン${chains.length}店・個人店${indies.length}店）。` +
      `具体的には${listNames(allNames, 6)}です。` +
      (price ? `ランチの価格帯は${price}です。` : ''),
  });

  // 2) ベビーカーで入りやすい
  const strollerNames = [
    ...chains.filter((c) => c.stroller === 'good').map((c) => c.name),
    ...indies.filter((i) => i.strollerOk).map((i) => i.name),
  ];
  if (strollerNames.length > 0) {
    faq.push({
      question: 'ベビーカーのまま入りやすい店はありますか？',
      answer:
        `${listNames(strollerNames)}がベビーカーで入りやすい店です。` +
        '混雑する時間帯を避けると、より落ち着いて利用できます。',
    });
  }

  // 3) キッズメニュー
  const kidsMenuNames = [
    ...chains.filter((c) => c.kidsMenu).map((c) => c.name),
    ...indies.filter((i) => i.kidsMenu).map((i) => i.name),
  ];
  if (kidsMenuNames.length > 0) {
    faq.push({
      question: '子ども向けのキッズメニューがある店は？',
      answer: `${listNames(kidsMenuNames)}にキッズメニューの用意があります。内容や価格は時期により変わるため、来店前に各店の最新メニューもご確認ください。`,
    });
  }

  // 4) 個室・仕切り席
  const privateNames = [
    ...chains.filter((c) => c.privateRoom).map((c) => c.name),
    ...indies.filter((i) => i.privateRoom).map((i) => i.name),
  ];
  if (privateNames.length > 0) {
    faq.push({
      question: '個室や仕切り席など、落ち着いて食べられる店は？',
      answer: `${listNames(privateNames)}に個室・仕切り席（座敷を含む）があります。子どもがぐずっても周りを気にしにくく、子連れ利用に向いています。`,
    });
  }

  // 5) キッズチェア
  const chairNames = [
    ...chains.filter((c) => c.babyChair).map((c) => c.name),
    ...indies.filter((i) => i.kidsChair).map((i) => i.name),
  ];
  if (chairNames.length > 0) {
    faq.push({
      question: '子ども用の椅子（キッズチェア）が置いてある店は？',
      answer: `${listNames(chairNames)}に子ども用の椅子があります。台数に限りがある場合もあるため、混雑時は早めの来店がおすすめです。`,
    });
  }

  // 6) 離乳食持ち込み
  const babyFoodNames = [
    ...chains.filter((c) => c.babyFoodOk || c.bringBabyFood).map((c) => c.name),
    ...indies.filter((i) => i.bringBabyFood).map((i) => i.name),
  ];
  if (babyFoodNames.length > 0) {
    faq.push({
      question: '離乳食の持ち込みができる店は？',
      answer: `${listNames(babyFoodNames)}は離乳食の持ち込みに対応しています。月齢に合わせた食事を持参すれば、まだ取り分けが難しい時期でも安心です。`,
    });
  }

  return faq.slice(0, 6);
}

/**
 * スポット系（駅×条件）のページ固有FAQを生成する。
 * 該当スポットの実データ（施設設備）のみから、最大5問を組む。
 */
export function buildSpotFaq(
  stationName: string,
  conditionLabel: string,
  spots: Spot[],
): FaqItem[] {
  if (spots.length === 0) return [];

  const faq: FaqItem[] = [];
  const names = spots.map((s) => s.name);
  const yes = (key: keyof NonNullable<Spot['facilities']>) =>
    spots.filter((s) => s.facilities?.[key] === 'yes').map((s) => s.name);

  // 1) 件数＋スポット名（常に出す）
  faq.push({
    question: `${stationName}駅周辺で「${conditionLabel}」に使える子連れスポットは何件ありますか？`,
    answer: `現在${spots.length}件を掲載しています。具体的には${listNames(names)}です。各スポットの対象年齢や設備はカードに掲載しています。`,
  });

  // 2) おむつ替え台
  const diaper = yes('diaperChange');
  if (diaper.length > 0) {
    faq.push({
      question: 'おむつ替え台がある施設はありますか？',
      answer: `${listNames(diaper)}におむつ替え台があります。乳児連れでも立ち寄りやすい施設です。`,
    });
  }

  // 3) 授乳室
  const nursing = yes('nursingRoom');
  if (nursing.length > 0) {
    faq.push({
      question: '授乳室がある施設は？',
      answer: `${listNames(nursing)}に授乳室・授乳スペースがあります。ミルクや授乳のタイミングが読めない時期でも安心して過ごせます。`,
    });
  }

  // 4) キッズスペース
  const kidsSpace = yes('kidsSpace');
  if (kidsSpace.length > 0) {
    faq.push({
      question: '子どもが体を動かせるキッズスペースがある施設は？',
      answer: `${listNames(kidsSpace)}に子ども向けのキッズスペースがあります。天候を気にせず遊ばせたいときに向いています。`,
    });
  }

  // 5) ベビーカー貸出
  const rental = yes('strollerRental');
  if (rental.length > 0) {
    faq.push({
      question: 'ベビーカーの貸し出しがある施設は？',
      answer: `${listNames(rental)}でベビーカーの貸し出しがあります。施設が広く歩く距離が長い日でも助かります。`,
    });
  }

  return faq.slice(0, 5);
}

/** FaqItem[] を FAQPage JSON-LD に変換する。Google 仕様の最低長を満たすもののみ。 */
export function faqToJsonLd(items: FaqItem[]): object | null {
  const valid = items.filter((q) => q.question.length >= 5 && q.answer.length >= 20);
  if (valid.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}
