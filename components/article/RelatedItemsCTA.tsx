import * as React from 'react';
import { AffiliateLink, type AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';

export type RelatedItemsCTAProps = {
  /** 表示する商品（空配列なら何も描画しない） */
  items: AffiliateLinkProps[];
  /** 見出しラベル（未指定時は「この記事を読んだ方におすすめの商品」） */
  label?: string;
};

/**
 * 「記事と親和性のある商品」を本文末尾に控えめに差し込む CTA セクション。
 *
 * - AffiliateLinkGroup と同じく PR 開示を必ず表示
 * - AffiliateLink は rel="sponsored nofollow noopener" を自動付与（継承される）
 * - デスクトップでは横長 2 カラム、モバイルでは 1 カラムに
 * - items が空なら null（セクション自体を出さない）
 */
export function RelatedItemsCTA({ items, label }: RelatedItemsCTAProps) {
  if (!items || items.length === 0) return null;

  const heading = label ?? 'この記事を読んだ方におすすめの商品';

  return (
    <section
      className="related-items-cta"
      aria-label={heading}
    >
      <p className="related-items-cta-pr" role="note">
        <span className="pr-label">PR</span>
        <span>
          ※本エリアは広告を含みます。リンク経由で購入があった場合、運営に収益が発生することがあります。
        </span>
      </p>
      <h3 className="related-items-cta-title">{heading}</h3>
      <div className="related-items-cta-grid">
        {items.map((item) => (
          <AffiliateLink key={item.href + item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
