import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow, V2ArticleRow } from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { FEATURE_PAGES, getFeaturePageBySlug } from '@/lib/feature-pages';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { spotToV2, articleToV2, featureToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

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
      images: [{ url: '/img/ogp-default-v2.webp', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: feature.title,
      description: feature.lede,
      images: ['/img/ogp-default-v2.webp'],
    },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeaturePageBySlug(slug);
  if (!feature) notFound();

  // 関連記事
  const allArticles = getAllFileArticles();
  const bySlug = new Map(allArticles.map((a) => [a.slug, a]));
  const articles = feature.articleSlugs
    .map((s) => bySlug.get(s))
    .filter((a): a is NonNullable<ReturnType<typeof bySlug.get>> => Boolean(a) && !a!.noindex);

  // スポット
  const spots = feature.spotFilter
    ? getAllSpotsWithSlug()
        .filter((x) => feature.spotFilter!(x.spot))
        .slice(0, feature.maxSpots ?? 12)
    : [];

  // 関連特集（自分以外）
  const relatedFeatures = FEATURE_PAGES.filter((f) => f.slug !== slug).slice(0, 4);

  // JSON-LD
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '特集', item: 'https://kyounoko.jp/feature' },
      { '@type': 'ListItem', position: 3, name: feature.title },
    ],
  };
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
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: feature.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const v2Feature = featureToV2(feature);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <V2Frame header="sub" active="features" backHref="/feature">
        {/* Hero */}
        <div className="v2-article-hero" style={{ height: 210 }}>
          <V2Img src={v2Feature.img} seed={'fa' + feature.slug} alt={feature.title} />
          <div className="v2-article-hero-grad"></div>
          <span className="v2-article-hero-cat">特集</span>
          <div className="v2-fa-hero-title">{feature.lede}</div>
        </div>

        <div className="v2-page-head" style={{ paddingTop: 16 }}>
          <h1 className="v2-page-h1" style={{ fontSize: 23, lineHeight: 1.35 }}>
            {feature.title}
          </h1>
          <div className="v2-tag-row" style={{ marginTop: 12 }}>
            {feature.themeTags.map((t, i) => (
              <V2Tag key={t} label={t} tone={i === 0 ? 'rain' : i === 1 ? 'feat' : 'age'} />
            ))}
          </div>
          <p className="v2-page-lead" style={{ marginTop: 13 }}>
            {feature.intro}
          </p>
        </div>

        {/* 関連スポット */}
        {spots.length > 0 && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>この特集のおすすめスポット
              </div>
            </div>
            <div className="v2-vlist">
              {spots.map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <V2SpotRow
                    key={x.slug}
                    spot={v}
                    rank={i + 1}
                    href={`/spot/${x.slug}`}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 関連記事 */}
        {articles.length > 0 && (
          <>
            <V2SectionHead title="関連記事" more="" />
            <div className="v2-section">
              {articles.slice(0, 8).map((a) => {
                const v = articleToV2(a);
                return (
                  <V2ArticleRow key={a.slug} a={v} href={`/article/${a.slug}`} />
                );
              })}
            </div>
          </>
        )}

        {/* 関連特集 */}
        <V2SectionHead title="関連特集" moreHref="/feature" />
        <div className="v2-hscroll">
          {relatedFeatures.map((f) => (
            <Link
              key={f.slug}
              href={`/feature/${f.slug}`}
              className="v2-feat-overlay"
            >
              <V2Img src={featureToV2(f).img} seed={f.slug + 'rel'} alt={f.title} />
              <div className="v2-feat-overlay-grad"></div>
              <div className="v2-feat-overlay-title">
                {f.title.length > 18 ? f.title.slice(0, 18) + '…' : f.title}
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        {feature.faq && feature.faq.length > 0 && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>よくある質問
              </div>
            </div>
            <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {feature.faq.map((q, i) => (
                <details key={i} className="v2-faq" open={i === 0}>
                  <summary className="v2-faq-q" style={{ listStyle: 'none', cursor: 'pointer' }}>
                    <span className="v2-faq-mark">Q</span>
                    {q.question}
                    <V2Icon
                      name="chevron-down"
                      size={18}
                      color="#bbb"
                      style={{ marginLeft: 'auto', flex: 'none' }}
                    />
                  </summary>
                  <div className="v2-faq-a">
                    <span className="v2-faq-mark a">A</span>
                    <span>{q.answer}</span>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
