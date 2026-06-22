import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getABStats,
  type ABExperimentDef,
  type ExperimentStat,
  type VariantStat,
} from '@/lib/ga4-ab';
import { PageHeader, StatCard, StatGrid } from '@/components/admin/ui';

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
      <PageHeader title="A/B テスト" subtitle={`実施中・終了したテストの結果（直近${days}日間 · 実験 ${EXPERIMENTS.length}件）`} />

      {configured && (
        <StatGrid>
          <StatCard label="実験数" value={EXPERIMENTS.length} sub="登録中" />
          <StatCard
            label="計測中"
            value={experiments.filter((e) => e.totalAssignments > 0).length}
            sub={`/ ${EXPERIMENTS.length} 件`}
          />
        </StatGrid>
      )}

      {!configured && (
        <div style={noticeStyle}>
          <strong style={{ color: 'var(--warn-fg)' }}>GA4 未連携</strong> — GA4 Data API の認証情報が未設定のため、件数は表示できません。
          <code style={codeStyle}>GA4_PROPERTY_ID</code>と
          <code style={codeStyle}>GOOGLE_APPLICATION_CREDENTIALS_JSON</code>を環境変数に設定してください。
          {'reason' in result && result.reason && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-500)' }}>理由: {result.reason}</div>
          )}
        </div>
      )}

      {configured && !anyData && (
        <div style={noticeStyle}>
          現在計測中のテストはまだ十分なデータがありません。GA4 のカスタムディメンション
          <code style={codeStyle}>experiment_id</code>・<code style={codeStyle}>variant</code>が未登録の場合もここに表示されます。
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
          marginTop: 28,
          padding: '16px 18px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: 'var(--ink-900)' }}>関連</h3>
        <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
          <Link href="/admin/events" style={{ color: 'var(--accent)' }}>Events</Link>
          <Link href="/admin/insights" style={{ color: 'var(--accent)' }}>Insights</Link>
          <Link href="/admin" style={{ color: 'var(--accent)' }}>ダッシュボード</Link>
        </div>
        <p style={{ marginTop: 12, marginBottom: 0, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.7 }}>
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

const noticeStyle: React.CSSProperties = {
  marginBottom: 22,
  padding: '14px 18px',
  background: 'var(--warn-bg)',
  border: '1px solid #e7d3a8',
  borderRadius: 'var(--r-lg)',
  fontSize: 13,
  color: 'var(--warn-fg)',
  lineHeight: 1.7,
};
const codeStyle: React.CSSProperties = {
  background: '#fff',
  padding: '1px 6px',
  borderRadius: 3,
  margin: '0 4px',
  fontSize: 12,
};

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
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>{def.label}</h2>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-500)',
              background: 'var(--bg-subtle)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {def.experimentId}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>
          コンバージョン: <code style={{ fontSize: 11 }}>{def.conversionEventName}</code> · 割当総数{' '}
          <strong style={{ color: 'var(--ink-900)' }}>{totalAssignments.toLocaleString()}</strong>
        </div>
        {def.note && <div style={{ fontSize: 11, color: 'var(--ink-400)', lineHeight: 1.6 }}>{def.note}</div>}
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
        <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.6 }}>
          {!enoughSample
            ? `データ不足 — 各 variant の割当が ${MIN_SAMPLE_PER_VARIANT} 件未満。判定にはもう少しデータが必要。`
            : `差なし — CTR の差分が ${(MIN_DIFF_RATIO * 100).toFixed(0)}% 未満 (実測 ${(ctrDiffRatio * 100).toFixed(1)}%)。優位な variant とは言えない。`}
        </div>
      )}

      {!hasData && (
        <div style={{ padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 12, color: 'var(--ink-400)', lineHeight: 1.6 }}>
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
        background: isWinner ? 'var(--ok-bg)' : 'var(--bg-app)',
        border: isWinner ? '1.5px solid var(--ok-dot)' : '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
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
            background: 'var(--ok-dot)',
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
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>variant {v.variant}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 26,
            fontWeight: 600,
            color: configured ? 'var(--ink-900)' : 'var(--ink-400)',
          }}
        >
          {configured ? `${(v.ctr * 100).toFixed(1)}%` : '—'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>CTR</span>
      </div>
      <div
        style={{
          borderTop: '1px solid var(--border-divider)',
          paddingTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--ink-600)',
          fontFamily: 'var(--font-mono)',
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
          color: 'var(--ink-600)',
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>conv</span>
        <span>{configured ? v.conversions.toLocaleString() : '—'}</span>
      </div>
    </div>
  );
}
