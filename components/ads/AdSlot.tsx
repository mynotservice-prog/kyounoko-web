import * as React from 'react';
import {
  ADSENSE_CLIENT,
  ADSENSE_ENABLED,
  ADSENSE_SLOT_DISPLAY,
  ADSENSE_SLOT_IN_ARTICLE,
  ADSENSE_SLOT_IN_FEED,
  ADSENSE_IN_FEED_LAYOUT_KEY,
} from '@/lib/adsense';

/**
 * AdSense 広告スロット。
 *
 * Publisher ID は lib/adsense.ts のデフォルト（ca-pub-4445473825791494）、
 * env NEXT_PUBLIC_ADSENSE_PUB_ID で上書き可能。
 *
 * ## 配置タイプ → AdSenseユニットの対応
 * - home-below-finder / article-end / plan-below-hero
 *   → Display 広告（slot 7826131694）。レスポンシブで auto format。
 * - article-mid
 *   → 記事内（in-article）広告（slot 1853643928）。data-ad-layout="in-article"。
 * - sidebar
 *   → in-feed 広告（slot 5792888939）。layout-key 指定必須。
 *
 * AdSense審査未通過時は env `NEXT_PUBLIC_ADSENSE_ENABLED=true` 未設定なら非表示。
 */

type AdPlacement =
  | 'article-mid'    // 記事中途（TL;DR直後）
  | 'article-end'    // 記事末尾（FAQ後）
  | 'plan-below-hero' // プランhero下
  | 'home-below-finder' // トップFinder下
  | 'sidebar';

/**
 * 配置タイプごとに使う「広告ユニット種別」と「スロットID」を決定する。
 * 同じ広告ユニットを複数の配置で再利用してOK（AdSense規約上問題なし）。
 */
type UnitType = 'display' | 'in-article' | 'in-feed';

const PLACEMENT_TO_UNIT: Record<AdPlacement, { type: UnitType; slot: string }> = {
  'home-below-finder': { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'article-end':       { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'plan-below-hero':   { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'article-mid':       { type: 'in-article', slot: ADSENSE_SLOT_IN_ARTICLE },
  sidebar:             { type: 'in-feed', slot: ADSENSE_SLOT_IN_FEED },
};

export function AdSlot({
  placement,
  style,
}: {
  placement: AdPlacement;
  style?: React.CSSProperties;
}) {
  // AdSense 審査通過前は広告枠自体を非表示にする（空の「広告」ラベルだけ残るのを防ぐ）。
  if (!ADSENSE_ENABLED) return null;

  const unit = PLACEMENT_TO_UNIT[placement];
  if (!unit.slot) return null;

  // 各広告ユニットタイプ別の <ins> 属性とスタイルを組み立てる
  const insProps: Record<string, string> = {
    'data-ad-client': ADSENSE_CLIENT,
    'data-ad-slot': unit.slot,
  };
  let insStyle: React.CSSProperties = { display: 'block' };

  if (unit.type === 'display') {
    insProps['data-ad-format'] = 'auto';
    insProps['data-full-width-responsive'] = 'true';
    insStyle = { display: 'block', minHeight: 100 };
  } else if (unit.type === 'in-article') {
    insProps['data-ad-layout'] = 'in-article';
    insProps['data-ad-format'] = 'fluid';
    insStyle = { display: 'block', textAlign: 'center' };
  } else if (unit.type === 'in-feed') {
    insProps['data-ad-format'] = 'fluid';
    insProps['data-ad-layout-key'] = ADSENSE_IN_FEED_LAYOUT_KEY;
    insStyle = { display: 'block' };
  }

  return (
    <div className="ad-slot" data-placement={placement} style={style}>
      <span className="ad-label" aria-label="広告">広告</span>
      <ins className="adsbygoogle" style={insStyle} {...insProps} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
}
