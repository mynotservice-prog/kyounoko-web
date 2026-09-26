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

/** CSV配布用の縦持ち行（チェーン×設備。公開しているセルだけ）。label は公式表記のまま */
export function buildCoverageCsvRows(): Array<CoverageRow & { key: CoverageKey }> {
  const rows: Array<CoverageRow & { key: CoverageKey }> = [];
  for (const key of COVERAGE_KEY_ORDER) rows.push(...rankByFacility(key).map((r) => ({ ...r, key })));
  return rows;
}

/**
 * 子ども向けの設備・サービスとして扱う項目。結論の「子ども向け属性を1つも公開していない」判定に使う。
 * 入口の段差なし・個室・多目的トイレ・駐車場は子連れ以外の来店者にも向けた一般設備なので含めない。
 */
export const KIDS_COVERAGE_KEYS: CoverageKey[] = [
  'kidsChair', 'kidsMenu', 'zashiki', 'boxSeat', 'diaperTable', 'nursingRoom', 'strollerToSeat',
  'kidsSpace', 'kidsCutlery', 'babyFoodBringIn', 'toriwake',
];

/** 子ども向け項目（KIDS_COVERAGE_KEYS）を1つも公開していないチェーン。公開しているのは一般設備だけ */
export function getChainsWithoutKidsAttributes(): ChainCoverage[] {
  return FILE.chains.filter((c) => !KIDS_COVERAGE_KEYS.some((k) => c.facilities[k]));
}

/** 集計期間（各チェーンの集計日の最小〜最大） */
export function getCoveragePeriod(): { from: string; to: string } {
  const dates = FILE.chains.map((c) => c.countedAt).sort();
  return { from: dates[0], to: dates[dates.length - 1] };
}

export type FacilityStat = {
  key: CoverageKey;
  /** その設備を公式店舗検索で公開しているチェーン数（母数） */
  chains: number;
  stores: number;
  count: number;
  /** 公開チェーンの全店合算の率（表示あり店舗数の合計 ÷ 数えた店舗数の合計） */
  rate: number;
  /** チェーン別の率の中央値（大規模チェーンに引っぱられない見方） */
  medianRate: number;
  top: CoverageRow;
  bottom: CoverageRow;
  /** 項目は公開しているが表示が0店のチェーン数（「公開していない」とは別） */
  zeroChains: number;
  /** 全店に表示があるチェーン数 */
  fullChains: number;
  /** 数えた公式表記（チェーンごとに違う） */
  labels: string[];
};

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** 設備ごとの比較表（公開しているチェーンだけを母数にする） */
export function getFacilityStats(): FacilityStat[] {
  return getCoverageSummary().byFacility.map((f) => {
    const rows = rankByFacility(f.key);
    return {
      ...f,
      medianRate: median(rows.map((r) => r.rate)),
      top: rows[0],
      bottom: rows[rows.length - 1],
      zeroChains: rows.filter((r) => r.count === 0).length,
      fullChains: rows.filter((r) => r.total > 0 && r.count === r.total).length,
      labels: [...new Set(rows.map((r) => r.label))],
    };
  });
}

/**
 * 図1（本文）とOGP画像に共通で載せる行。2チェーン以上が公開している子連れ関連の設備を率の降順で。
 * 駐車場は子連れ設備ではない一般設備で、公開チェーン数も桁違いなので図からは外す（表とCSVには載せる）。
 */
export function getCoverageFigureRows(): CoverageSummary['byFacility'] {
  return getCoverageSummary()
    .byFacility.filter((f) => f.chains >= 2 && f.key !== 'parking')
    .sort((a, b) => b.rate - a.rate);
}

/**
 * 更新履歴（ページの「更新履歴」欄）。集計結果ではなく出来事の記録なので、ここだけは手で追記する。
 * 数字はコミット 97200a322（2026-09-11）・a0128d307（2026-09-25）の data/chain-coverage.json と一致。
 */
export const COVERAGE_HISTORY: Array<{ date: string; text: string }> = [
  { date: '2026-09-11', text: '65チェーンを集計して公開' },
  { date: '2026-09-25', text: '25チェーンを追加集計（計90チェーン）' },
];

/** 結論の見出しに使う設備（子ども用椅子）。数字は getFacilityStats から引く */
export const HEADLINE_KEY: CoverageKey = 'kidsChair';

export function getCoverageHeadline(): FacilityStat | null {
  return getFacilityStats().find((f) => f.key === HEADLINE_KEY) ?? null;
}
