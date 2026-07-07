'use client';

import Link from 'next/link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { getAreaName } from '@/lib/area';
import type { AreaSlug } from '@/lib/area';
import { trackEvent } from '@/lib/analytics';

/**
 * 「次のお出かけ＝今日の流れ」CTA（リピート設計の中核）。
 *
 * 外食チェーン記事の読者は「今この後どこで何を食べる/どこへ行く」を決めたい高インテント層。
 * GSC実数では流入の主力（チェーン×子連れ条件）だが、答えを1つ得て離脱する“リファレンス消費”で
 * 再訪理由が無かった。静的プランカタログ（/plan/*）は家レシピ or 季節イベントで外食文脈に
 * ミスマッチのため、ここでは動的な /today（近くの子連れランチ＋遊び場を実距離で1日プラン化）へ
 * 地域・年齢をプリフィルして橋渡しする。/today は毎週・天気で変わるため、週末ごとにのぞく
 * “習慣＝再訪”を生む。あわせて記事保存（お気に入り）も高インテント位置で促す。
 */
export function NextOutingCTA({
  slug,
  area,
  age,
}: {
  slug: string;
  area?: string;
  age?: string;
}) {
  const params = new URLSearchParams();
  const hasArea = !!area && area !== 'all';
  if (hasArea) params.set('area', area as string);
  if (age) params.set('age', age);
  params.set('place', 'outside');
  const href = `/today?${params.toString()}`;

  let areaLabel = 'お住まいの地域';
  if (hasArea) {
    const name = getAreaName(area as AreaSlug);
    if (name) areaLabel = name;
  }

  return (
    <section style={{ margin: '48px 0 0' }} aria-label="今日の流れを見る">
      <div
        style={{
          background:
            'radial-gradient(circle at 88% 18%, rgba(244,183,135,0.30) 0%, transparent 55%), linear-gradient(135deg, #FFFBF3 0%, #FBE8D8 62%, #F8ECCB 100%)',
          border: '1px solid rgba(201,96,62,0.22)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 24px 22px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-inter), Inter',
            fontSize: 10,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: 'var(--clay-deep)',
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Today&apos;s plan · 今日この後どう動く？
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-mincho)',
            fontSize: 19,
            fontWeight: 600,
            lineHeight: 1.5,
            margin: '0 0 8px',
          }}
        >
          {areaLabel}で、子連れランチ＋遊び場の1日プラン
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.85, margin: '0 0 18px' }}>
          近くの子連れOKなお店と遊び場を、移動の現実性込みで「今日の流れ」にして提案します。
          毎週・天気で変わるので、週末ごとにのぞくと迷いません。
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            href={href}
            onClick={() =>
              trackEvent('next_outing_click', { article_slug: slug, area: area ?? 'all' })
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--clay-deep, #b5532f)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14.5,
              padding: '12px 22px',
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            今日の流れを見る
            <span aria-hidden="true">→</span>
          </Link>
          <FavoriteButton kind="article" id={slug} size="md" />
        </div>
      </div>
    </section>
  );
}
