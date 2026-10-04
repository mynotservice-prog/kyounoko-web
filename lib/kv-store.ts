/**
 * Vercel KV（Upstash Redis）薄ラッパ。
 *
 * 目的: admin編集データ（スポット/イベント上書き・KPI・記事上書き）を
 *   「ビルド時バンドル」から「実行時に読めるストア」へ移し、保存→デプロイ不要にする。
 *
 * セットアップ: Vercel → Storage で KV(Upstash) を作成すると env が自動注入される。
 *   - KV_REST_API_URL / KV_REST_API_TOKEN（または UPSTASH_REDIS_REST_URL / _TOKEN）
 *
 * 未設定時は isKvConfigured()=false。呼び出し側はバンドルJSONにフォールバックするので、
 * ストア作成前は今までどおりの挙動（git commit→デプロイ）になる。
 */
import { createClient, type VercelKV } from '@vercel/kv';

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function isKvConfigured(): boolean {
  return !!(URL && TOKEN);
}

let client: VercelKV | null = null;
function getClient(): VercelKV | null {
  if (!isKvConfigured()) return null;
  if (!client) client = createClient({ url: URL!, token: TOKEN! });
  return client;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    return ((await c.get<T>(key)) as T | null) ?? null;
  } catch (e) {
    console.error('[kv] get failed', key, e instanceof Error ? e.message : e);
    return null;
  }
}

/** 直近の kvSet 失敗理由（admin 画面にそのまま出して原因を切り分けるため）。 */
let lastSetError: string | null = null;
export function getLastKvSetError(): string | null {
  return lastSetError;
}

export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    await c.set(key, value as never);
    lastSetError = null;
    return true;
  } catch (e) {
    lastSetError = e instanceof Error ? e.message : String(e);
    console.error('[kv] set failed', key, lastSetError);
    return false;
  }
}

/**
 * 読み込み失敗と「キーが無い」を区別する get。
 * 全体を1キーで上書き保存するデータ（spot/event overrides 等）は、読み込みに失敗したまま
 * 保存するとバンドルの古い値で KV を上書きして編集内容が消えるため、こちらを使う。
 */
export async function kvGetStrict<T>(key: string): Promise<{ ok: true; value: T | null } | { ok: false; error: string }> {
  const c = getClient();
  if (!c) return { ok: false, error: 'KV not configured' };
  try {
    return { ok: true, value: ((await c.get<T>(key)) as T | null) ?? null };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[kv] get failed', key, error);
    return { ok: false, error };
  }
}

/**
 * unstable_cache の中から呼ぶ読み込み。
 *
 * - 失敗は例外にする。unstable_cache は戻り値をデータキャッシュに保存するので、失敗時に
 *   バンドルを返すと「古いバンドル」がキャッシュに残り、KV が復旧しても表示が戻らない。
 *   フォールバックはキャッシュの外（呼び出し側の catch）で行う。
 * - `next build` 中はプロセス内で1キー1回だけ読む。ビルドでは unstable_cache がページ間で
 *   効かず、スポット詳細・記事など数千ページがそれぞれ 1MB 超の上書きマップを読み直していた
 *   （2026-10 に Upstash Free の月間転送量 10GB を超えて停止。日別転送量がデプロイ回数と連動）。
 */
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const buildMemo = new Map<string, Promise<unknown>>();

export async function kvGetForCache<T>(key: string): Promise<T | null> {
  const read = async (): Promise<T | null> => {
    const r = await kvGetStrict<T>(key);
    if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
    return r.value;
  };
  if (!IS_BUILD) return read();
  let p = buildMemo.get(key) as Promise<T | null> | undefined;
  if (!p) {
    p = read();
    buildMemo.set(key, p);
    p.catch(() => buildMemo.delete(key));
  }
  return p;
}
