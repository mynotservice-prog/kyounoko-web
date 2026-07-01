/**
 * トップ「1日プラン検索」フォーム用の駅リスト（軽量版）。
 *
 * TOKYO_STATIONS（484駅・lines等を含む重いデータ）から、フォームのセレクタで必要な
 * 最小フィールドだけを抜き出す。サーバー（app/page.tsx）で読み込み、client の
 * V2HeroForm に props で渡す（client バンドルに全駅データを載せないため）。
 */
import { TOKYO_STATIONS } from './tokyo-stations';

export type FinderStation = {
  slug: string;
  name: string;
  kana: string;
  /** 主要ターミナル */
  term: boolean;
  /** 子育て世帯に人気 */
  fam: boolean;
};

export const FINDER_STATIONS: FinderStation[] = TOKYO_STATIONS.map((s) => ({
  slug: s.slug,
  name: s.name,
  kana: s.kana,
  term: s.scale === 'terminal',
  fam: !!s.familyFriendly,
}));

/** 主要ターミナル（画面A-1 のクイックチップ上段）。 */
export const POPULAR_TERMINALS: FinderStation[] = FINDER_STATIONS.filter((s) => s.term).slice(0, 8);

/** 子育て世帯に人気の駅（下段）。ターミナルと重複しないもの。 */
export const POPULAR_FAMILY: FinderStation[] = FINDER_STATIONS.filter(
  (s) => s.fam && !s.term,
).slice(0, 8);
