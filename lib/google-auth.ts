/**
 * Google API 共通の Service Account 認証ヘルパ。
 *
 * GSC（lib/search-console.ts）と同じ GOOGLE_APPLICATION_CREDENTIALS_JSON を流用して、
 * GA4 Data API / AdSense Management API のアクセストークンも取得できるようにする。
 *
 * セットアップ:
 *   1. GSC と同じ Service Account の JSON を Vercel env GOOGLE_APPLICATION_CREDENTIALS_JSON に設定（設定済みなら流用）
 *   2. 利用したい API ごとに Service Account のメールアドレスへ閲覧権限を付与
 *      - GA4:    対象プロパティの「プロパティのアクセス管理」で「閲覧者」追加 + env GA4_PROPERTY_ID（数値ID）
 *      - AdSense: AdSense は Service Account 共有非対応のため、後述（lib/adsense.ts）参照
 *
 * 未設定時は null を返し、呼び出し側はグレースフルに空表示する。
 */
import { JWT } from 'google-auth-library';
import { existsSync, readFileSync } from 'node:fs';

/**
 * ローカル開発フォールバック。
 *
 * 本番(Vercel)は env に全部入っているが、手元の .env.local には秘密鍵が無いため、
 * これまで管理画面の GSC / GA4 系がすべて「未連携」表示になり、ローカルで検証できなかった。
 * IndexNow 用に置いてある読み取り専用SA（credentials/google-indexing.json）は
 * Search Console と GA4 の両方に権限があるので、開発時だけこれを流用する。
 *
 * `NODE_ENV === 'production'`（next build / next start / Vercel）では一切動かない。
 * 本番の挙動を変えないことがこのフォールバックの前提条件。
 */
const IS_DEV = process.env.NODE_ENV !== 'production';

/** 開発時のみ、既定値を返す。本番では undefined のまま（＝未設定は未設定として扱う） */
function devFallback<T>(value: T | undefined, fallback: T): T | undefined {
  if (value) return value;
  return IS_DEV ? fallback : undefined;
}

function resolveCredentialsJson(): string | undefined {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (fromEnv) return fromEnv;
  if (!IS_DEV) return undefined;
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH ?? './credentials/google-indexing.json';
  const path = raw.replace(/^~/, process.env.HOME ?? '');
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  } catch {
    return undefined;
  }
}

const CREDS = resolveCredentialsJson();

/** 認証情報の実体（env またはローカルのSAファイル）。他の lib はこれを使う */
export function getGoogleCredentialsJson(): string | undefined {
  return CREDS;
}

/** GA4 プロパティID。数値IDなので開発フォールバックとして直書きしてよい（秘密情報ではない） */
export function getGa4PropertyId(): string | undefined {
  return devFallback(process.env.GA4_PROPERTY_ID, '533628127');
}

/** Search Console のサイトURL。scripts/gsc-report.mjs と同じ既定値 */
export function getSearchConsoleSiteUrl(): string | undefined {
  return devFallback(process.env.SEARCH_CONSOLE_SITE_URL, 'sc-domain:kyounoko.jp');
}

export function isGoogleConfigured(): boolean {
  return !!CREDS;
}

// scope の組み合わせごとに JWT クライアントをキャッシュ
const clientCache = new Map<string, JWT>();

export async function getGoogleAccessToken(scopes: string[]): Promise<string | null> {
  if (!CREDS) return null;
  const key = scopes.slice().sort().join(' ');
  let client = clientCache.get(key);
  if (!client) {
    let credentials: { client_email?: string; private_key?: string };
    try {
      credentials = JSON.parse(CREDS);
    } catch {
      return null;
    }
    if (!credentials.client_email || !credentials.private_key) return null;
    client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes,
    });
    clientCache.set(key, client);
  }
  try {
    const tok = await client.getAccessToken();
    return tok?.token ?? null;
  } catch (e) {
    console.error('[google-auth] token error', e instanceof Error ? e.message : e);
    return null;
  }
}
