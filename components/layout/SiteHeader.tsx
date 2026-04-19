import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

type Props = {
  currentCategory?:
    | 'today-doko'
    | 'today-nani'
    | 'today-taberu'
    | 'today-mawasu'
    | 'gyouji'
    | 'narai'
    | 'items';
  showLiveChip?: boolean;
};

const NAV_ITEMS = [
  { key: 'today-doko', href: '/category/today-doko', label: '今日どこ行く' },
  { key: 'today-nani', href: '/category/today-nani', label: '今日何する' },
  { key: 'today-taberu', href: '/category/today-taberu', label: '今日何食べる' },
  { key: 'today-mawasu', href: '/category/today-mawasu', label: '今日どう回す' },
  { key: 'gyouji', href: '/category/gyouji', label: '季節と行事' },
  { key: 'narai', href: '/category/narai', label: '習い事' },
  { key: 'items', href: '/items', label: '役立つもの' },
] as const;

export function SiteHeader({ currentCategory, showLiveChip = false }: Props) {
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
          <Link href="/favorites" aria-label="お気に入り" title="お気に入り" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, color: 'var(--ink-sub)',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </Link>
          <Link href="/settings" aria-label="設定" title="設定" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, color: 'var(--ink-sub)',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
          <Link href="/#finder" className="btn-primary">
            条件で探す
          </Link>
        </div>
      </div>
    </header>
  );
}

function LiveChip() {
  // NOTE: 動的な時刻表示はクライアントコンポーネント側で差し替え推奨
  return (
    <span className="live-chip" suppressHydrationWarning>
      <span className="live-dot"></span>
      <span id="liveText">Today · Tokyo</span>
    </span>
  );
}
