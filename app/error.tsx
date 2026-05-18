'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

/**
 * グローバル error boundary（App Router）。
 * - server / client いずれの try-catch も最終的にここへ到達する
 * - 必ず Client Component（'use client'）であること
 * - reset() を呼ぶと該当セグメントを再レンダリングできる
 * - 日本語のフォールバック表示で英語デフォルトを上書き
 * - デザイン水準は app/not-found.tsx に揃える
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 監視向け: production では Sentry/Clarity 等に流す前提で console に出しておく
    // （現状ロガーが無いので最小限）
    // eslint-disable-next-line no-console
    console.error('[app/error]', error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <div style={{ padding: '96px 0 120px', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-mincho)',
              fontStyle: 'italic',
              fontSize: 'clamp(96px, 18vw, 160px)',
              color: 'var(--clay)',
              lineHeight: 1,
              display: 'inline-block',
            }}
            aria-hidden="true"
          >
            !
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 'clamp(22px, 3.2vw, 28px)',
              fontWeight: 600,
              margin: '24px 0 16px',
              letterSpacing: '.02em',
            }}
          >
            うまく表示できませんでした
          </h1>
          <p
            style={{
              color: 'var(--ink-sub)',
              margin: '0 auto 28px',
              lineHeight: 1.9,
              maxWidth: 440,
            }}
          >
            一時的な不具合が発生した可能性があります。もう一度試していただくか、トップへ戻ってください。何度も同じ画面になる場合は、お問い合わせよりご連絡いただけますと幸いです。
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--ink-sub)',
                margin: '0 0 24px',
                opacity: 0.7,
                fontFamily: 'var(--font-inter)',
              }}
            >
              エラーID: {error.digest}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              className="btn-primary"
            >
              もう一度試す
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/" className="btn-ghost">
              トップへ戻る
            </Link>
            <Link href="/contact" className="btn-ghost">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
