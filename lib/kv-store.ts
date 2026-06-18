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

export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    await c.set(key, value as never);
    return true;
  } catch (e) {
    console.error('[kv] set failed', key, e instanceof Error ? e.message : e);
    return false;
  }
}
