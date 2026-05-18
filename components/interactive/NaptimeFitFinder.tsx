'use client';

import { useMemo, useState } from 'react';

/**
 * お昼寝時間フィット診断（NaptimeFitFinder）
 *
 * 子の年齢帯と当日の起床時刻を入力すると、適切なお昼寝の
 * 「開始〜終了」時刻と「長さ」を提案する。
 *
 * - 完全ローカル計算（外部APIなし）
 * - 日本小児保健協会などの目安に近い値を年齢帯ごとに設定
 * - input は font-size 16px（iOS Safari の自動ズーム回避）
 *
 * --- 記事への組み込み例 -------------------------------------------
 *   import { NaptimeFitFinder } from '@/components/interactive/NaptimeFitFinder';
 *   <NaptimeFitFinder />
 * ----------------------------------------------------------------
 */

type AgeBand = '0-1' | '1-2' | '2-3' | '3-4' | '4-5';

const AGE_LABEL: Record<AgeBand, string> = {
  '0-1': '0〜1歳',
  '1-2': '1〜2歳',
  '2-3': '2〜3歳',
  '3-4': '3〜4歳',
  '4-5': '4〜5歳',
};

/**
 * 年齢帯ごとの「起床後、何時間で眠くなりやすいか」と
 * 「お昼寝の推奨時間（分）」。
 *
 * 0-1: 午前/午後の2回寝想定。ここでは主寝（午後）を返す。
 * 4-5: 体力がついて昼寝なしも増える年齢帯。30分の小休憩想定。
 */
const PROFILE: Record<
  AgeBand,
  { wakeWindowH: number; napMinutes: number; note: string }
> = {
  '0-1': {
    wakeWindowH: 3.5,
    napMinutes: 90,
    note: '午前にも短い昼寝が入ることがあります。',
  },
  '1-2': {
    wakeWindowH: 5,
    napMinutes: 90,
    note: '13時前後にスタートできると夕方ぐずりにくいです。',
  },
  '2-3': {
    wakeWindowH: 5.5,
    napMinutes: 75,
    note: '寝かしつけに時間がかかる場合は前倒しが吉。',
  },
  '3-4': {
    wakeWindowH: 6,
    napMinutes: 60,
    note: '長すぎる昼寝は夜の入眠を遅らせやすいです。',
  },
  '4-5': {
    wakeWindowH: 6.5,
    napMinutes: 30,
    note: '昼寝なしで過ごせる日も増える年齢です。短めで OK。',
  },
};

function parseHm(value: string): { h: number; m: number } | null {
  // <input type="time"> は "HH:MM" 形式
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function fmtHm(totalMinutes: number): string {
  // 0:00〜翌0:00 を想定して mod 1440
  const mod = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(mod / 60);
  const mm = mod % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes - h * 60;
  if (m === 0) return `${h}時間`;
  return m === 30 ? `${h}時間半` : `${h}時間${m}分`;
}

type Suggestion = {
  startLabel: string;
  endLabel: string;
  duration: number; // 分
  bedtimeLabel: string; // 就寝目安
  note: string;
};

function suggest(wakeHm: string, age: AgeBand): Suggestion | null {
  const wake = parseHm(wakeHm);
  if (!wake) return null;
  const profile = PROFILE[age];
  const wakeMin = wake.h * 60 + wake.m;
  // 起床ウインドウ後 → 0-1歳は午後寝に寄せたいので最小13:00を下限とする
  let napStart = wakeMin + Math.round(profile.wakeWindowH * 60);
  if (age === '0-1' && napStart < 13 * 60) napStart = 13 * 60;
  // 15時以降に開始する昼寝は夜への影響が大きいので 15:00 を上限に丸める
  if (napStart > 15 * 60) napStart = 15 * 60;

  const napEnd = napStart + profile.napMinutes;

  // 就寝目安: 起床から13〜14時間後（昼寝を考慮して14h固定）
  const bedtime = wakeMin + 14 * 60;

  return {
    startLabel: fmtHm(napStart),
    endLabel: fmtHm(napEnd),
    duration: profile.napMinutes,
    bedtimeLabel: fmtHm(bedtime),
    note: profile.note,
  };
}

export function NaptimeFitFinder() {
  const [age, setAge] = useState<AgeBand>('1-2');
  const [wake, setWake] = useState<string>('07:00');

  const result = useMemo(() => suggest(wake, age), [wake, age]);

  return (
    <section
      aria-label="お昼寝フィット診断"
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
        TOOL · お昼寝の理想時刻
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-mincho), serif',
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 14px',
        }}
      >
        今日のベスト昼寝タイム
      </h3>

      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}>
            お子さまの年齢
          </div>
          <div
            role="radiogroup"
            aria-label="年齢帯を選択"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
          >
            {(Object.keys(AGE_LABEL) as AgeBand[]).map((band) => {
              const active = band === age;
              return (
                <button
                  key={band}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAge(band)}
                  style={{
                    padding: '8px 14px',
                    background: active ? 'var(--sage)' : 'var(--paper)',
                    color: active ? '#fff' : 'var(--ink-sub)',
                    border: `1.5px solid ${active ? 'var(--sage)' : 'var(--line)'}`,
                    borderRadius: 'var(--radius-chip)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {AGE_LABEL[band]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="nap-wake"
            style={{ display: 'block', fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}
          >
            今朝の起床時刻
          </label>
          <input
            id="nap-wake"
            type="time"
            value={wake}
            onChange={(e) => setWake(e.target.value)}
            style={{
              fontSize: 16,
              padding: '10px 12px',
              background: 'var(--paper)',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink)',
              fontFamily: 'inherit',
              minWidth: 140,
            }}
          />
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--sage-soft), var(--paper))',
              border: '1.5px solid var(--sage)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 4 }}>
              理想のお昼寝
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mincho), serif',
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--sage-deep)',
                lineHeight: 1.25,
              }}
            >
              {result.startLabel}〜{result.endLabel}
              <span style={{ fontSize: 14, color: 'var(--ink-sub)', marginLeft: 8 }}>
                （{fmtDuration(result.duration)}）
              </span>
            </div>
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
            <FitRow label="夜の就寝目安" value={`${result.bedtimeLabel} ごろ`} />
            <FitRow label="ワンポイント" value={result.note} />
          </ul>
        </div>
      )}

      {!result && (
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-mute)' }}>
          起床時刻を「HH:MM」形式で入力してください。
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
        ※ 気軽に試してみてください。お昼寝のリズムには個人差が大きく、あくまで目安です。当日の予定や体調に合わせて調整してください。
      </p>
    </section>
  );
}

function FitRow({ label, value }: { label: string; value: string }) {
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
      <span style={{ color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>
        {value}
      </span>
    </li>
  );
}
