import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';

/**
 * アフィリエイトリンクを差し込む対象となる記事 slug 一覧。
 * これ以外の slug ではアフィリエイト UI は表示しない。
 */
export const AFFILIATE_TARGET_SLUGS = [
  'dakkohimo-ranking-2026',
  'babycar-ranking-2026',
  'chiiku-subsc-hikaku-4sha',
  'baby-chair-ranking',
  'takushoku-service-hikaku-3sha',
] as const;

export type AffiliateTargetSlug = (typeof AFFILIATE_TARGET_SLUGS)[number];

export type AffiliateProduct = AffiliateLinkProps & {
  id: string;
  slug: AffiliateTargetSlug;
};

/**
 * href の運用ルール:
 *  - provider='rakuten': 楽天市場の商品URL（https://item.rakuten.co.jp/...）を設定。
 *    AffiliateLink コンポーネントが env が設定されていれば自動でもしも経由にラップ。
 *    env: NEXT_PUBLIC_MOSHIMO_A_ID / NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID /
 *         NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID
 *  - provider='amazon' / 'yahoo' / 'a8' / 'moshimo': 当該ASP発行のトラッキングURLを直書き。
 *  - '#' はまだ未取得の状態を表すプレースホルダ。
 */
const PRODUCTS: AffiliateProduct[] = [
  // =======================================================================
  // 抱っこ紐ランキング2026
  // =======================================================================
  {
    id: 'dk-ergo-omni-breeze',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A8%E3%83%AB%E3%82%B4%E3%83%99%E3%83%93%E3%83%BC+OMNI+Breeze/',
    title: 'エルゴベビー OMNI Breeze',
    subtitle: '新生児〜20kg対応・通気性SoftFlex採用のロングセラー',
    price: '¥27,500前後',
  },
  {
    id: 'dk-konny',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    // 楽天市場の検索URL。コニー抱っこ紐 FLEX サマー
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B3%E3%83%8B%E3%83%BC+%E6%8A%B1%E3%81%A3%E3%81%93%E7%B4%90+FLEX+%E3%82%B5%E3%83%9E%E3%83%BC/',
    title: 'コニー抱っこ紐 FLEX サマー',
    subtitle: 'スリングタイプ・軽量200gで寝かしつけに強い',
    price: '¥7,900前後',
  },
  {
    id: 'dk-babybjorn-one-kai',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%93%E3%83%A7%E3%83%AB%E3%83%B3+ONE+KAI+Air/',
    title: 'ベビービョルン ONE KAI Air',
    subtitle: '前向き抱っこ対応・メッシュで夏も快適',
    price: '¥24,200前後',
  },
  {
    id: 'dk-aprica-colan',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%83%E3%83%97%E3%83%AA%E3%82%AB+%E3%82%B3%E3%83%A9%E3%83%B3%E3%83%8F%E3%82%B0+AB/',
    title: 'アップリカ コランハグ AB',
    subtitle: 'ヘッドサポートが厚めで首すわり前も使いやすい',
    price: '¥22,000前後',
  },
  {
    id: 'dk-boba-wrap',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%9C%E3%83%90%E3%83%A9%E3%83%83%E3%83%97+ORIGINAL/',
    title: 'ボバラップ ORIGINAL',
    subtitle: '布タイプで新生児に密着・授乳後の寝かしつけに',
    price: '¥8,800前後',
  },

  // =======================================================================
  // ベビーカーランキング2026
  // =======================================================================
  {
    id: 'bc-aprica-luxuna',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A2%E3%83%83%E3%83%97%E3%83%AA%E3%82%AB+%E3%83%A9%E3%82%AF%E3%83%BC%E3%83%8A%E3%82%AF%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3AG/',
    title: 'アップリカ ラクーナクッションAG',
    subtitle: '振動を抑える4輪サスペンション・軽量5.2kg',
    price: '¥49,500前後',
  },
  {
    id: 'bc-combi-atto',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B3%E3%83%B3%E3%83%93+%E3%82%A2%E3%83%83%E3%83%88%E3%83%A6%E3%83%BC%E3%82%B8%E3%83%A5+%E3%82%A8%E3%83%83%E3%82%B0%E3%82%B7%E3%83%A7%E3%83%83%E3%82%AF/',
    title: 'コンビ アットユージュ エッグショック',
    subtitle: '衝撃吸収素材採用・段差に強いハイシート',
    price: '¥52,800前後',
  },
  {
    id: 'bc-cybex-libelle',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B5%E3%82%A4%E3%83%99%E3%83%83%E3%82%AF%E3%82%B9+%E3%83%AA%E3%83%99%E3%83%AB/',
    title: 'サイベックス リベル',
    subtitle: '機内持ち込みサイズまで畳める超コンパクト',
    price: '¥26,400前後',
  },
  {
    id: 'bc-airbuggy-coco',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%A8%E3%82%A2%E3%83%90%E3%82%AE%E3%83%BC+COCO+%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2/',
    title: 'エアバギー COCO プレミア',
    subtitle: '3輪エアタイヤで舗装の悪い道でも安定走行',
    price: '¥77,000前後',
  },
  {
    id: 'bc-pigeon-runfee',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%94%E3%82%B8%E3%83%A7%E3%83%B3+%E3%83%A9%E3%83%B3%E3%83%95%E3%82%A3+%E3%83%AA%E3%83%8E%E3%83%B3/',
    title: 'ピジョン ランフィ リノン',
    subtitle: '片手で押しやすい直進性・シングルタイヤ',
    price: '¥48,400前後',
  },

  // =======================================================================
  // 知育サブスク比較4社
  // =======================================================================
  {
    id: 'cs-toysub',
    slug: 'chiiku-subsc-hikaku-4sha',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497153&p_id=4587&pc_id=11989&pl_id=61358',
    title: 'トイサブ！',
    subtitle: '業界最大手・月齢に合わせて知育玩具6点が届く',
    price: '月額 ¥3,674〜',
  },
  {
    id: 'cs-chachacha',
    slug: 'chiiku-subsc-hikaku-4sha',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497168&p_id=3329&pc_id=7908&pl_id=47419',
    title: 'Cha Cha Cha（チャチャチャ）',
    subtitle: '初月¥0キャンペーン・学研ステイフル監修プラン有',
    price: '月額 ¥3,630〜',
  },
  {
    id: 'cs-andtoybox',
    slug: 'chiiku-subsc-hikaku-4sha',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497156&p_id=2231&pc_id=4745&pl_id=31455',
    title: 'And TOYBOX（アンドトイボックス）',
    subtitle: 'LINEでおもちゃ変更相談OK・個別カスタマイズ型',
    price: '月額 ¥3,278〜',
  },
  {
    id: 'cs-kidslab',
    slug: 'chiiku-subsc-hikaku-4sha',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497170&p_id=2450&pc_id=5374&pl_id=32293',
    title: 'キッズ・ラボラトリー',
    subtitle: '隔月プランあり・初月980円のお試しが可能',
    price: '月額 ¥2,574〜',
  },

  // =======================================================================
  // ベビーチェアランキング
  // =======================================================================
  {
    id: 'bch-stokke-tripp-trapp',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%B9%E3%83%88%E3%83%83%E3%82%B1+%E3%83%88%E3%83%AA%E3%83%83%E3%83%97+%E3%83%88%E3%83%A9%E3%83%83%E3%83%97/',
    title: 'ストッケ トリップ トラップ',
    subtitle: '0歳〜大人まで座れる長寿命ハイチェア',
    price: '¥34,100前後',
  },
  {
    id: 'bch-richell',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%AA%E3%83%83%E3%83%81%E3%82%A7%E3%83%AB+2WAY+%E3%81%94%E3%81%8D%E3%81%92%E3%82%93%E3%83%81%E3%82%A7%E3%82%A2/',
    title: 'リッチェル 2WAYごきげんチェア',
    subtitle: 'ローチェア・テーブル付きで離乳食初期に便利',
    price: '¥4,800前後',
  },
  {
    id: 'bch-babybjorn',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%83%99%E3%83%93%E3%83%BC%E3%83%93%E3%83%A7%E3%83%AB%E3%83%B3+%E3%83%8F%E3%82%A4%E3%83%81%E3%82%A7%E3%82%A2/',
    title: 'ベビービョルン ハイチェア',
    subtitle: 'テーブルが前方にせり出し、立ち上がり防止に強い',
    price: '¥33,000前後',
  },
  {
    id: 'bch-katoji',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://search.rakuten.co.jp/search/mall/%E3%82%AB%E3%83%88%E3%83%BC%E3%82%B8+%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2%E3%83%A0%E3%83%99%E3%83%93%E3%83%BC%E3%83%81%E3%82%A7%E3%82%A2/',
    title: 'カトージ プレミアムベビーチェア',
    subtitle: '高さ10段階調整・リクライニング対応',
    price: '¥16,500前後',
  },

  // =======================================================================
  // 宅食サービス比較3社
  // =======================================================================
  {
    id: 'ts-nosh',
    slug: 'takushoku-service-hikaku-3sha',
    provider: 'a8',
    href: 'https://nosh.jp/',
    title: 'nosh（ナッシュ）',
    subtitle: '糖質30g・塩分2.5g以下の冷凍弁当。メニュー80種以上',
    price: '1食 ¥599〜',
  },
  // NOTE: ts-mitsuboshi (三ツ星ファーム) は もしも未承認 + 素URLで遷移不可のため削除。

  {
    id: 'ts-tsurukame',
    slug: 'takushoku-service-hikaku-3sha',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+BLCVUA+48GW+626XU',
    title: 'Dr.つるかめキッチン',
    subtitle: '管理栄養士+医師監修・塩分／糖質など制限食に強い',
    price: '1食 ¥663〜',
  },
];

/**
 * 指定 slug に紐づくアフィリエイト商品を返す。
 * 対象外の slug の場合は空配列を返す。
 */
export function getAffiliateProducts(slug: string): AffiliateProduct[] {
  if (!isAffiliateTargetSlug(slug)) return [];
  return PRODUCTS.filter((p) => p.slug === slug);
}

export function isAffiliateTargetSlug(slug: string): slug is AffiliateTargetSlug {
  return (AFFILIATE_TARGET_SLUGS as readonly string[]).includes(slug);
}
