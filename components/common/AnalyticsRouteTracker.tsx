'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { installAffiliateReferrer } from '@/lib/affiliate-referrer';
import { INTERNAL_LINK_CLICK_EVENT, classifyInternalLink } from '@/lib/internal-link-click';

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
 *
 * クリック計測（2026-10 「今日の流れ」利用計測）:
 * - `data-ev="イベント名"` を持つ要素のクリックを委譲で拾って送る（Server Component の
 *   Link にも属性だけで計測を付けられる）。`data-ev-xxx` はそのままパラメータ xxx になる。
 * - /today の外にある /today 行きリンクのクリックは、属性なしでも `today_entry_click` を送る
 *   （ヘッダー・下部ナビ・フッター内は `today_entry_nav_click`）。
 *   どの面が /today へ送客したかは GA4 の pagePath（クリックが起きたページ）で分かる。
 *
 * 内部リンクの部品別クリック（2026-10）:
 * - サイト内へのリンクのクリックは `internal_link_click` を送る。`placement` が部品の種類、
 *   `link_url` がリンク先のパス。分類の表は lib/internal-link-click.ts。
 *   上の `today_entry_click` などとは別のイベントなので、/today 行きは両方に 1 回ずつ載る。
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
      // 内部リンクは、押された部品の種類（戻る・パンくず・タグ・兄弟チップ・本文・下部のカード…）を
      // 付けて送る。判定は既存の class 名から行い、HTML には何も足さない。
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (link) {
        const hit = classifyInternalLink(link);
        if (hit) trackEvent(INTERNAL_LINK_CLICK_EVENT, hit);
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // アフィリエイト送客リンクのクリック時だけ、ページ URL を ASP に渡す（サーバーが返す HTML は変えない）。
  useEffect(() => installAffiliateReferrer(), []);

  return null;
}
