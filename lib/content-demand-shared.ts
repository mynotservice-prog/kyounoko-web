/**
 * 需要 × 優先度の「型とラベル」だけを持つモジュール。
 *
 * クライアントコンポーネント（PriorityClient）は ACTION_LABEL などの値を使うため、
 * これを lib/content-demand.ts から直接 import すると google-auth-library ごと
 * クライアントバンドルに引きずり込まれてビルドが落ちる（実際に落ちた）。
 * サーバー専用の取得ロジックと、両側で使う型・ラベルはここで分ける。
 */

import type { FreshnessState } from './spot-verification';

export type ContentKind = 'article' | 'spot' | 'station' | 'event' | 'plan' | 'other';

export type ActionKey =
  /** タイトル/スニペットを直す（順位はあるのにクリックされていない） */
  | 'title'
  /** あと一押しで上位へ（内部リンク・見出し補強） */
  | 'push'
  /** 中身が薄い。厚みを足さないと順位は動かない */
  | 'thicken'
  /** 事実の再確認（スポットの最終確認日切れ・閉店リスク） */
  | 'verify'
  /** 長期間更新なし。情報の鮮度を入れ直す */
  | 'refresh'
  /** 勝っている。触らない */
  | 'keep'
  /** 需要がない。今やる理由がない */
  | 'none';

export const ACTION_LABEL: Record<ActionKey, string> = {
  title: 'タイトル改善',
  push: 'あと一押し',
  thicken: '中身を厚く',
  verify: '事実の再確認',
  refresh: '鮮度の入れ直し',
  keep: '維持（触らない）',
  none: '対象外',
};

/** 攻め（クリックを増やす）か守り（今のクリックを失わない）か */
export const ACTION_SIDE: Record<ActionKey, 'attack' | 'defend' | 'idle'> = {
  title: 'attack',
  push: 'attack',
  thicken: 'attack',
  verify: 'defend',
  refresh: 'defend',
  keep: 'idle',
  none: 'idle',
};

export type DemandRow = {
  path: string;
  kind: ContentKind;
  slug: string;
  /** 記事タイトル / 施設名。解決できなければパス */
  title: string;
  subtitle?: string;

  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** 前28日 */
  prevClicks: number;
  prevImpressions: number;
  deltaClicks: number;
  /** GA4 の全流入PV（未連携なら null） */
  pageViews: number | null;

  /** この順位帯のサイト内実測CTR */
  benchCtr: number;
  positionBand: string;

  /** 記事側の状態 */
  updatedAt?: string;
  ageDays?: number;
  qualityScore?: number;
  bodyLength?: number;
  noindex?: boolean;

  /** スポット側の状態 */
  freshness?: FreshnessState;
  verifiedAt?: string;
  overdueDays?: number;

  /** タイトル改善だけで取り戻せる見込みクリック（28日） */
  upsideTitle: number;
  /** 上位化で取れる見込みクリック（確度で割引済み・28日） */
  upsidePush: number;

  action: ActionKey;
  reason: string;
  /** 攻め: 見込み増クリック（28日）。守り: 守るクリック（＝現クリック） */
  score: number;

  publicHref: string;
  editHref?: string;
};

