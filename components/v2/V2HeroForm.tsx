'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { V2Icon } from './V2Icon';
import type { FinderStation } from '@/lib/finder-stations';

/**
 * TOP ヒーロー「1日プラン検索」フォーム（P0-1 / P0-2）。
 *
 * 指示書 P0-1: 入力→/today の断線を解消。1画面で 日付/年齢/駅/天気 を選び、
 * すべてクエリに乗せて `/today?date=&age=&station=&weather=` へ直結する
 * （駅アンカーの1日プランに一発到達。以前は area=都道府県 しか渡せず駅を選び直す断線があった）。
 *
 * P0-2: 日付タブの既定を曜日で出し分け（平日=今週末 / 土日=今日）。天気は手動選択。
 */

type DateKey = 'today' | 'tomorrow' | 'weekend';
type AgeKey = '0-1' | '2-3' | '4-6';
type WeatherKey = 'sunny' | 'cloudy' | 'rain';

const AGES: { v: AgeKey; t: string }[] = [
  { v: '0-1', t: '0〜1歳' },
  { v: '2-3', t: '2〜3歳' },
  { v: '4-6', t: '4〜6歳' },
];
const WEATHERS: { v: WeatherKey; t: string; emoji: string }[] = [
  { v: 'sunny', t: '晴れ', emoji: '☀' },
  { v: 'cloudy', t: 'くもり', emoji: '☁' },
  { v: 'rain', t: '雨', emoji: '☔' },
];

/** 曜日から日付タブの既定を決める（月〜金=weekend / 土日=today）。 */
function defaultDateForToday(d: Date): DateKey {
  const day = d.getDay(); // 0=日, 6=土
  if (day === 0 || day === 6) return 'today';
  return 'weekend';
}
function dateLabel(k: DateKey): string {
  return k === 'today' ? '今日' : k === 'tomorrow' ? '明日' : '今週末';
}

export function V2HeroForm({
  stations,
  terminals,
  family,
}: {
  stations: FinderStation[];
  terminals: FinderStation[];
  family: FinderStation[];
}) {
  const router = useRouter();

  // date: hydration mismatch を避けるため初期は 'weekend' 固定 → mount 後に曜日で補正。
  const [date, setDate] = React.useState<DateKey>('weekend');
  const [age, setAge] = React.useState<AgeKey>('2-3');
  const [weather, setWeather] = React.useState<WeatherKey>('sunny');
  const [station, setStation] = React.useState<FinderStation | null>(null);
  const [stationOpen, setStationOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [err, setErr] = React.useState(false);

  React.useEffect(() => {
    setDate(defaultDateForToday(new Date()));
    try {
      const saved = localStorage.getItem('kk_finder_station');
      if (saved) {
        const hit = stations.find((s) => s.slug === saved);
        if (hit) setStation(hit);
      }
    } catch {
      /* ignore */
    }
  }, [stations]);

  const onSubmit = () => {
    if (!station) {
      setErr(true);
      setStationOpen(true);
      return;
    }
    try {
      localStorage.setItem('kk_finder_station', station.slug);
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams({ date, age, station: station.slug, weather });
    router.push(`/today?${params.toString()}`);
  };

  const pick = (s: FinderStation) => {
    setStation(s);
    setErr(false);
    setStationOpen(false);
    setQ('');
  };

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    // 駅名だけでなく、区・市・府県などの地名（regionLabel/area）でもヒットさせる。
    return stations
      .filter(
        (s) =>
          s.name.includes(t) ||
          s.kana.includes(t) ||
          s.slug.includes(t) ||
          s.regionLabel.includes(t) ||
          (s.area?.includes(t) ?? false),
      )
      .slice(0, 12);
  }, [q, stations]);

  return (
    <div className="v2-hero-form">
      {/* ① 日付タブ */}
      <div className="v2-hf-datetabs" role="tablist" aria-label="いつ行く"
        style={{ display: 'flex', gap: 6 }}>
        {(['today', 'tomorrow', 'weekend'] as DateKey[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={date === k}
            className={'v2-hf-datetab' + (date === k ? ' on' : '')}
            onClick={() => setDate(k)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 10,
              border: '1px solid ' + (date === k ? 'var(--v2-orange)' : 'var(--v2-line)'),
              background: date === k ? 'var(--v2-orange)' : 'var(--v2-card, #fff)',
              color: date === k ? '#fff' : 'var(--v2-ink)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {dateLabel(k)}
          </button>
        ))}
      </div>

      {/* ② 年齢 */}
      <div className="v2-hf-chiprow" style={{ marginTop: 10 }}>
        <span className="v2-hf-chiplabel" style={chipLabelStyle}>お子さんの年齢</span>
        <div className="v2-hf-chips" style={chipsRowStyle}>
          {AGES.map((a) => (
            <button
              key={a.v}
              type="button"
              className={'v2-hf-chip' + (age === a.v ? ' on' : '')}
              aria-pressed={age === a.v}
              onClick={() => setAge(a.v)}
              style={chipStyle(age === a.v)}
            >
              {a.t}
            </button>
          ))}
        </div>
      </div>

      {/* ③ 駅・エリア（必須） */}
      <div className="v2-hf-chiprow" style={{ marginTop: 10 }}>
        <span className="v2-hf-chiplabel" style={chipLabelStyle}>どこから？（駅）</span>
        <button
          type="button"
          className={'v2-hf-stationbtn' + (err ? ' err' : '')}
          onClick={() => setStationOpen((o) => !o)}
          aria-expanded={stationOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '11px 12px',
            borderRadius: 11,
            border: '1px solid ' + (err ? '#e0574c' : 'var(--v2-line)'),
            background: 'var(--v2-card, #fff)',
            color: station ? 'var(--v2-ink)' : 'var(--v2-ink-mute)',
            fontSize: 14,
            fontWeight: station ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          <V2Icon name="pin" size={16} color="var(--v2-orange)" />
          {station ? `${station.name}駅` : '駅・エリアを選ぶ'}
          <V2Icon name="chevron-down" size={15} color="#c4bbb0" style={{ marginLeft: 'auto' }} />
        </button>
        {err && (
          <p style={{ fontSize: 12, color: '#e0574c', margin: '4px 2px 0' }}>
            出発する駅を選んでください
          </p>
        )}

        {stationOpen && (
          <div
            className="v2-hf-stationpop"
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--v2-line)',
              background: 'var(--v2-card, #fff)',
              boxShadow: '0 8px 24px rgba(0,0,0,.10)',
            }}
          >
            <input
              type="text"
              inputMode="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 駅名・地名で検索（例：池袋、横浜、梅田）"
              autoFocus
              style={{
                width: '100%',
                padding: '9px 11px',
                borderRadius: 9,
                border: '1px solid var(--v2-line)',
                fontSize: 14,
                marginBottom: 10,
              }}
            />
            {q.trim() ? (
              <div className="v2-hf-stationlist">
                {filtered.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', padding: '6px 2px' }}>
                    該当する駅が見つかりません
                  </p>
                ) : (
                  filtered.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      className="v2-hf-stationopt"
                      onClick={() => pick(s)}
                      style={stationOptStyle}
                    >
                      {s.name}駅
                      <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 500, color: 'var(--v2-ink-mute, #8E867A)' }}>
                        {s.area ? `${s.regionLabel}・${s.area}` : s.regionLabel}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <>
                <StationChips label="主要ターミナル" list={terminals} onPick={pick} />
                <StationChips label="子育て世帯に人気の駅" list={family} onPick={pick} />
              </>
            )}
          </div>
        )}
      </div>

      {/* ④ 天気 */}
      <div className="v2-hf-chiprow" style={{ marginTop: 10 }}>
        <span className="v2-hf-chiplabel" style={chipLabelStyle}>お天気</span>
        <div className="v2-hf-chips" style={chipsRowStyle}>
          {WEATHERS.map((w) => (
            <button
              key={w.v}
              type="button"
              className={'v2-hf-chip' + (weather === w.v ? ' on' : '')}
              aria-pressed={weather === w.v}
              onClick={() => setWeather(w.v)}
              style={chipStyle(weather === w.v)}
            >
              {w.emoji} {w.t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="v2-btn-primary v2-hf-submit"
        onClick={onSubmit}
        style={{ marginTop: 14 }}
      >
        <V2Icon name="search" size={19} color="#fff" /> この条件で1日プランを作る
      </button>
    </div>
  );
}

const chipLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--v2-ink-mute)',
  marginBottom: 6,
};
const chipsRowStyle: React.CSSProperties = { display: 'flex', gap: 7, flexWrap: 'wrap' };
function chipStyle(on: boolean): React.CSSProperties {
  return {
    flex: '1 1 0',
    minWidth: 72,
    padding: '9px 10px',
    borderRadius: 10,
    border: '1px solid ' + (on ? 'var(--v2-orange)' : 'var(--v2-line)'),
    background: on ? 'var(--v2-orange-tint, #fff2e8)' : 'var(--v2-card, #fff)',
    color: on ? 'var(--v2-orange-deep, #c05a1e)' : 'var(--v2-ink)',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

const stationOptStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '9px 10px',
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--v2-ink)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

function StationChips({
  label,
  list,
  onPick,
}: {
  label: string;
  list: FinderStation[];
  onPick: (s: FinderStation) => void;
}) {
  if (!list.length) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)', margin: '0 0 6px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {list.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => onPick(s)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid var(--v2-line)',
              background: 'var(--v2-bg, #faf6ef)',
              color: 'var(--v2-ink)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
