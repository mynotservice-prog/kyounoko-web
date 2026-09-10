import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon } from '@/components/kk/KkIcon';
import type { PlanMeta } from '@/lib/plans';

/**
 * 「今日のおすすめプラン」カード。/today（今日の流れ）への誘導が主目的。
 * 画像は社長支給の /img/top/today-plan.webp を使い、pickTopPlan の上位プランがあれば
 * タイトルと要約をテキストで添える（プランの hero は /hero-ai 系で品質が揃わないため使わない）。
 */
export function TopPlanCard({ plan }: { plan: PlanMeta | null }) {
  return (
    <div className="tv3-plan">
      <Link href="/today" className="tv3-plan-img" aria-label="今日の流れをつくる">
        <V2Img src="/img/top/today-plan.webp" seed="top-plan" alt="今日の1日プラン" />
        <span className="tv3-plan-tag">1日プラン</span>
      </Link>
      <div className="tv3-plan-body">
        <div className="tv3-plan-title">年齢×駅×天気で、今日の流れをつくる</div>
        <p className="tv3-plan-sub">
          午前・昼ごはん・午後の順に、無理のない「子連れの1日」を自動で組み立てます。
        </p>
        {plan && (
          <Link href={`/plan/${plan.id}`} className="tv3-plan-pick">
            <span className="tv3-plan-pick-lab">例えばこんなプラン</span>
            <span className="tv3-plan-pick-title">{plan.title}</span>
            <span className="tv3-plan-pick-ans">{plan.shortAnswer}</span>
          </Link>
        )}
        <Link href="/today" className="kk-btn block">
          今日の流れをつくる
          <KkIcon name="arrow-right" size={16} sw={2.2} />
        </Link>
      </div>
    </div>
  );
}
