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

  return (
    <aside
      aria-label="ネット予約"
      style={{
        margin: '24px 0',
        border: '1px solid rgba(201,96,62,0.28)',
        borderRadius: 16,
        background:
          'linear-gradient(135deg, rgba(201,96,62,0.10), rgba(235,192,106,0.06))',
        padding: '18px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span className="pr-label">PR</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: 'var(--clay-deep)',
          }}
        >
          今から行くなら・ネット予約
        </span>
      </div>
      <h4
        style={{
          margin: '0 0 4px',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--ink)',
          fontFamily: 'var(--font-mincho)',
        }}
      >
        {offer.heading}
      </h4>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.7 }}>
        {offer.note}
      </p>
      <a
        href={offer.href}
        target="_blank"
        rel="sponsored nofollow noopener"
        data-provider="valuecommerce"
        onClick={() => {
          trackEvent('affiliate_click', {
            provider: 'valuecommerce',
            item_id: offer.itemId,
          });
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--clay)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14.5,
          padding: '12px 20px',
          borderRadius: 10,
          textDecoration: 'none',
        }}
      >
        {offer.cta}
      </a>
    </aside>
  );
}
