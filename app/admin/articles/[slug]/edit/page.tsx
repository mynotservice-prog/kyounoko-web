import { ContentEditor } from '@/components/admin/ContentEditor';

export const metadata = {
  title: '記事編集 · Admin',
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ContentEditor
      kind="article"
      slug={slug}
      backHref="/admin/articles"
      publicHref={`/article/${slug}`}
    />
  );
}
