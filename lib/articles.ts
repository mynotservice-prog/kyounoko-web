import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import type { AgeRange, Budget, PlaceType, Weather } from './types';

// ==========================================================================
// File-based article system (MicroCMS 未整備時のフォールバック兼、軽量ネイティブ記事用)
// ==========================================================================

export type FileArticleQuickInfo = {
  ageRanges?: AgeRange[];
  place?: PlaceType[];
  weather?: Weather[];
  durationMin?: number;
  budget?: Budget;
};

export type FileArticleMeta = {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  categoryName?: string;
  publishedAt: string;
  updatedAt: string;
  hero?: string;
  lede: string;
  quickInfo?: FileArticleQuickInfo;
  noindex?: boolean;
};

export type FileArticleFaq = {
  question: string;
  answer: string;
};

export type FileArticle = FileArticleMeta & {
  body: string; // HTML (with id-added h2/h3)
  faqItems: FileArticleFaq[];
  toc: TocItem[];
  readingTimeMin: number;
};

export type TocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

// ------------------------------------------------------------
// 内部ヘルパ
// ------------------------------------------------------------

function readArticlesDir(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'));
}

function parseFrontmatter(raw: string, fallbackSlug: string): { meta: FileArticleMeta; content: string } {
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  const meta: FileArticleMeta = {
    slug: typeof d.slug === 'string' ? d.slug : fallbackSlug,
    title: typeof d.title === 'string' ? d.title : '',
    metaDescription: typeof d.metaDescription === 'string' ? d.metaDescription : '',
    category: typeof d.category === 'string' ? d.category : '',
    categoryName: typeof d.categoryName === 'string' ? d.categoryName : undefined,
    publishedAt: toIsoDate(d.publishedAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(d.updatedAt) ?? toIsoDate(d.publishedAt) ?? new Date().toISOString(),
    hero: typeof d.hero === 'string' ? d.hero : undefined,
    lede: typeof d.lede === 'string' ? d.lede : (typeof d.metaDescription === 'string' ? d.metaDescription : ''),
    quickInfo: parseQuickInfo(d.quickInfo),
    noindex: typeof d.noindex === 'boolean' ? d.noindex : undefined,
  };

  return { meta, content };
}

function toIsoDate(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
    return v;
  }
  return null;
}

function parseQuickInfo(v: unknown): FileArticleQuickInfo | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const q = v as Record<string, unknown>;
  const result: FileArticleQuickInfo = {};
  if (Array.isArray(q.ageRanges)) {
    result.ageRanges = q.ageRanges.filter((x): x is string => typeof x === 'string') as AgeRange[];
  }
  if (Array.isArray(q.place)) {
    result.place = q.place.filter((x): x is string => typeof x === 'string') as PlaceType[];
  }
  if (Array.isArray(q.weather)) {
    result.weather = q.weather.filter((x): x is string => typeof x === 'string') as Weather[];
  }
  if (typeof q.durationMin === 'number') result.durationMin = q.durationMin;
  if (typeof q.budget === 'string') result.budget = q.budget as Budget;
  return result;
}

async function renderMarkdownToHtml(md: string): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(md);
  return String(file);
}

// 見出しテキストから URL 安全な id を生成する軽量 slugify。
// 日本語はそのまま保持（日本語 URL fragment は主要ブラウザで機能する）。
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '') // &amp; など
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~。、，．・「」『』（）［］【】]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// レンダー済み HTML の <h2>/<h3> に id を付与し、抽出した TOC 配列を返す。
function injectHeadingIdsAndExtractToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  // 既存 id は温存。無い場合のみ付与。
  const result = html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g,
    (match, levelStr: string, attrs: string | undefined, inner: string) => {
      const level = Number(levelStr) as 2 | 3;
      const attrString = attrs ?? '';
      const existingIdMatch = attrString.match(/\sid\s*=\s*["']([^"']+)["']/);
      let id: string;
      if (existingIdMatch) {
        id = existingIdMatch[1];
      } else {
        const base = slugifyHeading(inner) || `section-${toc.length + 1}`;
        id = base;
        let n = 2;
        while (usedIds.has(id)) {
          id = `${base}-${n++}`;
        }
      }
      usedIds.add(id);

      // タグ内テキスト（HTMLタグ除去）
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      toc.push({ id, level, text });

      if (existingIdMatch) {
        return match;
      }
      return `<h${level}${attrString} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: result, toc };
}

/**
 * 日本語テキストの概算読了時間（分）。
 * ベース 600 文字/分。最低 1 分。
 */
export function estimateReadingTime(text: string): number {
  if (!text) return 1;
  // HTML タグを除去し、空白を正規化
  const stripped = text.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  const chars = stripped.length;
  const minutes = Math.max(1, Math.round(chars / 600));
  return minutes;
}

// FAQ セクション（"## よくある質問" または "## FAQ"）を本文から抜き出して
// { question, answer } の配列に変換。FAQ セクションは本文側からは取り除く。
function extractFaq(markdown: string): { body: string; faq: FileArticleFaq[] } {
  const lines = markdown.split('\n');

  // FAQ セクションの開始行を検出
  const faqHeadingRegex = /^##\s+(よくある質問|FAQ|Q&A)\s*$/i;
  let faqStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (faqHeadingRegex.test(lines[i])) {
      faqStart = i;
      break;
    }
  }

  if (faqStart === -1) {
    return { body: markdown, faq: [] };
  }

  // 次の H2 を終端とする
  let faqEnd = lines.length;
  for (let i = faqStart + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      faqEnd = i;
      break;
    }
  }

  const faqLines = lines.slice(faqStart + 1, faqEnd);
  const faq: FileArticleFaq[] = [];

  // 2つの形式に対応:
  // 形式A: ### Q: question ... 以降の段落が answer
  // 形式B: **Q. question** \n **A.** answer
  const h3QRegex = /^###\s+(?:Q[\s.:：]?\s*)?(.+?)\s*$/i;

  let i = 0;
  while (i < faqLines.length) {
    const line = faqLines[i];
    const m = line.match(h3QRegex);
    if (m && (line.includes('Q:') || line.includes('Q：') || line.toLowerCase().includes('q.') || /^###\s+Q/i.test(line))) {
      const question = m[1].replace(/^Q[\s.:：]?\s*/i, '').trim();
      // 以降の行を次の ### or 末尾まで集める
      const answerLines: string[] = [];
      i++;
      while (i < faqLines.length && !/^###\s+/.test(faqLines[i])) {
        answerLines.push(faqLines[i]);
        i++;
      }
      const answer = answerLines.join('\n').trim();
      if (question && answer) faq.push({ question, answer });
      continue;
    }

    // 形式B: **Q. ...**
    const qBold = line.match(/^\*\*Q[\s.:：]?\s*(.+?)\*\*\s*$/i);
    if (qBold) {
      const question = qBold[1].trim();
      const answerLines: string[] = [];
      i++;
      while (
        i < faqLines.length &&
        !/^\*\*Q[\s.:：]/.test(faqLines[i]) &&
        !/^###\s+/.test(faqLines[i])
      ) {
        answerLines.push(faqLines[i]);
        i++;
      }
      const answerRaw = answerLines.join('\n').trim();
      // 先頭の **A.** や **A：** を取り除く
      const answer = answerRaw.replace(/^\*\*A[\s.:：]?\*\*\s*/i, '').trim();
      if (question && answer) faq.push({ question, answer });
      continue;
    }

    i++;
  }

  // 本文から FAQ セクション以降を削除（関連記事などもあるので FAQ 部分だけ除去）
  const bodyBefore = lines.slice(0, faqStart).join('\n');
  const bodyAfter = lines.slice(faqEnd).join('\n');
  const body = (bodyBefore + '\n\n' + bodyAfter).trim() + '\n';

  return { body, faq };
}

// ------------------------------------------------------------
// 公開 API
// ------------------------------------------------------------

/**
 * コンテンツディレクトリの全記事メタ情報を返す（本文は含まない・高速）。
 * publishedAt 降順でソート。
 */
export function getAllFileArticles(): FileArticleMeta[] {
  const files = readArticlesDir();
  const metas: FileArticleMeta[] = files.map((filename) => {
    const filePath = path.join(ARTICLES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const fallbackSlug = filename.replace(/\.md$/, '');
    const { meta } = parseFrontmatter(raw, fallbackSlug);
    return meta;
  });
  return metas.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * 指定 slug の記事を返す（本文HTML + FAQを含む）。
 * 存在しない場合は null。
 */
export async function getFileArticle(slug: string): Promise<FileArticle | null> {
  const files = readArticlesDir();
  for (const filename of files) {
    const filePath = path.join(ARTICLES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const fallbackSlug = filename.replace(/\.md$/, '');
    const { meta, content } = parseFrontmatter(raw, fallbackSlug);
    if (meta.slug !== slug) continue;

    const { body: bodyMd, faq } = extractFaq(content);
    const rawHtml = await renderMarkdownToHtml(bodyMd);
    const { html: bodyHtml, toc } = injectHeadingIdsAndExtractToc(rawHtml);
    const readingTimeMin = estimateReadingTime(bodyMd);
    return {
      ...meta,
      body: bodyHtml,
      faqItems: faq,
      toc,
      readingTimeMin,
    };
  }
  return null;
}

/**
 * 指定カテゴリに属する記事一覧（メタ情報のみ）を返す。
 * publishedAt 降順。
 */
export function getFileArticlesByCategory(categorySlug: string): FileArticleMeta[] {
  return getAllFileArticles().filter((a) => a.category === categorySlug);
}

/**
 * 全記事の slug 一覧（generateStaticParams 用）。
 */
export function getAllFileArticleSlugs(): string[] {
  return getAllFileArticles().map((a) => a.slug);
}

/**
 * 同カテゴリの関連記事を最大 `limit` 件返す。
 * 同カテゴリで足りない場合は他カテゴリの最新で埋める。
 * 現在の記事は除外する。
 */
export function getRelatedFileArticles(
  currentSlug: string,
  category: string,
  limit = 3,
): FileArticleMeta[] {
  const all = getAllFileArticles().filter((a) => a.slug !== currentSlug);
  const sameCat = all.filter((a) => a.category === category);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);

  const others = all.filter((a) => a.category !== category);
  return [...sameCat, ...others].slice(0, limit);
}
