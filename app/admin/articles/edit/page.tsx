import type { Metadata } from 'next';
import { getAllFileArticles } from '@/lib/articles';
import { PageHeader } from '@/components/admin/ui';
import { ArticleEditPickerClient } from './ArticleEditPickerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '記事編集 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/articles/edit
 *
 * 記事編集の入り口（スポット編集・イベント編集と同じ「運用・編集」枠）。
 * 記事を検索して選ぶと /admin/articles/<slug>/edit のフォーム編集へ移動する。
 * 保存はデプロイ不要（KV設定時）または GitHub commit → 自動デプロイ。
 */
export default function ArticleEditIndexPage() {
  const rows = getAllFileArticles()
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      categoryName: a.categoryName ?? a.category,
      updatedAt: a.updatedAt || a.publishedAt || '',
    }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return (
    <>
      <PageHeader title="記事編集" subtitle={`全 ${rows.length} 本の記事を編集可能`} />
      <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '0 0 20px', lineHeight: 1.7 }}>
        タイトル・本文・hero画像・日付などをフォームで編集できます。保存すると本番に反映されます。
      </p>
      <ArticleEditPickerClient rows={rows} />
    </>
  );
}
