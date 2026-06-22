'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard, StatGrid } from '@/components/admin/ui';

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
          padding: '13px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          fontSize: 13,
          color: 'var(--ink-700)',
          marginBottom: 24,
        }}
      >
        <strong>API連携がまだ動いてない場合</strong>は、
        <Link href="/admin/seo/import" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          こちらから手動でCSVインポート
        </Link>{' '}
        可能です。
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
          padding: '11px 14px',
          background: 'var(--ok-bg)',
          border: '1px solid var(--ok-dot)',
          borderRadius: 'var(--r-lg)',
          marginBottom: 16,
          fontSize: 13,
          color: 'var(--ok-fg)',
        }}
      >
        ローカルインポートデータ表示中（{rows.length}クエリ・保存日時:{' '}
        {new Date(data.savedAt).toLocaleString('ja-JP')}）{' '}
        <Link href="/admin/seo/import" style={{ marginLeft: 8, color: 'var(--ok-fg)', textDecoration: 'underline' }}>
          再インポート
        </Link>
      </div>

      <StatGrid>
        <StatCard label="総クリック数" value={totalClicks.toLocaleString()} />
        <StatCard label="総表示回数" value={totalImp.toLocaleString()} />
        <StatCard label="平均CTR" value={`${(avgCtr * 100).toFixed(2)}%`} />
        <StatCard label="平均順位" value={`${avgPos.toFixed(1)}位`} />
        <StatCard label="TOP10クエリ" value={top10.length} />
        <StatCard label="改善候補" value={ctrTargets.length + pushUp.length} />
      </StatGrid>

      {kids.length > 0 && (
        <Section title="「キッズメニュー」関連クエリ">
          <Table rows={kids.slice(0, 20)} />
        </Section>
      )}

      <Section title="CTR改善ターゲット（順位TOP20×表示100+×CTR3%以下）">
        <p style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 8 }}>
          順位は取れてるのにクリックされてないクエリ。タイトル/メタディスクリプションの見直し候補。
        </p>
        {ctrTargets.length > 0 ? <Table rows={ctrTargets} highlightCtr /> : <Empty />}
      </Section>

      <Section title="順位押上げ候補（8-20位×表示50+）">
        <p style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 8 }}>
          内部リンク強化・記事拡充でTOP10入り狙いのクエリ。
        </p>
        {pushUp.length > 0 ? <Table rows={pushUp} highlightPos /> : <Empty />}
      </Section>

      <Section title="TOP10獲得クエリ（クリック上位30）">
        {top10.length > 0 ? <Table rows={top10} /> : <Empty />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 12px' }}>{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        padding: '13px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        fontSize: 13,
        color: 'var(--ink-400)',
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
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
        <thead>
          <tr>
            <th style={Th}>クエリ</th>
            <th style={ThR}>クリック</th>
            <th style={ThR}>表示</th>
            <th style={ThR}>CTR</th>
            <th style={ThR}>順位</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={Td}>{r.query}</td>
              <td style={TdR}>{r.clicks.toLocaleString()}</td>
              <td style={TdR}>{r.impressions.toLocaleString()}</td>
              <td
                style={{
                  ...TdR,
                  color: highlightCtr && r.ctr <= 0.03 ? 'var(--warn-fg)' : 'var(--ink-900)',
                  fontWeight: highlightCtr && r.ctr <= 0.03 ? 600 : 400,
                }}
              >
                {(r.ctr * 100).toFixed(2)}%
              </td>
              <td
                style={{
                  ...TdR,
                  color: highlightPos && r.position >= 8 && r.position <= 20 ? 'var(--warn-fg)' : 'var(--ink-900)',
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
  padding: '9px 14px',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--ink-400)',
  borderBottom: '1px solid var(--border-divider)',
  background: 'var(--bg-app)',
};
const ThR: React.CSSProperties = { ...Th, textAlign: 'right' };
const Td: React.CSSProperties = {
  textAlign: 'left',
  padding: '11px 14px',
  fontSize: 13,
  color: 'var(--ink-900)',
  borderBottom: '1px solid var(--border-faint)',
};
const TdR: React.CSSProperties = {
  ...Td,
  textAlign: 'right',
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
};
