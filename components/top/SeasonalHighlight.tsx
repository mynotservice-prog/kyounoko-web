import Link from 'next/link';
import type { FileArticleMeta } from '@/lib/articles';

export type SeasonalHighlightProps = {
  month: string;
  label: string;
  description: string;
  themes: string[];
  articles: FileArticleMeta[];
};

/**
 * 「今月の特集」セクション。
 * lib/seasonal-calendar.ts の今月エントリを表示。
 * 検索ボリュームが上がる時期の記事を上部に出して、流入と回遊を最大化。
 */
export function SeasonalHighlight({ month, label, description, themes, articles }: SeasonalHighlightProps) {
  if (articles.length === 0) return null;
  const monthLabel = `${parseInt(month, 10)}月`;
  return (
    <section className="section cv-auto-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: 11,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--clay)',
              fontWeight: 700,
            }}
          >
            Seasonal · {monthLabel}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
            }}
          >
            今月の特集｜{label}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '0 0 14px' }}>{description}</p>

        {/* テーマタグ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {themes.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-inter), sans-serif',
                color: 'var(--clay-deep)',
                background: 'var(--peach-soft)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              #{t}
            </span>
          ))}
        </div>

        {/* 記事リスト */}
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {articles.slice(0, 8).map((a) => (
            <Link
              key={a.slug}
              href={`/article/${a.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--line)',
                background: 'var(--paper-card, #fff)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform .25s ease, box-shadow .25s ease',
              }}
              className="seasonal-card"
            >
              {a.hero && (
                <span
                  aria-hidden
                  style={{
                    flex: '0 0 auto',
                    width: 64,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor: 'var(--peach-soft)',
                    backgroundImage: `url(${a.hero})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mincho)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {a.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
