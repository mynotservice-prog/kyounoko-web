/**
 * GA4 Data API 連携 — A/B テストの割当・コンバージョン集計。
 *
 * 用途: /admin/ab ダッシュボードで、lib/ab.ts により割り当てた variant ごとの
 *   - 割当数 (ab_assignment イベント / experiment_id × variant)
 *   - クリック数 (例: hero_cta_click / variant)
 *   - CTR
 * を可視化する。
 *
 * セットアップは lib/ga4-events.ts と同じ環境変数を使う:
 *   - GA4_PROPERTY_ID
 *   - GOOGLE_APPLICATION_CREDENTIALS_JSON
 *
 * 未設定 or API エラー時は configured=false を返してプレースホルダ表示にフォールバック。
 *
 * 注意: experiment_id / variant パラメータを GA4 上で「カスタムディメンション」として
 *   登録しておく必要がある。未登録のままだと customEvent:experiment_id がすべて
 *   (not set) になり、集計に出てこない。
 */

import { getGa4PropertyId, getGoogleCredentialsJson } from './google-auth';

const GA4_PROPERTY_ID = getGa4PropertyId();
const GA4_CREDS = getGoogleCredentialsJson();

/** variant 別の集計エントリ */
export type VariantStat = {
  variant: string;
  /** ab_assignment 件数 */
  assignments: number;
  /** クリック等のコンバージョンイベント件数 */
  conversions: number;
  /** CTR = conversions / assignments (0除算は0扱い) */
  ctr: number;
};

export type ExperimentStat = {
  experimentId: string;
  /** UI 表示用の日本語名 (定義側で渡す) */
  label: string;
  /** 対応するコンバージョンイベント名 (例: hero_cta_click) */
  conversionEventName: string;
  /** variant 別集計 (control が先頭) */
  variants: VariantStat[];
  /** 期間内の総割当数 */
  totalAssignments: number;
};

export type ABResult =
  | { configured: true; days: number; experiments: ExperimentStat[] }
  | { configured: false; reason: string };

/** 実験定義 — /admin/ab で表示する実験を列挙する */
export type ABExperimentDef = {
  /** 実験ID (ab.ts 側と一致させる) */
  experimentId: string;
  /** 日本語ラベル */
  label: string;
  /** 想定 variant 一覧 (順序は control が先頭) */
  variants: readonly string[];
  /** 対応するクリック等のコンバージョンイベント名 */
  conversionEventName: string;
  /** variant を識別するためにコンバージョンイベント側で見る param 名 (通常 'variant') */
  conversionVariantParam: string;
  /** 補足説明 */
  note?: string;
};

export function isGA4Configured(): boolean {
  return Boolean(GA4_PROPERTY_ID && GA4_CREDS);
}

/**
 * 各実験について、ab_assignment と コンバージョンイベントを variant 別に集計。
 *
 * 内部処理:
 *  1. ab_assignment を customEvent:experiment_id × customEvent:variant で集計
 *  2. 各実験につき conversionEventName を customEvent:<param> 次元で集計
 *  3. 実験定義に基づいて結合 → CTR を計算
 *
 * エラー時は configured=false で返す (build を落とさない方針)。
 */
export async function getABStats(opts: {
  experiments: readonly ABExperimentDef[];
  days?: number;
}): Promise<ABResult> {
  const days = opts.days ?? 30;

  if (!GA4_PROPERTY_ID || !GA4_CREDS) {
    return { configured: false, reason: 'GA4_PROPERTY_ID / GOOGLE_APPLICATION_CREDENTIALS_JSON 未設定' };
  }

  if (opts.experiments.length === 0) {
    return { configured: true, days, experiments: [] };
  }

  try {
    const credentials = JSON.parse(GA4_CREDS);
    const mod = await import('@google-analytics/data');
    const client = new mod.BetaAnalyticsDataClient({ credentials });

    const startDate = `${days}daysAgo`;
    const endDate = 'today';
    const property = `properties/${GA4_PROPERTY_ID}`;

    // 1. ab_assignment を experiment_id × variant で分解
    //    assignmentMap[experimentId][variant] = count
    const assignmentMap: Record<string, Record<string, number>> = {};
    try {
      const [assignResp] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'customEvent:experiment_id' },
          { name: 'customEvent:variant' },
        ],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value: 'ab_assignment' },
          },
        },
        limit: 1000,
      });
      for (const row of assignResp.rows ?? []) {
        const exp = row.dimensionValues?.[0]?.value ?? '';
        const variant = row.dimensionValues?.[1]?.value ?? '';
        const c = Number(row.metricValues?.[0]?.value ?? 0);
        if (!exp || exp === '(not set)') continue;
        if (!variant || variant === '(not set)') continue;
        if (!assignmentMap[exp]) assignmentMap[exp] = {};
        assignmentMap[exp][variant] = (assignmentMap[exp][variant] ?? 0) + c;
      }
    } catch (err) {
      console.warn('[ga4-ab] ab_assignment fetch failed:', err);
    }

    // 2. 各実験ごとのコンバージョンイベントを variant 別に取得 (並列)
    const conversionByExp: Record<string, Record<string, number>> = {};
    await Promise.all(
      opts.experiments.map(async (exp) => {
        conversionByExp[exp.experimentId] = {};
        try {
          const [convResp] = await client.runReport({
            property,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: `customEvent:${exp.conversionVariantParam}` }],
            metrics: [{ name: 'eventCount' }],
            dimensionFilter: {
              andGroup: {
                expressions: [
                  {
                    filter: {
                      fieldName: 'eventName',
                      stringFilter: { matchType: 'EXACT', value: exp.conversionEventName },
                    },
                  },
                  // experiment_id が一致するクリックだけを数えたいが、
                  // クリックイベント側に experiment_id を必ず付けている前提が崩れた時に
                  // ノイズが入るのを防ぐため、experiment_id フィルタは「設定がある場合のみ」とする。
                  // hero_cta_click は experiment_id を付与しているので入れておく。
                  {
                    filter: {
                      fieldName: 'customEvent:experiment_id',
                      stringFilter: { matchType: 'EXACT', value: exp.experimentId },
                    },
                  },
                ],
              },
            },
            limit: 100,
          });
          for (const row of convResp.rows ?? []) {
            const variant = row.dimensionValues?.[0]?.value ?? '';
            const c = Number(row.metricValues?.[0]?.value ?? 0);
            if (!variant || variant === '(not set)') continue;
            conversionByExp[exp.experimentId][variant] =
              (conversionByExp[exp.experimentId][variant] ?? 0) + c;
          }
        } catch (err) {
          // 1実験のフェッチ失敗で全体を落とさない (フィルタ未対応 GA4 プロパティでも安全)
          console.warn(`[ga4-ab] conversion fetch failed for ${exp.experimentId}:`, err);
        }
      })
    );

    // 3. 定義と結合
    const experiments: ExperimentStat[] = opts.experiments.map((exp) => {
      const assigns = assignmentMap[exp.experimentId] ?? {};
      const convs = conversionByExp[exp.experimentId] ?? {};
      // 定義された variant に加え、GA4 にだけ現れた未知 variant も拾う
      const variantSet = new Set<string>([...exp.variants]);
      for (const v of Object.keys(assigns)) variantSet.add(v);
      for (const v of Object.keys(convs)) variantSet.add(v);
      // 定義順 → 未知 variant は末尾
      const ordered: string[] = [
        ...exp.variants.filter((v) => variantSet.has(v)),
        ...[...variantSet].filter((v) => !exp.variants.includes(v)),
      ];
      const variants: VariantStat[] = ordered.map((variant) => {
        const a = assigns[variant] ?? 0;
        const c = convs[variant] ?? 0;
        const ctr = a > 0 ? c / a : 0;
        return { variant, assignments: a, conversions: c, ctr };
      });
      const totalAssignments = variants.reduce((s, v) => s + v.assignments, 0);
      return {
        experimentId: exp.experimentId,
        label: exp.label,
        conversionEventName: exp.conversionEventName,
        variants,
        totalAssignments,
      };
    });

    return { configured: true, days, experiments };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn('[ga4-ab] runReport failed:', reason);
    return { configured: false, reason };
  }
}
