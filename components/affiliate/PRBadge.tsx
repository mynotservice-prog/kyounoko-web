import * as React from 'react';

export type PRBadgeProps = {
  /** 表示テキストを上書きしたいとき */
  text?: string;
};

/**
 * 記事冒頭に置くアフィリエイト開示バッジ。
 * ステマ規制・景品表示法対応のため、広告を含む記事である旨を明示する。
 */
export function PRBadge({
  text = '一部リンクから収益を得ています（アフィリエイト）。',
}: PRBadgeProps) {
  return (
    <p className="affiliate-pr-badge" role="note">
      <span className="pr-label">PR</span>
      <span className="affiliate-pr-badge-text">{text}</span>
    </p>
  );
}
