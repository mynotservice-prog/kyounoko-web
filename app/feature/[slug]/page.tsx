import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { FEATURE_PAGES, getFeaturePageBySlug } from '@/lib/feature-pages';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '@/lib/spots';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return FEATURE_PAGES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeaturePageBySlug(slug);
  if (!feature) return { title: '特集が見つかりません' };
  return {
    title: feature.title,
    description: feature.lede,
    alternates: { canonical: `/feature/${slug}` },
    openGraph: {
      title: feature.title,
      description: feature.lede,
      url: `https://kyounoko.jp/feature/${slug}`,
      type: 'website',
      images: [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: feature.title,
      description: feature.lede,
      images: ['/img/ogp-default.jpg'],
    },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeaturePageBySlug(slug);
  if (!feature) notFound();

  // 関連記事を順序通りに引く（存在しない slug は無視）
  const allArticles = getAllFileArticles();
  const bySlug = new Map(allArticles.map((a) => [a.slug, a]));
  const articles = feature.articleSlugs
    .map((s) => bySlug.get(s))
    .filter((a): a is NonNullable<ReturnType<typeof bySlug.get>> => Boolean(a) && !a!.noindex);

  // スポットフィルタ
  const spots = feature.spotFilter
    ? getAllSpotsWithSlug()
        .filter((x) => feature.spotFilter!(x.spot))
        .slice(0, feature.maxSpots ?? 12)
    : [];

  // JSON-LD: BreadcrumbList
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '特集', item: 'https://kyounoko.jp/feature' },
      { '@type': 'ListItem', position: 3, name: feature.title },
    ],
  };

  // JSON-LD: CollectionPage + ItemList（記事+スポット混在）
  const itemListElement = [
    ...articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://kyounoko.jp/article/${a.slug}`,
      name: a.title,
    })),
    ...spots.map((x, i) => ({
      '@type': 'ListItem',
      position: articles.length + i + 1,
      url: `https://kyounoko.jp/spot/${x.slug}`,
      name: x.spot.name,
    })),
  ];
  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: feature.title,
    description: feature.lede,
    url: `https://kyounoko.jp/feature/${slug}`,
    inLanguage: 'ja',
    isFamilyFriendly: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement,
    },
  };

  // JSON-LD: FAQPage
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: feature.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず" style={{ padding: '12px 0 4px' }}>
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>特集</span>
          <span className="sep">/</span>
          <span>{feature.title.replace(/【[^】]+】/, '').slice(0, 24)}</span>
        </nav>
      </div>

      <main className="container">
        {/* Hero */}
        <section className="section" style={{ paddingTop: 12 }}>
          <header className="page-head">
            <span className="eyebrow">Feature</span>
            <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, lineHeight: 1.45 }}>{feature.title}</h1>
            <p className="lead" style={{ marginTop: 6 }}>{feature.lede}</p>
          </header>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {feature.themeTags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  color: 'var(--clay-deep)',
                  background: 'var(--peach-soft)',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                #{t}
              </span>
            ))}
          </div>

          <p style={{ marginTop: 18, fontSize: 14.5, lineHeight: 1.95, color: 'var(--ink)' }}>
            {feature.intro}
          </p>
        </section>

        {/* 関連記事 */}
        {articles.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Related Articles</span>
                <h2>関連記事</h2>
              </div>
              <span className="hint">{articles.length} 件</span>
            </div>
            <div
              style={{
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/article/${a.slug}`}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--peach-soft)', overflow: 'hidden' }}>
                    {a.hero && (
                      <img
                        src={a.hero}
                        alt={a.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </div>
                  <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 関連スポット */}
        {spots.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Related Spots</span>
                <h2>関連するスポット</h2>
              </div>
              <span className="hint">{spots.length} 件</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 10,
              }}
            >
              {spots.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={`/spot/${x.slug}`}
                    style={{
                      display: 'block',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--line)',
                      background: 'var(--paper-card)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mincho)', fontSize: 14, fontWeight: 600 }}>
                      {x.spot.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
                      {SPOT_CATEGORY_LABEL[x.spot.category]} · {x.spot.ward ?? x.spot.city ?? ''}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">FAQ</span>
              <h2>この特集のよくある質問</h2>
            </div>
          </div>
          <div
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 4px',
            }}
          >
            {feature.faq.map((f, idx) => (
              <details
                key={idx}
                style={{
                  borderBottom: idx === feature.faq.length - 1 ? 'none' : '1px solid var(--line)',
                  padding: '14px 20px',
                }}
              >
                <summary
                  style={{
                    fontFamily: 'var(--font-mincho)',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    lineHeight: 1.55,
                    color: 'var(--clay-deep)',
                  }}
                >
                  Q. {f.question}
                </summary>
                <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.85, color: 'var(--ink)' }}>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
