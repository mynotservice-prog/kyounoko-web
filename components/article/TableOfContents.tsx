import type { TocItem } from '@/lib/articles';

type Props = {
  items: TocItem[];
  variant: 'mobile' | 'desktop';
};

/**
 * 目次。H2 のみ表示（H3 は含めない）。
 * - mobile: <details> で折りたたみ。本文上に配置。
 * - desktop: 右サイドバー。呼び出し側で sticky ラッパーに入れる。
 */
export function TableOfContents({ items, variant }: Props) {
  // H2 のみ対象
  const h2Items = items.filter((i) => i.level === 2);
  if (h2Items.length < 3) return null;

  if (variant === 'mobile') {
    return (
      <details className="toc toc-mobile">
        <summary>
          <span className="toc-label">目次</span>
          <span className="toc-count">{h2Items.length}項目</span>
          <svg
            className="toc-caret"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <ol className="toc-list">
          {h2Items.map((item, i) => (
            <li key={item.id} className="toc-item">
              <a href={`#${item.id}`}>
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-text">{item.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </details>
    );
  }

  // desktop
  return (
    <nav className="toc toc-desktop" aria-label="目次">
      <div className="toc-head">
        <span className="toc-eyebrow">On this page</span>
        <span className="toc-title">目次</span>
      </div>
      <ol className="toc-list">
        {h2Items.map((item, i) => (
          <li key={item.id} className="toc-item">
            <a href={`#${item.id}`}>
              <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="toc-text">{item.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
