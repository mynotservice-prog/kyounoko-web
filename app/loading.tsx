import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * グローバル loading UI（App Router）。
 * - Server / Client 遷移時の Suspense fallback として描画される
 * - 「白画面」を避け、ヘッダはそのまま + 本文はスケルトンプレースホルダ
 * - 控えめなトーン: タイトル相当2行 + 本文相当3行 + カード相当3つ
 * - 既存トークン（--paper-card / --line）を使い、視覚ジャンプを抑える
 */
export default function Loading() {
  const shimmer: React.CSSProperties = {
    background: 'var(--paper-card)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    opacity: 0.7,
  };

  return (
    <>
      <SiteHeader />
      <div
        className="container-article"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only" style={{ position: 'absolute', left: -9999 }}>
          読み込み中
        </span>
        <div style={{ padding: '64px 0 96px' }}>
          {/* タイトル相当 2行 */}
          <div style={{ ...shimmer, height: 28, width: '70%', marginBottom: 14 }} />
          <div style={{ ...shimmer, height: 28, width: '45%', marginBottom: 32 }} />

          {/* 本文相当 3行 */}
          <div style={{ ...shimmer, height: 14, width: '100%', marginBottom: 10 }} />
          <div style={{ ...shimmer, height: 14, width: '96%', marginBottom: 10 }} />
          <div style={{ ...shimmer, height: 14, width: '88%', marginBottom: 40 }} />

          {/* カード相当 3つ */}
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ ...shimmer, height: 96 }} />
            <div style={{ ...shimmer, height: 96 }} />
            <div style={{ ...shimmer, height: 96 }} />
          </div>
        </div>
      </div>
    </>
  );
}
