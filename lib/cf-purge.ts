/**
 * Cloudflare エッジHTMLキャッシュを URL 単位でパージする（サーバー用）。
 *
 * 背景:
 *   kyounoko.jp は Cloudflare 経由で、記事/一覧HTMLが s-maxage=3600 でエッジ
 *   キャッシュされる。admin編集(KV保存)は origin(Vercel) を revalidate するが
 *   CF のエッジキャッシュは消えないため、最大1時間ほど旧HTMLが配信される。
 *   保存直後にこの関数で該当URLだけパージすれば、ビルドを走らせずに数秒で反映される。
 *
 * env（未設定なら no-op。admin保存自体は成功させ、パージ失敗で500にはしない）:
 *   - CLOUDFLARE_API_TOKEN … Zone > Cache Purge 権限のAPIトークン
 *   - CLOUDFLARE_ZONE_ID   … kyounoko.jp のゾーンID
 */

const SITE = 'https://kyounoko.jp';
const PURGE_BATCH = 30; // Cloudflare purge_cache は1リクエスト最大30 files

export type CfPurgeResult = { ok: boolean; purged: number; skipped?: string };

/** path（"/article/foo"）または絶対URLの配列を CF エッジキャッシュからパージする。 */
export async function purgeCfUrls(paths: string[]): Promise<CfPurgeResult> {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) return { ok: false, purged: 0, skipped: 'CF env未設定' };

  // path → 絶対URL に正規化し重複除去
  const urls = Array.from(
    new Set(
      paths
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`)),
    ),
  );
  if (urls.length === 0) return { ok: false, purged: 0, skipped: '対象URLなし' };

  let purged = 0;
  for (let i = 0; i < urls.length; i += PURGE_BATCH) {
    const batch = urls.slice(i, i + PURGE_BATCH);
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: batch }),
          cache: 'no-store',
        },
      );
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
        if (data?.success) purged += batch.length;
      }
    } catch {
      // パージ失敗は握りつぶす（保存自体は成功しているため）。TTL(3600s)で自然に反映される。
    }
  }
  return { ok: purged > 0, purged };
}
