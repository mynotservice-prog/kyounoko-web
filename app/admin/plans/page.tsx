import { getAllPlanMetas, getPlan } from '@/lib/plans';
import { AREAS, getAreaName } from '@/lib/area';
import { PlansClient, type PlanRow } from './PlansClient';

export const revalidate = 3600;

export default function AdminPlans() {
  const metas = getAllPlanMetas();
  const rows: PlanRow[] = metas.map((m) => {
    const p = getPlan(m.id);
    const body = p?.body ?? '';
    const plain = body
      .replace(/^#+\s.*$/gm, '')
      .replace(/[*_`>-]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    return {
      id: m.id,
      title: m.title,
      shortAnswer: m.shortAnswer,
      ageRanges: m.ageRanges,
      place: m.place,
      durationMin: m.durationMin,
      budget: m.budget,
      area: m.area,
      areaName: getAreaName(m.area),
      hero: m.hero,
      bodyPreview: plain.slice(0, 160),
      bodyLength: plain.length,
    };
  });

  const areaOptions = AREAS.filter((a) => a.slug !== 'all').map((a) => ({ slug: a.slug, name: getAreaName(a.slug) }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: 0 }}>
          プラン一覧
        </h1>
      </div>
      <PlansClient rows={rows} areaOptions={areaOptions} />
    </>
  );
}
