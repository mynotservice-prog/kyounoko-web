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

  const reservationLabel =
    spot.reservation === 'required' ? '要予約' :
    spot.reservation === 'recommended' ? '予約推奨' :
    '';

  const weekdayCrowd = spot.crowdLevel?.weekday;
  const holidayCrowd = spot.crowdLevel?.holiday;

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
        {budgetLabel && !spot.pricing && (
          <span style={{ padding: '2px 8px', background: '#f3efe8', color: 'var(--ink-sub)', borderRadius: 999 }}>
            {budgetLabel}
          </span>
        )}
        {reservationLabel && (
          <span
            style={{
              padding: '2px 8px',
              background: spot.reservation === 'required' ? '#f5e0d4' : '#f3efe8',
              color: spot.reservation === 'required' ? '#c4704f' : 'var(--ink-sub)',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {reservationLabel}
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

      {/* 料金（年齢別）詳細 */}
      {spot.pricing && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '2px 10px',
            fontSize: 11,
            background: '#faf7f1',
            padding: '8px 10px',
            borderRadius: 6,
          }}
        >
          {spot.pricing.adult && (
            <><span style={{ color: 'var(--ink-mute)' }}>大人</span><span>{spot.pricing.adult}</span></>
          )}
          {spot.pricing.elementary && (
            <><span style={{ color: 'var(--ink-mute)' }}>小中</span><span>{spot.pricing.elementary}</span></>
          )}
          {spot.pricing.preschool && (
            <><span style={{ color: 'var(--ink-mute)' }}>幼児</span><span>{spot.pricing.preschool}</span></>
          )}
          {spot.pricing.infant && (
            <><span style={{ color: 'var(--ink-mute)' }}>未満</span><span>{spot.pricing.infant}</span></>
          )}
        </div>
      )}

      {/* 混雑傾向 */}
      {(weekdayCrowd || holidayCrowd) && (
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-sub)' }}>
          {weekdayCrowd && <span>平日 {crowdIcon(weekdayCrowd)}</span>}
          {holidayCrowd && <span>休日 {crowdIcon(holidayCrowd)}</span>}
        </div>
      )}

      {/* 穴場ポイント（Instagramで一番ウケる情報） */}
      {spot.hiddenTip && (
        <div
          style={{
            background: '#fff9ef',
            borderLeft: '3px solid #e2b39a',
            padding: '8px 10px',
            fontSize: 11,
            color: 'var(--ink)',
            lineHeight: 1.6,
            borderRadius: '0 6px 6px 0',
          }}
        >
          <strong style={{ color: '#c4704f', fontSize: 10, letterSpacing: '.08em' }}>穴場ポイント</strong>
          <br />
          {spot.hiddenTip}
        </div>
      )}

      {/* 近隣セット提案 */}
      {spot.nearby && (
        <div style={{ fontSize: 11, color: 'var(--sage-deep)', lineHeight: 1.5 }}>
          → {spot.nearby}
        </div>
      )}
    </article>
  );
}

function crowdIcon(level: 'low' | 'mid' | 'high'): string {
  return level === 'low' ? '🟢 空いてる' : level === 'mid' ? '🟡 普通' : '🔴 混雑';
}
