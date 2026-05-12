import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getArticle, getArticleIds } from '@/lib/microcms';
import {
  getAllFileArticleSlugs,
  getFileArticle,
  getRelatedFileArticles,
  type FileArticle,
  type FileArticleMeta,
} from '@/lib/articles';
import { ShareBar } from '@/components/article/ShareBar';
import { TableOfContents } from '@/components/article/TableOfContents';
import { PRBadge } from '@/components/affiliate/PRBadge';
import { AffiliateLinkGroup } from '@/components/affiliate/AffiliateLinkGroup';
import { RelatedItemsCTA } from '@/components/article/RelatedItemsCTA';
import { InlineItemCTA } from '@/components/article/InlineItemCTA';
import { getAffiliateProducts } from '@/lib/affiliate-products';
import { getRelatedItemsForArticle } from '@/lib/article-product-hints';
import { AdSlot } from '@/components/ads/AdSlot';
import { getTagsForArticle } from '@/lib/tags';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TriedButton } from '@/components/ui/TriedButton';
import { SpotList } from '@/components/common/SpotList';
import { EditorialDisclosure } from '@/components/article/EditorialDisclosure';
import { getExtraSchemasForArticle } from '@/lib/article-schema-enhancers';
import { buildStationLinkForArticle } from '@/lib/article-station-link';
import { getRelatedPlansForArticle } from '@/lib/cross-links';
import { CrossLinkCards } from '@/components/article/CrossLinkCards';

export const revalidate = 3600; // 1時間ごとに再生成

type Props = {
  params: Promise<{ slug: string }>;
};

// MicroCMS のカテゴリslug→日本語名フォールバック（ファイルベース記事用）
const CATEGORY_NAME_FALLBACK: Record<string, string> = {
  'today-doko': '今日どこ行く？',
  'today-nani': '今日何する？',
  'today-taberu': '今日何食べる？',
  'today-mawasu': '今日どう回す？',
  'shippai-shinai': '失敗しない外出',
  tenki: '天気で決める',
  'heijitsu-yoru': '平日夜を回す',
  gyouji: '季節と行事',
  narai: '習い事と学び',
  yakudatsu: '役立つもの',
};

// 静的生成：MicroCMSとファイルベース、両方のパスを事前生成
export async function generateStaticParams() {
  const slugs = new Set<string>();

  try {
    const articles = await getArticleIds();
    for (const a of articles) slugs.add(a.slug);
  } catch {
    // ignore - MicroCMS未整備
  }

  for (const s of getAllFileArticleSlugs()) slugs.add(s);

  return Array.from(slugs).map((slug) => ({ slug }));
}

// MicroCMS -> なければファイルベースからメタ取得
async function resolveArticle(slug: string): Promise<
  | { kind: 'microcms'; data: NonNullable<Awaited<ReturnType<typeof getArticle>>> }
  | { kind: 'file'; data: FileArticle }
  | null
> {
  try {
    const microCms = await getArticle(slug);
    if (microCms) return { kind: 'microcms', data: microCms };
  } catch {
    // ignore - fall through to file-based
  }

  const file = await getFileArticle(slug);
  if (file) return { kind: 'file', data: file };

  return null;
}

// メタデータ動的生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) return { title: '記事が見つかりません' };

  if (resolved.kind === 'microcms') {
    const article = resolved.data;
    const description = article.metaDescription ?? article.lede?.substring(0, 120);
    const ogImages = article.hero
      ? [{ url: article.hero.url, width: 1600, height: 900 }]
      : [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }];
    return {
      title: article.title,
      description,
      openGraph: {
        title: article.title,
        description,
        url: `https://kyounoko.jp/article/${slug}`,
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAtManual ?? article.updatedAt,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description,
        images: ogImages.map((i) => i.url),
      },
      alternates: { canonical: `/article/${slug}` },
      robots: article.noindex ? { index: false } : undefined,
    };
  }

  // file-based
  const article = resolved.data;
  const description = article.metaDescription ?? article.lede?.substring(0, 120);
  const ogImages = article.hero
    ? [{ url: article.hero, width: 1600, height: 900 }]
    : [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }];
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url: `https://kyounoko.jp/article/${slug}`,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: ogImages.map((i) => i.url),
    },
    alternates: { canonical: `/article/${slug}` },
    robots: article.noindex ? { index: false } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) notFound();

  if (resolved.kind === 'file') {
    return <FileArticleView article={resolved.data} />;
  }

  // ===== 以降、既存の MicroCMS 版レンダリング =====
  const article = resolved.data;

  // JSON-LD
  const articleUrl = `https://kyounoko.jp/article/${slug}`;
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    inLanguage: 'ja',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAtManual ?? article.updatedAt,
    author: {
      '@type': 'Person',
      '@id': 'https://kyounoko.jp/about#author',
      name: article.author?.name ?? 'ながみー',
      url: 'https://kyounoko.jp/about',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://kyounoko.jp/#organization',
      name: 'きょうのこ',
      url: 'https://kyounoko.jp',
      logo: { '@type': 'ImageObject', url: 'https://kyounoko.jp/img/ogp-default.jpg' },
    },
    image: article.hero?.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.page-head .lead'],
    },
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
      {/* LCP 改善: MicroCMS 記事の hero 画像を最優先で先読み */}
      {article.hero?.url && (
        <link rel="preload" as="image" href={`${article.hero.url}?w=1600`} fetchPriority="high" />
      )}
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

// ==========================================================================
// File-based article view
// ==========================================================================

function FileArticleView({ article }: { article: FileArticle }) {
  const categoryName = article.categoryName ?? CATEGORY_NAME_FALLBACK[article.category] ?? article.category;
  const heroUrlAbsolute = article.hero
    ? article.hero.startsWith('http')
      ? article.hero
      : `https://kyounoko.jp${article.hero}`
    : undefined;
  const articleUrl = `https://kyounoko.jp/article/${article.slug}`;
  const relatedArticles: FileArticleMeta[] = getRelatedFileArticles(
    article.slug,
    article.category,
    3,
  );
  // 記事 → プラン（クロスリンク）。記事の category / area / 年齢で最大3件
  const relatedPlans = getRelatedPlansForArticle(article, { limit: 3 });
  const publishedLabel = formatJaDate(article.publishedAt);
  const updatedLabel = formatJaDate(article.updatedAt);
  const showUpdated = publishedLabel !== updatedLabel;
  const affiliateProducts = getAffiliateProducts(article.slug);
  const hasAffiliate = affiliateProducts.length > 0;

  // 記事内インライン CTA 用：
  //   - アフィ対象記事なら先頭商品を、そうでなければキーワード推定の先頭商品を1点だけ使う。
  //   - どちらも該当しない記事では出さない（null）。
  const inlineCtaItem = hasAffiliate
    ? affiliateProducts[0]
    : getRelatedItemsForArticle(article.slug, article.category, article.title)[0];

  // 概算 wordCount（HTMLタグ除去後の文字数）。Google Article リッチリザルトの
  // 推奨フィールド。日本語は文字数 = ほぼ語数として扱う。
  const articleWordCount = (() => {
    const stripped = article.body.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    return stripped.length;
  })();

  // クロスリンクされたプランを mentions に積む（AEO 強化：エンティティ関係をクローラに明示）
  const mentions = relatedPlans.map((p) => ({
    '@type': 'HowTo' as const,
    name: p.title,
    description: p.shortAnswer,
    url: `https://kyounoko.jp/plan/${p.id}`,
  }));

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    inLanguage: 'ja',
    headline: article.title,
    description: article.tldr ?? article.metaDescription,
    abstract: article.tldr ?? undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    wordCount: articleWordCount,
    timeRequired: `PT${article.readingTimeMin}M`,
    ...(mentions.length > 0 ? { mentions } : {}),
    author: {
      '@type': 'Person',
      '@id': 'https://kyounoko.jp/about#author',
      name: 'ながみー',
      url: 'https://kyounoko.jp/about',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://kyounoko.jp/#organization',
      name: 'きょうのこ',
      url: 'https://kyounoko.jp',
      logo: { '@type': 'ImageObject', url: 'https://kyounoko.jp/img/ogp-default.jpg' },
    },
    image: heroUrlAbsolute,
    // canonical URL と一致した @id を持つ WebPage を mainEntityOfPage として参照
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl,
    },
    // AI読み上げ / 音声アシスタント向け：TL;DR と lede を音声候補として指定
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.tldr-text', '.page-head .lead'],
    },
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `https://kyounoko.jp/category/${article.category}`,
      },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  };

  const jsonLdFaq = article.faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faqItems.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: { '@type': 'Answer', text: q.answer },
        })),
      }
    : null;

  const jsonLdHowTo =
    article.howto && article.howto.length >= 3
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: article.title,
          description: article.tldr ?? article.metaDescription,
          image: heroUrlAbsolute,
          totalTime: article.quickInfo?.durationMin
            ? `PT${article.quickInfo.durationMin}M`
            : undefined,
          step: article.howto.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
          })),
        }
      : null;

  const jsonLdItemList =
    article.itemList && article.itemList.length >= 3
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: article.title,
          description: article.tldr ?? article.metaDescription,
          numberOfItems: article.itemList.length,
          itemListOrder: 'https://schema.org/ItemListOrderAscending',
          itemListElement: article.itemList.map((it) => ({
            '@type': 'ListItem',
            position: it.position,
            name: it.name,
            description: it.description,
          })),
        }
      : null;

  // 記事タイプ別の追加スキーマ（Recipe / Course / Event）
  const extraSchemas = getExtraSchemasForArticle(article, articleUrl, heroUrlAbsolute ?? '');

  const mobileActive =
    article.category === 'today-doko' ||
    article.category === 'today-nani' ||
    article.category === 'today-taberu'
      ? (article.category as 'today-doko' | 'today-nani' | 'today-taberu')
      : undefined;

  // 記事から関連する東京23区内の駅を推定し、駅ページへのCTAを生成
  const stationLink = buildStationLinkForArticle({
    title: article.title,
    metaDescription: article.metaDescription,
    body: article.body,
    quickInfo: article.quickInfo,
  });

  return (
    <>
      {/* LCP 改善: hero 画像を最優先で先読み（CSS background のため Next.js Image priority が効かない） */}
      {article.hero && (
        <link rel="preload" as="image" href={article.hero} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}
      {jsonLdHowTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      )}
      {jsonLdItemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
        />
      )}
      {/* 記事タイプ別の追加スキーマ: Recipe / Course / Event */}
      {extraSchemas.map((s, i) => (
        <script
          key={`extra-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      <SiteHeader currentCategory={article.category as never} />

      {/* Breadcrumb */}
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href={`/category/${article.category}`}>{categoryName}</Link>
          <span className="sep">/</span>
          <span>{article.title}</span>
        </nav>
      </div>

      {/* Article hero image */}
      {article.hero && (
        <div className="article-hero" style={{ maxWidth: 920, margin: '8px auto 32px', padding: '0 var(--pad)' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: 'var(--radius-lg)',
              backgroundImage: `url(${article.hero})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'var(--peach-soft)',
            }}
            role="img"
            aria-label={article.title}
          />
        </div>
      )}

      <article className="article-layout">
        <div className="article-main">
          <header className="page-head">
            <Link
              href={`/category/${article.category}`}
              className="eyebrow"
              style={{ textDecoration: 'none' }}
            >
              Category · {categoryName}
            </Link>

            {/* PR 開示: ヘッダ最上部に配置してファーストビューで表示（ステマ規制対応） */}
            {hasAffiliate && (
              <div style={{ margin: '12px 0 16px' }}>
                <PRBadge />
              </div>
            )}

            <h1>{article.title}</h1>

            {/* 記事メタ（読了時間・公開日・更新日） */}
            <div className="article-meta">
              <span className="article-meta-item">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                約{article.readingTimeMin}分で読める
              </span>
              <span className="article-meta-sep" aria-hidden="true">·</span>
              <span className="article-meta-item">
                <time dateTime={article.publishedAt}>公開 {publishedLabel}</time>
              </span>
              {showUpdated && (
                <>
                  <span className="article-meta-sep" aria-hidden="true">·</span>
                  <span className="article-meta-item">
                    <time dateTime={article.updatedAt}>更新 {updatedLabel}</time>
                  </span>
                </>
              )}
            </div>

            <p className="lead">{article.lede}</p>

            {/* お気に入り + やってみた */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <FavoriteButton kind="article" id={article.slug} size="md" />
              <TriedButton kind="article" id={article.slug} />
            </div>
          </header>

          {/* 「今日選ぶなら、これ。」— ランキング/N選/比較記事の断定ブロック */}
          {article.itemList && article.itemList.length > 0 && (
            <aside className="top-pick-box" aria-label="今日選ぶなら、これ">
              <span className="top-pick-eyebrow">Today&apos;s pick — 迷ったらこれ</span>
              <h2 className="top-pick-title">今日選ぶなら、これ。</h2>
              <div className="top-pick-name">{article.itemList[0].name}</div>
              {article.itemList[0].description && (
                <p className="top-pick-desc">{article.itemList[0].description}</p>
              )}
              <p className="top-pick-note">
                他の選択肢も比較したい方は、このまま本編をどうぞ。
              </p>
            </aside>
          )}

          {/* TL;DR — AI Overview 抽出を意識した要約ボックス */}
          {article.tldr && (
            <aside className="tldr-box" aria-label="この記事の要約">
              <span className="tldr-eyebrow">TL;DR · 先に結論</span>
              <p className="tldr-text">{article.tldr}</p>
            </aside>
          )}

          {/* 記事内インライン CTA（TL;DR 直後に 1 商品だけ） */}
          {inlineCtaItem && (
            <InlineItemCTA
              item={{
                href: inlineCtaItem.href,
                title: inlineCtaItem.title,
                subtitle: inlineCtaItem.subtitle,
                price: inlineCtaItem.price,
                imageUrl: inlineCtaItem.imageUrl,
                provider: inlineCtaItem.provider,
                pr: false,
              }}
            />
          )}

          {/* AdSense: 記事中途（TL;DR直後） */}
          <AdSlot placement="article-mid" />

          {/* Quick Info */}
          {article.quickInfo && (article.quickInfo.ageRanges?.length || article.quickInfo.durationMin) && (
            <section
              style={{
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 22px',
                margin: '32px 0 32px',
              }}
              aria-label="この記事のクイック情報"
            >
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                }}
              >
                {article.quickInfo.ageRanges?.length ? (
                  <QuickItem label="AGE" value={article.quickInfo.ageRanges.join(' / ') + '歳'} />
                ) : null}
                {article.quickInfo.durationMin ? (
                  <QuickItem label="TIME" value={`${article.quickInfo.durationMin}分`} />
                ) : null}
                {article.quickInfo.budget ? (
                  <QuickItem label="BUDGET" value={budgetLabel(article.quickInfo.budget)} />
                ) : null}
                {article.quickInfo.weather?.length ? (
                  <QuickItem label="WEATHER" value={article.quickInfo.weather.join(' / ')} />
                ) : null}
              </div>
            </section>
          )}

          {/* Mobile TOC */}
          <TableOfContents items={article.toc} variant="mobile" />

          {/* ランキング・比較記事には景表法対応の評価基準開示 */}
          {(article.slug.includes('ranking') || article.slug.includes('hikaku') || article.title.includes('ランキング') || article.title.includes('比較')) && (
            <EditorialDisclosure variant="ranking" />
          )}

          {/* Body */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: article.body }} />

          {/* エリア紐付き記事なら具体スポット一覧を提示 */}
          {article.area && article.area !== 'all' && (
            <SpotList
              area={article.area}
              age={article.quickInfo?.ageRanges?.[0] as '0-1' | '2-3' | '4-6' | undefined}
              limit={6}
            />
          )}

          {/* Share bar (body 直下) */}
          <ShareBar url={articleUrl} title={article.title} />

          {/* アフィリエイト商品リスト（対象記事のみ） */}
          {hasAffiliate && (
            <AffiliateLinkGroup
              heading="PICK UP"
              title="この記事で紹介したアイテム"
              items={affiliateProducts}
            />
          )}

          {/* 明示マッピング対象外の記事は、キーワード推定で関連商品を自動差し込み */}
          {!hasAffiliate && (
            <RelatedItemsCTA
              items={getRelatedItemsForArticle(article.slug, article.category, article.title)}
            />
          )}

          {/* AdSense: 記事末尾（FAQ前） */}
          <AdSlot placement="article-end" />

          {/* FAQ */}
          {article.faqItems.length > 0 && (
            <section style={{ margin: '56px 0 24px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontWeight: 600,
                  fontSize: 22,
                  margin: '0 0 16px',
                }}
              >
                よくある質問
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {article.faqItems.map((q, i) => (
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
                        lineHeight: 1.85,
                      }}
                    >
                      <p style={{ margin: '14px 0 0', whiteSpace: 'pre-wrap' }}>{q.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 駅ページへのCTA（東京23区記事のみ。駅検出できた場合のみ表示） */}
          {stationLink && (
            <section style={{ margin: '48px 0 0' }}>
              <Link href={stationLink.href} style={{
                display: 'block',
                background: 'linear-gradient(135deg, rgba(201,96,62,0.08), rgba(201,96,62,0.03))',
                border: '1px solid rgba(201,96,62,0.20)',
                borderRadius: 16,
                padding: '20px 24px',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 11, color: 'var(--clay-deep)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
                      ALSO RECOMMENDED · 駅から探す
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>
                      {stationLink.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                      ベビーカーOK・キッズメニュー・個室・離乳食持込まで全項目チェック
                    </div>
                  </div>
                  <span style={{
                    fontSize: 22, color: 'var(--clay-deep)', flexShrink: 0,
                  }}>→</span>
                </div>
              </Link>
            </section>
          )}

          {/* AdSense Multiplex（関連コンテンツ風 / 回遊喚起） */}
          <AdSlot placement="article-related" style={{ marginTop: 32 }} />

          {/* Author box */}
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
              <p
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontSize: 15,
                  fontWeight: 600,
                  margin: '0 0 6px',
                }}
              >
                ながみー（きょうのこ運営）
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--ink-sub)',
                  margin: 0,
                  lineHeight: 1.85,
                }}
              >
                共働き家庭で子育て中の運営者。「今日どうする？」を決めやすくするためのサイトを運営しています。
              </p>
            </div>
          </section>

          {/* Share bar (author 直下) */}
          <ShareBar url={articleUrl} title={article.title} label="記事をシェアする" />

          {/* タグ（トピッククラスター導線） */}
          {(() => {
            const tags = getTagsForArticle(article);
            if (tags.length === 0) return null;
            return (
              <section style={{ marginTop: 40 }}>
                <span className="eyebrow">Tags · トピックで探す</span>
                <div className="outing-chips" style={{ marginTop: 12 }}>
                  {tags.slice(0, 8).map((t) => (
                    <Link key={t.slug} href={`/tag/${t.slug}`} className="outing-chip">
                      {t.name}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* この記事の悩みに使えるプラン（記事 → プランの双方向リンク） */}
          {relatedPlans.length > 0 && (
            <CrossLinkCards
              eyebrow="Today's plan · この記事の悩みに使えるプラン"
              heading="今日そのまま試せる行動プラン"
              defaultEyebrow="Plan"
              items={relatedPlans.map((p) => ({
                href: `/plan/${p.id}`,
                title: p.title,
                description: p.shortAnswer,
                hero: p.hero,
                eyebrow: p.kind === 'meal' ? 'Meal plan' : 'Activity plan',
              }))}
            />
          )}

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section style={{ marginTop: 56 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontWeight: 600,
                  fontSize: 22,
                  margin: '0 0 20px',
                }}
              >
                関連する記事
              </h2>
              <div
                style={{
                  display: 'grid',
                  gap: 20,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                }}
              >
                {relatedArticles.map((a) => (
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
                      transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
                    }}
                    className="related-card"
                  >
                    <div
                      style={{
                        aspectRatio: '16/10',
                        backgroundColor: 'var(--peach-soft)',
                        backgroundImage: a.hero ? `url(${a.hero})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ padding: '14px 16px 18px' }}>
                      <h4
                        style={{
                          fontFamily: 'var(--font-mincho)',
                          fontSize: 14.5,
                          fontWeight: 600,
                          margin: 0,
                          lineHeight: 1.55,
                        }}
                      >
                        {a.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Desktop TOC sidebar */}
        <aside className="article-sidebar" aria-label="記事目次">
          <div className="article-sidebar-inner">
            <TableOfContents items={article.toc} variant="desktop" />
          </div>
        </aside>
      </article>

      <SiteFooter />
      <MobileStickyNav active={mobileActive} />
    </>
  );
}

function formatJaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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
