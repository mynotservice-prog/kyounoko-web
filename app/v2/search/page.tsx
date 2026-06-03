'use client';

import React from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { FEATURES, RECENT_CONDITIONS, SPOTS } from '../_data';

type Cond = { id: string; t: string; icon: 'baby' | 'umbrella' | 'pin'; tag?: string; area?: string };

export default function V2SearchPage() {
  const [conds, setConds] = React.useState<Cond[]>([
    { id: 'age', t: '1〜3歳', icon: 'baby' },
    { id: 'weather', t: '雨の日', icon: 'umbrella', tag: '雨OK' },
    { id: 'area', t: '豊島区', icon: 'pin', area: '豊島区' },
  ]);
  const [sort, setSort] = React.useState('人気順');
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [extra, setExtra] = React.useState<{ cat?: string }>({});
  const [shown, setShown] = React.useState(4);

  let results = SPOTS.filter((s) => {
    for (const c of conds) {
      if (c.area && s.area !== c.area) return false;
      if (c.tag && !s.tags.some((t) => t.t.includes(c.tag!.replace('OK', '')))) return false;
    }
    if (extra.cat && s.cat !== extra.cat) return false;
    return true;
  });
  if (sort === '新着順') results = [...results].reverse();

  const empty = results.length === 0;

  const removeCond = (id: string) =>
    setConds((cs) => cs.filter((c) => c.id !== id));

  return (
    <V2Frame header="sub" active="search">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: 'var(--v2-orange)' }}>{results.length}</span> 件見つかりました
        </div>
      </div>

      {/* condition chips */}
      <div className="v2-cond-bar">
        <div className="v2-cond-chips">
          {conds.map((c) => (
            <span key={c.id} className="v2-cond-chip">
              <V2Icon name={c.icon} size={14} color="var(--v2-orange)" />
              {c.t}
              <button
                type="button"
                className="v2-cond-x"
                onClick={() => removeCond(c.id)}
              >
                <V2Icon name="plus" size={13} color="#bbb" />
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          className="v2-cond-edit"
          onClick={() => setFilterOpen(true)}
        >
          条件を変更 <V2Icon name="edit" size={14} />
        </button>
      </div>

      {/* filter/sort */}
      <div className="v2-fs-bar">
        <button
          type="button"
          className="v2-fs-btn"
          onClick={() => setFilterOpen(true)}
        >
          <V2Icon name="sliders" size={18} />
          フィルター
        </button>
        <div className="v2-fs-div"></div>
        <button
          type="button"
          className="v2-fs-btn"
          onClick={() => setSortOpen((o) => !o)}
        >
          <V2Icon name="sort" size={18} />
          {sort} <V2Icon name="chevron-down" size={14} />
        </button>
        {sortOpen && (
          <div className="v2-sort-pop">
            {['人気順', '新着順', 'おすすめ順'].map((o) => (
              <button
                key={o}
                type="button"
                className={'v2-sort-opt' + (o === sort ? ' on' : '')}
                onClick={() => {
                  setSort(o);
                  setSortOpen(false);
                }}
              >
                {o}
                {o === sort && (
                  <V2Icon name="arrow-right" size={14} color="var(--v2-orange)" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {!empty && (
        <div className="v2-recent-box">
          <div className="v2-recent-head">
            <V2Icon name="clock" size={16} color="var(--v2-c-free)" /> 最近使った条件から探す
            <V2Icon
              name="chevron-right"
              size={18}
              color="#c9b9a8"
              style={{ marginLeft: 'auto' }}
            />
          </div>
          <div className="v2-recent-chips">
            {RECENT_CONDITIONS.map((r, i) => (
              <span key={i} className="v2-recent-chip">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {empty ? (
        <V2EmptyState
          onReset={() => {
            setExtra({});
            setConds([{ id: 'area', t: '豊島区', icon: 'pin', area: '豊島区' }]);
          }}
        />
      ) : (
        <>
          <div className="v2-sec-head" style={{ marginTop: 18 }}>
            <div className="v2-sec-title">
              <span className="v2-bar-accent"></span>スポット一覧
            </div>
          </div>
          <div className="v2-vlist">
            {results.slice(0, shown).map((s, i) => (
              <V2SpotRow key={s.id} spot={s} rank={i + 1} />
            ))}
          </div>
          {shown < results.length && (
            <div className="v2-section" style={{ marginTop: 14 }}>
              <button
                type="button"
                className="v2-more-btn"
                onClick={() => setShown(results.length)}
              >
                もっと見る <V2Icon name="chevron-down" size={16} />
              </button>
            </div>
          )}

          <V2SectionHead title="関連特集" more="" />
          <div className="v2-hscroll">
            {FEATURES.map((f) => (
              <Link
                key={f.id}
                href={`/v2/feature/${f.id}`}
                className="v2-feat-overlay"
              >
                <V2Img src={f.img} seed={f.id + 'o'} alt={f.title} />
                <div className="v2-feat-overlay-grad"></div>
                <div className="v2-feat-overlay-title">
                  {f.lead}
                  <br />
                  {f.short}
                </div>
              </Link>
            ))}
          </div>

          <div className="v2-pager">
            <button type="button" className="v2-pager-btn">
              <V2Icon name="chevron-left" size={16} />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={'v2-pager-num' + (n === 1 ? ' on' : '')}
              >
                {n}
              </button>
            ))}
            <span style={{ color: 'var(--v2-ink-mute)' }}>…</span>
            <button type="button" className="v2-pager-btn">
              <V2Icon name="chevron-right" size={16} />
            </button>
          </div>
        </>
      )}

      {filterOpen && (
        <V2Sheet title="絞り込み" onClose={() => setFilterOpen(false)}>
          <V2FilterGroup
            label="カテゴリ"
            options={['水族館', '室内あそび場', '公園', '体験施設', '図書館']}
            value={extra.cat ?? null}
            onPick={(v) =>
              setExtra((e) => ({ ...e, cat: e.cat === v ? undefined : v }))
            }
          />
          <V2FilterGroup label="天気" options={['雨の日', '晴れの日', '室内']} value={null} onPick={() => {}} />
          <V2FilterGroup label="年齢" options={['0〜1歳', '1〜3歳', '4〜6歳']} value={'1〜3歳'} onPick={() => {}} />
          <button
            type="button"
            className="v2-btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => {
              setFilterOpen(false);
              setShown(4);
            }}
          >
            この条件で探す
          </button>
        </V2Sheet>
      )}
    </V2Frame>
  );
}

function V2EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="v2-empty-state">
      <div className="v2-empty-ill">
        <V2Icon name="search" size={40} color="#e9c9ac" />
      </div>
      <div className="v2-empty-title">
        条件に合うスポットが
        <br />
        見つかりませんでした
      </div>
      <div className="v2-empty-sub">
        条件をへらすと、見つかりやすくなります。
        <br />
        別のエリアや天気でもおためしください。
      </div>
      <button
        type="button"
        className="v2-btn-primary"
        style={{ maxWidth: 260, marginTop: 18 }}
        onClick={onReset}
      >
        条件をへらして探す
      </button>
    </div>
  );
}

function V2FilterGroup({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="v2-filter-group">
      <div className="v2-filter-label">{label}</div>
      <div className="v2-filter-opts">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={'v2-filter-opt' + (o === value ? ' on' : '')}
            onClick={() => onPick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function V2Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="v2-sheet-backdrop" onClick={onClose}>
      <div className="v2-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="v2-sheet-handle"></div>
        <div className="v2-sheet-head">
          {title}
          <button
            type="button"
            onClick={onClose}
            className="v2-sheet-close"
          >
            <V2Icon name="plus" size={20} color="#999" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
