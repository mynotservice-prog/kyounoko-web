import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '運営者情報',
  description: 'きょうのこの運営者「ながみー」の自己紹介、運営方針、情報の選定基準、執筆・編集ポリシー、お問い合わせ窓口をまとめています。体験に根ざした一次情報と、専門家確認を前提とした信頼できるコンテンツ作りをお約束します。',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '運営者情報', item: 'https://kyounoko.jp/about' },
    ],
  };
  const jsonLdPerson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://kyounoko.jp/about#author',
    name: 'ながみー',
    alternateName: 'kyounoko-editor',
    url: 'https://kyounoko.jp/about',
    image: 'https://kyounoko.jp/img/ogp-default.jpg',
    jobTitle: 'きょうのこ 編集長',
    description: '0〜6歳の子を育てる共働きパパ。きょうのこ編集長として、家族の日常を3分で決めるための実用的な子育て情報を発信。実体験と一次情報に基づいた信頼性の高いコンテンツを心がけています。',
    worksFor: {
      '@type': 'Organization',
      '@id': 'https://kyounoko.jp/#organization',
      name: 'きょうのこ',
      url: 'https://kyounoko.jp',
    },
    knowsAbout: [
      '子育て', '幼児食', '共働き育児', '寝かしつけ', '時短家事',
      'おでかけ計画', '家遊び', '知育', 'ベビー用品選び',
      '東京23区子連れスポット', 'Webメディア運営',
    ],
    knowsLanguage: 'ja',
  };
  const jsonLdAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://kyounoko.jp/about',
    url: 'https://kyounoko.jp/about',
    name: '運営者情報',
    description: 'きょうのこの運営者・編集方針・情報の選定基準・問い合わせ窓口について',
    inLanguage: 'ja',
    isPartOf: { '@id': 'https://kyounoko.jp/#website' },
    about: { '@id': 'https://kyounoko.jp/about#author' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAboutPage) }} />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link><span className="sep">/</span><span>運営者情報</span>
        </nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">About</span>
          <h1>運営者情報</h1>
          <p className="lead">きょうのこの運営者、運営方針、情報の選定基準、問い合わせ窓口についてお伝えします。読者の毎日を軽くするメディアとして、実体験と一次情報に基づいた信頼できる内容を届けることを第一に考えています。</p>
        </header>

        <article className="prose">
          <h2>このサイトについて</h2>
          <p><strong>きょうのこ</strong>は、0〜6歳の子がいる家庭の「今日どうする？」を3分で決めるための情報サイトです。天気・子どもの年齢・時間帯・予算といった条件から、今日の過ごし方の答えを絞り込んでお届けします。</p>
          <p>情報量を競うのではなく、<strong>「今日これで十分」と思える選択肢をひとつに絞る</strong>こと。迷って疲れる時間を、子どもと向き合う時間に変えることが、当サイトの存在理由です。</p>

          <h2>運営者プロフィール</h2>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24, margin: '24px 0' }}>
            <p style={{ margin: '0 0 12px', fontFamily: 'var(--font-mincho), serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>ながみー｜きょうのこ編集長</p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.9 }}>
              共働き家庭で0〜6歳の子どもを育てながら、Webメディア・ブログを複数運営してきた編集者。日々の意思決定の多さに消耗した経験から、「選択肢を絞り、今日に集中できる」メディアを作りたいという想いで<strong>きょうのこ</strong>を立ち上げました。平日は仕事と保育園送迎、休日は家族と過ごしながら、実際に試したあそび・ごはん・おでかけ先を素材に記事を書いています。
            </p>
          </div>

          <h3>Experience（体験）</h3>
          <ul>
            <li>自身が0〜6歳の子を育てる<strong>現役の親</strong>として、日々の育児に取り組んでいます。</li>
            <li>記事で紹介するあそび・ごはん・おもちゃ・おでかけ先は、原則として<strong>編集部が実際に試したもの</strong>を掲載しています。</li>
            <li>試した結果の「よかった点」だけでなく、<strong>うまくいかなかった点・向き不向き</strong>も併記します。</li>
          </ul>

          <h3>Expertise（専門性）</h3>
          <ul>
            <li>複数の子育て・ライフスタイル系 Web メディアの編集・運営に携わってきた経験があります。</li>
            <li>SEO・UX・情報設計の知見を活かし、<strong>「迷う前に答えが見える」情報構造</strong>を設計しています。</li>
            <li>医療・健康・発達・法律・金融などの個別判断が必要な分野では、必ず<strong>一次情報（厚生労働省・消費者庁・各学会・メーカー公式等）</strong>を確認のうえで執筆します。</li>
          </ul>

          <h3>Authoritativeness（権威性）</h3>
          <ul>
            <li>執筆者は<strong>実名またはペンネーム</strong>で明示します。架空の「監修者」「専門家」を装うことはしません。</li>
            <li>医療・発達等の記事は、必要に応じて小児科医・保健師・管理栄養士等、<strong>実在する専門家の確認</strong>を経た上で公開します。監修がある場合は、記事内に<strong>監修者氏名・所属・資格</strong>を明記します。</li>
            <li>当サイトは、参加アフィリエイトプログラム・広告配信サービスを明示し、スポンサーによる記事の内容干渉を受けません。</li>
          </ul>

          <h3>Trust（信頼性）</h3>
          <ul>
            <li><strong>公開日・最終更新日</strong>を記事冒頭に明示し、情報が古くなった場合は速やかに更新します。</li>
            <li>アフィリエイトリンクやタイアップ記事には、<strong>「PR」「広告」</strong>等のラベルを景品表示法に従って表示します。</li>
            <li>読者からの指摘・訂正依頼は、<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a> または<Link href="/contact">お問い合わせフォーム</Link>にて受け付けています。</li>
          </ul>

          <h2>サイト情報</h2>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24, margin: '24px 0' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <tbody>
                <tr><td style={{ padding: '10px 0', fontWeight: 600, width: 110 }}>サイト名</td><td>きょうのこ</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>URL</td><td><a href="https://kyounoko.jp">https://kyounoko.jp</a></td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>運営者</td><td>ながみー</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>設立</td><td>2026年</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>所在地</td><td>お問い合わせフォームよりご確認ください</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>連絡先</td><td><a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></td></tr>
              </tbody>
            </table>
          </div>

          <h2>運営方針</h2>

          <h3>情報の選定基準</h3>
          <ul>
            <li><strong>一次情報を優先</strong>します。公的機関（厚生労働省・消費者庁・自治体等）、学会、メーカー公式資料を基礎にしています。</li>
            <li><strong>体験ベース</strong>で選びます。編集部が実際に使った・食べた・行った・試したものを中心に掲載します。</li>
            <li><strong>販促ありき</strong>では選びません。アフィリエイト報酬や広告単価の高さを掲載理由にしません。</li>
            <li><strong>安全性に疑義がある情報</strong>（医療・食事制限・発達など）は、必要に応じて専門家に確認のうえ掲載します。</li>
          </ul>

          <h3>執筆・編集フロー</h3>
          <ol>
            <li>編集部が体験・一次情報の収集を行う</li>
            <li>事実確認（ダブルチェック）を行う</li>
            <li>必要に応じて専門家に確認を依頼</li>
            <li>公開後も新情報があれば随時アップデート</li>
          </ol>

          <h3>情報の鮮度について</h3>
          <p>記事冒頭に<strong>公開日</strong>と<strong>最終更新日</strong>を明記しています。情報が古くなっている・事実と異なる等のご指摘をいただいた場合は、速やかに内容を確認し、必要な更新を行います。</p>

          <h3>広告・アフィリエイトについて</h3>
          <p>本サイトは、Google AdSense 等の第三者配信広告サービス、および Amazon アソシエイト、楽天アフィリエイト、A8.net 等のアフィリエイトプログラムを利用しており、その収益によって運営されています。紹介する商品・サービスは、編集部が<strong>実際に使ったもの</strong>、または<strong>信頼できる一次情報に基づくもの</strong>のみを掲載します。</p>
          <p>アフィリエイトリンクまたはタイアップ記事を含むコンテンツには、景品表示法およびステルスマーケティング規制に基づき、「PR」「広告」等の表記を明示します。広告掲載によって記事の内容が歪められることはありません。</p>

          <h2>読者の方へのお願い</h2>
          <p>きょうのこの記事は、子育てに関する情報の<strong>参考</strong>としてご活用ください。お子さんの発達・体調・食事・教育・安全に関わる個別の判断は、必ず<strong>専門家（小児科医・保健師・管理栄養士等）または公的機関の最新情報</strong>をご確認のうえ、保護者の責任においてご判断ください。</p>

          <h2>お問い合わせ</h2>
          <p>取材依頼・広告掲載のご相談・記事内容に関するご指摘・その他のお問い合わせは、下記窓口までお願いします。</p>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>最終更新：2026年4月19日</p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
