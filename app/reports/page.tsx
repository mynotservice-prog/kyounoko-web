import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Breadcrumb } from '@/components/v2/V2Breadcrumb';
import { V2Icon } from '@/components/v2/V2Icon';
import { getRecentSpotReports } from '@/lib/spot-reports';
import { getSpotBySlug } from '@/lib/spots';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'みんなの「行ったよ」レポート｜子連れでおでかけした人の口コミ【きょうのこ】',
  description:
    '0〜6歳の子連れで実際におでかけした人の「行ったよ」レポート新着一覧。星評価・子どもの年齢つきのリアルな声を集めました。',
  alternates: { canonical: '/reports' },
};

const AGE_LABEL: Record<string, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

function fmtDate(s?: string): string {
  if (!s) return '';
  const d = s.slice(0, 10);
  return d.replace(/-/g, '/');
}

export default async function ReportsPage() {
  const reports = await getRecentSpotReports(40);

  // spotName が無い投稿は slug からスポット名を補完する
  const enriched = reports.map((r) => {
    const name = r.spotName || getSpotBySlug(r.spotSlug)?.spot.name || 'スポット';
    return { ...r, displayName: name };
  });

  return (
    <V2Frame header="sub" active="area">
      <V2Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'みんなの口コミ' }]} />
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1 className="v2-page-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <V2Icon name="star" size={24} color="var(--v2-orange)" />
          みんなの「行ったよ」
        </h1>
        <p className="v2-page-lead">
          実際に子連れでおでかけした人のリアルな声。星評価とお子さんの年齢つきで、新着順にお届けします。
        </p>
      </div>

      {enriched.length > 0 ? (
        <>
          <div className="v2-section" style={{ padding: 0 }}>
            {enriched.map((r, i) => (
              <Link
                key={i}
                href={`/spot/${r.spotSlug}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  borderBottom: i < enriched.length - 1 ? '1px solid #f3ece2' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span aria-label={`星${r.rating}`} style={{ fontSize: 14 }}>
                    {'⭐'.repeat(r.rating)}
                  </span>
                  {r.publishedAt && (
                    <span style={{ fontSize: 11.5, color: '#a89c8c' }}>{fmtDate(r.publishedAt)}</span>
                  )}
                </div>
                <div style={{ marginTop: 4, fontSize: 14.5, fontWeight: 700, color: 'var(--v2-ink)' }}>
                  {r.displayName}
                </div>
                {r.ageRange && (
                  <div style={{ marginTop: 2, fontSize: 12, color: '#8a7d6e' }}>
                    {AGE_LABEL[r.ageRange] ?? r.ageRange}の子と
                  </div>
                )}
                {r.comment && (
                  <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#5d5246' }}>「{r.comment}」</p>
                )}
              </Link>
            ))}
          </div>

          <div className="v2-section" style={{ marginTop: 24 }}>
            <AdSlot placement="article-mid" />
          </div>

          {/* 投稿導線 */}
          <div
            className="v2-section"
            style={{
              marginTop: 8,
              textAlign: 'center',
              padding: '18px 16px',
              background: 'var(--v2-orange-soft)',
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--v2-orange-deep)' }}>
              あなたの「行ったよ」も教えてください
            </div>
            <p style={{ margin: '6px 0 12px', fontSize: 12.5, color: '#7a6d5e' }}>
              各スポットのページから、星とひとことで投稿できます。
            </p>
            <Link href="/ranking" className="v2-btn-primary" style={{ display: 'inline-block', padding: '10px 20px' }}>
              人気スポットを見る
            </Link>
          </div>
        </>
      ) : (
        <div className="v2-empty-state">
          <div className="v2-empty-ill">
            <V2Icon name="star" size={40} color="#e9c9ac" />
          </div>
          <div className="v2-empty-title">
            「行ったよ」レポートを
            <br />
            募集中です
          </div>
          <div className="v2-empty-sub">
            スポットのページから、星とひとことで体験を投稿できます。
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href="/ranking" className="v2-btn-primary" style={{ display: 'inline-block', padding: '10px 20px' }}>
              人気スポットを見る
            </Link>
          </div>
        </div>
      )}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
