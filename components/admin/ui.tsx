// きょうのこ Admin 共有 UI プリミティブ（Claude Design ハンドオフのトークンに準拠）
// すべて inline style + .admin-shell スコープの CSS 変数で着色する。サーバーコンポーネント可。
import type { CSSProperties, ReactNode } from 'react';

/* ── ステータスバッジ ──────────────────────────────── */
type Tone = 'ok' | 'warn' | 'neu';
const TONE: Record<Tone, { fg: string; bg: string; dot: string }> = {
  ok: { fg: 'var(--ok-fg)', bg: 'var(--ok-bg)', dot: 'var(--ok-dot)' },
  warn: { fg: 'var(--warn-fg)', bg: 'var(--warn-bg)', dot: 'var(--warn-dot)' },
  neu: { fg: 'var(--neu-fg)', bg: 'var(--neu-bg)', dot: 'var(--neu-dot)' },
};

/** 日本語ステータス文字列 → 色トーンの対応（プロトの badgeFor を実データ向けに拡張） */
export function statusTone(value: string): Tone {
  const ok = ['公開', '有意差あり', '実施中', 'LIVE', 'ライブ'];
  const warn = ['下書き', '計測中', '要確認', '未設定'];
  if (ok.includes(value)) return 'ok';
  if (warn.includes(value)) return 'warn';
  return 'neu';
}

export function Badge({
  children,
  tone = 'neu',
  dot = true,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  const t = TONE[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11.5,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        background: t.bg,
        color: t.fg,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: t.dot }} />}
      {children}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={statusTone(value)}>{value}</Badge>;
}

/* ── ページ見出し ──────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  right,
  alignEnd = true,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  alignEnd?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: alignEnd ? 'flex-end' : 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '.01em' }}>
          {title}
        </h1>
        {subtitle && <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--ink-500)' }}>{subtitle}</p>}
      </div>
      {right && <div style={{ flex: '0 0 auto' }}>{right}</div>}
    </div>
  );
}

/* ── KPI / サマリーカード ──────────────────────────── */
export function StatCard({
  label,
  value,
  delta,
  deltaNegative = false,
  sub,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaNegative?: boolean;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '15px 17px',
      }}
    >
      <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 11 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 29,
            fontWeight: 600,
            color: 'var(--ink-900)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-.01em',
          }}
        >
          {value}
        </span>
        {delta && (
          <span style={{ fontSize: 12, fontWeight: 600, color: deltaNegative ? 'var(--neg)' : 'var(--pos)' }}>
            {delta}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-400)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export function StatGrid({ columns, children }: { columns?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: columns ? `repeat(${columns},1fr)` : 'repeat(auto-fit,minmax(190px,1fr))',
        gap: 14,
        marginBottom: 22,
      }}
    >
      {children}
    </div>
  );
}

/* ── カード / セクション ───────────────────────────── */
export function Card({
  title,
  right,
  description,
  children,
  bodyPadding,
  style,
}: {
  title?: ReactNode;
  right?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  bodyPadding?: string | number;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || right) && (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-divider)',
            display: 'flex',
            alignItems: description ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{title}</h2>
            {description && (
              <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--ink-400)' }}>{description}</p>
            )}
          </div>
          {right && <div style={{ flex: '0 0 auto' }}>{right}</div>}
        </div>
      )}
      <div style={{ padding: bodyPadding ?? 0 }}>{children}</div>
    </section>
  );
}

/** mono かつ tabular-nums の数字表記（更新日や件数など） */
export function Mono({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color }}>{children}</span>
  );
}

/* ── 横棒（構成比・スコア） ───────────────────────── */
export function Bar({ pct, color = '#c9c3bb' }: { pct: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--neu-bg)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}
