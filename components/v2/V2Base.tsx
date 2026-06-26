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
   Falls back to picsum if the source fails (mirror prototype).
   =========================================================== */
type ImgProps = {
  src?: string;
  seed?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};
export function V2Img({ src, seed, alt = '', className, style }: ImgProps) {
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(seed || alt || 'kk')}/820/462`;
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
  // 2026-06 刷新: 旧くまマーク(インラインSVG) → 走る子ども＋ハートの円形ロゴ画像。
  // 原画 public/new_logo/ より円部分を切出した public/img/kyounoko-logo-mark.webp を使用。
  return (
    <img
      src="/img/kyounoko-logo-mark.webp"
      width={size}
      height={size}
      alt="きょうのこ"
      style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }}
    />
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
