import type { Metadata } from 'next';
import { V2Frame } from '@/components/v2/V2Frame';
import { getAllPlanMetas } from '@/lib/plans';
import { getAllFileArticles } from '@/lib/articles';
import { FavoritesClient } from './FavoritesClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'お気に入り',
  description: '保存したプラン・記事の一覧。ログイン不要、このブラウザに保存されています。',
  robots: { index: false, follow: true },
  alternates: { canonical: '/favorites' },
};

export default function FavoritesPage() {
  // サーバ側で全プラン/記事のメタを取得、クライアント側で localStorage と突合
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

  return (
    <>
      <V2Frame header="sub" active="home">
      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <a href="/">HOME</a>
          <span className="sep">/</span>
          <span>お気に入り</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container-narrow">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">My favorites</span>
            <h1>お気に入り</h1>
            <p className="lead">
              このブラウザに保存された、あなたのお気に入りプラン・記事です。別のデバイスでは見られません。
            </p>
          </header>

          <FavoritesClient allPlans={allPlans} allArticles={allArticles} />
        </div>
      </section>

      </V2Frame>
      
    </>
  );
}
