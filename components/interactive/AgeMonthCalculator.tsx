'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * 月齢計算機（AgeMonthCalculator）
 *
 * 子どもの生年月日を入力すると、月齢／週齢／日齢を算出し、
 * 「離乳食開始（生後180日）」「1歳の誕生日」「4月の保育園入園」
 * までの日数も表示するインタラクティブツール。
 *
 * - 全てローカル計算（外部APIなし）
 * - 生年月日は localStorage(`kyounoko:childBirth`) に保存
 *   → プロファイル統合の足場として、サイト全体で同じキーを参照する想定
 * - input は font-size 16px（iOS Safari の自動ズーム回避）
 *
 * --- 記事への組み込み例 -------------------------------------------
 *   // mdx / tsx 内
 *   import { AgeMonthCalculator } from '@/components/interactive/AgeMonthCalculator';
 *   <AgeMonthCalculator />
 * ----------------------------------------------------------------
 */

const STORAGE_KEY = 'kyounoko:childBirth';

type Calc = {
  days: number;
  weeks: number;
  months: number;
  yearLabel: string;
  toBabyFood: number; // 離乳食開始（生後180日）までの残日数
  toFirstBirthday: number; // 1歳の誕生日までの残日数
  toAprilEntry: number; // 直近の4/1（保育園入園想定）までの残日数
};

function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function calc(birthISO: string): Calc | null {
  if (!birthISO) return null;
  const birth = new Date(`${birthISO}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = diffDays(birth, today);
  if (days < 0) return null;

  const weeks = Math.floor(days / 7);

  // 月齢: 年月の差から算出（30日換算より実感に近い）
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearLabel = years >= 1 ? `${years}歳${remMonths}か月` : `${months}か月`;

  // 離乳食開始の目安: 生後180日
  const babyFoodDate = new Date(birth);
  babyFoodDate.setDate(babyFoodDate.getDate() + 180);
  const toBabyFood = diffDays(today, babyFoodDate);

  // 1歳の誕生日
  const firstBd = new Date(birth);
  firstBd.setFullYear(firstBd.getFullYear() + 1);
  const toFirstBirthday = diffDays(today, firstBd);

  // 次の4/1（保育園入園想定）
  const aprilThisYear = new Date(today.getFullYear(), 3, 1);
  const aprilTarget =
    today <= aprilThisYear
      ? aprilThisYear
      : new Date(today.getFullYear() + 1, 3, 1);
  const toAprilEntry = diffDays(today, aprilTarget);

  return {
    days,
    weeks,
    months,
    yearLabel,
    toBabyFood,
    toFirstBirthday,
    toAprilEntry,
  };
}

export function AgeMonthCalculator() {
  const [birth, setBirth] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBirth(saved);
    } catch {
      // localStorage が使えない環境では何もしない
    }
  }, []);

  const result = useMemo(() => calc(birth), [birth]);

  const handleChange = (value: string) => {
    setBirth(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 失敗してもUIは継続
    }
  };

  const handleClear = () => {
    handleChange('');
  };

  return (
    <section
      aria-label="月齢計算機"
      style={{
        margin: '24px 0',
        padding: 20,
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--clay-deep)',
          marginBottom: 6,
        }}
      >
        TOOL · 月齢を計算
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-mincho), serif',
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 14px',
        }}
      >
        いまの月齢、何日目？
      </h3>

      <label
        htmlFor="age-month-birth"
        style={{ display: 'block', fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}
      >
        お子さまの生年月日
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          id="age-month-birth"
          type="date"
          value={birth}
          onChange={(e) => handleChange(e.target.value)}
          max={mounted ? new Date().toISOString().slice(0, 10) : undefined}
          style={{
            fontSize: 16, // iOS の自動ズーム回避
            padding: '10px 12px',
            background: 'var(--paper)',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            minWidth: 180,
          }}
        />
        {birth && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink-mute)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            クリア
          </button>
        )}
      </div>

      {mounted && result && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <Stat label="月齢" value={result.yearLabel} accent />
            <Stat label="週齢" value={`${result.weeks}週`} />
            <Stat label="日齢" value={`${result.days}日目`} />
          </div>

          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            <Milestone label="離乳食スタートの目安(生後180日)" days={result.toBabyFood} />
            <Milestone label="1歳の誕生日まで" days={result.toFirstBirthday} />
            <Milestone label="次の4月(保育園入園想定)まで" days={result.toAprilEntry} />
          </ul>
        </div>
      )}

      {mounted && birth && !result && (
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-mute)' }}>
          未来の日付は計算できません。生年月日をご確認ください。
        </p>
      )}

      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          color: 'var(--ink-mute)',
          lineHeight: 1.7,
        }}
      >
        ※ 気軽に試してみてください。月齢の進み方や離乳食・予防接種の時期には個人差があります。あくまで目安としてご活用ください。生年月日はこの端末内にのみ保存されます。
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: accent ? 'var(--clay-soft)' : 'var(--paper)',
        border: `1px solid ${accent ? 'var(--clay)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mincho), serif',
          fontSize: 18,
          fontWeight: 600,
          color: accent ? 'var(--clay-deep)' : 'var(--ink)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Milestone({ label, days }: { label: string; days: number }) {
  const passed = days < 0;
  const display = passed ? `${Math.abs(days)}日前に通過` : `あと${days}日`;
  return (
    <li
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--ink-sub)' }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: passed ? 'var(--ink-mute)' : 'var(--clay-deep)',
          whiteSpace: 'nowrap',
        }}
      >
        {display}
      </span>
    </li>
  );
}
