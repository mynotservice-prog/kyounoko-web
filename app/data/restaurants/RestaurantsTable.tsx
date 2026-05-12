'use client';

import { useMemo, useState } from 'react';
import type { DataRow } from '@/lib/data-aggregations';

type Props = {
  rows: DataRow[];
  /** 区フィルタ用: ['all', 'chiyoda', ...] のうちどれを初期表示するか。 */
  initialWard?: string;
  /** 利用可能な区IDリスト（label付き）。 */
  wards: { id: string; label: string }[];
  /** 利用可能なカテゴリリスト。 */
  categories: string[];
};

type SortKey = keyof Pick<
  DataRow,
  | 'name'
  | 'station'
  | 'ward'
  | 'category'
  | 'stroller'
  | 'kidsMenu'
  | 'privateRoom'
  | 'kidsChair'
  | 'kidsCutlery'
  | 'kidsSpace'
  | 'priceRange'
  | 'type'
  | 'stepFree'
  | 'diaperChangingTable'
  | 'nursingRoom'
  | 'bringBabyFood'
  | 'shareDish'
>;

const STROLLER_RANK: Record<DataRow['stroller'], number> = {
  good: 3,
  ok: 2,
  limited: 1,
  unknown: 0,
};

const STROLLER_LABEL: Record<DataRow['stroller'], string> = {
  good: '◎',
  ok: '○',
  limited: '△',
  unknown: '—',
};

const PRICE_ORDER: Record<string, number> = {
  '〜800': 1,
  '〜1,000円': 2,
  '〜1,500': 3,
  '〜2,000円': 4,
  '〜2,500': 5,
  '〜3,500円': 6,
  '〜4,000': 7,
  '〜5,000円': 8,
  '4,000〜': 9,
  '5,000円〜': 10,
};

const PAGE_SIZE = 200;

export function RestaurantsTable({ rows, initialWard = 'all', wards, categories }: Props) {
  const [ward, setWard] = useState(initialWard);
  const [category, setCategory] = useState<string>('all');
  const [type, setType] = useState<'all' | 'chain' | 'indie'>('all');
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ward');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  // 子連れ系条件フィルタ（複数同時ON可）
  const [onlyKidsMenu, setOnlyKidsMenu] = useState(false);
  const [onlyStrollerOK, setOnlyStrollerOK] = useState(false);
  const [onlyPrivateRoom, setOnlyPrivateRoom] = useState(false);
  const [onlyKidsChair, setOnlyKidsChair] = useState(false);
  const [onlyKidsCutlery, setOnlyKidsCutlery] = useState(false);
  const [onlyKidsSpace, setOnlyKidsSpace] = useState(false);
  // 子連れ目線フィルタ（v6 追加: 6項目）
  const [onlyStepFree, setOnlyStepFree] = useState(false);
  const [onlyZashiki, setOnlyZashiki] = useState(false);
  const [onlyDiaper, setOnlyDiaper] = useState(false);
  const [onlyNursing, setOnlyNursing] = useState(false);
  const [onlyBabyFood, setOnlyBabyFood] = useState(false);
  const [onlyShareDish, setOnlyShareDish] = useState(false);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return rows.filter((r) => {
      if (ward !== 'all' && r.wardId !== ward) return false;
      if (category !== 'all' && r.category !== category) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (kw && !r.name.toLowerCase().includes(kw) && !r.station.toLowerCase().includes(kw)) return false;
      if (onlyKidsMenu && !r.kidsMenu) return false;
      if (onlyStrollerOK && r.stroller !== 'ok' && r.stroller !== 'good') return false;
      if (onlyPrivateRoom && !r.privateRoom) return false;
      if (onlyKidsChair && !r.kidsChair) return false;
      if (onlyKidsCutlery && !r.kidsCutlery) return false;
      if (onlyKidsSpace && !r.kidsSpace) return false;
      // v6 子連れ目線フィルタ（個人店は undefined なので fallthrough = 表示しない）
      if (onlyStepFree && !r.stepFree) return false;
      if (onlyZashiki && !(r.seatingType?.includes('zashiki'))) return false;
      if (onlyDiaper && !r.diaperChangingTable) return false;
      if (onlyNursing && !r.nursingRoom) return false;
      if (onlyBabyFood && !r.bringBabyFood) return false;
      if (onlyShareDish && !r.shareDish) return false;
      return true;
    });
  }, [rows, ward, category, type, keyword, onlyKidsMenu, onlyStrollerOK, onlyPrivateRoom, onlyKidsChair, onlyKidsCutlery, onlyKidsSpace, onlyStepFree, onlyZashiki, onlyDiaper, onlyNursing, onlyBabyFood, onlyShareDish]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'stroller':
          cmp = STROLLER_RANK[a.stroller] - STROLLER_RANK[b.stroller];
          break;
        case 'kidsMenu':
        case 'privateRoom':
        case 'kidsChair':
        case 'kidsCutlery':
        case 'kidsSpace':
        case 'stepFree':
        case 'diaperChangingTable':
        case 'nursingRoom':
        case 'bringBabyFood':
        case 'shareDish':
          cmp = (a[sortKey] ? 1 : 0) - (b[sortKey] ? 1 : 0);
          break;
        case 'priceRange':
          cmp = (PRICE_ORDER[a.priceRange] ?? 99) - (PRICE_ORDER[b.priceRange] ?? 99);
          break;
        default:
          cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), 'ja');
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const view = sorted.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(k);
      setSortAsc(true);
    }
    setPage(1);
  };

  const sortIcon = (k: SortKey) => (sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : '');

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    background: '#f4ecdf',
    fontSize: 12.5,
    fontWeight: 600,
    textAlign: 'left',
    borderBottom: '1px solid rgba(201,96,62,0.2)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };
  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 13,
    borderBottom: '1px solid rgba(201,96,62,0.08)',
    verticalAlign: 'top',
  };

  return (
    <div>
      {/* フィルタ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }} role="group" aria-label="区フィルタ">
        {wards.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => { setWard(w.id); setPage(1); }}
            style={{
              padding: '6px 12px',
              fontSize: 12.5,
              border: '1px solid',
              borderColor: ward === w.id ? 'var(--clay-deep, #B0432B)' : 'rgba(201,96,62,0.2)',
              background: ward === w.id ? 'var(--clay-deep, #B0432B)' : 'transparent',
              color: ward === w.id ? '#fff' : 'var(--ink, #2b2117)',
              borderRadius: 999,
              cursor: 'pointer',
              fontWeight: ward === w.id ? 600 : 400,
            }}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* 子連れ条件フィルタチップ（クイックトグル） */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }} role="group" aria-label="子連れ条件フィルタ">
        {[
          { key: 'kidsMenu', label: '🍽 キッズメニューあり', state: onlyKidsMenu, set: setOnlyKidsMenu },
          { key: 'stroller', label: '👶 ベビーカーOK', state: onlyStrollerOK, set: setOnlyStrollerOK },
          { key: 'kidsChair', label: '🪑 キッズチェアあり', state: onlyKidsChair, set: setOnlyKidsChair },
          { key: 'kidsCutlery', label: '🥄 子供用カトラリー', state: onlyKidsCutlery, set: setOnlyKidsCutlery },
          { key: 'kidsSpace', label: '🎈 キッズスペース', state: onlyKidsSpace, set: setOnlyKidsSpace },
          { key: 'privateRoom', label: '🚪 個室あり', state: onlyPrivateRoom, set: setOnlyPrivateRoom },
          { key: 'stepFree', label: '🚫📐 段差なし', state: onlyStepFree, set: setOnlyStepFree },
          { key: 'zashiki', label: '🟫 座敷あり', state: onlyZashiki, set: setOnlyZashiki },
          { key: 'diaper', label: '👶 おむつ替え台', state: onlyDiaper, set: setOnlyDiaper },
          { key: 'nursing', label: '🤱 授乳室', state: onlyNursing, set: setOnlyNursing },
          { key: 'babyFood', label: '🍼 離乳食持込OK', state: onlyBabyFood, set: setOnlyBabyFood },
          { key: 'shareDish', label: '🥢 取り分けOK', state: onlyShareDish, set: setOnlyShareDish },
        ].map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => { c.set(!c.state); setPage(1); }}
            aria-pressed={c.state}
            style={{
              padding: '6px 14px',
              fontSize: 12.5,
              border: '1.5px solid',
              borderColor: c.state ? 'var(--clay-deep, #B0432B)' : 'rgba(20,147,209,0.3)',
              background: c.state ? 'var(--clay-deep, #B0432B)' : 'rgba(20,147,209,0.04)',
              color: c.state ? '#fff' : 'var(--ink, #2b2117)',
              borderRadius: 999,
              cursor: 'pointer',
              fontWeight: c.state ? 600 : 500,
              transition: 'all .15s ease',
            }}
          >
            {c.label}
          </button>
        ))}
        {(onlyKidsMenu || onlyStrollerOK || onlyPrivateRoom || onlyKidsChair || onlyKidsCutlery || onlyKidsSpace || onlyStepFree || onlyZashiki || onlyDiaper || onlyNursing || onlyBabyFood || onlyShareDish) && (
          <button
            type="button"
            onClick={() => {
              setOnlyKidsMenu(false);
              setOnlyStrollerOK(false);
              setOnlyPrivateRoom(false);
              setOnlyKidsChair(false);
              setOnlyKidsCutlery(false);
              setOnlyKidsSpace(false);
              setOnlyStepFree(false);
              setOnlyZashiki(false);
              setOnlyDiaper(false);
              setOnlyNursing(false);
              setOnlyBabyFood(false);
              setOnlyShareDish(false);
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              fontSize: 11.5,
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-mute, #968B7B)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            条件クリア
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          カテゴリ
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={{ padding: '5px 8px', fontSize: 12.5, border: '1px solid rgba(201,96,62,0.25)', borderRadius: 6 }}
          >
            <option value="all">全て</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          種別
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as 'all' | 'chain' | 'indie'); setPage(1); }}
            style={{ padding: '5px 8px', fontSize: 12.5, border: '1px solid rgba(201,96,62,0.25)', borderRadius: 6 }}
          >
            <option value="all">全て</option>
            <option value="chain">チェーン店</option>
            <option value="indie">個人店</option>
          </select>
        </label>
        <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center', flex: '1 1 200px', minWidth: 160 }}>
          キーワード
          <input
            type="search"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="店名・駅名で絞り込み"
            style={{ padding: '5px 8px', fontSize: 12.5, border: '1px solid rgba(201,96,62,0.25)', borderRadius: 6, flex: 1, minWidth: 0 }}
          />
        </label>
        <span style={{ fontSize: 12, color: 'var(--ink-mute, #948477)' }}>
          {filtered.length.toLocaleString()}件 / 全{rows.length.toLocaleString()}件
        </span>
      </div>

      {/* テーブル */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(201,96,62,0.16)', borderRadius: 10, background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1400 }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('name')}>店名{sortIcon('name')}</th>
              <th style={thStyle} onClick={() => handleSort('station')}>駅{sortIcon('station')}</th>
              <th style={thStyle} onClick={() => handleSort('ward')}>区{sortIcon('ward')}</th>
              <th style={thStyle} onClick={() => handleSort('category')}>カテゴリ{sortIcon('category')}</th>
              <th style={thStyle} onClick={() => handleSort('stroller')}>ベビーカー{sortIcon('stroller')}</th>
              <th style={thStyle} onClick={() => handleSort('kidsMenu')}>キッズメニュー{sortIcon('kidsMenu')}</th>
              <th style={thStyle} onClick={() => handleSort('kidsChair')}>キッズチェア{sortIcon('kidsChair')}</th>
              <th style={thStyle} onClick={() => handleSort('kidsCutlery')}>子供用カトラリー{sortIcon('kidsCutlery')}</th>
              <th style={thStyle} onClick={() => handleSort('kidsSpace')}>キッズスペース{sortIcon('kidsSpace')}</th>
              <th style={thStyle} onClick={() => handleSort('privateRoom')}>個室{sortIcon('privateRoom')}</th>
              <th style={thStyle} onClick={() => handleSort('stepFree')}>段差{sortIcon('stepFree')}</th>
              <th style={thStyle}>座敷</th>
              <th style={thStyle} onClick={() => handleSort('diaperChangingTable')}>おむつ替え{sortIcon('diaperChangingTable')}</th>
              <th style={thStyle} onClick={() => handleSort('nursingRoom')}>授乳{sortIcon('nursingRoom')}</th>
              <th style={thStyle} onClick={() => handleSort('shareDish')}>取分{sortIcon('shareDish')}</th>
              <th style={thStyle} onClick={() => handleSort('priceRange')}>価格帯{sortIcon('priceRange')}</th>
              <th style={thStyle} onClick={() => handleSort('type')}>種別{sortIcon('type')}</th>
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--ink-mute, #948477)', padding: 24 }} colSpan={17}>
                  該当データがありません
                </td>
              </tr>
            ) : (
              view.map((r) => (
                <tr key={r.id}>
                  <td style={tdStyle}>{r.name}</td>
                  <td style={tdStyle}>
                    <a href={`/station/${r.stationSlug}`} style={{ color: 'var(--clay-deep, #B0432B)' }}>{r.station}</a>
                  </td>
                  <td style={tdStyle}>{r.ward}</td>
                  <td style={tdStyle}>{r.category}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{STROLLER_LABEL[r.stroller]}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.kidsMenu ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.kidsChair ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.kidsCutlery ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.kidsSpace ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.privateRoom ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.stepFree ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.seatingType?.includes('zashiki') ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.diaperChangingTable ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.nursingRoom ? '○' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{r.shareDish ? '○' : '—'}</td>
                  <td style={tdStyle}>{r.priceRange}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: r.type === 'chain' ? '#E3F2FD' : '#FFF3E0',
                      color: r.type === 'chain' ? '#1565C0' : '#E65100',
                    }}>
                      {r.type === 'chain' ? 'チェーン' : '個人'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページャ */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 14, fontSize: 13 }}>
          <button
            type="button"
            onClick={() => setPage(Math.max(1, pageSafe - 1))}
            disabled={pageSafe === 1}
            style={{ padding: '5px 12px', border: '1px solid rgba(201,96,62,0.25)', borderRadius: 6, background: '#fff', cursor: pageSafe === 1 ? 'default' : 'pointer', opacity: pageSafe === 1 ? 0.4 : 1 }}
          >
            前へ
          </button>
          <span style={{ color: 'var(--ink-mute, #948477)' }}>
            {pageSafe} / {totalPages} ページ
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, pageSafe + 1))}
            disabled={pageSafe === totalPages}
            style={{ padding: '5px 12px', border: '1px solid rgba(201,96,62,0.25)', borderRadius: 6, background: '#fff', cursor: pageSafe === totalPages ? 'default' : 'pointer', opacity: pageSafe === totalPages ? 0.4 : 1 }}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
