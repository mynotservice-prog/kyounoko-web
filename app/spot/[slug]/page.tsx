import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import {
  getAllSpotsWithSlug,
  getSpotBySlug,
  SPOT_CATEGORY_LABEL,
} from '@/lib/spots';
import type { Spot } from '@/lib/spots';
import { getAllFileArticles } from '@/lib/articles';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // 静的生成対象は「最低限の情報を持つ」スポットに限定（薄ページ予防）
  return getAllSpotsWithSlug()
    .filter((x) => isIndexable(x.spot))
    .map((x) => ({ slug: x.slug }));
}

/** 「インデックス対象として価値がある」スポットの判定 */
function isIndexable(s: Spot): boolean {
  // 情報リッチネスのしきい値：以下の3つ以上満たすとインデックス
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
      images: [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }],
    },
  };
}

const AGE_LABEL: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

const FACILITY_LABEL: Record<string, string> = {
  bathroom: '多目的トイレ',
  diaperChange: 'おむつ替え台',
  nursingRoom: '授乳室',
  kidsSpace: 'キッズスペース',
  strollerRental: 'ベビーカー貸出',
};

export default async function SpotPage({ params }: Props) {
  const { slug } = await params;
  const entry = getSpotBySlug(slug);
  if (!entry) notFound();
  const { spot, area } = entry;
  const category = SPOT_CATEGORY_LABEL[spot.category] ?? spot.category;
  const location = spot.ward ?? spot.city ?? '';
  const indexable = isIndexable(spot);

  // 近隣スポット（同じ駅 or 同じ ward）
  const nearbySpots = getAllSpotsWithSlug()
    .filter((x) => {
      if (x.slug === slug) return false;
      if (!isIndexable(x.spot)) return false;
      // 同じ最寄り駅 or 同じ区
      if (spot.nearestStation && x.spot.nearestStation === spot.nearestStation) return true;
      if (spot.ward && x.spot.ward === spot.ward) return true;
      return false;
    })
    .slice(0, 6);

  // 関連記事（カテゴリ・年齢でゆるく照合）
  const allArticles = getAllFileArticles().filter((a) => !a.noindex);
  const relatedArticles = allArticles
    .filter((a) => {
      // 同じ年齢層に該当
      const aAges = a.quickInfo?.ageRanges ?? [];
      return spot.ages.some((ageTag) => aAges.includes(ageTag));
    })
    .slice(0, 6);

  // 構造化データ：Place / TouristAttraction
  const jsonLdPlace = {
    '@context': 'https://schema.org',
    '@type': spot.category === 'restaurant' ? 'Restaurant' : 'TouristAttraction',
    name: spot.name,
    description: spot.note ?? `${spot.name}は${location}${location ? 'の' : ''}${category}`,
    address: location
      ? { '@type': 'PostalAddress', addressLocality: location, addressCountry: 'JP' }
      : undefined,
    isAccessibleForFree: spot.budget === 'free',
    publicAccess: true,
    inLanguage: 'ja',
  };
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '子連れスポット', item: 'https://kyounoko.jp/spots' },
      { '@type': 'ListItem', position: 3, name: spot.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPlace) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <SiteHeader />
      <main className="container">
        <nav className="breadcrumb" aria-label="パンくず" style={{ padding: '12px 0 4px' }}>
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/spots">子連れスポット</Link>
          <span className="sep">/</span>
          <span>{spot.name}</span>
        </nav>

        <section className="section" style={{ paddingTop: 8 }}>
          {/* ヘッダー：エリア・カテゴリチップ */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-inter), sans-serif',
                color: 'var(--clay-deep)',
                background: 'var(--peach-soft)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {category}
            </span>
            {location && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-inter), sans-serif',
                  color: 'var(--ink-sub)',
                  background: 'var(--paper-card)',
                  border: '1px solid var(--line)',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                {location}
              </span>
            )}
            {spot.ages.map((age) => (
              <span
                key={age}
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-inter), sans-serif',
                  color: 'var(--ink-sub)',
                  background: 'var(--paper-card)',
                  border: '1px solid var(--line)',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                {AGE_LABEL[age]}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 26,
              fontWeight: 700,
              margin: '4px 0 12px',
            }}
          >
            {spot.name}
          </h1>

          {spot.note && (
            <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.85, margin: '0 0 18px' }}>
              {spot.note}
            </p>
          )}

          {/* 基本情報テーブル */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '16px 18px',
              background: 'var(--paper-card)',
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--clay-deep)' }}>
              基本情報
            </h2>
            <dl style={{ margin: 0, fontSize: 13, lineHeight: 1.85 }}>
              <Row label="カテゴリ" value={category} />
              <Row label="場所タイプ" value={spot.place === 'indoor' ? '屋内' : spot.place === 'outdoor' ? '屋外' : '屋内＋屋外'} />
              <Row label="対象年齢" value={spot.ages.map((a) => AGE_LABEL[a]).join(' / ')} />
              {location && <Row label="エリア" value={location} />}
              {spot.budget && (
                <Row
                  label="予算"
                  value={
                    spot.budget === 'free' ? '無料' :
                    spot.budget === 'low' ? '〜1,000円' :
                    spot.budget === 'mid' ? '1,000〜3,000円' : '3,000円〜'
                  }
                />
              )}
              {spot.nearestStation && spot.walkMinutes && (
                <Row label="アクセス" value={`最寄り駅から徒歩${spot.walkMinutes}分`} />
              )}
              {spot.reservation && (
                <Row
                  label="予約"
                  value={
                    spot.reservation === 'required' ? '要予約' :
                    spot.reservation === 'recommended' ? '予約推奨' : '不要'
                  }
                />
              )}
            </dl>
          </div>

          {/* 料金 */}
          {spot.pricing && Object.keys(spot.pricing).length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontFamily: 'var(--font-mincho)', fontWeight: 600, margin: '0 0 8px' }}>
                料金
              </h2>
              <dl style={{ margin: 0, fontSize: 13, lineHeight: 1.85 }}>
                {spot.pricing.adult && <Row label="大人" value={spot.pricing.adult} />}
                {spot.pricing.elementary && <Row label="小学生" value={spot.pricing.elementary} />}
                {spot.pricing.preschool && <Row label="未就学児" value={spot.pricing.preschool} />}
                {spot.pricing.infant && <Row label="乳児" value={spot.pricing.infant} />}
              </dl>
            </section>
          )}

          {/* 子連れ設備 */}
          {spot.facilities && Object.keys(spot.facilities).length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontFamily: 'var(--font-mincho)', fontWeight: 600, margin: '0 0 8px' }}>
                子連れ向け設備
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                {(['bathroom', 'diaperChange', 'nursingRoom', 'kidsSpace', 'strollerRental'] as const).map((key) => {
                  const v = spot.facilities?.[key];
                  if (!v) return null;
                  return (
                    <li
                      key={key}
                      style={{
                        fontSize: 13,
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: v === 'yes' ? 'rgba(80, 160, 80, .08)' : 'rgba(180, 80, 80, .08)',
                        color: v === 'yes' ? 'rgb(40, 100, 40)' : 'rgb(120, 60, 60)',
                      }}
                    >
                      {v === 'yes' ? '✅' : '❌'} {FACILITY_LABEL[key]}
                    </li>
                  );
                })}
              </ul>
              {spot.facilities.note && (
                <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 8 }}>※ {spot.facilities.note}</p>
              )}
            </section>
          )}

          {/* 穴場ポイント */}
          {spot.hiddenTip && (
            <section
              style={{
                background: 'var(--peach-soft)',
                padding: '14px 18px',
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: 'var(--clay-deep)' }}>
                💡 穴場ポイント
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0 }}>{spot.hiddenTip}</p>
            </section>
          )}

          {/* 近隣スポット */}
          {nearbySpots.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontFamily: 'var(--font-mincho)', fontWeight: 600, margin: '0 0 12px' }}>
                近隣の子連れスポット
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {nearbySpots.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/spot/${n.slug}`}
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--line)',
                        background: 'var(--paper-card)',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mincho)', fontSize: 13, fontWeight: 600 }}>
                        {n.spot.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                        {SPOT_CATEGORY_LABEL[n.spot.category]} · {n.spot.ward ?? n.spot.city ?? ''}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 関連記事 */}
          {relatedArticles.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontFamily: 'var(--font-mincho)', fontWeight: 600, margin: '0 0 12px' }}>
                関連する記事
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {relatedArticles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/article/${a.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        background: 'var(--paper-card)',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      {a.hero && (
                        <span
                          aria-hidden
                          style={{
                            flex: '0 0 auto',
                            width: 56,
                            height: 40,
                            borderRadius: 6,
                            backgroundColor: 'var(--peach-soft)',
                            backgroundImage: `url(${a.hero})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )}
                      <span style={{ fontFamily: 'var(--font-mincho)', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
                        {a.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!indexable && (
            <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 24 }}>
              ※ このページは情報が十分でないため検索エンジンへのインデックスを控えています。
            </p>
          )}
          <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 24 }}>
            ※ 営業時間・料金などは変更される可能性があります。お出かけ前に公式サイトで最新情報をご確認ください。
          </p>
        </section>
      </main>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, padding: '4px 0' }}>
      <dt style={{ color: 'var(--ink-mute)', fontSize: 12 }}>{label}</dt>
      <dd style={{ margin: 0, fontSize: 13 }}>{value}</dd>
    </div>
  );
}
