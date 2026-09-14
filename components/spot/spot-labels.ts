import type { PlaygroundFeature } from '@/lib/spots';

/**
 * 公園の遊具タグ → 表示ラベル。
 * lib/spot-schema.ts の PLAYGROUND_LABEL（JSON-LD の amenityFeature 用・非公開）と同じ文言。
 * 構造化データと画面で同じ語を使うために、こちらも同じ表を持つ（新しい語を作らない）。
 */
export const PLAYGROUND_FEATURE_LABEL: Record<PlaygroundFeature, string> = {
  'large-slide': '大型滑り台',
  'long-slide': 'ロングすべり台',
  fuwafuwa: 'ふわふわドーム',
  athletic: 'アスレチック',
  tarzan: 'ターザンロープ',
  climbing: 'クライミングウォール',
  'spider-net': 'クモの巣ネット',
  swing: '大型ブランコ',
  sandbox: '砂場',
  bbq: 'BBQエリア',
  cycling: 'サイクリングコース',
  'mini-train': '子供向けミニ電車',
};
