import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkIcon } from '@/components/kk/KkIcon';

/**
 * スポットの地図埋め込み（P1-6）。
 *
 * Google Maps の埋め込み（`maps.google.com/maps?q=...&output=embed`）は APIキー不要で使える。
 * スポットに緯度経度は持たせていないため、施設名＋市区町村でクエリして位置を表示する。
 * loading="lazy" で LCP をブロックしない。
 * 見出しは従来どおり h2「地図・アクセス」（リニューアル2026-09で見た目のみ KkSectionTitle 化）。
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
    <div className="kk-sec sv3-sec">
      <KkSectionTitle as="h2" title="地図・アクセス" />
      <div className="sv3-map">
        <iframe
          src={embed}
          title={`${name}の地図`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="sv3-map-foot">
        {stationLabel && (
          <span className="sv3-map-station">
            <KkIcon name="train" size={15} sw={2} />
            {stationLabel}
          </span>
        )}
        <a href={open} target="_blank" rel="noopener noreferrer" className="sv3-map-open">
          Googleマップで開く
          <KkIcon name="arrow-right" size={14} sw={2} />
        </a>
      </div>
    </div>
  );
}
