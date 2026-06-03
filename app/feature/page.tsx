import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { FEATURE_PAGES } from '@/lib/feature-pages';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '特集まとめ｜きょうのこ',
  description:
    '夏休み・雨の日・無料スポット・赤ちゃん連れOKなど、子連れのテーマ別おでかけ＆暮らし特集を一覧で紹介。',
  alternates: { canonical: '/feature' },
};

export default function FeatureIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="container">
        <nav className="breadcrumb" aria-label="パンくず" style={{ padding: '12px 0 4px' }}>
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>特集</span>
        </nav>

        <section className="section" style={{ paddingTop: 12 }}>
          <header className="page-head">
            <span className="eyebrow">Features</span>
            <h1>特集まとめ</h1>
            <p className="lead" style={{ marginTop: 4 }}>
              季節・テーマ別に、子連れで役立つ情報を1ページに集約した特集ページです。
            </p>
          </header>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '24px 0 0',
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {FEATURE_PAGES.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/feature/${f.slug}`}
                  style={{
                    display: 'block',
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    background: 'var(--paper-card)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mincho)',
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.7 }}>
                    {f.lede}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {f.themeTags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          color: 'var(--clay-deep)',
                          background: 'var(--peach-soft)',
                          padding: '3px 8px',
                          borderRadius: 999,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
