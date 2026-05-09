import Link from 'next/link';
import { ImportClient } from './ImportClient';

export const metadata = {
  title: 'SEO Import · Admin',
  robots: { index: false, follow: false },
};

export default function SeoImportPage() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          📥 Search Console データインポート
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          Search Consoleの画面からCSVエクスポート → このページに貼り付け → /admin/seo で分析を表示
        </p>
      </div>

      <section
        style={{
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, margin: '0 0 12px' }}>
          手順
        </h2>
        <ol style={{ fontSize: 13, lineHeight: 1.95, color: 'var(--ink-sub)', paddingLeft: 20 }}>
          <li>
            <a
              href="https://search.google.com/search-console/performance/search-analytics"
              target="_blank"
              rel="noopener"
              style={{ color: 'var(--clay-deep)' }}
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
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12, marginBottom: 0 }}>
          ※ データはブラウザのローカルストレージに保存されます。サーバーには送信されません。
        </p>
      </section>

      <ImportClient />

      <div style={{ marginTop: 24 }}>
        <Link href="/admin/seo" style={{ color: 'var(--clay-deep)', fontSize: 13 }}>
          ← /admin/seo に戻る
        </Link>
      </div>
    </>
  );
}
