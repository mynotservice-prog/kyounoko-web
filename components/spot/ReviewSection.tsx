import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkIcon } from '@/components/kk/KkIcon';
import { getApprovedReviews, getRating } from '@/lib/reviews';
import { ReviewForm } from './ReviewForm';
import { ReviewReportButton } from './ReviewReportButton';

/**
 * スポット詳細の口コミセクション（P1-8・画面C）。承認済みのみ表示。
 * KV未設定時は投稿ボタンのみ（表示は空）。
 */
const AGE_LABEL: Record<string, string> = { '0-1': '0〜1歳', '2-3': '2〜3歳', '4-6': '4〜6歳' };

/** 星は記号（★☆）を使わずアイコンで描く（§3-0 絵文字・記号を使わない）。色は状態にだけ持たせる。 */
function Stars({ n, size = 15 }: { n: number; size?: number }) {
  const full = Math.round(n);
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <KkIcon
          key={i}
          name="popular"
          size={size}
          sw={1.6}
          color={i < full ? 'var(--kk-orange)' : 'var(--kk-rule)'}
        />
      ))}
    </>
  );
}

export async function ReviewSection({ spotId, spotName }: { spotId: string; spotName: string }) {
  const [reviews, rating] = await Promise.all([getApprovedReviews(spotId), getRating(spotId)]);

  return (
    <div className="kk-sec sv3-sec">
      <KkSectionTitle as="h2" title="みんなの口コミ" />
      <div className="sv3-measure">
        {rating.count > 0 ? (
          <div className="sv3-rv-head">
            <span className="sv3-rv-stars" aria-label={`星${rating.avg.toFixed(1)}`}>
              <Stars n={rating.avg} size={17} />
            </span>
            <span className="sv3-rv-avg">{rating.avg.toFixed(1)}</span>
            <span className="sv3-rv-count">（{rating.count}件）</span>
          </div>
        ) : (
          <p className="sv3-rv-empty">まだ口コミがありません。最初のひとことを投稿しませんか？</p>
        )}

        {/* siteKeyはサーバー(実行時)で解決してpropで渡す＝ビルド埋め込み不要（env変更が即反映） */}
        <ReviewForm spotId={spotId} spotName={spotName} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

        {reviews.length > 0 && (
          <div className="sv3-rv-list">
            {reviews.slice(0, 10).map((r) => (
              <div key={r.id} className="sv3-rv">
                <div className="sv3-rv-meta">
                  <span className="s" aria-label={`星${r.rating}`}>
                    <Stars n={r.rating} size={14} />
                  </span>
                  <span className="sv3-rv-name">{r.nickname}</span>
                  {r.childAgeBand && <span className="sv3-rv-age">・{AGE_LABEL[r.childAgeBand]}</span>}
                  <span style={{ marginLeft: 'auto' }}>
                    <ReviewReportButton spotId={spotId} id={r.id} />
                  </span>
                </div>
                <p className="sv3-rv-body">{r.body}</p>
                {r.photos && r.photos.length > 0 && (
                  <div className="sv3-rv-photos">
                    {r.photos.map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={p.url} alt={`${r.nickname}さんの投稿写真`} loading="lazy" />
                    ))}
                    <span className="sv3-rv-credit">みんなの写真 / by {r.nickname}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
