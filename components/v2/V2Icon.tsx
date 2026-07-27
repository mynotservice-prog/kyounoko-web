/* eslint-disable @next/next/no-img-element */
import React from 'react';

/**
 * きょうのこ /v2 アイコンセット
 * プロトタイプ components/base.jsx の Icon を React 19 + TypeScript に移植。
 */
export type V2IconName =
  | 'umbrella' | 'sun' | 'house' | 'fork' | 'party' | 'free' | 'search'
  | 'home' | 'bookmark' | 'book' | 'heart' | 'menu'
  | 'chevron-right' | 'chevron-down' | 'chevron-left' | 'arrow-right'
  | 'pin' | 'baby' | 'clock' | 'sliders' | 'sort' | 'edit' | 'share'
  | 'calendar' | 'crown' | 'building' | 'train' | 'tree' | 'flag'
  | 'tower' | 'leaf' | 'ship' | 'flower' | 'clover' | 'onsen' | 'boat'
  | 'stroller' | 'yen' | 'grid' | 'star' | 'sparkle' | 'info'
  | 'question' | 'plus' | 'link' | 'cart' | 'milk' | 'car' | 'locker'
  | 'camera' | 'crowd' | 'star-half' | 'tag';

type Props = {
  name: V2IconName;
  size?: number;
  color?: string;
  sw?: number;
  fill?: boolean;
  style?: React.CSSProperties;
};

export function V2Icon({
  name,
  size = 22,
  color = 'currentColor',
  sw = 2,
  fill = false,
  style,
}: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  };
  switch (name) {
    case 'umbrella': return <svg {...p}><path d="M12 3v2"/><path d="M3.5 12a8.5 6 0 0 1 17 0Z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>;
    case 'house': return <svg {...p}><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>;
    case 'fork': return <svg {...p}><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11"/><path d="M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5Zm0 9v9"/></svg>;
    case 'party': return <svg {...p}><path d="M4 20l5-13 8 8-13 5Z"/><path d="M14 5l1-2M18 7l2-1M17 11l2 0M13 3l0-1"/></svg>;
    case 'free': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9h4.5a2 2 0 0 1 0 4H9m0-2h6M9 16h5"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'home': return <svg {...p} fill={fill ? color : 'none'} stroke={fill ? 'none' : color}><path d="M4 11l8-6 8 6v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z"/></svg>;
    case 'bookmark': return <svg {...p} fill={fill ? color : 'none'} stroke={color}><path d="M6 4h12v16l-6-4-6 4Z"/></svg>;
    case 'book': return <svg {...p} fill={fill ? color : 'none'}><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2Z" stroke={color}/><path d="M20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2Z" stroke={color}/></svg>;
    case 'heart': return <svg {...p} fill={fill ? color : 'none'} stroke={color}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case 'menu': return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'chevron-right': return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>;
    case 'chevron-down': return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevron-left': return <svg {...p}><path d="m15 6-6 6 6 6"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M4 12h15M13 6l6 6-6 6"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'baby': return <svg {...p}><circle cx="12" cy="9" r="4.5"/><path d="M9.5 8.5h.01M14.5 8.5h.01M10.5 11.5c.8.6 2.2.6 3 0"/><path d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'sliders': return <svg {...p}><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2.2"/><circle cx="8" cy="16" r="2.2"/></svg>;
    case 'sort': return <svg {...p}><path d="M7 5v14M7 19l-3-3M7 5l3 3M17 19V5M17 5l3 3M17 19l-3-3"/></svg>;
    case 'edit': return <svg {...p}><path d="M4 20h4l10-10-4-4L4 16Z"/><path d="m14 6 4 4"/></svg>;
    case 'share': return <svg {...p}><path d="M12 3v12M12 3 8 7M12 3l4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>;
    case 'calendar': return <svg {...p}><rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 9h16M8 3v3M16 3v3"/></svg>;
    case 'crown': return <svg {...p}><path d="M4 18h16M4 18l-1-9 5 4 4-7 4 7 5-4-1 9Z"/></svg>;
    case 'building': return <svg {...p}><rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M10 21v-3h4v3"/></svg>;
    case 'train': return <svg {...p}><rect x="5" y="4" width="14" height="13" rx="3"/><path d="M5 11h14M9 21l-2-2M15 21l2-2"/></svg>;
    case 'tree': return <svg {...p}><path d="M12 3 6 11h3l-3 5h12l-3-5h3Z"/><path d="M12 16v5"/></svg>;
    case 'flag': return <svg {...p}><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg>;
    case 'tower': return <svg {...p}><path d="M9 21l3-16 3 16M9 21h6M10 11h4M8 17h8"/></svg>;
    case 'leaf': return <svg {...p}><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z"/><path d="M5 19c4-4 7-7 11-9"/></svg>;
    case 'ship': return <svg {...p}><path d="M4 16h16l-2 4H6Z"/><path d="M6 16V8l6-3 6 3v8"/><path d="M12 5V2"/></svg>;
    case 'flower': return <svg {...p}><circle cx="12" cy="12" r="2.2"/><path d="M12 5a2.5 2.5 0 0 1 0 5M12 19a2.5 2.5 0 0 0 0-5M5 12a2.5 2.5 0 0 1 5 0M19 12a2.5 2.5 0 0 0-5 0"/></svg>;
    case 'clover': return <svg {...p}><path d="M12 12c-2-3-6-2-6 1s4 3 6 0Zm0 0c2-3 6-2 6 1s-4 3-6 0Zm0 0c-3 2-2 6 1 6s3-4 0-6Z"/></svg>;
    case 'onsen': return <svg {...p}><path d="M8 8c0-1 1-1.5 1-2.5M12 8c0-1 1-1.5 1-2.5M16 8c0-1 1-1.5 1-2.5"/><path d="M5 13h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/></svg>;
    case 'boat': return <svg {...p}><path d="M4 15h16l-2 5H6Z"/><path d="M7 15V9h10v6M12 9V5"/></svg>;
    case 'stroller': return <svg {...p}><path d="M4 6h3l3 7h8a6 6 0 0 0-11-7"/><path d="M4 13h16"/><circle cx="8" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>;
    case 'yen': return <svg {...p}><path d="M7 5l5 7 5-7M12 12v7M8 14h8M8 17h8"/></svg>;
    case 'grid': return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>;
    case 'star': return <svg {...p} fill={fill ? color : 'none'}><path d="m12 3 2.6 5.5 6 .8-4.3 4.2 1 6L12 17l-5.3 2.5 1-6L3.4 9.3l6-.8Z"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>;
    case 'question': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.8.3-1.3.9-1.3 1.6v.5M12 17h.01"/></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'link': return <svg {...p}><path d="M9 15l6-6M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2"/></svg>;
    case 'cart': return <svg {...p}><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.2 11h10l1.8-8H6"/></svg>;
    case 'milk': return <svg {...p}><path d="M8 3h8l-1 4v13a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7Z"/><path d="M9 11h6"/></svg>;
    case 'car': return <svg {...p}><path d="M5 16v3M19 16v3M4 16h16l-1.5-6a2 2 0 0 0-2-1.5H7.5a2 2 0 0 0-2 1.5Z"/><path d="M6 13h12"/></svg>;
    case 'locker': return <svg {...p}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v18M9 7h.01M15 7h.01"/></svg>;
    case 'camera': return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.2"/><path d="M8 7l1.5-2.5h5L16 7"/></svg>;
    case 'crowd': return <svg {...p}><circle cx="8" cy="8" r="2.4"/><circle cx="16" cy="8" r="2.4"/><path d="M4 19v-1a4 4 0 0 1 4-4 4 4 0 0 1 3 1.4A4 4 0 0 1 16 14a4 4 0 0 1 4 4v1"/></svg>;
    case 'star-half': return <svg {...p}><path d="m12 3 2.6 5.5 6 .8-4.3 4.2 1 6L12 17l-5.3 2.5 1-6L3.4 9.3l6-.8Z"/></svg>;
    case 'tag': return <svg {...p}><path d="M3 12V4h8l10 10-8 8L3 12Z"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

/* Color accent map (same keys as ACCENT in prototype) */
export const V2_ACCENT: Record<string, { c: string; bg: string }> = {
  rain:   { c: 'var(--v2-c-rain)',   bg: 'var(--v2-c-rain-bg)' },
  sun:    { c: 'var(--v2-c-sun)',    bg: 'var(--v2-c-sun-bg)' },
  indoor: { c: 'var(--v2-c-indoor)', bg: 'var(--v2-c-indoor-bg)' },
  lunch:  { c: 'var(--v2-c-lunch)',  bg: 'var(--v2-c-lunch-bg)' },
  event:  { c: 'var(--v2-c-event)',  bg: 'var(--v2-c-event-bg)' },
  free:   { c: 'var(--v2-c-free)',   bg: 'var(--v2-c-free-bg)' },
  purple: { c: 'var(--v2-c-purple)', bg: 'var(--v2-c-purple-bg)' },
};
