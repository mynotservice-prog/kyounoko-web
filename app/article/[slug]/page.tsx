import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getArticle, getArticleIds } from '@/lib/microcms';

export const revalidate = 3600; // 1時間ごとに再生成

type Props = {
  params: Promise<{ slug: string }>;
};

// 静的生成：全記事のパスを事前生成
export async function generateStaticParams() {
  try {
    const articles = await getArticleIds();
    return articles.map(a => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

// メタデータ動的生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: '記事が見つかりません' };

  return {
    title: article.title,
    description: article.metaDescription ?? article.lede?.substring(0, 120),
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAtManual ?? article.updatedAt,
      images: article.hero ? [{ url: article.hero.url, width: 1600, height: 900 }] : [],
    },
    alternates: { canonical: `/article/${slug}` },
    robots: article.noindex ? { index: false } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const publishedAt = new Date(article.publishedAt);
  const updatedAt = new Date(article.updatedAtManual ?? article.updatedAt);

  // JSON-LD
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAtManual ?? article.updatedAt,
    author: { '@type': 'Person', name: article.author?.name ?? 'ながみー' },
    publisher: { '@type': 'Organization', name: 'きょうのこ', logo: { '@type': 'ImageObject', url: 'https://kyounoko.jp/img/ogp-default.png' } },
    image: article.hero?.url,
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: article.category?.name ?? '', item: `https://kyounoko.jp/category/${article.category?.slug}` },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  };

  const jsonLdFaq = article.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: { '@type': 'Answer', text: q.answer },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}

      <SiteHeader currentCategory={article.category?.slug as never} />

      {/* Breadcrumb */}
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href={`/category/${article.category?.slug}`}>{article.category?.name}</Link>
          <span className="sep">/</span>
          <span>{article.title}</span>
        </nav>
      </div>

      {/* Article hero image */}
      {article.hero && (
        <div className="article-hero" style={{ maxWidth: 920, margin: '8px auto 32px', padding: '0 var(--pad)' }}>
          <div
            className="article-hero-img"
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 'var(--radius-lg)',
              backgroundImage: `url(${article.hero.url}?w=1600)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            role="img"
            aria-label={article.title}
          />
        </div>
      )}

      <article className="container-article">
        <header className="page-head">
          <Link href={`/category/${article.category?.slug}`} className="eyebrow" style={{ textDecoration: 'none' }}>
            Category · {article.category?.name}
          </Link>
          <h1>{article.title}</h1>
          <p className="lead">{article.lede}</p>
        </header>

        {/* Quick Info */}
        {(article.quickInfo_ageRanges || article.quickInfo_durationMin) && (
          <section
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 22px',
              margin: '32px 0 40px',
            }}
            aria-label="この記事のクイック情報"
          >
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              {article.quickInfo_ageRanges?.length && (
                <QuickItem label="AGE" value={article.quickInfo_ageRanges.join(' / ')} />
              )}
              {article.quickInfo_durationMin && (
                <QuickItem label="TIME" value={`${article.quickInfo_durationMin}分`} />
              )}
              {article.quickInfo_budget && (
                <QuickItem label="BUDGET" value={budgetLabel(article.quickInfo_budget)} />
              )}
              {article.quickInfo_weather?.length && (
                <QuickItem label="WEATHER" value={article.quickInfo_weather.join(' / ')} />
              )}
            </div>
          </section>
        )}

        {/* Conclusion */}
        {article.conclusion && (
          <section
            style={{
              background:
                'radial-gradient(circle at 85% 20%, rgba(244,183,135,0.35) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(235,192,106,0.25) 0%, transparent 55%), linear-gradient(135deg, #FFFBF3 0%, #FBE8D8 60%, #F8ECCB 100%)',
              border: '1px solid rgba(201, 96, 62, 0.18)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 26px',
              margin: '40px 0',
            }}
          >
            <span style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--clay)', fontWeight: 600, marginBottom: 14, display: 'block' }}>
              Conclusion · 先に知りたい人へ
            </span>
            <div className="prose" dangerouslySetInnerHTML={{ __html: article.conclusion }} />
          </section>
        )}

        {/* Body */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: article.body }} />

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <section style={{ margin: '56px 0 24px' }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontWeight: 600, fontSize: 22, margin: '0 0 16px' }}>
              よくある質問
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {article.faq.map((q, i) => (
                <details
                  key={i}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      padding: '16px 20px',
                      fontWeight: 600,
                      fontSize: '14.5px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mincho)',
                    }}
                  >
                    {q.question}
                  </summary>
                  <div
                    style={{
                      padding: '0 20px 18px',
                      fontSize: 14,
                      color: 'var(--ink-sub)',
                      borderTop: '1px solid var(--line)',
                    }}
                  >
                    <p style={{ margin: '14px 0 0' }}>{q.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Author box */}
        {article.author && (
          <section
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              margin: '56px 0 0',
              display: 'grid',
              gridTemplateColumns: '64px 1fr',
              gap: 20,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: 'var(--clay-soft)',
                color: 'var(--clay-deep)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 22,
                fontFamily: 'var(--font-mincho)',
              }}
            >
              こ
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-mincho)', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
                {article.author.name}
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '0 0 8px', lineHeight: 1.85 }}>
                {article.author.bio}
              </p>
              {article.author.credentials && (
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  {article.author.credentials}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontWeight: 600, fontSize: 22, margin: '0 0 20px' }}>
              関連する記事
            </h2>
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              }}
            >
              {article.relatedArticles.map(a => (
                <Link
                  key={a.id}
                  href={`/article/${a.slug}`}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: a.hero ? `url(${a.hero.url}?w=800)` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ padding: '16px 18px 20px' }}>
                    <h4 style={{ fontFamily: 'var(--font-mincho)', fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {a.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <SiteFooter />
      <MobileStickyNav active={article.category?.slug === 'today-doko' ? 'today-doko' : article.category?.slug === 'today-nani' ? 'today-nani' : article.category?.slug === 'today-taberu' ? 'today-taberu' : undefined} />
    </>
  );
}

function QuickItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 10, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mincho)' }}>{value}</span>
    </div>
  );
}

function budgetLabel(b: string) {
  switch (b) {
    case 'free': return '無料';
    case 'low': return '〜2,000円';
    case 'mid': return '〜5,000円';
    case 'high': return '5,000円〜';
    default: return b;
  }
}
