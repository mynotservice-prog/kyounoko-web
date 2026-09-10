'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';
import { KkIcon } from '@/components/kk/KkIcon';
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
        display: 'inline-flex',
        cursor: set ? 'pointer' : 'default',
        padding: set ? '2px 3px' : 0,
        lineHeight: 1,
        color: n <= value ? 'var(--kk-orange)' : 'var(--kk-rule)',
      }}
    >
      <KkIcon name="popular" size={set ? 26 : 16} sw={1.6} />
    </button>
  );

  // 報告済み表示
  if (mine) {
    return (
      <section className="v2-section sv3-visited" aria-label="行ったよ報告">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <KkIcon name="check" size={15} sw={2.2} />
            行ったよ報告済み
          </strong>
          <span>{[1, 2, 3, 4, 5].map((n) => star(n, mine.rating))}</span>
        </div>
        {mine.comment && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--kk-ink-soft)' }}>「{mine.comment}」</p>
        )}
        {sent && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--kk-ink-mute)' }}>
            ありがとうございます！レポートは確認のうえ、このページに掲載されることがあります。
          </p>
        )}
      </section>
    );
  }

  // 未報告: ワンタップ導線
  return (
    <section className="v2-section sv3-visited" aria-label="行ったよ報告">
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="kk-btn sm"
            onClick={() => {
              setOpen(true);
              trackEvent('spot_visited_open', { spot: slug });
            }}
          >
            <KkIcon name="pin" size={15} sw={2} />
            ここ行ったよ！
          </button>
          <span className="sv3-visited-note">星タップだけでOK・10秒で完了</span>
        </div>
      ) : (
        <div>
          <div className="sv3-visited-q">{name}、どうでしたか？</div>
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
                padding: '10px 12px',
                borderRadius: 'var(--kk-r-ui)',
                border: '1px solid var(--kk-rule)',
                background: 'var(--kk-paper-soft)',
                fontSize: 13.5,
              }}
            />
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value as ChildAge | '')}
              aria-label="一緒に行った子の年齢"
              style={{
                padding: '10px 10px',
                borderRadius: 'var(--kk-r-ui)',
                border: '1px solid var(--kk-rule)',
                fontSize: 13,
                background: 'var(--kk-paper-soft)',
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
              className="kk-btn sm"
              disabled={rating < 1}
              style={{ opacity: rating < 1 ? 0.45 : 1 }}
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
