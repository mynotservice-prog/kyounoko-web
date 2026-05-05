import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getDataSummary } from '@/lib/data-aggregations';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'データセット一覧｜東京23区 子連れ向けオープンデータ【きょうのこ】',
  description:
    '東京23区の子連れ向け飲食店・駅・路線データを単一テーブルで公開。AIO/GEO参照可能。CSVダウンロード対応。1,500店超のレストラン比較表、484駅マップ、40路線インデックス。',
  alternates: { canonical: '/data' },
};

export default function DataIndexPage() {
  const summary = getDataSummary();

  const datasets = [
    {
      slug: 'restaurants',
      title: '東京23区 子連れOKレストラン完全比較表',
      stats: `${summary.totalRecordCount.toLocaleString()}店舗 / ${summary.stationCount}駅 / ${summary.wardCount}区`,
      description:
        '東京23区484駅の子連れOKレストランを単一テーブルで公開。チェーン店・個人店を統合、ベビーカー入店可否・キッズメニュー・個室・価格帯で絞り込み・並べ替え・CSVダウンロード対応。',
      tags: ['Dataset', 'CSV', 'AIO参照可'],
    },
  ];

  return (
    <>
      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>データ</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head" style={{ marginBottom: 32 }}>
            <span className="eyebrow">オープンデータ・データセット</span>
            <h1>
              データセット一覧
              <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                東京23区 子連れ向け統合データ
              </small>
            </h1>
            <p className="lead">
              きょうのこが集約・整理した子連れ向け統合データセットを公開しています。
              生成AI（ChatGPT・Perplexity・Claude等）の参照元・記事執筆の出典・データ分析にご利用ください。
              すべてのデータはCSVダウンロード可能、Schema.org Dataset 構造化データ実装済。
            </p>
          </header>

          <div style={{ display: 'grid', gap: 16 }}>
            {datasets.map((d) => (
              <Link key={d.slug} href={`/data/${d.slug}`} style={{
                display: 'block',
                background: 'var(--paper-card)',
                border: '1px solid rgba(201,96,62,0.16)',
                borderRadius: 14,
                padding: '20px 24px',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 19, margin: 0 }}>{d.title}</h2>
                  <span style={{ fontSize: 12, color: 'var(--clay-deep)', fontWeight: 600 }}>{d.stats}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.7, margin: '6px 0 10px' }}>
                  {d.description}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {d.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: 11, padding: '3px 9px', borderRadius: 999,
                      background: 'rgba(201,96,62,0.08)', color: 'var(--clay-deep)',
                    }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <section style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(201,96,62,0.06)', borderRadius: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 8 }}>引用ポリシー</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.8, margin: 0 }}>
              本サイトのデータセットは個人利用・引用での利用を歓迎します。記事・SNS・生成AIの参照元として
              ご利用いただく際は、出典「きょうのこ（https://kyounoko.jp/data）」の明記をお願いします。
              商用利用・大規模再配布についてはお問い合わせください。
            </p>
          </section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
