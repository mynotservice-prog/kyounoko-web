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

import type { AreaSlug } from './area';

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
    slug: 'choukikenseibutsu-ten-2026',
    title: '特別展「超危険生物展 〜科学で挑む生き物の本気〜」',
    lede: '猛毒・巨大・最強の生き物たちが持つ「必殺技」を科学的に解明する特別展。標本や映像で迫力満点。生き物大好き世代の子に刺さります。',
    category: 'show',
    startDate: '2026-03-14',
    endDate: '2026-06-14',
    venue: '国立科学博物館',
    area: 'tokyo',
    city: '台東区',
    ageLabel: '4歳〜小学生',
    price: '一般 2,000円・小中高生 600円・未就学児 無料',
    officialUrl: 'https://www.kahaku.go.jp/',
    hero: '/hero-ai/cat-classroom-01.webp',
    tags: ['博物館', '学べる', '雨の日OK', '室内'],
    note: '上野駅すぐ。常設展も合わせると半日コース。お昼前後は授乳室・休憩スペースが混みやすい。',
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
  {
    slug: 'sanrio-ten-final-2026',
    title: 'サンリオ展 FINAL ver. — ニッポンのカワイイ文化60年史',
    lede: 'ハローキティをはじめサンリオ60年の歴史を貴重な原画やグッズで振り返る展覧会。0歳のベビーから祖父母世代まで「カワイイ」を共有できます。',
    category: 'show',
    startDate: '2026-04-09',
    endDate: '2026-06-21',
    venue: '森アーツセンターギャラリー（六本木ヒルズ）',
    area: 'tokyo',
    city: '港区',
    ageLabel: '0〜小学生',
    price: '公式サイトをご確認ください',
    officialUrl: 'https://www.roppongihills.com/macg/',
    hero: '/hero-ai/cat-toddler-01.webp',
    tags: ['キャラクター', 'ベビーカーOK', '雨の日OK', '室内'],
    note: '六本木駅徒歩4分。森ビル内で授乳室・おむつ替え台が充実。混雑時は事前予約推奨。',
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
    slug: 'tama-zoo-firefly-night',
    title: '多摩動物公園 ホタルの夕べ',
    lede: '都内とは思えない自然豊かな多摩で、ゲンジボタルの幻想的な光を親子で観察できる夏夜限定イベント。',
    category: 'seasonal',
    startDate: '2026-06-13', endDate: '2026-07-05',
    venue: '多摩動物公園', area: 'tokyo', city: '日野市',
    ageLabel: '3歳〜小学生', price: '大人 600円・小学生以下 無料',
    officialUrl: 'https://www.tokyo-zoo.net/zoo/tama/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['ホタル', '自然', '夜'],
    note: '土日のみ夜間開園。多摩動物公園駅徒歩1分。長袖長ズボン推奨。',
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
    note: '金町駅からバス15分。広い園内なのでベビーカー＋飲み物推奨。',
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
    slug: 'central-toshokan-yomi-week',
    title: '都立中央図書館 おはなし会 6月',
    lede: '0歳〜未就学児向けの絵本読み聞かせ会。毎週土曜開催で、季節の絵本を選書しています。',
    category: 'reading',
    startDate: '2026-06-07', endDate: '2026-06-28',
    venue: '東京都立中央図書館', area: 'tokyo', city: '港区',
    ageLabel: '0〜6歳', price: '無料',
    officialUrl: 'https://www.library.metro.tokyo.lg.jp/',
    hero: '/hero-ai/cat-classroom-02.webp',
    tags: ['読み聞かせ', '無料', '室内'],
    note: '広尾駅徒歩8分。毎週土曜 11:00／14:00 開催、予約不要。',
  },
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
  {
    slug: 'nerima-machi-cinema',
    title: '練馬まちなかシネマ 親子上映会',
    lede: '練馬区の劇場で「子ども連れOK」の特別上映。多少騒いでも気にせず映画デビューできます。',
    category: 'show',
    startDate: '2026-06-15', endDate: '2026-06-15',
    venue: '練馬文化センター', area: 'tokyo', city: '練馬区',
    ageLabel: '0〜小学生', price: '大人 1,000円・子ども 500円',
    officialUrl: 'https://www.neribun.or.jp/',
    hero: '/hero-ai/cat-kid-01.webp',
    tags: ['映画', '室内', '雨の日OK'],
    note: '練馬駅直結。室内照明やや明るめ、音量小さめの特別仕様。',
  },
  {
    slug: 'minato-rinyushoku-school',
    title: '港区 区民センター 離乳食教室',
    lede: '管理栄養士による離乳食デビュー〜完了期までの食べさせ方教室。試食もあります。',
    category: 'workshop',
    startDate: '2026-06-12', endDate: '2026-06-12',
    venue: '港区子ども家庭支援センター', area: 'tokyo', city: '港区',
    ageLabel: '0〜1歳', price: '無料（区民優先・要予約）',
    officialUrl: 'https://www.city.minato.tokyo.jp/',
    hero: '/hero-ai/cat-baby-02.webp',
    tags: ['離乳食', '無料', '室内'],
    note: '麻布十番駅徒歩10分。月1回開催、定員20名。',
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
    note: '橋本駅からバス20分。坂道多いので抱っこ紐推奨。',
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
    note: '西武秩父駅から徒歩20分。坂道なのでベビーカーは要注意。',
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
    note: '前橋駅からバス40分。広いのでベビーカー貸出を活用。',
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
    note: '土浦駅からバス40分。広く歩くため動きやすい服装で。',
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
    slug: 'kanto-hydrangea-train',
    title: '関東 あじさい列車 親子で乗ろう',
    lede: 'あじさいを車窓から楽しめる JR・私鉄各線の臨時列車。子鉄ファミリーに大人気。',
    category: 'seasonal',
    startDate: '2026-06-06', endDate: '2026-06-28',
    venue: '関東各線（箱根登山鉄道など）', area: 'kanagawa',
    ageLabel: '0〜小学生', price: '乗車券のみ',
    officialUrl: 'https://www.hakone-tozan.co.jp/',
    hero: '/hero-ai/cat-nature-03.webp',
    tags: ['電車', 'あじさい', '屋外'],
    note: '箱根登山鉄道が代表的。混雑時は車両指定推奨。',
  },
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
    slug: 'edogawa-firefly-event',
    title: '江戸川区行船公園 ホタル鑑賞会',
    lede: '都内では珍しいゲンジボタルの観察会。0歳〜大人まで自然の幻想的な光を楽しめます。',
    category: 'seasonal',
    startDate: '2026-06-20', endDate: '2026-06-28',
    venue: '行船公園', area: 'tokyo', city: '江戸川区',
    ageLabel: '0〜小学生', price: '入場無料',
    officialUrl: 'https://www.city.edogawa.tokyo.jp/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['ホタル', '無料', '夜'],
    note: '西葛西駅徒歩15分。日没後の暗い時間帯、懐中電灯持参。',
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
    slug: 'chiba-kominato-train-summer',
    title: '小湊鐵道 親子蛍観察列車',
    lede: '里山を走る人気ローカル線が、夏夜にホタル観察用の臨時列車を運行。電車好き親子に大人気。',
    category: 'seasonal',
    startDate: '2026-06-28', endDate: '2026-07-12',
    venue: '小湊鐵道（五井駅〜養老渓谷駅）', area: 'chiba', city: '市原市',
    ageLabel: '3歳〜小学生', price: '大人 1,500円・小学生 750円',
    officialUrl: 'https://www.kominato.co.jp/',
    hero: '/hero-ai/cat-nature-02.webp',
    tags: ['電車', 'ホタル', '夜'],
    note: '五井駅集合。完全予約制、虫除け＋上着持参。',
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

/** 現在開催中のイベント（startDate <= today <= endDate） */
export function getOngoingEvents(): EventEntry[] {
  const today = todayString();
  return EVENTS.filter((e) => e.startDate <= today && today <= e.endDate);
}

/** 今週開催中 or 開催予定のイベント（今日から 7 日以内に始まる or 開催中） */
export function getThisWeekEvents(): EventEntry[] {
  const today = todayString();
  const weekLater = addDays(today, 7);
  return EVENTS
    .filter((e) => e.endDate >= today && e.startDate <= weekLater)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** 今月開催のイベント */
export function getThisMonthEvents(): EventEntry[] {
  const today = todayString();
  const monthLater = addDays(today, 30);
  return EVENTS
    .filter((e) => e.endDate >= today && e.startDate <= monthLater)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** エリア別のイベント */
export function getEventsByArea(area: AreaSlug): EventEntry[] {
  return EVENTS.filter((e) => e.area === area);
}

/** slug から1件取得 */
export function getEventBySlug(slug: string): EventEntry | undefined {
  return EVENTS.find((e) => e.slug === slug);
}

/** カテゴリ別 */
export function getEventsByCategory(cat: EventCategory): EventEntry[] {
  return EVENTS.filter((e) => e.category === cat);
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
  show:         '/v2/events/show-character.webp',
  workshop:     '/v2/events/workshop-craft.webp',
  market:       '/v2/events/market-outdoor.webp',
  rhythm:       '/v2/events/rhythmic-class.webp',
  rinyushoku:   '/v2/events/rhythmic-class.webp',
  reading:      '/v2/events/workshop-craft.webp',
  matsuri:      '/v2/events/seasonal-summer.webp',
  illumination: '/v2/events/seasonal-winter.webp',
  seasonal:     '/v2/events/seasonal-summer.webp',
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
const TRUSTED_HERO_PREFIXES = ['/v2/events/', '/v2/articles/', '/v2/spots/', '/photos/'];
export function eventHeroImage(e: EventEntry): string {
  // hero が信頼できるパス（v2/ 配下や photos/ 等）ならそのまま使用
  if (e.hero && TRUSTED_HERO_PREFIXES.some((p) => e.hero!.startsWith(p))) {
    return e.hero;
  }
  // それ以外（/hero-ai/cat-* など 存在しないファイル多数）はKKプールに回す
  // ユーザー支給の高品質画像45枚から slugハッシュで決定的に選択
  // → 全イベントで安定して画像が表示される
  const h = hashEventSlug(e.slug);
  const n = (h % 45) + 1;
  return `/v2/articles/kk-${String(n).padStart(2, '0')}.webp`;
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
