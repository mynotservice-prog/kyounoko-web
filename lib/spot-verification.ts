/**
 * スポット情報の鮮度（最終確認日）を扱う。
 *
 * ── なぜ必要か ──────────────────────────────────────────────
 * 施設DBは作った瞬間から腐る。2026-07 に室内遊び場13本を全数検証したところ、
 * 掲載施設の3〜5割が閉店済み・または実在しなかった（ボーネルンドは都内3店しかない、
 * アネビー お台場/新宿ミロードは閉館済み）。**確認日を持たないDBは資産ではなく負債**で、
 * 掛け算でページを増やすほど誤りが増幅する。
 *
 * ── 方針 ────────────────────────────────────────────────
 *  - 確認日は「人が公式サイト等で裏を取った日」だけを入れる（lib/spot-verification-data.ts）。
 *  - 記録が無いスポットは **未確認と正直に出す**。推測で日付を埋めない。
 *    これは lib/spot-facilities.ts の「未確認は 'yes'/'no' を入れず △ で出す」と同じ原則。
 *  - 閉店リスクはカテゴリで違うので、有効期限もカテゴリで変える。
 */
import type { Spot, SpotCategory, SpotVerification } from './spots';
import { SPOT_CLOSED } from './spot-closed';
import { CHAIN_SPOT_REDIRECTS } from './chain-spot-redirects';

const REDIRECTED_SLUGS = new Set(CHAIN_SPOT_REDIRECTS.map((r) => r.from));

/**
 * 全国チェーン外食など、/spot/[slug] が 301 で記事へ飛ぶスポットか。
 *
 * これらは公開ページとして存在しないので、**再確認キューに入れてはいけない**
 * （存在しないページの設備を確認しに行くことになる）。チェーンの設備情報は
 * リダイレクト先の記事側（例: /article/cocos-kodzure-koryaku）が正本で、
 * 記事本文に独自の「最終確認」チェックリストを持っている。
 */
export function isChainRedirected(slug: string): boolean {
  return REDIRECTED_SLUGS.has(slug);
}

export type VerifyMethod = SpotVerification['method'];
export type { SpotVerification };

/**
 * カテゴリ別の「確認の有効期限」（日数）。
 * 閉店・撤退のリスクが高いほど短くする。
 *  - restaurant / indoor: 商業施設内のテナントが多く入れ替わりが早い（実測で事故が出た層）
 *  - seasonal / amusement: 季節営業・イベント終了・会期変更がある
 *  - park / zoo / aquarium / museum / farm: 公営・大型が中心で寿命が長い
 */
const TTL_DAYS: Record<SpotCategory, number> = {
  restaurant: 180,
  indoor: 180,
  seasonal: 270,
  amusement: 270,
  aquarium: 365,
  zoo: 365,
  museum: 365,
  farm: 365,
  park: 365,
};

export type FreshnessState =
  /** 期限内。確認済みとして出せる */
  | 'fresh'
  /** 期限の75%を過ぎた。そろそろ再確認 */
  | 'aging'
  /** 期限切れ。再確認が必要 */
  | 'stale'
  /** 確認記録が無い */
  | 'unverified'
  /** 閉店・閉館が確認済み（SPOT_CLOSED） */
  | 'closed';

export type Freshness = {
  state: FreshnessState;
  verifiedAt?: string;
  method?: VerifyMethod;
  /** 確認からの経過日数 */
  ageDays?: number;
  /** このカテゴリの有効期限（日数） */
  ttlDays: number;
  /** 期限を過ぎた日数（期限内なら0） */
  overdueDays: number;
};

const DAY = 86400000;

function daysBetween(fromIso: string, now: Date): number {
  const t = Date.parse(`${fromIso}T00:00:00Z`);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((now.getTime() - t) / DAY));
}

/**
 * スポットの鮮度を判定する。now は既定で現在時刻（静的生成ならビルド時点）。
 *
 * 確認記録は spot.verification から読む。**spot.name で引き直さないこと**:
 * spot-overrides で表示名を記事タイトル風に変えているスポットがあり、描画時に
 * 名前で引くと確認済みのスポットが一斉に「未確認」に化ける（実際に踏んだ）。
 */
export function getSpotFreshness(spot: Spot, now: Date = new Date()): Freshness {
  const ttlDays = TTL_DAYS[spot.category] ?? 365;

  if (SPOT_CLOSED[spot.name]) {
    return { state: 'closed', ttlDays, overdueDays: 0 };
  }

  const v = spot.verification;
  if (!v) return { state: 'unverified', ttlDays, overdueDays: 0 };

  const ageDays = daysBetween(v.verifiedAt, now);
  const overdueDays = Math.max(0, ageDays - ttlDays);
  const state: FreshnessState =
    ageDays > ttlDays ? 'stale' : ageDays > ttlDays * 0.75 ? 'aging' : 'fresh';

  return { state, verifiedAt: v.verifiedAt, method: v.method, ageDays, ttlDays, overdueDays };
}

/** 「2026-06-14」→「2026年6月14日」 */
export function formatVerifiedDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/**
 * UI に出す一文。**確認していないものを確認済みに見せない**のがこの関数の役目。
 */
export function freshnessLabel(f: Freshness): { text: string; tone: 'ok' | 'warn' | 'muted' } {
  switch (f.state) {
    case 'closed':
      return { text: '閉館・閉店を確認済みです', tone: 'warn' };
    case 'fresh':
    case 'aging':
      return {
        text:
          f.method === 'visited'
            ? `運営者が訪問して確認（${formatVerifiedDate(f.verifiedAt!)}時点）`
            : `公式サイトで確認（${formatVerifiedDate(f.verifiedAt!)}時点）`,
        tone: f.state === 'fresh' ? 'ok' : 'muted',
      };
    case 'stale':
      return {
        text: `確認は${formatVerifiedDate(f.verifiedAt!)}時点です。その後の変更は反映されていない可能性があります`,
        tone: 'muted',
      };
    case 'unverified':
    default:
      return {
        text: '最終確認日を記録していません。料金・営業時間・設備は公式サイトでご確認ください',
        tone: 'muted',
      };
  }
}

/**
 * 再確認キューの優先度。数字が大きいほど先に直す。
 * 「閉店していたら実害が大きい順」＝ 露出があり、寿命が短いカテゴリから。
 */
export function recheckPriority(spot: Spot, f: Freshness): number {
  if (f.state === 'closed') return 0; // 対処済み
  let p = 0;
  if (f.state === 'stale') p += 100 + Math.min(f.overdueDays, 365);
  else if (f.state === 'unverified') p += 80;
  else if (f.state === 'aging') p += 30;
  // 閉店リスクの高いカテゴリを優先
  if (spot.category === 'restaurant' || spot.category === 'indoor') p += 60;
  else if (spot.category === 'seasonal' || spot.category === 'amusement') p += 25;
  // 露出があるほど実害が大きい
  if (spot.popular) p += 40;
  if (spot.kidReport) p += 20; // 一次情報を載せている＝看板ページ
  return p;
}
