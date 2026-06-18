import fs from 'node:fs';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { getAreaName, type AreaSlug } from '@/lib/area';

const TIER: Record<string, string> = {
  indoor: 'A', farm: 'A', seasonal: 'A', restaurant: 'A', museum: 'A',
  aquarium: 'B', zoo: 'B',
  amusement: 'C', park: 'C',
};

const q = (s: unknown) => '"' + String(s ?? '').replace(/"/g, '""') + '"';

const rows = getAllSpotsWithSlug()
  .map((e) => ({
    tier: TIER[e.spot.category] ?? 'C',
    cat: SPOT_CATEGORY_LABEL[e.spot.category],
    name: e.spot.name,
    area: getAreaName(e.area as AreaSlug) || e.area,
    city: e.spot.ward ?? e.spot.city ?? '',
    url: 'https://kyounoko.jp/spot/' + e.slug,
  }))
  .sort((a, b) => a.tier.localeCompare(b.tier) || a.area.localeCompare(b.area) || a.cat.localeCompare(b.cat));

const header = ['優先Tier', 'カテゴリ', '施設名', 'エリア', '市区町村', 'きょうのこ掲載URL', '公式サイト', '問い合わせ方法', 'Instagram', 'メディア窓口', '運営主体・所感'];
const lines = [header.map(q).join(',')];
for (const r of rows) {
  lines.push([r.tier, r.cat, r.name, r.area, r.city, r.url, '', '', '', '', ''].map(q).join(','));
}
fs.writeFileSync('docs/outreach-full-688.csv', lines.join('\n') + '\n');

const byTier = rows.reduce<Record<string, number>>((m, r) => { m[r.tier] = (m[r.tier] || 0) + 1; return m; }, {});
console.log('total', rows.length, 'byTier', JSON.stringify(byTier));
