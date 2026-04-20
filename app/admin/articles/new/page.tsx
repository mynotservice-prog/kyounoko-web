import { NewArticleClient } from './NewArticleClient';

export const metadata = { title: '新規記事雛形生成 · Admin' };

export default function NewArticlePage() {
  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: '0 0 20px' }}>
        記事Markdown雛形生成
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-sub)', marginBottom: 24 }}>
        下のフォームに基本情報を入力すると、そのまま <code>content/articles/[slug].md</code>
        に貼り付けて使えるMarkdownを生成します。ローカルでファイル作成後、git push でデプロイ。
      </p>
      <NewArticleClient />
    </>
  );
}
