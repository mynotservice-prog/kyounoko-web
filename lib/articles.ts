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

export type FileArticleHowToStep = {
  name: string;
  text: string;
};

export type FileArticleItemListItem = {
  position: number;
  name: string;
  description?: string;
};

export type FileArticle = FileArticleMeta & {
  body: string; // HTML (with id-added h2/h3)
  faqItems: FileArticleFaq[];
  toc: TocItem[];
  readingTimeMin: number;
  /** 結論セクション（"## 結論（先に知りたい人へ）" 等）のプレーンテキスト。AIO向けTL;DR抽出。 */
  tldr: string | null;
  /** HowTo 抽出結果。手順形式の記事のみ非null。 */
  howto: FileArticleHowToStep[] | null;
  /** ランキング / N選 / 比較記事の項目リスト。ItemList JSON-LD 用。 */
  itemList: FileArticleItemListItem[] | null;
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

// 結論セクション（## 結論...）のプレーンテキストを抽出する。
// AIO（AI Overview）向けの短い要約として schema.org の `description` や
// ページトップの "要約" ブロックで利用する。
function extractTldr(markdown: string): string | null {
  const lines = markdown.split('\n');
  const headingRegex = /^##\s+(結論|要約|この記事の結論|先に結論|TL;DR)/i;

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const body = lines.slice(start + 1, end).join('\n');
  // マークダウン記号を軽量除去
  const plain = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '・')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plain) return null;
  // 長すぎる場合は 240 文字で切る（AIO抽出向け：100〜200字が理想、余裕込みで240）
  return plain.length > 240 ? plain.slice(0, 240) + '…' : plain;
}

// ランキング・N選・比較記事の項目リストを抽出する。ItemList JSON-LD 用。
// 対象：記事タイトルに「ランキング」「N選」「比較」を含む記事のみ。
// 抽出パターン：
//   A) "## 1位：..." "## 2位：..."（最優先）
//   B) "## 1. ..." "## 2. ..." 数字開始の H2
// 3件以上抽出できない場合は null。
function extractItemList(
  title: string,
  markdown: string,
): FileArticleItemListItem[] | null {
  // タイトル条件：ランキング / N選 / 比較 / 徹底比較 / TOPn / ベスト
  // ※「選び方」等の誤検知を避けるため、単独「選」は数字＋選パターンのみに限定
  const isListCandidate =
    /ランキング|比較|徹底比較|[0-9０-９]+選|[0-9０-９]+パターン|ベスト[0-9０-９]+|TOP\s*[0-9０-９]+/i.test(
      title,
    );
  if (!isListCandidate) return null;

  const lines = markdown.split('\n');
  const items: FileArticleItemListItem[] = [];

  // パターンA: "## 1位：..." / "## 第1位 ..." / "## No.1 ..."
  const rankRegex =
    /^##\s+(?:第)?\s*(?:No\.?\s*)?([0-9０-９]+)\s*位[:：]?\s*(.+?)\s*$/i;
  // パターンB: "## 1. ..." / "## 1．..."（別途、但し意味的にランキング全体でのみ）
  const numberDotRegex = /^##\s+([0-9０-９]+)\s*[.．]\s*(.+?)\s*$/;

  let pattern: 'rank' | 'numberDot' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m = line.match(rankRegex);
    let matchedPattern: 'rank' | 'numberDot' | null = null;
    if (m) {
      matchedPattern = 'rank';
    } else {
      m = line.match(numberDotRegex);
      if (m) matchedPattern = 'numberDot';
    }
    if (!m || !matchedPattern) continue;

    // 一貫性：最初に検出したパターンで揃える
    if (pattern === null) pattern = matchedPattern;
    if (pattern !== matchedPattern) continue;

    const position = Number(
      String(m[1]).replace(/[０-９]/g, (c) =>
        String.fromCharCode(c.charCodeAt(0) - 0xfee0),
      ),
    );
    const name = m[2]
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    // 直下の本文（次の ## または ### まで）から短い説明を抽出
    const descLines: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (/^##\s+/.test(lines[j])) break;
      if (/^###\s+/.test(lines[j])) break;
      // 表や画像行はスキップ
      if (/^\s*\|/.test(lines[j])) continue;
      if (/^!\[/.test(lines[j])) continue;
      const t = lines[j].trim();
      if (!t) continue;
      if (t.startsWith('-') || t.startsWith('*')) continue;
      descLines.push(t);
      if (descLines.join(' ').length >= 120) break;
    }
    const description = descLines
      .join(' ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    if (Number.isFinite(position) && position > 0 && name) {
      items.push({
        position,
        name,
        description: description || undefined,
      });
    }
  }

  if (items.length < 3) return null;
  // position で昇順ソート・重複除去（同 position の2件目以降は捨てる）
  const seen = new Set<number>();
  const sorted = items
    .sort((a, b) => a.position - b.position)
    .filter((it) => {
      if (seen.has(it.position)) return false;
      seen.add(it.position);
      return true;
    });
  return sorted.length >= 3 ? sorted : null;
}

// 本文中の "## 手順" "## やり方" "## ステップ" セクションから番号付きリストを
// HowTo JSON-LD 用のステップ配列に変換。見つからない場合は null。
function extractHowTo(markdown: string): FileArticleHowToStep[] | null {
  const lines = markdown.split('\n');
  const headingRegex = /^##\s+(.*(手順|やり方|ステップ|作り方|進め方|回し方|乗り切り方).*)$/;

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  const section = lines.slice(start + 1, end);
  const steps: FileArticleHowToStep[] = [];

  // ### 形式のステップ見出し "### ステップ1: ..." を優先的に拾う
  const h3Step = /^###\s+(?:ステップ\s*)?\d+\s*[:：.．]\s*(.+)$/;
  const h3Simple = /^###\s+(.+)$/;
  const orderedItem = /^\s*\d+\.\s+(.+)$/;

  // まず H3 ステップ
  for (let i = 0; i < section.length; i++) {
    const line = section[i];
    const m = line.match(h3Step) || line.match(h3Simple);
    if (m) {
      const name = m[1]
        .replace(/\*\*/g, '')
        .replace(/^[:：.．]\s*/, '')
        .trim();
      const textLines: string[] = [];
      for (let j = i + 1; j < section.length; j++) {
        if (/^###\s+/.test(section[j])) break;
        textLines.push(section[j]);
      }
      const text = textLines
        .join(' ')
        .replace(/[*_`>#]/g, '')
        .replace(/^\s*[-*]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (name && text) steps.push({ name, text });
    }
  }

  // H3 で拾えない場合は番号付きリストをステップ扱い
  if (steps.length === 0) {
    for (const line of section) {
      const m = line.match(orderedItem);
      if (m) {
        const raw = m[1]
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\s+/g, ' ')
          .trim();
        // 先頭「タイトル：説明」パターンを分解
        const parts = raw.split(/[：:]/);
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const text = parts.slice(1).join('：').trim();
          if (name && text) steps.push({ name, text });
        } else {
          steps.push({ name: raw.slice(0, 40), text: raw });
        }
      }
    }
  }

  return steps.length >= 3 ? steps : null;
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
    const tldr = extractTldr(bodyMd);
    const howto = extractHowTo(bodyMd);
    const itemList = extractItemList(meta.title, bodyMd);
    const rawHtml = await renderMarkdownToHtml(bodyMd);
    const { html: bodyHtml, toc } = injectHeadingIdsAndExtractToc(rawHtml);
    const readingTimeMin = estimateReadingTime(bodyMd);
    return {
      ...meta,
      body: bodyHtml,
      faqItems: faq,
      toc,
      readingTimeMin,
      tldr,
      howto,
      itemList,
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

// ==========================================================================
// 条件検索アルゴリズム（TodayFinder → /today）
// ==========================================================================

/** TodayFinder から渡される検索条件。すべてオプション。 */
export type TodayQuery = {
  age?: string; // "0-1" | "2-3" | "4-6"
  weather?: string; // "sunny" | "rain" | "heat" | "cold" | "any"
  place?: string; // "home" | "outside" | "any"
  day?: string; // "weekday" | "holiday" | "any"
  duration?: string; // "15" | "60" | "120" | "240"
  budget?: string; // "free" | "low" | "mid" | "any"
};

/** 記事スコア。高いほど該当。 */
function scoreArticleForQuery(a: FileArticleMeta, q: TodayQuery): number {
  let score = 0;
  const qi = a.quickInfo;
  if (!qi) return 0;

  // 年齢（+10 完全一致 / +3 該当なしだが近接）
  if (q.age && qi.ageRanges?.length) {
    if (qi.ageRanges.includes(q.age as never)) score += 10;
    else score -= 2; // 対象外の可能性
  }

  // 家 / 外（homeとindoorを"家寄り"、outdoorとindoorを"外寄り"にマッピング）
  if (q.place && q.place !== 'any' && qi.place?.length) {
    if (q.place === 'home') {
      if (qi.place.includes('home' as never)) score += 8;
      else if (qi.place.includes('indoor' as never)) score += 4;
      else score -= 2;
    } else if (q.place === 'outside') {
      if (qi.place.includes('outdoor' as never)) score += 8;
      else if (qi.place.includes('indoor' as never)) score += 5;
      else score -= 2;
    }
  }

  // 天気（qi.weather に該当条件が含まれていれば加点）
  if (q.weather && q.weather !== 'any') {
    if (qi.weather?.length && qi.weather.includes(q.weather as never)) score += 6;
    else if (!qi.weather || qi.weather.length === 0) score += 1; // 天気不問記事は汎用
  }

  // 使える時間（記事のdurationMin ≤ クエリ = OK）
  if (q.duration && qi.durationMin) {
    const userMin = Number(q.duration);
    if (Number.isFinite(userMin)) {
      if (qi.durationMin <= userMin) score += 6;
      else if (qi.durationMin <= userMin * 1.5) score += 2;
      else score -= 2;
    }
  }

  // 予算（記事の予算 ≤ クエリ予算 = OK）
  if (q.budget && q.budget !== 'any' && qi.budget) {
    const rank: Record<string, number> = { free: 0, low: 1, mid: 2, high: 3 };
    const u = rank[q.budget] ?? 3;
    const a = rank[qi.budget] ?? 3;
    if (a <= u) score += 4;
    else score -= 2;
  }

  // 平日/休日（現状メタに day が無いので保留。カテゴリ側で軽く加点）
  if (q.day === 'weekday') {
    if (a.category === 'today-mawasu' || a.category === 'heijitsu-yoru') score += 2;
  } else if (q.day === 'holiday') {
    if (a.category === 'today-doko' || a.category === 'gyouji') score += 2;
  }

  return score;
}

/**
 * TodayFinder 条件にマッチする記事をスコア降順で返す。
 * スコアが0以下の記事は除外。最大 limit 件。
 */
export function getMatchedFileArticles(q: TodayQuery, limit = 24): FileArticleMeta[] {
  return getAllFileArticles()
    .map((a) => ({ a, s: scoreArticleForQuery(a, q) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.a);
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
