import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'きょうのこへのお問い合わせ窓口。ご意見・情報修正のご指摘・掲載依頼・取材依頼をお受けします。',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'お問い合わせ', item: 'https://kyounoko.jp/contact' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link><span className="sep">/</span><span>お問い合わせ</span>
        </nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">Contact</span>
          <h1>お問い合わせ</h1>
          <p className="lead">ご意見・ご指摘・掲載依頼・取材依頼など、お気軽にご連絡ください。2〜3営業日以内に返信いたします。</p>
        </header>

        <article className="prose">
          <h2>お問い合わせ方法</h2>
          <p>現在はメールでのお問い合わせを承っています。</p>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
          </ul>

          <h2>よくあるお問い合わせ</h2>

          <h3>記事の情報が古い / 間違いがある</h3>
          <p>該当記事のURLとご指摘内容を添えて、メールでお知らせください。2営業日以内に確認の上、修正いたします。</p>

          <h3>施設・店舗の掲載を希望</h3>
          <p>お問い合わせ種別「掲載依頼」でご連絡ください。掲載基準・料金・方針をご案内します。</p>

          <h3>取材・メディアからのお問い合わせ</h3>
          <p>メディア・雑誌等の取材は、日程と概要をご明記の上、<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a> までご連絡ください。</p>

          <h3>広告掲載について</h3>
          <p>広告出稿・タイアップ記事のご相談は、メールでご連絡ください。</p>

          <h3>執筆者・取材協力者の募集について</h3>
          <p>子育て経験のあるライターさん、保育士・管理栄養士・小児科医等の監修者の方の応募も随時受け付けています。</p>

          <h2>返信について</h2>
          <p>いただいたお問い合わせには、順次返信いたします。お急ぎの場合は件名に<strong>【至急】</strong>とご記載ください。土日祝は対応が遅れる場合があります。</p>
          <p>スパム対策により、自動的に迷惑メールフォルダに振り分けられる場合があります。返信が3営業日以上ない場合は、お手数ですが再送してください。</p>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>最終更新：2026年4月17日</p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
