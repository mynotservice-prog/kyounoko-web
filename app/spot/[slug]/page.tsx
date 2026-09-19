import '@/app/styles/spot-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { SpotSeasonBox } from '@/components/spot/SpotSeasonBox';
import { SEASON_ACTIVITY_LABEL, getSeasonState } from '@/lib/spot-season';
import { KkFacilityGrid, type KkFacilityItem } from '@/components/kk/KkFacilityGrid';
import { KkInfoTable, type KkInfoRow } from '@/components/kk/KkInfoTable';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { PLAYGROUND_FEATURE_LABEL } from '@/components/spot/spot-labels';
import {
  getAllSpotsWithSlug,
  getSpotBySlug,
  isSpotIndexable,
  SPOT_CATEGORY_LABEL,
} from '@/lib/spots';
import type { Spot } from '@/lib/spots';
import { getRuntimeSpotOverrides } from '@/lib/spot-overrides';
import { findStationBySlug } from '@/lib/all-stations';
import { SPOT_CLOSED } from '@/lib/spot-closed';
import { getSpotFreshness, freshnessLabel } from '@/lib/spot-verification';
import { getAllFileArticles } from '@/lib/articles';
import { buildSpotJsonLd, buildFaqJsonLd, isReviewEligibleType } from '@/lib/spot-schema';
import {
  buildEnjoyByAgeBlocks,
  buildCrowdAvoidanceText,
  buildAccessTipsText,
  buildPreVisitNotes,
  buildSpotFaqs,
} from '@/lib/spot-narratives';
import { spotToV2, articleToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { V2RememberSpot } from '@/components/v2/V2RememberSpot';
import { VisitedReport } from '@/components/spot/VisitedReport';
import { SpotMap } from '@/components/spot/SpotMap';
import { ReviewSection } from '@/components/spot/ReviewSection';
import { getRating, getUgcImage, getApprovedReviews } from '@/lib/reviews';
import { getPublishedSpotReports } from '@/lib/spot-reports';
import { V2SaveButton, V2SdHeroFav } from '@/components/v2/V2SaveButton';
import { getRecommendedItems } from '@/lib/recommended-items';
import { getRakutenProduct, keywordFromRakutenSearchUrl, priceBandLabel } from '@/lib/rakuten-products';
import { wrapMoshimoRakuten } from '@/lib/moshimo';
import { getSpotReservationOffer, getSpotTravelOffer } from '@/lib/reservation-cta';
import { ReservationCTA } from '@/components/article/ReservationCTA';
import { ShareBar } from '@/components/article/ShareBar';
import { getUpcomingEventsNear } from '@/lib/events';
import { UpcomingEventsNearby } from '@/components/event/UpcomingEventsNearby';
import { getVenueAnnualEvents } from '@/lib/annual-events';
import { VenueAnnualEvents } from '@/components/event/VenueAnnualEvents';
import { buildSpotDayPlan, resolveSpotStationSlug } from '@/lib/spot-day-plan';
import { EventDayPlanSection } from '@/components/event/EventDayPlanSection';
import { getAreaName } from '@/lib/area';
import { getTempClosure } from '@/lib/spot-temp-closed';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSpotsWithSlug()
    .filter((x) => isSpotIndexable(x.spot))
    .map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSpotBySlug(slug, await getRuntimeSpotOverrides());
  if (!entry) return { title: 'スポットが見つかりません' };
  const { spot } = entry;
  const category = SPOT_CATEGORY_LABEL[spot.category] ?? spot.category;
  const location = spot.ward ?? spot.city ?? '';
  // タイトル長の適応（2026-07-31）:
  // spot.name 自体にキャッチコピーが入っている登録が多く、そこへ固定の接尾辞
  // 「｜{区}の{カテゴリ}子連れガイド【設備・料金・口コミ】」を足すと 70字を超え、
  // 日本語SERPの表示幅（約30字）でほぼ全てが切り捨てられていた。
  // 例: 「舎人公園じゃぶじゃぶ池「浮球の池」｜子連れで行きやすい？水遊び・対象年齢・
  //      注意点まで解説｜足立区の公園子連れガイド【設備・料金・口コミ】」(約75字)
  // name が十分に説明的な場合は接尾辞を付けず、短い name のときだけ文脈を補う。
  const SPOT_TITLE_NAME_MAX = 24;
  // 2026-09-01 CTR取りこぼしの修正:
  //   スポット面は設備クエリ（「◯◯ 授乳室」「◯◯ ベビーカー」「◯◯ キッズスペース」）で
  //   pos5〜9に入っているのに、タイトルが「{区}の{カテゴリ}子連れガイド」という汎用テンプレで
  //   検索語を1語も含まず、クリックされていなかった。GSC 90日で
  //   **上位10位以内・imp25以上・CTR2%未満が63件／計3,180imp**（二子玉川ライズ335imp/0clk、
  //   GINZA SIX 241imp/0clk、アクアシティお台場173imp/0clk…）。
  //   そこで、その面が実際に持っている設備語をタイトルへ出す。
  //   出典は **spot.note（＝公開済みの meta description 本文）と facilities フラグ** に限る。
  //   note に書いていない設備をタイトルで主張しないこと（新しい事実主張を作らないため）。
  const facilityHints: [boolean, string][] = [
    [
      /授乳室|ベビールーム|ベビー休憩|赤ちゃん休憩/.test(spot.note ?? '') ||
        spot.facilities?.nursingRoom === 'yes',
      '授乳室',
    ],
    [
      /ベビーカー貸出|ベビーカーレンタル|ベビーカー貸し出し/.test(spot.note ?? '') ||
        spot.facilities?.strollerRental === 'yes',
      'ベビーカー貸出',
    ],
    [
      /キッズスペース|キッズコーナー|キッズエリア/.test(spot.note ?? '') ||
        spot.facilities?.kidsSpace === 'yes',
      'キッズスペース',
    ],
    [
      /おむつ替え|おむつ交換/.test(spot.note ?? '') || spot.facilities?.diaperChange === 'yes',
      'おむつ替え',
    ],
  ];
  // 公園の遊具情報（SPOT_PLAYGROUND）があるときは「遊具」を先頭に出す。
  // 「〇〇公園 遊具」は施設名クエリとして継続的に表示が出ている（2026-09-12 実測）。
  if (spot.playground) facilityHints.unshift([true, '遊具・アスレチック']);
  // 季節営業（SPOT_SEASON）があるときは、その活動名（ぶどう狩り・じゃぶじゃぶ池 等）を先頭に出す。
  // 「〇〇農園 ぶどう狩り」「〇〇公園 じゃぶじゃぶ池」は施設名クエリの主形（2026-09-18 実測: 舎人公園58,029表示）。
  // 年が古い会期（stale-year）は語彙にしない（今年もやっているか未確認のため）。
  const seasonWords = Array.from(
    new Set((spot.season ?? []).filter((w) => getSeasonState(w) !== 'stale-year').map((w) => SEASON_ACTIVITY_LABEL[w.activity])),
  );
  for (const w of seasonWords.reverse()) facilityHints.unshift([true, w]);
  // 検索需要の大きい順に最大3語。SERPの表示幅（約30字）に収めるため name が長い面では出さない。
  const facilityWords = facilityHints.filter(([hit]) => hit).map(([, w]) => w).slice(0, 3);
  const titleSuffix =
    spot.name.length >= SPOT_TITLE_NAME_MAX
      ? ''
      : facilityWords.length > 0
        ? `｜${facilityWords.join('・')}`
        : `｜${location}${location ? 'の' : ''}${category}子連れガイド`;
  const title = `${spot.name}${titleSuffix}`;
  const description =
    spot.note ??
    `${spot.name}は${location ? location + 'の' : ''}${category}。子連れで使いやすい設備・料金・アクセス情報をきょうのこ編集部が整理しました。`;
  // スポット名+カテゴリで動的OGP画像を生成（/api/og はタイトル文字列とカテゴリスラッグを受ける）。
  const dynamicOg = `/api/og?title=${encodeURIComponent(`${spot.name}｜${category}`)}`;
  const ogImages = [{ url: dynamicOg, width: 1200, height: 630 }];
  return {
    title,
    description,
    alternates: { canonical: `/spot/${slug}` },
    // 閉館スポットと中身の薄いスポットは noindex（不正確・低品質な情報を検索結果に残さない）。
    robots: SPOT_CLOSED[spot.name] || !isSpotIndexable(spot) ? { index: false } : INDEXABLE_ROBOTS,
    openGraph: {
      title,
      description,
      url: `https://kyounoko.jp/spot/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

const AGE_LABEL: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

/**
 * 本文を「文」の単位で段落に割る（§3-1 2.「文は改行して読みやすくする」）。
 * 文字は1文字も足さない/削らない。句点の位置で段落を切るだけ。
 * per = 1段落あたりの文数（2文で1段落＝リストに見えず、かつ壁にならない）。
 */
function toParagraphs(text: string, per = 2): string[] {
  // 「アソボ〜ノ！」のように施設名へ ！ を含む表記があるため、区切りは句点だけに限る。
  const sentences = text
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) out.push(sentences.slice(i, i + per).join(''));
  return out;
}

/** 子連れ設備の表示順（リニューアル2026-09: KkFacilityGrid）。文言は JSON-LD の amenityFeature と同じ。 */
const FACILITY_DEF: Array<{ key: keyof NonNullable<Spot['facilities']>; label: string; icon: KkIconName }> = [
  { key: 'nursingRoom', label: '授乳室', icon: 'nursing' },
  { key: 'diaperChange', label: 'おむつ替え台', icon: 'diaper' },
  { key: 'bathroom', label: '多目的トイレ', icon: 'accessible-toilet' },
  { key: 'strollerRental', label: 'ベビーカー貸出', icon: 'stroller' },
  { key: 'kidsSpace', label: 'キッズスペース', icon: 'kids-space' },
];

export default async function SpotPage({ params }: Props) {
  const { slug } = await params;
  const ovMap = await getRuntimeSpotOverrides();
  const entry = getSpotBySlug(slug, ovMap);
  if (!entry) notFound();
  const { spot } = entry;
  const category = SPOT_CATEGORY_LABEL[spot.category] ?? spot.category;
  const location = spot.ward ?? spot.city ?? '';

  // スポット種別に応じたネット予約/チケットCTA（VC）。env 未設定なら null（非表示）。
  const reservationOffer = getSpotReservationOffer(spot.category);

  // レジャースポット向け子連れ宿予約CTA（じゃらん/A8・park/restaurant除く）。env 未設定なら null。
  const travelOffer = getSpotTravelOffer(spot.category);

  // 閉館スポットの案内文（あれば閉館バナーを表示し noindex）。
  const closedNotice = SPOT_CLOSED[spot.name];

  // 改修等による一時休館（期間が明ければ自動で通常表示に戻る）。恒久閉館とは分けて出す。
  const tempClosure = getTempClosure(spot.name);

  // 情報の鮮度（最終確認日）。未確認なら「未確認」と正直に出す（推測日を出さない）。
  const freshness = getSpotFreshness(spot);
  const freshnessNote = freshnessLabel(freshness);

  // 最寄り駅 slug を日本語駅名へ解決（レジストリに無い場合は元の値をそのまま表示）。
  const nearestStationName = spot.nearestStation
    ? (findStationBySlug(spot.nearestStation)?.name
        ? `${findStationBySlug(spot.nearestStation)!.name}駅`
        : spot.nearestStation)
    : null;

  // 近隣スポット: 運営者が手動指定（nearbySlugs）していればそれを優先し、指定順で表示。
  // 未指定なら従来どおり同駅/同区から自動算出。
  const allWithSlug = getAllSpotsWithSlug(ovMap);
  const manualNearby = (spot.nearbySlugs ?? [])
    .map((ns) => allWithSlug.find((x) => x.slug === ns))
    .filter((x): x is (typeof allWithSlug)[number] => !!x && x.slug !== slug)
    .slice(0, 6);
  const nearbySpots = manualNearby.length > 0
    ? manualNearby
    : allWithSlug
        .filter((x) => {
          if (x.slug === slug) return false;
          if (!isSpotIndexable(x.spot)) return false;
          if (getTempClosure(x.spot.name)) return false; // 休館中は勧めない
          if (spot.nearestStation && x.spot.nearestStation === spot.nearestStation) return true;
          if (spot.ward && x.spot.ward === spot.ward) return true;
          return false;
        })
        .slice(0, 6);

  // この会場で毎年ひらかれるイベント。終了イベントを「毎年◯月ごろ」という未来向きの
  // 情報に変換して、永続資産であるこのページに畳み込む（過去アーカイブpage は作らない）。
  const venueAnnualEvents = getVenueAnnualEvents(spot.name, 4);
  const venueEventSlugs = new Set(venueAnnualEvents.map((e) => e.slug));

  // 近くで開催中・これからのイベント（会期切れは自動で消える鮮度部品）
  // 上の「この会場で毎年」に出したものは重複させない。
  const { events: nearEventsRaw, cityMatched: nearEventsCityMatched } = getUpcomingEventsNear(
    entry.area,
    spot.ward ?? spot.city,
    4,
  );
  const nearEvents = nearEventsRaw.filter((e) => !venueEventSlugs.has(e.slug)).slice(0, 3);
  const nearEventsTitle = nearEventsCityMatched
    ? `${spot.ward ?? spot.city}周辺で開催中・これからのイベント`
    : `${getAreaName(entry.area)}で開催中・これからのイベント`;

  // 関連記事: 手動指定（relatedArticleSlugs）を先頭に置き、残りを年齢帯マッチで補完
  const allArticles = getAllFileArticles().filter((a) => !a.noindex);
  const manualRelated = (spot.relatedArticleSlugs ?? [])
    .map((rs) => allArticles.find((a) => a.slug === rs))
    .filter((a): a is (typeof allArticles)[number] => !!a);
  const autoRelated = allArticles.filter((a) => {
    if (manualRelated.some((m) => m.slug === a.slug)) return false;
    const aAges = a.quickInfo?.ageRanges ?? [];
    return spot.ages.some((ageTag) => aAges.includes(ageTag));
  });
  const relatedArticles = [...manualRelated, ...autoRelated].slice(0, 6);

  const jsonLdPlace = buildSpotJsonLd(spot, slug);
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '子連れスポット', item: 'https://kyounoko.jp/spots' },
      { '@type': 'ListItem', position: 3, name: spot.name },
    ],
  };

  const enjoyByAgeBlocks = buildEnjoyByAgeBlocks(spot);
  // admin で本文を上書きしていればそれを優先、無ければ構造化データから自動生成。
  const crowdAvoidance = spot.crowdTips ?? buildCrowdAvoidanceText(spot);
  const accessTips = spot.accessTips ?? buildAccessTipsText(spot);
  const preVisitNotes = buildPreVisitNotes(spot);

  // FAQ: 施設固有の上書き（spot.faq）を先頭に、自動生成分を続ける。
  // 同じ質問文は手動側を優先して自動分を抑制する。
  // faqComplete のときは admin で編集した faq を完成版として扱い、自動生成FAQは足さない
  // （これにより admin での「FAQ削除」が確実に効く）。それ以外は従来どおり自動FAQを追記。
  const autoFaqs = buildSpotFaqs(spot);
  const manualQuestions = new Set((spot.faq ?? []).map((f) => f.q));
  const faqs = spot.faqComplete
    ? (spot.faq ?? [])
    : [...(spot.faq ?? []), ...autoFaqs.filter((f) => !manualQuestions.has(f.q))];
  const jsonLdFaq = buildFaqJsonLd(faqs);

  const v2Spot = spotToV2(spot);

  // 差し替え画像（最大3枚）。[0]=hero、[1]=中段、[2]=下段に分散表示。
  const galleryImages = (spot.images ?? (spot.image ? [spot.image] : [])).slice(0, 3);

  // §5-1 画像ポリシー：ヒーロー画像の種別を判定して「※イメージ」or 出典を表示。
  // - 種別が実写/提供/SV/UGC → 出典クレジット
  // - 種別=イメージ、または キュレーション画像が無い（＝カテゴリ自動画像）→ 「※イメージ」
  // - キュレーション画像はあるが種別未指定 → 断定を避け何も出さない
  const hasCuratedImage = !!(spot.images?.length || spot.image);
  const KIND_CREDIT: Record<string, string> = {
    実写: '実写', 提供: '提供画像', streetview: 'Googleストリートビュー', UGC: 'みんなの写真',
  };
  const heroImageNote: { image?: boolean; credit?: string } =
    spot.imageKind && spot.imageKind !== 'イメージ'
      ? { credit: spot.imageCredit ?? KIND_CREDIT[spot.imageKind] }
      : spot.imageKind === 'イメージ' || !hasCuratedImage
        ? { image: true }
        : {};

  // 公開済みの「行ったよ」レポート（MicroCMS未設定時は常に空配列）
  const visitorReports = await getPublishedSpotReports(slug);

  // Google のレビュー スニペットは Place / TouristAttraction を対象外にしているため、
  // 対応タイプ（LocalBusiness 系）のときだけ構造化データに載せる。付けてしまうと
  // 「項目『<parent_node>』のオブジェクト タイプが無効です」でページごとリッチリザルト対象外になる。
  // 口コミの表示自体は下の ReviewSection で従来どおり行うので、ユーザーに見える情報は減らない。
  const placeTypes = (jsonLdPlace as { '@type'?: string | string[] })['@type'];
  const reviewEligible = isReviewEligibleType(
    Array.isArray(placeTypes) ? placeTypes : placeTypes ? [placeTypes] : [],
  );

  // P1-8: 口コミ★平均（承認済みから集計）。件数>0かつ対応タイプなら構造化データにも反映。
  const reviewRating = await getRating(slug);
  if (reviewEligible && reviewRating.count > 0) {
    (jsonLdPlace as Record<string, unknown>).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewRating.avg,
      reviewCount: reviewRating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // P2-4: 承認済み口コミ個別をReviewスキーマとしても付与（AggregateRatingと併記でリッチリザルト強化）。
  // 直近10件までに絞ってJSON-LDの肥大化を避ける。
  const approvedReviews = await getApprovedReviews(slug);
  if (reviewEligible && approvedReviews.length > 0) {
    (jsonLdPlace as Record<string, unknown>).review = approvedReviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.nickname },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.body,
      datePublished: new Date(r.createdAt).toISOString(),
    }));
  }

  // P1-8b: 承認済みUGC写真が代表画像に昇格されていれば、ヒーローに使う（imageKind=UGC）。
  const ugc = await getUgcImage(slug);
  const heroImg = ugc?.url ?? v2Spot.img;
  const heroNote = ugc ? { image: false, credit: ugc.credit } : heroImageNote;

  // P1-4: おすすめアイテムを楽天商品API（RAKUTEN_APP_ID）で実商品に解決。
  // env未設定なら product=null で従来の検索リンクにフォールバック（もしも変換は共通適用）。
  const recommendedItems = getRecommendedItems(spot.category, spot.place, spot.ages, 6);
  const enrichedItems = await Promise.all(
    recommendedItems.map(async (item) => {
      const kw = keywordFromRakutenSearchUrl(item.url);
      const product = kw ? await getRakutenProduct(kw) : null;
      const href = wrapMoshimoRakuten(product?.url ?? item.url);
      return { item, product, href };
    }),
  );

  // ---- リニューアル2026-09: 表示用の派生データ（すべて既存データからのみ作る。捏造しない）----
  // 設備: 表示条件は従来どおり 'yes' が1つ以上あるとき。'yes'=あり / 'no'=なし / 未指定=出さない。
  const showFacilities = !!spot.facilities && FACILITY_DEF.some((f) => spot.facilities![f.key] === 'yes');
  const facilityItems: KkFacilityItem[] = showFacilities
    ? FACILITY_DEF.flatMap((f) => {
        const v = spot.facilities![f.key];
        return v === 'yes' || v === 'no' ? [{ icon: f.icon, label: f.label, status: v }] : [];
      })
    : [];
  const stationWalkLabel = nearestStationName
    ? `${nearestStationName}${spot.walkMinutes ? ` 徒歩${spot.walkMinutes}分` : ''}`
    : null;
  const budgetLabel =
    spot.budget === 'free' ? '無料'
      : spot.budget === 'low' ? '〜1,000円'
        : spot.budget === 'mid' ? '1,000〜3,000円'
          : spot.budget === 'high' ? '3,000円〜' : '—';
  const placeLabel = spot.place === 'indoor' ? '屋内' : spot.place === 'outdoor' ? '屋外' : '一部屋外';
  const rainLabel = spot.place === 'indoor' || spot.place === 'mixed' ? '◎ おすすめ' : '△';
  // 駐車場: lib/spot-parking.ts の構造化データを忠実に出す。'unknown'（公式で確認できていない）は出さない。
  const parking = spot.parking && spot.parking.exists !== 'unknown' ? spot.parking : null;
  const officialHost = (() => {
    if (!spot.officialUrl) return null;
    try {
      return new URL(spot.officialUrl).hostname.replace(/^www\./, '');
    } catch {
      return spot.officialUrl;
    }
  })();
  const infoRows: KkInfoRow[] = [
    { icon: 'age', label: '対象年齢', value: spot.ages.map((a) => AGE_LABEL[a]).join('・') },
    { icon: 'yen', label: '料金の目安', value: budgetLabel },
    { icon: 'home', label: '屋内/屋外', value: placeLabel },
    { icon: 'umbrella', label: '雨の日', value: rainLabel },
    ...(stationWalkLabel ? [{ icon: 'train' as const, label: '最寄り駅', value: stationWalkLabel }] : []),
    ...(parking
      ? [
          {
            icon: 'parking' as const,
            label: '駐車場',
            value: (
              <div className="sv3-parking">
                <div className="sv3-parking-main">
                  {parking.exists ? `あり${parking.capacity ? `（${parking.capacity}台）` : ''}` : 'なし'}
                </div>
                {parking.exists && parking.hours && <div>利用時間: {parking.hours}</div>}
                {parking.exists && parking.fee && <div>料金: {parking.fee}</div>}
                {parking.note && <div className="sv3-parking-note">{parking.note}</div>}
                <div className="sv3-parking-src">
                  {parking.confirmedAt}確認・
                  <a href={parking.sourceUrl} target="_blank" rel="noopener noreferrer">
                    出典
                  </a>
                </div>
              </div>
            ),
          },
        ]
      : []),
    ...(spot.officialUrl
      ? [
          {
            icon: 'link' as const,
            label: '公式サイト',
            value: (
              <a href={spot.officialUrl} target="_blank" rel="noopener noreferrer">
                {officialHost}
              </a>
            ),
          },
        ]
      : []),
  ];
  const pricingRows: KkInfoRow[] = spot.pricing
    ? (
        [
          ['大人', spot.pricing.adult],
          ['小学生', spot.pricing.elementary],
          ['幼児', spot.pricing.preschool],
          ['乳児', spot.pricing.infant],
        ] as Array<[string, string | undefined]>
      )
        .filter((r): r is [string, string] => !!r[1])
        .map(([label, v]) => ({ label, value: v }))
    : [];
  const playgroundChips = (spot.playgroundFeatures ?? []).map((f) => PLAYGROUND_FEATURE_LABEL[f]).filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPlace) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {jsonLdFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      )}

      <V2Frame header="sub" active="area" backHref="/spots">
        <div className="spot-v3">
        <V2RememberSpot
          slug={slug}
          name={spot.name}
          img={heroImg}
          area={spot.ward || spot.city}
        />

        {/* パンくず（写真の外に出す。リンク・文言は従来どおり） */}
        <nav className="sv3-crumb" aria-label="パンくず">
          <Link href="/">ホーム</Link>
          <V2Icon name="chevron-right" size={11} />
          <Link href="/spots">スポット</Link>
          <V2Icon name="chevron-right" size={11} />
          <span className="cur">{spot.name}</span>
        </nav>

        {/* 上部ブロック。PC（≥920px）では左に写真・右に見出し/所在地/タグ/説明の2段組にする。
            DOM順（パンくず→H1→所在地→写真→タグ→説明）はスマホと同じまま。 */}
        <div className="sv3-top">

        {/* カテゴリ＋H1＋所在地行（DOM順: パンくず→H1→画像。JSON-LD・title は不変） */}
        <div className="sv3-head">
          <span className="sv3-cat">{category}</span>
          <h1 className="sv3-h1">{spot.name}</h1>
          {(location || stationWalkLabel) && (
            <div className="sv3-loc">
              <KkIcon name="pin" size={15} sw={2} />
              {location && <span>{location}</span>}
              {location && stationWalkLabel && <span className="sv3-loc-sep">・</span>}
              {stationWalkLabel && <span>{stationWalkLabel}</span>}
            </div>
          )}
        </div>

        {/* hero 画像（写真が色を持つ。軽い角丸だけで枠・影・オーバーレイはつけない。src は従来どおり） */}
        <div className="sv3-hero">
          <div className="sv3-hero-img">
            <V2Img src={heroImg} seed={slug} alt={spot.name} priority />
            {/* §5-1: 画像の種別/出典（実在施設のAI偽写真の誤認を防ぐ / UGC昇格時はクレジット） */}
            {(heroNote.image || heroNote.credit) && (
              <span className="sv3-hero-credit">{heroNote.image ? '※イメージ' : heroNote.credit}</span>
            )}
            {/* 保存ボタン（右上） */}
            <V2SdHeroFav id={slug} />
          </div>
        </div>

        {/* 閉館バナー（小さなステータスなので枠を許す。文言は従来どおり） */}
        {closedNotice && (
          <div className="sv3-banner" role="status">
            <strong>このスポットは閉館・閉店しています。</strong>
            <br />
            {closedNotice}
          </div>
        )}

        {/* 一時休館バナー（期間つき。恒久閉館とは別扱いで、期間が明ければ自動で消える） */}
        {!closedNotice && tempClosure && (
          <div className="sv3-banner warn" role="status">
            <strong>現在このスポットは休館中です。</strong>
            <br />
            {tempClosure.note}
            <br />
            <a href={tempClosure.source} target="_blank" rel="noopener noreferrer">
              公式サイトで最新情報を見る
            </a>
          </div>
        )}

        {/* タグ（文言は従来どおり） */}
        <div className="v2-section sv3-tags">
          <div className="kk-chips">
            {location && <span className="kk-chip">{location}</span>}
            {spot.ages.map((age) => (
              <span key={age} className="kk-chip">{AGE_LABEL[age]}</span>
            ))}
            {spot.place === 'indoor' && <span className="kk-chip">室内</span>}
            {spot.facilities?.nursingRoom === 'yes' && <span className="kk-chip">授乳室あり</span>}
            {spot.facilities?.strollerRental === 'yes' && <span className="kk-chip">ベビーカーOK</span>}
          </div>
        </div>

        {/* 期間限定の告知（until を過ぎたら出さない） */}
        {spot.notice && spot.notice.until >= new Date().toISOString().slice(0, 10) && (
          <div className="sv3-banner warn">
            <span className="sv3-banner-lab">いま行く前に確認</span>
            <p style={{ margin: 0 }}>{spot.notice.text}</p>
            {spot.notice.source && <p className="sv3-banner-src">{spot.notice.source}</p>}
          </div>
        )}

        {/* リード（既存の施設説明をそのまま。文ごとに段落を分けて読みやすくする） */}
        {spot.note && (
          <div className="v2-section sv3-lead-wrap">
            {toParagraphs(spot.note, 1).map((p, i) => (
              <p key={i} className="sv3-lead">{p}</p>
            ))}
          </div>
        )}

        </div>{/* /.sv3-top */}

        {/* 子連れ設備（KkFacilityGrid）。見出し h2「設備・サービス」と表示条件は従来どおり。
            'no' は「なし」ピルで出す（2026-09 承認済みの追加表示）。未指定は出さない。 */}
        {facilityItems.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title="設備・サービス" />
            <KkFacilityGrid items={facilityItems} />
          </div>
        )}

        {/* 運営者のひとこと（既存の spot.hiddenTip）。
            2026-09-08: 「ここがうれしいポイント」という新ラベル＋番号リストは廃止し、
            元からある「運営者のひとこと」に戻した（社長指示）。文は段落に割って読みやすくする。 */}
        {spot.hiddenTip && (
          <div className="kk-sec sv3-sec">
            <div className="sv3-lab">運営者のひとこと</div>
            <div className="sv3-voice sv3-measure">
              {toParagraphs(spot.hiddenTip).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* 基本情報（KkInfoTable＝罫線だけの表）。旧2×2グリッドの4項目＋最寄り駅・駐車場・公式サイト */}
        <div className="kk-sec sv3-sec">
          <KkSectionTitle as="div" title="基本情報" />
          <div className="sv3-measure">
            <KkInfoTable rows={infoRows} />
          </div>
        </div>

        {/* 料金詳細（pricing が1つでも入っていれば表示。見出し h2 は従来どおり） */}
        {pricingRows.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title="料金詳細" />
            <div className="sv3-measure">
              <KkInfoTable rows={pricingRows} className="sv3-pricing" />
            </div>
          </div>
        )}

        {/* 情報の鮮度（最終確認日）。閉館バナーを出しているときは重複するので出さない。
            未確認は「未確認」と正直に出す＝確認していないものを確認済みに見せない。 */}
        {freshness.state !== 'closed' && (
          <div className="v2-section">
            <div className="sv3-fresh sv3-measure">
              <V2Icon
                name={freshnessNote.tone === 'ok' ? 'info' : 'clock'}
                size={14}
                color="var(--kk-ink-mute)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div>{freshnessNote.text}</div>
            </div>
          </div>
        )}

        {/* 近隣セット提案 */}
        {spot.nearby && (
          <div className="v2-section sv3-sec">
            <div className="sv3-combo sv3-measure">
              <span className="sv3-combo-lab">近くと組み合わせるなら</span>
              {toParagraphs(spot.nearby).map((p, i) => (
                <p key={i} className="sv3-combo-body">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* 追加画像（中段） */}
        {galleryImages[1] && (
          <div className="v2-section">
            <div className="sv3-figure">
              <V2Img src={galleryImages[1]} seed={`${slug}-1`} alt={`${spot.name}の様子`} />
            </div>
          </div>
        )}

        {/* ネット予約/チケットCTA（restaurant→ホットペッパー / レジャー→アソビュー）。env未設定なら非表示 */}
        {reservationOffer && (
          <div className="v2-section" style={{ marginTop: 18 }}>
            <ReservationCTA offer={reservationOffer} />
          </div>
        )}

        {/* 子連れ宿予約CTA（レジャースポットのみ）。env未設定なら非表示 */}
        {travelOffer && (
          <div className="v2-section" style={{ marginTop: 10 }}>
            <ReservationCTA offer={travelOffer} />
          </div>
        )}

        {/* 公式サイト（§P1-4）。予約アフィCTAの“下”に二次リンクとして置く（発リンク=noopener） */}
        {spot.officialUrl && (
          <div className="v2-section" style={{ marginTop: 10 }}>
            <a
              href={spot.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kk-btn outline block sv3-official"
            >
              <KkIcon name="link" size={16} sw={1.8} />
              公式サイトで最新情報・料金を確認
              <span className="sv3-official-arrow">
                <KkIcon name="chevron-right" size={15} sw={2} />
              </span>
            </a>
          </div>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 年齢別の楽しみ方（§3-1 6.）。表でもカードでもなく、年齢を左に強く出した編集本文。
            本文は文ごとに段落へ割って、長い自動生成文が壁にならないようにする。 */}
        {enjoyByAgeBlocks.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title="年齢別の楽しみ方" />
            <div className="sv3-ages sv3-measure">
              {enjoyByAgeBlocks.map((b, i) => (
                <div key={i} className="sv3-age-row">
                  <div className="sv3-age-lab">{b.label}</div>
                  <div className="sv3-age-body">
                    {toParagraphs(b.text).map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 季節営業の会期（SPOT_SEASON: 年つき。lib/spot-season.ts）。「〇〇農園 ぶどう狩り」クエリに答える節。 */}
        {spot.season && spot.season.length > 0 && <SpotSeasonBox spotName={spot.name} windows={spot.season} />}

        {/* 遊具・アスレチック（SPOT_PLAYGROUND: 公式確認の本文。lib/spot-playground.ts）。
            「〇〇公園 遊具」クエリに答える節。事実はデータ層からのみ描画し、ここに直書きしない。 */}
        {spot.playground && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title={`${spot.playground.park ?? spot.name}の遊具・アスレチック`} />
            <div className="sv3-measure">
              <p style={{ margin: '0 0 12px' }}>{spot.playground.summary}</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="kk-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>遊び場</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>遊具</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px', whiteSpace: 'nowrap' }}>対象・場所</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spot.playground.areas.map((a) => (
                      <tr key={a.name}>
                        <td style={{ padding: '6px 8px', verticalAlign: 'top' }}><strong>{a.name}</strong></td>
                        <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{a.items}</td>
                        <td style={{ padding: '6px 8px', verticalAlign: 'top', fontSize: 13 }}>
                          {[a.ages, a.location].filter(Boolean).join('／') || '公式記載なし'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {spot.playground.note && <p style={{ margin: '10px 0 0', fontSize: 13 }}>※ {spot.playground.note}</p>}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-mute)' }}>
                出典: <a href={spot.playground.sourceUrl} target="_blank" rel="noopener noreferrer">公園公式ページ</a>（{spot.playground.confirmedAt} 確認）。遊具は改修・撤去で変わるため、最新は公式でご確認ください。
              </p>
              {playgroundChips.length > 0 && (
                <div className="kk-chips" style={{ marginTop: 10 }}>
                  {playgroundChips.map((l) => (
                    <span key={l} className="kk-chip">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 遊具・特徴（playgroundFeatures のタグだけがあるとき。ラベルは JSON-LD と同じ表） */}
        {!spot.playground && playgroundChips.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="div" title="遊具・特徴" />
            <div className="kk-chips">
              {playgroundChips.map((l) => (
                <span key={l} className="kk-chip">{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* 運営者の一次情報レポート（実際に子連れで訪問して記録した実体験）。
            詳細ページでは cautionNote だけが「行く前に知っておきたいこと」に混ざる形だったため、
            全項目をここで独立表示する（E-E-A-T の Experience を一番見える位置に出す）。 */}
        {spot.kidReport && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title="運営者が子連れで行ってきました" />
            <div className="sv3-measure">
              <span className="sv3-report-badge">
                <KkIcon name="check" size={14} sw={2.2} />
                運営者が実際に子連れで訪問して確認
              </span>
              <dl className="sv3-report">
                {[
                  { label: '行った年齢', value: spot.kidReport.visitAge },
                  { label: 'ベビーカー動線', value: spot.kidReport.strollerNote },
                  { label: '土日の混雑・狙い目', value: spot.kidReport.crowdNote },
                  { label: 'おむつ替え・授乳', value: spot.kidReport.diaperNote },
                  { label: '滞在時間の目安', value: spot.kidReport.stayNote },
                  { label: 'ヒヤッとした点・注意', value: spot.kidReport.cautionNote },
                ]
                  .filter((r) => r.value) // 覚えていない項目は見出しごと出さない
                  .map((r) => (
                    <div key={r.label} className="sv3-report-row">
                      <dt className="sv3-report-dt">{r.label}</dt>
                      <dd className="sv3-report-dd">
                        {toParagraphs(r.value as string).map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        )}

        {/* 利用のポイント: 混雑回避・アクセス・事前確認（<details> のまま、クリーム面の角丸カードに） */}
        {(crowdAvoidance || accessTips || preVisitNotes) && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="div" title="利用のポイント" />
            <div className="sv3-tips sv3-measure">
              {crowdAvoidance && (
                <details className="sv3-tip" open>
                  <summary className="sv3-tip-q">
                    混雑を避けるコツ
                    <span className="sv3-tip-chev">
                      <V2Icon name="chevron-down" size={17} />
                    </span>
                  </summary>
                  <div className="sv3-tip-a">
                    {toParagraphs(crowdAvoidance).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              )}
              {accessTips && (
                <details className="sv3-tip" open>
                  <summary className="sv3-tip-q">
                    アクセスのコツ
                    <span className="sv3-tip-chev">
                      <V2Icon name="chevron-down" size={17} />
                    </span>
                  </summary>
                  <div className="sv3-tip-a">
                    {toParagraphs(accessTips).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              )}
              {preVisitNotes && (
                <details className="sv3-tip" open>
                  <summary className="sv3-tip-q">
                    行く前に知っておきたいこと
                    <span className="sv3-tip-chev">
                      <V2Icon name="chevron-down" size={17} />
                    </span>
                  </summary>
                  <div className="sv3-tip-a">
                    {toParagraphs(preVisitNotes).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* 地図・アクセス（P1-6） */}
        <SpotMap
          name={spot.name}
          area={spot.ward ?? spot.city}
          stationLabel={
            nearestStationName
              ? `${nearestStationName}${spot.walkMinutes ? ` 徒歩${spot.walkMinutes}分` : ''}`
              : undefined
          }
        />

        {/* よくある質問（FAQ）: 角丸カード */}
        {faqs.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="h2" title="よくある質問" />
            <div className="sv3-faqs sv3-measure">
              {faqs.map((f, i) => (
                <details key={i} className="sv3-faq">
                  <summary className="sv3-faq-q">
                    <span className="sv3-faq-mark">Q</span>
                    {f.q}
                    <span className="sv3-tip-chev">
                      <V2Icon name="chevron-down" size={17} />
                    </span>
                  </summary>
                  <div className="sv3-faq-a">
                    {toParagraphs(f.a).map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* 近隣スポット */}
        {nearbySpots.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="div" title="近くのスポット" moreHref="/spots" more="もっと見る" />
            <div className="sv3-nearby">
              {nearbySpots.map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <Link key={x.slug} href={`/spot/${x.slug}`} className="sv3-nb">
                    <span className="sv3-nb-img">
                      <V2Img src={v.img} seed={x.slug} alt={x.spot.name} />
                    </span>
                    <span className="sv3-nb-name">{x.spot.name}</span>
                    <span className="sv3-nb-loc">{x.spot.ward || x.spot.city}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* このスポットを軸にした1日の流れ（一次データのみ・埋まらないスロットは省く） */}
        {(() => {
          const dayPlan = buildSpotDayPlan(entry);
          if (!dayPlan) return null;
          const stationSlug =
            entry.area === 'tokyo' ? resolveSpotStationSlug(spot) : undefined;
          const stationLabel = stationSlug
            ? (findStationBySlug(stationSlug)?.name ?? spot.nearestStation)
            : undefined;
          return (
            <EventDayPlanSection
              plan={dayPlan}
              cityLabel={spot.ward ?? spot.city ?? getAreaName(entry.area)}
              heading={`${spot.name}を軸にした1日の流れ`}
              intro={`編集部が設備・料金を確認した実在スポットだけで組んでいます。時間は目安です。混雑や子どものお昼寝にあわせて前後を入れ替えてください。`}
              footer={
                stationSlug ? (
                  <p style={{ fontSize: 13.5, margin: '12px 2px 0' }}>
                    <Link href={`/today?station=${stationSlug}`} className="sv3-textlink">
                      <KkIcon name="arrow-right" size={15} sw={2} />
                      {stationLabel}駅を起点に、年齢・天気の条件を変えて1日プランを組み直す
                    </Link>
                  </p>
                ) : undefined
              }
            />
          );
        })()}

        {/* この会場で毎年ひらかれるイベント（終了しても「毎年◯月ごろ」として残る） */}
        <VenueAnnualEvents events={venueAnnualEvents} spotName={spot.name} />

        {/* 近くで開催中・これからのイベント（会期切れは自動非表示） */}
        <UpcomingEventsNearby events={nearEvents} title={nearEventsTitle} />

        {/* 持っていくと便利（シーン×アイテム）。P1-4: 商品画像＋価格帯つきカード */}
        {enrichedItems.length > 0 && (
          <div className="kk-sec sv3-sec">
            {/* 見出しテキストは従来どおり（{spot.name} と固定文の2ノードのまま＝出力差分ゼロ） */}
            <KkSectionTitle as="h2" title={<>{spot.name}に持っていくと便利</>} />
            <div className="sv3-measure">
              <p className="sv3-pr-note">
                広告 / PR ・ 楽天市場の商品です。価格・在庫は変動するため各リンク先でご確認ください。
              </p>
              <div className="sv3-items">
                {enrichedItems.map(({ item, product, href }, i) => {
                  const band = product ? priceBandLabel(product.price) : '';
                  return (
                    <a key={i} href={href} target="_blank" rel="sponsored nofollow noopener" className="sv3-item">
                      {/* 商品画像（取得できたときのみ） */}
                      {product?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={item.label}
                          loading="lazy"
                          width={76}
                          height={76}
                          className="sv3-item-img"
                        />
                      )}
                      <div className="sv3-item-body">
                        <div className="sv3-item-head">
                          <span className="sv3-item-num">{i + 1}</span>
                          <span className="sv3-item-label">{item.label}</span>
                        </div>
                        <p className="sv3-item-why">{item.why}</p>
                        <div className="sv3-item-meta">
                          {band && <span className="sv3-item-price">{band}</span>}
                          <span className="sv3-item-go">
                            楽天で見る
                            <V2Icon name="chevron-right" size={13} color="var(--kk-orange-deep)" />
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 追加画像（下段） */}
        {galleryImages[2] && (
          <div className="v2-section">
            <div className="sv3-figure">
              <V2Img src={galleryImages[2]} seed={`${slug}-2`} alt={`${spot.name}の様子`} />
            </div>
          </div>
        )}

        {/* 関連記事（行リスト。リンク先・タイトル・サムネは従来どおり） */}
        {relatedArticles.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="div" title="関連記事" moreHref="/category/today-doko" more="もっと見る" />
            <div className="kk-rows">
              {relatedArticles.map((a) => {
                const v = articleToV2(a);
                return (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="kk-row">
                    <span className="kk-row-thumb">
                      <V2Img src={v.img} seed={a.slug} alt={a.title} />
                    </span>
                    <span className="kk-row-body">
                      <span className="kk-row-title">{a.title}</span>
                      {a.lede && <span className="kk-row-sub">{a.lede.slice(0, 60)}</span>}
                    </span>
                    <span className="kk-row-arrow">
                      <KkIcon name="arrow-right" size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 行ったよレポート（公開分の表示＋報告フォーム） */}
        {visitorReports.length > 0 && (
          <div className="kk-sec sv3-sec">
            <KkSectionTitle as="div" title="みんなの「行ったよ」" moreHref="/reports" more="もっと見る" />
            <div className="sv3-reports sv3-measure">
              {visitorReports.map((r, i) => (
                <div key={i} className="sv3-report-item">
                  <span className="sv3-stars" aria-label={`星${r.rating}`}>
                    {Array.from({ length: r.rating }, (_, s) => (
                      <KkIcon key={s} name="popular" size={14} sw={1.6} />
                    ))}
                  </span>
                  {r.ageRange && (
                    <span className="sv3-report-age">{AGE_LABEL[r.ageRange] ?? r.ageRange}の子と</span>
                  )}
                  {r.comment && <p className="sv3-report-cm">「{r.comment}」</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* P1-8: ログイン不要の口コミ（承認済みのみ表示・★平均） */}
        <ReviewSection spotId={slug} spotName={spot.name} />

        <VisitedReport slug={slug} name={spot.name} />

        <ShareBar
          url={`https://kyounoko.jp/spot/${slug}`}
          title={`${spot.name}｜${location}${location ? 'の' : ''}${category}子連れガイド`}
          label="このスポットをシェアする"
        />

        {/* 保存ボタン */}
        <V2SaveButton id={slug} />

        {/* 回遊・再訪モジュール（リニューアル2026-09） */}
        <KkLineCard placement="spot" />
        <KkAddToHomeCard placement="spot" />
        <KkFooter />
        </div>
      </V2Frame>
    </>
  );
}
