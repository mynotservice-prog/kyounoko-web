'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 駅ページ用のスティッキーセクションナビ。
 *
 * Hero を抜けた地点から固定表示され、ページ内アンカーへワンタップでジャンプ。
 * 484駅×多セクションの長いページでもユーザーが迷子にならないようにする。
 */

type NavItem = {
  href: string;
  label: string;
  count?: number;
};

type Props = {
  items: NavItem[];
  /** スクロール位置がこのpx超えたら表示する（hero高さ目安） */
  showAfter?: number;
};

export function StickySectionNav({ items, showAfter = 460 }: Props) {
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // スクロール位置に応じて表示制御＋アクティブ判定
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setVisible(y > showAfter);
      // 各セクションの位置から現在地を判定
      let activeIndex = 0;
      for (let i = 0; i < items.length; i++) {
        const el = document.querySelector(items[i].href);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top < 120) activeIndex = i;
        }
      }
      setActiveIdx(activeIndex);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [items, showAfter]);

  // クリック時のスムーズスクロール（CSS scroll-margin-top と組み合わせる）
  const onClickItem = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // タップした項目を中央にスクロールするためにナビ自体もスクロールさせる
      const idx = items.findIndex((it) => it.href === href);
      if (navRef.current && idx >= 0) {
        const tab = navRef.current.querySelectorAll('a')[idx] as HTMLAnchorElement | undefined;
        if (tab) {
          tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }
  };

  return (
    <div
      role="navigation"
      aria-label="セクション内ナビゲーション"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(255, 250, 246, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(201,96,62,0.18)',
        boxShadow: visible ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        ref={navRef}
        style={{
          maxWidth: 920,
          margin: '0 auto',
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '10px 16px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="sticky-nav-scroll"
      >
        {items.map((item, i) => {
          const isActive = i === activeIdx;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onClickItem(item.href)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--ink-sub)',
                background: isActive ? 'var(--clay-deep)' : 'transparent',
                border: isActive ? '1px solid var(--clay-deep)' : '1px solid rgba(201,96,62,0.20)',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {item.label}
              {item.count != null && (
                <span style={{
                  marginLeft: 5,
                  fontSize: 10,
                  opacity: isActive ? 0.85 : 0.6,
                }}>
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </div>
      <style jsx>{`
        .sticky-nav-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
