import React from 'react';

/**
 * きょうのこ アイコンセット（線画・24×24・stroke 1.8・currentColor）。
 *
 * 出典: 社長支給の `kyounoko_icon_pack`（README のルール = 24×24 / stroke-width 1.8 /
 * 基本色 currentColor / 墨 #25201B / オレンジ #EE7A2E / 紙 #FBF5E8）。
 * パック収録の 31 種はそのまま採用し、アイコンセット表にあって未収録の概念
 * （天気・食べる・子どもの好き・設備の残り等）を同じ作法で追加した。
 *
 * 方針:
 * - **絵文字は使わない**。UI上の記号はすべてこのコンポーネントに置き換える。
 * - アイコン自体は色分けしない（墨1色）。色を持たせるのは「あり/なし」等の状態表示だけ。
 */
export type KkIconName =
  // 人物・年齢
  | 'child' | 'child-color' | 'age' | 'baby' | 'kids' | 'family'
  // 天気・条件
  | 'sunny' | 'cloudy' | 'rain' | 'snow' | 'hot' | 'cold'
  // 探す・検索
  | 'search' | 'today' | 'tomorrow' | 'weekend' | 'pin' | 'map' | 'station'
  | 'popular' | 'save' | 'heart' | 'menu' | 'clock' | 'calendar' | 'home'
  // 料金・その他
  | 'free' | 'yen' | 'nature' | 'indoor' | 'outdoor'
  // スポットの種類
  | 'park' | 'zoo' | 'aquarium' | 'museum' | 'shrine' | 'playground'
  | 'kids-space' | 'themepark' | 'pool' | 'seasonal'
  // 食べる
  | 'lunch' | 'famires' | 'ramen' | 'sushi' | 'yakiniku' | 'fastfood'
  | 'cafe' | 'italian' | 'family-menu' | 'baby-chair' | 'kids-menu'
  // 子どもの好き・ジャンル
  | 'toy' | 'book' | 'art' | 'animal' | 'sealife' | 'dinosaur'
  | 'train' | 'vehicle' | 'character' | 'music' | 'science' | 'learning'
  // 設備・サービス
  | 'nursing' | 'diaper' | 'accessible-toilet' | 'stroller' | 'parking'
  | 'wifi' | 'locker' | 'babyfood' | 'microwave' | 'rest-space' | 'smoking'
  // 操作・記号
  | 'arrow-right' | 'chevron-right' | 'chevron-down' | 'link' | 'check'
  | 'walk' | 'swap' | 'phone' | 'instagram' | 'info' | 'umbrella' | 'ticket'
  | 'event' | 'plus' | 'refresh' | 'edit';

/* パック収録分はそのまま、追加分は同じ作法（線・角丸・24グリッド）で作図 */
const PATHS: Record<KkIconName, React.ReactNode> = {
  /* ---- 人物・年齢 ---- */
  child: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.5 10.2c.9-2.2 2.4-3.7 4.5-4.2 2 .4 3.6 1.8 4.5 4.2" />
      <circle cx="9.2" cy="12" r=".45" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12" r=".45" fill="currentColor" stroke="none" />
      <path d="M9.2 15c1.8 1.4 3.8 1.4 5.6 0" />
    </>
  ),
  'child-color': (
    <>
      <circle cx="12" cy="12" r="9" fill="#FFF3E6" stroke="none" />
      <path d="M6.8 10.2c1-2.7 3-4.4 5.2-4.4 2.3 0 4.2 1.7 5.2 4.4" stroke="#25201B" />
      <circle cx="9.2" cy="12" r=".55" fill="#25201B" stroke="none" />
      <circle cx="14.8" cy="12" r=".55" fill="#25201B" stroke="none" />
      <path d="M9.2 15c1.8 1.4 3.8 1.4 5.6 0" stroke="#EE7A2E" />
    </>
  ),
  age: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5c-2 0-3 1.9-3 4.5s1 4.5 3 4.5 3-1.9 3-4.5-1-4.5-3-4.5Z" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10.5h.01M15 10.5h.01" />
      <path d="M9.5 14.5c1.6 1.3 3.4 1.3 5 0" />
      <path d="M12 3.5V2" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="6.5" r="3" />
      <path d="M6.5 21v-5.5a5.5 5.5 0 0 1 11 0V21" />
      <path d="M9.5 21v-4M14.5 21v-4" />
    </>
  ),
  family: (
    <>
      <circle cx="7" cy="6.5" r="2.6" />
      <circle cx="17" cy="6.5" r="2.6" />
      <circle cx="12" cy="13" r="2" />
      <path d="M2.5 20v-4a4.5 4.5 0 0 1 9 0" />
      <path d="M12.5 20v-4a4.5 4.5 0 0 1 9 0" />
      <path d="M9.5 20v-2.5a2.5 2.5 0 0 1 5 0V20" />
    </>
  ),

  /* ---- 天気・条件 ---- */
  sunny: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7" />
    </>
  ),
  cloudy: (
    <>
      <path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 9.6 4.2 4.2 0 0 1 17.5 18H7Z" />
    </>
  ),
  rain: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0H4Z" />
      <path d="M12 12v6a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  snow: (
    <>
      <circle cx="12" cy="8" r="3" />
      <circle cx="12" cy="16" r="4.5" />
      <path d="M12 5V3M8 6.5 6 5M16 6.5 18 5" />
    </>
  ),
  hot: (
    <>
      <path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z" />
      <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
      <path d="M16.5 6h3M16.5 9.5h2" />
    </>
  ),
  cold: (
    <>
      <path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z" />
      <path d="M12 15.5V9" />
      <path d="M18 5v6M15.5 6.5 18 5l2.5 1.5M15.5 9.5 18 11l2.5-1.5" />
    </>
  ),

  /* ---- 探す・検索 ---- */
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  today: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
      <circle cx="12" cy="15" r="2.2" />
    </>
  ),
  tomorrow: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
      <path d="M9 15h6m-2.5-2.5L15 15l-2.5 2.5" />
    </>
  ),
  weekend: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
      <path d="M14.5 12.5h3.5v3.5h-3.5z" fill="currentColor" stroke="none" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  station: (
    <>
      <rect x="6" y="3" width="12" height="15" rx="2" />
      <path d="M9 6h6M9 10h6M8 21l2-3M16 18l2 3" />
      <circle cx="9" cy="14.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14.5" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  popular: (
    <>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19l1-5.8-4.3-4.1 5.9-.9L12 3Z" />
    </>
  ),
  save: (
    <>
      <path d="M6 3.5h12v17l-6-4.2-6 4.2v-17Z" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 5.8c-2-2.1-5.3-2.1-7.3 0L12 7.3l-1.5-1.5c-2-2.1-5.3-2.1-7.3 0-2.1 2.2-2.1 5.7 0 7.9L12 22l8.8-8.3c2.1-2.2 2.1-5.7 0-7.9Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
    </>
  ),
  event: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 9h18" />
      <path d="m8.5 14 2 2 4-4" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-7 9 7" />
      <path d="M5.5 10.5V21h13V10.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),

  /* ---- 料金・その他 ---- */
  free: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 7.5 12 12l3.5-4.5M8.5 12h7M8.5 15h7M12 12v5" />
    </>
  ),
  yen: <path d="M6 4.5 12 12l6-7.5M7 12h10M7 15.5h10M12 12v7.5" />,
  nature: (
    <>
      <path d="M20 4c0 8-5 12-11 12H5c0-8 5-12 11-12h4Z" />
      <path d="M5 21c1.5-5 4.5-8.5 9-11" />
    </>
  ),
  indoor: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V21h13V10.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  outdoor: (
    <>
      <path d="M2.5 19h19" />
      <path d="m5 19 5.5-9 3.5 5.5 2-3L21 19" />
      <circle cx="17.5" cy="6" r="2.5" />
    </>
  ),

  /* ---- スポットの種類 ---- */
  park: (
    <>
      <path d="M6 20v-6M18 20v-7" />
      <path d="M6 14c-2.6 0-4.5-1.7-4.5-4 0-1.8 1.2-3.2 2.8-3.7C4.4 3.9 6 2 8 2c2.2 0 3.8 2.2 3.6 4.4 1.5.5 2.5 1.9 2.5 3.5 0 2.3-1.9 4.1-4.4 4.1H6Z" />
      <path d="M18 13c-2.2 0-3.8-1.5-3.8-3.5 0-1.4.8-2.6 2.1-3.2C16.4 4.4 17.7 3 19.3 3c1.8 0 3.1 1.7 3 3.5 1 .5 1.7 1.5 1.7 2.7 0 2-1.6 3.8-4 3.8H18Z" />
    </>
  ),
  zoo: (
    <>
      <path d="M5 10c0-3 2.3-5 5.3-5 1.8 0 3.2.7 4.3 1.8L18 5.5l1.5 3-2.3 2c.2.5.3 1 .3 1.5 0 3-2.6 5.5-6 5.5H8.5" />
      <path d="M6 14v6M10 17v3M15 16v4" />
      <path d="M5 12H3v3h2M13 8h.1" />
    </>
  ),
  aquarium: (
    <>
      <path d="M3 12c3.5-4 7.5-5.5 12-3l4-3v12l-4-3c-4.5 2.5-8.5 1-12-3Z" />
      <circle cx="11" cy="11" r=".4" fill="currentColor" stroke="none" />
    </>
  ),
  museum: (
    <>
      <path d="M3 9 12 4l9 5" />
      <path d="M5 9h14M6 9v9M10 9v9M14 9v9M18 9v9M4 18h16M3 21h18" />
    </>
  ),
  shrine: (
    <>
      <path d="M4 5h16M6 5v3M18 5v3M8 8h8M9 8v13M15 8v13" />
      <path d="M6 12h12" />
    </>
  ),
  playground: (
    <>
      <path d="M4 20V7h8l4 5v8" />
      <path d="M8 7V4M8 4h6" />
      <path d="M12 12h7l-4 8" />
      <circle cx="6" cy="16" r="2" />
    </>
  ),
  'kids-space': (
    <>
      <path d="M3 10.5 12 4l9 6.5V21H3V10.5Z" />
      <rect x="7" y="13" width="4" height="4" />
      <circle cx="15.5" cy="15" r="2" />
    </>
  ),
  themepark: (
    <>
      <circle cx="12" cy="10" r="7" />
      <circle cx="12" cy="10" r="2" />
      <path d="M12 3v3M12 14v3M5 10h3M16 10h3M7 5l2.2 2.2M14.8 12.8 17 15M7 15l2.2-2.2M14.8 7.2 17 5" />
      <path d="M8 21h8l-2-4h-4l-2 4Z" />
    </>
  ),
  pool: (
    <>
      <path d="M8 15V5a2 2 0 0 1 4 0M14 15V5a2 2 0 0 1 4 0" />
      <path d="M8 9h4M14 9h4" />
      <path d="M2.5 18c1.6 0 1.6 1.6 3.2 1.6S7.3 18 9 18s1.6 1.6 3.2 1.6S13.8 18 15.5 18s1.6 1.6 3.2 1.6S20.4 18 22 18" />
    </>
  ),
  seasonal: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 9.6c0-3 1.4-4.6 3.6-4.6.6 2.6-.6 4-3.6 4.6ZM12 9.6C12 6.6 10.6 5 8.4 5c-.6 2.6.6 4 3.6 4.6Z" />
      <path d="M14.4 12c3 0 4.6 1.4 4.6 3.6-2.6.6-4-.6-4.6-3.6ZM9.6 12c-3 0-4.6 1.4-4.6 3.6 2.6.6 4-.6 4.6-3.6Z" />
      <path d="M12 14.4V21" />
    </>
  ),

  /* ---- 食べる ---- */
  lunch: (
    <>
      <path d="M4 3v7M7 3v7M4 7h3M5.5 10v11" />
      <path d="M14 3v8c0 2 1.4 3 3 3V3" />
      <path d="M17 14v7" />
    </>
  ),
  famires: (
    <>
      <path d="M3 14c0-4 4-7 9-7s9 3 9 7H3Z" />
      <path d="M2 14h20M5 17.5h14M8 21h8" />
      <path d="M12 7V4.5" />
    </>
  ),
  ramen: (
    <>
      <path d="M3.5 11h17c0 4.5-3.8 8-8.5 8s-8.5-3.5-8.5-8Z" />
      <path d="M2.5 21h19" />
      <path d="M8 8c0-1.5 1-2 1-3.5M12 8c0-1.5 1-2 1-3.5M16 8c0-1.5 1-2 1-3.5" />
    </>
  ),
  sushi: (
    <>
      <path d="M4 13.5h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" />
      <path d="M4 13.5c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5" />
      <path d="M9 11.2c1-1.2 2-1.8 3-1.8s2 .6 3 1.8" />
    </>
  ),
  yakiniku: (
    <>
      <rect x="3" y="12" width="18" height="7" rx="1.5" />
      <path d="M6.5 12V9.5M12 12V8.5M17.5 12V9.5" />
      <path d="M6 19v2M18 19v2M7 15.5h10" />
    </>
  ),
  fastfood: (
    <>
      <path d="M4 10c0-3.3 3.6-6 8-6s8 2.7 8 6H4Z" />
      <path d="M3.5 13.5h17M4.5 17h15" />
      <path d="M3.5 10h17" />
      <path d="M4.5 17c0 1.7 1.3 3 3 3h9c1.7 0 3-1.3 3-3" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 8h13v6.5a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 4 14.5V8Z" />
      <path d="M17 10h1.8a2.6 2.6 0 0 1 0 5.2H17" />
      <path d="M3 21h15" />
      <path d="M8 5c0-1 .8-1.4.8-2.5M12 5c0-1 .8-1.4.8-2.5" />
    </>
  ),
  italian: (
    <>
      <path d="M12 3 3.5 19.5c5.5 2.5 11.5 2.5 17 0L12 3Z" />
      <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  'family-menu': (
    <>
      <path d="M3.5 12h17c0 4-3.8 7-8.5 7s-8.5-3-8.5-7Z" />
      <path d="M2.5 21h19" />
      <path d="M14 8.5c2 0 3 1 3 2.5M11 6c0 1.5-1 2-1 3.5" />
    </>
  ),
  'baby-chair': (
    <>
      <path d="M8 4h8v6H8z" />
      <path d="M8 10 6.5 21M16 10l1.5 11" />
      <path d="M7.2 15h9.6" />
      <path d="M10 10v5M14 10v5" />
    </>
  ),
  'kids-menu': (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9.5 12h.01M14.5 12h.01" />
      <path d="M10 15.5c1.2 1 2.8 1 4 0" />
      <path d="M12 6V3.5h3" />
    </>
  ),

  /* ---- 子どもの好き・ジャンル ---- */
  toy: (
    <>
      <rect x="4" y="11" width="7" height="7" />
      <circle cx="15.5" cy="14.5" r="3.5" />
      <path d="m18 6 2 4h-4l2-4ZM7.5 4 10 8H5l2.5-4Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 5c3-.8 5.5-.3 8 1.5V20c-2.5-1.8-5-2.3-8-1.5V5Z" />
      <path d="M20 5c-3-.8-5.5-.3-8 1.5V20c2.5-1.8 5-2.3 8-1.5V5Z" />
    </>
  ),
  art: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2s-.6-1.5-.6-2.2c0-.8.7-1.3 1.6-1.3H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5Z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  animal: (
    <>
      <circle cx="12" cy="13.5" r="6" />
      <circle cx="6.5" cy="7" r="2.6" />
      <circle cx="17.5" cy="7" r="2.6" />
      <path d="M10 13h.01M14 13h.01" />
      <path d="M10.5 16c1 .8 2 .8 3 0" />
    </>
  ),
  sealife: (
    <>
      <path d="M2.5 12.5c3-4.5 7-6.5 11-5l4.5-3.5v13L13.5 14c-4 1.5-8-.5-11-1.5Z" />
      <path d="M6 10.5c1.5 2 1.5 3.5 0 5.5" />
      <circle cx="11" cy="10.5" r=".5" fill="currentColor" stroke="none" />
    </>
  ),
  dinosaur: (
    <>
      <path d="M5 20c0-5 2-8 5.5-8.7C11 8 13 6 16 6c2.5 0 3.5 1.4 3.5 3 0 1.2-.7 2-1.8 2.4.6.8.9 1.8.9 3 0 3.2-2.6 5.6-6 5.6" />
      <path d="M8 20v-3M14 20v-2.5" />
      <path d="M16.6 8.6h.01" />
      <path d="M3 15.5c1-1 2-1.4 3-1.3" />
    </>
  ),
  train: (
    <>
      <rect x="4" y="3" width="16" height="14" rx="3" />
      <path d="M4 11h16" />
      <circle cx="8" cy="14" r=".8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r=".8" fill="currentColor" stroke="none" />
      <path d="M6 21l2.5-4M18 21l-2.5-4M8 6.5h8" />
    </>
  ),
  vehicle: (
    <>
      <path d="M3 16v-3.5l2-4.5h14l2 4.5V16" />
      <path d="M3 12.5h18" />
      <circle cx="7" cy="16.5" r="1.8" />
      <circle cx="17" cy="16.5" r="1.8" />
      <path d="M8.8 16.5h6.4" />
    </>
  ),
  character: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 7V4M10.5 4h3" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <path d="M10 16h4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l10-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  science: (
    <>
      <path d="M10 3v7L5 19a1.6 1.6 0 0 0 1.4 2.4h11.2A1.6 1.6 0 0 0 19 19l-5-9V3" />
      <path d="M9 3h6" />
      <path d="M7.5 15h9" />
    </>
  ),
  learning: (
    <>
      <path d="M4 17 16 5l3 3L7 20H4v-3Z" />
      <path d="M13 8l3 3M5 14l3 3" />
      <path d="M4 4h5M4 8h3" />
    </>
  ),

  /* ---- 設備・サービス ---- */
  nursing: (
    <>
      <path d="M9 4h6l1 4v12H8V8l1-4Z" />
      <path d="M10 4V2h4v2M10 10h4M10 13h4M10 16h2" />
    </>
  ),
  diaper: (
    <>
      <path d="M5 7h14v11H5z" />
      <path d="M8 11c1.2-2 2.8-3 4-3s2.8 1 4 3" />
      <path d="M7 14h10M9 7V5h6v2" />
    </>
  ),
  'accessible-toilet': (
    <>
      <circle cx="10" cy="4.5" r="1.5" />
      <path d="M10 6v5h4l2 5" />
      <path d="M10 8 7 12M10 11l-2 6" />
      <circle cx="9" cy="16" r="4.5" />
    </>
  ),
  stroller: (
    <>
      <path d="M8 6h8v5H9l-2 4h10" />
      <path d="M16 6V4h2M7 15h11" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  parking: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9M9 13h4" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9.5a14 14 0 0 1 19 0" />
      <path d="M6 13a9 9 0 0 1 12 0" />
      <path d="M9.5 16.5a4 4 0 0 1 5 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  locker: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5a3.5 3.5 0 0 1 7 0v2" />
      <path d="M3 12h18M12 12v8" />
    </>
  ),
  babyfood: (
    <>
      <path d="M3.5 12h13c0 3.6-2.9 6.5-6.5 6.5S3.5 15.6 3.5 12Z" />
      <path d="M2.5 21h15" />
      <path d="m16.5 12 4-6.5" />
      <circle cx="20.8" cy="4.6" r="1.4" />
    </>
  ),
  microwave: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M15.5 5.5v13" />
      <path d="M18 9.5h1M18 13h1" />
      <path d="M6 11.5h6" />
    </>
  ),
  'rest-space': (
    <>
      <path d="M3 12V9a2 2 0 0 1 4 0v3M17 12V9a2 2 0 0 1 4 0v3" />
      <path d="M3 12h18v5H3z" />
      <path d="M5 17v2M19 17v2" />
    </>
  ),
  smoking: (
    <>
      <path d="M3 15.5h13V19H3z" />
      <path d="M18.5 15.5H21V19h-2.5z" />
      <path d="M17 12c1.6-.9 1.6-2.6 0-3.5M14 12c2.6-1.2 2.6-4.3 0-5.5" />
    </>
  ),

  /* ---- 操作・記号 ---- */
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'chevron-right': <path d="M9.5 5 16 12l-6.5 7" />,
  'chevron-down': <path d="M5 9.5 12 16l7-6.5" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6" />,
  walk: (
    <>
      <circle cx="13" cy="4" r="1.8" />
      <path d="M10 21l2.5-6 2.5 2.5V21" />
      <path d="M8 13l3-5 3 1 3 3" />
      <path d="M11 8l-1 5-3 2" />
    </>
  ),
  swap: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10 18.5h4" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  umbrella: (
    <>
      <path d="M3 12a9 9 0 0 1 18 0H3Z" />
      <path d="M12 12v6a2.5 2.5 0 0 0 5 0" />
      <path d="M12 3v1" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4Z" />
      <path d="M9 5v14" strokeDasharray="2 2.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 4v4.5H16" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m14 6 4 4" />
    </>
  ),
};

/** 旧名との互換（既存の呼び出しを壊さないためのエイリアス） */
const ALIAS: Record<string, KkIconName> = {
  sun: 'sunny',
  tree: 'park',
  fork: 'lunch',
  utensils: 'lunch',
  kidsmenu: 'kids-menu',
  babychair: 'baby-chair',
  kidsspace: 'kids-space',
  toilet: 'accessible-toilet',
  bookmark: 'save',
  cart: 'vehicle',
  house: 'indoor',
  party: 'event',
  sparkle: 'popular',
  crown: 'popular',
  flag: 'pin',
  building: 'indoor',
  grid: 'kids-space',
  star: 'popular',
  question: 'info',
  milk: 'nursing',
  car: 'vehicle',
  camera: 'art',
  leaf: 'nature',
  boat: 'sealife',
  ship: 'sealife',
  fish: 'aquarium',
  flower: 'seasonal',
  clover: 'nature',
  onsen: 'rest-space',
  tower: 'themepark',
  sliders: 'edit',
  sort: 'menu',
  share: 'link',
  youtube: 'character',
  'star-half': 'popular',
  tag: 'ticket',
  crowd: 'family',
};

export function KkIcon({
  name,
  size = 22,
  color = 'currentColor',
  sw = 1.8,
  style,
  className,
}: {
  name: KkIconName | keyof typeof ALIAS;
  size?: number;
  color?: string;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const key = (PATHS[name as KkIconName] ? name : ALIAS[name as string]) as KkIconName;
  const body = PATHS[key];
  if (!body) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
      className={className}
    >
      {body}
    </svg>
  );
}
