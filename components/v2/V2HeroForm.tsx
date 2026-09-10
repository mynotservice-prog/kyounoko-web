'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';
import type { FinderStation } from '@/lib/finder-stations';

/**
 * TOP ヒーロー「1日プラン検索」フォーム（P0-1 / P0-2）。
 *
 * 指示書 P0-1: 入力→/today の断線を解消。1画面で 日付/年齢/駅/天気 を選び、
 * すべてクエリに乗せて `/today?date=&age=&station=&weather=` へ直結する
 * （駅アンカーの1日プランに一発到達。以前は area=都道府県 しか渡せず駅を選び直す断線があった）。
 *
 * P0-2: 日付タブの既定を曜日で出し分け（平日=今週末 / 土日=今日）。天気は手動選択。
 *
 * 2026-09 リニューアル 第2版（見た目のみ変更）:
 * モックの並び「① 目立つ駅の検索欄 → ② 今日/明日/週末 → ③ 年齢・天気（小さく）→ ④ 全幅CTA」に合わせ、
 * インラインstyleを app/styles/kk.css / top-v3.css のクラス（.kk-field/.kk-seg/.kk-chip/.kk-btn）へ移した。
 * state・localStorage キー(`kk_finder_station`)・クエリの生成順は一切変えていない。
 */

type DateKey = 'today' | 'tomorrow' | 'weekend';
type AgeKey = '0-1' | '2-3' | '4-6';
type WeatherKey = 'sunny' | 'cloudy' | 'rain';

const AGES: { v: AgeKey; t: string }[] = [
  { v: '0-1', t: '0〜1歳' },
  { v: '2-3', t: '2〜3歳' },
  { v: '4-6', t: '4〜6歳' },
];
/** 天気は社長支給のアイコンイラスト（KkArt）で描く。絵文字は使わない。 */
const WEATHERS: { v: WeatherKey; t: string; icon: KkArtName }[] = [
  { v: 'sunny', t: '晴れ', icon: 'sunny' },
  { v: 'cloudy', t: 'くもり', icon: 'cloudy' },
  { v: 'rain', t: '雨', icon: 'rain' },
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
    <div className="tv3-form">
      {/* ① 駅・エリア（必須）— ファーストビューで一番目立つ入力 */}
      <button
        type="button"
        className={
          'kk-field tv3-search v2-hf-stationbtn' + (station ? '' : ' empty') + (err ? ' err' : '')
        }
        onClick={() => setStationOpen((o) => !o)}
        aria-expanded={stationOpen}
        aria-label="出発する駅・エリアを選ぶ"
      >
        <KkIcon name="search" size={19} color="var(--kk-orange)" sw={2} />
        <span className="tv3-search-txt">{station ? `${station.name}駅` : '駅・エリアを選ぶ'}</span>
        <KkIcon name="chevron-down" size={17} color="var(--kk-ink-mute)" sw={2.2} />
      </button>
      {err && <p className="tv3-form-err">出発する駅を選んでください</p>}

      {stationOpen && (
        <div className="v2-hf-stationpop tv3-pop">
          <input
            type="text"
            inputMode="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="駅名・地名で検索（例：池袋、横浜、梅田）"
            autoFocus
            className="tv3-pop-input"
          />
          {q.trim() ? (
            <div className="v2-hf-stationlist">
              {filtered.length === 0 ? (
                <p className="tv3-pop-empty">該当する駅が見つかりません</p>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    className="v2-hf-stationopt tv3-pop-opt"
                    onClick={() => pick(s)}
                  >
                    {s.name}駅
                    <span className="tv3-pop-opt-sub">
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

      {/* ② 日付（今日 / 明日 / 今週末） */}
      <div className="v2-hf-datetabs kk-seg" role="tablist" aria-label="いつ行く">
        {(['today', 'tomorrow', 'weekend'] as DateKey[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={date === k}
            className={'v2-hf-datetab kk-seg-btn' + (date === k ? ' on' : '')}
            onClick={() => setDate(k)}
          >
            {dateLabel(k)}
          </button>
        ))}
      </div>

      {/* ③ 年齢・天気（従来どおりクエリに乗るが、見た目は控えめ・小さく） */}
      <div className="tv3-mini">
        <div className="v2-hf-chiprow">
          <span className="v2-hf-chiplabel tv3-mini-lab">お子さんの年齢</span>
          <div className="v2-hf-chips kk-chips">
            {AGES.map((a) => (
              <button
                key={a.v}
                type="button"
                className={'v2-hf-chip kk-chip' + (age === a.v ? ' on' : '')}
                aria-pressed={age === a.v}
                onClick={() => setAge(a.v)}
              >
                {a.t}
              </button>
            ))}
          </div>
        </div>
        <div className="v2-hf-chiprow">
          <span className="v2-hf-chiplabel tv3-mini-lab">お天気</span>
          <div className="v2-hf-chips kk-chips">
            {WEATHERS.map((w) => (
              <button
                key={w.v}
                type="button"
                className={'v2-hf-chip kk-chip' + (weather === w.v ? ' on' : '')}
                aria-pressed={weather === w.v}
                onClick={() => setWeather(w.v)}
              >
                <KkArt name={w.icon} size={18} />
                {w.t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ④ CTA */}
      <button type="button" className="v2-hf-submit kk-btn block" onClick={onSubmit}>
        <KkIcon name="search" size={17} color="#fff" sw={2.2} /> この条件で1日プランを作る
      </button>
    </div>
  );
}

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
    <div className="tv3-pop-group">
      <p className="tv3-pop-group-lab">{label}</p>
      <div className="kk-chips">
        {list.map((s) => (
          <button key={s.slug} type="button" className="kk-chip" onClick={() => onPick(s)}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
