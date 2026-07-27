/**
 * Pinterest API v5 クライアント（Node ランタイム専用）。
 *
 * 認証フロー:
 *   - 一度だけ OAuth でユーザー認可 → continuous refresh token を取得し、
 *     PINTEREST_REFRESH_TOKEN として Vercel 環境変数に保存する
 *     （取得は /api/pinterest/oauth が補助）。
 *   - 以降は cron 実行のたびに refresh token → 短命の access token を発行して使う。
 *     refresh token は continuous（60日・無限更新）なので、実質メンテナンス不要。
 *
 * 必要な env:
 *   PINTEREST_APP_ID        — アプリの App ID（client_id）
 *   PINTEREST_APP_SECRET    — アプリの App secret（client_secret）
 *   PINTEREST_REFRESH_TOKEN — 一度きりの OAuth で得た refresh token
 *
 * 必要なスコープ: boards:read, boards:write, pins:read, pins:write
 */

const API_BASE = 'https://api.pinterest.com/v5';

/** OAuth リダイレクト URI（Pinterest アプリに登録した値と完全一致させる）。 */
export const PINTEREST_REDIRECT_URI =
  'https://kyounoko.jp/api/pinterest/oauth/callback';

/** OAuth で要求するスコープ。 */
export const PINTEREST_SCOPES = [
  'boards:read',
  'boards:write',
  'pins:read',
  'pins:write',
];

export interface PinterestCreatedPin {
  id: string;
  boardId: string;
}

export function pinterestConfigured(): boolean {
  return Boolean(
    process.env.PINTEREST_APP_ID &&
      process.env.PINTEREST_APP_SECRET &&
      process.env.PINTEREST_REFRESH_TOKEN,
  );
}

function basicAuthHeader(): string {
  const id = process.env.PINTEREST_APP_ID ?? '';
  const secret = process.env.PINTEREST_APP_SECRET ?? '';
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

/** refresh token → access token。各 cron 実行の冒頭で1回呼ぶ想定。 */
export async function getAccessToken(): Promise<string> {
  const refresh = process.env.PINTEREST_REFRESH_TOKEN;
  if (!refresh) throw new Error('PINTEREST_REFRESH_TOKEN is not set');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
  });

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pinterest token refresh failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Pinterest token refresh: no access_token');
  return json.access_token;
}

interface Board {
  id: string;
  name: string;
}

/** 全ボードを取得（ページング対応・最大数百件想定なので全件辿る）。 */
async function listBoards(accessToken: string): Promise<Board[]> {
  const boards: Board[] = [];
  let bookmark: string | undefined;
  do {
    const url = new URL(`${API_BASE}/boards`);
    url.searchParams.set('page_size', '100');
    if (bookmark) url.searchParams.set('bookmark', bookmark);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Pinterest listBoards failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      items?: Board[];
      bookmark?: string | null;
    };
    for (const b of json.items ?? []) boards.push({ id: b.id, name: b.name });
    bookmark = json.bookmark ?? undefined;
  } while (bookmark);
  return boards;
}

async function createBoard(
  accessToken: string,
  name: string,
  description: string,
): Promise<Board> {
  const res = await fetch(`${API_BASE}/boards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description.slice(0, 500),
      privacy: 'PUBLIC',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pinterest createBoard failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as Board;
  return { id: json.id, name: json.name };
}

/**
 * ボードを名前で検索し、無ければ作成して board_id を返す。
 * 同一 cron 実行内では結果をキャッシュして余計な API 呼び出しを避ける。
 */
export async function ensureBoard(
  accessToken: string,
  name: string,
  description: string,
  cache?: Map<string, string>,
): Promise<string> {
  if (cache?.has(name)) return cache.get(name)!;

  const boards = await listBoards(accessToken);
  let board = boards.find((b) => b.name.trim() === name.trim());
  if (!board) {
    board = await createBoard(accessToken, name, description);
  }
  cache?.set(name, board.id);
  return board.id;
}

export interface CreatePinInput {
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  altText?: string;
}

/** image_url からピンを作成する。成功時に pin id を返す。 */
export async function createPin(
  accessToken: string,
  input: CreatePinInput,
): Promise<PinterestCreatedPin> {
  const res = await fetch(`${API_BASE}/pins`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: input.boardId,
      title: input.title.slice(0, 100),
      description: input.description.slice(0, 800),
      link: input.link,
      alt_text: (input.altText ?? input.title).slice(0, 500),
      media_source: {
        source_type: 'image_url',
        url: input.imageUrl,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pinterest createPin failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { id: string };
  return { id: json.id, boardId: input.boardId };
}
