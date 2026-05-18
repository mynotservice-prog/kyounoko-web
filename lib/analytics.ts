/**
 * GA4 カスタムイベント送信ヘルパ。
 *
 * 設計方針:
 * - `window.gtag` は app/layout.tsx の `Script strategy="afterInteractive"` で
 *   グローバルに注入される。型定義は本ファイル外には漏らさず、`unknown` 経由で
 *   ローカルキャストして TS strict を満たす。
 * - SSR 中（typeof window === 'undefined'）や GA 未設定で `gtag` が undefined の
 *   ケースは黙って no-op。例外を投げない（呼び出し側で try-catch 不要にする意図）。
 *
 * 使い方:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('favorite_add', { type: 'article', slug: 'abc' });
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // window.gtag は型定義しないとTypeScript怒るので unknown 経由
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', name, params);
}
