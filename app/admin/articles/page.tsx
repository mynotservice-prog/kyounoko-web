import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllFileArticles } from '@/lib/articles';
import { getAreaName } from '@/lib/area';

export const revalidate = 3600;

type ArticleRow = ReturnType<typeof toRow>;

function toRow(slug: string) {
  const file = path.join(process.cwd(), 'content', 'articles', `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  // 本文を軽く整形してテキスト抽出（見出し・リスト除去）
  const plain = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_`>-]/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  return {
    slug,
    title: String(d.title ?? ''),
    category: String(d.category ?? ''),
    categoryName: String(d.categoryName ?? d.category ?? ''),
    hero: typeof d.hero === 'string' ? d.hero : '',
    area: String(d.area ?? 'all'),
    publishedAt: String(d.publishedAt ?? ''),
    updatedAt: String(d.updatedAt ?? d.publishedAt ?? ''),
    lede: String(d.lede ?? d.metaDescription ?? ''),
    bodyLength: plain.length,
    bodyPreview: plain.slice(0, 160),
    ageRanges: Array.isArray((d.quickInfo as { ageRanges?: unknown[] })?.ageRanges)
      ? ((d.quickInfo as { ageRanges: string[] }).ageRanges as string[])
      : [],
  };
}

export default function AdminArticles() {
  const articles = getAllFileArticles();
  const rows = articles
    .map((a) => toRow(a.slug))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: 0 }}>
          記事一覧 ({rows.length})
        </h1>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>
          更新日降順
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {rows.map((r) => (
          <ArticleCard key={r.slug} row={r} />
        ))}
      </div>
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
      {/* Hero */}
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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c4704f',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            画像なし
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
          <Tag>{row.categoryName}</Tag>
          {row.area && row.area !== 'all' && <Tag variant="area">{getAreaName(row.area)}</Tag>}
          {row.ageRanges.length > 0 && <Tag>{row.ageRanges.join('/')}歳</Tag>}
          <Tag variant={row.bodyLength >= 800 ? 'ok' : 'warn'}>{row.bodyLength}字</Tag>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-mincho)',
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.5,
            color: 'var(--ink)',
          }}
        >
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

        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 8, fontSize: 10, color: 'var(--ink-mute)' }}>
          <span>{row.updatedAt.slice(0, 10)}</span>
          <span style={{ marginLeft: 'auto' }}>
            <Link href={`/article/${row.slug}`} target="_blank" style={{ color: 'var(--sage-deep)' }}>
              公開ページ↗
            </Link>
          </span>
        </div>
      </div>
    </article>
  );
}

function Tag({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'area' | 'ok' | 'warn';
}) {
  const styles = {
    default: { background: '#f3efe8', color: 'var(--ink-sub)' },
    area: { background: 'var(--peach-soft)', color: 'var(--clay)' },
    ok: { background: 'var(--sage-pale)', color: 'var(--sage-deep)' },
    warn: { background: '#f5e0d4', color: '#c4704f' },
  }[variant];
  return (
    <span
      style={{
        ...styles,
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: 600,
        letterSpacing: '.02em',
      }}
    >
      {children}
    </span>
  );
}
