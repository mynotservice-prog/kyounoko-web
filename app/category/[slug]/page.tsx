import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getCategory, getCategories, getArticlesByCategory } from '@/lib/microcms';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { contents } = await getCategories();
    return contents.map(c => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'カテゴリが見つかりません' };

  return {
    title: category.name,
    description: category.description ?? `${category.name}に関する記事一覧です。`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const { contents: articles } = await getArticlesByCategory(slug, 24);

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

      {/* Age picker */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">By age</span>
              <h2>年齢から探す</h2>
            </div>
            <span className="hint">0 — 6</span>
          </div>
          <div className="age-panels">
            <Link href={`/age/0-1/${slug}`} className="age-panel a">
              <div>
                <div className="age-num">0—1</div>
                <div className="age-label">ベビーカー前提</div>
                <div className="age-desc">おむつ替え / 離乳食</div>
              </div>
            </Link>
            <Link href={`/age/2-3/${slug}`} className="age-panel b">
              <div>
                <div className="age-num">2—3</div>
                <div className="age-label">走り回る時期</div>
                <div className="age-desc">軽食OK / 遊具</div>
              </div>
            </Link>
            <Link href={`/age/4-6/${slug}`} className="age-panel c">
              <div>
                <div className="age-num">4—6</div>
                <div className="age-label">体験が楽しめる</div>
                <div className="age-desc">屋外遊具 / 体験型</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Articles</span>
              <h2>{category.name}の記事</h2>
            </div>
            <span className="hint">{articles.length} 件</span>
          </div>

          {articles.length === 0 ? (
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
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav active={slug === 'today-doko' || slug === 'today-nani' || slug === 'today-taberu' ? (slug as 'today-doko' | 'today-nani' | 'today-taberu') : undefined} />
    </>
  );
}
