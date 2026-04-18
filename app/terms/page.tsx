import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '利用規約',
  description: 'きょうのこの利用規約。サービス利用にあたっての条件と禁止事項をお伝えします。',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb"><Link href="/">HOME</Link><span className="sep">/</span><span>利用規約</span></nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">Terms of Use</span>
          <h1>利用規約</h1>
          <p className="lead">この利用規約（以下「本規約」）は、「きょうのこ」（以下「当サイト」）が提供するサービスの利用条件を定めるものです。ユーザーは本規約に同意した上で当サイトを利用するものとします。</p>
        </header>
        <article className="prose">
          <h2>第1条（適用）</h2>
          <ol>
            <li>本規約は、ユーザーと当サイトとの間のサービス利用に関わる一切の関係に適用されます。</li>
            <li>当サイトは本規約のほか、個別に定める規定等を定めることがあり、これらは本規約の一部を構成します。</li>
          </ol>

          <h2>第2条（禁止事項）</h2>
          <p>ユーザーは、サービスの利用にあたり以下の行為をしてはなりません。</p>
          <ol>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当サイトのサーバーまたはネットワークの機能を破壊・妨害する行為</li>
            <li>当サイトのサービス運営を妨害する行為</li>
            <li>他のユーザーに関する個人情報を収集・蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当サイトのサービスに関連して反社会的勢力に対して利益を供与する行為</li>
            <li>当サイトに掲載されるコンテンツを無断で転載・複製する行為</li>
            <li>その他、当サイトが不適切と判断する行為</li>
          </ol>

          <h2>第3条（サービスの提供停止等）</h2>
          <p>当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前通知することなくサービスの全部または一部の提供を停止または中断できます。</p>
          <ol>
            <li>サービスのシステム保守・更新を行う場合</li>
            <li>地震・落雷・火災・停電・天災などによりサービス提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当サイトがサービス提供が困難と判断した場合</li>
          </ol>

          <h2>第4条（免責事項）</h2>
          <ol>
            <li>当サイトの情報の正確性・最新性・有用性について、当サイトは一切の保証をしません。</li>
            <li>当サイトの利用により発生したユーザーの損害について、当サイトは責任を負いません。ただし、当サイトに故意または重過失がある場合はこの限りではありません。</li>
            <li>当サイトから外部サイトへのリンクを提供する場合がありますが、リンク先の内容について当サイトは責任を負いません。</li>
            <li>医療・健康・発達に関する情報について個別判断が必要な場合は、必ず医師や専門家にご相談ください。</li>
          </ol>

          <h2>第5条（サービス内容の変更）</h2>
          <p>当サイトは、ユーザーに通知することなくサービスの内容を変更・追加・削除できるものとし、ユーザーはこれを承諾します。</p>

          <h2>第6条（利用規約の変更）</h2>
          <p>当サイトは、必要と判断した場合に本規約を変更できます。変更後の利用規約は、当サイト上に掲載された時点から効力を生じるものとします。</p>

          <h2>第7条（権利義務の譲渡の禁止）</h2>
          <p>ユーザーは、当サイトの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡・担保設定できません。</p>

          <h2>第8条（著作権）</h2>
          <p>当サイトに掲載されているコンテンツ（記事・画像・イラスト・構成・デザイン等）の著作権は、当サイト運営者または正当な権利者に帰属します。無断転載・複製・改変を禁じます。</p>

          <h2>第9条（準拠法・裁判管轄）</h2>
          <ol>
            <li>本規約の解釈には日本法を準拠法とします。</li>
            <li>サービスに関して紛争が生じた場合、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>

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
