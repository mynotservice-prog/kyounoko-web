'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/common/Logo';

type Props = {
  currentCategory?:
    | 'today-doko'
    | 'today-nani'
    | 'today-taberu'
    | 'today-mawasu'
    | 'gyouji'
    | 'narai'
    | 'items'
    | 'station';
  showLiveChip?: boolean;
};

const NAV_ITEMS = [
  { key: 'today-doko', href: '/category/today-doko', label: '今日どこ行く' },
  { key: 'today-nani', href: '/category/today-nani', label: '今日何する' },
  { key: 'today-taberu', href: '/category/today-taberu', label: '今日何食べる' },
  { key: 'today-mawasu', href: '/category/today-mawasu', label: '今日どう回す' },
  { key: 'gyouji', href: '/category/gyouji', label: '季節と行事' },
  { key: 'narai', href: '/category/narai', label: '習い事' },
  { key: 'station', href: '/station', label: '駅別ランチ' },
  { key: 'items', href: '/items', label: '役立つもの' },
] as const;

const MOBILE_EXTRA_LINKS = [
  { href: '/station/line', label: '路線別ランチ' },
  { href: '/data/restaurants', label: '全店舗比較表' },
  { href: '/favorites', label: 'お気に入り' },
  { href: '/settings', label: '設定' },
  { href: '/about', label: '運営者情報' },
  { href: '/contact', label: 'お問い合わせ' },
];

export function SiteHeader({ currentCategory, showLiveChip = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ESCキーでメニュー閉じる
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // 背景スクロール防止
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <header className="site-header">
      <div className="container bar">
        <Logo />
        <nav className="nav-desktop" aria-label="主要カテゴリ">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className={currentCategory === item.key ? 'current' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showLiveChip && <LiveChip />}
          <Link href="/search" aria-label="サイト内検索" title="サイト内検索" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, color: 'var(--ink-sub)',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <Link href="/favorites" aria-label="お気に入り" title="お気に入り" className="header-icon-desktop" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, color: 'var(--ink-sub)',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>
          <Link href="/settings" aria-label="設定" title="設定" className="header-icon-desktop" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, color: 'var(--ink-sub)',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
          <Link href="/#finder" className="btn-primary header-cta-desktop">
            条件で探す
          </Link>
          {/* モバイル用ハンバーガー */}
          <button
            type="button"
            aria-label="メニューを開く"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
            className="header-hamburger"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* モバイル用ドロワー */}
      {drawerOpen && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="モバイルメニュー"
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 'min(85vw, 360px)',
              background: 'var(--paper-card, #fffaf6)',
              padding: '20px 24px 32px',
              overflowY: 'auto',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600 }}>メニュー</span>
              <button
                type="button"
                aria-label="メニューを閉じる"
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink)' }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <Link href="/#finder" onClick={() => setDrawerOpen(false)} className="btn-primary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
              条件で探す（TodayFinder）
            </Link>

            <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8, marginTop: 8 }}>
              主要カテゴリ
            </div>
            <nav aria-label="モバイルカテゴリナビ" style={{ display: 'grid', gap: 4, marginBottom: 24 }}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 15,
                    color: 'var(--ink)',
                    textDecoration: 'none',
                    background: currentCategory === item.key ? 'rgba(201,96,62,0.08)' : 'transparent',
                    fontWeight: currentCategory === item.key ? 600 : 400,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 8 }}>
              その他
            </div>
            <nav aria-label="モバイル追加ナビ" style={{ display: 'grid', gap: 2 }}>
              {MOBILE_EXTRA_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    fontSize: 13,
                    color: 'var(--ink-sub)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function LiveChip() {
  return (
    <span className="live-chip" suppressHydrationWarning>
      <span className="live-dot"></span>
      <span id="liveText">Today · Tokyo</span>
    </span>
  );
}
