'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { V2Icon, V2_ACCENT } from './V2Icon';

/* ===========================================================
   App context (saved state + navigation root)
   =========================================================== */

type Ctx = {
  saved: Record<string, number>;
  toggleSave: (id: string) => void;
  toast: string;
};
const V2Ctx = React.createContext<Ctx>({ saved: {}, toggleSave: () => {}, toast: '' });

const LS_SAVED = 'kk_saved_v2';

export function V2ContextProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = React.useState<Record<string, number>>({});
  const [toast, setToast] = React.useState('');
  const toastT = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_SAVED) || '{}');
      setSaved(s);
    } catch {
      /* ignore */
    }
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_SAVED, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const toggleSave = React.useCallback((id: string) => {
    setSaved((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
        flash('保存を解除しました');
      } else {
        next[id] = Date.now();
        flash('保存しました');
      }
      return next;
    });
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(''), 1500);
  };

  return (
    <V2Ctx.Provider value={{ saved, toggleSave, toast }}>{children}</V2Ctx.Provider>
  );
}

export function useV2Ctx() {
  return React.useContext(V2Ctx);
}

/* ===========================================================
   Image — uses native <img> for any remote/local path.
   画像未配置/読み込み失敗時は、ランダムなストック写真(picsum)ではなく
   ブランドの自前プレースホルダ（クリーム地＋くまマーク）を出す。
   子育てメディアで無関係な他人の写真が出る「架空感」を防ぐ。
   =========================================================== */
const KK_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="462" viewBox="0 0 820 462">` +
      `<rect width="820" height="462" fill="#FBF5E8"/>` +
      `<g fill="#ECD9BE"><circle cx="384" cy="196" r="30"/><circle cx="436" cy="196" r="30"/><circle cx="410" cy="240" r="52"/></g>` +
      `<circle cx="396" cy="232" r="6" fill="#FBF5E8"/><circle cx="424" cy="232" r="6" fill="#FBF5E8"/>` +
      `<text x="410" y="330" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#C2B49A">きょうのこ</text>` +
      `</svg>`,
  );
type ImgProps = {
  src?: string;
  seed?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};
export function V2Img({ src, seed, alt = '', className, style }: ImgProps) {
  const fallback = KK_PLACEHOLDER;
  const [actual, setActual] = React.useState(src || fallback);
  React.useEffect(() => {
    setActual(src || fallback);
  }, [src, fallback]);
  return (
    <img
      src={actual}
      alt={alt}
      loading="lazy"
      className={className}
      style={style}
      onError={() => setActual(fallback)}
    />
  );
}

/* ===========================================================
   Tag pill
   =========================================================== */
export function V2Tag({
  label,
  tone,
}: {
  label: string;
  tone?: '' | 'age' | 'rain' | 'feat';
}) {
  return <span className={'v2-tag ' + (tone || '')}>{label}</span>;
}

/* ===========================================================
   Logo
   =========================================================== */
export function V2LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="きょうのこ">
      <circle cx="13" cy="13" r="6.5" fill="var(--v2-orange)" />
      <circle cx="35" cy="13" r="6.5" fill="var(--v2-orange)" />
      <circle cx="24" cy="26" r="17" fill="var(--v2-orange)" />
      <circle cx="17.5" cy="24" r="2.5" fill="#fff" />
      <circle cx="30.5" cy="24" r="2.5" fill="#fff" />
      <path d="M19 31c1.6 2 8.4 2 10 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="14.5" cy="29.5" r="2" fill="#fff" opacity=".55" />
      <circle cx="33.5" cy="29.5" r="2" fill="#fff" opacity=".55" />
    </svg>
  );
}

export function V2Logo({ tagline = false, size = 38 }: { tagline?: boolean; size?: number }) {
  return (
    <div className="v2-logo-wrap">
      <V2LogoMark size={size} />
      <div>
        <div className="v2-logo-text" style={{ fontSize: size * 0.62 }}>
          きょうのこ
        </div>
        {tagline && <div className="v2-logo-tag">子どもと一緒の「今日」をもっと楽しく。</div>}
      </div>
    </div>
  );
}

/* ===========================================================
   Fav button
   =========================================================== */
export function V2FavBtn({
  id,
  shape = 'heart',
  variant,
}: {
  id: string;
  shape?: 'heart' | 'bookmark';
  variant?: 'static';
}) {
  const { saved, toggleSave } = useV2Ctx();
  const on = !!saved[id];
  return (
    <button
      className={'v2-fav-btn' + (variant === 'static' ? ' static' : '')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(id);
      }}
      aria-label="保存"
      type="button"
    >
      <span className={on ? 'v2-pop' : ''} style={{ display: 'flex' }}>
        <V2Icon
          name={shape}
          size={18}
          color={on ? 'var(--v2-orange)' : '#bdbdbd'}
          fill={on}
        />
      </span>
    </button>
  );
}

/* ===========================================================
   Section header (with optional `more` link)
   =========================================================== */
type SecHeadProps = {
  title: string;
  icon?: import('./V2Icon').V2IconName;
  accent?: keyof typeof V2_ACCENT;
  more?: string;
  moreHref?: string;
  muteMore?: boolean;
};
export function V2SectionHead({
  title,
  icon,
  accent,
  more = 'もっと見る',
  moreHref,
  muteMore,
}: SecHeadProps) {
  const a = accent ? V2_ACCENT[accent] : undefined;
  return (
    <div className="v2-sec-head">
      <div className="v2-sec-title">
        {icon ? (
          <span style={{ color: a?.c, display: 'flex' }}>
            <V2Icon name={icon} size={20} />
          </span>
        ) : (
          <span className="v2-bar-accent"></span>
        )}
        {title}
      </div>
      {more && moreHref ? (
        <Link href={moreHref} className={'v2-sec-more' + (muteMore ? ' mute' : '')}>
          {more} <V2Icon name="arrow-right" size={14} />
        </Link>
      ) : more ? (
        <button className={'v2-sec-more' + (muteMore ? ' mute' : '')} type="button">
          {more} <V2Icon name="arrow-right" size={14} />
        </button>
      ) : null}
    </div>
  );
}

/* ===========================================================
   Toast
   =========================================================== */
export function V2Toast() {
  const { toast } = useV2Ctx();
  if (!toast) return null;
  return <div className="v2-toast">{toast}</div>;
}
