'use client';

import { trackEvent } from '@/lib/analytics';
import { KkIcon } from './KkIcon';
import { useViewOnce } from './useViewOnce';

const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL;
const OFFER = 'kodzure-gaishoku-map';

/**
 * LINE友だち追加の小型CTA（1行の帯）。記事本文の手前＝「答え」を読み終えた直後に置く。
 *
 * 背景（2026-09-23 GA4実測 8/25〜9/21）:
 *   line_add_click は28日で13回、うち記事は0回（記事モバイルPV 77,894）。
 *   末尾の KkLineCard は article-end 広告と FAQ の下にあり、記事のモバイル読者で
 *   75% まで到達するのは 5.6%。つまりオファー以前に「見えていない」。
 *   トップでは見えれば 0.8% が押していたので、まず 50% 到達点より手前に置いて
 *   表示（line_cta_view）とクリック（line_add_click）を placement 別に割り算する。
 *
 * 文言は流入の実態に合わせ、全国どこでも価値がある「金曜の週末配信」を先に、
 * 東京限定の50店マップを後に置く（モバイル流入の一都三県比率は 52.7%）。
 * env（NEXT_PUBLIC_LINE_ADD_FRIEND_URL）未設定なら描画しない。
 */
export function KkLineInline({ placement }: { placement: string }) {
  const ref = useViewOnce<HTMLDivElement>(() =>
    trackEvent('line_cta_view', { placement, offer: OFFER }),
  );
  if (!LINE_URL) return null;
  return (
    <div ref={ref} className="kk-line-inline" role="note" aria-label="LINE友だち追加">
      <span className="kk-line-inline-badge" aria-hidden="true">
        LINE
      </span>
      <span className="kk-line-inline-body">
        <span className="kk-line-inline-title">
          毎週金曜「週末どこ行く？」をLINEで受け取る
        </span>
        <span className="kk-line-inline-sub">
          友だち追加で、編集長が0〜2歳と全部行った東京の子連れ外食50店マップも受け取れます
        </span>
      </span>
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="kk-line-inline-btn"
        onClick={() => trackEvent('line_add_click', { placement, offer: OFFER })}
      >
        追加
        <KkIcon name="chevron-right" size={14} sw={2.2} />
      </a>
    </div>
  );
}
