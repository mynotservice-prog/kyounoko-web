import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import type { Spot, SpotCategory } from '@/lib/spots';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '子連れスポット一覧｜公園・水族館・動物園・室内遊び場まで【きょうのこスポットDB】',
  description:
    '0〜6歳の子ども連れで楽しめるスポット400件以上を、カテゴリ別（公園・水族館・動物園・室内遊び場・遊園地）に検索できる子連れスポットDB。設備・年齢・予算・最寄駅まで網羅し、子連れに最適な1日プランを見つけられます。',
  alternates: { canonical: '/spots' },
  openGraph: {
    title: '子連れスポット一覧｜きょうのこスポットDB',
    description: '0〜6歳子連れで使える公園・水族館・動物園・室内遊び場 400件以上',
    url: 'https://kyounoko.jp/spots',
    images: [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }],
  },
};

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

const FEATURED_CATEGORIES: { id: SpotCategory; emoji: string; label: string }[] = [
  { id: 'park', emoji: '🌳', label: '公園・自然' },
  { id: 'zoo', emoji: '🐘', label: '動物園' },
  { id: 'aquarium', emoji: '🐠', label: '水族館' },
  { id: 'museum', emoji: '🏛️', label: '博物館・科学館' },
  { id: 'indoor', emoji: '🎠', label: '室内遊び場' },
  { id: 'amusement', emoji: '🎡', label: '遊園地・テーマパーク' },
  { id: 'restaurant', emoji: '🍽️', label: '子連れレストラン' },
];

export default async function SpotsIndexPage() {
  const all = getAllSpotsWithSlug().filter((x) => isIndexable(x.spot));

  const byCat = FEATURED_CATEGORIES.map((cat) => ({
    ...cat,
    items: all.filter((x) => x.spot.category === cat.id).slice(0, 24),
  })).filter((c) => c.items.length > 0);

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '子連れスポット', item: 'https://kyounoko.jp/spots' },
    ],
  };
  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://kyounoko.jp/spots',
    name: '子連れスポット一覧',
    description: '0〜6歳子連れで使えるスポット400件以上のDB',
    inLanguage: 'ja',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <SiteHeader />
      <main className="container">
        <nav className="breadcrumb" aria-label="パンくず" style={{ padding: '12px 0 4px' }}>
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>子連れスポット</span>
        </nav>

        <section className="section" style={{ paddingTop: 8 }}>
          <h1
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 28,
              fontWeight: 700,
              margin: '4px 0 12px',
            }}
          >
            子連れスポット一覧｜きょうのこスポットDB
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.8, margin: '0 0 22px' }}>
            0〜6歳の子ども連れで楽しめるスポット **{all.length}件** を、公園・水族館・動物園・室内遊び場などカテゴリ別に整理しました。
            設備・年齢・予算・最寄駅情報から、子連れに最適な1日プランを見つけてください。
          </p>

          <div style={{ display: 'grid', gap: 36 }}>
            {byCat.map((cat) => (
              <section key={cat.id} id={cat.id}>
                <h2
                  style={{
                    fontFamily: 'var(--font-mincho)',
                    fontSize: 20,
                    fontWeight: 600,
                    margin: '0 0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span aria-hidden style={{ fontSize: 22 }}>
                    {cat.emoji}
                  </span>
                  {cat.label}
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-inter), sans-serif',
                      color: 'var(--ink-mute)',
                      fontWeight: 500,
                    }}
                  >
                    {cat.items.length}件
                  </span>
                </h2>

                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'grid',
                    gap: 8,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  }}
                >
                  {cat.items.map((x) => (
                    <li key={x.slug}>
                      <Link
                        href={`/spot/${x.slug}`}
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
                        <div
                          style={{
                            fontFamily: 'var(--font-mincho)',
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.5,
                          }}
                        >
                          {x.spot.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                          {x.spot.ward ?? x.spot.city ?? ''} · {SPOT_CATEGORY_LABEL[x.spot.category]}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
