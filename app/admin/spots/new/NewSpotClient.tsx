'use client';

import React from 'react';
import { AREAS } from '@/lib/area';

const AREA_OPTIONS = AREAS.filter((a) => a.slug !== 'all');
const CATEGORY_OPTIONS = [
  { v: 'park', label: '公園' },
  { v: 'indoor', label: '屋内施設' },
  { v: 'zoo', label: '動物園' },
  { v: 'aquarium', label: '水族館' },
  { v: 'museum', label: '博物館・科学館' },
  { v: 'amusement', label: '遊園地' },
  { v: 'farm', label: '牧場' },
  { v: 'seasonal', label: '観光スポット' },
  { v: 'restaurant', label: '子連れOKレストラン' },
];
const PLACE_OPTIONS = [
  { v: 'indoor', label: '屋内' },
  { v: 'outdoor', label: '屋外' },
  { v: 'mixed', label: '一部屋外' },
];
const BUDGET_OPTIONS = [
  { v: '', label: '（未設定）' },
  { v: 'free', label: '無料' },
  { v: 'low', label: '〜1,000円' },
  { v: 'mid', label: '1,000〜3,000円' },
  { v: 'high', label: '3,000円〜' },
];
const RESERVATION_OPTIONS = [
  { v: '', label: '（未設定）' },
  { v: 'none', label: '予約不要' },
  { v: 'recommended', label: '予約推奨' },
  { v: 'required', label: '要予約' },
];
const AGE_TAGS: { v: string; label: string }[] = [
  { v: '0-1', label: '0〜1歳' },
  { v: '2-3', label: '2〜3歳' },
  { v: '4-6', label: '4〜6歳' },
];

export function NewSpotClient() {
  const [f, setF] = React.useState({
    name: '', area: 'tokyo', category: 'park', place: 'outdoor',
    city: '', ward: '', note: '', budget: '', reservation: '',
    nearestStation: '', walkMinutes: '', officialUrl: '', image: '',
  });
  const [ages, setAges] = React.useState<string[]>(['2-3']);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [doneUrl, setDoneUrl] = React.useState('');

  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const toggleAge = (v: string) =>
    setAges((cur) => (cur.includes(v) ? cur.filter((t) => t !== v) : [...cur, v]));

  const uploadImage = async (file: File) => {
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('slug', 'newspot');
      fd.append('dir', 'spots');
      fd.append('file', file);
      const res = await fetch('/api/admin/spot-image', { method: 'POST', body: fd });
      const d = (await res.json()) as { ok?: boolean; path?: string; error?: string };
      if (!res.ok || !d.path) setMsg('❌ 画像アップロード失敗: ' + (d.error || 'failed'));
      else { set('image', d.path); setMsg('✅ 画像をアップロードしました'); }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setUploading(false);
    }
  };

  const create = async () => {
    setSaving(true);
    setMsg('');
    setDoneUrl('');
    try {
      const res = await fetch('/api/admin/spot-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: f.area,
          name: f.name,
          category: f.category,
          place: f.place,
          ages,
          city: f.city,
          ward: f.ward,
          note: f.note,
          budget: f.budget,
          reservation: f.reservation,
          nearestStation: f.nearestStation,
          walkMinutes: f.walkMinutes ? Number(f.walkMinutes) : undefined,
          officialUrl: f.officialUrl,
          image: f.image,
        }),
      });
      const d = (await res.json()) as { ok?: boolean; error?: string; url?: string; mode?: string };
      if (!res.ok || !d.ok) {
        setMsg('❌ ' + (d.error || 'failed'));
      } else {
        setDoneUrl(d.url || '');
        setMsg(
          d.mode === 'github'
            ? '✅ 作成しGitHubにcommit。Vercelが自動デプロイ中（数分で本番反映）'
            : '✅ ローカルに作成しました（git push で反映）',
        );
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = f.name.trim() && ages.length > 0 && !saving;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="施設名（必須）">
          <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="例: ○○中央公園" style={inputStyle} />
        </Field>
        <div style={grid3}>
          <Field label="エリア（都道府県・必須）">
            <select value={f.area} onChange={(e) => set('area', e.target.value)} style={inputStyle}>
              {AREA_OPTIONS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="カテゴリ">
            <select value={f.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
              {CATEGORY_OPTIONS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="屋内 / 屋外">
            <select value={f.place} onChange={(e) => set('place', e.target.value)} style={inputStyle}>
              {PLACE_OPTIONS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="対象年齢（1つ以上・必須）">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {AGE_TAGS.map((t) => {
              const on = ages.includes(t.v);
              return (
                <button key={t.v} type="button" onClick={() => toggleAge(t.v)}
                  style={{
                    padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    border: on ? '1px solid var(--accent-border, var(--accent))' : '1px solid var(--border-strong)',
                    background: on ? 'var(--accent-tint)' : 'var(--bg-surface)',
                    color: on ? 'var(--accent)' : 'var(--ink-500)',
                  }}>
                  {on ? '✓ ' : ''}{t.label}
                </button>
              );
            })}
          </div>
        </Field>
        <div style={grid2}>
          <Field label="市区町村（任意）">
            <input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="例: 世田谷区 / 横浜市" style={inputStyle} />
          </Field>
          <Field label="区（東京23区等・任意）">
            <input value={f.ward} onChange={(e) => set('ward', e.target.value)} placeholder="例: 世田谷区" style={inputStyle} />
          </Field>
        </div>
        <Field label="一言メモ（任意・30〜50字）">
          <textarea value={f.note} onChange={(e) => set('note', e.target.value)} rows={2} placeholder="例: 大型遊具と芝生広場が自慢、雨天は屋根付き休憩所あり" style={textareaStyle} />
        </Field>
        <div style={grid3}>
          <Field label="料金目安">
            <select value={f.budget} onChange={(e) => set('budget', e.target.value)} style={inputStyle}>
              {BUDGET_OPTIONS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="予約">
            <select value={f.reservation} onChange={(e) => set('reservation', e.target.value)} style={inputStyle}>
              {RESERVATION_OPTIONS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="最寄駅から徒歩(分)">
            <input value={f.walkMinutes} onChange={(e) => set('walkMinutes', e.target.value.replace(/[^0-9]/g, ''))} placeholder="例: 8" style={inputStyle} />
          </Field>
        </div>
        <div style={grid2}>
          <Field label="最寄駅名（任意）">
            <input value={f.nearestStation} onChange={(e) => set('nearestStation', e.target.value)} placeholder="例: 二子玉川" style={inputStyle} />
          </Field>
          <Field label="公式サイトURL（任意）">
            <input value={f.officialUrl} onChange={(e) => set('officialUrl', e.target.value)} placeholder="https://…" style={inputStyle} />
          </Field>
        </div>
        <Field label="画像（任意・後からスポット編集でも設定可）">
          {f.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.image} alt="preview" style={{ display: 'block', width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8 }} />
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="/img/... または https://…（またはアップロード）" style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <label style={{ flex: '0 0 auto', height: 38, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-strong)', background: uploading ? 'var(--bg-subtle)' : 'var(--bg-surface)', fontSize: 13, fontWeight: 600, color: 'var(--ink-600)', cursor: uploading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
              {uploading ? 'アップロード中…' : '📤 画像を選ぶ'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); e.target.value = ''; }}
                style={{ display: 'none' }} />
            </label>
          </div>
        </Field>

        <button type="button" onClick={create} disabled={!canSubmit}
          style={{
            marginTop: 6, padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--r-md)', fontSize: 13.5, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5,
          }}>
          {saving ? '作成中…' : '新規スポットを作成'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2 }}>{msg}</div>}
        {doneUrl && (
          <div style={{ fontSize: 12.5, marginTop: 2 }}>
            公開URL: <a href={doneUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{doneUrl}</a>
            {'　'}
            <a href="/admin/spots/edit" style={{ color: 'var(--accent)' }}>スポット編集で詳細を追記 ↗</a>
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.6 }}>
          作成すると <code style={{ fontFamily: 'var(--font-mono)' }}>lib/spots-extra/admin-created.json</code> に追記してGitHubにcommitします（本番はデプロイ後に反映）。URL（slug）は施設名＋エリアから自動生成され、あとで名称を変えてもURLは変わりません。
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
