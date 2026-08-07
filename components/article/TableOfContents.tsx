'use client';

import { useEffect, useState, useCallback } from 'react';
import type { TocItem } from '@/lib/articles';
import { trackEvent } from '@/lib/analytics';

type Props = {
  items: TocItem[];
  variant: 'mobile' | 'desktop';
};

/**
 * 目次。H2 を主、H3 を子要素として階層インデント表示。
 * H2 件数が3未満なら非表示（薄い目次を避ける）。
 * - mobile: <details> で折りたたみ。本文上に配置。本文を読み進めたら右下に FAB（目次に戻る）を表示。
 * - desktop: 右サイドバー。呼び出し側で sticky ラッパーに入れる。
 */
export function TableOfContents({ items, variant }: Props) {
  // H2 件数で表示可否を決定（既存仕様維持）
  const h2Items = items.filter((i) => i.level === 2);
  if (h2Items.length < 3) return null;

  // H2 + 直下の H3 をまとめた表示用ツリーを作る
  type Node = { item: TocItem; index: number; children: TocItem[] };
  const tree: Node[] = [];
  let currentH2: Node | null = null;
  let h2Idx = 0;
  for (const it of items) {
    if (it.level === 2) {
      h2Idx += 1;
      currentH2 = { item: it, index: h2Idx, children: [] };
      tree.push(currentH2);
    } else if (it.level === 3 && currentH2) {
      currentH2.children.push(it);
    }
  }

  if (variant === 'mobile') {
    // 見出しが8個以上ある長い記事は開いた状態で出す。24見出し・30画面ぶんある記事で
    // 目次が閉じていると、全体像が分からないまま読み始めることになるため。
    // 開いたときの占有量は CSS 側（.toc-mobile[open] .toc-list）で半画面強に抑えている。
    const defaultOpen = h2Items.length >= 8;
    return (
      <>
        <details className="toc toc-mobile" id="toc-mobile-anchor" open={defaultOpen}>
          <summary>
            <span className="toc-label">目次</span>
            <span className="toc-count">{h2Items.length}項目</span>
            <svg
              className="toc-caret"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <ol className="toc-list">
            {tree.map((node) => (
              <li key={node.item.id} className="toc-item toc-item-h2">
                <a href={`#${node.item.id}`} onClick={() => trackEvent('toc_click', { heading_id: node.item.id })}>
                  <span className="toc-num">{String(node.index).padStart(2, '0')}</span>
                  <span className="toc-text">{node.item.text}</span>
                </a>
                {node.children.length > 0 && (
                  <ol className="toc-sublist">
                    {node.children.map((child) => (
                      <li key={child.id} className="toc-item toc-item-h3">
                        <a href={`#${child.id}`} onClick={() => trackEvent('toc_click', { heading_id: child.id })}>
                          <span className="toc-sub-dot" aria-hidden="true">┗</span>
                          <span className="toc-text">{child.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </details>
        <BackToTocFab />
      </>
    );
  }

  // desktop
  return (
    <nav className="toc toc-desktop" aria-label="目次">
      <div className="toc-head">
        <span className="toc-eyebrow">On this page</span>
        <span className="toc-title">目次</span>
      </div>
      <ol className="toc-list">
        {tree.map((node) => (
          <li key={node.item.id} className="toc-item toc-item-h2">
            <a href={`#${node.item.id}`} onClick={() => trackEvent('toc_click', { heading_id: node.item.id })}>
              <span className="toc-num">{String(node.index).padStart(2, '0')}</span>
              <span className="toc-text">{node.item.text}</span>
            </a>
            {node.children.length > 0 && (
              <ol className="toc-sublist">
                {node.children.map((child) => (
                  <li key={child.id} className="toc-item toc-item-h3">
                    <a href={`#${child.id}`} onClick={() => trackEvent('toc_click', { heading_id: child.id })}>
                      <span className="toc-sub-dot" aria-hidden="true">└</span>
                      <span className="toc-text">{child.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * 「目次へ戻る」FAB（モバイル専用）。
 * 500px 以上スクロールしたら右下に表示し、クリックで目次にスムーズスクロール。
 * デスクトップ(>=1100px)では CSS で非表示。
 */
function BackToTocFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = useCallback(() => {
    const el = document.getElementById('toc-mobile-anchor');
    if (el) {
      // <details> を開いた状態でスクロール
      if (el instanceof HTMLDetailsElement) el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <button
      type="button"
      className={`toc-fab${visible ? ' is-visible' : ''}`}
      onClick={onClick}
      aria-label="目次へ戻る"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="8" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="8" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1" fill="currentColor" />
        <circle cx="4" cy="12" r="1" fill="currentColor" />
        <circle cx="4" cy="18" r="1" fill="currentColor" />
      </svg>
    </button>
  );
}
