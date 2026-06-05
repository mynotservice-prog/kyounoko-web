import type { Metadata } from 'next';
import { V2Frame } from '@/components/v2/V2Frame';
import { getAllPlanMetas } from '@/lib/plans';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { spotToV2 } from '@/lib/v2-adapters';
import { FavoritesClient } from './FavoritesClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '保存したもの｜きょうのこ',
  description: '保存したスポット・プラン・記事の一覧。ログイン不要、このブラウザに保存されています。',
  robots: { index: false, follow: true },
  alternates: { canonical: '/favorites' },
};

export default function FavoritesPage() {
  // サーバ側で全プラン/記事/スポットのメタを取得、クライアント側で localStorage と突合
  const allPlans = getAllPlanMetas().map((p) => ({
    id: p.id,
    title: p.title,
    shortAnswer: p.shortAnswer,
    hero: p.hero,
    ageRanges: p.ageRanges,
    durationMin: p.durationMin,
  }));
  const allArticles = getAllFileArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    lede: a.lede,
    hero: a.hero,
    categoryName: a.categoryName ?? a.category,
  }));
  // スポット（V2SaveButton で kk_saved_v2 に保存される）
  const allSpots = getAllSpotsWithSlug().map((x) => {
    const v = spotToV2(x.spot);
    return {
      slug: x.slug,
      name: x.spot.name,
      cat: v.cat,
      area: v.area,
      station: v.station,
      img: v.img,
      note: x.spot.note,
    };
  });

  return (
    <V2Frame header="saved" active="saved">
      <FavoritesClient
        allPlans={allPlans}
        allArticles={allArticles}
        allSpots={allSpots}
      />
    </V2Frame>
  );
}
