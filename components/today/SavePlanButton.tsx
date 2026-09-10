'use client';

import React from 'react';
import { KkIcon } from '@/components/kk/KkIcon';

/**
 * 「今日の流れ」を保存するボタン。
 * プランはURLに完全表現されているので、保存＝現在URL（path+query）+ラベルを localStorage に積む。
 * /favorites（保存したもの）の「保存した今日の流れ」に一覧される（キー: kk_saved_plans）。
 * 見た目は app/styles/today-v3.css の .td3-save（主ボタン＝オレンジ）。
 */
export type SavedPlan = {
  href: string;
  label: string;
  ts: number;
  /** 行き先の並び（「板橋区立こども動物園 → Kimi Natural → 戸山公園」）。2026-09-10 以前の保存には無い */
  sub?: string;
};
export const SAVED_PLANS_KEY = 'kk_saved_plans';
const KEY = SAVED_PLANS_KEY;

export function SavePlanButton({ label, sub }: { label: string; sub?: string }) {
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
        : [{ href, label, sub, ts: Date.now() }, ...list].slice(0, 30);
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
      className={'kk-btn td3-save' + (saved ? ' on' : '')}
    >
      <KkIcon name={saved ? 'check' : 'heart'} size={16} sw={2} />
      {saved ? '保存しました' : 'この流れを保存'}
    </button>
  );
}
