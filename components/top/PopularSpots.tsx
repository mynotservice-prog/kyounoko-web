import Link from 'next/link';
import { SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { getPopularSpotsFromGA4 } from '@/lib/ga4-popularity';
import { getAreaName } from '@/lib/area';

/**
 * 「ママが選ぶ人気スポット」セクション。
 *
 * Spot.popular = true でエディターが選定したスポットをトップページに6件表示。
 * @chia_odekake や @akane345k 等のInstagram人気アカウントと同様に、
 * 「具体的な施設名で毎日刺さる」体験を提供する。
 *
 * 将来的に GA4 PV連動に差し替え可能な設計（getPopularSpots の実装を差し替えるだけ）。
 */
export async function PopularSpots() {
  const picks = await getPopularSpotsFromGA4(6);
  if (picks.length === 0) return null;

  return (
    <section className="section cv-auto-section" style={{ paddingTop: 40 }}>
      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <span className="eyebrow">Editor's pick</span>
          <h2
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 24,
              fontWeight: 600,
              margin: '6px 0 10px',
            }}
          >
            ママが選ぶ、この1箇所。
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.65, maxWidth: 640 }}>
            きょうのこ編集部が「迷ったらここ」と自信を持って送り出せるスポット。
            0〜6歳の子連れで実際に使える施設を、料金と穴場ポイントまでセットでご案内します。
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {picks.map(({ area, spot }) => (
            <Link
              key={`${area}-${spot.name}`}
              href={`/today?area=${area}`}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    background: 'var(--sage-pale)',
                    color: 'var(--sage-deep)',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {SPOT_CATEGORY_LABEL[spot.category]}
                </span>
                <span style={{ padding: '2px 8px', background: 'var(--peach-soft)', color: 'var(--clay)', borderRadius: 999 }}>
                  {getAreaName(area)}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontSize: 15,
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {spot.name}
              </h3>

              {spot.pricing?.adult && (
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                  大人 {spot.pricing.adult}
                  {spot.pricing.infant && ` / 未満 ${spot.pricing.infant}`}
                </div>
              )}

              {spot.hiddenTip && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-sub)',
                    margin: 0,
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ color: '#c4704f', fontWeight: 600 }}>★ </span>
                  {spot.hiddenTip}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
