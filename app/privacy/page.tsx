import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'きょうのこのプライバシーポリシー。個人情報の取り扱い、Cookie、アクセス解析、広告配信に関する方針をお伝えします。',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb"><Link href="/">HOME</Link><span className="sep">/</span><span>プライバシーポリシー</span></nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">Privacy Policy</span>
          <h1>プライバシーポリシー</h1>
          <p className="lead">きょうのこ（以下、当サイト）は、お客様のプライバシー保護を重要視し、個人情報保護法およびその他の関連法令を遵守して個人情報を取り扱います。</p>
        </header>
        <article className="prose">
          <h2>1. 個人情報の取得</h2>
          <p>当サイトでは、お問い合わせフォーム、取材依頼、広告掲載のお申込み等を通じて、お客様の個人情報（氏名・メールアドレス・お問い合わせ内容等）を取得する場合があります。</p>

          <h2>2. 個人情報の利用目的</h2>
          <p>取得した個人情報は、以下の目的でのみ利用します。</p>
          <ul>
            <li>お問い合わせへの返信および対応</li>
            <li>サイト運営に必要な連絡</li>
            <li>利用規約違反への対応</li>
            <li>事前同意を得た方への新機能・キャンペーンのご案内</li>
          </ul>

          <h2>3. 第三者提供</h2>
          <p>法令に基づく場合、またはお客様の同意がある場合を除き、個人情報を第三者に提供することはありません。</p>

          <h2>4. Cookieの使用について</h2>
          <p>当サイトは利便性の向上および利用状況把握のためにCookieを使用しています。Cookieはお客様のコンピュータを識別しますが、個人を特定する情報は含みません。</p>

          <h2>5. アクセス解析ツールについて</h2>
          <p>当サイトでは、Google社が提供するアクセス解析ツール「<strong>Googleアナリティクス</strong>」およびMicrosoft社の「<strong>Microsoft Clarity</strong>」を使用しています。これらのツールはCookieを用いてトラフィックデータを収集しますが、個人を特定する情報は含まれません。</p>
          <ul>
            <li><a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer">Googleアナリティクス利用規約</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a></li>
          </ul>

          <h2>6. 広告配信について</h2>
          <p>当サイトはGoogle AdSenseを含む第三者配信の広告サービスを利用しています。広告配信事業者は、利用者の興味に応じた広告を表示するためにCookieを使用することがあります。</p>

          <h2>7. アフィリエイトプログラムへの参加</h2>
          <p>当サイトは、以下のアフィリエイトプログラムに参加し、商品・サービスを紹介することがあります。紹介リンクを経由して購入があった場合、当サイトに一定の収益が発生します。</p>
          <ul>
            <li>Amazonアソシエイト・プログラム</li>
            <li>楽天アフィリエイト</li>
            <li>A8.net、バリューコマース等</li>
          </ul>
          <p>アフィリエイトリンクを含む記事には、その旨を明示しています。</p>

          <h2>8. 免責事項</h2>
          <p>当サイトに掲載されている情報は、作成時点のものであり、正確性・最新性を完全に保証するものではありません。情報の利用により生じたいかなる損害についても、当サイトは責任を負いません。医療・健康・発達に関する情報は、個別判断には必ず医師や専門家にご相談ください。</p>

          <h2>9. 著作権について</h2>
          <p>当サイトに掲載されている記事・画像等の著作権は、きょうのこ運営者または正当な権利者に帰属します。無断転載・無断使用を禁じます。</p>

          <h2>10. プライバシーポリシーの変更</h2>
          <p>本ポリシーは法令変更等により予告なく変更される場合があります。重要な変更がある場合は当サイト上でお知らせします。</p>

          <h2>11. お問い合わせ窓口</h2>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
            <strong>制定日</strong>：2026年4月17日<br/>
            <strong>最終改定日</strong>：2026年4月17日
          </p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
