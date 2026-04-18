import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getCategory, getCategories, getArticlesByCategory } from '@/lib/microcms';
import { getFileArticlesByCategory, type FileArticleMeta } from '@/lib/articles';

export const revalidate = 3600;

// MicroCMS未整備時のフォールバック（有効なカテゴリslugと日本語名のマッピング）
const FALLBACK_CATEGORIES: Record<string, { name: string; description: string; order: number }> = {
  'today-doko': { name: '今日どこ行く？', order: 1, description: '雨の日・猛暑日・ベビーカー前提・ワンオペでも。0〜6歳の子と安心して過ごせる場所を条件で絞り込みます。' },
  'today-nani': { name: '今日何する？', order: 2, description: '家で過ごす日の家遊び・工作・絵本。10分単位で、家にあるもので。' },
  'today-taberu': { name: '今日何食べる？', order: 3, description: '保育園帰りの15分ごはんから、冷凍で回すコツまで。毎日のごはんを軽く。' },
  'today-mawasu': { name: '今日どう回す？', order: 4, description: '夕方〜寝るまでの段取り。平日夜を乗り切る最小限のルーティン。' },
  'shippai-shinai': { name: '失敗しない外出', order: 5, description: '天気・年齢・持ち物。外出前の不安を3分で解消するチェックリスト。' },
  'tenki': { name: '天気で決める', order: 5, description: '雨・猛暑・強風。天気から今日の過ごし方を決める。' },
  'heijitsu-yoru': { name: '平日夜を回す', order: 6, description: '帰宅後〜就寝までの最短動線。共働きの味方になる工夫集。' },
  'gyouji': { name: '季節と行事', order: 5, description: '入園・運動会・七五三・ハロウィン。季節ごとの準備と過ごし方。' },
  'narai': { name: '習い事と学び', order: 6, description: '幼児の習い事と知育。何歳から・どう選ぶか。' },
  'yakudatsu': { name: '役立つもの', order: 7, description: '宅食・ミールキット・時短家電・ベビー用品。毎日を楽にする道具。' },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { contents } = await getCategories();
    if (contents.length > 0) {
      return contents.map(c => ({ slug: c.slug }));
    }
  } catch {
    // MicroCMS未整備時はフォールバックslugで生成
  }
  return Object.keys(FALLBACK_CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let category: { name: string; description?: string } | null = null;
  try {
    category = await getCategory(slug);
  } catch {
    // ignore
  }
  if (!category && FALLBACK_CATEGORIES[slug]) {
    category = FALLBACK_CATEGORIES[slug];
  }
  if (!category) return { title: 'カテゴリが見つかりません' };

  const description = category.description ?? `${category.name}に関する記事一覧です。`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.name}｜きょうのこ`,
      description,
      url: `https://kyounoko.jp/category/${slug}`,
      type: 'website',
      images: [{ url: '/img/ogp-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name}｜きょうのこ`,
      description,
      images: ['/img/ogp-default.jpg'],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category: Awaited<ReturnType<typeof getCategory>> | null = null;
  try {
    category = await getCategory(slug);
  } catch {
    // ignore - fallback
  }
  if (!category && FALLBACK_CATEGORIES[slug]) {
    const fb = FALLBACK_CATEGORIES[slug];
    category = { name: fb.name, slug: slug as never, description: fb.description, order: fb.order } as never;
  }
  if (!category) notFound();

  let articles: Awaited<ReturnType<typeof getArticlesByCategory>>['contents'] = [];
  try {
    const result = await getArticlesByCategory(slug, 24);
    articles = result.contents;
  } catch {
    // empty
  }

  // MicroCMS に記事がなければファイルベース記事をフォールバック表示
  const fileArticles: FileArticleMeta[] =
    articles.length === 0 ? getFileArticlesByCategory(slug) : [];

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: category.name, item: `https://kyounoko.jp/category/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <SiteHeader currentCategory={slug as never} />

      {/* Breadcrumb */}
      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>{category.name}</span>
        </nav>
      </div>

      {/* Category hero */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">Category · {category.order ? String(category.order).padStart(2, '0') : ''}</span>
            <h1>{category.name}</h1>
            {category.description && <p className="lead">{category.description}</p>}
          </header>
        </div>
      </section>

      {/* Age picker - TODO: /age/* ページ未実装のため一時非表示 */}

      {/* Articles grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Articles</span>
              <h2>{category.name}の記事</h2>
            </div>
            <span className="hint">{(articles.length + fileArticles.length)} 件</span>
          </div>

          {articles.length === 0 && fileArticles.length === 0 ? (
            <p style={{ color: 'var(--ink-sub)' }}>このカテゴリの記事は準備中です。</p>
          ) : (
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {articles.map(article => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
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
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: article.hero ? `url(${article.hero.url}?w=800)` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ padding: '16px 20px 22px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {article.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      {article.quickInfo_ageRanges?.slice(0, 1).map(age => (
                        <span key={age} className="meta-chip clay">{age}歳</span>
                      ))}
                      {article.quickInfo_place?.slice(0, 1).map(p => (
                        <span key={p} className="meta-chip sage">{p === 'home' ? '家' : p === 'indoor' ? '屋内' : '外'}</span>
                      ))}
                      {article.quickInfo_weather?.includes('rain') && (
                        <span className="meta-chip sky">雨OK</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {fileArticles.map(article => (
                <Link
                  key={`file-${article.slug}`}
                  href={`/article/${article.slug}`}
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
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: article.hero ? `url(${article.hero})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ padding: '16px 20px 22px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {article.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      {article.quickInfo?.ageRanges?.slice(0, 1).map(age => (
                        <span key={age} className="meta-chip clay">{age}歳</span>
                      ))}
                      {article.quickInfo?.place?.slice(0, 1).map(p => (
                        <span key={p} className="meta-chip sage">{p === 'home' ? '家' : p === 'indoor' ? '屋内' : '外'}</span>
                      ))}
                      {article.quickInfo?.weather?.includes('rain') && (
                        <span className="meta-chip sky">雨OK</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav active={slug === 'today-doko' || slug === 'today-nani' || slug === 'today-taberu' ? (slug as 'today-doko' | 'today-nani' | 'today-taberu') : undefined} />
    </>
  );
}
