import * as React from 'react';

export type PRBadgeProps = {
  /** 表示テキストを上書きしたいとき */
  text?: string;
  /** ラベル文言。編集方針5-4の区分に対応: 「PR」(アフィリエイト/タイアップ) / 「提供」(無償提供) */
  label?: string;
};

/**
 * 記事冒頭に置く開示バッジ（編集方針 5-3〜5-5 の区分表示）。
 * ステマ規制・景品表示法対応のため、広告・提供を含む記事である旨を明示する。
 */
export function PRBadge({
  text = '一部リンクから収益を得ています（アフィリエイト）。',
  label = 'PR',
}: PRBadgeProps) {
  return (
    <p className="affiliate-pr-badge" role="note">
      <span className="pr-label">{label}</span>
      <span className="affiliate-pr-badge-text">{text}</span>
    </p>
  );
}

/**
 * 無償提供（商品・写真提供のみ）記事用の開示バッジ。
 * 提供元名を明記し、金銭の授受が無いこと・編集の独立性を示す（編集方針 5-4）。
 */
export function ProvidedBadge({ providers }: { providers: string[] }) {
  return (
    <PRBadge
      label="提供"
      text={`本記事は${providers.join('、')}より写真の無償提供を受けています。金銭は受け取っておらず、内容は運営者が独自に構成しています。`}
    />
  );
}
