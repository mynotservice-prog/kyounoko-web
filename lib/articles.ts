import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { injectInternalLinks } from './auto-internal-links';
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
  /** エリア絞り込み用。"all" = エリア非依存、"tokyo" 等 = 地域依存。未指定はallと同等扱い。 */
  area?: string;
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
    area: typeof d.area === 'string' ? d.area : 'all',
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
    const htmlWithLinks = injectInternalLinks(rawHtml, meta.slug);
    const { html: bodyHtml, toc } = injectHeadingIdsAndExtractToc(htmlWithLinks);
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
  area?: string; // AreaSlug — "all" or 都道府県 / 地方ブロック
};

/** スコアと一致理由（人間向け自然文）を同時に返す内部結果 */
export type ArticleMatchDetail = {
  article: FileArticleMeta;
  score: number;
  reasons: string[];
};

/**
 * エリアマッチ判定。記事 area と user area の一致・包含を軽量に判定。
 * - 記事側 "all" or undefined → 常にマッチ
 * - ユーザー側 "all" or undefined → 常にマッチ
 * - 都道府県完全一致
 * - ブロック（kanto 等）と配下都道府県の相互一致（articles.ts 内の定数で解決）
 */
const BLOCK_MEMBERS: Record<string, string[]> = {
  'hokkaido-tohoku': ['hokkaido','aomori','iwate','miyagi','akita','yamagata','fukushima'],
  'kanto': ['ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa'],
  'chubu': ['niigata','toyama','ishikawa','fukui','yamanashi','nagano','gifu','shizuoka','aichi'],
  'kansai': ['mie','shiga','kyoto','osaka','hyogo','nara','wakayama'],
  'chugoku-shikoku': ['tottori','shimane','okayama','hiroshima','yamaguchi','tokushima','kagawa','ehime','kochi'],
  'kyushu-okinawa': ['fukuoka','saga','nagasaki','kumamoto','oita','miyazaki','kagoshima','okinawa'],
};
const PREF_TO_BLOCK: Record<string, string> = Object.fromEntries(
  Object.entries(BLOCK_MEMBERS).flatMap(([b, prefs]) => prefs.map((p) => [p, b] as [string, string]))
);

function areaMatch(articleArea: string | undefined, userArea: string | undefined): 'exact' | 'block' | 'any' | 'none' {
  const aa = articleArea ?? 'all';
  const ua = userArea ?? 'all';
  if (aa === 'all' || ua === 'all') return 'any';
  if (aa === ua) return 'exact';
  if (BLOCK_MEMBERS[aa]?.includes(ua)) return 'block';
  if (BLOCK_MEMBERS[ua]?.includes(aa)) return 'block';
  if (PREF_TO_BLOCK[aa] && PREF_TO_BLOCK[aa] === PREF_TO_BLOCK[ua]) return 'block';
  return 'none';
}

/** 記事スコア+理由。高いほど該当。 */
function scoreArticleForQuery(a: FileArticleMeta, q: TodayQuery): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const qi = a.quickInfo;

  // エリア（最優先・符号を大きく）
  if (q.area && q.area !== 'all') {
    const m = areaMatch(a.area, q.area);
    if (m === 'exact') { score += 30; reasons.push('エリア一致'); }
    else if (m === 'block') { score += 12; reasons.push('エリア近接'); }
    else if (m === 'any') { score += 2; /* area 非依存 */ }
    else { score -= 50; } // エリアミスマッチは強く除外
  }

  if (!qi) return { score, reasons };

  // 年齢
  if (q.age && qi.ageRanges?.length) {
    if (qi.ageRanges.includes(q.age as never)) { score += 10; reasons.push(`${q.age}歳向け`); }
    else score -= 2;
  }

  // 家 / 外
  if (q.place && q.place !== 'any' && qi.place?.length) {
    if (q.place === 'home') {
      if (qi.place.includes('home' as never)) { score += 8; reasons.push('家でできる'); }
      else if (qi.place.includes('indoor' as never)) { score += 4; reasons.push('屋内で過ごせる'); }
      else score -= 2;
    } else if (q.place === 'outside') {
      if (qi.place.includes('outdoor' as never)) { score += 8; reasons.push('外に出かける'); }
      else if (qi.place.includes('indoor' as never)) { score += 5; reasons.push('屋内スポット'); }
      else score -= 2;
    }
  }

  // 天気
  if (q.weather && q.weather !== 'any') {
    if (qi.weather?.length && qi.weather.includes(q.weather as never)) {
      const labels: Record<string, string> = { rain: '雨でもOK', heat: '猛暑日OK', cold: '寒い日OK', sunny: '晴れ向き' };
      score += 6;
      reasons.push(labels[q.weather] ?? q.weather);
    } else if (!qi.weather || qi.weather.length === 0) {
      score += 1;
    }
  }

  // 時間
  if (q.duration && qi.durationMin) {
    const userMin = Number(q.duration);
    if (Number.isFinite(userMin)) {
      if (qi.durationMin <= userMin) { score += 6; reasons.push(`${qi.durationMin}分で完結`); }
      else if (qi.durationMin <= userMin * 1.5) score += 2;
      else score -= 2;
    }
  }

  // 予算
  if (q.budget && q.budget !== 'any' && qi.budget) {
    const rank: Record<string, number> = { free: 0, low: 1, mid: 2, high: 3 };
    const u = rank[q.budget] ?? 3;
    const ar = rank[qi.budget] ?? 3;
    if (ar <= u) {
      const labels: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
      score += 4;
      reasons.push(`予算 ${labels[qi.budget] ?? qi.budget}`);
    } else score -= 2;
  }

  // 平日 / 休日
  if (q.day === 'weekday') {
    if (a.category === 'today-mawasu' || a.category === 'heijitsu-yoru') { score += 2; reasons.push('平日夜向き'); }
  } else if (q.day === 'holiday') {
    if (a.category === 'today-doko' || a.category === 'gyouji') { score += 2; reasons.push('休日向き'); }
  }

  return { score, reasons };
}

/**
 * TodayFinder 条件にマッチする記事をスコア降順で返す（従来API）。
 * スコアが0以下の記事は除外。最大 limit 件。
 */
export function getMatchedFileArticles(q: TodayQuery, limit = 24): FileArticleMeta[] {
  return getAllFileArticles()
    .map((a) => ({ a, r: scoreArticleForQuery(a, q) }))
    .filter((x) => x.r.score > 0)
    .sort((x, y) => {
      if (y.r.score !== x.r.score) return y.r.score - x.r.score;
      // 同点は updatedAt 新しい順
      return (x.a.updatedAt < y.a.updatedAt ? 1 : -1);
    })
    .slice(0, limit)
    .map((x) => x.a);
}

/**
 * Plan または Article を指す統合結果型。
 * ファインダーは Plan 優先で返し、Plan がなければ Article フォールバック。
 */
export type TodayAnswerResult = {
  kind: 'plan' | 'article';
  // Plan の場合
  plan?: import('./plans').PlanMatch;
  // Article フォールバックの場合
  article?: ArticleMatchDetail;
  // 画面表示用の共通情報
  title: string;
  shortAnswer: string;
  reasons: string[];
  hero?: string;
  href: string;
  score: number;
};

function planMatchToAnswer(pm: import('./plans').PlanMatch, heroFromArticle?: string): TodayAnswerResult {
  return {
    kind: 'plan',
    plan: pm,
    title: pm.plan.title,
    shortAnswer: pm.plan.shortAnswer,
    reasons: pm.reasons,
    hero: pm.plan.hero ?? heroFromArticle,
    href: `/plan/${pm.plan.id}`,
    score: pm.score,
  };
}

function articleToAnswer(amd: ArticleMatchDetail): TodayAnswerResult {
  return {
    kind: 'article',
    article: amd,
    title: amd.article.title,
    shortAnswer: amd.article.lede?.slice(0, 120) ?? amd.article.metaDescription?.slice(0, 120) ?? '',
    reasons: amd.reasons,
    hero: amd.article.hero,
    href: `/article/${amd.article.slug}`,
    score: amd.score,
  };
}

/**
 * 条件から「答えを1つに決める」ためのトップピック取得。
 *  - Plan（content/plans/）から優先的に1件選ぶ
 *  - Plan がなければ既存記事（content/articles/）からフォールバック
 *  - 代替候補はプランから最大2件、なければ記事から補充
 */
export function getTodayAnswer(q: TodayQuery): {
  top: TodayAnswerResult | null;
  alternatives: TodayAnswerResult[];
  hasQuery: boolean;
  fallbackUsed: boolean;
} {
  const hasQuery = Object.values(q).some((v) => v && v !== 'any' && v !== 'all');

  if (!hasQuery) {
    return { top: null, alternatives: [], hasQuery: false, fallbackUsed: false };
  }

  // --- 1) Plan 優先 ---
  // 動的 import を使わない（Node ESM の挙動が不安定なため require 的に相対 import）
  // 本ファイルは server-only なので同期 import で OK
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pickTopPlan, getAlternativePlans } = require('./plans') as typeof import('./plans');

  const topPlan = pickTopPlan(q);
  if (topPlan) {
    const altPlans = getAlternativePlans(q, topPlan.plan.id, 2);
    return {
      top: planMatchToAnswer(topPlan),
      alternatives: altPlans.map((p) => planMatchToAnswer(p)),
      hasQuery,
      fallbackUsed: false,
    };
  }

  // --- 2) Article フォールバック ---
  const scored = getAllFileArticles()
    .map((article) => {
      const { score, reasons } = scoreArticleForQuery(article, q);
      return { article, score, reasons } as ArticleMatchDetail;
    })
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return (x.article.updatedAt < y.article.updatedAt ? 1 : -1);
    });

  const positives = scored.filter((x) => x.score > 0);

  if (positives.length > 0) {
    return {
      top: articleToAnswer(positives[0]),
      alternatives: positives.slice(1, 3).map(articleToAnswer),
      hasQuery,
      fallbackUsed: false,
    };
  }

  // --- 3) 最終フォールバック：エリア非依存の家遊び or 段取り ---
  const fallbackCandidates = getAllFileArticles().filter((a) => {
    const area = a.area ?? 'all';
    return area === 'all' && (a.category === 'today-nani' || a.category === 'today-mawasu');
  });
  fallbackCandidates.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const fb = fallbackCandidates[0];

  if (!fb) return { top: null, alternatives: [], hasQuery, fallbackUsed: true };

  return {
    top: articleToAnswer({ article: fb, score: 0, reasons: ['エリアに関係なく今日できる候補'] }),
    alternatives: [],
    hasQuery,
    fallbackUsed: true,
  };
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

/**
 * TodayFinder の条件結果ページ用：top answer に関連する記事を
 * スコア順に最大 `limit` 件返す。
 *
 * - excludeSlug があれば除外（articleフォールバック時の本人除外）
 * - excludeRelatedSlug があれば除外（プランの seoRelated と被らない）
 * - スコア > 0 のみ。条件が緩い場合は最新記事で補充して必ず limit 件返す。
 */
export function getRelatedArticlesForQuery(
  q: TodayQuery,
  options?: {
    excludeSlugs?: string[];
    limit?: number;
  },
): FileArticleMeta[] {
  const limit = options?.limit ?? 4;
  const exclude = new Set(options?.excludeSlugs ?? []);

  const scored = getAllFileArticles()
    .filter((a) => !exclude.has(a.slug))
    .map((article) => {
      const { score } = scoreArticleForQuery(article, q);
      return { article, score };
    })
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return x.article.updatedAt < y.article.updatedAt ? 1 : -1;
    });

  const positives = scored.filter((x) => x.score > 0).map((x) => x.article);
  if (positives.length >= limit) return positives.slice(0, limit);

  // 不足分は最新で補充
  const filler = scored
    .filter((x) => x.score <= 0)
    .map((x) => x.article)
    .filter((a) => !positives.find((p) => p.slug === a.slug));

  return [...positives, ...filler].slice(0, limit);
}
