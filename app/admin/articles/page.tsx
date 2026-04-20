import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllFileArticles } from '@/lib/articles';
import { AREAS, getAreaName } from '@/lib/area';
import { ArticlesClient, type ArticleRow } from './ArticlesClient';

export const revalidate = 3600;

function toRow(slug: string): ArticleRow {
  const file = path.join(process.cwd(), 'content', 'articles', `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

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

  const categoryOptions = [...new Set(rows.map((r) => r.categoryName).filter(Boolean))].sort();
  const areaOptions = AREAS.filter((a) => a.slug !== 'all').map((a) => ({ slug: a.slug, name: getAreaName(a.slug) }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: 0 }}>
          記事一覧
        </h1>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>
          更新日降順
        </div>
      </div>

      <ArticlesClient rows={rows} categoryOptions={categoryOptions} areaOptions={areaOptions} />
    </>
  );
}
