'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type StationItem = {
  type: 'station';
  slug: string;
  name: string;
  kana?: string;
  ward: string;
  wardLabel: string;
  lines: string[];
  scale: 'terminal' | 'major' | 'minor';
};

type LineItem = {
  type: 'line';
  slug: string;
  name: string;
  matchName: string;
  color: string;
  operator: string;
};

type SearchItem = StationItem | LineItem;

type Props = {
  stations: StationItem[];
  lines: LineItem[];
};

const SCALE_BADGE: Record<StationItem['scale'], { label: string; bg: string; color: string }> = {
  terminal: { label: 'ターミナル', bg: '#FFEBEE', color: '#C62828' },
  major: { label: '主要駅', bg: '#FFF3E0', color: '#E65100' },
  minor: { label: '駅', bg: '#F5F5F5', color: '#616161' },
};

const OPERATOR_LABEL: Record<string, string> = {
  JR: 'JR',
  'tokyo-metro': '東京メトロ',
  toei: '都営',
  private: '私鉄',
};

export function StationSearch({ stations, lines }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 部分一致フィルタ。駅名・カナ・路線名・路線matchNameを対象。
  const results: SearchItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // 空の時はターミナル駅を上から数件と主要路線を出す
      return [
        ...stations.filter((s) => s.scale === 'terminal').slice(0, 8),
        ...lines.filter((l) => ['yamanote', 'marunouchi', 'ginza', 'tokyu-toyoko', 'keio-inokashira'].includes(l.slug)),
      ];
    }
    const stationHits = stations.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.kana && s.kana.toLowerCase().includes(q)) ||
      s.wardLabel.toLowerCase().includes(q)
    );
    const lineHits = lines.filter((l) =>
      l.name.toLowerCase().includes(q) || l.matchName.toLowerCase().includes(q)
    );
    // 駅優先で最大16件、路線が混じる
    return [...stationHits.slice(0, 14), ...lineHits.slice(0, 4)];
  }, [query, stations, lines]);

  // フォーカス外れたら閉じる（リスト内クリックは除く）
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ハイライト変更時に query 変化したら先頭にリセット
  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  const navigateTo = (item: SearchItem) => {
    const url = item.type === 'station' ? `/station/${item.slug}` : `/station/line/${item.slug}`;
    setOpen(false);
    setQuery('');
    router.push(url);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[highlighted];
      if (item) navigateTo(item);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="station-search" style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
      <label
        htmlFor="station-search-input"
        style={{ display: 'block', fontSize: 13, color: 'var(--ink-sub)', marginBottom: 8, fontWeight: 600 }}
      >
        駅・路線から子連れOK店を探す
      </label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id="station-search-input"
          type="search"
          value={query}
          placeholder="例: 渋谷、自由が丘、山手線、丸ノ内線…"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="station-search-listbox"
          aria-expanded={open}
          style={{
            width: '100%',
            padding: '14px 18px 14px 46px',
            fontSize: 16,
            borderRadius: 12,
            border: '2px solid rgba(201,96,62,0.20)',
            background: '#fff',
            color: 'var(--ink)',
            boxShadow: open ? '0 4px 20px rgba(201,96,62,0.12)' : 'none',
            transition: 'box-shadow 0.15s, border-color 0.15s',
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: 'var(--clay-deep)', pointerEvents: 'none',
          }}
        >
          🔍
        </span>
      </div>

      {open && (
        <ul
          id="station-search-listbox"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 10,
            background: '#fff',
            border: '1px solid rgba(201,96,62,0.20)',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
            maxHeight: 380,
            overflowY: 'auto',
            margin: 0,
            padding: '6px 0',
            listStyle: 'none',
          }}
        >
          {results.length === 0 ? (
            <li style={{ padding: '14px 16px', fontSize: 14, color: 'var(--ink-mute)' }}>
              該当する駅・路線が見つかりません。漢字または路線名で検索してください。
            </li>
          ) : (
            <>
              {!query.trim() && (
                <li style={{ padding: '6px 16px 4px', fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>
                  人気の駅・路線
                </li>
              )}
              {results.map((item, i) => (
                <li
                  key={`${item.type}-${item.slug}`}
                  role="option"
                  aria-selected={i === highlighted}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={(e) => { e.preventDefault(); navigateTo(item); }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: i === highlighted ? 'rgba(201,96,62,0.08)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.08s',
                  }}
                >
                  {item.type === 'station' ? (
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                          {item.name}駅
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.wardLabel} · {item.lines.slice(0, 3).join(' / ')}{item.lines.length > 3 ? '…' : ''}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: SCALE_BADGE[item.scale].bg,
                        color: SCALE_BADGE[item.scale].color,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        {SCALE_BADGE[item.scale].label}
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 4, height: 24, borderRadius: 2, background: item.color, flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                            路線（全駅一覧へ）
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: '#E0F2F1', color: '#00695C', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {OPERATOR_LABEL[item.operator] ?? item.operator}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </>
          )}
          <li style={{
            borderTop: '1px solid rgba(201,96,62,0.10)',
            padding: '8px 16px',
            fontSize: 12,
            color: 'var(--ink-mute)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Link href="/station" style={{ color: 'var(--clay-deep)', fontWeight: 600 }}>
              全484駅一覧 →
            </Link>
            <Link href="/station/line" style={{ color: 'var(--clay-deep)' }}>
              路線別一覧 →
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
