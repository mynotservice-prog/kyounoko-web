import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { isBlobConfigured, uploadToBlob } from '@/lib/blob-store';
import { hashIp, checkRateLimit } from '@/lib/reviews';

/**
 * 口コミ写真アップロード（P1-8b）。
 * - jpg/png/webp・5MBまで。
 * - sharp で EXIF（位置情報含む）を除去し、向きを正規化＋長辺1600pxにリサイズして webp 化。
 * - Vercel Blob に保存し公開URLを返す。投稿本体(/api/reviews)にそのURLを渡す。
 */
export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ ok: false, error: '現在、写真投稿を受け付けていません' }, { status: 503 });
  }
  // アップロードも同じIPレート制限に載せる（連投・DoS対策）
  const rl = await checkRateLimit(hashIp(clientIp(req)) + ':upload');
  if (!rl.ok) return NextResponse.json({ ok: false, error: rl.error }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: '不正なリクエストです' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'ファイルがありません' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: 'jpg / png / webp のみ対応しています' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: '1枚5MBまでです' }, { status: 400 });

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // sharp はデフォルトでメタデータを引き継がない＝EXIF(GPS含む)は除去される。
    // rotate() で撮影向きを反映してからリサイズ・webp化。
    const output = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const name = `reviews/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const url = await uploadToBlob(name, output, 'image/webp');
    if (!url) return NextResponse.json({ ok: false, error: 'アップロードに失敗しました' }, { status: 500 });
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, error: '画像の処理に失敗しました' }, { status: 400 });
  }
}
