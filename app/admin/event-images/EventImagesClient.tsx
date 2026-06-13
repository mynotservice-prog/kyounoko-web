'use client';

import React from 'react';

export type EventRow = {
  slug: string;
  title: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  currentImg: string;
  override: string;
  originalHero: string;
};

/** KK pool 45枚のプリセット */
const KK_PRESETS = Array.from({ length: 45 }, (_, i) => `/v2/articles/kk-${String(i + 1).padStart(2, '0')}.webp`);

/** D系イベント画像 */
const D_PRESETS = [
  '/v2/events/show-character-v2.webp',
  '/v2/events/show-museum.webp',
  '/v2/events/workshop-craft.webp',
  '/v2/events/market-outdoor.webp',
  '/v2/events/rhythmic-class.webp',
  '/v2/events/seasonal-summer-v2.webp',
  '/v2/events/seasonal-winter.webp',
];

/** 公共施設の実写プリセット（v7, 2026-06-13） */
const FACILITY_PRESETS = [
  '/img/facilities/churaumi-aquarium.webp',
  '/img/facilities/kasai-aquarium.webp',
  '/img/facilities/kasai-park.webp',
  '/img/facilities/sunshine-aquarium.webp',
  '/img/facilities/ikebukuro-sunpark.webp',
];

/** 実写シーンプリセット（イベントカテゴリ別の代表枚） */
const SCENE_PRESETS = [
  '/img/scenes/aquarium-01.webp',
  '/img/scenes/zoo-01.webp',
  '/img/scenes/park-01.webp',
  '/img/scenes/seasonal-01.webp',
  '/img/scenes/seasonal-05.webp',
  '/img/scenes/seasonal-06.webp',
  '/img/scenes/seasonal-07.webp',
  '/img/scenes/seasonal-09.webp',
  '/img/scenes/seasonal-10.webp',
  '/img/scenes/pool-water-01.webp',
  '/img/scenes/lesson-01.webp',
  '/img/scenes/lesson-02.webp',
  '/img/scenes/lesson-04.webp',
  '/img/scenes/craft-01.webp',
  '/img/scenes/craft-02.webp',
  '/img/scenes/indoor-play-01.webp',
  '/img/scenes/book-01.webp',
  '/img/scenes/shopping-04.webp',
  '/img/scenes/outing-general-01.webp',
];

const PRESETS = [...FACILITY_PRESETS, ...SCENE_PRESETS, ...D_PRESETS, ...KK_PRESETS];

export function EventImagesClient({ rows }: { rows: EventRow[] }) {
  const [q, setQ] = React.useState('');
  // 編集中の値（slug -> 入力中の hero URL）
  const [editing, setEditing] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.slug, r.override])),
  );
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = React.useState<Record<string, string>>({});

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const nq = q.toLowerCase();
    return (
      r.slug.toLowerCase().includes(nq) ||
      r.title.toLowerCase().includes(nq) ||
      r.venue.toLowerCase().includes(nq) ||
      r.category.toLowerCase().includes(nq)
    );
  });

  const save = async (slug: string) => {
    setSaving((s) => ({ ...s, [slug]: true }));
    setSavedMsg((m) => ({ ...m, [slug]: '' }));
    try {
      const res = await fetch('/api/admin/event-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, hero: editing[slug] ?? '' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
      if (!res.ok || !data.ok) {
        setSavedMsg((m) => ({ ...m, [slug]: `❌ ${data.error || 'failed'}` }));
      } else {
        setSavedMsg((m) => ({
          ...m,
          [slug]: data.mode === 'github' ? '✅ commit → デプロイ反映待ち（数分）' : '✅ ローカル保存',
        }));
      }
    } catch (e) {
      setSavedMsg((m) => ({ ...m, [slug]: '❌ ' + (e instanceof Error ? e.message : 'error') }));
    } finally {
      setSaving((s) => ({ ...s, [slug]: false }));
    }
  };

  return (
    <>
      {/* 検索 */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="🔍 タイトル / slug / 会場 / カテゴリ で絞り込み"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            fontFamily: 'inherit',
            background: '#fff',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6 }}>
          {filtered.length} / {rows.length} 件
        </div>
      </div>

      {/* 一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((r) => {
          const previewUrl = editing[r.slug] || r.currentImg;
          return (
            <div
              key={r.slug}
              style={{
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 14,
              }}
            >
              {/* 左：プレビュー画像 */}
              <div
                style={{
                  width: 120,
                  height: 80,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#f0eae0',
                  position: 'relative',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={r.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
              </div>

              {/* 右：情報＋編集 */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={r.title}
                >
                  {r.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-mute)',
                    marginBottom: 8,
                    fontFamily: 'var(--font-inter), monospace',
                  }}
                >
                  {r.slug} · {r.category} · {r.venue}
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <input
                    type="text"
                    value={editing[r.slug] ?? ''}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, [r.slug]: e.target.value }))
                    }
                    placeholder={`（自動: ${r.currentImg}）`}
                    list={`presets-${r.slug}`}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'var(--font-inter), monospace',
                      background: '#fff',
                    }}
                  />
                  <datalist id={`presets-${r.slug}`}>
                    {PRESETS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => save(r.slug)}
                    disabled={!!saving[r.slug]}
                    style={{
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--ink)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: saving[r.slug] ? 'wait' : 'pointer',
                      opacity: saving[r.slug] ? 0.6 : 1,
                    }}
                  >
                    {saving[r.slug] ? '保存中…' : '保存'}
                  </button>
                </div>
                {savedMsg[r.slug] && (
                  <div style={{ fontSize: 11, color: 'var(--ink-sub)', marginTop: 2 }}>
                    {savedMsg[r.slug]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
