import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '役立つもの',
  description:
    '子育てを楽にする宅食・ミールキット・時短家電・ベビー用品をレビュー。実際に使ってみた結果だけを掲載します。',
  alternates: { canonical: '/items' },
};

export default function ItemsPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '役立つもの', item: 'https://kyounoko.jp/items' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <SiteHeader currentCategory="items" />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>役立つもの</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">Items · 役立つもの</span>
            <h1>毎日を軽くする、使ってよかったもの。</h1>
            <p className="lead">
              宅食・ミールキット・時短家電・ベビー用品。実際に使ってみて、
              <br />
              「これは本当に助かった」と感じたものだけを紹介していきます。
            </p>
          </header>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mincho)',
                fontSize: 20,
                marginBottom: 12,
              }}
            >
              現在、このページは準備中です。
            </p>
            <p style={{ color: 'var(--ink-sub)', lineHeight: 1.8 }}>
              実際に試した宅食や時短家電のレビューを、準備でき次第ここに並べていきます。
              <br />
              先にトップから「今日どうする？」の条件検索を試してみてください。
            </p>
            <div style={{ marginTop: 20 }}>
              <Link href="/#finder" className="btn-primary">
                条件で探す
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
