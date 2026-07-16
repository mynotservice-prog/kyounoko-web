'use client';

import React from 'react';
import { AREAS } from '@/lib/area';

const AREA_OPTIONS = AREAS.filter((a) => a.slug !== 'all');
const CATEGORY_OPTIONS = [
  { v: 'matsuri', label: '祭り・縁日' },
  { v: 'illumination', label: 'イルミネーション' },
  { v: 'workshop', label: 'ワークショップ' },
  { v: 'rinyushoku', label: '離乳食教室' },
  { v: 'rhythm', label: 'リトミック' },
  { v: 'reading', label: '読み聞かせ' },
  { v: 'sport', label: 'スポーツ' },
  { v: 'seasonal', label: '季節の催し' },
  { v: 'market', label: 'マルシェ' },
  { v: 'show', label: '展示・ショー' },
  { v: 'other', label: 'その他' },
];

export function NewEventClient() {
  const [f, setF] = React.useState({
    slug: '', title: '', lede: '', category: 'seasonal',
    startDate: '', endDate: '', venue: '', area: 'tokyo',
    city: '', ageLabel: '', price: '', officialUrl: '', hero: '', note: '',
    recurring: false,
  });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [doneUrl, setDoneUrl] = React.useState('');

  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const uploadHero = async (file: File) => {
    if (!f.slug) { setMsg('先に slug を入力してください（画像のファイル名に使います）'); return; }
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('slug', f.slug);
      fd.append('dir', 'articles');
      fd.append('file', file);
      const res = await fetch('/api/admin/spot-image', { method: 'POST', body: fd });
      const d = (await res.json()) as { ok?: boolean; path?: string; error?: string };
      if (!res.ok || !d.path) setMsg('❌ 画像アップロード失敗: ' + (d.error || 'failed'));
      else { set('hero', d.path); setMsg('✅ 画像をアップロードしました'); }
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
      const res = await fetch('/api/admin/event-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: f.slug, title: f.title, lede: f.lede, category: f.category,
          startDate: f.startDate, endDate: f.endDate, venue: f.venue, area: f.area,
          city: f.city, ageLabel: f.ageLabel, price: f.price, officialUrl: f.officialUrl,
          hero: f.hero, note: f.note, recurring: f.recurring ? 'annual' : undefined,
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

  const canSubmit =
    f.slug.trim() && f.title.trim() && f.lede.trim() && f.venue.trim() &&
    f.startDate && f.endDate && !saving;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="slug（URLに使う英小文字・数字・ハイフン。必須）">
          <input value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="tanabata-sunshine-2026" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
        </Field>
        <Field label="イベント名（必須）">
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="例: サンシャイン七夕まつり2026" style={inputStyle} />
        </Field>
        <Field label="説明 lede（一覧カード用・80〜120字・必須）">
          <textarea value={f.lede} onChange={(e) => set('lede', e.target.value)} rows={3} style={textareaStyle} />
        </Field>
        <div style={grid3}>
          <Field label="カテゴリ">
            <select value={f.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
              {CATEGORY_OPTIONS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="開始日（必須）">
            <input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="終了日（必須・1日なら同じ）">
            <input type="date" value={f.endDate} onChange={(e) => set('endDate', e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <Field label="会場（必須）">
          <input value={f.venue} onChange={(e) => set('venue', e.target.value)} placeholder="例: サンシャインシティ 噴水広場" style={inputStyle} />
        </Field>
        <div style={grid3}>
          <Field label="エリア（都道府県・必須）">
            <select value={f.area} onChange={(e) => set('area', e.target.value)} style={inputStyle}>
              {AREA_OPTIONS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="市区町村（任意）">
            <input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="例: 豊島区" style={inputStyle} />
          </Field>
          <Field label="対象年齢（任意）">
            <input value={f.ageLabel} onChange={(e) => set('ageLabel', e.target.value)} placeholder="例: 0〜6歳" style={inputStyle} />
          </Field>
        </div>
        <div style={grid2}>
          <Field label="料金（任意）">
            <input value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="例: 無料 / 大人500円・子ども無料" style={inputStyle} />
          </Field>
          <Field label="公式サイトURL（任意）">
            <input value={f.officialUrl} onChange={(e) => set('officialUrl', e.target.value)} placeholder="https://…" style={inputStyle} />
          </Field>
        </div>
        <Field label="編集部メモ（任意）">
          <textarea value={f.note} onChange={(e) => set('note', e.target.value)} rows={2} style={textareaStyle} />
        </Field>
        <Field label="ヒーロー画像（任意）">
          {f.hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.hero} alt="preview" style={{ display: 'block', width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8 }} />
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={f.hero} onChange={(e) => set('hero', e.target.value)} placeholder="/img/... または https://…" style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <label style={{ flex: '0 0 auto', height: 38, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-strong)', background: uploading || !f.slug ? 'var(--bg-subtle)' : 'var(--bg-surface)', fontSize: 13, fontWeight: 600, color: 'var(--ink-600)', cursor: uploading || !f.slug ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }} title={!f.slug ? '先に slug を入力してください' : undefined}>
              {uploading ? 'アップロード中…' : '📤 画像を選ぶ'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading || !f.slug}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadHero(file); e.target.value = ''; }}
                style={{ display: 'none' }} />
            </label>
          </div>
        </Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-700)', cursor: 'pointer' }}>
          <input type="checkbox" checked={f.recurring} onChange={(e) => set('recurring', e.target.checked)} />
          毎年くり返し開催される行事（会期切れでも翌年に繰り上げ再利用する）
        </label>

        <button type="button" onClick={create} disabled={!canSubmit}
          style={{
            marginTop: 6, padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--r-md)', fontSize: 13.5, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5,
          }}>
          {saving ? '作成中…' : '新規イベントを作成'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2 }}>{msg}</div>}
        {doneUrl && (
          <div style={{ fontSize: 12.5, marginTop: 2 }}>
            公開URL: <a href={doneUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{doneUrl}</a>
            {'　'}
            <a href="/admin/events/edit" style={{ color: 'var(--accent)' }}>イベント編集で追記 ↗</a>
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.6 }}>
          作成すると <code style={{ fontFamily: 'var(--font-mono)' }}>lib/events-extra.json</code> に追記してGitHubにcommitします（本番はデプロイ後に反映）。掲載は編集部が一次確認したイベントのみ。情報源は公式サイトURLを入れてください。
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
