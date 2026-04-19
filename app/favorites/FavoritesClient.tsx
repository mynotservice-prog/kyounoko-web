'use client';

import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

type PlanLite = {
  id: string;
  title: string;
  shortAnswer: string;
  hero?: string;
  ageRanges: string[];
  durationMin: number;
};
type ArticleLite = {
  slug: string;
  title: string;
  lede: string;
  hero?: string;
  categoryName: string;
};

export function FavoritesClient({
  allPlans,
  allArticles,
}: {
  allPlans: PlanLite[];
  allArticles: ArticleLite[];
}) {
  const { favPlans, favArticles } = useFavorites();

  const plans = allPlans.filter((p) => favPlans.includes(p.id));
  const articles = allArticles.filter((a) => favArticles.includes(a.slug));

  const isEmpty = plans.length === 0 && articles.length === 0;

  if (isEmpty) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
        <p style={{ marginBottom: 20, fontSize: 15 }}>
          まだ保存したプラン・記事がありません。<br />
          気になるものに ♡ を押すとここに溜まります。
        </p>
        <Link href="/#finder" className="btn-primary-light">
          今日のプランを探す
        </Link>
      </div>
    );
  }

  return (
    <>
      {plans.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">Plans</span>
              <h2>保存したプラン</h2>
            </div>
            <span className="hint">{plans.length} 件</span>
          </div>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {plans.map((p) => (
              <div key={p.id} style={{
                position: 'relative',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                <Link href={`/plan/${p.id}`} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                  {p.hero && (
                    <div style={{
                      aspectRatio: '16/9',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${p.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14.5, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--ink-sub)', margin: '6px 0 0', lineHeight: 1.7 }}>
                      {p.shortAnswer.slice(0, 70)}...
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {p.ageRanges[0] && <span className="meta-chip clay">{p.ageRanges[0]}歳</span>}
                      <span className="meta-chip ochre">{p.durationMin}分</span>
                    </div>
                  </div>
                </Link>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <FavoriteButton kind="plan" id={p.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">Articles</span>
              <h2>保存した記事</h2>
            </div>
            <span className="hint">{articles.length} 件</span>
          </div>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {articles.map((a) => (
              <div key={a.slug} style={{
                position: 'relative',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                <Link href={`/article/${a.slug}`} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                  {a.hero && (
                    <div style={{
                      aspectRatio: '16/9',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${a.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <span style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--clay)', fontWeight: 600 }}>
                      {a.categoryName}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14.5, fontWeight: 600, margin: '4px 0 0', lineHeight: 1.55 }}>
                      {a.title}
                    </h3>
                  </div>
                </Link>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <FavoriteButton kind="article" id={a.slug} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
