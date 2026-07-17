import { getAllPlans } from '@/lib/plans';
import { AREAS, getAreaName } from '@/lib/area';
import { PlansClient, type PlanRow } from './PlansClient';

// admin は常に最新を表示（v7, 2026-06-13: ISR キャッシュで旧イラストが残る問題対策）
export const dynamic = 'force-dynamic';

export default function AdminPlans() {
  // 1パスで全プラン(meta+body)を取得。以前は getAllPlanMetas() + getPlan(id) を件数分
  // ループしていて O(N^2)（毎回ディレクトリ全走査）だったため表示が遅かった。
  const plans = getAllPlans();
  const rows: PlanRow[] = plans.map((p) => {
    const plain = (p.body ?? '')
      .replace(/^#+\s.*$/gm, '')
      .replace(/[*_`>-]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    return {
      id: p.id,
      title: p.title,
      shortAnswer: p.shortAnswer,
      ageRanges: p.ageRanges,
      place: p.place,
      durationMin: p.durationMin,
      budget: p.budget,
      area: p.area,
      areaName: getAreaName(p.area),
      hero: p.hero,
      bodyPreview: plain.slice(0, 160),
      bodyLength: plain.length,
    };
  });

  const areaOptions = AREAS.filter((a) => a.slug !== 'all').map((a) => ({ slug: a.slug, name: getAreaName(a.slug) }));

  return <PlansClient rows={rows} areaOptions={areaOptions} />;
}
