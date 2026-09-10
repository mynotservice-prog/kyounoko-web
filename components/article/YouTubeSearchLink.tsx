import * as React from 'react';
import { KkIcon } from '@/components/kk/KkIcon';

export type YouTubeSearchLinkProps = {
  /** 検索クエリ（記事タイトルの主要部分を想定） */
  query: string;
  /** 表示ラベル。未指定なら「YouTubeで「{query}」を見る」 */
  label?: string;
};

/**
 * YouTube の検索結果ページに飛ばす控えめなリンク。
 *
 * 設計方針:
 * - 動画 ID を勝手に作らず、検索結果に誘導するだけなので著作権リスクなし。
 * - 全記事に即時適用可能。
 * - target=_blank + rel="noopener noreferrer"。
 *
 * 2026-09 リニューアル第3版: グラデーション＋影のピルをやめ、
 * 罫線のボタン（操作UIなので角丸は可）に。絵文字（📺 ↗）は線画アイコンへ置き換え。
 */
export function YouTubeSearchLink({ query, label }: YouTubeSearchLinkProps) {
  const q = (query ?? '').trim();
  if (!q) return null;

  const href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const displayLabel = label ?? `YouTubeで「${q}」を見る`;

  return (
    <aside className="av3-ytsearch" aria-label="YouTube で関連動画を探す">
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="av3-ytsearch-link">
        <span className="av3-ytsearch-ico" aria-hidden="true">
          <KkIcon name="search" size={16} />
        </span>
        <span className="av3-ytsearch-label">{displayLabel}</span>
        <span className="av3-ytsearch-arrow" aria-hidden="true">
          <KkIcon name="arrow-right" size={15} />
        </span>
      </a>
    </aside>
  );
}
