import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon } from '@/components/kk/KkIcon';
import { SEASONAL_CALENDAR } from '@/lib/seasonal-calendar';
import { SEASON_FEATURE, seasonOf } from '@/lib/feature-pages';

/**
 * 季節バナー。今月（ビルド/再検証時点）の季節画像（public/v2/seasons 既存）と
 * SEASONAL_CALENDAR の今月ラベルを出す。
 * 遷移先は季節の特集ページ（lib/feature-pages の SEASON_FEATURE。現状は夏・秋のみ）。無い季節は季節と行事カテゴリへ。
 */
export function TopSeasonBanner() {
  const month = new Date().getMonth() + 1;
  const entry = SEASONAL_CALENDAR.find((e) => e.month === String(month).padStart(2, '0'));
  const season = seasonOf(month);
  const label = entry?.label ?? '季節と行事';
  const featureSlug = SEASON_FEATURE[season];
  const href = featureSlug ? `/feature/${featureSlug}` : '/category/gyouji';
  return (
    <Link href={href} className="tv3-season" aria-label={`${month}月の特集: ${label}`}>
      <V2Img src={`/v2/seasons/${season}-banner.webp`} seed={`season-${season}`} alt="" className="tv3-season-bg" />
      <span className="tv3-season-body">
        <span className="tv3-season-eyebrow">{month}月の特集</span>
        <span className="tv3-season-title">{label}</span>
        {entry?.description && <span className="tv3-season-desc">{entry.description}</span>}
        <span className="tv3-season-cta">
          {featureSlug ? '特集を見る' : '季節と行事の記事を見る'}
          <KkIcon name="arrow-right" size={13} sw={2.2} />
        </span>
      </span>
    </Link>
  );
}
