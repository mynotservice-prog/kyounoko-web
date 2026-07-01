/**
 * トップ「1日プラン検索」フォーム用の駅リスト（軽量版）。
 *
 * 全国（東京・関西・神奈川・埼玉/千葉）の駅マスタ（lib/all-stations.ts の getAllStations）
 * から、フォームのセレクタで必要な最小フィールドだけを抜き出す。サーバー（app/page.tsx）で
 * 読み込み、client の V2HeroForm に props で渡す（client バンドルに全駅の路線情報等を
 * 載せないため、必要フィールドのみに絞る）。
 *
 * 2026-07: 従来は東京23区のみだったが、/today（今日の流れ）のプラン生成は
 * 関西・神奈川・埼玉/千葉の駅も既に解決できる（lib/all-stations.ts の
 * resolveOutingAnchor 参照）ため、フォーム側も全国駅を選べるように拡張。
 * 検索は駅名だけでなく、区・市・府県などの地名（regionLabel/area）にもヒットする。
 */
import { getAllStations } from './all-stations';

export type FinderStation = {
  slug: string;
  name: string;
  kana: string;
  /** 主要ターミナル */
  term: boolean;
  /** 子育て世帯に人気 */
  fam: boolean;
  /** 表示・検索用の地域ラベル（例: '渋谷区' '横浜市' '大阪府'） */
  regionLabel: string;
  /** より細かいエリア名（例: '梅田' '武蔵小杉'）。東京は区名と重複するため省略。 */
  area?: string;
};

export const FINDER_STATIONS: FinderStation[] = getAllStations().map((s) => ({
  slug: s.slug,
  name: s.name,
  kana: s.kana,
  term: s.scale === 'terminal',
  fam: !!s.familyFriendly,
  regionLabel: s.regionLabel,
  area: s.region === 'tokyo' ? undefined : s.area,
}));

/** 主要ターミナル（画面A-1 のクイックチップ上段）。東京優先で先頭に来る。 */
export const POPULAR_TERMINALS: FinderStation[] = FINDER_STATIONS.filter((s) => s.term).slice(0, 8);

/** 子育て世帯に人気の駅（下段）。ターミナルと重複しないもの。 */
export const POPULAR_FAMILY: FinderStation[] = FINDER_STATIONS.filter(
  (s) => s.fam && !s.term,
).slice(0, 8);
