'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AREAS, type AreaSlug } from '@/lib/area';
import { useUserSettings } from '@/hooks/useUserSettings';
import { AnswerPreview } from './AnswerPreview';

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

type Mode = 'go' | 'do' | 'eat' | 'home';
type MealTime = 'any' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

type State = {
  mode: Mode;
  age?: '0-1' | '2-3' | '4-6';
  weather: 'any' | 'sunny' | 'rain' | 'heat' | 'cold';
  place: 'any' | 'home' | 'outside';
  day: 'any' | 'weekday' | 'holiday';
  duration: '15' | '60' | '120' | '240';
  budget: 'any' | 'free' | 'low' | 'mid';
  area: AreaSlug;
  mealTime: MealTime;
};

const INITIAL: State = {
  mode: 'do',
  weather: 'any',
  place: 'any',
  day: 'any',
  duration: '60',
  budget: 'any',
  area: 'tokyo',
  mealTime: 'any',
};

/**
 * モード切替時に place を自動セットして整合性を取る。
 * - 'go' は外出固定、'home' は家固定、'do'/'eat' は any
 */
function applyModeDefaults(s: State, mode: Mode): State {
  switch (mode) {
    case 'go':
      return { ...s, mode, place: 'outside' };
    case 'home':
      return { ...s, mode, place: 'home' };
    case 'eat':
      return { ...s, mode, place: 'home' }; // 食事は基本家で作る前提
    case 'do':
    default:
      return { ...s, mode };
  }
}

/**
 * 現在時刻と曜日からユーザーが今ほしいモードを推定する。
 * - 朝6-9 / 昼11-13 / 夕17-20 → eat（食事提案）
 * - 9-11 → 平日 do、休日 go
 * - 14-17 → 平日 home、休日 go
 * - その他 → do（汎用）
 */
function getDefaultModeByTime(now: Date = new Date()): { mode: Mode; mealTime: MealTime } {
  const h = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const isHoliday = day === 0 || day === 6;

  if (h >= 6 && h < 9) return { mode: 'eat', mealTime: 'breakfast' };
  if (h >= 11 && h < 13) return { mode: 'eat', mealTime: 'lunch' };
  if (h >= 14 && h < 16) return { mode: 'eat', mealTime: 'snack' };
  if (h >= 17 && h < 20) return { mode: 'eat', mealTime: 'dinner' };
  if (h >= 9 && h < 11) return { mode: isHoliday ? 'go' : 'do', mealTime: 'any' };
  if (h >= 13 && h < 17) return { mode: isHoliday ? 'go' : 'home', mealTime: 'any' };
  // 夜以降や深夜：家で過ごすモード
  return { mode: 'home', mealTime: 'any' };
}

/** 時刻に応じた1行ヒントメッセージ */
function getTimeHint(mode: Mode, mealTime: MealTime, now: Date = new Date()): string {
  const h = now.getHours();
  const m = now.getMinutes();
  const time = `${h}:${String(m).padStart(2, '0')}`;
  if (mode === 'eat') {
    if (mealTime === 'breakfast') return `${time}・朝ごはんの時間。5分で出せるメニューから`;
    if (mealTime === 'lunch') return `${time}・お昼ごはん。家にあるものでサクッと`;
    if (mealTime === 'snack') return `${time}・おやつタイム。10分で作れる甘いもの`;
    if (mealTime === 'dinner') return `${time}・夕食準備。15分で食卓に出せるもの`;
  }
  if (mode === 'go') return `${time}・お出かけタイム。エリアと時間で1つ選びます`;
  if (mode === 'home') return `${time}・家でゆっくり。年齢に合った遊びを1つ`;
  return `${time}・今日何しよう？を3分で決めます`;
}

export function TodayFinder() {
  const [settings, updateSettings] = useUserSettings();
  const [state, setState] = useState<State>(INITIAL);
  const [currentWeather, setCurrentWeather] = useState<{ condition: string; label: string; temperatureC: number } | null>(null);
  const router = useRouter();

  // 初回マウント時に localStorage から復元 + 時刻自動でモード決定
  // ユーザーがまだモード明示してないとき（ INITIAL.mode='do' のまま）だけ時刻で上書き
  const [autoModeApplied, setAutoModeApplied] = useState(false);
  useEffect(() => {
    setState((s) => {
      const next = { ...s, area: settings.area, age: settings.age ?? s.age };
      if (!autoModeApplied) {
        const { mode: autoMode, mealTime: autoMealTime } = getDefaultModeByTime();
        return { ...applyModeDefaults(next, autoMode), mealTime: autoMealTime };
      }
      return next;
    });
    setAutoModeApplied(true);
  }, [settings.area, settings.age]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function setMode(m: Mode) {
    setState((s) => applyModeDefaults(s, m));
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

  /**
   * 「迷ったらお任せで」ボタン：現在時刻ベースの最適モードを設定し、
   * デフォルト年齢/エリアを localStorage から取って即 submit。
   * 入力が面倒なユーザー向けのワンタップ救済。
   */
  function submitAuto() {
    const { mode: autoMode, mealTime: autoMealTime } = getDefaultModeByTime();
    const autoState: State = applyModeDefaults(
      {
        ...INITIAL,
        age: settings.age ?? '2-3',
        area: settings.area ?? 'tokyo',
        mealTime: autoMealTime,
      },
      autoMode,
    );
    updateSettings({ area: autoState.area, age: autoState.age });

    const params = new URLSearchParams();
    Object.entries(autoState).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'area' && v === 'all') return;
      if (v !== 'any') params.set(k, String(v));
    });
    router.push(`/today?${params.toString()}`);
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

  // 'home' モードと、do/eat の '家' 選択時はエリア非活性。
  // eat × outside は外で食べる前提なのでエリア選択を有効化（駅指定で店舗絞り込み可能）。
  const placeDisablesArea = state.mode === 'home' || state.place === 'home';

  // モードに応じて表示する入力フィールドを切り替える
  // eat モードでも place を選べる（家で作る/外で食べる）。'外で食べる'を選ぶとエリアも有効化
  const eatOutside = state.mode === 'eat' && state.place === 'outside';
  const showArea = state.mode === 'go' || state.mode === 'do' || eatOutside;
  const showWeather = state.mode !== 'eat'; // 食事は天気非依存
  const showPlaceChip = state.mode === 'do' || state.mode === 'eat'; // do/eat モードで家/外を選べる
  const showDay = state.mode === 'go' || state.mode === 'do';
  const showBudget = state.mode === 'go' || state.mode === 'eat';
  const showMealTime = state.mode === 'eat' && state.place !== 'outside'; // 外食時は時間帯非表示

  const HEAD_COPY: Record<Mode, { eyebrow: string; title: string; lead: string }> = {
    go: { eyebrow: 'どこ行く？を3分で', title: '今日、どこに連れて行く？', lead: 'エリア・天気・年齢・時間・予算からおすすめおでかけ先を1つ提案。周辺のベビーカーOK店もまとめて。' },
    do: { eyebrow: '何する？を3分で', title: '今日、何して遊ぶ？', lead: '家でも外でも、年齢・時間・場所から「今日これ」を1つ提案。気分に合わなければ別候補もすぐ見られます。' },
    eat: eatOutside
      ? { eyebrow: '外で食べる？を3分で', title: '今日、どこで食べる？', lead: 'エリア・年齢・予算からベビーカーOK・キッズメニューありの子連れ歓迎ファミレス・カフェを提案。' }
      : { eyebrow: '何食べる？を3分で', title: '今日、何食べる？', lead: '朝・昼・夜・おやつから、年齢と所要時間に合うレシピを1つ提案。家にあるもので作れる現実解。' },
    home: { eyebrow: '家でどう過ごす？を3分で', title: '今日、家でどう過ごす？', lead: '雨・猛暑・寒い日でも、年齢・時間に合った室内の遊びを提案。家ごもりを「今日も楽しかった」に。' },
  };
  const headCopy = HEAD_COPY[state.mode];

  return (
    <div className="finder" id="finder">
      <div className="finder-head">
        <span className="eyebrow">{headCopy.eyebrow}</span>
        <h2>{headCopy.title}</h2>
        <p>{headCopy.lead}</p>

        {/* モードタブ：4軸切替 */}
        <div className="mode-tabs" role="tablist" aria-label="提案モード切替">
          {([
            { v: 'go', icon: '🚗', label: 'どこ行く' },
            { v: 'do', icon: '🎨', label: '何する' },
            { v: 'eat', icon: '🍽️', label: '何食べる' },
            { v: 'home', icon: '🏠', label: '家で過ごす' },
          ] as { v: Mode; icon: string; label: string }[]).map((m) => (
            <button
              key={m.v}
              type="button"
              role="tab"
              aria-selected={state.mode === m.v}
              className={`mode-tab ${state.mode === m.v ? 'active' : ''}`}
              onClick={() => setMode(m.v)}
            >
              <span aria-hidden="true">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* 「こう出ます」のサンプルプレビュー（押す前に体験を見せる） */}
        <AnswerPreview />
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
        {/* エリア（go/do モードのみ） */}
        {showArea && (
        <div className="field">
          <label htmlFor="today-area">エリア{placeDisablesArea && <span style={{ fontSize: 10, color: 'var(--ink-mute)', marginLeft: 6 }}>（家で過ごす場合は任意）</span>}</label>
          <select
            id="today-area"
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
        )}

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

        {/* 食事時間帯（eat モードのみ） */}
        {showMealTime && (
          <ChipGroup
            label="食事の時間帯"
            options={[
              { value: 'any', label: 'どれでも' },
              { value: 'breakfast', label: '朝食' },
              { value: 'lunch', label: '昼食' },
              { value: 'dinner', label: '夕食' },
              { value: 'snack', label: 'おやつ' },
            ]}
            value={state.mealTime}
            onChange={(v) => setValue('mealTime', v as MealTime)}
          />
        )}

        {showWeather && (
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
        )}

        {showPlaceChip && (
        <ChipGroup
          label={state.mode === 'eat' ? '家で作る / 外で食べる' : '家 / 外'}
          options={
            state.mode === 'eat'
              ? [
                  { value: 'home', label: '家で作る' },
                  { value: 'outside', label: '外で食べる' },
                ]
              : [
                  { value: 'any', label: 'どちらも' },
                  { value: 'home', label: '家で' },
                  { value: 'outside', label: '外で' },
                ]
          }
          value={state.place}
          onChange={(v) => setValue('place', v as State['place'])}
        />
        )}

        {showDay && (
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
        )}

        <ChipGroup
          label={state.mode === 'eat' ? '調理時間' : '使える時間'}
          options={
            state.mode === 'eat'
              ? [
                  { value: '15', label: '5〜15分' },
                  { value: '60', label: '〜30分' },
                  { value: '120', label: '〜1時間' },
                  { value: '240', label: 'たっぷり' },
                ]
              : [
                  { value: '15', label: '15分' },
                  { value: '60', label: '1時間' },
                  { value: '120', label: '半日' },
                  { value: '240', label: '1日' },
                ]
          }
          value={state.duration}
          onChange={(v) => setValue('duration', v as State['duration'])}
        />

        {showBudget && (
        <ChipGroup
          label="予算感"
          options={[
            { value: 'any', label: 'こだわらない' },
            { value: 'free', label: '無料〜500円' },
            { value: 'low', label: '〜2,000円' },
            { value: 'mid', label: '〜5,000円' },
          ]}
          value={state.budget}
          onChange={(v) => setValue('budget', v as State['budget'])}
        />
        )}
      </div>

      {/* 時刻ベースのヒント（モードが時刻と一致しているときに表示） */}
      <p className="finder-time-hint" aria-live="polite">
        <span aria-hidden="true">⏰</span>
        {getTimeHint(state.mode, state.mealTime)}
      </p>

      <div className="finder-foot">
        <button className="btn-primary-light" onClick={submit}>
          今日の答えを出す
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <button
          className="btn-magic"
          onClick={submitAuto}
          title="現在時刻と保存済み設定からおまかせで決めます"
          aria-label="迷ったらお任せで提案"
        >
          <span aria-hidden="true">✨</span>
          迷ったらお任せで
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
  // チップ群はラジオ的選択。<label> は単一のフォームコントロールに紐付かないため
  // role="group" + aria-labelledby で同等の意味づけにする。
  const groupId = `chip-group-${label.replace(/[^a-zA-Z0-9]/g, '_')}`;
  return (
    <div className="field" role="group" aria-labelledby={groupId}>
      <span id={groupId} className="field-label">{label}</span>
      <div className="chip-group">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`chip ${opt.value === value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={opt.value === value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
