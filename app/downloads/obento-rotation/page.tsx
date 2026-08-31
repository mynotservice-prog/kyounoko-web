import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { PrintButton } from '@/components/tools/PrintButton';

export const metadata: Metadata = {
  title: 'お弁当ローテーション表（30日分）',
  description:
    '幼稚園・保育園のお弁当を30日分ローテーションできる献立表。主菜+副菜2品+彩り1品の組み合わせ例を一覧化。冷凍保存OK食材リスト・朝5分のコツ付き。印刷OK。',
  alternates: { canonical: '/downloads/obento-rotation' },
  openGraph: {
    title: 'お弁当ローテーション表（30日分）｜きょうのこ',
    description: '30日分の献立を1枚で。主菜・副菜・彩りの組み合わせ例＋冷凍OK食材リスト。',
  },
};

export default function Page() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'ダウンロード資料', item: 'https://kyounoko.jp/downloads' },
      { '@type': 'ListItem', position: 3, name: 'お弁当ローテーション表', item: 'https://kyounoko.jp/downloads/obento-rotation' },
    ],
  };
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'お弁当ローテーション表（30日分）',
    description: '幼稚園・保育園のお弁当を30日分ローテーションできる献立表。主菜+副菜2品+彩り1品の組み合わせ例を一覧化。',
    author: { '@type': 'Organization', name: 'きょうのこ' },
    publisher: { '@type': 'Organization', name: 'きょうのこ', url: 'https://kyounoko.jp/' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <V2Frame header="sub" active="home">
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/downloads">ダウンロード資料</Link>
          <span className="sep">/</span>
          <span>お弁当ローテーション表（30日分）</span>
        </nav>
      </div>

      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">DOC 03</span>
          <h1>お弁当ローテーション表（30日分）</h1>
          <p className="lead">
            幼稚園・保育園のお弁当を「考えなくてもいい」ようにする30日分の献立表。<strong>主菜+副菜2品+彩り1品+ご飯=4要素</strong>の基本構成で、毎日の組み合わせをそのまま採用できます。冷凍OK食材リスト・朝5分のコツ付き。
          </p>
        </header>

        <PrintButton docId="obento-rotation" />

        <article className="print-doc">
          <h2>使い方</h2>
          <p>
            お弁当に時間がかかる原因は「献立を毎朝考えること」。本表は30日分の組み合わせをそのまま採用すれば、献立を考える時間がゼロになります。<strong>主菜は前日夜 or 週末に作り置き、副菜は冷凍ストック、彩りは生のまま入れる</strong>のが基本ルール。30日経ったら1日目に戻ってOKです。
          </p>

          <h2>基本の構成</h2>
          <table>
            <thead>
              <tr>
                <th>要素</th>
                <th>役割</th>
                <th>例</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>主菜（メイン）</td><td>タンパク質・満足感</td><td>ハンバーグ・唐揚げ・鮭・ウインナー</td></tr>
              <tr><td>副菜A</td><td>野菜・食物繊維</td><td>ブロッコリー・ほうれん草・人参</td></tr>
              <tr><td>副菜B</td><td>味の変化</td><td>卵焼き・きんぴら・ひじき煮</td></tr>
              <tr><td>彩り</td><td>赤・黄を入れる</td><td>プチトマト・コーン・パプリカ</td></tr>
              <tr><td>ご飯</td><td>主食</td><td>白米・おにぎり・ふりかけご飯</td></tr>
            </tbody>
          </table>

          <h2>30日ローテーション献立</h2>

          <h3>1週目（Day1〜5）</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>主菜</th>
                <th>副菜A</th>
                <th>副菜B</th>
                <th>彩り</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>ハンバーグ</td><td>ブロッコリーチーズ</td><td>卵焼き</td><td>プチトマト</td></tr>
              <tr><td>2</td><td>鮭の塩焼き</td><td>ほうれん草胡麻和え</td><td>ひじき煮</td><td>コーン</td></tr>
              <tr><td>3</td><td>鶏の唐揚げ</td><td>人参グラッセ</td><td>枝豆</td><td>プチトマト</td></tr>
              <tr><td>4</td><td>ウインナー（飾り切り）</td><td>かぼちゃ煮</td><td>卵焼き</td><td>ブロッコリー</td></tr>
              <tr><td>5</td><td>豚の生姜焼き</td><td>キャベツの塩昆布和え</td><td>マカロニサラダ</td><td>パプリカ赤</td></tr>
            </tbody>
          </table>

          <h3>2週目（Day6〜10）</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>主菜</th>
                <th>副菜A</th>
                <th>副菜B</th>
                <th>彩り</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>6</td><td>鶏のつくね</td><td>ブロッコリー塩茹で</td><td>かぼちゃサラダ</td><td>プチトマト</td></tr>
              <tr><td>7</td><td>ぶりの照り焼き</td><td>小松菜とちくわ煮</td><td>卵焼き（青のり）</td><td>コーン</td></tr>
              <tr><td>8</td><td>豚肉巻きアスパラ</td><td>人参しりしり</td><td>きんぴらごぼう</td><td>プチトマト</td></tr>
              <tr><td>9</td><td>ミートボール</td><td>ほうれん草バター炒め</td><td>ポテトサラダ</td><td>パプリカ黄</td></tr>
              <tr><td>10</td><td>えびフライ</td><td>ブロッコリーマヨ</td><td>卵焼き（チーズ）</td><td>プチトマト</td></tr>
            </tbody>
          </table>

          <h3>3週目（Day11〜15）</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>主菜</th>
                <th>副菜A</th>
                <th>副菜B</th>
                <th>彩り</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>11</td><td>鶏の照り焼き</td><td>いんげん胡麻和え</td><td>ひじき煮</td><td>コーン</td></tr>
              <tr><td>12</td><td>鮭の幽庵焼き</td><td>かぼちゃ煮</td><td>卵焼き</td><td>プチトマト</td></tr>
              <tr><td>13</td><td>豚しゃぶサラダ</td><td>ブロッコリー</td><td>マカロニケチャップ</td><td>パプリカ赤</td></tr>
              <tr><td>14</td><td>チキンナゲット</td><td>人参グラッセ</td><td>枝豆</td><td>プチトマト</td></tr>
              <tr><td>15</td><td>魚肉ソーセージ巻き</td><td>ほうれん草</td><td>卵焼き（じゃこ）</td><td>コーン</td></tr>
            </tbody>
          </table>

          <h3>4週目（Day16〜20）</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>主菜</th>
                <th>副菜A</th>
                <th>副菜B</th>
                <th>彩り</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>16</td><td>豚味噌焼き</td><td>キャベツ塩茹で</td><td>ひじき煮</td><td>プチトマト</td></tr>
              <tr><td>17</td><td>鶏の竜田揚げ</td><td>ブロッコリー</td><td>マカロニサラダ</td><td>パプリカ黄</td></tr>
              <tr><td>18</td><td>鮭フレークおにぎり</td><td>ほうれん草胡麻和え</td><td>卵焼き</td><td>コーン</td></tr>
              <tr><td>19</td><td>ハンバーグ（チーズ）</td><td>人参しりしり</td><td>枝豆</td><td>プチトマト</td></tr>
              <tr><td>20</td><td>ウインナーチーズ巻き</td><td>かぼちゃサラダ</td><td>ひじき煮</td><td>パプリカ赤</td></tr>
            </tbody>
          </table>

          <h3>5週目+α（Day21〜30）</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>主菜</th>
                <th>副菜A</th>
                <th>副菜B</th>
                <th>彩り</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>21</td><td>鶏ハム</td><td>ブロッコリー</td><td>卵焼き</td><td>プチトマト</td></tr>
              <tr><td>22</td><td>豚肉巻き人参</td><td>小松菜お浸し</td><td>マカロニサラダ</td><td>コーン</td></tr>
              <tr><td>23</td><td>えびマヨ</td><td>ほうれん草バター</td><td>卵焼き（青のり）</td><td>プチトマト</td></tr>
              <tr><td>24</td><td>鶏つくね（甘辛）</td><td>かぼちゃ煮</td><td>ひじき煮</td><td>パプリカ黄</td></tr>
              <tr><td>25</td><td>鮭の西京焼き</td><td>ブロッコリーチーズ</td><td>枝豆</td><td>プチトマト</td></tr>
              <tr><td>26</td><td>ミートローフ</td><td>人参グラッセ</td><td>マカロニケチャップ</td><td>コーン</td></tr>
              <tr><td>27</td><td>豚生姜焼き</td><td>キャベツ塩昆布</td><td>卵焼き</td><td>プチトマト</td></tr>
              <tr><td>28</td><td>鶏の唐揚げ（カレー味）</td><td>ブロッコリー</td><td>ひじき煮</td><td>パプリカ赤</td></tr>
              <tr><td>29</td><td>魚のフライ</td><td>ほうれん草</td><td>ポテトサラダ</td><td>プチトマト</td></tr>
              <tr><td>30</td><td>ハンバーグ（和風）</td><td>かぼちゃサラダ</td><td>卵焼き</td><td>コーン</td></tr>
            </tbody>
          </table>

          <h2>冷凍保存OK食材リスト</h2>
          <table>
            <thead>
              <tr>
                <th>食材</th>
                <th>解凍方法</th>
                <th>保存期間</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>ハンバーグ（焼き済み）</td><td>朝レンジ500W 1分</td><td>2〜3週間</td></tr>
              <tr><td>鶏の唐揚げ（揚げ済み）</td><td>朝レンジ500W 1分</td><td>2〜3週間</td></tr>
              <tr><td>ミートボール</td><td>朝レンジ500W 40秒</td><td>2〜3週間</td></tr>
              <tr><td>ブロッコリー（茹で済み）</td><td>自然解凍可</td><td>3〜4週間</td></tr>
              <tr><td>ほうれん草胡麻和え</td><td>自然解凍可</td><td>2週間</td></tr>
              <tr><td>かぼちゃ煮</td><td>朝レンジ500W 30秒</td><td>2〜3週間</td></tr>
              <tr><td>ひじき煮</td><td>朝レンジ500W 30秒</td><td>2〜3週間</td></tr>
              <tr><td>きんぴらごぼう</td><td>朝レンジ500W 30秒</td><td>2週間</td></tr>
              <tr><td>枝豆（さや付き）</td><td>自然解凍可</td><td>1ヶ月</td></tr>
              <tr><td>コーン</td><td>自然解凍可</td><td>1ヶ月</td></tr>
              <tr><td>卵焼き（カット済み）</td><td>朝レンジ500W 20秒</td><td>2週間</td></tr>
              <tr><td>マカロニサラダ</td><td>×（冷凍不可）</td><td>冷蔵2〜3日</td></tr>
            </tbody>
          </table>

          <h2>朝5分で完成するコツ</h2>
          <ul className="checklist">
            <li>主菜は前日夜か週末にまとめて作って冷凍する</li>
            <li>副菜は1回3〜4種を作り置き、シリコンカップで小分け冷凍</li>
            <li>彩り（プチトマト・コーン）は洗って常備</li>
            <li>朝はレンジで主菜解凍→ご飯詰め→冷凍副菜そのままIN</li>
            <li>卵焼きは多めに焼いて冷凍、朝はカットして詰めるだけ</li>
            <li>シリコンカップ・ピックを揃えて見た目を底上げ</li>
            <li>冷ましてから蓋をする（時間がない時は保冷剤の上で5分）</li>
          </ul>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center' }}>
            © きょうのこ (kyounoko.jp) — 個人利用は自由。商用利用は要問合せ。
          </p>
        </article>

        <PrintButton docId="obento-rotation" />

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 16px' }}>
            関連記事
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.95 }}>
            <li><Link href="/article/yuuhan-dinner-15pun-10recipes">夕飯15分レシピ10選｜帰宅後すぐ作れる</Link></li>
            <li><Link href="/article/asagohan-obento-douji-15pun">朝ごはん＆お弁当を同時に15分で作る段取り</Link></li>
            <li><Link href="/article/obentou-jitan-8patterns">お弁当時短8パターン｜冷凍ストック活用法</Link></li>
            <li><Link href="/article/natsu-bento-itamanai-recipe-7">夏のお弁当｜傷まないレシピ7選</Link></li>
          </ul>
        </section>
      </div>
      </V2Frame>
      
    </>
  );
}
