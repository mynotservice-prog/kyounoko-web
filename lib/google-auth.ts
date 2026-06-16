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

const CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

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
