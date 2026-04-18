import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <div style={{ padding: '80px 0 80px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 120, color: 'var(--clay)', lineHeight: 1 }}>
            404
          </span>
          <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 28, fontWeight: 600, margin: '24px 0 16px' }}>
            お探しのページが見つかりませんでした
          </h1>
          <p style={{ color: 'var(--ink-sub)', margin: '0 0 32px' }}>
            URLを確認するか、トップへ戻ってください。
          </p>
          <Link href="/" className="btn-primary">トップへ戻る</Link>
        </div>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
