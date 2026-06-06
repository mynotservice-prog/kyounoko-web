/**
 * グローバル loading UI（App Router）。
 * - Server / Client 遷移時の Suspense fallback として描画される
 * - V2 デザインの色トークン (--v2-page, --v2-line) を使い視覚ジャンプを抑える
 * - 旧 SiteHeader/Footer は完全に外し、ヘッダ無しのスケルトンだけ表示
 */
export default function Loading() {
  const shimmer: React.CSSProperties = {
    background: '#fff',
    border: '1px solid var(--v2-line, #eee0d4)',
    borderRadius: 12,
    opacity: 0.7,
  };

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      style={{
        minHeight: '100vh',
        background: 'var(--v2-page, #FBF6EE)',
        padding: '24px 18px 80px',
      }}
    >
      <span style={{ position: 'absolute', left: -9999 }}>読み込み中</span>

      {/* ヘッダ相当（細い棒） */}
      <div style={{ ...shimmer, height: 38, width: '60%', marginBottom: 24, borderRadius: 18 }} />

      {/* タイトル相当 2行 */}
      <div style={{ ...shimmer, height: 32, width: '85%', marginBottom: 12 }} />
      <div style={{ ...shimmer, height: 32, width: '55%', marginBottom: 28 }} />

      {/* 本文相当 3行 */}
      <div style={{ ...shimmer, height: 14, width: '100%', marginBottom: 10 }} />
      <div style={{ ...shimmer, height: 14, width: '96%', marginBottom: 10 }} />
      <div style={{ ...shimmer, height: 14, width: '70%', marginBottom: 36 }} />

      {/* カード相当 3つ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...shimmer, height: 96 }} />
        <div style={{ ...shimmer, height: 96 }} />
        <div style={{ ...shimmer, height: 96 }} />
      </div>
    </div>
  );
}
