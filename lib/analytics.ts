/**
 * GA4 カスタムイベント送信ヘルパ。
 *
 * 設計方針:
 * - `window.gtag` は app/layout.tsx の `Script strategy="afterInteractive"` で
 *   グローバルに注入されるが、ロード前に発火するクリックを取りこぼさないように
 *   **dataLayer.push へのフォールバック** を持つ。
 *   標準 GA4 タグも内部で dataLayer 経由で動くため、後から GTM スクリプトが
 *   読み込まれた時点でキューに溜まったイベントは消化される。
 * - SSR 中（typeof window === 'undefined'）は黙って no-op。
 *
 * 使い方:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('favorite_add', { type: 'article', slug: 'abc' });
 */
type DataLayerArgs = unknown[];
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: DataLayerArgs[];
    gtag?: GtagFn;
    /** /admin/* では GA 計測を完全停止するフラグ。layout.tsx の ga-init で初期化される。 */
    __KYO_NO_GA?: boolean;
  }
}

/**
 * 管理画面（/admin/*）からの計測はクリーンな指標のため除外する。
 * SPA 遷移で home → /admin/x に入った場合に備えて、毎回 path も確認。
 */
function isExcludedPath(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.__KYO_NO_GA) return true;
  if (window.location?.pathname?.startsWith('/admin')) return true;
  return false;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (isExcludedPath()) return;

  // 第一優先: gtag があれば標準ルートで送る。
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
    return;
  }

  // フォールバック: dataLayer に積む。GA4 スクリプトが後から読み込まれた時に
  // 自動的にキューが消化される。GA4 が想定する gtag arguments 形式
  // `['event', name, params]` で push しておく。
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(['event', name, params ?? {}]);
  } catch {
    // 何もしない（GA未設定環境の防御）
  }
}

/**
 * SPA 遷移時の page_view を手動送信する。
 * Next.js App Router では gtag('config', GA_ID) は初回しか呼ばれないため、
 * クライアント遷移後のページビューは自動では送られない。
 *
 * 使い方: app/layout.tsx で usePathname を監視するクライアントコンポーネント側から呼ぶ。
 */
export function trackPageView(pathname: string, search?: string) {
  if (typeof window === 'undefined') return;
  // admin配下は除外
  if (pathname.startsWith('/admin') || isExcludedPath()) return;
  const page_path = search ? `${pathname}?${search}` : pathname;
  const page_location = window.location.origin + page_path;
  const page_title = document.title;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path,
      page_location,
      page_title,
    });
    return;
  }
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push([
      'event',
      'page_view',
      { page_path, page_location, page_title },
    ]);
  } catch {
    // no-op
  }
}
