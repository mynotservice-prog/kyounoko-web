/**
 * チェーン別「設備カバー率センサス」の読み口（data/chain-coverage.json）。
 *
 * 何のデータか: 各チェーンの公式店舗検索が店舗ごとに公開している設備属性を
 * 全店舗ぶん取得し、「その設備の表示がある店舗数 / 数えた店舗数」を集計したもの。
 * 生成は scripts/chain-coverage/run.mjs（アダプタは scripts/chain-coverage/<chain>.mjs）。
 *
 * lib/chain-facilities.ts（公式FAQ等の有無照合＝チェーン単位の ✓/△/—）とは別系統で、
 * こちらは「店舗による」を率で答える一次データ。調査ページ /data/chain-facility-coverage が読む。
 *
 * 約束: 公式店舗検索が属性として持つ設備しか入っていない。count 0 は「0店」、
 * キーが無いのは「公式が公開していない」で、意味が違う（表示側でも区別すること）。
 */
import coverageJson from '@/data/chain-coverage.json';
import excludedJson from '@/data/chain-coverage-excluded.json';
import { FACILITY_LABELS, getChainFacilitiesForSurvey, type FacilityKey } from '@/lib/chain-facilities';

/** 12項目 + 店舗検索の属性として頻出する家族向け項目 */
export type CoverageKey =
  | FacilityKey
  | 'kidsSpace'
  | 'privateRoom'
  | 'multiToilet'
  | 'parking';

export const COVERAGE_LABELS: Record<CoverageKey, string> = {
  ...FACILITY_LABELS,
  kidsSpace: 'キッズスペース',
  privateRoom: '個室',
  multiToilet: '多目的トイレ',
  parking: '駐車場',
};

/** 調査ページで扱う順（親の判断に効く順） */
export const COVERAGE_KEY_ORDER: CoverageKey[] = [
  'kidsChair', 'kidsMenu', 'zashiki', 'boxSeat', 'diaperTable', 'nursingRoom',
  'stepFree', 'strollerToSeat', 'kidsSpace', 'privateRoom', 'multiToilet', 'parking',
  'kidsCutlery', 'babyFoodBringIn', 'toriwake', 'allergenInfo',
];

export type CoverageFacility = { count: number; label: string };

export type ChainCoverage = {
  chain: string;
  name?: string;
  sourceUrl: string;
  method: string;
  total: number;
  note?: string;
  countedAt: string;
  facilities: Partial<Record<CoverageKey, CoverageFacility>>;
};

type CoverageFile = { generatedAt: string; method: string; chains: ChainCoverage[] };

const FILE = coverageJson as unknown as CoverageFile;

export function getCoverageGeneratedAt(): string {
  return FILE.generatedAt;
}

export function getAllChainCoverage(): ChainCoverage[] {
  return FILE.chains;
}

export function getChainCoverage(chainKey: string): ChainCoverage | null {
  return FILE.chains.find((c) => c.chain === chainKey) ?? null;
}

/** 表示名と攻略記事slugをチェーンDBから引く（センサス側の name は補助） */
export function coverageDisplay(c: ChainCoverage): { name: string; koryakuSlug: string | null } {
  const db = getChainFacilitiesForSurvey().find((x) => x.key === c.chain);
  return { name: db?.name ?? c.name ?? c.chain, koryakuSlug: db?.koryakuSlug ?? null };
}

export type CoverageRow = {
  chain: string;
  name: string;
  koryakuSlug: string | null;
  sourceUrl: string;
  countedAt: string;
  total: number;
  count: number;
  rate: number;
  label: string;
};

/** 設備キーごとの横断ランキング（公式が公開しているチェーンだけ）。率の降順・同率は店舗数の多い順 */
export function rankByFacility(key: CoverageKey): CoverageRow[] {
  return FILE.chains
    .filter((c) => c.facilities[key])
    .map((c) => {
      const f = c.facilities[key]!;
      const d = coverageDisplay(c);
      return {
        chain: c.chain,
        name: d.name,
        koryakuSlug: d.koryakuSlug,
        sourceUrl: c.sourceUrl,
        countedAt: c.countedAt,
        total: c.total,
        count: f.count,
        rate: c.total ? f.count / c.total : 0,
        label: f.label,
      };
    })
    .sort((a, b) => b.rate - a.rate || b.total - a.total || a.name.localeCompare(b.name, 'ja'));
}

export type CoverageSummary = {
  chainCount: number;
  storeCount: number;
  cellCount: number;
  /** 設備キーごと: 公開しているチェーン数・店舗数・表示あり店舗数 */
  byFacility: Array<{ key: CoverageKey; chains: number; stores: number; count: number; rate: number }>;
};

export function getCoverageSummary(): CoverageSummary {
  const chains = FILE.chains;
  const byFacility = COVERAGE_KEY_ORDER.map((key) => {
    const rows = chains.filter((c) => c.facilities[key]);
    const stores = rows.reduce((a, c) => a + c.total, 0);
    const count = rows.reduce((a, c) => a + (c.facilities[key]?.count ?? 0), 0);
    return { key, chains: rows.length, stores, count, rate: stores ? count / stores : 0 };
  }).filter((f) => f.chains > 0);
  return {
    chainCount: chains.length,
    storeCount: chains.reduce((a, c) => a + c.total, 0),
    cellCount: chains.reduce((a, c) => a + Object.keys(c.facilities).length, 0),
    byFacility,
  };
}

/** 率の表示。1%未満の非ゼロは小数1桁で出し、「2店（0%）」のような矛盾を避ける */
export function formatRate(v: number): string {
  if (v > 0 && v < 0.01) return `${(v * 100).toFixed(1)}%`;
  return `${Math.round(v * 100)}%`;
}

export type CoverageExcluded = { chain: string; name: string; locator: string; reason: string };

/** 確認したが集計に載せなかったチェーン（理由つき）。「載っていない＝設備が無い」と読まれないための開示 */
export function getCoverageExcluded(): CoverageExcluded[] {
  const db = getChainFacilitiesForSurvey();
  return (excludedJson as { chains: Array<{ chain: string; locator: string; reason: string }> }).chains.map((e) => ({
    ...e,
    name: db.find((c) => c.key === e.chain)?.name ?? e.chain,
  }));
}

/** CSV配布用の縦持ち行（チェーン×設備） */
export function buildCoverageCsvRows(): CoverageRow[] {
  const rows: CoverageRow[] = [];
  for (const key of COVERAGE_KEY_ORDER) rows.push(...rankByFacility(key).map((r) => ({ ...r, label: `${COVERAGE_LABELS[key]}（公式表記: ${r.label}）` })));
  return rows;
}
