import { NewArticleClient } from './NewArticleClient';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: '新規記事雛形生成 · Admin' };

export default function NewArticlePage() {
  return (
    <>
      <PageHeader
        title="新規記事"
        subtitle="基本情報を入力すると、そのまま content/articles/[slug].md に使えるMarkdownを生成します。KVに作成すればデプロイ不要で公開できます。"
      />
      <NewArticleClient />
    </>
  );
}
