'use client';

import * as React from 'react';
import Link from 'next/link';
import { ACTION_LABEL, ACTION_SIDE, type ActionKey, type ContentKind, type DemandRow } from '@/lib/content-demand-shared';
import { Card, Badge, Bar } from '@/components/admin/ui';

/**
 * 需要 × 優先度の対話部分。
 *
 * 画面は2段構成:
 *   上段「今週やること」 — 増やす（攻め）／守る（腐り防止）を左右に分けて置く。
 *     見込み増クリックと守るクリックは意味の違う数字なので、1つのランキングに混ぜない。
 *   下段「見られているページ」 — 種別タブ＋並び替え＋検索で全ページを眺める。
 */

const KIND_LABEL: Record<ContentKind, string> = {
  article: '記事',
  spot: 'スポット',
  station: '駅',
  event: 'イベント',
  plan: 'プラン',
  other: 'その他',
};

const ACTION_TONE: Record<ActionKey, 'ok' | 'warn' | 'neu'> = {
  title: 'warn',
  push: 'neu',
  thicken: 'warn',
  verify: 'warn',
  refresh: 'warn',
  keep: 'ok',
  none: 'neu',
};

type SortKey = 'clicks' | 'pv' | 'impressions' | 'delta' | 'score' | 'position';
const SORTS: Array<{ key: SortKey; label: string; needsGa4?: boolean }> = [
  { key: 'clicks', label: 'クリック' },
  { key: 'pv', label: 'PV', needsGa4: true },
  { key: 'impressions', label: '表示' },
  { key: 'delta', label: '伸び' },
  { key: 'score', label: '優先度' },
  { key: 'position', label: '順位' },
];

const num = (n: number) => Math.round(n).toLocaleString('en-US');
const pctOf = (n: number) => `${(n * 100).toFixed(1)}%`;

export function PriorityClient({
  rows,
  omitted,
  days,
  hasGa4,
  unmatchedPv,
  unmatchedPages,
}: {
  rows: DemandRow[];
  omitted: number;
  days: number;
  hasGa4: boolean;
  unmatchedPv: number;
  unmatchedPages: number;
}) {
  const attack = React.useMemo(
    () => rows.filter((r) => ACTION_SIDE[r.action] === 'attack').sort((a, b) => b.score - a.score),
    [rows],
  );
  const defend = React.useMemo(
    () => rows.filter((r) => ACTION_SIDE[r.action] === 'defend').sort((a, b) => b.score - a.score),
    [rows],
  );

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(430px,1fr))', gap: 14, marginBottom: 14 }}>
        <Queue
          title="増やす（攻め）"
          description={`順位の割にクリックされていない・あと一押しで上がる・中身が薄い、の3種類。数字は「手を入れたら増える見込みクリック（${days}日）」。`}
          rows={attack}
          metric={(r) => `+${num(r.score)}`}
          emptyText="いま着手すべき増やす候補はありません。"
        />
        <Queue
          title="守る（腐り防止）"
          description="需要があるのに事実確認が切れている／長期間更新していないページ。数字は「そのまま放置すると誤情報のまま届き続けるクリック数」。"
          rows={defend}
          metric={(r) => `${num(r.clicks)}clk`}
          emptyText="鮮度切れの需要ページはありません。"
        />
      </div>

      <Explorer
        rows={rows}
        omitted={omitted}
        days={days}
        hasGa4={hasGa4}
        unmatchedPv={unmatchedPv}
        unmatchedPages={unmatchedPages}
      />
    </>
  );
}

/* ── 作業キュー ────────────────────────────────────── */

function Queue({
  title,
  description,
  rows,
  metric,
  emptyText,
}: {
  title: string;
  description: string;
  rows: DemandRow[];
  metric: (r: DemandRow) => string;
  emptyText: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? rows.slice(0, 60) : rows.slice(0, 8);

  return (
    <Card
      title={`${title}　${rows.length}件`}
      description={description}
      bodyPadding={0}
      right={
        rows.length > 8 ? (
          <button type="button" onClick={() => setExpanded((v) => !v)} style={ghostBtn}>
            {expanded ? '上位8件に戻す' : `全${Math.min(rows.length, 60)}件を見る`}
          </button>
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <p style={{ padding: '18px', margin: 0, fontSize: 13, color: 'var(--ink-600)' }}>{emptyText}</p>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {shown.map((r, i) => (
            <li
              key={r.path}
              style={{
                display: 'grid',
                gridTemplateColumns: '58px 1fr',
                gap: 12,
                padding: '12px 18px',
                borderBottom: i === shown.length - 1 ? 'none' : '1px solid var(--border-faint)',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--ink-900)',
                  paddingTop: 2,
                  textAlign: 'right',
                }}
              >
                {metric(r)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                  <Badge tone={ACTION_TONE[r.action]}>{ACTION_LABEL[r.action]}</Badge>
                  <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>{KIND_LABEL[r.kind]}</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', lineHeight: 1.5 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.65, marginTop: 3 }}>{r.reason}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {r.upsideTitle > 0 && r.action !== 'title' && (
                    <span style={{ fontSize: 11, color: 'var(--warn-fg)' }}>
                      タイトル改善でも +{num(r.upsideTitle)}
                    </span>
                  )}
                  {r.editHref && (
                    <Link href={r.editHref} className="admin-hover-accent" style={miniLink}>
                      編集する
                    </Link>
                  )}
                  <a href={r.publicHref} target="_blank" rel="noreferrer" className="admin-hover-accent" style={miniLink}>
                    ページを見る
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/* ── 一覧 ─────────────────────────────────────────── */

function Explorer({
  rows,
  omitted,
  days,
  hasGa4,
  unmatchedPv,
  unmatchedPages,
}: {
  rows: DemandRow[];
  omitted: number;
  days: number;
  hasGa4: boolean;
  unmatchedPv: number;
  unmatchedPages: number;
}) {
  const [kind, setKind] = React.useState<ContentKind | 'all'>('all');
  const [action, setAction] = React.useState<ActionKey | 'all'>('all');
  const [sort, setSort] = React.useState<SortKey>('clicks');
  const [q, setQ] = React.useState('');
  const [limit, setLimit] = React.useState(60);

  const kinds = React.useMemo(() => {
    const m = new Map<ContentKind, { n: number; clicks: number }>();
    for (const r of rows) {
      const e = m.get(r.kind) ?? { n: 0, clicks: 0 };
      e.n++;
      e.clicks += r.clicks;
      m.set(r.kind, e);
    }
    return [...m.entries()].sort((a, b) => b[1].clicks - a[1].clicks);
  }, [rows]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (kind !== 'all' && r.kind !== kind) return false;
      if (action !== 'all' && r.action !== action) return false;
      if (needle && !(`${r.title} ${r.path}`.toLowerCase().includes(needle))) return false;
      return true;
    });
    const by: Record<SortKey, (a: DemandRow, b: DemandRow) => number> = {
      clicks: (a, b) => b.clicks - a.clicks,
      pv: (a, b) => (b.pageViews ?? 0) - (a.pageViews ?? 0),
      impressions: (a, b) => b.impressions - a.impressions,
      delta: (a, b) => b.deltaClicks - a.deltaClicks,
      score: (a, b) => b.score - a.score,
      position: (a, b) => a.position - b.position,
    };
    return out.sort(by[sort]);
  }, [rows, kind, action, q, sort]);

  const maxClicks = Math.max(1, ...filtered.slice(0, 1).map((r) => r.clicks));

  return (
    <Card
      title="見られているページ"
      description={`検索実績（${days}日）と、記事なら品質スコア・更新日、スポットなら最終確認日を同じ行に並べている。${
        omitted > 0 ? `表示100回未満でクリック0の ${omitted} ページは省略。` : ''
      }${
        unmatchedPv > 0
          ? `検索実績のない ${unmatchedPages} ページ（トップ・カテゴリ一覧などの回遊面）の ${unmatchedPv.toLocaleString('en-US')}PV はこの表に含まれない。`
          : ''
      }`}
      bodyPadding={0}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-divider)',
        }}
      >
        <Chips
          value={kind}
          onChange={(v) => { setKind(v as ContentKind | 'all'); setLimit(60); }}
          options={[
            { value: 'all', label: `すべて (${rows.length})` },
            ...kinds.map(([k, v]) => ({ value: k, label: `${KIND_LABEL[k]} (${v.n})` })),
          ]}
        />
        <div style={{ flex: 1 }} />
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setLimit(60); }}
          placeholder="タイトル・パスで絞り込み"
          style={{
            fontSize: 13,
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            background: 'var(--bg-card)',
            color: 'var(--ink-900)',
            minWidth: 200,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '10px 18px',
          borderBottom: '1px solid var(--border-divider)',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600 }}>やること</span>
        <Chips
          value={action}
          onChange={(v) => { setAction(v as ActionKey | 'all'); setLimit(60); }}
          options={[
            { value: 'all', label: 'すべて' },
            ...(['title', 'push', 'thicken', 'verify', 'refresh', 'keep', 'none'] as ActionKey[])
              .map((a) => ({ value: a, label: `${ACTION_LABEL[a]} (${rows.filter((r) => r.action === a).length})` })),
          ]}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600 }}>並び</span>
        <Chips
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={SORTS.filter((s) => !s.needsGa4 || hasGa4).map((s) => ({ value: s.key, label: s.label }))}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
          <thead>
            <tr>
              <th style={th('left')}>ページ</th>
              <th style={th('right')}>クリック</th>
              <th style={th('right')}>前期比</th>
              <th style={th('right')}>表示</th>
              <th style={th('right')}>CTR</th>
              <th style={th('right')}>順位</th>
              {hasGa4 && <th style={th('right')}>PV</th>}
              <th style={th('left')}>中身の状態</th>
              <th style={th('left')}>やること</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r) => (
              <tr key={r.path} className="admin-row">
                <td style={{ ...td(), maxWidth: 380 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3, whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--ink-400)', flex: '0 0 auto' }}>{KIND_LABEL[r.kind]}</span>
                    <a
                      href={r.publicHref}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-hover-accent"
                      title={r.path}
                      style={{
                        fontSize: 11,
                        color: 'var(--ink-400)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                      }}
                    >
                      {r.path}
                    </a>
                    {r.editHref && (
                      <Link href={r.editHref} className="admin-hover-accent" style={{ ...miniLink, flex: '0 0 auto' }}>
                        編集
                      </Link>
                    )}
                  </div>
                </td>
                <td style={tdNum()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <div style={{ width: 46, display: 'flex' }}>
                      <Bar pct={(r.clicks / maxClicks) * 100} color="var(--accent)" />
                    </div>
                    {num(r.clicks)}
                  </div>
                </td>
                <td style={{ ...tdNum(), color: r.deltaClicks > 0 ? 'var(--ok-fg)' : r.deltaClicks < 0 ? 'var(--warn-fg)' : 'var(--ink-400)' }}>
                  {r.deltaClicks > 0 ? '+' : ''}
                  {num(r.deltaClicks)}
                </td>
                <td style={tdNum()}>{num(r.impressions)}</td>
                <td style={{ ...tdNum(), color: r.ctr < r.benchCtr * 0.6 ? 'var(--warn-fg)' : 'var(--ink-900)' }}>
                  {pctOf(r.ctr)}
                </td>
                <td style={tdNum()}>{r.position.toFixed(1)}</td>
                {hasGa4 && <td style={tdNum()}>{r.pageViews == null ? '—' : num(r.pageViews)}</td>}
                <td style={{ ...td(), fontSize: 11.5, color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>
                  <StateCell row={r} />
                </td>
                <td style={td()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Badge tone={ACTION_TONE[r.action]}>{ACTION_LABEL[r.action]}</Badge>
                    {r.score > 0 && ACTION_SIDE[r.action] === 'attack' && (
                      <span style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
                        +{num(r.score)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
          {Math.min(limit, filtered.length)} / {filtered.length} 件
        </span>
        {filtered.length > limit && (
          <button type="button" onClick={() => setLimit((v) => v + 100)} style={ghostBtn}>
            さらに100件
          </button>
        )}
      </div>
    </Card>
  );
}

function StateCell({ row: r }: { row: DemandRow }) {
  if (r.kind === 'article') {
    if (r.qualityScore == null) return <span style={{ color: 'var(--ink-400)' }}>—</span>;
    const color = r.qualityScore >= 80 ? 'var(--ok-fg)' : r.qualityScore >= 64 ? 'var(--ink-600)' : 'var(--warn-fg)';
    return (
      <span>
        <span style={{ color }}>品質 {r.qualityScore}</span>
        <span style={{ color: 'var(--ink-400)' }}> · {num(r.bodyLength ?? 0)}字</span>
        {r.ageDays != null && (
          <span style={{ color: r.ageDays >= 180 ? 'var(--warn-fg)' : 'var(--ink-400)' }}> · 更新{r.ageDays}日前</span>
        )}
      </span>
    );
  }
  if (r.kind === 'spot') {
    if (!r.freshness) return <span style={{ color: 'var(--ink-400)' }}>—</span>;
    const label =
      r.freshness === 'fresh'
        ? `確認済み（${r.ageDays}日前）`
        : r.freshness === 'aging'
          ? `そろそろ再確認（${r.ageDays}日前）`
          : r.freshness === 'stale'
            ? `期限切れ（${r.overdueDays}日超過）`
            : r.freshness === 'closed'
              ? '閉店済み'
              : '未確認';
    const color = r.freshness === 'fresh' ? 'var(--ok-fg)' : r.freshness === 'aging' ? 'var(--ink-600)' : 'var(--warn-fg)';
    return <span style={{ color }}>{label}</span>;
  }
  return <span style={{ color: 'var(--ink-400)' }}>—</span>;
}

/* ── 小物 ─────────────────────────────────────────── */

function Chips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value as T)}
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 999,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent-tint)' : 'var(--bg-card)',
              color: active ? 'var(--accent)' : 'var(--ink-600)',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '5px 11px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  background: 'var(--bg-card)',
  color: 'var(--ink-600)',
  cursor: 'pointer',
};

const miniLink: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--accent)',
  textDecoration: 'none',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  padding: '1px 7px',
};

function th(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '9px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ink-400)',
    letterSpacing: '.02em',
    borderBottom: '1px solid var(--border-divider)',
    background: 'var(--bg-app)',
    whiteSpace: 'nowrap',
  };
}
function td(): React.CSSProperties {
  return { padding: '10px 14px', fontSize: 13, color: 'var(--ink-900)', borderBottom: '1px solid var(--border-faint)' };
}
function tdNum(): React.CSSProperties {
  return { ...td(), textAlign: 'right', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
}
