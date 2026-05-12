import * as React from 'react';

export type YouTubeSearchLinkProps = {
  /** 検索クエリ（記事タイトルの主要部分を想定） */
  query: string;
  /** 表示ラベル。未指定なら「YouTubeで「{query}」を見る」 */
  label?: string;
};

/**
 * YouTube の検索結果ページに飛ばす控えめなチップ風ボタン。
 *
 * 設計方針:
 * - 動画 ID を勝手に作らず、検索結果に誘導するだけなので著作権リスクなし。
 * - 全記事に即時適用可能。
 * - target=_blank + rel="noopener noreferrer"。
 */
export function YouTubeSearchLink({ query, label }: YouTubeSearchLinkProps) {
  const q = (query ?? '').trim();
  if (!q) return null;

  const href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const displayLabel = label ?? `YouTubeで「${q}」を見る`;

  return (
    <aside
      className="youtube-search-link"
      aria-label="YouTube で関連動画を探す"
      style={{
        margin: '32px 0',
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #FFFBF3 0%, #FBE8D8 100%)',
          border: '1px solid rgba(201, 96, 62, 0.22)',
          borderRadius: 999,
          color: 'var(--ink, #2b2b2b)',
          textDecoration: 'none',
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: 'var(--font-mincho), serif',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          maxWidth: '100%',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>
          📺
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </span>
        <span aria-hidden="true" style={{ fontSize: 14, color: 'var(--clay-deep, #a85a3c)' }}>
          ↗
        </span>
      </a>
    </aside>
  );
}
