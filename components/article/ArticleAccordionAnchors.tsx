'use client';

import { useEffect } from 'react';

/**
 * 折りたたまれた本文アコーディオン（`details.body-acc`）の中にある見出しへ
 * アンカー遷移したときに、その `<details>` を開いてから移動する。
 *
 * 目次のリンク先 H3 が閉じたブロックの中にあると、タップしても何も起きないように
 * 見えてしまう。ブラウザ標準の「フラグメント遷移で details を開く」挙動は
 * まだ実装差があるので、ここで明示的に開く。
 *
 * 中身は常に HTML に出ている（CSS で隠しているだけ）ので、この処理は表示のためだけの
 * ものであり、クロール・インデックスには関与しない。
 */
export function ArticleAccordionAnchors() {
  useEffect(() => {
    const openAncestors = (el: Element | null) => {
      let node = el?.parentElement ?? null;
      let opened = false;
      while (node) {
        if (node instanceof HTMLDetailsElement && !node.open) {
          node.open = true;
          opened = true;
        }
        node = node.parentElement;
      }
      return opened;
    };

    const revealHash = (hash: string, smooth: boolean) => {
      if (!hash || hash === '#') return;
      let target: Element | null = null;
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        target = document.getElementById(hash.slice(1));
      }
      if (!target) return;
      openAncestors(target);
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    };

    // 同一ページ内アンカーのクリック（目次など）。hashchange が発火しないケースも拾う。
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute('href') || '';
      if (hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      if (openAncestors(target)) {
        // 開いてからスクロールしないと、閉じた高さのまま位置がずれる
        e.preventDefault();
        history.replaceState(null, '', hash);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const onHashChange = () => revealHash(location.hash, true);

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);
    // 検索結果などから直接アンカー付きで着地した場合
    if (location.hash) revealHash(location.hash, false);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return null;
}
