'use client';

import React from 'react';
import { AREAS } from '@/lib/area';

const AREA_OPTIONS = [{ slug: 'all', name: 'すべて（エリア非依存）' }, ...AREAS.filter((a) => a.slug !== 'all')];
const AGE_OPTS = [
  { v: '0-1', label: '0〜1歳' },
  { v: '2-3', label: '2〜3歳' },
  { v: '4-6', label: '4〜6歳' },
];
const WEATHER_OPTS = [
  { v: 'any', label: '天気問わず' },
  { v: 'rain', label: '雨' },
  { v: 'heat', label: '猛暑' },
  { v: 'cold', label: '寒い' },
  { v: 'sunny', label: '晴れ' },
];
const PLACE_OPTS = [
  { v: 'home', label: '家で' },
  { v: 'indoor', label: '屋内' },
  { v: 'outdoor', label: '外' },
];
const DAY_OPTS = [
  { v: 'any', label: '問わず' },
  { v: 'weekday', label: '平日' },
  { v: 'holiday', label: '休日' },
];
const BUDGET_OPTS = [
  { v: 'free', label: '無料' },
  { v: 'low', label: '〜2,000円' },
  { v: 'mid', label: '〜5,000円' },
  { v: 'high', label: '5,000円〜' },
];
const MEALTIME_OPTS = [
  { v: 'breakfast', label: '朝食' },
  { v: 'lunch', label: '昼食' },
  { v: 'dinner', label: '夕食' },
  { v: 'snack', label: 'おやつ' },
];

function Chips({ opts, value, onToggle }: { opts: { v: string; label: string }[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {opts.map((o) => {
        const on = value.includes(o.v);
        return (
          <button key={o.v} type="button" onClick={() => onToggle(o.v)}
            style={{
              padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              border: on ? '1px solid var(--accent-border, var(--accent))' : '1px solid var(--border-strong)',
              background: on ? 'var(--accent-tint)' : 'var(--bg-surface)',
              color: on ? 'var(--accent)' : 'var(--ink-500)',
            }}>
            {on ? '✓ ' : ''}{o.label}
          </button>
        );
      })}
    </div>
  );
}

const BODY_TEMPLATE = `## 何をする？

（1〜2文で具体的に。持ち物・手順が浮かぶように）

## 進め方（タイムライン）

1.
2.
3.

## 必要なもの

-
-

## つまずいたら

-
`;

export function NewPlanClient() {
  const [f, setF] = React.useState({
    id: '', title: '', shortAnswer: '', kind: 'activity',
    durationMin: '30', budget: 'low', area: 'all', day: 'any',
    seoRelated: '', hero: '', body: BODY_TEMPLATE,
  });
  const [ageRanges, setAgeRanges] = React.useState<string[]>(['2-3']);
  const [weather, setWeather] = React.useState<string[]>(['any']);
  const [place, setPlace] = React.useState<string[]>(['home']);
  const [mealTime, setMealTime] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [doneId, setDoneId] = React.useState('');

  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const tog = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  const create = async () => {
    setSaving(true);
    setMsg('');
    setDoneId('');
    const frontmatter: Record<string, unknown> = {
      id: f.id,
      title: f.title,
      shortAnswer: f.shortAnswer,
      ageRanges,
      weather: weather.length ? weather : ['any'],
      place,
      day: [f.day],
      durationMin: Number(f.durationMin) || 30,
      budget: f.budget,
      area: f.area,
      kind: f.kind,
    };
    if (f.kind === 'meal' && mealTime.length) frontmatter.mealTime = mealTime;
    if (f.seoRelated.trim()) frontmatter.seoRelated = f.seoRelated.trim();
    if (f.hero.trim()) frontmatter.hero = f.hero.trim();
    try {
      const res = await fetch('/api/admin/edit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'plan', slug: f.id, frontmatter, body: f.body }),
      });
      const d = (await res.json()) as { ok?: boolean; error?: string; deployed?: string; source?: string };
      if (!res.ok || !d.ok) {
        setMsg('❌ ' + (d.error || 'failed'));
      } else {
        setDoneId(f.id);
        setMsg('✅ ' + (d.deployed || `作成しました（${d.source}）`));
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = /^[a-z0-9_-]+$/.test(f.id) && f.title.trim() && f.shortAnswer.trim() && !saving;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="id / slug（英小文字・数字・ハイフン。必須。例: p-home-rain-2-3-15m-free-01）">
          <input value={f.id} onChange={(e) => set('id', e.target.value)} placeholder="p-home-rain-2-3-15m-free-01" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </Field>
        <Field label="プラン名（必須）">
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="例: 紙コップ10個で15分集中あそび" style={inputStyle} />
        </Field>
        <Field label="shortAnswer（1文の要約・必須）">
          <input value={f.shortAnswer} onChange={(e) => set('shortAnswer', e.target.value)} placeholder="例: 家にある紙コップ10個で、積む→崩すを15分" style={inputStyle} />
        </Field>
        <div style={grid2}>
          <Field label="種別">
            <select value={f.kind} onChange={(e) => set('kind', e.target.value)} style={inputStyle}>
              <option value="activity">あそび・おでかけ</option>
              <option value="meal">食事</option>
            </select>
          </Field>
          <Field label="エリア">
            <select value={f.area} onChange={(e) => set('area', e.target.value)} style={inputStyle}>
              {AREA_OPTIONS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="対象年齢（複数可）"><Chips opts={AGE_OPTS} value={ageRanges} onToggle={tog(setAgeRanges)} /></Field>
        <Field label="天気（複数可）"><Chips opts={WEATHER_OPTS} value={weather} onToggle={tog(setWeather)} /></Field>
        <Field label="場所（複数可）"><Chips opts={PLACE_OPTS} value={place} onToggle={tog(setPlace)} /></Field>
        {f.kind === 'meal' && (
          <Field label="食事の時間帯（複数可）"><Chips opts={MEALTIME_OPTS} value={mealTime} onToggle={tog(setMealTime)} /></Field>
        )}
        <div style={grid3}>
          <Field label="曜日">
            <select value={f.day} onChange={(e) => set('day', e.target.value)} style={inputStyle}>
              {DAY_OPTS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="所要時間(分)">
            <input value={f.durationMin} onChange={(e) => set('durationMin', e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
          </Field>
          <Field label="予算">
            <select value={f.budget} onChange={(e) => set('budget', e.target.value)} style={inputStyle}>
              {BUDGET_OPTS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <div style={grid2}>
          <Field label="関連記事slug（任意）">
            <input value={f.seoRelated} onChange={(e) => set('seoRelated', e.target.value)} placeholder="chiiku-asobi-ie-de-10" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
          </Field>
          <Field label="hero画像（任意）">
            <input value={f.hero} onChange={(e) => set('hero', e.target.value)} placeholder="/img/... または https://…" style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          </Field>
        </div>
        <Field label="本文（Markdown）">
          <textarea value={f.body} onChange={(e) => set('body', e.target.value)} rows={12} style={{ ...textareaStyle, fontFamily: 'var(--font-mono)', fontSize: 12.5 }} />
        </Field>

        <button type="button" onClick={create} disabled={!canSubmit}
          style={{
            marginTop: 6, padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--r-md)', fontSize: 13.5, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5,
          }}>
          {saving ? '作成中…' : '新規プランを作成'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2 }}>{msg}</div>}
        {doneId && (
          <div style={{ fontSize: 12.5, marginTop: 2 }}>
            <a href={`/admin/plans/${doneId}/edit`} style={{ color: 'var(--accent)' }}>作成したプランを編集 ↗</a>
            {'　'}
            <a href={`/plan/${doneId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>公開ページ /plan/{doneId} ↗</a>
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.6 }}>
          作成すると <code style={{ fontFamily: 'var(--font-mono)' }}>content/plans/{f.id || 'your-plan-id'}.md</code> をGitHubにcommitします（Vercel自動デプロイで反映）。
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18, maxWidth: 760,
};
const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 38, padding: '0 12px', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-700)', fontFamily: 'inherit', background: 'var(--bg-surface)',
};
const textareaStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-md)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-700)', fontFamily: 'inherit',
  background: 'var(--bg-surface)', resize: 'vertical',
};
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 };
