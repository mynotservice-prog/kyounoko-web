'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export type PlanRow = {
  id: string;
  title: string;
  shortAnswer: string;
  ageRanges: string[];
  place: string[];
  durationMin: number;
  budget: string;
  area: string;
  areaName: string;
  hero?: string;
  bodyPreview: string;
  bodyLength: number;
};

type Props = {
  rows: PlanRow[];
  areaOptions: { slug: string; name: string }[];
};

export function PlansClient({ rows, areaOptions }: Props) {
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [ageFilter, setAgeFilter] = useState<string>('');
  const [placeFilter, setPlaceFilter] = useState<string>('');
  const [issueOnly, setIssueOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (areaFilter && r.area !== areaFilter) return false;
      if (ageFilter && !r.ageRanges.includes(ageFilter)) return false;
      if (placeFilter && !r.place.includes(placeFilter)) return false;
      if (issueOnly) {
        const hasIssue = !r.hero || r.bodyLength < 400 || !r.shortAnswer;
        if (!hasIssue) return false;
      }
      if (q) {
        const hay = `${r.title} ${r.id} ${r.shortAnswer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, areaFilter, ageFilter, placeFilter, issueOnly]);

  return (
    <>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="タイトル/ID/概要で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: '1 1 200px', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
        />
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}>
          <option value="">すべてのエリア</option>
          <option value="all">エリア非依存</option>
          {areaOptions.map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}>
          <option value="">すべての年齢</option>
          <option value="0-1">0-1歳</option>
          <option value="2-3">2-3歳</option>
          <option value="4-6">4-6歳</option>
        </select>
        <select value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}>
          <option value="">すべての場所</option>
          <option value="home">家</option>
          <option value="indoor">屋内</option>
          <option value="outdoor">屋外</option>
        </select>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={issueOnly} onChange={(e) => setIssueOnly(e.target.checked)} />
          要改善のみ
        </label>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-mute)' }}>
          {filtered.length} / {rows.length} 件
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((p) => (
          <PlanCard key={p.id} p={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-mute)' }}>
          該当なし
        </div>
      )}
    </>
  );
}

function PlanCard({ p }: { p: PlanRow }) {
  const warn = !p.hero || p.bodyLength < 400 || !p.shortAnswer;

  return (
    <article
      style={{
        background: '#fff',
        border: `1px solid ${warn ? '#e2b39a' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--peach-soft)',
          backgroundImage: p.hero ? `url(${p.hero})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        {!p.hero && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4704f', fontSize: 11, fontWeight: 600 }}>
            画像なし
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: 10 }}>
          <Tag>{p.ageRanges.join('/')}歳</Tag>
          <Tag>{p.durationMin}分</Tag>
          <Tag>{p.budget}</Tag>
          {p.area !== 'all' && <Tag variant="area">{p.areaName}</Tag>}
          {p.place.map((pl) => (
            <Tag key={pl} variant="area">
              {pl === 'home' ? '家' : pl === 'indoor' ? '屋内' : '外'}
            </Tag>
          ))}
          <Tag variant={p.bodyLength >= 400 ? 'ok' : 'warn'}>{p.bodyLength}字</Tag>
        </div>
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.45, color: 'var(--ink)' }}>
          {p.title}
        </h3>
        <p
          style={{
            fontSize: 11,
            color: 'var(--ink-mute)',
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {p.shortAnswer || p.bodyPreview || '（概要なし）'}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', fontSize: 10, color: 'var(--ink-mute)' }}>
          <span style={{ opacity: 0.7 }}>{p.id}</span>
          <Link href={`/plan/${p.id}`} target="_blank" style={{ marginLeft: 'auto', color: 'var(--sage-deep)' }}>
            公開↗
          </Link>
        </div>
      </div>
    </article>
  );
}

function Tag({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'area' | 'ok' | 'warn' }) {
  const styles = {
    default: { background: '#f3efe8', color: 'var(--ink-sub)' },
    area: { background: 'var(--peach-soft)', color: 'var(--clay)' },
    ok: { background: 'var(--sage-pale)', color: 'var(--sage-deep)' },
    warn: { background: '#f5e0d4', color: '#c4704f' },
  }[variant];
  return (
    <span style={{ ...styles, padding: '2px 6px', borderRadius: 999, fontWeight: 600 }}>
      {children}
    </span>
  );
}
