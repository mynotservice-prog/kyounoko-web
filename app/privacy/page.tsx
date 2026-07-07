import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';

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
      <V2Frame header="sub" active="home">
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
            <li>運営者：ながみー（個人事業主）</li>
            <li>連絡先：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
          </ul>

          <h2>2. 取得する情報</h2>
          <p>当サイトでは、次の情報を取得する場合があります。</p>
          <ul>
            <li><strong>お問い合わせ等でご提供いただく情報</strong>：お問い合わせフォーム、取材依頼、広告掲載のお申込み等を通じてご提供いただく氏名・メールアドレス・お問い合わせ内容等</li>
            <li><strong>口コミ・写真の投稿でご提供いただく情報</strong>：ニックネーム、お子さまの年齢層、投稿本文、写真等（詳細は第10条をご覧ください）</li>
            <li><strong>自動的に取得する情報</strong>：Cookie等の識別子、端末情報、IPアドレス、リファラ、ユーザーエージェント、閲覧・操作の履歴等</li>
          </ul>

          <h2>3. 利用目的</h2>
          <p>取得した情報は、次の目的の範囲でのみ利用します。</p>
          <ul>
            <li>お問い合わせへの返信および対応</li>
            <li>口コミ・写真投稿の確認・掲載・管理</li>
            <li>サイト運営に必要な連絡</li>
            <li>利用規約違反、不正投稿・スパム等への対応</li>
            <li>サイトの品質改善・新機能の検討のための統計的分析</li>
            <li>事前同意を得た方への新機能・キャンペーンのご案内</li>
          </ul>
          <p>利用目的の範囲を超えて個人情報を扱う必要が生じた場合は、あらためてご本人の同意をいただいたうえで取り扱います。</p>

          <h2>4. 第三者への提供・委託</h2>
          <p>法令に基づく場合、またはご本人の同意がある場合を除き、取得した個人情報を第三者に提供することはありません。ただし、利用目的の達成に必要な範囲で、次のような業務委託先（クラウドサービス事業者等）に情報の取り扱いを委託する場合があります。委託先には適切な安全管理を求めます。</p>
          <ul>
            <li>ホスティング・コンテンツ配信：Vercel Inc.、Cloudflare, Inc.</li>
            <li>コンテンツ・投稿データの管理：クラウドCMS等のデータ管理サービス</li>
          </ul>
          <p>これらの委託先のサーバーは国外（主に米国）に所在する場合があります。委託先は各国の法制度のもとで適切に個人情報を管理しています。</p>

          <h2>5. 安全管理措置</h2>
          <p>当サイトは、取り扱う個人情報の漏えい・滅失・毀損の防止のため、次の安全管理措置を講じます。</p>
          <ul>
            <li>個人情報を取り扱う管理画面へのアクセス制限・認証の実施</li>
            <li>通信のTLS（SSL）暗号化</li>
            <li>投稿写真の位置情報（EXIF）の自動削除処理</li>
            <li>取得する情報を必要最小限にとどめる設計</li>
            <li>外部サービスのアクセス権限・認証情報の適切な管理</li>
          </ul>

          <h2>6. Cookie（クッキー）の使用について</h2>
          <p>当サイトでは、利便性の向上およびサイト改善のためにCookieおよびこれに類する技術（Webビーコン、ローカルストレージ等）を使用しています。Cookie自体はお客様を個人として特定する情報を含みませんが、Cookieの受け入れはブラウザの設定で拒否・削除することができます。Cookieを無効化すると、当サイトの一部機能が正しく動作しない場合があります。</p>

          <h2>7. アクセス解析ツールについて</h2>
          <p>当サイトでは、サイトの利用状況を把握しコンテンツ改善に活かすため、以下のアクセス解析ツールを利用しています。いずれもCookieを用いてトラフィックデータを収集しますが、個人を特定する情報は含まれません。</p>
          <h3>Googleアナリティクス（GA4）</h3>
          <p>Google LLC が提供するアクセス解析ツールで、ページビュー・参照元・閲覧端末等の情報を収集します。収集されたデータはGoogle社のプライバシーポリシーに基づき管理されます。利用を希望されない場合は、<a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">Googleアナリティクス オプトアウト アドオン</a>を利用することで無効化できます。</p>
          <h3>Microsoft Clarity</h3>
          <p>Microsoft Corporation が提供する行動分析ツールで、クリック・スクロール・ページ滞在時間などをヒートマップおよびセッションリプレイとして可視化します。入力フォームのテキスト等はマスクされ、個人を特定する情報は収集しません。詳しくは<a href="https://privacy.microsoft.com/ja-jp/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft プライバシー ステートメント</a>をご確認ください。</p>
          <ul>
            <li><a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer">Googleアナリティクス利用規約</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a></li>
          </ul>
          <p>利用者の端末から外部事業者へ送信される情報の詳細は、電気通信事業法の外部送信規律に基づき<Link href="/external-transmission">外部送信ポリシー</Link>で公表しています。</p>

          <h2>8. スパム対策ツール（Cloudflare Turnstile）について</h2>
          <p>当サイトの口コミ投稿フォーム等では、ボットによる不正な投稿を防止するため、Cloudflare, Inc. が提供する認証サービス「Cloudflare Turnstile」を利用しています。フォームの表示・送信の際に、IPアドレス・ブラウザ環境等の情報がボット判定のためにCloudflare社へ送信されます。詳しくは<a href="https://www.cloudflare.com/ja-jp/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare プライバシーポリシー</a>をご確認ください。</p>

          <h2>9. 第三者配信の広告サービスについて</h2>
          <p>当サイトは、Google LLC が提供する広告配信サービス「<strong>Google AdSense</strong>」をはじめとする第三者配信事業者を利用する場合があります。これらの事業者は、ユーザーの興味に応じた広告を表示するために、当サイトや他サイトへのアクセス情報（Cookie、IPアドレス、閲覧履歴等）を利用することがあります。</p>
          <ul>
            <li>Google による Cookie の使用については、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer">Google のポリシーと規約</a>をご参照ください。</li>
            <li>パーソナライズド広告を無効化したい場合は、<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google 広告設定（https://adssettings.google.com/）</a>から設定を変更できます。</li>
            <li>第三者配信事業者によるCookie使用のオプトアウトは、<a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">YourAdChoices</a> または <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a> のサイトからも行えます。</li>
          </ul>
          <p>広告配信事業者への個人情報提供について同意されない場合は、上記のオプトアウト手段をご利用ください。</p>

          <h2>10. 口コミ・写真の投稿でお預かりする情報</h2>
          <p>口コミ投稿機能では、次の情報を取得します。</p>
          <ul>
            <li>評価・投稿本文・ニックネーム・お子さまの年齢層</li>
            <li>添付写真（サーバー側で位置情報等のEXIFデータを自動削除したうえで保存します）</li>
            <li>不正防止のためのIPアドレス等の技術情報</li>
          </ul>
          <p>投稿内容は当サイトによる確認のうえで公開されます。ニックネームは本名以外の使用を推奨します。お子さまやほかの方の顔が判別できる写真については、掲載を見合わせ、または加工のうえ掲載する場合があります。投稿の削除をご希望の場合は、お問い合わせ窓口までご連絡ください。投稿に関する規約は<Link href="/terms">利用規約</Link>をご確認ください。</p>

          <h2>11. LINE・SNS等の外部サービスとの連携</h2>
          <p>当サイトには、LINE公式アカウントの友だち追加ボタンや、Instagram等のSNSへのリンクを設置する場合があります。これらのボタン・リンクを利用して各サービスに移動・登録した場合、各サービスの事業者（LINEヤフー株式会社、Meta Platforms, Inc. 等）が独自に利用者の情報を取得します。取得される情報や取り扱いは各社のプライバシーポリシーをご確認ください。友だち追加・フォローは任意であり、解除は各サービス上でいつでも行えます。</p>

          <h2>12. アフィリエイトプログラムへの参加</h2>
          <p>当サイトは、以下のアフィリエイトプログラムに参加し、商品・サービスを紹介することがあります。紹介リンクを経由して商品が購入された場合、当サイトに一定の紹介料が発生します。</p>
          <ul>
            <li>Amazonアソシエイト・プログラム</li>
            <li>楽天アフィリエイト</li>
            <li>A8.net、バリューコマース、もしもアフィリエイト 等</li>
          </ul>
          <p>アフィリエイトリンクを含む記事には、景品表示法に基づき「PR」「広告」等の表記を明示します。紹介する商品・サービスは、当サイトが実際に利用したもの、または信頼できる一次情報に基づいて選定しています。</p>

          <h2>13. 免責事項</h2>
          <p>当サイトに掲載されている情報は、作成時点のものであり、正確性・最新性・有用性を完全に保証するものではありません。情報の利用により生じたいかなる損害についても、当サイトは責任を負いません。医療・健康・発達・食事・法律等、個別判断が必要な事柄については、必ず医師・保健師・管理栄養士・弁護士等の専門家、または公的機関の最新情報をご確認ください。</p>

          <h2>14. 著作権について</h2>
          <p>当サイトに掲載されている記事・画像・イラスト・構成・デザイン等の著作権は、当サイト運営者または正当な権利者に帰属します。引用の範囲を超える無断転載・複製・改変は禁じます。</p>

          <h2>15. 開示・訂正・利用停止・削除のご請求</h2>
          <p>ご本人（またはその代理人）から、当サイトが保有する個人情報について、開示・訂正・追加・削除・利用停止・第三者提供の停止のご請求があった場合は、個人情報保護法に基づき対応します。</p>
          <ul>
            <li><strong>請求方法</strong>：下記お問い合わせ窓口へメールでご連絡ください。</li>
            <li><strong>本人確認</strong>：なりすましを防ぐため、投稿時・お問い合わせ時にご利用のメールアドレスからのご連絡等により本人確認を行います。</li>
            <li><strong>手数料</strong>：無料です。</li>
            <li><strong>対応期間</strong>：原則として2週間以内に対応状況をご連絡します。</li>
          </ul>

          <h2>16. プライバシーポリシーの変更</h2>
          <p>本ポリシーは、法令変更やサービス内容の変更等により変更される場合があります。重要な変更がある場合は、当サイト上でお知らせします。変更後のポリシーは、当サイトに掲載された時点から効力を生じるものとします。</p>

          <h2>17. お問い合わせ窓口</h2>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
            <strong>制定日</strong>：2026年4月17日<br/>
            <strong>最終改定日</strong>：2026年7月3日（安全管理措置・口コミ投稿・Cloudflare Turnstile・LINE等の外部サービス連携・外部送信ポリシー・開示等請求手続きに関する記載を追加）<br/>
            <strong>改定履歴</strong>：2026年4月19日 改定
          </p>
        </article>
      </div>
      </V2Frame>

    </>
  );
}
