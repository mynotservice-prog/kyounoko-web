'use client';

import React from 'react';
import { eventHeroImage, type EventEntry } from '@/lib/events';
import type { EventOverride, EventOverridesMap } from '@/lib/event-overrides';

const CATEGORIES = [
  'matsuri', 'illumination', 'workshop', 'rinyushoku', 'rhythm',
  'reading', 'sport', 'seasonal', 'market', 'show', 'other',
];

const KK_PRESETS = Array.from({ length: 45 }, (_, i) => `/v2/articles/kk-${String(i + 1).padStart(2, '0')}.webp`);
const D_PRESETS = [
  '/v2/events/show-character-v2.webp',
  '/v2/events/show-museum.webp',
  '/v2/events/workshop-craft.webp',
  '/v2/events/market-outdoor.webp',
  '/v2/events/rhythmic-class.webp',
  '/v2/events/seasonal-summer-v2.webp',
  '/v2/events/seasonal-winter.webp',
];
const HERO_PRESETS = [...D_PRESETS, ...KK_PRESETS];

type FieldKey = keyof EventOverride;

const FIELD_LABELS: Record<FieldKey, string> = {
  title: 'タイトル',
  lede: '概要',
  category: 'カテゴリ',
  startDate: '開始日',
  endDate: '終了日',
  venue: '会場',
  area: 'エリア slug',
  city: '市区町村',
  ageLabel: '対象年齢',
  price: '料金',
  officialUrl: '公式URL',
  hero: '画像URL',
  tags: 'タグ（カンマ区切り）',
  note: '編集部メモ',
};

export function EventsEditClient({
  events,
  overrides,
}: {
  events: EventEntry[];
  overrides: EventOverridesMap;
}) {
  const [q, setQ] = React.useState('');
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);

  const filtered = events.filter((e) => {
    if (!q) return true;
    const nq = q.toLowerCase();
    return (
      e.slug.toLowerCase().includes(nq) ||
      e.title.toLowerCase().includes(nq) ||
      e.venue.toLowerCase().includes(nq) ||
      e.category.toLowerCase().includes(nq) ||
      (e.city ?? '').toLowerCase().includes(nq)
    );
  });

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="タイトル / slug / 会場 / カテゴリ / 市区町村 で絞り込み"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            height: 38,
            padding: '0 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            color: 'var(--ink-700)',
            background: 'var(--bg-surface)',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 6 }}>
          {filtered.length} / {events.length} 件 · 編集済 {Object.keys(overrides).length} 件
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((e) => (
          <EventRow
            key={e.slug}
            ev={e}
            override={overrides[e.slug] ?? {}}
            isOpen={openSlug === e.slug}
            onToggle={() => setOpenSlug(openSlug === e.slug ? null : e.slug)}
          />
        ))}
      </div>
    </>
  );
}

function EventRow({
  ev,
  override,
  isOpen,
  onToggle,
}: {
  ev: EventEntry;
  override: EventOverride;
  isOpen: boolean;
  onToggle: () => void;
}) {
  // 編集中のフォーム値（slug ごとに保持）
  const [form, setForm] = React.useState<Record<string, string>>(() => ({
    title: override.title ?? '',
    lede: override.lede ?? '',
    category: override.category ?? '',
    startDate: override.startDate ?? '',
    endDate: override.endDate ?? '',
    venue: override.venue ?? '',
    area: override.area ?? '',
    city: override.city ?? '',
    ageLabel: override.ageLabel ?? '',
    price: override.price ?? '',
    officialUrl: override.officialUrl ?? '',
    hero: override.hero ?? '',
    tags: (override.tags ?? []).join(', '),
    note: override.note ?? '',
  }));
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const hasOverride = Object.keys(override).length > 0;

  const save = async () => {
    setSaving(true);
    setMsg('');
    // 空文字は「上書き解除」 → patch から削除（API 側で element-wise に処理）
    const patch: Record<string, unknown> = {};
    for (const k of Object.keys(form)) {
      patch[k] = form[k];
    }
    try {
      const res = await fetch('/api/admin/event-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: ev.slug, patch }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
      if (!res.ok || !data.ok) {
        setMsg(`❌ ${data.error || 'failed'}`);
      } else {
        setMsg(
          data.mode === 'github'
            ? '✅ commit 完了。Vercel が自動デプロイ中（数分で本番反映）'
            : '✅ ローカル保存',
        );
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setSaving(false);
    }
  };

  // form.hero（編集中）> eventHeroImage(ev)（override/シーン/KK プールで解決） > 既定 の順。
  // 単に ev.hero を出すと旧 /hero-ai/cat-*.webp（イラスト・存在しないファイル多数）が
  // 出てしまうため、サイト側と同じ解決ロジックを必ず通す。
  const resolvedHero = eventHeroImage(ev);
  const previewHero = form.hero || resolvedHero || '/v2/events/show-museum.webp';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: hasOverride ? '3px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
      }}
    >
      {/* ヘッダー行（折りたたみ） */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 90,
            height: 60,
            borderRadius: 'var(--r-sm)',
            overflow: 'hidden',
            background: 'var(--bg-subtle)',
            flex: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewHero}
            alt={ev.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0.3';
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 2 }}>
            {ev.title}
            {hasOverride && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                background: 'var(--accent-tint)', color: 'var(--accent)', fontWeight: 700,
              }}>編集済</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
            {ev.slug} · {ev.category} · {ev.startDate}〜{ev.endDate}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-400)', flex: 'none' }}>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {/* 展開：編集フォーム */}
      {isOpen && (
        <div
          style={{
            padding: '0 16px 18px',
            borderTop: '1px solid var(--border-divider)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 10,
            paddingTop: 14,
          }}
        >
          {(Object.keys(FIELD_LABELS) as FieldKey[]).map((k) => {
            const isTextarea = k === 'lede' || k === 'note';
            const isCategory = k === 'category';
            const isDate = k === 'startDate' || k === 'endDate';
            const isHero = k === 'hero';
            // 元の値（ハードコード）を placeholder に表示
            const original = (ev as Record<string, unknown>)[k];
            const originalStr = Array.isArray(original) ? original.join(', ') : (original ?? '');

            return (
              <label
                key={k}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  gridColumn: isTextarea ? '1 / -1' : 'auto',
                }}
              >
                <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 7 }}>
                  {FIELD_LABELS[k]}
                </span>
                {isTextarea ? (
                  <textarea
                    value={form[k]}
                    onChange={(ev2) => setForm((s) => ({ ...s, [k]: ev2.target.value }))}
                    placeholder={String(originalStr)}
                    rows={2}
                    style={{
                      padding: '11px 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      color: 'var(--ink-700)',
                      background: 'var(--bg-surface)',
                      resize: 'vertical',
                    }}
                  />
                ) : isCategory ? (
                  <select
                    value={form[k]}
                    onChange={(ev2) => setForm((s) => ({ ...s, [k]: ev2.target.value }))}
                    style={{
                      height: 38,
                      padding: '0 12px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontSize: 13,
                      color: 'var(--ink-700)',
                      background: 'var(--bg-surface)',
                    }}
                  >
                    <option value="">（元の値: {String(originalStr)}）</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type={isDate ? 'date' : 'text'}
                      value={form[k]}
                      onChange={(ev2) => setForm((s) => ({ ...s, [k]: ev2.target.value }))}
                      placeholder={String(originalStr)}
                      list={isHero ? `hero-presets-${ev.slug}` : undefined}
                      style={{
                        height: 38,
                        padding: '0 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--r-md)',
                        fontSize: 13,
                        fontFamily: isHero ? 'var(--font-mono)' : undefined,
                        color: 'var(--ink-700)',
                        background: 'var(--bg-surface)',
                      }}
                    />
                    {isHero && (
                      <datalist id={`hero-presets-${ev.slug}`}>
                        {HERO_PRESETS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    )}
                  </>
                )}
              </label>
            );
          })}

          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--r-md)',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '保存中…' : '保存'}
            </button>
            <a
              href={`/event/${ev.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--accent)' }}
            >
              本番ページを確認 ↗
            </a>
            {msg && (
              <span style={{ fontSize: 11, color: 'var(--ink-600)' }}>{msg}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
