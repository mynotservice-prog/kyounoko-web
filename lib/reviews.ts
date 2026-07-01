/**
 * ログイン不要の口コミ（P1-8）。ストレージは Vercel KV(Upstash)。
 *
 * 方針（docs/kaishu-plan-2026-07.md §3）:
 * - reviews:{spotId}   … そのスポットの全レビュー（status付き）
 * - reviews:pending    … モデレーション用の未承認参照 [{spotId,id,createdAt}]
 * - rating:{spotId}    … 承認済みから集計した {avg,count}（承認時に再計算しキャッシュ）
 * - rate:{ipHash}      … IPレート制限用のタイムスタンプ配列
 *
 * 承認制：投稿は status=pending で入り、編集部が承認して初めて画面Cに出る。
 * KV未設定（ローカル等）では投稿は受け付けず、表示は空（ページを壊さない）。
 */
import { createHash } from 'node:crypto';
import { kvGet, kvSet, isKvConfigured } from './kv-store';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ChildAgeBand = '0-1' | '2-3' | '4-6';

export type Review = {
  id: string;
  spotId: string;
  rating: number; // 1..5
  nickname: string; // or '匿名'
  isAnonymous: boolean;
  childAgeBand?: ChildAgeBand;
  body: string;
  status: ReviewStatus;
  createdAt: number;
  reviewedAt?: number;
};

export type PendingRef = { spotId: string; id: string; createdAt: number };
export type Rating = { avg: number; count: number };

export type ReviewInput = {
  spotId: string;
  rating: number;
  nickname: string;
  isAnonymous: boolean;
  childAgeBand?: ChildAgeBand;
  body: string;
};

const NG_WORDS = [
  '死ね', '殺す', 'キチガイ', 'ブス', 'デブ', 'カス', 'クズ',
  'セックス', 'エロ', 'アダルト', '出会い系', '副業', '稼げる', '儲かる',
  'ビットコイン', '仮想通貨', 'エステ', '融資', 'バイアグラ',
];

export function hashIp(ip: string): string {
  const salt = process.env.REVIEW_IP_SALT || 'kyounoko-review';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 24);
}

/** レビューID（時刻＋乱数）。KV外なので Date.now/Math.random 使用可。 */
function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- バリデーション ----------
export function validateReview(input: Partial<ReviewInput>): { ok: true; value: ReviewInput } | { ok: false; error: string } {
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: '評価は1〜5で選んでください' };

  const isAnonymous = !!input.isAnonymous;
  let nickname = (input.nickname ?? '').trim();
  if (isAnonymous) nickname = '匿名';
  if (!nickname || nickname.length > 20) return { ok: false, error: 'ニックネームは1〜20字で入力してください' };

  const body = (input.body ?? '').trim();
  if (body.length < 10 || body.length > 500) return { ok: false, error: '本文は10〜500字で入力してください' };

  // NGワード
  const hay = `${nickname}\n${body}`;
  if (NG_WORDS.some((w) => hay.includes(w))) return { ok: false, error: '不適切な表現が含まれています' };
  // URL過多（宣伝スパム）
  const urlCount = (body.match(/https?:\/\//gi) || []).length;
  if (urlCount >= 2) return { ok: false, error: 'URLを多く含む投稿はできません' };

  const band = input.childAgeBand;
  const childAgeBand = band === '0-1' || band === '2-3' || band === '4-6' ? band : undefined;

  const spotId = (input.spotId ?? '').trim();
  if (!spotId) return { ok: false, error: 'スポットが不正です' };

  return { ok: true, value: { spotId, rating, nickname, isAnonymous, childAgeBand, body } };
}

// ---------- レート制限（同IP: 1分1件 / 1日5件） ----------
export async function checkRateLimit(ipHash: string): Promise<{ ok: boolean; error?: string }> {
  const key = `rate:${ipHash}`;
  const now = Date.now();
  const stamps = (await kvGet<number[]>(key)) ?? [];
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const recent = stamps.filter((t) => t > dayAgo);
  if (recent.some((t) => t > now - 60 * 1000)) return { ok: false, error: '投稿間隔が短すぎます。少し時間をおいてください' };
  if (recent.length >= 5) return { ok: false, error: '本日の投稿上限に達しました' };
  recent.push(now);
  await kvSet(key, recent);
  return { ok: true };
}

// ---------- Turnstile ----------
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // 未設定なら検証をスキップ（開発/未導入時。本番はenv必須）
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch {
    return false;
  }
}

// ---------- 書き込み ----------
export async function submitReview(input: ReviewInput): Promise<Review> {
  const review: Review = {
    id: newId(),
    ...input,
    status: 'pending',
    createdAt: Date.now(),
  };
  const listKey = `reviews:${input.spotId}`;
  const list = (await kvGet<Review[]>(listKey)) ?? [];
  list.push(review);
  await kvSet(listKey, list);

  const pending = (await kvGet<PendingRef[]>('reviews:pending')) ?? [];
  pending.push({ spotId: input.spotId, id: review.id, createdAt: review.createdAt });
  await kvSet('reviews:pending', pending);
  return review;
}

// ---------- 読み取り（表示） ----------
export async function getApprovedReviews(spotId: string): Promise<Review[]> {
  if (!isKvConfigured()) return [];
  const list = (await kvGet<Review[]>(`reviews:${spotId}`)) ?? [];
  return list.filter((r) => r.status === 'approved').sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRating(spotId: string): Promise<Rating> {
  if (!isKvConfigured()) return { avg: 0, count: 0 };
  const cached = await kvGet<Rating>(`rating:${spotId}`);
  if (cached) return cached;
  return computeRating(spotId);
}

async function computeRating(spotId: string): Promise<Rating> {
  const approved = (await kvGet<Review[]>(`reviews:${spotId}`))?.filter((r) => r.status === 'approved') ?? [];
  const count = approved.length;
  const avg = count ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  const rating = { avg, count };
  await kvSet(`rating:${spotId}`, rating);
  return rating;
}

// ---------- モデレーション ----------
export async function listPendingReviews(limit = 50): Promise<Review[]> {
  const pending = (await kvGet<PendingRef[]>('reviews:pending')) ?? [];
  const out: Review[] = [];
  const bySpot = new Map<string, Review[]>();
  for (const ref of pending.slice(0, limit)) {
    let list = bySpot.get(ref.spotId);
    if (!list) {
      list = (await kvGet<Review[]>(`reviews:${ref.spotId}`)) ?? [];
      bySpot.set(ref.spotId, list);
    }
    const r = list.find((x) => x.id === ref.id && x.status === 'pending');
    if (r) out.push(r);
  }
  return out.sort((a, b) => a.createdAt - b.createdAt);
}

export async function moderateReview(spotId: string, id: string, action: 'approve' | 'reject'): Promise<boolean> {
  const listKey = `reviews:${spotId}`;
  const list = (await kvGet<Review[]>(listKey)) ?? [];
  const r = list.find((x) => x.id === id);
  if (!r) return false;
  r.status = action === 'approve' ? 'approved' : 'rejected';
  r.reviewedAt = Date.now();
  await kvSet(listKey, list);

  // pending から除去
  const pending = (await kvGet<PendingRef[]>('reviews:pending')) ?? [];
  await kvSet('reviews:pending', pending.filter((p) => !(p.spotId === spotId && p.id === id)));

  // ★平均を再計算
  await computeRating(spotId);
  return true;
}
