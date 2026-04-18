import Link from 'next/link';

type Props = {
  active?: 'today-doko' | 'today-nani' | 'today-taberu';
};

export function MobileStickyNav({ active }: Props) {
  return (
    <nav className="mobile-nav" aria-label="主要ナビ">
      <Link
        href="/category/today-doko"
        className={active === 'today-doko' ? 'active' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" />
        </svg>
        今日どこ
      </Link>
      <Link
        href="/category/today-nani"
        className={active === 'today-nani' ? 'active' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="m16.24 16.24 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
        </svg>
        今日何する
      </Link>
      <Link
        href="/category/today-taberu"
        className={active === 'today-taberu' ? 'active' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18" />
          <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
        </svg>
        今日食べる
      </Link>
    </nav>
  );
}
