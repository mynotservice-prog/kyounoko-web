'use client';

import * as React from 'react';

/** 口コミの通報ボタン（P1-8）。押すと再モデレーションのため公開から外れる。 */
export function ReviewReportButton({ spotId, id }: { spotId: string; id: string }) {
  const [state, setState] = React.useState<'idle' | 'sending' | 'done'>('idle');
  if (state === 'done') return <span style={{ fontSize: 11, color: 'var(--v2-ink-mute)' }}>通報しました</span>;
  return (
    <button
      type="button"
      disabled={state === 'sending'}
      onClick={async () => {
        if (!confirm('この口コミを通報しますか？')) return;
        setState('sending');
        try {
          await fetch('/api/reviews/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spotId, id }),
          });
        } catch {
          /* noop */
        }
        setState('done');
      }}
      style={{ background: 'none', border: 'none', color: 'var(--v2-ink-mute)', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
    >
      通報
    </button>
  );
}
