import { NextResponse } from 'next/server';

/**
 * 「行ったよ」レポートの受け口。
 *
 * - MICROCMS_SERVICE_DOMAIN + MICROCMS_REPORTS_API_KEY（書き込み権限つきAPIキー）が
 *   設定されていれば MicroCMS の `spot-reports` エンドポイントに**下書き**として保存する
 *   （公開はMicroCMS管理画面で目視モデレーションしてから）。
 * - 未設定の間は 202 を返して受領のみ（クリック自体はクライアントの GA4 イベントで計測済み）。
 *
 * MicroCMS 側のモデル定義（リスト形式 / エンドポイント: spot-reports）:
 *   spotSlug: テキスト / spotName: テキスト / rating: 数値 / comment: テキスト / ageRange: テキスト
 * セットアップ手順: docs/line-launch-kit.md の付録参照。
 */

const AGE_RANGES = new Set(['0-1', '2-3', '4-6']);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : '';
  const rating = Number(b.rating);
  const comment =
    typeof b.comment === 'string' ? b.comment.trim().slice(0, 60) : '';
  const ageRange =
    typeof b.ageRange === 'string' && AGE_RANGES.has(b.ageRange) ? b.ageRange : '';

  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid rating' }, { status: 400 });
  }

  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  const key = process.env.MICROCMS_REPORTS_API_KEY;
  if (!domain || !key) {
    // 保存先未設定。受領のみ（GA4側で件数は計測されている）。
    return NextResponse.json({ stored: false }, { status: 202 });
  }

  try {
    const res = await fetch(
      `https://${domain}.microcms.io/api/v1/spot-reports?status=draft`,
      {
        method: 'POST',
        headers: {
          'X-MICROCMS-API-KEY': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spotSlug: slug, spotName: name, rating, comment, ageRange }),
      },
    );
    if (!res.ok) {
      return NextResponse.json({ stored: false }, { status: 202 });
    }
    return NextResponse.json({ stored: true });
  } catch {
    return NextResponse.json({ stored: false }, { status: 202 });
  }
}
