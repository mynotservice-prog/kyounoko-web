'use client';

import { useEffect } from 'react';

/**
 * サイト内リンクを「画面ごと読み込む遷移」にする（2026-10-25）。
 *
 * 背景:
 * - AdSense の自動広告は、文書（HTML）を読み込んだときに 1 回だけページ内へ配置される。
 *   Next.js の <Link> は画面を読み直さずに中身だけ差し替えるので、2 ページ目以降には
 *   ページ内の自動広告が 1 枠も出ず、画面下の固定広告だけが残っていた
 *   （本番・375px で実測: 最初のページ 8 枠 → <Link> で移動した先 0 枠）。
 * - GA4×AdSense（10/13〜10/23）で、2 ページ目以降の PV は 1,000PV あたり 50 円
 *   （着地ページは 216 円）・広告表示/PV 1.80（着地 5.28）だった。
 *
 * 仕組み:
 * - window の capture 段階でクリックを見て、対象のリンクに target="_top" を付けるだけ。
 *   Next.js の <Link> は target が _self 以外のとき自分では遷移せずブラウザに任せるので
 *   （next/dist/client/app-dir/link.js の isModifiedEvent）、同じタブで画面ごと読み込まれる。
 * - preventDefault も stopPropagation もしないので、全画面広告（ビネット）など
 *   他のクリック処理はこれまで通り動く。
 *
 * 対象外: 修飾キー付きクリック・別タブ指定・download・同じページ内の # 移動・
 * 外部リンク・/admin と /api・`data-soft-nav` を付けた要素の中のリンク。
 */
export function HardNavLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      if (a.hasAttribute('download')) return;
      const t = a.getAttribute('target');
      if (t && t !== '_self') return;
      if (a.closest('[data-soft-nav]')) return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return;
      // 同じページ内の目次（#見出し）への移動は読み直さない
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

      a.setAttribute('target', '_top');
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
