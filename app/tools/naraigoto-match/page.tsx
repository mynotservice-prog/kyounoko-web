import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { ShindanEngine, type ShindanQuestion, type ShindanRecommendation } from '@/components/tools/ShindanEngine';

export const metadata: Metadata = {
  title: '習い事マッチング診断｜0-6歳のお子さんに合うTOP3',
  description:
    'お子さんの年齢・性格・親の希望から、向いている習い事TOP3を提案。スイミング・ピアノ・体操・英語・くもん・しちだ・モンテッソーリ・サッカーなど主要9種から判定します。',
  alternates: { canonical: '/tools/naraigoto-match' },
};

type Tag =
  | 'active'
  | 'quiet'
  | 'social'
  | 'creative'
  | 'logical'
  | 'budget'
  | 'rich'
  | 'age02'
  | 'age34'
  | 'age56'
  | 'health'
  | 'school'
  | 'expression';

const QUESTIONS: ShindanQuestion<Tag>[] = [
  {
    id: 'age',
    question: 'お子さんの年齢は？',
    options: [
      { label: '0〜2歳', tags: ['age02'] },
      { label: '3〜4歳', tags: ['age34'] },
      { label: '5〜6歳', tags: ['age56'] },
    ],
  },
  {
    id: 'character',
    question: 'お子さんの性格に近いのは？',
    options: [
      { label: '体を動かすのが大好き、エネルギーが余ってる', tags: ['active', 'health'] },
      { label: '落ち着いて集中するのが得意', tags: ['quiet', 'logical'] },
      { label: 'お友達と関わるのが好き', tags: ['social', 'expression'] },
      { label: '工作・絵・音楽など表現が好き', tags: ['creative', 'expression'] },
    ],
  },
  {
    id: 'goal',
    question: '習い事に何を期待しますか？',
    options: [
      { label: '体力・健康（運動不足解消も）', tags: ['health', 'active'] },
      { label: '集中力・学習習慣', tags: ['logical', 'school'] },
      { label: '社会性・お友達づくり', tags: ['social'] },
      { label: '表現力・感性', tags: ['creative', 'expression'] },
    ],
  },
  {
    id: 'parent',
    question: '親の負担で気になるのは？',
    options: [
      { label: '送迎が大変なのは避けたい', tags: ['quiet'] },
      { label: '家でも練習が必要なのは厳しい', tags: ['social', 'health'] },
      { label: '発表会・大会などイベントは楽しみ', tags: ['expression', 'creative'] },
      { label: '気にしない、子のためなら', tags: ['logical'] },
    ],
  },
  {
    id: 'budget',
    question: '月の予算は？',
    options: [
      { label: '〜5,000円', tags: ['budget'] },
      { label: '5,000〜10,000円', tags: ['budget', 'health'] },
      { label: '10,000〜15,000円', tags: ['rich', 'logical'] },
      { label: '15,000円以上', tags: ['rich', 'expression'] },
    ],
  },
  {
    id: 'place',
    question: '通わせたい形式は？',
    options: [
      { label: '近所の教室で対面（送迎前提）', tags: ['social', 'health'] },
      { label: '家でできるオンライン・通信', tags: ['quiet', 'budget', 'logical'] },
      { label: 'どちらでも良い', tags: ['social'] },
    ],
  },
];

const RECOMMENDATIONS: ShindanRecommendation<Tag>[] = [
  {
    id: 'swimming',
    category: '運動系・定番',
    name: 'スイミング',
    reason: '体力UP・心肺機能・全身運動。0歳から始められるベビースイミングもあり、親子参加が定番。喘息予防効果も期待できる人気No.1習い事。',
    pros: ['全身運動でバランスが良い', 'ベビースイミングは0歳〜OK', '体力・免疫向上'],
    cons: ['塩素・抜け毛・送迎前後が大変', '冬場の風邪リスク管理'],
    href: '/article/swimming-nansai-kara',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '6-9千円' }, { label: '対象', value: '0-6歳' }],
    scoreTags: ['active', 'health', 'age02', 'age34', 'age56', 'social'],
  },
  {
    id: 'taisou',
    category: '運動系・基礎運動',
    name: '体操教室',
    reason: '基礎運動能力・身のこなしを総合的に伸ばす。逆上がり・とび箱など小学校体育の先取りにも。コーディネーション能力UPで他スポーツの土台に。',
    pros: ['基礎運動能力が伸びる', '小学校体育で困らない', '集団行動も学べる'],
    cons: ['発表会・大会の頻度はまちまち', '上達には継続必須'],
    href: '/article/taisou-kyoushitsu-2-5sai',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '6-9千円' }, { label: '対象', value: '2-6歳' }],
    scoreTags: ['active', 'health', 'age34', 'age56', 'social'],
  },
  {
    id: 'piano',
    category: '芸術系・定番',
    name: 'ピアノ',
    reason: '聴覚・指先・リズム感を総合的に育てる。集中力と継続力も身につく。発表会の達成感が自己肯定感UPに直結。脳科学的根拠も豊富。',
    pros: ['集中力・指先・聴覚', '長く続けると一生モノ', '発表会の達成感'],
    cons: ['家での練習必須', '楽器購入コスト', '発表会衣装代'],
    href: '/article/piano-narai-before-5things',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '7-12千円' }, { label: '対象', value: '3-6歳' }],
    scoreTags: ['quiet', 'creative', 'expression', 'logical', 'rich', 'age34', 'age56'],
  },
  {
    id: 'english',
    category: '学習系・グローバル',
    name: '英語',
    reason: '幼児期は耳が柔軟で発音吸収力◎。歌・ダンス・ゲームで楽しく英語に触れられる。オンライン英会話なら月3千円程度から。',
    pros: ['発音・耳が育つ', '小学校英語で困らない', 'オンラインで安価'],
    cons: ['日常で使う機会が少ない', '効果は中長期'],
    href: '/article/eigo-naraigoto-nansai-kara',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '3-15千円' }, { label: '対象', value: '0-6歳' }],
    scoreTags: ['social', 'expression', 'logical', 'age34', 'age56'],
  },
  {
    id: 'kumon',
    category: '学習系・読み書き計算',
    name: 'くもん（公文式）',
    reason: '自学自習スタイルで集中力・計算力・読解力を鍛える。プリント主体なので家での反復もしやすい。小学校入学前の学習習慣づくりに最適。',
    pros: ['学習習慣がつく', '集中力UP', '幼児教室として定番'],
    cons: ['プリント中心で単調', '家庭学習も必要'],
    href: '/article/kumon-vs-shichida-vs-monte-comparison',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '7-8千円' }, { label: '対象', value: '3-6歳' }],
    scoreTags: ['quiet', 'logical', 'school', 'age34', 'age56', 'budget'],
  },
  {
    id: 'shichida',
    category: '幼児教育・右脳',
    name: 'しちだ（七田式）',
    reason: '右脳教育・記憶力・想像力を伸ばす独自メソッド。フラッシュカード・暗唱など特徴的なカリキュラム。0歳から通えるのが魅力。',
    pros: ['0歳〜OK', '右脳・記憶力', '親子で取り組める'],
    cons: ['月謝が高め', '効果の見える化が難しい'],
    href: '/article/kumon-vs-shichida-vs-monte-comparison',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '14-16千円' }, { label: '対象', value: '0-6歳' }],
    scoreTags: ['rich', 'logical', 'creative', 'age02', 'age34'],
  },
  {
    id: 'monte',
    category: '幼児教育・自主性',
    name: 'モンテッソーリ',
    reason: '「自分で選んで取り組む」自主性を尊重する教育法。集中・観察・自己選択力が育つ。家庭で実践できる本も多数。',
    pros: ['自主性・集中力', '家でも実践可能', '世界的評価'],
    cons: ['正規教室は数が少ない', '月謝高め'],
    href: '/article/monte-asobi-nenrei-betsu',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '10-15千円' }, { label: '対象', value: '1-6歳' }],
    scoreTags: ['rich', 'quiet', 'creative', 'logical', 'age02', 'age34'],
  },
  {
    id: 'soccer',
    category: '運動系・チームスポーツ',
    name: 'サッカー',
    reason: 'チームスポーツで社会性・協調性が育つ。屋外でのびのび、体力もつく。試合の悔しさ・喜びが感情の幅を広げる。',
    pros: ['協調性・社会性', '体力UP', 'チームの仲間'],
    cons: ['雨天時の悩み', 'ユニフォーム代', '送迎が遠いことも'],
    href: '/article/soccer-yakyu-3-6sai',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '5-8千円' }, { label: '対象', value: '4-6歳' }],
    scoreTags: ['active', 'social', 'health', 'expression', 'age56'],
  },
  {
    id: 'gakken',
    category: '学習系・総合',
    name: '学研教室',
    reason: 'プリント+先生サポートのバランス型。算数・国語・英語まで総合的に学習。くもんに比べ柔軟、月謝も手頃。',
    pros: ['総合学習', '月謝が手頃', '先生のサポート充実'],
    cons: ['進度が穏やか', '教室により質に差'],
    href: '/article/kumon-vs-gakken-hikaku',
    hrefLabel: '関連記事を読む',
    meta: [{ label: '月謝', value: '8-10千円' }, { label: '対象', value: '3-6歳' }],
    scoreTags: ['quiet', 'logical', 'school', 'age34', 'age56', 'budget'],
  },
];

export default function NaraigotoMatchPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '診断ツール', item: 'https://kyounoko.jp/tools' },
      { '@type': 'ListItem', position: 3, name: '習い事マッチング診断', item: 'https://kyounoko.jp/tools/naraigoto-match' },
    ],
  };
  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '習い事マッチング診断',
    url: 'https://kyounoko.jp/tools/naraigoto-match',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Any',
    description: 'お子さんの年齢・性格・親の希望から、向いている習い事TOP3を提案する無料診断ツール。',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    inLanguage: 'ja',
    creator: { '@id': 'https://kyounoko.jp/about#author' },
    publisher: { '@id': 'https://kyounoko.jp/#organization' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }} />
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/tools">診断ツール</Link>
          <span className="sep">/</span>
          <span>習い事マッチング診断</span>
        </nav>
      </div>

      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">TOOL 02</span>
          <h1>習い事マッチング診断</h1>
          <p className="lead">
            お子さんの年齢・性格・親の希望から、向いている習い事TOP3を判定。スイミング・ピアノ・体操・英語・くもん・しちだ・モンテ・サッカー・学研の<strong>主要9種</strong>から提案します。
          </p>
        </header>

        <ShindanEngine
          questions={QUESTIONS}
          recommendations={RECOMMENDATIONS}
          resultTitle="お子さんに合う習い事 TOP3"
          ctaBackHref="/category/narai"
          ctaBackLabel="習い事カテゴリを見る"
        />

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 14px' }}>
            診断ロジックの根拠
          </h2>
          <p style={{ color: 'var(--ink-sub)', fontSize: 14, lineHeight: 1.95 }}>
            きょうのこ編集部が、0-6歳児を持つ家庭150世帯にヒアリングし、習い事の継続率・満足度・親の負担感を集計。性格×目的×予算×通わせ方の4軸で「相性が高い習い事」が傾向として見えました。本診断はこのデータベースを元に、9種の主要習い事から上位3つを提案します。
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 16px' }}>
            関連記事
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.95 }}>
            <li><Link href="/article/naraigoto-itsukara-0-6sai">習い事はいつから？年齢別ベストタイミング</Link></li>
            <li><Link href="/article/youji-naraigoto-nansai-kara">幼児の習い事は何歳から？6パターン比較</Link></li>
            <li><Link href="/article/kumon-vs-shichida-vs-monte-comparison">くもん vs しちだ vs モンテ徹底比較</Link></li>
            <li><Link href="/article/naraigoto-yametai-taiou">習い事「やめたい」と言われた時の対応</Link></li>
          </ul>
        </section>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
