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
