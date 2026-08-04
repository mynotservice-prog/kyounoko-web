import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { SITE_FACTS, CONTACT_EMAIL, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/lib/site-facts';

export const metadata: Metadata = {
  // layout の title.template が「%s｜きょうのこ」を付けるので、ここでは媒体名を重ねない
  title: '運営者情報',
  description:
    'きょうのこは、東京23区で2人の子どもを育てる「ながみー」が実訪問をもとに1人で運営する子育ておでかけメディアです。運営者・媒体概要・実績データ・編集体制・収益と利益相反の開示・タイアップや取材のお問い合わせ窓口をまとめています。',
  alternates: { canonical: '/about' },
  openGraph: {
    title: '運営者情報｜きょうのこ',
    description:
      '運営者・媒体概要・実績データ・編集体制・利益相反の開示・お問い合わせ窓口。きょうのこの「誰が、どうやって作っているか」をすべて公開しています。',
    url: 'https://kyounoko.jp/about',
    type: 'profile',
    images: [{ url: '/img/ogp-default-v2.webp', width: 1200, height: 630 }],
  },
};

/* ===========================================================
   /about — 運営者情報
   位置づけ: 読者・施設さま・広告主・AdSense/ASP審査すべてが最初に見る
   「この媒体は誰が、どうやって作っているのか」の正本。
   - 媒体概要と実績は数字で出す（出典と時点を必ず併記）
   - 数字の実体は lib/site-facts.ts に集約（/business と共通）
   - 商談系の詳細は /business、規範の詳細は /editorial-policy に分離し、
     このページは「全体像 + 窓口の交通整理」に徹する
   =========================================================== */

const CARD: React.CSSProperties = {
  background: 'var(--paper-card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-lg)',
  padding: 24,
  margin: '24px 0',
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
    image: 'https://kyounoko.jp/img/ogp-default-v2.webp',
    jobTitle: 'きょうのこ 編集長 / 運営者',
    description:
      '東京23区に住む30代後半の会社員。2人の子どもを育てる父親として、平日夜と休日に都内の駅前個人店・公園・屋内施設を実訪問し、子連れ目線の一次情報を蓄積しています。',
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
      'ファミリーレストランの子連れ設備',
      '個人店の子連れ訪問記録',
      '幼児食・離乳食レシピ',
      '季節・行事の家庭での過ごし方',
    ],
    knowsLanguage: 'ja',
    email: `mailto:${CONTACT_EMAIL}`,
    sameAs: [INSTAGRAM_URL],
  };
  const jsonLdAboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://kyounoko.jp/about',
    url: 'https://kyounoko.jp/about',
    name: '運営者情報',
    description:
      'きょうのこの運営者「ながみー」と、媒体概要・実績・編集体制・収益の開示・お問い合わせ窓口についてのページ。',
    inLanguage: 'ja',
    isPartOf: { '@id': 'https://kyounoko.jp/#website' },
    about: { '@id': 'https://kyounoko.jp/about#author' },
    dateModified: SITE_FACTS.updatedAtIso,
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
      <V2Frame header="sub" active="home">
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
              きょうのこは、東京23区で2人の子どもを育てる会社員「ながみー」が、平日の夜と休日に実際に足を運びながら
              1人で運営している子育ておでかけメディアです。誰が、どんな方針で、どうやってお金を得ながら作っているのか。
              判断に必要な情報をすべてこのページに置いています。
            </p>
          </header>

          <article className="prose" id="main">
            {/* ============ 媒体概要 ============ */}
            <h2 id="overview">媒体概要</h2>
            <table className="table-wrap">
              <tbody>
                <tr>
                  <th>媒体名</th>
                  <td>きょうのこ（kyounoko）</td>
                </tr>
                <tr>
                  <th>URL</th>
                  <td>
                    <a href="https://kyounoko.jp">https://kyounoko.jp</a>
                  </td>
                </tr>
                <tr>
                  <th>コンセプト</th>
                  <td>0〜6歳の子を育てる家庭の「今日どうする？」を3分で決められるようにする</td>
                </tr>
                <tr>
                  <th>開設</th>
                  <td>2026年4月（記事公開開始）</td>
                </tr>
                <tr>
                  <th>運営者</th>
                  <td>
                    ながみー（<Link href="/authors/nagamy">著者ページ</Link>）
                  </td>
                </tr>
                <tr>
                  <th>運営形態</th>
                  <td>個人運営（法人格なし・編集部や外注ライターはいません）</td>
                </tr>
                <tr>
                  <th>所在地</th>
                  <td>
                    東京都
                    <br />
                    <span style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
                      個人運営のため番地は非公開としています。契約・請求等で必要な場合はメールにて個別に開示します。
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>連絡先</th>
                  <td>
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    <br />
                    <span style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
                      同一運営者が運営する他サイトと共通のアドレスです。件名に「きょうのこ」とご記載いただけると助かります。
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>収益源</th>
                  <td>Google AdSense によるディスプレイ広告 / アフィリエイト / タイアップ記事</td>
                </tr>
                <tr>
                  <th>公式SNS</th>
                  <td>
                    Instagram{' '}
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer me">
                      {INSTAGRAM_HANDLE}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ============ 運営者 ============ */}
            <h2 id="editor">運営者について</h2>
            <div style={CARD}>
              <p
                style={{
                  margin: '0 0 12px',
                  fontFamily: 'var(--font-mincho), serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                ながみー（kyounoko-editor）｜きょうのこ 運営者・編集長
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.9 }}>
                30代後半の会社員。妻と2人の子ども（未就学児）と東京23区で暮らしています。
                平日の夜と休日に、子どもをベビーカーや抱っこ紐で連れて都内の飲食店・公園・屋内施設を実際に訪問し、
                「子連れで本当に入れるか」「動線・段差・ベビーカーの置き場・おむつ替え・離乳食対応・混雑する時間帯」を
                自分の目で確認して記録しています。
                本業の業界・会社名は公開していませんが、当サイトの掲載内容と利害関係のある業種ではありません。
                より詳しいプロフィールは <Link href="/authors/nagamy">著者ページ</Link> にまとめています。
              </p>
            </div>

            <h3>なぜこのサイトを作ったか</h3>
            <p>
              子どもが生まれてから「今日どこに行けるか」を調べるたびに、
              行ったこともない店を口コミだけでまとめた記事や、5年前の情報のまま放置されたページに時間を溶かしました。
              知りたいのは点数や雰囲気ではなく、<strong>ベビーカーで入れるか、おむつを替えられるか、離乳食を持ち込めるか</strong>という
              一点だけなのに、それがどこにも書いていない。
            </p>
            <p>
              そこを、実際に子連れで行った人間が書けば埋められる。それがきょうのこを始めた理由です。
              大手メディアのように網羅はできませんが、<strong>「行った人にしか書けないこと」だけは負けない</strong>という設計にしています。
            </p>

            <h3>立ち位置（隠さないこと）</h3>
            <ul>
              <li>
                監修者を抱える編集部ではなく、<strong>1人で運営している個人メディア</strong>です。
              </li>
              <li>記事の最終責任は運営者ながみー本人にあります。</li>
              <li>
                専門家による継続的な監修体制は<strong>まだ持っていません</strong>。
                医療・健康・お金に関わる領域は、後述の方針に沿って踏み込まない形で扱っています（
                <Link href="/supervisors">監修について</Link>）。
              </li>
              <li>
                すべてのスポットを訪問できているわけではありません。実訪問と、公式情報をもとにした調査は
                <strong>ページ上で明確に区別</strong>しています。
              </li>
            </ul>

            {/* ============ 実績 ============ */}
            <h2 id="stats">数字で見るきょうのこ</h2>
            <p>
              {SITE_FACTS.asOfLabel}時点の実績です。
            </p>
            <table className="table-wrap">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>実績</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>公開記事数</th>
                  <td>{SITE_FACTS.articles} 本</td>
                </tr>
                <tr>
                  <th>掲載駅数</th>
                  <td>
                    {SITE_FACTS.stations} 駅
                    <span style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
                      （東京23区 {SITE_FACTS.stationsTokyo} / 神奈川 {SITE_FACTS.stationsKanagawa} / 埼玉・千葉{' '}
                      {SITE_FACTS.stationsSaitamaChiba} / 関西 {SITE_FACTS.stationsKansai}）
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>掲載スポット</th>
                  <td>
                    {SITE_FACTS.spots} 件（うち<Link href="/kid-reports">運営者の実訪問レポート</Link>{' '}
                    {SITE_FACTS.kidReports} 件）
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
              数字は毎月見直して更新しています。掲載・タイアップのご検討で最新の数値が必要な場合は、
              <Link href="/business">タイアップ・広告掲載のご案内</Link> をご覧ください。
            </p>

            {/* ============ 扱う情報 ============ */}
            <h2 id="what-we-cover">どんな情報を出しているか</h2>
            <p>主に次の5分野を扱っています。</p>
            <ul>
              <li>
                <strong>駅 × 子連れランチ</strong>：
                首都圏・関西の駅周辺で、子連れで入れる店を駅単位で整理しています（
                <Link href="/station">駅別ランチ</Link>）。
              </li>
              <li>
                <strong>ファミリーレストラン・チェーン攻略</strong>：
                キッズメニュー、ベビーチェアの有無、離乳食の持ち込み可否、混雑する時間帯など、
                公式情報と実訪問を突き合わせて店舗タイプ別にまとめています。
              </li>
              <li>
                <strong>おでかけスポット</strong>：
                公園・屋内遊び場・季節イベントを、ベビーカー動線や授乳・おむつ対応まで含めて紹介します（
                <Link href="/spots">スポット一覧</Link>）。
              </li>
              <li>
                <strong>子連れ向けレシピ・育児の困りごと</strong>：
                幼児食・取り分け・常備菜など、家庭で実際に作って自分の子どもに出したものを中心に紹介します。
              </li>
              <li>
                <strong>季節記事</strong>：
                入園・運動会・梅雨・夏の暑さ対策など、その時期に必要になる情報を整理してまとめます。
              </li>
            </ul>

            <h2 id="what-we-avoid">どんな情報は出さないか</h2>
            <ul>
              <li>
                <strong>他サイトの口コミの引用・転載はしません。</strong>
                著作権上の問題に加え、口コミの寄せ集めは「行った人にしか書けないこと」の逆だからです。
              </li>
              <li>
                <strong>医師にしかできない判断</strong>（症状の診断・受診の要否・服薬の指示など）は行いません。
                そのような領域は、厚生労働省・各学会・かかりつけ医など公式の情報源に案内します。
              </li>
              <li>
                <strong>薬機法に抵触する効果の断定</strong>（「治る」「効く」「やせる」など）はしません。
                育児用品・食品・コスメについても、効能・効果を断定する表現は避けます。
              </li>
              <li>
                <strong>架空の監修者</strong>を立てたり、<strong>行っていない場所の訪問レポート</strong>を
                生成して掲載したりしません。
              </li>
            </ul>

            {/* ============ 一次情報 ============ */}
            <h2 id="kid-reports">実訪問の記録について</h2>
            <p>
              きょうのこには <strong>KidReports（キッドレポート）</strong> という仕組みがあり、
              運営者本人が子連れで訪問したときの気付き・ベビーカー動線・混雑感・注意点を、
              通常の解説記事とは別のレイヤーで保存しています（
              <Link href="/kid-reports">実訪問レポート一覧</Link>）。
            </p>
            <ul>
              <li>訪問していない場所を「訪問済み」として書くことはありません。調査ベースの情報は本文で明確に切り分けます。</li>
              <li>
                店舗情報（営業時間・メニュー・料金）は変化が早いため、
                本文に「<strong>来店前に公式情報を必ずご確認ください</strong>」の注意書きを添えています。
              </li>
              <li>誤りのご指摘をいただいた場合は、確認のうえ修正し、必要に応じて更新日を改めます。</li>
            </ul>

            {/* ============ 収益と利益相反 ============ */}
            <h2 id="disclosure">収益と利益相反の開示</h2>
            <p>
              きょうのこは無料でお読みいただけるかわりに、次の3つで運営費をまかなっています。
              どれも、読者の判断を歪めない形で行うことを条件にしています。
            </p>
            <table className="table-wrap">
              <thead>
                <tr>
                  <th>収益源</th>
                  <th>内容と、守っているルール</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>広告配信</th>
                  <td>
                    Google AdSense 等による自動配信。表示内容は当サイトでは選べません。
                    記事の主張と広告内容には関係がありません。
                  </td>
                </tr>
                <tr>
                  <th>アフィリエイト</th>
                  <td>
                    Amazonアソシエイト・楽天アフィリエイト・A8.net・バリューコマース・もしもアフィリエイト等に参加しています。
                    紹介リンクを含む記事には「PR」表記を付けます。
                    <strong>報酬額の高さで掲載順位を決めることはしません。</strong>
                  </td>
                </tr>
                <tr>
                  <th>タイアップ記事</th>
                  <td>
                    金銭・物品・無償招待を受けて執筆した記事には、冒頭に「PR」「提供」のバッジを表示します。
                    タイアップであっても、<strong>実際に確認して気になった点は記載します</strong>（
                    <Link href="/business">詳細</Link>）。
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              情報の集め方、正確性チェック、YMYL領域の扱いなど、運営の細かいルールは
              <Link href="/editorial-policy">編集方針</Link> に独立して掲載しています。
            </p>

            {/* ============ 窓口 ============ */}
            <h2 id="contact">お問い合わせ窓口</h2>
            <p>
              ご用件ごとに窓口を分けています。いずれも{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> でお受けし、
              原則2〜3営業日以内に返信します。
            </p>
            <table className="table-wrap">
              <thead>
                <tr>
                  <th>ご用件</th>
                  <th>窓口</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>記事の誤り・情報が古いというご指摘</th>
                  <td>
                    <Link href="/contact">お問い合わせ</Link>（該当記事のURLを添えてください）
                  </td>
                </tr>
                <tr>
                  <th>タイアップ記事・広告掲載・PRのご相談</th>
                  <td>
                    <Link href="/business">タイアップ・広告掲載のご案内</Link>
                  </td>
                </tr>
                <tr>
                  <th>掲載中の施設・店舗さまからの写真提供・情報更新</th>
                  <td>
                    <Link href="/for-facilities">施設・店舗のご担当者さまへ</Link>（無料）
                  </td>
                </tr>
                <tr>
                  <th>掲載内容の修正・削除のご依頼</th>
                  <td>
                    <Link href="/contact">お問い合わせ</Link>（速やかに対応します）
                  </td>
                </tr>
                <tr>
                  <th>メディア・雑誌等からの取材</th>
                  <td>
                    <Link href="/contact">お問い合わせ</Link>（日程と概要をご明記ください）
                  </td>
                </tr>
                <tr>
                  <th>監修・執筆のご応募</th>
                  <td>
                    <Link href="/supervisors">監修について</Link>
                  </td>
                </tr>
                <tr>
                  <th>個人情報の開示・削除のご請求</th>
                  <td>
                    <Link href="/privacy">プライバシーポリシー</Link>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ============ 関連 ============ */}
            <h2 id="related">関連ページ</h2>
            <ul>
              <li>
                <Link href="/editorial-policy">編集方針</Link>：情報の集め方・正確性チェック・利益相反の開示ルール
              </li>
              <li>
                <Link href="/supervisors">監修について</Link>：現在の監修体制と今後の計画
              </li>
              <li>
                <Link href="/business">タイアップ・広告掲載のご案内</Link>：媒体資料・メニュー・お約束
              </li>
              <li>
                <Link href="/privacy">プライバシーポリシー</Link> ／{' '}
                <Link href="/terms">利用規約</Link> ／{' '}
                <Link href="/external-transmission">外部送信ポリシー</Link>
              </li>
            </ul>

            <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
              最終更新：{SITE_FACTS.updatedAtLabel}
            </p>
          </article>
        </div>
      </V2Frame>
    </>
  );
}
