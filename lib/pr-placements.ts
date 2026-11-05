/**
 * 有償PR枠（タイアップ）の設定。編集方針 5-3〜5-5 の「タイアップ（有償PR）」区分。
 *
 * - 1つの設定で、トップ（いま人気のスポットの6枚目）・記事・駅ページの枠を出し分ける。
 * - 掲載期間（start〜end、日本時間の日付・両端を含む）の外では表示しない。
 *   ページは ISR（トップ1時間・記事/駅24時間）で再生成されるため、期間の切り替わりは最大1日遅れで反映される。
 * - ランキングの順位には入れない。枠には必ず「PR」と提供元を表示する（景品表示法のステマ規制）。
 * - 同じ面に出すPR枠は1つまで。
 */

export type PrPlace =
  | { kind: 'top' }
  | { kind: 'article'; slug: string; afterHeading: RegExp }
  | { kind: 'station'; slug: string };

export type PrPlacement = {
  id: string;
  /** 提供元名（PR表示に使う） */
  sponsor: string;
  href: string;
  title: string;
  sub: string;
  img: string;
  /** 掲載開始日（日本時間・YYYY-MM-DD・この日を含む） */
  start: string;
  /** 掲載終了日（日本時間・YYYY-MM-DD・この日を含む） */
  end: string;
  places: PrPlace[];
};

export const PR_PLACEMENTS: PrPlacement[] = [
  {
    // 2026-10-05 契約締結（Kids Base／株式会社Imagine International）。公開から3か月。
    id: 'kidsbase-2026-10',
    sponsor: 'Kids Base',
    href: '/article/kids-base-yoyogi-uehara',
    title: 'Kids Base（キッズベース）代々木上原',
    sub: '未就学児〜小学生・貸切もできる完全予約制の室内プレイスペース',
    img: '/photos/kidsbase-hero.webp',
    start: '2026-10-28',
    end: '2027-01-27',
    places: [
      { kind: 'top' },
      { kind: 'article', slug: 'shitsunai-asobi-shibuya-tokyo', afterHeading: /室内遊び場\s*8選/ },
      { kind: 'station', slug: 'yoyogi-uehara' },
    ],
  },
];

function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function isActive(p: PrPlacement, now?: Date): boolean {
  const d = todayJst(now);
  // プレビュー環境（先方の確認用URL）では開始日前でも表示する。本番は期間どおり。
  if (process.env.VERCEL_ENV === 'preview') return d <= p.end;
  return p.start <= d && d <= p.end;
}

export function getTopPr(now?: Date): PrPlacement | null {
  return PR_PLACEMENTS.find((p) => isActive(p, now) && p.places.some((x) => x.kind === 'top')) ?? null;
}

export function getArticlePr(
  slug: string,
  now?: Date,
): { pr: PrPlacement; afterHeading: RegExp } | null {
  for (const p of PR_PLACEMENTS) {
    if (!isActive(p, now) || p.href === `/article/${slug}`) continue;
    const place = p.places.find((x) => x.kind === 'article' && x.slug === slug);
    if (place && place.kind === 'article') return { pr: p, afterHeading: place.afterHeading };
  }
  return null;
}

export function getStationPr(slug: string, now?: Date): PrPlacement | null {
  return (
    PR_PLACEMENTS.find(
      (p) => isActive(p, now) && p.places.some((x) => x.kind === 'station' && x.slug === slug),
    ) ?? null
  );
}
