import * as React from 'react';
import { AffiliateLink, type AffiliateLinkProps } from './AffiliateLink';

export type AffiliateLinkGroupProps = {
  items: AffiliateLinkProps[];
  /** グループ内の見出し（h3 相当） */
  title?: string;
  /** eyebrow 用の小見出し（例: "PICK UP" など） */
  heading?: string;
};

/**
 * アフィリエイトリンクの縦並びラッパー。
 * 先頭に広告表示（PR ノート）を出して、広告であることをユーザーに明示する。
 */
export function AffiliateLinkGroup({
  items,
  title,
  heading,
}: AffiliateLinkGroupProps) {
  if (items.length === 0) return null;

  return (
    <section className="affiliate-group" aria-label={title ?? 'おすすめアイテム'}>
      <p className="affiliate-pr-note" role="note">
        <span className="pr-label">PR</span>
        <span>※本エリアは広告を含みます。リンク経由で購入があった場合、運営に収益が発生することがあります。</span>
      </p>
      {heading && <span className="affiliate-group-eyebrow">{heading}</span>}
      {title && <h3 className="affiliate-group-title">{title}</h3>}
      <div className="affiliate-group-list">
        {items.map((item) => (
          <AffiliateLink key={item.href + item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
