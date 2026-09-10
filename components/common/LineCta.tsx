'use client';

import { KkLineCard } from '@/components/kk/KkLineCard';

/**
 * LINE友だち追加CTA。
 *
 * 配布物は運営者が0〜2歳の子を連れて実際に回った東京の外食50店のGoogleマイマップ
 * （【全部行った】ベビーカーで入れる東京の子連れ外食50選）。
 * 配布は LINE 管理画面の「あいさつメッセージ」で自動送信している。運用メモは docs/line-launch-kit.md。
 *
 * ★マップのURLはここには置かない。サイト上で配ってしまうと友だち追加する理由が消える。
 *
 * 2026-09-08: 社長指示によりモック準拠の1ブロック（バッジ＋見出し＋1文＋緑ボタン）へ作り直し。
 * 実体は KkLineCard に集約し、トップ／記事／スポットで同じ見た目にする。
 * NEXT_PUBLIC_LINE_ADD_FRIEND_URL が未設定なら描画しない（KkLineCard 側で判定）。
 * PC では非表示（app/styles/kk.css の `.kk-line`）。
 */
export function LineCta({ variant }: { variant: 'banner' | 'article' }) {
  return <KkLineCard placement={variant === 'article' ? 'article' : 'home'} />;
}
