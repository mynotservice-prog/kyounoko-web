import Link from 'next/link';
import { PageHeader, Card } from '@/components/admin/ui';
import { ImportClient } from './ImportClient';

export const metadata = {
  title: 'SEO Import · Admin',
  robots: { index: false, follow: false },
};

export default function SeoImportPage() {
  return (
    <>
      <PageHeader
        title="Search Console データインポート"
        subtitle="Search Consoleの画面からCSVエクスポート → このページに貼り付け → /admin/seo で分析を表示"
      />

      <Card title="手順" style={{ marginBottom: 24 }} bodyPadding="18px 20px">
        <ol style={{ fontSize: 13, lineHeight: 1.95, color: 'var(--ink-700)', paddingLeft: 20, margin: 0 }}>
          <li>
            <a
              href="https://search.google.com/search-console/performance/search-analytics"
              target="_blank"
              rel="noopener"
              style={{ color: 'var(--accent)' }}
            >
              Search Console → 検索パフォーマンス
            </a>{' '}
            を開く
          </li>
          <li>
            プロパティ「<strong>kyounoko.jp</strong>」を選択
          </li>
          <li>期間: <strong>「過去28日間」</strong> または「過去3ヶ月」など</li>
          <li>
            画面右上の <strong>「エクスポート」</strong> ボタン → <strong>「Excel」</strong> または{' '}
            <strong>「CSV」</strong> を選ぶ（Excelの方がエンコーディング安定）
          </li>
          <li>ダウンロードされたファイルをExcel/Numbersで開く</li>
          <li>
            「クエリ」シートを開く → <strong>すべて選択</strong>（タイトル行も含めて）→ コピー
          </li>
          <li>下のテキストエリアに <strong>貼り付け</strong></li>
          <li>「インポート」ボタンを押すと /admin/seo で分析が見られます</li>
        </ol>
        <p style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 12, marginBottom: 0 }}>
          ※ データはブラウザのローカルストレージに保存されます。サーバーには送信されません。
        </p>
      </Card>

      <ImportClient />

      <div style={{ marginTop: 24 }}>
        <Link href="/admin/seo" style={{ color: 'var(--accent)', fontSize: 13 }}>
          ← /admin/seo に戻る
        </Link>
      </div>
    </>
  );
}
