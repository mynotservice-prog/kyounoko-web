/**
 * 47都道府県の子連れおすすめスポットデータ。
 *
 * 方針:
 * - 全国的に知名度の高い、閉業リスクの低い大型施設/公園を中心にキュレーション
 * - 各スポットに年齢適性・屋内/屋外・ざっくりカテゴリを付与
 * - Plan/記事ページで area が絞られているときに具体的な場所を提示する用途
 * - いこーよ等の情報サイトを参考に、「2026年時点で営業していると思われる」代表的な場所に絞る
 * - 住所・電話番号は意図的に持たない（変更リスクがあるため）。
 *   ユーザーは公式サイトで必ず最新情報を確認する前提。
 */

import type { AreaSlug } from './area';
import { KID_REPORTS } from './kid-reports';
import { SPOT_FACILITIES } from './spot-facilities';
import { SPOT_ACCESS } from './spot-access';
import { SPOTS_EXTRA } from './spots-extra';
import { mergeSpot } from './spot-overrides';

export type SpotCategory =
  | 'zoo'          // 動物園
  | 'aquarium'     // 水族館
  | 'park'         // 公園・大型緑地
  | 'museum'       // 博物館・科学館
  | 'amusement'    // 遊園地・テーマパーク
  | 'indoor'       // 屋内遊戯施設（雨の日）
  | 'farm'         // 牧場
  | 'seasonal'     // 季節体験（いちご狩り等）
  | 'restaurant';  // 子連れOKレストラン

export type SpotPlace = 'indoor' | 'outdoor' | 'mixed';

export type AgeTag = '0-1' | '2-3' | '4-6';

/** 公園内の遊具タイプ（park カテゴリで使うタグ）。 */
export type PlaygroundFeature =
  | 'large-slide'   // 大型滑り台（ジャンボ滑り台）
  | 'long-slide'    // ロングすべり台/ローラーすべり台（50m〜）
  | 'fuwafuwa'      // ふわふわドーム/エアトランポリン
  | 'athletic'      // アスレチック・複合遊具
  | 'tarzan'        // ターザンロープ/ジップライン
  | 'climbing'      // クライミングウォール/ボルダリング
  | 'spider-net'    // クモの巣ネット/ロープジム
  | 'swing'         // 大型ブランコ
  | 'sandbox'       // 砂場
  | 'bbq'           // BBQエリア
  | 'cycling'       // サイクリングコース/レンタサイクル
  | 'mini-train';   // 子供向けミニ電車

/**
 * 運営者が実際に子連れで訪問して記録した一次情報レポート。
 * ※ここに入れるのは運営者ながみーの実体験のみ。公開情報・口コミは混ぜない。
 * UI では「運営者が訪問して確認」バッジ付きで表示する。
 */
export type KidReport = {
  /** 情報の出どころ。'visited' = 運営者が実際に子連れで訪問して確認 */
  source: 'visited';
  /** 訪問した時期の子の年齢感（例: '1歳ごろ', '0歳の散歩〜4歳'） */
  visitAge: string;
  /** ベビーカー動線（押しやすさ・押しにくい場所・置き場・館内可否など） */
  strollerNote: string;
  /** 土日の混雑と、空いている狙い目の時間帯 */
  crowdNote: string;
  /** おむつ替え・授乳ができる場所 */
  diaperNote: string;
  /** 実際に過ごせた滞在時間の目安 */
  stayNote: string;
  /** ヒヤッとした点・年齢的に注意したい場所 */
  cautionNote: string;
};

export type Spot = {
  name: string;
  category: SpotCategory;
  place: SpotPlace;      // 屋内なら雨天OK
  ages: AgeTag[];        // 特に楽しめる年齢層
  city?: string;         // 市区町村（ざっくり）
  note?: string;         // 一言メモ（30-50文字）
  budget?: 'free' | 'low' | 'mid' | 'high';  // 入園料目安
  // ---- Instagram人気アカウントから学んだ情報密度UP項目 ----
  pricing?: {
    adult?: string;      // '2,300円'
    elementary?: string; // '1,100円'
    preschool?: string;  // '400円（3歳以上）'
    infant?: string;     // '無料（3歳未満）'
  };
  reservation?: 'required' | 'recommended' | 'none';  // 予約制の有無
  crowdLevel?: {
    weekday?: 'low' | 'mid' | 'high';
    holiday?: 'low' | 'mid' | 'high';
  };
  hiddenTip?: string;    // 穴場ポイント「予約制で混雑回避」「平日午前が狙い目」等
  nearby?: string;       // 近隣セット提案「徒歩10分の海の中道海浜公園と1日セット」等
  popular?: boolean;     // エディターが「ママに人気」として推すスポット（トップページ表示用）
  ward?: string;         // 東京23区の区名（例: '中野区'）、その他市区町村
  // レストラン向けフラグ
  strollerAccess?: boolean;  // ベビーカー入店可
  babyChair?: boolean;       // ベビーチェア完備
  kidsMenu?: boolean;        // キッズメニューあり
  privateRoom?: boolean;     // 個室あり
  babyFood?: boolean;        // 離乳食持ち込みOK / 提供あり
  // ---- 夏季向けフラグ ----
  /** 水遊び可（じゃぶじゃぶ池/噴水/プール/水族館タッチプール等） */
  waterPlay?: boolean;
  /** 無料の水遊び場（じゃぶじゃぶ池等、入園料/利用料が0円） */
  freeWaterPlay?: boolean;
  /** 真夏に涼しい屋内（冷房完備、外気と遮断された施設） */
  summerCool?: boolean;
  /** 屋外の噴水/水場/水深目安（10-30cm等の浅瀬）。waterPlay=true で使う補助情報 */
  waterDepth?: string;
  // ---- 子連れ向け必須設備情報 ----
  /**
   * 子連れで訪問する前に必ず知りたい設備情報。
   * UI ではどの施設にも統一して表示し、未確認なら「公式サイトでご確認ください」と注記する。
   * 'yes' = あり、'no' = なし、未指定 = 未確認（unknown 扱い）
   */
  facilities?: {
    /** 多目的トイレ/ベビーカーで入れるトイレ */
    bathroom?: 'yes' | 'no';
    /** おむつ替えシート/台 */
    diaperChange?: 'yes' | 'no';
    /** 授乳室・授乳スペース */
    nursingRoom?: 'yes' | 'no';
    /** 屋内のキッズスペース/プレイエリア */
    kidsSpace?: 'yes' | 'no';
    /** ベビーカー貸出（無料/有料問わず） */
    strollerRental?: 'yes' | 'no';
    /** 補足メモ（「2階のみ」「土日は予約優先」など、運営者が現地で確認した一言） */
    note?: string;
  };
  // ---- 駅近フラグ（A+B：駅×施設の橋渡し）----
  /**
   * 最寄り駅 slug（lib/tokyo-stations.ts / kansai-stations.ts /
   * kanagawa-stations.ts / saitama-chiba-stations.ts のいずれか）。
   * 駅ページから「近隣のおでかけスポット」セクションで参照される。
   */
  nearestStation?: string;
  /** 最寄り駅からの徒歩分数（公式情報・取材記事ベース） */
  walkMinutes?: number;
  // ---- 公園遊具タグ ----
  /**
   * 公園内に設置されている遊具タイプ。park カテゴリで使うフラグ。
   * - large-slide: 大型滑り台（ジャンボ滑り台/巨大滑り台）
   * - long-slide: ロングすべり台（ローラー含む50m〜）
   * - fuwafuwa: ふわふわドーム/エアトランポリン
   * - athletic: アスレチック（複合遊具）
   * - tarzan: ターザンロープ/ジップライン
   * - climbing: クライミングウォール/ボルダリング
   * - spider-net: クモの巣ネット/ロープジム
   * - swing: ブランコ（複数または大型）
   * - sandbox: 砂場
   * - bbq: BBQエリア
   * - cycling: サイクリングコース/レンタサイクル
   * - mini-train: 子供向けミニ電車・パークトレイン
   */
  playgroundFeatures?: PlaygroundFeature[];
  // ---- 運営者の一次情報（実際に子連れで訪問して記録）----
  kidReport?: KidReport;
};

/** 47都道府県分のスポットマップ。不足県は一般的な推奨のみ。 */
export const SPOTS: Partial<Record<AreaSlug, Spot[]>> = {
  // ===== 北海道・東北 =====
  hokkaido: [
    {
      name: '旭山動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '旭川市', note: '行動展示で動物の動きが間近、雪の中のペンギン散歩も有名', budget: 'low',
      pricing: { adult: '1,000円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '冬季（12-3月）限定のペンギン散歩は11時・14時半頃、開始30分前に場所取り推奨',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '札幌市円山動物園', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '札幌市', note: '屋内展示も多く悪天候でも遊べる', budget: 'low',
      pricing: { adult: '800円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内展示多く冬・雨の日でも楽しめる。円山公園（桜の名所）と徒歩5分',
    },
    {
      name: 'のぼりべつクマ牧場', category: 'zoo', place: 'outdoor', ages: ['4-6'], city: '登別市', note: 'ロープウェイで山頂へ、ヒグマに餌やり体験', budget: 'mid',
      pricing: { adult: '3,000円（ロープウェイ込）', elementary: '1,500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '登別温泉と組み合わせて1泊コース。天気悪いとロープウェイ運休の可能性あり、事前確認を',
    },
    {
      name: 'サンピアザ水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '札幌市', note: '駅直結、コンパクトで小さい子も疲れない', budget: 'low',
      pricing: { adult: '1,000円', elementary: '400円', preschool: '200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '新さっぽろ駅直結、1時間で回れる手頃なサイズ。小さい子連れで疲れない',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '北海道こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '砂川市', note: '世界の七不思議を再現した遊具群', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、有料遊具（乗り物各100-200円）のみ任意。砂川ハイウェイオアシス隣接',
    },
  ],
  aomori: [
    {
      name: '浅虫水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', note: 'イルカショーとトンネル水槽', budget: 'low',
      pricing: { adult: '1,030円', elementary: '510円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '本州最北の水族館、イルカパフォーマンスは1日3回。青森駅から青い森鉄道で20分',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'The Kids（ザ・キッズ）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', note: '0歳から遊べる全天候型の室内遊び場。大型遊具で全身を使って遊べる', budget: 'low',
      summerCool: true,
    },
    {
      name: 'こどもはっち', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '八戸市', note: '八戸市中心街にある、0歳〜就学前の親子向け屋内施設', budget: 'free',
      summerCool: true,
    },
    {
      name: '八食センター', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '八戸市', note: '約60店舗の市場。忍者テーマの複合遊具がある無料の室内遊び場を併設', budget: 'free',
      summerCool: true,
    },
    {
      name: '八戸公園（こどもの国）', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '八戸市', note: '無料で遊べる遊園地。実際に使われた機関車・消防車の展示もある', budget: 'free',
    },
    {
      name: '新青森県総合運動公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', note: '無料の遊具広場に大型複合遊具。広々とした空間で乳幼児向け遊具も', budget: 'free',
      playgroundFeatures: ['athletic'],
    },
  ],
  iwate: [
    {
      name: '盛岡市動物公園 ZOOMO', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '盛岡市', note: '自然豊かでゾウ・キリンも', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '2023年リニューアルで体験型に進化、盛岡駅からバス35分',
    },
    {
      name: '岩手県立児童館 いわて子どもの森', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '一戸町', note: '雨の日・冬の屋内遊び場の定番', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入館完全無料、大型屋内遊具とアスレチック、雪国の冬に最適',
      summerCool: true,
    },
  ],
  miyagi: [
    {
      name: '仙台うみの杜水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '仙台市', note: 'イルカのダイナミックショーと三陸の海水槽', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,200円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'JR中野栄駅から徒歩15分、シャトルバスあり。イルカパフォーマンスは1日4-5回',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '八木山動物公園 フジサキの杜', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '仙台市', note: '地下鉄でアクセス良好、アフリカ園が人気', budget: 'low',
      pricing: { adult: '480円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '地下鉄東西線八木山動物公園駅直結、駅からスムーズ。園内は坂多めベビーカー必須',
    },
    {
      name: '仙台アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '仙台市', note: '0〜3歳に最適、雨天OK', budget: 'mid',
      pricing: { adult: '2,000〜2,400円', elementary: '2,000〜2,400円', preschool: '2,000〜2,400円（1歳以上全員）', infant: '無料（1歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定入館券制、休日は事前購入必須。1階のショッピングモール部分は無料で入れる',
      summerCool: true,
    },
    {
      name: 'スリーエム仙台市科学館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '仙台市', note: '体験型展示で4歳以上が楽しめる', budget: 'low',
      pricing: { adult: '550円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '地下鉄東西線旭ヶ丘駅から徒歩5分。プラネタリウム別料金250円、小学生以上がおすすめ',
      summerCool: true,
    },
  ],
  akita: [
    {
      name: '秋田市大森山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '秋田市', note: 'ゾウ・キリンに近づける設計', budget: 'low',
      pricing: { adult: '730円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キリンと近接できる数少ない動物園。秋田駅からバスで25分',
    },
    {
      name: '男鹿水族館 GAO', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '男鹿市', note: '日本海の大水槽、シロクマも', budget: 'mid',
      pricing: { adult: '1,300円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本海を望む絶景水族館、ホッキョクグマ「豪太」が人気',
      summerCool: true,
      waterPlay: true,
    },
  ],
  yamagata: [
    {
      name: '加茂水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鶴岡市', note: 'クラゲ展示数世界一、幻想的で静か', budget: 'low',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'クラゲ展示種類数世界一、ギネス記録、直径5mのクラゲ水槽が圧巻',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
  ],
  fukushima: [
    {
      name: 'アクアマリンふくしま', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: 'いわき市', note: '海底トンネルと体験型展示が充実', budget: 'mid',
      pricing: { adult: '1,850円', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'タッチプール、海獣展示、屋外遊び場もあり一日遊べる',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'スパリゾートハワイアンズ', category: 'amusement', place: 'indoor', ages: ['2-3', '4-6'], city: 'いわき市', note: '年中温水プール、雨天・冬もOK', budget: 'high',
      pricing: { adult: '3,570円', elementary: '2,250円', preschool: '1,640円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ウォーターパーク「ウォーターパーク パレス」は小さい子向けプールあり、温泉と組み合わせ1泊2日が王道',
      summerCool: true,
      waterPlay: true,
    },
  ],

  // ===== 関東（ibaraki/tochigi/gunma は下部に詳細版あり）=====
  saitama: [
    {
      name: '東武動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮代町', note: '動物園＋遊園地のハイブリッド', budget: 'mid',
      pricing: { adult: '1,900円（入園のみ）', elementary: '1,000円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物園・遊園地・プール（夏季）の複合施設。0-3歳向けアトラクションも充実',
    },
    {
      name: '鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: 'さいたま市', note: '実車展示と運転シミュレータ、雨天OK', budget: 'mid',
      pricing: { adult: '1,600円', elementary: '600円', preschool: '300円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'てっぱく抽選（シミュレータ）は入館時にエントリー必須。D51運転台は常時体験可',
      summerCool: true,
    },
    {
      name: 'トーベ・ヤンソンあけぼの子どもの森公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: 'ムーミン童話の世界観を再現した無料公園', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キノコ型の小屋が点在する無料公園。春は桜、秋は紅葉。近所の隠れスポット',
      nearby: 'ムーミンバレーパークと合わせて1日',
    },
    {
      name: 'ムーミンバレーパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: '湖畔のテーマパーク、散策も楽しい', budget: 'mid',
      pricing: { adult: '2,800円（1デーパス）', elementary: '1,600円', preschool: '無料（4歳未満）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料（メッツァビレッジ側）、ムーミンバレーパークのみ有料。カフェ・ショップだけなら無料で楽しめる',
    },
    // ===== 商業施設・体験（埼玉）=====
    {
      name: 'ららぽーと富士見', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '富士見市', note: '東武東上線沿線最大級、屋内遊び場併設', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'モーリーファンタジー（屋内遊園地）とノエビアスタジアム（無料広場）',
      summerCool: true,
    },
    {
      name: 'コクーンシティ（さいたま新都心）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: 'さいたま市', note: 'さいたま新都心駅直結', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'コクーン2のキッズエリアと授乳室、駅直結でベビーカー動線最良',
      summerCool: true,
    },
    {
      name: '川越鉄道公園 西武園ゆうえんち', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '所沢市', note: '昭和レトロな世界観、未就学児向け乗り物多数', budget: 'mid',
      pricing: { adult: '4,400円（1日券）', elementary: '3,300円', preschool: '2,200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '2021年リニューアル、ゴジラ・ザ・ライドは身長制限あり。小さい子向けエリアあり',
    },
    {
      name: '埼玉県こども動物自然公園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '東松山市', note: 'カピバラとふれあい、コアラ展示', budget: 'low',
      pricing: { adult: '700円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'カピバラ温泉（冬季）が大人気、彩ポッポ（園内バス）でラクラク移動',
    },
    {
      name: '武蔵丘陵森林公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '滑川町', note: '国営公園、春のチューリップとアスレチック', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '巨大エアートランポリン「ぽんぽこマウンテン」が無料、4月のチューリップが絶景',
      playgroundFeatures: ['athletic'],
    },
    {
      name: 'NACK5スタジアム大宮・大宮公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: 'さいたま市', note: '小動物園と児童遊園地、入園無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '小動物園と児童遊園地（乗り物各150-200円）が無料、桜の名所',
    },
    {
      name: '川越まつり会館＆菓子屋横丁', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '川越市', note: '小江戸川越散策、駄菓子屋巡り', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '菓子屋横丁の駄菓子・芋スイーツが安く、子どもが喜ぶ。蔵造りの街並み散策',
    },
    {
      name: '所沢航空発祥記念館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '所沢市', note: '航空公園駅前、実機展示と大型映像', budget: 'low',
      pricing: { adult: '520円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '実機展示30機以上、未就学児無料。隣接の航空公園も広大',
      summerCool: true,
    },
    {
      name: 'むさしの村', category: 'amusement', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '加須市', note: '幼児向け遊園地と動物ふれあい', budget: 'mid',
      pricing: { adult: '1,400円（入園）', elementary: '750円', preschool: '無料（2歳以下）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '未就学児向けに特化、絶叫マシンなし。フリーパス2,800円が断然お得',
    },
  ],
  chiba: [
    {
      name: '鴨川シーワールド', category: 'aquarium', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '鴨川市', note: 'シャチのショーが圧巻、海岸併設', budget: 'high',
      pricing: { adult: '3,300円', elementary: '2,000円', preschool: '1,300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '日本で唯一シャチのパフォーマンスが見られる。最前列は水しぶきで濡れる、レインコート推奨',
      nearby: '鴨川温泉と合わせて1泊プランが鉄板',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'マザー牧場', category: 'farm', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '富津市', note: '動物と触れ合い＋収穫体験＋ミニ遊園地', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '800円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '春は菜の花・秋はコスモス畑が圧巻。東京湾アクアラインでアクセス良好',
    },
    {
      name: 'ふなばしアンデルセン公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '船橋市', note: '大型遊具とアスレチック、一日遊べる', budget: 'low',
      pricing: { adult: '900円', elementary: '200円', preschool: '100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ボート池・アスレチック・美術館・動物ふれあい全部ある総合公園。春の花、夏の水遊び、秋の紅葉とオールシーズン',
      playgroundFeatures: ['athletic'],
    },
    // ===== 商業施設・体験（千葉）=====
    {
      name: '東京ディズニーランド', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '浦安市', note: '世界的に有名なテーマパーク、ベビーセンター完備', budget: 'high',
      nearestStation: 'maihama',
      walkMinutes: 5,
      pricing: { adult: '7,900〜10,900円', elementary: '4,700〜6,500円', preschool: '4,700〜6,500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ベビーセンター（離乳食レンジ・授乳室・調乳器）が完備、0歳から入園可。日付指定券推奨',
      popular: true,
    },
    {
      name: '東京ディズニーシー', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '浦安市', note: '海をテーマにしたディズニーパーク', budget: 'high',
      nearestStation: 'maihama',
      walkMinutes: 12,
      pricing: { adult: '7,900〜10,900円', elementary: '4,700〜6,500円', preschool: '4,700〜6,500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '2024年「ファンタジースプリングス」開業、未就学児向けにマーメイドラグーンが定番',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '三井アウトレットパーク幕張', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '千葉市', note: '海浜幕張駅徒歩1分、子連れ動線◎', budget: 'low',
      nearestStation: 'kaihimmakuhari',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'モーリーファンタジー（屋内遊園地）と幕張海浜公園が徒歩圏',
      summerCool: true,
    },
    {
      name: 'イオンモール幕張新都心', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '千葉市', note: '日本最大級のイオンモール', budget: 'low',
      nearestStation: 'kaihimmakuhari',
      walkMinutes: 17,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'カンドゥー（職業体験施設、4歳〜）が併設、雨天1日コース可',
      summerCool: true,
    },
    {
      name: 'カンドゥー（イオンモール幕張新都心）', category: 'indoor', place: 'indoor', ages: ['4-6'], city: '千葉市', note: 'キッザニア類似の職業体験', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '4,400円', preschool: '3,400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'キッザニア東京より予約取りやすい、平日午後がベスト',
      summerCool: true,
    },
    {
      name: '航空科学博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '芝山町', note: '成田空港隣接、飛行機の離発着が見える', budget: 'low',
      pricing: { adult: '700円', elementary: '300円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '展望台から成田空港の滑走路一望、フライトシミュレータ体験（300円）も',
      summerCool: true,
    },
    {
      name: '千葉市動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '千葉市', note: '立ちポーズで有名な「風太」のいる動物園', budget: 'low',
      pricing: { adult: '700円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'モノレール「動物公園駅」直結、レッサーパンダ「風太」が今もいる',
    },
    {
      name: '南房総国民休暇村', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '館山市', note: '海水浴・磯遊び・自然観察', budget: 'low',
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '宿泊型施設、夏の磯遊びとマザー牧場・鴨川シーワールドへのハブ',
      waterPlay: true,
    },
    {
      name: '酒々井プレミアム・アウトレット', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '酒々井町', note: '成田空港近く、ベビールーム充実', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '無料キッズプレイランド「アシナガランド」併設、芝生でピクニック可',
      summerCool: true,
    },
    {
      name: 'ふくろうの杜（流山）', category: 'indoor', place: 'indoor', ages: ['4-6'], city: '流山市', note: 'ふくろうカフェ的体験施設', budget: 'mid',
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ふくろうとふれあえる小規模施設、4歳以上推奨',
      summerCool: true,
    },
  ],
  tokyo: [
    {
      name: '上野動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '台東区', note: 'ジャイアントパンダに会える、駅近', budget: 'low',
      nearestStation: 'ueno',
      walkMinutes: 5,
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '平日10時開園直後が狙い目。パンダ舎は整理券配布制のため公式サイトで当日の運用を確認',
      nearby: '上野公園の噴水広場・国立科学博物館と組み合わせて1日コース',
      popular: true,
      kidReport: {
        source: 'visited',
        visitAge: '1.5〜4歳ごろが特に反応が良い（0歳でも散歩需要あり）',
        strollerNote: '貸出ベビーカーあり、基本は回れる。ただし坂、西園・東園の移動、パンダ周辺はかなり混む。ベビーカー置き場はパンダ列付近など一部にあるが、押したまま移動する人も多い。',
        crowdNote: '土日はかなり並ぶので開園直後がおすすめ。パンダ目当ての日は特に混雑する。',
        diaperNote: '園内はかなり整備されていて、多目的トイレも多め。',
        stayNote: '2〜5時間。子によって差が大きい。',
        cautionNote: 'とにかく広く、坂で親が疲れる。子の目線だと動物が見えにくく抱っこが増えがち。夏はかなり暑い。',
      },
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '多摩動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '日野市', note: '広大で歩きがい、ライオンバスが名物', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ベビーカー貸出あり。園内は坂が多いため抱っこ紐併用推奨',
    },
    {
      name: '葛西臨海水族園', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '江戸川区', note: 'マグロの群泳大水槽、広い公園に併設', budget: 'low',
      nearestStation: 'kasai-rinkai-koen',
      walkMinutes: 5,
      pricing: { adult: '700円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '雨の日の平日は空いていてのんびり回れる。ペンギン舎の裏側が穴場',
      nearby: '葛西臨海公園の芝生広場（無料）でピクニックとセット',
      popular: true,
      kidReport: {
        source: 'visited',
        visitAge: '0〜3歳と相性が良い（暗い空間が平気なら0歳でも）',
        strollerNote: '館内はスロープが多くかなり回りやすい。ベビーカー置き場は入口付近にあるが、押したまま回る人も多い。',
        crowdNote: '入場は比較的スムーズで、上野動物園よりかなり楽。',
        diaperNote: 'おむつ替え・授乳設備あり。多目的トイレも比較的使いやすい。',
        stayNote: '1.5〜3時間くらい。隣接の葛西臨海公園と合わせると半日コースになりやすい。',
        cautionNote: '暗くて怖がる子もいる。マグロの大水槽は人が集まりやすい。海風が強い日はかなり寒い。',
      },
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'サンシャイン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '豊島区', note: '屋上「天空のペンギン」が人気、池袋直結', budget: 'mid',
      nearestStation: 'ikebukuro',
      walkMinutes: 10,
      pricing: { adult: '2,600〜2,800円', elementary: '1,300〜1,400円', preschool: '800〜900円（4歳〜）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '公式サイトで日時指定券が購入可能、休日は予約必須レベル',
      nearby: '同ビル内のプラネタリウム・ショッピングモールで雨天1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'キッザニア東京', category: 'indoor', place: 'indoor', ages: ['4-6'], city: '江東区', note: '100種以上の職業体験、人気で予約推奨', budget: 'high',
      nearestStation: 'toyosu',
      walkMinutes: 8,
      pricing: { adult: '2,000〜3,500円', elementary: '4,500〜7,000円', preschool: '4,500〜7,000円', infant: '無料（2歳以下）' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '公式予約サイトで3ヶ月前から受付、平日第2部（16-21時）が比較的取りやすい',
      summerCool: true,
    },
    {
      name: '井の頭恩賜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '武蔵野市', note: '池のボート・動物園・散策、無料で過ごせる', budget: 'free',
      pricing: { adult: '無料（公園入場）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '桜シーズンは朝7-9時が狙い目。ボート（別料金700〜800円/30分）は休日混雑',
      nearby: '吉祥寺駅徒歩5分、ランチは駅前のアトレでベビーカーOKの店多数',
      kidReport: {
        source: 'visited',
        visitAge: '1歳ごろ',
        strollerNote: '池の周りは舗装路が多く基本は回りやすい。一部の砂利道・動物園側の坂・池沿いの細道は押しにくい。',
        crowdNote: 'かなり混む。吉祥寺駅側の入口・ボート周辺・カフェ周辺は昼前〜15時がピーク。朝8〜10時か16時以降が狙い目で、午前中はかなり快適。',
        diaperNote: '比較的しっかりある。スポーツ施設管理センターや井の頭自然文化園が使いやすく、授乳室はカーテン式＋おむつ台あり。動物園側はおむつ替え設備が多め。',
        stayNote: '1歳の子で約2時間が目安。',
        cautionNote: '砂利道・坂・池沿いの細道はベビーカーが進みにくいので、抱っこ紐の併用が安心。',
      },
    },
    {
      name: '国立科学博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '台東区', note: '恐竜化石と日本の自然史、雨天の鉄板', budget: 'low',
      nearestStation: 'ueno',
      walkMinutes: 5,
      pricing: { adult: '630円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '特別展開催中は混雑、常設展目当てなら比較的空いている。ベビーカーOK',
      summerCool: true,
    },
    {
      name: 'アネビートリムパーク（ららぽーと各所等）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '複数', note: 'ヨーロッパ遊具の屋内パーク、0-3歳に最適', budget: 'mid',
      pricing: { adult: '600円（保護者）', preschool: '1,200円（平日フリーパス）', infant: '600円（6ヶ月〜）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '雨の日の休日は整理券配布で入場制限、平日午前がベスト',
      summerCool: true,
    },
    // ===== 商業施設・モール（東京）=====
    {
      name: '玉川高島屋S・C', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '世田谷区', ward: '世田谷区', note: '本館と南館でベビー設備充実、屋上庭園で気分転換', budget: 'low',
      nearestStation: 'futako-tamagawa',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '南館7階に授乳室・キッズトイレ・離乳食ルームが集約。屋上庭園「パンとエスプレッソとガーデン」は子連れに人気',
      nearby: '二子玉川駅徒歩1分、二子玉川公園と組み合わせ',
      summerCool: true,
    },
    {
      name: '二子玉川ライズ・ショッピングセンター', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '世田谷区', ward: '世田谷区', note: '全館ベビーカー動線完備、ルーフガーデンで休憩可', budget: 'low',
      nearestStation: 'futako-tamagawa',
      walkMinutes: 2,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'タウンフロント4階のベビールームと、リボン通り屋外エリアで雨でも晴れでも回遊しやすい',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        kidsSpace: 'yes',
      },
    },
    {
      name: '麻布台ヒルズ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '港区', ward: '港区', note: '2023年開業、ベビールーム複数で乳児連れに優しい', budget: 'low',
      nearestStation: 'kamiyacho',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '中央広場「ヒルズプラザ」の芝生で休憩、屋内動線でベビーカーOK',
      summerCool: true,
    },
    {
      name: 'IKEA Tokyo-Bay（船橋）', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '船橋市', note: 'スモーランド（無料一時預かり）と広いレストラン', budget: 'low',
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'スモーランドは身長条件あり（おむつ外れ・身長100-135cm）、1時間無料で利用可',
      summerCool: true,
    },
    {
      name: '日本橋三越本店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '中央区', ward: '中央区', note: '7階「こどもの街」とベビー休憩室が手厚い', budget: 'low',
      nearestStation: 'mitsukoshimae',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '本館7階のベビー休憩室は授乳室・調乳器・離乳食レンジ完備、土日も比較的空いている',
      summerCool: true,
    },
    {
      name: 'GINZA SIX', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '中央区', ward: '中央区', note: '屋上庭園「GINZA SIX ガーデン」で芝生休憩可', budget: 'low',
      nearestStation: 'ginza',
      walkMinutes: 2,
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4階に広めのベビールーム、屋上庭園は無料開放で都心の散歩スポット',
      summerCool: true,
    },
    {
      name: '渋谷スクランブルスクエア', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '渋谷区', ward: '渋谷区', note: '駅直結、SHIBUYA SKYは4歳以上におすすめ', budget: 'mid',
      nearestStation: 'shibuya',
      walkMinutes: 1,
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'SHIBUYA SKYは事前予約推奨、ベビーカーは展望台前で預ける必要あり',
      summerCool: true,
    },
    {
      name: 'KITTE丸の内', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '千代田区', ward: '千代田区', note: '東京駅直結、屋上庭園から駅が見える', budget: 'free',
      nearestStation: 'tokyo',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '屋上庭園「KITTEガーデン」は無料、東京駅丸の内駅舎を間近に見られる電車好きキッズの聖地',
      summerCool: true,
    },
    {
      name: '東京ミッドタウン（六本木）', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '港区', ward: '港区', note: '芝生広場と屋内モール、通年で過ごせる', budget: 'low',
      nearestStation: 'roppongi',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ミッドタウン・ガーデンの芝生でピクニック、冬はイルミネーション、夏は水遊び（噴水）',
      summerCool: true,
    },
    {
      name: '東京ミッドタウン日比谷', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '千代田区', ward: '千代田区', note: '日比谷公園隣接、6階パークビューガーデン', budget: 'low',
      nearestStation: 'hibiya',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'mid' },
      hiddenTip: '6階の屋上庭園は無料で日比谷公園を一望、屋内ベビールームも完備',
      summerCool: true,
    },
    {
      name: 'ダイバーシティ東京プラザ', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '実物大ガンダム立像、お台場の老舗モール', budget: 'low',
      nearestStation: 'daiba',
      walkMinutes: 5,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '夜のガンダム演出（19時/19時半/20時）は無料、フェスティバル広場で休憩しやすい',
      summerCool: true,
    },
    {
      name: 'アクアシティお台場', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '港区', ward: '港区', note: 'レインボーブリッジを望むモール、ベビールーム複数', budget: 'low',
      nearestStation: 'odaiba-kaihinkoen',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '海側のデッキで景色＋写真、ベビーカー貸出（無料）あり',
      summerCool: true,
    },
    {
      name: 'グランベリーパーク（南町田）', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '町田市', note: 'スヌーピーミュージアム併設、屋外型モール', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '隣接の鶴間公園（無料）で芝生遊び、駅直結でベビーカー動線最良',
      nearby: 'スヌーピーミュージアム＋鶴間公園で1日コース',
      summerCool: true,
    },
    {
      name: '東京ソラマチ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '墨田区', ward: '墨田区', note: 'スカイツリー併設、子連れ動線が広い', budget: 'low',
      nearestStation: 'oshiage',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4階「すみだ水族館」とプラネタリウム、7階のベビールームが広め',
      summerCool: true,
    },
    {
      name: 'ららぽーと立川立飛', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '立川市', note: '駅直結、ベビーカーで全館回遊可能', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '2階の「あそびにキッチン」やキッズスペース、1階のベビールームが広い',
      summerCool: true,
    },
    {
      name: 'イオンモールむさし村山', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '武蔵村山市', note: '都内有数の大型モール、屋内遊び場も併設', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '無料キッズスペース＋有料のモーリーファンタジー（屋内遊園地）併設',
      summerCool: true,
    },
    {
      name: 'ららテラス武蔵小杉', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '川崎市', note: '駅直結、コンパクトで子連れ動線◎', budget: 'low',
      nearestStation: 'musashi-kosugi',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'グランツリー武蔵小杉と合わせて回遊しやすい、3階のキッズスペース無料',
      summerCool: true,
    },
    {
      name: '吉祥寺アトレ・キラリナ京王吉祥寺', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '武蔵野市', note: '駅直結、井の頭公園に近く子連れランチ充実', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'アトレ吉祥寺東館にベビールーム、井の頭公園散歩前後に立ち寄りやすい',
      summerCool: true,
    },
    {
      name: 'マルイファミリー溝口', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '川崎市', note: '駅直結で「ファミリー」と名がつく通り子育て層向き', budget: 'low',
      nearestStation: 'mizonokuchi',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '4階のキッズフロア、ベビーカー貸出と授乳室の場所が分かりやすい',
      summerCool: true,
    },
    {
      name: 'ルミネ町田', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '町田市', note: '駅直結のファッション系モール、子連れ動線あり', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ルミネ7階のベビー休憩室は授乳・調乳器・離乳食レンジ完備で本格的',
      summerCool: true,
    },

    // ===== 屋内遊び場（東京）=====
    {
      name: 'ASOBono!（東京ドームシティ アソボーノ）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '文京区', ward: '文京区', note: '都内最大級の屋内遊び場、雨の日の鉄板', budget: 'mid',
      nearestStation: 'korakuen',
      walkMinutes: 3,
      pricing: { adult: '1,000円', preschool: '1,000円（6ヶ月〜小学生）', infant: '無料（6ヶ月未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'プラレールエリア・ボールプール・ままごとエリアが揃う。土日は1日券（1,800円）と整理券制併用',
      popular: true,
      kidReport: {
        source: 'visited',
        visitAge: '1〜5歳ごろが特に楽しめる（0歳専用エリアあり）',
        strollerNote: '館内はエレベーターありで回れるが、休日はかなり混むので、押し続けるより入口近くのベビーカー置き場に置いて遊ぶスタイルが現実的。',
        crowdNote: '休日は入場で並ぶ。開場直後がかなり重要で、昼前から一気に混む。',
        diaperNote: 'かなり充実。ラクーア周辺も含めて赤ちゃん設備が強い。',
        stayNote: '1.5〜4時間くらい。',
        cautionNote: '土日はかなりカオス。ハイハイ期の子は踏まれないよう注意。休日午後は人密度が高い。雨の日の逃げ場として非常に人気。',
      },
      summerCool: true,
    },
    {
      name: '東京おもちゃ美術館', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '新宿区', ward: '新宿区', note: '木のおもちゃで遊べる体験型ミュージアム', budget: 'mid',
      pricing: { adult: '1,100円', elementary: '800円', preschool: '800円（6ヶ月〜）', infant: '無料（6ヶ月未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '四谷の旧校舎を活用、木のぬくもりに包まれた空間。日時指定予約制で混雑が緩やか',
      summerCool: true,
    },
    {
      name: 'レゴランド・ディスカバリー・センター東京', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: 'お台場、3-10歳向けの屋内レゴ施設', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '2,800円', preschool: '2,800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'デックス東京ビーチ内、平日朝一が空いている。WEB事前購入で割安',
      summerCool: true,
    },
    {
      name: 'サンリオピューロランド', category: 'amusement', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '多摩市', note: '全天候型インドアテーマパーク', budget: 'mid',
      pricing: { adult: '3,600〜4,900円', elementary: '2,500〜3,800円', preschool: '2,500〜3,800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '完全屋内型、ベビーカー貸出あり。アフタヌーンパス（14時〜）が割安',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'ファンタジーキッズリゾート お台場', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '江東区', ward: '江東区', note: 'ふわふわ遊具・砂遊び・乗り物が揃う', budget: 'mid',
      pricing: { adult: '1,200〜1,800円', preschool: '1,200〜1,800円（6ヶ月〜）', infant: '無料（6ヶ月未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ヴィーナスフォート跡地の東京ベイ有明ワシントンホテル近辺、平日フリーパス推奨',
      summerCool: true,
    },
    {
      name: 'キドキドよみうりランド店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '稲城市', note: 'ボーネルンド運営、よみうりランド内', budget: 'mid',
      pricing: { adult: '600円', preschool: '1,500円（30分＋延長）', infant: '600円（6ヶ月〜）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'よみうりランド入園料別、雨天時の屋内避難先として便利',
      summerCool: true,
    },
    {
      name: 'スモールワールズTOKYO', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '世界最大級のミニチュア・テーマパーク', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,900円', preschool: '1,900円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '有明、写真映え抜群。完全屋内で雨天OK、ベビーカー入場可',
      summerCool: true,
    },
    {
      name: '科学技術館（北の丸公園）', category: 'museum', place: 'indoor', ages: ['4-6'], city: '千代田区', ward: '千代田区', note: '体験型展示で4歳以上が楽しめる科学館', budget: 'low',
      nearestStation: 'kudanshita',
      walkMinutes: 7,
      pricing: { adult: '950円', elementary: '500円', preschool: '500円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '北の丸公園内、皇居散歩と組み合わせやすい。ボタン・ハンドル操作の体験展示が多い',
      summerCool: true,
    },
    {
      name: '日本科学未来館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '江東区', ward: '江東区', note: 'お台場、ASIMOやGeo-Cosmosが目玉', budget: 'low',
      nearestStation: 'telecom-center',
      walkMinutes: 4,
      pricing: { adult: '630円', elementary: '210円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ドームシアター（プラネタリウム的）は別料金、当日整理券。平日午前が狙い目',
      summerCool: true,
    },
    {
      name: 'がすてなーに ガスの科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '豊洲、入館無料の体験型科学館', budget: 'free',
      nearestStation: 'toyosu',
      walkMinutes: 6,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '完全無料、豊洲駅徒歩6分。ららぽーと豊洲と組み合わせて雨天1日コース',
      nearby: 'ららぽーと豊洲＋アネビートリムパークと組み合わせ',
      summerCool: true,
    },
    {
      name: 'パナソニックセンター東京 AkeruE', category: 'museum', place: 'indoor', ages: ['4-6'], city: '江東区', ward: '江東区', note: '有明、創造体験型ミュージアム', budget: 'low',
      nearestStation: 'ariake',
      walkMinutes: 2,
      pricing: { adult: '500円', elementary: '無料（18歳以下）', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '18歳以下無料、ものづくり体験ワークショップが豊富',
      summerCool: true,
    },
    {
      name: 'ベビーパーク KIDS PARK（複数）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '複数', note: '0-3歳特化の屋内遊び場', budget: 'mid',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '0-3歳特化のため4歳以上の兄姉がいる家族はやや物足りない場合あり',
      summerCool: true,
    },
    {
      name: '東京都現代美術館 こどもアトリエ', category: 'museum', place: 'indoor', ages: ['4-6'], city: '江東区', ward: '江東区', note: '木場公園隣接、子ども向けプログラムあり', budget: 'low',
      nearestStation: 'kiyosumi-shirakawa',
      walkMinutes: 9,
      pricing: { adult: '500円（コレクション展）', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'コレクション展は中学生以下無料、木場公園と合わせて半日コース',
      nearby: '木場公園と組み合わせ',
      summerCool: true,
    },
    {
      name: 'すみだ水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '墨田区', ward: '墨田区', note: 'スカイツリータウン内、ベビーカー入場可', budget: 'mid',
      nearestStation: 'oshiage',
      walkMinutes: 7,
      pricing: { adult: '2,500円', elementary: '1,200円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ベビーカーのまま入場OK、屋内型で雨天最適。ペンギン水槽が大人気',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'マクセル アクアパーク品川', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '港区', ward: '港区', note: '品川駅徒歩2分、音と光の演出', budget: 'mid',
      nearestStation: 'shinagawa',
      walkMinutes: 2,
      pricing: { adult: '2,500円', elementary: '1,300円', preschool: '800円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'イルカパフォーマンスの照明演出が圧巻、品川プリンスホテル内アクセス良好',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'カワスイ 川崎水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '川崎市', note: '川崎駅直結、世界の淡水魚展示', budget: 'mid',
      nearestStation: 'kawasaki',
      walkMinutes: 1,
      pricing: { adult: '2,000円', elementary: '1,200円', preschool: '600円（未就学児）', infant: '無料（3歳未満）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '川崎ルフロン10階、駅直結で雨天最強。アマゾン川エリアが見応えあり',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'トリックアートミュージアム高尾山', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '八王子市', note: '高尾山口駅前、屋内で写真映え', budget: 'low',
      pricing: { adult: '1,400円', elementary: '800円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '高尾山ハイキング前後の雨宿りスポットとして最適',
      summerCool: true,
    },
    {
      name: '東京都水の科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '有明、入館無料の体験型施設', budget: 'free',
      nearestStation: 'kokusai-tenjijo',
      walkMinutes: 8,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '完全無料、水の循環体験が楽しい。有明スポーツセンター隣接で1日コース',
      summerCool: true,
    },
    {
      name: '東京消防庁 消防博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '新宿区', ward: '新宿区', note: '四谷三丁目駅直結、入館無料', budget: 'free',
      nearestStation: 'yotsuya-sanchome',
      walkMinutes: 1,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '消防車・ヘリコプター展示、消防士なりきり体験が無料で楽しい',
      summerCool: true,
    },
    {
      name: '地下鉄博物館（葛西）', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '江戸川区', ward: '江戸川区', note: '葛西駅高架下、運転シミュレータあり', budget: 'low',
      nearestStation: 'kasai',
      walkMinutes: 1,
      pricing: { adult: '220円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '電車好きキッズの聖地、運転シミュレータ無料、220円で1日遊べる',
      summerCool: true,
    },
    {
      name: 'JAL工場見学 SKY MUSEUM（羽田）', category: 'museum', place: 'indoor', ages: ['4-6'], city: '大田区', ward: '大田区', note: '飛行機の整備工場が見学できる', budget: 'free',
      nearestStation: 'shin-seibijo',
      walkMinutes: 2,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '完全予約制で6ヶ月前から受付、人気で土日は瞬殺。平日午後が比較的取りやすい',
      summerCool: true,
    },
    {
      name: 'ANA機体工場見学（羽田）', category: 'museum', place: 'indoor', ages: ['4-6'], city: '大田区', ward: '大田区', note: 'ANAの整備工場見学、無料', budget: 'free',
      nearestStation: 'shin-seibijo',
      walkMinutes: 15,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4歳以上対象、完全予約制。JALと同じく半年前受付',
      summerCool: true,
    },

    // ===== 公園（東京）=====
    {
      name: '砧公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '世田谷区', ward: '世田谷区', note: '広大な芝生広場とみんなのひろば（遊具）', budget: 'free',
      nearestStation: 'seijogakuen-mae',
      walkMinutes: 15,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'みんなのひろばはバリアフリー設計の大型遊具、ベビーカーでアクセス可。世田谷美術館併設',
      popular: true,
    },
    {
      name: '駒沢オリンピック公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '世田谷区', ward: '世田谷区', note: 'チリリンランド（自転車練習場）と大型遊具', budget: 'free',
      nearestStation: 'komazawa-daigaku',
      walkMinutes: 15,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'チリリンランド（自転車3歳〜）は無料貸出、補助輪外しの練習に最適',
      kidReport: {
        source: 'visited',
        visitAge: '0歳の散歩〜4歳ごろ（歩き始め前後に特に活躍）',
        strollerNote: 'かなり良い。道幅が広く舗装もきれいで段差が少ない。ただしサイクリングコース横やランナーが多い時間帯は注意。',
        crowdNote: '午前〜昼は人が多めだが、広いので圧迫感は少ない。朝8〜10時か夕方が狙い目。',
        diaperNote: '公園管理所周辺・売店近く・体育館側に多目的トイレあり。授乳設備は簡易的なので、車内やケープを使う人も多い。',
        stayNote: '0〜1歳で1.5〜3時間。2歳以降は遊具＋自転車で半日コースになりやすい。',
        cautionNote: '自転車のスピードが速い人がいるので動線に注意。真夏はかなり暑く、遊具エリアは休日混雑する。',
      },
      playgroundFeatures: ['athletic'],
    },
    {
      name: '小金井公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '小金井市', note: '園路が広くフラットでベビーカーが快適、江戸東京たてもの園を併設', budget: 'free',
      pricing: { adult: '無料（公園入場）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '井の頭公園より道幅が広く人が分散するので、ベビーカーでもストレスが少ない',
      kidReport: {
        source: 'visited',
        visitAge: '1歳ごろ',
        strollerNote: 'かなり優秀。園路が広くフラットで、井の頭公園より道幅が広く人も分散するのでストレスが少ない。芝生エリアは押しにくいが、メインの導線は問題なし。',
        crowdNote: '広いので「激混み感」は井の頭より弱い。ただし遊具周辺・桜の時期・BBQエリアは混む。朝9〜10時か15時以降が狙い目。',
        diaperNote: 'サービスセンターや江戸東京たてもの園周辺に授乳・おむつ替えあり。多目的トイレやビジターセンターが使いやすい。',
        stayNote: '長く居られるタイプ。0〜1歳でもピクニック・散歩・シート遊びで2〜4時間。2歳を超えると半日〜1日コースになりやすい。',
        cautionNote: '夏は日陰が少ないエリアがある。とにかく広いので親が疲れやすく、自転車エリアの近くは要注意。遊具は休日かなり混む。',
      },
    },
    {
      name: '木場公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '江東区', ward: '江東区', note: 'ふれあい広場と都市緑化植物園', budget: 'free',
      nearestStation: 'kiba',
      walkMinutes: 5,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '木場公園大橋からの眺めが良い、東京都現代美術館と組み合わせやすい',
      nearby: '東京都現代美術館',
    },
    {
      name: '国営昭和記念公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '立川市', note: '都内最大級、こどもの森・水遊び広場', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'こどもの森のふわふわドームと雲の海（巨大トランポリン）が大人気。レンタサイクル必須級の広さ',
      popular: true,
      kidReport: {
        source: 'visited',
        visitAge: '0歳〜小学生まで（年齢を問わず使いやすい）',
        strollerNote: '最強クラス。園路が広くスロープが多く段差が少ない。レンタルベビーカーもあり。芝生や日本庭園側は少しガタつく。',
        crowdNote: '広すぎて全体には分散されるが、ふわふわドーム・水遊び・花イベントは激混み。開園直後が狙い目。',
        diaperNote: 'かなり充実。授乳室・おむつ台が多く、赤ちゃん連れへの配慮が強い。',
        stayNote: '普通に半日〜1日。0歳でもピクニックで3〜5時間は過ごせる。',
        cautionNote: 'とにかく広く親が疲れる。西立川口からの入園がかなり楽。夏は暑さ対策が必須。',
      },
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    // ===== 運営者が実際に子連れで訪問したスポット（kidReport は lib/kid-reports.ts から name 一致でマージ）=====
    {
      name: '石神井公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '練馬区', ward: '練馬区', note: '2つの池を囲む緑地、ボートと木陰の散策路', budget: 'free',
    },
    {
      name: '野川公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '調布市', note: '野川沿いの広大な自然公園、自然観察園とわき水', budget: 'free',
    },
    {
      name: '武蔵野公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '府中市', note: '野川沿いの自然豊かな公園、苗圃とくじら山', budget: 'free',
    },
    {
      name: '府中の森公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '府中市', note: '大型遊具と芝生広場、府中市美術館に隣接', budget: 'free',
      playgroundFeatures: ['athletic'],
    },
    {
      name: '武蔵国分寺公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '国分寺市', note: '円形広場と霧の噴水、広い芝生でのんびり', budget: 'free',
      waterPlay: true,
    },
    {
      name: '神代植物公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3'], city: '調布市', note: 'バラ園と大温室、舗装された散策路でベビーカー快適', budget: 'low',
    },
    {
      name: '林試の森公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '品川区', ward: '品川区', note: '巨木と木陰が多い緑地、夏はじゃぶじゃぶ池', budget: 'free',
      nearestStation: 'musashi-koyama',
      walkMinutes: 10,
      waterPlay: true,
    },
    {
      name: '多摩六都科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '西東京市', note: '世界最大級のプラネタリウムと体験型展示', budget: 'low',
      summerCool: true,
    },
    {
      name: '杉並アニメーションミュージアム', category: 'museum', place: 'indoor', ages: ['4-6'], city: '杉並区', ward: '杉並区', note: '日本のアニメの歴史を学べる体験型ミュージアム、入館無料', budget: 'free',
      summerCool: true,
    },
    {
      name: '0123吉祥寺・0123はらっぱ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '武蔵野市', note: '0〜3歳の親子のための武蔵野市の屋内施設', budget: 'free',
      summerCool: true,
    },
    {
      name: '京王あそびの森 HUGHUG', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '日野市', note: '高幡不動駅前の屋内遊び場、大型ネット遊具が名物', budget: 'mid',
      summerCool: true,
    },
    {
      name: 'しながわ水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '品川区', ward: '品川区', note: 'トンネル水槽とイルカショー、しながわ区民公園内', budget: 'low',
      nearestStation: 'omori-kaigan',
      walkMinutes: 8,
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '板橋区立こども動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '板橋区', ward: '板橋区', note: 'モルモットふれあいとポニー乗馬、入園無料', budget: 'free',
    },
    {
      name: '江戸川区自然動物園（行船公園）', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '江戸川区', ward: '江戸川区', note: '行船公園内のふれあい動物園、入園無料', budget: 'free',
    },
    {
      name: '足立区生物園', category: 'zoo', place: 'indoor', ages: ['2-3', '4-6'], city: '足立区', ward: '足立区', note: '昆虫から大型動物まで、屋内中心で雨の日もOK', budget: 'low',
      summerCool: true,
    },
    {
      name: '江戸東京たてもの園', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '小金井市', note: '小金井公園内、復元建造物を歩いて見学できる野外博物館', budget: 'low',
      summerCool: true,
    },
    {
      name: '京王れーるランド', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '日野市', note: '多摩動物公園駅前、運転シミュレーターとプラレール', budget: 'low',
      summerCool: true,
    },
    {
      name: '府中市郷土の森博物館', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '府中市', note: '復元建物とプラネタリウム、梅園と自然観察', budget: 'low',
      summerCool: true,
    },
    {
      name: '葛西臨海公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '江戸川区', ward: '江戸川区', note: '水族園併設、芝生広場と観覧車', budget: 'free',
      nearestStation: 'kasai-rinkai-koen',
      walkMinutes: 1,
      pricing: { adult: '無料（公園）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '葛西臨海水族園とセット、観覧車（700円）は0歳から乗れる',
      nearby: '葛西臨海水族園',
    },
    {
      name: '浮間公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '板橋区', ward: '板橋区', note: '浮間舟渡駅前、池と風車のある親水公園', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'JR埼京線浮間舟渡駅徒歩1分、釣り場と幼児プール（夏）あり',
    },
    {
      name: '善福寺公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '杉並区', ward: '杉並区', note: '上下2つの池、ボートと自然観察', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '井の頭公園より空いている、ボート（700円/60分）でゆったり過ごせる',
    },
    {
      name: '光が丘公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '練馬区', ward: '練馬区', note: '都内有数の広さ、芝生広場とアスレチック', budget: 'free',
      nearestStation: 'hikarigaoka',
      walkMinutes: 8,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '60ha超の広さ、バーベキュー広場（要予約）も併設',
      playgroundFeatures: ['athletic'],
    },
    {
      name: '水元公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '葛飾区', ward: '葛飾区', note: '水郷の景観、菖蒲園が見事', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '6月の花菖蒲が圧巻、バードサンクチュアリで野鳥観察',
    },
    {
      name: '舎人公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '足立区', ward: '足立区', note: '日暮里舎人ライナー舎人公園駅前、大型遊具', budget: 'free',
      nearestStation: 'toneri-koen',
      walkMinutes: 1,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '園内に「あさひの広場」のローラーすべり台、夏は噴水で水遊び',
      playgroundFeatures: ['athletic'],
    },
    {
      name: '東京港野鳥公園', category: 'park', place: 'outdoor', ages: ['4-6'], city: '大田区', ward: '大田区', note: '大井埠頭、自然観察と探鳥', budget: 'low',
      nearestStation: 'ryutsu-center',
      walkMinutes: 15,
      pricing: { adult: '300円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '都心とは思えない自然、4歳以上の自然観察デビューに最適',
    },
    {
      name: '夢の島公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '熱帯植物館と広い芝生、BBQ可', budget: 'low',
      nearestStation: 'shin-kiba',
      walkMinutes: 5,
      pricing: { adult: '250円（熱帯植物館）', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '熱帯植物館は雨天時の屋内避難に便利、冬も暖かい',
      playgroundFeatures: ['bbq'],
    },
    {
      name: '清澄庭園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '回遊式庭園、池に大きな鯉と亀', budget: 'low',
      nearestStation: 'kiyosumi-shirakawa',
      walkMinutes: 3,
      pricing: { adult: '150円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '150円で本格庭園、鯉の餌（自販機100円）あげで子どもが喜ぶ',
    },
    {
      name: '小石川後楽園', category: 'park', place: 'outdoor', ages: ['4-6'], city: '文京区', ward: '文京区', note: '東京ドーム隣接、季節の花が見事', budget: 'low',
      nearestStation: 'iidabashi',
      walkMinutes: 8,
      pricing: { adult: '300円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '東京ドームシティ・後楽園遊園地とセットで半日コース',
    },
    {
      name: '新宿御苑', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '新宿区', ward: '新宿区', note: '広大な芝生と複数の庭園様式', budget: 'low',
      nearestStation: 'shinjuku-gyoemmae',
      walkMinutes: 5,
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ベビーカー貸出（無料・先着）あり、芝生でピクニック向き。ボール遊び・自転車・ペット入園は禁止',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },

    // ===== 季節限定（東京）=====
    {
      name: '高尾山', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '八王子市', note: 'ケーブルカー利用で未就学児もOK', budget: 'low',
      pricing: { adult: '950円（ケーブルカー往復）', elementary: '480円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '1号路（舗装路）はベビーカーOK、山頂までケーブルカー＋徒歩30分。秋の紅葉と春の桜が絶景',
      popular: true,
    },
    {
      name: '等々力渓谷', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '世田谷区', ward: '世田谷区', note: '都心の自然渓谷、夏は涼スポット', budget: 'free',
      nearestStation: 'todoroki',
      walkMinutes: 3,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '世田谷区内とは思えない渓谷美、夏でも涼しい。階段急で抱っこ紐推奨',
    },
    {
      name: 'お台場海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: 'お台場ビーチで夏の水遊び', budget: 'free',
      nearestStation: 'odaiba-kaihinkoen',
      walkMinutes: 3,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '遊泳は禁止だが水際遊びはOK、シャワー設備あり。夕日とレインボーブリッジの撮影スポット',
      waterPlay: true,
    },
    {
      name: '神田明神', category: 'seasonal', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '千代田区', ward: '千代田区', note: 'お宮参り・七五三の名所', budget: 'free',
      nearestStation: 'akihabara',
      walkMinutes: 7,
      pricing: { adult: '無料（参拝）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '七五三・お宮参りは事前予約推奨。秋葉原から徒歩7分でアクセス良好',
    },
    {
      name: '浅草寺・仲見世', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '台東区', ward: '台東区', note: '初詣・七五三、和菓子も楽しめる', budget: 'free',
      nearestStation: 'asakusa',
      walkMinutes: 5,
      pricing: { adult: '無料（参拝）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'high', holiday: 'high' },
      hiddenTip: '人混みが激しいため抱っこ紐推奨、雷門前の写真は早朝が空いている',
      popular: true,
    },
    {
      name: '明治神宮', category: 'seasonal', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '渋谷区', ward: '渋谷区', note: 'お宮参り・初詣の定番', budget: 'free',
      nearestStation: 'harajuku',
      walkMinutes: 1,
      pricing: { adult: '無料（参拝）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '都心の森散歩としても優秀、お宮参り・七五三の祈祷は事前確認',
    },
    // ===== 追加スポット =====
    {
      name: '東京都美術館 アートスタディルーム', category: 'museum', place: 'indoor', ages: ['4-6'], city: '台東区', ward: '台東区', note: '上野、子ども向けアートワークショップ', budget: 'free',
      nearestStation: 'ueno',
      walkMinutes: 10,
      pricing: { adult: '無料（常設）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '常設展は無料、子ども向けワークショップ「とびらラボ」が定期開催',
      summerCool: true,
    },
    {
      name: '東京国立博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '台東区', ward: '台東区', note: '上野、ファミリー向けプログラムあり', budget: 'low',
      nearestStation: 'ueno',
      walkMinutes: 10,
      pricing: { adult: '1,000円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '高校生以下無料、月1の「親子ギャラリーツアー」が好評',
      summerCool: true,
    },
    {
      name: '国立新美術館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '港区', ward: '港区', note: '六本木、企画展中心の現代美術館', budget: 'low',
      nearestStation: 'nogizaka',
      walkMinutes: 1,
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ベビーカーOK、館内のミュージアムカフェは子連れでも入りやすい',
      summerCool: true,
    },
    {
      name: '東京タワー', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: '展望台と隣接の芝公園', budget: 'mid',
      nearestStation: 'akabanebashi',
      walkMinutes: 5,
      pricing: { adult: '1,500〜3,300円', elementary: '900〜2,200円', preschool: '700〜1,500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4階のフォレストパーク（屋内アスレチック）が雨天時に便利、隣の芝公園も無料',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '東京スカイツリー展望デッキ', category: 'amusement', place: 'indoor', ages: ['2-3', '4-6'], city: '墨田区', ward: '墨田区', note: '世界最高クラスの自立式電波塔', budget: 'mid',
      nearestStation: 'tokyo-skytree',
      walkMinutes: 1,
      pricing: { adult: '2,100〜3,100円', elementary: '950〜1,400円', preschool: '550〜850円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ベビーカーOK、ガラス床は2歳以降に大ヒット。日時指定券で並ばずに済む',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '台場海浜公園 ビーチ', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: 'お台場ビーチで夏の砂遊び', budget: 'free',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '潮干狩りは禁止だが砂遊びはOK、夏のシャワー設備あり',
      waterPlay: true,
    },
    {
      name: '城南島海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '大田区', ward: '大田区', note: '羽田の飛行機が間近に見える', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '飛行機の離発着が真上、ファミリーキャンプ場（要予約）も併設',
    },
    {
      name: '東京臨海広域防災公園 そなエリア東京', category: 'museum', place: 'indoor', ages: ['4-6'], city: '江東区', ward: '江東区', note: '防災体験ツアー、入場無料', budget: 'free',
      nearestStation: 'kokusai-tenjijo',
      walkMinutes: 4,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '完全無料、地震体験ツアー（タブレット式）が貴重。4歳以上に教育的価値',
      summerCool: true,
    },
    {
      name: '東京駅前 行幸通り・丸の内仲通り', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '千代田区', ward: '千代田区', note: '冬のイルミネーション散策', budget: 'free',
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '11月下旬〜2月の丸の内イルミネーションは無料、KITTEと組み合わせ',
    },
    {
      name: 'チームラボプラネッツTOKYO DMM', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '江東区', ward: '江東区', note: '豊洲、没入型デジタルアート', budget: 'mid',
      pricing: { adult: '3,800円', elementary: '1,500円', preschool: '無料（4歳以下）', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4歳以下無料、水のエリアあるので濡れてもいい服装で。日時指定推奨',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
      },
    },
    {
      name: 'チームラボボーダレス（麻布台ヒルズ）', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: '2024年移転オープン、デジタルアート', budget: 'mid',
      pricing: { adult: '3,800円', elementary: '1,500円', preschool: '無料（4歳以下）', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'high', holiday: 'high' },
      hiddenTip: '麻布台ヒルズ内、2024年2月オープン。混雑激しく事前予約必須',
      summerCool: true,
    },
    {
      name: 'ぐりんぱから一足のばして・羽村市動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '羽村市', note: 'コンパクトな動物園、入園料安い', budget: 'low',
      pricing: { adult: '400円', elementary: '50円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'low' },
      hiddenTip: '400円で1時間程度で回れる規模、未就学児無料。羽村駅徒歩15分',
    },
    {
      name: '井の頭自然文化園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '武蔵野市', note: '井の頭公園内、リスの小径が人気', budget: 'low',
      pricing: { adult: '400円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '中学生以下無料、リスの放し飼いコーナーが小さい子に大ヒット',
      nearby: '井の頭恩賜公園',
    },
    {
      name: 'よみうりランド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '稲城市', note: '幼児エリア「らんらんらんど」充実', budget: 'high',
      pricing: { adult: '3,900〜5,800円', elementary: '3,100〜4,600円', preschool: '2,200〜3,400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'らんらんらんどに身長制限ゼロのアトラクション多数、グッジョバ!! も人気',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '日本民家園', category: 'museum', place: 'outdoor', ages: ['4-6'], city: '川崎市', note: '生田緑地内、古民家野外博物館', budget: 'low',
      pricing: { adult: '500円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '高校生以下無料、囲炉裏体験など昔遊び。雨でも軒下で過ごせる',
      nearby: '生田緑地',
      summerCool: true,
    },
    {
      name: '池袋防災館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '豊島区', ward: '豊島区', note: '池袋駅徒歩5分、無料の防災体験', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '無料、地震・消火・煙体験など2時間コース。4歳以上に教育的',
      summerCool: true,
    },
    {
      name: '本所防災館（墨田区）', category: 'museum', place: 'indoor', ages: ['4-6'], city: '墨田区', ward: '墨田区', note: '東京消防庁、無料防災体験ツアー', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '完全無料、4歳以上の防災体験。事前予約でツアー型見学',
      summerCool: true,
    },
    {
      name: 'リトルプラネット（複数）', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '複数', note: '次世代型テーマパーク、デジタル遊び場', budget: 'mid',
      pricing: { adult: '600〜1,200円', preschool: '600〜1,200円（時間制）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '砂遊びARや投影お絵かきなどデジタル＋アナログのハイブリッド体験',
      summerCool: true,
    },
    {
      name: 'モーリーファンタジー（複数イオン内）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '複数', note: 'イオン併設の屋内遊園地', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '時間制プレイ（30分300円〜）と乗り物別料金、無料の試遊コーナーも',
      summerCool: true,
    },
    {
      name: 'グランパーク田町・キッズスペース', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '港区', ward: '港区', note: 'オフィスビル内の無料キッズスペース', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'low' },
      hiddenTip: '田町駅徒歩3分、無料の屋内キッズスペース。空いていて穴場',
      summerCool: true,
    },
    {
      name: '昭和記念公園 こどもの森レインボーハンモック', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '立川市', note: '昭和記念公園内の名物遊具', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'こどもの森内の巨大トランポリン、雨上がりは入場制限あり',
      nearby: '国営昭和記念公園',
    },
    {
      name: '東京競馬場（パドックひろば）', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '府中市', note: '入場200円で家族で楽しめる', budget: 'low',
      pricing: { adult: '200円', elementary: '無料（小学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '200円で大型遊具・芝生・噴水・ポニー（土日のみ）が楽しめる穴場',
    },
    {
      name: '上野恩賜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '台東区', ward: '台東区', note: '動物園・博物館の集合スポット', budget: 'free',
      nearestStation: 'ueno',
      walkMinutes: 1,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '春の桜は屋台＋花見、噴水広場のベンチで休憩。動物園・博物館のハブ',
      nearby: '上野動物園・国立科学博物館・東京国立博物館',
    },
    {
      name: '日比谷公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '千代田区', ward: '千代田区', note: '都心の歴史ある公園、噴水と遊具', budget: 'free',
      nearestStation: 'hibiya',
      walkMinutes: 1,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'mid' },
      hiddenTip: 'にれの木広場の遊具、夏のイベント多数。日比谷ミッドタウンと組み合わせ',
      waterPlay: true,
    },
    {
      name: '代々木公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '渋谷区', ward: '渋谷区', note: '広大な芝生でピクニック', budget: 'free',
      nearestStation: 'harajuku',
      walkMinutes: 3,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'A地区の中央広場でピクニック、B地区のサイクリングコースで自転車練習',
    },
    {
      name: 'お台場 シンボルプロムナード公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '港区', ward: '港区', note: 'お台場の中心、レインボーブリッジ眺望', budget: 'free',
      nearestStation: 'odaiba-kaihinkoen',
      walkMinutes: 5,
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '夏の水遊び広場（無料）、夜のライトアップが美しい',
    },
    {
      name: '東京ドイツ村', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '袖ケ浦市', note: '冬のイルミネーションが関東有数', budget: 'mid',
      pricing: { adult: '1,000円（入園・車1台）', elementary: '500円', preschool: '無料（4歳未満）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '冬のイルミネーション（11-3月）は関東三大イルミネーション、車利用前提',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    {
      name: 'こどもの国（横浜・冬のスケート）', category: 'seasonal', place: 'mixed', ages: ['4-6'], city: '横浜市', note: '冬季限定の屋外スケート場', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '11月〜3月限定、4歳以上のスケートデビューに最適。貸靴あり',
    },
  ],
  kanagawa: [
    {
      name: '横浜・八景島シーパラダイス', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '横浜市', note: '水族館＋遊園地＋海、1日コース', budget: 'high',
      pricing: { adult: '3,300円（水族館のみ）〜5,600円（全施設）', elementary: '2,000〜4,000円', preschool: '1,150〜2,300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ワンデーパス（全施設）が割安。夕方17時以降のナイトパスはさらにお得',
      nearby: '八景島駅直結、1日フルで遊べる',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'よこはま動物園ズーラシア', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '横浜市', note: '世界の気候帯別展示、広大', budget: 'low',
      pricing: { adult: '800円', elementary: '200円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '53ヘクタールの広さ、ベビーカー貸出あり。オカピ・インドライオンが見どころ',
    },
    {
      name: '横浜アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '横浜市', note: 'みなとみらい直結、0-3歳の定番', budget: 'mid',
      nearestStation: 'minato-mirai',
      walkMinutes: 5,
      pricing: { adult: '2,200〜2,600円', elementary: '2,200〜2,600円', preschool: '2,200〜2,600円（1歳以上全員）', infant: '無料（1歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定入館券制、土日は1ヶ月前に売切れも。平日17時以降の半額タイムが狙い目',
      summerCool: true,
    },
    {
      name: '新江ノ島水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '藤沢市', note: '相模湾大水槽とクラゲ展示', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,400円', preschool: '1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカショー最終回（16時台）が空いている。江ノ島観光と組み合わせ',
      nearby: '江ノ島展望台・鎌倉大仏と合わせて1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '箱根彫刻の森美術館', category: 'museum', place: 'outdoor', ages: ['2-3', '4-6'], city: '箱根町', note: '野外彫刻＋子ども向けアート遊具', budget: 'mid',
      pricing: { adult: '2,000円', elementary: '1,000円（小中）', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '「ネットの森」（巨大ハンモック型遊具）が子どもに大人気。箱根登山鉄道彫刻の森駅から徒歩2分',
      nearby: '箱根湯本温泉と合わせて1泊プラン',
      summerCool: true,
    },
    // ===== 商業施設・モール（神奈川）=====
    {
      name: 'MARK IS みなとみらい', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '横浜市', note: '駅直結、屋上ガーデンとキッズエリア', budget: 'low',
      nearestStation: 'minato-mirai',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '4階のキッズエリアと授乳室、屋上「みんなの庭」で芝生休憩',
      summerCool: true,
    },
    {
      name: '横浜ベイクォーター', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '横浜市', note: '横浜駅徒歩7分、海沿いのモール', budget: 'low',
      nearestStation: 'yokohama',
      walkMinutes: 7,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'デッキで電車・船が見える、ベビールームと多目的トイレが各階あり',
      summerCool: true,
    },
    {
      name: 'コレットマーレ桜木町', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '横浜市', note: '桜木町駅直結、映画館とレストラン', budget: 'low',
      nearestStation: 'sakuragicho',
      walkMinutes: 2,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '5階のキッズエリアと授乳室、桜木町駅から徒歩2分',
      summerCool: true,
    },
    {
      name: 'グランツリー武蔵小杉', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '川崎市', note: '武蔵小杉駅徒歩4分、子連れ向け店舗多数', budget: 'low',
      nearestStation: 'musashi-kosugi',
      walkMinutes: 4,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '4階「キッズパーク」屋上庭園とふわふわドーム（無料）、雨でも晴れでも遊べる',
      summerCool: true,
    },
    {
      name: 'テラスモール湘南', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '藤沢市', note: '辻堂駅直結、ファミリー向け大型モール', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '4階「リトルプラネット」（屋内デジタル遊び場）あり、雨天時の避難先',
      summerCool: true,
    },
    {
      name: 'みなとみらい東急スクエア', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '横浜市', note: 'みなとみらい駅直結、子連れ動線◎', budget: 'low',
      nearestStation: 'minato-mirai',
      walkMinutes: 1,
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'みなとみらい線駅直結、横浜美術館も近い',
      summerCool: true,
    },

    // ===== 屋内遊び場・体験（神奈川）=====
    {
      name: '原鉄道模型博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '横浜市', note: '世界最大級のジオラマ、電車好き必訪', budget: 'mid',
      nearestStation: 'yokohama',
      walkMinutes: 5,
      pricing: { adult: '1,200円', elementary: '700円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '横浜駅徒歩5分、世界最大級の鉄道模型ジオラマ。日時指定推奨',
      summerCool: true,
    },
    {
      name: 'カップヌードルミュージアム横浜', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '横浜市', note: 'みなとみらい、オリジナルカップヌードル作り', budget: 'low',
      nearestStation: 'minato-mirai',
      walkMinutes: 8,
      pricing: { adult: '500円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'マイカップヌードルファクトリー（500円/個）の予約は当日整理券、午前狙い目',
      summerCool: true,
    },
    {
      name: '川崎市 藤子・F・不二雄ミュージアム', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '川崎市', note: 'ドラえもんの世界観、登戸駅シャトルバス', budget: 'mid',
      nearestStation: 'noborito',
      walkMinutes: 16,
      pricing: { adult: '1,000円', elementary: '500円', preschool: '400円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '完全予約制（10時/12時/14時/16時の4回入場）、ローソンで前売り購入',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
      },
    },
    {
      name: 'シルク博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '横浜市', note: '横浜開港の歴史、繭から糸取り体験', budget: 'low',
      nearestStation: 'kannai',
      walkMinutes: 8,
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'low' },
      hiddenTip: '繭から糸取り体験（要予約・無料）が珍しい、馬車道駅徒歩3分',
      summerCool: true,
    },
    {
      name: '神奈川県立 生命の星・地球博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '小田原市', note: '小田原、恐竜骨格と地球の歴史', budget: 'low',
      pricing: { adult: '520円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入生田駅徒歩3分、巨大な恐竜骨格と動物剥製。中学生以下無料で良コスパ',
      summerCool: true,
    },
    {
      name: '小田原こどもの森公園わんぱくらんど', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '小田原市', note: '無料の大型公園、SLや遊具豊富', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、汽車（300円/3歳〜）と自然遊具で1日遊べる',
    },
    {
      name: 'こどもの国（横浜）', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '横浜市', note: '広大な丘陵公園、牧場・プール・SL', budget: 'low',
      pricing: { adult: '600円', elementary: '200円', preschool: '200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '東急こどもの国線終点、牧場・プール（夏）・スケート（冬）と通年型',
      popular: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    {
      name: '辻堂海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '藤沢市', note: '夏の交通公園とジャンボプール', budget: 'low',
      pricing: { adult: '無料（公園）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '交通公園で自転車練習無料、夏は本格プール（別料金）併設',
      waterPlay: true,
    },
    {
      name: '湘南台文化センターこども館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '藤沢市', note: '湘南台駅直結、無料の科学体験', budget: 'low',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入館無料、プラネタリウム別料金（大人400円）。雨天時の救世主',
      summerCool: true,
    },
    {
      name: 'はまぎん こども宇宙科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '横浜市', note: '洋光台、プラネタリウムと体験展示', budget: 'low',
      pricing: { adult: '400円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '5階建ての宇宙テーマ館、未就学児無料で良コスパ',
      summerCool: true,
    },
    {
      name: '箱根湯本駅前 旧街道周辺', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '箱根町', note: '日帰り温泉と寄木細工体験', budget: 'mid',
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '箱根登山鉄道で雨天も移動楽、寄木細工体験（畑宿）2歳から可',
    },
    {
      name: '江ノ島水族館前ビーチ・片瀬東浜', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '藤沢市', note: '夏の海水浴、駅近・トイレ完備', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '小田急片瀬江ノ島駅徒歩3分、家族用海の家多数。シャワー有料',
      waterPlay: true,
    },
    {
      name: '生田緑地', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '川崎市', note: '日本民家園・科学館・プラネタリウム', budget: 'low',
      nearestStation: 'noborito',
      walkMinutes: 12,
      pricing: { adult: '500円（民家園）', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '広大な丘陵公園と複数施設の複合、藤子・F・不二雄ミュージアムも隣接',
      nearby: '川崎市 藤子・F・不二雄ミュージアム',
    },
  ],

  // ===== 中部 =====
  niigata: [
    {
      name: '新潟県立自然科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '新潟市', note: '恐竜ロボット・プラネタリウム', budget: 'low',
      pricing: { adult: '580円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内5フロアと屋外遊具で1日遊べる、雨天の鉄板',
      summerCool: true,
    },
    {
      name: 'マリンピア日本海', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '新潟市', note: '日本海側最大級、イルカショー', budget: 'low',
      pricing: { adult: '1,500円', elementary: '600円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本海側最大級、イルカパフォーマンスは1日3-4回',
      summerCool: true,
      waterPlay: true,
    },
  ],
  toyama: [
    {
      name: '魚津水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '魚津市', note: '富山湾の深海魚展示', budget: 'low',
      pricing: { adult: '1,100円', elementary: '550円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '富山湾特有のホタルイカやミラージュランド隣接',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'ミラージュランド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '魚津市', note: '小規模で0-6歳に丁度良い遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各300-500円', preschool: '乗り物各300-500円', infant: '無料（一部乗り物）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、乗り物のみ別料金。小さい子向けアトラクションが揃う',
    },
  ],
  ishikawa: [
    {
      name: 'のとじま水族館', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '七尾市', note: 'ジンベエザメ展示、能登半島の景色も', budget: 'mid',
      pricing: { adult: '1,890円', elementary: '510円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ジンベエザメが日本海側で唯一見られる水族館、能登和倉温泉と組み合わせ',
      summerCool: true,
      waterPlay: true,
    },
  ],
  fukui: [
    {
      name: '福井県立恐竜博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '勝山市', note: '国内最大級の恐竜展示、子どもに大人気', budget: 'low',
      pricing: { adult: '1,000円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定の完全予約制、土日は数ヶ月前から埋まる。恐竜ロボットが圧巻',
      popular: true,
      summerCool: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
      },
    },
    {
      name: '越前松島水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '坂井市', note: 'イルカにタッチできる', budget: 'mid',
      pricing: { adult: '2,200円', elementary: '1,100円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'イルカタッチ＆給餌体験（別料金）、東尋坊から車10分',
      summerCool: true,
      waterPlay: true,
    },
  ],
  shizuoka: [
    {
      name: '富士サファリパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '裾野市', note: '車から動物観察＋ふれあい', budget: 'mid',
      pricing: { adult: '3,200円', elementary: '2,000円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'マイカーorジャングルバス（別料金1,500円/人）、天気悪いとライオン等が屋内、朝一10時開園直後が見応えあり',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '伊豆アニマルキングダム', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '東伊豆町', note: 'ホワイトタイガーに大接近、遊具もあり', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,400円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ホワイトタイガーと至近距離、動物エリア＋遊園地＋プレイゾーンが一体',
    },
    {
      name: '東海大学海洋科学博物館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '静岡市', note: '機械の博物館併設', budget: 'low',
      pricing: { adult: '1,800円（共通券）', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '海洋科学博物館と自然史博物館の共通券でお得、三保の松原もすぐ',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'ぐりんぱ（富士山2合目）', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '裾野市', note: 'シルバニアビレッジ等、小さい子向け', budget: 'mid',
      pricing: { adult: '1,300円（入園のみ）', elementary: '850円', preschool: '無料（3歳以下）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'シルバニアビレッジがあり0-6歳に最適、冬季休業あり要確認',
    },
  ],
  nagano: [
    {
      name: '茶臼山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '長野市', note: 'レッサーパンダ発祥の動物園', budget: 'low',
      pricing: { adult: '600円', elementary: '100円（小中）', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'レッサーパンダの飼育頭数日本有数、春秋が動物が活発',
    },
    {
      name: '軽井沢おもちゃ王国', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '嬬恋村※群馬側', note: '室内プレイスペースとミニ遊園地', budget: 'mid',
      pricing: { adult: '1,300円（入園）', elementary: '900円', preschool: '900円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '11エリアの室内おもちゃ部屋、雨天OK、乗り放題パス（3,300円）が断然お得',
    },
  ],
  gifu: [
    {
      name: '世界淡水魚園水族館 アクア・トトぎふ', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '各務原市', note: '世界最大級の淡水魚水族館', budget: 'mid',
      pricing: { adult: '1,780円', elementary: '880円', preschool: '440円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'オアシスパーク（無料遊具広場）隣接、水族館は所要90分',
      nearby: '河川環境楽園オアシスパーク＋アクア・トト＋観覧車で1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '各務原市民公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '各務原市', note: 'アクア・トトに隣接、併せて1日', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '駐車場無料、芝生広場でピクニック可',
    },
  ],
  shiga: [
    {
      name: '琵琶湖博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '草津市', note: '淡水魚展示と琵琶湖の歴史、広い', budget: 'low',
      pricing: { adult: '800円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '体験型展示「ディスカバリールーム」が人気、水族館と博物館の中間的な施設',
      nearby: '隣接のからすま半島公園で芝生遊び',
      summerCool: true,
    },
    {
      name: 'ブルーメの丘', category: 'farm', place: 'outdoor', ages: ['2-3', '4-6'], city: '日野町', note: '動物ふれあい＋収穫体験＋遊具', budget: 'low',
      pricing: { adult: '1,000円', elementary: '600円', preschool: '300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '季節ごとの収穫体験（いちご・ブルーベリー・芋掘り）がおすすめ',
    },
  ],
  mie: [
    {
      name: '鳥羽水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鳥羽市', note: '飼育種類数日本一、ジュゴン展示', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,600円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本で唯一のジュゴン展示、約1,200種の魚。所要2-3時間',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '志摩スペイン村', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '志摩市', note: 'スペイン村パルケエスパーニャ', budget: 'high',
      pricing: { adult: '5,400円', elementary: '3,600円', preschool: '3,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '他テーマパークに比べて空いていて乗り物に乗りやすい、ナイトチケット（15時〜）2,900円がお得',
    },
  ],
  kagoshima: [
    {
      name: 'いおワールドかごしま水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鹿児島市', note: 'ジンベエザメ展示、桜島も望める', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '350円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桜島をバックにジンベエザメ、イルカパフォーマンスは1日4回',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '平川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '鹿児島市', note: 'コアラ舎と遊園地併設', budget: 'low',
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桜島を望む絶景動物園、遊園地（乗り物100-200円）併設',
    },
  ],
  tochigi: [
    {
      name: '那須どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '那須町', note: '室内外で動物と触れ合える、雨天も楽しい', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '王国ファーム（屋内）と王国タウン（屋外）、園内バス移動あり。雨天でも楽しめる',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '那須ハイランドパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '那須町', note: '小さい子向けアトラクションも多い', budget: 'high',
      pricing: { adult: '1,800円（入園）', elementary: '1,300円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '身長制限のない幼児向けアトラクション多数、1DAYパスポート（5,600円）がお得',
    },
    {
      name: '宇都宮動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宇都宮市', note: '遊園地併設、動物との距離が近い', budget: 'low',
      pricing: { adult: '1,400円（遊園地セット）', elementary: '700円', preschool: '700円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キリンの餌やり100円、動物に近づける小規模動物園の良さ',
    },
    // ===== 体験・季節（栃木）=====
    {
      name: 'あしかがフラワーパーク', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '足利市', note: '大藤と冬のイルミネーションが有名', budget: 'mid',
      pricing: { adult: '400〜2,300円（時期変動）', elementary: '200〜1,200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '4月下旬〜5月上旬の大藤が世界的に有名、未就学児無料。冬のイルミネーション「光の花の庭」も',
      popular: true,
    },
    {
      name: 'ツインリンクもてぎ（モビリティリゾートもてぎ）', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: 'もてぎ町', note: '森と自然のアスレチック、ホンダコレクションホール', budget: 'mid',
      pricing: { adult: '2,000円（入場）', elementary: '1,200円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '森のアスレチック「ITADAKI」「DOKIDOKI」が大人気、ホンダの歴代車展示も',
    },
    {
      name: '日光東照宮・日光江戸村', category: 'seasonal', place: 'mixed', ages: ['2-3', '4-6'], city: '日光市', note: '世界遺産＋江戸時代テーマパーク', budget: 'mid',
      pricing: { adult: '1,300〜5,800円（施設別）', elementary: '650〜3,000円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '江戸村は4歳以上に刺激的、東照宮は文化遺産で大人も楽しめる',
    },
    {
      name: 'りんどう湖ファミリー牧場', category: 'farm', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '那須町', note: '動物ふれあい・乗り物・湖畔散策', budget: 'mid',
      pricing: { adult: '1,600円', elementary: '800円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '0歳から楽しめる動物ふれあいと乗り物、那須エリアの定番',
    },
    {
      name: '宇都宮市子ども総合科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '宇都宮市', note: 'プラネタリウム・体験展示・屋外SL', budget: 'low',
      pricing: { adult: '550円', elementary: '220円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋外展示のSLと宇宙服試着が無料、屋内体験展示も豊富',
      summerCool: true,
    },
  ],
  ibaraki: [
    {
      name: 'アクアワールド茨城県大洗水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大洗町', note: 'サメ展示種数日本一、マンボウも', budget: 'mid',
      pricing: { adult: '2,300円', elementary: '1,100円', preschool: '400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'キッズスペース（1回20分、予約制）が穴場、イルカショー最終回（15-16時）が空いている',
      nearby: '大洗海岸と大洗磯前神社で1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '国営ひたち海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: 'ひたちなか市', note: 'ネモフィラ・コキアの絶景、遊具も充実', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '4月下旬のネモフィラ・10月のコキアはSNS映え絶景、朝8-9時到着推奨',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    // ===== 体験・季節（茨城）=====
    {
      name: '茨城県フラワーパーク', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '石岡市', note: 'バラとダリアの名所、つくば山麓', budget: 'low',
      pricing: { adult: '900〜1,200円（時期変動）', elementary: '400円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '春秋のバラ祭りが圧巻、未就学児無料。アクティブパーク（無料遊具）も併設',
    },
    {
      name: 'つくばエキスポセンター', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: 'つくば市', note: 'つくば駅徒歩5分、プラネタリウムと体験', budget: 'low',
      pricing: { adult: '500円', elementary: '250円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'プラネタリウム別料金、屋外にH-II ロケット実物大模型',
      summerCool: true,
    },
    {
      name: 'JAXA筑波宇宙センター', category: 'museum', place: 'indoor', ages: ['4-6'], city: 'つくば市', note: '宇宙開発の展示館、入館無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '完全無料、実物大ロケット屋外展示。施設見学ツアー（要予約・無料）あり',
      summerCool: true,
    },
    {
      name: '国営ひたち海浜公園 大観覧車', category: 'amusement', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: 'ひたちなか市', note: 'プレジャーガーデン内のミニ遊園地', budget: 'low',
      pricing: { adult: '500円（観覧車）', elementary: '300円', preschool: '300円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '園内別エリア、未就学児向け乗り物多数。海浜公園とセット',
    },
    {
      name: '大洗わくわく科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '大洗町', note: '小規模だが体験型展示が充実', budget: 'low',
      pricing: { adult: '350円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'low' },
      hiddenTip: '大洗水族館の帰りに寄りやすい、未就学児無料',
      summerCool: true,
    },
  ],
  gunma: [
    {
      name: '群馬サファリパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '富岡市', note: '車から動物に餌やりできる', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,400円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'エサやりバス（別料金1,500円）で至近距離で動物と触れ合える',
    },
    {
      name: 'ぐんまこどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '太田市', note: '大型遊具と体験施設、入園無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園・駐車場無料、有料施設（児童館200円、乗り物100円）のみ別料金',
      playgroundFeatures: ['athletic'],
    },
    // ===== 体験・温泉・季節（群馬）=====
    {
      name: '伊香保おもちゃと人形 自動車博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '渋川市', note: '昭和レトロな世界観、駄菓子屋復元', budget: 'mid',
      pricing: { adult: '1,300円', elementary: '900円', preschool: '450円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '伊香保温泉から車5分、おもちゃ・人形・名車の複合館。雨天時の救世主',
      summerCool: true,
    },
    {
      name: 'こんにゃくパーク', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '甘楽町', note: '無料工場見学＋無料こんにゃくバイキング', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '完全無料の工場見学＋バイキング、土日は1時間待ちも。平日推奨',
      summerCool: true,
    },
    {
      name: '群馬県立 ぐんま昆虫の森', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '桐生市', note: '昆虫観察と里山体験', budget: 'low',
      pricing: { adult: '410円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '高校生以下無料、温室の生きたチョウ観察と里山散策で1日',
      summerCool: true,
    },
    {
      name: '富岡製糸場', category: 'museum', place: 'mixed', ages: ['4-6'], city: '富岡市', note: '世界遺産、4歳以上の歴史学習', budget: 'low',
      pricing: { adult: '1,000円', elementary: '250円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '世界遺産だがコンパクトで未就学児無料、1時間程度で回れる',
      summerCool: true,
    },
    {
      name: '草津温泉 湯畑周辺', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '草津町', note: '日本三大名泉、湯もみショー', budget: 'low',
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '湯畑は無料で見学可、熱の湯の湯もみショー（700円）は子どもに人気',
    },
  ],
  yamanashi: [
    {
      name: '富士急ハイランド', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '富士吉田市', note: 'トーマスランドは0-6歳向け', budget: 'high',
      pricing: { adult: '6,000〜8,000円', elementary: '4,400〜6,000円', preschool: '2,100〜3,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'トーマスランドエリアのフリーパスのみ（2,500円）があり、絶叫マシン苦手な家族にも',
    },
    {
      name: '山梨県立富士湧水の里水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '忍野村', note: '淡水魚の水族館、入館料安い', budget: 'low',
      pricing: { adult: '420円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '忍野八海の近く、淡水魚メインで30-60分で回れるサイズ',
      summerCool: true,
      waterPlay: true,
    },
  ],
  aichi: [
    {
      name: 'レゴランド・ジャパン', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '名古屋市', note: '2-12歳ターゲット、駅直結', budget: 'high',
      pricing: { adult: '5,000〜7,900円', elementary: '3,700〜5,800円', preschool: '無料（3歳以下の一部）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '公式サイトで前売り券（最大30%オフ）推奨。平日は待ち時間ほぼなし',
      nearby: '同エリアのメイカーズ・ピア＋シーライフで1日フル',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '名古屋港水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'シャチとベルーガ、屋内広い', budget: 'mid',
      pricing: { adult: '2,030円', elementary: '1,010円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカパフォーマンスは1日3-4回、最終回が空いている。シャチ公開トレーニングは事前確認必須',
      nearby: '南極観測船ふじ（同敷地内、大人300円）と組み合わせ',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '東山動植物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'コアラ・イケメンゴリラ、遊園地併設', budget: 'low',
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '園内は広大で坂多し、抱っこ紐推奨。イケメンゴリラ「シャバーニ」を見るなら午前中',
      nearby: '園内の遊園地（乗り物1回100-200円）で半日延長可',
    },
    {
      name: 'モリコロパーク', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '長久手市', note: '愛・地球博記念公園、広大で無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'サツキとメイの家（有料520円、ジブリ好き必見）は事前予約制。芝生広場は自由にピクニック可',
      nearby: 'ジブリパークと組み合わせ、1日フル',
    },
    {
      name: 'ジブリパーク', category: 'amusement', place: 'mixed', ages: ['4-6'], city: '長久手市', note: 'モリコロパーク内、予約制', budget: 'mid',
      pricing: { adult: '1,500〜3,500円', elementary: '750〜1,750円', preschool: '無料（3歳以下）', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定の完全予約制。各エリア別々のチケットが必要、人気エリアは2-3ヶ月前に抑える',
    },
  ],

  // ===== 関西（mie/shiga は上部に詳細版あり）=====
  kyoto: [
    {
      name: '京都水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: 'オオサンショウウオ、梅小路公園直結', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,200円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカLIVE「キラメキ」は1日3-4回、開園直後が混雑前で狙い目',
      nearby: '梅小路公園＋京都鉄道博物館で半日-1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '京都市動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '岡崎エリア、平安神宮や美術館も近い', budget: 'low',
      pricing: { adult: '750円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '小さめの動物園なのでベビーカーで1時間程度で回れる。南禅寺・平安神宮と組み合わせやすい',
      nearby: '岡崎公園＋ロームシアター＋京都市美術館で大人も楽しめる',
    },
    {
      name: '梅小路公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '水族館＋鉄道博物館のハブ、芝生広場', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '芝生広場でお弁当、チンチン電車（市電展示）も無料で入れる',
      nearby: '京都水族館＋京都鉄道博物館で1日フル',
    },
    {
      name: '京都鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '京都市', note: 'SL展示と運転シミュレータ', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '500円', preschool: '200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'SLスチーム号（別料金300円）は1日4-5便、午前の回が比較的空いている',
      summerCool: true,
    },
  ],
  osaka: [
    {
      name: '海遊館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市', note: 'ジンベエザメの大水槽、世界最大級', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,400円', preschool: '700円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '閉館2時間前（15時以降）が狙い目、ジンベエザメ給餌タイム狙いなら11時/14時半頃',
      nearby: '天保山マーケットプレース（隣接）でランチ＋観覧車で1日コース',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: 'ニフレル', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '「生きるミュージアム」、動物と間近', budget: 'mid',
      pricing: { adult: '2,200円', elementary: '1,100円', preschool: '650円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '万博記念公園駅直結、ベビーカー可。ホワイトタイガーの展示が圧巻',
      nearby: 'EXPOCITYのららぽーと＋観覧車で雨天1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'キッズプラザ大阪', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '大阪市', note: '体験型のこども博物館、雨天OK', budget: 'low',
      pricing: { adult: '1,400円', elementary: '800円', preschool: '500円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '5階「こどもタウン」の実際の店舗そっくりな作りが子どもに大ヒット。平日が圧倒的におすすめ',
      summerCool: true,
    },
    {
      name: '天王寺動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大阪市', note: '都心の動物園、駅近', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'あべのハルカス徒歩圏、JR天王寺駅から直結。春秋の朝夕が動物活発で狙い目',
      nearby: 'てんしば（無料芝生広場）でピクニックとセット',
    },
    {
      name: 'ひらかたパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '枚方市', note: '0-3歳向けエリアもある老舗遊園地', budget: 'mid',
      pricing: { adult: '1,900円（入園）', elementary: '1,100円', preschool: '無料（2歳以下）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '身長90cm以下でも乗れる0-3歳向けアトラクション「ちーたのゆうえんち」が充実。平日なら乗り放題パスなしでも十分',
    },
    {
      name: '万博記念公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '太陽の塔と広大な自然文化園', budget: 'low',
      pricing: { adult: '260円', elementary: '80円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '広大すぎるため端から端まで徒歩30分超。ベビーカー必須、無料のドッグラン併設',
      nearby: 'ニフレル＋EXPOCITYと組み合わせ1日フル',
    },
  ],
  hyogo: [
    {
      name: '神戸どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '神戸市', note: '全天候型、動物と距離が近い', budget: 'mid',
      pricing: { adult: '2,500円', elementary: '1,500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内展示多く雨の日もOK。カピバラやハシビロコウが近い',
      nearby: 'ポートライナー「計算科学センター」駅直結、神戸空港と組み合わせ',
    },
    {
      name: '姫路セントラルパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '姫路市', note: 'サファリ＋遊園地＋プール', budget: 'mid',
      pricing: { adult: '3,800円', elementary: '2,000円', preschool: '1,200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'マイカーサファリ（自家用車で巡回）が人気。夏はプール、冬はアイススケートも併設',
      waterPlay: true,
    },
    {
      name: '須磨シーワールド', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '神戸市', note: '2024年リニューアル、西日本初のシャチ展示', budget: 'mid',
      pricing: { adult: '3,700円', elementary: '1,800円', preschool: '1,100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '2024年6月リニューアル、シャチパフォーマンス人気で事前予約必須',
      nearby: '須磨海浜公園でピクニックセット',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: 'ニジゲンノモリ（淡路島）', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '淡路市', note: 'クレヨンしんちゃんアドベンチャーパーク等', budget: 'mid',
      pricing: { adult: '1,000-3,500円（エリア別）', elementary: '500-2,000円', preschool: '無料〜1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'エリアごとのチケット制、小さい子は「クレヨンしんちゃん」と「ドラゴンクエストアイランド」が楽しめる',
    },
  ],
  nara: [
    {
      name: '奈良公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '奈良市', note: '鹿と触れ合える、東大寺と一緒に', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'シカせんべい（200円）で餌やり体験、2歳以降に。小さい子は怖がる場合あり距離感注意',
      popular: true,
      nearby: '東大寺・興福寺・奈良国立博物館と徒歩圏',
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    {
      name: '生駒山上遊園地', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '生駒市', note: '小さい子向けレトロ遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各400円', preschool: '乗り物各400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、生駒ケーブルで山頂へ。大阪を一望できる絶景遊園地',
    },
  ],
  wakayama: [
    {
      name: 'アドベンチャーワールド', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '白浜町', note: 'パンダ・サファリ・遊園地の複合型', budget: 'high',
      pricing: { adult: '5,300円', elementary: '3,300円', preschool: '2,000円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ジャイアントパンダ3頭飼育（全国最多）、動物園＋水族館＋サファリ＋遊園地の複合型',
      nearby: '白浜温泉と合わせて1-2泊プラン',
    },
  ],

  // ===== 中国・四国 =====
  tottori: [
    {
      name: '鳥取砂丘', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '鳥取市', note: '砂遊びの究極形、らくだ体験も', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ラクダ乗車体験（別料金600円〜）、砂の美術館（有料）併設',
      popular: true,
      nearby: '砂の美術館＋鳥取砂丘こどもの国で1日コース',
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
      },
    },
    {
      name: '鳥取砂丘こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '鳥取市', note: 'アスレチックと体験工房', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '砂丘隣接、大型遊具と屋内プレイエリアの複合',
      playgroundFeatures: ['athletic'],
    },
  ],
  shimane: [
    {
      name: '島根県立しまね海洋館アクアス', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '浜田市', note: 'シロイルカのバブルリングが名物', budget: 'low',
      pricing: { adult: '1,550円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'シロイルカのバブルリングは1日4-5回公演、無料で見られる',
      summerCool: true,
      waterPlay: true,
    },
  ],
  okayama: [
    {
      name: 'おもちゃ王国（岡山）', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: 'おもちゃの部屋が多数、0-6歳に最適', budget: 'mid',
      pricing: { adult: '800円（入園）', elementary: '800円', preschool: '800円（2歳以上）', infant: '無料（1歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '室内おもちゃ部屋が11以上、雨天OK、乗り放題パス（3,300円）推奨',
      popular: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '渋川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '玉野市', note: '動物にエサやり、リーズナブル', budget: 'low',
      pricing: { adult: '900円', elementary: '400円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物との距離が近く、餌やり（100円）が豊富。渋川海岸に近い',
    },
  ],
  hiroshima: [
    {
      name: '安佐動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '広島市', note: '起伏ある園内、キリン舎が見どころ', budget: 'low',
      pricing: { adult: '510円', elementary: '170円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '園内坂多し、ベビーカー＋抱っこ紐併用推奨。広島駅から車30分',
    },
    {
      name: 'みろくの里', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '福山市', note: '昭和レトロなミニ遊園地', budget: 'mid',
      pricing: { adult: '1,400円', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'いつか来た道エリア（昭和30年代再現）が大人も懐かしい。乗り放題パス（4,000円程度）がお得',
    },
    {
      name: '広島市こども文化科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '広島市', note: 'プラネタリウムと体験展示、入館無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料', },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入館完全無料、プラネタリウム別料金510円。原爆ドーム隣接でアクセス最高',
      summerCool: true,
    },
  ],
  yamaguchi: [
    {
      name: '秋吉台サファリランド', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '美祢市', note: 'マイカーサファリと遊園地', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,700円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'マイカー入園可（動物たちが間近）、遊園地もあり1日コース',
    },
    {
      name: '下関市立しものせき水族館 海響館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '下関市', note: 'フグ展示種類世界一', budget: 'mid',
      pricing: { adult: '2,090円', elementary: '940円', preschool: '410円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フグ展示種類世界一、イルカ・アシカショーは1日3回。下関駅から徒歩7分',
      summerCool: true,
      waterPlay: true,
    },
  ],
  tokushima: [
    {
      name: '徳島県立あすたむらんど', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '板野町', note: '科学館と大型遊具、無料エリアあり', budget: 'free',
      pricing: { adult: '無料（入園）', elementary: '科学館別料金', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園完全無料、大型遊具「子ども科学館」（別料金600円）と芝生広場',
      playgroundFeatures: ['athletic'],
    },
  ],
  kagawa: [
    {
      name: 'NEWレオマワールド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '丸亀市', note: '0-6歳向けアトラクション充実', budget: 'mid',
      pricing: { adult: '1,800円（入園）', elementary: '1,200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '0-6歳向けアトラクション「ドキドキタウン」が充実、フリーパス4,300円',
    },
    {
      name: '四国水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '宇多津町', note: '2020年開業、瀬戸内海の生き物', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,300円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '2020年開業で綺麗、夕方は夕日シルエットの演出が美しい',
      summerCool: true,
      waterPlay: true,
    },
  ],
  ehime: [
    {
      name: 'とべ動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '砥部町', note: '西日本有数の動物園、ホッキョクグマ', budget: 'low',
      pricing: { adult: '500円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '西日本最大級、ホッキョクグマ「ピース」が人気。松山駅から車40分',
    },
    {
      name: 'えひめこどもの城', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '松山市', note: '大型遊具と工作体験、無料入場', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入場無料の大型こども向け複合施設。モノレールやボートは別料金300-400円',
      playgroundFeatures: ['athletic'],
    },
  ],
  kochi: [
    {
      name: 'のいち動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '香南市', note: '展示のクオリティ高さで評価高い', budget: 'low',
      pricing: { adult: '470円', elementary: '無料（18歳以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '全国ランキング常連の動物園、展示の質が高く小規模でも見応え十分',
    },
    {
      name: '桂浜水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '高知市', note: '小規模だが見せ方が独創的', budget: 'low',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桂浜の海辺、レトロな昭和水族館の味わい、坂本龍馬像とセット',
      summerCool: true,
      waterPlay: true,
    },
  ],

  // ===== 九州・沖縄 =====
  fukuoka: [
    {
      name: 'マリンワールド海の中道', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: 'イルカ・アシカショーとパノラマ水槽', budget: 'mid',
      pricing: { adult: '2,500円', elementary: '1,200円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'イルカショー後の17時前が比較的空いている。九州の海再現水槽が大人も楽しい',
      nearby: '海の中道海浜公園と1日セット（駅共通）',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '海の中道海浜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: '動物の森＋大型遊具＋花、1日遊べる', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '300ha超の広大公園、レンタサイクルで周遊推奨。春のネモフィラ、秋のコスモスが絶景',
      nearby: 'マリンワールド海の中道と組み合わせ1日フル',
      playgroundFeatures: ['athletic'],
    },
    {
      name: '福岡市動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '福岡市', note: 'リニューアル後の植物園併設', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'リニューアル済、ベビーカー貸出あり。天神から地下鉄＋バスで20分程度',
      nearby: '隣接の福岡市植物園（同入場料共通）も合わせて半日',
    },
    {
      name: 'ボーネルンドあそびのせかい（ららぽーと等）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '複数', note: '屋内遊び場、雨天の救世主', budget: 'mid',
      pricing: { adult: '600円（保護者）', preschool: '600円/30分＋延長料金', infant: '600円（6ヶ月〜）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '平日フリーパス（1,200円程度）がお得。休日は整理券制になることも',
      summerCool: true,
    },
  ],
  saga: [
    {
      name: '佐賀県立宇宙科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '武雄市', note: 'プラネタリウムと体験展示', budget: 'low',
      pricing: { adult: '520円', elementary: '310円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'プラネタリウム別料金（大人520円）、武雄温泉と組み合わせ',
      summerCool: true,
    },
    {
      name: '神野公園こども遊園地', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '佐賀市', note: '入園無料の昔ながらの遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各150-250円', preschool: '乗り物各150-250円', infant: '無料（一部）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、乗り物のみ別料金。懐かしいレトロ遊具',
    },
  ],
  nagasaki: [
    {
      name: 'ハウステンボス', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '佐世保市', note: 'ヨーロッパ風テーマパーク、1日コース', budget: 'high',
      pricing: { adult: '7,400円', elementary: '4,800円', preschool: '4,100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '夜のイルミネーション「光の王国」は17時以降のナイトチケットがお得。佐世保駅から直通バス1時間',
      nearby: '佐世保市内のホテルで1泊必須級の広さ',
    },
    {
      name: '長崎バイオパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '西海市', note: 'カバや鹿に直接触れられる', budget: 'mid',
      pricing: { adult: '1,900円', elementary: '1,100円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フリーフライングエリアで鳥が肩に乗る体験。餌やり（エサ代200-300円）が大人気',
    },
    {
      name: '長崎ペンギン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '長崎市', note: 'ペンギン種類数日本一', budget: 'low',
      pricing: { adult: '520円', elementary: '310円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '世界最多9種類のペンギン展示、ふれあいビーチでペンギン散歩（土日祝）',
      summerCool: true,
      waterPlay: true,
    },
  ],
  kumamoto: [
    {
      name: '熊本市動植物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '熊本市', note: '動物園＋植物園＋遊園地の複合', budget: 'low',
      pricing: { adult: '500円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物園＋遊園地（10種類の乗り物、各100-200円）＋植物園で1日フル。熊本駅から市電で30分',
    },
    {
      name: '阿蘇カドリー・ドミニオン', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '阿蘇市', note: 'クマ牧場とミニブタショー', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,600円', preschool: '1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'みやざわ劇場のミニブタ・犬のパフォーマンスが大人気。阿蘇山観光とセットで1日コース',
      nearby: '阿蘇ファームランドと組み合わせ',
    },
  ],
  oita: [
    {
      name: 'うみたまご', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大分市', note: 'セイウチショーとタッチプール', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,300円', preschool: '850円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'セイウチとのふれあい、タッチプール、高崎山と隣接で1日コース',
      summerCool: true,
      waterPlay: true,
    },
    {
      name: '高崎山自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大分市', note: '野生の猿の群れが来る、うみたまご隣接', budget: 'low',
      pricing: { adult: '520円', elementary: '260円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '野生の猿1000頭以上が山から下りてくる、エサやりタイム11時/14時',
      nearby: 'うみたまごと徒歩5分、セットで半日-1日コース',
    },
    {
      name: 'ハーモニーランド', category: 'amusement', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '日出町', note: 'サンリオの屋外テーマパーク', budget: 'mid',
      pricing: { adult: '3,600円', elementary: '2,600円', preschool: '2,600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'サンリオの屋外テーマパーク、小さい子向けアトラクション充実、アフタヌーンパス（昼以降割引）も',
    },
  ],
  miyazaki: [
    {
      name: '宮崎市フェニックス自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮崎市', note: '遊園地併設、フラミンゴショー', budget: 'low',
      pricing: { adult: '840円', elementary: '420円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フラミンゴショーが珍しい、遊園地乗り物も別料金100-400円',
    },
  ],
  // kagoshima は上部の詳細版を参照
  okinawa: [
    {
      name: '沖縄美ら海水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '本部町', note: 'ジンベエザメとマンタの大水槽', budget: 'mid',
      pricing: { adult: '2,180円', elementary: '710円（小中）', preschool: '無料（6歳未満）', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '16時以降の夕方入館券（1,510円、8割価格）が狙い目。那覇から車で約2時間、日帰り強行はキツイ',
      nearby: '海洋博公園内にエメラルドビーチ（無料）、オキちゃん劇場（イルカショー）で1日フル',
      popular: true,
      summerCool: true,
      waterPlay: true,
      facilities: {
        bathroom: 'yes',
        diaperChange: 'yes',
        nursingRoom: 'yes',
        strollerRental: 'yes',
      },
    },
    {
      name: '沖縄こどもの国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '沖縄市', note: '動物園＋こどもの遊具、リーズナブル', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '那覇から車で45分、リーズナブルで1日遊べる。チルドレンズセンター（屋内）も併設',
    },
    {
      name: 'ネオパークオキナワ', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '名護市', note: '鳥類メイン、放し飼いで近い', budget: 'low',
      pricing: { adult: '1,300円', elementary: '700円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フラミンゴ・オウムが放し飼いで大接近。餌やり体験（100円）が人気',
      nearby: '名護市内、許田ICから20分。美ら海水族館と組み合わせやすい',
    },
    {
      name: 'DMMかりゆし水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '豊見城市', note: '2020年開業、プロジェクションマッピング演出', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '2,000円（中高）', preschool: '1,500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '那覇空港から車で20分、イーアス沖縄豊崎内で買い物とセット。雨天時の強い味方',
      nearby: 'イーアス沖縄豊崎（大型商業施設）で1日滞在可',
      summerCool: true,
      waterPlay: true,
    },
  ],
};

/**
 * エリアに紐づくスポット一覧を取得。
 * 未登録の都道府県は空配列を返す。
 */
export function getSpotsForArea(area: string | undefined): Spot[] {
  if (!area || area === 'all') return [];
  return SPOTS[area as AreaSlug] ?? [];
}

/**
 * 条件フィルタでスポットを絞り込む。
 *
 * @param area 都道府県 slug
 * @param opts 絞り込み条件
 */
export function filterSpots(
  area: string | undefined,
  opts: {
    age?: AgeTag;
    place?: 'indoor' | 'outdoor';
    budget?: 'free' | 'low' | 'mid' | 'high';
    limit?: number;
  } = {}
): Spot[] {
  let list = getSpotsForArea(area);
  if (opts.age) list = list.filter((s) => s.ages.includes(opts.age!));
  if (opts.place === 'indoor') list = list.filter((s) => s.place === 'indoor' || s.place === 'mixed');
  if (opts.place === 'outdoor') list = list.filter((s) => s.place === 'outdoor' || s.place === 'mixed');
  if (opts.budget) {
    const order = { free: 0, low: 1, mid: 2, high: 3 };
    const cap = order[opts.budget];
    list = list.filter((s) => (s.budget ? order[s.budget] <= cap : true));
  }
  // 一次情報レポート（運営者が訪問して確認した実体験）付きのスポットを優先表示。
  // limit で件数が絞られても、独自性の高いスポットが埋もれないようにする。
  list = [...list].sort(
    (a, b) => Number(Boolean(b.kidReport)) - Number(Boolean(a.kidReport)),
  );
  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

/**
 * エディターがキュレーションした人気スポットを返す。
 * - popular: true フラグ付きのスポットを対象
 * - 全都道府県横断で area 情報も併せて返す
 * - 将来 GA4 PV連動に差し替え可能な設計
 */
export function getPopularSpots(limit = 6): { area: AreaSlug; spot: Spot }[] {
  const result: { area: AreaSlug; spot: Spot }[] = [];
  for (const [areaKey, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    for (const spot of list) {
      if (spot.popular) {
        result.push({ area: areaKey as AreaSlug, spot });
      }
    }
  }
  // slug 的ソートで毎回同じ順番（deterministic）
  result.sort((a, b) => a.spot.name.localeCompare(b.spot.name, 'ja'));
  return result.slice(0, limit);
}

/**
 * eat×外で食べる モード用：エリア内の子連れOKレストラン（restaurant カテゴリ）を返す。
 * - エリア未指定（all）なら人気レストラン横断で
 * - エリア指定なら都道府県内のrestaurantのみ
 * - 年齢で絞り込み（その年齢が ages に含まれる店）
 * - 上位 limit 件を popular フラグ優先で並べる
 */
export function getKidFriendlyRestaurants(
  area: string | undefined,
  opts: { age?: AgeTag; budget?: 'free' | 'low' | 'mid' | 'high'; limit?: number } = {}
): { area: AreaSlug; spot: Spot }[] {
  const result: { area: AreaSlug; spot: Spot }[] = [];

  const targetAreas: [AreaSlug, Spot[]][] =
    !area || area === 'all'
      ? (Object.entries(SPOTS) as [AreaSlug, Spot[]][])
      : SPOTS[area as AreaSlug]
        ? [[area as AreaSlug, SPOTS[area as AreaSlug]!]]
        : [];

  for (const [areaKey, list] of targetAreas) {
    for (const spot of list) {
      if (spot.category !== 'restaurant') continue;
      if (opts.age && !spot.ages.includes(opts.age)) continue;
      if (opts.budget) {
        const order = { free: 0, low: 1, mid: 2, high: 3 };
        if (spot.budget && order[spot.budget] > order[opts.budget]) continue;
      }
      result.push({ area: areaKey, spot });
    }
  }

  // popular優先 → 名前ソート
  result.sort((a, b) => {
    if (a.spot.popular && !b.spot.popular) return -1;
    if (!a.spot.popular && b.spot.popular) return 1;
    return a.spot.name.localeCompare(b.spot.name, 'ja');
  });

  return result.slice(0, opts.limit ?? 12);
}

/**
 * 駅slugから「徒歩X分以内」のスポットを取得。
 * 駅ページの「近隣のおでかけスポット」セクションで使用。
 * walkMinutes 昇順、最大 limit 件。
 */
export function getSpotsByNearestStation(stationSlug: string, opts: { maxWalkMinutes?: number; limit?: number } = {}): Spot[] {
  const max = opts.maxWalkMinutes ?? 15;
  const result: Spot[] = [];
  for (const list of Object.values(SPOTS)) {
    if (!list) continue;
    for (const s of list) {
      if (s.nearestStation !== stationSlug) continue;
      if ((s.walkMinutes ?? Infinity) > max) continue;
      result.push(s);
    }
  }
  result.sort((a, b) => (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99));
  return result.slice(0, opts.limit ?? 8);
}

/** 東京23区名で絞り込み（city または ward を見る） */
export function getSpotsForWard(ward: string): Spot[] {
  const result: Spot[] = [];
  for (const list of [SPOTS.tokyo ?? [], TOKYO_RESTAURANTS]) {
    for (const s of list) {
      const target = s.ward ?? s.city ?? '';
      if (target.includes(ward)) result.push(s);
    }
  }
  return result;
}

/**
 * スポット名から URL slug を生成する。
 * 日本語スポット名 → 英数字 slug。
 * - 全角→半角、記号削除
 * - 同名スポット衝突回避のため、エリア名＋市区町村名のハッシュを末尾に付ける
 *
 * 例: 'よみうりランド (川崎市)' → 'yomiuri-land-kawasaki-1a2b'
 */
export function spotToSlug(spot: Spot, area: AreaSlug | string): string {
  const base = spot.name
    .replace(/[（(].*?[）)]/g, '') // 括弧書き除外
    .trim();
  // 簡易ローマ字化はしない。代わりに crc32 風の短ハッシュ + name の安全なエンコードで一意性確保。
  const cityPart = spot.ward ?? spot.city ?? '';
  const hashInput = `${area}|${base}|${cityPart}`;
  // 簡易ハッシュ（衝突防止用、短く 4文字）
  let h = 0;
  for (let i = 0; i < hashInput.length; i++) {
    h = ((h << 5) - h + hashInput.charCodeAt(i)) | 0;
  }
  const hash = Math.abs(h).toString(36).padStart(4, '0').slice(-4);
  // URL slug 部分は日本語タイトルから安全な文字だけを残す（最大40文字）
  const safe = encodeURIComponent(base).replace(/%[0-9A-F]{2}/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${safe}-${hash}`;
}

/**
 * 全エリアの全スポットをフラットに列挙（一意slug付き）。
 * sitemap, app/spot/[slug] の静的生成で使う。
 */
export function getAllSpotsWithSlug(): Array<{ slug: string; area: AreaSlug | string; spot: Spot }> {
  const all: Array<{ slug: string; area: AreaSlug | string; spot: Spot }> = [];
  const seen = new Set<string>();
  for (const [area, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    for (const s of list) {
      const slug = spotToSlug(s, area);
      if (seen.has(slug)) continue;
      seen.add(slug);
      all.push({ slug, area, spot: mergeSpot(s, slug) });
    }
  }
  for (const s of TOKYO_RESTAURANTS) {
    const slug = spotToSlug(s, 'tokyo');
    if (seen.has(slug)) continue;
    seen.add(slug);
    all.push({ slug, area: 'tokyo', spot: mergeSpot(s, slug) });
  }
  return all;
}

/**
 * スポットが個別ページとして「中身が十分」かを判定する品質ゲート。
 * 6つの実データ項目（メモ・設備・料金・穴場メモ・最寄り駅・市区町村）のうち
 * 3つ以上を満たすものだけを indexable とする。
 * spot/[slug] の noindex 判定・周辺スポット表示・他テンプレからの参照で共用する。
 */
export function isSpotIndexable(s: Spot): boolean {
  let score = 0;
  if (s.note && s.note.length >= 25) score++;
  if (s.facilities && Object.keys(s.facilities).length >= 2) score++;
  if (s.pricing && Object.keys(s.pricing).length >= 1) score++;
  if (s.hiddenTip && s.hiddenTip.length >= 15) score++;
  if (s.nearestStation) score++;
  if (s.ward || s.city) score++;
  return score >= 3;
}

/**
 * slug からスポットを取得（個別ページ用）。
 */
export function getSpotBySlug(
  slug: string,
): { slug: string; area: AreaSlug | string; spot: Spot } | undefined {
  return getAllSpotsWithSlug().find((x) => x.slug === slug);
}

/** スポットカテゴリを日本語ラベルに変換 */
export const SPOT_CATEGORY_LABEL: Record<SpotCategory, string> = {
  zoo: '動物園',
  aquarium: '水族館',
  park: '公園',
  museum: '博物館・科学館',
  amusement: '遊園地',
  indoor: '屋内施設',
  farm: '牧場',
  seasonal: '季節体験',
  restaurant: '子連れOKレストラン',
};

/** 東京23区の子連れOKレストラン（ベビーカー入店・キッズメニュー等の情報付き） */
export const TOKYO_RESTAURANTS: Spot[] = [
  {
    name: 'IKEA レストラン（新三郷・立川・原宿等）', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '新三郷/立川/原宿/渋谷ほか',
    note: 'キッズメニュー100円、ベビーカーそのまま、離乳食無料',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '離乳食（レトルトと同等）は無料で提供、ベビーチェア大量に完備',
      summerCool: true,
  },
  {
    name: 'COCO&#39;S（ココス）', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: 'キッズメニュー豊富、バルーン配布、塗り絵サービス',
    pricing: { adult: '900-1,500円', elementary: '499円〜', preschool: '499円〜', infant: '離乳食200円' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '離乳食（5ヶ月〜）200円、誕生日デザート無料サービス',
      summerCool: true,
  },
  {
    name: 'ガスト', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: 'キッズメニュー豊富、猫型配膳ロボット、離乳食あり',
    pricing: { adult: '700-1,300円', elementary: '329円〜', preschool: '329円〜', infant: '離乳食214円' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '配膳ロボット「BellaBot」が子どもに大人気、離乳食メニュー常設',
      summerCool: true,
  },
  {
    name: 'サイゼリヤ', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: 'コスパ最強、ミラノ風ドリア300円、子ども食器あり',
    pricing: { adult: '800円目安', elementary: '子ども食器無料', preschool: 'ミニサイズメニューあり', infant: '持ち込み可' },
    strollerAccess: true, babyChair: true, kidsMenu: false,
    hiddenTip: 'ソフトドリンクバー190円、ミニサイズや子ども食器・スプーン無料',
      summerCool: true,
  },
  {
    name: 'くら寿司', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '回転寿司チェーン',
    note: 'ビッくらポンでおもちゃ当選、個室風ボックス席あり',
    pricing: { adult: '1,000-1,500円', elementary: '500円〜', preschool: '無料（取り皿のみ）', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '5皿で1回「ビッくらポン」抽選、おもちゃカプセルが楽しみ',
      summerCool: true,
  },
  {
    name: 'スシロー', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '回転寿司チェーン',
    note: 'タッチパネル注文、キッズメニューセット500円',
    pricing: { adult: '1,000-1,500円', elementary: '500円〜（キッズセット）', preschool: '500円〜', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'キッズプレート500円（エビフライ+デザート+ジュース）、子ども専用前掛けあり',
      summerCool: true,
  },
  {
    name: 'ジョナサン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: '離乳食・塗り絵・キッズプレート、すかいらーく系',
    pricing: { adult: '1,000-1,500円', elementary: '399円〜', preschool: '399円〜', infant: '離乳食214円' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'キッズプレート399円（5歳以下100円）、ハッピーセット的に',
      summerCool: true,
  },
  {
    name: '上島珈琲店・キッズ向けカフェ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'カフェチェーン',
    note: 'キッズドリンク、子連れ歓迎、ベビーカー入店可',
    pricing: { adult: '500-800円', elementary: '250円〜', preschool: '250円〜', infant: 'お湯提供' },
    strollerAccess: true, babyChair: false, kidsMenu: false,
    hiddenTip: '赤ちゃん連れにもやさしく、お湯や離乳食の温めに対応してくれる店舗多数',
      summerCool: true,
  },
  {
    name: 'ビバパエリア／スペインバル（中野・吉祥寺）', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '中野区', city: '中野',
    note: 'スペイン料理、パエリア、個室あり',
    pricing: { adult: '2,000-3,000円', elementary: 'シェア可', preschool: '取り分けOK', infant: '持ち込み可' },
    strollerAccess: true, babyChair: true, kidsMenu: false, privateRoom: true,
    hiddenTip: '予約推奨、個室でママ会にも',
      summerCool: true,
  },
  {
    name: '東京ドームシティ ラクーア内 キッズOK店舗群', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '文京区', city: '水道橋',
    note: 'ドームシティ内、子連れOK店舗多数、キッズスペース併設も',
    pricing: { adult: '1,500-2,500円', elementary: '子どもメニューあり店多数', preschool: '取り分け可', infant: '持ち込み可店あり' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '遊んだ後に便利、ラクーアフロアマップで「ファミリーOK」店を確認',
      summerCool: true,
  },
  // ===== 全国チェーン系 ファミレス =====
  {
    name: 'デニーズ', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: 'キッズメニュー・ベビーチェア完備、離乳食提供あり',
    pricing: { adult: '1,000-1,800円', elementary: '500円〜', preschool: '500円〜', infant: '離乳食提供あり' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'お子様プレートにおもちゃ付き、塗り絵・クレヨン配布',
      summerCool: true,
      waterPlay: true,
  },
  {
    name: 'バーミヤン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '中華ファミレスチェーン',
    note: 'すかいらーく系中華、キッズメニュー豊富、配膳ロボット',
    pricing: { adult: '800-1,500円', elementary: '399円〜', preschool: '399円〜', infant: '離乳食214円' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '猫型配膳ロボットが大人気、点心セットは取り分けしやすい',
      summerCool: true,
  },
  {
    name: 'ビッグボーイ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ハンバーグチェーン',
    note: 'サラダ・スープ・カレーバー食べ放題、キッズメニューあり',
    pricing: { adult: '1,200-2,000円', elementary: '499円〜', preschool: '無料（小学生未満、条件あり）', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '未就学児はサラダバー無料の店舗あり、長居しても嫌な顔されない',
      summerCool: true,
  },
  {
    name: 'フォルクス', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ステーキ・ファミレスチェーン',
    note: 'サラダバー充実、ステーキハウス系ファミレス',
    pricing: { adult: '1,800-2,800円', elementary: '800円〜', preschool: '800円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'サラダバー付きランチは子どもに野菜を食べさせやすい',
      summerCool: true,
  },
  {
    name: 'ロイヤルホスト', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'ファミレスチェーン',
    note: 'やや高級志向、ベビーチェア・キッズメニュー完備',
    pricing: { adult: '1,500-2,500円', elementary: '680円〜', preschool: '680円〜', infant: '離乳食提供あり' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'ゆったりした席配置でベビーカーのまま入店しやすい',
      summerCool: true,
      waterPlay: true,
  },
  {
    name: '和食さと', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '和食ファミレスチェーン',
    note: '和食中心、しゃぶしゃぶ食べ放題、キッズメニュー充実',
    pricing: { adult: '1,500-2,500円', elementary: '499円〜', preschool: '無料（未就学児、食べ放題時）' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '食べ放題コースは未就学児無料の店舗多く、コスパ良し',
      summerCool: true,
  },
  {
    name: '華屋与兵衛', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '和食ファミレスチェーン',
    note: '和食ファミレス、個室風座敷席あり',
    pricing: { adult: '1,200-2,200円', elementary: '550円〜', preschool: '550円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '座敷席多く赤ちゃん連れでも寝かせられる、おむつ替え台完備',
      summerCool: true,
  },
  {
    name: 'ステーキガスト', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ステーキファミレスチェーン',
    note: 'ガスト系、サラダバー・カレーバー、キッズメニュー',
    pricing: { adult: '1,200-2,000円', elementary: '399円〜', preschool: '399円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'サラダバー食べ放題で子どもも飽きにくい、席間広め',
      summerCool: true,
  },
  {
    name: 'びっくりドンキー', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ハンバーグチェーン',
    note: 'ハンバーグ専門、キッズメニュー・おもちゃ付き',
    pricing: { adult: '1,000-1,800円', elementary: '550円〜', preschool: '550円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ミニハンバーグ150g単位で注文可、取り分けに便利',
      summerCool: true,
  },
  {
    name: 'カプリチョーザ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'イタリアンチェーン',
    note: 'シェアサイズのパスタ、子どもも食べやすい味付け',
    pricing: { adult: '1,500-2,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'パスタ1皿シェア前提の量、家族3人で2皿注文が定番',
      summerCool: true,
  },
  // ===== 全国チェーン系 ファストフード =====
  {
    name: 'マクドナルド', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ハンバーガーチェーン',
    note: 'ハッピーセット、プレイランド併設店舗あり',
    pricing: { adult: '600-1,000円', elementary: '520円〜（ハッピーセット）', preschool: '520円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '一部店舗にプレイランド完備、雨の日の遊び場として便利',
      summerCool: true,
  },
  {
    name: 'モスバーガー', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ハンバーガーチェーン',
    note: '注文後調理で素材にこだわり、モスワイワイセット',
    pricing: { adult: '700-1,200円', elementary: '590円〜', preschool: '590円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ワイワイセットにおもちゃ付き、離乳食提供店舗もあり',
      summerCool: true,
  },
  {
    name: 'ケンタッキーフライドチキン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ファストフードチェーン',
    note: 'キッズセットあり、骨なしケンタッキーが食べやすい',
    pricing: { adult: '800-1,500円', elementary: '550円〜', preschool: '550円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'カーネルキッズセットにおもちゃ付き、骨なしケンタッキー注文で子どもも安心',
      summerCool: true,
  },
  {
    name: 'フレッシュネスバーガー', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ハンバーガーチェーン',
    note: '素材にこだわるハンバーガー、店内広めで子連れ向き',
    pricing: { adult: '900-1,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: 'バンズ・パティが比較的小さめで子どもも食べやすい',
      summerCool: true,
  },
  // ===== 全国チェーン系 麺・丼 =====
  {
    name: 'リンガーハット', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '長崎ちゃんぽんチェーン',
    note: '野菜たっぷり、麺少なめ注文可、キッズメニューあり',
    pricing: { adult: '800-1,200円', elementary: '480円〜', preschool: '480円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '野菜たっぷり麺は子どもの野菜不足解消に、麺少なめ注文も可',
      summerCool: true,
  },
  {
    name: '丸亀製麺', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: 'うどんチェーン',
    note: 'うどん・天ぷらセルフ、キッズうどん280円',
    pricing: { adult: '500-900円', elementary: '280円〜（キッズうどん）', preschool: '280円〜', infant: 'うどん小分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'キッズうどん280円（小盛+いなり）、麺を柔らかめに茹で直してくれる店舗も',
      summerCool: true,
  },
  {
    name: 'なか卯', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '丼・うどんチェーン',
    note: '親子丼・うどん中心、キッズメニューあり',
    pricing: { adult: '500-900円', elementary: '390円〜', preschool: '390円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ミニ親子丼+ミニうどんセットで取り分けにも便利',
      summerCool: true,
  },
  {
    name: '松屋', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '牛丼チェーン',
    note: '牛丼・定食、サイドメニュー豊富',
    pricing: { adult: '500-900円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: '朝定食は子どもも食べやすい、味噌汁無料がうれしい',
      summerCool: true,
  },
  {
    name: 'すき家', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '牛丼チェーン',
    note: '牛丼チェーンでキッズメニューあり、ベビーチェア完備店多い',
    pricing: { adult: '500-900円', elementary: '390円〜（お子様牛丼）', preschool: '390円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'お子様牛丼セット（おもちゃ付き）あり、牛丼チェーンでは一番子連れ向き',
      summerCool: true,
      waterPlay: true,
  },
  {
    name: '吉野家', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '牛丼チェーン',
    note: '牛丼・定食、カウンター席多めだがテーブル席もあり',
    pricing: { adult: '500-900円', elementary: 'ミニ牛丼348円〜', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: 'ミニ牛丼は子どもサイズ、カウンター席の店舗ではテーブル席確認を',
      summerCool: true,
  },
  // ===== 全国チェーン系 その他 =====
  {
    name: '築地銀だこ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'たこ焼きチェーン',
    note: 'たこ焼き、イートインスペースあり店舗も',
    pricing: { adult: '600-900円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: 'フードコート併設店舗がベビーカー連れに便利、たこ小さめの「たこ焼き」注文可',
      summerCool: true,
  },
  {
    name: 'ミスタードーナツ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'ドーナツチェーン',
    note: 'ドーナツ・ドリンク、キッズセットあり',
    pricing: { adult: '500-900円', elementary: '380円〜（キッズセット）', preschool: '380円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ポン・デ・キッズセットにおもちゃ付き、ベビーチェア完備店多い',
      summerCool: true,
  },
  {
    name: '焼肉きんぐ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '焼肉食べ放題チェーン',
    note: '食べ放題、未就学児無料、テーブルオーダー式',
    pricing: { adult: '3,000-4,500円（食べ放題）', elementary: '半額前後', preschool: '無料（未就学児）', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '未就学児無料＋キッズメニュー（ソフトクリーム・ポテト等）で家族コスパ最強',
      summerCool: true,
  },
  {
    name: 'しゃぶ葉', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: 'しゃぶしゃぶ食べ放題チェーン',
    note: 'すかいらーく系、しゃぶしゃぶ食べ放題、未就学児無料',
    pricing: { adult: '1,800-2,800円', elementary: '半額', preschool: '無料（未就学児）', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '未就学児無料、うどん・おにぎり・ソフトクリーム食べ放題で子どもも満足',
      summerCool: true,
  },
  {
    name: 'かっぱ寿司', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '回転寿司チェーン',
    note: '新幹線レーン・キッズメニュー、子ども大喜び',
    pricing: { adult: '1,000-1,500円', elementary: '480円〜', preschool: '480円〜', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '新幹線型レーンでお寿司が運ばれてくる演出が子どもに大人気',
      summerCool: true,
  },
  {
    name: 'はま寿司', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '複数', city: '回転寿司チェーン',
    note: 'ゼンショー系、平日100円、キッズセットあり',
    pricing: { adult: '1,000-1,500円', elementary: '399円〜（キッズセット）', preschool: '399円〜', infant: '無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '平日一皿100円、キッズセット（おもちゃ付き）でコスパ良し',
      summerCool: true,
  },
  // ===== 関西エリア =====
  {
    name: '551蓬莱', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '大阪市ほか関西',
    note: '大阪名物豚まん、イートイン席あり、取り分けやすい',
    pricing: { adult: '800-1,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: '豚まん1個から注文可、焼売・餃子も子どもに人気',
      summerCool: true,
  },
  {
    name: 'お好み焼き 鶴橋風月', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '大阪市鶴橋ほか関西',
    note: '大阪お好み焼き、ボックス席あり、取り分け前提',
    pricing: { adult: '1,500-2,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '鉄板の熱には注意、取り皿でしっかり冷ましてから',
      summerCool: true,
  },
  {
    name: '祇園辻利／都路里', category: 'restaurant', place: 'indoor', ages: ['4-6'],
    city: '京都市祇園',
    note: '抹茶パフェの名店、京都観光時の休憩に',
    pricing: { adult: '1,200-1,800円', elementary: 'シェア推奨', preschool: 'シェア推奨' },
    strollerAccess: true,
    hiddenTip: '祇園本店は行列必至、伊勢丹店のほうが比較的空いている',
    reservation: 'none',
      summerCool: true,
  },
  {
    name: '志津香', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '奈良市',
    note: '奈良名物釜めし、落ち着いた和の空間',
    pricing: { adult: '1,500-2,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: '奈良公園観光時のランチに、釜めしは炊き上げに25分かかるので時間に余裕を',
    reservation: 'recommended',
      summerCool: true,
  },
  // ===== 北海道 =====
  {
    name: 'すみれ（札幌ラーメン）', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '札幌市',
    note: '札幌味噌ラーメンの名店、カウンター＋テーブル席',
    pricing: { adult: '1,000-1,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: '新千歳空港店はフードコート内でベビーカー連れも安心',
      summerCool: true,
  },
  {
    name: '松尾ジンギスカン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '札幌市・滝川市ほか',
    note: '北海道ジンギスカン老舗、味付けラムが食べやすい',
    pricing: { adult: '2,000-3,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: '味付けジンギスカンは子どもにも食べやすい甘め、鉄板の熱に注意',
      summerCool: true,
  },
  {
    name: 'ロイズチョコレートワールド', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '千歳市（新千歳空港）',
    note: '新千歳空港内、チョコ工場見学＋カフェ',
    pricing: { adult: '500-1,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: 'フライト前の時間潰しに最適、見学無料＋限定スイーツあり',
      summerCool: true,
  },
  // ===== 東北 =====
  {
    name: '牛たん炭焼 利久', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '仙台市ほか',
    note: '仙台牛たんの代表、定食スタイルで取り分けやすい',
    pricing: { adult: '1,800-2,800円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: 'テールスープは子どもも飲みやすい、仙台駅直結店が便利',
      summerCool: true,
  },
  // ===== 名古屋エリア =====
  {
    name: 'コメダ珈琲店', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '喫茶チェーン（名古屋発祥）',
    note: 'モーニング無料パン、ゆったりボックス席、子連れ歓迎',
    pricing: { adult: '600-1,200円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ボックス席広くベビーカーたたまずOK、モーニング（11時まで）はドリンク代でトースト付き',
      summerCool: true,
  },
  {
    name: '矢場とん', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '名古屋市ほか',
    note: '名古屋味噌カツの代表店、味噌ダレ別皿対応可',
    pricing: { adult: '1,500-2,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: '味噌ダレ別皿に頼めば子どもはソースなしで食べられる',
      summerCool: true,
  },
  {
    name: '世界の山ちゃん', category: 'restaurant', place: 'indoor', ages: ['4-6'],
    city: '名古屋市ほか',
    note: '名古屋名物手羽先、居酒屋だがファミリー歓迎店舗も',
    pricing: { adult: '2,000-3,000円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: '手羽先は小さい子には骨が危険、唐揚げ・焼き鳥のほうが安心',
      summerCool: true,
  },
  // ===== 福岡エリア =====
  {
    name: '一蘭', category: 'restaurant', place: 'indoor', ages: ['4-6'],
    ward: '複数', city: '博多ラーメンチェーン',
    note: '博多とんこつラーメン、仕切り席あり',
    pricing: { adult: '1,000-1,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true,
    hiddenTip: '味集中カウンターは仕切りで子連れに不向き、テーブル席がある店舗を選ぶ',
      summerCool: true,
  },
  {
    name: 'ひょうたん寿司', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '福岡市天神',
    note: '福岡人気寿司店、ランチがお得、行列覚悟',
    pricing: { adult: '2,000-3,500円', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: 'ランチ開店前（11時）に並ぶと待ち時間短縮、2階席あり',
    reservation: 'recommended',
      summerCool: true,
  },
  {
    name: '元祖長浜屋', category: 'restaurant', place: 'indoor', ages: ['4-6'],
    city: '福岡市長浜',
    note: '長浜ラーメン元祖、回転早い庶民派',
    pricing: { adult: '500-900円', elementary: '取り分け可', preschool: '取り分け可' },
    hiddenTip: 'カウンター中心、小さい子連れには席の狭さがネック。早朝営業もあり',
      summerCool: true,
  },
  // ===== 追加100店舗：ベビーカーOK・子連れ歓迎の食事店 =====
  // ===== 東京（25店舗） =====
  {
    name: 'レストランフロイデ（としまえん跡周辺ほか）', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '練馬区', city: '練馬区',
    note: '都内ファミリーレストランの定番、ベビーカー入店OK・キッズメニューあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー600円〜', preschool: '600円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '広い座席で禁煙、滞在1〜1.5時間が目安。子連れに優しい接客で人気',
    popular: true,
      summerCool: true,
  },
  {
    name: '東京ステーションホテル ロビーラウンジ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '千代田区', city: '丸の内',
    note: '東京駅丸の内側直結、ベビーカー入店OK・個室あり・禁煙',
    pricing: { adult: 'アフタヌーンティー6,000円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, privateRoom: true,
    hiddenTip: '東京駅地下から雨に濡れずアクセス、滞在1.5〜2時間。新幹線待ちにも',
    popular: true,
      summerCool: true,
  },
  {
    name: '丸ビル 5・6Fレストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '千代田区', city: '丸の内',
    note: '丸の内ビル内、ベビーカー入店OK・キッズチェアあり・おむつ替え台あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニューあり店多数', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '東京駅丸の内南口から徒歩3分、館内エレベーター完備。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'タリーズコーヒー（Tully\'s）キッズメニュー対応店', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '複数', city: '都内各所',
    note: 'カフェチェーン、ベビーカー入店OK・キッズメニューあり・禁煙',
    pricing: { adult: '500-900円', elementary: 'キッズドリンク300円〜', preschool: '300円〜', infant: 'お湯対応' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '一部店舗にキッズメニューあり、離乳食を温めてもらえる店舗多数。滞在1時間',
      summerCool: true,
  },
  {
    name: '渋谷ヒカリエ ShinQs ダイニング', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '渋谷区', city: '渋谷区道玄坂',
    note: '渋谷駅直結、ベビーカー入店OK・おむつ替え台あり・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー店舗あり', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '渋谷駅地下直結、ベビー休憩室完備。滞在1〜1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '二子玉川ライズ S.C. レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '世田谷区', city: '二子玉川',
    note: '二子玉川駅直結、ベビーカー入店OK・キッズメニュー店舗多数・個室あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニューあり', preschool: '取り分け可', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true, babyFood: true,
    hiddenTip: '駅直結で雨の日も安心、ベビールーム充実。滞在1〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'お台場ヴィーナスフォート跡地～アクアシティお台場 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '港区', city: '台場',
    note: 'お台場、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー600円〜', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'ゆりかもめ台場駅直結、フードコート利用が便利。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '六本木ヒルズ ヒルサイド・レストラン群', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '港区', city: '六本木',
    note: '六本木ヒルズ、ベビーカー入店OK・個室あり・禁煙',
    pricing: { adult: 'ランチ2,000円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: '日比谷線六本木駅直結、ベビールーム完備。滞在1.5〜2時間',
      summerCool: true,
  },
  {
    name: '池袋サンシャインシティ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '豊島区', city: '池袋',
    note: 'サンシャインシティ内、ベビーカー入店OK・キッズメニュー店舗多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '水族館・展望台帰りに利用しやすい、館内ベビールーム多数。滞在1〜1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '東京スカイツリータウン ソラマチ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '墨田区', city: '押上',
    note: 'スカイツリー直結、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー600円〜', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '押上駅直結、6F・7F・30F・31Fに飲食店、ベビールームも各階に。滞在1〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '新宿高島屋 14Fダイニング', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '渋谷区', city: '新宿（千駄ヶ谷）',
    note: 'タカシマヤタイムズスクエア内、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー店舗あり', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '新宿駅新南口直結、ベビールーム完備で離乳食も温めOK。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'ルミネ新宿 レストラン街', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '新宿区', city: '新宿',
    note: '新宿駅直結、ベビーカー入店OK店多数・キッズメニューあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー店舗による', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '新宿駅南口直結、エレベーター完備。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'グランスタ東京 駅構内ダイニング', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '千代田区', city: '東京駅丸の内',
    note: '東京駅構内、ベビーカー入店OK・キッズチェアあり店舗・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: '改札内外両方にあり、新幹線移動の前後に便利。滞在1時間',
      summerCool: true,
  },
  {
    name: 'グランベリーパーク レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '町田市', city: '南町田',
    note: '南町田グランベリーパーク内、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '田園都市線南町田グランベリーパーク駅直結、スヌーピーミュージアム隣接。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'ららぽーと豊洲 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '江東区', city: '豊洲',
    note: '豊洲駅徒歩、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK店舗多数',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'ゆりかもめ豊洲駅直結、館内ベビールーム充実。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'コストコ 多摩境倉庫 フードコート', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    ward: '町田市', city: '多摩境',
    note: 'コストコ会員制、ベビーカー入店OK・広い座席・禁煙',
    pricing: { adult: 'ホットドッグ200円〜', elementary: 'シェア可', preschool: 'シェア可' },
    strollerAccess: true, babyChair: false,
    hiddenTip: '会員限定、ホットドッグ＋ドリンクで200円のコスパ最強。滞在30分〜1時間',
      summerCool: true,
  },
  {
    name: '上野松坂屋 上野フロンティアタワー レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '台東区', city: '上野',
    note: '上野駅徒歩、ベビーカー入店OK・キッズメニュー店舗あり・個室あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: '上野動物園・科学博物館帰りに利用しやすい。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'マークイズみなとみらい・吉祥寺パルコ系列 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '武蔵野市', city: '吉祥寺',
    note: '吉祥寺駅徒歩、ベビーカー入店OK・キッズメニューあり・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニューあり', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '吉祥寺駅から徒歩5分、井の頭公園散歩のあとに。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'アトレ吉祥寺 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '武蔵野市', city: '吉祥寺',
    note: '吉祥寺駅直結、ベビーカー入店OK・キッズメニュー店舗多数・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー店舗による', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '吉祥寺駅直結、ベビールーム完備。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '北千住マルイ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '足立区', city: '北千住',
    note: '北千住駅直結、ベビーカー入店OK・キッズメニューあり・おむつ替え台あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '北千住駅西口直結、ベビールーム完備。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '錦糸町オリナス レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '墨田区', city: '錦糸町',
    note: '錦糸町駅徒歩、ベビーカー入店OK・キッズメニューあり店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '錦糸町駅北口から徒歩5分、ファミリー向け店舗多め。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '蒲田グランデュオ レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '大田区', city: '蒲田',
    note: '蒲田駅直結、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ1,300円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '蒲田駅東口直結、エレベーター完備で雨の日も安心。滞在1時間',
      summerCool: true,
  },
  {
    name: 'アトレ大森 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '大田区', city: '大森',
    note: '大森駅直結、ベビーカー入店OK・キッズメニューあり・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '大森駅東口直結、滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '中野サンモール～中野ブロードウェイ周辺 ファミレス・カフェ', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '中野区', city: '中野',
    note: '中野駅徒歩、ベビーカー入店OK・キッズメニュー店舗多数',
    pricing: { adult: 'ランチ1,200円〜', elementary: 'キッズメニュー400円〜', preschool: '400円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '中野駅北口から徒歩3分、ファミリー向けチェーン多数。滞在1時間',
      summerCool: true,
  },
  {
    name: 'IKEA 立川 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    ward: '立川市', city: '立川',
    note: 'IKEA立川店、ベビーカー入店OK・キッズメニュー100円〜・離乳食無料・キッズチェア多数',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '立川駅から無料シャトルバスあり、キッズスペース併設で食後も遊べる。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  // ===== 神奈川（8店舗） =====
  {
    name: '横浜ランドマークタワー ドックヤードガーデン レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '横浜市西区みなとみらい',
    note: 'みなとみらい駅徒歩、ベビーカー入店OK・キッズメニュー多数・個室あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー600円〜', preschool: '600円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'みなとみらい線みなとみらい駅から徒歩5分、館内ベビールーム完備。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '横浜赤レンガ倉庫 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '横浜市中区',
    note: '横浜赤レンガ、ベビーカー入店OK・キッズメニュー店多数・禁煙',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニューあり', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '馬車道駅から徒歩6分、海風感じる広場で食後も歩きやすい。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'ららぽーと横浜 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '横浜市都筑区',
    note: '鴨居駅徒歩、ベビーカー入店OK・キッズメニュー店多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR横浜線鴨居駅から徒歩7分、ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'IKEA 港北 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '横浜市都筑区',
    note: 'IKEA港北店、ベビーカー入店OK・キッズメニュー100円〜・離乳食無料',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'センター北駅から徒歩7分、平日は空いていて狙い目。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'ラゾーナ川崎プラザ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '川崎市幸区',
    note: '川崎駅直結、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR川崎駅西口直結、ベビールーム複数。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '川崎アゼリア・チネチッタ周辺 レストラン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '川崎市川崎区',
    note: '川崎駅徒歩、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR川崎駅東口地下街、雨の日も安心。滞在1時間',
      summerCool: true,
  },
  {
    name: '湘南T-SITE（藤沢） カフェ＆レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '藤沢市辻堂',
    note: '辻堂駅徒歩、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニューあり店舗', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '辻堂駅から徒歩20分、絵本に囲まれたカフェも。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: '鎌倉小町通り ファミリー向けカフェ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '鎌倉市',
    note: '鎌倉駅徒歩、ベビーカー入店可の店舗を厳選・禁煙店多い',
    pricing: { adult: 'ランチ1,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true,
    hiddenTip: 'JR鎌倉駅東口から徒歩2分、観光途中の休憩に。滞在1時間',
      summerCool: true,
  },
  // ===== 大阪（8店舗） =====
  {
    name: 'グランフロント大阪 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市北区梅田',
    note: '梅田駅直結、ベビーカー入店OK・キッズメニュー多数・個室あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true, babyFood: true,
    hiddenTip: 'JR大阪駅・梅田駅直結、ベビールーム多数。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'ルクア大阪 バルチカ', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '大阪市北区梅田',
    note: 'JR大阪駅直結、ベビーカー入店OK店あり・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR大阪駅直結、ランチタイムがおすすめ。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'なんばパークス レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市浪速区難波',
    note: '難波駅徒歩、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '南海なんば駅直結、屋上庭園で食後の散歩も。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'なんばCITY レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市中央区難波',
    note: '難波駅直結、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '南海なんば駅直結、ベビールーム完備。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'あべのハルカス ダイニングフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市阿倍野区天王寺',
    note: '天王寺駅直結、ベビーカー入店OK・個室あり・禁煙',
    pricing: { adult: 'ランチ2,000円〜', elementary: 'キッズメニューあり店多数', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'JR天王寺駅直結、近鉄あべの橋駅直結。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'あべのキューズモール レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市阿倍野区天王寺',
    note: '天王寺駅徒歩、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR天王寺駅から徒歩3分、ファミリー向け店舗多数。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'ららぽーとEXPOCITY レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '吹田市千里万博公園',
    note: '万博記念公園駅徒歩、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK店舗多数',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '大阪モノレール万博記念公園駅から徒歩2分、ニフレル隣接。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'IKEA 鶴浜 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大阪市大正区',
    note: 'IKEA鶴浜店、ベビーカー入店OK・キッズメニュー100円〜・離乳食無料',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR大正駅から無料シャトルバス、平日は混雑少なめ。滞在1.5時間',
      summerCool: true,
  },
  // ===== 愛知（6店舗） =====
  {
    name: 'JRゲートタワー・JRセントラルタワーズ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '名古屋市中村区名駅',
    note: '名古屋駅直結、ベビーカー入店OK・キッズメニュー店多数・個室あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'JR名古屋駅直結、ベビールーム完備。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'ミッドランドスクエア レストラン街', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '名古屋市中村区名駅',
    note: '名古屋駅徒歩、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ2,000円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: '名古屋駅桜通口から徒歩3分、トヨタグループ本社ビル内。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'オアシス21 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '名古屋市東区栄',
    note: '栄駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '地下鉄栄駅直結、水の宇宙船周辺で食後の散策も。滞在1時間',
      summerCool: true,
  },
  {
    name: 'ららぽーと名古屋みなとアクルス レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '名古屋市港区',
    note: '名古屋港駅徒歩、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '地下鉄名港線名古屋港駅から徒歩5分、館内ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'スガキヤ（中京圏チェーン）', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '名古屋市ほか中京圏',
    note: 'ラーメンチェーン、ベビーカー入店OK店多数・キッズメニューあり',
    pricing: { adult: '500-900円', elementary: 'キッズラーメン350円〜', preschool: '350円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'フードコート展開店舗が多くベビーカー連れに便利、ソフトクリームも有名。滞在30分〜1時間',
      summerCool: true,
  },
  {
    name: 'IKEA 長久手 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '長久手市',
    note: 'IKEA長久手店、ベビーカー入店OK・キッズメニュー100円〜・離乳食無料',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'リニモ公園西駅から徒歩5分、ジブリパーク帰りに利用しやすい。滞在1.5時間',
      summerCool: true,
  },
  // ===== 福岡（5店舗） =====
  {
    name: 'JR博多シティ レストラン街（くうてん）', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '福岡市博多区',
    note: '博多駅直結、ベビーカー入店OK・キッズメニュー店多数・個室あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'JR博多駅直結9-10F、ベビールーム完備。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'キャナルシティ博多 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '福岡市博多区',
    note: 'キャナルシティ内、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '博多駅から徒歩10分、噴水ショーが食後の楽しみに。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '天神地下街・ソラリアプラザ レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '福岡市中央区天神',
    note: '天神駅直結、ベビーカー入店OK・キッズメニュー店あり・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '地下鉄天神駅直結、雨の日も安心。滞在1〜1.5時間',
      summerCool: true,
  },
  {
    name: 'ららぽーと福岡 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '福岡市博多区',
    note: 'ららぽーと福岡、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR竹下駅から徒歩9分、館内ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'マリノアシティ福岡 レストラン街', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '福岡市西区',
    note: 'アウトレット施設、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR下山門駅からバス、観覧車併設で食後の楽しみも。滞在1.5時間',
      summerCool: true,
  },
  // ===== 北海道（5店舗） =====
  {
    name: '札幌ステラプレイス レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '札幌市中央区',
    note: '札幌駅直結、ベビーカー入店OK・キッズメニュー多数・個室あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'JR札幌駅直結、ベビールーム完備。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '大丸札幌店 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '札幌市中央区',
    note: '札幌駅直結、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ2,000円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR札幌駅南口直結、ベビー休憩室完備。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'サッポロファクトリー レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '札幌市中央区',
    note: 'サッポロファクトリー、ベビーカー入店OK・キッズメニューあり店多数',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '地下鉄バスセンター前駅から徒歩3分、アトリウムが開放的。滞在1.5時間',
      summerCool: true,
  },
  {
    name: 'JRタワー T38 展望レストラン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '札幌市中央区',
    note: 'JRタワー38F、ベビーカー入店OK・個室あり・禁煙',
    pricing: { adult: 'ランチ2,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, privateRoom: true,
    hiddenTip: 'JR札幌駅直結、ランチは展望料金込みでお得。滞在1.5〜2時間',
      summerCool: true,
  },
  {
    name: '新千歳空港 ターミナルビル ファミリーレストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '千歳市',
    note: '新千歳空港、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '搭乗前の食事に、館内ベビールーム多数。滞在1〜1.5時間',
      summerCool: true,
  },
  // ===== 京都（5店舗） =====
  {
    name: '京都駅ビル ザ・キューブ・ジェイアール京都伊勢丹 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '京都市下京区',
    note: '京都駅直結、ベビーカー入店OK・キッズメニュー店多数・個室あり',
    pricing: { adult: 'ランチ1,800円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true, privateRoom: true,
    hiddenTip: 'JR京都駅直結、ベビールーム完備。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  {
    name: 'イオンモール京都桂川 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '京都市南区',
    note: 'イオンモール京都桂川、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR桂川駅直結、館内ベビールーム多数。滞在1.5〜2時間',
      summerCool: true,
  },
  {
    name: '京都四条河原町 OPA・高島屋 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '京都市下京区',
    note: '河原町駅徒歩、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ1,800円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '阪急京都河原町駅直結、観光途中のランチに。滞在1.5時間',
      summerCool: true,
  },
  {
    name: '京都ポルタ 地下街レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '京都市下京区',
    note: '京都駅地下街、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR京都駅地下直結、雨の日も安心。滞在1時間',
      summerCool: true,
  },
  {
    name: 'ヨドバシ梅田＆ヨドバシ京都 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '京都市下京区',
    note: '京都駅徒歩、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '京都駅烏丸口から徒歩3分、ファミリー向け店舗多数。滞在1〜1.5時間',
      summerCool: true,
  },
  // ===== 兵庫（5店舗） =====
  {
    name: '神戸ハーバーランド umie レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '神戸市中央区',
    note: 'ハーバーランド、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR神戸駅から徒歩5分、海を見ながら食事。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  {
    name: '神戸三宮センタープラザ レストラン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '神戸市中央区',
    note: '三宮駅徒歩、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR三宮駅から徒歩3分、地下街で雨の日も安心。滞在1時間',
      summerCool: true,
  },
  {
    name: 'ららぽーと甲子園 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '西宮市',
    note: 'ららぽーと甲子園、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '阪神甲子園駅から徒歩5分、館内ベビールーム充実。滞在1.5〜2時間',
      summerCool: true,
  },
  {
    name: 'IKEA 神戸 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '神戸市東灘区',
    note: 'IKEA神戸店、ベビーカー入店OK・キッズメニュー100円〜・離乳食無料',
    pricing: { adult: '800-1,500円', elementary: '100円〜（キッズメニュー）', preschool: '100円〜', infant: '離乳食無料' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '阪神青木駅から徒歩約12分、平日狙い目。滞在1.5時間',
      summerCool: true,
  },
  {
    name: '姫路駅前 ピオレ姫路 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '姫路市',
    note: '姫路駅直結、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR姫路駅直結、姫路城観光帰りに。滞在1〜1.5時間',
      summerCool: true,
  },
  // ===== その他37県（残り33店舗、1〜2店舗ずつ）=====
  // 青森
  {
    name: 'A-FACTORY（青森駅前）カフェ＆レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '青森市',
    note: '青森駅徒歩1分、ベビーカー入店OK・キッズチェアあり・禁煙',
    pricing: { adult: 'ランチ1,300円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR青森駅徒歩1分、地元食材ビュッフェ。滞在1〜1.5時間',
      summerCool: true,
  },
  // 岩手
  {
    name: '盛岡駅 フェザン レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '盛岡市',
    note: '盛岡駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR盛岡駅直結、新幹線移動の前後に。滞在1時間',
      summerCool: true,
  },
  // 宮城
  {
    name: '仙台パルコ・エスパル仙台 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '仙台市青葉区',
    note: '仙台駅直結、ベビーカー入店OK・キッズメニュー店多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR仙台駅直結、ベビールーム完備。滞在1〜1.5時間',
    popular: true,
      summerCool: true,
  },
  // 秋田
  {
    name: 'アルヴェ・トピコ秋田 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '秋田市',
    note: '秋田駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR秋田駅直結、新幹線移動の合間に。滞在1時間',
      summerCool: true,
  },
  // 茨城
  {
    name: 'イーアスつくば レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: 'つくば市',
    note: 'つくば、ベビーカー入店OK・キッズメニュー多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'つくばエクスプレス研究学園駅から徒歩7分、館内ベビールーム充実。滞在1.5時間',
      summerCool: true,
  },
  // 栃木
  {
    name: 'FKD宇都宮 インターパーク レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '宇都宮市',
    note: 'インターパーク、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '車利用がメイン、駐車場無料。滞在1.5時間',
      summerCool: true,
  },
  // 群馬
  {
    name: 'イオンモール高崎 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '高崎市',
    note: 'イオンモール高崎、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR高崎問屋町駅から徒歩10分、館内ベビールーム多数。滞在1.5〜2時間',
      summerCool: true,
  },
  // 埼玉
  {
    name: 'ららぽーと富士見 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '富士見市',
    note: 'ららぽーと富士見、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '東武東上線鶴瀬駅から徒歩約15分、ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  // 千葉
  {
    name: 'イクスピアリ レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '浦安市',
    note: '舞浜駅直結、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR舞浜駅直結、ディズニー帰りに。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  // 新潟
  {
    name: 'CoCoLo新潟 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '新潟市中央区',
    note: '新潟駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR新潟駅直結、新幹線移動の前後に。滞在1時間',
      summerCool: true,
  },
  // 富山
  {
    name: '富山駅 マルート レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '富山市',
    note: '富山駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR富山駅直結、滞在1時間',
      summerCool: true,
  },
  // 石川
  {
    name: '金沢百番街 あんと レストラン', category: 'restaurant', place: 'indoor', ages: ['2-3', '4-6'],
    city: '金沢市',
    note: '金沢駅直結、ベビーカー入店OK・キッズチェアあり店あり',
    pricing: { adult: 'ランチ1,500円〜', elementary: '取り分け可', preschool: '取り分け可' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR金沢駅直結、新幹線移動の前後に。滞在1〜1.5時間',
      summerCool: true,
  },
  // 長野
  {
    name: 'MIDORI長野 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '長野市',
    note: '長野駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR長野駅直結、新幹線移動の前後に。滞在1時間',
      summerCool: true,
  },
  // 岐阜
  {
    name: 'アスティ岐阜 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '岐阜市',
    note: '岐阜駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR岐阜駅直結、滞在1時間',
      summerCool: true,
  },
  // 静岡
  {
    name: 'パルシェ静岡 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '静岡市葵区',
    note: '静岡駅直結、ベビーカー入店OK・キッズメニュー店あり・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR静岡駅直結、新幹線移動の前後に。滞在1時間',
    popular: true,
      summerCool: true,
  },
  // 三重
  {
    name: 'イオンモール津南 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '津市',
    note: 'イオンモール、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '車利用がメイン、館内ベビールーム多数。滞在1.5時間',
      summerCool: true,
  },
  // 滋賀
  {
    name: 'フォレオ大津一里山 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大津市',
    note: '大津、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR瀬田駅からバス、車利用が便利。滞在1.5時間',
      summerCool: true,
  },
  // 奈良
  {
    name: '近鉄百貨店奈良店 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '奈良市',
    note: '近鉄奈良駅徒歩、ベビーカー入店OK・キッズメニュー店あり・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '近鉄奈良駅から徒歩5分、奈良公園観光時に。滞在1〜1.5時間',
      summerCool: true,
  },
  // 和歌山
  {
    name: 'イオンモール和歌山 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '和歌山市',
    note: 'イオンモール、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '車利用がメイン、館内ベビールーム多数。滞在1.5時間',
      summerCool: true,
  },
  // 岡山
  {
    name: 'イオンモール岡山 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '岡山市北区',
    note: '岡山駅徒歩、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR岡山駅から徒歩5分、館内ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
  // 広島
  {
    name: 'ekie広島 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '広島市南区',
    note: '広島駅直結、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR広島駅直結、新幹線移動の前後に。滞在1時間',
    popular: true,
      summerCool: true,
  },
  // 山口
  {
    name: 'シーモール下関 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '下関市',
    note: '下関駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR下関駅直結、滞在1時間',
      summerCool: true,
  },
  // 徳島
  {
    name: 'クレメントプラザ徳島 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '徳島市',
    note: '徳島駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR徳島駅直結、滞在1時間',
      summerCool: true,
  },
  // 香川
  {
    name: '高松オルネ・コトデンそごう周辺 レストラン', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '高松市',
    note: '高松駅徒歩、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR高松駅から徒歩3分、滞在1時間',
      summerCool: true,
  },
  // 愛媛
  {
    name: '松山三越 レストランフロア', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '松山市',
    note: '松山中心部、ベビーカー入店OK・キッズメニュー店あり・禁煙',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '伊予鉄道大街道電停から徒歩3分、滞在1〜1.5時間',
      summerCool: true,
  },
  // 高知
  {
    name: 'イオンモール高知 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '高知市',
    note: 'イオンモール、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '車利用がメイン、館内ベビールーム多数。滞在1.5時間',
      summerCool: true,
  },
  // 佐賀
  {
    name: 'ゆめタウン佐賀 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '佐賀市',
    note: 'ゆめタウン、ベビーカー入店OK・キッズメニュー多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: '車利用がメイン、館内ベビールーム多数。滞在1.5時間',
      summerCool: true,
  },
  // 長崎
  {
    name: 'アミュプラザ長崎 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '長崎市',
    note: '長崎駅直結、ベビーカー入店OK・キッズメニュー店多数',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR長崎駅直結、滞在1〜1.5時間',
      summerCool: true,
  },
  // 熊本
  {
    name: 'アミュプラザくまもと レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '熊本市西区',
    note: '熊本駅直結、ベビーカー入店OK・キッズメニュー店多数・おむつ替え台あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: 'JR熊本駅直結、ベビールーム完備。滞在1〜1.5時間',
    popular: true,
      summerCool: true,
  },
  // 大分
  {
    name: 'アミュプラザおおいた レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '大分市',
    note: '大分駅直結、ベビーカー入店OK・キッズメニュー店あり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR大分駅直結、滞在1〜1.5時間',
      summerCool: true,
  },
  // 宮崎
  {
    name: 'イオンモール宮崎 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '宮崎市',
    note: 'イオンモール、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '車利用がメイン、館内ベビールーム多数。滞在1.5時間',
      summerCool: true,
  },
  // 鹿児島
  {
    name: 'アミュプラザ鹿児島 レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '鹿児島市',
    note: '鹿児島中央駅直結、ベビーカー入店OK・キッズメニュー店多数・キッズチェアあり',
    pricing: { adult: 'ランチ1,300円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜' },
    strollerAccess: true, babyChair: true, kidsMenu: true,
    hiddenTip: 'JR鹿児島中央駅直結、観覧車併設で食後の楽しみも。滞在1.5時間',
    popular: true,
      summerCool: true,
  },
  // 沖縄
  {
    name: 'イオンモール沖縄ライカム レストラン街', category: 'restaurant', place: 'indoor', ages: ['0-1', '2-3', '4-6'],
    city: '中頭郡北中城村',
    note: 'イオンモール沖縄ライカム、ベビーカー入店OK・キッズメニュー多数・離乳食持ち込みOK',
    pricing: { adult: 'ランチ1,500円〜', elementary: 'キッズメニュー500円〜', preschool: '500円〜', infant: '離乳食持ち込みOK' },
    strollerAccess: true, babyChair: true, kidsMenu: true, babyFood: true,
    hiddenTip: '那覇空港から車約30分、館内ベビールーム充実。滞在1.5〜2時間',
    popular: true,
      summerCool: true,
  },
];

// ============================================================================
// スポット拡充バッチ（SPOTS_EXTRA）のマージ
//
// lib/spots-extra/ の全国47都道府県の追加スポットを、SPOTS の各都道府県配列に
// 結合する。name が既存スポットと完全一致するものは重複として除外。
// モジュール読み込み時に一度だけ実行。
// ============================================================================
for (const [area, extraList] of Object.entries(SPOTS_EXTRA) as [
  AreaSlug,
  Spot[],
][]) {
  if (!extraList || extraList.length === 0) continue;
  const existing = SPOTS[area] ?? [];
  const existingNames = new Set(existing.map((s) => s.name));
  const toAdd = extraList.filter((s) => !existingNames.has(s.name));
  SPOTS[area] = [...existing, ...toAdd];
}

// ============================================================================
// 一次情報レポート（KID_REPORTS）のマージ
//
// lib/kid-reports.ts の KID_REPORTS を、スポット name の完全一致で SPOTS 内の
// 各スポットに添付する。モジュール読み込み時に一度だけ実行。
// すでにインラインで kidReport を持つスポット（先行7件）は尊重し、上書きしない。
// ============================================================================
for (const areaList of Object.values(SPOTS)) {
  if (!areaList) continue;
  for (const spot of areaList) {
    if (!spot.kidReport && KID_REPORTS[spot.name]) {
      spot.kidReport = KID_REPORTS[spot.name];
    }
  }
}

// ============================================================================
// 設備データ（SPOT_FACILITIES）のマージ
//
// lib/spot-facilities.ts の公式確認済み設備情報を、スポット name の完全一致で
// SPOTS 内の各スポットに添付する。すでにインラインで facilities を持つスポットは
// 尊重し、上書きしない（インライン値が優先）。
// ============================================================================
for (const areaList of Object.values(SPOTS)) {
  if (!areaList) continue;
  for (const spot of areaList) {
    if (!spot.facilities && SPOT_FACILITIES[spot.name]) {
      spot.facilities = SPOT_FACILITIES[spot.name];
    }
    // アクセスデータ（SPOT_ACCESS）のマージ。インライン値が優先。
    const access = SPOT_ACCESS[spot.name];
    if (access) {
      if (!spot.nearestStation) spot.nearestStation = access.nearestStation;
      if (spot.walkMinutes == null && access.walkMinutes != null) {
        spot.walkMinutes = access.walkMinutes;
      }
    }
  }
}

