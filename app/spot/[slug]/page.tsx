import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';
import {
  getAllSpotsWithSlug,
  getSpotBySlug,
  SPOT_CATEGORY_LABEL,
} from '@/lib/spots';
import type { Spot } from '@/lib/spots';
import { getAllFileArticles } from '@/lib/articles';
import { buildSpotJsonLd } from '@/lib/spot-schema';
import {
  buildEnjoyByAgeBlocks,
  buildCrowdAvoidanceText,
  buildAccessTipsText,
  buildPreVisitNotes,
} from '@/lib/spot-narratives';
import { spotToV2, articleToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { V2RememberSpot } from '@/components/v2/V2RememberSpot';
import { V2SaveButton, V2SdHeroFav } from '@/components/v2/V2SaveButton';
import { getRecommendedItems } from '@/lib/recommended-items';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSpotsWithSlug()
    .filter((x) => isIndexable(x.spot))
    .map((x) => ({ slug: x.slug }));
}

function isIndexable(s: Spot): boolean {
  let score = 0;
  if (s.note && s.note.length >= 25) score++;
  if (s.facilities && Object.keys(s.facilities).length >= 2) score++;
  if (s.pricing && Object.keys(s.pricing).length >= 1) score++;
  if (s.hiddenTip && s.hiddenTip.length >= 15) score++;
  if (s.nearestStation) score++;
  if (s.ward || s.city) score++;
  return score >= 3;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSpotBySlug(slug);
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
    robots: isIndexable(spot) ? undefined : { index: false },
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
  const entry = getSpotBySlug(slug);
  if (!entry) notFound();
  const { spot } = entry;
  const category = SPOT_CATEGORY_LABEL[spot.category] ?? spot.category;
  const location = spot.ward ?? spot.city ?? '';

  // 近隣スポット
  const nearbySpots = getAllSpotsWithSlug()
    .filter((x) => {
      if (x.slug === slug) return false;
      if (!isIndexable(x.spot)) return false;
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
  const crowdAvoidance = buildCrowdAvoidanceText(spot);
  const accessTips = buildAccessTipsText(spot);
  const preVisitNotes = buildPreVisitNotes(spot);

  const v2Spot = spotToV2(spot);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPlace) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <V2Frame header="sub" active="search" backHref="/spots">
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
              {spot.nearestStation && (
                <div className="v2-sd-hero-station">
                  <V2Icon name="pin" size={14} color="#fff" />
                  {spot.nearestStation}
                  {spot.walkMinutes ? ` 徒歩${spot.walkMinutes}分` : ''}
                </div>
              )}
            </div>
          </div>
        </div>

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
                  <V2Icon name="chevron-down" size={18} color="#bbb" style={{ marginLeft: 'auto', flex: 'none' }} />
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
                  <V2Icon name="chevron-down" size={18} color="#bbb" style={{ marginLeft: 'auto', flex: 'none' }} />
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
                  <V2Icon name="chevron-down" size={18} color="#bbb" style={{ marginLeft: 'auto', flex: 'none' }} />
                </summary>
                <div className="v2-faq-a">
                  <span style={{ fontSize: 13.5, lineHeight: 1.7 }}>{preVisitNotes}</span>
                </div>
              </details>
            )}
          </div>
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

        {/* 保存ボタン */}
        <V2SaveButton id={slug} />

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
