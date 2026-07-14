/**
 * 子連れ向けイベントデータ管理。
 *
 * 設計方針:
 * - Walker Plus 等の他社サイトの内容は転載しない。kyounoko 編集部が
 *   独自に確認・整理したイベント情報のみ掲載する。
 * - 日付ベースで「現在開催中 / 今週 / 来週 / 今月」を自動抽出する API を提供。
 * - スポットや特集ページから「このエリアの今週のイベント」として引ける。
 * - SEO: /event/[slug] で個別ページ、/events で一覧。Event JSON-LD 出力。
 *
 * データソース:
 *   ここに配列で直接定義する（運営が手動メンテ）。
 *   microCMS 化する場合は将来このファイルを置き換えれば呼び出し側は変更不要。
 */

import { AREAS, type AreaSlug } from './area';
import { BUNDLED_EVENT_OVERRIDES, type EventOverridesMap } from './event-overrides';

export type EventCategory =
  | 'matsuri'       // 祭り・縁日
  | 'illumination'  // イルミネーション
  | 'workshop'      // ワークショップ
  | 'rinyushoku'    // 離乳食教室
  | 'rhythm'        // リトミック
  | 'reading'       // 読み聞かせ
  | 'sport'         // スポーツイベント
  | 'seasonal'      // 季節催事（節分・七夕・ハロウィン等）
  | 'market'        // マルシェ・物販
  | 'show'          // ショー・人形劇
  | 'other';

export type EventEntry = {
  /** URL slug（英数 + ハイフン） */
  slug: string;
  /** 表示名 */
  title: string;
  /** 短い説明（一覧用、80-120 字） */
  lede: string;
  /** カテゴリ */
  category: EventCategory;
  /** 開催開始日（YYYY-MM-DD） */
  startDate: string;
  /** 開催終了日（YYYY-MM-DD）。1日完結なら startDate と同じ */
  endDate: string;
  /** 開催場所の表示名（例: 'サンシャインシティ 文化会館 4F'） */
  venue: string;
  /** エリア slug（都道府県レベル） */
  area: AreaSlug;
  /** 区市町村名（任意） */
  city?: string;
  /** 対象年齢の表示文字列（例: '0〜6歳' '3歳以上'） */
  ageLabel?: string;
  /** 料金表示文字列（例: '無料' '大人500円・子ども無料'） */
  price?: string;
  /** 公式サイト URL */
  officialUrl?: string;
  /** 詳細記事の slug（特集記事 or 記事に飛ばす場合）。なければ /event/[slug] 内で完結 */
  articleSlug?: string;
  /** ヒーロー画像のパス。/hero-ai/ 配下推奨 */
  hero?: string;
  /** タグ */
  tags?: string[];
  /** 編集部のひとことメモ */
  note?: string;
  /**
   * 毎年くり返し開催される行事（祭り・花火・水族館ナイト・開山など）。
   * 'annual' を付けると、期限切れになっても削除せず翌年の日付に繰り上げて再利用する。
   * scripts/events-maintenance.mjs が繰り上げ候補として一覧化する。
   */
  recurring?: 'annual';
};

/**
 * イベントデータ本体。運営が随時追加・更新する。
 * 期限切れになったら手動 or スクリプトで削除する想定。
 *
 * **書き方**: 編集部が一次確認したイベントのみ。情報源（公式サイト）を
 * 必ず officialUrl に入れること。
 */
/**
 * 実イベント（編集部キュレーション）。
 * 各イベントの基本情報（タイトル・日付・会場）は公式発表ベース。
 * 説明文（lede / note）は編集部オリジナル。情報源は officialUrl 参照。
 * 期限切れになったら手動で削除する想定。
 */
export const EVENTS: EventEntry[] = [
  // ===== 関東圏の長期開催イベント（子連れOK） =====
  {
    slug: 'doraemon-friends-tokyo-2026',
    title: '100％ドラえもん＆フレンズ in 東京',
    lede: 'ドラえもん史上最大規模の体験型展覧会。45巻全話から厳選した名シーンの3Dプロジェクションマッピングなど、未就学児から小学生まで親子で楽しめる空間です。',
    category: 'show',
    startDate: '2026-03-27',
    endDate: '2026-09-30',
    venue: 'TOKYO DREAM PARK（東京ドリームパーク）',
    area: 'tokyo',
    city: '江東区',
    ageLabel: '3歳〜小学生',
    price: '公式サイトをご確認ください',
    officialUrl: 'https://100doraemon-friends.com/',
    hero: '/hero-ai/cat-kid-02.webp',
    tags: ['キャラクター', '体験型', '雨の日OK', '室内'],
    note: 'お台場エリアの大型イベント。ベビーカーで入場可能で、平日午前が比較的空いています。',
  },
  {
    slug: 'pixar-world-tokyo-2026',
    title: 'ピクサーの世界展 — あなたが夢見た物語の世界へ',
    lede: 'トイ・ストーリーやモンスターズ・インクなどピクサー映画の世界に入り込める没入型展覧会。映像と造形で再現された名シーンは大人も子どもも夢中になります。',
    category: 'show',
    startDate: '2026-04-01',
    endDate: '2026-10-12',
    venue: 'CREVIA BASE Tokyo',
    area: 'tokyo',
    city: '江東区',
    ageLabel: '4歳〜小学生',
    price: '公式サイトをご確認ください',
    officialUrl: 'https://pixar-tokyo.jp/',
    hero: '/hero-ai/cat-family-02.webp',
    tags: ['映画', '体験型', '雨の日OK', '室内'],
    note: '市場前駅から徒歩。映像の暗いシーンは0〜2歳には怖い場面もあるので、4歳以上推奨。',
  },
  {
    slug: 'hogwarts-syoutaijou-tokyo-2026',
    title: 'ホグワーツからの招待状（スタジオツアー東京 特別企画）',
    lede: '「ハリー・ポッターと賢者の石」の世界を追体験できる特別企画。映画ファンの家族や、初めての魔法体験に挑戦したい子におすすめ。',
    category: 'show',
    startDate: '2026-03-18',
    endDate: '2026-09-06',
    venue: 'ワーナー ブラザース スタジオツアー東京',
    area: 'tokyo',
    city: '練馬区',
    ageLabel: '5歳〜小学生',
    price: '公式サイトをご確認ください',
    officialUrl: 'https://www.wbstudiotour.jp/',
    hero: '/hero-ai/cat-kid-03.webp',
    tags: ['映画', '体験型', '室内', '雨の日OK'],
    note: '所要時間は3〜4時間。豊島園駅直結でベビーカー入場可。お昼を挟む場合は事前予約推奨。',
  },
  // ===== 神奈川・横浜 =====
  {
    slug: 'yokohama-kodomonokuni-summer',
    title: 'こどもの国 初夏のミルクプラント体験',
    lede: '横浜「こどもの国」内の牧場で、牛の乳しぼり体験やソフトクリーム作りに親子で参加できます。動物と触れ合いたい子におすすめ。',
    category: 'workshop',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    venue: 'こどもの国',
    area: 'kanagawa',
    city: '横浜市',
    ageLabel: '3歳〜小学生',
    price: '入園料 大人600円・小中学生200円・幼児100円（体験は別途）',
    officialUrl: 'https://www.kodomonokuni.org/',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['動物', '体験型', '屋外'],
    note: 'こどもの国駅から徒歩3分。広大な園内なのでベビーカー＋帽子＋飲み物必須。',
  },
  // ===== 埼玉 =====
  {
    slug: 'saitama-tetsudo-hakubutsukan',
    title: '鉄道博物館 特別企画展（夏季）',
    lede: '実物大の車両展示や運転シミュレーターで、電車好きの子なら丸一日遊べる王道スポット。夏休みは特別企画展も毎年開催。',
    category: 'show',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    venue: '鉄道博物館（てっぱく）',
    area: 'saitama',
    city: 'さいたま市',
    ageLabel: '0〜小学生',
    price: '大人 1,600円・小中高生 600円・幼児 300円',
    officialUrl: 'https://www.railway-museum.jp/',
    hero: '/hero-ai/cat-classroom-02.webp',
    tags: ['鉄道', '体験型', '室内', '雨の日OK'],
    note: '大宮駅からニューシャトル1駅。シミュレーターは事前抽選。授乳室・キッズスペース完備。',
  },

  // ===== 東京 23区 — 大型施設 =====
  {
    slug: 'sunshine-aquarium-summer-night',
    title: 'サンシャイン水族館 夜の水族館 2026',
    lede: '日没後の特別演出で、昼とは全く違う幻想的な水中世界が楽しめる夏の恒例イベント。',
    category: 'show',
    startDate: '2026-07-12', endDate: '2026-09-23',
    venue: 'サンシャイン水族館', area: 'tokyo', city: '豊島区',
    ageLabel: '0〜小学生', price: '大人 2,800円・小学生 1,400円・幼児 800円',
    officialUrl: 'https://sunshinecity.jp/aquarium/',
    hero: '/hero-ai/tokyo-toshima-ikebukuro-rain.webp',
    tags: ['水族館', '夜', '室内'],
    note: '池袋駅から徒歩8分。ベビーカー入場可、屋上エリアは雨具推奨。',
  },
  {
    slug: 'ueno-zoo-summer-camp',
    title: '上野動物園 サマースクール',
    lede: '飼育員さんから動物の暮らしを直接学べる夏休み特別プログラム。観察ノートをもらって園内を回ります。',
    category: 'workshop',
    startDate: '2026-07-20', endDate: '2026-08-31',
    venue: '恩賜上野動物園', area: 'tokyo', city: '台東区',
    ageLabel: '4歳〜小学生', price: '大人 600円・中学生 200円・小学生以下 無料',
    officialUrl: 'https://www.tokyo-zoo.net/zoo/ueno/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['動物園', '体験型', '屋外'],
    note: 'JR上野駅徒歩5分。夏は混雑するので朝イチ来園推奨。',
  },
  {
    slug: 'kasai-aquarium-mizukake',
    title: '葛西臨海水族園 夏の水かけイベント',
    lede: '水族館前の広場で水鉄砲・ミスト遊び。0歳〜小学生まで濡れて楽しめる水遊びイベント。',
    category: 'seasonal',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '葛西臨海水族園', area: 'tokyo', city: '江戸川区',
    ageLabel: '0〜小学生', price: '入園無料エリアで開催',
    officialUrl: 'https://www.tokyo-zoo.net/zoo/kasai/',
    hero: '/hero-ai/kasai-aquarium-kosodate.webp',
    tags: ['水遊び', '夏', '屋外', '無料'],
    note: '葛西臨海公園駅徒歩5分。着替え必須、シャワー設備あり。',
  },
  {
    slug: 'kidzania-tokyo-summer',
    title: 'キッザニア東京 夏休み特別プログラム',
    lede: '90種類以上の職業体験ができる屋内テーマパーク。夏休み限定パビリオンも登場。',
    category: 'workshop',
    startDate: '2026-07-20', endDate: '2026-08-31',
    venue: 'キッザニア東京（ららぽーと豊洲内）', area: 'tokyo', city: '江東区',
    ageLabel: '3歳〜小学生', price: '小学生 4,000円〜・幼児 3,000円〜',
    officialUrl: 'https://www.kidzania.jp/tokyo/',
    hero: '/hero-ai/anpanman-vs-kidzania.webp',
    tags: ['職業体験', '室内', '雨の日OK'],
    note: '完全予約制。豊洲駅徒歩8分。ベビーカー預かりあり。',
  },
  {
    slug: 'odaiba-trick-art-summer',
    title: 'お台場トリックアート展',
    lede: '絵の中に入り込んで撮影できる体験型アート展。家族写真を盛りだくさん撮りたい人におすすめ。',
    category: 'show',
    startDate: '2026-06-10', endDate: '2026-08-25',
    venue: 'デックス東京ビーチ', area: 'tokyo', city: '港区',
    ageLabel: '3歳〜小学生', price: '大人 1,200円・小学生 800円・幼児 無料',
    officialUrl: 'https://www.odaiba-decks.com/',
    hero: '/hero-ai/cat-family-03.webp',
    tags: ['アート', '室内', '雨の日OK'],
    note: 'お台場海浜公園駅徒歩2分。フラッシュ撮影OKでSNS映え多数。',
  },
  {
    slug: 'sumida-aquarium-jellyfish',
    title: 'すみだ水族館 クラゲの新展示',
    lede: 'スカイツリータウン内の水族館で、新設された巨大クラゲ水槽がオープン。幻想的な癒しの空間です。',
    category: 'show',
    startDate: '2026-06-01', endDate: '2026-12-31',
    venue: 'すみだ水族館', area: 'tokyo', city: '墨田区',
    ageLabel: '0〜小学生', price: '大人 2,500円・高校生 1,800円・小中学生 1,200円・幼児 800円',
    officialUrl: 'https://www.sumida-aquarium.com/',
    hero: '/hero-ai/cat-family-01.webp',
    tags: ['水族館', '室内', '雨の日OK'],
    note: '押上駅・スカイツリー前駅直結。授乳室・おむつ替え完備。',
  },
  {
    slug: 'kagaku-mirai-kan-robot',
    title: '日本科学未来館 ロボット実演ショー',
    lede: '二足歩行ロボットASIMOの後継機による実演ショー。最先端の技術に小さな子も興奮します。',
    category: 'show',
    startDate: '2026-06-01', endDate: '2026-08-31',
    venue: '日本科学未来館', area: 'tokyo', city: '江東区',
    ageLabel: '3歳〜小学生', price: '大人 630円・18歳以下 210円',
    officialUrl: 'https://www.miraikan.jst.go.jp/',
    hero: '/hero-ai/cat-classroom-03.webp',
    tags: ['科学', '体験型', '室内'],
    note: 'テレコムセンター駅徒歩4分。実演は1日2回、午前到着が安全。',
  },
  {
    slug: 'ghibli-museum-summer-special',
    title: '三鷹の森ジブリ美術館 夏の特別展示',
    lede: 'ジブリ世界に没入できる完全予約制美術館。夏期限定の特別展示は親子で何度行っても楽しい。',
    category: 'show',
    startDate: '2026-06-01', endDate: '2026-09-30',
    venue: '三鷹の森ジブリ美術館', area: 'tokyo', city: '三鷹市',
    ageLabel: '3歳〜小学生', price: '大人 1,000円・中高生 700円・小学生 400円・幼児 100円',
    officialUrl: 'https://www.ghibli-museum.jp/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['美術館', '完全予約制', '室内'],
    note: '完全予約制（毎月10日に翌月分発売）。三鷹駅から直行バスあり。',
  },

  // ===== 東京 — 公園・自然 =====
  {
    slug: 'showa-kinen-park-summer-water',
    title: '昭和記念公園 レインボープール',
    lede: '都内最大級の屋外プール。流れるプール・幼児プール・ウォータースライダーなど多彩。',
    category: 'seasonal',
    startDate: '2026-07-12', endDate: '2026-09-07',
    venue: '国営昭和記念公園', area: 'tokyo', city: '立川市',
    ageLabel: '0〜小学生', price: '大人 2,500円・小中学生 1,400円・幼児 500円',
    officialUrl: 'https://www.showakinen-koen.jp/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['プール', '夏', '屋外'],
    note: '立川駅徒歩10分。幼児用プールは水深30cm、浮き輪持参可。',
  },
  {
    slug: 'mizumoto-park-aji-festival',
    title: '水元公園 あじさい祭り',
    lede: '都内最大の水郷公園で14,000株のあじさいが見頃。広大な芝生でピクニックもできます。',
    category: 'seasonal',
    startDate: '2026-06-06', endDate: '2026-06-21',
    venue: '都立水元公園', area: 'tokyo', city: '葛飾区',
    ageLabel: '0〜小学生', price: '入園無料',
    officialUrl: 'https://www.tokyo-park.or.jp/park/format/index014.html',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['あじさい', '公園', '無料', '屋外'],
    note: '金町駅からバス15分。広い園内なのでベビーカー＋飲み物推奨。【2027年の開催日程は公式未発表。発表され次第、翌年日付へ繰り上げ予定】',
  },
  {
    slug: 'minami-ikebukuro-summer-marche',
    title: '南池袋公園 サマーマルシェ',
    lede: '池袋駅徒歩5分、芝生が気持ちいい公園で開かれる週末マルシェ。キッチンカーやワークショップが並びます。',
    category: 'market',
    startDate: '2026-07-04', endDate: '2026-08-30',
    venue: '南池袋公園', area: 'tokyo', city: '豊島区',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://minamiikebukuropark.jp/',
    hero: '/hero-ai/tokyo-toshima-ikebukuro-rain.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '毎週末開催。芝生でレジャーシート歓迎、ベビーカーOK。',
  },
  {
    slug: 'inokashira-zoo-mini-train',
    title: '井の頭自然文化園 ミニ電車体験',
    lede: '園内をミニ電車で一周できる小さな子に大人気のアトラクション。日本初の屋内動物園併設。',
    category: 'workshop',
    startDate: '2026-06-01', endDate: '2026-09-30',
    venue: '井の頭自然文化園', area: 'tokyo', city: '武蔵野市',
    ageLabel: '0〜小学生', price: '大人 400円・中学生 150円・小学生以下 無料',
    officialUrl: 'https://www.tokyo-zoo.net/zoo/ino/',
    hero: '/hero-ai/cat-kid-02.webp',
    tags: ['動物園', '電車', '屋外'],
    note: '吉祥寺駅徒歩10分。土日はミニ電車に行列、午前推奨。',
  },
  {
    slug: 'yumenoshima-tropical',
    title: '夢の島熱帯植物館 こども縁日',
    lede: 'ジャングルのような温室内で、夏の縁日を再現。輪投げ・水遊び・植物クイズなど親子で楽しめます。',
    category: 'seasonal',
    startDate: '2026-07-22', endDate: '2026-08-25',
    venue: '夢の島熱帯植物館', area: 'tokyo', city: '江東区',
    ageLabel: '0〜小学生', price: '大人 250円・中学生以下 無料',
    officialUrl: 'https://www.yumenoshima.jp/botanicalhall/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['植物', '縁日', '雨の日OK'],
    note: '新木場駅徒歩13分。冷房効いた温室で快適。',
  },

  // ===== 東京 — 室内遊び場・商業施設 =====
  {
    slug: 'tokyo-dome-asobono-summer',
    title: 'ASOBono! 夏休み大型ボールプール拡張',
    lede: '東京ドームシティの室内遊び場が夏休みに合わせてリニューアル。ボールプール3倍増量。',
    category: 'workshop',
    startDate: '2026-07-15', endDate: '2026-08-31',
    venue: '東京ドームシティ ASOBono!', area: 'tokyo', city: '文京区',
    ageLabel: '0〜小学生', price: '平日 930円〜・休日 1,540円〜',
    officialUrl: 'https://www.tokyo-dome.co.jp/asobono/',
    hero: '/hero-ai/cat-home-02.webp',
    tags: ['室内', 'ボールプール', '雨の日OK'],
    note: '水道橋駅徒歩2分。授乳室・離乳食レンジ完備。',
  },
  {
    slug: 'fanfan-okashi-no-machi',
    title: 'ファンファン お菓子の街 体験イベント',
    lede: '実際にお菓子を作って食べられるワークショップ。3歳から1人で参加可能。',
    category: 'workshop',
    startDate: '2026-06-15', endDate: '2026-07-20',
    venue: 'グランベリーパーク', area: 'tokyo', city: '町田市',
    ageLabel: '3歳〜小学生', price: '1,500円〜（材料費込み）',
    officialUrl: 'https://www.granberrypark.com/',
    hero: '/hero-ai/cat-food-01.webp',
    tags: ['お菓子作り', '体験', '室内'],
    note: '南町田グランベリーパーク駅直結。事前予約推奨。',
  },
  {
    slug: 'shibuya-hikarie-kids-museum',
    title: '渋谷ヒカリエ こども博物館 夏休み特別展',
    lede: '渋谷の駅ビルで開催される子ども向け体験博物館。夏休み期間は実験ワークショップが豊富。',
    category: 'workshop',
    startDate: '2026-07-25', endDate: '2026-08-25',
    venue: '渋谷ヒカリエ 8F', area: 'tokyo', city: '渋谷区',
    ageLabel: '3歳〜小学生', price: '入場無料・一部体験有料',
    officialUrl: 'https://www.hikarie.jp/',
    hero: '/hero-ai/cat-kid-01.webp',
    tags: ['体験型', '無料', '室内'],
    note: '渋谷駅直結。授乳室・キッズ用トイレあり。',
  },
  {
    slug: 'roppongi-hills-art-night',
    title: '六本木ヒルズ こどもアートナイト',
    lede: '夜の屋上で星空とアート作品を楽しむ親子イベント。展望台のフロアも特別開放。',
    category: 'show',
    startDate: '2026-08-08', endDate: '2026-08-15',
    venue: '六本木ヒルズ 屋上スカイデッキ', area: 'tokyo', city: '港区',
    ageLabel: '4歳〜小学生', price: '大人 2,000円・小学生 500円',
    officialUrl: 'https://www.roppongihills.com/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['アート', '夜', '室内'],
    note: '六本木駅徒歩3分。雨天時は屋内展示のみ。',
  },
  {
    slug: 'tokyo-station-character-street',
    title: '東京駅 一番街キャラクターウィーク',
    lede: '東京駅地下のキャラクターストリートで、好きなキャラクターのフォトスポットやワークショップが並ぶ。',
    category: 'workshop',
    startDate: '2026-07-23', endDate: '2026-08-31',
    venue: '東京駅一番街', area: 'tokyo', city: '千代田区',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://www.tokyoeki-1bangai.co.jp/',
    hero: '/hero-ai/cat-kid-03.webp',
    tags: ['キャラクター', '無料', '室内'],
    note: '東京駅八重洲口直結。冷房効いてベビーカーOK。',
  },

  // ===== 東京 — 図書館・地域施設 =====
  {
    slug: 'toshima-central-yomi-7gatsu',
    title: '豊島区立中央図書館 7月のえほんの会',
    lede: '雨の日にぴったり、図書館で楽しむ読み聞かせ。終了後は絵本を借りて帰れます。',
    category: 'reading',
    startDate: '2026-07-05', endDate: '2026-07-26',
    venue: '豊島区立中央図書館', area: 'tokyo', city: '豊島区',
    ageLabel: '0〜6歳', price: '無料',
    officialUrl: 'https://www.library.toshima.tokyo.jp/',
    hero: '/hero-ai/library-int.png',
    tags: ['読み聞かせ', '無料', '雨の日OK'],
    note: '東池袋駅徒歩7分。授乳室・おむつ替え台あり。',
  },
  {
    slug: 'setagaya-himawari-festival',
    title: '世田谷区 ひまわり祭り',
    lede: '区内で育てた1万本のひまわりを背景に、子ども向けスタンプラリーや屋台が並びます。',
    category: 'seasonal',
    startDate: '2026-07-25', endDate: '2026-07-26',
    venue: '世田谷公園', area: 'tokyo', city: '世田谷区',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.city.setagaya.lg.jp/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['ひまわり', '無料', '屋外'],
    note: '三軒茶屋駅徒歩15分。日陰少ないので帽子必須。',
  },

  // ===== 東京 — 季節・祭り =====
  {
    slug: 'sumida-river-fireworks-2026',
    title: '隅田川花火大会 2026',
    lede: '東京の夏の風物詩。約2万発の打ち上げ花火を親子で楽しめます。事前にトイレ場所のチェックを。',
    category: 'seasonal',
    startDate: '2026-07-25', endDate: '2026-07-25',
    venue: '隅田川沿い 第一・第二会場', area: 'tokyo', city: '台東区',
    ageLabel: '3歳〜小学生', price: '観覧無料',
    officialUrl: 'https://www.sumidagawa-hanabi.com/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['花火', '夏', '屋外', '無料'],
    note: '浅草駅周辺は大混雑。スカイツリー側の方が比較的見やすい。',
  },
  {
    slug: 'edogawa-fireworks-2026',
    title: '江戸川区花火大会',
    lede: '区民先着順で河川敷の有料席あり。家族でゆったり座って花火を楽しめます。',
    category: 'seasonal',
    startDate: '2026-08-01', endDate: '2026-08-01',
    venue: '江戸川河川敷', area: 'tokyo', city: '江戸川区',
    ageLabel: '3歳〜小学生', price: '無料（有料席別途）',
    officialUrl: 'https://edogawa-hanabi.jp/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['花火', '夏', '屋外', '無料'],
    note: '篠崎駅・小岩駅から徒歩。早めの場所取り推奨。',
  },
  {
    slug: 'jingu-gaien-fireworks-2026',
    title: '神宮外苑花火大会',
    lede: '都心で楽しめる花火大会。神宮球場・秩父宮ラグビー場の有料席は子連れにも安全。',
    category: 'seasonal',
    startDate: '2026-08-22', endDate: '2026-08-22',
    venue: '明治神宮外苑', area: 'tokyo', city: '新宿区',
    ageLabel: '3歳〜小学生', price: '有料席のみ（3,000円〜）',
    officialUrl: 'https://www.jinguhanabi.com/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['花火', '夏', '屋外'],
    note: '信濃町駅徒歩5分。座席指定なのでベビーカー利用しやすい。',
  },
  {
    slug: 'mitama-matsuri-yasukuni',
    title: 'みたままつり（靖国神社）',
    lede: '3万を超える提灯が境内を彩る幻想的な夏祭り。屋台もあり親子で楽しめます。',
    category: 'matsuri',
    startDate: '2026-07-13', endDate: '2026-07-16',
    venue: '靖国神社', area: 'tokyo', city: '千代田区',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://www.yasukuni.or.jp/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['祭り', '夜', '無料'],
    note: '九段下駅徒歩5分。混雑時はベビーカーより抱っこ紐推奨。',
  },
  {
    slug: 'kichijoji-summer-festival',
    title: '吉祥寺秋まつり',
    lede: '吉祥寺の街全体で開催される祭り。子ども神輿・盆踊り・屋台が並びます。',
    category: 'matsuri',
    startDate: '2026-09-12', endDate: '2026-09-13',
    venue: '吉祥寺商店街一帯', area: 'tokyo', city: '武蔵野市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.kichijoji.jp/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['祭り', '無料', '屋外'],
    note: '吉祥寺駅徒歩すぐ。日中の子ども神輿は3-6歳が主役。',
  },

  // ===== 神奈川 =====
  {
    slug: 'yokohama-anpanman-museum',
    title: 'アンパンマンこどもミュージアム 夏休み特別ショー',
    lede: '横浜のアンパンマンミュージアムで、夏休み限定の特別ショー＆スタンプラリー。0-3歳に大人気。',
    category: 'show',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '横浜アンパンマンこどもミュージアム', area: 'kanagawa', city: '横浜市',
    ageLabel: '0〜3歳', price: '入館料 2,200円〜2,600円',
    officialUrl: 'https://www.yokohama-anpanman.jp/',
    hero: '/hero-ai/anpanman-vs-kidzania.webp',
    tags: ['キャラクター', '室内', '雨の日OK'],
    note: '新高島駅徒歩3分。土日は完売多し、平日が狙い目。',
  },
  {
    slug: 'yokohama-zoo-yumi-summer',
    title: 'よこはま動物園ズーラシア 夜の動物園',
    lede: '夜行性動物の活発な姿が見られる夏限定イベント。涼しい夜の散策が親子に好評。',
    category: 'seasonal',
    startDate: '2026-08-08', endDate: '2026-08-16',
    venue: 'よこはま動物園ズーラシア', area: 'kanagawa', city: '横浜市',
    ageLabel: '3歳〜小学生', price: '大人 800円・小中学生 200円・幼児 無料',
    officialUrl: 'https://www.hama-midorinokyokai.or.jp/zoo/zoorasia/',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['動物園', '夜', '夏'],
    note: '中山駅からバス15分。閉園は21:00、ベビーカーレンタル有料。',
  },
  {
    slug: 'enoshima-aquarium-jellyfish',
    title: '新江ノ島水族館 クラゲファンタジー',
    lede: '湘南の海を眼前に望む水族館で、夏限定のクラゲ特別展示。プロジェクションマッピングと音楽の演出。',
    category: 'show',
    startDate: '2026-06-21', endDate: '2026-09-30',
    venue: '新江ノ島水族館', area: 'kanagawa', city: '藤沢市',
    ageLabel: '0〜小学生', price: '大人 2,500円・高校生 1,700円・小中学生 1,200円・幼児 800円',
    officialUrl: 'https://www.enosui.com/',
    hero: '/hero-ai/cat-family-02.webp',
    tags: ['水族館', '室内', '雨の日OK'],
    note: '片瀬江ノ島駅徒歩3分。海岸隣接で湘南観光と組み合わせ可。',
  },
  {
    slug: 'kamakura-asahina-craft',
    title: '鎌倉あさひな工房 夏のものづくり体験',
    lede: '鎌倉の自然の中で陶芸・染め物体験。3歳から大人まで一緒に楽しめます。',
    category: 'workshop',
    startDate: '2026-07-12', endDate: '2026-08-30',
    venue: '鎌倉あさひな工房', area: 'kanagawa', city: '鎌倉市',
    ageLabel: '3歳〜小学生', price: '2,500円〜（材料費込）',
    officialUrl: 'https://www.kamakura-info.jp/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['ものづくり', '体験型', '屋外'],
    note: '鎌倉駅からバス。完全予約制、汚れてもよい服装で。',
  },
  {
    slug: 'kawasaki-fujiko-museum',
    title: '川崎市藤子・F・不二雄ミュージアム 夏季企画展',
    lede: 'ドラえもん原画やキャラクターの世界に浸れるミュージアム。夏休みは特別展示も開催。',
    category: 'show',
    startDate: '2026-07-04', endDate: '2026-09-08',
    venue: '川崎市藤子・F・不二雄ミュージアム', area: 'kanagawa', city: '川崎市',
    ageLabel: '3歳〜小学生', price: '大人 1,000円・中高生 700円・幼児 500円',
    officialUrl: 'https://fujiko-museum.com/',
    hero: '/hero-ai/cat-kid-01.webp',
    tags: ['キャラクター', '室内', '雨の日OK'],
    note: '登戸駅から直行バス。完全日時指定予約制。',
  },
  {
    slug: 'yokohama-baykorter-marche',
    title: '横浜ベイクォーター 夏のキッズマルシェ',
    lede: '海風の気持ちいい商業施設で、毎週末キッズ向けマルシェ。手作り雑貨や夏のおやつが並びます。',
    category: 'market',
    startDate: '2026-07-04', endDate: '2026-09-28',
    venue: '横浜ベイクォーター', area: 'kanagawa', city: '横浜市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.yokohama-bayquarter.com/',
    hero: '/hero-ai/cat-commerce-01.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '横浜駅東口徒歩3分。授乳室・キッズスペース完備。',
  },
  {
    slug: 'hakone-glass-no-mori-summer',
    title: '箱根ガラスの森美術館 夏のサマーガーデン',
    lede: '庭園に展示されたガラスのオブジェがキラキラ輝く夏限定演出。涼しい高原での1日。',
    category: 'show',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '箱根ガラスの森美術館', area: 'kanagawa', city: '足柄下郡',
    ageLabel: '0〜小学生', price: '大人 1,800円・大高生 1,300円・小中学生 600円',
    officialUrl: 'https://www.ciao3.com/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['美術館', '高原', '屋外'],
    note: '箱根湯本駅からバス。標高が高く涼しい、夏の避暑におすすめ。',
  },
  {
    slug: 'sagamihara-aji-festival',
    title: '相模原市 あじさいの里 開花祭',
    lede: '相模原の山あいで30種類15,000株のあじさいを楽しめる季節限定イベント。',
    category: 'seasonal',
    startDate: '2026-06-13', endDate: '2026-06-28',
    venue: '相模原北公園', area: 'kanagawa', city: '相模原市',
    ageLabel: '0〜小学生', price: '入園無料',
    officialUrl: 'https://www.city.sagamihara.kanagawa.jp/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['あじさい', '無料', '屋外'],
    note: '橋本駅からバス20分。坂道多いので抱っこ紐推奨。【2027年の開催日程は公式未発表。発表され次第、翌年日付へ繰り上げ予定】',
  },
  {
    slug: 'yokohama-redbrick-summer',
    title: '横浜赤レンガ倉庫 サマーフェスタ',
    lede: 'レンガ倉庫前広場でキッチンカー・ライブ・キッズワークショップが集合する週末イベント。',
    category: 'market',
    startDate: '2026-07-19', endDate: '2026-08-25',
    venue: '横浜赤レンガ倉庫', area: 'kanagawa', city: '横浜市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.yokohama-akarenga.jp/',
    hero: '/hero-ai/cat-commerce-02.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '馬車道駅徒歩6分。日中は日陰少ない、帽子・水分必須。',
  },

  // ===== 千葉 =====
  {
    slug: 'kasai-funabashi-andersen-summer',
    title: 'ふなばしアンデルセン公園 サマーフェスタ',
    lede: 'トリップアドバイザー国内ランキング上位の常連、子どもの遊び場が広大なテーマパーク。',
    category: 'seasonal',
    startDate: '2026-07-12', endDate: '2026-08-31',
    venue: 'ふなばしアンデルセン公園', area: 'chiba', city: '船橋市',
    ageLabel: '0〜小学生', price: '大人 900円・高校生 600円・小中学生 200円・幼児 100円',
    officialUrl: 'https://www.park-funabashi.or.jp/and/',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['公園', 'アスレチック', '屋外'],
    note: '新京成三咲駅からバス15分。1日では遊びきれない広さ、お弁当持参可。',
  },
  {
    slug: 'kasai-kazoku-park-water',
    title: 'カズーファミリーパーク 夏の水遊び場OPEN',
    lede: '幕張の屋内型遊び場が、夏限定で屋外プールエリアを開放。0歳から楽しめます。',
    category: 'seasonal',
    startDate: '2026-07-12', endDate: '2026-09-15',
    venue: 'カズーファミリーパーク', area: 'chiba', city: '千葉市',
    ageLabel: '0〜小学生', price: '60分 1,500円〜',
    officialUrl: 'https://kazoo.familypark.jp/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['プール', '夏', '屋外'],
    note: '海浜幕張駅徒歩10分。室内エリアも併設で涼める。',
  },
  {
    slug: 'mother-bokujo-summer',
    title: 'マザー牧場 サマーフェスタ',
    lede: '広大な牧場で羊の毛刈り・牛の乳搾り・うさぎ抱っこなど、夏休みの動物体験が大充実。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: 'マザー牧場', area: 'chiba', city: '富津市',
    ageLabel: '0〜小学生', price: '大人 1,800円・小学生 1,000円・幼児 無料',
    officialUrl: 'https://www.motherfarm.co.jp/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['牧場', '動物', '屋外'],
    note: '君津駅からバス35分。広大なので園内バス活用推奨。',
  },
  {
    slug: 'chiba-zoo-night',
    title: '千葉市動物公園 ナイトズー',
    lede: '夜行性動物の活発な姿を観察できる夏限定夜間開園。涼しくて家族連れに人気。',
    category: 'seasonal',
    startDate: '2026-08-08', endDate: '2026-08-16',
    venue: '千葉市動物公園', area: 'chiba', city: '千葉市',
    ageLabel: '3歳〜小学生', price: '大人 700円・中学生以下 無料',
    officialUrl: 'https://www.city.chiba.jp/zoo/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['動物園', '夜', '夏'],
    note: '動物公園駅徒歩1分。20時閉園、虫除けスプレー持参。',
  },
  {
    slug: 'narashino-yatai-festival',
    title: '習志野 おやこ屋台フェス',
    lede: '習志野の公園で開かれる親子向けマルシェ。0歳からのキッズスペースもあります。',
    category: 'market',
    startDate: '2026-07-26', endDate: '2026-07-27',
    venue: '茜浜運動公園', area: 'chiba', city: '習志野市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.city.narashino.lg.jp/',
    hero: '/hero-ai/cat-commerce-01.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '新習志野駅徒歩10分。日陰少ないので熱中症対策必須。',
  },

  // ===== 埼玉 =====
  {
    slug: 'tobu-zoo-summer-pool',
    title: '東武動物公園 プールサマーオープン',
    lede: '動物園＋遊園地＋プールの3in1施設。夏限定で大型プールがオープン、1日では遊びきれません。',
    category: 'seasonal',
    startDate: '2026-07-12', endDate: '2026-09-07',
    venue: '東武動物公園', area: 'saitama', city: '南埼玉郡',
    ageLabel: '0〜小学生', price: '大人 2,400円・小学生 1,200円・幼児 800円',
    officialUrl: 'https://www.tobuzoo.com/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['プール', '動物園', '屋外'],
    note: '東武動物公園駅徒歩10分。動物園とプール両方なら朝イチ来園推奨。',
  },
  {
    slug: 'omiya-bonsai-museum-kids',
    title: '大宮盆栽美術館 こどもガイドツアー',
    lede: '300年の歴史を持つ盆栽の世界を、子ども向けにアレンジしたガイドツアー。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-30',
    venue: 'さいたま市大宮盆栽美術館', area: 'saitama', city: 'さいたま市',
    ageLabel: '4歳〜小学生', price: '大人 310円・高校生 150円・小中学生 100円',
    officialUrl: 'https://www.bonsai-art-museum.jp/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['美術館', '体験型', '雨の日OK'],
    note: '土呂駅徒歩5分。屋内中心で雨の日も安心。',
  },
  {
    slug: 'kawagoe-summer-festa',
    title: '小江戸川越 夏祭り',
    lede: '蔵造りの街並みで開かれる夏祭り。山車巡行・盆踊り・縁日が並び、浴衣で散策にぴったり。',
    category: 'matsuri',
    startDate: '2026-07-19', endDate: '2026-07-20',
    venue: '川越市街地', area: 'saitama', city: '川越市',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://www.koedo.or.jp/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['祭り', '夏', '屋外', '無料'],
    note: '川越駅徒歩15分。混雑時はベビーカーより抱っこ紐推奨。',
  },
  {
    slug: 'chichibu-sakura-cherry',
    title: '秩父羊山公園 芝桜まつり',
    lede: '40万株の芝桜が斜面一面に咲き誇る春の絶景。広場で親子撮影スポット多数。',
    category: 'seasonal',
    startDate: '2026-04-12', endDate: '2026-05-06',
    venue: '羊山公園', area: 'saitama', city: '秩父市',
    ageLabel: '0〜小学生', price: '高校生以上 300円・中学生以下 無料',
    officialUrl: 'https://www.city.chichibu.lg.jp/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['花', '春', '屋外'],
    note: '西武秩父駅から徒歩20分。坂道なのでベビーカーは要注意。【2027年の開催日程は公式未発表。発表され次第、翌年日付へ繰り上げ予定】',
  },
  {
    slug: 'saitama-aqua-paradise',
    title: 'しらこばと水上公園 サマープール',
    lede: '埼玉県営の屋外プール。流れるプール・スライダー・幼児プールが揃い、家族連れに最適。',
    category: 'seasonal',
    startDate: '2026-07-12', endDate: '2026-09-07',
    venue: 'しらこばと水上公園', area: 'saitama', city: '越谷市',
    ageLabel: '0〜小学生', price: '大人 740円・小中学生 210円・幼児 無料',
    officialUrl: 'https://www.parks.or.jp/shirakobato/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['プール', '夏', '屋外'],
    note: 'せんげん台駅からバス15分。幼児プール水深30cm、浮輪持参可。',
  },

  // ===== 茨城・栃木・群馬 =====
  {
    slug: 'hitachi-seaside-summer-bloom',
    title: '国営ひたち海浜公園 夏のジニア',
    lede: '7月〜10月にかけて200万本のジニアが咲き誇る花の名所。広大な公園で1日中遊べます。',
    category: 'seasonal',
    startDate: '2026-07-19', endDate: '2026-10-15',
    venue: '国営ひたち海浜公園', area: 'ibaraki', city: 'ひたちなか市',
    ageLabel: '0〜小学生', price: '大人 450円・中学生以下 無料',
    officialUrl: 'https://hitachikaihin.jp/',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['花', '夏', '屋外'],
    note: '勝田駅からバス15分。広大なのでサイクリングコース利用推奨。',
  },
  {
    slug: 'nasu-safari-night',
    title: '那須サファリパーク ナイトサファリ',
    lede: 'ライオン・トラの夜の活発な姿を専用バスで観察できる夏の人気イベント。',
    category: 'show',
    startDate: '2026-07-12', endDate: '2026-09-30',
    venue: '那須サファリパーク', area: 'tochigi', city: '那須郡',
    ageLabel: '3歳〜小学生', price: '大人 4,500円・小学生 3,000円',
    officialUrl: 'https://www.nasusafari.com/',
    hero: '/hero-ai/fuji-safari-park-kosodate.webp',
    tags: ['動物', '夜', '屋外'],
    note: '那須塩原駅からバス。完全予約制、ベビーカーは車外不可。',
  },
  {
    slug: 'gunma-flower-park-rose',
    title: 'ぐんまフラワーパーク バラまつり',
    lede: '460種類7,000株のバラが咲き誇る春のフェスティバル。広い園内でピクニックも可。',
    category: 'seasonal',
    startDate: '2026-05-10', endDate: '2026-06-15',
    venue: 'ぐんまフラワーパーク', area: 'gunma', city: '前橋市',
    ageLabel: '0〜小学生', price: '大人 700円・中学生以下 無料',
    officialUrl: 'https://www.flower-park.jp/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['花', '春', '屋外'],
    note: '前橋駅からバス40分。広いのでベビーカー貸出を活用。【2027年の開催日程は公式未発表（施設はGunma Flower Park+へリニューアル済のため名称・内容の継続も要確認）】',
  },
  {
    slug: 'tochigi-utsunomiya-cocktail',
    title: '宇都宮こども科学館 夏休み実験ショー',
    lede: 'プラネタリウム＆科学実験で子どもが目を輝かせる体験を。連日プログラム入れ替え。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '宇都宮市子ども総合科学館', area: 'tochigi', city: '宇都宮市',
    ageLabel: '4歳〜小学生', price: '大人 540円・小中学生 220円',
    officialUrl: 'https://www.u-cp.jp/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['科学', '体験型', '室内'],
    note: '宇都宮駅からバス20分。プラネタリウムは1日3回上演。',
  },
  {
    slug: 'ibaraki-kasumi-aji-festival',
    title: 'かすみがうら市 あじさい祭り',
    lede: '霞ヶ浦のほとり、5,000株のあじさいを楽しめる初夏のイベント。湖畔のピクニックもおすすめ。',
    category: 'seasonal',
    startDate: '2026-06-13', endDate: '2026-06-28',
    venue: 'かすみがうら市あじさい園', area: 'ibaraki', city: 'かすみがうら市',
    ageLabel: '全年齢', price: '入園無料',
    officialUrl: 'https://www.city.kasumigaura.lg.jp/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['あじさい', '無料', '屋外'],
    note: '土浦駅からバス40分。広く歩くため動きやすい服装で。【2027年の開催日程は公式未発表。発表され次第、翌年日付へ繰り上げ予定】',
  },

  // ===== 夏休み定番（広域） =====
  {
    slug: 'tokyo-bay-firework-cruise',
    title: '東京湾 親子クルーズで花火観覧',
    lede: '船上から東京湾の夏祭りや花火を観賞できる親子向けクルーズ。揺れも少なく0歳もOK。',
    category: 'seasonal',
    startDate: '2026-07-26', endDate: '2026-08-08',
    venue: '日の出桟橋発', area: 'tokyo', city: '港区',
    ageLabel: '0〜小学生', price: '大人 4,500円・小学生 2,500円・幼児 無料',
    officialUrl: 'https://www.symphony-cruise.co.jp/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['船', '花火', '夏'],
    note: '日の出駅徒歩1分。トイレ・授乳スペースは船内利用可。',
  },
  {
    slug: 'rinyushoku-class-monthly',
    title: '管理栄養士の離乳食デビュー教室（月例）',
    lede: '0歳のはじめての離乳食を一緒に体験。月齢別のメニュー試食付き。各区民センターで月1開催。',
    category: 'rinyushoku',
    startDate: '2026-06-01', endDate: '2026-09-30',
    venue: '各区民センター（東京23区）', area: 'tokyo',
    ageLabel: '0〜1歳', price: '500円〜（区民は無料の場合あり）',
    officialUrl: 'https://www.tokyo-fukushi.jp/',
    hero: '/hero-ai/cat-baby-01.webp',
    tags: ['離乳食', '0歳', '室内'],
    note: '各区の子育てひろば or 健康センターで開催。要事前予約。',
  },
  {
    slug: 'rhythm-class-toyosu',
    title: '豊洲 親子リトミック体験会',
    lede: '0歳から参加できるリトミック教室の体験会。音楽に合わせて体を動かす楽しさを発見。',
    category: 'rhythm',
    startDate: '2026-06-08', endDate: '2026-09-29',
    venue: '豊洲シビックセンター', area: 'tokyo', city: '江東区',
    ageLabel: '0〜3歳', price: '1回 500円',
    officialUrl: 'https://www.koto-bunka.or.jp/',
    hero: '/hero-ai/cat-baby-02.webp',
    tags: ['リトミック', '0歳', '室内'],
    note: '豊洲駅徒歩7分。毎月第2・4日曜開催、予約制。',
  },
  {
    slug: 'yoga-with-baby-meguro',
    title: '目黒区 親子ヨガ＆ベビーマッサージ',
    lede: '産後ママのリフレッシュと0歳赤ちゃんの発達促進を兼ねた人気クラス。',
    category: 'workshop',
    startDate: '2026-06-10', endDate: '2026-09-30',
    venue: '目黒区健康センター', area: 'tokyo', city: '目黒区',
    ageLabel: '0〜1歳', price: '区民 無料・区外 1,000円',
    officialUrl: 'https://www.city.meguro.tokyo.jp/',
    hero: '/hero-ai/cat-baby-01.webp',
    tags: ['ヨガ', 'ベビー', '室内'],
    note: '中目黒駅徒歩10分。毎週火曜開催、要事前予約。',
  },
  {
    slug: 'theater-pinokio-summer',
    title: 'こども劇場 ピノキオ 夏公演',
    lede: '0歳から入場できる人形劇＆音楽劇。途中入退場OK、泣いても気にしない子ども向け劇場。',
    category: 'show',
    startDate: '2026-07-25', endDate: '2026-08-04',
    venue: 'あうるすぽっと', area: 'tokyo', city: '豊島区',
    ageLabel: '0〜小学生', price: '大人 1,500円・子ども 800円',
    officialUrl: 'https://www.owlspot.jp/',
    hero: '/hero-ai/hall-ext.png',
    tags: ['人形劇', '室内', '雨の日OK'],
    note: '東池袋駅直結。1時間以内の公演でベビーカー持込可。',
  },

  // ===== 9月以降の秋イベント =====
  {
    slug: 'tokyo-game-show-family',
    title: '東京ゲームショウ ファミリーDAY',
    lede: '幕張メッセで開催されるゲームの祭典。家族向けエリアは子ども専用試遊コーナーがあります。',
    category: 'show',
    startDate: '2026-09-26', endDate: '2026-09-27',
    venue: '幕張メッセ', area: 'chiba', city: '千葉市',
    ageLabel: '3歳〜小学生', price: '大人 1,500円・小中学生 無料',
    officialUrl: 'https://tgs.cesa.or.jp/',
    hero: '/hero-ai/cat-kid-03.webp',
    tags: ['ゲーム', '室内', '雨の日OK'],
    note: '海浜幕張駅徒歩5分。家族向けは午前推奨、午後は混雑。',
  },
  {
    slug: 'koen-undo-kai-rakuen',
    title: '東京都内 区立公園 こども運動会',
    lede: '区が主催する子ども向け運動会＆スポーツ体験。徒競走・玉入れ・参加賞付き。',
    category: 'sport',
    startDate: '2026-09-13', endDate: '2026-09-23',
    venue: '東京23区 各区立公園', area: 'tokyo',
    ageLabel: '3歳〜小学生', price: '無料',
    officialUrl: 'https://www.tokyo-park.or.jp/',
    hero: '/hero-ai/cat-outdoor-01.webp',
    tags: ['スポーツ', '無料', '屋外'],
    note: '各区広報誌で日程確認。事前申し込み制が多い。',
  },
  {
    slug: 'koen-mushi-tori',
    title: '夏休み 親子の虫とり観察会',
    lede: '里山の昆虫に詳しいガイドが付き添う、夏休み定番の自然観察イベント。虫取り網レンタルあり。',
    category: 'workshop',
    startDate: '2026-07-22', endDate: '2026-08-28',
    venue: '神代植物公園', area: 'tokyo', city: '調布市',
    ageLabel: '4歳〜小学生', price: '大人 500円・中学生以下 無料',
    officialUrl: 'https://www.tokyo-park.or.jp/jindai/',
    hero: '/hero-ai/cat-nature-01.webp',
    tags: ['昆虫', '自然', '屋外'],
    note: '調布駅からバス20分。長袖長ズボン・帽子・虫除け必須。',
  },

  // ===== 各種ワークショップ =====
  {
    slug: 'cooking-class-kasai',
    title: '葛西 こども料理教室 夏休み',
    lede: '小学生対象の本格料理教室。包丁の使い方から実際の調理まで、夏休みの自由研究にもなります。',
    category: 'workshop',
    startDate: '2026-07-25', endDate: '2026-08-28',
    venue: 'ハナマサ葛西キッチンスタジオ', area: 'tokyo', city: '江戸川区',
    ageLabel: '5歳〜小学生', price: '3,500円〜（材料費込）',
    officialUrl: 'https://www.hanamasa-cooking.jp/',
    hero: '/hero-ai/cat-food-01.webp',
    tags: ['料理', '体験', '室内'],
    note: '葛西駅徒歩5分。エプロン貸出あり、保護者見学可。',
  },
  {
    slug: 'art-class-shibuya',
    title: '渋谷 こども絵画教室 夏期講習',
    lede: 'プロアーティストから絵を学ぶ夏期講習。3歳から大人まで個別レベルで指導します。',
    category: 'workshop',
    startDate: '2026-07-22', endDate: '2026-08-28',
    venue: 'アトリエMAYA渋谷', area: 'tokyo', city: '渋谷区',
    ageLabel: '3歳〜小学生', price: '1回 2,500円',
    officialUrl: 'https://www.atelier-maya.jp/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['絵画', '体験', '室内'],
    note: '表参道駅徒歩5分。汚れてもよい服装で。',
  },
  {
    slug: 'dance-experience-kichijoji',
    title: '吉祥寺 こどもダンス無料体験',
    lede: 'リトルダンサーになりたい3-6歳向け体験レッスン。プロのインストラクターが優しく教えます。',
    category: 'workshop',
    startDate: '2026-06-08', endDate: '2026-09-29',
    venue: 'スタジオ・ファン吉祥寺', area: 'tokyo', city: '武蔵野市',
    ageLabel: '3歳〜小学生', price: '無料体験（要予約）',
    officialUrl: 'https://www.studiofun.jp/',
    hero: '/hero-ai/cat-kid-02.webp',
    tags: ['ダンス', '無料', '室内'],
    note: '吉祥寺駅徒歩7分。毎週日曜10時、定員10名。',
  },
  {
    slug: 'piano-trial-shinjuku',
    title: '新宿 こどもピアノ体験会',
    lede: '4歳から始められるピアノ体験。グランドピアノに触れるチャンスと有名講師による無料指導。',
    category: 'workshop',
    startDate: '2026-06-15', endDate: '2026-09-21',
    venue: '新宿音楽スタジオ', area: 'tokyo', city: '新宿区',
    ageLabel: '4歳〜小学生', price: '無料体験（要予約）',
    officialUrl: 'https://www.shinjuku-music.jp/',
    hero: '/hero-ai/cat-piano-01.webp',
    tags: ['ピアノ', '無料', '室内'],
    note: '新宿駅徒歩10分。月2回開催、3歳以下は要相談。',
  },
  {
    slug: 'swim-lesson-koto',
    title: '江東区 親子スイミング無料体験',
    lede: '0歳〜未就学児の水慣れ教室。水を怖がらない第一歩、保護者と一緒のプールで安心。',
    category: 'sport',
    startDate: '2026-06-06', endDate: '2026-09-26',
    venue: 'コナミスポーツ亀戸', area: 'tokyo', city: '江東区',
    ageLabel: '0〜小学生', price: '無料体験（要予約）',
    officialUrl: 'https://www.konamisportsclub.jp/',
    hero: '/hero-ai/cat-summer-01.webp',
    tags: ['スイミング', '無料', '室内'],
    note: '亀戸駅徒歩5分。毎週土曜、要水着・水遊びおむつ。',
  },

  // ===== 商業施設 =====
  {
    slug: 'lalaport-toyosu-summer',
    title: 'ららぽーと豊洲 夏のキッズフェスタ',
    lede: '巨大商業施設で夏休み限定キッズ向けワークショップ、フォトスポット、キッザニア連携イベント。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: 'ららぽーと豊洲', area: 'tokyo', city: '江東区',
    ageLabel: '0〜小学生', price: '入場無料・一部体験有料',
    officialUrl: 'https://mitsui-shopping-park.com/lalaport/toyosu/',
    hero: '/hero-ai/cat-commerce-01.webp',
    tags: ['ショッピング', '室内', '無料'],
    note: '豊洲駅徒歩5分。授乳室・キッズトイレ・ベビーカー貸出完備。',
  },
  {
    slug: 'aeon-makuhari-summer',
    title: 'イオンモール幕張新都心 ファミリーフェスタ',
    lede: '広大な商業施設で夏休み限定の子ども向けイベント、抽選会、無料縁日が連日開催。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: 'イオンモール幕張新都心', area: 'chiba', city: '千葉市',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://makuharishintoshin-aeonmall.com/',
    hero: '/hero-ai/cat-commerce-02.webp',
    tags: ['ショッピング', '無料', '室内'],
    note: '海浜幕張駅からバス7分。授乳室・ベビーカー貸出充実。',
  },
  {
    slug: 'futago-tama-summer-event',
    title: '玉川高島屋S・C 夏のこどもアートワーク',
    lede: '二子玉川の駅直結商業施設で、お絵かき・工作のワークショップが連日開催されます。',
    category: 'workshop',
    startDate: '2026-07-20', endDate: '2026-08-25',
    venue: '玉川高島屋S・C', area: 'tokyo', city: '世田谷区',
    ageLabel: '3歳〜小学生', price: '500円〜（材料費込）',
    officialUrl: 'https://www.tamagawa-sc.com/',
    hero: '/hero-ai/cat-commerce-01.webp',
    tags: ['ワークショップ', '室内', '雨の日OK'],
    note: '二子玉川駅直結。授乳室・キッズスペース完備。',
  },

  // ===== 関東広域季節物 =====
  {
    slug: 'edo-tokyo-museum-kids',
    title: '江戸東京たてもの園 こども縁日',
    lede: '昔の建物の中で昔ながらの縁日。けん玉・コマ・射的など、親子で日本文化体験。',
    category: 'workshop',
    startDate: '2026-07-26', endDate: '2026-08-25',
    venue: '江戸東京たてもの園', area: 'tokyo', city: '小金井市',
    ageLabel: '3歳〜小学生', price: '大人 400円・小中学生 100円',
    officialUrl: 'https://www.tatemonoen.jp/',
    hero: '/hero-ai/cat-japan-01.webp',
    tags: ['歴史', '体験', '屋外'],
    note: '武蔵小金井駅からバス5分。広いのでベビーカー＋飲み物。',
  },
  {
    slug: 'tama-vivarium-summer',
    title: 'たまリバー50キロ 親子サイクリングフェスタ',
    lede: '多摩川沿いを家族でサイクリング。レンタル自転車・補助輪自転車・幼児用乗せ自転車も貸出あり。',
    category: 'sport',
    startDate: '2026-07-12', endDate: '2026-08-31',
    venue: '多摩川河川敷', area: 'tokyo', city: '世田谷区',
    ageLabel: '3歳〜小学生', price: 'レンタル 500円〜',
    officialUrl: 'https://www.tama-river-cycling.jp/',
    hero: '/hero-ai/cat-outdoor-02.webp',
    tags: ['サイクリング', '屋外', '夏'],
    note: '二子玉川駅徒歩5分。日陰少ないので帽子・水分必須。',
  },

  // ===== 追加分 =====
  {
    slug: 'tochigi-mashiko-ceramics',
    title: '益子陶器市 親子陶芸体験',
    lede: '陶器の街・益子で電動ろくろ体験ができる夏季特別企画。3歳から体験可能。',
    category: 'workshop',
    startDate: '2026-08-02', endDate: '2026-08-17',
    venue: '益子陶芸クラブ', area: 'tochigi', city: '芳賀郡',
    ageLabel: '3歳〜小学生', price: '2,500円〜（材料費込）',
    officialUrl: 'https://www.mashiko-kankou.org/',
    hero: '/hero-ai/cat-classroom-02.webp',
    tags: ['陶芸', '体験', '室内'],
    note: '益子駅からバス10分。汚れてもよい服装で、エプロン貸出あり。',
  },
  {
    slug: 'gunma-kusatsu-onsen-kids',
    title: '草津温泉 こども温泉教室',
    lede: '温泉の効能や入浴マナーを学ぶ親子教室。湯もみ体験や足湯付きで人気。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '草津熱の湯', area: 'gunma', city: '吾妻郡',
    ageLabel: '4歳〜小学生', price: '大人 700円・小学生 350円',
    officialUrl: 'https://www.kusatsu-onsen.ne.jp/',
    hero: '/hero-ai/cat-japan-01.webp',
    tags: ['温泉', '体験', '屋内'],
    note: '草津温泉バスターミナル徒歩10分。標高が高いので朝晩涼しい。',
  },
  {
    slug: 'ibaraki-aquarium-summer-touch',
    title: 'アクアワールド大洗 タッチプール延長営業',
    lede: '茨城最大級の水族館で、夏休み期間は人気のサメ・エイのタッチプールが時間延長。',
    category: 'show',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: 'アクアワールド茨城県大洗水族館', area: 'ibaraki', city: '東茨城郡',
    ageLabel: '0〜小学生', price: '大人 2,300円・小中学生 1,100円・幼児 400円',
    officialUrl: 'https://www.aquaworld-oarai.com/',
    hero: '/hero-ai/cat-family-02.webp',
    tags: ['水族館', '雨の日OK', '室内'],
    note: '大洗駅からバス15分。タッチプールは混雑するので午前推奨。',
  },
  {
    slug: 'tokyo-tsukishima-fireworks',
    title: '月島花火 親子鑑賞ナイト',
    lede: '月島の波止場から東京湾の花火を間近で観賞。小規模だが家族にちょうど良い距離感。',
    category: 'seasonal',
    startDate: '2026-08-01', endDate: '2026-08-15',
    venue: '月島第二児童公園', area: 'tokyo', city: '中央区',
    ageLabel: '3歳〜小学生', price: '無料',
    officialUrl: 'https://www.city.chuo.lg.jp/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['花火', '夜', '無料'],
    note: '月島駅徒歩5分。レジャーシート持参でゆっくり鑑賞可。',
  },
  {
    slug: 'shinjuku-gyoen-summer-tour',
    title: '新宿御苑 夏休み親子自然ツアー',
    lede: '都心のオアシス・新宿御苑で植物観察＆昆虫採集ツアー。専門ガイド付き。',
    category: 'workshop',
    startDate: '2026-07-21', endDate: '2026-08-30',
    venue: '新宿御苑', area: 'tokyo', city: '新宿区',
    ageLabel: '4歳〜小学生', price: '入園料 大人 500円・小中学生 250円・幼児 無料',
    officialUrl: 'https://www.env.go.jp/garden/shinjukugyoen/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['自然', '体験', '屋外'],
    note: '新宿駅徒歩10分。広いので飲み物・帽子必須。',
  },
  {
    slug: 'tokyo-ginza-art-summer-kids',
    title: '銀座 こどもアートウィーク',
    lede: '銀座のギャラリー10件以上が連動して開催する子ども向けアート鑑賞＆ワークショップ。',
    category: 'workshop',
    startDate: '2026-07-25', endDate: '2026-08-03',
    venue: '銀座エリア各ギャラリー', area: 'tokyo', city: '中央区',
    ageLabel: '3歳〜小学生', price: '入場無料・一部体験有料',
    officialUrl: 'https://www.ginza.jp/',
    hero: '/hero-ai/cat-classroom-03.webp',
    tags: ['アート', '無料', '室内'],
    note: '銀座駅徒歩各所。歩く距離があるのでベビーカー必須。',
  },
  {
    slug: 'kanagawa-yamashita-park-marche',
    title: '山下公園 親子マルシェ',
    lede: '横浜の代表的な海辺の公園で開催。地元食材＋キッズワークショップ＋ライブ演奏が並びます。',
    category: 'market',
    startDate: '2026-07-04', endDate: '2026-09-27',
    venue: '山下公園', area: 'kanagawa', city: '横浜市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.welcome.city.yokohama.jp/',
    hero: '/hero-ai/cat-commerce-02.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '元町・中華街駅徒歩5分。日陰少ないので午前か夕方推奨。',
  },
  {
    slug: 'saitama-railway-fan-summer',
    title: '西武鉄道 親子で線路探検ツアー',
    lede: '普段は入れない西武線の車両基地を見学できる夏限定ツアー。電車大好きキッズに大人気。',
    category: 'workshop',
    startDate: '2026-07-26', endDate: '2026-08-30',
    venue: '西武鉄道 武蔵丘車両基地', area: 'saitama', city: '飯能市',
    ageLabel: '4歳〜小学生', price: '大人 2,000円・小学生 1,000円',
    officialUrl: 'https://www.seibu-group.co.jp/railways/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['電車', '体験', '屋外'],
    note: '飯能駅から送迎バス。完全予約制、ヘルメット貸出あり。',
  },
  {
    slug: 'tokyo-ueno-park-summer-nature',
    title: '上野公園 親子自然観察ウォーク',
    lede: '上野の森で植物観察＆昆虫探し。動物園・科学館とセットで丸一日プラン可能。',
    category: 'workshop',
    startDate: '2026-07-22', endDate: '2026-08-29',
    venue: '上野恩賜公園', area: 'tokyo', city: '台東区',
    ageLabel: '4歳〜小学生', price: '無料（ガイド付きは要予約500円）',
    officialUrl: 'https://www.city.taito.lg.jp/',
    hero: '/hero-ai/tokyo-ueno-kodzure-lunch.webp',
    tags: ['自然', '無料', '屋外'],
    note: '上野駅徒歩3分。毎週土曜10時集合、雨天中止。',
  },
  {
    slug: 'tokyo-shinagawa-aquarium-jellyfish',
    title: 'マクセル アクアパーク品川 クラゲ特別水槽',
    lede: '駅近の都市型水族館で、新設の大型クラゲ水槽がオープン。光と音の演出が幻想的。',
    category: 'show',
    startDate: '2026-06-15', endDate: '2026-12-31',
    venue: 'マクセル アクアパーク品川', area: 'tokyo', city: '港区',
    ageLabel: '0〜小学生', price: '大人 2,500円・小中学生 1,300円・幼児 800円',
    officialUrl: 'https://www.aqua-park.jp/',
    hero: '/hero-ai/cat-family-01.webp',
    tags: ['水族館', '室内', '雨の日OK'],
    note: '品川駅徒歩2分。授乳室・おむつ替え完備、夜のショーも人気。',
  },
  {
    slug: 'tokyo-ariake-sky-circus',
    title: '東京スカイサーカス サンシャイン60展望台',
    lede: '空を歩く感覚を体験できる体感型展望台。VR体験や巨大トランポリンが新登場。',
    category: 'show',
    startDate: '2026-06-01', endDate: '2026-12-31',
    venue: 'サンシャイン60展望台', area: 'tokyo', city: '豊島区',
    ageLabel: '3歳〜小学生', price: '大人 1,200円・高校生 900円・小中学生 600円・幼児 300円',
    officialUrl: 'https://sunshinecity.jp/observatory/',
    hero: '/hero-ai/tokyo-toshima-ikebukuro-rain.webp',
    tags: ['展望台', '体験', '室内'],
    note: '池袋駅徒歩8分。雨の日や暑い日も室内で快適。',
  },
  {
    slug: 'tokyo-meiji-jingu-omotesando-rinyu',
    title: '表参道 ベビーカーマルシェ',
    lede: 'ベビーカーで歩きやすい広い歩道で、ベビー用品＆ママ向け雑貨のマルシェを毎月開催。',
    category: 'market',
    startDate: '2026-06-14', endDate: '2026-09-13',
    venue: '表参道ヒルズ前広場', area: 'tokyo', city: '渋谷区',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://www.omotesandohills.com/',
    hero: '/hero-ai/cat-commerce-01.webp',
    tags: ['マルシェ', '無料', '屋外'],
    note: '表参道駅徒歩2分。毎月第2土曜開催、雨天時は地下街に変更。',
  },
  {
    slug: 'chiba-mihama-park-balloon',
    title: '幕張海浜公園 バルーンフェスタ',
    lede: '巨大気球とキャラクターバルーンが空を舞う夏の名物イベント。早朝の打ち上げが圧巻。',
    category: 'seasonal',
    startDate: '2026-08-22', endDate: '2026-08-24',
    venue: '幕張海浜公園', area: 'chiba', city: '千葉市',
    ageLabel: '3歳〜小学生', price: '入場無料',
    officialUrl: 'https://www.cga.or.jp/makuhari/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['気球', '無料', '屋外'],
    note: '海浜幕張駅徒歩15分。日中は暑いので早朝6時頃推奨。',
  },
  {
    slug: 'kanagawa-misaki-mago-fish',
    title: '三崎 親子で漁業体験',
    lede: '実際の漁船に乗って魚捕り体験。捕った魚はその場で調理＆お土産にできます。',
    category: 'workshop',
    startDate: '2026-07-19', endDate: '2026-08-31',
    venue: '三崎漁港', area: 'kanagawa', city: '三浦市',
    ageLabel: '5歳〜小学生', price: '大人 4,500円・小学生 2,500円',
    officialUrl: 'https://www.miura-info.ne.jp/',
    hero: '/hero-ai/cat-outdoor-01.webp',
    tags: ['漁業', '体験', '屋外'],
    note: '三崎港バスターミナルから徒歩。完全予約制、ライフジャケット貸出。',
  },
  {
    slug: 'tokyo-asakusa-yokai',
    title: '浅草妖怪屋敷 こども肝試し',
    lede: '夏の風物詩・お化け屋敷。3歳から入場可能な「ライト版」と小学生向け「本格版」があります。',
    category: 'show',
    startDate: '2026-07-25', endDate: '2026-08-31',
    venue: '浅草花やしき', area: 'tokyo', city: '台東区',
    ageLabel: '3歳〜小学生', price: '入園料 1,200円＋アトラクション 500円',
    officialUrl: 'https://www.hanayashiki.net/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['お化け', '夏', '室内'],
    note: '浅草駅徒歩5分。5歳未満はライト版推奨。',
  },
  {
    slug: 'tokyo-iidabashi-baby-massage',
    title: '飯田橋 ベビーマッサージ教室',
    lede: '0歳赤ちゃんのスキンタッチ＆親子コミュニケーションを学べる人気教室。',
    category: 'workshop',
    startDate: '2026-06-05', endDate: '2026-09-25',
    venue: '飯田橋エコルカルチャースクール', area: 'tokyo', city: '千代田区',
    ageLabel: '0〜1歳', price: '1回 1,500円',
    officialUrl: 'https://www.ecorucul.jp/',
    hero: '/hero-ai/cat-baby-02.webp',
    tags: ['ベビー', '体験', '室内'],
    note: '飯田橋駅徒歩2分。毎週木曜10時、定員8組。',
  },
  {
    slug: 'tokyo-jiyugaoka-yomi-week',
    title: '自由が丘 こども絵本フェスティバル',
    lede: '自由が丘の書店＆カフェ20店舗が連動して開催される絵本イベント。読み聞かせ・サイン会など。',
    category: 'reading',
    startDate: '2026-07-12', endDate: '2026-07-20',
    venue: '自由が丘エリア各店', area: 'tokyo', city: '世田谷区',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://jiyugaoka-abc.com/',
    hero: '/hero-ai/library-int.png',
    tags: ['絵本', '無料', '室内'],
    note: '自由が丘駅徒歩各所。スタンプラリーで景品ゲット可。',
  },
  {
    slug: 'saitama-omiya-soccer-kids',
    title: '大宮アルディージャ キッズサッカー教室',
    lede: 'プロサッカークラブが主催する子ども向け体験教室。プロ選手と一緒にプレーできます。',
    category: 'sport',
    startDate: '2026-07-20', endDate: '2026-08-30',
    venue: 'NACK5スタジアム大宮', area: 'saitama', city: 'さいたま市',
    ageLabel: '4歳〜小学生', price: '無料（要予約）',
    officialUrl: 'https://www.ardija.co.jp/',
    hero: '/hero-ai/cat-outdoor-02.webp',
    tags: ['サッカー', '無料', '屋外'],
    note: '北大宮駅徒歩10分。運動靴・水筒持参。',
  },
  {
    slug: 'gunma-akagi-stargazing',
    title: '赤城山 親子星空観察会',
    lede: '都心では見られない満天の星を、天文ガイド付きで観察。流星群の季節は特に人気。',
    category: 'workshop',
    startDate: '2026-08-09', endDate: '2026-08-16',
    venue: '赤城少年自然の家', area: 'gunma', city: '前橋市',
    ageLabel: '4歳〜小学生', price: '大人 1,500円・子ども 800円',
    officialUrl: 'https://www.akagi-camp.jp/',
    hero: '/hero-ai/cat-summer-02.webp',
    tags: ['天体観測', '夜', '屋外'],
    note: '前橋駅からバス60分。標高高く夜は涼しい、上着必須。',
  },

  // ===== 全国展開バッチ（2026年6〜7月・編集部Web確認） =====
  // 東北
  {
    slug: 'sendai-uminomori-jiyukenkyu-2026',
    title: '仙台うみの杜水族館「うみの杜自由研究」',
    lede: '夏休みの自由研究にぴったりの、仙台うみの杜水族館の体験プログラム。生きものへのQ&Aやオタリアとのふれあいタイム、飼育スタッフのレクチャーを通して、遊びながら海の生きものを学べます。涼しい館内で過ごせるのも子連れに安心です。',
    category: 'workshop',
    startDate: '2026-07-18', endDate: '2026-08-23',
    venue: '仙台うみの杜水族館', area: 'miyagi', city: '仙台市',
    ageLabel: '全年齢（一部プログラムは小学生以上）', price: '入館料が必要（無料プログラムのほか一部有料）',
    officialUrl: 'https://www.uminomori.jp/',
    tags: ['水族館', '体験型', '室内', '雨の日OK'],
    recurring: 'annual',
    note: '仙台うみの杜水族館の夏の恒例企画。有料の夜の生物観察会など一部プログラムは事前予約制。',
  },
  {
    slug: 'sendai-tanabata-hanabi-2026',
    title: '第57回 仙台七夕花火祭',
    lede: '仙台七夕まつりの前夜を彩る、杜の都の夏の風物詩。広瀬川の河川敷や青葉山公園周辺から、夜空に大輪の花火が次々と打ち上がります。翌日からの七夕まつりとあわせて、家族で仙台の夏を満喫できる恒例のイベントです。',
    category: 'matsuri',
    startDate: '2026-08-05', endDate: '2026-08-05',
    venue: '青葉山公園周辺・広瀬川河川敷', area: 'miyagi', city: '仙台市',
    ageLabel: '全年齢', price: '観覧無料（有料席あり）',
    officialUrl: 'https://sendai-tanabatahanabi.com/overview/',
    tags: ['花火', '夏', '屋外'],
    recurring: 'annual',
    note: '8/5(水)19:30〜20:30(予定)。翌8/6〜8の仙台七夕まつり本体は公式の2026年正式発表を待って掲載予定。',
  },
  {
    slug: 'sagae-sakuranbo-festival-2026',
    title: 'さがえさくらんぼFestival',
    lede: 'さくらんぼ日本一のまち寒河江で開かれる初夏の収穫祭。旬を迎えたさくらんぼの直売や食べ比べ、ステージイベントでにぎわいます。家族で「赤い宝石」を味わえる6月ならではのお出かけスポットです。',
    category: 'market',
    startDate: '2026-06-14', endDate: '2026-06-14',
    venue: '最上川ふるさと総合公園', area: 'yamagata', city: '寒河江市',
    ageLabel: '全年齢', price: '入場無料（一部有料）',
    officialUrl: 'https://www.city.sagae.yamagata.jp/kanko/event/sakuranbosaiten.html',
    tags: ['味覚狩り', 'グルメ', '屋外'],
    note: '【2027年の開催日程は公式未発表。開催日は年ごとに変動するため、発表され次第、翌年日付へ繰り上げ予定】',
  },
  {
    slug: 'tsuchizaki-minato-hikiyama-matsuri-2026',
    title: '土崎港曳山まつり',
    lede: 'ユネスコ無形文化遺産にも登録された秋田を代表する夏祭り。武者人形や見返しで飾られた20数台の曳山が、勇壮なお囃子とともに町を練り歩きます。間近で迫力ある山車を見られ、夏の到来を体感できます。',
    category: 'matsuri',
    startDate: '2026-07-20', endDate: '2026-07-21',
    venue: '土崎地区一帯', area: 'akita', city: '秋田市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://hikiyama.akitalink.com/',
    tags: ['祭り', '山車', '屋外'],
  },
  {
    slug: 'hachinohe-sansha-taisai-2026',
    title: '八戸三社大祭',
    lede: '約300年の歴史を誇る日本屈指の山車祭り。高さ10mにもなる豪華絢爛な大型山車27台が、おはやしとともに八戸の街を巡行します。動く芸術ともいえる山車の迫力に子どもも大人も圧倒されます。',
    category: 'matsuri',
    startDate: '2026-07-31', endDate: '2026-08-04',
    venue: '八戸市中心街', area: 'aomori', city: '八戸市',
    ageLabel: '全年齢', price: '観覧無料（有料席あり）',
    officialUrl: 'https://visithachinohe.com/stories/sannshataisai_schedule/',
    tags: ['祭り', '山車', '屋外'],
  },

  // 中部
  {
    slug: 'rilakkuma-umigatari-2026',
    title: 'リラックマ×上越市立水族博物館 うみがたり',
    lede: '人気キャラ・リラックマと水族館うみがたりがコラボ。館内をめぐるスタンプラリーやフォトスポット、限定グッズが登場し、夏休みの思い出づくりにぴったりの体験が楽しめます。',
    category: 'show',
    startDate: '2026-06-26', endDate: '2026-09-23',
    venue: '上越市立水族博物館 うみがたり', area: 'niigata', city: '上越市',
    ageLabel: '0歳〜', price: '水族館入館料に含む',
    officialUrl: 'https://www.umigatari.jp/joetsu/',
    tags: ['水族館', 'キャラクター', '雨の日OK'],
  },
  {
    slug: 'namerikawa-nebuta-nagashi-2026',
    title: '滑川のネブタ流し',
    lede: '国指定重要無形民俗文化財。和田の浜海岸で大たいまつ「ネブタ」に火を灯し、一斉に海へ流して無病息災を願う夏の伝統行事。炎が夜の海面を照らす光景は圧巻です。',
    category: 'matsuri',
    startDate: '2026-07-31', endDate: '2026-07-31',
    venue: '和田の浜海岸', area: 'toyama', city: '滑川市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.city.namerikawa.toyama.jp/soshiki/22/2/594.html',
    tags: ['祭り', '夜', '屋外'],
  },
  {
    slug: 'notojima-night-aquarium-2026',
    title: 'のとじま水族館「夜の水族館」',
    lede: '夏から秋にかけて夜間開館を実施。夜のイルカショーやトンネル水槽のライトアップなど、昼とは違う幻想的な雰囲気の中で生き物たちを観察できる特別なイベントです。開催日は公式サイトでご確認ください。',
    category: 'show',
    startDate: '2026-07-01', endDate: '2026-09-30',
    venue: 'のとじま水族館', area: 'ishikawa', city: '七尾市',
    ageLabel: '全年齢', price: '別途入館料',
    officialUrl: 'https://www.notoaqua.jp/night/',
    tags: ['水族館', '夜', '室内'],
    recurring: 'annual',
  },
  {
    slug: 'angelland-tanabata-2026',
    title: 'エンゼルランドふくい ひらめき星の七夕まつり',
    lede: '児童科学館エンゼルランドふくいの七夕イベント。願いごとを飾る七夕飾りや、七夕と夏の星座をテーマにしたプラネタリウム番組など、星空に親しめる催しが揃います。',
    category: 'seasonal',
    startDate: '2026-06-20', endDate: '2026-07-07',
    venue: '福井県児童科学館 エンゼルランドふくい', area: 'fukui', city: '坂井市',
    ageLabel: '幼児〜', price: '入館料',
    officialUrl: 'https://angelland.or.jp/',
    tags: ['七夕', '科学館', '雨の日OK'],
  },
  {
    slug: 'mtfuji-yoshida-opening-2026',
    title: '富士山 吉田ルート開山（夏山シーズン）',
    lede: '山梨県側・吉田ルートが7月1日に山開き。富士スバルライン五合目は夏山シーズンを迎え、雄大な富士の自然を間近に感じられます。五合目散策なら小さな子連れでも楽しめます。',
    category: 'seasonal',
    startDate: '2026-07-01', endDate: '2026-09-10',
    venue: '富士スバルライン五合目・吉田ルート', area: 'yamanashi', city: '富士吉田市',
    ageLabel: '全年齢（登山は別）', price: '五合目散策無料',
    officialUrl: 'https://www.fujisan-climb.jp/',
    tags: ['自然', '絶景', '屋外'],
  },
  {
    slug: 'suwako-summer-night-hanabi-2026',
    title: '諏訪湖サマーナイト花火',
    lede: '7月下旬から8月にかけて、諏訪湖で毎晩約10分間の花火が打ち上がる夏の風物詩。湖畔の芝生からゆったり鑑賞でき、毎日少しずつ夏祭り気分を味わえます。',
    category: 'seasonal',
    startDate: '2026-07-24', endDate: '2026-08-23',
    venue: '諏訪湖畔', area: 'nagano', city: '諏訪市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.suwakanko.jp/story/hanabi-suwako/',
    tags: ['花火', '夜', '屋外'],
  },
  {
    slug: 'gujo-odori-2026',
    title: '郡上おどり',
    lede: '日本三大盆踊りのひとつ。7月のおどり発祥祭から9月まで30夜にわたり繰り広げられ、町の夜に下駄の音が響きます。誰でも輪に入って踊れるので家族で参加できます。',
    category: 'matsuri',
    startDate: '2026-07-11', endDate: '2026-09-05',
    venue: '郡上八幡市街地（各会場）', area: 'gifu', city: '郡上市',
    ageLabel: '全年齢', price: '観覧・参加無料',
    officialUrl: 'https://www.gujohachiman.com/kanko/odori_schedule.html',
    tags: ['祭り', '盆踊り', '屋外'],
  },

  // 関西
  {
    slug: 'toba-minato-matsuri-2026',
    title: '第71回 鳥羽みなとまつり',
    lede: '鳥羽湾の空と海を花火が彩る夏の風物詩。20時から打ち上がる海上花火が水面に映り込み、遊覧船の光と相まって幻想的。屋台もならび、潮風を感じながら家族で夕涼みできる無料イベントです。',
    category: 'matsuri',
    startDate: '2026-07-24', endDate: '2026-07-24',
    venue: '鳥羽マリンターミナル周辺', area: 'mie', city: '鳥羽市',
    ageLabel: '全年齢', price: '無料（有料席あり）',
    officialUrl: 'https://www.kankomie.or.jp/event/41325',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'shigaraki-himatsuri-2026',
    title: 'しがらき火まつり',
    lede: '焼き物の里・信楽で「火」への感謝を込めて行う勇壮な祭り。松明の火を陶器神社へ奉納し、終盤には約700発の花火が夜空を染めます。陶芸クラフト体験もあり、小さな子から大人まで楽しめます。',
    category: 'matsuri',
    startDate: '2026-07-18', endDate: '2026-07-18',
    venue: '信楽地域市民センター周辺', area: 'shiga', city: '甲賀市',
    ageLabel: '全年齢', price: '無料',
    officialUrl: 'https://www.e-shigaraki.org/himatsuri.html',
    tags: ['祭り', '花火', '屋外'],
  },
  {
    slug: 'gion-matsuri-2026',
    title: '祇園祭（前祭・後祭）',
    lede: '千年以上続く八坂神社の祭礼で日本三大祭のひとつ。7月14〜16日の宵山では駒形提灯が灯り祇園囃子が響きます。17日の前祭・24日の後祭の山鉾巡行は圧巻で、街全体がお祭り一色に染まります。',
    category: 'matsuri',
    startDate: '2026-07-01', endDate: '2026-07-31',
    venue: '八坂神社・四条烏丸周辺一帯', area: 'kyoto', city: '京都市',
    ageLabel: '全年齢', price: '無料（観覧席は有料）',
    officialUrl: 'https://kyoto-design.jp/special/gionmatsuri',
    tags: ['祭り', '伝統', '屋外'],
  },
  {
    slug: 'aizen-matsuri-2027',
    title: '愛染まつり',
    lede: '大阪三大夏祭りの先陣を切る、勝鬘院・愛染堂のお祭り。色とりどりの浴衣をまとった愛染娘を乗せた宝恵駕籠パレードが街を練り歩き、夏の到来を告げます。露店もにぎわい家族で初夏の風情を楽しめます。',
    category: 'matsuri',
    startDate: '2027-06-30', endDate: '2027-07-02',
    venue: '勝鬘院 愛染堂', area: 'osaka', city: '大阪市天王寺区',
    ageLabel: '全年齢', price: '無料',
    officialUrl: 'https://www.aizendo.com/festival.htm',
    tags: ['祭り', '屋台', '屋外'],
    recurring: 'annual',
    note: '毎年6/30〜7/2の固定日開催（大阪三大夏祭りの先陣）。開催が近づいたら公式 festival.htm で最終確認。',
  },
  {
    slug: 'tenjin-matsuri-2026',
    title: '天神祭',
    lede: '日本三大祭のひとつで大阪天満宮の例大祭。24日の宵宮に続き、25日の本宮では船渡御と約3,000発の奉納花火が大川を彩ります。船と花火が川面に映る光景は圧巻で、夏の大阪を代表する祭典です。',
    category: 'matsuri',
    startDate: '2026-07-24', endDate: '2026-07-25',
    venue: '大阪天満宮・大川一帯', area: 'osaka', city: '大阪市北区',
    ageLabel: '全年齢', price: '無料（有料観覧席あり）',
    officialUrl: 'https://osakatemmangu.or.jp/',
    tags: ['祭り', '花火', '屋外'],
  },
  {
    slug: 'himeji-yukata-matsuri-2026',
    title: '令和8年度 姫路ゆかたまつり',
    lede: '初夏の訪れを告げる姫路の風物詩。長壁神社・城南公園周辺に約200軒の屋台がならび、姫路おでんなどのご当地グルメも充実。灯籠を手にした子どもたちによる「子どもゆかたパレード」も見どころです。',
    category: 'matsuri',
    startDate: '2026-06-20', endDate: '2026-06-21',
    venue: '長壁神社・城南公園周辺', area: 'hyogo', city: '姫路市',
    ageLabel: '全年齢', price: '無料',
    officialUrl: 'https://www.himeji-kanko.jp/event/1926/',
    tags: ['祭り', '屋台', '屋外'],
    note: '【令和9年度（2027年）の日程は公式未発表。発表され次第、日付とタイトルの和暦を繰り上げ予定】',
  },
  {
    slug: 'nishinokyo-lotus-road-2026',
    title: '奈良・西ノ京ロータスロード',
    lede: '蓮の名所として知られる西大寺・喜光寺・唐招提寺・薬師寺の四ヶ寺をめぐる夏の企画。境内に咲く色とりどりの蓮を楽しみながら御朱印集めができます。早朝に開く花を見に涼しい時間のお散歩がおすすめ。',
    category: 'seasonal',
    startDate: '2026-06-18', endDate: '2026-08-02',
    venue: '西大寺・喜光寺・唐招提寺・薬師寺', area: 'nara', city: '奈良市',
    ageLabel: '全年齢', price: '各寺拝観料（四ヶ寺共通券あり）',
    officialUrl: 'https://narashikanko.or.jp/feature/lotusroad',
    tags: ['花', '寺社', '屋外'],
  },
  {
    slug: 'marinacity-starlight-illusion-summer-2026',
    title: 'スターライトイリュージョン2026（夏・特別バージョン）',
    lede: '和歌山マリーナシティの夜空を彩る花火イベント。7月19日は通常の2倍の花火玉を打ち上げる豪華特別バージョンで、音楽に合わせて色とりどりの光が舞います。観覧無料で、テーマパーク帰りに楽しめます。',
    category: 'seasonal',
    startDate: '2026-07-19', endDate: '2026-07-19',
    venue: '和歌山マリーナシティ 西側防波堤', area: 'wakayama', city: '和歌山市',
    ageLabel: '全年齢', price: '無料',
    officialUrl: 'https://www.marinacity.com/porto/event/event-150824/',
    tags: ['花火', '夜', '屋外'],
  },

  // 中国・四国
  {
    slug: 'tottori-uradome-festival-2026',
    title: '第39回 浦富海岸元気フェスティバル',
    lede: '日本有数の美しさを誇る浦富海岸の砂浜から、目の前で打ち上がる花火を満喫できる夏の風物詩。海水浴とあわせて家族で楽しめ、間近で見上げる大輪に子どもも大はしゃぎする岩美町の夏祭りです。',
    category: 'matsuri',
    startDate: '2026-07-26', endDate: '2026-07-26',
    venue: '浦富海水浴場', area: 'tottori', city: '岩美町',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.iwami.gr.jp/',
    tags: ['花火', '海', '屋外'],
  },
  {
    slug: 'tottori-hato-fireworks-2026',
    title: '波止のまつり納涼花火大会',
    lede: '琴浦町赤碕の菊港周辺を舞台に、約3000発の花火が夜空を彩る地域密着の夏祭り。海辺に立ち並ぶ屋台のにぎわいの中、家族みんなで間近に打ち上がる花火を楽しめる、夏の思い出づくりにぴったりです。',
    category: 'matsuri',
    startDate: '2026-07-27', endDate: '2026-07-27',
    venue: '赤碕菊港周辺', area: 'tottori', city: '琴浦町',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.town.kotoura.tottori.jp/',
    tags: ['花火', '屋台', '屋外'],
  },
  {
    slug: 'shimane-kisuki-summer-2026',
    title: 'きすき夏まつり',
    lede: '雲南市木次町の斐伊川河川敷で開かれる夏まつり。打ち上げ場所からわずか120メートルという至近距離で花火を体感でき、頭上に広がる迫力の光と音に子どもも大人も圧倒される、地元自慢の夜のお祭りです。',
    category: 'matsuri',
    startDate: '2026-07-20', endDate: '2026-07-20',
    venue: '斐伊川河川敷', area: 'shimane', city: '雲南市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.unnan-kankou.jp/',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'shimane-matsue-tenjin-2026',
    title: '松江天神さん夏祭り',
    lede: '白潟天満宮で江戸時代から約400年続く伝統の夏祭り。学問の神様をまつる境内に屋台が並び、浴衣姿の親子でにぎわいます。歴史ある城下町・松江の夏の始まりを感じられる二日間です。',
    category: 'matsuri',
    startDate: '2026-07-24', endDate: '2026-07-25',
    venue: '白潟天満宮', area: 'shimane', city: '松江市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.kankou-matsue.jp/',
    tags: ['祭り', '屋台', '屋外'],
  },
  {
    slug: 'okayama-kinoshita-circus-2026',
    title: '木下大サーカス 岡山公演',
    lede: '4年ぶりに岡山に帰ってくる木下大サーカス。空中ブランコや猛獣のショー、コミカルな演目まで、本物の迫力に満ちたパフォーマンスが続きます。岡山ドーム横の特設会場で家族で手に汗握る感動体験を。',
    category: 'show',
    startDate: '2026-06-27', endDate: '2026-09-27',
    venue: '岡山ドーム東隣特設会場', area: 'okayama', city: '岡山市',
    ageLabel: '全年齢', price: '有料（前売券あり）',
    officialUrl: 'https://www.kinoshita-circus.co.jp/',
    tags: ['ショー', 'サーカス', '室内'],
  },
  {
    slug: 'okayama-mozu-miniature-2026',
    title: 'Mozuミニチュア展 ようこそ、ちいさな世界へ。',
    lede: '人気クリエイターMozuが手がける精巧なミニチュア作品が大集合。手のひらサイズの部屋や小物に込められた緻密な世界に、子どもも大人も思わず見入ってしまいます。夏休みの自由研究のヒントにも。',
    category: 'other',
    startDate: '2026-07-18', endDate: '2026-08-30',
    venue: '岡山シティミュージアム', area: 'okayama', city: '岡山市',
    ageLabel: '全年齢', price: '有料',
    officialUrl: 'https://www.city.okayama.jp/okayama-city-museum/',
    tags: ['展覧会', '雨の日OK', '室内'],
  },
  {
    slug: 'hiroshima-onomichi-night-stalls-2026',
    title: '尾道本通り商店街 土曜夜店',
    lede: '尾道の古い商店街が毎週土曜の夜だけ縁日に変わる、昭和情緒たっぷりのイベント。射的や金魚すくい、屋台グルメが並び、夕涼みがてら家族でそぞろ歩きを楽しめます。坂の町・尾道らしい夏の夜です。',
    category: 'matsuri',
    startDate: '2026-06-06', endDate: '2026-07-18',
    venue: '尾道本通り商店街', area: 'hiroshima', city: '尾道市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.ononavi.jp/',
    tags: ['縁日', '屋台', '屋外'],
  },
  {
    slug: 'hiroshima-fukuyama-night-stalls-2026',
    title: '福山毎土夜店2026',
    lede: '福山駅前商店街一帯が毎週土曜に夜店でにぎわう恒例イベント。たくさんの屋台や縁日遊びが並び、浴衣を着てお出かけする家族連れでいっぱいに。夏の間ずっと楽しめる福山の街なかの風物詩です。',
    category: 'matsuri',
    startDate: '2026-06-06', endDate: '2026-08-29',
    venue: '福山駅前商店街一帯', area: 'hiroshima', city: '福山市',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://www.fukuyama-kanko.com/',
    tags: ['縁日', '屋台', '屋外'],
  },
  {
    slug: 'yamaguchi-nagato-fireworks-2026',
    title: 'ながと花火大会',
    lede: '長門市の湊魚市場を会場に、尺玉をはじめとする大輪の花火が日本海の夜空に広がる夏の一大イベント。海辺で潮風を感じながら、頭上いっぱいに開く花火を家族で見上げられる長門の夏を代表する花火大会です。',
    category: 'seasonal',
    startDate: '2026-07-18', endDate: '2026-07-18',
    venue: '湊魚市場', area: 'yamaguchi', city: '長門市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://nanavi.jp/',
    tags: ['花火', '海', '屋外'],
  },
  {
    slug: 'yamaguchi-ghibli-exhibition-2026',
    title: '特別展「金曜ロードショーとジブリ展」',
    lede: 'おなじみのジブリ作品の世界を体感できる人気の巡回展が山口に登場。名場面の再現や撮影スポットがそろい、ジブリのキャラクターたちに会えます。親子で映画の世界に入り込める夏休みにうれしい特別展です。',
    category: 'other',
    startDate: '2026-07-18', endDate: '2026-10-12',
    venue: '山口県立美術館', area: 'yamaguchi', city: '山口市',
    ageLabel: '全年齢', price: '有料',
    officialUrl: 'https://www.yma-web.jp/',
    tags: ['展覧会', '映画', '室内'],
  },
  {
    slug: 'tokushima-komatsushima-port-2026',
    title: '小松島港まつり納涼花火大会',
    lede: '小松島市の新港地区を舞台に約2500発が打ち上がる人気の花火大会。海辺で潮風を感じながら、空いっぱいに開く花火を家族で楽しめる、小松島の夏を代表するお祭りです。',
    category: 'matsuri',
    startDate: '2026-07-19', endDate: '2026-07-19',
    venue: '小松島町新港地区一帯', area: 'tokushima', city: '小松島市',
    ageLabel: '全年齢', price: '観覧無料（有料席あり）',
    officialUrl: 'https://komatsushima-minatomatsuri.com/',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'tokushima-suito-festival-2026',
    title: 'Retra！水都祭2026',
    lede: '徳島市の藍場浜公園で開かれる、水の都・徳島らしい夏祭り。約2000発の花火が新町川の川面を彩り、屋台や催しでにぎわいます。市街地中心で開かれるアクセスのよさも魅力で、家族で気軽に夏の夜を満喫できます。',
    category: 'matsuri',
    startDate: '2026-07-17', endDate: '2026-07-19',
    venue: '藍場浜公園', area: 'tokushima', city: '徳島市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.awanavi.jp/',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'kagawa-zenigata-festival-2026',
    title: '第61回 かんおんじ銭形まつり',
    lede: '砂絵「銭形」で知られる観音寺市最大の夏祭り。財田川河口で音楽に合わせた花火が打ち上がり、よさこいや学生音楽祭など多彩な催しが街を盛り上げます。屋台も充実し家族で一日中にぎわいを楽しめます。',
    category: 'matsuri',
    startDate: '2026-07-18', endDate: '2026-07-19',
    venue: '財田川河口', area: 'kagawa', city: '観音寺市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'http://www.kan-cci.or.jp/zenigata/index.html',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'ehime-uwajima-ushioni-2026',
    title: '和霊大祭・うわじま牛鬼まつり',
    lede: '宇和島の夏を代表する伝統の祭り。初日の海上花火に始まり、巨大な「牛鬼」が練り歩くパレードや踊り大会で街が熱気に包まれます。迫力満点の牛鬼に子どもは驚き、初夏の宇和島ならではの体験ができます。',
    category: 'matsuri',
    startDate: '2026-07-22', endDate: '2026-07-24',
    venue: '宇和島市内一円', area: 'ehime', city: '宇和島市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://ushioni.gaina.ne.jp/',
    tags: ['祭り', '花火', '屋外'],
  },
  {
    slug: 'kochi-minakoi-port-2026',
    title: '第20回 香南市みなこい港まつり',
    lede: '香南市の吉川漁港を会場に、次々と打ち上がる花火が港の夜を彩る夏祭り。海辺で潮の香りを感じながら、間近に開く花火を家族で見上げられます。屋台のにぎわいもあり地元に親しまれる夏の楽しみです。',
    category: 'matsuri',
    startDate: '2026-07-26', endDate: '2026-07-26',
    venue: '吉川漁港堤防', area: 'kochi', city: '香南市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.city.kochi-konan.lg.jp/',
    tags: ['花火', '海', '屋外'],
  },

  // 九州・沖縄
  {
    slug: 'hakata-gion-yamakasa-2026',
    title: '博多祇園山笠',
    lede: '770年以上続く博多の夏の風物詩。市内各所に華やかな飾り山笠が並び、クライマックスの追い山笠では舁き手たちが山笠を担いで疾走します。ユネスコ無形文化遺産にも登録された迫力の祭りを家族で。',
    category: 'matsuri',
    startDate: '2026-07-01', endDate: '2026-07-15',
    venue: '櫛田神社および福岡市内各所', area: 'fukuoka', city: '福岡市博多区',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://www.hakatayamakasa.com/',
    tags: ['祭り', '伝統', '屋外'],
  },
  {
    slug: 'yoshinogari-natsu-fureai-2026',
    title: '吉野ヶ里町「夏」ふれあい祭り',
    lede: '吉野ヶ里歴史公園を舞台にした夏祭り。体験コーナーやステージイベント、伝統芸能の演奏で盛り上がり、盆踊りのあとには夜空を彩る花火が打ち上がります。歴史公園で過ごす特別な一日を。',
    category: 'matsuri',
    startDate: '2026-07-25', endDate: '2026-07-25',
    venue: '吉野ヶ里歴史公園 北口エリア', area: 'saga', city: '吉野ヶ里町',
    ageLabel: '全年齢', price: '一部有料',
    officialUrl: 'https://www.asobo-saga.jp/',
    tags: ['祭り', '花火', '屋外'],
  },
  {
    slug: 'nagasaki-peron-2026',
    title: '長崎ペーロン選手権大会',
    lede: '長崎港を舞台に繰り広げられる勇壮な手漕ぎ舟レース。太鼓と銅鑼の音に合わせ、色とりどりのペーロン舟が波しぶきを上げて競い合います。お昼休みには体験ペーロンもあり、夏の港町を体感できます。',
    category: 'matsuri',
    startDate: '2026-07-26', endDate: '2026-07-26',
    venue: '長崎港内 松が枝国際観光ふ頭', area: 'nagasaki', city: '長崎市',
    ageLabel: '全年齢', price: '観覧無料（特別観覧席は有料）',
    officialUrl: 'https://www.at-nagasaki.jp/event/51801',
    tags: ['祭り', '海', '屋外'],
  },
  {
    slug: 'hinokuni-matsuri-2026',
    title: '火の国まつり',
    lede: '熊本の夏を彩る郷土色豊かなお祭り。メインの「おてもやん総おどり」では約5,000人の踊り手が中心市街地を踊り歩きます。アーケードでのステージや飲食ブース、子ども向け企画もあり家族で楽しめます。',
    category: 'matsuri',
    startDate: '2026-07-31', endDate: '2026-08-02',
    venue: '熊本市中心市街地', area: 'kumamoto', city: '熊本市中央区',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://kumamoto-guide.jp/hinokunimatsuri/',
    tags: ['祭り', '踊り', '屋外'],
  },
  {
    slug: 'harmonyland-summer-party-2026',
    title: 'ハーモニーランド「はちゃめちゃサマーパーリー！」',
    lede: 'サンリオキャラクターパークの夏イベント。水やバブルを浴びるずぶ濡れ夏ショーが登場します。ハローキティたち人気キャラクターと一緒に、はちゃめちゃな夏を過ごせます。',
    category: 'other',
    startDate: '2026-07-03', endDate: '2026-09-15',
    venue: 'サンリオキャラクターパーク ハーモニーランド', area: 'oita', city: '日出町',
    ageLabel: '全年齢', price: 'パスポート制（大人3,600円〜）',
    officialUrl: 'https://www.harmonyland.jp/',
    tags: ['テーマパーク', 'キャラクター', '水遊び'],
    recurring: 'annual',
  },
  {
    slug: 'aburatsu-minato-matsuri-2026',
    title: '油津港まつり花火大会',
    lede: '日南市の油津港を舞台にした県内最大級の花火大会。海面に映える花火が夏の夜空を染め上げます。港町ならではの開放的なロケーションで、家族そろって夏の夜を満喫できます。',
    category: 'matsuri',
    startDate: '2026-07-18', endDate: '2026-07-18',
    venue: '油津港内（日南市西町）', area: 'miyazaki', city: '日南市',
    ageLabel: '全年齢', price: '観覧無料（一部有料席）',
    officialUrl: 'https://www.kanko-miyazaki.jp/feature/hanabi',
    tags: ['花火', '海', '屋外'],
  },
  {
    slug: 'ogionsaa-2026',
    title: '鹿児島祇園祭 おぎおんさぁ',
    lede: '鹿児島の夏を告げる祇園祭。天文館電車通り一帯を舞台に、神輿や山車が練り歩き、子どもみこしも登場します。前日にはウォーターフロントパークで宵祭も。街全体が熱気に包まれる伝統行事です。',
    category: 'matsuri',
    startDate: '2026-07-05', endDate: '2026-07-05',
    venue: '天文館電車通り一帯', area: 'kagoshima', city: '鹿児島市',
    ageLabel: '全年齢', price: '観覧無料',
    officialUrl: 'https://ogionsaa.jp/',
    tags: ['祭り', '神輿', '屋外'],
  },
  {
    slug: 'kaiyohaku-churaumi-hanabi-2026',
    title: '海洋博公園サマーフェスティバル 美ら海花火大会',
    lede: '海洋博公園エメラルドビーチで開かれる県内最大級の花火大会。花火と音楽、特殊効果を組み合わせた芸術性の高い花火が夜空を彩ります。美ら海水族館とあわせて沖縄の夏を満喫できます。',
    category: 'seasonal',
    startDate: '2026-07-04', endDate: '2026-07-04',
    venue: '海洋博公園 エメラルドビーチ', area: 'okinawa', city: '本部町',
    ageLabel: '全年齢', price: '有料席あり',
    officialUrl: 'https://oki-park.jp/hanabi2026/',
    tags: ['花火', '海', '屋外'],
    note: '【2027年の開催日程は公式未発表（例年7月上旬の土曜だが日付は固定でない）。発表され次第、翌年日付へ繰り上げ予定】',
  },

  // 愛知・北海道・岩手（カバレッジ補完）
  {
    slug: 'owari-tsushima-tennousai-2026',
    title: '尾張津島天王祭',
    lede: '約600年続く津島神社の祭礼で、日本三大川祭の一つ。宵祭は600個超の提灯を灯したまきわら船が天王川を彩り、翌朝の朝祭は能人形を飾った車楽舟が進みます。水辺の幻想風景に子どもも目を奪われる夏の名物行事です。',
    category: 'matsuri',
    startDate: '2026-07-25', endDate: '2026-07-26',
    venue: '津島神社・天王川公園', area: 'aichi', city: '津島市',
    ageLabel: '全年齢', price: '観覧無料（桟敷席は有料）',
    officialUrl: 'https://www.city.tsushima.lg.jp/shokai/matsurikyoudo/tennnoumaturi/tennoumatsuri.html',
    tags: ['祭り', '川', '屋外'],
  },
  {
    slug: 'toyota-oiden-hanabi-2026',
    title: '第58回 豊田おいでんまつり 花火大会',
    lede: '豊田市最大の夏祭りを締めくくる花火大会。白浜公園一帯を舞台に、全国の花火師によるメロディ花火や手筒花火、ナイアガラ大瀑布が夜空を染めます。前日の総踊りとあわせて家族で楽しめる二日間です。',
    category: 'seasonal',
    startDate: '2026-07-26', endDate: '2026-07-26',
    venue: '白浜公園一帯（矢作川河畔）', area: 'aichi', city: '豊田市',
    ageLabel: '全年齢', price: '観覧無料（有料席あり）',
    officialUrl: 'https://www.oidenmaturi.com/',
    tags: ['花火', '祭り', '屋外'],
  },
  {
    slug: 'legoland-bishonure-natsu-2026',
    title: 'レゴランドでびしょぬれの夏！',
    lede: 'レゴランド・ジャパンの夏イベント。人気アトラクション「ウォーター・メイズ」を中心に、全力でびしょ濡れになれる水遊びが満載。小さな子ども連れにぴったりの夏限定プログラムです。',
    category: 'other',
    startDate: '2026-07-10', endDate: '2026-08-31',
    venue: 'レゴランド・ジャパン', area: 'aichi', city: '名古屋市',
    ageLabel: '幼児〜小学生', price: '入園料別途（1DAYパスポート）',
    officialUrl: 'https://www.legoland.jp/operation/events-timeline/',
    tags: ['テーマパーク', '水遊び', '夏'],
    recurring: 'annual',
  },
  {
    slug: 'otaru-ushio-matsuri-2026',
    title: '第60回 おたる潮まつり',
    lede: '小樽港を舞台に繰り広げられる小樽最大級の夏祭り。市民が踊り歩く「潮ねりこみ」や屋台、夜空を彩る大花火大会など見どころが満載。1967年の第1回から数えて60回目の節目で、家族で楽しめる三日間です。',
    category: 'matsuri',
    startDate: '2026-07-24', endDate: '2026-07-26',
    venue: '小樽港第3埠頭基部 周辺', area: 'hokkaido', city: '小樽市',
    ageLabel: '全年齢', price: '観覧無料（花火有料席あり）',
    officialUrl: 'https://otaru.gr.jp/event/ushiomaturi2026',
    tags: ['祭り', '花火', '屋外'],
  },
  {
    slug: 'sapporo-natsu-matsuri-2026',
    title: '2026さっぽろ夏まつり（第73回）',
    lede: '大通公園に約1か月間、日本最大級のビアガーデンが出現する札幌の夏の風物詩。緑あふれる公園で食事や生演奏を楽しめ、開放的な雰囲気のなか家族でのんびり過ごせます。盆踊りなど関連行事も多彩です。',
    category: 'matsuri',
    startDate: '2026-07-23', endDate: '2026-08-18',
    venue: '大通公園 ほか', area: 'hokkaido', city: '札幌市',
    ageLabel: '全年齢', price: '入場無料（飲食は有料）',
    officialUrl: 'https://www.sapporo.travel/summerfes/',
    tags: ['祭り', '屋台', '屋外'],
  },
  {
    slug: 'kuzumaki-lavender-matsuri-2026',
    title: 'くずまき高原牧場ラベンダーまつり',
    lede: '標高の高い葛巻町の高原牧場が、濃い紫色のイングリッシュラベンダーで染まる初夏のまつり。摘み取り体験や牧場製品の特売を楽しめ、予約不要で気軽に立ち寄れます。動物とのふれあいも楽しめる家族向けスポットです。',
    category: 'seasonal',
    startDate: '2026-06-27', endDate: '2026-07-20',
    venue: 'くずまき高原牧場', area: 'iwate', city: '葛巻町',
    ageLabel: '全年齢', price: '入場無料',
    officialUrl: 'https://iwatetabi.jp/events/9075/',
    tags: ['花', '牧場', '屋外'],
  },

  // ===== 2026-07 週次メンテ追加（山形・兵庫・沖縄のカバレッジ補完） =====
  // 山形県
  {
    slug: 'yamagata-hanagasa-matsuri-2026',
    title: '山形花笠まつり',
    lede: '「ヤッショ、マカショ」の掛け声とともに、花笠を手にした踊り手が山形市の目抜き通りを埋め尽くす東北四大祭りのひとつ。華やかな衣装と軽快なお囃子は小さな子どもも思わず手拍子。沿道から気軽に観覧できる夏の風物詩です。',
    category: 'matsuri',
    startDate: '2026-08-05', endDate: '2026-08-07',
    venue: '山形市中心市街地（十日町・本町・七日町通り〜文翔館前）', area: 'yamagata', city: '山形市',
    ageLabel: '0〜小学生', price: '沿道観覧無料（有料観覧席あり）',
    officialUrl: 'https://www.hanagasa.jp/about/',
    tags: ['祭り', '踊り', '屋外'],
    recurring: 'annual',
    note: '毎年8月5・6・7日の固定開催。沿道は無料で観覧可、混雑するので抱っこ紐や水分補給の準備を。',
  },
  {
    slug: 'akagawa-hanabi-2026',
    title: '第33回 赤川花火大会',
    lede: '全国の花火師が技を競う競技花火大会として知られる、鶴岡・赤川河川敷の大規模花火。音楽と完全にシンクロしたスターマインは圧巻で、夜空いっぱいに大輪が広がります。全席チケット制なので事前購入で家族の席を確保して。',
    category: 'matsuri',
    startDate: '2026-08-15', endDate: '2026-08-15',
    venue: '赤川河川敷（三川橋〜羽黒橋）', area: 'yamagata', city: '鶴岡市',
    ageLabel: '0〜小学生', price: '全席チケット制（有料・事前購入制）',
    officialUrl: 'https://akagawahanabi.com/about/',
    tags: ['花火', '有料', '屋外'],
    note: '19時15分打ち揚げ開始（荒天順延なし）。全席有料のためチケット非所持では入場不可、事前購入が必須。',
  },
  {
    slug: 'kamo-kurage-jiyuu-kenkyu-2026',
    title: '夏休みクラゲ自由研究相談会（加茂水族館）',
    lede: 'クラゲ展示で知られる加茂水族館で、飼育スタッフが夏休みの自由研究をサポートしてくれる相談会。生き物の観察の仕方やまとめ方のヒントがもらえます。クラゲ水槽を眺めながら、親子で研究テーマを見つけられる時間です。',
    category: 'workshop',
    startDate: '2026-07-26', endDate: '2026-07-26',
    venue: '鶴岡市立加茂水族館 レクチャールーム', area: 'yamagata', city: '鶴岡市',
    ageLabel: '小・中学生（保護者同伴）', price: '入館料＋参加費500円/1組',
    officialUrl: 'https://kamo-kurage.jp/topics/jiyuu_2026/',
    tags: ['水族館', '自由研究', '室内', '雨の日OK'],
    note: '10:00〜12:00開催。年間パスポート所持者は入館料不要。参加は保護者同伴が必須。',
  },
  // 兵庫県
  {
    slug: 'kobe-weekend-hanabi-2026',
    title: '神戸港ウィークエンド花火',
    lede: 'メリケンパーク沖から週末の夜に約5分間だけ打ち上がる、観覧無料の小さな花火。短時間なので小さな子連れでも待ち疲れせず、港の夜景とあわせて楽しめます。散歩がてら気軽に立ち寄れる神戸の夏の定番です。',
    category: 'seasonal',
    startDate: '2026-07-18', endDate: '2026-08-29',
    venue: 'メリケンパーク沖', area: 'hyogo', city: '神戸市中央区',
    ageLabel: '0〜小学生', price: '観覧無料',
    officialUrl: 'https://www.kobe-meriken.or.jp/event/weekend-hanabi/',
    tags: ['花火', '無料', '屋外'],
    note: '7〜8月の指定土曜等に約5分間打ち上げ。開催日は公式で最新の日程を確認して。',
  },
  {
    slug: 'suma-seaworld-water-splash-2026',
    title: 'ウォーター・スプラッシュ・フェスティバル（神戸須磨シーワールド）',
    lede: '神戸須磨シーワールドの夏限定、思いっきり水を浴びて涼めるびしょ濡れイベント。水族館の入館料だけで参加でき、暑い日も子どもは大はしゃぎ。着替えとタオルを用意して、海の生き物とあわせて夏を満喫できます。',
    category: 'seasonal',
    startDate: '2026-08-01', endDate: '2026-08-23',
    venue: '神戸須磨シーワールド シーワールドプラザ', area: 'hyogo', city: '神戸市須磨区',
    ageLabel: '0〜小学生', price: '無料（別途水族館入館料）',
    officialUrl: 'https://www.kobesuma-seaworld.jp/guide/event/9691/',
    tags: ['水族館', '水遊び', '夏'],
    note: '着替え・タオル持参推奨。ずぶ濡れになるイベントなので暑い日の熱中症対策も忘れずに。',
  },
  {
    slug: 'takeno-kaijo-hanabi-2026',
    title: '第54回 たけの海上花火大会',
    lede: '澄んだ海が自慢の竹野浜で開かれる、観覧無料の海上花火大会。海面に映る光と夜空の花火が同時に楽しめ、開放的なビーチでのんびり過ごせます。日本海側ならではのゆったりした空気の中で夏の夜を過ごせます。',
    category: 'matsuri',
    startDate: '2026-07-30', endDate: '2026-07-30',
    venue: '竹野浜海水浴場', area: 'hyogo', city: '豊岡市',
    ageLabel: '0〜小学生', price: '無料（有料観覧席あり）',
    officialUrl: 'https://toyooka-tourism.com/event/takeno_hanabi/',
    tags: ['花火', '海', '無料', '屋外'],
    note: '20:00〜20:50（予定）打ち上げ。ビーチ開催なので足元と夜の冷え対策を。',
  },
  // 沖縄県
  {
    slug: 'churaumi-night-aquarium-2026',
    title: '美ら海ナイトアクアリウム',
    lede: '沖縄美ら海水族館が夜間限定でおくる幻想的なプログラム。照明を落とした「黒潮の海」大水槽の前で、昼とは違う魚たちの姿を観察できます。入館料だけで参加でき、涼しい夜にゆっくり回れるのも子連れにうれしいところ。',
    category: 'show',
    startDate: '2026-08-01', endDate: '2026-08-31',
    venue: '沖縄美ら海水族館', area: 'okinawa', city: '本部町',
    ageLabel: '0〜小学生', price: '入館料のみ',
    officialUrl: 'https://churaumi.okinawa/nightaquarium/',
    tags: ['水族館', '夜', '室内', '雨の日OK'],
    note: '18:00〜21:00（入館締切20:00）。昼より空いていて涼しく、ベビーカーでもゆっくり回れる。',
  },
  {
    slug: 'nago-natsu-matsuri-2026',
    title: '第45回 名護夏まつり〜青空市とビールまつり〜',
    lede: 'やんばるの玄関口・名護漁港で開かれる、青空市とビールまつりでにぎわう夏の恒例祭。2日間ともフィナーレには花火が打ち上がり、こども広場もあって家族で一日楽しめます。地元グルメの屋台めぐりも見どころです。',
    category: 'matsuri',
    startDate: '2026-07-25', endDate: '2026-07-26',
    venue: '名護漁港構内', area: 'okinawa', city: '名護市',
    ageLabel: '0〜小学生', price: '公式サイトでご確認ください',
    officialUrl: 'https://www.nago.or.jp/www2/2238.html',
    tags: ['祭り', '花火', '屋台', '屋外'],
    note: '両日13:00〜20:30、フィナーレに花火。こども広場あり。料金は公式で最新情報を確認して。',
  },
  {
    slug: 'yonabaru-otsunahiki-2026',
    title: '第44回 与那原大綱曳まつり',
    lede: '沖縄を代表する伝統行事のひとつ、与那原の大綱曳まつり。東西に分かれて大きな綱を曳き合う勇壮なまつりで、2日目の大綱曳がクライマックス。郷土芸能の披露もあり、子どもと一緒に沖縄の夏の熱気を間近で体感できます。',
    category: 'matsuri',
    startDate: '2026-08-15', endDate: '2026-08-16',
    venue: '与那古浜公園・御殿山青少年広場', area: 'okinawa', city: '与那原町',
    ageLabel: '0〜小学生', price: '公式サイトでご確認ください',
    officialUrl: 'https://www.town.yonabaru.okinawa.jp/soshiki/6/8321.html',
    tags: ['祭り', '伝統', '屋外'],
    note: '大綱曳は2日目（8/16）。花火の実施・日程は公式で準備中のため、あわせて最新情報を確認して。',
  },

  // ===== 2026-07-13 週次メンテ追加（福島・福井・静岡・鹿児島のカバレッジ補完） =====
  // 福島県
  {
    slug: 'fukushima-waraji-matsuri-2026',
    title: '第57回 福島わらじまつり',
    lede: '日本一の大わらじを担いで市街を練り歩く、福島の夏を代表する祭り。威勢のよいわらじおどりや太鼓が街を熱気で包みます。露店もならび、迫力ある巨大わらじを間近で見られるのは子どもにも忘れられない体験になります。',
    category: 'matsuri',
    startDate: '2026-08-07', endDate: '2026-08-09',
    venue: '国道13号 信夫通り・福島駅前通りほか', area: 'fukushima', city: '福島市',
    ageLabel: '全年齢', price: '観覧無料（有料観覧席あり）',
    officialUrl: 'https://www.waraji.co.jp/topics/1157/',
    tags: ['祭り', '屋台', '屋外'],
    recurring: 'annual',
    note: '7・8日が本まつり（わらじおどり）、9日が信夫山への大わらじ奉納。有料観覧席の価格は公式で確認を。',
  },
  {
    slug: 'comcom-ninja-2026',
    title: 'こむこむ 夏の企画展「忍者修行の巻」',
    lede: '福島市の子ども体験施設「こむこむ」の夏の企画展。手裏剣投げや白刃取り、分身の術など10種の修行に挑戦しながら、遊びの中で忍者気分を満喫できます。雨の日でも室内で体を動かして遊べる、夏休みにうれしい企画です。',
    category: 'workshop',
    startDate: '2026-07-18', endDate: '2026-08-23',
    venue: 'こむこむ館（福島市子どもの夢を育む施設）', area: 'fukushima', city: '福島市',
    ageLabel: '未就学児〜小学生', price: '公式サイトでご確認ください',
    officialUrl: 'https://www.f-shinkoukousha.or.jp/comcom/?cat=6',
    tags: ['体験型', '室内', '雨の日OK'],
    note: '9:30〜17:00（最終受付16:30）。JR福島駅東口徒歩約7分。料金は公式で最新情報を確認して。',
  },
  // 福井県
  {
    slug: 'angelland-paw-patrol-2026',
    title: 'エンゼルランドふくい 夏の企画展「パウ・パトロール」',
    lede: '人気キャラクター・パウ・パトロールをテーマにした、福井県児童科学館エンゼルランドふくいの夏の企画展。恐竜の島を調査する物語仕立ての展示で、遊びながら楽しめます。プラネタリウムや科学遊具もあり、一日たっぷり過ごせます。',
    category: 'show',
    startDate: '2026-07-18', endDate: '2026-08-31',
    venue: 'エンゼルランドふくい（福井県児童科学館）', area: 'fukui', city: '坂井市',
    ageLabel: '未就学児〜小学生', price: '公式サイトでご確認ください',
    officialUrl: 'https://angelland.or.jp/',
    tags: ['キャラクター', '室内', '雨の日OK'],
    note: '企画展の料金は公式で確認を。8/1〜2にはキャラクター来館イベントの予定あり。',
  },
  {
    slug: 'fukui-dino-sauropod-2026',
    title: '福井県立恐竜博物館 特別展「竜脚類」',
    lede: '地上最大の生き物といわれる竜脚類にスポットを当てた、福井県立恐竜博物館の2026年特別展。巨大な全身骨格や化石が並び、迫力の展示に子どもも夢中に。恐竜好きにはたまらない、夏休みの自由研究にもぴったりの企画展です。',
    category: 'seasonal',
    startDate: '2026-07-10', endDate: '2026-11-03',
    venue: '福井県立恐竜博物館', area: 'fukui', city: '勝山市',
    ageLabel: '全年齢', price: '一般1,800円・小中学生1,000円ほか',
    officialUrl: 'https://www.dinosaur.pref.fukui.jp/special/',
    tags: ['博物館', '室内', '雨の日OK'],
    note: '会期は7/10〜11/3。夏季（7/18〜8/16）は延長開館。常設展は別料金。',
  },
  // 静岡県
  {
    slug: 'atami-hanabi-summer-2026',
    title: '熱海海上花火大会（夏季）',
    lede: '三方を山に囲まれた熱海湾で打ち上がる花火が、すり鉢状の地形に反響して迫力満点。夏は複数日開催され、海辺やホテルからゆったり観覧できます。約20分に凝縮された構成で、小さな子ども連れでも最後まで楽しみやすい花火大会です。',
    category: 'seasonal',
    startDate: '2026-07-20', endDate: '2026-08-24',
    venue: '熱海湾', area: 'shizuoka', city: '熱海市',
    ageLabel: '全年齢', price: '観覧無料（有料指定席あり）',
    officialUrl: 'https://www.ataminews.gr.jp/notices/352',
    tags: ['花火', '夏', '屋外'],
    recurring: 'annual',
    note: '夏季の開催日は7/20・7/26・8/5・8/9・8/18・8/24の計6回。20:15〜20:40、雨天決行。',
  },
  {
    slug: 'kyoryu-park-shizuoka-2026',
    title: 'リアル恐竜ショー「恐竜パーク」静岡公演',
    lede: '本物のように動く大迫力の恐竜たちが舞台をかけめぐる、体感型のリアル恐竜ショー。ストーリー仕立てで小さな子どもも引き込まれます。屋内開催で天候を気にせず楽しめ、2歳以下はひざ上での観覧が無料なのも子連れにうれしいところ。',
    category: 'show',
    startDate: '2026-08-15', endDate: '2026-08-15',
    venue: '浜松市浜北文化センター', area: 'shizuoka', city: '浜松市',
    ageLabel: '3歳以上有料（2歳以下ひざ上無料）', price: '4,900円／3,900円（席種別）',
    officialUrl: 'https://kyoryu.srptokyo.com/shizuoka.html',
    tags: ['ショー', '恐竜', '室内'],
    note: '座席が必要な場合は2歳以下も有料。詳細・時間は公式公演ページで確認を。',
  },
  // 鹿児島県
  {
    slug: 'kinkowan-summer-hanabi-2026',
    title: '第24回 かごしま錦江湾サマーナイト大花火大会',
    lede: '錦江湾を舞台に約1万5千発が夜空を彩る、九州最大級の花火大会。桜島を背景に打ち上がる大輪の花火は圧巻で、水面に映る光も見どころです。無料で見られるエリアも広く、家族で鹿児島の夏の締めくくりを楽しめます。',
    category: 'matsuri',
    startDate: '2026-08-29', endDate: '2026-08-29',
    venue: '鹿児島港本港区', area: 'kagoshima', city: '鹿児島市',
    ageLabel: '全年齢', price: '観覧無料（有料観覧席あり）',
    officialUrl: 'https://hanabi.kankou-kagoshima.jp/',
    tags: ['花火', '夏', '屋外'],
    recurring: 'annual',
    note: '開場16:30ごろ・打ち上げ19:30ごろ（予定）。有料観覧席の詳細は公式で確認を。',
  },
  {
    slug: 'hirakawa-zoo-natsu-matsuri-2026',
    title: '平川動物公園「夏の動物公園まつり」',
    lede: '鹿児島市の平川動物公園が夏休みに合わせて開く恒例イベント。ウサギやモルモットとのふれあい、夏休みスケッチ大会、動物たちのひんやりタイムなど盛りだくさん。入園料だけで参加でき、動物と間近にふれあえる体験がそろいます。',
    category: 'seasonal',
    startDate: '2026-07-11', endDate: '2026-08-31',
    venue: '平川動物公園', area: 'kagoshima', city: '鹿児島市',
    ageLabel: '0〜小学生', price: '入園料のみ（イベント参加無料）',
    officialUrl: 'https://hirakawazoo.jp/',
    tags: ['動物園', 'ふれあい', '屋外'],
    recurring: 'annual',
    note: '世界ゾウの日イベント(8/11)やスケッチ大会など期間中に企画多数。夏休み向け。',
  },
];

/* ==========================================================================
   ヘルパー関数
   ========================================================================== */

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * 全イベントに event-overrides.json をマージして返す。
 * 各 helper はこの関数経由でデータを取るので、admin の編集が全画面で反映される。
 *
 * 動的import を使うのは循環依存を避けるため。
 */
function getMergedEvents(ovMap?: EventOverridesMap): EventEntry[] {
  const overrides = ovMap ?? BUNDLED_EVENT_OVERRIDES;
  return EVENTS.map((e) => {
    const ov = overrides[e.slug];
    return ov ? { ...e, ...ov } : e;
  });
}

/** すでに会期が終了したイベントか（endDate < 今日）。 */
export function isEventEnded(e: EventEntry): boolean {
  return e.endDate < todayString();
}

/** 全イベント（overrides マージ済） */
export function getAllEvents(ovMap?: EventOverridesMap): EventEntry[] {
  return getMergedEvents(ovMap);
}

/** 現在開催中のイベント（startDate <= today <= endDate） */
export function getOngoingEvents(): EventEntry[] {
  const today = todayString();
  return getMergedEvents().filter((e) => e.startDate <= today && today <= e.endDate);
}

/** 今週開催中 or 開催予定のイベント（今日から 7 日以内に始まる or 開催中） */
export function getThisWeekEvents(): EventEntry[] {
  const today = todayString();
  const weekLater = addDays(today, 7);
  return getMergedEvents()
    .filter((e) => e.endDate >= today && e.startDate <= weekLater)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** 今月開催のイベント */
export function getThisMonthEvents(): EventEntry[] {
  const today = todayString();
  const monthLater = addDays(today, 30);
  return getMergedEvents()
    .filter((e) => e.endDate >= today && e.startDate <= monthLater)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** エリア別のイベント */
export function getEventsByArea(area: AreaSlug): EventEntry[] {
  return getMergedEvents().filter((e) => e.area === area);
}

/** slug から1件取得 */
export function getEventBySlug(slug: string, ovMap?: EventOverridesMap): EventEntry | undefined {
  return getMergedEvents(ovMap).find((e) => e.slug === slug);
}

/** カテゴリ別 */
export function getEventsByCategory(cat: EventCategory): EventEntry[] {
  return getMergedEvents().filter((e) => e.category === cat);
}

/** カテゴリの日本語表示ラベル（一覧カード・フィルタUIで使用） */
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  matsuri: '祭り・縁日',
  illumination: 'イルミネーション',
  workshop: 'ワークショップ',
  rinyushoku: '離乳食教室',
  rhythm: 'リトミック',
  reading: '読み聞かせ',
  sport: 'スポーツ',
  seasonal: '季節の催し',
  market: 'マルシェ',
  show: '展示・ショー',
  other: 'その他',
};

/** 無料で参加できるイベントか（タグ「無料」か、料金欄が「（入場）無料」のみ） */
export function isFreeEvent(e: EventEntry): boolean {
  if (e.tags?.includes('無料')) return true;
  const p = (e.price || '').replace(/\s/g, '');
  return /^(入場|入園|観覧|参加|見学)?無料$/.test(p);
}

/** 0歳の赤ちゃん連れでも対象になるイベントか（ageLabel ベースの簡易判定） */
export function isBabyFriendlyEvent(e: EventEntry): boolean {
  const a = e.ageLabel || '';
  return /0[歳〜]/.test(a) || /0〜/.test(a) || a.includes('全年齢') || a.includes('未就学');
}

export type EventFilter = {
  /** エリア（都道府県 slug）。未指定なら全エリア */
  area?: AreaSlug;
  /** カテゴリ。未指定なら全カテゴリ */
  category?: EventCategory;
  /** 無料イベントのみ */
  free?: boolean;
  /** 今週末・まもなく（今日から7日以内に始まる or 開催中）のみ */
  soon?: boolean;
  /** 0歳の赤ちゃん連れOKのみ */
  baby?: boolean;
};

/**
 * 複合条件でイベントを絞り込む。終了済みは常に除外し、開始日昇順で返す。
 * /events のフィルタUIから呼び出す。
 */
export function filterEvents(f: EventFilter): EventEntry[] {
  const today = todayString();
  const weekLater = addDays(today, 7);
  return getMergedEvents()
    .filter((e) => e.endDate >= today) // 終了済みを除外
    .filter((e) => (f.area ? e.area === f.area : true))
    .filter((e) => (f.category ? e.category === f.category : true))
    .filter((e) => (f.free ? isFreeEvent(e) : true))
    .filter((e) => (f.soon ? e.startDate <= weekLater : true))
    .filter((e) => (f.baby ? isBabyFriendlyEvent(e) : true))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** 現在掲載中（終了前）のイベントに実在するエリア slug 一覧（フィルタUI用） */
export function getActiveEventAreas(): AreaSlug[] {
  const today = todayString();
  const set = new Set<AreaSlug>();
  for (const e of getMergedEvents()) {
    if (e.endDate >= today) set.add(e.area);
  }
  // AREAS の定義順（北→南の地理順）に並べる
  return AREAS.map((a) => a.slug).filter((slug): slug is AreaSlug => set.has(slug as AreaSlug));
}

/** 現在掲載中（終了前）のイベントに実在するカテゴリ一覧（フィルタUI用） */
export function getActiveEventCategories(): EventCategory[] {
  const today = todayString();
  const set = new Set<EventCategory>();
  for (const e of getMergedEvents()) {
    if (e.endDate >= today) set.add(e.category);
  }
  return [...set];
}

/** イベント開始までの残り日数を返す（既に開始済みなら 0 以下） */
export function daysUntilStart(e: EventEntry): number {
  const today = todayString();
  const start = new Date(e.startDate);
  const now = new Date(today);
  const diff = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** 残り日数バッジ表記（"あと3日" / "今週末" / "本日最終" / "開催中" 等） */
export function deadlineBadge(e: EventEntry): { text: string; level: 'urgent' | 'soon' | 'week' | 'normal' | 'live' } {
  const today = todayString();
  if (e.startDate <= today && today <= e.endDate) {
    // 開催中。終了までの日数を出す
    const end = new Date(e.endDate);
    const now = new Date(today);
    const left = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (left <= 0) return { text: '本日最終', level: 'urgent' };
    if (left <= 3) return { text: `あと${left}日`, level: 'soon' };
    return { text: '開催中', level: 'live' };
  }
  const dl = daysUntilStart(e);
  if (dl === 0) return { text: '本日開始', level: 'urgent' };
  if (dl === 1) return { text: '明日から', level: 'urgent' };
  if (dl <= 3) return { text: `あと${dl}日`, level: 'soon' };
  if (dl <= 7) return { text: '今週末', level: 'week' };
  return { text: `あと${dl}日`, level: 'normal' };
}

/** 子連れOK度（◎○△）を返す簡易ロジック */
export function kidFriendliness(e: EventEntry): { mark: '◎' | '○' | '△'; label: string } {
  // ageLabel に「0〜」または「0歳」が含まれる → ◎
  // 「3歳〜」「5歳〜」 → ○
  // それ以外 → △
  const a = e.ageLabel || '';
  if (/0[歳〜]|0〜/.test(a) || /全年齢/.test(a) || a.includes('未就学')) {
    return { mark: '◎', label: 'とても向いてる' };
  }
  if (/[1-3][歳〜]|[1-3]〜/.test(a)) {
    return { mark: '◎', label: 'とても向いてる' };
  }
  if (/[4-6][歳〜]|[4-6]〜/.test(a)) {
    return { mark: '○', label: '向いてる' };
  }
  return { mark: '△', label: 'やや注意' };
}

/** カテゴリ → 支給 D系 ヒーロー画像（hero未指定時のフォールバック用）。 */
const CATEGORY_HERO: Record<EventCategory, string> = {
  show:         '/v2/events/show-character-v2.webp',
  workshop:     '/v2/events/workshop-craft.webp',
  market:       '/v2/events/market-outdoor.webp',
  rhythm:       '/v2/events/rhythmic-class.webp',
  rinyushoku:   '/v2/events/rhythmic-class.webp',
  reading:      '/v2/events/workshop-craft.webp',
  matsuri:      '/v2/events/seasonal-summer-v2.webp',
  illumination: '/v2/events/seasonal-winter.webp',
  seasonal:     '/v2/events/seasonal-summer-v2.webp',
  sport:        '/v2/events/market-outdoor.webp',
  other:        '/v2/events/show-museum.webp',
};
/** イベントヒーロー画像（hero優先、なければカテゴリ別フォールバック）
 *
 * 注意: lib/events.ts の hero フィールドの一部は `/hero-ai/cat-kid-03.webp` 等を
 * 指しているが、対応するファイルが存在しない場合が多い（100件中45件が不在）。
 * そのため:
 *   1. hero が /v2/events/ または /hero-ai/cat-summer-* など信頼できるD系/支給系
 *      → そのまま使う
 *   2. それ以外 → KK pool (45枚, /v2/articles/kk-NN.webp) からハッシュで選択
 *      → 確実に存在する画像で表示崩れを防止
 *
 * 管理画面で画像差し替えを実装する場合は、microCMS や Vercel KV に画像URL を
 * 保存し、このロジックの先頭で「DB値があれば優先」とすればよい。
 */
const TRUSTED_HERO_PREFIXES = ['/v2/events/', '/v2/articles/', '/v2/spots/', '/photos/', '/img/scenes/', '/img/facilities/', '/img/kk/'];

/**
 * 公共施設のキーワードマッチ（v7, 2026-06-13）。Wikimedia CC 実写画像。
 * クレジット表示: public/img/facilities/_credits.json 参照。
 */
const EVENT_FACILITY_MAP: Array<[RegExp, string]> = [
  [/サンシャイン水族館|sunshine.*aquarium/i, '/img/facilities/sunshine-aquarium.webp'],
  [/サンシャイン/, '/img/facilities/sunshine-aquarium.webp'],
  [/葛西.*(水族|aquarium)/i, '/img/facilities/kasai-aquarium.webp'],
  [/葛西臨海公園/, '/img/facilities/kasai-park.webp'],
  [/葛西/, '/img/facilities/kasai-aquarium.webp'],
  [/美ら海|churaumi/i, '/img/facilities/churaumi-aquarium.webp'],
  [/イケ・?サンパーク|としまみどり/, '/img/facilities/ikebukuro-sunpark.webp'],
];

/**
 * v6（2026-06-13）: 信頼パス対象外（/hero-ai/cat-*）でも、カテゴリ＋タイトルから
 *   実写シーン画像（/img/scenes/）が当たる場合はそれを優先。シーン無マッチのみ KK プールに落とす。
 *   "イベントだけ管理画面でイラストのまま" だった問題を解消。
 */
function pickEventSceneByCategoryAndTitle(e: EventEntry): string | undefined {
  const t = `${e.title} ${e.venue ?? ''} ${e.lede ?? ''}`;
  // タイトル・会場文字列ベースで具体スポット推定
  if (/水族館|アクアリウム|クラゲ/.test(t)) return scenePickFrom('aquarium', e.slug);
  if (/動物園|サファリ|牧場|ふれあい/.test(t)) return scenePickFrom('zoo', e.slug);
  if (/花火/.test(t)) return scenePickFrom('seasonal', e.slug, 'park');
  if (/プール|水遊び|噴水/.test(t)) return scenePickFrom('pool-water', e.slug);
  if (/絵本|おはなし|読み聞かせ/.test(t)) return scenePickFrom('book', e.slug);
  if (/離乳食|赤ちゃん教室|ベビーマッサージ/.test(t)) return scenePickFrom('baby-food', e.slug, 'nursery');
  if (/マルシェ|物販|ショッピング/.test(t)) return scenePickFrom('shopping', e.slug);
  if (/工作|ワークショップ|ものづくり|お絵かき|折り紙|粘土/.test(t)) return scenePickFrom('craft', e.slug, 'indoor-play');
  if (/ピアノ|音楽|リトミック|スイミング|体操|英語|習い事/.test(t)) return scenePickFrom('lesson', e.slug);
  if (/科学|博物館/.test(t)) return scenePickFrom('indoor-play', e.slug);
  if (/まつり|お祭り|縁日|盆踊り/.test(t)) return scenePickFrom('seasonal', e.slug, 'park');
  if (/夏休み|夏祭り|プール開き/.test(t)) return scenePickFrom('pool-water', e.slug);
  if (/桜|花見|お花見|ひな祭り|端午/.test(t)) return scenePickFrom('seasonal', e.slug);
  if (/紅葉|秋|どんぐり|落ち葉|七五三/.test(t)) return scenePickFrom('seasonal', e.slug, 'park');
  if (/雪|スキー|そり|クリスマス|節分|ハロウィン|halloween|christmas/i.test(t)) return scenePickFrom('seasonal', e.slug);
  if (/公園|広場|遊具|滑り台|アスレチック/.test(t)) return scenePickFrom('park', e.slug);
  if (/料理|キッチン|cooking|食べ放題|レストラン/.test(t)) return scenePickFrom('meal', e.slug);
  if (/お弁当|キャラ弁|ベントー/.test(t)) return scenePickFrom('bento', e.slug);
  // カテゴリベース（タイトル文字列でヒットしなかった残り）
  switch (e.category) {
    case 'reading': return scenePickFrom('book', e.slug);
    case 'rinyushoku': return scenePickFrom('baby-food', e.slug, 'nursery');
    case 'rhythm': return scenePickFrom('indoor-play', e.slug);
    case 'matsuri': return scenePickFrom('seasonal', e.slug, 'park');
    case 'market': return scenePickFrom('shopping', e.slug);
    case 'workshop': return scenePickFrom('indoor-play', e.slug);
    case 'sport': return scenePickFrom('park', e.slug);
    case 'illumination':
    case 'seasonal': return scenePickFrom('seasonal', e.slug, 'park');
    case 'show': return scenePickFrom('indoor-play', e.slug);
    default: return undefined;
  }
}

/** 指定シーン（+任意のフォールバックシーン）からハッシュで決定的に1枚選ぶ */
function scenePickFrom(scene: string, slug: string, fallback?: string): string {
  // 2026-06-13: 追加51枚で seasonal/bento/shopping/sleep/book を増量、
  //   新シーン 5種（lesson/craft/screen-time/bath/medical）を追加。
  const counts: Record<string, number> = {
    'meal': 41, 'home-play': 25, 'pool-water': 20, 'park': 16, 'outing-general': 16,
    'screen-time': 10, 'seasonal': 10, 'lesson': 10,
    'book': 7, 'stroller': 7, 'medical': 7,
    'indoor-play': 6,
    'bento': 5, 'shopping': 5, 'sleep': 5, 'zoo': 5, 'baby-food': 5,
    'bath': 4, 'nursery': 4, 'cooking': 4, 'aquarium': 4, 'airplane': 4, 'craft': 4,
    'train': 3, 'toy': 3, 'rain': 3, 'car': 3, 'camp': 3,
  };
  const h = hashEventSlug(slug);
  const c = counts[scene] ?? 0;
  if (c > 0) {
    const n = (h % c) + 1;
    return `/img/scenes/${scene}-${String(n).padStart(2, '0')}.webp`;
  }
  if (fallback && counts[fallback]) {
    const n = (h % counts[fallback]) + 1;
    return `/img/scenes/${fallback}-${String(n).padStart(2, '0')}.webp`;
  }
  // フォールバック失敗時は outing-general
  const n = (h % 16) + 1;
  return `/img/scenes/outing-general-${String(n).padStart(2, '0')}.webp`;
}

export function eventHeroImage(e: EventEntry): string {
  // 1) /admin/event-images 経由の上書き（lib/event-overrides.json）が最優先
  // 動的import で循環依存を避ける
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const overrides = (require('./event-overrides.json') as Record<string, { hero?: string }>);
  const ov = overrides[e.slug];
  if (ov?.hero) return ov.hero;

  // 2) hero が信頼できるパス（v2/ 配下や photos/ 等 ＝ /img/scenes/, /img/facilities/ もここ）ならそのまま使用
  if (e.hero && TRUSTED_HERO_PREFIXES.some((p) => e.hero!.startsWith(p))) {
    return e.hero;
  }

  // 2.5) 公共施設キーワード（葛西水族館・美ら海・サンシャイン水族館 等）→ /img/facilities/ の実写
  const searchStr = `${e.title} ${e.venue ?? ''}`;
  for (const [re, img] of EVENT_FACILITY_MAP) {
    if (re.test(searchStr)) return img;
  }

  // 3) /hero-ai/ ... → タイトル・カテゴリから実写シーンへ自動マップ（v6, 2026-06-13）
  //    一意の施設イラスト（/hero-ai/anpanman-vs-kidzania.webp 等）は KK プールに落とす前に
  //    まずシーン推定を試みる。
  const scene = pickEventSceneByCategoryAndTitle(e);
  if (scene) return scene;

  // 4) シーン無マッチ → KK プール（45枚, /img/kk/kk-NN.webp）から決定的に選択
  const h = hashEventSlug(e.slug);
  const n = (h % 45) + 1;
  return `/img/kk/kk-${String(n).padStart(2, '0')}.webp`;
}

/** ハッシュ計算（lib/v2-adapters.ts の hashName と同等） */
function hashEventSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 開催期間を「3/15(土)」「3/20〜4/7」のような表示文字列に */
export function formatEventPeriod(e: EventEntry): string {
  const fmt = (d: string) => {
    const dt = new Date(d);
    const m = dt.getMonth() + 1;
    const day = dt.getDate();
    const w = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()];
    return `${m}/${day}(${w})`;
  };
  if (e.startDate === e.endDate) return fmt(e.startDate);
  return `${fmt(e.startDate)}〜${fmt(e.endDate)}`;
}
