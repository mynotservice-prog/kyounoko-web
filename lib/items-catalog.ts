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
    provider: 'amazon',
    href: '#',
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
    provider: 'amazon',
    href: '#',
    name: 'ベビービョルン ONE KAI Air',
    subtitle: '前向き抱っこ対応・メッシュで夏も快適',
    price: '¥24,200前後',
    articleSlug: 'dakkohimo-ranking-2026',
  },
  {
    id: 'dk-aprica-colan',
    category: 'dakkohimo',
    provider: 'yahoo',
    href: '#',
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
    provider: 'amazon',
    href: '#',
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
    provider: 'amazon',
    href: '#',
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
    provider: 'yahoo',
    href: '#',
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
    provider: 'a8',
    href: '#',
    name: 'トイサブ！',
    subtitle: '業界最大手・月齢に合わせて知育玩具6点が届く',
    price: '月額 ¥3,674〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-chachacha',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: '#',
    name: 'Cha Cha Cha（チャチャチャ）',
    subtitle: '初月¥0キャンペーン・学研ステイフル監修プラン有',
    price: '月額 ¥3,630〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-andtoybox',
    category: 'chiiku-subsc',
    provider: 'a8',
    href: '#',
    name: 'And TOYBOX（アンドトイボックス）',
    subtitle: 'LINEでおもちゃ変更相談OK・個別カスタマイズ型',
    price: '月額 ¥3,278〜',
    articleSlug: 'chiiku-subsc-hikaku-4sha',
  },
  {
    id: 'cs-kidslab',
    category: 'chiiku-subsc',
    provider: 'moshimo',
    href: '#',
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
    provider: 'amazon',
    href: '#',
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
    provider: 'amazon',
    href: '#',
    name: 'ベビービョルン ハイチェア',
    subtitle: 'テーブルが前方にせり出し、立ち上がり防止に強い',
    price: '¥33,000前後',
    articleSlug: 'baby-chair-ranking',
  },
  {
    id: 'bch-katoji',
    category: 'baby-chair',
    provider: 'yahoo',
    href: '#',
    name: 'カトージ プレミアムベビーチェア',
    subtitle: '高さ10段階調整・リクライニング対応',
    price: '¥16,500前後',
    articleSlug: 'baby-chair-ranking',
  },

  // ========================================================================
  // 冷凍宅食（3）
  // ========================================================================
  {
    id: 'ts-nosh',
    category: 'takushoku',
    provider: 'a8',
    href: '#',
    name: 'nosh（ナッシュ）',
    subtitle: '糖質30g・塩分2.5g以下の冷凍弁当。メニュー80種以上',
    price: '1食 ¥599〜',
    articleSlug: 'takushoku-service-hikaku-3sha',
  },
  {
    id: 'ts-mitsuboshi',
    category: 'takushoku',
    provider: 'moshimo',
    href: '#',
    name: '三ツ星ファーム',
    subtitle: '一流シェフ監修・おかずのみの冷凍デリ',
    price: '1食 ¥626〜',
    articleSlug: 'takushoku-service-hikaku-3sha',
  },
  {
    id: 'ts-tsurukame',
    category: 'takushoku',
    provider: 'a8',
    href: '#',
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
    provider: 'amazon',
    href: '#',
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
    provider: 'amazon',
    href: '#',
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
  // 絵本・読み聞かせ ehon（3）— 新規
  // ========================================================================
  {
    id: 'eh-challenge-ehon',
    category: 'ehon',
    provider: 'a8',
    href: '#',
    name: 'こどもちゃれんじ 絵本',
    subtitle: '月齢に合わせた絵本+付録。初めての知育にも',
    price: '月額 ¥2,460〜',
    articleSlug: 'ehon-yomikikase-kotsu',
  },
  {
    id: 'eh-fukuinkan',
    category: 'ehon',
    provider: 'moshimo',
    href: '#',
    name: '福音館書店 月刊絵本',
    subtitle: '「こどものとも」「かがくのとも」など定期購読',
    price: '月額 ¥440〜',
    articleSlug: 'ehon-yomikikase-kotsu',
  },
  {
    id: 'eh-ehonnavi',
    category: 'ehon',
    provider: 'a8',
    href: '#',
    name: '絵本ナビ プレミアム',
    subtitle: '人気絵本が全ページ試し読み。年齢別に探せる',
    price: '月額 ¥580〜',
    articleSlug: 'seal-book-ranking',
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
