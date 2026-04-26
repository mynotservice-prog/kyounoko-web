import { getAllFileArticles } from '@/lib/articles';

/**
 * RSS 2.0 フィード `/feed.xml`
 *
 * - 公開済み記事のうち noindex でないもの 50 件
 * - updatedAt 降順
 * - lastBuildDate / pubDate / atom:link self を含む
 *
 * SEO 上の役割:
 * - フィードリーダー / Mastodon / Bluesky 等の発見性向上
 * - 一部のクローラ（Bing 等）はフィード優先で巡回する
 * - layout.tsx 側で <link rel="alternate" type="application/rss+xml"> として discovery
 */

export const revalidate = 3600; // 1h

const SITE = 'https://kyounoko.jp';
const SITE_TITLE = 'きょうのこ';
const SITE_DESCRIPTION =
  '0〜6歳の子がいる家庭向け。天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める意思決定サイト。';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET() {
  const articles = getAllFileArticles()
    .filter((a) => !a.noindex)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 50);

  const lastBuild =
    articles.length > 0 ? toRfc822(articles[0].updatedAt) : new Date().toUTCString();

  const items = articles
    .map((a) => {
      const url = `${SITE}/article/${a.slug}`;
      const desc = a.metaDescription || a.lede || '';
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(a.publishedAt)}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
