import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllFileArticles } from '@/lib/articles';
import { AREAS, getAreaName } from '@/lib/area';
import { ArticlesClient, type ArticleRow } from './ArticlesClient';

// admin は常に最新を表示（v7, 2026-06-13: ISR キャッシュで旧イラストが残る問題対策）
export const dynamic = 'force-dynamic';

function toRow(slug: string, resolvedHero: string | undefined): ArticleRow {
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
    // v7（2026-06-13）: 旧コードは d.hero 生値（/hero-ai/<slug>.jpg イラスト）を返していた。
    // サイトの hero は lib/articles.ts で実写シーンに解決されているのに、管理画面だけ
    // イラストが出ていたため、解決済み hero（resolvedHero）を優先表示するように変更。
    hero: resolvedHero ?? (typeof d.hero === 'string' ? d.hero : ''),
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
    .map((a) => toRow(a.slug, a.hero))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const categoryOptions = [...new Set(rows.map((r) => r.categoryName).filter(Boolean))].sort();
  const areaOptions = AREAS.filter((a) => a.slug !== 'all').map((a) => ({ slug: a.slug, name: getAreaName(a.slug) }));

  return <ArticlesClient rows={rows} categoryOptions={categoryOptions} areaOptions={areaOptions} />;
}
