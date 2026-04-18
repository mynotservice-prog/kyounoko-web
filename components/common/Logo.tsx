import Link from 'next/link';

type Props = {
  variant?: 'light' | 'dark'; // light = for light bg (header), dark = for dark bg (footer)
};

export function Logo({ variant = 'light' }: Props) {
  const isDark = variant === 'dark';
  return (
    <Link href="/" className="logo" aria-label="きょうのこ トップへ">
      <span className="logo-mark">
        {isDark ? <LogoMarkDark /> : <LogoMarkLight />}
      </span>
      <span>きょうのこ</span>
    </Link>
  );
}

function LogoMarkLight() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lmH" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D16A47" />
          <stop offset="100%" stopColor="#9E4428" />
        </linearGradient>
      </defs>
      <rect className="lm-bg" x="2" y="2" width="36" height="36" rx="12" fill="url(#lmH)" />
      <text
        x="20"
        y="29"
        textAnchor="middle"
        fontFamily="'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif"
        fontSize="22"
        fontWeight="900"
        fill="#FCF8EF"
      >
        こ
      </text>
      <circle cx="31" cy="10" r="2.4" fill="#FCF8EF" opacity="0.75" />
    </svg>
  );
}

function LogoMarkDark() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lmF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCF8EF" />
          <stop offset="100%" stopColor="#EBE2D1" />
        </linearGradient>
      </defs>
      <rect className="lm-bg" x="2" y="2" width="36" height="36" rx="12" fill="url(#lmF)" />
      <text
        x="20"
        y="29"
        textAnchor="middle"
        fontFamily="'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif"
        fontSize="22"
        fontWeight="900"
        fill="#B4543A"
      >
        こ
      </text>
      <circle cx="31" cy="10" r="2.4" fill="#B4543A" opacity="0.5" />
    </svg>
  );
}
