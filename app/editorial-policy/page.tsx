import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '編集方針 | きょうのこ',
  description:
    'きょうのこの編集方針。情報の集め方、正確性チェックの基準、監修ポリシー、更新ルール、利益相反の開示、YMYL領域での扱い、訂正の受付までを明文化しています。',
  alternates: { canonical: '/editorial-policy' },
};

export default function EditorialPolicyPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '編集方針', item: 'https://kyounoko.jp/editorial-policy' },
    ],
  };
  const jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://kyounoko.jp/editorial-policy',
    url: 'https://kyounoko.jp/editorial-policy',
    name: '編集方針',
    description: 'きょうのこにおける情報収集・事実確認・更新・利益相反開示の方針。',
    inLanguage: 'ja',
    isPartOf: { '@id': 'https://kyounoko.jp/#website' },
    author: { '@id': 'https://kyounoko.jp/about#author' },
    publisher: { '@id': 'https://kyounoko.jp/#organization' },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
      />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>編集方針</span>
        </nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">Editorial Policy</span>
          <h1>編集方針</h1>
          <p className="lead">
            きょうのこの情報の集め方、正確性チェック、監修ポリシー、更新ルール、利益相反の開示、YMYL領域での扱い方を明文化しています。
            個人メディアとしての限界も含め、運営者ながみーが守っているルールをそのまま公開します。
          </p>
        </header>

        <article className="prose">
          <h2>1. 情報の集め方</h2>
          <p>
            きょうのこの記事は、<strong>Web調査による公開情報</strong> と <strong>運営者ながみーの実訪問</strong> の二段構えで作っています。
            どちらか片方だけに依存せず、両方を併用することで、机上だけでは見えない子連れ目線の情報を補強します。
          </p>
          <h3>1-1. Web調査で使う一次情報</h3>
          <ul>
            <li>店舗・施設の<strong>公式サイト</strong>、公式SNS、公式メニュー表</li>
            <li>新聞・出版社・自治体・大学などの<strong>取材記事・プレスリリース</strong></li>
            <li>厚生労働省・消費者庁・自治体・各学会などの<strong>政府・公的データ</strong></li>
            <li>メーカー公式の<strong>製品情報・栄養成分表示・SDS</strong></li>
          </ul>
          <h3>1-2. 実訪問で集める一次情報</h3>
          <ul>
            <li>運営者本人が子連れで訪問した日付つきの<strong>体験メモ（KidReports）</strong></li>
            <li>ベビーカー動線・段差・トイレ・授乳・離乳食対応など、子連れに固有の観察事項</li>
            <li>混雑感・店員の対応・キッズメニュー・取り分け可否などの主観的な気付き</li>
          </ul>
          <p>
            実訪問していないスポットを訪問済みのように装ったり、訪問日付を捏造したりすることは絶対にしません。
            Web調査ベースのみで書いた解説部分と、実訪問ベースの記録は、本文中でレイヤーを明確に分けます。
          </p>

          <h2>2. 情報の正確性チェック</h2>
          <h3>2-1. 公式情報源を最優先</h3>
          <p>
            数値・事実・規制に関わる記述は、<strong>必ず公式情報源</strong>（公式サイト・政府データ・学会等）にあたって確認します。
            個人ブログや匿名掲示板を出典として用いることはありません。
          </p>
          <h3>2-2. 食べログ等の口コミは引用しない</h3>
          <p>
            きょうのこは、食べログ・Googleマップ・Retty・Instagram 等の<strong>第三者の口コミテキストの引用・転載・要約は行いません</strong>。
            理由は以下の3点です。
          </p>
          <ul>
            <li>口コミ本文の<strong>著作権</strong>は投稿者と各プラットフォームに帰属します。</li>
            <li>Google AdSense のスパムポリシー（スケーリングされたコンテンツ）の観点から、口コミ寄せ集め記事は健全なメディア運営に反します。</li>
            <li>口コミは個人の主観・体調・タイミングに依存し、子連れ視点での再現性が低いものが多いです。</li>
          </ul>
          <p>
            評価や評判は、必要に応じて運営者自身の<strong>実訪問の所感</strong>として記述します。
          </p>
          <h3>2-3. 限界の明示</h3>
          <p>
            店舗の営業時間・メニュー・価格は変動が早いため、本文中に「<strong>来店前に公式情報を必ずご確認ください</strong>」の注意書きを必ず添えます。
            また、季節・天候・混雑によって体験が大きく変わるテーマでは、その旨を明記します。
          </p>

          <h2>3. 監修ポリシー</h2>
          <p>
            きょうのこは、<strong>現状、専門家による継続的な監修体制を持っていません</strong>。
            この点を隠さず明示するために、<Link href="/supervisors">監修者ページ</Link> を独立して用意しています。
          </p>
          <ul>
            <li>専門医療情報・発達・行政手続きなど、判断に専門性を要する記述は、<strong>公式ソースへの直接リンク</strong>に置き換え、運営者が独自判断を述べないようにします。</li>
            <li>離乳食・アレルギー・日焼け対策などのYMYL寄りテーマでは、本文中に「<strong>かかりつけの小児科医・管理栄養士にご相談ください</strong>」の免責を必ず付けます。</li>
            <li>将来的に、小児科医・管理栄養士・保育士などの監修者を導入する予定です。導入時には、該当記事に<strong>監修者氏名・所属・資格を明記した監修バッジ</strong>を表示します（架空の監修者を掲載することはありません）。</li>
          </ul>

          <h2>4. 更新ポリシー</h2>
          <ul>
            <li>新規事実（メニュー改定・移転・閉店・制度改正など）を確認した場合、<strong>随時更新</strong>し、記事の <code>updatedAt</code> を最新化します。</li>
            <li>読者から誤情報のご指摘を受けた場合、原則として<strong>2営業日以内</strong>に内容を確認し、必要な修正を行います。</li>
            <li>店舗閉店・施設廃止が確認された場合、該当記事に明示し、必要に応じて非公開化します。</li>
            <li>古くなった季節記事は、毎年の該当シーズン前に再点検する運用を取っています。</li>
          </ul>

          <h2>5. 利益相反の開示</h2>
          <h3>5-1. アフィリエイト</h3>
          <p>
            きょうのこは、以下のアフィリエイトプログラムを利用しています。
          </p>
          <ul>
            <li>楽天アフィリエイト</li>
            <li>A8.net</li>
            <li>もしもアフィリエイト</li>
          </ul>
          <p>
            アフィリエイトリンクを含む記事には、景品表示法およびステルスマーケティング規制に基づき、
            <strong>「PR」「広告」バッジ</strong> を視認できる位置に表示します。
            報酬の高さを掲載理由にすることはなく、運営者が実際に使ったもの・公式情報に基づき推奨できるもののみ取り上げます。
          </p>
          <h3>5-2. 広告配信</h3>
          <p>
            Google AdSense の導入を計画しており、現在<strong>審査中</strong>です。
            導入後は、第三者配信広告として AdSense および提携広告サービスのコードを掲載する場合があります。
            広告主の意向によって記事の内容が歪められることはありません。
          </p>
          <h3>5-3. タイアップ・寄稿</h3>
          <p>
            金銭・物品・無償提供を受けて執筆した記事には、<strong>「PR」「提供」</strong> のいずれかのバッジを冒頭に表示します。
            タイアップ記事であっても、運営者の判断で否定的な所感を含めることがあります。
          </p>

          <h2>6. ユーザー個人情報の扱い</h2>
          <ul>
            <li>アクセス解析として <strong>Google Analytics 4（GA4）</strong> および <strong>Microsoft Clarity</strong> を利用しています。これらは行動分析のための匿名データを収集します。</li>
            <li>Cookie の利用詳細・無効化方法・第三者提供の有無は、<Link href="/privacy">プライバシーポリシー</Link> に記載しています。</li>
            <li>お問い合わせフォームで取得した個人情報は、返信・対応の目的でのみ利用し、第三者提供は行いません。</li>
          </ul>

          <h2>7. コンテンツポリシー（YMYL）</h2>
          <p>
            子育てメディアは、YMYL（Your Money or Your Life）に該当する話題を多く含みます。きょうのこでは次のように扱います。
          </p>
          <ul>
            <li><strong>医療・健康</strong>：症状・診断・服薬の判断はしません。「<strong>医師・かかりつけ医にご相談ください</strong>」の免責を必ず付与し、厚生労働省・各学会等の公式ソースに案内します。</li>
            <li><strong>発達・育児</strong>：個別ケースの可否を断定しません。一般論として公式資料を要約するに留め、判断は保護者と専門家に委ねます。</li>
            <li><strong>お金・制度</strong>：給付金・補助金などは執筆時点の公式情報を出典に明記し、最新情報は必ず管轄自治体・行政窓口で確認するよう案内します。</li>
            <li><strong>安全</strong>：誤飲・転落・水回りなど命に関わる話題は、消費者庁・JIS規格などの公式ソースに準拠します。</li>
          </ul>

          <h2>8. 訂正・お問い合わせ</h2>
          <p>
            記事内容に誤りを見つけた場合、または編集方針についてのご意見・取材・監修のお申し出は、下記までご連絡ください。
          </p>
          <ul>
            <li>メール：<a href="mailto:service@remegift.jp">service@remegift.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

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
