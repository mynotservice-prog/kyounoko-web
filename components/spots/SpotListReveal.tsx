'use client';

import * as React from 'react';
import { V2Icon } from '@/components/v2/V2Icon';

/**
 * 「もっと見る」開閉。
 *
 * SEO 上の要点: children（残りのスポット行）は常にサーバーで HTML に描画され、
 * 閉じている間も `display:none` で DOM に残す（条件レンダリングで消さない）。
 * これにより Google はカテゴリ内の全 /spot リンクをクロールでき、
 * かつユーザーには初期 24 件だけ見せて縦長を防げる。
 */
export function SpotListReveal({
  remaining,
  children,
}: {
  remaining: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div style={{ display: open ? 'block' : 'none' }} className="v2-vlist">
        {children}
      </div>
      {!open && remaining > 0 && (
        <div className="v2-section" style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            type="button"
            className="v2-more-btn"
            onClick={() => setOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid var(--v2-line)',
              background: 'var(--v2-card)',
              color: 'var(--v2-ink)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            もっと見る（残り{remaining}件）
            <V2Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </>
  );
}
