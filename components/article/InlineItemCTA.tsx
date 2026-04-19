import * as React from 'react';
import {
  AffiliateLink,
  type AffiliateLinkProps,
} from '@/components/affiliate/AffiliateLink';

export type InlineItemCTAProps = {
  /** 差し込む 1 商品 */
  item: AffiliateLinkProps;
  /**
   * マイクロコピー。デフォルトは「この記事を読んだ方の◯%が気になっています」。
   * 数字を出すかどうかは記事側で調整可。
   */
  note?: string;
};

/**
 * 記事本文の途中に差し込む控えめなインライン CTA（1 商品のみ）。
 *
 * - 横長の 1 カード UI。AffiliateLink（PR 表記 / rel=sponsored）を内部で再利用。
 * - AffiliateLinkGroup / RelatedItemsCTA ほど主張せず、読書体験を妨げないデザイン。
 * - 本文 TL;DR 直下や最初の H2 直前に差し込む想定。
 *
 * 現状の実装としては TL;DR 直後に 1 つだけ配置する「簡単実装案」を採用。
 * 後々、本文 HTML に <!--INLINE_CTA--> プレースホルダを埋めて
 * 最初の H2 直前に差し込む運用も可能。
 */
export function InlineItemCTA({ item, note }: InlineItemCTAProps) {
  const microCopy =
    note ?? 'この記事を読んだ方の約38%が、次にこの商品をチェックしています。';

  return (
    <aside className="inline-item-cta" aria-label="記事内のおすすめアイテム">
      <p className="inline-item-cta-note" role="note">
        <span className="pr-label">PR</span>
        <span className="inline-item-cta-micro">{microCopy}</span>
      </p>
      <div className="inline-item-cta-card">
        <AffiliateLink {...item} />
      </div>
    </aside>
  );
}
