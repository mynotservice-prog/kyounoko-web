/**
 * /items ページ（役立つもの）用の商品カタログ。
 *
 * - 既存の `lib/affiliate-products.ts` の商品データをカテゴリ付きで再利用しつつ、
 *   /items 専用の追加カテゴリ（senzai / jitan-kaden / ehon）の商品も登録する。
 * - 記事カードで使う `AffiliateLink` とは別に、カテゴリタブ切替やカタログ表示に
 *   最適化した型 `CatalogItem` を定義する。
 */
import type { AffiliateProvider } from '@/components/affiliate/AffiliateLink';

export const CATALOG_CATEGORIES = [
  'dakkohimo',
  'babycar',
  'chiiku-subsc',
  'baby-chair',
  'takushoku',
  'senzai',
  'jitan-kaden',
  'ehon',
  'shokuiku',
  'babysitter',
  'kids-appliance',
  'educational-toy',
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export type CatalogItem = {
  id: string;
  category: CatalogCategory;
  name: string;
  subtitle: string;
  price: string;
  provider: AffiliateProvider;
  href: string;
  /** 関連する比較記事 slug（任意） */
  articleSlug?: string;
};

/**
 * カテゴリのメタ情報（表示名・リード文・関連記事 slug）。
 * /items のセクション見出しと関連記事リンクに使う。
 */
export type CatalogCategoryMeta = {
  id: CatalogCategory;
  name: string;
  tagline: string;
  /** セクション末尾に配置する関連比較記事 slug のリスト */
  relatedArticles: { slug: string; label: string }[];
};

export const CATALOG_CATEGORY_META: Record<CatalogCategory, CatalogCategoryMeta> = {
  dakkohimo: {
    id: 'dakkohimo',
    name: '抱っこ紐',
    tagline: '新生児から使える肩ラク・蒸れにくい抱っこ紐。',
    relatedArticles: [
      { slug: 'dakkohimo-ranking-2026', label: '抱っこ紐ランキング2026を見る' },
    ],
  },
  babycar: {
    id: 'babycar',
    name: 'ベビーカー',
    tagline: '軽さ・段差・畳みやすさで選ぶ、街なかベビーカー。',
    relatedArticles: [
      { slug: 'babycar-ranking-2026', label: 'ベビーカーランキング2026を見る' },
      { slug: 'babycar-erabikata', label: 'ベビーカーの選び方を読む' },
    ],
  },
  'chiiku-subsc': {
    id: 'chiiku-subsc',
    name: '知育玩具サブスク',
    tagline: '月齢に合わせて届く、おもちゃの定額レンタル。',
    relatedArticles: [
      { slug: 'chiiku-subsc-hikaku-4sha', label: '知育サブスク比較4社を見る' },
    ],
  },
  'baby-chair': {
    id: 'baby-chair',
    name: 'ベビーチェア',
    tagline: '離乳食から幼児期まで。姿勢が整う食事椅子。',
    relatedArticles: [
      { slug: 'baby-chair-ranking', label: 'ベビーチェアランキングを見る' },
    ],
  },
  takushoku: {
    id: 'takushoku',
    name: '冷凍宅食',
    tagline: '温めるだけで栄養バランス。平日夜の救世主。',
    relatedArticles: [
      { slug: 'takushoku-service-hikaku-3sha', label: '宅食サービス比較3社を見る' },
      { slug: 'kosodate-subsc-3sha-hikaku', label: '子育てサブスク3社比較を見る' },
    ],
  },
  senzai: {
    id: 'senzai',
    name: 'ベビー洗剤',
    tagline: '肌にやさしい赤ちゃん向け洗濯洗剤。',
    relatedArticles: [
      { slug: 'baby-senzai-ranking', label: 'ベビー洗剤ランキングを見る' },
    ],
  },
  'jitan-kaden': {
    id: 'jitan-kaden',
    name: '時短家電',
    tagline: '家事の時間を短縮する三種の神器。',
    relatedArticles: [
      { slug: 'jitanhaden-ranking-7sen', label: '時短家電ランキング7選を見る' },
    ],
  },
  ehon: {
    id: 'ehon',
    name: '絵本・読み聞かせ',
    tagline: '毎月届く絵本・読み聞かせに役立つサービス。',
    relatedArticles: [
      { slug: 'seal-book-ranking', label: 'シールブックランキングを見る' },
      { slug: 'ehon-yomikikase-kotsu', label: '絵本の読み聞かせのコツを読む' },
    ],
  },
  shokuiku: {
    id: 'shokuiku',
    name: '食育・栄養補助',
    tagline: '野菜不足・食わず嫌い・好き嫌いをサポート。',
    relatedArticles: [
      { slug: 'sukikirai-yasai-taisaku', label: '野菜嫌い対策を読む' },
      { slug: 'yasai-tabenai-3sai-taisaku', label: '3歳の野菜嫌い対策を読む' },
    ],
  },
  babysitter: {
    id: 'babysitter',
    name: 'ベビーシッター・一時保育',
    tagline: 'いざという時に頼れる、登録無料のシッター・一時預かりサービス。',
    relatedArticles: [],
  },
  'kids-appliance': {
    id: 'kids-appliance',
    name: 'キッズ家電',
    tagline: '加湿器・ベビーモニター・電動歯ブラシなど、子育てを助ける家電。',
    relatedArticles: [],
  },
  'educational-toy': {
    id: 'educational-toy',
    name: '知育玩具',
    tagline: '2歳・3歳・4歳と長く遊べる、定番の知育おもちゃ。',
    relatedArticles: [
      { slug: 'chiiku-subsc-hikaku-4sha', label: '知育サブスク比較4社を見る' },
    ],
  },
};

/**
 * カタログ商品データ。
 * 既存 21 商品 + senzai/jitan-kaden/ehon 各 3 = 計 30 商品。
 */
export const CATALOG_ITEMS: CatalogItem[] = [
  // ========================================================================
  // 抱っこ紐（5）
  // ========================================================================
  {
    id: 'dk-ergo-omni-breeze',
    category: 'dakkohimo',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A8%E3%83%AB%E3%82%B4%E3%83%99%E3%83%93%E3%83%BC+OMNI+Breeze/',
    name: 'エルゴベビー OMNI Breeze',
    subtitle: '新生児〜20kg対応・通気性SoftFlex採用のロングセラー',
    price: '¥27,500前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },
  {
    id: 'dk-konny',
    category: 'dakkohimo',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B3%E3%83%8B%E3%83%BC+%E6%8A%B1%E3%81%A3%E3%81%93%E7%B4%90+FLEX+%E3%82%B5%E3%83%9E%E3%83%BC/',
    name: 'コニー抱っこ紐 FLEX サマー',
    subtitle: 'スリングタイプ・軽量200gで寝かしつけに強い',
    price: '¥7,900前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },
  {
    id: 'dk-babybjorn-one-kai',
    category: 'dakkohimo',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%93%E3%83%A7%E3%83%AB%E3%83%B3+ONE+KAI+Air/',
    name: 'ベビービョルン ONE KAI Air',
    subtitle: '前向き抱っこ対応・メッシュで夏も快適',
    price: '¥24,200前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },
  {
    id: 'dk-aprica-colan',
    category: 'dakkohimo',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%83%E3%83%97%E3%83%AA%E3%82%AB+%E3%82%B3%E3%83%A9%E3%83%B3%E3%83%8F%E3%82%B0+AB/',
    name: 'アップリカ コランハグ AB',
    subtitle: 'ヘッドサポートが厚めで首すわり前も使いやすい',
    price: '¥22,000前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },
  {
    id: 'dk-boba-wrap',
    category: 'dakkohimo',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9C%E3%83%90%E3%83%A9%E3%83%83%E3%83%97+ORIGINAL/',
    name: 'ボバラップ ORIGINAL',
    subtitle: '布タイプで新生児に密着・授乳後の寝かしつけに',
    price: '¥8,800前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },

  // ========================================================================
  // ベビーカー（5）
  // ========================================================================
  {
    id: 'bc-aprica-luxuna',
    category: 'babycar',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%83%E3%83%97%E3%83%AA%E3%82%AB+%E3%83%A9%E3%82%AF%E3%83%BC%E3%83%8A%E3%82%AF%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3AG/',
    name: 'アップリカ ラクーナクッションAG',
    subtitle: '振動を抑える4輪サスペンション・軽量5.2kg',
    price: '¥49,500前後',
    articleSlug: 'babycar-ranking-2026',
  },
  {
    id: 'bc-combi-atto',
    category: 'babycar',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B3%E3%83%B3%E3%83%93+%E3%82%A2%E3%83%83%E3%83%88%E3%83%A6%E3%83%BC%E3%82%B8%E3%83%A5+%E3%82%A8%E3%83%83%E3%82%B0%E3%82%B7%E3%83%A7%E3%83%83%E3%82%AF/',
    name: 'コンビ アットユージュ エッグショック',
    subtitle: '衝撃吸収素材採用・段差に強いハイシート',
    price: '¥52,800前後',
    articleSlug: 'babycar-ranking-2026',
  },
  {
    id: 'bc-cybex-libelle',
    category: 'babycar',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B5%E3%82%A4%E3%83%99%E3%83%83%E3%82%AF%E3%82%B9+%E3%83%AA%E3%83%99%E3%83%AB/',
    name: 'サイベックス リベル',
    subtitle: '機内持ち込みサイズまで畳める超コンパクト',
    price: '¥26,400前後',
    articleSlug: 'babycar-ranking-2026',
  },
  {
    id: 'bc-airbuggy-coco',
    category: 'babycar',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A8%E3%82%A2%E3%83%90%E3%82%AE%E3%83%BC+COCO+%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2/',
    name: 'エアバギー COCO プレミア',
    subtitle: '3輪エアタイヤで舗装の悪い道でも安定走行',
    price: '¥77,000前後',
    articleSlug: 'babycar-ranking-2026',
  },
  {
    id: 'bc-pigeon-runfee',
    category: 'babycar',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%94%E3%82%B8%E3%83%A7%E3%83%B3+%E3%83%A9%E3%83%B3%E3%83%95%E3%82%A3+%E3%83%AA%E3%83%8E%E3%83%B3/',
    name: 'ピジョン ランフィ リノン',
    subtitle: '片手で押しやすい直進性・シングルタイヤ',
    price: '¥48,400前後',
    articleSlug: 'babycar-ranking-2026',
  },

  // ========================================================================
  // 知育サブスク（4）
  // ========================================================================
  {
    id: 'cs-toysub',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497153&p_id=4587&pc_id=11989&pl_id=61358',
    name: 'トイサブ！',
    subtitle: '業界最大手・月齢に合わせて知育玩具6点が届く',
    price: '月額 ¥3,674〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-chachacha',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497168&p_id=3329&pc_id=7908&pl_id=47419',
    name: 'Cha Cha Cha（チャチャチャ）',
    subtitle: '初月¥0キャンペーン・学研ステイフル監修プラン有',
    price: '月額 ¥3,630〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-andtoybox',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497156&p_id=2231&pc_id=4745&pl_id=31455',
    name: 'And TOYBOX（アンドトイボックス）',
    subtitle: 'LINEでおもちゃ変更相談OK・個別カスタマイズ型',
    price: '月額 ¥3,278〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-kidslab',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497170&p_id=2450&pc_id=5374&pl_id=32293',
    name: 'キッズ・ラボラトリー',
    subtitle: '隔月プランあり・初月980円のお試しが可能',
    price: '月額 ¥2,574〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },

  // ========================================================================
  // ベビーチェア（4）
  // ========================================================================
  {
    id: 'bch-stokke-tripp-trapp',
    category: 'baby-chair',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B9%E3%83%88%E3%83%83%E3%82%B1+%E3%83%88%E3%83%AA%E3%83%83%E3%83%97+%E3%83%88%E3%83%A9%E3%83%83%E3%83%97/',
    name: 'ストッケ トリップ トラップ',
    subtitle: '0歳〜大人まで座れる長寿命ハイチェア',
    price: '¥34,100前後',
    articleSlug: 'baby-chair-ranking',
  },
  {
    id: 'bch-richell',
    category: 'baby-chair',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%AA%E3%83%83%E3%83%81%E3%82%A7%E3%83%AB+2WAY+%E3%81%94%E3%81%8D%E3%81%92%E3%82%93%E3%83%81%E3%82%A7%E3%82%A2/',
    name: 'リッチェル 2WAYごきげんチェア',
    subtitle: 'ローチェア・テーブル付きで離乳食初期に便利',
    price: '¥4,800前後',
    articleSlug: 'baby-chair-ranking',
  },
  {
    id: 'bch-babybjorn',
    category: 'baby-chair',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%93%E3%83%A7%E3%83%AB%E3%83%B3+%E3%83%8F%E3%82%A4%E3%83%81%E3%82%A7%E3%82%A2/',
    name: 'ベビービョルン ハイチェア',
    subtitle: 'テーブルが前方にせり出し、立ち上がり防止に強い',
    price: '¥33,000前後',
    articleSlug: 'baby-chair-ranking',
  },
  {
    id: 'bch-katoji',
    category: 'baby-chair',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%AB%E3%83%88%E3%83%BC%E3%82%B8+%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2%E3%83%A0%E3%83%99%E3%83%93%E3%83%BC%E3%83%81%E3%82%A7%E3%82%A2/',
    name: 'カトージ プレミアムベビーチェア',
    subtitle: '高さ10段階調整・リクライニング対応',
    price: '¥16,500前後',
    articleSlug: 'baby-chair-ranking',
  },

  // ========================================================================
  // 冷凍宅食（3）
  // ========================================================================
  // NOTE: ts-nosh は アフィ未承認のため削除（提携承認後に再追加）
  // NOTE: ts-mitsuboshi (三ツ星ファーム) は もしも未承認 + 素URLで遷移不可のため削除。
  // もしも経由で承認され次第、正規のアフィリエイトURLで再追加する。
  {
    id: 'ts-tsurukame',
    category: 'takushoku',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+BLCVUA+48GW+626XU',
    name: 'Dr.つるかめキッチン',
    subtitle: '管理栄養士+医師監修・塩分／糖質など制限食に強い',
    price: '1食 ¥663〜',
    articleSlug: 'takushoku-service-hikaku-3sha',
  },

  // ========================================================================
  // ベビー洗剤 senzai（3）— 新規
  // ========================================================================
  {
    id: 'sz-farfar-baby',
    category: 'senzai',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%95%E3%82%A1%E3%83%BC%E3%83%95%E3%82%A1+%E3%83%99%E3%83%93%E3%83%BC+%E6%B4%97%E6%BF%AF%E6%B4%97%E5%89%A4/',
    name: 'ファーファ ベビー 洗濯洗剤',
    subtitle: '無添加・低刺激設計。新生児の肌着にも使える定番',
    price: '¥700前後',
    articleSlug: 'baby-senzai-ranking',
  },
  {
    id: 'sz-miyoshi-soap',
    category: 'senzai',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9F%E3%83%A8%E3%82%B7%E7%9F%B3%E9%B9%B8+%E3%83%99%E3%83%93%E3%83%BC%E6%B4%97%E6%BF%AF%E6%B4%97%E5%89%A4/',
    name: 'ミヨシ石鹸 ベビー洗濯洗剤',
    subtitle: '純石けんベース・蛍光剤/着色料フリー',
    price: '¥900前後',
    articleSlug: 'baby-senzai-ranking',
  },
  {
    id: 'sz-sarasa-pg',
    category: 'senzai',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%95%E3%82%89%E3%81%95+%E6%B4%97%E6%BF%AF%E6%B4%97%E5%89%A4/',
    name: 'さらさ 洗濯洗剤',
    subtitle: '肌にやさしい植物系。家族で使えるスーパーでも定番',
    price: '¥600前後',
    articleSlug: 'baby-senzai-ranking',
  },

  // ========================================================================
  // 時短家電 jitan-kaden（3）— 新規
  // ========================================================================
  {
    id: 'jk-drum-washer',
    category: 'jitan-kaden',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%89%E3%83%A9%E3%83%A0%E5%BC%8F%E6%B4%97%E6%BF%AF%E4%B9%BE%E7%87%A5%E6%A9%9F/',
    name: 'ドラム式洗濯乾燥機',
    subtitle: '干す時間がゼロに。平日夜の負担を大きく減らす最有力',
    price: '¥180,000〜',
    articleSlug: 'jitanhaden-ranking-7sen',
  },
  {
    id: 'jk-dishwasher',
    category: 'jitan-kaden',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E9%A3%9F%E5%99%A8%E6%B4%97%E3%81%84%E4%B9%BE%E7%87%A5%E6%A9%9F+%E5%B7%A5%E4%BA%8B%E4%B8%8D%E8%A6%81/',
    name: '食器洗い乾燥機（工事不要タイプ可）',
    subtitle: '夜の洗い物が5分に。タンク式なら賃貸でも導入可',
    price: '¥40,000〜',
    articleSlug: 'jitanhaden-ranking-7sen',
  },
  {
    id: 'jk-electric-cooker',
    category: 'jitan-kaden',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E9%9B%BB%E6%B0%97%E5%9C%A7%E5%8A%9B%E9%8D%8B/',
    name: '電気圧力鍋',
    subtitle: 'ほったらかしで煮込みOK。帰宅後そのまま食卓へ',
    price: '¥15,000〜',
    articleSlug: 'jitanhaden-ranking-7sen',
  },

  // ========================================================================
  // 絵本・読み聞かせ ehon（3）— 楽天で買える定番絵本セット（楽天プロモ提携済）
  // 旧 eh-challenge-ehon / eh-ehonnavi / eh-fukuinkan は アフィ未承認のため代替商品で置換
  // ========================================================================
  {
    id: 'eh-guritogura-set',
    category: 'ehon',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%90%E3%82%8A%E3%81%A8%E3%81%90%E3%82%89+%E7%B5%B5%E6%9C%AC+%E3%82%BB%E3%83%83%E3%83%88/',
    name: 'ぐりとぐら 絵本セット',
    subtitle: '0歳〜幼児期の鉄板。世代を超えて愛される福音館書店の名作',
    price: '¥3,000〜',
    articleSlug: 'ehon-yomikikase-kotsu',
  },
  {
    id: 'eh-bestseller-0-3',
    category: 'ehon',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E7%B5%B5%E6%9C%AC+0%E6%AD%B3+1%E6%AD%B3+2%E6%AD%B3+3%E6%AD%B3+%E3%82%BB%E3%83%83%E3%83%88+%E3%83%99%E3%82%B9%E3%83%88%E3%82%BB%E3%83%A9%E3%83%BC/',
    name: '0〜3歳の絵本ベストセラーセット',
    subtitle: 'いないいないばあ・しろくまちゃんのほっとけーき等、定番セット',
    price: '¥2,000〜',
    articleSlug: 'ehon-yomikikase-kotsu',
  },
  {
    id: 'eh-mikke-search',
    category: 'ehon',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9F%E3%83%83%E3%82%B1+%E7%B5%B5%E6%9C%AC+%E5%AD%A6%E7%A0%94/',
    name: 'ミッケ！シリーズ（学研）',
    subtitle: '4-6歳に人気の探し絵絵本。集中力を引き出す定番',
    price: '¥1,300〜',
    articleSlug: 'ehon-yomikikase-kotsu',
  },

  // ========================================================================
  // 食育・栄養補助 shokuiku — A8提携プログラム
  // ========================================================================
  {
    id: 'sk-kodomo-banana-aojiru',
    category: 'shokuiku',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+FP0DV6+32AU+BXYE9',
    name: 'こどもバナナ青汁（Senobiru）',
    subtitle: '94.1%のお子様が「美味しい」と回答。19種類のフルーツと野菜を配合した青汁',
    price: '¥3,980前後',
    articleSlug: 'sukikirai-yasai-taisaku',
  },
  {
    id: 'cs-wonderbox',
    category: 'chiiku-subsc',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+G1IHKI+4GM8+5YRHE',
    name: 'ワンダーボックス（WonderBox）',
    subtitle: '4-10歳向けSTEAM通信教材。アプリ＋ワークブックで思考力・創造力を育む',
    price: '月額 ¥3,700〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-kodomochallenge',
    category: 'chiiku-subsc',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+A94RUA+3OR6+669JM',
    name: 'こどもちゃれんじ（ベネッセ）',
    subtitle: '0-6歳の年齢別教材。しまじろうで親しまれる定番の通信教材',
    price: '月額 ¥2,460〜',
    articleSlug: 'tsuushin-kyouzai-hikaku',
  },
  {
    id: 'ts-mogumo',
    category: 'takushoku',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+F9J44Y+5CLW+5ZEMP',
    name: 'mogumo（モグモ）',
    subtitle: '累計300万食突破。1-3歳向け幼児食冷凍宅配。栄養士監修で野菜たっぷり',
    price: '1食 ¥390〜',
    articleSlug: 'yojishoku-reitou-tsukurioki',
  },
  {
    id: 'sk-firstspoon',
    category: 'shokuiku',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+FAPZCI+4Z42+601S1',
    name: 'ファーストスプーン（離乳食宅配）',
    subtitle: '忙しいパパとママをサポート！冷凍離乳食の宅配。月齢に合わせて届く',
    price: '1食 ¥360〜',
    articleSlug: 'rinyuushoku-frozen-gekkabetsu',
  },

  // ========================================================================
  // ベビーシッター / 一時保育 babysitter（新規）
  // 各サービスの公式サイト紹介。アフィ提携は未承認のため provider='other' で
  // 純粋な紹介リンク（rel="sponsored nofollow noopener" は AffiliateLink で付与）。
  // 承認済みプログラムが揃ったら provider='a8' / 'moshimo' に切替。
  // ========================================================================
  {
    id: 'bs-kidsline',
    category: 'babysitter',
    provider: 'other',
    href: 'https://kidsline.me/',
    name: 'キッズライン',
    subtitle: '国内最大級のシッターマッチング。登録シッター数3,000人以上、当日依頼も可能',
    price: '1時間 ¥1,000〜',
  },
  {
    id: 'bs-smartsitter',
    category: 'babysitter',
    provider: 'other',
    href: 'https://smartsitter.jp/',
    name: 'スマートシッター',
    subtitle: '保育士・看護師など有資格者中心。事前面談制で初めての利用でも安心',
    price: '1時間 ¥2,200〜',
  },
  {
    id: 'bs-poppins',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.poppins-sitter.jp/',
    name: 'ポピンズシッター',
    subtitle: '創業38年のポピンズ運営。エデュケアの考えに基づく研修済みシッターが在籍',
    price: '1時間 ¥2,200〜',
  },
  {
    id: 'bs-lange',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.l-ange.co.jp/',
    name: 'ル・アンジェ',
    subtitle: '関西エリアを中心に展開する老舗派遣会社。法人・個人双方に対応',
    price: '1時間 ¥2,500〜',
  },
  {
    id: 'bs-tasker',
    category: 'babysitter',
    provider: 'other',
    href: 'https://tasker.jp/',
    name: 'タスカジ',
    subtitle: '家事代行＋子守りの相乗サービス。料理しながら子どもを見てくれる依頼が可能',
    price: '1時間 ¥1,500〜',
  },
  {
    id: 'bs-ansi',
    category: 'babysitter',
    provider: 'other',
    href: 'https://ansi-net.co.jp/',
    name: 'ANSI（アンシ）',
    subtitle: '病児・病後児保育に対応。共働き家庭の急な発熱呼び出しの強い味方',
    price: '1時間 ¥2,500〜',
  },
  {
    id: 'bs-mamasan',
    category: 'babysitter',
    provider: 'other',
    href: 'https://mamasan.co.jp/',
    name: 'ママサン',
    subtitle: '0歳〜小学生対応の家庭派遣型シッター。長時間・夜間依頼にも対応',
    price: '1時間 ¥2,000〜',
  },
  {
    id: 'bs-bear',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.bears.co.jp/babysitter/',
    name: 'ベアーズ ベビーシッター',
    subtitle: '家事代行最大手ベアーズのシッター事業。研修・サポート体制が整っている',
    price: '1時間 ¥3,300〜',
  },
  {
    id: 'bs-japan-baby-sitter',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.japan-baby.com/',
    name: 'ジャパンベビーシッターサービス',
    subtitle: '創業30年以上の老舗。研修プログラム充実で官公庁・大手企業の福利厚生にも採用',
    price: '1時間 ¥2,800〜',
  },
  {
    id: 'bs-ichijihoiku-jichitai',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.cfa.go.jp/policies/kokoseido/ichijiazukari',
    name: '自治体の一時預かり保育',
    subtitle: 'こども家庭庁の一時預かり事業。お住まいの市区町村窓口で申込可能（補助あり）',
    price: '1日 ¥0〜2,500（自治体により異なる）',
  },
  {
    id: 'bs-fureai-kosodate',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.cfa.go.jp/policies/kokoseido/family-support',
    name: 'ファミリー・サポート・センター',
    subtitle: '市区町村運営の相互援助組織。地域の援助会員が低価格で送迎・預かりに対応',
    price: '1時間 ¥700〜1,000（自治体により異なる）',
  },
  {
    id: 'bs-byoji-hoiku',
    category: 'babysitter',
    provider: 'other',
    href: 'https://www.byoujihoiku.ne.jp/',
    name: '病児保育全国ネットワーク',
    subtitle: '全国の病児保育室を検索できる公式ポータル。発熱時の預け先がワンストップで分かる',
    price: '1日 ¥2,000〜（施設により異なる）',
  },

  // ========================================================================
  // キッズ家電 kids-appliance（新規・全て楽天市場検索URL → もしも経由で自動ラップ）
  // ========================================================================
  {
    id: 'ka-sharp-humidifier',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%97+%E3%83%97%E3%83%A9%E3%82%BA%E3%83%9E%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC+%E5%8A%A0%E6%B9%BF%E5%99%A8/',
    name: 'シャープ プラズマクラスター加湿器',
    subtitle: '寝室向け静音設計。冬場の乾燥や鼻づまりが気になる赤ちゃんの部屋に',
    price: '¥10,000〜',
  },
  {
    id: 'ka-sharp-air-purifier',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%97+%E5%8A%A0%E6%B9%BF%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F+%E3%83%97%E3%83%A9%E3%82%BA%E3%83%9E%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC/',
    name: 'シャープ 加湿空気清浄機',
    subtitle: 'PM2.5・花粉・ハウスダスト対応。リビング兼子ども部屋の一台二役モデル',
    price: '¥25,000〜',
  },
  {
    id: 'ka-handy-fan-stroller',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%82%AB%E3%83%BC+%E6%89%87%E9%A2%A8%E6%A9%9F+%E3%82%AF%E3%83%AA%E3%83%83%E3%83%97/',
    name: 'ベビーカー扇風機（クリップ式）',
    subtitle: 'ベビーカーやチャイルドシートに挟むだけ。USB充電・首振り対応モデルが定番',
    price: '¥2,500〜',
  },
  {
    id: 'ka-handy-fan-kids',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%8F%E3%83%B3%E3%83%87%E3%82%A3%E3%83%95%E3%82%A1%E3%83%B3+%E5%AD%90%E4%BE%9B%E7%94%A8/',
    name: '子供用ハンディファン',
    subtitle: '指挟み防止カバー付き。通園・公園で安全に使える低騒音モデル',
    price: '¥1,800〜',
  },
  {
    id: 'ka-baby-monitor-camera',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC+%E3%82%AB%E3%83%A1%E3%83%A9/',
    name: 'ベビーモニター（カメラ式）',
    subtitle: '寝室と離れた家事スペースをつなぐカメラ式。暗視・温度センサー搭載が主流',
    price: '¥8,000〜',
  },
  {
    id: 'ka-baby-monitor-voice',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC+%E9%9F%B3%E5%A3%B0/',
    name: 'ベビーモニター（音声タイプ）',
    subtitle: '映像不要・電池長持ち。寝室と隣室の距離なら音声式で十分というご家庭に',
    price: '¥4,000〜',
  },
  {
    id: 'ka-philips-sonicare-kids',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%95%E3%82%A3%E3%83%AA%E3%83%83%E3%83%97%E3%82%B9+%E3%82%BD%E3%83%8B%E3%83%83%E3%82%B1%E3%82%A2%E3%83%BC+%E3%82%AD%E3%83%83%E3%82%BA/',
    name: 'フィリップス ソニッケアー キッズ',
    subtitle: '3歳〜小学生向け電動歯ブラシ。アプリ連動で楽しく磨き残しを減らせる',
    price: '¥5,000〜',
  },
  {
    id: 'ka-braun-oral-b-kids',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%96%E3%83%A9%E3%82%A6%E3%83%B3+%E3%82%AA%E3%83%BC%E3%83%A9%E3%83%ABB+%E3%82%AD%E3%83%83%E3%82%BA/',
    name: 'ブラウン オーラルB キッズ',
    subtitle: '3歳〜対応の丸型回転ヘッド。アプリ連動・ディズニーキャラ付モデルが人気',
    price: '¥3,500〜',
  },
  {
    id: 'ka-richell-babygate',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%AA%E3%83%83%E3%83%81%E3%82%A7%E3%83%AB+%E3%83%99%E3%83%93%E3%83%BC%E3%82%B2%E3%83%BC%E3%83%88/',
    name: 'リッチェル ベビーゲート',
    subtitle: '突っ張り式で工事不要。階段上・キッチン入口の侵入防止に。賃貸でも導入可',
    price: '¥6,500〜',
  },
  {
    id: 'ka-nihonikuji-stair-gate',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E6%97%A5%E6%9C%AC%E8%82%B2%E5%85%90+%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88%E3%82%B2%E3%83%BC%E3%83%88/',
    name: '日本育児 スマートゲート',
    subtitle: '階段上専用の壁固定タイプ。落下防止に必須のロック・自動閉まり機能',
    price: '¥10,000〜',
  },
  {
    id: 'ka-combi-bottle-sterilizer',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B3%E3%83%B3%E3%83%93+%E5%93%BA%E4%B9%B3%E7%93%B6+%E6%B6%88%E6%AF%92%E5%99%A8/',
    name: 'コンビ 哺乳瓶 電子レンジ消毒器',
    subtitle: '電子レンジで約5分の蒸気消毒。哺乳瓶3本＋小物を同時に処理できる定番',
    price: '¥3,500〜',
  },
  {
    id: 'ka-pigeon-bottle-sterilizer',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%94%E3%82%B8%E3%83%A7%E3%83%B3+%E5%93%BA%E4%B9%B3%E7%93%B6+%E6%B6%88%E6%AF%92/',
    name: 'ピジョン 哺乳瓶消毒ケース',
    subtitle: '電子レンジ＆薬液どちらも対応。そのまま保管ケースになる便利設計',
    price: '¥3,000〜',
  },
  {
    id: 'ka-beaba-babycook',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/BEABA+%E3%83%99%E3%83%93%E3%83%BC%E3%82%AF%E3%83%83%E3%82%AF/',
    name: 'BEABA ベビークック',
    subtitle: '蒸す・刻む・解凍を一台で。離乳食初期〜中期の手間を大きく削減',
    price: '¥18,000〜',
  },
  {
    id: 'ka-non-contact-thermometer',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E9%9D%9E%E6%8E%A5%E8%A7%A6+%E4%BD%93%E6%B8%A9%E8%A8%88/',
    name: '非接触体温計',
    subtitle: '赤ちゃんを起こさず1秒で検温。寝ている子の発熱チェックに重宝する',
    price: '¥3,500〜',
  },
  {
    id: 'ka-omron-ear-thermometer',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%AA%E3%83%A0%E3%83%AD%E3%83%B3+%E8%80%B3%E5%BC%8F+%E4%BD%93%E6%B8%A9%E8%A8%88/',
    name: 'オムロン 耳式体温計',
    subtitle: '耳で1秒測定。動き回るイヤイヤ期の子でも測りやすい医療機器メーカー製',
    price: '¥4,500〜',
  },
  {
    id: 'ka-baby-food-maker',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E9%9B%A2%E4%B9%B3%E9%A3%9F+%E3%83%9E%E3%82%B7%E3%83%B3+%E3%82%AF%E3%83%83%E3%82%AB%E3%83%BC/',
    name: '離乳食メーカー（蒸す・潰す一体型）',
    subtitle: '電子レンジ調理から一歩進めたい時に。蒸し器とブレンダーを兼ねるタイプ',
    price: '¥10,000〜',
  },
  {
    id: 'ka-dyson-airwrap-mom',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%80%E3%82%A4%E3%82%BD%E3%83%B3+%E3%83%89%E3%83%A9%E3%82%A4%E3%83%A4%E3%83%BC/',
    name: 'ダイソン ヘアドライヤー',
    subtitle: '大風量で乾燥時間が短い。お風呂上がりの「寒いから早く乾かして」を解決',
    price: '¥45,000〜',
  },
  {
    id: 'ka-bonecal-bottle-warmer',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E5%93%BA%E4%B9%B3%E7%93%B6%E3%82%A6%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%BC/',
    name: '哺乳瓶ウォーマー',
    subtitle: '夜間授乳の温め時間を短縮。冷蔵庫から出してすぐ適温に',
    price: '¥4,000〜',
  },
  {
    id: 'ka-nose-sucker-electric',
    category: 'kids-appliance',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E9%9B%BB%E5%8B%95+%E9%BC%BB%E6%B0%B4%E5%90%B8%E5%99%A8/',
    name: '電動鼻水吸引器（メルシーポット等）',
    subtitle: '吸引力が強く中耳炎リスクを下げる定番アイテム。耳鼻科でも勧められる',
    price: '¥10,000〜',
  },

  // ========================================================================
  // 知育玩具 educational-toy（新規・全て楽天市場検索URL → もしも経由で自動ラップ）
  // ========================================================================
  {
    id: 'et-bornelund-rainbowmaker',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9C%E3%83%BC%E3%83%8D%E3%83%AB%E3%83%B3%E3%83%89+%E3%82%AA%E3%83%BC%E3%83%AB%E3%82%A6%E3%83%83%E3%83%89%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF%E3%82%B9/',
    name: 'ボーネルンド オールウッドブロックス',
    subtitle: '3歳〜の木製積み木。色・形・組合せで創造力を育てる定番輸入玩具',
    price: '¥7,700〜',
  },
  {
    id: 'et-plantoys-walker',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/Plan+Toys+%E6%9C%A8%E8%A3%BD/',
    name: 'Plan Toys 木製おもちゃ',
    subtitle: 'タイ発のサステナブル木製ブランド。1歳〜長く遊べる手押し車や積み木',
    price: '¥3,500〜',
  },
  {
    id: 'et-imtoy-sortingbox',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/I%27m+Toy+%E6%9C%A8%E8%A3%BD/',
    name: "I'm Toy 木製知育おもちゃ",
    subtitle: '型はめパズル・色分けボックスなど1歳半〜2歳の手先発達を促す定番',
    price: '¥3,000〜',
  },
  {
    id: 'et-hape-quadrilla',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/Hape+%E3%82%AF%E3%82%A2%E3%83%89%E3%83%AA%E3%83%A9/',
    name: 'Hape クアドリラ',
    subtitle: '4歳〜のビー玉転がしレール。物理法則と段取りを学べる人気STEM玩具',
    price: '¥8,000〜',
  },
  {
    id: 'et-kumon-jigsaw',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%8F%E3%82%82%E3%82%93+%E3%82%B8%E3%82%B0%E3%82%BD%E3%83%BC%E3%83%91%E3%82%BA%E3%83%AB/',
    name: 'くもんのジグソーパズル STEP',
    subtitle: '2ピース〜の段階別パズル。年齢に合わせて難易度を上げられる定番教材',
    price: '¥1,300〜',
  },
  {
    id: 'et-gakken-puzzle',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E5%AD%A6%E7%A0%94+%E7%9F%A5%E8%82%B2+%E3%83%91%E3%82%BA%E3%83%AB/',
    name: '学研 知育パズル',
    subtitle: '2歳・3歳・4歳の年齢別パズル。集中力・指先の使い方を遊びながら育む',
    price: '¥800〜',
  },
  {
    id: 'et-ravensburger-puzzle',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%A9%E3%83%99%E3%83%B3%E3%82%B9%E3%83%96%E3%83%AB%E3%82%AC%E3%83%BC+%E3%83%91%E3%82%BA%E3%83%AB/',
    name: 'ラベンスバーガー パズル',
    subtitle: 'ドイツ発の世界的パズルメーカー。2歳〜大人まで段階別ピース数を揃える',
    price: '¥1,500〜',
  },
  {
    id: 'et-kapla',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/KAPLA+%E3%82%AB%E3%83%97%E3%83%A9/',
    name: 'KAPLA カプラ',
    subtitle: 'フランス発の魔法の板。同サイズの木片を積むだけで立体表現が広がる',
    price: '¥6,500〜',
  },
  {
    id: 'et-naef-tsumiki',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%8D%E3%83%95+%E7%A9%8D%E3%81%BF%E6%9C%A8/',
    name: 'ネフ 積み木',
    subtitle: 'スイスの高級木製玩具メーカー。リグノやネフスピールが代表作',
    price: '¥18,000〜',
  },
  {
    id: 'et-magnadoodle',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9E%E3%82%B0%E3%83%8A%E3%83%BB%E3%83%89%E3%82%A5%E3%83%BC%E3%83%89%E3%83%AB/',
    name: 'マグナ・ドゥードゥル',
    subtitle: '2歳〜の磁石お絵かきボード。インクなしで何度も描き直せて省管理',
    price: '¥3,500〜',
  },
  {
    id: 'et-water-doodle-mat',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E6%B0%B4+%E3%81%8A%E7%B5%B5%E6%8F%8F%E3%81%8D+%E3%83%9E%E3%83%83%E3%83%88/',
    name: '水でお絵かきマット',
    subtitle: '水だけで描ける大判マット。汚れず床も濡らさず、1歳〜の表現遊びに',
    price: '¥2,000〜',
  },
  {
    id: 'et-anpanman-tablet',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%B3%E3%83%91%E3%83%B3%E3%83%9E%E3%83%B3+%E7%9F%A5%E8%82%B2+%E3%83%91%E3%83%83%E3%83%89/',
    name: 'アンパンマン カラーキッズタブレット',
    subtitle: '2歳〜の文字・数・ことば学習タブレット。アンパンマン好きの初期教材に',
    price: '¥6,500〜',
  },
  {
    id: 'et-shimajiro-tablet',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%97%E3%81%BE%E3%81%98%E3%82%8D%E3%81%86+%E3%82%BF%E3%83%96%E3%83%AC%E3%83%83%E3%83%88/',
    name: 'しまじろう プログラミング知育タブレット',
    subtitle: 'こどもちゃれんじキャラの知育タブレット。3歳〜の生活習慣・ひらがな対応',
    price: '¥7,000〜',
  },
  {
    id: 'et-balance-wobble-board',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%AF%E3%83%96%E3%83%AB%E3%83%9C%E3%83%BC%E3%83%89+%E5%AD%90%E4%BE%9B/',
    name: 'ワブルボード（バランスボード）',
    subtitle: '室内で体幹トレーニング。雨の日や運動不足解消に、3歳〜大人まで使える',
    price: '¥5,500〜',
  },
  {
    id: 'et-keyboard-toy',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E5%AD%90%E4%BE%9B+%E9%8D%B5%E7%9B%A4+%E3%81%8A%E3%82%82%E3%81%A1%E3%82%83/',
    name: '子供用ミニキーボード',
    subtitle: '電子音とリズム伴奏付き。3歳〜の音感遊び・はじめての鍵盤に',
    price: '¥3,500〜',
  },
  {
    id: 'et-mokkin-xylophone',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E5%AD%90%E4%BE%9B+%E6%9C%A8%E7%90%B4/',
    name: '子供用木琴',
    subtitle: '1歳半〜の音感おもちゃ。色付き鍵盤で曲が叩ける入門木琴の定番',
    price: '¥2,000〜',
  },
  {
    id: 'et-dwe-disney-english',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%87%E3%82%A3%E3%82%BA%E3%83%8B%E3%83%BC+%E8%8B%B1%E8%AA%9E+%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0/',
    name: 'ディズニー英語システム（中古セット）',
    subtitle: '0歳〜未就学児の英語教材として定評。中古市場でも需要が高いロングセラー',
    price: '¥30,000〜',
  },
  {
    id: 'et-voila-montessori',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/Voila+%E3%83%A2%E3%83%B3%E3%83%86%E3%83%83%E3%82%BD%E3%83%BC%E3%83%AA/',
    name: 'Voila（ボイラ）モンテッソーリ玩具',
    subtitle: 'タイ発のモンテッソーリ系木製玩具。1〜3歳の指先・形合わせ遊びに',
    price: '¥2,500〜',
  },
  {
    id: 'et-erzi-montessori',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/Erzi+%E3%82%A8%E3%83%AB%E3%83%84%E3%82%A3/',
    name: 'Erzi（エルツィ）ままごとセット',
    subtitle: 'ドイツの木製ままごと玩具。本物そっくりの食材で「見立て遊び」が広がる',
    price: '¥3,500〜',
  },
  {
    id: 'et-ghost-catch',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%8A%E3%81%B0%E3%81%91%E3%82%AD%E3%83%A3%E3%83%83%E3%83%81/',
    name: 'おばけキャッチ',
    subtitle: '4歳〜のカードゲーム。瞬発力・色形認識を遊びながら鍛える定番ボードゲーム',
    price: '¥2,200〜',
  },
  {
    id: 'et-sugoroku-kids',
    category: 'educational-toy',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%81%99%E3%81%94%E3%82%8D%E3%81%8F+%E5%AD%90%E4%BE%9B%E5%90%91%E3%81%91/',
    name: '子供用すごろくゲーム',
    subtitle: '数の理解・ルールに従う練習に。3歳〜家族で遊べる定番ボードゲーム',
    price: '¥1,500〜',
  },
];

/**
 * 指定カテゴリのカタログ商品を返す。
 * 'all' の場合は全商品。
 */
export function getCatalogItems(category: CatalogCategory | 'all'): CatalogItem[] {
  if (category === 'all') return CATALOG_ITEMS;
  return CATALOG_ITEMS.filter((item) => item.category === category);
}

// ============================================================================
// 季節／月ごとのおすすめロジック
//
// - ホームページ「今月、親たちが選んでいるもの」セクション
// - /items ページのカテゴリヘッダーに付く「◯月のおすすめ」バッジ
// で共通して使う。月数 (1-12) をキーに、カテゴリ単位の推奨と
// カテゴリごとのバッジ文言を返す純粋関数として実装する。
// ============================================================================

/**
 * 月ごとのカテゴリ推奨順。ここに並んだカテゴリ順で商品を抽出し、
 * ホームページの「今月のおすすめ」カード（4〜6枠）を埋める。
 *
 * - 3〜4月: 入園準備（抱っこ紐・ベビーカー・絵本）
 * - 5〜6月: 梅雨／GW（家遊びサブスク・絵本・時短家電）
 * - 7〜9月: 夏・暑さ対策／運動会（ベビーカー・宅食・時短家電）
 * - 10〜11月: 七五三・紅葉（ベビーカー・ベビーチェア・絵本）
 * - 12〜2月: 冬・風邪・クリスマス（知育サブスク・絵本・時短家電）
 */
const MONTH_CATEGORY_PRIORITY: Record<number, CatalogCategory[]> = {
  1: ['chiiku-subsc', 'ehon', 'jitan-kaden', 'takushoku', 'baby-chair'],
  2: ['chiiku-subsc', 'ehon', 'senzai', 'jitan-kaden', 'takushoku'],
  3: ['dakkohimo', 'babycar', 'ehon', 'baby-chair', 'senzai'],
  4: ['dakkohimo', 'babycar', 'baby-chair', 'ehon', 'senzai'],
  5: ['ehon', 'chiiku-subsc', 'babycar', 'jitan-kaden', 'takushoku'],
  6: ['chiiku-subsc', 'ehon', 'jitan-kaden', 'senzai', 'takushoku'],
  7: ['babycar', 'takushoku', 'jitan-kaden', 'dakkohimo', 'ehon'],
  8: ['babycar', 'takushoku', 'jitan-kaden', 'chiiku-subsc', 'ehon'],
  9: ['babycar', 'baby-chair', 'takushoku', 'jitan-kaden', 'ehon'],
  10: ['babycar', 'baby-chair', 'ehon', 'senzai', 'chiiku-subsc'],
  11: ['babycar', 'ehon', 'baby-chair', 'chiiku-subsc', 'jitan-kaden'],
  12: ['chiiku-subsc', 'ehon', 'jitan-kaden', 'takushoku', 'baby-chair'],
};

/**
 * 月×カテゴリ の「季節バッジ」文言。
 * /items ページのカテゴリヘッダーに「◯月のおすすめ」として表示する。
 *
 * 月ごと全カテゴリにバッジを振るのは逆に情報過多なので、
 * 「その月に特に推したいカテゴリ」のみに文言を用意する。
 * 該当がないカテゴリ/月の組み合わせは undefined を返す。
 */
const MONTH_CATEGORY_BADGE: Partial<
  Record<number, Partial<Record<CatalogCategory, string>>>
> = {
  1: { 'chiiku-subsc': '冬のおうち時間に', ehon: '冬の読み聞かせに', 'jitan-kaden': '冬の家事軽減に' },
  2: { 'chiiku-subsc': '冬の室内遊びに', ehon: '冬の読み聞かせに', senzai: '冬の肌トラブル対策に' },
  3: { dakkohimo: '春の入園準備に', babycar: '春のお出かけに', ehon: '入園前の読み聞かせに' },
  4: { dakkohimo: '入園シーズンに', babycar: '春のお出かけに', 'baby-chair': '新生活の食卓に', ehon: '入園準備に' },
  5: { ehon: 'GWのおうち時間に', babycar: 'GWのお出かけに', 'chiiku-subsc': 'こどもの日の知育に' },
  6: { 'chiiku-subsc': '梅雨の室内遊びに', ehon: '梅雨のおうち時間に', senzai: '梅雨の部屋干しに' },
  7: { babycar: '夏のお出かけに', takushoku: '夏バテ対策に', 'jitan-kaden': '猛暑の家事軽減に' },
  8: { babycar: '夏休みのお出かけに', takushoku: '夏バテ対策に', 'jitan-kaden': '猛暑の家事軽減に' },
  9: { babycar: '運動会シーズンに', 'baby-chair': '秋の食卓に', takushoku: '新学期の平日ごはんに' },
  10: { babycar: '七五三シーズンに', 'baby-chair': '秋の食卓に', senzai: '秋の敏感肌に' },
  11: { ehon: '冬支度の読み聞かせに', babycar: '紅葉お出かけに', 'baby-chair': '食卓の見直しに' },
  12: { 'chiiku-subsc': 'クリスマスプレゼントに', ehon: 'クリスマス絵本に', 'jitan-kaden': '年末の家事軽減に' },
};

function normalizeMonth(month: number): number {
  if (!Number.isFinite(month)) return 1;
  const m = Math.floor(month);
  if (m < 1) return 1;
  if (m > 12) return 12;
  return m;
}

/**
 * 「今月のおすすめカテゴリ」の優先順リスト。
 * month は 1-12（JST）。範囲外はクランプ。
 */
export function getMonthlyCategoryPriority(month: number): CatalogCategory[] {
  const m = normalizeMonth(month);
  return MONTH_CATEGORY_PRIORITY[m] ?? MONTH_CATEGORY_PRIORITY[4]!;
}

/**
 * ホームページの「今月、親たちが選んでいるもの」用に、
 * 月の推奨カテゴリ優先順から順に各カテゴリ先頭1商品をピックして
 * 合計 `limit` 件（デフォルト6件）を返す。
 */
export function getMonthlyPickedItems(
  month: number,
  limit = 6,
): CatalogItem[] {
  const priority = getMonthlyCategoryPriority(month);
  const picked: CatalogItem[] = [];
  const seen = new Set<string>();

  for (const cat of priority) {
    const item = CATALOG_ITEMS.find(
      (it) => it.category === cat && !seen.has(it.id),
    );
    if (item) {
      picked.push(item);
      seen.add(item.id);
    }
    if (picked.length >= limit) break;
  }

  // 万一 priority だけでは足りない場合は、全カタログから補完
  if (picked.length < limit) {
    for (const it of CATALOG_ITEMS) {
      if (seen.has(it.id)) continue;
      picked.push(it);
      seen.add(it.id);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}

/**
 * /items ページ用のカテゴリヘッダーバッジ文言。
 * 該当月にそのカテゴリのバッジが定義されていなければ undefined。
 */
export function getSeasonalBadgeForCategory(
  month: number,
  category: CatalogCategory,
): string | undefined {
  const m = normalizeMonth(month);
  return MONTH_CATEGORY_BADGE[m]?.[category];
}

/**
 * カテゴリ（サイト記事カテゴリ slug → `/category/[slug]`）→
 * 関連のカタログカテゴリへのマッピング。
 * カテゴリページ下部「このカテゴリで人気の商品」で使う。
 */
const ARTICLE_CATEGORY_TO_CATALOG: Record<string, CatalogCategory[]> = {
  'today-doko': ['babycar', 'dakkohimo'],
  'today-nani': ['chiiku-subsc', 'ehon'],
  'today-taberu': ['takushoku', 'baby-chair'],
  'today-mawasu': ['jitan-kaden', 'takushoku'],
  'shippai-shinai': ['babycar', 'dakkohimo'],
  tenki: ['babycar', 'chiiku-subsc'],
  'heijitsu-yoru': ['jitan-kaden', 'takushoku'],
  gyouji: ['ehon', 'dakkohimo'],
  narai: ['ehon', 'chiiku-subsc'],
  yakudatsu: ['jitan-kaden', 'takushoku', 'senzai'],
};

/**
 * 記事カテゴリ slug を受け取り、「このカテゴリで人気の商品」を最大 `limit` 件返す。
 * カテゴリ未マッピングの場合は空配列。
 */
export function getPopularItemsForArticleCategory(
  categorySlug: string,
  limit = 3,
): CatalogItem[] {
  const catalogCats = ARTICLE_CATEGORY_TO_CATALOG[categorySlug];
  if (!catalogCats || catalogCats.length === 0) return [];

  const picked: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const cat of catalogCats) {
    for (const it of CATALOG_ITEMS) {
      if (it.category !== cat) continue;
      if (seen.has(it.id)) continue;
      picked.push(it);
      seen.add(it.id);
      if (picked.length >= limit) break;
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

/**
 * TodayFinder の条件（place / age / weather / day）から
 * 「あったら便利な3アイテム」を返す。/today の結果ページで使用。
 *
 * - place=outside → ベビーカー / 抱っこ紐
 * - place=home + duration<=60 → 知育サブスク / 絵本
 * - day=weekday → 時短家電 / 宅食
 * - 上記いずれにも該当しなければ jitan-kaden / takushoku を default
 */
export function getItemsForTodayQuery(query: {
  place?: string;
  day?: string;
  duration?: string;
  age?: string;
  weather?: string;
}, limit = 3): CatalogItem[] {
  const cats: CatalogCategory[] = [];

  if (query.place === 'outside') {
    cats.push('babycar', 'dakkohimo');
  } else if (query.place === 'home') {
    if (query.age === '0-1') {
      cats.push('chiiku-subsc', 'baby-chair', 'ehon');
    } else {
      cats.push('chiiku-subsc', 'ehon');
    }
  }

  if (query.day === 'weekday') {
    cats.push('jitan-kaden', 'takushoku');
  }

  if (query.weather === 'rain' || query.weather === 'heat' || query.weather === 'cold') {
    cats.push('chiiku-subsc', 'ehon');
  }

  // デフォルト補完
  if (cats.length === 0) {
    cats.push('jitan-kaden', 'takushoku', 'babycar');
  }

  const picked: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const cat of cats) {
    for (const it of CATALOG_ITEMS) {
      if (it.category !== cat) continue;
      if (seen.has(it.id)) continue;
      picked.push(it);
      seen.add(it.id);
      if (picked.length >= limit) break;
    }
    if (picked.length >= limit) break;
  }
  return picked;
}

/**
 * プラン（content/plans/*.md）の属性から「あったら便利な3アイテム」を返す。
 * /plan/[id] ページの本文下に控えめなアフィCTAとして表示する。
 *
 * - kind=meal           → 冷凍宅食 / ベビーチェア
 * - place に outdoor/indoor → ベビーカー / 抱っこ紐
 * - place に home        → 知育玩具 / 絵本 / 知育サブスク（0-1歳はベビーチェアも）
 * - いずれにも該当しなければ 時短家電 / 知育玩具 / 宅食 を default
 */
export function getItemsForPlan(
  plan: {
    place?: string[];
    kind?: string;
    ageRanges?: string[];
  },
  limit = 3,
): CatalogItem[] {
  const cats: CatalogCategory[] = [];
  const place = plan.place ?? [];
  const age0 = plan.ageRanges?.[0];

  if (plan.kind === 'meal') {
    cats.push('takushoku', 'baby-chair');
  }
  if (place.includes('outdoor') || place.includes('indoor')) {
    cats.push('babycar', 'dakkohimo');
  }
  if (place.includes('home')) {
    if (age0 === '0-1') {
      cats.push('ehon', 'baby-chair', 'chiiku-subsc');
    } else {
      cats.push('educational-toy', 'ehon', 'chiiku-subsc');
    }
  }

  // デフォルト補完
  if (cats.length === 0) {
    cats.push('jitan-kaden', 'educational-toy', 'takushoku');
  }

  const picked: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const cat of cats) {
    for (const it of CATALOG_ITEMS) {
      if (it.category !== cat) continue;
      if (seen.has(it.id)) continue;
      picked.push(it);
      seen.add(it.id);
      if (picked.length >= limit) break;
    }
    if (picked.length >= limit) break;
  }
  return picked;
}
