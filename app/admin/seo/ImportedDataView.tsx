'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

const STORAGE_KEY = 'kyounoko-sc-import-v1';

export function ImportedDataView() {
  const [data, setData] = useState<{ rows: Row[]; savedAt: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div
        style={{
          padding: 14,
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        💡 <strong>API連携がまだ動いてない場合</strong>は、<Link href="/admin/seo/import" style={{ color: 'var(--clay-deep)', fontWeight: 600 }}>こちらから手動でCSVインポート</Link> 可能です。
      </div>
    );
  }

  const rows = data.rows;
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImp = rows.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalImp > 0 ? totalClicks / totalImp : 0;
  const avgPos =
    rows.length > 0 ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / Math.max(1, totalImp) : 0;

  // キッズメニュー関連
  const kids = rows.filter((r) => /キッズメニュー|kids menu|お子様メニュー|子供メニュー/i.test(r.query));
  // CTR改善候補
  const ctrTargets = rows
    .filter((r) => r.impressions >= 100 && r.ctr <= 0.03 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  // 順位押上げ
  const pushUp = rows
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  // TOP10獲得
  const top10 = rows.filter((r) => r.position <= 10).sort((a, b) => b.clicks - a.clicks).slice(0, 30);

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          padding: 12,
          background: 'var(--sage-soft)',
          border: '1px solid var(--sage)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          fontSize: 13,
          color: 'var(--sage-deep)',
        }}
      >
        ✓ ローカルインポートデータ表示中（{rows.length}クエリ・保存日時:{' '}
        {new Date(data.savedAt).toLocaleString('ja-JP')}）{' '}
        <Link href="/admin/seo/import" style={{ marginLeft: 8, color: 'var(--sage-deep)', textDecoration: 'underline' }}>
          再インポート
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Kpi label="総クリック数" value={totalClicks} />
        <Kpi label="総表示回数" value={totalImp} />
        <Kpi label="平均CTR" value={`${(avgCtr * 100).toFixed(2)}%`} />
        <Kpi label="平均順位" value={`${avgPos.toFixed(1)}位`} />
        <Kpi label="TOP10クエリ" value={top10.length} />
        <Kpi label="改善候補" value={ctrTargets.length + pushUp.length} />
      </div>

      {kids.length > 0 && (
        <Section title="🍽 「キッズメニュー」関連クエリ">
          <Table rows={kids.slice(0, 20)} />
        </Section>
      )}

      <Section title="⚠️ CTR改善ターゲット（順位TOP20×表示100+×CTR3%以下）">
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8 }}>
          順位は取れてるのにクリックされてないクエリ。タイトル/メタディスクリプションの見直し候補。
        </p>
        {ctrTargets.length > 0 ? <Table rows={ctrTargets} highlightCtr /> : <Empty />}
      </Section>

      <Section title="🚀 順位押上げ候補（8-20位×表示50+）">
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8 }}>
          内部リンク強化・記事拡充でTOP10入り狙いのクエリ。
        </p>
        {pushUp.length > 0 ? <Table rows={pushUp} highlightPos /> : <Empty />}
      </Section>

      <Section title="🏆 TOP10獲得クエリ（クリック上位30）">
        {top10.length > 0 ? <Table rows={top10} /> : <Empty />}
      </Section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          letterSpacing: '.04em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, margin: '0 0 12px', fontWeight: 600 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        padding: 14,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
        color: 'var(--ink-mute)',
      }}
    >
      該当データなし
    </div>
  );
}

function Table({
  rows,
  highlightCtr,
  highlightPos,
}: {
  rows: Row[];
  highlightCtr?: boolean;
  highlightPos?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        overflow: 'auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 600 }}>
        <thead>
          <tr style={{ background: 'var(--paper-deep)' }}>
            <th style={Th}>クエリ</th>
            <th style={ThR}>クリック</th>
            <th style={ThR}>表示</th>
            <th style={ThR}>CTR</th>
            <th style={ThR}>順位</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <td style={Td}>{r.query}</td>
              <td style={TdR}>{r.clicks.toLocaleString()}</td>
              <td style={TdR}>{r.impressions.toLocaleString()}</td>
              <td style={{ ...TdR, color: highlightCtr && r.ctr <= 0.03 ? 'var(--clay-deep)' : 'var(--ink)' }}>
                {(r.ctr * 100).toFixed(2)}%
              </td>
              <td
                style={{
                  ...TdR,
                  color: highlightPos && r.position >= 8 && r.position <= 20 ? 'var(--clay-deep)' : 'var(--ink)',
                  fontWeight: highlightPos && r.position >= 8 && r.position <= 20 ? 600 : 400,
                }}
              >
                {r.position.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink-sub)',
};
const ThR: React.CSSProperties = { ...Th, textAlign: 'right' };
const Td: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 14px',
  fontSize: 12,
  color: 'var(--ink)',
};
const TdR: React.CSSProperties = { ...Td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
