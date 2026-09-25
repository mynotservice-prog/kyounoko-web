/**
 * 調査②「外食チェーン 離乳食対応の公式記載 実態調査」の読み口（data/rinyushoku-official-2026.json）。
 * 生成は scripts/build-rinyushoku-survey.mjs。数字はここから引き、ページ本文で手打ちしない。
 *
 * 約束（docs/writing-rules.md §4）: 「記載なし」は公式に書かれていないだけで「できない」ではない。
 * 「未確認」（公式ページを読めなかった）・「未照合」（その項目を照合していない）は分母から外す。
 */
import surveyJson from '@/data/rinyushoku-official-2026.json';

export type SurveyCellKey = 'mochikomi' | 'atatame' | 'oyu' | 'hanbai';
export type SurveyCell = { value: string; note?: string; sourceUrl?: string };

export type SurveyChain = {
  key: string;
  name: string;
  group: 'main' | 'supplement';
  sourceFile: string;
  quote: string;
  sourceUrl: string;
  positiveControl: string;
  checkedAt: string;
  cells: Record<SurveyCellKey, SurveyCell>;
  correction?: string;
  articleSlug: string | null;
  articleKind: 'rinyushoku' | 'koryaku' | null;
};

export type SurveyTally = {
  stated: number;
  denominator: number;
  total: number;
  counts: Record<string, number>;
  chains: string[];
};

type SurveyFile = {
  title: string;
  generatedAt: string;
  surveyPeriod: string;
  generator: string;
  inputs: string[];
  summary: { chainCount: number; allergyOnlyMochikomi: string[]; anyStated: string[] } & Record<SurveyCellKey, SurveyTally>;
  chains: SurveyChain[];
  supplement: SurveyChain[];
  supplementSummary: Record<SurveyCellKey, SurveyTally>;
  supplementExcluded: { key: string; name: string; reason: string }[];
};

const FILE = surveyJson as unknown as SurveyFile;

export const SURVEY_CELL_KEYS: SurveyCellKey[] = ['mochikomi', 'atatame', 'oyu', 'hanbai'];

export const SURVEY_CELL_LABELS: Record<SurveyCellKey, string> = {
  mochikomi: '離乳食の持ち込み',
  atatame: '離乳食の温め',
  oyu: '調乳用のお湯',
  hanbai: '店内のベビーフード販売',
};

export const SURVEY_CELL_SHORT: Record<SurveyCellKey, string> = {
  mochikomi: '持ち込み',
  atatame: '温め',
  oyu: 'お湯',
  hanbai: '販売',
};

export function getRinyushokuSurvey(): SurveyFile {
  return FILE;
}

export function getRinyushokuSurveyGeneratedAt(): string {
  return FILE.generatedAt;
}

/** 公式に「ある」と書かれている値か（表の強調・並べ替えに使う） */
export function isStated(v: string): boolean {
  return /^明記|^条件付き|^一部店舗/.test(v);
}
