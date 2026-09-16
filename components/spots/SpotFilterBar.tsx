'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { KkIcon } from '@/components/kk/KkIcon';
import {
  matchesFilters,
  filtersToQuery,
  areaFilterLabel,
  AREA_TREE,
  SHUTOKEN,
  type SpotFilters,
  type FilterableSpot,
  type AreaFilter,
  type FacilityKey,
  type Budget,
  type SortKey,
} from '@/lib/spot-filter';
import { getRegionOfPrefecture } from '@/lib/area';
import type { AgeTag } from '@/lib/spots';

/**
 * /spots・/spots/[cat] の絞り込みバー（P0-3b/c）。
 * - チップをトグル → 「この条件で見る(N件)」の件数をクライアントでライブ更新。
 * - 適用でURLクエリに反映（basePath?age=...&sort=...）。共有・戻るで再現。
 * - 並び替えは即時反映（現在の適用フィルタ上で）。
 *
 * 2026-09 リニューアル: ここは「操作UI」なので丸角と面を持ってよい唯一の塊。
 * 記号（✕ など）は使わず KkIcon に置き換える（docs/renewal-2026-09.md §3-0）。
 * 見た目は app/styles/spots-v3.css（.sv3-*）と kk.css の共通部品（.kk-chip / .kk-btn）に寄せる。
 */

const AGES: { v: AgeTag; t: string }[] = [
  { v: '0-1', t: '0〜1歳' },
  { v: '2-3', t: '2〜3歳' },
  { v: '4-6', t: '4〜6歳' },
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

  /**
   * 都道府県ごとの件数（エリア以外の条件を適用した上での実数）。
   * 0件の県はチップを押せなくして「押しても何も出ない」空振りを防ぐ。
   */
  const areaCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    const woArea: SpotFilters = { ...draft, area: undefined };
    for (const s of spots) {
      if (!matchesFilters(s, woArea)) continue;
      m.set(s.area, (m.get(s.area) ?? 0) + 1);
    }
    return m;
  }, [spots, draft]);

  const go = (f: SpotFilters) => {
    const qs = filtersToQuery(f);
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  const toggleArr = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="v2-spotfilter">
      {/* バー */}
      <div className="sv3-bar">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={'sv3-filter-btn' + (activeCount > 0 ? ' on' : '')}
          aria-expanded={open}
        >
          絞り込み{activeCount > 0 ? `・${activeCount}` : ''}
          <span className="sv3-filter-caret">
            <KkIcon name="chevron-down" size={15} />
          </span>
        </button>
        <label className="sv3-sort">
          <KkIcon name="swap" size={16} />
          <select
            value={initial.sort}
            onChange={(e) => go({ ...initial, sort: e.target.value as SortKey })}
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
        <div className="sv3-applied">
          {appliedChips(initial).map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => go(c.remove(initial))}
              className="sv3-applied-chip"
              aria-label={`${c.label}の条件をはずす`}
            >
              {c.label}
              {/* 記号「✕」の代わりに線画アイコン（＋を45°回転）を使う */}
              <span className="sv3-applied-x" aria-hidden="true">
                <KkIcon name="plus" size={13} sw={2.2} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* パネル */}
      {open && (
        <div className="sv3-panel">
          <div className="sv3-group">
            <p className="sv3-group-lab">エリア</p>
            <AreaPicker
              value={draft.area}
              counts={areaCounts}
              onChange={(v) => setDraft({ ...draft, area: v })}
            />
          </div>
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

          <div className="sv3-panel-foot">
            <button
              type="button"
              onClick={() => setDraft({ ...initial, area: undefined, ages: [], place: undefined, facilities: [], price: [], reserve: undefined })}
              className="sv3-reset"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={() => {
                go(draft);
                setOpen(false);
              }}
              disabled={liveCount === 0}
              className="kk-btn sv3-apply"
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
    <div className="sv3-group">
      <p className="sv3-group-lab">{label}</p>
      <div className="kk-chips">{children}</div>
    </div>
  );
}
function Chip({
  on,
  onClick,
  children,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled}
      className={'kk-chip' + (on ? ' on' : '') + (disabled ? ' off' : '')}
    >
      {children}
    </button>
  );
}

/**
 * エリア選択（全国 → 地方 → 都道府県の2段）。
 * 47都道府県すべてを並べるとパネルが長くなりすぎるので、
 * 上段で地方ブロックを選び、その地方の県だけを下段に出す。
 * 地方チップ自体も絞り込み値（例: 関西＝2府5県すべて）として使える。
 */
function AreaPicker({
  value,
  counts,
  onChange,
}: {
  value?: AreaFilter;
  counts: Map<string, number>;
  onChange: (v: AreaFilter | undefined) => void;
}) {
  const regionOfValue = value && value !== 'shutoken' ? getRegionOfPrefecture(value) ?? value : undefined;
  const [openRegion, setOpenRegion] = React.useState<string | undefined>(regionOfValue);

  // URLから復元した値（＝適用済みフィルタ）が変わったら、開く地方も合わせる。
  React.useEffect(() => setOpenRegion(regionOfValue), [regionOfValue]);

  const regionCount = (prefs: { slug: string }[]) =>
    prefs.reduce((n, p) => n + (counts.get(p.slug) ?? 0), 0);
  const shutokenCount = SHUTOKEN.reduce((n, a) => n + (counts.get(a) ?? 0), 0);
  const current = AREA_TREE.find((r) => r.region === openRegion);

  return (
    <>
      <div className="kk-chips">
        <Chip on={!value} onClick={() => { onChange(undefined); setOpenRegion(undefined); }}>
          全国
        </Chip>
        <Chip
          on={value === 'shutoken'}
          disabled={shutokenCount === 0}
          onClick={() => { onChange(value === 'shutoken' ? undefined : 'shutoken'); setOpenRegion(undefined); }}
        >
          首都圏
        </Chip>
        {AREA_TREE.map((r) => {
          const n = regionCount(r.prefs);
          return (
            <Chip
              key={r.region}
              on={value === r.region}
              disabled={n === 0}
              onClick={() => {
                setOpenRegion(openRegion === r.region && value === r.region ? undefined : r.region);
                onChange(value === r.region ? undefined : r.region);
              }}
            >
              {r.name}
            </Chip>
          );
        })}
      </div>

      {current && (
        <div className="sv3-subgroup">
          <p className="sv3-group-sublab">{current.name}の都道府県</p>
          <div className="kk-chips">
            {current.prefs.map((p) => {
              const n = counts.get(p.slug) ?? 0;
              return (
                <Chip
                  key={p.slug}
                  on={value === p.slug}
                  disabled={n === 0}
                  onClick={() => onChange(value === p.slug ? current.region : p.slug)}
                >
                  {p.name}
                  <span className="sv3-chip-n">{n}</span>
                </Chip>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ---- applied chips (individual removal) ----
type AppliedChip = { key: string; label: string; remove: (f: SpotFilters) => SpotFilters };
function appliedChips(f: SpotFilters): AppliedChip[] {
  const out: AppliedChip[] = [];
  if (f.area) out.push({ key: 'area', label: areaFilterLabel(f.area), remove: (x) => ({ ...x, area: undefined }) });
  for (const a of f.ages) out.push({ key: `age-${a}`, label: AGES.find((x) => x.v === a)!.t, remove: (x) => ({ ...x, ages: x.ages.filter((y) => y !== a) }) });
  if (f.place) out.push({ key: 'place', label: f.place === 'indoor' ? '屋内' : '屋外', remove: (x) => ({ ...x, place: undefined }) });
  for (const fa of f.facilities) out.push({ key: `fac-${fa}`, label: FACILITIES.find((x) => x.v === fa)!.t, remove: (x) => ({ ...x, facilities: x.facilities.filter((y) => y !== fa) }) });
  for (const p of f.price) out.push({ key: `price-${p}`, label: PRICES.find((x) => x.v === p)!.t, remove: (x) => ({ ...x, price: x.price.filter((y) => y !== p) }) });
  if (f.reserve) out.push({ key: 'reserve', label: f.reserve === 'ok' ? '予約可' : '予約不要', remove: (x) => ({ ...x, reserve: undefined }) });
  return out;
}
