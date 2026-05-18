import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getABStats,
  type ABExperimentDef,
  type ExperimentStat,
  type VariantStat,
} from '@/lib/ga4-ab';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'A/B テスト結果 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/ab — A/B テストの割当・CTR・コンバージョンを variant 別に可視化する。
 *
 * 対象データ:
 *  - GA4 イベント `ab_assignment` (params: experiment_id, variant) → 割当数
 *  - 各実験に対応するコンバージョンイベント (例: hero_cta_click) → クリック数
 *  - CTR = clicks / assignments
 *
 * GA4 Data API 未連携 or データ不足時はプレースホルダ表示。build を落とさない方針
 * (getABStats 内部で try/catch 済)。
 *
 * 統計的有意性は p値計算は省略し、件数と差分%だけを表示する (要件に従う)。
 * 件数差が 10% 未満の場合は「データ不足/差なし」の注記を表示。
 */
const EXPERIMENTS: ABExperimentDef[] = [
  {
    experimentId: 'hero-cta-2026-05',
    label: 'ヒーロー CTA テキスト',
    variants: ['A', 'B'] as const,
    conversionEventName: 'hero_cta_click',
    conversionVariantParam: 'variant',
    note: 'A=「条件を入れる」/ B=「今日のヒントを見る」',
  },
];

/** 件数差が10%未満のときは差なし扱いにする閾値 */
const MIN_DIFF_RATIO = 0.1;
/** 統計的判定が信頼できないと見なす最低 assignment 数 (variant 単位) */
const MIN_SAMPLE_PER_VARIANT = 30;

export default async function AdminABPage() {
  const result = await getABStats({
    experiments: EXPERIMENTS,
    days: 30,
  });

  const configured = result.configured;
  const days = configured ? result.days : 30;
  const experiments = configured ? result.experiments : [];

  // データのある実験 (assignment > 0) があるかどうか
  const anyData = experiments.some((e) => e.totalAssignments > 0);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          A/Bテスト結果
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          過去{days}日間 · 実験 {EXPERIMENTS.length}件
          {configured && (
            <>
              {' '}· 計測中 <strong style={{ color: 'var(--ink)' }}>{experiments.filter((e) => e.totalAssignments > 0).length}</strong>件
            </>
          )}
        </p>
      </div>

      {!configured && (
        <div
          style={{
            marginBottom: 24,
            padding: '14px 18px',
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            color: 'var(--ink-sub)',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: 'var(--clay-deep)' }}>GA4 未連携</strong> —
          GA4 Data API の認証情報が未設定のため、件数は表示できません。
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            GA4_PROPERTY_ID
          </code>
          と
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            GOOGLE_APPLICATION_CREDENTIALS_JSON
          </code>
          を環境変数に設定してください。
          {'reason' in result && result.reason && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-mute)' }}>
              理由: {result.reason}
            </div>
          )}
        </div>
      )}

      {configured && !anyData && (
        <div
          style={{
            marginBottom: 24,
            padding: '14px 18px',
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            color: 'var(--ink-sub)',
            lineHeight: 1.7,
          }}
        >
          現在計測中のテストはまだ十分なデータがありません。
          GA4 のカスタムディメンション
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            experiment_id
          </code>
          ・
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            variant
          </code>
          が未登録の場合もここに表示されます。
        </div>
      )}

      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {EXPERIMENTS.map((def) => {
          const stat = experiments.find((e) => e.experimentId === def.experimentId);
          return <ExperimentCard key={def.experimentId} def={def} stat={stat} configured={configured} />;
        })}
      </section>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95 }}>
          <li><Link href="/admin/events">イベント計測ダッシュボード</Link></li>
          <li><Link href="/admin/insights">記事品質ダッシュボード</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
          A/B テスト基盤は <code>lib/ab.ts</code> の <code>useABVariant</code> を使用。
          GA4 へは <code>ab_assignment</code> イベント (params: <code>experiment_id</code>, <code>variant</code>) として
          記録される。新規実験を追加する場合は本ページの <code>EXPERIMENTS</code> 配列にも追記すること。
          p値などの厳密な統計判定は実装していないため、差分10%未満は「差なし」と表示する保守的な
          表示にしている。
        </p>
      </div>
    </>
  );
}

// ====================== UI ======================

function ExperimentCard({
  def,
  stat,
  configured,
}: {
  def: ABExperimentDef;
  stat: ExperimentStat | undefined;
  configured: boolean;
}) {
  const variants: VariantStat[] =
    stat?.variants ??
    def.variants.map((variant) => ({ variant, assignments: 0, conversions: 0, ctr: 0 }));

  const totalAssignments = stat?.totalAssignments ?? 0;
  const hasData = configured && totalAssignments > 0;

  // 最大 CTR の variant を勝者候補に
  const maxCtr = variants.reduce((m, v) => (v.ctr > m ? v.ctr : m), 0);
  // 差分判定: 全 variant の CTR の (max - min) / max が10%以上で「差あり」
  const minCtr = variants.reduce((m, v) => (v.ctr < m ? v.ctr : m), maxCtr);
  const ctrDiffRatio = maxCtr > 0 ? (maxCtr - minCtr) / maxCtr : 0;
  // サンプル数チェック: すべての variant が最低件数を超えているか
  const enoughSample = variants.every((v) => v.assignments >= MIN_SAMPLE_PER_VARIANT);
  // 「データ不足/差なし」判定
  const inconclusive = !hasData || !enoughSample || ctrDiffRatio < MIN_DIFF_RATIO;
  // 勝者 variant (差ありの場合のみ)
  const winnerVariant =
    !inconclusive && maxCtr > 0
      ? variants.find((v) => v.ctr === maxCtr)?.variant ?? null
      : null;

  return (
    <article
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, margin: 0, color: 'var(--ink)' }}>
            {def.label}
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-inter), monospace',
              fontSize: 11,
              color: 'var(--ink-mute)',
              background: 'var(--paper-deep)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {def.experimentId}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-sub)' }}>
          コンバージョン: <code style={{ fontSize: 11 }}>{def.conversionEventName}</code>
          {' '}· 割当総数 <strong style={{ color: 'var(--ink)' }}>{totalAssignments.toLocaleString()}</strong>
        </div>
        {def.note && (
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
            {def.note}
          </div>
        )}
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
          gap: 12,
        }}
      >
        {variants.map((v) => (
          <VariantCell
            key={v.variant}
            v={v}
            isWinner={winnerVariant === v.variant}
            configured={configured}
          />
        ))}
      </div>

      {hasData && inconclusive && (
        <div
          style={{
            padding: '10px 12px',
            background: 'var(--paper-deep)',
            borderRadius: 6,
            fontSize: 12,
            color: 'var(--ink-sub)',
            lineHeight: 1.6,
          }}
        >
          {!enoughSample
            ? `データ不足 — 各 variant の割当が ${MIN_SAMPLE_PER_VARIANT} 件未満。判定にはもう少しデータが必要。`
            : `差なし — CTR の差分が ${(MIN_DIFF_RATIO * 100).toFixed(0)}% 未満 (実測 ${(ctrDiffRatio * 100).toFixed(1)}%)。優位な variant とは言えない。`}
        </div>
      )}

      {!hasData && (
        <div
          style={{
            padding: '10px 12px',
            background: 'var(--paper-deep)',
            borderRadius: 6,
            fontSize: 12,
            color: 'var(--ink-mute)',
            lineHeight: 1.6,
          }}
        >
          {configured
            ? 'まだ ab_assignment が記録されていません。GA4 のカスタムディメンション (experiment_id / variant) 登録もご確認ください。'
            : 'GA4 連携待ち。連携後にここに割当・CTR が表示されます。'}
        </div>
      )}
    </article>
  );
}

function VariantCell({
  v,
  isWinner,
  configured,
}: {
  v: VariantStat;
  isWinner: boolean;
  configured: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: isWinner ? '2px solid var(--sage)' : '1px solid var(--line)',
        borderRadius: 8,
        padding: '12px 14px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {isWinner && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            right: 10,
            background: 'var(--sage)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 10,
            letterSpacing: 0.5,
          }}
        >
          勝者
        </span>
      )}
      <div
        style={{
          fontFamily: 'var(--font-mincho), serif',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--ink)',
        }}
      >
        variant {v.variant}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mincho), serif',
            fontSize: 26,
            fontWeight: 700,
            color: configured ? 'var(--ink)' : 'var(--ink-mute)',
          }}
        >
          {configured ? `${(v.ctr * 100).toFixed(1)}%` : '—'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-sub)' }}>CTR</span>
      </div>
      <div
        style={{
          borderTop: '1px solid var(--line)',
          paddingTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--ink-sub)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>割当</span>
        <span>{configured ? v.assignments.toLocaleString() : '—'}</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--ink-sub)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>conv</span>
        <span>{configured ? v.conversions.toLocaleString() : '—'}</span>
      </div>
    </div>
  );
}
