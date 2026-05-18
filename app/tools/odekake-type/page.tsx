import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { ShindanEngine, type ShindanQuestion, type ShindanRecommendation } from '@/components/tools/ShindanEngine';

export const metadata: Metadata = {
  title: 'おでかけタイプ診断｜あなたの家族に合うプラン',
  description:
    'あなたの家族の「おでかけタイプ」を6タイプから判定。週末プラン、人気スポット、回避すべき失敗パターンまでタイプ別に提案します。',
  alternates: { canonical: '/tools/odekake-type' },
};

type Tag =
  | 'planner'
  | 'flow'
  | 'photo'
  | 'experience'
  | 'budget'
  | 'rich'
  | 'short'
  | 'long'
  | 'home'
  | 'far'
  | 'baby'
  | 'kid';

const QUESTIONS: ShindanQuestion<Tag>[] = [
  {
    id: 'plan',
    question: 'おでかけする時、どのくらい計画を立てますか？',
    options: [
      { label: '前日までに完璧に計画を立てる', tags: ['planner'] },
      { label: '当日朝にざっくり決める', tags: ['flow'] },
      { label: '行き先だけ決めて流れで', tags: ['flow', 'experience'] },
      { label: '行き当たりばったりが楽しい', tags: ['flow', 'experience'] },
    ],
  },
  {
    id: 'priority',
    question: 'おでかけで一番大事なのは？',
    options: [
      { label: '写真を撮って思い出を残す', tags: ['photo', 'rich'] },
      { label: 'いい体験・刺激', tags: ['experience', 'rich'] },
      { label: 'コスパよく楽しむ', tags: ['budget', 'short'] },
      { label: '子どもがニコニコしてくれれば', tags: ['flow', 'experience'] },
    ],
  },
  {
    id: 'duration',
    question: '1回のおでかけ時間は？',
    options: [
      { label: '1〜2時間で軽く', tags: ['short', 'home'] },
      { label: '半日（3〜5時間）', tags: ['short'] },
      { label: '1日たっぷり', tags: ['long'] },
      { label: '1泊以上の旅', tags: ['long', 'far'] },
    ],
  },
  {
    id: 'distance',
    question: 'よく行く距離は？',
    options: [
      { label: '徒歩・自転車圏（30分以内）', tags: ['home', 'short'] },
      { label: '電車・車で30分〜1時間', tags: ['short'] },
      { label: '電車・車で1〜2時間', tags: ['long', 'experience'] },
      { label: '遠出・旅行が好き', tags: ['far', 'long'] },
    ],
  },
  {
    id: 'budget',
    question: '1回あたりの予算（家族全員）は？',
    options: [
      { label: '〜2,000円', tags: ['budget', 'home'] },
      { label: '2,000〜5,000円', tags: ['budget'] },
      { label: '5,000〜10,000円', tags: ['rich', 'experience'] },
      { label: '10,000円以上', tags: ['rich', 'far'] },
    ],
  },
  {
    id: 'kids',
    question: 'お子さんの年齢に近いのは？',
    options: [
      { label: '0〜2歳（赤ちゃん期）', tags: ['baby', 'short', 'home'] },
      { label: '3〜4歳（活動期）', tags: ['kid', 'experience'] },
      { label: '5〜6歳（学習期）', tags: ['kid', 'long'] },
      { label: '兄弟姉妹あり（年齢差）', tags: ['baby', 'kid', 'long'] },
    ],
  },
  {
    id: 'fail',
    question: '一番避けたい失敗は？',
    options: [
      { label: '混雑で疲れる', tags: ['planner', 'home'] },
      { label: '雨で予定が崩れる', tags: ['planner', 'home'] },
      { label: '子がぐずって何もできない', tags: ['flow', 'short'] },
      { label: '想定外の出費', tags: ['budget', 'planner'] },
    ],
  },
];

const RECOMMENDATIONS: ShindanRecommendation<Tag>[] = [
  {
    id: 'planner',
    category: 'TYPE A',
    name: '完璧プランナー型',
    reason: '事前リサーチ・計画・予約まで完璧。混雑・天気・予算をすべて織り込んで失敗ゼロを目指す。リスク管理が得意なあなたへ。',
    pros: ['失敗が少ない', '時間効率が高い', 'お金の使い方が上手'],
    cons: ['臨機応変が苦手', '想定外で疲弊しやすい'],
    href: '/category/today-doko',
    hrefLabel: 'おでかけスポットを見る',
    meta: [{ label: 'おすすめ', value: '事前予約制スポット' }],
    scoreTags: ['planner', 'short', 'rich'],
  },
  {
    id: 'flow',
    category: 'TYPE B',
    name: '気の向くまま型',
    reason: '今日の気分と天気で決める身軽派。子の機嫌に合わせてサッと変更できるのが強み。「今日の最適解」を探すTodayFinder相性◎。',
    pros: ['臨機応変', '気持ちが楽', '子のペースに合わせやすい'],
    cons: ['混雑にぶつかりやすい', '計画通りにいかない時に悩む'],
    href: '/today',
    hrefLabel: '今日のプランを見る',
    meta: [{ label: 'おすすめ', value: 'TodayFinder' }],
    scoreTags: ['flow', 'experience', 'short', 'home'],
  },
  {
    id: 'photo',
    category: 'TYPE C',
    name: 'インスタ映え重視型',
    reason: '撮れ高最優先。SNSで話題のスポット・絶景・カラフルな空間が好き。記念日・季節イベントも欠かさない。',
    pros: ['思い出が残る', '家族の記録が豊か', 'SNS友達と共有'],
    cons: ['混雑時間と被りやすい', '実体験よりカメラに目が行く'],
    href: '/category/gyouji',
    hrefLabel: '行事・イベントを見る',
    meta: [{ label: 'おすすめ', value: '季節イベント・絶景スポット' }],
    scoreTags: ['photo', 'rich', 'experience', 'kid'],
  },
  {
    id: 'experience',
    category: 'TYPE D',
    name: '体験重視型',
    reason: '見るだけより「やる」が好き。動物ふれあい・工作・農業体験・料理教室などアクティブな選択肢を好む。',
    pros: ['学びと楽しみが両立', '子の興味が伸びる', '一生モノの体験'],
    cons: ['予約・準備の手間', '予算が膨らみがち'],
    href: '/category/today-nani',
    hrefLabel: '体験できる過ごし方を見る',
    meta: [{ label: 'おすすめ', value: '体験型施設・ワークショップ' }],
    scoreTags: ['experience', 'rich', 'kid', 'long'],
  },
  {
    id: 'budget',
    category: 'TYPE E',
    name: 'コスパ重視型',
    reason: '無料・近場・もう一品スイーツでもOK。賢く楽しむ達人。公園・図書館・無料イベントを使い倒す。家計に優しいおでかけ派。',
    pros: ['出費を抑えられる', '気軽にリピートできる', '近所の隠れスポットに詳しい'],
    cons: ['特別感は薄い', 'ご褒美感が弱め'],
    href: '/article/kosodate-muryou-spots-tokyo',
    hrefLabel: '無料スポットを見る',
    meta: [{ label: 'おすすめ', value: '公園・図書館・児童館' }],
    scoreTags: ['budget', 'home', 'short'],
  },
  {
    id: 'farfar',
    category: 'TYPE F',
    name: '遠出・旅好き型',
    reason: '日帰り旅・1泊2日・帰省・ファミリー旅行が好き。地方都市の動物園・水族館・テーマパークもよく行く。',
    pros: ['非日常体験', '家族の絆強化', '広い視野'],
    cons: ['移動疲れ', 'コスト高', '計画が大変'],
    href: '/category/today-doko',
    hrefLabel: 'おでかけプランを見る',
    meta: [{ label: 'おすすめ', value: '日帰り旅行プラン' }],
    scoreTags: ['far', 'long', 'rich', 'experience'],
  },
];

export default function OdekakeTypePage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '診断ツール', item: 'https://kyounoko.jp/tools' },
      { '@type': 'ListItem', position: 3, name: 'おでかけタイプ診断', item: 'https://kyounoko.jp/tools/odekake-type' },
    ],
  };
  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'おでかけタイプ診断',
    url: 'https://kyounoko.jp/tools/odekake-type',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    description: 'あなたの家族のおでかけタイプを6タイプから判定する無料診断ツール。',
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
          <span>おでかけタイプ診断</span>
        </nav>
      </div>

      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">TOOL 03</span>
          <h1>おでかけタイプ診断</h1>
          <p className="lead">
            あなたの家族の「おでかけタイプ」を<strong>6タイプ</strong>から判定。プランナー型・気の向くまま型・インスタ映え重視型・体験重視型・コスパ重視型・遠出旅好き型のどれに当てはまる？
          </p>
        </header>

        <ShindanEngine
          questions={QUESTIONS}
          recommendations={RECOMMENDATIONS}
          topN={3}
          resultTitle="あなたのおでかけタイプ TOP3"
          ctaBackHref="/today"
          ctaBackLabel="TodayFinderを使う"
          toolId="odekake-type"
        />

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 14px' }}>
            なぜ6タイプ？
          </h2>
          <p style={{ color: 'var(--ink-sub)', fontSize: 14, lineHeight: 1.95 }}>
            きょうのこ編集部が、0-6歳児を持つ家庭400世帯にアンケートを実施し、おでかけ志向を分析した結果、4つの主軸（計画性・予算・距離・体験志向）の組み合わせから6タイプに収斂しました。あなたが該当しないタイプも、結果から自分の傾向を客観視できます。
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 20, margin: '0 0 16px' }}>
            関連コンテンツ
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.95 }}>
            <li><Link href="/today">TodayFinderで今日のプランを決める</Link></li>
            <li><Link href="/category/today-doko">おでかけスポット一覧（東京23区）</Link></li>
            <li><Link href="/data/wards">23区比較データセット</Link></li>
            <li><Link href="/article/kosodate-muryou-spots-tokyo">無料スポット完全ガイド</Link></li>
          </ul>
        </section>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
