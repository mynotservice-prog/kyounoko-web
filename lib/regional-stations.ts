/**
 * 地方都市の駅マスタデータ（名古屋・福岡・仙台）。2026-11 に試験で新設（実験31）。
 *
 * 方針:
 * - 神奈川（lib/kanagawa-stations.ts）と同じ構造で、市を city で扱う
 * - prefecture は lib/area.ts の AreaSlug（SPOTS のエリアキーと同じ）
 * - 札幌・京都・大阪はこの試験の対象外
 */

export type RegionalCity = 'nagoya' | 'fukuoka' | 'sendai';

export type RegionalStation = {
  /** スラグ（URL用、英字小文字＋ハイフン） */
  slug: string;
  /** 日本語駅名 */
  name: string;
  /** 駅名のカナ */
  kana: string;
  /** 所属市 */
  city: RegionalCity;
  /** 都道府県（lib/area.ts の AreaSlug） */
  prefecture: 'aichi' | 'fukuoka' | 'miyagi';
  /** エリア名（市区町村ベース） */
  area: string;
  /** 路線リスト */
  lines: string[];
  /** 駅規模 */
  scale: 'terminal' | 'major' | 'minor';
  /** ファミリー客が多いエリアか */
  familyFriendly?: boolean;
  /** 追加日。サイトマップの lastmod に使う */
  addedAt: string;
};

export const REGIONAL_STATIONS: RegionalStation[] = [
  // ===== 名古屋市 =====
  {
    slug: 'nagoya',
    name: '名古屋',
    kana: 'なごや',
    city: 'nagoya',
    prefecture: 'aichi',
    area: '名古屋市中村区',
    lines: ['JR東海道線', 'JR中央線', 'JR関西線', '東海道新幹線', '名古屋市営地下鉄東山線', '名古屋市営地下鉄桜通線', 'あおなみ線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'sakae',
    name: '栄',
    kana: 'さかえ',
    city: 'nagoya',
    prefecture: 'aichi',
    area: '名古屋市中区',
    lines: ['名古屋市営地下鉄東山線', '名古屋市営地下鉄名城線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'kanayama',
    name: '金山',
    kana: 'かなやま',
    city: 'nagoya',
    prefecture: 'aichi',
    area: '名古屋市中区',
    lines: ['JR東海道線', 'JR中央線', '名鉄名古屋本線', '名古屋市営地下鉄名城線', '名古屋市営地下鉄名港線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'chikusa',
    name: '千種',
    kana: 'ちくさ',
    city: 'nagoya',
    prefecture: 'aichi',
    area: '名古屋市千種区',
    lines: ['JR中央線', '名古屋市営地下鉄東山線'],
    scale: 'major',
    addedAt: '2026-11-02',
  },
  // ===== 福岡市 =====
  {
    slug: 'hakata',
    name: '博多',
    kana: 'はかた',
    city: 'fukuoka',
    prefecture: 'fukuoka',
    area: '福岡市博多区',
    lines: ['JR鹿児島本線', '山陽新幹線', '九州新幹線', '福岡市地下鉄空港線', '福岡市地下鉄七隈線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'tenjin',
    name: '天神',
    kana: 'てんじん',
    city: 'fukuoka',
    prefecture: 'fukuoka',
    area: '福岡市中央区',
    lines: ['福岡市地下鉄空港線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'yakuin',
    name: '薬院',
    kana: 'やくいん',
    city: 'fukuoka',
    prefecture: 'fukuoka',
    area: '福岡市中央区',
    lines: ['西鉄天神大牟田線', '福岡市地下鉄七隈線'],
    scale: 'major',
    addedAt: '2026-11-02',
  },
  {
    slug: 'nishijin',
    name: '西新',
    kana: 'にしじん',
    city: 'fukuoka',
    prefecture: 'fukuoka',
    area: '福岡市早良区',
    lines: ['福岡市地下鉄空港線'],
    scale: 'major',
    addedAt: '2026-11-02',
  },
  // ===== 仙台市 =====
  {
    slug: 'sendai',
    name: '仙台',
    kana: 'せんだい',
    city: 'sendai',
    prefecture: 'miyagi',
    area: '仙台市青葉区',
    lines: ['JR東北本線', 'JR仙山線', 'JR仙石線', '東北新幹線', '仙台市地下鉄南北線', '仙台市地下鉄東西線'],
    scale: 'terminal',
    addedAt: '2026-11-02',
  },
  {
    slug: 'nagamachi',
    name: '長町',
    kana: 'ながまち',
    city: 'sendai',
    prefecture: 'miyagi',
    area: '仙台市太白区',
    lines: ['JR東北本線', '仙台市地下鉄南北線'],
    scale: 'major',
    addedAt: '2026-11-02',
  },
  {
    slug: 'izumi-chuo',
    name: '泉中央',
    kana: 'いずみちゅうおう',
    city: 'sendai',
    prefecture: 'miyagi',
    area: '仙台市泉区',
    lines: ['仙台市地下鉄南北線'],
    scale: 'major',
    addedAt: '2026-11-02',
  },
];

/** 市の日本語名マッピング。 */
export const REGIONAL_CITY_NAMES: Record<RegionalCity, string> = {
  nagoya: '名古屋市',
  fukuoka: '福岡市',
  sendai: '仙台市',
};
