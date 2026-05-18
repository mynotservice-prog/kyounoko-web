'use client';

import { useTriedCounter, type TriedKind } from '@/hooks/useTriedCounter';
import { trackEvent } from '@/lib/analytics';

/**
 * 「やってみた」ボタン & 表示。
 * 自分のカウント + 全体カウント（擬似）を出す。
 */
export function TriedButton({
  kind,
  id,
  variant = 'inline',
}: {
  kind: TriedKind;
  id: string;
  variant?: 'inline' | 'card';
}) {
  const { myCount, totalCount, increment } = useTriedCounter(kind, id);

  return (
    <div className={`tried-block tried-${variant}`}>
      <button
        type="button"
        className={`tried-btn ${myCount > 0 ? 'is-tried' : ''}`}
        aria-label={`やってみた（現在 ${totalCount} 人がチェック）`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          trackEvent('tried_click', { slug: id });
          increment();
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="tried-label">{myCount > 0 ? 'やった' : 'やってみた'}</span>
      </button>
      <span className="tried-count">{totalCount + myCount} 人がチェック</span>
    </div>
  );
}
