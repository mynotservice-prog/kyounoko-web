import { getApprovedReviews, getRating } from '@/lib/reviews';
import { ReviewForm } from './ReviewForm';
import { ReviewReportButton } from './ReviewReportButton';

/**
 * スポット詳細の口コミセクション（P1-8・画面C）。承認済みのみ表示。
 * KV未設定時は投稿ボタンのみ（表示は空）。
 */
const AGE_LABEL: Record<string, string> = { '0-1': '0〜1歳', '2-3': '2〜3歳', '4-6': '4〜6歳' };

function stars(n: number): string {
  const full = Math.round(n);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

export async function ReviewSection({ spotId, spotName }: { spotId: string; spotName: string }) {
  const [reviews, rating] = await Promise.all([getApprovedReviews(spotId), getRating(spotId)]);

  return (
    <>
      <div className="v2-sec-head" style={{ marginTop: 22 }}>
        <h2 className="v2-sec-title">
          <span className="v2-bar-accent"></span>みんなの口コミ
        </h2>
      </div>
      <div className="v2-section">
        {rating.count > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ color: '#f5a623', fontSize: 18, letterSpacing: 2 }}>{stars(rating.avg)}</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{rating.avg.toFixed(1)}</span>
            <span style={{ fontSize: 12.5, color: 'var(--v2-ink-mute)' }}>（{rating.count}件）</span>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', margin: '0 0 12px' }}>
            まだ口コミがありません。最初のひとことを投稿しませんか？
          </p>
        )}

        {/* siteKeyはサーバー(実行時)で解決してpropで渡す＝ビルド埋め込み不要（env変更が即反映） */}
        <ReviewForm spotId={spotId} spotName={spotName} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

        {reviews.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {reviews.slice(0, 10).map((r) => (
              <div key={r.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--v2-line)', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ color: '#f5a623', fontSize: 14, letterSpacing: 1 }}>{stars(r.rating)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{r.nickname}</span>
                  {r.childAgeBand && (
                    <span style={{ fontSize: 11.5, color: 'var(--v2-ink-mute)' }}>・{AGE_LABEL[r.childAgeBand]}</span>
                  )}
                  <span style={{ marginLeft: 'auto' }}>
                    <ReviewReportButton spotId={spotId} id={r.id} />
                  </span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, color: 'var(--v2-ink-soft)', whiteSpace: 'pre-wrap' }}>{r.body}</p>
                {r.photos && r.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {r.photos.map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={p.url} alt={`${r.nickname}さんの投稿写真`} loading="lazy"
                        style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--v2-line)' }} />
                    ))}
                    <span style={{ fontSize: 10.5, color: 'var(--v2-ink-mute)' }}>みんなの写真 / by {r.nickname}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
