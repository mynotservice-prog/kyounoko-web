'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export type ArticleRow = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  hero: string;
  area: string;
  publishedAt: string;
  updatedAt: string;
  lede: string;
  bodyLength: number;
  bodyPreview: string;
  ageRanges: string[];
};

type Props = {
  rows: ArticleRow[];
  categoryOptions: string[];
  areaOptions: { slug: string; name: string }[];
};

export function ArticlesClient({ rows, categoryOptions, areaOptions }: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [issueOnly, setIssueOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (categoryFilter && r.categoryName !== categoryFilter) return false;
      if (areaFilter && r.area !== areaFilter) return false;
      if (issueOnly) {
        const hasIssue = !r.hero || r.bodyLength < 800 || !r.lede;
        if (!hasIssue) return false;
      }
      if (q) {
        const hay = `${r.title} ${r.slug} ${r.lede}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, categoryFilter, areaFilter, issueOnly]);

  return (
    <>
      {/* フィルタバー */}
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
          placeholder="タイトル/slug/導入文で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '8px 12px',
            border: '1px solid var(--line)',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">すべてのカテゴリ</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">すべてのエリア</option>
          <option value="all">エリア非依存</option>
          {areaOptions.map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={issueOnly}
            onChange={(e) => setIssueOnly(e.target.checked)}
          />
          要改善のみ
        </label>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-mute)' }}>
          {filtered.length} / {rows.length} 件
        </div>
      </div>

      {/* カード一覧 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((r) => (
          <ArticleCard key={r.slug} row={r} />
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

function ArticleCard({ row }: { row: ArticleRow }) {
  const warn = !row.hero || row.bodyLength < 800 || !row.lede;

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
          backgroundImage: row.hero ? `url(${row.hero})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        {!row.hero && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4704f', fontSize: 12, fontWeight: 600 }}>
            画像なし
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
          <Tag>{row.categoryName}</Tag>
          {row.area && row.area !== 'all' && <Tag variant="area">{row.area}</Tag>}
          {row.ageRanges.length > 0 && <Tag>{row.ageRanges.join('/')}歳</Tag>}
          <Tag variant={row.bodyLength >= 800 ? 'ok' : 'warn'}>{row.bodyLength}字</Tag>
        </div>
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.5, color: 'var(--ink)' }}>
          {row.title}
        </h2>
        <p
          style={{
            fontSize: 11,
            color: 'var(--ink-mute)',
            margin: 0,
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {row.lede || row.bodyPreview || '（導入文なし）'}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8, fontSize: 10, color: 'var(--ink-mute)', alignItems: 'center' }}>
          <span>{row.updatedAt.slice(0, 10)}</span>
          <Link
            href={`/admin/articles/${row.slug}/edit`}
            style={{ marginLeft: 'auto', color: 'var(--clay-deep, #C9603E)', fontWeight: 600 }}
          >
            ✏️ 編集
          </Link>
          <Link href={`/article/${row.slug}`} target="_blank" style={{ color: 'var(--sage-deep)' }}>
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
    <span style={{ ...styles, padding: '2px 8px', borderRadius: 999, fontWeight: 600, letterSpacing: '.02em' }}>
      {children}
    </span>
  );
}
