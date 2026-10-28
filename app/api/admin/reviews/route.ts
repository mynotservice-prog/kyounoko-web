import { NextRequest, NextResponse } from 'next/server';
import { listPendingReviews, moderateReview, promoteReviewPhoto } from '@/lib/reviews';
import { constantTimeEqual, readAdminSessionCookie, verifyAdminSessionValue } from '@/lib/admin-session';

/**
 * 口コミモデレーション API（P1-8・画面F）。
 * middleware の Basic Auth は 2026-10-09 から /api/admin/* にもかかるが、
 * 多層防御としてここでも自前に検証する（二重でも壊れない）。
 * 2026-10-10 から middleware は Basic 成功時に署名付きセッションクッキーを発行し、
 * ブラウザの fetch はそのクッキーで通る。ここも同じ検証関数（lib/admin-session.ts）で
 * クッキーを受け付ける。middleware を通過した印を内部ヘッダで渡す方式は偽装できるので採らない。
 */
export const runtime = 'nodejs';

function hasValidBasic(req: NextRequest): boolean {
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
  return constantTimeEqual(decoded.slice(0, idx), user) && constantTimeEqual(decoded.slice(idx + 1), pass);
}

async function requireAdmin(req: NextRequest): Promise<boolean> {
  if (hasValidBasic(req)) return true;
  return verifyAdminSessionValue(readAdminSessionCookie(req.headers));
}

const UNAUTH = () =>
  new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin area", charset="UTF-8"' },
  });

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return UNAUTH();
  const pending = await listPendingReviews(100);
  return NextResponse.json({ ok: true, pending });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return UNAUTH();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const spotId = typeof body.spotId === 'string' ? body.spotId : '';
  const id = typeof body.id === 'string' ? body.id : '';
  if (!spotId || !id) return NextResponse.json({ ok: false, error: 'invalid params' }, { status: 400 });

  // 代表画像への昇格（P1-8b）
  if (body.action === 'promote') {
    const url = typeof body.url === 'string' ? body.url : '';
    if (!url) return NextResponse.json({ ok: false, error: 'url required' }, { status: 400 });
    const ok = await promoteReviewPhoto(spotId, id, url);
    return NextResponse.json({ ok });
  }

  const action = body.action === 'approve' || body.action === 'reject' ? body.action : null;
  if (!action) return NextResponse.json({ ok: false, error: 'invalid action' }, { status: 400 });
  const ok = await moderateReview(spotId, id, action);
  return NextResponse.json({ ok });
}
