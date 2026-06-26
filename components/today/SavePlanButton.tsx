'use client';

import React from 'react';

/**
 * 「今日の流れ」を保存するボタン。
 * プランはURLに完全表現されているので、保存＝現在URL（path+query）+ラベルを localStorage に積む。
 * /favorites 等から後で呼び出せる（キー: kk_saved_plans）。
 */
type SavedPlan = { href: string; label: string; ts: number };
const KEY = 'kk_saved_plans';

export function SavePlanButton({ label }: { label: string }) {
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    try {
      const href = window.location.pathname + window.location.search;
      const list: SavedPlan[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      setSaved(list.some((p) => p.href === href));
    } catch {
      /* ignore */
    }
  }, []);

  const onSave = () => {
    try {
      const href = window.location.pathname + window.location.search;
      const list: SavedPlan[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      const exists = list.some((p) => p.href === href);
      const next = exists
        ? list.filter((p) => p.href !== href)
        : [{ href, label, ts: Date.now() }, ...list].slice(0, 30);
      localStorage.setItem(KEY, JSON.stringify(next));
      setSaved(!exists);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={onSave}
      aria-pressed={saved}
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 800,
        padding: '11px',
        borderRadius: 11,
        border: '1px solid var(--line)',
        background: saved ? 'var(--clay-deep, #c9603e)' : 'var(--paper-card, #fffaf6)',
        color: saved ? '#fff' : 'var(--ink)',
        cursor: 'pointer',
      }}
    >
      {saved ? '♥ 保存しました' : '♡ この流れを保存'}
    </button>
  );
}
