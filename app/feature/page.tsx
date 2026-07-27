import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Breadcrumb } from '@/components/v2/V2Breadcrumb';
import { V2FeatureRow } from '@/components/v2/V2Cards';
import { V2SectionHead, V2Img, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { FEATURE_PAGES } from '@/lib/feature-pages';
import { featureToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: '特集まとめ｜きょうのこ',
  description:
    '夏休み・雨の日・無料スポット・赤ちゃん連れOKなど、子連れのテーマ別おでかけ＆暮らし特集を一覧で紹介。',
  alternates: { canonical: '/feature' },
};

export default function FeatureIndexPage() {
  const cards = FEATURE_PAGES.map(featureToV2);
  return (
    <V2Frame header="sub">
      <V2Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '特集' }]} />
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="book" size={24} color="var(--v2-orange)" />
          特集まとめ
        </h1>
        <p className="v2-page-lead">
          季節・テーマ別に、子連れで役立つ情報を1ページに集約した特集です。
        </p>
      </div>

      <V2SectionHead title="おすすめの特集" more="" />
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 13 }}
      >
        {cards.slice(0, 3).map((f) => (
          <V2FeatureRow key={f.id} f={f} href={`/feature/${f.id}`} />
        ))}
      </div>

      {/* AdSense */}
      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      <V2SectionHead title="すべての特集" more="" />
      <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {cards.map((f) => (
          <Link key={f.id} href={`/feature/${f.id}`} className="v2-recent-feat">
            <div
              className="v2-imgwrap r"
              style={{ width: 88, minWidth: 88, aspectRatio: '16/9' }}
            >
              <V2Img src={f.img} seed={f.id} alt={f.title} />
            </div>
            <div className="v2-rank-info">
              <div className="v2-rank-title">{f.title}</div>
              {f.tags && (
                <div className="v2-tag-row">
                  {f.tags.map((t, i) => (
                    <V2Tag key={i} label={t} tone={i === 0 ? 'feat' : ''} />
                  ))}
                </div>
              )}
            </div>
            <V2Icon name="chevron-right" size={18} color="#ccc" />
          </Link>
        ))}
      </div>

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
