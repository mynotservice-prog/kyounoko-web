/**
 * 特集ページの定義データ。
 *
 * リメギフ手法 Tier 3 #11（特集ページ大量追加）の kyounoko 流移植。
 * /feature/<slug> で公開する大型キュレーションページ。
 * 各特集は Article + Spot を横断キュレーションし、CollectionPage + FAQPage
 * JSON-LD を出して検索流入とAIO回答精度を上げる。
 *
 * 特集追加の手順:
 *   1. このファイルに FEATURE_PAGES エントリを追加
 *   2. sitemap.ts は generateStaticParams 経由で自動反映
 *   3. デプロイ後に IndexNow 送信
 */
import type { Spot } from './spots';

export type FeatureFilter = (spot: Spot) => boolean;

export type FeaturePage = {
  slug: string;
  title: string;
  hero: string;
  lede: string;
  /** 本文上部のリード説明（200-400字） */
  intro: string;
  /** 関連記事の slug（順番が表示順）。実在チェックはせず lib/articles の存在に依存 */
  articleSlugs: string[];
  /** スポットフィルタ。指定されない場合はスポット枠を出さない */
  spotFilter?: FeatureFilter;
  /** 表示件数 */
  maxSpots?: number;
  /** カテゴリチップ */
  themeTags: string[];
  /** FAQ */
  faq: Array<{ question: string; answer: string }>;
};

const isFreeSpot = (s: Spot) => s.budget === 'free';
const isIndoor = (s: Spot) => s.place === 'indoor' || s.place === 'mixed';
const isBabyOk = (s: Spot) => s.ages.includes('0-1');
const isSummerCool = (s: Spot) => Boolean(s.summerCool);
const hasWaterPlay = (s: Spot) => Boolean(s.waterPlay);

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: 'summer-vacation-kids',
    title: '【2026年】夏休み子連れおでかけ完全ガイド｜涼しい・水遊び・無料スポット',
    hero: '/hero/home-cozy-02.webp',
    lede: '夏休み40日間を乗り切る、子連れでのおでかけ・水遊び・涼しい屋内スポットと家遊びアイデア集。',
    intro:
      '夏休みは長丁場の40日間。0〜6歳の子どもと毎日「今日どこ行く？」を考え続けるのは想像以上に消耗します。きょうのこ編集部では、暑さ対策・水遊び・室内のクールスポット・無料で遊べる場所・家でできる工作や遊びまで、夏休みに役立つ情報を1ページにまとめました。朝の涼しいうちに公園、日中は屋内施設、夕方は水遊びという「3部構成の1日」が最も無理なく続きます。体調管理を最優先に、できる限り「親が楽できる選択肢」を組み合わせるのがコツです。',
    articleSlugs: [
      'jabujabuike-mizuasobi-tokyo-30',
      'jabujabu-ike-mizuasobi-zenkoku-2026natsu',
      'natsuyasumi-keikaku-2026-kodzure',
      'amenohi-indoor-spots-tokyo-15',
      'kodomo-hiyakedome-osusume-2026',
      'kodomo-mushiyoke-3shurui-hikaku-real',
      'katei-pool-osusume-ranking-2026',
      'mizuasobi-omocha-osusume-2026',
      'kodomo-suitou-mugicha-pitcher-2026',
    ],
    spotFilter: (s) => isSummerCool(s) || hasWaterPlay(s),
    maxSpots: 12,
    themeTags: ['夏休み', '水遊び', '涼しい屋内', '無料スポット', '熱中症対策'],
    faq: [
      {
        question: '夏休みの平日、子どもと毎日どう過ごすのが現実的ですか？',
        answer:
          '「午前は外（公園・水遊び）→ 昼は家で休憩 → 午後は屋内（児童館・図書館）」の3部構成を基本パターンに固定すると、献立感覚で曜日ごとに組み合わせやすくなります。週に1回は「動かない日」を意図的に作るのがコツ。',
      },
      {
        question: '猛暑日でも子どもを外に連れて行くべきですか？',
        answer:
          '気象庁の暑さ指数（WBGT）が31以上の日は屋外活動を避けるのが推奨されています。早朝（〜9時）か夕方（17時以降）の短時間外遊びと、日中の屋内活動の組み合わせが安全です。',
      },
      {
        question: '水遊びは何歳から、どの程度の準備が必要？',
        answer:
          '0歳後半からビニールプールでの水遊びデビューが可能。水温・気温・滞在時間（最大30分）を意識しつつ、日陰・水分・着替えの3点を準備すれば家でも十分楽しめます。',
      },
      {
        question: '夏休みの旅行・帰省で気をつけることは？',
        answer:
          '移動の長時間化に備えて、車内・新幹線内での暇つぶしグッズ（シール・絵本・タブレット）を年齢別に2〜3点用意。到着後の初日は予定を入れず「移動疲れ回復日」にすると後半が崩れません。',
      },
    ],
  },
  {
    slug: 'rainy-day-indoor',
    title: '【2026年】雨の日の子連れおでかけ＆家遊び総まとめ｜0〜6歳向け',
    hero: '/hero/home-cozy-02.webp',
    lede: '雨の日に子どもと過ごせる屋内スポット・家でできる遊び・準備しておきたいレイングッズを編集部が整理。',
    intro:
      '雨の日はおでかけ先の選択肢が一気に減り、家で過ごす時間も長くなります。きょうのこ編集部では、ベビーカーで濡れずに入れる屋内施設、家で短時間で盛り上がる遊び、雨用のレイングッズなど、雨の日の「困った」を解消する情報をまとめました。屋内施設は土日に集中するため、開店直後または平日午後が狙い目。家遊びは「動く系・座る系・親子協同系」の3タイプをローテーションすると飽きません。',
    articleSlugs: [
      'amenohi-indoor-spots-tokyo-15',
      'amenohi-ie-asobi-2-3sai',
      'amenohi-ie-asobi-4-6sai',
      'amenohi-stroller-spots-tokyo',
    ],
    spotFilter: (s) => isIndoor(s),
    maxSpots: 12,
    themeTags: ['雨の日', '屋内遊び場', 'ベビーカーOK', '家遊び'],
    faq: [
      {
        question: '雨の日、ベビーカーで快適に過ごせる屋内スポットは？',
        answer:
          '商業施設内のキッズスペース、児童館、屋内型遊戯施設（アネビートリムパーク等）、博物館・水族館がベビーカーで入りやすい代表例。最寄り駅から雨に濡れず到達できる「駅直結」を最優先で選ぶと往復のストレスがありません。',
      },
      {
        question: '家で2〜3時間飽きずに遊ぶには？',
        answer:
          '「身体を動かす遊び（10〜15分）→ 集中する遊び（20〜30分）→ 一緒に絵本（15分）」を1セットにしてローテーションすると、子どもも親も疲れにくいです。テレビ・タブレットは1回30分以内の補助役に。',
      },
      {
        question: '雨の日に役立つレイングッズの選び方は？',
        answer:
          'ベビーカー用レインカバーは全面透明＋通気口あり、子どもの長靴は丈長め＋着脱しやすいタイプ、レインコートはランドセル対応サイズが目安。3点セットを玄関に常備すると急な雨でも慌てません。',
      },
      {
        question: '雨で1日中家にいると気分が滅入る対策は？',
        answer:
          '「お風呂を昼間に長めに入る」「夕方に布団で映画タイム」など、いつもと違う時間の使い方を意図的に組み込むと、雨の日特有の閉塞感が和らぎます。',
      },
    ],
  },
  {
    slug: 'free-spots',
    title: '【2026年】無料で楽しめる子連れスポットまとめ｜入園料0円で1日遊べる場所',
    hero: '/hero/home-cozy-02.webp',
    lede: '入園料・利用料が無料でも満足度の高い、0〜6歳向けの子連れスポットを編集部が厳選。',
    intro:
      'スポット選びで「入園料が高い」と二の足を踏むこと、ありませんか。きょうのこ編集部では、入園料0円でも1日たっぷり遊べる、大型公園・地域の児童館・無料の博物館・モール内キッズスペース・水遊び場などを横断的に紹介します。無料スポットは「予算を気にせず行ける」だけでなく、混雑時にも撤退しやすく親子のストレスが少ないのが最大のメリット。週末のお出かけ候補リストに加えてみてください。',
    articleSlugs: [
      'kosodate-muryou-spots-tokyo',
    ],
    spotFilter: isFreeSpot,
    maxSpots: 18,
    themeTags: ['無料', '公園', '児童館', '水遊び', '節約'],
    faq: [
      {
        question: '無料スポットだけで1日遊べますか？',
        answer:
          '大型公園は半日〜1日遊べる遊具と広場があり、近くに無料の児童館や図書館を組み合わせれば1日無料で過ごすことも十分可能です。お弁当持参で食費も抑えると、家族4人で1日500円以下も実現します。',
      },
      {
        question: '無料の水遊び場の選び方は？',
        answer:
          '自治体の公式サイトで「じゃぶじゃぶ池」「親水公園」を検索すると、その地域の無料水遊びスポットが見つかります。水深10〜30cmの浅瀬で、監視員が常駐するエリアを優先するのが安心。',
      },
      {
        question: '無料のキッズスペースはどこにある？',
        answer:
          '大型商業施設（イオン・ららぽーと・三井ショッピングパーク等）の多くが無料のキッズスペースを設置。雨の日にも使え、ベビーカー・授乳室完備の所が多く、急な天候変化のバックアップにも最適です。',
      },
      {
        question: '無料スポットでも気をつけることは？',
        answer:
          '無料スポットは平日でも一定の混雑があるため、開店直後または夕方近くの時間帯が比較的快適。トイレ・授乳室の位置、ベビーカー動線、近隣のコンビニ・カフェの場所を事前に把握しておくと滞在の質が上がります。',
      },
    ],
  },
  {
    slug: 'baby-friendly',
    title: '【2026年】0〜1歳の赤ちゃんとお出かけOKな子連れスポット完全ガイド',
    hero: '/hero/home-cozy-02.webp',
    lede: 'ベビーカーで入れる・授乳室あり・短時間滞在OKな、0〜1歳の赤ちゃん連れ向けスポットを編集部が選定。',
    intro:
      '0〜1歳の赤ちゃんとのお出かけは、授乳・おむつ替え・お昼寝のリズムを優先しつつ、滞在時間も短めに。きょうのこ編集部では、ベビーカーで館内まで入れる、授乳室とおむつ替え台が両方ある、短時間（1〜2時間）で満足できる、騒音・人混みが少ない、という4条件を満たすスポットを集めました。「行ってみて困った」が起きないよう、編集部の現地メモも合わせて掲載しています。',
    articleSlugs: [
      'akachan-odekake-3months-1year',
      'akachan-15pun-asobi',
      'amenohi-stroller-spots-tokyo',
    ],
    spotFilter: (s) =>
      isBabyOk(s) &&
      Boolean(s.facilities?.diaperChange === 'yes') &&
      Boolean(s.facilities?.nursingRoom === 'yes'),
    maxSpots: 12,
    themeTags: ['0歳OK', '1歳OK', 'ベビーカー', '授乳室', 'おむつ替え'],
    faq: [
      {
        question: '0〜1歳のお出かけは何分くらいが適切？',
        answer:
          '生後3〜6ヶ月は移動含めて2時間以内、6〜12ヶ月は3時間以内が体力的に無理のない上限です。お昼寝のタイミングを2回経由しないよう、午前または夕方の単発外出を基本に。',
      },
      {
        question: '授乳室・おむつ替え台がある所の見極め方は？',
        answer:
          '大型商業施設・駅ビル・百貨店は高確率で完備。動物園・水族館も多くが対応。屋内型遊戯施設・小規模カフェは要事前確認。事前に施設公式サイトの「赤ちゃん連れの方へ」ページを確認するのが確実です。',
      },
      {
        question: 'ベビーカーで館内まで入れるかどうかの判断は？',
        answer:
          'バリアフリー対応の表示があれば原則OK。エレベーターの有無・通路幅・段差の有無を事前確認。難しそうな施設は抱っこ紐+ベビーカー待機の2段階運用に切り替えると安心です。',
      },
      {
        question: '人混みを避けたい時期と時間帯は？',
        answer:
          '土日祝の11〜14時が最も混雑するため、平日午前または土日の開店直後（10時頃）を狙うと比較的快適。GW・夏休み・年末年始のピーク日は無理に外出せず、家で過ごすか日帰り近所で済ませるのが現実的です。',
      },
    ],
  },
];

export function getFeaturePageBySlug(slug: string): FeaturePage | undefined {
  return FEATURE_PAGES.find((f) => f.slug === slug);
}
