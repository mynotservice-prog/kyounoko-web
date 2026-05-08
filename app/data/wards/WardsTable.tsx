'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { WardMetrics } from '@/lib/data-aggregations';

type SortKey =
  | 'wardName'
  | 'stationCount'
  | 'totalCount'
  | 'chainCount'
  | 'indieCount'
  | 'strollerGoodRatio'
  | 'privateRoomRatio'
  | 'kidsMenuRatio'
  | 'familyScore';

type Props = {
  rows: WardMetrics[];
};

function pct(v: number): string {
  return (v * 100).toFixed(0) + '%';
}

export function WardsTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('familyScore');
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return asc ? av.localeCompare(bv, 'ja') : bv.localeCompare(av, 'ja');
      }
      const an = Number(av);
      const bn = Number(bv);
      return asc ? an - bn : bn - an;
    });
    return arr;
  }, [rows, sortKey, asc]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setAsc((p) => !p);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  };

  const headerStyle: React.CSSProperties = {
    cursor: 'pointer',
    padding: '10px 8px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--ink-sub)',
    background: 'rgba(201,96,62,0.06)',
    borderBottom: '2px solid rgba(201,96,62,0.20)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  };
  const cellStyle: React.CSSProperties = {
    padding: '8px 8px',
    fontSize: 13,
    borderBottom: '1px solid rgba(201,96,62,0.10)',
    whiteSpace: 'nowrap',
  };

  const SortIndicator = ({ active }: { active: boolean }) => (
    <span style={{ marginLeft: 4, fontSize: 9, color: active ? 'var(--clay-deep)' : 'var(--ink-mute)' }}>
      {active ? (asc ? '▲' : '▼') : '▾'}
    </span>
  );

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headerStyle} onClick={() => onSort('wardName')}>
              区<SortIndicator active={sortKey === 'wardName'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('stationCount')}>
              駅数<SortIndicator active={sortKey === 'stationCount'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('totalCount')}>
              全店<SortIndicator active={sortKey === 'totalCount'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('chainCount')}>
              チェーン<SortIndicator active={sortKey === 'chainCount'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('indieCount')}>
              個人店<SortIndicator active={sortKey === 'indieCount'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('strollerGoodRatio')}>
              ベビーカー◎率<SortIndicator active={sortKey === 'strollerGoodRatio'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('privateRoomRatio')}>
              個室率<SortIndicator active={sortKey === 'privateRoomRatio'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('kidsMenuRatio')}>
              キッズメニュー率<SortIndicator active={sortKey === 'kidsMenuRatio'} />
            </th>
            <th style={{ ...headerStyle, textAlign: 'right' }} onClick={() => onSort('familyScore')}>
              家族度スコア<SortIndicator active={sortKey === 'familyScore'} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.wardId} style={{ background: 'var(--paper-card)' }}>
              <td style={{ ...cellStyle, fontWeight: 600 }}>
                <Link href={`/station`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                  {r.wardName}
                </Link>
              </td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>{r.stationCount}</td>
              <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>{r.totalCount.toLocaleString()}</td>
              <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--ink-sub)' }}>{r.chainCount}</td>
              <td style={{ ...cellStyle, textAlign: 'right', color: 'var(--ink-sub)' }}>{r.indieCount}</td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>{pct(r.strollerGoodRatio)}</td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>{pct(r.privateRoomRatio)}</td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>{pct(r.kidsMenuRatio)}</td>
              <td style={{
                ...cellStyle,
                textAlign: 'right',
                fontWeight: 700,
                color: r.familyScore > 0.4 ? '#2E7D32' : r.familyScore > 0.3 ? '#E65100' : 'var(--ink-sub)',
              }}>
                {pct(r.familyScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 10 }}>
        ※ ヘッダをタップすると並び替え。家族度スコアはベビーカー◎率・個室率・キッズメニュー率の3指標の単純平均。
      </p>
    </div>
  );
}
