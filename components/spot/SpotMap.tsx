import { V2Icon } from '@/components/v2/V2Icon';

/**
 * スポットの地図埋め込み（P1-6）。
 *
 * Google Maps の埋め込み（`maps.google.com/maps?q=...&output=embed`）は APIキー不要で使える。
 * スポットに緯度経度は持たせていないため、施設名＋市区町村でクエリして位置を表示する。
 * loading="lazy" で LCP をブロックしない。
 */
export function SpotMap({
  name,
  area,
  stationLabel,
}: {
  name: string;
  /** 市区町村など位置の補足（精度向上） */
  area?: string;
  /** 「◯◯駅 徒歩◯分」等の表示用 */
  stationLabel?: string;
}) {
  const query = `${name} ${area ?? ''}`.trim();
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <>
      <div className="v2-sec-head">
        <h2 className="v2-sec-title">
          <span className="v2-bar-accent"></span>地図・アクセス
        </h2>
      </div>
      <div className="v2-section">
        <div
          style={{
            borderRadius: 'var(--v2-r-card)',
            overflow: 'hidden',
            border: '1px solid var(--v2-line)',
            boxShadow: 'var(--v2-sh-soft)',
          }}
        >
          <iframe
            src={embed}
            title={`${name}の地図`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ width: '100%', height: 220, border: 0, display: 'block' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {stationLabel && (
            <span style={{ fontSize: 12.5, color: 'var(--v2-ink-mute)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <V2Icon name="train" size={14} color="var(--v2-orange)" />
              {stationLabel}
            </span>
          )}
          <a
            href={open}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--v2-orange-deep, #c05a1e)', textDecoration: 'none', marginLeft: 'auto' }}
          >
            Googleマップで開く →
          </a>
        </div>
      </div>
    </>
  );
}
