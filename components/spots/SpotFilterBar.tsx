'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { V2Icon } from '@/components/v2/V2Icon';
import {
  matchesFilters,
  filtersToQuery,
  type SpotFilters,
  type FilterableSpot,
  type AreaFilter,
  type FacilityKey,
  type Budget,
  type SortKey,
} from '@/lib/spot-filter';
import type { AgeTag } from '@/lib/spots';

/**
 * /spots・/spots/[cat] の絞り込みバー（P0-3b/c）。
 * - チップをトグル → 「この条件で見る(N件)」の件数をクライアントでライブ更新。
 * - 適用でURLクエリに反映（basePath?age=...&sort=...）。共有・戻るで再現。
 * - 並び替えは即時反映（現在の適用フィルタ上で）。
 */

const AGES: { v: AgeTag; t: string }[] = [
  { v: '0-1', t: '0〜1歳' },
  { v: '2-3', t: '2〜3歳' },
  { v: '4-6', t: '4〜6歳' },
];
const AREAS: { v: AreaFilter; t: string }[] = [
  { v: 'shutoken', t: '首都圏' },
  { v: 'tokyo', t: '東京' },
  { v: 'kanagawa', t: '神奈川' },
  { v: 'chiba', t: '千葉' },
  { v: 'saitama', t: '埼玉' },
];
const FACILITIES: { v: FacilityKey; t: string }[] = [
  { v: 'nursing', t: '授乳室' },
  { v: 'diaper', t: 'おむつ替え' },
  { v: 'stroller', t: 'ベビーカー貸出' },
];
const PRICES: { v: Budget; t: string }[] = [
  { v: 'free', t: '無料' },
  { v: 'low', t: '〜1,000円' },
  { v: 'mid', t: '〜3,000円' },
  { v: 'high', t: '3,000円〜' },
];
const SORTS: { v: SortKey; t: string }[] = [
  { v: 'popular', t: 'おすすめ順' },
  { v: 'price', t: '料金が安い順' },
  { v: 'name', t: '名前順' },
];

function countActive(f: SpotFilters): number {
  return (
    (f.area ? 1 : 0) +
    f.ages.length +
    (f.place ? 1 : 0) +
    f.facilities.length +
    f.price.length +
    (f.reserve ? 1 : 0)
  );
}

export function SpotFilterBar({
  spots,
  initial,
  basePath,
}: {
  /** 件数ライブ更新の対象スコープ（カテゴリページはそのカテゴリのみ） */
  spots: FilterableSpot[];
  initial: SpotFilters;
  basePath: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SpotFilters>(initial);

  React.useEffect(() => setDraft(initial), [initial]);

  const liveCount = React.useMemo(
    () => spots.reduce((n, s) => (matchesFilters(s, draft) ? n + 1 : n), 0),
    [spots, draft],
  );
  const activeCount = countActive(initial);

  const go = (f: SpotFilters) => {
    const qs = filtersToQuery(f);
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  const toggleArr = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="v2-spotfilter">
      {/* バー */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={barBtn(activeCount > 0)}
          aria-expanded={open}
        >
          <V2Icon name="sliders" size={15} />
          絞り込み{activeCount > 0 ? `・${activeCount}` : ''}
        </button>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <V2Icon name="sort" size={15} color="var(--v2-ink-mute)" />
          <select
            value={initial.sort}
            onChange={(e) => go({ ...initial, sort: e.target.value as SortKey })}
            style={{
              border: '1px solid var(--v2-line)',
              borderRadius: 9,
              padding: '7px 8px',
              fontSize: 13,
              fontWeight: 700,
              background: 'var(--v2-card, #fff)',
              color: 'var(--v2-ink)',
            }}
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 適用中チップ（個別解除） */}
      {activeCount > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {appliedChips(initial).map((c) => (
            <button key={c.key} type="button" onClick={() => go(c.remove(initial))} style={activeChip}>
              {c.label} <span aria-hidden>✕</span>
            </button>
          ))}
        </div>
      )}

      {/* パネル */}
      {open && (
        <div style={panel}>
          <Group label="エリア">
            {AREAS.map((a) => (
              <Chip key={a.v} on={draft.area === a.v} onClick={() => setDraft({ ...draft, area: draft.area === a.v ? undefined : a.v })}>
                {a.t}
              </Chip>
            ))}
          </Group>
          <Group label="年齢">
            {AGES.map((a) => (
              <Chip key={a.v} on={draft.ages.includes(a.v)} onClick={() => setDraft({ ...draft, ages: toggleArr(draft.ages, a.v) })}>
                {a.t}
              </Chip>
            ))}
          </Group>
          <Group label="環境">
            <Chip on={draft.place === 'indoor'} onClick={() => setDraft({ ...draft, place: draft.place === 'indoor' ? undefined : 'indoor' })}>
              屋内
            </Chip>
            <Chip on={draft.place === 'outdoor'} onClick={() => setDraft({ ...draft, place: draft.place === 'outdoor' ? undefined : 'outdoor' })}>
              屋外
            </Chip>
          </Group>
          <Group label="設備">
            {FACILITIES.map((f) => (
              <Chip key={f.v} on={draft.facilities.includes(f.v)} onClick={() => setDraft({ ...draft, facilities: toggleArr(draft.facilities, f.v) })}>
                {f.t}
              </Chip>
            ))}
          </Group>
          <Group label="料金">
            {PRICES.map((p) => (
              <Chip key={p.v} on={draft.price.includes(p.v)} onClick={() => setDraft({ ...draft, price: toggleArr(draft.price, p.v) })}>
                {p.t}
              </Chip>
            ))}
          </Group>
          <Group label="予約">
            <Chip on={draft.reserve === 'ok'} onClick={() => setDraft({ ...draft, reserve: draft.reserve === 'ok' ? undefined : 'ok' })}>
              予約可
            </Chip>
            <Chip on={draft.reserve === 'none'} onClick={() => setDraft({ ...draft, reserve: draft.reserve === 'none' ? undefined : 'none' })}>
              予約不要
            </Chip>
          </Group>

          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button type="button" onClick={() => setDraft({ ...initial, area: undefined, ages: [], place: undefined, facilities: [], price: [], reserve: undefined })} style={resetBtn}>
              リセット
            </button>
            <button
              type="button"
              onClick={() => {
                go(draft);
                setOpen(false);
              }}
              disabled={liveCount === 0}
              style={applyBtn(liveCount === 0)}
            >
              この条件で見る（{liveCount}件）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--v2-ink-mute)', margin: '0 0 6px' }}>{label}</p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} style={chip(on)}>
      {children}
    </button>
  );
}

// ---- applied chips (individual removal) ----
type AppliedChip = { key: string; label: string; remove: (f: SpotFilters) => SpotFilters };
function appliedChips(f: SpotFilters): AppliedChip[] {
  const out: AppliedChip[] = [];
  if (f.area) out.push({ key: 'area', label: AREAS.find((a) => a.v === f.area)!.t, remove: (x) => ({ ...x, area: undefined }) });
  for (const a of f.ages) out.push({ key: `age-${a}`, label: AGES.find((x) => x.v === a)!.t, remove: (x) => ({ ...x, ages: x.ages.filter((y) => y !== a) }) });
  if (f.place) out.push({ key: 'place', label: f.place === 'indoor' ? '屋内' : '屋外', remove: (x) => ({ ...x, place: undefined }) });
  for (const fa of f.facilities) out.push({ key: `fac-${fa}`, label: FACILITIES.find((x) => x.v === fa)!.t, remove: (x) => ({ ...x, facilities: x.facilities.filter((y) => y !== fa) }) });
  for (const p of f.price) out.push({ key: `price-${p}`, label: PRICES.find((x) => x.v === p)!.t, remove: (x) => ({ ...x, price: x.price.filter((y) => y !== p) }) });
  if (f.reserve) out.push({ key: 'reserve', label: f.reserve === 'ok' ? '予約可' : '予約不要', remove: (x) => ({ ...x, reserve: undefined }) });
  return out;
}

// ---- styles ----
function barBtn(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 999,
    border: '1px solid ' + (active ? 'var(--v2-orange)' : 'var(--v2-line)'),
    background: active ? 'var(--v2-orange-tint, #fff2e8)' : 'var(--v2-card, #fff)',
    color: active ? 'var(--v2-orange-deep, #c05a1e)' : 'var(--v2-ink)',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
const activeChip: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid var(--v2-orange)',
  background: 'var(--v2-orange-tint, #fff2e8)',
  color: 'var(--v2-orange-deep, #c05a1e)',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
};
const panel: React.CSSProperties = {
  marginTop: 10,
  padding: 14,
  borderRadius: 14,
  border: '1px solid var(--v2-line)',
  background: 'var(--v2-card, #fff)',
};
function chip(on: boolean): React.CSSProperties {
  return {
    padding: '7px 12px',
    borderRadius: 999,
    border: '1px solid ' + (on ? 'var(--v2-orange)' : 'var(--v2-line)'),
    background: on ? 'var(--v2-orange-tint, #fff2e8)' : 'var(--v2-bg, #faf6ef)',
    color: on ? 'var(--v2-orange-deep, #c05a1e)' : 'var(--v2-ink)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
const resetBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid var(--v2-line)',
  background: 'transparent',
  color: 'var(--v2-ink-mute)',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};
function applyBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '11px',
    borderRadius: 10,
    border: 'none',
    background: disabled ? 'var(--v2-line)' : 'var(--v2-orange)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
