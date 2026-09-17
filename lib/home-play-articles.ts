/**
 * 遊びID → その遊びをカードとして載せている記事。
 * /today の「今日のおうち遊び」から記事へ送客するための逆引き。
 * lib/home-play.ts は記事層を import しない（循環回避）ので、ここで結ぶ。
 */
import { getAllFileArticles, type FileArticleMeta } from './articles';

let cache: Map<string, { slug: string; title: string }> | null = null;

function build(): Map<string, { slug: string; title: string }> {
  const m = new Map<string, { slug: string; title: string }>();
  for (const a of getAllFileArticles() as FileArticleMeta[]) {
    if (a.noindex || !a.homePlays?.length) continue;
    for (const id of a.homePlays) {
      if (!m.has(id)) m.set(id, { slug: a.slug, title: a.title });
    }
  }
  return m;
}

export function getArticleForHomePlay(id: string): { slug: string; title: string } | null {
  if (!cache) cache = build();
  return cache.get(id) ?? null;
}
