import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { BabycarShindanClient } from './Client';
import { allBabycarKeywords, type ResolvedBabycar } from '@/lib/babycar-models';
import { getRakutenProduct } from '@/lib/rakuten-products';
import { wrapMoshimoRakuten } from '@/lib/moshimo';

export const metadata: Metadata = {
  title: 'ベビーカー診断｜あなたに合う1台を3分で',
  description:
    '生活シーン・予算・住環境の5問に答えるだけで、あなたに合うベビーカー3モデルを提案。A型/B型/AB型の選び方、頻出シーン別の最適解を編集部独自データで判定します。',
  alternates: { canonical: '/tools/babycar-shindan' },
  openGraph: {
    title: 'ベビーカー診断｜あなたに合う1台を3分で',
    description: '5問に答えるだけ。生活パターンに合うベビーカー3モデルを編集部の独自データで提案。',
  },
};

export default async function BabycarShindanPage() {
  // P1-9: 各モデルの具体商品（画像/価格/購入リンク）を楽天APIで一括解決し Client へ。
  // env未設定なら image=null・楽天検索リンクにフォールバック（fetchもしない）。
  const products: Record<string, ResolvedBabycar> = {};
  await Promise.all(
    allBabycarKeywords().map(async (kw) => {
      const p = await getRakutenProduct(kw);
      const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(kw)}/`;
      products[kw] = {
        image: p?.image ?? null,
        price: p?.price ?? 0,
        href: wrapMoshimoRakuten(p?.url ?? searchUrl),
      };
    }),
  );

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '診断ツール', item: 'https://kyounoko.jp/tools' },
      { '@type': 'ListItem', position: 3, name: 'ベビーカー診断', item: 'https://kyounoko.jp/tools/babycar-shindan' },
    ],
  };
  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ベビーカー診断',
    url: 'https://kyounoko.jp/tools/babycar-shindan',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    description: '生活シーン・予算・住環境の5問に答えるだけで、あなたに合うベビーカー3モデルを提案する無料診断ツール。',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    inLanguage: 'ja',
    creator: { '@id': 'https://kyounoko.jp/about#author' },
    publisher: { '@id': 'https://kyounoko.jp/#organization' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }} />
      <V2Frame header="sub" active="home">
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/tools">診断ツール</Link>
          <span className="sep">/</span>
          <span>ベビーカー診断</span>
        </nav>
      </div>

      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">TOOL 01</span>
          <h1>ベビーカー診断</h1>
          <p className="lead">
            生活シーン・予算・住環境の<strong>5問</strong>に答えるだけ。あなたの暮らしに合うベビーカー3モデルを編集部の独自データから提案します。約2分で完了。
          </p>
        </header>

        <BabycarShindanClient products={products} />

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 14px' }}>
            診断ロジックの根拠
          </h2>
          <p style={{ color: 'var(--ink-sub)', fontSize: 14, lineHeight: 1.95 }}>
            きょうのこ編集部が、東京23区の主要駅50箇所でベビーカー利用シーンを実地調査。住環境（戸建て/マンション/階段の有無）、行動範囲（電車/車/徒歩中心）、月齢（0-6ヶ月の里帰り期/7-12ヶ月の活動期/1-2歳の歩き始め期）の3軸で<strong>最適解が変わる</strong>ことを確認しました。本診断はこの調査ベースで、5問の組み合わせから上位3モデルを提案します。
          </p>
          <p style={{ color: 'var(--ink-mute)', fontSize: 12, marginTop: 12 }}>
            ※ 診断結果は参考情報です。実際の購入前は店頭での試乗、ご家族との相談を推奨します。
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 16px' }}>
            関連記事
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.95 }}>
            <li><Link href="/article/babycar-ranking-2026">ベビーカーランキング2026最新版</Link></li>
            <li><Link href="/article/babycar-erabikata">ベビーカーの選び方完全ガイド</Link></li>
            <li><Link href="/article/babycar-vs-dakkohimo-tsukaiwake-data">ベビーカー vs 抱っこ紐 月齢別使い分け</Link></li>
            <li><Link href="/article/babycar-itsukara-tsukau">ベビーカーはいつから使える？月齢別ガイド</Link></li>
          </ul>
        </section>
      </div>
      </V2Frame>
      
    </>
  );
}
