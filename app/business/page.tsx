import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { SITE_FACTS, CONTACT_EMAIL, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/lib/site-facts';

export const metadata: Metadata = {
  // layout の title.template が「%s｜きょうのこ」を付けるので、ここでは媒体名を重ねない
  title: 'タイアップ・広告掲載のご案内（媒体資料）',
  description:
    '子育て家庭向けおでかけメディア「きょうのこ」のタイアップ・広告掲載窓口。月間62,894PV・読者の90%以上がスマホの子育て世帯。実訪問取材つきタイアップ記事、施設・店舗紹介、商品モニターに対応します。PR表記・編集権の方針、お受けできないご依頼、進め方も明記しています。',
  alternates: { canonical: '/business' },
  openGraph: {
    title: 'タイアップ・広告掲載のご案内（媒体資料）｜きょうのこ',
    description:
      '月間62,894PVの子育ておでかけメディア。実訪問取材つきタイアップ記事・施設紹介・商品モニターに対応。媒体データと進め方を公開しています。',
    url: 'https://kyounoko.jp/business',
    type: 'website',
    images: [{ url: '/img/ogp-default-v2.webp', width: 1200, height: 630 }],
  },
};

/* ===========================================================
   /business — タイアップ・広告掲載の窓口（媒体資料）
   位置づけ: 企業・施設のご担当者さまが「出稿していいか」を
   このページだけで判断できるようにする。
   - 数字は lib/site-facts.ts（/about と共通の実測値）
   - 料金表は出さない。個人運営なので案件ごとに設計 → 見積もりが実態に合う
   - ステマ規制（景表法）対応として PR 表記と編集権の方針を先に明示する
   - 「お受けできないご依頼」を書くほど、まともな相談だけが残る
   =========================================================== */

const MAIL_SUBJECT = encodeURIComponent('【タイアップ・広告のご相談】会社名：');
const MAIL_BODY = encodeURIComponent(
  [
    '※分かる範囲で結構です。空欄のままでもご相談を承ります。',
    '',
    '・会社／団体名：',
    '・ご担当者さま お名前：',
    '・ご連絡先（電話・メール）：',
    '・公式サイトURL：',
    '・ご相談内容（タイアップ記事／施設紹介／商品モニター／その他）：',
    '・ご紹介いただきたい商品・サービス・施設：',
    '・想定しているご予算：',
    '・ご希望の公開時期：',
    '・達成したいこと（認知／来店／購入／採用 など）：',
  ].join('\n'),
);
const MAIL_HREF = `mailto:${CONTACT_EMAIL}?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`;

const CTA_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 24px',
  borderRadius: 'var(--radius-lg, 12px)',
  background: 'var(--accent, #ff7a59)',
  color: '#fff',
  fontWeight: 700,
  textDecoration: 'none',
};

export default function BusinessPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'タイアップ・広告掲載のご案内',
        item: 'https://kyounoko.jp/business',
      },
    ],
  };
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'タイアップ記事に「PR」表記は入りますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '入ります。金銭・物品・無償招待のいずれかをいただいた記事には、景品表示法のステルスマーケティング規制に基づき、記事冒頭のファーストビューに「PR」バッジを表示します。表記を外すご依頼はお受けできません。',
        },
      },
      {
        '@type': 'Question',
        name: '原稿の内容を指定できますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '事実誤認・薬機法上の表現・NGワードの修正は必ず反映します。一方で、実際に訪問・使用して感じたことの記述や評価そのものを書き換えるご依頼はお受けしていません。読者が「この媒体の言うことは信用できる」と思える状態を保つことが、結果的に広告主さまの利益にもなると考えているためです。',
        },
      },
      {
        '@type': 'Question',
        name: '施設の掲載は有料ですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '通常の施設・店舗紹介ページの掲載、公式写真への差し替え、情報の更新はすべて無料です。費用をいただくのは、取材や執筆の工数が発生するタイアップ記事などに限られます。',
        },
      },
      {
        '@type': 'Question',
        name: '検索順位や成果は保証されますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '保証はできません。検索順位はGoogleのアルゴリズムに依存するため、いかなる媒体でも保証は不可能です。公開後の表示回数・クリック数・滞在時間の実測値をレポートとしてご報告します。',
        },
      },
      {
        '@type': 'Question',
        name: '個人運営とのことですが、契約や請求書は発行できますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '可能です。個人事業としての請求書発行、必要に応じた契約書・秘密保持契約の締結に対応します。所在地等の情報もご契約の際に開示します。',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <V2Frame header="sub" active="home">
        <div className="container-article">
          <nav className="breadcrumb" aria-label="パンくず">
            <Link href="/">HOME</Link>
            <span className="sep">/</span>
            <span>タイアップ・広告掲載のご案内</span>
          </nav>
        </div>

        <div className="container-article">
          <header className="page-head">
            <span className="eyebrow">For Business</span>
            <h1>タイアップ・広告掲載のご案内</h1>
            <p className="lead">
              きょうのこは、0〜6歳の子どもを育てる家庭が「今日どこへ行こう、何をしよう」を決めるときに読むメディアです。
              読者の9割以上がスマートフォンから、そのほとんどが検索経由でたどり着きます。
              つまり<strong>「これから出かけ先や買うものを決めようとしている保護者」</strong>に、
              意思決定の直前で届けられる媒体です。
            </p>
          </header>

          <article className="prose" id="main">
            <p>
              <a className="btn-primary" href={MAIL_HREF} style={CTA_STYLE}>
                メールで相談する →
              </a>
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
              うまく起動しない場合は <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> 宛に直接お送りください。
              2〜3営業日以内にご返信します。
            </p>

            {/* ============ 媒体データ ============ */}
            <h2 id="media-data">媒体データ</h2>
            <p>
              {SITE_FACTS.asOfLabel}時点の実測値です（アクセス数は Google アナリティクス4）。
              ご希望があれば管理画面のスクリーンショットもご提示します。
            </p>
            <table className="table-wrap">
              <tbody>
                <tr>
                  <th>媒体名</th>
                  <td>
                    きょうのこ（<a href="https://kyounoko.jp">kyounoko.jp</a>）
                  </td>
                </tr>
                <tr>
                  <th>月間ページビュー</th>
                  <td>
                    <strong>{SITE_FACTS.monthlyPv.toLocaleString()} PV</strong>（
                    {SITE_FACTS.monthlyPvLabel}実績）／ 直近28日 {SITE_FACTS.pv28d.toLocaleString()} PV
                  </td>
                </tr>
                <tr>
                  <th>月間ユーザー数</th>
                  <td>約 {(SITE_FACTS.users28d / 10000).toFixed(1)} 万人（直近28日）</td>
                </tr>
                <tr>
                  <th>読者層</th>
                  <td>0〜6歳の子どもを育てる保護者（未就学児の子育て世帯）</td>
                </tr>
                <tr>
                  <th>閲覧端末</th>
                  <td>スマートフォン {SITE_FACTS.mobileShare}%</td>
                </tr>
                <tr>
                  <th>読者の地域</th>
                  <td>
                    首都圏 {SITE_FACTS.kantoShare}%（うち東京 {SITE_FACTS.tokyoShare}%）／ 関西{' '}
                    {SITE_FACTS.kansaiShare}%
                  </td>
                </tr>
                <tr>
                  <th>流入構成</th>
                  <td>
                    自然検索 {SITE_FACTS.organicShare}%
                    <br />
                    <span style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
                      広告出稿・記事の買い付けは行っていません。すべて検索から自力で集めた読者です。
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>エンゲージメント率</th>
                  <td>{SITE_FACTS.engagementRate}%</td>
                </tr>
                <tr>
                  <th>コンテンツ規模</th>
                  <td>
                    公開記事 {SITE_FACTS.articles} 本 ／ 掲載駅 {SITE_FACTS.stations} 駅 ／ 掲載スポット{' '}
                    {SITE_FACTS.spots} 件（うち<Link href="/kid-reports">実訪問レポート</Link>{' '}
                    {SITE_FACTS.kidReports} 件）
                  </td>
                </tr>
                <tr>
                  <th>公式SNS</th>
                  <td>
                    Instagram{' '}
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                      {INSTAGRAM_HANDLE}
                    </a>
                  </td>
                </tr>
                <tr>
                  <th>運営</th>
                  <td>
                    個人運営（<Link href="/about">運営者情報</Link>）
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>この媒体が向いているもの・向いていないもの</h3>
            <p>
              誠実にお伝えします。マス的なリーチは出せません。強いのは<strong>意思決定の直前にいる保護者への到達</strong>です。
            </p>
            <ul>
              <li>
                <strong>向いている</strong>：ファミリー向け施設・レジャー・飲食店の来店促進、
                ベビー用品・幼児食・知育サービスの認知と比較検討、自治体・商業施設の子育てイベント告知
              </li>
              <li>
                <strong>向いていない</strong>：短期間で大量のインプレッションが必要な施策、
                子育て世帯以外がターゲットの商材、話題づくりだけを目的とした企画
              </li>
            </ul>

            {/* ============ メニュー ============ */}
            <h2 id="menu">ご対応できること</h2>
            <table className="table-wrap">
              <thead>
                <tr>
                  <th>メニュー</th>
                  <th>内容</th>
                  <th>費用</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>実訪問タイアップ記事</th>
                  <td>
                    運営者が実際に子どもを連れて訪問し、写真つきで記事化します。
                    ベビーカー動線・おむつ替え・キッズメニューなど、子連れ目線の情報を厚く載せます。
                  </td>
                  <td>要お見積り</td>
                </tr>
                <tr>
                  <th>商品モニター・レビュー記事</th>
                  <td>
                    ベビー用品・幼児食などを実際に使い、使用感を記事化します。
                    薬機法に配慮した表現で、効果を断定しない形で執筆します。
                  </td>
                  <td>要お見積り</td>
                </tr>
                <tr>
                  <th>イベント・キャンペーンの記事化</th>
                  <td>
                    期間限定イベントや季節企画を、開催前に検索されるタイミングに合わせて公開します。
                  </td>
                  <td>要お見積り</td>
                </tr>
                <tr>
                  <th>Instagram連動</th>
                  <td>
                    記事公開に合わせて公式Instagram（{INSTAGRAM_HANDLE}）でも紹介します。単体でのご依頼も可能です。
                  </td>
                  <td>要お見積り</td>
                </tr>
                <tr>
                  <th>施設・店舗ページの掲載／公式写真への差し替え</th>
                  <td>
                    すでに掲載中の施設・店舗さまが、公式写真や最新情報をご提供いただくものです。
                    詳細は <Link href="/for-facilities">施設・店舗のご担当者さまへ</Link> をご覧ください。
                  </td>
                  <td>
                    <strong>無料</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              個人運営のため定額の料金表は設けていません。ご予算と達成したいことをお聞きしたうえで、
              できること・できないことを率直にお伝えし、内容を設計してお見積りします。
              ご予算が合わない場合はその場でお断りしますので、まずはお気軽にご相談ください。
            </p>

            {/* ============ お約束 ============ */}
            <h2 id="promise">お約束していること</h2>
            <ul>
              <li>
                <strong>PR表記を必ず入れます。</strong>
                金銭・物品・無償招待のいずれかをいただいた記事には、景品表示法のステルスマーケティング規制に基づき、
                記事冒頭のファーストビューに「PR」バッジを表示します。
              </li>
              <li>
                <strong>事実確認にはご協力ください。</strong>
                公開前に確認用URLを共有します。事実誤認・法令上NGな表現・社名や商品名の表記ゆれは、いただいたとおりに修正します。
              </li>
              <li>
                <strong>編集権は当方にあります。</strong>
                実際に訪問・使用して気になった点は記載することがあります。
                読者に信用されている状態を保つことが、広告主さまにとっての価値そのものだと考えているためです。
              </li>
              <li>
                <strong>公開後の数字をご報告します。</strong>
                公開から1か月後を目安に、表示回数・クリック数・滞在時間などの実測値をお送りします。
              </li>
              <li>
                <strong>いただいた素材を他媒体へ提供しません。</strong>
                ご提供いただいた写真・資料は、当メディアの掲載ページと当メディアのSNSでの紹介に限って使用します。
              </li>
            </ul>

            {/* ============ お受けできないこと ============ */}
            <h2 id="cannot">お受けできないご依頼</h2>
            <p>
              先に明記しておきます。次のご依頼は、ご予算にかかわらずお断りしています。
            </p>
            <ul>
              <li>PR表記を入れない、または分かりにくい位置に置く形での記事化</li>
              <li>実際には訪問・使用していないものを、体験したかのように書くこと</li>
              <li>医薬品・健康食品などで、効能・効果を断定する表現（薬機法に抵触するもの）</li>
              <li>検索順位・成果（来店数、売上、CVなど）の保証</li>
              <li>被リンク（SEO目的のリンク）のみを目的とした掲載・リンクの売買</li>
              <li>競合他社を貶める内容、根拠のない比較・ランキング</li>
              <li>子どもの安全・健康に関して、当方が疑問を持ったまま推奨できない商品・サービス</li>
              <li>読者の個人情報を第三者に渡す形の企画</li>
            </ul>

            {/* ============ 進め方 ============ */}
            <h2 id="flow">進め方</h2>
            <ol>
              <li>
                <strong>お問い合わせ</strong>：下記メールでご連絡ください（2〜3営業日以内に返信）
              </li>
              <li>
                <strong>ヒアリング</strong>：達成したいこと・ご予算・時期をお伺いします（メールまたはオンライン）
              </li>
              <li>
                <strong>ご提案・お見積り</strong>：構成案と費用、公開スケジュールをご提示します
              </li>
              <li>
                <strong>ご発注・取材</strong>：実訪問が必要な場合は日程を調整します（土日・平日夜が中心です）
              </li>
              <li>
                <strong>原稿のご確認</strong>：確認用URLを共有し、事実確認をいただきます
              </li>
              <li>
                <strong>公開</strong>：合意した日時に公開し、Instagramでもお知らせします
              </li>
              <li>
                <strong>レポート</strong>：公開1か月後を目安に実測値をご報告します
              </li>
            </ol>
            <p style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
              運営者は会社員との兼業のため、取材の日程は土日または平日の夜が中心になります。
              お急ぎの場合は、ご希望の公開日を最初にお知らせいただけると助かります。
            </p>

            {/* ============ FAQ ============ */}
            <h2 id="faq">よくあるご質問</h2>

            <h3>タイアップ記事に「PR」表記は入りますか？</h3>
            <p>
              入ります。金銭・物品・無償招待のいずれかをいただいた記事には、記事冒頭のファーストビューに「PR」バッジを表示します。
              表記を外すご依頼はお受けできません。
            </p>

            <h3>原稿の内容を指定できますか？</h3>
            <p>
              事実誤認・法令上NGな表現・表記ゆれの修正は必ず反映します。
              一方で、実際に訪問・使用して感じたことの記述や評価そのものを書き換えるご依頼はお受けしていません。
            </p>

            <h3>施設の掲載は有料ですか？</h3>
            <p>
              通常の施設・店舗紹介ページの掲載、公式写真への差し替え、情報の更新は<strong>すべて無料</strong>です。
              費用をいただくのは、取材や執筆の工数が発生するタイアップ記事などに限られます。
            </p>

            <h3>検索順位や成果は保証されますか？</h3>
            <p>
              保証はできません。検索順位は Google のアルゴリズムに依存するため、いかなる媒体でも保証は不可能です。
              そのかわり、公開後の実測値を隠さずご報告します。
            </p>

            <h3>個人運営とのことですが、契約や請求書は発行できますか？</h3>
            <p>
              可能です。請求書の発行、必要に応じた契約書・秘密保持契約の締結に対応します。
              所在地などの情報も、ご契約の際に開示します。
            </p>

            <h3>掲載をやめてほしい場合は？</h3>
            <p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
              までご連絡ください。速やかに掲載ページの取り下げ・修正に対応します。
            </p>

            {/* ============ 連絡先 ============ */}
            <h2 id="contact">お問い合わせ</h2>
            <p>
              下記ボタンから、必要事項の項目が入力された状態でメールが立ち上がります。
              分かる範囲でご記入のうえ送信してください。
            </p>
            <p>
              <a className="btn-primary" href={MAIL_HREF} style={CTA_STYLE}>
                メールで相談する →
              </a>
            </p>
            <ul>
              <li>
                メール：<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>返信目安：2〜3営業日（土日祝は遅れる場合があります）</li>
            </ul>
            <p>
              運営体制や編集の考え方は <Link href="/about">運営者情報</Link>、
              記事づくりのルールは <Link href="/editorial-policy">編集方針</Link> をご覧ください。
            </p>

            <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
              最終更新：{SITE_FACTS.updatedAtLabel}
            </p>
          </article>
        </div>
      </V2Frame>
    </>
  );
}
