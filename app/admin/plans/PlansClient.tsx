'use client';

import { useMemo } from 'react';
import { DataTable, type Column, type Filter } from '@/components/admin/DataTable';

export type PlanRow = {
  id: string;
  title: string;
  shortAnswer: string;
  ageRanges: string[];
  place: string[];
  durationMin: number;
  budget: string;
  area: string;
  areaName: string;
  hero?: string;
  bodyPreview: string;
  bodyLength: number;
};

type AugRow = PlanRow & { qa: string };

type Props = {
  rows: PlanRow[];
  areaOptions: { slug: string; name: string }[];
};

export function PlansClient({ rows, areaOptions }: Props) {
  const augmented: AugRow[] = useMemo(
    () =>
      rows.map((r) => {
        const hasIssue = !r.hero || r.bodyLength < 400 || !r.shortAnswer;
        return { ...r, qa: hasIssue ? '要改善' : '良好' };
      }),
    [rows],
  );

  const placeOptions = useMemo(
    () => [...new Set(rows.flatMap((r) => r.place).filter(Boolean))].sort(),
    [rows],
  );

  const columns: Column<AugRow>[] = [
    { key: 'title', label: 'プラン名', type: 'title', sortable: true, subKey: (r) => `/${r.id}`, href: (r) => `/admin/plans/${r.id}/edit` },
    { key: 'areaName', label: 'エリア', type: 'text', width: 120, sortable: true },
    { key: 'durationMin', label: '所要', type: 'num', suffix: '分', width: 92, sortable: true },
    { key: 'bodyLength', label: '文字数', type: 'num', width: 92, sortable: true },
    { key: 'qa', label: '状態', type: 'badge', width: 100, sortable: true, tone: (r) => (r.qa === '良好' ? 'ok' : 'warn') },
  ];

  const filters: Filter<AugRow>[] = [
    {
      id: 'area',
      allLabel: 'エリア：すべて',
      options: [{ value: 'all', label: 'エリア非依存' }, ...areaOptions.map((a) => ({ value: a.slug, label: a.name }))],
      test: (r, v) => r.area === v,
    },
    {
      id: 'age',
      allLabel: '年齢：すべて',
      options: [
        { value: '0-1', label: '0-1歳' },
        { value: '2-3', label: '2-3歳' },
        { value: '4-6', label: '4-6歳' },
      ],
      test: (r, v) => r.ageRanges.includes(v),
    },
    {
      id: 'place',
      allLabel: '場所：すべて',
      options: placeOptions.map((p) => ({ value: p, label: p })),
      test: (r, v) => r.place.includes(v),
    },
    {
      id: 'qa',
      allLabel: '状態：すべて',
      options: [
        { value: '要改善', label: '要改善' },
        { value: '良好', label: '良好' },
      ],
      test: (r, v) => r.qa === v,
    },
  ];

  return (
    <DataTable<AugRow>
      title="プラン"
      subtitle="おでかけプランの管理"
      primaryAction={{ label: '新規プラン', href: '/admin/plans/new' }}
      searchable
      searchPlaceholder="タイトル / ID / 概要で検索"
      searchKeys={(r) => `${r.title} ${r.id} ${r.shortAnswer}`}
      filters={filters}
      columns={columns}
      rows={augmented}
      getId={(r) => r.id}
      editable
      editHref={(r) => `/admin/plans/${r.id}/edit`}
      defaultSort={{ key: 'title', dir: 'asc' }}
    />
  );
}
