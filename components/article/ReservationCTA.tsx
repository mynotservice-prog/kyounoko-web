'use client';

import * as React from 'react';
import { trackEvent } from '@/lib/analytics';
import type { ReservationOffer } from '@/lib/reservation-cta';

export type ReservationCTAProps = {
  offer: ReservationOffer;
};

/**
 * 外食記事向けの「ネット予約」CTA カード（ホットペッパーグルメ / VC）。
 *
 * 物販の AffiliateLink より主張を強くした横長ボタン型。読者の意図（=今から外食する）に
 * 最も近い導線なので、結論直後の高インテント位置に置く想定。
 *
 * - 景表法・ステマ規制対応: PR 表記 + rel="sponsored nofollow noopener" を強制。
 * - クリックを GA4 に送る（affiliate_click / provider=valuecommerce）。
 * - href の健全性は lib 側で検査済みだが、ここでも二重防御で http(s) のみ許可。
 */
export function ReservationCTA({ offer }: ReservationCTAProps) {
  if (!/^https?:\/\//i.test(offer.href.trim())) return null;

  // 計測用プロバイダ判定: A8リンク(px.a8.net)は 'a8'、それ以外は従来通り 'valuecommerce'。
  const provider = /px\.a8\.net/.test(offer.href) ? 'a8' : 'valuecommerce';

  return (
    <aside aria-label={offer.heading} className="av3-resv">
      <div className="av3-resv-head">
        <span className="pr-label">PR</span>
        <span className="av3-resv-eyebrow">今から行くなら・ネット予約</span>
      </div>
      <h4 className="av3-resv-title">{offer.heading}</h4>
      <p className="av3-resv-note">{offer.note}</p>
      <a
        href={offer.href}
        target="_blank"
        rel="sponsored nofollow noopener"
        data-provider={provider}
        className="av3-resv-btn"
        onClick={() => {
          trackEvent('affiliate_click', {
            provider,
            item_id: offer.itemId,
          });
        }}
      >
        {offer.cta}
      </a>
    </aside>
  );
}
