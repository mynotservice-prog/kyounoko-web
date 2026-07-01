import { NextRequest, NextResponse } from 'next/server';
import { listPendingReviews, moderateReview } from '@/lib/reviews';

/**
 * 口コミモデレーション API（P1-8・画面F）。
 * middleware の Basic Auth は /admin 配下のみなので、/api/admin/* はここで自前に検証する。
 */
export const runtime = 'nodejs';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function requireAdmin(req: NextRequest): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = Buffer.from(auth.slice(6).trim(), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const idx = decoded.indexOf(':');
  if (idx === -1) return false;
  return timingSafeEqual(decoded.slice(0, idx), user) && timingSafeEqual(decoded.slice(idx + 1), pass);
}

const UNAUTH = () =>
  new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin area", charset="UTF-8"' },
  });

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return UNAUTH();
  const pending = await listPendingReviews(100);
  return NextResponse.json({ ok: true, pending });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return UNAUTH();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const spotId = typeof body.spotId === 'string' ? body.spotId : '';
  const id = typeof body.id === 'string' ? body.id : '';
  const action = body.action === 'approve' || body.action === 'reject' ? body.action : null;
  if (!spotId || !id || !action) return NextResponse.json({ ok: false, error: 'invalid params' }, { status: 400 });
  const ok = await moderateReview(spotId, id, action);
  return NextResponse.json({ ok });
}
