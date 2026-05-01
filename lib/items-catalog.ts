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
