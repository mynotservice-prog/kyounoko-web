import { NextResponse } from 'next/server';
import { buildWeekendMessage } from '@/lib/weekend-suggest';
import { sendLineBroadcast, sendLinePush, isLineConfigured, isLinePushConfigured } from '@/lib/line';

/**
 * 週次LINE配信「今週末どこ行く？」の定期実行エンドポイント（Vercel Cron）。
 *
 * 毎週金曜20:00 JST（= 金曜11:00 UTC, cron "0 11 * * 5"）に、東京の週末天気に
 * 合わせたおでかけ3択を生成し、友だち全員へ broadcast する。同じ内容を運営者にも push する。
 *
 * ## 認可
 * CRON_SECRET がセットされている場合、`Authorization: Bearer <secret>` または
 * `?token=<secret>` を必須にする（Vercel Cron は自動で Authorization に付与）。
 *
 * ## クエリ（動作確認用）
 * - ?dryRun=1  … 送信せず、生成した本文と選定結果だけJSONで返す
 * - ?preview=1 … broadcast せず、運営者本人にだけ push（本番前の見え方確認）
 *
 * ## 関連 env
 * LINE_CHANNEL_ACCESS_TOKEN（broadcast）/ LINE_OWNER_USER_ID（運営者控え）/ CRON_SECRET（認可）
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('token');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === secret || fromHeader === secret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1';
  const preview = url.searchParams.get('preview') === '1';

  let built;
  try {
    built = await buildWeekendMessage();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'build failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const base = {
    ok: true,
    mode: built.mode,
    weather: built.weather,
    spots: built.spots.map((s) => s.name),
    text: built.text,
    lineConfigured: isLineConfigured(),
  };

  if (dryRun) {
    return NextResponse.json({ ...base, sent: false, dryRun: true });
  }

  if (preview) {
    const pushed = isLinePushConfigured() ? await sendLinePush(built.text) : false;
    return NextResponse.json({ ...base, sent: false, preview: true, ownerPushed: pushed });
  }

  const broadcasted = await sendLineBroadcast(built.text);
  // 運営者にも同じ内容を控えとして push（配信ログの代わり）
  if (isLinePushConfigured()) {
    await sendLinePush(`【週末配信を送信】\n${built.text}`);
  }

  return NextResponse.json({ ...base, sent: broadcasted });
}
