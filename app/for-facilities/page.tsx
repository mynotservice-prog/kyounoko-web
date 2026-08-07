import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';

export const metadata: Metadata = {
  title: '施設・店舗のご担当者さまへ｜公式写真ご提供のお願い',
  description:
    '子育てメディア「きょうのこ」に掲載中の施設・店舗さま向けご案内。公式のお写真をご提供いただければ、掲載ページを無料でより魅力的に差し替えます。利用範囲・クレジット・確認フローを明記しています。',
  alternates: { canonical: '/for-facilities' },
};

const MAIL = 'service@remegift.jp';
const MAIL_SUBJECT = encodeURIComponent('【写真提供】施設名：');
const MAIL_BODY = encodeURIComponent(
  [
    '※下記をご記入のうえ送信してください（お写真は添付・ギガファイル便・Googleドライブ等いずれでも結構です）',
    '',
    '・施設／店舗名：',
    '・掲載ページURL（お分かりになれば）：',
    '・ご担当者さま お名前：',
    '・公式サイト／Instagram：',
    '・更新したい情報（営業時間・料金・設備など）：',
    '・お写真の送付方法：（このメールに添付／別途URLを共有 など）',
  ].join('\n'),
);

export default function ForFacilitiesPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: '施設・店舗のご担当者さまへ',
        item: 'https://kyounoko.jp/for-facilities',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <V2Frame header="sub" active="home">
        <div className="container-article">
          <nav className="breadcrumb" aria-label="パンくず">
            <Link href="/">HOME</Link>
            <span className="sep">/</span>
            <span>施設・店舗のご担当者さまへ</span>
          </nav>
        </div>

        <div className="container-article">
          <header className="page-head">
            <span className="eyebrow">For Facilities</span>
            <h1>貴施設のページ、もう公開しています。公式のお写真で、もっと魅力的に。</h1>
            <p className="lead">
              子育て家庭向けおでかけメディア「きょうのこ」では、おすすめの施設・店舗さまを
              <strong>無料でご紹介</strong>しています。今は一般的なお写真で掲載しておりますので、
              公式のお写真をいただければ<strong>無料で差し替え</strong>、より魅力が伝わるページにいたします。
            </p>
          </header>

          <article className="prose">
            <h2>ご担当者さまにしていただくこと</h2>
            <p>
              <strong>公式のお写真（プレス用で構いません・3〜5枚）と、最新の情報をお送りいただくだけ</strong>です。
              リンクの設置・掲示・SNS投稿など、貴施設側の作業は一切お願いしません。
            </p>

            <h2>きょうのこがすること（無料）</h2>
            <ul>
              <li>いただいたお写真・情報で、掲載ページを無料で差し替え・更新します</li>
              <li>SEO・メンテナンスは当方が継続して行います（貴施設の手間はかかりません）</li>
              <li>早めにご協力いただいた施設さまは、特集や上位表示で優先的にご紹介します</li>
            </ul>

            <h2>お写真の利用について（お約束）</h2>
            <p>いただいたお写真は、安心してご提供いただけるよう、以下の範囲に限定して利用します。</p>
            <ul>
              <li>
                <strong>利用範囲</strong>：きょうのこの貴施設掲載ページ、および当メディアのSNSでのご紹介に限定します
              </li>
              <li>
                <strong>クレジット</strong>：ご希望に応じて「©施設名」を明記します
              </li>
              <li>
                <strong>確認フロー</strong>：公開前に確認用URLを共有します。修正・取り下げは無料で承ります
              </li>
              <li>
                <strong>第三者提供なし</strong>：いただいた素材を他社・他媒体へ提供することはありません
              </li>
            </ul>

            <h2>お写真の送り方</h2>
            <p>下記のいずれでも結構です。ご都合のよい方法でお送りください。</p>
            <ul>
              <li>メールに直接添付</li>
              <li>ギガファイル便などのファイル転送サービスのURL</li>
              <li>Googleドライブ・Dropbox 等の共有URL</li>
            </ul>
            <p>
              <strong>推奨</strong>：横長（landscape）のお写真を3〜5枚。外観・店内／施設内・お子さまが楽しめる様子などが伝わるものだと、より魅力的なページになります。
            </p>

            <h2>ご連絡先</h2>
            <p>
              下記ボタンから、必要事項が入力された状態でメールが立ち上がります。お写真を添付して送信してください。
            </p>
            <p>
              <a
                className="btn-primary"
                href={`mailto:${MAIL}?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`}
                style={{
                  display: 'inline-block',
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-lg, 12px)',
                  background: 'var(--accent, #ff7a59)',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                メールでお写真・情報を送る →
              </a>
            </p>
            <p>
              うまく立ち上がらない場合は、<a href={`mailto:${MAIL}`}>{MAIL}</a> 宛に直接お送りください。
              掲載ページのURLが分かる場合は、あわせてお知らせいただけますとスムーズです。
            </p>

            <h2>よくあるご質問</h2>
            <h3>掲載は無料ですか？</h3>
            <p>はい。掲載・差し替え・更新はすべて無料です。費用は一切いただきません。</p>

            <h3>掲載をやめてほしい場合は？</h3>
            <p>
              <a href={`mailto:${MAIL}`}>{MAIL}</a>
              までご連絡ください。速やかに掲載ページの取り下げ・修正に対応いたします。
            </p>

            <h3>どんなメディアですか？</h3>
            <p>
              0〜6歳のお子さまを育てるご家庭向けに「今日どこへ行こう？何をしよう？」の意思決定を助ける
              おでかけ・育児メディアです。運営方針は
              <Link href="/editorial-policy">編集ポリシー</Link>、運営者情報は
              <Link href="/about">運営者情報</Link>をご覧ください。
            </p>

            <h3>取材つきのタイアップ記事もお願いできますか？</h3>
            <p>
              はい。運営者が実際にお子さま連れで訪問し、写真つきで記事化するタイアップも承っています。
              媒体データ・ご対応できるメニュー・PR表記の方針は
              <Link href="/business">タイアップ・広告掲載のご案内</Link> に公開しています。
              なお、このページでご案内している<strong>写真のご提供・情報更新は引き続き無料</strong>です。
            </p>
          </article>
        </div>
      </V2Frame>
    </>
  );
}
