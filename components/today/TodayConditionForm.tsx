'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { FinderStation } from '@/lib/finder-stations';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';

/**
 * /today 条件入力フォーム（リニューアル 2026-09 / 第3版 §3-3）。
 *
 * V2HeroForm（トップ）と同じ URL 形（/today?date=&age=&station=&weather=）へ遷移する。
 * 並びもトップと同じ「① 駅の検索欄（主役）→ ② 今日/明日/週末 → ③ 年齢・天気 → ④ 全幅CTA」。
 * 駅は FINDER_STATIONS から駅名/かな/地名で検索し、必須。
 * 最近使った駅は localStorage `kk_finder_recent`（slug 配列・最大4件）。
 * 既存の `kk_finder_station`（単一 slug）も種として読み、送信時に両方へ書く。
 *
 * 表示の方針（社長指示）:
 * - 絵文字を使わない。記号はすべて KkIcon（線画・墨1色）。
 * - 「駅一覧ページ」に見せない。駅名を丸角チップで埋め尽くさず、静かな行リストにまとめる。
 * - 検索欄を主役にする（横幅いっぱい・文字大きめ）。主CTAは1つだけ。
 *
 * ※ 純粋にクライアント側の入力 UI。サーバー側の計算（クエリ→静的データ）には影響しない。
 */

type DateKey = 'today' | 'tomorrow' | 'weekend';
type AgeKey = '0-1' | '2-3' | '4-6';
type WeatherKey = 'sunny' | 'cloudy' | 'rain';

const AGES: { v: AgeKey; t: string }[] = [
  { v: '0-1', t: '0〜1歳' },
  { v: '2-3', t: '2〜3歳' },
  { v: '4-6', t: '4〜6歳' },
];
const DATES: { v: DateKey; t: string }[] = [
  { v: 'today', t: '今日' },
  { v: 'tomorrow', t: '明日' },
  { v: 'weekend', t: '週末' },
];
const WEATHERS: { v: WeatherKey; t: string; icon: KkArtName }[] = [
  { v: 'sunny', t: '晴れ', icon: 'sunny' },
  { v: 'cloudy', t: 'くもり', icon: 'cloudy' },
  { v: 'rain', t: '雨', icon: 'rain' },
];

const RECENT_KEY = 'kk_finder_recent';
const LEGACY_KEY = 'kk_finder_station';
const RECENT_MAX = 4;

function isAge(v: unknown): v is AgeKey {
  return v === '0-1' || v === '2-3' || v === '4-6';
}
function isWeather(v: unknown): v is WeatherKey {
  return v === 'sunny' || v === 'cloudy' || v === 'rain';
}

/** 曜日から日付タブの既定を決める（月〜金=週末 / 土日=今日）。mount 後にだけ使う。 */
function defaultDateForToday(d: Date): DateKey {
  const day = d.getDay();
  return day === 0 || day === 6 ? 'today' : 'weekend';
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && !list.includes(legacy)) list.push(legacy);
    return list.slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

function writeRecent(slug: string) {
  try {
    const prev = readRecent().filter((s) => s !== slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...prev].slice(0, RECENT_MAX)));
    localStorage.setItem(LEGACY_KEY, slug);
  } catch {
    /* ignore */
  }
}

/** 駅のクイック選択（静かな行。丸角チップにしない） */
function StationQuickList({
  label,
  items,
  currentSlug,
  onPick,
  icon,
  testId,
}: {
  label: string;
  items: FinderStation[];
  currentSlug?: string;
  onPick: (s: FinderStation) => void;
  icon?: KkIconName;
  testId?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="td3-stgroup" data-testid={testId}>
      <div className="td3-stgroup-lab">
        {icon && <KkIcon name={icon} size={13} />}
        {label}
      </div>
      <div className="td3-stlist">
        {items.map((s) => (
          <button
            key={s.slug}
            type="button"
            className={'td3-stitem' + (currentSlug === s.slug ? ' on' : '')}
            onClick={() => onPick(s)}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TodayConditionForm({
  stations,
  terminals,
  family,
  initialAge,
  initialWeather,
}: {
  stations: FinderStation[];
  terminals: FinderStation[];
  family: FinderStation[];
  /** 現在の /today クエリ（age）。あれば初期値に使う */
  initialAge?: string;
  /** 現在の /today クエリ（weather）。あれば初期値に使う */
  initialWeather?: string;
}) {
  const router = useRouter();
  const [date, setDate] = React.useState<DateKey>('weekend');
  const [age, setAge] = React.useState<AgeKey>(isAge(initialAge) ? initialAge : '2-3');
  const [weather, setWeather] = React.useState<WeatherKey>(
    isWeather(initialWeather) ? initialWeather : 'sunny',
  );
  const [station, setStation] = React.useState<FinderStation | null>(null);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [recent, setRecent] = React.useState<FinderStation[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDate(defaultDateForToday(new Date()));
    const slugs = readRecent();
    const hits = slugs
      .map((slug) => stations.find((s) => s.slug === slug))
      .filter((s): s is FinderStation => !!s);
    setRecent(hits);
  }, [stations]);

  // 外側クリックで候補を閉じる
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return stations
      .filter(
        (s) =>
          s.name.includes(t) ||
          s.kana.includes(t) ||
          s.slug.includes(t) ||
          s.regionLabel.includes(t) ||
          (s.area?.includes(t) ?? false),
      )
      .slice(0, 10);
  }, [q, stations]);

  const pick = (s: FinderStation) => {
    setStation(s);
    setQ(`${s.name}駅`);
    setErr(false);
    setOpen(false);
  };

  const onInput = (v: string) => {
    setQ(v);
    setStation(null);
    setOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = station;
    // 入力途中でも候補が1件に絞れていればそれを採用する
    if (!target && filtered.length === 1) target = filtered[0];
    if (!target) {
      setErr(true);
      setOpen(true);
      inputRef.current?.focus();
      return;
    }
    writeRecent(target.slug);
    const params = new URLSearchParams({ date, age, station: target.slug, weather });
    router.push(`/today?${params.toString()}`);
  };

  // よく使う駅: ターミナル＋子育て世帯に人気（重複除去）
  const popular = React.useMemo(() => {
    const seen = new Set<string>();
    return [...terminals, ...family].filter((s) => {
      if (seen.has(s.slug)) return false;
      seen.add(s.slug);
      return true;
    });
  }, [terminals, family]);

  return (
    <form className="td3-form" onSubmit={onSubmit} noValidate>
      {/* ① 駅（この画面の主役。入力欄を大きく・横幅いっぱいに） */}
      <div className="td3-fg td3-fg-station">
        <label className="td3-lab" htmlFor="td3-station">
          出発する駅 <span className="td3-req">必須</span>
        </label>
        <div className="td3-station" ref={boxRef}>
          <div className={'td3-input-wrap kk-field' + (err ? ' err' : '') + (station ? ' picked' : '')}>
            <KkIcon name="search" size={22} className="td3-input-ico" />
            <input
              ref={inputRef}
              id="td3-station"
              type="text"
              inputMode="search"
              autoComplete="off"
              className="td3-input"
              value={q}
              placeholder="駅名で検索（例：池袋、横浜、梅田）"
              onChange={(e) => onInput(e.target.value)}
              onFocus={() => setOpen(true)}
              aria-invalid={err}
              aria-autocomplete="list"
              aria-expanded={open && filtered.length > 0}
              aria-controls="td3-station-list"
            />
            {q && (
              <button
                type="button"
                className="td3-input-clear"
                aria-label="入力をクリア"
                onClick={() => {
                  setQ('');
                  setStation(null);
                  inputRef.current?.focus();
                }}
              >
                <KkIcon name="plus" size={14} sw={2.4} style={{ transform: 'rotate(45deg)' }} />
              </button>
            )}
          </div>
          {err && <p className="td3-err">出発する駅を選んでください</p>}
          {open && q.trim() && !station && (
            <div className="td3-pop" id="td3-station-list" role="listbox">
              {filtered.length === 0 ? (
                <p className="td3-pop-empty">該当する駅が見つかりません</p>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="td3-pop-opt"
                    onClick={() => pick(s)}
                  >
                    <KkIcon name="train" size={16} />
                    <span className="td3-pop-name">{s.name}駅</span>
                    <span className="td3-pop-sub">
                      {s.area ? `${s.regionLabel}・${s.area}` : s.regionLabel}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 最近使った駅（localStorage）。mount 後にだけ出る */}
        <StationQuickList
          label="最近使った駅"
          icon="clock"
          items={recent}
          currentSlug={station?.slug}
          onPick={pick}
          testId="td3-recent"
        />

        {/* よく使う駅 */}
        <StationQuickList
          label="よく使う駅"
          items={popular}
          currentSlug={station?.slug}
          onPick={pick}
        />
      </div>

      {/* ② 日付（トップと同じ操作感：選択中だけオレンジ・未選択は白＋細い枠線） */}
      <div className="td3-fg td3-fg-date">
        <div className="td3-lab">どの日に行く？</div>
        <div className="kk-seg" role="group" aria-label="どの日に行く">
          {DATES.map((d) => (
            <button
              key={d.v}
              type="button"
              className={'kk-seg-btn' + (date === d.v ? ' on' : '')}
              aria-pressed={date === d.v}
              onClick={() => setDate(d.v)}
            >
              {d.t}
            </button>
          ))}
        </div>
      </div>

      {/* ③ 年齢・天気 */}
      <div className="td3-fg td3-fg-mini">
        <div className="td3-mini">
          <label className="td3-lab" htmlFor="td3-age">
            子どもの年齢
          </label>
          <div className="td3-select-wrap kk-field">
            <KkIcon name="child" size={20} className="td3-select-lead" />
            <select
              id="td3-age"
              className="td3-select"
              value={age}
              onChange={(e) => setAge(e.target.value as AgeKey)}
            >
              {AGES.map((a) => (
                <option key={a.v} value={a.v}>
                  {a.t}
                </option>
              ))}
            </select>
            <KkIcon name="chevron-down" size={16} className="td3-select-ico" />
          </div>
        </div>

        <div className="td3-mini">
          <div className="td3-lab">お天気</div>
          <div className="kk-seg" role="group" aria-label="お天気">
            {WEATHERS.map((w) => (
              <button
                key={w.v}
                type="button"
                className={'kk-seg-btn' + (weather === w.v ? ' on' : '')}
                aria-pressed={weather === w.v}
                onClick={() => setWeather(w.v)}
              >
                <KkArt name={w.icon} size={19} />
                {w.t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ④ 主CTA（この画面で強いボタンはこれ1つだけ） */}
      <div className="td3-fg td3-fg-cta">
        <button type="submit" className="kk-btn block td3-submit">
          この条件で今日のプランを見る
          <KkIcon name="arrow-right" size={18} sw={2.2} />
        </button>
      </div>
    </form>
  );
}
