import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';
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
import { getAllFileArticles } from '@/lib/articles';
import { buildSpotJsonLd, buildFaqJsonLd } from '@/lib/spot-schema';
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
import { getPublishedSpotReports } from '@/lib/spot-reports';
import { V2SaveButton, V2SdHeroFav } from '@/components/v2/V2SaveButton';
import { getRecommendedItems } from '@/lib/recommended-items';
import { getSpotReservationOffer } from '@/lib/reservation-cta';
import { ReservationCTA } from '@/components/article/ReservationCTA';

export const revalidate = 3600;

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
  const title = `${spot.name}｜${location}${location ? 'の' : ''}${category}子連れガイド【設備・料金・口コミ】`;
  const description =
    spot.note ??
    `${spot.name}は${location ? location + 'の' : ''}${category}。子連れで使いやすい設備・料金・アクセス情報をきょうのこ編集部が整理しました。`;
  return {
    title,
    description,
    alternates: { canonical: `/spot/${slug}` },
    // 閉館スポットと中身の薄いスポットは noindex（不正確・低品質な情報を検索結果に残さない）。
    robots: SPOT_CLOSED[spot.name] || !isSpotIndexable(spot) ? { index: false } : undefined,
    openGraph: {
      title,
      description,
      url: `https://kyounoko.jp/spot/${slug}`,
      images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
    },
  };
}

const AGE_LABEL: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

const FACILITY_DEF: Array<{ key: keyof NonNullable<Spot['facilities']>; label: string; icon: V2IconName; accent: keyof typeof V2_ACCENT }> = [
  { key: 'nursingRoom', label: '授乳室', icon: 'milk', accent: 'event' },
  { key: 'diaperChange', label: 'おむつ替え台', icon: 'baby', accent: 'indoor' },
  { key: 'strollerRental', label: 'ベビーカー貸出', icon: 'stroller', accent: 'rain' },
  { key: 'bathroom', label: '多目的トイレ', icon: 'house', accent: 'purple' },
  { key: 'kidsSpace', label: 'キッズスペース', icon: 'star', accent: 'lunch' },
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

  // 閉館スポットの案内文（あれば閉館バナーを表示し noindex）。
  const closedNotice = SPOT_CLOSED[spot.name];

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
          if (spot.nearestStation && x.spot.nearestStation === spot.nearestStation) return true;
          if (spot.ward && x.spot.ward === spot.ward) return true;
          return false;
        })
        .slice(0, 6);

  // 関連記事
  const allArticles = getAllFileArticles().filter((a) => !a.noindex);
  const relatedArticles = allArticles
    .filter((a) => {
      const aAges = a.quickInfo?.ageRanges ?? [];
      return spot.ages.some((ageTag) => aAges.includes(ageTag));
    })
    .slice(0, 6);

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPlace) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {jsonLdFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      )}

      <V2Frame header="sub" active="area" backHref="/spots">
        <V2RememberSpot
          slug={slug}
          name={spot.name}
          img={v2Spot.img}
          area={spot.ward || spot.city}
        />

        {/* オーバーレイヒーロー（2回目デザイン .v2-sd-hero） */}
        <div className="v2-sd-hero">
          <div className="v2-sd-hero-img">
            <V2Img src={v2Spot.img} seed={slug} alt={spot.name} />
            <div className="v2-sd-hero-grad"></div>

            {/* §5-1: 画像の種別/出典（実在施設のAI偽写真の誤認を防ぐ） */}
            {(heroImageNote.image || heroImageNote.credit) && (
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  zIndex: 2,
                }}
              >
                {heroImageNote.image ? '※イメージ' : heroImageNote.credit}
              </span>
            )}

            {/* breadcrumb（写真の上に重ねる） */}
            <div className="v2-sd-hero-crumb">
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>ホーム</Link>
              <V2Icon name="chevron-right" size={11} />
              <Link href="/spots" style={{ color: 'inherit', textDecoration: 'none' }}>スポット</Link>
              <V2Icon name="chevron-right" size={11} />
              <span className="cur">{spot.name}</span>
            </div>

            {/* 保存ボタン（右上） */}
            <V2SdHeroFav id={slug} />

            {/* カテゴリ＋タイトル＋駅（左下） */}
            <div className="v2-sd-hero-foot">
              <span className="v2-sd-hero-cat">{category}</span>
              <h1 className="v2-sd-hero-name">{spot.name}</h1>
              {nearestStationName && (
                <div className="v2-sd-hero-station">
                  <V2Icon name="pin" size={14} color="#fff" />
                  {nearestStationName}
                  {spot.walkMinutes ? ` 徒歩${spot.walkMinutes}分` : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 閉館バナー */}
        {closedNotice && (
          <div className="v2-section" style={{ marginTop: 14 }}>
            <div
              role="status"
              style={{
                background: 'var(--v2-ink-mute, #f3f3f3)',
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--v2-r-card)',
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--v2-ink-sub)',
                lineHeight: 1.65,
              }}
            >
              <strong style={{ color: 'var(--v2-ink)' }}>このスポットは閉館・閉店しています。</strong>
              <br />
              {closedNotice}
            </div>
          </div>
        )}

        {/* タグ */}
        <div className="v2-section" style={{ marginTop: 14 }}>
          <div className="v2-tag-row">
            {location && <V2Tag label={location} />}
            {spot.ages.map((age) => (
              <V2Tag key={age} label={AGE_LABEL[age]} tone="age" />
            ))}
            {spot.place === 'indoor' && <V2Tag label="室内" tone="rain" />}
            {spot.facilities?.nursingRoom === 'yes' && <V2Tag label="授乳室あり" />}
            {spot.facilities?.strollerRental === 'yes' && <V2Tag label="ベビーカーOK" />}
          </div>
        </div>

        {/* リード */}
        {spot.note && (
          <div className="v2-page-head" style={{ paddingTop: 14 }}>
            <p className="v2-page-lead" style={{ marginTop: 0 }}>{spot.note}</p>
          </div>
        )}

        {/* 基本情報 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 11,
            padding: '18px 18px 0',
          }}
        >
          {[
            { lab: '対象年齢', val: spot.ages.map((a) => AGE_LABEL[a]).join('・'), icon: 'baby' as V2IconName, bg: 'var(--v2-c-event-bg)', c: 'var(--v2-c-event)' },
            { lab: '料金の目安', val: spot.budget === 'free' ? '無料' : spot.budget === 'low' ? '〜1,000円' : spot.budget === 'mid' ? '1,000〜3,000円' : spot.budget === 'high' ? '3,000円〜' : '—', icon: 'yen' as V2IconName, bg: 'var(--v2-c-sun-bg)', c: '#E8A100' },
            { lab: '屋内/屋外', val: spot.place === 'indoor' ? '屋内' : spot.place === 'outdoor' ? '屋外' : '一部屋外', icon: 'house' as V2IconName, bg: 'var(--v2-c-indoor-bg)', c: 'var(--v2-c-indoor)' },
            { lab: '雨の日', val: spot.place === 'indoor' || spot.place === 'mixed' ? '◎ おすすめ' : '△', icon: 'umbrella' as V2IconName, bg: 'var(--v2-c-rain-bg)', c: 'var(--v2-c-rain)' },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                background: '#fff',
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--v2-r-card)',
                padding: '13px 14px',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: b.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                }}
              >
                <V2Icon name={b.icon} size={20} color={b.c} />
              </span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--v2-ink-mute)', fontWeight: 700 }}>{b.lab}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--v2-ink)', lineHeight: 1.25 }}>{b.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 設備 */}
        {spot.facilities && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>設備・サービス
              </div>
            </div>
            <div className="v2-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {FACILITY_DEF.filter((f) => spot.facilities![f.key] === 'yes').map((f) => {
                  const a = V2_ACCENT[f.accent];
                  return (
                    <div
                      key={f.key}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--v2-line)',
                        borderRadius: 'var(--v2-r-card)',
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 7,
                        boxShadow: 'var(--v2-sh-soft)',
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--v2-ink-soft)' }}>
                        {f.label}
                      </div>
                      <span style={{ color: a.c }}>
                        <V2Icon name={f.icon} size={24} />
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--v2-ink)' }}>あり</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* hiddenTip / pricing */}
        {spot.hiddenTip && (
          <div className="v2-section" style={{ marginTop: 18 }}>
            <div
              style={{
                background: 'var(--v2-cream)',
                borderRadius: 'var(--v2-r-card)',
                padding: '14px 16px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <V2Icon name="sparkle" size={20} color="var(--v2-orange)" />
              <div style={{ fontSize: 13, color: 'var(--v2-ink-soft)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--v2-ink)' }}>運営者のひとこと</strong>
                <br />
                {spot.hiddenTip}
              </div>
            </div>
          </div>
        )}

        {/* 料金詳細（pricing が1つでも入っていれば表示） */}
        {spot.pricing && Object.values(spot.pricing).some((v) => v) && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>料金詳細
              </div>
            </div>
            <div className="v2-section">
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--v2-line)',
                  borderRadius: 'var(--v2-r-card)',
                  overflow: 'hidden',
                }}
              >
                {([
                  ['大人', spot.pricing.adult],
                  ['小学生', spot.pricing.elementary],
                  ['幼児', spot.pricing.preschool],
                  ['乳児', spot.pricing.infant],
                ] as const)
                  .filter(([, v]) => v)
                  .map(([label, v], i) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '11px 14px',
                        borderTop: i === 0 ? 'none' : '1px solid var(--v2-line)',
                        fontSize: 13.5,
                      }}
                    >
                      <span style={{ color: 'var(--v2-ink-mute)', fontWeight: 700 }}>{label}</span>
                      <span style={{ color: 'var(--v2-ink)', fontWeight: 800 }}>{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* 近隣セット提案 */}
        {spot.nearby && (
          <div className="v2-section" style={{ marginTop: 18 }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--v2-r-card)',
                padding: '14px 16px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <V2Icon name="pin" size={20} color="var(--v2-orange)" />
              <div style={{ fontSize: 13, color: 'var(--v2-ink-soft)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--v2-ink)' }}>近くと組み合わせるなら</strong>
                <br />
                {spot.nearby}
              </div>
            </div>
          </div>
        )}

        {/* 追加画像（中段） */}
        {galleryImages[1] && (
          <div className="v2-section" style={{ marginTop: 18 }}>
            <div style={{ borderRadius: 'var(--v2-r-card)', overflow: 'hidden', aspectRatio: '16 / 9', border: '1px solid var(--v2-line)' }}>
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

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 年齢別の楽しみ方 */}
        {enjoyByAgeBlocks.length > 0 && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>年齢別の楽しみ方
              </div>
            </div>
            <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enjoyByAgeBlocks.map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--v2-line)',
                    borderRadius: 'var(--v2-r-card)',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--v2-orange)', marginBottom: 6 }}>
                    {b.age}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--v2-ink-soft)', lineHeight: 1.7 }}>
                    {b.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 混雑回避・アクセス・事前確認 */}
        {(crowdAvoidance || accessTips || preVisitNotes) && (
          <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            {crowdAvoidance && (
              <details className="v2-faq" open>
                <summary className="v2-faq-q" style={{ listStyle: 'none', cursor: 'pointer' }}>
                  <span className="v2-faq-mark">
                    <V2Icon name="crowd" size={14} />
                  </span>
                  混雑を避けるコツ
                  <span className="v2-faq-chev">
                    <V2Icon name="chevron-down" size={18} color="#bbb" />
                  </span>
                </summary>
                <div className="v2-faq-a">
                  <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{crowdAvoidance}</span>
                </div>
              </details>
            )}
            {accessTips && (
              <details className="v2-faq">
                <summary className="v2-faq-q" style={{ listStyle: 'none', cursor: 'pointer' }}>
                  <span className="v2-faq-mark">
                    <V2Icon name="train" size={14} />
                  </span>
                  アクセスのコツ
                  <span className="v2-faq-chev">
                    <V2Icon name="chevron-down" size={18} color="#bbb" />
                  </span>
                </summary>
                <div className="v2-faq-a">
                  <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{accessTips}</span>
                </div>
              </details>
            )}
            {preVisitNotes && (
              <details className="v2-faq">
                <summary className="v2-faq-q" style={{ listStyle: 'none', cursor: 'pointer' }}>
                  <span className="v2-faq-mark">
                    <V2Icon name="info" size={14} />
                  </span>
                  行く前に知っておきたいこと
                  <span className="v2-faq-chev">
                    <V2Icon name="chevron-down" size={18} color="#bbb" />
                  </span>
                </summary>
                <div className="v2-faq-a">
                  <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{preVisitNotes}</span>
                </div>
              </details>
            )}
          </div>
        )}

        {/* よくある質問（FAQ） */}
        {faqs.length > 0 && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>よくある質問
              </div>
            </div>
            <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((f, i) => (
                <details key={i} className="v2-faq">
                  <summary className="v2-faq-q" style={{ listStyle: 'none', cursor: 'pointer' }}>
                    <span className="v2-faq-mark">Q</span>
                    {f.q}
                    <span className="v2-faq-chev">
                      <V2Icon name="chevron-down" size={18} color="#bbb" />
                    </span>
                  </summary>
                  <div className="v2-faq-a">
                    <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{f.a}</span>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}

        {/* 近隣スポット */}
        {nearbySpots.length > 0 && (
          <>
            <V2SectionHead title="近くのスポット" moreHref="/spots" />
            <div className="v2-hscroll">
              {nearbySpots.map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <Link
                    key={x.slug}
                    href={`/spot/${x.slug}`}
                    className="v2-card-mini"
                    style={{ width: 168 }}
                  >
                    <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                      <V2Img src={v.img} seed={x.slug} alt={x.spot.name} />
                    </div>
                    <div className="v2-card-mini-title">{x.spot.name}</div>
                    <div className="v2-card-v-loc" style={{ margin: 0 }}>
                      <V2Icon name="pin" size={12} color="var(--v2-orange)" />
                      {x.spot.ward || x.spot.city}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* 持っていくと便利（シーン×アイテム） */}
        {(() => {
          const items = getRecommendedItems(spot.category, spot.place, spot.ages, 6);
          if (items.length === 0) return null;
          return (
            <>
              <div className="v2-sec-head" style={{ marginTop: 22 }}>
                <div className="v2-sec-title">
                  <span className="v2-bar-accent"></span>{spot.name}に持っていくと便利
                </div>
              </div>
              <div className="v2-section">
                <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)', marginTop: 0, marginBottom: 12 }}>
                  ※楽天市場のリンクです（広告 / PR）。値段や在庫は楽天で確認できます。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                      style={{
                        display: 'block',
                        background: '#fff',
                        border: '1px solid var(--v2-line)',
                        borderRadius: 'var(--v2-r-card)',
                        padding: '14px 16px',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--v2-orange-tint)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flex: 'none', fontSize: 11, fontWeight: 800,
                          color: 'var(--v2-orange-deep)',
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--v2-ink)' }}>
                          {item.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--v2-ink-soft)', lineHeight: 1.6, margin: 0 }}>
                        {item.why}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: 'var(--v2-orange-deep)', fontWeight: 700 }}>
                        楽天で見る
                        <V2Icon name="chevron-right" size={14} color="var(--v2-orange-deep)" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {/* 追加画像（下段） */}
        {galleryImages[2] && (
          <div className="v2-section" style={{ marginTop: 18 }}>
            <div style={{ borderRadius: 'var(--v2-r-card)', overflow: 'hidden', aspectRatio: '16 / 9', border: '1px solid var(--v2-line)' }}>
              <V2Img src={galleryImages[2]} seed={`${slug}-2`} alt={`${spot.name}の様子`} />
            </div>
          </div>
        )}

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <>
            <V2SectionHead title="関連記事" moreHref="/category/today-doko" />
            <div className="v2-section">
              {relatedArticles.map((a) => {
                const v = articleToV2(a);
                return (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="v2-art-row">
                    <div className="v2-imgwrap r" style={{ width: 76, minWidth: 76, height: 60 }}>
                      <V2Img src={v.img} seed={a.slug} alt={a.title} />
                    </div>
                    <div className="v2-art-body">
                      <div className="v2-art-title">{a.title}</div>
                      {a.lede && <div className="v2-art-sub">{a.lede.slice(0, 60)}</div>}
                    </div>
                    <V2Icon name="chevron-right" size={20} color="#cfcfcf" />
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* 行ったよレポート（公開分の表示＋報告フォーム） */}
        {visitorReports.length > 0 && (
          <>
            <V2SectionHead title="みんなの「行ったよ」" moreHref="/reports" />
            <div className="v2-section">
              {visitorReports.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderBottom: i < visitorReports.length - 1 ? '1px solid #f3ece2' : 'none',
                    fontSize: 13.5,
                  }}
                >
                  <span aria-label={`星${r.rating}`}>
                    {'⭐'.repeat(r.rating)}
                  </span>
                  {r.ageRange && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#8a7d6e' }}>
                      {AGE_LABEL[r.ageRange] ?? r.ageRange}の子と
                    </span>
                  )}
                  {r.comment && (
                    <p style={{ margin: '4px 0 0', color: '#5d5246' }}>「{r.comment}」</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <VisitedReport slug={slug} name={spot.name} />

        {/* 保存ボタン */}
        <V2SaveButton id={slug} />

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
