import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';

/**
 * アフィリエイトリンクを差し込む対象となる記事 slug 一覧。
 * これ以外の slug ではアフィリエイト UI は表示しない。
 */
export const AFFILIATE_TARGET_SLUGS = [
  // 既存
  'dakkohimo-ranking-2026',
  'babycar-ranking-2026',
  'chiiku-subsc-hikaku-4sha',
  'baby-chair-ranking',
  'takushoku-service-hikaku-3sha',
  // 2026-05 追加（A8 こどもちゃれんじ・ワンダーボックス系）
  'chiiku-subsc-3sha-2026-comparison',
  'chiku-naraigoto-kumon-shichida-monte',
  'eigo-naraigoto-nansai-kara',
  'naraigoto-hajimedoki-kiketsu',
  'naraigoto-itsukara-0-6sai',
  'eigo-kyouzai-3brand-2-6sai',
  'chiiku-toys-3brand-2-4sai',
  '3sai-hiragana-yomenai-ouchi-gakushuu',
  // 離乳食宅配（モグモ・ファーストスプーン）
  'rinyuushoku-frozen-gekkabetsu',
  'yojishoku-reitou-tsukurioki',
  'kodomo-obento-reitou-stock-5sen',
  'youjishoku-kanryouki-1week-rota',
  'rinyuushoku-dekinai-kao-awanai-baby',
  'kodomo-asa-udon-tamagotoji-rinyuushoku-go',
  // 写真スタジオ（スタジオシエル）
  'keirou-no-hi-4sai-photo-message-card',
  'kodomo-natsu-photo-toshi-kata-5',
  // ベビー用品（Hariti）
  'shussan-junbi-rakuten-0sai',
  // もしも 提携（絵本・写真・英語・知育サブスク補強）
  'ehon-yomikikase-kotsu',
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
  // NOTE: ts-nosh はアフィ未承認のため削除
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

// =======================================================================
// 2026-05 追加：A8.net 提携プログラム
// 同一プログラムを複数記事にまたがって表示するためのヘルパー。
// 1個のプログラム定義から、対象 slug 配列分の AffiliateProduct を展開する。
// =======================================================================

type A8ProgramDef = Omit<AffiliateProduct, 'slug'> & { slugs: readonly AffiliateTargetSlug[] };

function expand(defs: A8ProgramDef[]): AffiliateProduct[] {
  const out: AffiliateProduct[] = [];
  for (const def of defs) {
    const { slugs, ...rest } = def;
    for (const slug of slugs) {
      out.push({ ...rest, slug });
    }
  }
  return out;
}

const A8_PROGRAMS_2026_05: AffiliateProduct[] = expand([
  // ---- ① こどもちゃれんじ・進研ゼミ（最強プログラム / EPC 349.57） ----
  {
    id: 'a8-kodomochallenge',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+A94RUA+3OR6+73HJ5',
    title: 'こどもちゃれんじ・進研ゼミ（ベネッセ）',
    subtitle: '0歳〜中学生まで、資料請求は無料。年齢別教材・付録・添削指導',
    price: '資料請求 無料 / 入会 月額¥1,990〜',
    slugs: [
      'chiiku-subsc-hikaku-4sha',
      'chiiku-subsc-3sha-2026-comparison',
      'chiku-naraigoto-kumon-shichida-monte',
      'eigo-naraigoto-nansai-kara',
      'naraigoto-hajimedoki-kiketsu',
      'naraigoto-itsukara-0-6sai',
      'eigo-kyouzai-3brand-2-6sai',
      'chiiku-toys-3brand-2-4sai',
      '3sai-hiragana-yomenai-ouchi-gakushuu',
    ],
  },
  // ---- ② ワンダーボックス（STEAM通信教材 / EPC 28.58） ----
  {
    id: 'a8-wonderbox',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+G1IHKI+4GM8+61Z82',
    title: 'ワンダーボックス',
    subtitle: '4〜10歳のSTEAM通信教材。思考力・創造力を遊びながら育てる',
    price: '月額¥3,700〜 / 体験教材あり',
    slugs: [
      'chiiku-subsc-hikaku-4sha',
      'chiiku-subsc-3sha-2026-comparison',
      'chiku-naraigoto-kumon-shichida-monte',
      'eigo-kyouzai-3brand-2-6sai',
      'chiiku-toys-3brand-2-4sai',
      'naraigoto-hajimedoki-kiketsu',
    ],
  },
  // ---- ③ モグモ（幼児向け冷凍宅食 / EPC 97.46） ----
  {
    id: 'a8-mogumo',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+F9J44Y+5CLW+5ZEMP',
    title: 'モグモ（幼児向け冷凍宅食）',
    subtitle: '累計300万食突破。管理栄養士監修の幼児食を冷凍で宅配',
    price: '初回¥980〜（送料込）',
    slugs: [
      'rinyuushoku-frozen-gekkabetsu',
      'yojishoku-reitou-tsukurioki',
      'kodomo-obento-reitou-stock-5sen',
      'youjishoku-kanryouki-1week-rota',
    ],
  },
  // ---- ④ ファーストスプーン（離乳食宅配 / 報酬 15%） ----
  {
    id: 'a8-firstspoon',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+FAPZCI+4Z42+601S1',
    title: 'ファーストスプーン（離乳食宅配）',
    subtitle: '中期〜完了期の離乳食を冷凍で宅配。アレルゲン明記・国産食材',
    price: 'お試しセット¥1,980〜',
    slugs: [
      'rinyuushoku-frozen-gekkabetsu',
      'rinyuushoku-dekinai-kao-awanai-baby',
      'kodomo-asa-udon-tamagotoji-rinyuushoku-go',
    ],
  },
  // ---- ⑤ スタジオシエル（フォトスタジオ / 来店¥1,000〜4,000） ----
  {
    id: 'a8-studio-ciel',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3G6E+FRZJW2+5HBC+5ZU2A',
    title: 'Total Photostudio スタジオシエル',
    subtitle: 'お宮参り・百日・節句・七五三・誕生日。衣装無料レンタル多数',
    price: '撮影予約 無料',
    slugs: [
      'keirou-no-hi-4sai-photo-message-card',
      'kodomo-natsu-photo-toshi-kata-5',
    ],
  },
  // ---- ⑥ Hariti（ベビー・キッズアイテム / 購入10%） ----
  {
    id: 'a8-hariti',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B3U75+5URGXE+5EV0+5YJRM',
    title: 'Hariti（ベビー・キッズ子育てアイテム）',
    subtitle: '安心・安全にこだわった0歳〜のベビー・キッズ用品ブランド',
    price: '¥1,500〜',
    slugs: [
      'shussan-junbi-rakuten-0sai',
      'chiiku-toys-3brand-2-4sai',
    ],
  },
]);

// 既存 PRODUCTS の末尾に A8 プログラムを追加した実体を再構成
PRODUCTS.push(...A8_PROGRAMS_2026_05);

// =======================================================================
// 2026-05 追加：もしもアフィリエイト 提携プログラム（4件）
// =======================================================================
const MOSHIMO_PROGRAMS_2026_05: AffiliateProduct[] = expand([
  // ---- ① WORLDLIBRARY Personal Gift（世界の絵本 定期便ギフト）900円 ----
  {
    id: 'mo-worldlibrary-gift',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5574901&p_id=7439&pc_id=21456&pl_id=93445',
    title: 'WORLDLIBRARY Personal Gift（世界の絵本 定期便ギフト）',
    subtitle: '0歳〜の英語・多言語絵本を毎月。出産祝い・誕生日プレゼントにも',
    price: '月額¥1,300〜（送料込）',
    slugs: ['ehon-yomikikase-kotsu', 'chiiku-toys-3brand-2-4sai'],
  },
  // ---- ② Famm（ファミリー向けモデル無料撮影会）1,200円 ----
  {
    id: 'mo-famm',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5574914&p_id=6082&pc_id=17067&pl_id=78041',
    title: 'Famm｜ベビー・キッズ・ファミリー無料撮影会',
    subtitle: '全国で開催のTV CM モデルオーディション＆無料撮影会。プロ撮影が無料',
    price: '撮影予約 無料',
    slugs: [
      'shussan-junbi-rakuten-0sai',
      'keirou-no-hi-4sai-photo-message-card',
      'kodomo-natsu-photo-toshi-kata-5',
    ],
  },
  // ---- ③ Baby English Labo（0〜3歳から始める英語絵本）2,310円 ----
  {
    id: 'mo-baby-english-labo',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5574925&p_id=4132&pc_id=10470&pl_id=56583',
    title: 'Baby English Labo（0〜3歳の英語絵本学習）',
    subtitle: '英語の絵本＋音源＋ガイドで自然に英語耳が育つ定期コース',
    price: '月額¥3,036〜 / 資料請求は無料',
    slugs: [
      'eigo-naraigoto-nansai-kara',
      'eigo-kyouzai-3brand-2-6sai',
      'ehon-yomikikase-kotsu',
    ],
  },
  // ---- ④ トイサブ！ファーストセレクション（はじめての知育玩具）2,500円 ----
  {
    id: 'mo-toysub-first',
    provider: 'moshimo',
    href: 'https://af.moshimo.com/af/c/click?a_id=5497153&p_id=4587&pc_id=11989&pl_id=61358',
    title: 'トイサブ！ファーストセレクション',
    subtitle: '0〜1歳向けの月齢に合った知育玩具を厳選。初回購入で送料無料',
    price: '一括¥3,490（送料込）',
    slugs: [
      'chiiku-subsc-hikaku-4sha',
      'chiiku-subsc-3sha-2026-comparison',
      'chiiku-toys-3brand-2-4sai',
      'shussan-junbi-rakuten-0sai',
    ],
  },
]);

PRODUCTS.push(...MOSHIMO_PROGRAMS_2026_05);

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
