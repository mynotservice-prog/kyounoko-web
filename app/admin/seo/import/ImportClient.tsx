'use client';

import { useEffect, useState } from 'react';

type ParsedRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

const STORAGE_KEY = 'kyounoko-sc-import-v1';

export function ImportClient() {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        setSavedAt(obj.savedAt);
      }
    } catch {}
  }, []);

  function parse(raw: string): ParsedRow[] {
    // 日本語Search Console形式: 「上位のクエリ\tクリック数\t表示回数\tCTR\t掲載順位」
    // 英語形式: "Top queries\tClicks\tImpressions\tCTR\tPosition"
    // CSV/TSV両対応、ヘッダー行は自動スキップ
    const lines = raw.trim().split(/\r?\n/);
    const out: ParsedRow[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      // タブ or カンマ区切り
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length < 5) continue;
      const [q, c, i, ctr, pos] = cols.map((s) => s.trim());
      // ヘッダー行スキップ
      if (
        /(クエリ|Query|Top queries|上位のクエリ)/i.test(q) ||
        /(クリック|Clicks)/i.test(c) ||
        Number.isNaN(parseFloat(c.replace(/,/g, '')))
      ) {
        continue;
      }
      const clicks = parseFloat(c.replace(/,/g, '')) || 0;
      const impressions = parseFloat(i.replace(/,/g, '')) || 0;
      // CTR は "1.23%" 形式または "0.0123" 形式
      const ctrNum = parseFloat(ctr.replace('%', '').replace(/,/g, '')) || 0;
      const ctrNormalized = ctrNum > 1 ? ctrNum / 100 : ctrNum;
      const position = parseFloat(pos.replace(/,/g, '')) || 0;
      if (!q) continue;
      out.push({ query: q, clicks, impressions, ctr: ctrNormalized, position });
    }
    return out;
  }

  function handleParse() {
    setError(null);
    const rows = parse(text);
    if (rows.length === 0) {
      setError('解析できるデータがありません。タブ区切り or CSV形式で5列（クエリ/クリック/表示/CTR/順位）であるか確認してください。');
      return;
    }
    setParsed(rows);
  }

  function handleSave() {
    if (parsed.length === 0) return;
    const payload = {
      savedAt: new Date().toISOString(),
      rows: parsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedAt(payload.savedAt);
    alert(`${parsed.length}件のクエリを保存しました。\n/admin/seo で分析を表示できます。`);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt(null);
    setParsed([]);
    setText('');
  }

  return (
    <div>
      {savedAt && (
        <div
          style={{
            padding: '11px 14px',
            background: 'var(--ok-bg)',
            border: '1px solid var(--ok-dot)',
            borderRadius: 'var(--r-md)',
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--ok-fg)',
          }}
        >
          保存済み: {new Date(savedAt).toLocaleString('ja-JP')}
          {' '}
          <button
            onClick={handleClear}
            style={{
              marginLeft: 12,
              padding: '2px 10px',
              background: 'transparent',
              border: '1px solid var(--ok-fg)',
              color: 'var(--ok-fg)',
              borderRadius: 'var(--r-sm)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            削除
          </button>
        </div>
      )}

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--ink-500)',
            marginBottom: 7,
          }}
        >
          Search Consoleからコピーしたデータ（タブ区切り or CSV）
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`例:
上位のクエリ\tクリック数\t表示回数\tCTR\t掲載順位
キッズメニュー 銀座\t12\t340\t3.5%\t6.2
ベビーカー ランキング 2026\t8\t220\t3.6%\t8.5
...`}
          style={{
            width: '100%',
            minHeight: 200,
            padding: '11px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--ink-700)',
            background: 'var(--bg-surface)',
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            onClick={handleParse}
            style={{
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--r-md)',
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            解析
          </button>
          {parsed.length > 0 && (
            <button
              onClick={handleSave}
              style={{
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--r-md)',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              保存して /admin/seo で表示
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '11px 12px',
              background: 'var(--warn-bg)',
              border: '1px solid var(--warn-dot)',
              borderRadius: 'var(--r-md)',
              fontSize: 12,
              color: 'var(--warn-fg)',
            }}
          >
            {error}
          </div>
        )}

        {parsed.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 8 }}>
              {parsed.length} 件のクエリを認識
            </p>
            <div
              style={{
                maxHeight: 300,
                overflow: 'auto',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0 }}>
                    <th style={previewTh}>クエリ</th>
                    <th style={previewThR}>クリック</th>
                    <th style={previewThR}>表示</th>
                    <th style={previewThR}>CTR</th>
                    <th style={previewThR}>順位</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 30).map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-faint)' }}>
                      <td style={previewTd}>{r.query}</td>
                      <td style={previewTdR}>{r.clicks}</td>
                      <td style={previewTdR}>{r.impressions}</td>
                      <td style={previewTdR}>{(r.ctr * 100).toFixed(2)}%</td>
                      <td style={previewTdR}>{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 30 && (
              <p style={{ fontSize: 11, color: 'var(--ink-400)', textAlign: 'center', marginTop: 6 }}>
                ※ プレビューは先頭30件。保存すると全{parsed.length}件が反映されます。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const previewTh: React.CSSProperties = {
  padding: '9px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--ink-400)',
  borderBottom: '1px solid var(--border-divider)',
  background: 'var(--bg-app)',
};
const previewThR: React.CSSProperties = { ...previewTh, textAlign: 'right' };
const previewTd: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontSize: 13,
  color: 'var(--ink-900)',
  borderBottom: '1px solid var(--border-faint)',
};
const previewTdR: React.CSSProperties = {
  ...previewTd,
  textAlign: 'right',
  fontFamily: 'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
};
