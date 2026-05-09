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
    alert(`✓ ${parsed.length}件のクエリを保存しました。\n/admin/seo で分析を表示できます。`);
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
            padding: 12,
            background: 'var(--sage-soft)',
            border: '1px solid var(--sage)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--sage-deep)',
          }}
        >
          ✓ 保存済み: {new Date(savedAt).toLocaleString('ja-JP')}
          {' '}
          <button
            onClick={handleClear}
            style={{
              marginLeft: 12,
              padding: '2px 10px',
              background: 'transparent',
              border: '1px solid var(--sage-deep)',
              color: 'var(--sage-deep)',
              borderRadius: 4,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            削除
          </button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
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
            padding: 12,
            border: '1px solid var(--line)',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 12,
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            onClick={handleParse}
            style={{
              padding: '8px 18px',
              background: 'var(--clay)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
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
                padding: '8px 18px',
                background: 'var(--sage-deep)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
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
              padding: 12,
              background: '#f5e0d4',
              border: '1px solid #c4704f',
              borderRadius: 6,
              fontSize: 12,
              color: '#8E3F22',
            }}
          >
            {error}
          </div>
        )}

        {parsed.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-sub)', marginBottom: 8 }}>
              ✓ {parsed.length} 件のクエリを認識
            </p>
            <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--paper-deep)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>クエリ</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>クリック</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>表示</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>CTR</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>順位</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 30).map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '6px 10px' }}>{r.query}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{r.clicks}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{r.impressions}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                        {(r.ctr * 100).toFixed(2)}%
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 30 && (
              <p style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 6 }}>
                ※ プレビューは先頭30件。保存すると全{parsed.length}件が反映されます。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
