import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getTag, getAllTags, getContentForTag, getTagsByKind } from '@/lib/tags';

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllTags().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) return { title: 'タグが見つかりません' };

  const { articles, plans } = getContentForTag(slug);
  const count = articles.length + plans.length;
  return {
    title: `${tag.name}の記事とプラン（${count}件）`,
    description: tag.description,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  const { articles, plans } = getContentForTag(slug);
  const relatedTags = getTagsByKind(tag.kind).filter((t) => t.slug !== slug).slice(0, 6);

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'タグ', item: 'https://kyounoko.jp/tag' },
      { '@type': 'ListItem', position: 3, name: tag.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>タグ</span>
          <span className="sep">/</span>
          <span>{tag.name}</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">Tag · {tag.kind}</span>
            <h1>{tag.name}</h1>
            <p className="lead">{tag.description}</p>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-mute)' }}>
              この条件にマッチする記事 {articles.length} 件、プラン {plans.length} 件
            </p>
          </header>
        </div>
      </section>

      {/* プラン一覧 */}
      {plans.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Plans</span>
                <h2>今日の行動プラン</h2>
              </div>
              <span className="hint">{plans.length} 件</span>
            </div>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {plans.slice(0, 24).map((p) => (
                <Link
                  key={p.id}
                  href={`/plan/${p.id}`}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {p.hero && (
                    <div style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${p.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14.5, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--ink-sub)', margin: '6px 0 0', lineHeight: 1.7 }}>
                      {p.shortAnswer}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {p.ageRanges[0] && <span className="meta-chip clay">{p.ageRanges[0]}歳</span>}
                      <span className="meta-chip ochre">{p.durationMin}分</span>
                      {p.budget && <span className="meta-chip sage">{p.budget}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 記事一覧 */}
      {articles.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Articles</span>
                <h2>関連する記事</h2>
              </div>
              <span className="hint">{articles.length} 件</span>
            </div>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
                  }}
                >
                  {a.hero && (
                    <div style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${a.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14.5, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 空状態 */}
      {articles.length === 0 && plans.length === 0 && (
        <section className="section">
          <div className="container" style={{ textAlign: 'center', color: 'var(--ink-sub)', padding: '60px 0' }}>
            <p>このタグに該当するコンテンツは準備中です。</p>
            <Link href="/" className="btn-primary-light" style={{ marginTop: 20, display: 'inline-flex' }}>トップへ戻る</Link>
          </div>
        </section>
      )}

      {/* 関連タグ */}
      {relatedTags.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Related tags</span>
                <h2>似たタグを見る</h2>
              </div>
            </div>
            <div className="outing-chips">
              {relatedTags.map((t) => (
                <Link key={t.slug} href={`/tag/${t.slug}`} className="outing-chip">
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
