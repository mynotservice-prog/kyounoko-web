'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Next.js App Router の SPA 遷移で page_view を手動送信するトラッカー。
 *
 * 背景:
 * - gtag('config', GA_ID) は初回 HTML 読み込み時にしか page_view を発火しない。
 * - Next.js のクライアント遷移（router.push / Link クリック）では URL は
 *   変わるが page_view は発火しない。これにより SPA 内回遊の計測がゼロになる。
 *
 * 仕様:
 * - usePathname / useSearchParams を監視し、変更時に trackPageView を呼ぶ。
 * - 初回マウントも含めて送信（gtag('config') と二重になるが、GA4 はクライアント側で
 *   重複排除しないので、ここでは初回送信を skip するロジックを入れて二重送信を防ぐ）。
 * - GA 未設定 / gtag 未ロード時は dataLayer.push にフォールバック（analytics.ts側）。
 */
export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    // 初回マウントは gtag('config', ...) が page_view を送っているのでスキップ。
    // useEffect は SSR では走らないため、ここに来たら必ずクライアント。
    // 「初回かどうか」を判定するため sessionStorage に1回マークを置く。
    let firstLoad = false;
    try {
      const marker = sessionStorage.getItem('__ga_initial_pv');
      if (!marker) {
        sessionStorage.setItem('__ga_initial_pv', '1');
        firstLoad = true;
      }
    } catch {
      // sessionStorage が使えない環境では二重送信を許容（致命ではない）
    }
    if (firstLoad) return;

    const searchStr = search?.toString() || '';
    trackPageView(pathname, searchStr || undefined);
    // ESLint: pathname と search のみ依存
  }, [pathname, search]);

  return null;
}
