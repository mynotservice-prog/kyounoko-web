import * as React from 'react';

export type YouTubeEmbedProps = {
  /** YouTube 動画 ID（"abc123XYZ" 形式）。URL からの抽出は呼び出し側で行う想定。 */
  videoId: string;
  /** 動画タイトル。iframe の title 属性 / VideoObject.name に使う。 */
  title?: string;
  /**
   * 公開日（ISO 8601）。schema.org VideoObject の uploadDate 用。
   * YouTube 動画の正確な uploadDate が不明な場合は省略する。
   */
  uploadDate?: string;
};

/**
 * YouTube 公式 nocookie ドメイン経由の埋め込み。
 *
 * 設計方針:
 * - YouTube TOS で許可された <iframe> 埋め込みのみ（埋め込み無効動画は表示できない）。
 * - プライバシー強化のため `youtube-nocookie.com` を使用。
 * - 16:9 レスポンシブ・遅延読み込み（loading="lazy"）。
 * - schema.org VideoObject の JSON-LD を同梱（AEO 強化）。
 */
export function YouTubeEmbed({ videoId, title, uploadDate }: YouTubeEmbedProps) {
  // 軽量バリデーション: YouTube 動画 ID は 11 文字英数 + - _
  const safeId = /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? videoId : null;
  if (!safeId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${safeId}`;
  const contentUrl = `https://www.youtube.com/watch?v=${safeId}`;
  const displayTitle = title ?? 'YouTube 動画';

  // schema.org VideoObject。description / thumbnailUrl は最低限のフォールバックを与える。
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: displayTitle,
    description: displayTitle,
    thumbnailUrl: `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`,
    embedUrl,
    contentUrl,
  };
  if (uploadDate) jsonLd.uploadDate = uploadDate;

  return (
    <aside
      className="youtube-embed"
      aria-label="関連動画"
      style={{
        margin: '32px 0',
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        padding: 12,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <iframe
          src={embedUrl}
          title={displayTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>
      {title && (
        <p
          style={{
            margin: '10px 4px 2px',
            fontSize: 12,
            color: 'var(--ink-mute)',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            letterSpacing: '.02em',
          }}
        >
          YouTube · {title}
        </p>
      )}
    </aside>
  );
}
