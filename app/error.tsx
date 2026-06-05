'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Icon } from '@/components/v2/V2Icon';

/**
 * グローバル error boundary（App Router）。
 * - server / client いずれの try-catch も最終的にここへ到達する
 * - 必ず Client Component（'use client'）であること
 * - reset() を呼ぶと該当セグメントを再レンダリングできる
 * - V2 デザイン版（2回目リニューアル）
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app/error]', error);
  }, [error]);

  return (
    <V2Frame header="sub" backHref="/" active="home">
      <div
        style={{
          padding: '60px 24px 80px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--v2-c-rain-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <V2Icon name="umbrella" size={42} color="var(--v2-c-rain)" />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--v2-ink)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          うまく表示できませんでした
        </h1>
        <p
          style={{
            color: 'var(--v2-ink-mute)',
            fontSize: 13.5,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 360,
          }}
        >
          一時的な不具合が発生した可能性があります。
          <br />
          もう一度試していただくか、トップへ戻ってください。
        </p>

        {error?.digest && (
          <p
            style={{
              fontSize: 11,
              color: 'var(--v2-ink-faint)',
              margin: '4px 0 0',
              fontFamily: 'monospace',
            }}
          >
            エラーID: {error.digest}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            className="v2-btn-primary"
            style={{ minWidth: 140, padding: '12px 24px', cursor: 'pointer' }}
          >
            もう一度試す
          </button>
          <Link
            href="/"
            style={{
              minWidth: 140,
              padding: '12px 24px',
              borderRadius: 'var(--v2-r-pill)',
              border: '1.5px solid var(--v2-line)',
              color: 'var(--v2-ink)',
              fontWeight: 700,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </V2Frame>
  );
}
