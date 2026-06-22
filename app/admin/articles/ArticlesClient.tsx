'use client';

import { useMemo } from 'react';
import { DataTable, type Column, type Filter } from '@/components/admin/DataTable';

export type ArticleRow = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  hero: string;
  area: string;
  publishedAt: string;
  updatedAt: string;
  lede: string;
  bodyLength: number;
  bodyPreview: string;
  ageRanges: string[];
};

type AugRow = ArticleRow & { qa: string; updatedDate: string };

type Props = {
  rows: ArticleRow[];
  categoryOptions: string[];
  areaOptions: { slug: string; name: string }[];
};

export function ArticlesClient({ rows, categoryOptions, areaOptions }: Props) {
  const augmented: AugRow[] = useMemo(
    () =>
      rows.map((r) => {
        const hasIssue = !r.hero || r.bodyLength < 800 || !r.lede;
        return { ...r, qa: hasIssue ? '要改善' : '良好', updatedDate: (r.updatedAt || '').slice(0, 10) };
      }),
    [rows],
  );

  const columns: Column<AugRow>[] = [
    { key: 'title', label: 'タイトル', type: 'title', sortable: true, subKey: (r) => `/${r.slug}`, href: (r) => `/admin/articles/${r.slug}/edit` },
    { key: 'categoryName', label: 'カテゴリ', type: 'text', width: 140, sortable: true },
    { key: 'bodyLength', label: '文字数', type: 'num', width: 92, sortable: true },
    { key: 'qa', label: '状態', type: 'badge', width: 100, sortable: true, tone: (r) => (r.qa === '良好' ? 'ok' : 'warn') },
    { key: 'updatedDate', label: '更新日', type: 'monotext', width: 116, sortable: true },
  ];

  const filters: Filter<AugRow>[] = [
    {
      id: 'category',
      allLabel: 'カテゴリ：すべて',
      options: categoryOptions.map((c) => ({ value: c, label: c })),
      test: (r, v) => r.categoryName === v,
    },
    {
      id: 'area',
      allLabel: 'エリア：すべて',
      options: [{ value: 'all', label: 'エリア非依存' }, ...areaOptions.map((a) => ({ value: a.slug, label: a.name }))],
      test: (r, v) => r.area === v,
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
      title="記事"
      subtitle="ファイル記事の管理（品質チェック付き）"
      primaryAction={{ label: '新規記事', href: '/admin/articles/new' }}
      searchable
      searchPlaceholder="タイトル / slug / 導入文で検索"
      searchKeys={(r) => `${r.title} ${r.slug} ${r.lede}`}
      filters={filters}
      columns={columns}
      rows={augmented}
      getId={(r) => r.slug}
      selectable
      editable
      editHref={(r) => `/admin/articles/${r.slug}/edit`}
      defaultSort={{ key: 'updatedDate', dir: 'desc' }}
    />
  );
}
