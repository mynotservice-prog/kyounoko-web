'use client';

import React from 'react';
import Link from 'next/link';
import { AREAS, getAreaName, isValidArea, type AreaSlug } from '@/lib/area';
import { PREF_GEO } from '@/lib/prefecture-geo';
import { useUserSettings, type ChildAge } from '@/hooks/useUserSettings';
import { trackEvent } from '@/lib/analytics';
import { V2Icon } from './V2Icon';

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

const WX_META: Record<WxKind, { emoji: string; label: string }> = {
  sunny: { emoji: '☀️', label: '晴れ' },
  rain: { emoji: '☔', label: '雨' },
  heat: { emoji: '🥵', label: '猛暑' },
  cold: { emoji: '🧣', label: '寒い' },
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

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #f0e8de',
  borderRadius: 16,
  padding: '16px 16px 14px',
  marginTop: 16,
  boxShadow: '0 2px 10px rgba(60,40,20,.05)',
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 14px',
  borderRadius: 999,
  background: '#fff7ee',
  border: '1px solid #f3dec7',
  color: '#7a4a12',
  fontSize: 13.5,
  fontWeight: 600,
  textDecoration: 'none',
};

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
      <section style={cardStyle} aria-label="今日のうちの子 設定">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <V2Icon name="sparkle" size={16} color="var(--v2-orange)" />
          <strong style={{ fontSize: 15 }}>「うちの子の今日」を毎日表示する</strong>
        </div>
        <p style={{ fontSize: 12.5, color: '#8a7d6e', margin: '0 0 12px' }}>
          お住まいの地域とお子さんの生まれ月を選ぶと、開くたびに今日の天気×月齢に合った過ごし方を提案します。この端末にだけ保存され、会員登録は不要です。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <select
            value={draftArea}
            onChange={(e) => setDraftArea(e.target.value as AreaSlug)}
            aria-label="お住まいの都道府県"
            style={{
              padding: '9px 10px',
              borderRadius: 10,
              border: '1px solid #e7dccd',
              fontSize: 14,
              background: '#fff',
            }}
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
            style={{
              padding: '9px 10px',
              borderRadius: 10,
              border: '1px solid #e7dccd',
              fontSize: 14,
              background: '#fff',
            }}
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
            className="v2-btn-primary"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.45, padding: '9px 16px', borderRadius: 999 }}
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
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12.5,
                color: '#a09384',
                cursor: 'pointer',
              }}
            >
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
    <section style={cardStyle} aria-label="今日のうちの子">
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--v2-orange-deep)', letterSpacing: '.04em', marginBottom: 2 }}>
        {dateLabel}・うちの子の今日
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 16.5 }}>
          今日の{areaName}は {meta.emoji} {meta.label}
          {wx?.tmax != null && (
            <span style={{ fontWeight: 500, fontSize: 13.5, color: '#8a7d6e' }}>
              ・最高{wx.tmax}°C
            </span>
          )}
        </strong>
      </div>
      <p style={{ margin: '4px 0 12px', fontSize: 14, color: '#5d5246' }}>
        {ageLabel(months)}のお子さんと、今日はどう過ごす？
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Link href={q('outside')} style={ctaStyle} onClick={() => click('outside')}>
          <V2Icon name="tree" size={15} color="var(--v2-orange-deep)" />
          外でおでかけ
        </Link>
        <Link href={q('home')} style={ctaStyle} onClick={() => click('home')}>
          <V2Icon name="house" size={15} color="var(--v2-orange-deep)" />
          おうちで遊ぶ
        </Link>
        <Link
          href={`/area/${settings.area}`}
          style={ctaStyle}
          onClick={() => click('area-spots')}
        >
          <V2Icon name="pin" size={15} color="var(--v2-orange-deep)" />
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
          <div style={{ marginTop: 14, borderTop: '1px dashed #efe5d6', paddingTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8a7d6e', marginBottom: 6 }}>
              {ageLabel(months)}の今月のヒント
            </div>
            {picks.map((p) => (
              <Link
                key={p.slug}
                href={`/article/${p.slug}`}
                onClick={() => click('age-pick')}
                style={{
                  display: 'block',
                  fontSize: 13.5,
                  color: '#7a4a12',
                  padding: '5px 0',
                  textDecoration: 'none',
                }}
              >
                ・{p.title}
              </Link>
            ))}
          </div>
        );
      })()}
      <div style={{ marginTop: 10, textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 12,
            color: '#a09384',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          地域・生まれ月を変更
        </button>
      </div>
    </section>
  );
}
