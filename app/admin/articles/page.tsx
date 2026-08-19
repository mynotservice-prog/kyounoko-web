import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllFileArticles } from '@/lib/articles';
import { AREAS, getAreaName } from '@/lib/area';
import { articleCategoryLabel } from '@/lib/article-categories';
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

  // 一覧が実際に使うフィールドだけを返す。本文プレビューや publishedAt まで積むと
  // 1,106本ぶんでHTMLが1.6MBになり、描画されない文字列が payload の大半を占めていた。
  // hero も URL は使わず「あるか」しか見ていないので真偽値に落とす。
  return {
    slug,
    title: String(d.title ?? ''),
    categoryName: articleCategoryLabel(String(d.category ?? ''), String(d.categoryName ?? '')),
    // v7（2026-06-13）: 旧コードは d.hero 生値（/hero-ai/<slug>.jpg イラスト）を見ていた。
    // サイトの hero は lib/articles.ts で実写シーンに解決されるため resolvedHero を優先する。
    hasHero: Boolean(resolvedHero ?? (typeof d.hero === 'string' && d.hero ? d.hero : '')),
    area: String(d.area ?? 'all'),
    updatedAt: String(d.updatedAt ?? d.publishedAt ?? ''),
    lede: String(d.lede ?? d.metaDescription ?? ''),
    bodyLength: plain.length,
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
