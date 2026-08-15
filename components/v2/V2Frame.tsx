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

/* ===========================================================
   Mobile Menu Drawer
   - 「メニュー」ボタンタップで右からスライドイン
   - 主要ナビ + フッター項目 (運営者情報/お問い合わせ/編集方針/プライバシー/利用規約) を集約
   =========================================================== */
function V2MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const primary = [
    { label: 'ホーム', href: '/', icon: 'home' as const },
    { label: '今日の流れ', href: '/today', icon: 'sparkle' as const },
    // 2026-08-04: ボトムナビ廃止に伴い、そこにしか無かった /articles の導線をここへ移設。
    // 記事はサイト全クリックの81.5%を生む最大の面なので、導線を失わせない。
    { label: '記事', href: '/articles', icon: 'book' as const },
    { label: 'エリア・駅', href: '/area', icon: 'pin' as const },
    { label: 'イベント', href: '/events', icon: 'calendar' as const },
    { label: '保存したもの', href: '/favorites', icon: 'bookmark' as const },
    { label: 'スポット一覧', href: '/spots', icon: 'flag' as const },
  ];
  const footer = [
    { label: '運営者情報', href: '/about' },
    { label: 'お問い合わせ', href: '/contact' },
    { label: '編集方針', href: '/editorial-policy' },
    { label: 'プライバシーポリシー', href: '/privacy' },
    { label: '利用規約', href: '/terms' },
    { label: '外部送信ポリシー', href: '/external-transmission' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,12,4,0.42)',
        zIndex: 10000,
        animation: 'v2-fadeIn .15s ease',
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(82vw, 320px)',
          background: 'var(--v2-page, #FBF6EE)',
          boxShadow: '-12px 0 30px rgba(20,12,4,0.18)',
          overflowY: 'auto',
          animation: 'v2-slideInRight .22s cubic-bezier(.2,.85,.25,1)',
        }}
      >
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--v2-line, #eee0d4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <V2LogoMark size={28} />
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <V2Icon name="plus" size={22} color="var(--v2-ink)" style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>
        {/* 2026-08-16: スマホは検索導線がヘッダーにもドロワーにも無く「探せない」状態だった。
            /search は force-dynamic のサーバー検索なので、JSを足さず素のGETフォームで飛ばす。 */}
        <form
          method="get"
          action="/search"
          role="search"
          style={{ padding: '14px 16px 4px', display: 'flex', gap: 8 }}
        >
          <label htmlFor="v2-menu-q" className="v2-sr-only">
            キーワードで検索
          </label>
          <div className="v2-searchbar" style={{ flex: 1, padding: '10px 13px' }}>
            <V2Icon name="search" size={18} color="var(--v2-ink-mute)" />
            <input
              id="v2-menu-q"
              type="search"
              name="q"
              placeholder="記事・スポットを検索"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                // 16px未満だと iOS Safari がフォーカス時に自動ズームする
                fontSize: 16,
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
              }}
            />
          </div>
        </form>
        <nav style={{ padding: '12px 8px' }}>
          {primary.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 14px',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--v2-ink, #2A2118)',
                borderRadius: 10,
              }}
            >
              <span style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                <V2Icon name={p.icon} size={20} color="var(--v2-orange-deep, #C85A14)" />
              </span>
              {p.label}
            </Link>
          ))}
        </nav>
        <div
          style={{
            margin: '8px 18px',
            borderTop: '1px solid var(--v2-line, #eee0d4)',
            paddingTop: 8,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--v2-ink-mute, #8E867A)',
          }}
        >
          サイト情報
        </div>
        <nav style={{ padding: '4px 8px 24px' }}>
          {footer.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              onClick={onClose}
              style={{
                display: 'block',
                padding: '11px 14px',
                fontSize: 13,
                color: 'var(--v2-ink-sub, #5C5446)',
                borderRadius: 8,
              }}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

// IA再編(2026-06): 「探す」を機能名「今日の流れ(today)」へ、特集を外し「エリア・駅(area)」を昇格。
export type V2NavActive =
  | 'home'
  | 'today'
  | 'spots'
  | 'articles'
  | 'area'
  | 'events'
  | 'saved';

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
  backHref = '/', // 既定はホーム。旧既定 '/v2' は404でサブページの「戻る」が壊れていた
  rightAction = 'menu',
  active,
}: FrameProps) {
  return (
    <V2ContextProvider>
      <div className="v2-root">
        <div className="v2-stage">
          <div className="v2-phone">
            {/*
              V2StatusBar（偽の 9:41 + Wi-Fi/シグナル/バッテリー）はデザインプロト用。
              実機（スマホ）では本物のステータスバーと二重表示になるので非表示にした。
              .v2-home-indicator（スマホ下部のホームバー）も同様の理由で削除。
            */}
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
              <V2Toast />
            </div>
          </div>
        </div>
      </div>
    </V2ContextProvider>
  );
}

// V2StatusBar / V2HomeIndicator は削除（実機の本物ステータスバーと2重表示してた）

function V2Header({
  variant,
  backHref,
  rightAction,
}: {
  variant: 'home' | 'sub' | 'saved';
  backHref: string;
  rightAction: 'menu' | 'share' | 'bookmark';
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  if (variant === 'home') {
    return (
      <>
        <div className="v2-app-header">
          <V2Logo tagline size={36} />
          <div className="v2-header-actions">
            <Link href="/search" className="v2-header-act" aria-label="検索">
              <V2Icon name="search" size={22} color="var(--v2-ink)" />
              <span>検索</span>
            </Link>
            <Link href="/favorites" className="v2-header-act" aria-label="保存したもの">
              <V2Icon name="bookmark" size={22} color="var(--v2-ink)" />
              <span>保存</span>
            </Link>
            <button
              type="button"
              className="v2-header-act"
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <V2Icon name="menu" size={22} color="var(--v2-ink)" />
              <span>メニュー</span>
            </button>
          </div>
        </div>
        <V2MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    );
  }
  if (variant === 'saved') {
    return (
      <>
        <div className="v2-app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ color: 'var(--v2-orange)', display: 'flex' }}>
              <V2Icon name="bookmark" size={24} fill />
            </span>
            <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>保存したもの</h1>
          </div>
          <div className="v2-header-actions">
            <Link href="/search" className="v2-header-act" aria-label="検索">
              <V2Icon name="search" size={22} color="var(--v2-ink)" />
              <span>検索</span>
            </Link>
            <button
              type="button"
              className="v2-header-act"
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <V2Icon name="menu" size={22} color="var(--v2-ink)" />
              <span>メニュー</span>
            </button>
          </div>
        </div>
        <V2MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
    );
  }
  // sub
  const right =
    rightAction === 'share' ? (
      <button type="button" className="v2-header-act" aria-label="シェア">
        <V2Icon name="share" size={20} color="var(--v2-ink)" />
        <span>シェア</span>
      </button>
    ) : (
      <Link href="/favorites" className="v2-header-act" aria-label="保存したもの">
        <V2Icon name="bookmark" size={20} color="var(--v2-ink)" />
        <span>保存</span>
      </Link>
    );
  return (
    <>
      <div className="v2-app-header plain">
        <Link href={backHref} className="v2-back-btn">
          <V2Icon name="chevron-left" size={20} />
          戻る
        </Link>
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <V2LogoMark size={26} />
          <span style={{ fontWeight: 800, color: 'var(--v2-orange)', fontSize: 18 }}>
            きょうのこ
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/search" className="v2-header-act" aria-label="検索">
            <V2Icon name="search" size={20} color="var(--v2-ink)" />
            <span>検索</span>
          </Link>
          {right}
          <button
            type="button"
            className="v2-header-act"
            onClick={() => setMenuOpen(true)}
            aria-label="メニューを開く"
          >
            <V2Icon name="menu" size={20} color="var(--v2-ink)" />
            <span>メニュー</span>
          </button>
        </div>
      </div>
      <V2MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

// 2026-08-04: スマホでコンテンツを圧迫していたため固定ボトムナビを廃止。
// 各項目は右上のハンバーガーメニュー（V2MobileMenu）に集約済み。

function V2DesktopHeader({ active }: { active?: V2NavActive }) {
  const links = [
    { k: 'home', t: 'ホーム', icon: 'home', href: '/' },
    { k: 'today', t: '今日の流れ', icon: 'sparkle', href: '/today' },
    { k: 'spots', t: 'スポット一覧', icon: 'flag', href: '/spots' },
    // 2026-07-31: 記事はサイト全クリックの81.5%・1ページあたり39クリックを生む最大の面だが
    // ナビに導線が1つも無かった。一方 /area は90日で計9クリック（20ページ中16ページが0）で
    // noindex 化したため、この枠を記事に置き換える。
    { k: 'articles', t: '記事', icon: 'book', href: '/articles' },
    { k: 'events', t: 'イベント', icon: 'calendar', href: '/events' },
    { k: 'saved', t: '保存', icon: 'bookmark', href: '/favorites' },
  ] as const;
  return (
    <header className="v2-dt-header">
      <Link href="/" className="v2-dt-logo">
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
      <Link href="/search" className="v2-dt-search">
        <V2Icon name="search" size={17} />
        スポット・駅を検索
      </Link>
      <Link href="/favorites" className="v2-dt-save">
        <V2Icon name="bookmark" size={17} color="#fff" />
        保存
      </Link>
    </header>
  );
}
