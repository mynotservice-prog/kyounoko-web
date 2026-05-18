'use client';

import { useMemo, useState } from 'react';

/**
 * ベビーカー所要時間電卓（BabyCarRouteEstimator）
 *
 * 大人の徒歩速度（4km/h）を基準に、子連れ係数と移動モードで
 * 「実際にかかる時間」と「想定休憩回数」を試算する電卓。
 *
 * - 完全ローカル計算（外部APIなし）
 * - input は font-size 16px（iOS Safari の自動ズーム回避）
 * - 結果はあくまで目安。地形・天候・子の機嫌で大きく変動する旨を明示。
 *
 * --- 記事への組み込み例 -------------------------------------------
 *   import { BabyCarRouteEstimator } from '@/components/interactive/BabyCarRouteEstimator';
 *   <BabyCarRouteEstimator defaultDistanceKm={1.2} />
 * ----------------------------------------------------------------
 */

const ADULT_KMH = 4; // 大人の徒歩速度 km/h

type AgeBand = '0-1' | '2-3' | '4-6';
const AGE_COEF: Record<AgeBand, number> = {
  '0-1': 1.5,
  '2-3': 2.0,
  '4-6': 2.5,
};
const AGE_LABEL: Record<AgeBand, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

type Mode = 'stroller' | 'carrier' | 'walk';
const MODE_COEF: Record<Mode, number> = {
  stroller: 0.9, // ベビーカー: 段差/エレベーター待ちで若干プラスだが、歩かせるよりは速い
  carrier: 1.0, // 抱っこ紐: 大人ペースに近い（重さで微減を係数全体で吸収）
  walk: 1.0, // 歩かせる: 年齢係数をそのまま反映
};
const MODE_LABEL: Record<Mode, string> = {
  stroller: 'ベビーカー',
  carrier: '抱っこ紐',
  walk: '歩かせる',
};

type Estimate = {
  baseMinutes: number; // 大人だけで歩いた場合
  totalMinutes: number; // 子連れ係数 + モード補正後
  rests: number; // 想定休憩回数
  restMinutes: number; // 休憩込みの合計時間
};

function estimate(distanceKm: number, age: AgeBand, mode: Mode): Estimate | null {
  if (!(distanceKm > 0) || distanceKm > 50) return null;

  const baseMinutes = (distanceKm / ADULT_KMH) * 60;
  // 「歩かせる」は年齢係数フル適用。抱っこ紐/ベビーカーは年齢係数を緩和する。
  let effectiveAgeCoef: number;
  if (mode === 'walk') {
    effectiveAgeCoef = AGE_COEF[age];
  } else if (mode === 'carrier') {
    // 抱っこ紐は子の歩行ペースに引きずられないので 1.2 で頭打ち
    effectiveAgeCoef = Math.min(AGE_COEF[age], 1.2);
  } else {
    // ベビーカーも同様。乗っている前提なので 1.15 程度。
    effectiveAgeCoef = Math.min(AGE_COEF[age], 1.15);
  }

  const totalMinutes = baseMinutes * effectiveAgeCoef * MODE_COEF[mode];

  // 休憩: 20分ごとに1回（0歳代は15分目安）。ベビーカー乗車中は休憩頻度を半分扱い。
  const intervalMin = age === '0-1' ? 15 : 20;
  let rests = Math.max(0, Math.floor(totalMinutes / intervalMin));
  if (mode === 'stroller') rests = Math.floor(rests / 2);
  const restMinutes = totalMinutes + rests * 3; // 1回あたり3分の小休止

  return {
    baseMinutes,
    totalMinutes,
    rests,
    restMinutes,
  };
}

function fmtMin(m: number): string {
  const total = Math.round(m);
  if (total < 60) return `${total}分`;
  const h = Math.floor(total / 60);
  const rest = total - h * 60;
  return rest === 0 ? `${h}時間` : `${h}時間${rest}分`;
}

export function BabyCarRouteEstimator({
  defaultDistanceKm = 1.0,
}: {
  defaultDistanceKm?: number;
}) {
  const [distance, setDistance] = useState<string>(String(defaultDistanceKm));
  const [age, setAge] = useState<AgeBand>('0-1');
  const [mode, setMode] = useState<Mode>('stroller');

  const result = useMemo(() => {
    const d = Number(distance);
    if (!Number.isFinite(d)) return null;
    return estimate(d, age, mode);
  }, [distance, age, mode]);

  return (
    <section
      aria-label="ベビーカー所要時間電卓"
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
        TOOL · 所要時間を試算
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-mincho), serif',
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 14px',
        }}
      >
        子連れだと、何分かかる？
      </h3>

      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <label
            htmlFor="bcre-distance"
            style={{ display: 'block', fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}
          >
            距離（km）
          </label>
          <input
            id="bcre-distance"
            type="number"
            inputMode="decimal"
            min={0.1}
            max={50}
            step={0.1}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            style={{
              fontSize: 16,
              padding: '10px 12px',
              width: 140,
              background: 'var(--paper)',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}>
            お子さまの年齢
          </div>
          <ChoiceRow<AgeBand>
            ariaLabel="年齢を選択"
            value={age}
            options={(['0-1', '2-3', '4-6'] as AgeBand[]).map((v) => ({
              value: v,
              label: AGE_LABEL[v],
            }))}
            onChange={setAge}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-sub)', marginBottom: 6 }}>
            移動モード
          </div>
          <ChoiceRow<Mode>
            ariaLabel="移動モードを選択"
            value={mode}
            options={(['stroller', 'carrier', 'walk'] as Mode[]).map((v) => ({
              value: v,
              label: MODE_LABEL[v],
            }))}
            onChange={setMode}
          />
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--clay-soft), var(--paper))',
              border: '1.5px solid var(--clay)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 4 }}>
              想定所要時間（休憩込み）
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mincho), serif',
                fontSize: 26,
                fontWeight: 600,
                color: 'var(--clay-deep)',
                lineHeight: 1.2,
              }}
            >
              {fmtMin(result.restMinutes)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-sub)', marginTop: 4 }}>
              途中で約 {result.rests} 回の小休止を含みます
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 8,
            }}
          >
            <SubStat label="大人だけなら" value={fmtMin(result.baseMinutes)} />
            <SubStat label="子連れ実移動" value={fmtMin(result.totalMinutes)} />
            <SubStat
              label="遅くなる倍率"
              value={`約 ${(result.totalMinutes / Math.max(1, result.baseMinutes)).toFixed(1)}倍`}
            />
          </div>
        </div>
      )}

      {!result && (
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-mute)' }}>
          0.1〜50km の範囲で距離を入力してください。
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
        ※ 気軽に試してみてください。坂道・信号待ち・お子さまの機嫌で大きく変わります。出発前の目安としてご活用ください（あくまで目安です）。
      </p>
    </section>
  );
}

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function ChoiceRow<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 14px',
              background: active ? 'var(--clay)' : 'var(--paper)',
              color: active ? '#fff' : 'var(--ink-sub)',
              border: `1.5px solid ${active ? 'var(--clay)' : 'var(--line)'}`,
              borderRadius: 'var(--radius-chip)',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
