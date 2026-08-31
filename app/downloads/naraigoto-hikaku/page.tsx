import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { PrintButton } from '@/components/tools/PrintButton';

export const metadata: Metadata = {
  title: '習い事比較シート',
  description:
    '主要9種の習い事（スイミング・ピアノ・体操・英語・くもん・しちだ・モンテ・サッカー・学研）を月謝・対象年齢・効果・親の負担で一覧比較。印刷・PDF保存OK。',
  alternates: { canonical: '/downloads/naraigoto-hikaku' },
  openGraph: {
    title: '習い事比較シート｜きょうのこ',
    description: '主要9種の習い事を月謝・効果・親の負担で一覧比較できる1枚シート。',
  },
};

export default function Page() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'ダウンロード資料', item: 'https://kyounoko.jp/downloads' },
      { '@type': 'ListItem', position: 3, name: '習い事比較シート', item: 'https://kyounoko.jp/downloads/naraigoto-hikaku' },
    ],
  };
  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '主要な子供の習い事 比較リスト',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'スイミング' },
      { '@type': 'ListItem', position: 2, name: 'ピアノ' },
      { '@type': 'ListItem', position: 3, name: '体操教室' },
      { '@type': 'ListItem', position: 4, name: '英語' },
      { '@type': 'ListItem', position: 5, name: 'くもん' },
      { '@type': 'ListItem', position: 6, name: 'しちだ式' },
      { '@type': 'ListItem', position: 7, name: 'モンテッソーリ' },
      { '@type': 'ListItem', position: 8, name: 'サッカー' },
      { '@type': 'ListItem', position: 9, name: '学研教室' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }} />
      <V2Frame header="sub" active="home">
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/downloads">ダウンロード資料</Link>
          <span className="sep">/</span>
          <span>習い事比較シート</span>
        </nav>
      </div>

      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">DOC 05</span>
          <h1>習い事比較シート</h1>
          <p className="lead">
            主要9種の習い事を<strong>月謝・対象年齢・主な効果・親の負担・続けやすさ</strong>で一覧比較。1枚で全体像を把握し、子に合うものを家族で話し合うきっかけに使えます。選び方の3軸と失敗を避けるチェックリスト付き。
          </p>
        </header>

        <PrintButton docId="naraigoto-hikaku" />

        <article className="print-doc">
          <h2>使い方</h2>
          <p>
            習い事選びで失敗する家庭の多くは「友達がやっているから」「なんとなく良さそうだから」で決めています。本シートは<strong>9種を同じ軸で並べて比較</strong>することで、家計と生活に無理のない選択をサポートします。月謝はあくまで一般的な目安で、地域・教室により変動します。
          </p>

          <h2>主要9種の比較表</h2>
          <table>
            <thead>
              <tr>
                <th>習い事</th>
                <th>月謝目安</th>
                <th>対象年齢</th>
                <th>主な効果</th>
                <th>親の負担</th>
                <th>続けやすさ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>スイミング</td>
                <td>6,000〜9,000円</td>
                <td>0歳〜</td>
                <td>体力・心肺機能・水への慣れ</td>
                <td>送迎・水着準備（中）</td>
                <td>◎ 送迎バスあり多</td>
              </tr>
              <tr>
                <td>ピアノ</td>
                <td>7,000〜12,000円</td>
                <td>3歳〜</td>
                <td>音感・指先・集中力・表現力</td>
                <td>家での練習サポート（高）</td>
                <td>○ 自宅練習が必須</td>
              </tr>
              <tr>
                <td>体操教室</td>
                <td>5,500〜8,000円</td>
                <td>2歳〜</td>
                <td>運動神経・柔軟性・姿勢</td>
                <td>送迎のみ（低）</td>
                <td>◎ 親の負担少</td>
              </tr>
              <tr>
                <td>英語</td>
                <td>7,000〜15,000円</td>
                <td>0歳〜</td>
                <td>英語耳・コミュニケーション</td>
                <td>家での英語環境作り（中）</td>
                <td>△ 効果実感に時間</td>
              </tr>
              <tr>
                <td>くもん（公文）</td>
                <td>7,150〜8,800円/科目</td>
                <td>3歳〜</td>
                <td>計算力・読解力・自学習慣</td>
                <td>毎日の宿題サポート（高）</td>
                <td>△ 宿題管理が大変</td>
              </tr>
              <tr>
                <td>しちだ式</td>
                <td>14,000〜18,000円</td>
                <td>0歳〜</td>
                <td>右脳開発・記憶力・集中力</td>
                <td>家庭学習も推奨（高）</td>
                <td>△ 月謝高め</td>
              </tr>
              <tr>
                <td>モンテッソーリ</td>
                <td>10,000〜20,000円</td>
                <td>1歳〜</td>
                <td>主体性・集中力・生活力</td>
                <td>家庭環境の調整（中）</td>
                <td>○ 教室数限定的</td>
              </tr>
              <tr>
                <td>サッカー</td>
                <td>3,000〜6,000円</td>
                <td>4歳〜</td>
                <td>体力・協調性・社会性</td>
                <td>送迎・試合応援（高）</td>
                <td>○ 試合・遠征あり</td>
              </tr>
              <tr>
                <td>学研教室</td>
                <td>8,800〜12,100円</td>
                <td>3歳〜</td>
                <td>基礎学力・思考力</td>
                <td>家庭学習のサポート（中）</td>
                <td>○ くもんより緩め</td>
              </tr>
            </tbody>
          </table>

          <h2>選び方の3軸</h2>
          <p>9種の中から絞り込むときに、必ずこの順番で考えてください。</p>
          <table>
            <thead>
              <tr>
                <th>軸</th>
                <th>確認ポイント</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. 子の性格に合うか</td>
                <td>体を動かすのが好き？じっとできる？人前は平気？体験で必ず確認</td>
              </tr>
              <tr>
                <td>2. 家計と続けられる金額か</td>
                <td>月謝＋年会費＋発表会＋用具で年間総額を試算。最低2〜3年続けられる金額か</td>
              </tr>
              <tr>
                <td>3. 通わせ方が無理ないか</td>
                <td>送迎時間・曜日・きょうだいの予定との整合。親の負担の総量を可視化する</td>
              </tr>
            </tbody>
          </table>

          <h2>年間コスト試算欄（記入用）</h2>
          <table>
            <thead>
              <tr>
                <th>項目</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>月謝 × 12ヶ月</td><td>　　　　　　　　円</td></tr>
              <tr><td>入会金</td><td>　　　　　　　　円</td></tr>
              <tr><td>年会費・運営費</td><td>　　　　　　　　円</td></tr>
              <tr><td>発表会・大会費</td><td>　　　　　　　　円</td></tr>
              <tr><td>用具・教材費</td><td>　　　　　　　　円</td></tr>
              <tr><td>制服・ユニフォーム</td><td>　　　　　　　　円</td></tr>
              <tr><td>送迎ガソリン・交通費</td><td>　　　　　　　　円</td></tr>
              <tr><td>合計（年間）</td><td>　　　　　　　　円</td></tr>
            </tbody>
          </table>

          <h2>失敗を避けるチェックリスト</h2>
          <ul className="checklist">
            <li>必ず「体験レッスン」に参加してから決めている</li>
            <li>子が自分から「やりたい」と言ったか確認した</li>
            <li>月謝以外の費用（年会費・発表会・用具）を把握した</li>
            <li>「最低3年は続ける前提」で家計に無理がないか試算した</li>
            <li>送迎の時間とルートを実際にシミュレーションした</li>
            <li>きょうだいの送迎・予定と重ならないか確認した</li>
            <li>先生との相性・教室の雰囲気を見学で確認した</li>
            <li>「やめたい」と言われた時の対応方針を家族で決めている</li>
            <li>親の都合（仕事・予定）を最優先にしていない</li>
            <li>「友達がやっているから」だけが理由になっていない</li>
            <li>子の体力・睡眠時間を圧迫していない</li>
            <li>同時に複数始める場合、優先順位を決めている</li>
          </ul>

          <p style={{ marginTop: 16, padding: 12, background: 'var(--paper-card)', borderLeft: '3px solid var(--clay)', fontSize: 13 }}>
            <strong>ヒント：</strong>3歳〜年中頃までは「運動系1つ＋親子の時間」のシンプル構成で十分。たくさん始めるより、1つを楽しく長く続けることのほうが、自己肯定感や継続力につながります。
          </p>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center' }}>
            © きょうのこ (kyounoko.jp) — 個人利用は自由。商用利用は要問合せ。
          </p>
        </article>

        <PrintButton docId="naraigoto-hikaku" />

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 16px' }}>
            関連記事
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.95 }}>
            <li><Link href="/article/naraigoto-itsukara-0-6sai">習い事はいつから？0-6歳の始めどき早見表</Link></li>
            <li><Link href="/article/naraigoto-yametai-taiou">「習い事やめたい」と言われた時の対応6パターン</Link></li>
            <li><Link href="/article/youji-naraigoto-nansai-kara">幼児の習い事は何歳から？種類別の適齢期</Link></li>
            <li><Link href="/tools/naraigoto-match">習い事マッチ診断ツール</Link></li>
          </ul>
        </section>
      </div>
      </V2Frame>
      
    </>
  );
}
