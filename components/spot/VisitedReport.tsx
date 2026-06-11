'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';
import type { ChildAge } from '@/hooks/useUserSettings';

/**
 * スポット詳細の「行ったよ」ワンタップ報告。
 *
 * - ハードルを極限まで下げる: 星タップ＋任意の40字ひとこと＋任意の年齢帯のみ
 * - 自分の報告は localStorage に保存され、再訪時に「行った場所」として残る
 * - 送信は /api/spot-report（MicroCMS下書き保存。env未設定でも受領される）
 * - 件数・評価分布は GA4 の spot_visited_report イベントでも追える
 */

const STORAGE_KEY = 'kyounoko.visited.v1';

type MyReport = { rating: number; comment?: string; ageRange?: string; at: string };

function readMine(): Record<string, MyReport> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMine(slug: string, report: MyReport) {
  try {
    const all = readMine();
    all[slug] = report;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

const AGE_OPTIONS: { v: ChildAge | ''; t: string }[] = [
  { v: '', t: '年齢を選ぶ（任意）' },
  { v: '0-1', t: '0〜1歳と' },
  { v: '2-3', t: '2〜3歳と' },
  { v: '4-6', t: '4〜6歳と' },
];

export function VisitedReport({ slug, name }: { slug: string; name: string }) {
  const [mounted, setMounted] = React.useState(false);
  const [mine, setMine] = React.useState<MyReport | null>(null);
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [ageRange, setAgeRange] = React.useState<ChildAge | ''>('');
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setMine(readMine()[slug] ?? null);
  }, [slug]);

  if (!mounted) return null;

  const submit = () => {
    if (rating < 1) return;
    const report: MyReport = {
      rating,
      comment: comment.trim() || undefined,
      ageRange: ageRange || undefined,
      at: new Date().toISOString(),
    };
    writeMine(slug, report);
    setMine(report);
    setSent(true);
    setOpen(false);
    trackEvent('spot_visited_report', { spot: slug, rating, has_comment: comment.trim() ? 1 : 0 });
    // 失敗してもUXを止めない（GA4側で件数は取れている）
    fetch('/api/spot-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, rating, comment: comment.trim(), ageRange }),
    }).catch(() => {});
  };

  const star = (n: number, value: number, set?: (n: number) => void) => (
    <button
      key={n}
      type="button"
      onClick={set ? () => set(n) : undefined}
      aria-label={`星${n}`}
      style={{
        background: 'none',
        border: 'none',
        fontSize: set ? 26 : 16,
        cursor: set ? 'pointer' : 'default',
        padding: set ? '2px 3px' : 0,
        lineHeight: 1,
        filter: n <= value ? 'none' : 'grayscale(1) opacity(.35)',
      }}
    >
      ⭐
    </button>
  );

  // 報告済み表示
  if (mine) {
    return (
      <section className="v2-section" aria-label="行ったよ報告" style={boxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 14 }}>✅ 行ったよ報告済み</strong>
          <span>{[1, 2, 3, 4, 5].map((n) => star(n, mine.rating))}</span>
        </div>
        {mine.comment && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5d5246' }}>「{mine.comment}」</p>
        )}
        {sent && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#8a7d6e' }}>
            ありがとうございます！レポートは確認のうえ、このページに掲載されることがあります。
          </p>
        )}
      </section>
    );
  }

  // 未報告: ワンタップ導線
  return (
    <section className="v2-section" aria-label="行ったよ報告" style={boxStyle}>
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="v2-btn-primary"
            style={{ padding: '9px 16px', borderRadius: 999, fontSize: 13.5 }}
            onClick={() => {
              setOpen(true);
              trackEvent('spot_visited_open', { spot: slug });
            }}
          >
            🙋 ここ行ったよ！
          </button>
          <span style={{ fontSize: 12.5, color: '#8a7d6e' }}>
            星タップだけでOK・10秒で完了
          </span>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>
            {name}、どうでしたか？
          </div>
          <div style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => star(n, rating, setRating))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              maxLength={40}
              value={comment}
              placeholder="ひとこと（40字まで・任意）"
              onChange={(e) => setComment(e.target.value)}
              style={{
                flex: '1 1 200px',
                padding: '9px 10px',
                borderRadius: 10,
                border: '1px solid #e7dccd',
                fontSize: 13.5,
              }}
            />
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value as ChildAge | '')}
              aria-label="一緒に行った子の年齢"
              style={{
                padding: '9px 8px',
                borderRadius: 10,
                border: '1px solid #e7dccd',
                fontSize: 13,
                background: '#fff',
              }}
            >
              {AGE_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="v2-btn-primary"
              disabled={rating < 1}
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                fontSize: 13.5,
                opacity: rating < 1 ? 0.45 : 1,
              }}
              onClick={submit}
            >
              送信
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const boxStyle: React.CSSProperties = {
  background: '#fffaf3',
  border: '1px solid #f0e4d2',
  borderRadius: 14,
  padding: '13px 14px',
  marginTop: 18,
};
