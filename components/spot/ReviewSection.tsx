import { getApprovedReviews, getRating } from '@/lib/reviews';
import { ReviewForm } from './ReviewForm';

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
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>みんなの口コミ
        </div>
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

        <ReviewForm spotId={spotId} spotName={spotName} />

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
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, color: 'var(--v2-ink-soft)', whiteSpace: 'pre-wrap' }}>{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
