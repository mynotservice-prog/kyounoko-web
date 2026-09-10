'use client';

import * as React from 'react';
import { KkIcon } from '@/components/kk/KkIcon';

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
      <div style={{ display: open ? 'block' : 'none' }} className="v2-vlist sv3-rest">
        {children}
      </div>
      {!open && remaining > 0 && (
        <div className="sv3-more">
          <button type="button" className="kk-btn outline" onClick={() => setOpen(true)}>
            もっと見る（残り{remaining}件）
            <KkIcon name="chevron-down" size={15} />
          </button>
        </div>
      )}
    </>
  );
}
