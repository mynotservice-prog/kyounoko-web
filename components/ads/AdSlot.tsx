import * as React from 'react';

/**
 * AdSense 広告スロット。
 *
 * 環境変数 `NEXT_PUBLIC_ADSENSE_PUB_ID` が設定されていない時は出さない。
 *
 * 使い方（layout.tsx の AdSense スクリプトが先にロードされている前提）:
 *   <AdSlot placement="article-mid" />
 *
 * Slot ID はユーザーがAdSense管理画面で発行して env に入れてもらう。
 * 未設定時は「responsive auto ad」として機能する（Auto Ads設定との併用前提）。
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
  const rawPubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim();
  if (!rawPubId) return null; // 未承認/未設定時は完全に出さない

  const client = rawPubId.startsWith('ca-') ? rawPubId : `ca-${rawPubId}`;
  const slot = SLOT_IDS[placement];

  return (
    <div className="ad-slot" data-placement={placement} style={style}>
      <span className="ad-label" aria-label="広告">広告</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 100 }}
        data-ad-client={client}
        data-ad-slot={slot ?? ''}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {/* AdSense スクリプト本体は app/layout.tsx で global に読み込み済み。
          各スロットの push はクライアント側で行う必要があるので、小さな inline script で対応。 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
}
