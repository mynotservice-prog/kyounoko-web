import { NextRequest, NextResponse } from 'next/server';
import { isKvConfigured } from '@/lib/kv-store';
import { reportReview, hashIp, checkRateLimit } from '@/lib/reviews';

/**
 * 口コミの通報（P1-8）。通報された口コミは公開から外し pending に戻して再モデレーション。
 * 濫用防止に IP レート制限を課す。
 */
export const runtime = 'nodejs';

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  if (!isKvConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const rl = await checkRateLimit(hashIp(clientIp(req)) + ':report');
  if (!rl.ok) return NextResponse.json({ ok: false, error: rl.error }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const spotId = typeof body.spotId === 'string' ? body.spotId : '';
  const id = typeof body.id === 'string' ? body.id : '';
  if (!spotId || !id) return NextResponse.json({ ok: false }, { status: 400 });
  await reportReview(spotId, id);
  return NextResponse.json({ ok: true });
}
