'use client';

import React from 'react';
import Link from 'next/link';
import { AREAS, getAreaName, isValidArea, type AreaSlug } from '@/lib/area';
import { PREF_GEO } from '@/lib/prefecture-geo';
import { useUserSettings, type ChildAge } from '@/hooks/useUserSettings';
import { trackEvent } from '@/lib/analytics';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';

/**
 * トップの「今日のうちの子」パーソナライズヒーロー。
 *
 * - 初回: 都道府県＋子の生年月を聞く1枚カード（localStorageに保存・会員登録なし）
 * - 2回目以降: 当日の天気（Open-Meteo・キー不要）×月齢で
 *   「今日の◯◯は雨。2歳3ヶ月の子と過ごすなら」と即答の導線を出す。
 *   競合（いこーよ等）は天気を「タグ」までしか持っておらず、
 *   天気予報連動の即答はこのサイトの差別化機能。
 */

type WxKind = 'sunny' | 'rain' | 'heat' | 'cold';
type Wx = { kind: WxKind; tmax: number | null };

/** 天気の記号は絵文字を使わず KkIcon（線画・墨1色）で描く（docs/renewal-2026-09.md §3-0）。 */
const WX_META: Record<WxKind, { icon: KkIconName; label: string }> = {
  sunny: { icon: 'sunny', label: '晴れ' },
  rain: { icon: 'rain', label: '雨' },
  heat: { icon: 'hot', label: '猛暑' },
  cold: { icon: 'cold', label: '寒い' },
};

const WX_CACHE_PREFIX = 'kk_wx_v1_';
const WX_CACHE_TTL_MS = 30 * 60 * 1000; // 30分

/** Open-Meteo の当日予報を sunny/rain/heat/cold に丸める。 */
function toWxKind(weatherCode: number, tmax: number, precipProb: number): WxKind {
  const rainy = weatherCode >= 51 || precipProb >= 50; // 霧雨〜雷雨・降水確率50%以上
  if (rainy) return 'rain';
  if (tmax >= 30) return 'heat';
  if (tmax <= 8) return 'cold';
  return 'sunny';
}

async function fetchWeather(area: AreaSlug): Promise<Wx | null> {
  const geo = PREF_GEO[area];
  if (!geo) return null;
  try {
    const cached = window.sessionStorage.getItem(WX_CACHE_PREFIX + area);
    if (cached) {
      const p = JSON.parse(cached);
      if (Date.now() - p.t < WX_CACHE_TTL_MS) return { kind: p.kind, tmax: p.tmax };
    }
  } catch {
    /* ignore */
  }
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}` +
      `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
      `&timezone=Asia%2FTokyo&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const code = Number(json?.daily?.weather_code?.[0] ?? 0);
    const tmax = Number(json?.daily?.temperature_2m_max?.[0] ?? NaN);
    const prob = Number(json?.daily?.precipitation_probability_max?.[0] ?? 0);
    const wx: Wx = {
      kind: toWxKind(code, Number.isFinite(tmax) ? tmax : 20, prob),
      tmax: Number.isFinite(tmax) ? Math.round(tmax) : null,
    };
    try {
      window.sessionStorage.setItem(
        WX_CACHE_PREFIX + area,
        JSON.stringify({ t: Date.now(), kind: wx.kind, tmax: wx.tmax }),
      );
    } catch {
      /* ignore */
    }
    return wx;
  } catch {
    return null;
  }
}

/** 生年月 'YYYY-MM' → 月齢。未来や壊れた値は null。 */
function monthsOld(birthMonth: string): number | null {
  const m = /^(\d{4})-(\d{2})$/.exec(birthMonth);
  if (!m) return null;
  const now = new Date();
  const months =
    (now.getFullYear() - Number(m[1])) * 12 + (now.getMonth() + 1 - Number(m[2]));
  return months >= 0 ? months : null;
}

function ageLabel(months: number): string {
  if (months < 12) return `生後${months}ヶ月`;
  const y = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${y}歳` : `${y}歳${rest}ヶ月`;
}

function toAgeRange(months: number): ChildAge {
  if (months < 24) return '0-1';
  if (months < 48) return '2-3';
  return '4-6';
}

/** 設定フォーム用: 0〜6歳をカバーする生年月の選択肢（直近84ヶ月） */
function birthMonthOptions(): { v: string; t: string }[] {
  const out: { v: string; t: string }[] = [];
  const d = new Date();
  for (let i = 0; i <= 84; i++) {
    const y = d.getFullYear();
    const mo = d.getMonth() + 1;
    out.push({ v: `${y}-${String(mo).padStart(2, '0')}`, t: `${y}年${mo}月` });
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

const PREFS = AREAS.filter((a) => Boolean(PREF_GEO[a.slug]));

export type AgePick = { slug: string; title: string };

export function V2TodayHero({
  agePicks,
  variant = 'full',
}: {
  /** 年齢帯ごとの記事候補。設定済みユーザーに月替わりで3本ローテ表示する。 */
  agePicks?: Partial<Record<ChildAge, AgePick[]>>;
  /**
   * 表示の出し分け:
   * - 'full'      : 従来。未設定→設定カード／設定済→即答パネル
   * - 'panel-only': 設定済ユーザーの即答パネルのみ（未設定では null）。ヒーロー上部に置き、
   *                 再訪ユーザーが最初に自分の子の「今日」を見られるようにする。
   * - 'setup-only': 未設定ユーザーの設定カードのみ（設定済では null）。ヒーロー下に置く。
   */
  variant?: 'full' | 'panel-only' | 'setup-only';
}) {
  const [settings, update] = useUserSettings();
  const [mounted, setMounted] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [wx, setWx] = React.useState<Wx | null>(null);

  // フォーム入力（保存前のドラフト）
  const [draftArea, setDraftArea] = React.useState<AreaSlug>('tokyo');
  const [draftBirth, setDraftBirth] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (isValidArea(settings.area) && PREF_GEO[settings.area]) setDraftArea(settings.area);
    if (settings.childBirthMonth) setDraftBirth(settings.childBirthMonth);
  }, [mounted, settings.area, settings.childBirthMonth]);

  const months = settings.childBirthMonth ? monthsOld(settings.childBirthMonth) : null;
  const configured = months != null;

  React.useEffect(() => {
    if (!mounted || !configured) return;
    let alive = true;
    fetchWeather(settings.area).then((w) => {
      if (alive) setWx(w);
    });
    return () => {
      alive = false;
    };
  }, [mounted, configured, settings.area]);

  if (!mounted) return null;

  // variant による出し分け:
  // - panel-only は未設定ユーザーには何も出さない（ヒーロー上部を新規/クローラには空に保つ＝SEOのH1先頭を維持）
  // - setup-only は設定済ユーザーには何も出さない（上部の panel-only が即答を担うため重複させない）
  if (variant === 'panel-only' && !configured) return null;
  if (variant === 'setup-only' && configured) return null;

  // ---------- 初回 / 編集モード: 設定カード ----------
  if (!configured || editing) {
    const canSave = /^\d{4}-\d{2}$/.test(draftBirth);
    return (
      <section className="tv3-setup" aria-label="今日のうちの子 設定">
        <div className="tv3-setup-title">「うちの子の今日」を毎日表示する</div>
        <p className="tv3-setup-lead">
          お住まいの地域とお子さんの生まれ月を選ぶと、開くたびに今日の天気×月齢に合った過ごし方を提案します。この端末にだけ保存され、会員登録は不要です。
        </p>
        <div className="tv3-setup-row">
          <select
            value={draftArea}
            onChange={(e) => setDraftArea(e.target.value as AreaSlug)}
            aria-label="お住まいの都道府県"
          >
            {PREFS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={draftBirth}
            onChange={(e) => setDraftBirth(e.target.value)}
            aria-label="お子さんの生まれ月"
          >
            <option value="">お子さんの生まれ月</option>
            {birthMonthOptions().map((o) => (
              <option key={o.v} value={o.v}>
                {o.t}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="kk-btn sm"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.45 }}
            onClick={() => {
              const mo = monthsOld(draftBirth);
              update({
                area: draftArea,
                childBirthMonth: draftBirth,
                age: mo != null ? toAgeRange(mo) : undefined,
              });
              setEditing(false);
              trackEvent('today_hero_setup', {
                area: draftArea,
                age_months: mo ?? -1,
              });
            }}
          >
            今日のおすすめを表示
          </button>
          {configured && (
            <button type="button" className="tv3-setup-cancel" onClick={() => setEditing(false)}>
              キャンセル
            </button>
          )}
        </div>
      </section>
    );
  }

  // ---------- 設定済み: 今日の即答パネル ----------
  const ageRange = toAgeRange(months);
  const wxKind: WxKind = wx?.kind ?? 'sunny';
  const meta = WX_META[wxKind];
  const areaName = getAreaName(settings.area);
  const q = (place: 'outside' | 'home') => {
    const params = new URLSearchParams({ age: ageRange, weather: wxKind, place });
    if (place === 'outside' && PREF_GEO[settings.area]) params.set('area', settings.area);
    return `/today?${params.toString()}`;
  };
  const click = (target: string) =>
    trackEvent('today_hero_click', { target, weather: wxKind, age: ageRange });

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}/${today.getDate()}(${['日', '月', '火', '水', '木', '金', '土'][today.getDay()]})`;

  return (
    <section className="tv3-status" aria-label="今日のうちの子">
      <span className="tv3-status-eyebrow">{dateLabel}・うちの子の今日</span>
      {/* 日付・天気・月齢の帯（データがあるものだけ。天気は取得できるまで晴れ既定＝従来どおり） */}
      <div className="tv3-status-strip">
        <span className="tv3-status-item">
          <span className="tv3-status-lab">きょう</span>
          <span className="tv3-status-val">{dateLabel}</span>
        </span>
        <span className="tv3-status-item">
          <span className="tv3-status-lab">{areaName}の天気</span>
          <span className="tv3-status-val">
            <KkIcon name={meta.icon} size={16} sw={1.9} />
            {meta.label}
            {wx?.tmax != null && <span className="tv3-status-sub"> 最高{wx.tmax}°C</span>}
          </span>
        </span>
        <span className="tv3-status-item">
          <span className="tv3-status-lab">うちの子</span>
          <span className="tv3-status-val">{ageLabel(months)}</span>
        </span>
      </div>
      <p className="tv3-status-lead">
        {ageLabel(months)}のお子さんと、今日はどう過ごす？
      </p>
      <div className="kk-chips">
        <Link href={q('outside')} className="kk-chip" onClick={() => click('outside')}>
          <KkIcon name="park" size={15} color="var(--kk-orange-deep)" />
          外でおでかけ
        </Link>
        <Link href={q('home')} className="kk-chip" onClick={() => click('home')}>
          <KkIcon name="indoor" size={15} color="var(--kk-orange-deep)" />
          おうちで遊ぶ
        </Link>
        <Link
          href={`/area/${settings.area}`}
          className="kk-chip"
          onClick={() => click('area-spots')}
        >
          <KkIcon name="pin" size={15} color="var(--kk-orange-deep)" />
          {areaName}のスポット
        </Link>
      </div>
      {(() => {
        // 月替わりローテーション: 同じ月は同じ3本（「今月のヒント」として安定表示）
        const pool = agePicks?.[ageRange] ?? [];
        if (pool.length === 0) return null;
        const now = new Date();
        const monthIdx = now.getFullYear() * 12 + now.getMonth();
        const start = (monthIdx * 3) % pool.length;
        const picks = [0, 1, 2]
          .map((i) => pool[(start + i) % pool.length])
          .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i);
        return (
          <div className="tv3-status-hints">
            <span className="tv3-status-hints-lab">{ageLabel(months)}の今月のヒント</span>
            {picks.map((p) => (
              <Link
                key={p.slug}
                href={`/article/${p.slug}`}
                onClick={() => click('age-pick')}
                className="tv3-status-hint"
              >
                <KkIcon name="chevron-right" size={13} sw={2.2} />
                {p.title}
              </Link>
            ))}
          </div>
        );
      })()}
      <button type="button" className="tv3-status-edit" onClick={() => setEditing(true)}>
        地域・生まれ月を変更
      </button>
    </section>
  );
}
