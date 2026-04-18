import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'きょうのこのプライバシーポリシー。個人情報の取り扱い、Cookie、アクセス解析、第三者配信広告（Google AdSense）、アフィリエイトプログラムに関する方針をお伝えします。',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'プライバシーポリシー', item: 'https://kyounoko.jp/privacy' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず"><Link href="/">HOME</Link><span className="sep">/</span><span>プライバシーポリシー</span></nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">Privacy Policy</span>
          <h1>プライバシーポリシー</h1>
          <p className="lead">きょうのこ（以下「当サイト」）は、ご利用いただく皆さまのプライバシー保護を重要視し、個人情報の保護に関する法律（個人情報保護法）およびその他の関連法令・ガイドラインを遵守して運営を行います。本ポリシーでは、当サイトがどのような情報を取得し、どのような目的で利用・管理するかを明示します。</p>
        </header>
        <article className="prose">
          <h2>1. 事業者情報</h2>
          <ul>
            <li>サイト名：きょうのこ</li>
            <li>URL：<a href="https://kyounoko.jp">https://kyounoko.jp</a></li>
            <li>運営者：ながみー</li>
            <li>連絡先：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
          </ul>

          <h2>2. 個人情報の取得</h2>
          <p>当サイトでは、お問い合わせフォーム、取材依頼、広告掲載のお申込み等を通じて、お客様の氏名・メールアドレス・お問い合わせ内容等の個人情報を取得する場合があります。また、サイトの閲覧に際しては、Cookie・端末情報・IPアドレス・リファラ・ユーザーエージェント等の情報を自動的に取得します。</p>

          <h2>3. 個人情報の利用目的</h2>
          <p>取得した個人情報は、次の目的の範囲でのみ利用します。</p>
          <ul>
            <li>お問い合わせへの返信および対応</li>
            <li>サイト運営に必要な連絡</li>
            <li>利用規約違反への対応</li>
            <li>サイトの品質改善・新機能の検討のための統計的分析</li>
            <li>事前同意を得た方への新機能・キャンペーンのご案内</li>
          </ul>
          <p>利用目的の範囲を超えて個人情報を扱う必要が生じた場合は、あらためてご本人の同意をいただいたうえで取り扱います。</p>

          <h2>4. 第三者への提供</h2>
          <p>法令に基づく場合、またはご本人の同意がある場合を除き、取得した個人情報を第三者に提供することはありません。ただし、業務委託先（サーバー事業者、メール配信事業者等）に対し、利用目的達成に必要な範囲で情報を取り扱わせる場合があります。</p>

          <h2>5. Cookie（クッキー）の使用について</h2>
          <p>当サイトでは、利便性の向上およびサイト改善のためにCookieおよびこれに類する技術（Webビーコン、ローカルストレージ等）を使用しています。Cookie自体はお客様を個人として特定する情報を含みませんが、Cookieの受け入れはブラウザの設定で拒否・削除することができます。Cookieを無効化すると、当サイトの一部機能が正しく動作しない場合があります。</p>

          <h2>6. アクセス解析ツールについて</h2>
          <p>当サイトでは、サイトの利用状況を把握しコンテンツ改善に活かすため、以下のアクセス解析ツールを利用しています。いずれもCookieを用いてトラフィックデータを収集しますが、個人を特定する情報は含まれません。</p>
          <h3>Googleアナリティクス（GA4）</h3>
          <p>Google LLC が提供するアクセス解析ツールで、ページビュー・参照元・閲覧端末等の情報を収集します。収集されたデータはGoogle社のプライバシーポリシーに基づき管理されます。利用を希望されない場合は、<a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">Googleアナリティクス オプトアウト アドオン</a>を利用することで無効化できます。</p>
          <h3>Microsoft Clarity</h3>
          <p>Microsoft Corporation が提供する行動分析ツールで、クリック・スクロール・ページ滞在時間などをヒートマップおよびセッションリプレイとして可視化します。入力フォームのテキスト等はマスクされ、個人を特定する情報は収集しません。詳しくは<a href="https://privacy.microsoft.com/ja-jp/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft プライバシー ステートメント</a>をご確認ください。</p>
          <ul>
            <li><a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer">Googleアナリティクス利用規約</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a></li>
          </ul>

          <h2>7. 第三者配信の広告サービスについて</h2>
          <p>当サイトは、Google LLC が提供する広告配信サービス「<strong>Google AdSense</strong>」をはじめとする第三者配信事業者を利用する場合があります。これらの事業者は、ユーザーの興味に応じた広告を表示するために、当サイトや他サイトへのアクセス情報（Cookie、IPアドレス、閲覧履歴等）を利用することがあります。</p>
          <ul>
            <li>Google による Cookie の使用については、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer">Google のポリシーと規約</a>をご参照ください。</li>
            <li>パーソナライズド広告を無効化したい場合は、<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google 広告設定（https://adssettings.google.com/）</a>から設定を変更できます。</li>
            <li>第三者配信事業者によるCookie使用のオプトアウトは、<a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">YourAdChoices</a> または <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a> のサイトからも行えます。</li>
          </ul>
          <p>広告配信事業者への個人情報提供について同意されない場合は、上記のオプトアウト手段をご利用ください。</p>

          <h2>8. アフィリエイトプログラムへの参加</h2>
          <p>当サイトは、以下のアフィリエイトプログラムに参加し、商品・サービスを紹介することがあります。紹介リンクを経由して商品が購入された場合、当サイトに一定の紹介料が発生します。</p>
          <ul>
            <li>Amazonアソシエイト・プログラム</li>
            <li>楽天アフィリエイト</li>
            <li>A8.net、バリューコマース、もしもアフィリエイト 等</li>
          </ul>
          <p>アフィリエイトリンクを含む記事には、景品表示法に基づき「PR」「広告」等の表記を明示します。紹介する商品・サービスは、当サイトが実際に利用したもの、または信頼できる一次情報に基づいて選定しています。</p>

          <h2>9. 免責事項</h2>
          <p>当サイトに掲載されている情報は、作成時点のものであり、正確性・最新性・有用性を完全に保証するものではありません。情報の利用により生じたいかなる損害についても、当サイトは責任を負いません。医療・健康・発達・食事・法律等、個別判断が必要な事柄については、必ず医師・保健師・管理栄養士・弁護士等の専門家、または公的機関の最新情報をご確認ください。</p>

          <h2>10. 著作権について</h2>
          <p>当サイトに掲載されている記事・画像・イラスト・構成・デザイン等の著作権は、当サイト運営者または正当な権利者に帰属します。引用の範囲を超える無断転載・複製・改変は禁じます。</p>

          <h2>11. 開示・訂正・削除のご請求</h2>
          <p>ご本人から個人情報の開示・訂正・利用停止・削除等のご請求があった場合は、法令に基づき速やかに対応します。下記お問い合わせ窓口までご連絡ください。</p>

          <h2>12. プライバシーポリシーの変更</h2>
          <p>本ポリシーは、法令変更やサービス内容の変更等により予告なく変更される場合があります。重要な変更がある場合は、当サイト上でお知らせします。変更後のポリシーは、当サイトに掲載された時点から効力を生じるものとします。</p>

          <h2>13. お問い合わせ窓口</h2>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
            <strong>制定日</strong>：2026年4月17日<br/>
            <strong>最終改定日</strong>：2026年4月19日
          </p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
