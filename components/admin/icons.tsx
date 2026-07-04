// Admin ナビ用の線アイコン（Claude Design ハンドオフの SVG パスを移植）
// 単色 stroke。currentColor を継承するので親の color で着色できる。
import type { CSSProperties } from 'react';

const PATHS: Record<string, string[]> = {
  dashboard: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M14 14h6v6h-6z', 'M4 14h6v6H4z'],
  kpi: ['M4 16l5-5 4 4 7-7', 'M16 8h5v5'],
  insights: ['M22 12h-4l-3 8-5-16-3 8H2'],
  events: ['M13 3L4 14h7l-1 7 9-11h-7z'],
  ab: ['M4 8h9a4 4 0 010 8H4', 'M16 5l3 3-3 3', 'M16 13l3 3-3 3'],
  seo: [
    'M12 3a9 9 0 100 18 9 9 0 000-18z',
    'M3 12h18',
    'M12 3c2.6 2.4 2.6 15.6 0 18',
    'M12 3c-2.6 2.4-2.6 15.6 0 18',
  ],
  articles: ['M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z', 'M14 3v5h5', 'M9 13h6', 'M9 17h4'],
  plans: ['M12 3l9 5-9 5-9-5z', 'M3 12l9 5 9-5', 'M3 16l9 5 9-5'],
  spots: ['M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z', 'M12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'],
  'spot-edit': ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z'],
  'article-edit': ['M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h5', 'M14 3v5h5', 'M17.5 12.5a1.8 1.8 0 012.5 2.5L14 21l-3 .8.8-3z'],
  'event-edit': ['M4 5h16v16H4z', 'M4 10h16', 'M9 3v4', 'M15 3v4'],
  imagegen: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 3-3 4 4', 'M9 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3'],
  chevron: ['M14 7l-5 5 5 5'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6'],
  search: ['M11 4a7 7 0 100 14 7 7 0 000-14z', 'M21 21l-4.3-4.3'],
  plus: ['M12 5v14', 'M5 12h14'],
  back: ['M14 7l-5 5 5 5'],
  image: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 3-3 4 4', 'M9 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3'],
  reviews: ['M4 5h16v11H8l-4 4z', 'M12 7.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2L8.8 9.8 11 9.5z'],
};

export type AdminIconName = keyof typeof PATHS;

export function AdminIcon({
  name,
  size = 18,
  strokeWidth = 1.7,
  style,
}: {
  name: AdminIconName | string;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  const paths = PATHS[name] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flex: '0 0 auto', ...style }}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
