import { NextResponse } from 'next/server';

// ads.txt を動的に返す Route Handler。
// 環境変数 NEXT_PUBLIC_ADSENSE_PUB_ID に AdSense の publisher ID を
// 設定することで、承認後に中身を差し替えられる。
//
// NEXT_PUBLIC_ADSENSE_PUB_ID 形式:
//   - 「pub-1234567890123456」  （ca- プレフィックスなし）
//   - 「ca-pub-1234567890123456」（ca- プレフィックスあり）
//     どちらを設定しても ads.txt 側で正しい形に整える。
//
// AdSense 未取得のあいだは、プレースホルダのコメント行のみを返す。
// これによりクローラが 404 を踏むことなく、後から env 差し替えだけで
// 本番の ads.txt に切り替わる。

// 毎リクエストで env を読み直したいため、動的レンダリングに固定
export const dynamic = 'force-dynamic';

/**
 * NEXT_PUBLIC_ADSENSE_PUB_ID を正規化して pub-XXXXXXXXXXXXXXXX を返す。
 * 形式が不正な場合は null。
 */
function normalizePubId(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const pubMatch = trimmed.match(/^(?:ca-)?(pub-\d{10,})$/);
  return pubMatch ? pubMatch[1] : null;
}

export function GET(): NextResponse {
  const pubId = normalizePubId(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID);

  // 公式推奨フォーマット: "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
  const body = pubId
    ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
    : [
        '# AdSense 申請前のプレースホルダです。',
        '# 承認後、環境変数 NEXT_PUBLIC_ADSENSE_PUB_ID に publisher ID を設定すると',
        '# 以下の一行が自動的に生成されます。',
        '# google.com, pub-PLACEHOLDER, DIRECT, f08c47fec0942fa0',
        '',
      ].join('\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // クローラーが頻繁に叩きすぎないよう短めにキャッシュ
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
