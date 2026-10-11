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
  return readForCache(key, async () => {
    const r = await kvGetStrict<T>(key);
    if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
    return r.value;
  });
}

function readForCache<V>(memoKey: string, read: () => Promise<V>): Promise<V> {
  if (!IS_BUILD) return read();
  let p = buildMemo.get(memoKey) as Promise<V> | undefined;
  if (!p) {
    p = read();
    buildMemo.set(memoKey, p);
    p.catch(() => buildMemo.delete(memoKey));
  }
  return p;
}

// ── Hash（1キーに field ごとの値を持つ）────────────────────────────
// スポット上書きを slug ごとに分けて持つために使う。値は @vercel/kv が JSON で出し入れする。

type KvRead<V> = { ok: true; value: V | null } | { ok: false; error: string };

/** Hash 全体を読む。読み込み失敗と「キーが無い」（value: null）を区別する。 */
export async function kvHGetAllStrict<T>(key: string): Promise<KvRead<Record<string, T>>> {
  const c = getClient();
  if (!c) return { ok: false, error: 'KV not configured' };
  try {
    return { ok: true, value: ((await c.hgetall(key)) as Record<string, T> | null) ?? null };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[kv] hgetall failed', key, error);
    return { ok: false, error };
  }
}

/** unstable_cache の中から呼ぶ Hash 読み込み（kvGetForCache と同じ約束: 失敗は例外・ビルド中は1回）。 */
export async function kvHGetAllForCache<T>(key: string): Promise<Record<string, T> | null> {
  return readForCache(`hash:${key}`, async () => {
    const r = await kvHGetAllStrict<T>(key);
    if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
    return r.value;
  });
}

/** Hash の1 field を読む。読み込み失敗と「field が無い」（value: null）を区別する。 */
export async function kvHGetStrict<T>(key: string, field: string): Promise<KvRead<T>> {
  const c = getClient();
  if (!c) return { ok: false, error: 'KV not configured' };
  try {
    return { ok: true, value: ((await c.hget<T>(key, field)) as T | null) ?? null };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[kv] hget failed', key, field, error);
    return { ok: false, error };
  }
}

async function kvWrite(label: string, key: string, run: (c: VercelKV) => Promise<unknown>): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    await run(c);
    lastSetError = null;
    return true;
  } catch (e) {
    lastSetError = e instanceof Error ? e.message : String(e);
    console.error(`[kv] ${label} failed`, key, lastSetError);
    return false;
  }
}

/** Hash に field をまとめて書く。失敗理由は getLastKvSetError() で取れる。 */
export function kvHSet(key: string, fields: Record<string, unknown>): Promise<boolean> {
  return kvWrite('hset', key, (c) => c.hset(key, fields));
}

/** Hash から field を消す。 */
export function kvHDel(key: string, field: string): Promise<boolean> {
  return kvWrite('hdel', key, (c) => c.hdel(key, field));
}

/** キーごと消す（移行のやり直しで Hash を空にするため）。 */
export function kvDel(key: string): Promise<boolean> {
  return kvWrite('del', key, (c) => c.del(key));
}

/**
 * 調査用ログ（2026-10-06）。unstable_cache の内側＝キャッシュに無かったときだけ通る場所から呼ぶ。
 * 同じデプロイで何度も出るなら、その値はデータキャッシュに保存できていない
 * （1件 2MB 上限。Next の判定は文字数なので、日本語が多い値はバイト数で超えても警告が出ない）。
 * ビルド中は全ページが内側を通るので出さない。原因が確定したら消す。
 */
export function logOverridesCacheMiss(key: string, value: unknown): void {
  if (IS_BUILD) return;
  const json = JSON.stringify(value);
  console.log(`[kv] cache miss ${key} chars=${json.length} bytes=${Buffer.byteLength(json)}`);
}
