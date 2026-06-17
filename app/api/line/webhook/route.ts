import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

/**
 * LINE Messaging API Webhook。
 *
 * 主目的（当面）: 運営者が自分の userId を取得するための補助。
 *   bot に「id」等のキーワードを送ると、その人の userId を返信する。
 *   → KPI急落アラート（push通知）の宛先 LINE_OWNER_USER_ID を確定するために使う。
 *
 * 設計:
 *   - 一般ユーザーへの誤返信を避けるため、返信するのは ID_KEYWORDS のときだけ。
 *     それ以外のメッセージには何もしない（フォロワーが増えても無害）。
 *   - userId は console.log にも出すので、Vercel ランタイムログからも拾える（保険）。
 *   - 署名検証は LINE_CHANNEL_SECRET 設定時のみ実施。未設定でも 200 を返し、
 *     LINE の再送ループを避ける（返信には正規の replyToken が必要なので悪用余地は小さい）。
 *
 * 必要 env: LINE_CHANNEL_ACCESS_TOKEN（返信に使用）/ LINE_CHANNEL_SECRET（任意・署名検証）
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const SECRET = process.env.LINE_CHANNEL_SECRET;

/** これらの文言を送ると userId を返信する。 */
const ID_KEYWORDS = new Set(['id', 'myid', 'userid', '/id', 'id確認', 'ＩＤ']);

async function replyText(replyToken: string, text: string): Promise<void> {
  if (!TOKEN) return;
  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
      cache: 'no-store',
    });
  } catch (e) {
    console.error('[line-webhook] reply error', e instanceof Error ? e.message : e);
  }
}

export async function POST(req: Request) {
  const raw = await req.text();

  if (SECRET) {
    const sig = req.headers.get('x-line-signature') ?? '';
    const expected = crypto.createHmac('sha256', SECRET).update(raw).digest('base64');
    if (sig !== expected) {
      return NextResponse.json({ ok: true, skipped: 'bad-signature' });
    }
  }

  let body: { events?: unknown[] } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    /* verify イベント等で空ボディのことがある */
  }

  const events = Array.isArray(body.events) ? body.events : [];
  for (const ev of events as Array<Record<string, any>>) {
    const userId: string | undefined = ev?.source?.userId;
    if (userId) console.log('[line-webhook] userId=', userId);

    if (
      ev?.type === 'message' &&
      ev?.message?.type === 'text' &&
      typeof ev?.replyToken === 'string' &&
      userId
    ) {
      const text = String(ev.message.text ?? '').trim().toLowerCase();
      if (ID_KEYWORDS.has(text)) {
        await replyText(
          ev.replyToken,
          `あなたのuserID（KPIアラート設定用）:\n${userId}`,
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, note: 'LINE webhook endpoint' });
}
