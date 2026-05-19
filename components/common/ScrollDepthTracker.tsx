'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * 25%/50%/75%/100% のスクロール深度を GA4 に送信する。
 *
 * GA4 の拡張計測は 90% スクロール時にしか発火しないため、
 * もっと浅い段階の到達率を把握するために自前で測る。
 *
 * 仕様:
 * - 1ページにつき各深度1回ずつ発火（重複送信しない）。
 * - イベント名: `scroll_depth` / params: `{ percent: 25|50|75|100 }`
 * - throttle: requestAnimationFrame で1フレームに1回しか計算しない。
 * - 短すぎるページ（viewport より短い）は到達率を強制的に 100% とみなして1回だけ送る。
 */
export function ScrollDepthTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // /admin/* では計測しない（GA計測停止に合わせる）
    if (window.location.pathname.startsWith('/admin')) return;

    const sent = new Set<number>();
    const thresholds = [25, 50, 75, 100];

    const measure = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const viewport = window.innerHeight || doc.clientHeight;
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      // ページが viewport より短い: 即100% 扱い
      const scrollable = scrollHeight - viewport;
      if (scrollable <= 0) {
        if (!sent.has(100)) {
          sent.add(100);
          trackEvent('scroll_depth', { percent: 100 });
        }
        return;
      }
      const pct = Math.min(100, Math.round(((scrollTop + viewport) / scrollHeight) * 100));
      for (const t of thresholds) {
        if (pct >= t && !sent.has(t)) {
          sent.add(t);
          trackEvent('scroll_depth', { percent: t });
        }
      }
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    // 初期チェック（ファーストビューで既に短いページの場合の100%送信）
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
