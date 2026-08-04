import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';

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
      <V2Frame header="sub" active="home">
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

        <article className="prose" id="main">
          <h2>お問い合わせ方法</h2>
          <p>現在はメールでのお問い合わせを承っています。</p>
          <ul>
            <li>メール：<a href="mailto:service@remegift.jp">service@remegift.jp</a></li>
          </ul>
          <p style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
            運営者の連絡先は、同一運営者が運営する他サイトと共通のメールアドレスを使用しています。
            きょうのこ宛のお問い合わせであることが分かるよう、件名に「きょうのこ」とご記載いただけると助かります。
          </p>

          <h2>よくあるお問い合わせ</h2>

          <h3>記事の情報が古い / 間違いがある</h3>
          <p>該当記事のURLとご指摘内容を添えて、メールでお知らせください。2営業日以内に確認の上、修正いたします。</p>

          <h3>施設・店舗の掲載を希望 / 掲載中の情報を更新したい</h3>
          <p>
            施設・店舗ページの掲載、公式写真への差し替え、営業時間などの情報更新は<strong>すべて無料</strong>で承っています。
            手順は <Link href="/for-facilities">施設・店舗のご担当者さまへ</Link> にまとめています。
          </p>

          <h3>掲載内容の修正・削除のご依頼</h3>
          <p>該当ページのURLとご依頼内容を添えてメールでご連絡ください。速やかに取り下げ・修正に対応します。</p>

          <h3>取材・メディアからのお問い合わせ</h3>
          <p>メディア・雑誌等の取材は、日程と概要をご明記の上、<a href="mailto:service@remegift.jp">service@remegift.jp</a> までご連絡ください。</p>

          <h3>広告掲載・タイアップについて</h3>
          <p>
            タイアップ記事・広告出稿・商品モニターのご相談は、
            <Link href="/business">タイアップ・広告掲載のご案内</Link> をご覧のうえご連絡ください。
            媒体データ、ご対応できるメニュー、PR表記の方針、お受けできないご依頼をすべて公開しています。
          </p>

          <h3>執筆者・取材協力者の募集について</h3>
          <p>
            子育て経験のあるライターさん、保育士・管理栄養士・小児科医等の監修者の方の応募も随時受け付けています。
            監修については <Link href="/supervisors">監修について</Link> もあわせてご覧ください。
          </p>

          <h2>返信について</h2>
          <p>いただいたお問い合わせには、順次返信いたします。お急ぎの場合は件名に<strong>【至急】</strong>とご記載ください。土日祝は対応が遅れる場合があります。</p>
          <p>スパム対策により、自動的に迷惑メールフォルダに振り分けられる場合があります。返信が3営業日以上ない場合は、お手数ですが再送してください。</p>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>最終更新：2026年8月5日</p>
        </article>
      </div>
      </V2Frame>
      
    </>
  );
}
