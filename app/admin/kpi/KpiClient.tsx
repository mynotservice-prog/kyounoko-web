'use client';

import React from 'react';
import { AFFILIATE_SOURCES, affiliateTotal, monthLabel, type MonthlyMetric, type MetricsMap } from '@/lib/metrics';

type FormState = {
  month: string;
  moshimo: string;
  a8: string;
  rakuten: string;
  amazon: string;
  adsense: string;
  other: string;
  lineFollowers: string;
  pv: string;
  note: string;
};

function emptyForm(month: string): FormState {
  return { month, moshimo: '', a8: '', rakuten: '', amazon: '', adsense: '', other: '', lineFollowers: '', pv: '', note: '' };
}

function formFromMetric(m: MonthlyMetric): FormState {
  return {
    month: m.month,
    moshimo: m.affiliate?.moshimo != null ? String(m.affiliate.moshimo) : '',
    a8: m.affiliate?.a8 != null ? String(m.affiliate.a8) : '',
    rakuten: m.affiliate?.rakuten != null ? String(m.affiliate.rakuten) : '',
    amazon: m.affiliate?.amazon != null ? String(m.affiliate.amazon) : '',
    adsense: m.affiliate?.adsense != null ? String(m.affiliate.adsense) : '',
    other: m.affiliate?.other != null ? String(m.affiliate.other) : '',
    lineFollowers: m.lineFollowers != null ? String(m.lineFollowers) : '',
    pv: m.pv != null ? String(m.pv) : '',
    note: m.note ?? '',
  };
}

const num = (s: string): number | undefined => {
  if (!s.trim()) return undefined;
  const n = Number(s.replace(/[,\s¥円]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

export function KpiClient({
  initialStore,
  defaultMonth,
  liveLineFollowers,
  livePv,
}: {
  initialStore: MetricsMap;
  defaultMonth: string;
  liveLineFollowers: number | null;
  livePv: number | null;
}) {
  const [store, setStore] = React.useState<MetricsMap>(initialStore);
  const [form, setForm] = React.useState<FormState>(() => {
    const existing = initialStore.find((m) => m.month === defaultMonth);
    return existing ? formFromMetric(existing) : emptyForm(defaultMonth);
  });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  // 最新の保存内容をAPIから取得（ビルド時スナップショットの古さ対策）
  React.useEffect(() => {
    let alive = true;
    fetch('/api/admin/metrics')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { metrics?: MetricsMap } | null) => {
        if (alive && d?.metrics) setStore(d.metrics);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const set = (k: keyof FormState, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const loadMonth = (month: string) => {
    const m = store.find((x) => x.month === month);
    setForm(m ? formFromMetric(m) : emptyForm(month));
    setMsg('');
  };

  const save = async () => {
    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      setMsg('❌ 月は YYYY-MM 形式で入力してください');
      return;
    }
    setSaving(true);
    setMsg('');
    const patch = {
      affiliate: {
        moshimo: num(form.moshimo),
        a8: num(form.a8),
        rakuten: num(form.rakuten),
        amazon: num(form.amazon),
        adsense: num(form.adsense),
        other: num(form.other),
      },
      lineFollowers: num(form.lineFollowers),
      pv: num(form.pv),
      note: form.note,
    };
    try {
      const res = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: form.month, patch }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
      if (!res.ok || !data.ok) {
        setMsg(`❌ ${data.error || 'failed'}`);
      } else {
        setMsg(data.mode === 'github' ? '✅ commit 完了。数分で本番反映' : '✅ ローカル保存');
        // ローカル store も更新（楽観的）
        const merged: MonthlyMetric = {
          month: form.month,
          affiliate: Object.fromEntries(
            Object.entries(patch.affiliate).filter(([, v]) => v != null),
          ) as MonthlyMetric['affiliate'],
          lineFollowers: patch.lineFollowers,
          pv: patch.pv,
          note: patch.note || undefined,
        };
        setStore((prev) => {
          const next = prev.filter((m) => m.month !== form.month);
          next.push(merged);
          return next.sort((a, b) => a.month.localeCompare(b.month));
        });
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13,
    fontFamily: 'inherit', background: '#fff', width: '100%',
  };
  const capStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--ink-sub)', marginBottom: 4, display: 'block' };

  const liveTotal = affiliateTotal({
    moshimo: num(form.moshimo), a8: num(form.a8), rakuten: num(form.rakuten),
    amazon: num(form.amazon), adsense: num(form.adsense), other: num(form.other),
  });

  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 16 }}>
      {/* 月選択 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ width: 140 }}>
          <label style={capStyle}>対象月（YYYY-MM）</label>
          <input
            type="month"
            value={form.month}
            onChange={(e) => loadMonth(e.target.value)}
            style={inputStyle}
          />
        </div>
        {store.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>保存済:</span>
            {store.slice().reverse().slice(0, 12).map((m) => (
              <button
                key={m.month}
                type="button"
                onClick={() => loadMonth(m.month)}
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 999, cursor: 'pointer',
                  border: '1px solid var(--line)',
                  background: m.month === form.month ? 'var(--clay-soft, #f7ede6)' : '#fff',
                  color: m.month === form.month ? 'var(--clay-deep)' : 'var(--ink-sub)',
                }}
              >
                {monthLabel(m.month)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* アフィリ収入源 */}
      <label style={capStyle}>アフィリエイト確定収益（円・収入源別）</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 6 }}>
        {AFFILIATE_SOURCES.map((s) => (
          <div key={s.key}>
            <label style={{ fontSize: 11, color: 'var(--ink-mute)', display: 'block', marginBottom: 3 }}>{s.label}</label>
            <input
              type="text"
              inputMode="numeric"
              value={form[s.key as keyof FormState]}
              onChange={(e) => set(s.key as keyof FormState, e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-sub)', marginBottom: 14 }}>
        合計: <strong>¥{liveTotal.toLocaleString()}</strong>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 8 }}>
          ※ AdSenseを自動連携している場合、AdSense欄は空でOK（自動値を使用）
        </span>
      </div>

      {/* LINE / PV / メモ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={capStyle}>LINE友だち数</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" inputMode="numeric" value={form.lineFollowers} onChange={(e) => set('lineFollowers', e.target.value)} placeholder={liveLineFollowers != null ? `自動: ${liveLineFollowers}` : '手入力'} style={inputStyle} />
            {liveLineFollowers != null && (
              <button type="button" onClick={() => set('lineFollowers', String(liveLineFollowers))} style={{ fontSize: 11, padding: '0 8px', border: '1px solid var(--line)', borderRadius: 6, background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>自動値</button>
            )}
          </div>
        </div>
        <div>
          <label style={capStyle}>PV（自動が無い月の手入力）</label>
          <input type="text" inputMode="numeric" value={form.pv} onChange={(e) => set('pv', e.target.value)} placeholder={livePv != null ? `自動: ${livePv}` : '手入力'} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={capStyle}>メモ（施策・気づき）</label>
        <input type="text" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="例: 外食子連れ記事を強化。LINE導線をトップに追加。" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{ padding: '9px 22px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? '保存中…' : `${monthLabel(form.month)}を保存`}
        </button>
        {msg && <span style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{msg}</span>}
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 10, lineHeight: 1.6 }}>
        保存すると data/metrics-monthly.json に commit され、月次トレンドに蓄積されます。全項目空で保存するとその月は削除されます。
      </p>
    </div>
  );
}
