import type { FileArticleMeta } from './articles';

/**
 * 記事 → Pinterest ピンのメタデータ変換と、新規アカウント向けの
 * 投稿ペース（ramp）設定をまとめた純粋ロジック。
 *
 * - 外部 API も KV も触らない（テスト・再利用しやすいように分離）。
 * - 実際の投稿は lib/pinterest.ts（API）と
 *   app/api/cron/pinterest-pin/route.ts（cron）が行う。
 */

export const PIN_BASE_URL = 'https://kyounoko.jp';

/**
 * カテゴリ（frontmatter の category スラッグ・7種）→ Pinterest ボード定義。
 * name はそのまま Pinterest 上のボード名になるので、検索されやすい
 * 日本語キーワードを含める。description はボードの説明文（SEO 効果あり）。
 */
export const BOARD_BY_CATEGORY: Record<
  string,
  { name: string; description: string }
> = {
  'today-doko': {
    name: '子連れおでかけスポット',
    description:
      '子連れで楽しめるおでかけ先・室内あそび場・公園・お出かけスポットを地域別にまとめています。ベビーカーOK・授乳室情報も。｜きょうのこ',
  },
  'today-mawasu': {
    name: '子育ての段取り・時短・ラク家事',
    description:
      'ワンオペ・共働きの1日をラクに回すコツ。時短家事、生活リズム、寝かしつけ、イヤイヤ期の乗り切り方まで。｜きょうのこ',
  },
  'today-taberu': {
    name: '子連れランチ・外食・ファミレス',
    description:
      '子連れOKの外食・ファミレス・カフェ情報。キッズメニュー、離乳食持ち込み、ベビーチェアの有無を実用目線でまとめています。｜きょうのこ',
  },
  yakudatsu: {
    name: '育児のお役立ち・便利グッズ',
    description:
      '育児がラクになる便利グッズ・ベビー用品・選び方ガイド。買ってよかったもの、年齢別の必需品を紹介。｜きょうのこ',
  },
  'today-nani': {
    name: 'おうち遊び・室内あそび',
    description:
      '雨の日や在宅時のおうち遊び・室内あそびアイデア。年齢別の手作り遊び、知育、体を使う遊びまで。｜きょうのこ',
  },
  narai: {
    name: '子どもの習い事と学び',
    description:
      '子どもの習い事・幼児教育・知育の選び方。始める時期、費用相場、続けるコツを親目線でまとめています。｜きょうのこ',
  },
  gyouji: {
    name: '季節の行事・イベント・行事あそび',
    description:
      'お正月・節分・ひな祭り・七夕・クリスマスなど、子どもと楽しむ季節の行事とイベントの過ごし方。｜きょうのこ',
  },
};

/** ボード未定義カテゴリのフォールバック。 */
const DEFAULT_BOARD = BOARD_BY_CATEGORY['today-doko'];

/** カテゴリ別の検索ハッシュタグ（Pinterest 検索で拾われやすい一般語）。 */
const HASHTAGS_BY_CATEGORY: Record<string, string[]> = {
  'today-doko': ['子連れおでかけ', 'おでかけ', '子連れ', 'お出かけスポット'],
  'today-mawasu': ['育児', '子育て', '時短', 'ワンオペ育児'],
  'today-taberu': ['子連れランチ', '子連れ外食', 'ファミレス', '子連れ'],
  yakudatsu: ['育児グッズ', 'ベビーグッズ', '子育て', '便利グッズ'],
  'today-nani': ['おうち遊び', '室内遊び', '子どもと遊ぶ', '知育'],
  narai: ['習い事', '子どもの習い事', '知育', '幼児教育'],
  gyouji: ['季節の行事', 'イベント', '行事', '子どもと'],
};

/** どのカテゴリにも付ける汎用タグ（ブランド想起用）。 */
const COMMON_HASHTAGS = ['きょうのこ'];

export interface PinPayload {
  /** Pinterest title（最大100字） */
  title: string;
  /** Pinterest description（最大800字。検索用にキーワード＋ハッシュタグ） */
  description: string;
  /** クリック遷移先（UTM付きの記事URL） */
  link: string;
  /** media_source.url に渡す縦長ピン画像の公開URL */
  imageUrl: string;
  /** 投稿先ボードのカテゴリ */
  category: string;
  boardName: string;
  boardDescription: string;
}

function clamp(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

/** タイトルから縦長Pinで冗長な装飾を外す（角括弧プレフィックス・全角パイプ）。 */
function cleanTitle(raw: string): string {
  return raw
    .replace(/^【[^】]*】/, '')
    .replace(/[｜|]/g, ' ')
    .trim();
}

/** 記事から Pinterest ピンのメタデータを生成する。 */
export function buildPinPayload(article: FileArticleMeta): PinPayload {
  const board = BOARD_BY_CATEGORY[article.category] ?? DEFAULT_BOARD;

  const title = clamp(cleanTitle(article.title), 100);

  // カテゴリ汎用ハッシュタグ + ブランドタグ（重複排除・最大5）
  const tagPool = [...(HASHTAGS_BY_CATEGORY[article.category] ?? []), ...COMMON_HASHTAGS];
  const seen = new Set<string>();
  const hashtags: string[] = [];
  for (const t of tagPool) {
    const clean = t.replace(/[#＃\s]/g, '');
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    hashtags.push('#' + clean);
    if (hashtags.length >= 5) break;
  }

  const bodyText = (article.metaDescription || article.lede || '').trim();
  const body = clamp(bodyText, 800 - 1 - hashtags.join(' ').length - 2);
  const description = `${body}\n${hashtags.join(' ')}`.slice(0, 800);

  const link = `${PIN_BASE_URL}/article/${article.slug}?utm_source=pinterest&utm_medium=social&utm_campaign=auto-pin`;
  const imageUrl = `${PIN_BASE_URL}/api/pin-image?title=${encodeURIComponent(title)}&cat=${encodeURIComponent(article.category)}`;

  return {
    title,
    description,
    link,
    imageUrl,
    category: article.category,
    boardName: board.name,
    boardDescription: board.description,
  };
}

/**
 * 新規アカウントは一気に大量投稿するとスパム判定されるため、
 * アカウントの「初投稿からの経過日数」に応じて1日の投稿数を自動的に増やす。
 *
 * cron は 1日 N 回（PIN_CRON_RUNS_PER_DAY）走る前提で、
 * 1回あたりの投稿数（pinsPerRun）を返す。
 */
export const PIN_CRON_RUNS_PER_DAY = 3;

export function pinsPerRun(ageDays: number): number {
  // 0-13日: 3/日（1/run）, 14-29日: 6/日（2/run）, 30日〜: 9/日（3/run）
  if (ageDays < 14) return 1;
  if (ageDays < 30) return 2;
  return 3;
}

/** 1日の上限（安全弁）。pinsPerRun × runs より少し上に置く。 */
export function dailyCap(ageDays: number): number {
  return pinsPerRun(ageDays) * PIN_CRON_RUNS_PER_DAY + 2;
}
