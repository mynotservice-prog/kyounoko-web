'use client';

import React from 'react';
import Link from 'next/link';
import { V2Img, V2SectionHead, useV2Ctx } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
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
type SpotLite = {
  slug: string;
  name: string;
  cat: string;
  area: string;
  station: string;
  img: string;
  note?: string;
};

export function FavoritesClient({
  allPlans,
  allArticles,
  allSpots,
}: {
  allPlans: PlanLite[];
  allArticles: ArticleLite[];
  allSpots: SpotLite[];
}) {
  // V2 SaveButton と V2FavBtn が保存するのは kk_saved_v2（共通 useV2Ctx 経由）
  const { saved: savedV2, toggleSave } = useV2Ctx();
  // 旧 useFavorites は kk_favorites などにプラン/記事を保存している
  const { favPlans, favArticles } = useFavorites();

  // SSR 中は空配列、クライアント側 hydrate 後に localStorage 反映
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const savedSpotIds = Object.keys(savedV2);
  const spots = allSpots.filter((s) => savedSpotIds.includes(s.slug));
  const plans = allPlans.filter((p) => favPlans.includes(p.id));
  const articles = allArticles.filter((a) => favArticles.includes(a.slug));

  const isEmpty =
    mounted && spots.length === 0 && plans.length === 0 && articles.length === 0;

  if (!mounted) {
    // SSR/hydrate 中はスケルトン
    return (
      <div className="v2-section" style={{ paddingTop: 24 }}>
        <p style={{ color: 'var(--v2-ink-mute)', fontSize: 13, textAlign: 'center' }}>
          読み込み中...
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        style={{
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'var(--v2-orange-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <V2Icon name="bookmark" size={40} color="var(--v2-orange)" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--v2-ink)' }}>
          保存したものはまだありません
        </h2>
        <p style={{ color: 'var(--v2-ink-mute)', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
          気になるスポット・記事・プランで
          <br />
          <span style={{ display: 'inline-flex', verticalAlign: 'middle', margin: '0 3px' }}>
            <V2Icon name="heart" size={14} color="var(--v2-orange)" />
          </span>
          {' や '}
          <span style={{ display: 'inline-flex', verticalAlign: 'middle', margin: '0 3px' }}>
            <V2Icon name="bookmark" size={14} color="var(--v2-orange)" />
          </span>
          {' を押すとここに溜まります。'}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/spots"
            className="v2-btn-primary"
            style={{ minWidth: 140, padding: '12px 24px' }}
          >
            スポットを探す
          </Link>
          <Link
            href="/events"
            style={{
              minWidth: 140,
              padding: '12px 24px',
              borderRadius: 'var(--v2-r-pill)',
              border: '1.5px solid var(--v2-orange)',
              color: 'var(--v2-orange-deep)',
              fontWeight: 800,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            イベントを見る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* スポット */}
      {spots.length > 0 && (
        <>
          <div className="v2-sec-head" style={{ marginTop: 8 }}>
            <div className="v2-sec-title">
              <span className="v2-bar-accent"></span>
              保存したスポット
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  background: 'var(--v2-orange-soft)',
                  color: 'var(--v2-orange-deep)',
                  padding: '2px 9px',
                  borderRadius: 'var(--v2-r-pill)',
                  fontWeight: 800,
                }}
              >
                {spots.length}
              </span>
            </div>
          </div>
          <div className="v2-vlist">
            {spots.map((s) => (
              <Link key={s.slug} href={`/spot/${s.slug}`} className="v2-art-row">
                <div
                  className="v2-imgwrap r"
                  style={{ width: 88, minWidth: 88, height: 72 }}
                >
                  <V2Img src={s.img} seed={s.slug} alt={s.name} />
                </div>
                <div className="v2-art-body">
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: 'var(--v2-orange-deep)',
                      letterSpacing: '.02em',
                    }}
                  >
                    {s.cat}
                  </div>
                  <div className="v2-art-title" style={{ marginTop: 2 }}>
                    {s.name}
                  </div>
                  <div className="v2-art-sub">
                    {s.station || s.area}
                  </div>
                </div>
                <button
                  type="button"
                  className="v2-fav-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(s.slug);
                  }}
                  aria-label="保存を解除"
                  style={{ marginLeft: 'auto', flex: 'none' }}
                >
                  <V2Icon name="heart" size={18} color="var(--v2-orange)" fill />
                </button>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* プラン */}
      {plans.length > 0 && (
        <>
          <V2SectionHead title={`保存したプラン (${plans.length})`} more="" />
          <div className="v2-vlist">
            {plans.map((p) => (
              <div key={p.id} className="v2-art-row" style={{ position: 'relative' }}>
                <Link
                  href={`/plan/${p.id}`}
                  style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}
                >
                  <div
                    className="v2-imgwrap r"
                    style={{ width: 88, minWidth: 88, height: 72 }}
                  >
                    {p.hero ? (
                      <V2Img src={p.hero} seed={p.id} alt={p.title} />
                    ) : (
                      <V2Img seed={p.id} alt={p.title} />
                    )}
                  </div>
                  <div className="v2-art-body">
                    <div className="v2-art-title">{p.title}</div>
                    <div className="v2-art-sub">{p.shortAnswer.slice(0, 60)}</div>
                  </div>
                </Link>
                <div style={{ marginLeft: 'auto', flex: 'none' }}>
                  <FavoriteButton kind="plan" id={p.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 記事 */}
      {articles.length > 0 && (
        <>
          <V2SectionHead title={`保存した記事 (${articles.length})`} more="" />
          <div className="v2-vlist">
            {articles.map((a) => (
              <div key={a.slug} className="v2-art-row" style={{ position: 'relative' }}>
                <Link
                  href={`/article/${a.slug}`}
                  style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}
                >
                  <div
                    className="v2-imgwrap r"
                    style={{ width: 88, minWidth: 88, height: 72 }}
                  >
                    {a.hero ? (
                      <V2Img src={a.hero} seed={a.slug} alt={a.title} />
                    ) : (
                      <V2Img seed={a.slug} alt={a.title} />
                    )}
                  </div>
                  <div className="v2-art-body">
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: 'var(--v2-orange-deep)',
                        letterSpacing: '.02em',
                      }}
                    >
                      {a.categoryName}
                    </div>
                    <div className="v2-art-title" style={{ marginTop: 2 }}>
                      {a.title}
                    </div>
                  </div>
                </Link>
                <div style={{ marginLeft: 'auto', flex: 'none' }}>
                  <FavoriteButton kind="article" id={a.slug} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 24 }}></div>
    </>
  );
}
