'use client';

import Link from 'next/link';
import React from 'react';
import { V2Icon } from './V2Icon';
import {
  V2Logo,
  V2LogoMark,
  V2Toast,
  V2ContextProvider,
} from './V2Base';

export type V2NavActive = 'home' | 'search' | 'saved' | 'features';

type FrameProps = {
  children: React.ReactNode;
  /** ヘッダーバリアント: home(ロゴ＋アクション) / sub(戻る＋ロゴ＋アクション) / saved(独自) / hidden */
  header?: 'home' | 'sub' | 'saved' | 'hidden';
  /** sub 用: 戻り先 (デフォルト /v2) */
  backHref?: string;
  /** sub 用: 右側アクション (share/menu/bookmark) */
  rightAction?: 'menu' | 'share' | 'bookmark';
  /** 下部ナビアクティブ */
  active?: V2NavActive;
  /** スクロール可能領域に渡る独自スタイル */
};

export function V2Frame({
  children,
  header = 'home',
  backHref = '/v2',
  rightAction = 'menu',
  active,
}: FrameProps) {
  return (
    <V2ContextProvider>
      <div className="v2-root">
        <div className="v2-stage">
          <div className="v2-phone">
            <V2StatusBar />
            <V2DesktopHeader active={active} />
            <div className="v2-viewport">
              <div className="v2-scroll v2-pad-nav">
                <div className="v2-screen-enter">
                  {header !== 'hidden' && (
                    <V2Header
                      variant={header}
                      backHref={backHref}
                      rightAction={rightAction}
                    />
                  )}
                  {children}
                </div>
              </div>
              <V2BottomNav active={active} />
              <V2Toast />
            </div>
            <div className="v2-home-indicator"></div>
          </div>
        </div>
      </div>
    </V2ContextProvider>
  );
}

function V2StatusBar() {
  return (
    <div className="v2-statusbar">
      <span>9:41</span>
      <span className="v2-sb-icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="#1c1c1c">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1c1c1c">
          <path d="M8 2.2c2 0 3.8.8 5.1 2l1-1.1A9 9 0 0 0 8 .6 9 9 0 0 0 1.9 3.1l1 1.1A7.4 7.4 0 0 1 8 2.2Zm0 3a4.6 4.6 0 0 1 3 1.1l1-1.1A6 6 0 0 0 8 3.7 6 6 0 0 0 4 5.2l1 1.1a4.6 4.6 0 0 1 3-1.1Zm0 3c.8 0 1.5.3 2 .8L8 11 6 9c.5-.5 1.2-.8 2-.8Z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="1" y="1" width="20" height="10" rx="2.5" stroke="#1c1c1c" opacity=".4" />
          <rect x="2.5" y="2.5" width="16" height="7" rx="1.3" fill="#1c1c1c" />
          <rect x="22.5" y="4" width="1.6" height="4" rx=".8" fill="#1c1c1c" opacity=".4" />
        </svg>
      </span>
    </div>
  );
}

function V2Header({
  variant,
  backHref,
  rightAction,
}: {
  variant: 'home' | 'sub' | 'saved';
  backHref: string;
  rightAction: 'menu' | 'share' | 'bookmark';
}) {
  if (variant === 'home') {
    return (
      <div className="v2-app-header">
        <V2Logo tagline size={36} />
        <div className="v2-header-actions">
          <Link href="/v2/favorites" className="v2-header-act">
            <V2Icon name="bookmark" size={22} color="var(--v2-ink)" />
            保存
          </Link>
          <button className="v2-header-act">
            <V2Icon name="menu" size={22} color="var(--v2-ink)" />
            メニュー
          </button>
        </div>
      </div>
    );
  }
  if (variant === 'saved') {
    return (
      <div className="v2-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ color: 'var(--v2-orange)', display: 'flex' }}>
            <V2Icon name="bookmark" size={24} fill />
          </span>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>保存したもの</h1>
        </div>
        <button className="v2-header-act">
          <V2Icon name="menu" size={22} color="var(--v2-ink)" />
          メニュー
        </button>
      </div>
    );
  }
  // sub
  const right =
    rightAction === 'share' ? (
      <button className="v2-header-act">
        <V2Icon name="share" size={20} color="var(--v2-ink)" />
        シェア
      </button>
    ) : (
      <Link href="/v2/favorites" className="v2-header-act">
        <V2Icon name="bookmark" size={20} color="var(--v2-ink)" />
        保存
      </Link>
    );
  return (
    <div className="v2-app-header plain">
      <Link href={backHref} className="v2-back-btn">
        <V2Icon name="chevron-left" size={20} />
        戻る
      </Link>
      <Link
        href="/v2"
        style={{ display: 'flex', alignItems: 'center', gap: 7 }}
      >
        <V2LogoMark size={26} />
        <span style={{ fontWeight: 800, color: 'var(--v2-orange)', fontSize: 18 }}>
          きょうのこ
        </span>
      </Link>
      {right}
    </div>
  );
}

function V2BottomNav({ active }: { active?: V2NavActive }) {
  const items = [
    { k: 'home', t: 'ホーム', icon: 'home', href: '/v2' },
    { k: 'search', t: '探す', icon: 'search', href: '/v2/search' },
    { k: 'saved', t: '保存', icon: 'bookmark', href: '/v2/favorites' },
    { k: 'features', t: '特集', icon: 'book', href: '/v2/feature' },
  ] as const;
  return (
    <nav className="v2-bottom-nav">
      {items.map((it) => {
        const on = active === it.k;
        return (
          <Link
            key={it.k}
            href={it.href}
            className={'v2-nav-item' + (on ? ' on' : '')}
          >
            <span>
              <V2Icon
                name={it.icon}
                size={23}
                color={on ? 'var(--v2-orange)' : '#b3b3b3'}
                fill={on}
              />
            </span>
            {it.t}
          </Link>
        );
      })}
    </nav>
  );
}

function V2DesktopHeader({ active }: { active?: V2NavActive }) {
  const links = [
    { k: 'home', t: 'ホーム', icon: 'home', href: '/v2' },
    { k: 'search', t: '探す', icon: 'search', href: '/v2/search' },
    { k: 'area', t: 'エリア', icon: 'pin', href: '/v2/area' },
    { k: 'features', t: '特集', icon: 'book', href: '/v2/feature' },
  ] as const;
  return (
    <header className="v2-dt-header">
      <Link href="/v2" className="v2-dt-logo">
        <V2LogoMark size={34} />
        <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--v2-orange)' }}>
          きょうのこ
        </span>
      </Link>
      <nav className="v2-dt-nav">
        {links.map((l) => {
          const on = active === l.k;
          return (
            <Link
              key={l.k}
              href={l.href}
              className={'v2-dt-link' + (on ? ' on' : '')}
            >
              <V2Icon
                name={l.icon}
                size={17}
                color={on ? 'var(--v2-orange-deep)' : 'var(--v2-ink-mute)'}
              />
              {l.t}
            </Link>
          );
        })}
      </nav>
      <div className="v2-dt-spacer"></div>
      <Link href="/v2/search" className="v2-dt-search">
        <V2Icon name="search" size={17} />
        スポット・駅を検索
      </Link>
      <Link href="/v2/favorites" className="v2-dt-save">
        <V2Icon name="bookmark" size={17} color="#fff" />
        保存
      </Link>
    </header>
  );
}
