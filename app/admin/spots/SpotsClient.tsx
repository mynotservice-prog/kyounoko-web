'use client';

import { DataTable, type Column, type Filter } from '@/components/admin/DataTable';

export type SpotRow = {
  id: string;
  name: string;
  areaSlug: string;
  areaName: string;
  category: string;
  place: string;
  ages: string;
  budget: string;
  city: string;
  note: string;
};

type Props = {
  rows: SpotRow[];
  areaOptions: { slug: string; name: string }[];
  categoryOptions: string[];
  notCovered: string[];
};

export function SpotsClient({ rows, areaOptions, categoryOptions, notCovered }: Props) {
  const columns: Column<SpotRow>[] = [
    { key: 'name', label: 'スポット名', type: 'title', sortable: true, subKey: (r) => r.city || undefined },
    { key: 'areaName', label: 'エリア', type: 'text', width: 110, sortable: true },
    { key: 'category', label: 'カテゴリ', type: 'text', width: 120, sortable: true },
    { key: 'place', label: '場所', type: 'text', width: 80, sortable: true },
    { key: 'ages', label: '対象年齢', type: 'text', width: 110 },
    { key: 'budget', label: '予算', type: 'text', width: 76, sortable: true },
  ];

  const filters: Filter<SpotRow>[] = [
    {
      id: 'area',
      allLabel: 'エリア：すべて',
      options: areaOptions.map((a) => ({ value: a.slug, label: a.name })),
      test: (r, v) => r.areaSlug === v,
    },
    {
      id: 'category',
      allLabel: 'カテゴリ：すべて',
      options: categoryOptions.map((c) => ({ value: c, label: c })),
      test: (r, v) => r.category === v,
    },
    {
      id: 'place',
      allLabel: '場所：すべて',
      options: [
        { value: '屋内', label: '屋内' },
        { value: '屋外', label: '屋外' },
        { value: '屋内外', label: '屋内外' },
      ],
      test: (r, v) => r.place === v,
    },
  ];

  return (
    <>
      {notCovered.length > 0 && (
        <div
          style={{
            background: 'var(--warn-bg)',
            border: '1px solid #e7d3a8',
            borderRadius: 'var(--r-md)',
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--warn-fg)',
            lineHeight: 1.6,
          }}
        >
          <strong>未カバー（{notCovered.length}県）：</strong> {notCovered.join('、')}
        </div>
      )}
      <DataTable<SpotRow>
        title="スポット"
        subtitle="登録スポットの管理（一括編集は「スポット編集」から）"
        primaryAction={{ label: '＋ 新規スポット', href: '/admin/spots/new' }}
        searchable
        searchPlaceholder="スポット名 / 市区町村で検索"
        searchKeys={(r) => `${r.name} ${r.city} ${r.note}`}
        filters={filters}
        columns={columns}
        rows={rows}
        getId={(r) => r.id}
        defaultSort={{ key: 'areaName', dir: 'asc' }}
      />
    </>
  );
}
