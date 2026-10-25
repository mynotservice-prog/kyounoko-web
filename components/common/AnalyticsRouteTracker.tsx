'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { installAffiliateReferrer } from '@/lib/affiliate-referrer';

/**
 * 計測まわりのクライアント処理（クリック計測・アフィリエイトのリファラ）。
 *
 * page_view はここでは送らない（2026-10-25）:
 * - 文書の読み込み時は gtag('config') が送る。
 * - 画面を読み直さない遷移（router.push / Link）は、GA4 の拡張計測「ページの変更（ブラウザの履歴）」
 *   （データストリーム設定で有効）が送る。
 * - 以前はここでも page_view を手動送信していたため、2 ページ目以降は遷移の種類にかかわらず
 *   page_view が 2 回送られていた（2026-05-19〜10-25。本番で送信を数えて確認）。
 *   拡張計測の「ページの変更」を管理画面で切る場合は、ここに手動送信を戻すこと。
 *
 * クリック計測（2026-10 「今日の流れ」利用計測）:
 * - `data-ev="イベント名"` を持つ要素のクリックを委譲で拾って送る（Server Component の
 *   Link にも属性だけで計測を付けられる）。`data-ev-xxx` はそのままパラメータ xxx になる。
 * - /today の外にある /today 行きリンクのクリックは、属性なしでも `today_entry_click` を送る
 *   （ヘッダー・下部ナビ・フッター内は `today_entry_nav_click`）。
 *   どの面が /today へ送客したかは GA4 の pagePath（クリックが起きたページ）で分かる。
 */
export function AnalyticsRouteTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const el = target.closest<HTMLElement>('[data-ev]');
      if (el?.dataset.ev) {
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(el.dataset)) {
          if (k.startsWith('ev') && k.length > 2 && v) params[k.slice(2).toLowerCase()] = v;
        }
        trackEvent(el.dataset.ev, params);
      }
      const a = target.closest<HTMLAnchorElement>('a[href^="/today"]');
      if (a && !window.location.pathname.startsWith('/today')) {
        // ヘッダー・下部ナビ・フッターの常設リンクは、本文中の導線と分けて数える
        const inNav = !!a.closest('header, nav, footer');
        trackEvent(inNav ? 'today_entry_nav_click' : 'today_entry_click', {
          link_url: a.getAttribute('href') ?? '',
        });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // アフィリエイト送客リンクのクリック時だけ、ページ URL を ASP に渡す（サーバーが返す HTML は変えない）。
  useEffect(() => installAffiliateReferrer(), []);

  return null;
}
