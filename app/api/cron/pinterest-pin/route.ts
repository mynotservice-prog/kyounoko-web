import { NextRequest, NextResponse } from 'next/server';
import { getAllFileArticles, type FileArticleMeta } from '@/lib/articles';
import { isKvConfigured, kvGet, kvSet } from '@/lib/kv-store';
import { buildPinPayload, pinsPerRun, dailyCap } from '@/lib/pinterest-content';
import {
  pinterestConfigured,
  getAccessToken,
  ensureBoard,
  createPin,
} from '@/lib/pinterest';

/**
 * GET /api/cron/pinterest-pin
 *
 * Pinterest 完全自動投稿。1日 3回（vercel.json）走り、公開記事（noindex 以外）
 * のうちまだ投稿していないものを ramp（アカウント年齢に応じた本数）に従って
 * Pinterest へ投稿する。これにより 700本超の公開記事を数か月かけて自動で
 * ピン化し、検索駆動の常緑流入を作る。
 *
 * 認証: CRON_SECRET の Bearer / ?token=（Vercel Cron は Authorization に自動付与）。
 * 必要env: PINTEREST_APP_ID / PINTEREST_APP_SECRET / PINTEREST_REFRESH_TOKEN
 *          / KV_REST_API_URL / KV_REST_API_TOKEN（冪等性に必須）。
 * 冪等性: KV `pinterest:state` に投稿済み slug と初投稿日時を保存して二重投稿を防止。
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PIN_STATE_KEY = 'pinterest:state';

type PinState = {
  /** slug → 投稿日時(ISO) */
  posted: Record<string, string>;
  /** ramp（アカウント年齢）算出用の初投稿日時(ISO)。 */
  firstPostedAt: string | null;
};

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('token');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === secret || fromHeader === secret;
}

/** JST 当日の開始時刻（epoch ms）を返す。投稿数の日次カウント用。 */
function startOfJstDayMs(): number {
  const now = Date.now();
  const JST = 9 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((now + JST) / dayMs) * dayMs - JST;
}

/** カテゴリを順繰りに混ぜて、フィードが単調にならないよう並べ替える。 */
function interleaveByCategory(articles: FileArticleMeta[]): FileArticleMeta[] {
  const buckets = new Map<string, FileArticleMeta[]>();
  for (const a of articles) {
    const arr = buckets.get(a.category) ?? [];
    arr.push(a);
    buckets.set(a.category, arr);
  }
  const queues = [...buckets.values()];
  const out: FileArticleMeta[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

export async function GET(request: NextRequest) {
  // 認証: 通常は Vercel Cron（isAuthorized / CRON_SECRET）。加えて、オーナーが
  // 手動で動作確認するための専用トークン ?trigger=<PINTEREST_MANUAL_TRIGGER> を
  // 許可する（既存 cron 認証は変更しない・専用の秘密値でのみ発火）。
  const manualToken = request.nextUrl.searchParams.get('trigger');
  const expected = (process.env.PINTEREST_MANUAL_TRIGGER || '').trim();
  const manualOk = expected.length > 0 && manualToken === expected;
  if (!isAuthorized(request) && !manualOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!pinterestConfigured()) {
    return NextResponse.json({
      skipped: 'Pinterest env not set',
      need: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET', 'PINTEREST_REFRESH_TOKEN'],
    });
  }
  // 冪等性ストアが無いと同じ記事を毎回投稿してスパムになるため、KV必須。
  if (!isKvConfigured()) {
    return NextResponse.json({
      skipped: 'KV not configured (idempotency store required)',
      need: ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    });
  }

  // 1) 既投稿 slug・アカウント年齢・本日の投稿数を KV から集計
  const state: PinState = (await kvGet<PinState>(PIN_STATE_KEY)) ?? {
    posted: {},
    firstPostedAt: null,
  };
  const postedSlugs = new Set(Object.keys(state.posted));

  const firstAt = state.firstPostedAt ? new Date(state.firstPostedAt) : null;
  const ageDays = firstAt
    ? Math.floor((Date.now() - firstAt.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  const todayStartMs = startOfJstDayMs();
  const postedToday = Object.values(state.posted).filter(
    (iso) => new Date(iso).getTime() >= todayStartMs,
  ).length;

  // 2) 今回の投稿本数を決定（ramp × 日次上限）
  const perRun = pinsPerRun(ageDays);
  const capLeft = Math.max(0, dailyCap(ageDays) - postedToday);
  const target = Math.min(perRun, capLeft);

  if (target <= 0) {
    return NextResponse.json({
      ok: true,
      posted: 0,
      reason: 'daily cap reached',
      ageDays,
      postedToday,
    });
  }

  // 3) 未投稿の公開記事（noindex 以外）をカテゴリ混ぜで選定
  const published = getAllFileArticles().filter((a) => !a.noindex);
  const candidates = interleaveByCategory(
    published.filter((a) => !postedSlugs.has(a.slug)),
  );

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      posted: 0,
      reason: 'all published articles already pinned',
    });
  }

  // 4) アクセストークン発行 → 1本ずつ投稿
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    return NextResponse.json(
      { error: 'token refresh failed', detail: String(e) },
      { status: 502 },
    );
  }

  const boardCache = new Map<string, string>();
  const results: { slug: string; ok: boolean; pinId?: string; error?: string }[] = [];
  let consecutiveFailures = 0;
  const nowIso = new Date().toISOString();

  for (const article of candidates) {
    if (results.filter((r) => r.ok).length >= target) break;
    if (consecutiveFailures >= 2) break; // ポイズン回避: 連続失敗で打ち切り

    const payload = buildPinPayload(article);
    try {
      const boardId = await ensureBoard(
        accessToken,
        payload.boardName,
        payload.boardDescription,
        boardCache,
      );
      const pin = await createPin(accessToken, {
        boardId,
        title: payload.title,
        description: payload.description,
        link: payload.link,
        imageUrl: payload.imageUrl,
      });

      state.posted[article.slug] = nowIso;
      if (!state.firstPostedAt) state.firstPostedAt = nowIso;

      results.push({ slug: article.slug, ok: true, pinId: pin.id });
      consecutiveFailures = 0;
    } catch (e) {
      // 失敗時は記録せず次回リトライ。連続失敗はクォータ保護で打ち切る。
      results.push({ slug: article.slug, ok: false, error: String(e) });
      consecutiveFailures += 1;
    }
  }

  const posted = results.filter((r) => r.ok).length;
  // 1本でも投稿できたら state を保存（冪等性の永続化）。
  if (posted > 0) await kvSet(PIN_STATE_KEY, state);

  return NextResponse.json({
    ok: true,
    posted,
    target,
    ageDays,
    postedToday: postedToday + posted,
    remaining: candidates.length - posted,
    results,
  });
}
