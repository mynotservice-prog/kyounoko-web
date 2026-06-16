import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin · きょうのこ',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--paper-base)', minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--line)',
          background: '#fff',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/admin"
          style={{
            fontFamily: 'var(--font-mincho)',
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          管理画面
        </Link>
        <nav style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <Link href="/admin/kpi" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>📈 経営KPI</Link>
          <Link href="/admin/insights" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>📊 Insights</Link>
          <Link href="/admin/events" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>📡 Events</Link>
          <Link href="/admin/ab" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>🧪 A/B</Link>
          <Link href="/admin/seo" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>📈 SEO</Link>
          <Link href="/admin/image-gen" style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}>🎨 Image Gen</Link>
          <Link href="/admin/articles" style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>記事</Link>
          <Link href="/admin/plans" style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>プラン</Link>
          <Link href="/admin/spots" style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>スポット</Link>
          <Link href="/admin/spots/edit" style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>スポット編集</Link>
          <Link href="/admin/events/edit" style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>イベント編集</Link>
        </nav>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-mute)' }}>
          内部管理用 · noindex
        </div>
      </header>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 80px' }}>
        {children}
      </main>
    </div>
  );
}
