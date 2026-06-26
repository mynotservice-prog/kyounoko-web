import Link from 'next/link';

/**
 * 共通パンくず。v2トークンで描画し、全subページで「現在地・戻り導線」を統一する。
 * 旧 .breadcrumb（--clay依存）に代わる、V2ページで色が浮かない版。
 */
export type Crumb = { label: string; href?: string };

export function V2Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="パンくず"
      className="container"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--ink-mute)',
        margin: '14px 0 4px',
      }}
    >
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span style={{ color: 'var(--ink-mute)', opacity: 0.6 }}>/</span>}
          {it.href ? (
            <Link href={it.href} style={{ color: 'var(--ink-sub)', textDecoration: 'none' }}>
              {it.label}
            </Link>
          ) : (
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
