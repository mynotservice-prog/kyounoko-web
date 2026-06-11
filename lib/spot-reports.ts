/**
 * 「行ったよ」レポートの公開分を MicroCMS から読む。
 *
 * - 投稿は /api/spot-report 経由で下書き保存され、管理画面で公開にした分だけここで出る。
 * - エンドポイント未作成・env未設定・通信失敗はすべて空配列（ページ表示を壊さない）。
 */

export type SpotReport = {
  rating: number;
  comment?: string;
  ageRange?: string;
  publishedAt?: string;
};

export async function getPublishedSpotReports(slug: string): Promise<SpotReport[]> {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  const key = process.env.MICROCMS_API_KEY;
  if (!domain || !key) return [];
  try {
    const res = await fetch(
      `https://${domain}.microcms.io/api/v1/spot-reports?filters=spotSlug[equals]${encodeURIComponent(slug)}&limit=5&orders=-publishedAt`,
      {
        headers: { 'X-MICROCMS-API-KEY': key },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const contents = Array.isArray(json?.contents) ? json.contents : [];
    return contents
      .map((c: Record<string, unknown>) => ({
        rating: Number(c.rating) || 0,
        comment: typeof c.comment === 'string' ? c.comment : undefined,
        ageRange: typeof c.ageRange === 'string' ? c.ageRange : undefined,
        publishedAt: typeof c.publishedAt === 'string' ? c.publishedAt : undefined,
      }))
      .filter((r: SpotReport) => r.rating >= 1 && r.rating <= 5);
  } catch {
    return [];
  }
}
