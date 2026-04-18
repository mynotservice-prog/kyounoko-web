import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  description: 'お探しのページは移動または削除された可能性があります。',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <div style={{ padding: '96px 0 120px', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(96px, 18vw, 160px)',
              color: 'var(--clay)',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            404
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 'clamp(22px, 3.2vw, 28px)',
              fontWeight: 600,
              margin: '24px 0 16px',
              letterSpacing: '.02em',
            }}
          >
            お探しのページが見つかりませんでした
          </h1>
          <p
            style={{
              color: 'var(--ink-sub)',
              margin: '0 auto 36px',
              lineHeight: 1.9,
              maxWidth: 440,
            }}
          >
            URLが間違っているか、記事が移動・削除された可能性があります。トップから探すか、カテゴリから該当する記事を見つけてください。
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/" className="btn-primary">トップへ戻る</Link>
            <Link href="/#finder" className="btn-ghost">条件で探す</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
