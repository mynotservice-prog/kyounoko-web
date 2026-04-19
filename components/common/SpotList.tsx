import { filterSpots, type Spot, type AgeTag, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { getAreaName } from '@/lib/area';

type Props = {
  area?: string;
  age?: AgeTag;
  place?: 'indoor' | 'outdoor';
  budget?: 'free' | 'low' | 'mid' | 'high';
  limit?: number;
  heading?: string;
};

/**
 * エリアに紐づく具体スポットを表示するカード一覧。
 * Plan/記事ページで「area が絞られているとき」に描画する。
 */
export function SpotList({
  area,
  age,
  place,
  budget,
  limit = 5,
  heading,
}: Props) {
  if (!area || area === 'all') return null;
  const spots = filterSpots(area, { age, place, budget, limit });
  if (spots.length === 0) return null;

  const areaName = getAreaName(area);
  const title = heading ?? `${areaName}のおすすめスポット`;

  return (
    <section style={{ marginTop: 40 }}>
      <h2
        style={{
          fontFamily: 'var(--font-mincho)',
          fontWeight: 600,
          fontSize: 22,
          margin: '0 0 8px',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 20px' }}>
        0〜6歳の子連れで人気の定番スポット。最新情報は各公式サイトでご確認ください。
      </p>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {spots.map((s) => (
          <SpotCard key={s.name} spot={s} />
        ))}
      </div>
    </section>
  );
}

function SpotCard({ spot }: { spot: Spot }) {
  const budgetLabel =
    spot.budget === 'free' ? '入園無料' :
    spot.budget === 'low' ? '〜1,500円目安' :
    spot.budget === 'mid' ? '〜3,000円目安' :
    spot.budget === 'high' ? '3,000円以上' : '';

  const placeLabel =
    spot.place === 'indoor' ? '屋内' :
    spot.place === 'outdoor' ? '屋外' :
    '屋内外';

  return (
    <article
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 10, letterSpacing: '.08em' }}>
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
          {placeLabel}
        </span>
        {budgetLabel && (
          <span style={{ padding: '2px 8px', background: '#f3efe8', color: 'var(--ink-sub)', borderRadius: 999 }}>
            {budgetLabel}
          </span>
        )}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-mincho)',
          fontSize: 16,
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {spot.name}
      </h3>
      {spot.city && (
        <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
          {spot.city}・対象 {spot.ages.join('/')}歳
        </div>
      )}
      {spot.note && (
        <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.6 }}>
          {spot.note}
        </p>
      )}
    </article>
  );
}
