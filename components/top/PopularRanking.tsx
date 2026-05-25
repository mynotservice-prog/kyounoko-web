import Link from 'next/link';

export type RankingItem = {
  rank: number;
  title: string;
  href: string;
  hero?: string;
  categoryName?: string;
};

/**
 * 「よく読まれている記事ランキング」セクション。
 * Search Console の実クリック数に基づく人気記事を順位つきで表示し、回遊を促す。
 */
export function PopularRanking({ items }: { items: RankingItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="section cv-auto-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
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
            Popular
          </span>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, fontWeight: 600, margin: 0 }}>
            よく読まれている記事
          </h2>
        </div>

        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md, 12px)',
                  border: '1px solid var(--line)',
                  background: 'var(--paper-card, #fff)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: '0 0 auto',
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: it.rank <= 3 ? '#fff' : 'var(--ink-sub)',
                    background:
                      it.rank === 1 ? '#e0a23c' :
                      it.rank === 2 ? '#b8b8b8' :
                      it.rank === 3 ? '#c98a5e' :
                      '#f1ece3',
                  }}
                >
                  {it.rank}
                </span>
                {it.hero && (
                  <span
                    aria-hidden
                    style={{
                      flex: '0 0 auto',
                      width: 56,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${it.hero})`,
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
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {it.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
