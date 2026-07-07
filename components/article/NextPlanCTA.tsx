'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

/**
 * 記事末尾の「1日プラン検索ツール（/today）」への送客CTA（P1-7）。
 *
 * 記事テンプレは商品・予約・駅ページ・プラン記事へは繋がるが、本体ツール
 * （週末の1日プランナー = /today）への明示送客が弱かった。ここで
 * 「このあと子連れで遊ぶなら → 近くで1日プランを作る」を末尾に必須化する。
 *
 * エリア引き継ぎ: 記事の area（都道府県slug）を /today に渡すと、/today 側は
 * そのエリアの駅ピッカーに着地する（首都圏なら主要ターミナル/子育て人気駅チップ）。
 */
export function NextPlanCTA({
  area,
  age,
}: {
  /** 記事の都道府県slug（'all' や undefined はエリア指定なしで /today へ） */
  area?: string;
  /** 記事の対象年齢帯（あれば /today に引き継ぐ） */
  age?: '0-1' | '2-3' | '4-6';
}) {
  const params = new URLSearchParams();
  if (area && area !== 'all') params.set('area', area);
  if (age) params.set('age', age);
  const qs = params.toString();
  const href = qs ? `/today?${qs}` : '/today';

  return (
    <section style={{ margin: '40px 0 0' }}>
      <Link
        href={href}
        onClick={() => trackEvent('today_cta_click', { area: area ?? 'all', age: age ?? 'none' })}
        style={{
          display: 'block',
          background: 'linear-gradient(135deg, rgba(201,96,62,0.10), rgba(201,96,62,0.04))',
          border: '1px solid rgba(201,96,62,0.22)',
          borderRadius: 16,
          padding: '20px 24px',
          textDecoration: 'none',
          color: 'var(--ink)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--clay-deep)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              TODAY&apos;S PLAN · 今日の流れをつくる
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
              このあと子連れで遊ぶなら、近くで「1日プラン」を作る
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              駅・年齢・天気を選ぶだけ。午前あそぶ→お昼たべる→午後 の移動少なめプランが3分で。
            </div>
          </div>
          <span style={{ fontSize: 22, color: 'var(--clay-deep)', flexShrink: 0 }}>→</span>
        </div>
      </Link>
    </section>
  );
}
