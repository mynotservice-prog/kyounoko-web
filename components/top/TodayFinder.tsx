'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AREAS, type AreaSlug } from '@/lib/area';
import { useUserSettings } from '@/hooks/useUserSettings';

/**
 * 天気を クライアント側で Open-Meteo から取得して weather プリセットに使う。
 * エリアが変わるたびに再取得。
 */
async function fetchCurrentWeather(area: string): Promise<{ condition: string; label: string; temperatureC: number } | null> {
  try {
    const res = await fetch(`/api/weather?area=${encodeURIComponent(area)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.condition ? data : null;
  } catch {
    return null;
  }
}

type State = {
  age?: '0-1' | '2-3' | '4-6';
  weather: 'any' | 'sunny' | 'rain' | 'heat' | 'cold';
  place: 'any' | 'home' | 'outside';
  day: 'any' | 'weekday' | 'holiday';
  duration: '15' | '60' | '120' | '240';
  budget: 'any' | 'free' | 'low' | 'mid';
  area: AreaSlug;
};

const INITIAL: State = {
  weather: 'any',
  place: 'any',
  day: 'any',
  duration: '60',
  budget: 'any',
  area: 'tokyo',
};

export function TodayFinder() {
  const [settings, updateSettings] = useUserSettings();
  const [state, setState] = useState<State>(INITIAL);
  const [currentWeather, setCurrentWeather] = useState<{ condition: string; label: string; temperatureC: number } | null>(null);
  const router = useRouter();

  // 初回マウント時に localStorage から復元
  useEffect(() => {
    setState((s) => ({
      ...s,
      area: settings.area,
      age: settings.age ?? s.age,
    }));
  }, [settings.area, settings.age]);

  // エリアが変わるたびに現在の天気を取得
  useEffect(() => {
    if (!state.area || state.area === 'all') {
      setCurrentWeather(null);
      return;
    }
    let cancelled = false;
    fetchCurrentWeather(state.area).then((w) => {
      if (cancelled || !w) return;
      setCurrentWeather(w);
      // ユーザーが明示的に 'any' 以外を選んでいたら上書きしない（明示入力優先）
      setState((s) => (s.weather === 'any' ? { ...s, weather: w.condition as State['weather'] } : s));
    });
    return () => { cancelled = true; };
  }, [state.area]);

  // live 日時表示（ヘッダーと同期用）
  useEffect(() => {
    const el = document.getElementById('liveText');
    if (el) {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      el.textContent = `Today · ${hh}:${mm}`;
    }
  }, []);

  function setValue<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function submit() {
    // 次回訪問用に area / age を保存
    updateSettings({ area: state.area, age: state.age });

    const params = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'area' && v === 'all') return;
      if (v !== 'any') params.set(k, String(v));
    });
    router.push(`/today?${params.toString()}`);
  }

  function reset() {
    setState({ ...INITIAL, area: settings.area, age: settings.age });
  }

  // エリアセレクタ（地方ブロックごとにグルーピング）
  const areaOptions = useMemo(() => {
    const groups: Record<string, { slug: string; name: string }[]> = {
      'すべて': [{ slug: 'all', name: 'すべて（エリア非依存）' }],
      '北海道・東北': [],
      '関東': [],
      '中部': [],
      '関西': [],
      '中国・四国': [],
      '九州・沖縄': [],
    };
    const blockToGroup: Record<string, string> = {
      'hokkaido-tohoku': '北海道・東北',
      'kanto': '関東',
      'chubu': '中部',
      'kansai': '関西',
      'chugoku-shikoku': '中国・四国',
      'kyushu-okinawa': '九州・沖縄',
    };
    for (const a of AREAS) {
      if (a.slug === 'all') continue;
      // ブロック自体も候補に含める
      if (!a.block) continue;
      const g = blockToGroup[a.block];
      if (g) groups[g].push({ slug: a.slug, name: a.name });
    }
    return groups;
  }, []);

  const placeDisablesArea = state.place === 'home'; // 家ならエリア非活性

  return (
    <div className="finder" id="finder">
      <div className="finder-head">
        <span className="eyebrow">3分で、今日が決まる</span>
        <h2>迷わない、今日のすごし方。</h2>
        <p>天気・年齢・時間を入れると、おすすめを1つご提案します。気分に合わなければ別の候補もすぐ見られます。</p>
        {currentWeather && (
          <div style={{ marginTop: 14 }}>
            <span className="weather-chip" title="Open-Meteo・現在の天気">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
              <span className="weather-chip-label">いまの天気</span>
              <span>{currentWeather.label} / {Math.round(currentWeather.temperatureC)}°C</span>
              <span style={{ color: 'var(--ink-mute)', fontSize: 11 }}>自動反映</span>
            </span>
          </div>
        )}
      </div>

      <div className="finder-grid">
        {/* エリア */}
        <div className="field">
          <label>エリア{placeDisablesArea && <span style={{ fontSize: 10, color: 'var(--ink-mute)', marginLeft: 6 }}>（家で過ごす場合は任意）</span>}</label>
          <select
            className="area-select"
            value={state.area}
            onChange={(e) => setValue('area', e.target.value as AreaSlug)}
            disabled={placeDisablesArea}
            style={{
              padding: '10px 14px',
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'var(--paper-card)',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: placeDisablesArea ? 'not-allowed' : 'pointer',
              opacity: placeDisablesArea ? 0.5 : 1,
            }}
          >
            <option value="all">すべて（エリア非依存）</option>
            {Object.entries(areaOptions).map(([group, items]) => {
              if (items.length === 0 || group === 'すべて') return null;
              return (
                <optgroup key={group} label={group}>
                  {items.map((o) => (
                    <option key={o.slug} value={o.slug}>{o.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <ChipGroup
          label="子どもの年齢"
          options={[
            { value: '0-1', label: '0〜1歳' },
            { value: '2-3', label: '2〜3歳' },
            { value: '4-6', label: '4〜6歳' },
          ]}
          value={state.age ?? ''}
          onChange={(v) => setValue('age', v as State['age'])}
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
          onChange={(v) => setValue('weather', v as State['weather'])}
        />
        <ChipGroup
          label="家 / 外"
          options={[
            { value: 'any', label: 'どちらも' },
            { value: 'home', label: '家で' },
            { value: 'outside', label: '外で' },
          ]}
          value={state.place}
          onChange={(v) => setValue('place', v as State['place'])}
        />
        <ChipGroup
          label="平日 / 休日"
          options={[
            { value: 'any', label: 'どちらも' },
            { value: 'weekday', label: '平日' },
            { value: 'holiday', label: '休日' },
          ]}
          value={state.day}
          onChange={(v) => setValue('day', v as State['day'])}
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
          onChange={(v) => setValue('duration', v as State['duration'])}
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
          onChange={(v) => setValue('budget', v as State['budget'])}
        />
      </div>

      <div className="finder-foot">
        <button className="btn-primary-light" onClick={submit}>
          今日の答えを出す
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <button className="btn-light-ghost" onClick={reset}>
          条件をリセット
        </button>
      </div>
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
        {options.map((opt) => (
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
