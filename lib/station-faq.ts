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
import { getVerifiedStores } from './station-verified-stores';
import { evidenceStoresAt, type EvidenceNeed } from './station-evidence';
import type { ConditionStores, OtherStore } from './station-cond-stores';

export type FaqItem = { question: string; answer: string };

/** 店名リストを自然な日本語列挙にする。max超過分は「ほかN店」に丸める。 */
function listNames(names: string[], max = 6): string {
  const uniq = Array.from(new Set(names));
  const shown = uniq.slice(0, max);
  const rest = uniq.length - shown.length;
  return rest > 0 ? `${shown.join('・')}ほか${rest}店` : shown.join('・');
}

/**
 * レストラン系（駅・駅×条件）のページ固有FAQを生成する。
 *
 * 2026-10-28（Phase 0）: 設備の設問は lib/station-evidence.ts の根拠（店の公式店舗検索の表示・
 * チェーン公式の全店向けの記載）がある店だけで答える。以前は Chain 型の手入力の値（kidsMenu・babyChair・
 * privateRoom・babyFoodOk・stroller）で「〜があります」と答えていたが、出典が無かった。
 * ベビーカーの設問と価格帯は根拠が無いので出さない。個人店の個室はホットペッパーの店の掲載情報。
 */
export function buildRestaurantFaq(
  stationSlug: string,
  stationName: string,
  conditionLabel: string,
  chains: Chain[],
  indies: IndieRestaurant[],
): FaqItem[] {
  const verified = getVerifiedStores(stationSlug);
  const shown = new Set(chains.map((c) => c.slug));
  const chainStoreCount = verified
    ? verified.stores.filter((s) => shown.has(s.chain)).length +
      Object.entries(verified.more ?? {}).reduce((n, [c, k]) => n + (shown.has(c) ? k : 0), 0)
    : 0;
  const total = (verified ? chainStoreCount : chains.length) + indies.length;
  if (total === 0) return [];
  const faq: FaqItem[] = [];
  const chainRefs = chains.map((c) => ({ slug: c.slug, name: c.name }));

  // 1) 件数（常に出す）
  faq.push({
    question: `${stationName}駅で「${conditionLabel}」に合う子連れOKランチ・カフェは何件ありますか？`,
    answer: verified
      ? `各チェーンの公式店舗検索で駅からおよそ800m以内に実在を確認したチェーン店${chainStoreCount}店` +
        (indies.length > 0 ? `と、ホットペッパーグルメでお子様連れOKと掲載されている個人店${indies.length}店` : '') +
        `を載せています（確認日 ${verified.verifiedAt}）。営業状況は行く前に各店の公式ページでご確認ください。`
      : `チェーン${chains.length}ブランド` +
        (indies.length > 0 ? `・個人店${indies.length}店` : '') +
        'を載せています。この駅のチェーン店は公式の店舗検索での実在確認がまだのため、行く前に各チェーンの公式店舗検索でご確認ください。',
  });

  const ask = (need: EvidenceNeed, question: string, tail: string, extraIndies: string[] = []) => {
    const { stores, moreCount } = evidenceStoresAt(stationSlug, need, chainRefs);
    const names = [...stores.map((s) => s.name), ...extraIndies];
    if (names.length === 0) return;
    const bySource = stores.some((s) => s.source === 'store') && stores.some((s) => s.source === 'brand')
      ? '各店の公式店舗検索の表示、またはチェーン公式の全店向けの記載'
      : stores.some((s) => s.source === 'store')
        ? '各店の公式店舗検索の表示'
        : stores.length > 0
          ? 'チェーン公式の全店向けの記載'
          : '';
    faq.push({
      question,
      answer:
        `${listNames(names)}${moreCount > 0 ? `（ほか同じチェーンの${moreCount}店）` : ''}です。` +
        (bySource ? `${bySource}にもとづきます。` : '') +
        (extraIndies.length > 0 ? '個人店はホットペッパーグルメの店の掲載情報です。' : '') +
        tail,
    });
  };
  ask('kidsMenu', '公式にキッズメニューの表示・記載がある店は？', '内容や価格は時期で変わるため、来店前に最新のメニューをご確認ください。');
  ask(
    'privateRoom',
    '個室や座敷がある店は？',
    '席数に限りがあるので、混む時間は予約・事前の確認がおすすめです。',
    indies.filter((i) => i.privateRoom).map((i) => i.name),
  );
  ask('babyChair', '子ども用の椅子が公式に案内されている店は？', '台数に限りがある場合があります。');
  ask('diaper', 'おむつ替え台が公式に案内されている店は？', '店内か、入っている建物の設備かは店によって違います。');
  ask('babyFood', '離乳食の持ち込みが公式に案内されている店は？', '持ち込みの条件は各チェーンの公式案内をご確認ください。');
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

/**
 * 店単位で作り直した駅×条件ページ（lib/station-cond-stores.ts）のFAQ（2026-10-28・Phase 2）。
 * 数えた店と根拠の段だけから組む。0店のときも「確かめられた店は無い」と答える（作らない）。
 */
export function buildConditionStoresFaq(
  stationName: string,
  conditionLabel: string,
  cs: ConditionStores,
  others?: { stores: OtherStore[]; total: number },
): FaqItem[] {
  const faq: FaqItem[] = [];
  const near = cs.stores.filter((s) => s.band !== '少し歩く');
  const far = cs.stores.filter((s) => s.band === '少し歩く');
  faq.push({
    question: `${stationName}駅の近くで「${conditionLabel}」に当てはまる子連れOKの店は何店ありますか？`,
    answer:
      cs.within1000 === 0
        ? `駅から直線1km以内で、${conditionLabel}に当てはまると公式の店舗検索・チェーン公式・ホットペッパーの店の掲載で確かめられた店はありませんでした。` +
          (others && others.total > 0
            ? `${conditionLabel}以外では、${listNames(others.stores.slice(0, 4).map((o) => o.name), 4)}など${others.total}店を駅から直線1km以内で公式に確認しています。`
            : '近くの駅や、同じ駅のほかの条件のページもご覧ください。')
        : `駅から直線1km以内に${cs.within1000}店あります（うち800m以内が${cs.within800}店）。チェーン店は公式の店舗検索で実在を確認した店、個人店はホットペッパーグルメでお子様連れ歓迎と掲載されている店です。`,
  });
  if (near.length > 0) {
    faq.push({
      question: `${stationName}駅から歩いて行きやすい店は？`,
      answer: `直線800m以内（大人の足で徒歩10分前後）なら${listNames(near.map((s) => s.name))}です。営業状況は行く前に各店のページでご確認ください。`,
    });
  }
  if (far.length > 0) {
    faq.push({
      question: '少し歩いてもよければ、ほかにどんな店がありますか？',
      answer: `直線800m〜1km（子連れだと15〜20分ほど）に${listNames(far.map((s) => s.name))}があります。線路や大きな道路の向こう側は、道のりが長くなることがあります。`,
    });
  }
  return faq;
}
