'use client';

import { useEffect, useRef } from 'react';

/**
 * 要素が一度でも画面に半分以上入ったら `onView` を1回だけ呼ぶ。
 *
 * CTAの「表示→クリック」を GA4 で割り算できるようにするための計測用。
 * 2026-09-23: LINE友だち追加CTAは28日でクリック13回（記事0）だったが、
 * 記事のカードは末尾（広告・FAQの下）にあり、75%までスクロールする読者が
 * 5.6% しかいないため「見えていない」のか「押されない」のかを区別できなかった。
 * IntersectionObserver が無い環境では何もしない（計測が欠けるだけで表示は変わらない）。
 */
export function useViewOnce<T extends HTMLElement>(onView: () => void) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  const cb = useRef(onView);
  cb.current = onView;

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (fired.current) return;
        if (entries.some((e) => e.isIntersecting)) {
          fired.current = true;
          cb.current();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
