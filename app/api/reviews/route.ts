import { NextRequest, NextResponse } from 'next/server';
import { isKvConfigured } from '@/lib/kv-store';
import {
  validateReview,
  hashIp,
  checkRateLimit,
  verifyTurnstile,
  submitReview,
} from '@/lib/reviews';

/**
 * 口コミ投稿（P1-8）。ログイン不要のため多層防御：
 * Turnstile → サーバ側バリデーション(★/字数/NGワード/URL過多) → IPレート制限 → 承認制で保存。
 */
export const runtime = 'nodejs';

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json({ ok: false, error: '現在、口コミ投稿を受け付けていません' }, { status: 503 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: '不正なリクエストです' }, { status: 400 });
  }

  const ip = clientIp(req);

  // 1) Turnstile（未設定環境ではスキップ）
  const okCaptcha = await verifyTurnstile(typeof payload.turnstileToken === 'string' ? payload.turnstileToken : undefined, ip);
  if (!okCaptcha) {
    return NextResponse.json({ ok: false, error: '認証に失敗しました。もう一度お試しください' }, { status: 400 });
  }

  // 2) バリデーション（サーバ側で全項目再検査）
  const v = validateReview({
    spotId: typeof payload.spotId === 'string' ? payload.spotId : '',
    rating: Number(payload.rating),
    nickname: typeof payload.nickname === 'string' ? payload.nickname : '',
    isAnonymous: !!payload.isAnonymous,
    childAgeBand: payload.childAgeBand as never,
    body: typeof payload.body === 'string' ? payload.body : '',
  });
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  // 3) IPレート制限
  const ipHash = hashIp(ip);
  const rl = await checkRateLimit(ipHash);
  if (!rl.ok) return NextResponse.json({ ok: false, error: rl.error }, { status: 429 });

  // 4) 承認制で保存
  await submitReview(v.value);
  return NextResponse.json({ ok: true });
}
