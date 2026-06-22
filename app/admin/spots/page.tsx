import { SPOTS, SPOT_CATEGORY_LABEL, type SpotPlace } from '@/lib/spots';
import { AREAS, getAreaName, type AreaSlug } from '@/lib/area';
import { SpotsClient, type SpotRow } from './SpotsClient';

export const revalidate = 3600;

const PLACE_LABEL: Record<SpotPlace, string> = { indoor: '屋内', outdoor: '屋外', mixed: '屋内外' };
const BUDGET_LABEL: Record<string, string> = { free: '無料', low: '低', mid: '中', high: '高' };

export default function AdminSpots() {
  const allPrefs = AREAS.filter((a) => a.slug !== 'all' && a.block).sort();
  const notCoveredPrefs = allPrefs.filter((a) => !SPOTS[a.slug]).map((a) => a.name);

  const rows: SpotRow[] = [];
  for (const [areaKey, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    const areaName = getAreaName(areaKey as AreaSlug);
    for (const s of list) {
      rows.push({
        id: `${areaKey}|${s.name}|${s.city ?? ''}`,
        name: s.name,
        areaSlug: areaKey,
        areaName,
        category: SPOT_CATEGORY_LABEL[s.category] ?? s.category,
        place: PLACE_LABEL[s.place] ?? s.place,
        ages: (s.ages ?? []).join('/') + (s.ages?.length ? '歳' : ''),
        budget: s.budget ? BUDGET_LABEL[s.budget] ?? s.budget : '',
        city: s.city ?? '',
        note: s.note ?? '',
      });
    }
  }

  const areaOptions = Object.keys(SPOTS).map((slug) => ({ slug, name: getAreaName(slug as AreaSlug) }));
  const categoryOptions = [...new Set(rows.map((r) => r.category))].sort();

  return (
    <SpotsClient rows={rows} areaOptions={areaOptions} categoryOptions={categoryOptions} notCovered={notCoveredPrefs} />
  );
}
