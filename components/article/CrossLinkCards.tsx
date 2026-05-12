/**
 * プラン詳細 ↔ 記事詳細 を相互にリンクするカード型セクション。
 *
 * - 既存サイトの「クレイ色 + 丸み」のトーンに合わせる
 * - hero 画像 + タイトル + 1行説明
 * - レスポンシブ（モバイル 1 列 / 中以上 2-3 列）
 * - 内部リンクなので rel 属性は付けない / target は省略（_self 既定）
 */

import * as React from 'react';
import Link from 'next/link';

export type CrossLinkItem = {
  href: string;
  title: string;
  /** 1行説明（カード下部に薄く表示） */
  description?: string;
  /** hero 画像 URL（webp 優先） */
  hero?: string;
  /** カード左上の Eyebrow ラベル（例: "ARTICLE" "PLAN"） */
  eyebrow?: string;
};

export type CrossLinkCardsProps = {
  /** セクション見出し */
  heading: string;
  /** 見出しの上に出る小さいラベル */
  eyebrow?: string;
  /** カードに表示するアイテム配列 */
  items: CrossLinkItem[];
  /** カード上部の Eyebrow 既定値（item.eyebrow 未指定時に使う） */
  defaultEyebrow?: string;
};

export function CrossLinkCards({
  heading,
  eyebrow,
  items,
  defaultEyebrow,
}: CrossLinkCardsProps) {
  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginTop: 56 }} aria-label={heading}>
      {eyebrow && (
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 10,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'var(--clay)',
            fontWeight: 600,
            display: 'block',
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontFamily: 'var(--font-mincho), "Shippori Mincho", serif',
          fontWeight: 600,
          fontSize: 22,
          margin: '0 0 18px',
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        }}
      >
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="related-card"
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              transition:
                'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
            }}
          >
            <div
              style={{
                aspectRatio: '16 / 10',
                backgroundColor: 'var(--peach-soft)',
                backgroundImage: it.hero ? `url(${it.hero})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 10,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: 'var(--clay)',
                  fontWeight: 600,
                }}
              >
                {it.eyebrow ?? defaultEyebrow ?? ''}
              </span>
              <h4
                style={{
                  fontFamily: 'var(--font-mincho), "Shippori Mincho", serif',
                  fontSize: 15,
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {it.title}
              </h4>
              {it.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-sub)',
                    margin: 0,
                    lineHeight: 1.75,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {it.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
