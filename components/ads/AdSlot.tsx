import * as React from 'react';
import { ADSENSE_CLIENT } from '@/lib/adsense';

/**
 * AdSense 広告スロット。
 *
 * Publisher ID は lib/adsense.ts のデフォルト（ca-pub-4445473825791494）、
 * env NEXT_PUBLIC_ADSENSE_PUB_ID で上書き可能。
 *
 * 各スロットの Slot ID は AdSense管理画面で「広告ユニット」発行後、
 * env NEXT_PUBLIC_ADSENSE_SLOT_* で指定。未設定時は auto 表示。
 */

type AdPlacement =
  | 'article-mid'    // 記事中途（TL;DR直後）
  | 'article-end'    // 記事末尾（FAQ後）
  | 'plan-below-hero' // プランhero下
  | 'home-below-finder' // トップFinder下
  | 'sidebar';

const SLOT_IDS: Record<AdPlacement, string | undefined> = {
  'article-mid': process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID,
  'article-end': process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END,
  'plan-below-hero': process.env.NEXT_PUBLIC_ADSENSE_SLOT_PLAN_HERO,
  'home-below-finder': process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FINDER,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

export function AdSlot({
  placement,
  format = 'auto',
  style,
}: {
  placement: AdPlacement;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}) {
  // env 未設定時は完全に出力しない
  if (!ADSENSE_CLIENT) return null;

  const slot = SLOT_IDS[placement];

  return (
    <div className="ad-slot" data-placement={placement} style={style}>
      <span className="ad-label" aria-label="広告">広告</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 100 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot ?? ''}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
}
