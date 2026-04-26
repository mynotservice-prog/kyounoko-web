import { getAllFileArticles } from '@/lib/articles';

/**
 * Atom 1.0 フィード `/atom.xml`
 *
 * - 公開済み記事のうち noindex でないもの 50 件
 * - updatedAt 降順
 * - フィードリーダー / クローラの取り込みを促進する
 */

export const revalidate = 3600;

const SITE = 'https://kyounoko.jp';
const SITE_TITLE = 'きょうのこ';
const SITE_DESCRIPTION =
  '0〜6歳の子がいる家庭向け。天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める意思決定サイト。';
const AUTHOR_NAME = 'ながみー';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export async function GET() {
  const articles = getAllFileArticles()
    .filter((a) => !a.noindex)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 50);

  const updated = articles.length > 0 ? toIso(articles[0].updatedAt) : new Date().toISOString();

  const entries = articles
    .map((a) => {
      const url = `${SITE}/article/${a.slug}`;
      const summary = a.metaDescription || a.lede || '';
      return `  <entry>
    <title>${escapeXml(a.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <updated>${toIso(a.updatedAt)}</updated>
    <published>${toIso(a.publishedAt)}</published>
    <summary>${escapeXml(summary)}</summary>
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE}" />
  <link rel="self" href="${SITE}/atom.xml" type="application/atom+xml" />
  <id>${SITE}/</id>
  <updated>${updated}</updated>
  <author>
    <name>${escapeXml(AUTHOR_NAME)}</name>
    <uri>${SITE}/about</uri>
  </author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
