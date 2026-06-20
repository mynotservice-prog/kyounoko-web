// 駅×条件ページ（プログラマティックSEO）の健全性モニタ。
// page.tsx / sitemap.ts の index/noindex・canonical集約ロジックを忠実に再現し、
// 「薄ページが誤ってindex/sitemap収録される」リークを検出する。
//
// 実行: npx tsx scripts/seo-thin-page-audit.ts
// CI/prebuild に組み込む場合: 異常（L1自canonical未収録 / L2 sitemap×noindex矛盾 /
//   L4 幽霊ページ）が1件でもあれば exit code 1 で落ちる。
//
// 背景: AdSense「有用性の低いコンテンツ」対策で matched>=3 のみ index する設計。
//   この監査でその設計が実データ上も崩れていないことを継続確認する。
import { TOKYO_STATIONS } from '@/lib/tokyo-stations';
import { getAllStations } from '@/lib/all-stations';
import { getStationWithChains } from '@/lib/station-restaurants';
import { getIndieRestaurantsByStation } from '@/lib/indie-restaurants';
import {
  STATION_CONDITIONS,
  filterChainsByCondition,
  filterIndiesByCondition,
  hasMatchingItems,
  getConditionKind,
} from '@/lib/station-conditions';
import {
  getSpotsForStation,
  filterSpotsByCondition,
  hasMatchingSpots,
  getSpotConditionCanonicalSlug,
} from '@/lib/station-spots';

type Row = {
  slug: string;
  condition: string;
  kind: 'restaurant' | 'spot';
  region: string;
  matched: number;
  generated: boolean; // generateStaticParams に含まれる（=ページ存在）
  indexed: boolean; // robots noindex でない（matched>=3）
  selfCanonical: boolean; // canonical が自分自身
  inSitemap: boolean; // sitemap に含まれる
};

const rows: Row[] = [];

function evalCondition(
  slug: string,
  region: string,
  condSlug: string,
  chains: ReturnType<typeof getStationWithChains> extends infer T ? any : never,
  indies: any,
  spotsAll: any,
  restaurantAllowed: boolean,
) {
  const kind = getConditionKind(condSlug as any);
  if (kind === 'restaurant' && !restaurantAllowed) return; // 非Tokyoはrestaurant無し

  let matched = 0;
  let generated = false;
  if (kind === 'restaurant') {
    generated = hasMatchingItems(chains, indies, condSlug as any);
    matched =
      filterChainsByCondition(chains, condSlug as any).length +
      filterIndiesByCondition(indies, condSlug as any).length;
  } else {
    generated = hasMatchingSpots(spotsAll, condSlug as any);
    matched = filterSpotsByCondition(spotsAll, condSlug as any).length;
  }
  if (!generated) return; // generateStaticParams で弾かれる（ページ無し）

  const selfCanonical =
    kind === 'spot' ? getSpotConditionCanonicalSlug(slug, condSlug as any) === slug : true;
  const indexed = matched >= 3;
  // sitemap: matched>=3 かつ spotは自canonicalのみ
  const inSitemap = matched >= 3 && (kind === 'restaurant' || selfCanonical);

  rows.push({
    slug,
    condition: condSlug,
    kind,
    region,
    matched,
    generated,
    indexed,
    selfCanonical,
    inSitemap,
  });
}

// Tokyo: restaurant + spot
for (const st of TOKYO_STATIONS) {
  const data = getStationWithChains(st.slug);
  const chains = data?.chains ?? [];
  const indies = getIndieRestaurantsByStation(st.slug);
  const { all: spotsAll } = getSpotsForStation(st.slug);
  for (const cond of STATION_CONDITIONS) {
    evalCondition(st.slug, 'tokyo', cond.slug, chains, indies, spotsAll, true);
  }
}
// 非Tokyo: spot のみ
for (const st of getAllStations()) {
  if (st.region === 'tokyo') continue;
  const { all: spotsAll } = getSpotsForStation(st.slug);
  for (const cond of STATION_CONDITIONS) {
    evalCondition(st.slug, st.region, cond.slug, [], [], spotsAll, false);
  }
}

// ===== 集計 =====
const n = rows.length;
const indexed = rows.filter((r) => r.indexed);
const noindex = rows.filter((r) => !r.indexed);
const inSitemap = rows.filter((r) => r.inSitemap);

const byMatched = new Map<string, number>();
for (const r of rows) {
  const bucket = r.matched >= 6 ? '6+' : r.matched >= 3 ? '3-5' : String(r.matched);
  byMatched.set(bucket, (byMatched.get(bucket) ?? 0) + 1);
}

console.log('===== 駅×条件ページ 実数監査 =====');
console.log(`生成ページ総数 (generateStaticParams): ${n}`);
console.log(`  - index (matched>=3): ${indexed.length}`);
console.log(`  - noindex (matched 1-2): ${noindex.length}`);
console.log(`  - sitemap収録: ${inSitemap.length}`);
console.log('');
console.log('matched件数分布:');
for (const k of ['1', '2', '3-5', '6+']) {
  console.log(`  ${k}件: ${byMatched.get(k) ?? 0}`);
}
console.log('');

// kind別
for (const kind of ['restaurant', 'spot'] as const) {
  const sub = rows.filter((r) => r.kind === kind);
  const idx = sub.filter((r) => r.indexed).length;
  console.log(`[${kind}] 生成${sub.length} / index${idx} / noindex${sub.length - idx}`);
}
console.log('');

// ===== リーク検出 =====
console.log('===== リーク検出 =====');
// L1: indexだがsitemap非収録（canonical集約で正常なものを除く）
const indexedNotInSitemap = indexed.filter((r) => !r.inSitemap);
const indexedNonCanonical = indexedNotInSitemap.filter((r) => !r.selfCanonical);
const indexedSelfCanonNotSitemap = indexedNotInSitemap.filter((r) => r.selfCanonical);
console.log(
  `L1 index×sitemap非収録: ${indexedNotInSitemap.length} (うちcanonical集約=正常: ${indexedNonCanonical.length} / 自canonicalなのに未収録=異常: ${indexedSelfCanonNotSitemap.length})`,
);
// L2: sitemap収録だがnoindex（=矛盾。あってはならない）
const sitemapButNoindex = inSitemap.filter((r) => !r.indexed);
console.log(`L2 sitemap収録×noindex(矛盾): ${sitemapButNoindex.length}`);
// L3: index かつ 自canonical だが matched==3 ギリギリ（薄さ境界）
const borderline = indexed.filter((r) => r.matched === 3 && r.selfCanonical);
console.log(`L3 index自canonicalで境界(matched==3): ${borderline.length}`);
// L4: noindexページのうち、follow付与で内部リンクは生きてる前提。matched==0は本来生成されないはず
const zeroButGenerated = rows.filter((r) => r.matched === 0);
console.log(`L4 matched==0なのに生成(本来あり得ない): ${zeroButGenerated.length}`);

if (indexedSelfCanonNotSitemap.length > 0) {
  console.log('\n  ⚠ L1異常サンプル:');
  for (const r of indexedSelfCanonNotSitemap.slice(0, 10))
    console.log(`    /station/${r.slug}/${r.condition} (matched=${r.matched})`);
}
if (sitemapButNoindex.length > 0) {
  console.log('\n  ⚠ L2矛盾サンプル:');
  for (const r of sitemapButNoindex.slice(0, 10))
    console.log(`    /station/${r.slug}/${r.condition} (matched=${r.matched})`);
}

// noindexページの内訳（AdSense観点：crawlable薄ページの量）
console.log('\n===== noindex薄ページ内訳（AdSense観点） =====');
const noindexByCond = new Map<string, number>();
for (const r of noindex) noindexByCond.set(r.condition, (noindexByCond.get(r.condition) ?? 0) + 1);
const sorted = [...noindexByCond.entries()].sort((a, b) => b[1] - a[1]);
for (const [c, cnt] of sorted) console.log(`  ${c}: ${cnt}`);

// ===== 異常があれば非0で終了（CI/prebuild用） =====
const anomalies =
  indexedSelfCanonNotSitemap.length + sitemapButNoindex.length + zeroButGenerated.length;
if (anomalies > 0) {
  console.error(`\n❌ 設計違反 ${anomalies}件を検出。index/noindex/sitemapの整合が崩れています。`);
  process.exitCode = 1;
} else {
  console.log('\n✅ 設計違反なし（index/noindex/sitemapの整合は健全）。');
}
