import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '運営者情報 | きょうのこ',
  description:
    'きょうのこは、4歳の娘と2歳の息子と東京23区に暮らす30代後半の会社員「ながみー」が、平日夜と休日の実訪問をもとに運営する個人メディアです。サイトの方針、扱う情報・扱わない情報、編集体制、お問い合わせ先をまとめています。',
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
    url: 'https://kyounoko.jp/authors/nagamy',
    mainEntityOfPage: 'https://kyounoko.jp/about',
    image: 'https://kyounoko.jp/img/ogp-default.jpg',
    jobTitle: 'きょうのこ 編集長 / 運営者',
    description:
      '東京23区に住む30代後半の会社員。4歳の娘と2歳の息子を育てる父親として、平日夜と休日に都内駅前の個人店・公園を実訪問し、子連れ目線の一次情報を蓄積しています。',
    homeLocation: {
      '@type': 'Place',
      name: '東京23区',
      address: { '@type': 'PostalAddress', addressLocality: '東京都', addressCountry: 'JP' },
    },
    worksFor: {
      '@type': 'Organization',
      '@id': 'https://kyounoko.jp/#organization',
      name: 'きょうのこ',
      url: 'https://kyounoko.jp',
    },
    knowsAbout: [
      '駅周辺の子連れランチ',
      '東京23区の子連れスポット',
      '個人店の子連れ訪問記録',
      '幼児食・離乳食レシピ',
      '季節・行事の家庭での過ごし方',
    ],
    knowsLanguage: 'ja',
    email: 'mailto:service@kyounoko.jp',
  };
  const jsonLdAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://kyounoko.jp/about',
    url: 'https://kyounoko.jp/about',
    name: '運営者情報',
    description:
      'きょうのこの運営者「ながみー」と、サイトの方針・編集体制・扱う情報の範囲についてのページ。',
    inLanguage: 'ja',
    isPartOf: { '@id': 'https://kyounoko.jp/#website' },
    about: { '@id': 'https://kyounoko.jp/about#author' },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAboutPage) }}
      />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>運営者情報</span>
        </nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">About</span>
          <h1>運営者情報</h1>
          <p className="lead">
            きょうのこは、東京23区在住の30代後半の会社員「ながみー」が、4歳の娘と2歳の息子と一緒に平日夜・休日に都内の駅前個人店や公園を実訪問しながら作っている個人メディアです。
            運営者・編集方針・扱う情報の範囲・お問い合わせ窓口についてまとめています。
          </p>
        </header>

        <article className="prose">
          <h2>ながみーについて</h2>
          <div
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              margin: '24px 0',
            }}
          >
            <p
              style={{
                margin: '0 0 12px',
                fontFamily: 'var(--font-mincho), serif',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              ながみー（kyounoko-editor）｜きょうのこ 運営者
            </p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.9 }}>
              30代後半の会社員。妻と、4歳の娘・2歳の息子の4人で東京23区で暮らしています。
              平日の夜と休日に、子どもたちをベビーカーや抱っこ紐で連れて、都内の駅前にある個人店や公園を実際に訪問し、
              「子連れで本当に入れるか」「動線・段差・トイレ・離乳食対応・混雑」などを自分の目で確認して記録しています。
              本業の業界・会社名は公開していませんが、運営に利害関係のある業種ではありません。
              詳しいプロフィールは <Link href="/authors/nagamy">著者ページ</Link> にまとめています。
            </p>
          </div>

          <h3>立ち位置</h3>
          <ul>
            <li>監修者を抱える編集部ではなく、<strong>1人で運営している個人メディア</strong>です。</li>
            <li>記事の最終責任は運営者ながみー本人にあります。</li>
            <li>専門家による監修は<strong>現在準備中</strong>で、医療・健康・お金に関わる領域については後述の方針に沿って扱っています。</li>
          </ul>

          <h2>サイトの方針</h2>
          <p>
            きょうのこは「<strong>量より質</strong>」を重視します。
            子育て関連の検索結果には、行ったこともない店舗を口コミだけでまとめた記事や、根拠の薄い健康情報が氾濫しています。
            その隙間に、<strong>実際に子連れで訪問した一次情報</strong> と <strong>公式ソース由来の二次情報</strong> をきちんと切り分けて出すことに、個人メディアの価値があると考えています。
          </p>
          <ul>
            <li><strong>Experience（体験）</strong>: 訪問日付つきの実訪問レポートを核に据える</li>
            <li><strong>Expertise（専門性）</strong>: 子連れ外出と幼児食まわりに領域を絞り、専門外には踏み込まない</li>
            <li><strong>Authoritativeness（権威性）</strong>: 監修不在の現状を隠さず、公式ソースを必ず明示する</li>
            <li><strong>Trust（信頼性）</strong>: 利益相反・更新日・限界（不確実な点）を明文化する</li>
          </ul>

          <h2>どんな情報を出しているか</h2>
          <p>主に次の4分野を扱っています。</p>
          <ul>
            <li>
              <strong>駅 × 個人店マッピング</strong>：
              東京23区の駅周辺で、子連れランチに使える個人店を駅単位で整理しています（<Link href="/station">駅別ランチ</Link>）。
              一部のスポットには、ながみー本人が実訪問した <strong>KidReports（訪問日付つきメモ）</strong> を併記しています。
            </li>
            <li>
              <strong>子連れ向けレシピ</strong>：
              幼児食・取り分け・常備菜など、家庭で実際に作って2人の子ども(2歳と4歳)に出したものを中心に紹介します。
            </li>
            <li>
              <strong>おでかけスポット</strong>：
              公園・屋内施設・季節イベントなど、ベビーカー動線や授乳・おむつ対応の情報を含めて紹介します。
            </li>
            <li>
              <strong>季節記事</strong>：
              入園・運動会・梅雨・夏の暑さ対策など、その時期に必要になる情報を整理してまとめます。
            </li>
          </ul>

          <h2>どんな情報は出さないか</h2>
          <p>逆に、次のようなコンテンツは扱いません。</p>
          <ul>
            <li>
              <strong>食べログ等の口コミの引用・転載</strong>はしません。
              著作権上の問題に加え、Google AdSense のスパムポリシー（スケーリングされたコンテンツ）の観点からも、一次情報以外の口コミに頼った記事は作りません。
            </li>
            <li>
              <strong>医師にしかできない判断</strong>（症状の診断・受診の要否・服薬の指示など）は行いません。
              そのような領域については、必ず厚生労働省・各学会・主治医など公式ソースに案内します。
            </li>
            <li>
              <strong>薬機法に抵触する効果断定</strong>（「治る」「効く」「やせる」など）はしません。
              市販育児用品・食品・コスメについても、効能・効果を断定する表現は避けます。
            </li>
            <li>
              <strong>架空の監修者</strong>を装ったり、<strong>AIだけで量産</strong>した訪問レポートを掲載したりしません。
            </li>
          </ul>

          <h2>実訪問の記録について</h2>
          <p>
            きょうのこには <strong>KidReports（キッドレポート）</strong> という仕組みがあり、
            運営者ながみー本人が子連れで訪問した日付・気付き・ベビーカー動線・混雑感などを、
            通常の解説記事とは別レイヤーで保存しています。
            これは AdSense ポリシーが重視する「<strong>体験に基づくオリジナルなコンテンツ</strong>」を担保するためのものです。
          </p>
          <ul>
            <li>各レポートには <strong>訪問日付</strong> を含めるよう運用しています（記憶の補正・経年劣化の透明化のため）。</li>
            <li>訪問していないスポットを「訪問済み」として記載することはありません。Web調査ベースの情報は、見出しや本文で明確に切り分けます。</li>
            <li>店舗情報（営業時間・メニュー等）は変化が早いため、本文中に「<strong>来店前に公式情報を必ず確認してください</strong>」の注意書きを付けています。</li>
          </ul>

          <h2>お問い合わせ</h2>
          <p>
            記事内容の誤りのご指摘、取材・掲載・監修のご相談、その他のお問い合わせは、
            <Link href="/contact">お問い合わせページ</Link> または下記メール宛にお願いします。
          </p>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <h2>編集方針詳細</h2>
          <p>
            情報の集め方、正確性チェック、利益相反の開示、YMYL領域での扱いなど、運営の細かいルールは
            <Link href="/editorial-policy"> 編集方針ページ </Link>
            に独立して掲載しています。
          </p>

          <h2>監修について</h2>
          <p>
            きょうのこは現状、<strong>専門家による継続的な監修体制をまだ持っていません</strong>。
            その事実を隠さず明示するため、<Link href="/supervisors">監修者ページ</Link> を別途用意し、
            将来の監修者導入計画と、現状の代替策（公式ソースへの明示的リンク）を公開しています。
          </p>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
            最終更新：2026年5月18日
          </p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
