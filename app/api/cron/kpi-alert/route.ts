import { NextResponse } from 'next/server';
import { runKpiAlertCheck, buildKpiAlertMessage } from '@/lib/kpi-alert';
import { sendLinePush, isLinePushConfigured } from '@/lib/line';

/**
 * KPI急落アラートの定期実行エンドポイント（Vercel Cron 想定）。
 *
 * 直近7日 vs 前7日 で PV / AdSense収益 をチェックし、閾値以上の下落があれば
 * 運営者へ LINE push する。
 *
 * ## 認可
 * 環境変数 CRON_SECRET の `Authorization: Bearer <secret>` または `?token=<secret>`
 * を必須にする（Vercel Cron は CRON_SECRET を自動で Authorization ヘッダに付与する）。
 * CRON_SECRET 未設定なら 503 で拒否する（fail-closed。2026-10-09 まで未設定だと誰でも実行可だった）。
 *
 * ## クエリ
 * - ?force=1 … 急落が無くても通知を送る（配線の動作確認用）。
 *
 * ## 関連 env
 * GA4_* / ADSENSE_OAUTH_*（集計） / LINE_CHANNEL_ACCESS_TOKEN + LINE_OWNER_USER_ID（通知）
 * / KPI_ALERT_DROP_PCT（既定30） / CRON_SECRET（認可）
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // fail-closed: 未設定なら誰にも許可しない（以前は未設定だと誰でも実行できた）。
  // 本番は CRON_SECRET 設定済み（2026-10-09 確認）。Vercel Cron はこの値を
  // Authorization: Bearer に自動付与する。
  if (!secret) return false;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('token');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === secret || fromHeader === secret;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    // fail-closed: 未設定のままデプロイしても誰にも実行させない
    return NextResponse.json({ ok: false, error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const force = new URL(req.url).searchParams.get('force') === '1';
  const report = await runKpiAlertCheck();

  if (!report.configured) {
    return NextResponse.json({
      ok: true,
      notified: false,
      reason: 'analytics not configured (GA4 / AdSense env unset)',
      report,
    });
  }

  let notified = false;
  if (report.hasAlert || force) {
    if (isLinePushConfigured()) {
      notified = await sendLinePush(buildKpiAlertMessage(report));
    }
  }

  return NextResponse.json({
    ok: true,
    notified,
    hasAlert: report.hasAlert,
    pushConfigured: isLinePushConfigured(),
    report,
  });
}
