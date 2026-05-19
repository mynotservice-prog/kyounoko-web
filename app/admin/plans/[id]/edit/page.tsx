import { ContentEditor } from '@/components/admin/ContentEditor';

export const metadata = {
  title: 'プラン編集 · Admin',
  robots: { index: false, follow: false },
};

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ContentEditor
      kind="plan"
      slug={id}
      backHref="/admin/plans"
      publicHref={`/plan/${id}`}
    />
  );
}
