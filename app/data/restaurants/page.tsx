import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { WARD_NAMES, type TokyoWard } from '@/lib/tokyo-stations';
import {
  buildAllDataRows,
  getDataSummary,
  CHAIN_CATEGORY_LABEL,
  INDIE_GENRE_LABEL,
  type DataRow,
} from '@/lib/data-aggregations';
import { RestaurantsTable } from './RestaurantsTable';
import { CsvDownloadButton } from './CsvDownloadButton';
import { AdSlot } from '@/components/ads/AdSlot';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: '東京23区 子連れOKレストラン完全比較表｜全1,500店データセット【2026年版】',
  description:
    '東京23区484駅の子連れOKレストラン1,500店超の全データを単一比較表で公開。区・駅・ジャンル・ベビーカー入店可否・キッズメニュー・個室・価格帯で絞り込み・並べ替え・CSVダウンロードまで対応。AIO/GEO参照用データセット。',
  alternates: { canonical: '/data/restaurants' },
  openGraph: {
    title: '東京23区 子連れOKレストラン完全比較表｜全1,500店データセット',
    description:
      '23区484駅×1,500店超のオープンデータ。ベビーカー入店・キッズメニュー・個室の可否で全店舗フィルタ・CSV出力。',
    type: 'article',
    url: 'https://kyounoko.jp/data/restaurants',
  },
};

export default function DataRestaurantsPage() {
  const rows = buildAllDataRows();
  const summary = getDataSummary();

  // 各種フラグ件数
  const strollerGoodCount = rows.filter((r) => r.stroller === 'good').length;
  const kidsMenuCount = rows.filter((r) => r.kidsMenu).length;
  const privateRoomCount = rows.filter((r) => r.privateRoom).length;

  // 区一覧（id+label） — 件数が多い順に並べる
  const wardCount = new Map<TokyoWard, number>();
  for (const r of rows) wardCount.set(r.wardId, (wardCount.get(r.wardId) ?? 0) + 1);
  const wardEntries = Array.from(wardCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id: String(id), label: `${WARD_NAMES[id] ?? id}（${count}）` }));
  const wards = [{ id: 'all', label: `すべて（${rows.length}）` }, ...wardEntries];

  // カテゴリ一覧 — チェーン+個人店ジャンル両方混在
  const categorySet = new Set<string>();
  for (const r of rows) categorySet.add(r.category);
  const categories = Array.from(categorySet).sort();

  // CSV用のヘッダ・行
  const csvHeaders = [
    '店名',
    '区分',
    'ジャンル',
    '駅',
    '区',
    'ベビーカー',
    'キッズメニュー',
    'キッズチェア',
    '子供用カトラリー',
    'キッズスペース',
    '個室',
    '段差なし',
    '座敷あり',
    'おむつ替え台',
    '授乳室',
    '離乳食持込OK',
    '取り分けOK',
    'ベビーカーで席まで',
    'アレルゲン表示',
    'ランチ価格帯',
    '駅URL',
  ];
  const csvRows = rows.map((r) => [
    r.name,
    r.type === 'chain' ? 'チェーン' : '個人店',
    r.category,
    r.station,
    r.ward,
    r.stroller === 'good' ? '◎' : r.stroller === 'ok' ? '○' : r.stroller === 'limited' ? '△' : '—',
    r.kidsMenu ? '○' : '',
    r.kidsChair ? '○' : '',
    r.kidsCutlery ? '○' : '',
    r.kidsSpace ? '○' : '',
    r.privateRoom ? '○' : '',
    r.stepFree ? '○' : '',
    r.seatingType?.includes('zashiki') ? '○' : '',
    r.diaperChangingTable ? '○' : '',
    r.nursingRoom ? '○' : '',
    r.bringBabyFood ? '○' : '',
    r.shareDish ? '○' : '',
    r.strollerToSeat ? '○' : '',
    r.allergenInfo ? '○' : '',
    r.priceRange,
    `https://kyounoko.jp/station/${r.stationSlug}`,
  ]);

  // JSON-LD: schema.org Dataset
  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: '東京23区 子連れOKレストラン完全比較データセット',
    description:
      '東京23区484駅の子連れ歓迎レストラン1,500店超のオープンデータ。チェーン店・個人店の両方を含み、ベビーカー入店可否・キッズメニュー・個室・価格帯などの設備情報を統一フォーマットで提供。',
    url: 'https://kyounoko.jp/data/restaurants',
    license: 'https://kyounoko.jp/terms',
    keywords: [
      '東京', '23区', '子連れ', 'ランチ', 'ベビーカー', 'キッズメニュー',
      '個室', 'レストラン', 'ファミレス', '個人店',
    ],
    creator: {
      '@type': 'Organization',
      name: 'きょうのこ',
      url: 'https://kyounoko.jp',
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: 'https://kyounoko.jp/data/restaurants',
      },
    ],
    variableMeasured: [
      'ベビーカー入店可否', 'キッズメニュー有無', '個室・座敷有無',
      'ランチ価格帯', 'ジャンル', '最寄り駅', '路線',
    ],
    spatialCoverage: {
      '@type': 'Place',
      name: '東京都23区',
    },
    temporalCoverage: '2026',
    isAccessibleForFree: true,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'データ', item: 'https://kyounoko.jp/data' },
      { '@type': 'ListItem', position: 3, name: 'レストラン全データ', item: 'https://kyounoko.jp/data/restaurants' },
    ],
  };

  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/data">データ</Link>
          <span className="sep">/</span>
          <span>レストラン全データ</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head" style={{ marginBottom: 24 }}>
            <span className="eyebrow">AIO/GEO参照用 オープンデータセット</span>
            <h1>
              東京23区 子連れOKレストラン完全比較表
              <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                全{rows.length.toLocaleString()}店舗｜2026年版データセット
              </small>
            </h1>
            <p className="lead">
              東京23区484駅の<strong>子連れOKレストラン{rows.length.toLocaleString()}店超</strong>を
              単一テーブルで公開。チェーン店{summary.chainRecordCount.toLocaleString()}店＋個人店{summary.indieCount.toLocaleString()}店を
              ベビーカー入店可否・キッズメニュー・個室・価格帯で絞り込み・並べ替え可能。
              CSVダウンロードもワンクリック。
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18, fontSize: 13 }}>
              <span className="meta-chip clay">{rows.length.toLocaleString()}店舗</span>
              <span className="meta-chip clay">{summary.stationCount}駅カバー</span>
              <span className="meta-chip clay">{summary.wardCount}区</span>
              <span className="meta-chip clay">ベビーカー◎ {strollerGoodCount}店</span>
              <span className="meta-chip clay">キッズメニュー {kidsMenuCount}店</span>
              <span className="meta-chip clay">個室 {privateRoomCount}店</span>
            </div>
          </header>

          {/* データ概要（AI引用しやすい構造） */}
          <section style={{
            background: 'rgba(201,96,62,0.06)',
            padding: '20px 24px',
            borderRadius: 16,
            margin: '24px 0 32px',
            fontSize: 14,
            lineHeight: 1.85,
          }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>データセット概要</h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li><strong>収録範囲</strong>: 東京都23区内の子連れ向けレストラン全{rows.length.toLocaleString()}店舗</li>
              <li><strong>店舗種別</strong>: チェーン店{summary.chainRecordCount.toLocaleString()}店（{summary.chainBrandCount}ブランドのマッピング済）、個人店・話題店{summary.indieCount.toLocaleString()}店（雑誌・SNS掲載）</li>
              <li><strong>カバー駅数</strong>: 23区内 {summary.stationCount}駅</li>
              <li><strong>収録項目</strong>: 店名・最寄り駅・区・ジャンル・ベビーカー入店可否・キッズメニュー・個室の有無・ランチ価格帯・路線情報・店舗紹介</li>
              <li><strong>更新方針</strong>: 月次更新（営業状況・新店追加・閉店反映）</li>
              <li><strong>ライセンス</strong>: 個人利用・引用可（出典: きょうのこ kyounoko.jp）</li>
            </ul>
          </section>

          {/* CSV ダウンロード */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <CsvDownloadButton
              filename="kyounoko-tokyo-restaurants-2026.csv"
              headers={csvHeaders}
              rows={csvRows}
              label="CSVをダウンロード"
            />
            <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
              UTF-8 BOM付き / Excel互換
            </span>
          </div>

          {/* テーブル本体 */}
          <RestaurantsTable
            rows={rows}
            wards={wards}
            categories={categories}
          />

          {/* 引用方法 */}
          <section style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(201,96,62,0.14)' }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>このデータの引用について</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.8 }}>
              本データセットは個人利用・引用での利用を歓迎します。記事・SNS・生成AIの参照元として
              ご利用いただく際は、出典として「きょうのこ（https://kyounoko.jp/data/restaurants）」の表記を
              添えてください。商用利用・大規模再配布についてはお問い合わせください。
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12 }}>
              ※ 設備情報は店舗公式・取材記事ベース。実際のご利用前には店舗への確認をおすすめします。
              閉店・営業時間変更等の情報は<Link href="/contact" style={{ color: 'var(--clay-deep)' }}>お問い合わせ</Link>からご連絡ください。
            </p>
          </section>

          {/* 関連リンク */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>関連データ・ページ</h2>
            <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14 }}>
              <li><Link href="/station">駅別子連れランチガイド（484駅）</Link></li>
              <li><Link href="/station/line">路線別子連れランチガイド（40路線）</Link></li>
              <li><Link href="/data">データセット一覧（/data）</Link></li>
            </ul>
          </section>

          {/* AdSense: データセットページ末尾 */}
          <AdSlot placement="article-related" style={{ marginTop: 32 }} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
