'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type State = {
  age: '0-1' | '2-3' | '4-6';
  weather: 'any' | 'sunny' | 'rain' | 'heat' | 'cold';
  place: 'any' | 'home' | 'outside';
  day: 'any' | 'weekday' | 'holiday';
  duration: '15' | '60' | '120' | '240';
  budget: 'any' | 'free' | 'low' | 'mid';
};

const INITIAL: State = {
  age: '2-3',
  weather: 'any',
  place: 'any',
  day: 'any',
  duration: '60',
  budget: 'any',
};

export function TodayFinder() {
  const [state, setState] = useState<State>(INITIAL);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const router = useRouter();

  // live 日時表示（ヘッダーと同期用）
  useEffect(() => {
    const el = document.getElementById('liveText');
    if (el) {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      el.textContent = `Today · Tokyo · ${hh}:${mm}`;
    }
  }, []);

  function setValue<K extends keyof State>(key: K, value: State[K]) {
    setState(s => ({ ...s, [key]: value }));
  }

  function submit() {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v !== 'any') params.set(k, String(v));
    });
    router.push(`/today?${params.toString()}`);
  }

  function reset() {
    setState(INITIAL);
    setMatchCount(null);
  }

  return (
    <div className="finder" id="finder">
      <div className="finder-head">
        <span className="eyebrow">03 min decision</span>
        <h2>条件を選んで、今日の答えを。</h2>
        <p>年齢・天気・家or外・時間・予算。あてはまるものを選べば、候補を絞り込みます。</p>
      </div>

      <div className="finder-grid">
        <ChipGroup
          label="子どもの年齢"
          options={[
            { value: '0-1', label: '0〜1歳' },
            { value: '2-3', label: '2〜3歳' },
            { value: '4-6', label: '4〜6歳' },
          ]}
          value={state.age}
          onChange={v => setValue('age', v as State['age'])}
        />
        <ChipGroup
          label="天気"
          options={[
            { value: 'any', label: 'どれでも' },
            { value: 'sunny', label: '晴れ' },
            { value: 'rain', label: '雨' },
            { value: 'heat', label: '猛暑' },
            { value: 'cold', label: '寒い' },
          ]}
          value={state.weather}
          onChange={v => setValue('weather', v as State['weather'])}
        />
        <ChipGroup
          label="家 / 外"
          options={[
            { value: 'any', label: 'どちらも' },
            { value: 'home', label: '家で' },
            { value: 'outside', label: '外で' },
          ]}
          value={state.place}
          onChange={v => setValue('place', v as State['place'])}
        />
        <ChipGroup
          label="平日 / 休日"
          options={[
            { value: 'any', label: 'どちらも' },
            { value: 'weekday', label: '平日' },
            { value: 'holiday', label: '休日' },
          ]}
          value={state.day}
          onChange={v => setValue('day', v as State['day'])}
        />
        <ChipGroup
          label="使える時間"
          options={[
            { value: '15', label: '15分' },
            { value: '60', label: '1時間' },
            { value: '120', label: '半日' },
            { value: '240', label: '1日' },
          ]}
          value={state.duration}
          onChange={v => setValue('duration', v as State['duration'])}
        />
        <ChipGroup
          label="予算感"
          options={[
            { value: 'any', label: 'こだわらない' },
            { value: 'free', label: '無料' },
            { value: 'low', label: '〜2,000円' },
            { value: 'mid', label: '〜5,000円' },
          ]}
          value={state.budget}
          onChange={v => setValue('budget', v as State['budget'])}
        />
      </div>

      <div className="finder-foot">
        <button className="btn-primary-light" onClick={submit}>
          今日のおすすめを見る
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <button className="btn-light-ghost" onClick={reset}>
          条件をリセット
        </button>
      </div>

      {matchCount !== null && (
        <div className="result-banner visible">
          選択中の条件で <span className="match">{matchCount}</span> 件の候補があります。
        </div>
      )}
    </div>
  );
}

type ChipGroupProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
};

function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="chip-group">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`chip ${opt.value === value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
