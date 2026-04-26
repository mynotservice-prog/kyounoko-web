/**
 * IndexNow API クライアント
 *
 * IndexNow は Bing / Yandex / Seznam が共通で採用する「コンテンツ更新通知」
 * プロトコル。POST 1 回でこれらのサーチエンジンに即時インデックス更新を要求できる。
 * Google は IndexNow を直接サポートしないが、被参照経由でクロール頻度の改善が期待できる。
 *
 * ## 使い方
 * - 環境変数 INDEXNOW_KEY に 8〜128 文字の英数字キーを設定
 * - public/{INDEXNOW_KEY}.txt にキー本体を配置（このリポジトリでは静的に置いてある）
 * - submitToIndexNow(urls) で URL リストを送信
 *
 * ## 対象エンドポイント
 * - https://api.indexnow.org/indexnow （統合エンドポイント）
 *   ここにポストすれば Bing / Yandex / Seznam に伝播される。
 *
 * ## 失敗ハンドリング
 * - ビルドを止めない: 例外を投げず、結果をオブジェクトで返す
 * - 環境変数が無ければ no-op
 * - 504 / 429 等の 5xx/429 はリトライ対象だが、本実装では単発送信
 *
 * @see https://www.indexnow.org/documentation
 */

export const INDEXNOW_HOST = 'kyounoko.jp';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * IndexNow キーは公開情報（public/{KEY}.txt として配信される）なので、
 * デフォルト値をハードコードして env 設定なしでも動作させる。
 * Vercel env で `INDEXNOW_KEY` を設定すれば上書き可能。
 */
const DEFAULT_INDEXNOW_KEY = '229166d73b10f1630ed52857e67c427b';

export type IndexNowResult = {
  ok: boolean;
  status?: number;
  submitted: number;
  skipped?: string;
  error?: string;
};

/**
 * IndexNow に URL のリストを通知する。
 *
 * @param urls 通知する絶対URL配列（同一ホスト下のみ有効）
 * @returns 成功フラグと送信件数
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY?.trim() || DEFAULT_INDEXNOW_KEY;
  if (!urls || urls.length === 0) {
    return { ok: false, submitted: 0, skipped: 'No URLs provided' };
  }

  // 同一ホストの絶対 URL のみに絞る（IndexNow 仕様）
  const filtered = urls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.hostname === INDEXNOW_HOST;
    } catch {
      return false;
    }
  });

  if (filtered.length === 0) {
    return { ok: false, submitted: 0, skipped: 'No valid same-host URLs' };
  }

  // IndexNow の 1 回のリクエスト上限は 10,000 URL
  const batch = filtered.slice(0, 10000);

  const body = {
    host: INDEXNOW_HOST,
    key,
    keyLocation: `https://${INDEXNOW_HOST}/${key}.txt`,
    urlList: batch,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      // Vercel ビルド/ランタイムから直接叩く想定
      cache: 'no-store',
    });

    return {
      ok: res.ok,
      status: res.status,
      submitted: batch.length,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      submitted: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 全記事の URL を集約して IndexNow に通知する補助関数。
 * 主に CI/手動スクリプト経由（scripts/notify-indexnow.ts）から使う。
 */
export async function submitAllArticlesToIndexNow(): Promise<IndexNowResult> {
  // ローカル import（ビルド時の循環依存回避）
  const { getAllFileArticles } = await import('./articles');
  const articles = getAllFileArticles();
  const urls = [
    `https://${INDEXNOW_HOST}/`,
    ...articles
      .filter((a) => !a.noindex)
      .map((a) => `https://${INDEXNOW_HOST}/article/${a.slug}`),
  ];
  return submitToIndexNow(urls);
}
