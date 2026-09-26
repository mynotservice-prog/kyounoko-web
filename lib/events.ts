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
// 管理画面「新規イベント」で作成したイベント（/api/admin/event-create が GitHub commit で追記）。
import EVENTS_EXTRA from './events-extra.json';

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
const BASE_EVENTS: EventEntry[] = [
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
    slug: 'kahaku-ikimono-cho-world-2026',
    title: '特別展「いきもの超ワールド展 国立科学博物館×ダーウィンが来た！」',
    lede: 'NHK「ダーウィンが来た！」と科博がタッグを組んだ特別展。迫力ある映像と標本でいきものの不思議に迫ります。上野公園なので前後のおでかけと組み合わせやすい会場です。',
    category: 'show',
    startDate: '2026-07-11', endDate: '2026-10-12',
    venue: '国立科学博物館', area: 'tokyo', city: '台東区',
    ageLabel: '4歳〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://ikimonoworld.jp/',
    hero: '/hero-ai/cat-classroom-03.webp',
    tags: ['博物館', '体験型', '室内', '雨の日OK'],
    note: '9:00〜17:00（入場は16:30まで）。休館日は9/7・9/14・9/24・9/28。上野駅公園口から徒歩5分。',
  },
  {
    slug: 'skytree-chiikawa-2026',
    title: 'ちいかわ☆星ふるスカイツリーとひみつの島',
    lede: '東京スカイツリー展望台でのちいかわコラボ企画。キャラクターの装飾やフォトスポットが展望フロアに登場し、小さい子でも楽しめます。',
    category: 'show',
    startDate: '2026-07-10', endDate: '2026-10-31',
    venue: '東京スカイツリー', area: 'tokyo', city: '墨田区',
    ageLabel: '0〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.tokyo-skytree.jp/event/',
    hero: '/hero-ai/cat-family-01.webp',
    tags: ['室内', '雨の日OK', 'キャラクター'],
    note: '押上駅・とうきょうスカイツリー駅直結。すみだ水族館・ソラマチと同じ建物なので雨の日に一日過ごせます。',
  },
  {
    slug: 'puroland-halloween-2026',
    title: 'サンリオピューロランド PUROMONSTERSCRAMBLE（ハロウィーン）',
    lede: 'ハローキティやクロミたちがモンスター姿で登場する屋内型ハロウィーンイベント。全館屋内なので天候に左右されません。',
    category: 'seasonal',
    startDate: '2026-09-11', endDate: '2026-11-03',
    venue: 'サンリオピューロランド', area: 'tokyo', city: '多摩市',
    ageLabel: '0〜小学生', price: 'パスポートが必要（公式サイトをご確認ください）',
    officialUrl: 'https://www.puroland.jp/event-campaign/2026_halloween/',
    hero: '/hero-ai/cat-family-02.webp',
    tags: ['室内', '雨の日OK', 'キャラクター', 'ハロウィン'],
    note: '多摩センター駅から徒歩5分。ボートライドのホラーバージョンは中学生以上限定で、小学生以下は乗船できません。',
  },
  {
    slug: 'minato-kagakukan-aki-2026',
    title: 'みなと科学館 秋の企画展「デジタルでみる 東京自然いきもの展」',
    lede: '港区立みなと科学館の秋の企画展。8K映像やタブレットで身近な自然のいきものを観察できます。同時開催の「子どもとつくるミニ企画展」もあります。',
    category: 'workshop',
    startDate: '2026-09-16', endDate: '2026-11-08',
    venue: '港区立みなと科学館', area: 'tokyo', city: '港区',
    ageLabel: 'どなたでも', price: '公式サイトをご確認ください',
    officialUrl: 'https://minato-kagaku.tokyo/',
    hero: '/hero-ai/cat-classroom-03.webp',
    tags: ['科学', '体験型', '室内', '雨の日OK'],
    note: '会場は多目的ロビー。虎ノ門ヒルズ駅・神谷町駅から徒歩圏。プラネタリウムも併設。',
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
  // ===== 神奈川・横浜 =====
  // ===== 埼玉 =====

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
    recurring: 'annual',
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

  // ===== 東京 — 室内遊び場・商業施設 =====
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

  // ===== 東京 — 図書館・地域施設 =====
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

  // ===== 各種ワークショップ =====
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

  // ===== 関東広域季節物 =====

  // ===== 追加分 =====
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

  // ===== 全国展開バッチ（2026年6〜7月・編集部Web確認） =====
  // 東北
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
    lede: '夏から秋にかけて夜間開館を実施してきたイベント（公式ページの日程は2023年分まで。2026年の開催日は公式で未確認）。夜のイルカショーやトンネル水槽のライトアップなど、昼とは違う幻想的な雰囲気の中で生き物たちを観察できる特別なイベントです。開催日は公式サイトでご確認ください。',
    category: 'show',
    startDate: '2026-07-01', endDate: '2026-09-30',
    venue: 'のとじま水族館', area: 'ishikawa', city: '七尾市',
    ageLabel: '全年齢', price: '別途入館料',
    officialUrl: 'https://www.notoaqua.jp/night/',
    tags: ['水族館', '夜', '室内'],
    note: '2026-09-26 に公式ページを確認したところ、掲載されている開催日は令和5年（2023年）の7〜9月の計8日間のみで、2026年の開催日は公式に記載を確認できませんでした。この期間は例年の開催時期の目安です。行く前に必ず公式サイトで最新の開催状況を確認してください。',
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

  // ── 2026-2027 秋冬（2026-08-27 に公式一次情報で確認して追加）──────────────
  // イルミネーションは全156件中0件だった。冬の在庫の起点として、公式が
  // すでに会期を発表しているものだけを入れている。未発表の会場は
  // lib/event-announce-watch.ts のウォッチリストで発表待ちにしてある。
  {
    slug: 'yomiuriland-jewellumination-2026',
    title: 'よみうりランド ジュエルミネーション2026 Growing Light',
    lede: '照明デザイナー石井幹子プロデュースの宝石色イルミネーション。2026-2027シーズンは10月29日から138日間で、春休みまで続くので寒さの底を避けて選べます。',
    category: 'illumination',
    startDate: '2026-10-29', endDate: '2027-04-04',
    venue: '遊園地よみうりランド', area: 'tokyo', city: '稲城市',
    ageLabel: '0歳〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.yomiuriland.com/jewellumination/',
    tags: ['イルミネーション', '遊園地', '屋外', '冬'],
    note: '公式ニュースリリース（2026年8月25日）で会期は2026年10月29日(木)〜2027年4月4日(日)の138日間と発表されています。点灯時間・料金・休園日は公式の「料金・チケット」「営業時間・カレンダー」で確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'yomiuriland-halloween-2026',
    title: 'よみラン ハロウィン！〜 Jump in Party 2026 〜',
    lede: '仮装して行くとワンデーパスが最大1,000円引きになるよみうりランドのハロウィン企画。9月下旬から11月頭までと期間が長いので、混雑を外して選びやすいのが子連れ向きです。',
    category: 'seasonal',
    startDate: '2026-09-26', endDate: '2026-11-01',
    venue: '遊園地よみうりランド', area: 'tokyo', city: '稲城市',
    ageLabel: '0歳〜小学生', price: '公式サイトをご確認ください（仮装でワンデーパス最大1,000円引き）',
    officialUrl: 'https://www.yomiuriland.com/',
    tags: ['ハロウィン', '遊園地', '仮装', '屋外'],
    note: '公式ニュースリリース（2026年8月26日）で会期は9月26日(土)〜11月1日(日)と発表されています。割引の適用条件（仮装の範囲・対象券種）は公式で確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'sagamiko-illumillion-2026',
    title: 'さがみ湖イルミリオン 2026-2027',
    lede: '相模湖の斜面をまるごと使う関東最大級のイルミネーション。11月中旬から翌年5月まで開催で、リフトで上がって見下ろせるのでベビーカー移動の負担を減らせます。',
    category: 'illumination',
    startDate: '2026-11-14', endDate: '2027-05-09',
    venue: '相模湖リゾート プレジャーフォレスト', area: 'kanagawa', city: '相模原市緑区',
    ageLabel: '0歳〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.sagamiko-resort.jp/illumillion/',
    tags: ['イルミネーション', '屋外', '冬', 'リフト'],
    note: '公式の「2026-2027シーズン営業のお知らせ」で会期は2026年11月14日(土)〜2027年5月9日(日)、4月5日以降は土日祝のみの営業と案内されています（2026年8月27日に公式で確認）。点灯時間・料金は公式の「営業時間・料金」で確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'sapporo-autumn-fest-2026',
    title: '2026 さっぽろオータムフェスト',
    lede: '大通公園を丸ごと使う北海道の食の祭典。会場が丁目ごとに分かれているので、屋台の行列に並ぶ間も子どもを芝生側で待たせやすいのが子連れ向きです。',
    category: 'market',
    startDate: '2026-09-11', endDate: '2026-10-03',
    venue: '大通公園', area: 'hokkaido', city: '札幌市中央区',
    ageLabel: '全年齢', price: '入場無料（飲食は各ブースで購入）',
    officialUrl: 'https://www.sapporo.travel/autumnfest/',
    tags: ['グルメ', '屋外', '無料', '秋'],
    note: '会期は2026年9月11日(金)〜10月3日(土)、10:00〜20:30（ラストオーダー20:00）。会場は大通公園4〜8丁目・10丁目・11丁目（北海道公式観光サイトで2026年8月31日に確認）。ベビーカーは夕方以降かなり混み合うので、日中の時間帯が動きやすいです。',
    recurring: 'annual',
  },
  {
    slug: 'sendai-uminomori-art-night-2026',
    title: '仙台うみの杜水族館 アートナイト水族館',
    lede: '閉館後の館内で生きものを見ながら自由に絵を描ける1日限りの夜イベント。画材や椅子の持ち込みができて座って過ごせるので、小さい子でも参加しやすい構成です。',
    category: 'workshop',
    startDate: '2026-09-12', endDate: '2026-09-12',
    venue: '仙台うみの杜水族館', area: 'miyagi', city: '仙台市宮城野区',
    ageLabel: '4歳〜', price: '大人2,200円・小中高生1,000円・幼児（4歳以上）500円',
    officialUrl: 'https://www.uminomori.jp/',
    tags: ['水族館', '夜', '室内', '雨の日OK', 'お絵かき'],
    note: '2026年9月12日(土)18:00〜21:00（最終入館20:00）。運営元（横浜八景島）のプレスリリースで確認（2026年8月31日）。色鉛筆・ペン・タブレットや椅子、イーゼルの持ち込みが可能と案内されています。チケットは事前購入制なので公式で最新の販売状況を確認してください。',
  },
  {
    slug: 'nihondaira-zoo-night-2026',
    title: '日本平動物園 夜の動物園 2026',
    lede: '昼とは違う動物の動きが見られる年に数日の夜間開園。16:30にいったん閉園する完全入れ替え制なので、園内が昼ほど混まず0〜3歳連れでも回りやすい回です。',
    category: 'show',
    startDate: '2026-10-10', endDate: '2026-10-11',
    venue: '静岡市立日本平動物園', area: 'shizuoka', city: '静岡市駿河区',
    ageLabel: '0歳〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.nhdzoo.jp/',
    tags: ['動物園', '夜', '屋外', '秋'],
    note: '2026年10月10日(土)・11日(日)の17:30〜20:30（最終入園19:30）。昼夜完全入れ替え制で16:30に一度閉園します（公式イベントページで2026年8月31日に確認）。駐車場は整理券の事前申込制、前売券はコンビニ販売と案内されています。',
    recurring: 'annual',
  },
  {
    slug: 'jidai-matsuri-2026',
    title: '時代祭 2026',
    lede: '平安神宮の大祭で、各時代の装束をまとった行列が京都御所から平安神宮まで進みます。行列は歩道から無料で見られるので、子どもは「昔の人の服」を眺めるだけで十分楽しめます。',
    category: 'matsuri',
    startDate: '2026-10-22', endDate: '2026-10-22',
    venue: '京都御所〜平安神宮（御池通・河原町通ほか）', area: 'kyoto', city: '京都市',
    ageLabel: '全年齢', price: '沿道からの観覧は無料（有料観覧席は別途）',
    officialUrl: 'https://ja.kyoto.travel/event/single.php?event_id=7049',
    tags: ['祭り', '屋外', '無料', '秋'],
    note: '2026年10月22日(木)、京都御所を12:00出発〜平安神宮14:30着（雨天の場合は翌23日に順延）。京都市公式観光サイトで2026年8月31日に確認。有料観覧席は京都御苑・御池通・神宮道に設けられます。行列は約2時間かかるので、通過する時間帯だけを狙うのが子連れ向きです。',
    recurring: 'annual',
  },
  {
    slug: 'nabana-no-sato-illumination-2026',
    title: 'なばなの里 イルミネーション 2026-2027',
    lede: '国内最大級のイルミネーション。順路が舗装された園路でベビーカーを押したまま回れるうえ、会期が10月から翌5月までと長いので寒さの手前の時期を選べます。',
    category: 'illumination',
    startDate: '2026-10-17', endDate: '2027-05-31',
    venue: 'なばなの里', area: 'mie', city: '桑名市',
    ageLabel: '0歳〜小学生', price: '公式サイトをご確認ください（入村料が必要）',
    officialUrl: 'https://www.nagashima-onsen.co.jp/nabana/illumination/index.html',
    tags: ['イルミネーション', '屋外', '冬', 'ベビーカーOK'],
    note: '公式イルミネーションページで会期は2026年10月17日〜2027年5月31日と案内されています（2026年8月31日に確認）。点灯時間・入村料・休村日は公式の「営業時間・料金」で確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'hakozakigu-hojoya-2026',
    title: '筥崎宮 放生会 2026',
    lede: '博多三大祭りのひとつで、参道に約1週間ずらりと露店が並びます。神事を見なくても屋台歩きだけで成立するので、就学前の子と短時間だけ立ち寄る使い方ができます。',
    category: 'matsuri',
    startDate: '2026-09-12', endDate: '2026-09-18',
    venue: '筥崎宮', area: 'fukuoka', city: '福岡市東区',
    ageLabel: '全年齢', price: '参拝無料（露店は各店で購入）',
    officialUrl: 'https://hakozakigu.or.jp/',
    tags: ['祭り', '屋台', '屋外', '無料', '秋'],
    note: '公式「仲秋大祭『放生会』斎行のご案内」で会期は2026年9月12日〜18日と案内されています（2026年8月31日に確認）。放生会大祭（例祭）は9月15日10:00、稚児行列は9月18日14:00。神事・イベントの全スケジュールは追って公式で案内されるとのことなので、行く前に最新情報を確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'nagasaki-kunchi-2026',
    title: '長崎くんち 2026',
    lede: '諏訪神社の秋季大祭。龍踊やコッコデショなど踊町の演し物が市内数か所で奉納されます。庭先回りなら街なかで短時間だけ見られるので、子連れは無理に桟敷を取らなくても楽しめます。',
    category: 'matsuri',
    startDate: '2026-10-07', endDate: '2026-10-09',
    venue: '諏訪神社・中央公園・お旅所・八坂神社', area: 'nagasaki', city: '長崎市',
    ageLabel: '全年齢', price: '観覧無料（桟敷席は有料）',
    officialUrl: 'https://www.osuwasan.jp/kunchi/',
    tags: ['祭り', '屋外', '無料', '秋'],
    note: '毎年10月7日〜9日の同日開催で、2026年は10月7日(水)〜9日(金)。長崎県観光連盟の公式イベント情報および諏訪神社公式で2026年8月31日に確認。太鼓や爆竹の音が大きいので、乳児連れは耳の保護があると安心です。',
    recurring: 'annual',
  },
  {
    slug: 'tokyo-disney-halloween-2026',
    title: 'ディズニー・ハロウィーン 2026（東京ディズニーランド／東京ディズニーシー）',
    lede: '両パークで同時開催されるハロウィーンイベント。全身仮装ができる期間が前半と後半に分かれているので、仮装したい子連れは日程を選んで行く必要があります。',
    category: 'seasonal',
    startDate: '2026-09-16', endDate: '2026-10-31',
    venue: '東京ディズニーランド／東京ディズニーシー', area: 'chiba', city: '浦安市',
    ageLabel: '0歳〜小学生', price: 'パークチケットが必要（公式サイトをご確認ください）',
    officialUrl: 'https://www.tokyodisneyresort.jp/treasure/halloween2026/tdl/',
    tags: ['ハロウィン', 'テーマパーク', '仮装', '屋外'],
    note: '会期は2026年9月16日(水)〜10月31日(土)で、東京ディズニーランド・東京ディズニーシーの両方で開催されます。全身仮装ができるのは9月15日(火)〜9月30日(水)と10月16日(金)〜10月31日(土)の2期間で、10月1日〜15日は全身仮装できません。仮装のルール（露出・小道具・付き添いの範囲など）は公式の「ディズニー・ハロウィーンでの仮装」で必ず確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'shonan-no-hoseki-2026',
    title: '湘南の宝石 2026-2027 〜江の島を彩る光と色の祭典〜',
    lede: '江の島シーキャンドルとサムエル・コッキング苑を中心に島全体が光る冬の恒例イルミネーション。12月から2月末までと会期が長く、平日の早い時間を選べば混雑を避けて小さな子とも回れます。',
    category: 'illumination',
    startDate: '2026-12-01', endDate: '2027-02-28',
    venue: '江の島サムエル・コッキング苑／江の島シーキャンドル', area: 'kanagawa', city: '藤沢市',
    ageLabel: '0歳〜', price: '公式サイトをご確認ください（会場ごとに入場料あり）',
    officialUrl: 'https://enoshima-seacandle.com/event/shonannohoseki/',
    tags: ['イルミネーション', '冬', '江の島', '夜'],
    note: '公式ページに「2026年12月1日（火）〜2027年2月28日（日）」と会期が掲載されています（2026-09-07確認）。点灯時間・料金は「詳細は随時更新します」の状態で2026-2027シーズン分は未掲載のため、公式で確認してください。島内は坂と階段が多く、エスカー（有料）の利用可否をあらかじめ確認しておくと安心です。',
    recurring: 'annual',
  },
  {
    slug: 'showa-kinen-cosmos-2026',
    title: '国営昭和記念公園 コスモスまつり2026',
    lede: '花の丘のキバナコスモス400万本を中心に、9月中旬から10月末まで約6週間つづく秋の花イベント。中学生以下は入園無料で、広い園路はベビーカーでもそのまま回れます。',
    category: 'seasonal',
    startDate: '2026-09-12', endDate: '2026-10-25',
    venue: '国営昭和記念公園', area: 'tokyo', city: '立川市',
    ageLabel: '0歳〜', price: 'イベント参加無料（入園料 大人450円・65歳以上210円・中学生以下無料）',
    officialUrl: 'https://www.showakinen-koen.jp/event/56303/',
    tags: ['コスモス', '公園', '秋', '花'],
    note: '公式イベントページに「9月12日（土）～10月25日（日）」と会期が明記されています（2026-09-07確認）。無料入園日は10月24日(土)・25日(日)、9月21日(月祝)は65歳以上限定。会場は花の丘・原っぱ南花畑ほか。',
    recurring: 'annual',
  },
  {
    slug: 'wb-studio-tour-dark-arts-2026',
    title: 'ワーナー ブラザース スタジオツアー東京 闇の魔術のハロウィーン',
    lede: 'スタジオツアー東京の開業以来はじめてのハロウィーン企画。ホグワーツ城の模型が不気味な空間に変わる演出なので、暗い雰囲気が苦手な子は事前に話しておくと安心です。',
    category: 'seasonal',
    startDate: '2026-09-10', endDate: '2026-11-08',
    venue: 'ワーナー ブラザース スタジオツアー東京 - メイキング・オブ・ハリー・ポッター', area: 'tokyo', city: '練馬区',
    ageLabel: '小学生〜（暗い演出あり）', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.wbstudiotour.jp/dark-arts/',
    tags: ['ハロウィン', '屋内', '雨でもOK'],
    note: '公式ページに「開催期間: 2026年9月10日(木)～11月8日(日)」と明記（2026-09-07確認）。公式の説明どおり「死喰い人に占拠され、闇の魔術が渦巻く」演出で、通常より暗く不気味な方向の装飾になります。未就学児には刺激が強い場面がある前提で計画してください。10月27・28・29日限定のホグワーツディナーもあります。',
    recurring: 'annual',
  },
  {
    slug: 'aquapark-shinagawa-momiji-2026',
    title: 'マクセル アクアパーク品川 MOMIJI AQUARIUM by NAKED',
    lede: '館内が紅葉の演出に染まる秋限定プログラム。品川駅高輪口から徒歩約2分と近く、水族館入場料だけで見られるので、0〜2歳連れでも移動の負担を小さくできます。',
    category: 'seasonal',
    startDate: '2026-09-12', endDate: '2026-11-08',
    venue: 'マクセル アクアパーク品川', area: 'tokyo', city: '港区',
    ageLabel: '0歳〜', price: '水族館入場料のみ（おとな2,800円・小中学生1,300円・幼児4才以上800円）',
    officialUrl: 'https://www.aqua-park.jp/aqua/momijiaquarium2026/',
    tags: ['水族館', '紅葉', '屋内', '駅近'],
    note: '公式特設ページに「開催期間 2026年9月12日(土)～11月8日(日)」と明記（2026-09-07確認）。追加料金なしで水族館入場料に含まれます。デイ版のドルフィンパフォーマンス「Autumn Dolphin Festa」は幼児でも楽しめますが、夜のプログラムは暗所演出が強めです。',
    recurring: 'annual',
  },
  {
    slug: 'shinagawa-aquarium-eric-carle-2026',
    title: 'しながわ水族館 特別展「エリック・カールと いのちの色」',
    lede: 'はらぺこあおむし日本語版50周年の特別展。塗り絵コーナーと絵本ライブラリーがあり、ベビーカーのまま館内を回れるので0〜3歳の絵本世代にちょうど合います。',
    category: 'other',
    startDate: '2026-07-25', endDate: '2026-12-25',
    venue: 'しながわ水族館', area: 'tokyo', city: '品川区',
    ageLabel: '0〜6歳', price: '入館料のみ（大人1,350円・小中学生600円・幼児4歳以上300円）',
    officialUrl: 'https://www.aquarium.gr.jp/news/events/31639',
    tags: ['水族館', '絵本', '屋内', '雨でもOK'],
    note: '公式に「2026年7月25日（土）から12月25日（金）まで開催いたします」と明記（2026-09-07確認）。公式のバリアフリー案内では、ベビーカーのまま見学可・館内エレベーター2ヶ所、ただし土日祝の混雑時は入口前のベビーカー置場の利用を推奨、ベビーカーの貸出はなし。ミルクと離乳食に限りイルカルーム内で食べさせられ、調乳用温水器と電子レンジがあります。特別展会場は地下1Fクマノミルーム。',
  },
  {
    slug: 'sunshine-aquarium-zannen3-2026',
    title: 'サンシャイン水族館 特別展「ざんねんないきもの展３」',
    lede: '人気シリーズの第3弾。約25種の生きものを7つのテーマで見せる特別展で、水族館本館とは別会場・別料金です。11月23日までなので秋の予定に組みやすい構成。',
    category: 'other',
    startDate: '2026-03-13', endDate: '2026-11-23',
    venue: 'サンシャイン水族館', area: 'tokyo', city: '豊島区',
    ageLabel: '3歳〜小学生', price: '特別展のみ600円（水族館本館ほか対象施設利用者は400円）・4歳未満無料',
    officialUrl: 'https://sunshinecity.jp/aquarium/event_performance/event/entry-36530.html',
    tags: ['水族館', '特別展', '屋内', '雨でもOK'],
    note: '公式イベントページに「開催期間 2026/03/13(金)～2026/11/23(月)」と明記（2026-09-07確認）。9月1日以降の入場時間は平日10:00〜18:00・土日祝10:00〜19:00（最終入場は終了30分前）で、11月12日(木)は休館です。水族館ではベビーカーの貸出がなく、公式も「混雑時には、ベビーカーでは水族館内を進むことが困難になる」と案内しています。',
  },
  {
    slug: 'sumida-aquarium-vr-2026',
    title: 'すみだ水族館 VRアトラクション（国内水族館初導入）',
    lede: '海の中を体感する約6分のVR体験が、9月から11月末まで期間限定で登場。身長90cm以上から参加でき、当日申込制なので水族館めぐりのついでに寄れます。',
    category: 'other',
    startDate: '2026-09-01', endDate: '2026-11-30',
    venue: 'すみだ水族館', area: 'tokyo', city: '墨田区',
    ageLabel: '身長90cm以上（小学生以下は保護者同伴）', price: '入場料＋VR体験1コンテンツ1,000円',
    officialUrl: 'https://www.sumida-aquarium.com/news/s_260831/',
    tags: ['水族館', '体験', '屋内', '雨でもOK'],
    note: '公式ニュースに「設置期間：2026年9月1日（火）～11月30日（月）」「対象：身長90cm以上 小学生以下は保護者同伴必要」と明記（2026-09-07確認）。設置は5階インフォメーション横に4台、体験時間は約6分、当日申込制。体験可能時間は平日12:00〜18:00・土日祝11:00〜19:00。公式に「揺れや振動が伴います」と注意書きがあります。',
  },
  {
    slug: 'tama-zoo-naku-mushi-2026',
    title: '多摩動物公園 秋の鳴く虫展',
    lede: '昆虫園本館で昼夜を逆転させ、秋の虫の声を昼間に聞ける屋内展示。小学生以下と都内在住・在学の中学生は入園無料で、残暑や雨の日でも成立します。',
    category: 'other',
    startDate: '2026-09-10', endDate: '2026-09-23',
    venue: '多摩動物公園 昆虫園本館', area: 'tokyo', city: '日野市',
    ageLabel: '0歳〜', price: '入園料のみ（一般600円・中学生200円・小学生以下無料）',
    officialUrl: 'https://www.tokyo-zoo.net/tama/news/12747/index.html',
    tags: ['動物園', '昆虫', '屋内', '雨でもOK'],
    note: '公式に「期間 2026年9月10日（木）～23日（水・祝） ※9月16日（水）は休園」「時間 9時30分～16時30分」「場所 昆虫園本館1階」と明記（2026-09-07確認）。公式の注意として、この会期中は「虫とふれあいコーナー」が休止になります。ベビーカーは1台1日500円で貸出がありますが、昆虫生態園・コアラ館などベビーカーを持ち込めない施設があります。',
    recurring: 'annual',
  },
  {
    slug: 'kodomonokuni-aki-wakuwaku-2026',
    title: 'こどもの国 秋のちびっこわくわくイベント',
    lede: '9月から11月の土日祝に中央広場で開く小さな子向けの遊び場。縁日は年齢制限なし、ふわふわ遊具は4〜12歳と対象がはっきりしているので、行く前に遊べるものを選べます。',
    category: 'seasonal',
    startDate: '2026-09-05', endDate: '2026-11-23',
    venue: 'こどもの国 中央広場', area: 'kanagawa', city: '横浜市青葉区',
    ageLabel: '0歳〜小学生（遊具ごとに年齢制限あり）', price: '入園料（おとな800円・小中学生300円・幼児3歳以上200円・0〜2歳無料）＋遊具ごとに500〜1,500円',
    officialUrl: 'https://www.kodomonokuni.org/event_topics/detail.html?id=267',
    tags: ['公園', '縁日', '屋外', '週末'],
    note: '公式に「9月5日（土）～11月23日（日）一部土日祝」とあり、実施日は9月5・6・12・13・19〜23日、10月3・4・17・18・24・25日、11月21〜23日（2026-09-07確認）。10時〜16時（最終受付）。遊具の対象はウォーターバルーン3歳以上（5歳以下は保護者同伴）、ふわふわ遊具4〜12歳、パドラーボート5歳以上（体重40kgまで）、縁日は対象制限なし。悪天候・強風時は中止です。',
    recurring: 'annual',
  },
  {
    slug: 'kodomonokuni-field-game-aki-2026',
    title: 'こどもの国 フィールドゲーム＜秋バージョン＞',
    lede: '園内をめぐるウォークラリー。公式が「のんびりあるこうコースはベビーカーなどでも回りやすい」と明記しているので、歩き始めの子を連れた回遊に向きます。',
    category: 'sport',
    startDate: '2026-09-05', endDate: '2026-11-29',
    venue: 'こどもの国', area: 'kanagawa', city: '横浜市青葉区',
    ageLabel: '2歳〜小学生', price: '参加費1枚100円＋入園料',
    officialUrl: 'https://www.kodomonokuni.org/event_topics/detail.html?id=61',
    tags: ['公園', 'ウォークラリー', 'ベビーカーOK', '屋外'],
    note: '公式に「販売期間：9月5日(土)～11月29日(日)」「受付時間：開園～14時（ゴールは16時まで）」と明記（2026-09-07確認）。受付は正面入口案内所、ゴール時に景品あり。10月14日(木)〜11月1日(月)は樹木伐採で外周道路が一部通行止めになり、一部ポイントが使えません。',
    recurring: 'annual',
  },
  {
    slug: 'yokohama-anpanman-halloween-2026',
    title: '横浜アンパンマンこどもミュージアム ハロウィーンシールラリー',
    lede: 'こどもチケットで入館した子が対象のシールラリー。おばけのポーズでスタッフを驚かせてミニシールを5枚集める遊びで、1〜3歳でも成立するハロウィン企画です。',
    category: 'seasonal',
    startDate: '2026-09-14', endDate: '2026-10-31',
    venue: '横浜アンパンマンこどもミュージアム', area: 'kanagawa', city: '横浜市西区',
    ageLabel: '1〜6歳', price: 'シールラリーは追加料金なし（2・3Fミュージアム入館料 1歳以上2,200円〜2,800円）',
    officialUrl: 'https://www.yokohama-anpanman.jp/news/article/92wo6bhzkvmxwvxp.html',
    tags: ['ハロウィン', '屋内', '雨でもOK', 'アンパンマン'],
    note: '公式に「配布期間：2026年9月14日（月）～10月31日（土）」「配布場所：2F ミュージアム入口」「引換場所：3F インフォメーション」と明記（2026-09-07確認）。対象はこどもチケットで入館した子で、チケット1枚につき台紙1枚、なくなり次第終了。入館は日時指定WEBチケットの事前購入が必要です。2・3Fミュージアムの最終入館は16:00。',
    recurring: 'annual',
  },
  {
    slug: 'zoorasia-fes-2026',
    title: 'よこはま動物園ズーラシア ズーラシアフェス！〜アジアの動物たち〜',
    lede: 'アジアの動物をテーマに雑貨販売やワークショップ、パネル展を10月いっぱい開催。毎週土曜は高校生以下の入園が無料なので、週末の予定に入れやすい企画です。',
    category: 'market',
    startDate: '2026-10-01', endDate: '2026-10-31',
    venue: 'よこはま動物園ズーラシア', area: 'kanagawa', city: '横浜市旭区',
    ageLabel: '0歳〜', price: '入園料 大人800円・中人高校生300円・小中学生200円・小学生未満無料（毎週土曜は高校生以下無料）',
    officialUrl: 'https://www.hama-midorinokyokai.or.jp/zoo/zoorasia/details/2026/post-558906.php',
    tags: ['動物園', 'マルシェ', 'ワークショップ', '屋外'],
    note: '公式に「2026年10月1日(木)～2026年10月31日(土)」と明記（2026-09-07確認）。会場はころころ広場・ころこロッジ。ハンドメイド雑貨の出店、ワークショップ、講演会、パネル展などを実施します。講演会は参加費無料（入園料は別途）。',
    recurring: 'annual',
  },
  {
    slug: 'nogeyama-kanazawa-halloween-2026',
    title: '野毛山動物園・金沢動物園 ハロウィン装飾',
    lede: '横浜市立の2園が同時期にハロウィン装飾。野毛山動物園は入園無料で、2027年1月からのリニューアル休園前に行ける最後の秋になります。',
    category: 'seasonal',
    startDate: '2026-09-29', endDate: '2026-11-01',
    venue: '横浜市立野毛山動物園', area: 'kanagawa', city: '横浜市西区',
    ageLabel: '0歳〜', price: '野毛山動物園は入園無料（金沢動物園は大人500円・小中学生200円・小学生未満無料）',
    officialUrl: 'https://www.hama-midorinokyokai.or.jp/zoo/nogeyama/',
    tags: ['動物園', 'ハロウィン', '無料', '屋外'],
    note: '横浜市緑の協会の記者発表資料（2026年8月20日）に「【野毛山動物園・金沢動物園共通】ハロウィン装飾 9月29日（火）～11月1日（日）」と明記（2026-09-07確認）。開園は両園とも9:30〜16:30（入園は16:00まで）。金沢動物園は10月無休、毎週土曜は高校生以下無料。野毛山動物園は2027年1月7日からリニューアル工事で休園予定と発表されています。',
    recurring: 'annual',
  },
  {
    slug: 'tokyo-german-village-lantern-2026',
    title: '東京ランタンフェスティバル（東京ドイツ村）',
    lede: '例年のウインターイルミネーションに代わる、国内最大級のランタンイベント。10月末から翌4月までと会期が長く、駐車場から会場まで車で入れるので乳児連れの負担が小さい会場です。',
    category: 'illumination',
    startDate: '2026-10-31', endDate: '2027-04-04',
    venue: '東京ドイツ村', area: 'chiba', city: '袖ケ浦市',
    ageLabel: '0歳〜', price: 'イルミネーション期間（10/31〜12/31）は入園 大人1,500円・小人4歳〜小学生800円・駐車1,500円',
    officialUrl: 'https://t-doitsumura.co.jp/event/irodori2026/',
    tags: ['イルミネーション', 'ランタン', '夜', '車で行ける'],
    note: '公式に「開催期間:2026年10月31日(土)～2027年4月4日(日) 点灯時間：日没～20:00」と明記（2026-09-07確認）。約50,000㎡のエリアを使う国内最大級のランタンイベントとして告知されています。ベビールーム（救護室・マルクトプラッツ内）でおむつ交換・授乳ができ、お湯の用意あり（看護師の常駐はなし）。ベビーカーは救護室で無料貸出。公式が「8月25日時点のものになります。今後の製作状況によって変更になる場合がございます」と注記しているので、行く前に最新情報を確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'funabashi-andersen-cosmos-2026',
    title: 'ふなばしアンデルセン公園 コスモスまつり',
    lede: '約10万株のコスモスに加えて、メルヘンの丘ゾーンに広さ約600㎡のコスモスめいろが登場。同じ10月は園内がハロウィン装飾になるので写真の動線がまとめて取れます。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-10-31',
    venue: 'ふなばしアンデルセン公園', area: 'chiba', city: '船橋市',
    ageLabel: '2歳〜小学生', price: '一般900円・高校生600円・小中学生200円・幼児4歳以上100円（3歳以下無料）',
    officialUrl: 'https://www.park-funabashi.or.jp/and/aevents/event_cosmosmaturi.html',
    tags: ['コスモス', '公園', '迷路', '屋外'],
    note: '公式に「日程：10月1日(木) ～10月31日(土)」と明記（2026-09-07確認）。同期間に園内のハロウィン装飾も実施されます。10月第4日曜は船橋市民の無料開放デー。園内はポニー乗馬100円などアクティビティの単価が安く、コスモスめいろは歩ける幼児から楽しめます。',
    recurring: 'annual',
  },
  {
    slug: 'motherfarm-shasei-2026',
    title: 'マザー牧場 第25回 秋のこども写生大会',
    lede: '9月から11月末まで3か月開いている写生大会。参加する小学生は入場無料、同伴者も割引になるので「今週末どこへ行くか」を決めるときの選択肢に残しやすい企画です。',
    category: 'workshop',
    startDate: '2026-09-01', endDate: '2026-11-30',
    venue: 'マザー牧場', area: 'chiba', city: '富津市',
    ageLabel: '小学生', price: '参加料無料（参加する小学生は入場無料・同伴者5名まで割引）',
    officialUrl: 'https://www.motherfarm.co.jp/information/news/detail.php?CN=432094',
    tags: ['牧場', 'お絵かき', '屋外', '長期開催'],
    note: '公式に「2026年9月1日（火）～11月30日（月）※9月20日（日）～22日（火・祝）はお休みします。」と明記（2026-09-07確認）。低学年の部（1〜3年生）と高学年の部（4〜6年生）。申込用紙を家で印刷して入場券売場に提出するのが条件で、入場後の申込は特典の対象外になります。画用紙と画板は現地貸出、油絵の具は不可。作品を提出すると全員にオリジナルグッズがもらえます。',
    recurring: 'annual',
  },
  {
    slug: 'narita-yumebokujo-dream-dungeon-2026',
    title: '成田ゆめ牧場 ドリームダンジョン〜ハロウィンともぐらとゆめこ〜',
    lede: '牧場がダンジョンに変わるミッション形式のウォークラリー。ワークシートを受け取って回る参加型で、参加自体は無料なので短時間だけ遊ぶ使い方もできます。',
    category: 'seasonal',
    startDate: '2026-10-10', endDate: '2026-11-01',
    venue: '成田ゆめ牧場', area: 'chiba', city: '成田市',
    ageLabel: '3歳〜小学生', price: '参加無料（入場料・駐車場代別途、有料ミッションあり）',
    officialUrl: 'https://www.yumebokujo.com/?p=59951',
    tags: ['牧場', 'ハロウィン', 'ウォークラリー', '屋外'],
    note: '公式に「2026年10月10日(土) 〜 11月1日(日)」と明記（2026-09-07確認）。開催時間は公式で「未定」表記なので、行く前に確認してください。同じ時期にさつまいも掘り（2株1,000円）や落花生掘りなどの味覚狩りも動いていますが、こちらは公式が「頃」「予定」表記のため日程が動きます。',
    recurring: 'annual',
  },
  {
    slug: 'chiba-zoo-festa-2026',
    title: '千葉市動物公園 ちばZOOフェスタ・2026',
    lede: '11月7日・8日はステージパフォーマンスやアート作品の展示販売がある家族向けの2日間。9時30分から16時30分までの日中開催なので、昼寝の時間を挟んでも組み立てやすい構成です。',
    category: 'market',
    startDate: '2026-11-07', endDate: '2026-11-08',
    venue: '千葉市動物公園', area: 'chiba', city: '千葉市若葉区',
    ageLabel: '0歳〜', price: '入園料は公式サイトをご確認ください',
    officialUrl: 'https://www.city.chiba.jp/zoo/event/2026chiazoofesta.html',
    tags: ['動物園', 'フェス', '屋外', '週末'],
    note: '千葉市公式に「11月7日(土)・8日(日) ～フェスティバル Day(仮称)～」「9時30分～16時30分（入園は16時まで）」と明記（2026-09-07確認）。11月3日(火祝)には別枠で「アカデミア・アニマリウム Day(仮称)」として講演会・研究発表が組まれています（こちらは大人向け）。公式表記が「(仮称)」のままなので、内容は今後更新される見込みです。',
    recurring: 'annual',
  },
  {
    slug: 'hitachi-kochia-lightup-2026',
    title: '国営ひたち海浜公園 コキアライトアップ2026',
    lede: 'みはらしの丘のコキアを17時30分から夜間ライトアップ。夜間開園は西口ゲートからみはらしの丘までに区切られていて動線が短く、小さい子でも回りきれます。',
    category: 'illumination',
    startDate: '2026-09-18', endDate: '2026-09-27',
    venue: '国営ひたち海浜公園 みはらしの丘', area: 'ibaraki', city: 'ひたちなか市',
    ageLabel: '0歳〜', price: '入園料（大人450円・中学生以下無料）＋観覧料（大人1,000円・小中学生500円・幼児以下無料）',
    officialUrl: 'https://www.hitachikaihin.jp/event/kochialightup/kochialightup2026.html',
    tags: ['コキア', 'ライトアップ', '夜', '公園'],
    note: '公式に「開催期間は、2026年9月18日金曜日から27日日曜日までです。時間は17時から21時30分まで。点灯時間は17時30分から21時15分までです。」と明記（2026-09-07確認）。最終入園は20時30分、西駐車場への入庫は20時20分まで。9月26日(土)・27日(日)は全員入園料無料（観覧料は必要）。荒天中止で払い戻しなしと公式に明記されています。',
    recurring: 'annual',
  },
  {
    slug: 'hitachi-umihana-sotoasobi-2026',
    title: '国営ひたち海浜公園 海・花 そとあそび 2026',
    lede: '大草原とバーベキュー広場を使って、食と体験をテーマにしたアクティビティやワークショップを開く11月の2日間。広いオープンスペースなので走り回れる年齢に向きます。',
    category: 'market',
    startDate: '2026-11-07', endDate: '2026-11-08',
    venue: '国営ひたち海浜公園 大草原・バーベキュー広場', area: 'ibaraki', city: 'ひたちなか市',
    ageLabel: '0歳〜', price: '入園料 大人450円・中学生以下無料（イベント料金は公式をご確認ください）',
    officialUrl: 'https://www.hitachikaihin.jp/event/recommend-event/kaihanasotoasobi-2026.html',
    tags: ['公園', '体験', '屋外', '週末'],
    note: '公式に「日時 11月7日（土曜日）・11月8日（日曜日）10時00分から15時30分 ※雨天中止」と明記（2026-09-07確認）。公式が「子どもから大人まで」と対象を書いています。雨天中止の2日間限定なので、前日に開催可否を確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'aquaworld-oarai-halloween-2026',
    title: 'アクアワールド茨城県大洗水族館 ハロウィンアクアワールド2026',
    lede: '10月いっぱい通常入場料だけで楽しめるハロウィン企画。ベビーカー無料貸出と完全個室のベビーケアルーム2か所があり、0〜2歳連れの装備が整っている水族館です。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-10-31',
    venue: 'アクアワールド茨城県大洗水族館', area: 'ibaraki', city: '東茨城郡大洗町',
    ageLabel: '0歳〜', price: '通常入場料のみ（大人2,300円・小中学生1,100円・幼児3歳以上400円・3歳未満無料）',
    officialUrl: 'https://www.aquaworld-oarai.com/2026/08/31/halloweenaqua2026/',
    tags: ['水族館', 'ハロウィン', '屋内', '雨でもOK'],
    note: '公式に「開催期間 2026年10月1日(木)～10月31日(土)」と明記（2026-09-07確認）。10月31日(土)のみ無料のハロウィンクラフト体験（9:30〜11:00／14:00〜15:30、材料がなくなり次第終了）。土曜夜の「NIGHT AQUAWORLD ハロウィンバージョン」は完全入替制の別チケットで、日中からの滞在はできません。公式が「9月〜10月の平日は遠足団体により混雑が予想されます」と案内しています。ベビーカー無料貸出（3階総合案内）、個室ベビーケアルーム2か所あり。',
    recurring: 'annual',
  },
  {
    slug: 'saitama-kodomo-zoo-nightzoo-2026',
    title: '埼玉県こども動物自然公園 ナイトズー2026',
    lede: '9月の土日祝8日間だけ20時30分まで開く夜の動物園。未就学児は入園無料で、開園エリアがコアラ舎やペンギンヒルズなどに絞られるため回る距離が短くて済みます。',
    category: 'show',
    startDate: '2026-09-12', endDate: '2026-09-27',
    venue: '埼玉県こども動物自然公園', area: 'saitama', city: '東松山市',
    ageLabel: '2歳〜小学生', price: '大人900円・小中学生200円・未就学児無料（入園時間による割引なし）',
    officialUrl: 'https://www.parks.or.jp/sczoo/event/009/009070.html',
    tags: ['動物園', '夜', 'イルミネーション', '週末'],
    note: '公式に「2026年9月12日（土曜）～2026年9月13日（日曜）／2026年9月20日（日曜）～2026年9月23日（水曜）／2026年9月26日（土曜）～2026年9月27日（日曜）」「今年は土日祝日の8日間開催いたします。」と明記（2026-09-07確認）。閉園は20時30分、入園は19時30分まで。開園エリアはキリン・ポニー舎・噴水広場周辺、コアラ舎・カピバラ・乳牛コーナー、レッサーパンダ舎周辺、ペンギンヒルズ・どんぐりのもりに限定され、それ以外は16時〜17時に順次閉鎖されます。公式に「託児 なし」と明記。',
    recurring: 'annual',
  },
  {
    slug: 'musashinomura-halloween-2026',
    title: 'むさしの村deハロウィン',
    lede: '未就学児から遊べる小さめの遊園地で開くハロウィン企画。同じ時期にさつまいも掘りや土日祝の縁日広場も動いているので、1日の組み立てがしやすい会場です。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-11-03',
    venue: '緑の中のファミリーランド むさしの村', area: 'saitama', city: '加須市',
    ageLabel: '2歳〜小学生', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.musashinomura.co.jp/news/2026autumnevent/',
    tags: ['遊園地', 'ハロウィン', '屋外', '芋掘り'],
    note: '公式のお知らせに「むさしの村deハロウィン(10/1(木)～11/3(火祝))」と明記（2026-09-07確認）。同じお知らせに、さつまいも掘り（9/19(土)〜）、縁日広場（9/19(土)〜11/21(日)の土日祝）、はたらく車大集合！（10/24(土)・25(日)）、わくわくファーム大収穫祭イベント（11/14(土)・15(日)）も掲載されています。',
    recurring: 'annual',
  },
  {
    slug: 'tobuzoo-musashinomura-rally-2026',
    title: '東武動物公園×むさしの村 コラボスタンプラリー',
    lede: '埼玉の2園をまたぐスタンプラリーで、10月から翌3月末までと会期がとても長い企画。参加は3歳からで、コラボカードは両園あわせて1万枚限定です。',
    category: 'other',
    startDate: '2026-10-01', endDate: '2027-03-31',
    venue: '東武動物公園／むさしの村', area: 'saitama', city: '南埼玉郡宮代町',
    ageLabel: '3歳〜小学生', price: '各園の入園料と各アトラクションの利用料金が必要',
    officialUrl: 'https://www.tobuzoo.com/newsrelease/',
    tags: ['動物園', 'スタンプラリー', '長期開催'],
    note: '東武動物公園の公式ニュースリリース（2026年9月1日付）に「開催期間：2026年10月1日（木）～2027年3月31日（水）」「【参加条件】3歳以上の方からご参加いただけます。スマートフォンアプリ「furari」のダウンロード、使用が必須となります。」と明記（2026-09-07確認）。対象アトラクションは東武動物公園のエマさんのチーズ風車とカード迷路ぐるり森大冒険。景品は両園あわせて10,000枚限定で、期間中でもなくなり次第終了、参加はひとり1回のみです。',
  },
  {
    slug: 'nakagawa-suiyuen-tengu-2026',
    title: '栃木県なかがわ水遊園 秋の特別展示「テングが海からやってきた！」',
    lede: 'テングカワハギを館内特設水槽で見せる短期の特別展示。小学生未満は観覧料が無料で、ベビーカーの無料レンタルと全館バリアフリーなので0〜2歳連れでも回れます。',
    category: 'other',
    startDate: '2026-09-17', endDate: '2026-10-04',
    venue: '栃木県なかがわ水遊園（おもしろ魚館）', area: 'tochigi', city: '大田原市',
    ageLabel: '0歳〜', price: '観覧料のみ（大人900円・小中学生300円・小学生未満無料）',
    officialUrl: 'https://tnap.jp/topics/detail.php?id=3882',
    tags: ['水族館', '特別展', '屋内', '雨でもOK'],
    note: '公式に「◆展示期間 9/17(木)～10/4(日) ◆展示場所 館内特設水槽 ◆展示生物 ◇テングカワハギ」と明記（2026-09-07確認）。公式の案内では車いす・ベビーカー・シルバーカーの無料レンタルあり（インフォメーション・予約不可・台数限定）、全館バリアフリー、館内2か所・園内5か所に多目的トイレ、授乳室あり。休園日は毎週月曜（祝日の場合は翌日）と毎月第4木曜。毎月第3日曜は小中学生無料です。',
  },
  {
    slug: 'gunma-shizenshi-dinosaur-2026',
    title: '群馬県立自然史博物館 企画展「北米ジュラ紀の恐竜たち」（後期）',
    lede: '開館30周年記念の恐竜企画展の後期。9月19日から12月上旬までと会期が長く、中学生以下は無料。ベビーカー貸出と授乳室があり、雨の日の逃げ場としても使えます。',
    category: 'other',
    startDate: '2026-09-19', endDate: '2026-12-06',
    venue: '群馬県立自然史博物館', area: 'gunma', city: '富岡市',
    ageLabel: '2歳〜小学生', price: '一般1,300円・大学高専高校生600円・中学生以下無料',
    officialUrl: 'https://www.gmnh.pref.gunma.jp/event/id11471/',
    tags: ['博物館', '恐竜', '屋内', '雨でもOK'],
    note: '公式に「2026年7月18日(土)～9月13日(日)、9月19日(土)～12月6日(日)」「※9/15(火)～9/18(金)は展示入替のため観覧できません」と明記（2026-09-07確認）。前期は終了済みで、後期は9月19日からです。開館は9:30〜17:00（最終入館16:30）、休館日は毎週月曜（祝日の場合は翌日）と年末年始。公式に「ベビーケアルーム・おむつ台を備えています」「車いす、ベビーカー貸出を行っております（台数には限りがあります）」と記載があります。',
  },
  {
    slug: 'tonami-yumenotaira-cosmos-2026',
    title: 'となみ夢の平コスモスウォッチング',
    lede: 'スキー場の斜面を5品種100万本のコスモスが埋める10日間。未就学児は入場無料で、コスモスでできた大迷路と山頂のカフェが子連れの目的になります。',
    category: 'seasonal',
    startDate: '2026-10-09', endDate: '2026-10-18',
    venue: 'となみ夢の平スキー場', area: 'toyama', city: '砺波市',
    ageLabel: '2歳〜小学生', price: '大人（高校生以上）500円・小中学生100円（未就学児無料）',
    officialUrl: 'https://www.city.tonami.lg.jp/kanko/event/564p/',
    tags: ['コスモス', '迷路', '屋外', '秋'],
    note: '砺波市公式に「2026年10月09日（金曜日）〜 2026年10月18日（日曜日）」「09時00分〜17時00分」「最終入場は16時30分まで」と明記（2026-09-07確認）。リフトは土日祝のみ9:00〜16:00の運行で往復 大人600円・子ども300円。会場はスキー場のため傾斜があります。',
    recurring: 'annual',
  },
  {
    slug: 'fukui-dinosaur-sauropod-2026',
    title: '福井県立恐竜博物館 特別展「竜脚類 〜大地を揺るがした地上最大の生き物〜」',
    lede: '恐竜博物館の令和8年度特別展。未就学児は無料で、ベビーカー貸出・授乳室・おむつ替え台・救護室がそろっているので、はじめての遠出の目的地にしやすい館です。',
    category: 'other',
    startDate: '2026-07-10', endDate: '2026-11-03',
    venue: '福井県立恐竜博物館', area: 'fukui', city: '勝山市',
    ageLabel: '0歳〜小学生', price: '特別展＋常設展 一般1,800円・高大生1,600円・小中学生1,000円・未就学児無料',
    officialUrl: 'https://www.dinosaur.pref.fukui.jp/special/sauropod2026/',
    tags: ['博物館', '恐竜', '屋内', '雨でもOK'],
    note: '公式に「2026年7月10日（金）〜11月3日（火・祝）」と明記（2026-09-07確認）。観覧券は日時指定の事前購入が原則で、販売数に余裕があるときのみ当日券が館内の券売機で出ます。会期中の休館日は9月9日(水)・9月24日(木)・10月14日(水)・10月28日(水)。公式のバリアフリー案内に、ベビーカーの貸出（3階総合受付・台数限定）、授乳室と調乳用のお湯、多目的トイレのおむつ替え台、3階救護室の記載があります。なお「化石研究体験」は未就学児は入室できません。',
  },
  {
    slug: 'yokokan-teien-autumn-lightup-2026',
    title: '名勝 養浩館庭園 秋のライトアップ',
    lede: '福井市の大名庭園を11月の金土日祝だけ夜間公開。中学生以下は入園無料で、20時30分終了と夜イベントの中では早めなので幼児連れでも組み込みやすい会です。',
    category: 'illumination',
    startDate: '2026-11-01', endDate: '2026-11-29',
    venue: '名勝 養浩館庭園', area: 'fukui', city: '福井市',
    ageLabel: '2歳〜', price: '220円（中学生以下・70歳以上は無料）',
    officialUrl: 'https://www.city.fukui.lg.jp/kankou/kankou/sisetu/p026228.html',
    tags: ['ライトアップ', '庭園', '夜', '紅葉'],
    note: '福井市公式に「令和8年11月1日日曜日～11月29日日曜日の金・土・日曜日、祝日 17時00分～20時30分（入園は20時までです。）」と明記（2026-09-07確認）。金・土・日・祝のみの開催です。福井市観光サイト側の同じイベントページは令和7年（2025年）の日程のままなので、日程は福井市役所サイトを見てください。',
    recurring: 'annual',
  },
  {
    slug: 'suzaka-zoo-aki-matsuri-2026',
    title: '須坂市動物園 秋の動物園まつり',
    lede: '臥竜公園のなかにあるコンパクトな動物園の秋のまつり。未就学児は入園無料、大人も400円と負担が軽く、園が小さいぶん歩き疲れずに一周できます。',
    category: 'seasonal',
    startDate: '2026-10-31', endDate: '2026-11-01',
    venue: '須坂市動物園', area: 'nagano', city: '須坂市',
    ageLabel: '0歳〜', price: '一般400円・小中学生100円・未就学児無料',
    officialUrl: 'https://www.city.suzaka.nagano.jp/suzaka_zoo/info/699.html',
    tags: ['動物園', 'まつり', '屋外', '週末'],
    note: '須坂市公式の年間スケジュール（2026年度）に「秋の動物園まつり 10月31日（土曜日）、11月1日（日曜日）」と明記（2026-09-07確認）。開園は9:00〜16:45（券売は16:00まで）、休園日は月曜（祝日の場合は翌日）。同じスケジュールに「カピバラ温泉 11月1日（日曜日）～2月28日（日曜日）」「秋の企画展 9月1日（火曜日）から」も掲載されています。',
    recurring: 'annual',
  },
  {
    slug: 'rokko-meets-art-2026',
    title: '神戸六甲ミーツ・アート2026 beyond',
    lede: '六甲山上の10か所を使う屋外アート展。パスポートは会場ごとに1回ずつ入れて日を分けて使えるので、子どものペースに合わせて何回かに割って回れます。',
    category: 'other',
    startDate: '2026-08-29', endDate: '2026-11-29',
    venue: '六甲山上（ROKKO森の音ミュージアム・六甲高山植物園ほか）', area: 'hyogo', city: '神戸市灘区',
    ageLabel: '4歳〜小学生', price: '昼パス 大人3,300円・小人1,300円ほか（大人＝中学生以上、小人＝4歳〜小学生、3歳以下無料）',
    officialUrl: 'https://rokkomeetsart.jp/about/',
    tags: ['アート', '屋外', '山', '長期開催'],
    note: '公式に「2026年8月29日（土）〜11月29日（日）」「会期中無休。ただし六甲山サイレンスリゾートは毎週月曜休業」と明記（2026-09-07確認）。夜間企画「ひかりの森〜夜の芸術散歩〜」は2026年9月19日(土)〜11月29日(日)の土日祝限定17:00〜20:00。パスポートは会場ごとに入場処理をするため複数日に分けて使えます。公式FAQに「六甲山上は坂道や階段が多く、会場や場所によって困難な場合があります」との記載があるので、ベビーカーより抱っこ紐向きです。',
    recurring: 'annual',
  },
  {
    slug: 'port-island-science-festival-2026',
    title: '第8回ポートアイランドサイエンスフェスティバル',
    lede: '大学や企業など約20団体の科学体験ブースが集まる2日間で、入場は無料。屋内開催の10時から17時なので、天気に左右されずに予定を立てられます。',
    category: 'workshop',
    startDate: '2026-10-31', endDate: '2026-11-01',
    venue: 'バンドー神戸青少年科学館 北館4階 特別展示室ほか', area: 'hyogo', city: '神戸市中央区',
    ageLabel: '3歳〜小学生', price: '無料（ドームシアター・プラネタリウムは有料）',
    officialUrl: 'https://www.kobe-kagakukan.jp/topics/archives/522',
    tags: ['科学館', '体験', '無料', '屋内'],
    note: '公式トピックス（2026年9月4日掲載）に「10月31日(土)・11月1日(日)」「10:00～17:00」「無料　※ドームシアター(プラネタリウム)は有料です」と明記（2026-09-07確認）。大学・企業・公的機関 約20団体の科学体験ブースが出ます。',
    recurring: 'annual',
  },
  {
    slug: 'adventure-world-pingu-2026',
    title: 'PINGU meets アドベンチャーワールド 〜10種類のペンギンに会える！〜',
    lede: 'センタードームが氷の世界の装飾になり、ピングーのグリーティングやオウサマペンギンパレードが楽しめる期間企画。10月から翌2月末までと長く開いています。',
    category: 'show',
    startDate: '2026-10-01', endDate: '2027-02-28',
    venue: 'アドベンチャーワールド センタードームほか', area: 'wakayama', city: '西牟婁郡白浜町',
    ageLabel: '1〜6歳', price: '1日入園券 大人5,300円・中高生4,300円・幼児小学生4〜11歳3,300円',
    officialUrl: 'https://www.aws-s.com/topics/detail?id=top4717',
    tags: ['動物園', 'ペンギン', 'キャラクター', '長期開催'],
    note: '公式トピックス（2026年8月21日掲載）に「２０２６年１０月１日（木）～２０２７年２月２８日（日）」と明記（2026-09-07確認）。会場はセンタードームほか。巨大ピングーバルーンでの記念撮影、ピングーのグリーティング、期間中のオウサマペンギンパレード、限定コラボメニューがあります。12月以降はクリスマス装飾に切り替わると公式が案内しています。',
  },
  {
    slug: 'festa-luce-wakayama-2026',
    title: 'フェスタ・ルーチェ in 和歌山マリーナシティ 2026-2027',
    lede: 'ポルトヨーロッパを舞台にした冬のイルミネーション。2歳以下は無料、17時開場で最終入場20時30分と、夜のイベントの中では子連れが動きやすい時間帯です。',
    category: 'illumination',
    startDate: '2026-10-31', endDate: '2027-02-14',
    venue: '和歌山マリーナシティ ポルトヨーロッパ', area: 'wakayama', city: '和歌山市',
    ageLabel: '0歳〜', price: '大人（高校生以上）当日1,800円・小人（3歳以上）当日1,000円（2歳以下無料）',
    officialUrl: 'https://festaluce.jp/wakayama/',
    tags: ['イルミネーション', '夜', '冬', '長期開催'],
    note: '公式に「2026年10月31日(土)〜2027年2月14日(日)」「17:00～21:00(最終入場20:30)」と明記（2026-09-07確認）。公式FAQに授乳室の記載があり、場所は「遊園地エリア『黒沢牧場の飲食店』の正面左側のトイレ」です。ベビーカー貸出と雨天時の対応はFAQに記載がないので、事前に確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'shikoku-aquarium-tasokare-2026',
    title: '四国水族館 秋の延長営業「誰そ彼時（たそかれどき）」',
    lede: '通常18時閉館のところ、日の入り10分後まで開館時間が延びる秋の企画。最終入館17時30分なので、昼寝が明けてからでも間に合う数少ない夕方の水族館です。',
    category: 'show',
    startDate: '2026-08-31', endDate: '2026-09-30',
    venue: '四国水族館', area: 'kagawa', city: '綾歌郡宇多津町',
    ageLabel: '0歳〜', price: '通常入館料（延長営業に伴う追加料金の記載はなし）',
    officialUrl: 'https://shikoku-aquarium.jp/news/archive/1519/',
    tags: ['水族館', '夕方', '屋内', '秋'],
    note: '公式ニュースに「期間：2026年8月31日（月）～9月30日（水）」「9：00〜日没10分後まで（最終入館は17：30）」と明記（2026-09-07確認）。公式に「イルカサンセットプログラムの実施はなし」との注記があります。',
    recurring: 'annual',
  },
  {
    slug: 'hiroshima-castle-otsukimi-night-2026',
    title: 'お月見ナイト in 広島城',
    lede: '広島城の二の丸で開く入場無料の夜イベント。17時から20時までと夜行事の中では早く終わり、投扇興やスタンプラリーなど体験が多いので未就学児でも間が持ちます。',
    category: 'seasonal',
    startDate: '2026-09-25', endDate: '2026-09-26',
    venue: '広島城 二の丸・二の丸復元建物', area: 'hiroshima', city: '広島市中区',
    ageLabel: '3歳〜小学生', price: '無料',
    officialUrl: 'https://hiroshimacastle.jp/2910',
    tags: ['お月見', '夜', '無料', '体験'],
    note: '公式に「２０２６年９月２５日（金）・２６日（土）」「両日とも １７：００～２０：００（１９：３０入館受付終了）」「無料」と明記（2026-09-07確認）。投扇興遊び、スタンプラリー、衣装体験、天体望遠鏡での月の観察（25日のみ）、飲食ブースがあります。',
    recurring: 'annual',
  },
  {
    slug: 'matsue-suitouro-2026',
    title: '松江水燈路2026',
    lede: '国宝松江城の周りを行灯が照らす、土日祝だけの夜のライトアップ。18時から21時までなので、夕食の前後に1時間だけ切り取る回り方が現実的です。',
    category: 'illumination',
    startDate: '2026-09-26', endDate: '2026-10-18',
    venue: '国宝松江城周辺', area: 'shimane', city: '松江市',
    ageLabel: '2歳〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.suitouro.jp/',
    tags: ['ライトアップ', '夜', '城', '週末'],
    note: '公式に「2026年9月26日(土)～10月18日(日)の土・日・祝日に開催(9/26, 27, 10/3, 4, 10, 11, 12, 17, 18の9日間)」「18時から21時まで」と明記（2026-09-07確認）。土日祝限定の9日間です。城周辺の暗い園路を歩いて回るので、ベビーカーより抱っこ紐が向きます。',
    recurring: 'annual',
  },
  {
    slug: 'tosa-hojosai-kochi-2026',
    title: '土佐の豊穣祭2026 高知市会場',
    lede: '帯屋町の公園で開く入場無料の食フェス。10時開始でカツオのたたきや田舎寿司など取り分けやすい料理が中心、商店街の中なのでトイレの逃げ場も近い会場です。',
    category: 'market',
    startDate: '2026-11-07', endDate: '2026-11-08',
    venue: '東洋電化中央公園', area: 'kochi', city: '高知市',
    ageLabel: '0歳〜', price: '入場無料（事前申込不要）',
    officialUrl: 'https://yosakoi-kochi-bunkasai2026.pref.kochi.lg.jp/event.html?id=169',
    tags: ['グルメ', 'フェス', '無料', '屋外'],
    note: '高知県公式（よさこい高知文化祭2026）に「2026年11月07日(土)〜11月08日(日)」「11月7日（土）10：00～21：00、11月8日（日）10：00～18：00」「入場料：無料（事前申込不要）」と明記（2026-09-07確認）。よさこいや和太鼓・神楽のステージもあります。',
  },
  {
    slug: 'saga-balloon-fiesta-2026',
    title: '2026佐賀インターナショナルバルーンフェスタ',
    lede: '嘉瀬川河川敷を舞台にした熱気球の大会。9時のバルーンファンタジアはキャラクター気球の展示なので、早朝の競技より子連れ向きの枠です。',
    category: 'matsuri',
    startDate: '2026-10-30', endDate: '2026-11-03',
    venue: '嘉瀬川河川敷', area: 'saga', city: '佐賀市',
    ageLabel: '1歳〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.sibf.jp/2026/outline/',
    tags: ['気球', 'まつり', '屋外', '秋'],
    note: '公式の大会概要に「2026年10月30日（金）～11月3日（火・祝）の5日間」と明記（2026-09-07確認）。スケジュールに「バルーンファンタジア（キャラクターバルーン）10月30日（金）～11月3日（火・祝）9:00」「10月31日（土）～11月3日（火・祝）18:00 夜間係留」とあります。7:00の競技フライトは早朝すぎるので、子連れなら9:00枠か15:00枠が現実的です。河川敷なのでベビーカーより抱っこ紐が無難。10月28日・29日の公式練習日は河川敷駐車場とJRバルーンさが駅が利用できません。',
    recurring: 'annual',
  },
  {
    slug: 'fujisaki-hachimangu-reitaisai-2026',
    title: '藤崎八旛宮秋季例大祭',
    lede: '熊本の秋を代表する例大祭。見どころの随兵行列は9月20日の日中で、朝6時の御発輦より、8時半の御旅所到着や午後の還幸に合わせると子連れでも動きやすくなります。',
    category: 'matsuri',
    startDate: '2026-09-13', endDate: '2026-09-21',
    venue: '藤崎八旛宮および御道筋', area: 'kumamoto', city: '熊本市中央区',
    ageLabel: '3歳〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://fujisakigu.or.jp/reitaisai/info/',
    tags: ['まつり', '神社', '屋外', '秋'],
    note: '公式に「9月13日（日）午前9時30分 総代清祓、午前10時 第一日祭」「9月20日（日）神幸式ー随兵行列」「午前6時 本宮 御発輦」「午前8時半 御旅所 御着輦」「午後4時 本宮 御還幸」「9月21日（月・敬老の日）午前零時 宮遷式、午前11時 奉賽祭」と明記（2026-09-07確認）。飾馬と大人数の勢子が至近を通るので、幼児を沿道の前列に立たせるのは避けてください。',
    recurring: 'annual',
  },
  {
    slug: 'kagoshima-ohara-matsuri-2026',
    title: 'おはら祭',
    lede: '鹿児島の市電通り約1,480mを踊り手が埋める秋の祭り。11月3日の本まつりは10時20分から15時25分の日中開催なので、子連れならこちらの日が確実です。',
    category: 'matsuri',
    startDate: '2026-11-02', endDate: '2026-11-03',
    venue: '高見馬場〜いづろ〜桟橋通りの電車通り', area: 'kagoshima', city: '鹿児島市',
    ageLabel: '0歳〜（夜まつりは3歳〜）', price: '沿道観覧は無料',
    officialUrl: 'https://www.kagoshima-yokanavi.jp/event/10001',
    tags: ['まつり', '踊り', '屋外', '秋'],
    note: '鹿児島市公式観光サイトに「2026年11月2日（月）～2026年11月３日（火・祝）」「11月2日（月）【夜まつり】 18：50～20：30」「11月3日（火・祝）【本まつり】10：20～15：25」と明記（2026-09-07確認）。11月2日の夜まつりは20時30分終了で乳幼児には遅めです。会場が市電通り沿いなので、市電での出入りがしやすいのが利点。',
    recurring: 'annual',
  },
  {
    slug: 'naha-otsunahiki-2026',
    title: '第56回那覇大綱挽まつり',
    lede: '3日間ひらかれる那覇の秋の大祭。綱挽本体は人出が非常に多いので、子連れなら奥武山総合運動公園で3日間つづく市民フェスティバルのほうが動きやすい会場です。',
    category: 'matsuri',
    startDate: '2026-10-10', endDate: '2026-10-12',
    venue: '国際通り・国道58号線・奥武山総合運動公園', area: 'okinawa', city: '那覇市',
    ageLabel: '3歳〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.naha-navi.or.jp/magazine/2026/07/49306/',
    tags: ['まつり', '屋外', '秋', '沖縄'],
    note: '那覇市観光協会の公式サイトに「令和8年10月10日(土) ～ 12日(月)」と明記（2026-09-07確認）。10月10日は伝統芸能ナイトパレードと市民オンステージ（パレットくもじ前広場・国際通り）、10月11日は旗頭行列（国際通り）ののち那覇大綱挽（国道58号線）、市民フェスティバル（奥武山総合運動公園）は3日間開催です。綱挽本体は人出が非常に多いため、乳幼児連れには広い公園会場のほうが現実的です。',
    recurring: 'annual',
  },
  // ── 2026-09-14 週次: 発表待ちウォッチから投入 ──────────────────────────
  {
    slug: 'ashikaga-hikari-no-hana-no-niwa-2026',
    title: 'あしかがフラワーパーク 光の花の庭 2026-2027',
    lede: '花の名所として知られる園内を光で彩る、冬の長期イルミネーション。10月中旬から2月中旬まで約4か月つづき、点灯は16時半ごろからなので、夕方に入れば小さな子とも早めに帰れます。',
    category: 'illumination',
    startDate: '2026-10-17', endDate: '2027-02-14',
    venue: 'あしかがフラワーパーク', area: 'tochigi', city: '足利市',
    ageLabel: '0歳〜', price: '大人1,500円・子ども（4歳〜小学生）800円',
    officialUrl: 'https://www.ashikaga.co.jp/fee.html',
    tags: ['イルミネーション', '冬', '夜', '花'],
    note: '公式の入園料ページに「2026年10月17日～2月14日予定 【光の花の庭】」と掲載（2026-09-14確認・会期は「予定」表記）。営業は平日15:30〜20:30、土日祝15:30〜21:00で、点灯は16:30〜17:00頃。11月中旬〜1月上旬は30分延長予定。2月第3水・木と12月31日は休園です。料金は夜の部の表記で、時期により変わる場合があります。',
    recurring: 'annual',
  },
  {
    slug: 'huis-ten-bosch-starlight-million-2026',
    title: 'ハウステンボス ザ・スターライト・ミリオン 2026-2027',
    lede: '長年「光の王国」として続いてきたハウステンボスの冬イルミが、今季は新しい名前で生まれ変わります。11月上旬から2月下旬までの長い会期で、園内に泊まれば子どもの就寝時間を気にせず見られます。',
    category: 'illumination',
    startDate: '2026-11-06', endDate: '2027-02-25',
    venue: 'ハウステンボス', area: 'nagasaki', city: '佐世保市',
    ageLabel: '0歳〜', price: '公式サイトをご確認ください（入場券が必要）',
    officialUrl: 'https://www.huistenbosch.co.jp/event/illumination/',
    tags: ['イルミネーション', '冬', '夜', 'テーマパーク'],
    note: '公式イルミネーションページに「2026. 11/6 Fri.― 2027. 2/25 Thu.」と掲載（2026-09-14確認）。点灯時間と料金はこの時点で未掲載です。同時期に「ヨーロピアン・ホーリー・クリスマス」（2026年11月6日〜12月25日）も開催されます。',
    recurring: 'annual',
  },
  {
    slug: 'musashi-kyuryo-halloween-night-2026',
    title: '国営武蔵丘陵森林公園 森のハロウィンナイト（光と森のStory 第1章）',
    lede: '10月の土日祝だけ、森の公園が夕方からハロウィン仕様の光で彩られます。中学生以下は入園無料で、17時点灯なので日没後すぐに見て帰れるのが小さな子連れにはありがたい点です。',
    category: 'seasonal',
    startDate: '2026-10-11', endDate: '2026-10-31',
    venue: '国営武蔵丘陵森林公園', area: 'saitama', city: '比企郡滑川町',
    ageLabel: '0歳〜', price: '入園料 大人450円・シルバー210円・中学生以下無料',
    officialUrl: 'https://www.shinrinkoen.jp/?p=we-page-event-entry&event=591768&cat=26085&type=event',
    tags: ['ハロウィン', '秋', '夜', 'ライトアップ'],
    note: '公式イベントページに「2026年10月11日(日)～10月31日(土)の土日祝のみ」と掲載（2026-09-14確認）。開催日は10/11・12・17・18・24・25・31の7日間、点灯17:00〜20:30、雨天中止。仮装に関する注意事項があるので事前に公式で確認を。',
  },
  {
    slug: 'musashi-kyuryo-momijimi-night-2026',
    title: '国営武蔵丘陵森林公園 紅葉見ナイト（光と森のStory 第2章）',
    lede: '11月後半の約2週間、紅葉した木々をイルミネーションとライトアップで照らす夜の森歩き。点灯は16時半からで、中学生以下は入園無料。ベビーカーより抱っこ紐のほうが夜道は歩きやすいです。',
    category: 'illumination',
    startDate: '2026-11-14', endDate: '2026-11-29',
    venue: '国営武蔵丘陵森林公園', area: 'saitama', city: '比企郡滑川町',
    ageLabel: '0歳〜', price: '入園料 大人450円・シルバー210円・中学生以下無料',
    officialUrl: 'https://www.shinrinkoen.jp/?p=we-page-event-entry&event=591778&cat=26085&type=event',
    tags: ['紅葉', 'ライトアップ', '秋', '夜'],
    note: '公式イベントページに「2026年11月14日(土)～29日(日)まで」と掲載（2026-09-14確認）。点灯16:30〜20:30、雨天中止。ショーの時間は「準備中」。料金はイベントページに記載がないため、公式の利用料金ページの入園料を記載しています。',
    recurring: 'annual',
  },
  {
    slug: 'kawasui-harimogura-fes-2026',
    title: 'カワスイ 川崎水族館 ハリモグラ フェス',
    lede: '川崎駅前の屋内水族館で、新しく仲間入りしたハリモグラを主役にした秋の企画。トゲのある生きものを集めた展示や幼児向けの無料ワークシートがあり、天気を気にせず行けるのが強みです。',
    category: 'other',
    startDate: '2026-09-11', endDate: '2026-10-31',
    venue: 'カワスイ 川崎水族館', area: 'kanagawa', city: '川崎市川崎区',
    ageLabel: '0歳〜', price: '入館料が必要（公式サイトをご確認ください）',
    officialUrl: 'https://prtimes.jp/main/html/rd/p/000000116.000102762.html',
    tags: ['水族館', '室内', '雨の日OK', '駅近'],
    note: '運営会社MOFFのリリース（2026年9月1日付）に「2026年9月11日（金）～10月31日（土）」と明記（2026-09-14確認）。公式サイトはイベント一覧が表示されない状態だったため、運営会社の発表を出典にしています。ハリモグラの名前投票は9/11〜9/30。館の営業は10:00〜20:00（最終入館19:00）。',
  },
  {
    slug: 'suma-seaworld-night-aqualive-2026',
    title: '神戸須磨シーワールド ナイトアクアライブ＆ドルフィンナイトパフォーマンス',
    lede: 'シルバーウィークの4日間だけ、夜の館内を楽しめる特別企画。イルカの夜のパフォーマンスは18時半からで、15時以降に入れるトワイライトチケットを使えば昼寝のあとに出かけられます。',
    category: 'show',
    startDate: '2026-09-20', endDate: '2026-09-23',
    venue: '須磨シーワールド', area: 'hyogo', city: '神戸市須磨区',
    ageLabel: '0歳〜', price: '企画は無料（入館券が必要）。トワイライトチケット 大人2,500円・小人/幼児1,500円',
    officialUrl: 'https://www.kobesuma-seaworld.jp/guide/event/10225/',
    tags: ['水族館', 'イルカ', '夜', 'シルバーウィーク'],
    note: '公式イベントページに「2026年9月20日（日）～9月23日（水・祝）」と掲載（2026-09-14確認）。ナイトアクアライブは17:00〜閉館、ドルフィンナイトパフォーマンスは18:30〜。ハロウィン・冬の企画はこの時点で未発表です。',
  },
  // ── 2026-09-14 週次: 未カバー県の施設×季節企画 ────────────────────────
  {
    slug: 'misawa-halloween-night-museum-2026',
    title: '三沢航空科学館 ハロウィンナイトミュージアム',
    lede: '航空科学館が1日だけ夜に開く、ハロウィンの特別営業。仮装した子にはお菓子のプレゼントがあり、ライトアップされた展示機や星空観察会、発光実験のサイエンスショーも楽しめます。',
    category: 'seasonal',
    startDate: '2026-10-24', endDate: '2026-10-24',
    venue: '青森県立三沢航空科学館', area: 'aomori', city: '三沢市',
    ageLabel: '0歳〜', price: '入館券が必要（ワークショップは500円〜）',
    officialUrl: 'https://kokukagaku.jp/event/11148/',
    tags: ['ハロウィン', '夜', '室内', '科学館'],
    note: '公式イベントページに「2026ハロウィンナイトミュージアム」10/24(土) 17:00～20:00と掲載（2026-09-14確認）。昼の部（9:00〜16:30）の入館券で夜の部にも入れます。仮装した子へのお菓子は数量限定。ワークショップは「おばけランタン」500円・「ライトセーバー」700円。',
  },
  {
    slug: 'misawa-sora-no-hi-2026',
    title: '三沢空港 空の日まつり（三沢航空科学館）',
    lede: '空の日にあわせて航空科学館でひらかれる2日間の無料イベント。小学生以上はキャビンアテンダントのお仕事体験に参加でき、小さな子はマグロの一本釣りみくじやエネルギーの体験コーナーで遊べます。',
    category: 'other',
    startDate: '2026-09-26', endDate: '2026-09-27',
    venue: '青森県立三沢航空科学館', area: 'aomori', city: '三沢市',
    ageLabel: '0歳〜（CA体験は小学生以上）', price: '無料',
    officialUrl: 'https://kokukagaku.jp/event/11182/',
    tags: ['飛行機', '無料', '室内', '体験'],
    note: '公式イベントページに「令和8年9月26日(土)・27日(日)」と掲載（2026-09-14確認）。なりきりキャビンアテンダント体験は26日14:00〜・27日13:00〜で事前申込制。エネルギーのひろばは27日のみ10:00〜15:00。',
  },
  {
    slug: 'iwayama-hello-festival-2026',
    title: 'IWAYAMA HELLO FESTIVAL in ZOOMO',
    lede: '盛岡の動物公園を会場に、人と動物と自然の共存をテーマにした2日間の野外フェス。ワークショップやマーケット、飲食エリアが並び、動物園の散策とあわせて一日遊べます。',
    category: 'other',
    startDate: '2026-10-17', endDate: '2026-10-18',
    venue: '盛岡市動物公園 ZOOMO', area: 'iwate', city: '盛岡市',
    ageLabel: '0歳〜', price: '大人1,000円・小人500円',
    officialUrl: 'https://iwayama-hello-fes.com/',
    tags: ['動物園', 'フェス', '屋外', '秋'],
    note: '公式サイトに「【2026年】今年も開催！IWAYAMA HELLO FESTIVAL !!【10/17（土）〜18（日）】」と掲載（2026-09-14確認）。時間は公式に未掲載。キャンプ（1組5,000円）・ナイトツアー（5,000円）は別料金。個別の出展内容は前年分と区別しにくいため、公式で最新を確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'morioka-challenge-science-2026',
    title: '盛岡市子ども科学館 チャレンジサイエンス（10月）',
    lede: '10月の日曜3回、科学館で30分ほどの工作と実験に挑戦できる企画。磁石で回るオブジェ、光の万華鏡、光のアクセサリーと毎回テーマが変わり、未就学児も保護者と一緒に参加できます。',
    category: 'workshop',
    startDate: '2026-10-11', endDate: '2026-10-25',
    venue: '盛岡市子ども科学館', area: 'iwate', city: '盛岡市',
    ageLabel: '未就学児（保護者同伴）〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://kodomokagakukan.com/topics/%e3%83%81%e3%83%a3%e3%83%ac%e3%83%b3%e3%82%b8%e3%82%b5%e3%82%a4%e3%82%a8%e3%83%b3%e3%82%b92026/',
    tags: ['科学館', '工作', '室内', '雨の日OK'],
    note: '公式トピックス「チャレンジサイエンス2026」（2026/9/12掲載）に10/11(日)・10/18(日)・10/25(日)と掲載（2026-09-14確認）。各日9:50〜・11:10〜の2回、定員は11日・18日24人、25日15人。当日9:00から整理券配布。開催日は上記3日のみです。',
  },
  {
    slug: 'uminomori-wakey-aquarium-2026',
    title: '仙台うみの杜水族館 THE WAKEY AQUARIUM 海のカラフルパーティー',
    lede: '幼児向け番組「The Wakey Show」と水族館のコラボ企画。館内のスタンプを集めると限定ミニノートがもらえ、マイワシの群れの演出もコラボ版で上演されます。未就学児がいちばん楽しめる内容です。',
    category: 'seasonal',
    startDate: '2026-07-17', endDate: '2026-10-18',
    venue: '仙台うみの杜水族館', area: 'miyagi', city: '仙台市宮城野区',
    ageLabel: '0歳〜', price: '入館料が必要（スタンプラリー500円）',
    officialUrl: 'https://www.uminomori.jp/umino/thewakeyaquarium/',
    tags: ['水族館', 'キャラクター', '室内', '雨の日OK'],
    note: '運営会社のリリースに「2026年7月17日（金）～10月18日（日）」、公式ページに「期間：8/31（月）～10/18（日）」と掲載（2026-09-14確認）。9/27はキャラクターが来館（開館前イベントの整理券配布は終了）。',
  },
  {
    slug: 'michinoku-dinosaur-adventure-2026',
    title: 'みちのく公園 ダイナソーアドベンチャーツアー',
    lede: '森の中の約250mの道に、動いて鳴く恐竜ロボット24体と骨格恐竜5体が並ぶ期間限定ツアー。アプリで恐竜図鑑を集めるしかけがあり、恐竜好きの子なら紅葉の季節の公園歩きがぐっと楽しくなります。',
    category: 'seasonal',
    startDate: '2026-07-18', endDate: '2026-11-29',
    venue: '国営みちのく杜の湖畔公園', area: 'miyagi', city: '柴田郡川崎町',
    ageLabel: '0歳〜', price: 'ツアー1,000円（入園料・駐車料金別）',
    officialUrl: 'https://michinoku-park.info/topics/dinosaur_adventure_tour_michinokupark/',
    tags: ['恐竜', '公園', '屋外', '秋'],
    note: '公式トピックスに「2026年7月18日（土）～11月29日（日）」と掲載（2026-09-14確認）。公園の休園日は休み。時間は公式に未掲載です。',
  },
  {
    slug: 'sendai-science-museum-kinoko-2026',
    title: '仙台市科学館 第56回きのこ展',
    lede: '仙台近郊で採れたキノコ約250種類が並ぶ、半世紀以上続く秋の恒例展示。見るだけでなく写真撮影コーナーや鑑定コーナーもあり、無料で入れるので科学館のついでに立ち寄れます。',
    category: 'other',
    startDate: '2026-10-03', endDate: '2026-10-04',
    venue: '仙台市科学館', area: 'miyagi', city: '仙台市青葉区',
    ageLabel: '0歳〜', price: '無料（展示室は有料）',
    officialUrl: 'https://www.kagakukan.sendai-c.ed.jp/event_/5289/',
    tags: ['科学館', '秋', '室内', '無料'],
    note: '公式イベントページに「2026年10月3日(土)・10月4日(日)」と掲載（2026-09-14確認）。9:00〜16:00（4日は15:30まで）。',
    recurring: 'annual',
  },
  {
    slug: 'omoriyama-zoo-silver-week-2026',
    title: '秋田市大森山動物園 シルバーウイークイベント',
    lede: 'シルバーウィークの5日間、日替わりで動物のいつもと違う姿が見られる無料イベント。モルモットの橋渡りやライオンの特別な食事、キリンの体重測定など、小さな子にもわかりやすい内容です。',
    category: 'seasonal',
    startDate: '2026-09-19', endDate: '2026-09-23',
    venue: '秋田市大森山動物園', area: 'akita', city: '秋田市',
    ageLabel: '0歳〜', price: '各イベント無料（入園料が必要）',
    officialUrl: 'https://www.city.akita.lg.jp/zoo/news/1008854/1053105.html',
    tags: ['動物園', 'シルバーウィーク', '屋外'],
    note: '秋田市公式の動物園ページ（更新日 令和8年9月1日）に9月19日〜23日の日替わり企画を掲載（2026-09-14確認）。19日レッサーパンダデー解説（10:30〜）、20日モルモットの橋渡り（14:15〜）、21日チンパンジーの敬老会（13:30〜）、22日ライオンの特別まんまタイム（14:00〜）、23日キリンの体重測定（13:30〜）。',
  },
  {
    slug: 'omoriyama-zoo-autumn-fureai-2026',
    title: '秋田市大森山動物園 秋の動物ふれあいフェスティバル',
    lede: 'ポニーやトナカイ、ラマが園内を行進するどうぶつパレードが目玉の秋の恒例イベント。午後には動物が園内の植物を食べる様子の観察もあり、1日で動物園の見どころをまとめて楽しめます。',
    category: 'seasonal',
    startDate: '2026-10-04', endDate: '2026-10-04',
    venue: '秋田市大森山動物園', area: 'akita', city: '秋田市',
    ageLabel: '0歳〜', price: '入園料が必要',
    officialUrl: 'https://www.city.akita.lg.jp/zoo/news/1008854/1053026.html',
    tags: ['動物園', 'パレード', '屋外', '秋'],
    note: '秋田市公式の動物園ページ（更新日 令和8年9月9日）と令和8年の年間スケジュールに10月4日開催と掲載（2026-09-14確認）。どうぶつパレード・記念撮影会は11:00〜11:40。午後の観察プログラムは各15組先着で13:15から整理券配布。',
    recurring: 'annual',
  },
  {
    slug: 'kamo-aquarium-kurage-saishu-autumn-2026',
    title: '加茂水族館 秋季クラゲ採集・分類体験会',
    lede: 'クラゲ展示で知られる加茂水族館の近くの海で、ネットやひしゃくを使ってクラゲを採り、種類を調べる体験会。対象は小学生以上の家族で、雨の日は館内の代替プログラムに切り替わります。',
    category: 'workshop',
    startDate: '2026-10-18', endDate: '2026-10-18',
    venue: '加茂水族館', area: 'yamagata', city: '鶴岡市',
    ageLabel: '小学生以上（幼児は参加不可）', price: '1人500円（保険代込み・入館料別）',
    officialUrl: 'https://kamo-kurage.jp/topics/jelly_autumn_2026/',
    tags: ['水族館', 'クラゲ', '体験', '要予約'],
    note: '公式トピックスに「２０２６年 １０月 １８日(日) ９：３０～１２：００」と掲載（2026-09-14確認）。先着24名（1組4名まで）、9/18(金)12時からネット決済で受付。小中学生だけの参加は不可。',
  },
  {
    slug: 'yamagata-imonikai-festival-2026',
    title: '日本一の芋煮会フェスティバル',
    lede: '馬見ヶ崎川の河川敷で、山形県産の食材を使った大鍋の芋煮を振る舞う秋の名物行事。毎年、敬老の日の前日にひらかれ、朝8時半から整理券を配るので、午前中のうちに食べて帰れます。',
    category: 'matsuri',
    startDate: '2026-09-20', endDate: '2026-09-20',
    venue: '馬見ヶ崎川河川敷（双月橋付近）', area: 'yamagata', city: '山形市',
    ageLabel: '0歳〜', price: '公式サイトをご確認ください',
    officialUrl: 'https://www.city.yamagata-yamagata.lg.jp/jigyosya/miryoku/kankojoho/1017716.html',
    tags: ['まつり', 'グルメ', '屋外', '秋'],
    note: '山形市公式サイトに「令和8年9月20日（日曜日）」と掲載（2026-09-14確認）。整理券配布は8:30〜、配食は9:20頃〜。河川敷会場のため、ベビーカーより抱っこ紐が動きやすいです。',
    recurring: 'annual',
  },
  {
    slug: 'aquamarine-halloween-2026',
    title: 'アクアマリンふくしま アクアマリンハロウィーン',
    lede: '水族館の生きもの風の衣装で参加する「ギョスプレ」のハロウィン。オリジナルのボディペイントシールや衣装の貸し出しがあり、手作り衣装で来ればキャラクターとの撮影とお菓子のプレゼントがあります。',
    category: 'seasonal',
    startDate: '2026-10-31', endDate: '2026-10-31',
    venue: 'アクアマリンふくしま', area: 'fukushima', city: 'いわき市',
    ageLabel: '0歳〜', price: '無料（入館料が必要）',
    officialUrl: 'https://www.aquamarine.or.jp/events/halloween2026/',
    tags: ['ハロウィン', '水族館', '仮装', '室内'],
    note: '公式イベントページに「2026年10月31日（土）」と掲載（2026-09-14確認）。ボディペイントシールと衣装撮影は13:00〜14:20（なくなり次第終了）、キャラクター「ごんべえ」との撮影会は15:00〜。',
    recurring: 'annual',
  },
  {
    slug: 'aquamarine-sanma-school-festival-2026',
    title: 'アクアマリンふくしま サンマの学校 学園祭',
    lede: '世界でも珍しいサンマ展示を持つ水族館の秋の企画。無料の「ふくしまのお魚タッチ」や試食会があり、小学5年生以上ならバックヤードでサンマのエサやりも体験できます。日程は飛び飛びなので要確認。',
    category: 'seasonal',
    startDate: '2026-09-21', endDate: '2026-10-18',
    venue: 'アクアマリンふくしま', area: 'fukushima', city: 'いわき市',
    ageLabel: '0歳〜（バックヤードツアーは小学5年生以上）', price: '入館料が必要（プログラムにより無料〜500円）',
    officialUrl: 'https://www.aquamarine.or.jp/events/sanma-schoolfestival/',
    tags: ['水族館', '体験', '室内', '秋'],
    note: '公式イベントページに「2026年9月21日（月・祝）～10月18日（日）」と掲載（2026-09-14確認）。バックヤードツアーは9/21・22、お魚タッチは10/10〜12、試食会は10/10・11の12:00〜（先着100名）、サンマ美食道場は10/18。毎日開催ではありません。',
    recurring: 'annual',
  },
  {
    slug: 'fujiq-thomasland-halloween-2026',
    title: '富士急ハイランド トーマスランド HALLOWEEN PARTY！',
    lede: 'トーマスランドが秋のあいだハロウィン仕様になり、ミッションを集めるビンゴで缶バッチがもらえます。10月31日は小学生以下が主役の仮装パレードがあり、トーマスたちとのトリック・オア・トリートも楽しめます。',
    category: 'seasonal',
    startDate: '2026-09-12', endDate: '2026-11-01',
    venue: '富士急ハイランド', area: 'yamanashi', city: '富士吉田市',
    ageLabel: '0歳〜（ビンゴ・パレードは小学生以下）', price: 'ビンゴは無料（入園料等が必要）',
    officialUrl: 'https://www.fujiq.jp/event/thomasland_halloween2026.html',
    tags: ['ハロウィン', 'トーマス', 'テーマパーク', '仮装'],
    note: '公式イベントページに「2026年9月12日(土)～11月1日(日)」と掲載（2026-09-14確認）。ハロウィン版ダンスショーは9/19〜23・10/10〜12・10/31・11/1、仮装パレードは10/31の11:00〜、トリック・オア・トリートは10/31・11/1。',
    recurring: 'annual',
  },
  {
    slug: 'fuefukigawa-budou-fes-2026',
    title: 'ぶどうフェス in 笛吹川フルーツ公園',
    lede: '山梨のぶどうの季節にあわせた、体験中心の5日間。ぶどう狩りやぶどうパフェ作りに加え、入口広場にふわふわ遊具や縁日が並ぶので、果物を食べるだけでなく小さな子が体を動かして遊べます。',
    category: 'market',
    startDate: '2026-09-19', endDate: '2026-09-23',
    venue: '山梨県笛吹川フルーツ公園', area: 'yamanashi', city: '山梨市',
    ageLabel: '0歳〜（ふわふわ遊具は3歳〜小学生）', price: '入園無料・体験は有料（ぶどう収穫1組2,000円など）',
    officialUrl: 'https://fuefukigawafp.co.jp/event/%e3%81%b6%e3%81%a9%e3%81%86%e3%83%95%e3%82%a7%e3%82%b9in%e7%ac%9b%e5%90%b9%e5%b7%9d%e3%83%95%e3%83%ab%e3%83%bc%e3%83%84%e5%85%ac%e5%9c%922026/',
    tags: ['ぶどう', '味覚狩り', '屋外', '秋'],
    note: '公式イベントページ「ぶどうフェスin笛吹川フルーツ公園2026」に「9月19日（土）～23日（水・祝）」と掲載（2026-09-14確認）。10:00〜16:00。ぶどうパフェ作り1組1,000円、ふわふわ遊具15分500円、魚のつかみ取り1組2,500円。',
    recurring: 'annual',
  },
  {
    slug: 'oasispark-autumn-festival-2026',
    title: '河川環境楽園 オアシスパーク 秋の楽園祭',
    lede: '9月中旬から11月初めまで、園内がハロウィン仕様のフォトスポットになる秋の企画。10月には幼児向けのハロウィンちびっこレースやスタンプラリーがあり、週末ごとに違う催しが入ります。',
    category: 'seasonal',
    startDate: '2026-09-19', endDate: '2026-11-03',
    venue: '河川環境楽園 オアシスパーク', area: 'gifu', city: '各務原市',
    ageLabel: '0歳〜', price: '入園無料・企画により一部有料',
    officialUrl: 'https://www.oasispark.co.jp/event/2026/09/12351/',
    tags: ['ハロウィン', '公園', '屋外', '秋'],
    note: '公式イベントページ「秋の楽園祭2026」に「2026.9/19(土)～11/3(火)」と掲載（2026-09-14確認）。親子ハッピーデー＆ハロウィンちびっこレースは10/17・18、ハロウィンスタンプラリーは10/24・25・31、11/1（先着800名/日）。企画ごとに日程が異なります。',
    recurring: 'annual',
  },
  {
    slug: 'aquatotto-sugoizo-ikimono-power-2026',
    title: 'アクア・トトぎふ 企画展「すごいぞ！生きもののパワー」',
    lede: 'かむ力やスピード、視力など、生きものの「超」能力を約15種で紹介する淡水魚水族館の企画展。ワニガメやピラニア、ビーバーが登場し、12月まで続くので秋のおでかけ先として使いやすい室内展示です。',
    category: 'other',
    startDate: '2026-07-18', endDate: '2026-12-13',
    venue: '世界淡水魚園水族館 アクア・トトぎふ', area: 'gifu', city: '各務原市',
    ageLabel: '0歳〜', price: '入館料のみ',
    officialUrl: 'https://aquatotto.com/info_list/info_list-39276/',
    tags: ['水族館', '企画展', '室内', '雨の日OK'],
    note: '公式お知らせに「2026年7月18日（土）～12月13日（日）」と掲載（2026-09-14確認）。連動ワークショップ「いきものかばんをつくろう！」は9/27までの土日祝10:00〜16:00・1,000円（入館料別）。',
  },
  {
    slug: 'legoland-halloween-party-2026',
    title: 'レゴランドでハロウィンパーティー',
    lede: 'デュプロブロック約6.2万個でつくる巨大パンプキンなど、フォトスポットが増えるレゴランドの秋。お菓子をもらえるキャンディ・ハントや未就学児向けステージがあり、仮装した小さな子が主役になれます。',
    category: 'seasonal',
    startDate: '2026-10-02', endDate: '2026-11-03',
    venue: 'レゴランド・ジャパン', area: 'aichi', city: '名古屋市港区',
    ageLabel: '0歳〜', price: '入場チケットが必要（公式サイトをご確認ください）',
    officialUrl: 'https://www.legoland.jp/operation/seasonal-events/halloween/2026/',
    tags: ['ハロウィン', 'テーマパーク', '仮装', '秋'],
    note: '公式ページ「レゴランドでハロウィンパーティー2026」に開催期間「10月2日(金)～11月3日(火・祝)」と掲載（2026-09-14確認・曜日は2026年と一致）。キャンディ・ハントは前半10/2〜10/17、後半10/18〜11/3。',
    recurring: 'annual',
  },
  {
    slug: 'nagoya-aquarium-kingyo-2026',
    title: '名古屋港水族館 特別展「KINGYO〜四季が彩る日本の金魚文化〜」',
    lede: '桜とひな人形、花火など日本の四季の背景の前で金魚を眺める特別展。約15品種が並び、リュウキンなど形の違いを見比べられます。南館2階のエントランス展示なので、館内観覧の最初に立ち寄れます。',
    category: 'other',
    startDate: '2026-09-18', endDate: '2026-11-08',
    venue: '名古屋港水族館', area: 'aichi', city: '名古屋市港区',
    ageLabel: '0歳〜', price: '入館料が必要',
    officialUrl: 'https://nagoyaaqua.jp/news/event/31048/',
    tags: ['水族館', '金魚', '室内', '雨の日OK'],
    note: '公式イベントページに「令和8年9月18日（金）～11月8日（日）」と掲載（2026-09-14確認）。会場は南館2階エントランスホール。',
  },
  {
    slug: 'blumen-ayu-tsukamidori-2026',
    title: 'ブルーメの丘 鮎のつかみどり＆塩焼き体験',
    lede: '流れのゆるやかな人工の小川で鮎を手づかみし、その場で串焼きにしてもらえる秋の体験。小さな子も参加でき、30分ごとの予約制なので待ち時間が読みやすいのが子連れには助かります。',
    category: 'workshop',
    startDate: '2026-09-26', endDate: '2026-10-12',
    venue: 'ブルーメの丘', area: 'shiga', city: '蒲生郡日野町',
    ageLabel: '0歳〜（保護者同伴）', price: '3匹1,500円・5匹2,000円（入園料別）',
    officialUrl: 'https://sites.google.com/view/ayu-tsukamidori2026/%E3%83%9B%E3%83%BC%E3%83%A0',
    tags: ['体験', '屋外', '要予約', '秋'],
    note: 'ブルーメの丘公式サイトからリンクされた特設ページに「2026年9月26日(土)・27日(日)、10月3日(土)・4日(日)、10日(土)・11日(日)・12日(月・祝)」と掲載（2026-09-14確認）。開催は上記7日のみ。各回11:00・13:00・14:00・15:00、事前予約制。鮎の持ち帰りは不可。',
  },
  {
    slug: 'biwahaku-time-machine-exhibition-2026',
    title: '琵琶湖博物館 企画展示「博物館はタイムマシン－魚類学者がみた琵琶湖－」',
    lede: '江戸時代から現在までの標本をもとに、琵琶湖の魚たちがどう移り変わってきたかをたどる企画展示。淡水の水族展示とあわせて見られ、小中学生の観覧料は170円と気軽に入れます。',
    category: 'other',
    startDate: '2026-07-18', endDate: '2026-11-23',
    venue: '琵琶湖博物館', area: 'shiga', city: '草津市',
    ageLabel: '小学生〜', price: '大人340円・大学生270円・小中高生170円',
    officialUrl: 'https://www.biwahaku.jp/event/2026/06/_34_--.html',
    tags: ['博物館', '企画展', '室内', '雨の日OK'],
    note: '公式イベントページに「2026年07月18日（土）～2026年11月23日（月）」と掲載（2026-09-14確認）。9:30〜17:00（入館16:00まで）。料金は企画展示の観覧料で、常設展示は別料金です。',
  },
  {
    slug: 'heijo-takuhon-kariuchi-tousu-2026-10',
    title: '平城宮跡 拓本づくり・かりうち遊び・刀子づくり',
    lede: '奈良時代の瓦で拓本をとったり、古代のボードゲーム「かりうち」で遊んだりできる当日受付の体験会。かりうちは無料で小さな子から遊べ、広い平城宮跡の散策と組み合わせやすい内容です。',
    category: 'workshop',
    startDate: '2026-10-17', endDate: '2026-10-18',
    venue: '平城宮跡歴史公園 朱雀門ひろば（平城宮いざない館）', area: 'nara', city: '奈良市',
    ageLabel: '0歳〜', price: 'かりうち遊び無料・拓本づくり300円・刀子づくり600円',
    officialUrl: 'https://www.heijo-park.jp/event/takuhon-kariuchi-tousu-26101718/',
    tags: ['体験', '歴史', '室内', '無料あり'],
    note: '公式イベントページに「2026年10月17日（土）、18日（日）」と掲載（2026-09-14確認）。10:00〜15:30（12:00〜13:00休憩）、当日受付。',
  },
  {
    slug: 'uda-animal-park-animarche-2026-10',
    title: 'うだ・アニマルパーク アニマルシェ',
    lede: '動物とふれあえる奈良の県営施設でひらかれるマルシェ。奈良県東部のグルメや特産品、雑貨の販売とワークショップが並び、動物見学とあわせて週末のおでかけにちょうどいい規模です。',
    category: 'market',
    startDate: '2026-10-17', endDate: '2026-10-18',
    venue: 'うだ・アニマルパーク', area: 'nara', city: '宇陀市',
    ageLabel: '0歳〜', price: '入園無料（購入・体験は有料）',
    officialUrl: 'https://www.pref.nara.lg.jp/n009/20847.html',
    tags: ['マルシェ', '動物', '屋外', '秋'],
    note: '奈良県公式の月例イベントページ（更新日 2026年8月25日）の「2026年10月開催イベント」に「10月17日（土曜日）～10月18日（日曜日）10時00分～」と掲載（2026-09-14確認）。',
  },
  {
    slug: 'tottori-sakyu-kodomonokuni-silver-week-2026',
    title: '鳥取砂丘こどもの国 みんなで遊ぼう！こどもの国シルバーウィーク',
    lede: 'シルバーウィークの5日間、鉄道おもちゃの大規模展示やLaQで遊べるコーナー、園内スタンプラリーが登場。屋内でも遊べる内容が中心なので、砂丘観光とあわせて天気を問わず立ち寄れます。',
    category: 'seasonal',
    startDate: '2026-09-19', endDate: '2026-09-23',
    venue: '鳥取砂丘こどもの国', area: 'tottori', city: '鳥取市',
    ageLabel: '0歳〜', price: '入園料が必要（公式サイトをご確認ください）',
    officialUrl: 'https://kodomonokuni.tottori.jp/eventcalendar/20260819/5632/',
    tags: ['おもちゃ', 'シルバーウィーク', '室内あり'],
    note: '公式イベントカレンダーに「2026.9.19 (土) - 2026.9.23 (水)」と掲載（2026-09-14確認）。10:00〜16:30。',
  },
  {
    slug: 'tottori-sand-museum-spain-2026',
    title: '砂の美術館 第17期展示「砂で世界旅行・スペイン」',
    lede: '鳥取砂丘のそばで、世界の彫刻家がつくる巨大な砂像を見られる屋内美術館。今期はガウディ没後100年にちなんだスペインがテーマで、未就学児は無料。砂丘とセットで回りやすい立地です。',
    category: 'other',
    startDate: '2026-04-24', endDate: '2027-01-03',
    venue: '鳥取砂丘 砂の美術館', area: 'tottori', city: '鳥取市',
    ageLabel: '0歳〜', price: '一般800円・小中高生400円・未就学児無料',
    officialUrl: 'https://www.sand-museum.jp/news/17ki_k_spa/',
    tags: ['美術館', '砂像', '室内', '雨の日OK'],
    note: '公式ニュースに「2026年4月24日（金）～2027年1月3日（日）」と掲載（2026-09-14確認）。期間中無休、9:00〜18:00（最終入館17:30）。',
  },
  {
    slug: 'tokushima-zoo-night-autumn-2026',
    title: 'とくしま動物園 夜の動物園2026（秋開催）',
    lede: '秋の3日間だけ20時まで開園し、夜の動物の様子とライトアップを楽しめる企画。中学生以下は入園無料で、10月4日と12日は昼から大型の宝さがしもあるので、明るいうちから一日過ごせます。',
    category: 'seasonal',
    startDate: '2026-10-04', endDate: '2026-10-18',
    venue: 'とくしま動物園', area: 'tokushima', city: '徳島市',
    ageLabel: '0歳〜', price: '大人600円・中学生以下無料',
    officialUrl: 'https://tokushimazoo.jp/info/item.cgi?Id=55',
    tags: ['動物園', '夜', '屋外', '秋'],
    note: '公式お知らせ「夜の動物園2026を開催します」に「秋開催 令和8年10月4日（日）・12日（月：祝）・18日（日）」と掲載（2026-09-14確認）。開催は上記3日のみ。9:30〜20:00（入園19:00まで）。駐車場は普通車310円、乗り入れは18:00まで。',
    recurring: 'annual',
  },
  {
    slug: 'asutamuland-ai-mirai-lab-2026',
    title: 'あすたむらんど子ども科学館「AIと話そう！未来のくらしラボ」',
    lede: '大きく映し出されるAIエージェントと会話しながら、未来のくらしを支える科学技術にふれる期間限定の展示。子ども科学館の常設展示場にあり、公園の外遊びと組み合わせて雨の日の逃げ場にもなります。',
    category: 'other',
    startDate: '2026-09-19', endDate: '2027-03-28',
    venue: '徳島県立あすたむらんど', area: 'tokushima', city: '板野郡板野町',
    ageLabel: '0歳〜', price: '常設展示の観覧券が必要',
    officialUrl: 'https://asutamuland.jp/events/event/18572/',
    tags: ['科学館', 'AI', '室内', '雨の日OK'],
    note: '公式イベントページに「展示期間：2026/9/19～2027/3/28」と掲載（2026-09-14確認）。9:30〜16:30（12月のみ〜20:30）。',
  },
  {
    slug: 'ehime-kahaku-who-are-we-2026',
    title: '愛媛県総合科学博物館 特別展「WHO ARE WE 観察と発見の生物学」Vol.01 哺乳類',
    lede: '国立科学博物館の収蔵庫から来た哺乳類の剥製や骨格標本をじっくり観察できる特別展。未就学児は無料で、土日祝には動物バッグやしっぽブローチを作るワークショップもあります。',
    category: 'other',
    startDate: '2026-10-03', endDate: '2026-11-23',
    venue: '愛媛県総合科学博物館', area: 'ehime', city: '新居浜市',
    ageLabel: '0歳〜', price: '特別展 大人400円・小中学生200円・未就学児無料',
    officialUrl: 'https://www.i-kahaku.jp/exhibitions/special/2026/waw/',
    tags: ['博物館', '動物', '室内', '雨の日OK'],
    note: '公式特別展ページに「2026年10月3日（土）～11月23日（月祝）」と掲載（2026-09-14確認）。9:00〜17:30（入館17:00まで）。常設展とのセット券は大人700円・小中学生200円。ワークショップの動物バッグ（10/3〜11/3の土日祝）は1,000円。',
  },
  {
    slug: 'phoenix-zoo-silver-week-2026',
    title: '宮崎市フェニックス自然動物園 動物園のシルバーウィーク',
    lede: '開園55周年の記念グッズが毎日もらえるシルバーウィークの企画。マンドリルの赤ちゃんの命名式や無料のデジタルクイズラリー、キリンの枝を使ったキーホルダーづくりなど、日によって内容が変わります。',
    category: 'seasonal',
    startDate: '2026-09-19', endDate: '2026-09-23',
    venue: '宮崎市フェニックス自然動物園', area: 'miyazaki', city: '宮崎市',
    ageLabel: '0歳〜', price: '入園料が必要（キーホルダー製作500円）',
    officialUrl: 'https://www.miyazaki-city-zoo.jp/news_t/sw2026/',
    tags: ['動物園', 'シルバーウィーク', '屋外'],
    note: '公式お知らせ（2026/09/12掲載）に「9月19日（土）～23日（水・祝）」と掲載（2026-09-14確認）。記念グッズは1日200名。マンドリルの赤ちゃん命名式は9/20の10:45〜、キーホルダー製作は9/21〜23の9:30〜12:00（各日30個）。「モノ」展は10/31まで。',
  },
  {
    slug: 'miyazaki-science-festival-2026',
    title: '青少年のための科学の祭典2026 宮崎大会',
    lede: '宮崎科学技術館に実験や工作の体験ブースが並ぶ2日間。各ブースの体験は無料で、3歳以下は入館料もかからないため、幼児から小学生まできょうだいそろって楽しめます。',
    category: 'workshop',
    startDate: '2026-09-19', endDate: '2026-09-20',
    venue: '宮崎科学技術館', area: 'miyazaki', city: '宮崎市',
    ageLabel: '幼児〜', price: '入館料（大人550円・子ども210円・3歳以下無料）のみ',
    officialUrl: 'https://cosmoland.miyabunkyo.com/event-info/science_festival2026',
    tags: ['科学館', '実験', '室内', '雨の日OK'],
    note: '公式イベントページに「令和8年9月19日（土）、20日（日）9：30～16：00」と掲載（2026-09-14確認）。整理券は午前と午後の2回配布。',
    recurring: 'annual',
  },
  // ── 2026-09-21 週次 ───────────────────────────────────────────────────
  {
    slug: 'sunshine-city-halloween-2026',
    title: 'サンシャインシティ FUN! FUN! HALLOWEEN 2026',
    lede: '池袋の館内をまるごと使う10月まるまる1か月のハロウィン。手作りのキャンディボックスを持っていくとお菓子がもらえる企画や、おばけのカードを集めて歩くラリーなど、小学生以下向けの参加コンテンツがそろいます。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-10-31',
    venue: 'サンシャインシティ', area: 'tokyo', city: '豊島区',
    ageLabel: '小学生以下（参加企画の対象）', price: '無料の企画が中心。キャンディBOXワークショップ100円、ハロウィン縁日 1回300円・セット券500円（いずれも現金のみ）',
    officialUrl: 'https://sunshinecity.jp/file/official/halloween/',
    tags: ['ハロウィン', '池袋', '屋内', '雨でもOK'],
    note: '公式特設ページと運営の株式会社サンシャインシティのリリース（2026年9月17日配信）に「10月1日（木）〜10月31日（土）」と掲載（2026-09-21確認）。トリックオアトリート大作戦とハロウィン縁日はアルパ1F南入口前広場で11:00〜16:00。おばけのカード図鑑は館内各所をめぐるラリーで、サンシャイン水族館・てんぼうパーク・古代オリエント博物館の当日入場券またはアクアリウムクラブ会員証を見せるとキャンディBOX用のリボンがもらえます。水族館・展望台・博物館に入る場合はそれぞれの入場料が必要です。',
    recurring: 'annual',
  },
  {
    slug: 'hitachi-kaihin-kochia-carnival-2026',
    title: '国営ひたち海浜公園 きて みて さわって コキアカーニバル',
    lede: 'みはらしの丘のコキアが色づく秋の大型イベント期間。中学生以下は入園無料で、期間中の週末には工作や陶芸体験、外遊びの催しが日付を決めて開かれます。広い園内はレンタサイクルで回れます。',
    category: 'seasonal',
    startDate: '2026-09-18', endDate: '2026-11-03',
    venue: '国営ひたち海浜公園', area: 'ibaraki', city: 'ひたちなか市',
    ageLabel: '0歳〜', price: '入園料 中学生以下無料・大人450円（10/9〜11/3の季節料金期間は大人800円）。駐車場 普通車600円',
    officialUrl: 'https://www.hitachikaihin.jp/event/kochiacarnival2026/kochia.html',
    tags: ['コキア', '公園', '秋', '屋外'],
    note: '公式イベントページに「2026年9月18日金曜日から11月3日火曜日まで」と掲載（2026-09-21確認）。運営の一般財団法人公園財団も9月16日に同じ会期を発表。期間中の主な催しは健康スポーツフェスティバル9/27、いばらき都市緑化フェスティバル10/11、海浜陶芸まつり10/17〜18、ボランティアまつり10/24、吹奏楽カーニバル10/25、海・花そとあそび11/7〜8。紅葉は公式予想で10月15日頃が見頃です。',
    recurring: 'annual',
  },
  {
    slug: 'nara-shika-tsunokiri-2026',
    title: '古式「鹿の角きり」',
    lede: '江戸時代から続く奈良公園の秋の行事。勢子が鹿を追い込み、神官が角を切り落とすまでを間近で見られます。30分おきの入れ替え制なので、子どもの集中が続く1回ぶんだけ見て切り上げることもできます。',
    category: 'seasonal',
    startDate: '2026-11-07', endDate: '2026-11-08',
    venue: '春日大社 鹿苑 角きり場', area: 'nara', city: '奈良市',
    ageLabel: '小学生〜（未就学児の扱いは公式記載なし）', price: '当日券のみ。大人（中学生以上）1,000円・こども（小学生）500円',
    officialUrl: 'https://naradeer.com/event/tsunokiri.html',
    tags: ['鹿', '奈良公園', '伝統行事', '屋外'],
    note: '奈良の鹿愛護会の公式ページに「2026年概要 11月7日(土)・8日(日)」と掲載（2026-09-21確認）。11:45〜15:00（開場11:15・最終入場14:30）、12:30から30分おきに5回の完全入れ替え制です。公式が「全席立見」「バリアフリーではありません」と明記しているので、ベビーカーや歩き始めの子連れは事前に想定を。三脚不可・ペット同伴不可、小雨決行で荒天中止。駐車場はなく、JR・近鉄奈良駅からバス「春日大社表参道」下車徒歩約7分。例年10月開催でしたが2025年から11月に変わっています。',
    recurring: 'annual',
  },
  {
    slug: 'suma-seaworld-halloween-2026',
    title: '神戸須磨シーワールド 水族館で楽しむハロウィン',
    lede: '10月のひと月、館内のレストランとショップがハロウィン仕様に。土日祝は仮装したキャストに声をかけるとステッカーがもらえます。シャチを見ながら食べられるブッフェに子ども向けメニューが出ます。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-10-31',
    venue: '須磨シーワールド', area: 'hyogo', city: '神戸市須磨区',
    ageLabel: '0歳〜', price: '入館券が必要。限定メニューは別料金（イルカのハロウィンサンデー1,000円ほか）',
    officialUrl: 'https://www.kobesuma-seaworld.jp/news/10273/',
    tags: ['水族館', 'ハロウィン', '屋内', '雨でもOK'],
    note: '公式お知らせ（2026年9月16日付）に「2026年10月1日(木)〜10月31日(土)」と掲載（2026-09-21確認）。子ども向けにはジャック・オー・ランタンに見立てたオムライス「kidsトリックオアトリート」がブルーオーシャンのブッフェ内に登場。10月の土日祝は対象4店舗の仮装キャストに「トリック・オア・トリート」と声をかけると限定ステッカーがもらえます。ブルーオーシャンは横幅21mのアクリル越しにシャチを見られる1階290席のブッフェ（11:00〜17:00）。レストランはいずれも入館した人のみ利用できます。クリスマス・冬の企画はこの時点で未発表です。',
    recurring: 'annual',
  },

  {
    slug: 'seaparadise-akipara-2026',
    title: '横浜・八景島シーパラダイス 秋パラ！',
    lede: '芸術・スポーツ・学習・食欲の4テーマで組まれた秋の企画期間。5万尾のマイワシが舞うイワシイリュージョンとイルカのパフォーマンスはパス内で見られ、給餌体験は予約制で別料金です。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-11-13',
    venue: '横浜・八景島シーパラダイス', area: 'kanagawa', city: '横浜市金沢区',
    ageLabel: '0歳〜（個別プログラムに年齢制限あり）', price: 'イベント専用料金なし。アクアリゾーツパスは幼児4歳以上1,200円・小中学生2,200円・大人3,500円',
    officialUrl: 'https://www.seaparadise.co.jp/event/akipara2026autumn/index.html',
    tags: ['水族館', '秋', '体験', '横浜'],
    note: '運営の株式会社横浜八景島のリリース（2026年9月18日配信）に「2026年10月1日〜11月13日」と掲載（2026-09-21確認）。公式イベントページ側は開始日の曜日表記が2026年の暦と合わないため、日付のみを採用しています。パス内で見られるのはリニューアルした「スーパーイワシイリュージョン」とイルカのパフォーマンス「Animal Life Live！」。土日はパフォーマンス後に飼育員のレクチャータイムがあります。カピバラ・マーラのごはんタイム500円、イルカとあくしゅ＆ごはん1,000円などの給餌体験はWEB事前予約制で別料金。花火シンフォニアは10月10日・11日の20:00から。',
    recurring: 'annual',
  },
  {
    slug: 'tobu-zoo-autumn-night-zoo-2026',
    title: '東武動物公園 オータムナイトZOO 2026',
    lede: '秋の特定日だけ20時まで開園し、昼とは違う動物の姿を見られる夜の動物園。昼寝のあとにゆっくり出かけられるので、朝が弱い小さい子連れでも回しやすい日程です。',
    category: 'seasonal',
    startDate: '2026-10-10', endDate: '2026-10-12',
    venue: '東武動物公園', area: 'saitama', city: '南埼玉郡宮代町',
    ageLabel: '0歳〜', price: '通常の入園料（夜間の追加料金なし）',
    officialUrl: 'https://www.tobuzoo.com/event/13713.html',
    tags: ['動物園', '夜', '秋', '屋外'],
    note: '公式イベントページに開催日として9月19日〜23日と10月10日〜12日、時間9:30〜20:00（最終入園19:00）と掲載（2026-09-21確認）。ここでは今後の分にあたる10月10日〜12日を会期として登録しています。9月分は台風の影響で9月20日・21日の夜間営業が中止になった旨が公式に追記されました。10月10日〜12日は18:00〜20:00にホラー企画「ホラー・ザ・レジーナⅡ」を実施。ハロウィンナイトZOOとウインターイルミネーションはこの時点で未発表です。',
    recurring: 'annual',
  },
  // ── 2026-09-21 週次: 未カバー県（福岡・大分）─────────────────────────
  {
    slug: 'harmonyland-halloween-2026',
    title: 'ハーモニーランド HARMONYLAND HALLOWEEN',
    lede: 'サンリオの屋外パークが9月半ばから11月までハロウィン仕様に。仮装したキャラクターのショーと、一緒に歩けるパレードが主役です。ベビーカーで見られるエリアが公式に決まっているのが子連れには心強いところ。',
    category: 'seasonal',
    startDate: '2026-09-18', endDate: '2026-11-10',
    venue: 'ハーモニーランド', area: 'oita', city: '速見郡日出町',
    ageLabel: '0歳〜', price: 'デイパスポート3,600円・4,200円（税込／公式は2区分を併記）・4歳未満無料。ショーの最前列有料券1,000円ほか一部有料',
    officialUrl: 'https://www.harmonyland.jp/news/20776',
    tags: ['サンリオ', 'ハロウィン', 'パレード', '屋外'],
    note: '公式トピックス（掲載日2026年7月23日）に「開催期間:2026年9月18日(金)〜11月10日(火)」と明記（2026-09-21確認）。昼のライブショーは平日11:00〜ハーモニービレッジで定員約90名の当日先着。ショー会場は緑の線より後ろがベビーカー可エリアと公式にルール化されています。10:00〜10:30にスタッフへ「Trick or Treat!」と声をかけるとカードがもらえます（各日200枚限定）。夜のショーは10月11日・10月31日・11月1日など日が限られます。パスポート料金は公式が2区分を併記するだけで内訳を書いていないため、購入前に公式で確認してください。',
    recurring: 'annual',
  },
  {
    slug: 'kijima-kogen-working-cars-2026',
    title: '城島高原パーク はたらくくるま大集合！',
    lede: '消防車やはたらく車が高原の遊園地に集まる2日間。運転席に座って写真を撮れる車もあります。屋外で9時から17時までの通し開催なので、アトラクションと同じ日に組み込めます。',
    category: 'other',
    startDate: '2026-10-17', endDate: '2026-10-18',
    venue: '城島高原パーク', area: 'oita', city: '別府市',
    ageLabel: '1歳〜小学生', price: '入園券 中学生〜59才1,500円・4才〜小学生600円・3才以下無料（イベントの追加料金は公式記載なし）',
    officialUrl: 'https://www.kijimakogen-park.jp/event/workingcars/',
    tags: ['はたらくくるま', '屋外', '遊園地', '秋'],
    note: '公式イベントページの開催日欄に「10月17日(土) 18日(日)」、9:00〜17:00、会場は園内各所（屋外）と掲載（2026-09-21確認）。運転席に座って写真を撮れる車と、展示のみの車があります。3才以下は入園無料。標高約700mの高原にあります。',
  },
  {
    slug: 'kijima-kogen-precure-show-2026',
    title: '城島高原パーク 名探偵プリキュア!ショー',
    lede: '文化の日に1日2回、屋外ステージでプリキュアのショー。公演の間隔が空いているので、昼寝の前後どちらかに合わせて選べます。雨のときは屋内ホールに切り替わります。',
    category: 'show',
    startDate: '2026-11-03', endDate: '2026-11-03',
    venue: '城島高原パーク', area: 'oita', city: '別府市',
    ageLabel: '2歳〜小学校低学年', price: '入園料のみ（中学生〜59才1,500円・4才〜小学生600円・3才以下無料）',
    officialUrl: 'https://www.kijimakogen-park.jp/event/precure-show/',
    tags: ['プリキュア', 'ショー', '遊園地', '祝日'],
    note: '公式イベントページに開催日「9月22日(火祝) 11月3日(火祝)」、時間①11:00 ②14:00と掲載（2026-09-21確認）。ここでは今後の分にあたる11月3日を会期として登録しています。会場はイベントステージ（屋外）で、雨天時はフェスティバルホールでの屋内開催に切り替わると公式に案内があります。',
  },
  {
    slug: 'uminaka-halloween-photo-2026',
    title: '海の中道海浜公園 ハロウィンフォトスポット',
    lede: '広い園内5か所にハロウィンの撮影スポットが立ちます。予約も時間指定もなく入園していればいつでも撮れるので、同時期のデジタルスタンプラリーと合わせて園内を歩く口実になります。',
    category: 'seasonal',
    startDate: '2026-10-03', endDate: '2026-11-15',
    venue: '海の中道海浜公園', area: 'fukuoka', city: '福岡市東区',
    ageLabel: '0歳〜', price: '入園料のみ。15歳以上450円・中学生以下無料・65歳以上210円',
    officialUrl: 'https://uminaka-park.jp/event/art/post_535.html',
    tags: ['ハロウィン', '公園', '写真', '屋外'],
    note: '公式イベントページに「10月3日(土)〜11月15日(日)」と掲載（2026-09-21確認）。設置場所は西口園内マップ看板前・カナール・フラワーミュージアム・動物の森・Play Cafeの5か所で、Play Cafeのみ10月31日まで。同じ期間にデジタルスタンプラリー「ハロウィンフォトハント」も動いています。10月4日と10月25日は秋の都市緑化月間の無料入園日。11月1日から閉園が17:00に早まります。',
    recurring: 'annual',
  },
  {
    slug: 'uminaka-animal-nakayoshi-2026',
    title: '海の中道海浜公園 動物なかよし広場',
    lede: '秋の土日祝だけ、動物の森のふれあい広場が開きます。リクガメやミニブタなど動きのゆっくりな動物に無料で触れられて、11時から16時と時間が長いので午前でも午後でも寄れます。',
    category: 'seasonal',
    startDate: '2026-10-03', endDate: '2026-11-08',
    venue: '海の中道海浜公園', area: 'fukuoka', city: '福岡市東区',
    ageLabel: '1歳〜小学生', price: '無料（入園料は別途。中学生以下無料・大人450円）',
    officialUrl: 'https://uminaka-park.jp/event/animal/post_401.html',
    tags: ['動物', 'ふれあい', '公園', '屋外'],
    note: '公式イベントページに「10月3日（土）〜11月8日（日）※期間中の土日祝」「11時00分〜16時00分」「動物の森（ふれあい広場）」「無料」と掲載（2026-09-21確認）。開くのは期間中の土日祝だけです。動物の体調によって時間や展示動物が変わること、混雑時は入場制限をすること、雨天中止であることも公式に明記されています。',
    recurring: 'annual',
  },
  {
    slug: 'uminaka-takoage-festival-2026',
    title: '海の中道海浜公園 うみなか凧揚げフェスティバル',
    lede: '大芝生広場に巨大なクジラ型のバルーンカイトが上がる2日間。観覧は無料で、500円の凧づくりワークショップは各日先着80名。レジャーシートを広げて1日過ごせます。',
    category: 'matsuri',
    startDate: '2026-10-10', endDate: '2026-10-11',
    venue: '海の中道海浜公園', area: 'fukuoka', city: '福岡市東区',
    ageLabel: '2歳〜小学生', price: '観覧無料・凧づくり500円（各日先着80名）。入園料は別途（中学生以下無料・大人450円）',
    officialUrl: 'https://uminaka-park.jp/event/sports/',
    tags: ['凧', '広場', '屋外', '秋'],
    note: '公式イベント一覧に「10月10日（土）・11日（日）」と掲載（2026-09-21確認）。クジラのバルーンカイトは①10:30〜12:30、②13:30〜16:00。凧づくりは10:00〜16:00で各日先着80名。会場は大芝生広場。雨天中止で、公式は風の影響でバルーンカイトが飛ばない可能性にも触れています。',
    recurring: 'annual',
  },
  {
    slug: 'hibikinada-sanrio-halloween-parade-2026',
    title: '響灘グリーンパーク サンリオキャラクターズ ハロウィンパレード',
    lede: 'ハローキティやシナモロールが歩くパレードが、グリーンパークで初開催。1日2回・各30分と短いので小さい子でも最後まで観られます。入園料が未就学児無料・小中学生70円と安いのも助かるところ。',
    category: 'show',
    startDate: '2026-10-10', endDate: '2026-10-11',
    venue: '北九州市立響灘緑地／グリーンパーク', area: 'fukuoka', city: '北九州市若松区',
    ageLabel: '0歳〜小学生', price: '入園料のみ。一般150円・小中学生70円・未就学児無料（駐車場 普通車300円）',
    officialUrl: 'https://hibikinadagp.org/events/event/sanrioparade/',
    tags: ['サンリオ', 'パレード', 'ハロウィン', '屋外'],
    note: '公式イベントページに「開催日 2026年10月10日(土), 10月11日(日)」「パレード開催時間：①11:00〜11:30、②15:00〜15:30（各日）」と掲載（2026-09-21確認）。出演はハローキティ、シナモロール、マイメロディ、クロミ。公式が「今年の秋、グリーンパークで初開催」と書いています。同じ2日間に「みんなのハロウィンフードフェス」が併催。休園日は火曜です。',
  },
  {
    slug: 'hibikinada-halloween-food-fes-2026',
    title: '響灘グリーンパーク みんなのハロウィンフードフェス',
    lede: '3連休の3日間、園路にキッチンカーが14店並びます。仮装して行って何か買うと小学生以下にお菓子がもらえる仕掛け。屋外の園路なのでベビーカーのまま回れます。',
    category: 'market',
    startDate: '2026-10-10', endDate: '2026-10-12',
    venue: '北九州市立響灘緑地／グリーンパーク', area: 'fukuoka', city: '北九州市若松区',
    ageLabel: '0歳〜小学生', price: '入場無料（入園料150円・小中学生70円・未就学児無料、駐車料300円は別途）。飲食は各店で有料',
    officialUrl: 'https://hibikinadagp.org/events/event/halloween-food/',
    tags: ['キッチンカー', 'ハロウィン', '屋外', '3連休'],
    note: '公式イベントページに「開催日 2026年10月10日(土), 10月11日(日), 10月12日(月)」「10:00〜16:00」と掲載（2026-09-21確認）。会場は都市緑化センター前園路。公式に「小学生以下のお子さまは仮装でご来園＆キッチンカーの商品購入でお菓子をプレゼント」とあります。出店は14店（ハロウィンチュロス、米粉ドーナツ、ソフトクリームなど）。雨天決行・荒天中止。10月10日と11日はサンリオのハロウィンパレードが重なります。',
  },
  {
    slug: 'hibikinada-toy-railway-2026',
    title: '響灘グリーンパーク おもちゃと模型の鉄道まつり',
    lede: '鉄道模型を自分で動かせる運転体験と、おもちゃ列車の展示が並ぶ2日間。屋内ホール開催なので天気に左右されず、参加無料。飽きたらすぐ外の広場に出られる立地です。',
    category: 'workshop',
    startDate: '2026-10-03', endDate: '2026-10-04',
    venue: '北九州市立響灘緑地／グリーンパーク', area: 'fukuoka', city: '北九州市若松区',
    ageLabel: '1歳〜小学生', price: '無料（駐車場・入園料は別途必要）',
    officialUrl: 'https://hibikinadagp.org/events/event/tetudou/',
    tags: ['鉄道', '模型', '室内', '雨でもOK'],
    note: '公式イベントページに「2026年10月3日（土）・4日（日）10:00〜16:00」「場所：都市緑化センター内イベントホール」「料金：無料（駐車場・入園料は別途必要）」と掲載（2026-09-21確認）。協力は九州大学鉄道研究同好会。雨天決行・荒天中止。',
  },
  {
    slug: 'fukuoka-zoo-yamaneko-boardgame-2026',
    title: '福岡市動物園 ツシマヤマネコの子だくさん大作戦（ボードゲーム）',
    lede: '飼育員が作ったボードゲームで遊びながら絶滅危惧種のツシマヤマネコを学ぶ企画。参加無料で、オリジナルシールがもらえます。定員16名の整理券制なので、開園直後に取りに行くのが前提です。',
    category: 'workshop',
    startDate: '2026-10-03', endDate: '2026-10-31',
    venue: '福岡市動物園', area: 'fukuoka', city: '福岡市中央区',
    ageLabel: '小学生以上におすすめ（公式は「どなたでも」）', price: '参加無料。中学生以下は入園無料、高校生以上は入園料が必要',
    officialUrl: 'https://zoo.city.fukuoka.lg.jp/events/detail/2646',
    tags: ['動物園', 'ボードゲーム', '学べる', '室内'],
    note: '公式イベントページの開催日欄に10月3日・4日・8日・17日・18日・24日・25日・31日の8日が列挙されています（2026-09-21確認）。毎回13:30開始で所要90〜120分、定員は各回16名。整理券は当日9時から動物情報館ZooLabで先着順に配布されます。会場はZooLab多目的ホール。参加者にツシマヤマネコのオリジナルシールと対馬のパンフレットがもらえ、今春生まれた個体の映像紹介もあります。',
  },
  {
    slug: 'kamogawa-seaworld-night-adventure-2026',
    title: '鴨川シーワールド 秋のナイトアドベンチャー',
    lede: '閉館後の館内を懐中電灯で回る秋だけの夜のツアー。20時スタートで所要1時間20分と遅めなので、園内ホテルに泊まる日か翌日が休みの日に向いています。4歳から参加できます。',
    category: 'other',
    startDate: '2026-10-03', endDate: '2026-10-25',
    venue: '鴨川シーワールド', area: 'chiba', city: '鴨川市',
    ageLabel: '4歳〜（3歳以下は無料）', price: '大人（高校生以上）1,800円・小人（小中学生）1,100円・幼児（4歳以上）700円・3歳以下無料',
    officialUrl: 'https://www.kamogawa-seaworld.jp/event/event_info/16014/',
    tags: ['水族館', 'ナイト', '夜', '屋内'],
    note: '公式イベントページに「2026年10月3日（土）・4日（日）・10日（土）・11日（日）・12日（月祝）・17日（土）・18日（日）・24日（土）・25日（日）合計9日間」と明記（2026-09-22確認）。連続開催ではなく、この9日だけです。20:00〜21:20の各班1時間コース（最大3班／①20:00〜②20:10〜③20:20〜）。2026年は「シャチの特別レクチャー」が新しく加わると公式に記載があります。なお公式ページに「毎年開催」の記載は無いため、開催の有無は毎年確認が必要です。',
  },
  {
    slug: 'kamogawa-seaworld-beluga-50th-2026',
    title: '鴨川シーワールド「ベルーガ50th Anniversary」記念営業',
    lede: '日本でベルーガの飼育が始まって50年の記念イヤー。2027年6月末までの長期開催で、記念映像の上映や限定メニューが期間中に入れ替わります。冬に行っても何かしらやっているのが利点です。',
    category: 'other',
    startDate: '2026-09-01', endDate: '2027-06-30',
    venue: '鴨川シーワールド', area: 'chiba', city: '鴨川市',
    ageLabel: '0歳〜', price: '記念営業そのものの追加料金は公式に記載なし（入館料が必要）。ベルーガくじ1回1,300円・2026プレミアムプレート2,800円',
    officialUrl: 'https://www.kamogawa-seaworld.jp/event/event_info/15821/',
    tags: ['水族館', '記念', '屋内', '雨でもOK'],
    note: '公式イベントページに「2026年9月1日（火）～2027年6月30日（水）まで」と明記（2026-09-22確認）。1976年の日本初のベルーガ飼育開始から50年の単発記念営業で、毎年の行事ではありません。期間中の内訳は、特別上映「おしゃべりベルーガがやってきた」が2026年9月1日〜11月30日、ベルーガくじが2026年9月18日開始。グッズ・メニューは期間を通じて追加予定と記載があります。',
  },
  {
    slug: 'enosui-eco-matsuri-2026',
    title: '新江ノ島水族館 秋だ！祭りだ！ecoまつり！',
    lede: '10月の3連休に年1回だけ開く体験型のお祭り。工作や実験が無料〜150円程度で、未就学児は保護者同伴なら参加できます。雨でも濡れない館内の体験学習館が会場です。',
    category: 'matsuri',
    startDate: '2026-10-10', endDate: '2026-10-12',
    venue: '新江ノ島水族館 なぎさの体験学習館', area: 'kanagawa', city: '藤沢市',
    ageLabel: 'どなたでも（小学生未満は保護者同伴）', price: '無料〜150円程度（現金のみ）',
    officialUrl: 'https://www.enosui.com/experienceentry.php?eid=01272',
    tags: ['水族館', 'まつり', '体験', '室内', '雨でもOK'],
    note: '公式ページに「10月10日（土）～ 10月12日（祝・月）」と記載（2026-09-22確認）。えのすいの公式イベントページは西暦を書かない形式ですが、10/10＝土・10/12＝月（祝）は2026年の暦と一致します。同ページに「今年も10月の３連休は」「年に一度！」とあり、毎年開催の行事であることが公式に確認できます。会場はなぎさの体験学習館1F発見創造ラボ。',
    recurring: 'annual',
  },
  {
    slug: 'hamura-zoo-night-tour-2026',
    title: '羽村市動物公園 夜の動物園をまわろう！ナイトツアー',
    lede: '閉園後の園内を歩いて夜の動物を見るツアー。18時20分からで小さな子でも遅くなりすぎず、入園料とは別に1人1,000円。各日とも事前申込が必要なので、思い立って当日行くことはできません。',
    category: 'other',
    startDate: '2026-10-10', endDate: '2026-10-31',
    venue: '羽村市動物公園（ヒノトントンZOO）', area: 'tokyo', city: '羽村市',
    ageLabel: '公式に年齢制限の記載なし', price: '1,000円（入園料別）',
    officialUrl: 'https://hamurazoo.jp/event/detail.html?CN=432973',
    tags: ['動物園', 'ナイト', '夜', '要予約'],
    note: '公式イベントページに「期間限定｜2026/10/10、11、17、18、24、25、31」と明記（2026-09-22確認）。通し会期ではなくこの7日だけです。時間は18:20〜20:30。「※各日ともに事前申込が必要となります。」とあり当日参加はできません。お知らせの告知タイトルが「夜の動物園をまわろう！2026ナイトツアー開催のお知らせ」と年号付きで、毎年開催の行事です。ハロウィン・クリスマスは2026年分の告知がまだありません。',
  },
  {
    slug: 'saitama-kodomo-zoo-art-festa-2026',
    title: '埼玉県こども動物自然公園 アートフェスタ2026「watch! Animal sign」',
    lede: '園内の道沿いに作品を並べる恒例のアートフェスタ。10月から年末まで約3か月と長く、紅葉の時期にも年末の帰省ついでにも寄れます。歩く道そのものが会場なので、ベビーカーでも見て回れます。',
    category: 'other',
    startDate: '2026-10-01', endDate: '2026-12-29',
    venue: '埼玉県こども動物自然公園', area: 'saitama', city: '東松山市',
    ageLabel: '0歳〜', price: 'イベント単体の料金は公式に記載なし（入園料が必要）',
    officialUrl: 'https://www.parks.or.jp/sczoo/event/009/009309.html',
    tags: ['動物園', 'アート', '秋', '冬'],
    note: '公式イベントページの開催日欄に「2026年10月1日（木曜）～2026年12月29日（火曜）」と明記（2026-09-22確認）。同ページに「今年で第14回となるアートフェスタ」とあり、毎年開催の行事であることが公式に確認できます。会場は「こどもの城からキツネザル舎への道」。この園の10〜12月のイルミネーション・クリスマス・ハロウィンは2026年分が未発表で、ナイトズー2026は9月で終了済みです。',
    recurring: 'annual',
  },
  {
    slug: 'saitama-kodomo-zoo-australia-fair-2026',
    title: '埼玉県こども動物自然公園 オーストラリアフェア2026',
    lede: 'コアラやカンガルーで知られるこの園が、オーストラリアの動物をテーマに開く週末2日間のフェア。内容の詳細は公式が「決まり次第」としているので、行く前に一度公式を見てください。',
    category: 'other',
    startDate: '2026-10-24', endDate: '2026-10-25',
    venue: '埼玉県こども動物自然公園', area: 'saitama', city: '東松山市',
    ageLabel: '0歳〜', price: 'イベント単体の料金は公式に記載なし（入園料が必要）',
    officialUrl: 'https://www.parks.or.jp/sczoo/event/009/009315.html',
    tags: ['動物園', 'コアラ', '週末'],
    note: '公式イベントページの開催日欄に「2026年10月24日（土曜）～2026年10月25日（日曜）」と明記（2026-09-22確認）。ただし本文は「詳細は決まり次第お知らせいたします。」の状態で、プログラム内容・料金は未掲載です。イベント名に年号が入る年次フェアです。',
    recurring: 'annual',
  },
  {
    slug: 'marunouchi-illumination-2026',
    title: '丸の内イルミネーション 2026',
    lede: '丸の内仲通りの街路樹が光る冬の恒例イルミネーション。11月中旬から2月半ばまでと会期が長く、東京駅から地上に出てすぐなので、ベビーカーでも段差を気にせず歩けます。',
    category: 'illumination',
    startDate: '2026-11-12', endDate: '2027-02-14',
    venue: '丸の内仲通り', area: 'tokyo', city: '千代田区',
    ageLabel: '0歳〜', price: '公式リリースに料金の記載なし（屋外のイルミネーション）',
    officialUrl: 'https://www.marunouchi.com/pickup/event/10727/',
    tags: ['イルミネーション', '冬', '東京駅', '夜'],
    note: '公式（丸の内ドットコム／三菱地所2026年9月17日付リリース）に「2026年11月12日（木）～2027年2月14日（日）」「開催場所 丸の内仲通り」と明記（2026-09-22確認）。同リリースに「今年で25回目を迎える」とあり毎年開催の行事です。点灯時間などの詳細は「10月下旬にお知らせ」とされており未掲載のため、行く前に公式で確認してください。主催は丸の内イルミネーション実行委員会。',
    recurring: 'annual',
  },
  {
    slug: 'marunouchi-bright-holiday-2026',
    title: 'MARUNOUCHI BRIGHT HOLIDAY 「ハリー・ポッター」丸の内を彩る魔法の雪',
    lede: '丸ビル・新丸ビルなど丸の内エリア一帯をまとめたクリスマス企画。「ハリー・ポッター」をテーマにした装飾が入り、屋内のビル内が中心なので寒い日や雨の日でも回れます。',
    category: 'illumination',
    startDate: '2026-11-12', endDate: '2026-12-25',
    venue: '丸ビル・新丸ビル・丸の内オアゾ・丸の内ブリックスクエア ほか', area: 'tokyo', city: '千代田区',
    ageLabel: '0歳〜', price: '公式リリースに料金の記載なし',
    officialUrl: 'https://www.marunouchi.com/pickup/event/10727/',
    tags: ['クリスマス', 'イルミネーション', '冬', '室内'],
    note: '公式（丸の内ドットコム／三菱地所2026年9月17日付リリース）に「2026年11月12日（木）～12月25日（金） ※一部コンテンツを除く」と明記（2026-09-22確認）。2026年から使われる丸の内の冬企画の総称で、前年までの同名開催は確認できないため毎年の行事とはしていません。クリスマスマーケットの個別会期は未発表です。',
  },
  {
    slug: 'adachi-seibutsuen-oshigoto-ten-2026',
    title: '足立区生物園 企画展「のぞいてみよう！生物園のお仕事展」',
    lede: '飼育員の仕事を紹介する企画展。屋内の生きもの研究室が会場で、11月頭まで2か月以上やっているので、天気の悪い日の行き先として覚えておけます。',
    category: 'other',
    startDate: '2026-09-03', endDate: '2026-11-08',
    venue: '足立区生物園', area: 'tokyo', city: '足立区',
    ageLabel: '0歳〜', price: '企画展単体の料金は公式に記載なし（入園料が必要）',
    officialUrl: 'https://seibutuen.jp/exhibition/josetsu_map.html',
    tags: ['動物園', '企画展', '室内', '雨でもOK'],
    note: '公式の常設展・企画展ページに「期　間：2026年9月3日（木）～11月8日（日） 場　所：１F 生きもの研究室」と明記（2026-09-22確認）。同ページに「数か月ごとにテーマを変えて、企画展を開催しています」とあり、この展示名自体は単発です。2026年のハロウィン・クリスマスは告知がまだありません。',
  },
  {
    slug: 'adachi-seibutsuen-gairaishu-2026',
    title: '足立区生物園 企画展「虫から見る外来種 ～くらべてみるとちがいが見える～」',
    lede: '外来種と在来種の虫を並べて見比べる企画展。2階のむしむしコーナーが会場で、11月中旬まで。虫好きの子には刺さる内容です。',
    category: 'other',
    startDate: '2026-09-09', endDate: '2026-11-15',
    venue: '足立区生物園', area: 'tokyo', city: '足立区',
    ageLabel: '0歳〜', price: '企画展単体の料金は公式に記載なし（入園料が必要）',
    officialUrl: 'https://seibutuen.jp/exhibition/josetsu_map.html',
    tags: ['動物園', '企画展', '昆虫', '室内'],
    note: '公式の常設展・企画展ページに「期間：2026年9月9日(水)～2026年11月15日(日) 場所：２階むしむしコーナー」と明記（2026-09-22確認）。数か月ごとに入れ替わる企画展で、毎年の行事ではありません。',
  },
  {
    slug: 'kamogawa-seaworld-anniversary-day-2026',
    title: '鴨川シーワールド 開業記念日 感謝DAY',
    lede: '開業記念日の10月1日だけ入館料が大幅に安くなる日。大人3,300円が2,000円、幼児1,300円が500円になります。1日限りなので、この日に合わせて行けるなら狙い目です。',
    category: 'other',
    startDate: '2026-10-01', endDate: '2026-10-01',
    venue: '鴨川シーワールド', area: 'chiba', city: '鴨川市',
    ageLabel: '0歳〜（3歳以下は通常無料）', price: '当日限り 大人（高校生以上）2,000円（通常3,300円）・小中学生1,000円（通常2,000円）・幼児（4歳以上）500円（通常1,300円）',
    officialUrl: 'https://www.kamogawa-seaworld.jp/event/event_info/15922/',
    tags: ['水族館', '割引', '記念日'],
    note: '公式イベントページに「2026年10月1日（木）」「56回目の開業記念日」と明記（2026-09-22確認）。1日限りです。当日は勝又博館長の講演「鴨川シーワールドの歩み」が12:00〜約20分、マリンシアターで無料（別途入館料が必要）。開業記念日が毎年10月1日で固定のため毎年ある行事ですが、割引の実施有無は年ごとに公式で確認してください。この日はシャチのスプラッシュ演出の今シーズン最終日にもあたります。',
  },
  {
    slug: 'kasai-aquarium-kaien-kinenbi-2026',
    title: '葛西臨海水族園 開園記念日イベント「All About MAGURO」',
    lede: '開園記念日の10月10日は入園無料。3日間まるごとマグロ尽くしで、ビンゴやクイズ、裏側探検ツアーまであります。無料の日は混むので、開園直後を狙うのが無難です。',
    category: 'other',
    startDate: '2026-10-10', endDate: '2026-10-12',
    venue: '葛西臨海水族園', area: 'tokyo', city: '江戸川区',
    ageLabel: '0歳〜（裏側探検ツアーは小学生以上・抽選）', price: '10月10日（土）は無料開園日。11日・12日は通常入園料 一般700円・中学生250円・65歳以上350円',
    officialUrl: 'https://www.tokyo-zoo.net/kasai/news/12632/index.html',
    tags: ['水族館', '無料', '記念日', '室内'],
    note: '公式ニュース（2026年9月10日付）に「10月10日（土）から12日（月・祝）の3日間行います」「開園記念日の10月10日（土）は例年どおり無料開園日です！」と明記（2026-09-22確認）。開園記念日（10月10日＝マグロの日）にちなむ毎年の行事ですが、「All About MAGURO」というテーマ名は2026年固有です。期間中の個別プログラムは、マグロでBINGO（10/10〜12）、ミニ企画展示「マグロのぞき」（10/1〜10/31・ただし10/10は閉鎖）、マグロラボ（10/11〜12）、スペシャルガイドツアー「マグロ裏側探検」（10/11〜12・抽選各回10名・小学生以上）、マグロウルトラクイズ（10/11〜12）、ミュージカル「ホヌ・バイ・ザ・シー」（10/10〜12）。公式URLは2026年3月のリニューアルで /zoo/kasai/ から /kasai/ に変わっています（旧URLは301）。休園日は水曜。',
    recurring: 'annual',
  },
  {
    slug: 'inokashira-zoo-aki-no-yonaga-2026',
    title: '井の頭自然文化園 ちょっとおでかけ 秋の夜長の自然文化園',
    lede: '2日間だけ20時まで開園を延長する夜の自然文化園。夜ならではの動物ガイドや彫刻館のナイトツアー、屋外コンサートがあります。入園は19時までなので、夕食前に寄る組み立てにすると回りやすいです。',
    category: 'other',
    startDate: '2026-11-07', endDate: '2026-11-08',
    venue: '井の頭自然文化園', area: 'tokyo', city: '武蔵野市',
    ageLabel: '0歳〜', price: '特別料金の記載なし（通常入園料 一般400円・中学生150円・65歳以上200円。小学生以下と都内在住/在学の中学生は無料）',
    officialUrl: 'https://www.tokyo-zoo.net/inokashira/news/12657/index.html',
    tags: ['動物園', '夜', '秋', 'ライトアップ'],
    note: '公式ニュース（2026年9月17日付）に「実施日　2026年11月7日（土）、8日（日）　各日20時まで開園時間を延長（入園は19時まで）」と明記（2026-09-22確認）。同ページに「今年も、夜ならではの動物ガイドのほか…」とあり毎年の行事です。動物園（本園）と水生物園の両園が対象。個別プログラムは彫刻ガイド「ちょっとナイト・ミュージアム」（11/7 18:45〜）、こもれび前コンサート「ちょっと秋風そよぐ演奏会」（11/8）、飼育係のいきものガイド・夜編（両日・時間未発表）。休園日は月曜。',
    recurring: 'annual',
  },
  {
    slug: 'inokashira-zoo-shima-no-ikimono-haku-2026',
    title: '井の頭自然文化園 島のいきもの博―ツシマヤマネコがつなぐ島とわたしたち',
    lede: '対馬・小笠原・奄美の野生動物を守る団体が集まる2日間。スタンプラリーやぬりえ教室、変身体験など子ども向けのプログラムが並びます。芝生広場が会場なので、敷物を持っていくと過ごしやすいです。',
    category: 'other',
    startDate: '2026-10-17', endDate: '2026-10-18',
    venue: '井の頭自然文化園', area: 'tokyo', city: '武蔵野市',
    ageLabel: '0歳〜', price: '各プログラムの参加費は公式に記載なし（通常入園料 一般400円・中学生150円。小学生以下は無料）',
    officialUrl: 'https://www.tokyo-zoo.net/inokashira/news/12951/index.html',
    tags: ['動物園', '学べる', '体験', '週末'],
    note: '公式ニュース（2026年9月14日付）に「日時　2026年10月17日（土） 10時～16時／10月18日（日） 10時～15時」「場所　メイン会場　動物園（本園）芝生広場」と明記（2026-09-22確認）。同ページに「例年、「ヤマネコ祭」として対馬、小笠原諸島、奄美大島の野生動物の保全に関わる団体が一堂に会し」とあり、従来のヤマネコ祭を改称した毎年の行事です。プログラムは島のいきものスタンプラリー（両日・先着1000名）、島トーク（対馬・西表島＝10/17、小笠原・奄美＝10/18）、ヤマネコのぬりえ教室（10/17 13:30〜14:30・先着100名）、ヤマネコにだいへんしん！（両日・各日300名）、ヤマネコおはなし会（10/18 11時〜）、保全団体の展示ブース。',
    recurring: 'annual',
  },
  {
    slug: 'inokashira-zoo-seibow-ijinden-2026',
    title: '井の頭自然文化園 企画展「西望偉人伝」',
    lede: '彫刻家・北村西望が手がけた偉人像をたどる企画展。2027年4月まで続く長期開催で、彫刻館B館の屋内展示なので雨の日や寒い日の逃げ場になります。',
    category: 'other',
    startDate: '2026-05-29', endDate: '2027-04-04',
    venue: '井の頭自然文化園', area: 'tokyo', city: '武蔵野市',
    ageLabel: '0歳〜', price: '企画展単体の料金は公式に記載なし（通常入園料が必要）',
    officialUrl: 'https://www.tokyo-zoo.net/inokashira/events/11549/index.html',
    tags: ['動物園', '企画展', '室内', '雨でもOK'],
    note: '公式イベントページに「開催期間　2026年5月29日（金）～2027年4月4日（日）」「展示時間　9時30分〜16時30分」と明記（2026-09-22確認）。会場は動物園（本園）彫刻館B館 中央展示コーナー。単発の企画展で毎年の行事ではありません。なお公式トップに出る「9/9-4/5 Art and the Zoo vol.9 アヤ井アキコ 絵本《こうもり》原画展」は会期が2025年9月9日〜2026年4月5日で終了済みです（見出しが年を省いており誤読しやすいので注意）。',
  },
  {
    slug: 'itabashi-kodomo-zoo-park-festa-2026',
    title: '板橋こども動物園 ZOOパークフェスタ',
    lede: '年に一度の園のビッグイベント。入園無料の動物園でひらかれるので、費用をかけずに1日遊べます。荒天なら12月6日に延期されるため、前日に公式を見てから出かけてください。',
    category: 'other',
    startDate: '2026-11-15', endDate: '2026-11-15',
    venue: '板橋区立こども動物園（東板橋公園）', area: 'tokyo', city: '板橋区',
    ageLabel: '0歳〜', price: '入園無料（個別プログラムの料金は公式に記載なし）',
    officialUrl: 'https://itabashi-park-zoo.com/cat_main/%EF%BC%92%EF%BC%90%EF%BC%92%EF%BC%96%E5%B9%B4%E3%80%80ZOO%E3%83%91%E3%83%BC%E3%82%AF%E3%83%95%E3%82%A7%E3%82%B9%E3%82%BF%E3%81%AE%E3%81%8A%E7%9F%A5%E3%82%89%E3%81%9B/',
    tags: ['動物園', '無料', 'イベント', '秋'],
    note: '運営（公益財団法人ハーモニィセンター）の公式お知らせに「開催日は１１月１５日（日）です。※悪天候の場合は１２月６日（日）に延期となります」と明記（2026-09-22確認）。同ページに「年に一度の動物園のビッグイベント」とあり毎年の行事です。プログラムの詳細は後日発表とされています。園は入園無料で、休園日は月曜（祝日の場合は翌日）・12月29日〜1月3日・2月の第3火曜。開園時間は3〜11月が10:00〜16:30、12〜2月は10:00〜16:00。',
    recurring: 'annual',
  },
  {
    slug: 'edogawa-shizen-zoo-aigo-shukan-2026',
    title: '江戸川区自然動物園 動物愛護週間イベント',
    lede: '動物愛護週間に合わせた1時間のおはなし会。オオアリクイとチャボについて専門学校生が話します。入園無料の動物園なので、散歩のついでに立ち寄れます。',
    category: 'other',
    startDate: '2026-09-26', endDate: '2026-09-26',
    venue: '江戸川区自然動物園（行船公園）', area: 'tokyo', city: '江戸川区',
    ageLabel: '0歳〜', price: '入園無料（イベントの参加費は公式に記載なし）',
    officialUrl: 'https://www.edogawa-kankyozaidan.jp/zoo/event/242/',
    tags: ['動物園', '無料', '学べる'],
    note: '公式イベントページに「【日　時】9月26日（土）14：00～15：00」「【場所】オオアリクイ展示場前、ふれあいコーナー」「【内容】『オオアリクイ』、『チャボ』のおはなし」と明記（2026-09-22確認）。TCA東京ECO動物海洋専門学校の学生による解説です。動物愛護週間（毎年9月20〜26日）に合わせた毎年の行事。園は入園無料、休園日は月曜（祝休日の場合は翌日）と12月29日〜1月1日。開園は10:00〜16:30（土日祝は9:30から、11〜2月は16:00まで）。なお国際レッサーパンダデーイベントは2026年9月19日付で中止が発表されています。',
    recurring: 'annual',
  },
  {
    slug: 'kasai-aquarium-quiet-hour-2026-11',
    title: '葛西臨海水族園 クワイエットアワー しずかを楽しむ水族園',
    lede: '館内のアナウンスや照明をおさえて、静かな環境で見られるようにする時間帯。音や光が苦手な子でも入りやすくなります。年6回の実施日のうち、秋冬は11月10日です。',
    category: 'other',
    startDate: '2026-11-10', endDate: '2026-11-10',
    venue: '葛西臨海水族園', area: 'tokyo', city: '江戸川区',
    ageLabel: '0歳〜', price: '特別料金の記載なし（通常入園料 一般700円・中学生250円・65歳以上350円）',
    officialUrl: 'https://www.tokyo-zoo.net/kasai/events/11226/index.html',
    tags: ['水族館', '室内', '雨でもOK', '静か'],
    note: '公式イベントページに「日にち　2026年5月12日（火）7月14日（火）、9月8日（火）、11月10日（火）／2027年1月12日（火）、3月9日（火）」「時間　13時～16時30分」と明記（2026-09-22確認）。このレコードは秋の実施日である11月10日分です（次回は2027年1月12日）。2026年3月に試行し2026年度から年6回の定例実施を始めた新しい取り組みで、毎年の行事として確立しているとは公式に書かれていないため recurring は付けていません。',
  },
  {
    slug: 'kumamoto-castle-oshiro-matsuri-2026',
    title: '秋のくまもとお城まつり ～いざ、前へ～（城あかり）',
    lede: '熊本城の特別公開エリアを21時まで開けて、天守前をライトアップする1か月間。令和8年熊本地震からの復興事業として行われます。夜の城は子どもにも分かりやすい見どころです。',
    category: 'illumination',
    startDate: '2026-10-02', endDate: '2026-11-01',
    venue: '熊本城 特別公開エリア', area: 'kumamoto', city: '熊本市中央区',
    ageLabel: '0歳〜', price: '有料エリア入園料が必要。高校生以上800円・小中学生300円（熊本市内在学の小中学生は免除）',
    officialUrl: 'https://castle.kumamoto-guide.jp/news/detail/1475',
    tags: ['ライトアップ', '夜', '城', '秋'],
    note: '熊本城公式お知らせ（2026年9月9日付）に「10月2日（金）から11月1日（日）まで、熊本城特別公開エリアの開園時間を延長し、特別なライトアップを実施します。」「城あかり　10月2日（金）～11月1日（日）」と明記（2026-09-22確認）。正式名称は「令和８年熊本地震復興事業　秋のくまもとお城まつり～いざ、前へ～」。期間中の単日イベントとして「熊本城　太鼓・箏・茶の和み」（10月3日・城彩苑）と「熊本城流鏑馬」（11月3日・二の丸芝生広場）があります。入園券は事前購入が推奨されています。なお旧細川刑部邸の紅葉ライトアップと「名月観賞の夕べ」は、公式イベント一覧で「復旧工事のため休止中」と表示されています。',
    recurring: 'annual',
  },
  {
    slug: 'greenland-halloween-2026',
    title: 'グリーンランド グリーンランドハロウィン',
    lede: '九州最大級の遊園地が1か月かけてハロウィン一色になります。仮装で来ても浮かない期間で、フォトスポットや限定メニューが出ます。11月3日までと長いので週末を選びやすいです。',
    category: 'seasonal',
    startDate: '2026-10-01', endDate: '2026-11-03',
    venue: 'グリーンランド', area: 'kumamoto', city: '荒尾市',
    ageLabel: '0歳〜', price: 'イベント単体の料金は公式に記載なし（入園料・フリーパスが別途必要）',
    officialUrl: 'https://www.greenland.co.jp/park/halloween2026/',
    tags: ['遊園地', 'ハロウィン', '秋', '仮装'],
    note: '公式の2026年ハロウィン特設ページに「開催期間 : 2026/10/1  ~11/3」と明記（2026-09-22確認）。毎年開催の行事です。',
    recurring: 'annual',
  },
  {
    slug: 'greenland-pan-dorobou-2026',
    title: 'グリーンランド パンどろぼうフェスティバル',
    lede: '絵本『パンどろぼう』とのコラボ企画。アトラクションとワークショップがあり、2歳以下は無料。9月中旬から11月下旬まで2か月以上やっているので、予定を合わせやすいです。',
    category: 'other',
    startDate: '2026-09-18', endDate: '2026-11-23',
    venue: 'グリーンランド', area: 'kumamoto', city: '荒尾市',
    ageLabel: '2歳〜（2歳以下無料）', price: 'アトラクション500円（または回数券5枚）・1,000円（または回数券9枚）、ワークショップ1,500円。別途入園料',
    officialUrl: 'https://www.greenland.co.jp/park/event/pandorobou_festival/',
    tags: ['遊園地', '絵本', 'コラボ', '秋'],
    note: '公式イベントページに「開催期間 9月18日(金)～11月23日(月祝)」と明記（2026-09-22確認）。9/18＝金、11/23＝月（勤労感謝の日）は2026年の暦と一致します。絵本コラボの単発企画で、毎年の行事ではありません。',
  },
  {
    slug: 'kumamoto-museum-futatsu-no-kumamotojo-2026',
    title: '熊本博物館 秋季企画展「二つの「くまもと城」―豊臣の衝撃、戦国肥後の終焉―」',
    lede: '戦国期の熊本の城をたどる企画展。12月頭まで開いている屋内展示で、市内の小中学生は観覧無料です。関連イベントに子ども向けと明記されたものもあります。',
    category: 'other',
    startDate: '2026-10-03', endDate: '2026-12-06',
    venue: '熊本博物館', area: 'kumamoto', city: '熊本市中央区',
    ageLabel: '小学生〜', price: '大人400円・高大生300円・中学生以下200円（熊本市内の小中学生、65歳以上、障害者手帳をお持ちの方は無料）',
    officialUrl: 'https://kumamoto-city-museum.jp/exhibition/245/2079',
    tags: ['博物館', '企画展', '室内', '雨でもOK'],
    note: '公式展覧会ページに「【会　期】令和８（２０２６）年１０月３日（土）～１２月６日（日）　休館日：月曜日（月曜祝日の場合は翌日火曜日）」と明記（2026-09-22確認）。会場は当館2階 特別展示室。単発の企画展で毎年の行事ではありません。関連イベントはギャラリートーク（10/17・11/3・11/14）、ジオラマ解説（10/18）、シンポジウム（11/7）、現地案内（11/28）、バスツアー（11/29）。',
  },
];

/**
 * 公開イベント配列 = 手動キュレーション（BASE_EVENTS）＋
 * 管理画面「新規イベント」で作成したイベント（events-extra.json）。
 * slug が重複する場合は BASE_EVENTS（手動キュレーション）を優先する。
 */
export const EVENTS: EventEntry[] = (() => {
  const baseSlugs = new Set(BASE_EVENTS.map((e) => e.slug));
  const extra = (EVENTS_EXTRA as EventEntry[]).filter(
    (e) => e && e.slug && !baseSlugs.has(e.slug),
  );
  return [...BASE_EVENTS, ...extra];
})();

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

/**
 * 指定エリアで「開催中・これから」のイベント（終了済みは自動で消える）。
 * cityLike（市区町村名）があれば一致するものを先頭に寄せる。
 * /spot/[slug] の「近くで開催中のイベント」用 — イベントを既存ページの鮮度部品として使う。
 */
export function getUpcomingEventsNear(
  area: AreaSlug | string,
  cityLike?: string,
  limit = 3,
): { events: EventEntry[]; cityMatched: boolean } {
  const today = todayString();
  const alive = getMergedEvents()
    .filter((e) => e.area === area && e.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (!cityLike) return { events: alive.slice(0, limit), cityMatched: false };
  const cityMatch = alive.filter(
    (e) => !!e.city && ((e.city as string).includes(cityLike) || cityLike.includes(e.city as string)),
  );
  // 市区町村一致があるときは一致分だけを返す（「○○周辺」の見出しにエリア補完を混ぜない）。
  if (cityMatch.length > 0) return { events: cityMatch.slice(0, limit), cityMatched: true };
  return { events: alive.slice(0, limit), cityMatched: false };
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
  //    管理画面からアップロードした Vercel Blob のURL（KV override 経由で e.hero に載る）もここで通す
  if (
    e.hero &&
    (TRUSTED_HERO_PREFIXES.some((p) => e.hero!.startsWith(p)) ||
      /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(e.hero))
  ) {
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
