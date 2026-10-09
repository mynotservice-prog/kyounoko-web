/**
 * 管理画面の署名付きセッションクッキー（2026-10-10）。
 *
 * 背景: PR #309 で /api/admin/* にも middleware の Basic 認証がかかった。管理画面
 * （/admin/*）のクライアント fetch は「ブラウザが /admin/ で入力した Basic 資格情報を
 * 同じ realm の 401 に対して自動再送する」前提だが、これはブラウザ実装依存で、
 * 保存操作が 401 で止まる事故を構造的には防げない。
 *
 * 方針（社長指示 2026-10-10「認証を弱めず、安全性と正常動作を両立」）:
 *   - Basic 認証に成功したときだけ、HMAC-SHA256 で署名した HttpOnly クッキーを発行する。
 *   - /api/admin/* は Basic か有効クッキーのどちらかで通す。ページ /admin/* も同じ順で
 *     判定するが、クッキーは「一度 Basic に成功した」証明なので弱体化ではない。
 *   - ログアウト相当は有効期限（12 時間）で自然失効。
 *
 * 鍵の導出:
 *   - ADMIN_SESSION_SECRET があればそれを鍵にする。
 *   - 無ければ `ADMIN_USER + ':' + ADMIN_PASSWORD` の SHA-256 を鍵にする（新しい env を
 *     必須にしない）。将来 Vercel に ADMIN_SESSION_SECRET を足せば、Basic の資格情報と
 *     クッキーの署名鍵を分離できる。パスワードを変えれば既存クッキーは全て無効になる。
 *
 * クッキー値: `<exp>.<base64url(HMAC-SHA256(key, "kyounoko-admin-session:v1:" + exp))>`
 *   exp = 失効時刻の UNIX 秒。検証は exp が未来 かつ HMAC 一致（定数時間比較）。
 *
 * Edge Runtime（middleware）と Node Runtime（route）の両方で動くよう Web Crypto
 * （globalThis.crypto.subtle）だけを使う。Node は 20 以上（package.json engines）。
 */

export const ADMIN_SESSION_COOKIE = 'kyounoko_admin_session';
/** 有効期間（秒）: 12 時間 */
export const ADMIN_SESSION_MAX_AGE_SEC = 12 * 60 * 60;

const SIGN_PREFIX = 'kyounoko-admin-session:v1:';

const encoder = new TextEncoder();

/** タイミング攻撃を弱めるための定数時間比較（Edge / Node 共通） */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 署名鍵の素材。ADMIN_SESSION_SECRET > SHA-256(ADMIN_USER:ADMIN_PASSWORD)。未設定なら null。 */
async function keyMaterial(): Promise<ArrayBuffer | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return encoder.encode(secret).buffer as ArrayBuffer;
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return null;
  return crypto.subtle.digest('SHA-256', encoder.encode(`${user}:${pass}`));
}

let cachedKey: Promise<CryptoKey | null> | null = null;

function getKey(): Promise<CryptoKey | null> {
  if (!cachedKey) {
    cachedKey = (async () => {
      const material = await keyMaterial();
      if (!material) return null;
      return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, [
        'sign',
      ]);
    })();
  }
  return cachedKey;
}

async function sign(exp: number): Promise<string | null> {
  const key = await getKey();
  if (!key) return null;
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(SIGN_PREFIX + String(exp)));
  return toBase64Url(mac);
}

/**
 * 新しいセッションクッキーの値を作る。鍵材料（env）が無ければ null。
 */
export async function createAdminSessionValue(nowMs: number = Date.now()): Promise<string | null> {
  const exp = Math.floor(nowMs / 1000) + ADMIN_SESSION_MAX_AGE_SEC;
  const sig = await sign(exp);
  return sig ? `${exp}.${sig}` : null;
}

/**
 * クッキー値を検証する。exp が未来 かつ HMAC 一致なら true。
 */
export async function verifyAdminSessionValue(
  value: string | null | undefined,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!value) return false;
  const dot = value.indexOf('.');
  if (dot <= 0) return false;
  const expStr = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d{1,12}$/.test(expStr) || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(nowMs / 1000)) return false;
  const expected = await sign(exp);
  if (!expected) return false;
  return constantTimeEqual(sig, expected);
}

/**
 * Set-Cookie ヘッダの値を組み立てる。
 * Secure は HTTPS のときだけ（Vercel 本番は常時 HTTPS。ローカル dev は http なので付けない）。
 */
export function buildAdminSessionSetCookie(value: string, secure: boolean): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${ADMIN_SESSION_MAX_AGE_SEC}`,
    'HttpOnly',
    'SameSite=Strict',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Request / NextRequest から Cookie ヘッダを読み、セッションクッキーの値を取り出す。
 * NextRequest.cookies に依存しない（Node route でも同じコードで動く）。
 */
export function readAdminSessionCookie(headers: Headers): string | null {
  const raw = headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === ADMIN_SESSION_COOKIE) return part.slice(eq + 1).trim();
  }
  return null;
}
