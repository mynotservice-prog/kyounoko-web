/**
 * 運営者ながみーが実店舗で確認した「チェーンの子連れ対応」の一次情報。
 *
 * ※ここに入るのは**運営者本人が店舗で確認した結果のみ**。口コミ・まとめサイト・
 *   他人の体験談は混ぜない。公式サイトに書いてあることもここには入れない
 *   （それは記事側で公式URLと確認日を添えて書く）。
 *
 * なぜ必要か（2026-07-28）:
 *   「離乳食を持ち込めるか」は検索需要が最も大きい軸なのに、主要チェーンはどこも
 *   公式サイトに書いていない（ガスト/ココス/サイゼリヤ/はま寿司/スシロー/
 *   ロイヤルホスト/焼肉きんぐ を実際に確認）。それなのに競合も自サイトも
 *   「公式がOKと案内している」と書いていた。根拠は存在しなかったので
 *   PR #99 で「店舗判断」へ修正した。
 *   → この軸で本当のことを書けるのは**実際に店舗で確認した人だけ**。ここが差別化点になる。
 *
 * 記事での使い方:
 *   「公式には記載がない」＋「編集長が◯◯店で確認（YYYY年M月）」の2段構えで書く。
 *   1店舗の結果を全店の方針として書かないこと（店舗判断であることが結論なので）。
 */

/** 確認した項目 */
export type ChainCheckItem =
  | 'rinyushoku-mochikomi' // 離乳食の持ち込み
  | 'atatame' // レンジでの温め
  | 'oyu' // ミルク用のお湯
  | 'baby-chair' // ベビーチェア
  | 'stroller'; // ベビーカー入店

/** 確認結果。「断られた」も同じ価値の一次情報なので必ず記録する。 */
export type ChainCheckResult = 'ok' | 'refused' | 'conditional';

export type ChainCheck = {
  item: ChainCheckItem;
  result: ChainCheckResult;
  /** conditional のときの条件、refused のときの理由など */
  note?: string;
};

export type ChainReport = {
  /** チェーン名（記事の表記と合わせる） */
  chain: string;
  /** 店舗名。「◯◯店」が分からなければ「郊外のロードサイド店」程度でもよい */
  store: string;
  /** 確認した年月（YYYY-MM）。日まで分かるなら YYYY-MM-DD */
  checkedAt: string;
  checks: ChainCheck[];
  /** その他の気づき */
  note?: string;
};

/**
 * 実店舗の確認記録。
 *
 * ⚠ 空のまま記事に「実店舗で確認した」と書かないこと。ここが唯一の正で、
 *   ここに無い確認結果は記事に書けない。
 */
export const CHAIN_REPORTS: ChainReport[] = [
  // 未入力。docs/store-check-list-2026-07-28.md の優先順位で埋めていく。
];

/** チェーン名で確認記録を引く（記事側の表示用）。 */
export function getChainReports(chain: string): ChainReport[] {
  return CHAIN_REPORTS.filter((r) => r.chain === chain);
}

/** ある項目について確認済みかどうか。未確認なら記事に「確認済み」と書いてはいけない。 */
export function hasChainCheck(chain: string, item: ChainCheckItem): boolean {
  return CHAIN_REPORTS.some((r) => r.chain === chain && r.checks.some((c) => c.item === item));
}
