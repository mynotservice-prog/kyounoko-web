'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { KkIcon } from '@/components/kk/KkIcon';

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
    <section className="av3-planlink">
      <Link
        href={href}
        onClick={() => trackEvent('today_cta_click', { area: area ?? 'all', age: age ?? 'none' })}
        className="av3-planlink-link"
      >
        <span className="av3-planlink-body">
          <span className="av3-planlink-eyebrow">TODAY&apos;S PLAN · 今日の流れをつくる</span>
          <span className="av3-planlink-title">
            このあと子連れで遊ぶなら、近くで「1日プラン」を作る
          </span>
          <span className="av3-planlink-sub">
            駅・年齢・天気を選ぶだけ。午前あそぶ→お昼たべる→午後 の移動少なめプランが3分で。
          </span>
        </span>
        <span className="av3-planlink-arrow" aria-hidden="true">
          <KkIcon name="arrow-right" size={20} />
        </span>
      </Link>
    </section>
  );
}
