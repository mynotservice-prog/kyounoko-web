'use client';

// Claude Design ハンドオフの「一覧・分析」テンプレートを汎用化した対話型テーブル。
// 検索 / フィルタ / ソート / 選択 / ページング / キーボード操作（/ j k Enter Space Esc）。
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AdminIcon } from './icons';
import { Badge, Bar, StatCard, statusTone } from './ui';

type Tone = 'ok' | 'warn' | 'neu';

export type Column<T> = {
  key: string;
  label: string;
  type?: 'title' | 'text' | 'monotext' | 'num' | 'badge' | 'delta' | 'bar';
  width?: string | number;
  sortable?: boolean;
  /** title 型: 下に /slug 等を mono 表示 */
  subKey?: (row: T) => string | undefined;
  /** title 型: タイトルをリンクに */
  href?: (row: T) => string;
  /** num 型のフォーマット */
  dec?: number;
  suffix?: string;
  /** badge 型のトーン上書き（既定は statusTone(値)） */
  tone?: (row: T) => Tone;
  /** bar 型: 0-100 のスコア値（既定は row[key]） */
  barColor?: (v: number) => string;
  /** 任意描画 */
  render?: (row: T) => ReactNode;
  /** ソート/検索で使う生値（既定は row[key]） */
  value?: (row: T) => string | number;
};

export type Filter<T> = {
  id: string;
  allLabel: string;
  options: { value: string; label: string }[];
  test: (row: T, value: string) => boolean;
};

type Props<T> = {
  title: string;
  subtitle?: string;
  primaryAction?: { label: string; href: string };
  summaryCards?: { label: string; value: ReactNode; sub?: string; delta?: string; deltaNegative?: boolean }[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (row: T) => string;
  filters?: Filter<T>[];
  columns: Column<T>[];
  rows: T[];
  getId: (row: T) => string;
  selectable?: boolean;
  editable?: boolean;
  editHref?: (row: T) => string;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  pageSize?: number;
  totalLabel?: number;
  emptyText?: string;
};

const RIGHT_TYPES = new Set(['num', 'delta', 'bar']);

function fmtNum(v: unknown, dec?: number, suffix?: string) {
  const n = Number(v);
  const s = dec != null ? n.toFixed(dec) : Math.round(n).toLocaleString('en-US');
  return s + (suffix || '');
}

export function DataTable<T>(props: Props<T>) {
  const {
    title,
    subtitle,
    primaryAction,
    summaryCards,
    searchable,
    searchPlaceholder = '検索',
    searchKeys,
    filters = [],
    columns,
    rows,
    getId,
    selectable,
    editable,
    editHref,
    defaultSort,
    pageSize = 50,
    totalLabel,
    emptyText = '該当なし',
  } = props;

  const [query, setQuery] = useState('');
  const [filterVals, setFilterVals] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(defaultSort ?? null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusRow, setFocusRow] = useState(-1);
  const [page, setPage] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const colValue = (col: Column<T>, row: T): string | number => {
    if (col.value) return col.value(row);
    return (row as Record<string, unknown>)[col.key] as string | number;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      for (const f of filters) {
        const v = filterVals[f.id];
        if (v && !f.test(r, v)) return false;
      }
      if (q && searchKeys) {
        if (!searchKeys(r).toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, filterVals, filters, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const numeric = col.type ? RIGHT_TYPES.has(col.type) : false;
    const arr = filtered.slice();
    arr.sort((a, b) => {
      let av = colValue(col, a);
      let bv = colValue(col, b);
      if (numeric) {
        av = Number(av);
        bv = Number(bv);
      } else {
        av = String(av);
        bv = String(bv);
      }
      const r = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? r : -r;
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  // フィルタ/検索が変わったら 1 ページ目へ
  useEffect(() => {
    setPage(0);
    setFocusRow(-1);
  }, [query, filterVals, sort]);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(getId(r)));

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const sortBy = (key: string, numeric: boolean) =>
    setSort((cur) => {
      let dir: 'asc' | 'desc' = numeric ? 'desc' : 'asc';
      if (cur && cur.key === key) dir = cur.dir === 'asc' ? 'desc' : 'asc';
      return { key, dir };
    });

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = (t?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || t?.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'Escape') {
        if (typing) (t as HTMLElement)?.blur();
        setFocusRow(-1);
        setSelected(new Set());
        return;
      }
      if (typing) return;
      const n = pageRows.length;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusRow((f) => Math.min((f < 0 ? -1 : f) + 1, n - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusRow((f) => Math.max((f < 0 ? 0 : f) - 1, 0));
      } else if (e.key === 'Enter' && editable && editHref) {
        const r = pageRows[focusRow];
        if (r) window.location.href = editHref(r);
      } else if ((e.key === ' ' || e.key === 'x') && selectable) {
        const r = pageRows[focusRow];
        if (r) {
          e.preventDefault();
          toggleSel(getId(r));
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageRows, focusRow, editable, selectable]);

  const total = totalLabel ?? rows.length;
  const resultText = searchable
    ? `全 ${total.toLocaleString('en-US')} 件中 ${sorted.length} 件`
    : `${sorted.length} 件`;

  return (
    <>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '.01em' }}>
            {title}
          </h1>
          {subtitle && <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--ink-500)' }}>{subtitle}</p>}
        </div>
        {primaryAction && (
          <Link
            href={primaryAction.href}
            className="admin-btn-accent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--r-md)',
              padding: '9px 15px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              flex: '0 0 auto',
            }}
          >
            <AdminIcon name="plus" size={16} strokeWidth={2} />
            {primaryAction.label}
          </Link>
        )}
      </div>

      {/* summary cards */}
      {summaryCards && summaryCards.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {summaryCards.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
      )}

      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        {searchable && (
          <div style={{ position: 'relative', flex: 1, maxWidth: 320, minWidth: 200 }}>
            <span
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ink-300)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              <AdminIcon name="search" size={16} strokeWidth={1.8} />
            </span>
            <input
              ref={searchRef}
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 64px 0 34px',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--r-md)',
                fontSize: 13,
                color: 'var(--ink-900)',
                background: 'var(--bg-surface)',
              }}
            />
            <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <kbd>/</kbd>
            </span>
          </div>
        )}
        {filters.map((f) => (
          <select
            key={f.id}
            value={filterVals[f.id] ?? ''}
            onChange={(e) => setFilterVals((v) => ({ ...v, [f.id]: e.target.value }))}
            style={{
              height: 36,
              padding: '0 30px 0 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              color: 'var(--ink-700)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
            }}
          >
            <option value="">{f.allLabel}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12.5,
            color: 'var(--ink-500)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          {resultText}
        </span>
      </div>

      {/* bulk bar */}
      {selectable && selected.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-md)',
            padding: '8px 14px',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{selected.size} 件を選択中</span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="admin-hover-ink"
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'none',
              color: 'var(--ink-500)',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            選択を解除
          </button>
        </div>
      )}

      {/* table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40, textAlign: 'center', padding: '11px 0 11px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-app)' }}>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={() =>
                      setSelected((s) => {
                        const next = new Set(s);
                        if (allOnPageSelected) pageRows.forEach((r) => next.delete(getId(r)));
                        else pageRows.forEach((r) => next.add(getId(r)));
                        return next;
                      })
                    }
                    style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer', verticalAlign: 'middle' }}
                  />
                </th>
              )}
              {columns.map((col, ci) => {
                const right = col.type ? RIGHT_TYPES.has(col.type) : false;
                const first = ci === 0;
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    style={{
                      textAlign: right ? 'right' : 'left',
                      padding: first ? '11px 14px 11px 18px' : '11px 14px',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--bg-app)',
                      whiteSpace: 'nowrap',
                      width: col.width,
                    }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => sortBy(col.key, right)}
                        className="admin-hover-ink"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          font: 'inherit',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--ink-500)',
                          letterSpacing: '.02em',
                          cursor: 'pointer',
                        }}
                      >
                        {col.label}
                        <span style={{ fontSize: 9, color: active ? 'var(--accent)' : '#cfc9c1' }}>
                          {active ? (sort?.dir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-400)', letterSpacing: '.02em' }}>{col.label}</span>
                    )}
                  </th>
                );
              })}
              {editable && <th style={{ width: 72, borderBottom: '1px solid var(--border)', background: 'var(--bg-app)' }} />}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => {
              const id = getId(row);
              const isSel = selected.has(id);
              const focused = idx === focusRow;
              return (
                <tr
                  key={id}
                  className="admin-row"
                  style={{
                    background: focused ? 'var(--bg-hover)' : isSel ? '#fbf2ee' : 'transparent',
                    boxShadow: focused ? 'inset 3px 0 0 var(--accent)' : undefined,
                  }}
                >
                  {selectable && (
                    <td style={{ textAlign: 'center', padding: '12px 0 12px 18px', borderBottom: '1px solid var(--border-faint)' }}>
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleSel(id)}
                        style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer', verticalAlign: 'middle' }}
                      />
                    </td>
                  )}
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      style={{
                        padding: ci === 0 ? '12px 14px 12px 18px' : '12px 14px',
                        borderBottom: '1px solid var(--border-faint)',
                        verticalAlign: 'middle',
                        textAlign: col.type && RIGHT_TYPES.has(col.type) ? 'right' : 'left',
                      }}
                    >
                      <Cell col={col} row={row} />
                    </td>
                  ))}
                  {editable && (
                    <td style={{ textAlign: 'right', padding: '12px 18px 12px 0', borderBottom: '1px solid var(--border-faint)' }}>
                      {editHref && (
                        <Link
                          href={editHref(row)}
                          className="admin-hover-accent"
                          style={{
                            border: '1px solid var(--border-strong)',
                            background: 'var(--bg-surface)',
                            color: 'var(--ink-600)',
                            borderRadius: 'var(--r-sm)',
                            padding: '5px 12px',
                            fontSize: 12.5,
                            fontWeight: 500,
                            textDecoration: 'none',
                          }}
                        >
                          編集
                        </Link>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (editable ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-400)', fontSize: 13 }}
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderTop: '1px solid var(--border-divider)' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
            {pageCount > 1 ? `${safePage + 1} / ${pageCount} ページ` : `${sorted.length} 件を表示`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <PageBtn disabled={safePage <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              前へ
            </PageBtn>
            <PageBtn disabled={safePage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
              次へ
            </PageBtn>
          </div>
        </div>
      </div>

      <p style={{ margin: '14px 2px 0', fontSize: 11.5, color: 'var(--ink-300)', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <kbd>/</kbd> 検索 <kbd>j</kbd>
        <kbd>k</kbd> 行移動 {editable && <><kbd>Enter</kbd> 編集 </>}
        {selectable && <><kbd>Space</kbd> 選択 </>}
        <kbd>Esc</kbd> 解除
      </p>
    </>
  );
}

function PageBtn({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={disabled ? undefined : 'admin-hover-accent'}
      style={{
        border: '1px solid var(--border-strong)',
        background: 'var(--bg-surface)',
        color: disabled ? 'var(--ink-300)' : 'var(--ink-600)',
        borderRadius: 'var(--r-sm)',
        padding: '5px 12px',
        fontSize: 12.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Cell<T>({ col, row }: { col: Column<T>; row: T }) {
  if (col.render) return <>{col.render(row)}</>;
  const raw = (row as Record<string, unknown>)[col.key];
  const type = col.type ?? 'text';

  if (type === 'title') {
    const sub = col.subKey?.(row);
    const titleEl = <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', lineHeight: 1.4 }}>{String(raw ?? '')}</div>;
    return (
      <>
        {col.href ? (
          <Link href={col.href(row)} className="admin-hover-accent" style={{ textDecoration: 'none', color: 'inherit' }}>
            {titleEl}
          </Link>
        ) : (
          titleEl
        )}
        {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-300)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{sub}</div>}
      </>
    );
  }
  if (type === 'text') return <span style={{ fontSize: 13, color: 'var(--ink-600)' }}>{String(raw ?? '')}</span>;
  if (type === 'monotext')
    return <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{String(raw ?? '')}</span>;
  if (type === 'num')
    return <span style={{ fontSize: 13, color: 'var(--ink-700)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(raw, col.dec, col.suffix)}</span>;
  if (type === 'badge') {
    const v = String(raw ?? '');
    const tone = col.tone ? col.tone(row) : statusTone(v);
    return <Badge tone={tone}>{v}</Badge>;
  }
  if (type === 'delta') {
    const v = Number(raw);
    const txt = `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: v >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
        {txt}
      </span>
    );
  }
  if (type === 'bar') {
    const v = Number(raw);
    const color = col.barColor ? col.barColor(v) : v >= 80 ? 'var(--ok-dot)' : v >= 60 ? '#c9c3bb' : 'var(--warn-dot)';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'flex-end' }}>
        <div style={{ flex: 1, maxWidth: 120, height: 6, borderRadius: 3, background: 'var(--neu-bg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, v))}%`, background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--ink-700)', fontFamily: 'var(--font-mono)', width: 28, textAlign: 'right' }}>{v}</span>
      </div>
    );
  }
  return <span>{String(raw ?? '')}</span>;
}
