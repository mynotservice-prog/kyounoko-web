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
  // 2026-05 追加：知育玩具・プレゼント系（トイサブ等サブスクの高単価導線を併載）
  'chiiku-toys-2-3sai-5sen',
  'omocha-year-by-age',
  'chiiku-asobi-ie-de-10',
  'xmas-present-nenrei-0-6',
  'christmas-present-kodomo-nenrei-betsu',
  // 2026-06-11 追加：収益重点記事のうちカード未登録だった10本（監査で発覚）
  'chiiku-omocha-subsc-5sha-hikaku-2026',
  'kodomochalle-vs-smile-zemi-hikaku',
  'kyouzai-3sha-popi-challenge-smile-hikaku-2026',
  'takuhai-shoku-5sha-hikaku-2026',
  'babycar-erabikata',
  'kodomogutsu-erabikata-kanzen-guide-2026',
  'kodomogutsu-15cm-osusume-8sen-2026',
  'child-seat-shinseiji-osusume-5sen-2026',
  'junior-seat-2-3sai-hikaku-15',
  'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  // 2026-06-11 追加：戦略doc STEP4 の未作成だった収益記事5本（新規執筆）
  'onamae-seal-7sha-hikaku-2026',
  'shussan-iwai-futarime-2026',
  'nekashitsuke-ehon-10sen-2026',
  'ehon-subsc-hikaku-2026',
  'toysub-tettei-kaisetsu-2026',
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
    href: 'https://item.rakuten.co.jp/ergobaby/u745156/',
    title: 'エルゴベビー OMNI Breeze',
    subtitle: '新生児〜20kg対応・通気性SoftFlex採用のロングセラー',
    price: '¥27,500前後',
  },
  {
    id: 'dk-konny',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    // 楽天市場の検索URL。コニー抱っこ紐 FLEX サマー
    href: 'https://item.rakuten.co.jp/konnybaby/konny-baby-carrier-flex-summer/',
    title: 'コニー抱っこ紐 FLEX サマー',
    subtitle: 'スリングタイプ・軽量200gで寝かしつけに強い',
    price: '¥7,900前後',
  },
  {
    id: 'dk-babybjorn-one-kai',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/estyler/bbj0980/',
    title: 'ベビービョルン ONE KAI Air',
    subtitle: '前向き抱っこ対応・メッシュで夏も快適',
    price: '¥24,200前後',
  },
  {
    id: 'dk-aprica-koala',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/orange-baby/4969220008b/',
    title: 'アップリカ コアラ ウルトラメッシュ EX',
    subtitle: '新生児から4WAYで使える・通気性に強いウルトラメッシュ',
    price: '¥26,500前後',
  },
  {
    id: 'dk-boba-wrap',
    slug: 'dakkohimo-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/cherrybell/sleepywrap/',
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
    href: 'https://item.rakuten.co.jp/orange-baby/49692200100/',
    title: 'アップリカ ラクーナクッションAG',
    subtitle: '振動を抑える4輪サスペンション・軽量5.2kg',
    price: '¥49,500前後',
  },
  {
    id: 'bc-combi-sugocal',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/combi/sugocal-la/',
    title: 'コンビ スゴカル エッグショック LA',
    subtitle: 'エッグショック搭載のA型両対面・軽量4.6kgオート4輪',
    price: '¥48,000前後',
  },
  {
    id: 'bc-cybex-libelle',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/dadway-shop/wlcx521000581/',
    title: 'サイベックス リベル',
    subtitle: '機内持ち込みサイズまで畳める超コンパクト',
    price: '¥26,400前後',
  },
  {
    id: 'bc-airbuggy-coco',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/gmp/abfb200/',
    title: 'エアバギー COCO プレミア',
    subtitle: '3輪エアタイヤで舗装の悪い道でも安定走行',
    price: '¥77,000前後',
  },
  {
    id: 'bc-pigeon-bingle',
    slug: 'babycar-ranking-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/pigeon-shop/1042932/',
    title: 'ピジョン ビングル BB6',
    subtitle: 'シングルタイヤ最軽量3.9kg・マグネットバックルのB型',
    price: '¥36,850前後',
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
    href: 'https://item.rakuten.co.jp/stokke/st-2862/',
    title: 'ストッケ トリップ トラップ',
    subtitle: '0歳〜大人まで座れる長寿命ハイチェア',
    price: '¥34,100前後',
  },
  {
    id: 'bch-richell',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/richell/120734/',
    title: 'リッチェル 2WAYごきげんチェア',
    subtitle: 'ローチェア・テーブル付きで離乳食初期に便利',
    price: '¥4,800前後',
  },
  {
    id: 'bch-yamatoya-sukusuku',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/yamatoya1924/t_suku-chair-gl/',
    title: '大和屋 すくすくチェアGL テーブル付',
    subtitle: '座板・足置きを細かく高さ調整、大人まで使える木製ハイチェア',
    price: '¥19,800前後',
  },
  {
    id: 'bch-katoji',
    slug: 'baby-chair-ranking',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/katoji/22385/',
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

  // =======================================================================
  // 子供靴（選び方ガイド / 15cmおすすめ）— 2026-06-11 追加
  // 全URL: HTTP200・在庫あり・タイトル一致を検証済み
  // =======================================================================
  {
    id: 'kg-nb-iz996',
    slug: 'kodomogutsu-erabikata-kanzen-guide-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/abcmartsports/6942330001/',
    title: 'ニューバランス IZ996（キッズ）',
    subtitle: '0.5cm刻みのサイズ展開で合わせやすい、迷ったらこれの定番',
    price: '¥5,800前後',
  },
  {
    id: 'kg-asics-idaho-mini',
    slug: 'kodomogutsu-erabikata-kanzen-guide-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/asics/ms2246/',
    title: 'アシックス スクスク アイダホ MINI',
    subtitle: '甲高・幅広の子に合う日本人の足型設計。かかと補強入り',
    price: '¥5,000前後',
  },
  {
    id: 'kg-nike-dynamo-free',
    slug: 'kodomogutsu-erabikata-kanzen-guide-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/reload/n-343738-029/',
    title: 'ナイキ ダイナモフリー PS',
    subtitle: '伸びる履き口で「自分で履きたい」期に最適なスリッポン',
    price: '¥5,400前後',
  },
  {
    id: 'kg-asics-comfy-first',
    slug: 'kodomogutsu-erabikata-kanzen-guide-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/asics-trading/astd-2425/',
    title: 'アシックス スクスク コンフィ FIRST MS 3',
    subtitle: '歩き始め向けファーストシューズ。甲が深く軽量で足首をホールド',
    price: '¥6,500前後',
  },
  {
    id: 'kg-nb-iz996',
    slug: 'kodomogutsu-15cm-osusume-8sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/abcmartsports/6942330001/',
    title: 'ニューバランス IZ996（キッズ）',
    subtitle: '15cm帯で最も支持される定番。0.5cm刻みでジャストサイズを選べる',
    price: '¥5,800前後',
  },
  {
    id: 'kg-asics-idaho-baby5',
    slug: 'kodomogutsu-15cm-osusume-8sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/auc-tssshop/tub-1144a389-all/',
    title: 'アシックス スクスク アイダホ BABY 5',
    subtitle: '甲高・幅広向けの15cm帯現行モデル。中敷きが外せて洗える',
    price: '¥5,600前後',
  },
  {
    id: 'kg-nike-dynamo-free-td',
    slug: 'kodomogutsu-15cm-osusume-8sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/superfoot/80009090/',
    title: 'ナイキ ダイナモフリー TD',
    subtitle: 'ストレッチ履き口で2〜3歳でも自分で履ける。やや小さめ設計',
    price: '¥5,400前後',
  },
  {
    id: 'kg-moonstar-carrot',
    slug: 'kodomogutsu-15cm-osusume-8sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/yoikutsu/12187407/',
    title: 'ムーンスター キャロット CR C2394',
    subtitle: 'かかとをホールドする日本メーカーの幅広設計。抗菌防臭',
    price: '¥4,950前後',
  },

  // =======================================================================
  // チャイルドシート新生児 / ジュニアシート2-3歳 — 2026-06-11 追加
  // =======================================================================
  {
    id: 'cseat-combi-culmove-r129',
    slug: 'child-seat-shinseiji-osusume-5sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/combi/culmove-compact-r129-js/',
    title: 'コンビ クルムーヴ コンパクト R129 エッグショック JS',
    subtitle: 'エッグショック搭載・360°回転ISOFIX。新生児から4歳頃まで',
    price: '¥69,300前後',
  },
  {
    id: 'cseat-cybex-sirona-gi',
    slug: 'child-seat-shinseiji-osusume-5sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/natural-living/u944773/',
    title: 'サイベックス シローナ Gi i-Size',
    subtitle: '欧州最新基準R129適合・360°回転のベース一体型。新生児〜4歳',
    price: '¥71,500前後',
  },
  {
    id: 'cseat-joie-i-arc360',
    slug: 'child-seat-shinseiji-osusume-5sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/katoji/38010/',
    title: 'ジョイー i-Arc360°（カトージ）',
    subtitle: 'R129適合・360°回転ISOFIXのコスパ機。新生児から4歳頃まで',
    price: '¥52,580前後',
  },
  {
    id: 'cseat-aprica-cururila-lite',
    slug: 'child-seat-shinseiji-osusume-5sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/natural-living/u311260/',
    title: 'アップリカ クルリラ プラス ライト',
    subtitle: 'R129適合・360°回転。シートカバーが洗濯機で洗える現行モデル',
    price: '¥57,200前後',
  },
  {
    id: 'cseat-leaman-bitturn',
    slug: 'child-seat-shinseiji-osusume-5sen-2026',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/babytown/4903536230315/',
    title: 'リーマン ビットターンR129',
    subtitle: 'R129適合・新生児〜12歳まで1台。左右90°回転で3万円台の軽量機',
    price: '¥33,800前後',
  },
  {
    id: 'js-combi-joytrip-advance',
    slug: 'junior-seat-2-3sai-hikaku-15',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/combi/joytrip-advance-isofix-sa/',
    title: 'コンビ ジョイトリップ アドバンス ISOFIX',
    subtitle: '1歳から12歳まで使えるロングユース。R129適合・丸洗いOK',
    price: '¥39,800前後',
  },
  {
    id: 'js-aprica-formfit-next',
    slug: 'junior-seat-2-3sai-hikaku-15',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/netbaby/405734/',
    title: 'アップリカ フォームフィット ネクスト',
    subtitle: '成長に合わせてフィットするISOFIX。R129適合・150cmまで',
    price: '¥38,700前後',
  },
  {
    id: 'js-cybex-solution-g2',
    slug: 'junior-seat-2-3sai-hikaku-15',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/natural-living/u713898/',
    title: 'サイベックス ソリューション G2',
    subtitle: 'R129適合・150cmまで使えるISOFIX。通気メッシュ・3年保証',
    price: '¥29,700前後',
  },
  {
    id: 'js-graco-junior-plus-next',
    slug: 'junior-seat-2-3sai-hikaku-15',
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/natural-living/u937288/',
    title: 'グレコ ジュニアプラス ネクスト',
    subtitle: '軽量・1万円以下のハイバック。R129適合・100〜150cm対応',
    price: '¥9,570前後',
  },
];

// =======================================================================
// 2026-06-11 追加：既存商品セットを別slugの記事にも表示するための複製。
// PRODUCTS リテラル直後に実行すること（後段の expand() 分を巻き込まないため）。
// =======================================================================
// ベビーカー選び方ガイドにもランキング2026と同じ5商品を表示
PRODUCTS.push(
  ...PRODUCTS.filter((p) => p.slug === 'babycar-ranking-2026').map((p) => ({
    ...p,
    slug: 'babycar-erabikata' as AffiliateTargetSlug,
  })),
);
// 知育玩具サブスク5社比較にも4社比較と同じサービスカードを表示
PRODUCTS.push(
  ...PRODUCTS.filter(
    (p) => p.slug === 'chiiku-subsc-hikaku-4sha' && p.id.startsWith('cs-'),
  ).map((p) => ({
    ...p,
    slug: 'chiiku-omocha-subsc-5sha-hikaku-2026' as AffiliateTargetSlug,
  })),
);

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
      // 2026-05 追加：知育玩具・プレゼント記事にも高単価教材の導線を併載
      'chiiku-toys-2-3sai-5sen',
      'omocha-year-by-age',
      'chiiku-asobi-ie-de-10',
      'xmas-present-nenrei-0-6',
      'christmas-present-kodomo-nenrei-betsu',
      // 2026-06-11 追加：教材比較・サブスク比較の収益重点記事
      'kodomochalle-vs-smile-zemi-hikaku',
      'kyouzai-3sha-popi-challenge-smile-hikaku-2026',
      'chiiku-omocha-subsc-5sha-hikaku-2026',
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
      'chiiku-omocha-subsc-5sha-hikaku-2026',
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
      'takuhai-shoku-5sha-hikaku-2026',
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
      'shussan-iwai-futarime-2026',
    ],
  },
  // ---- ⑦ Oisix おためしセット（2026-06-11 追加 / docs/a8-affiliate-urls.md 承認済み） ----
  {
    id: 'a8-oisix',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B41ZB+9H5EEQ+3RK+2TWC6P',
    title: 'Oisix（オイシックス）おためしセット',
    subtitle: '有機・特別栽培野菜とミールキットの宅配。初回おためしセットが大幅割引',
    price: 'おためしセット ¥1,980前後',
    slugs: ['takuhai-shoku-5sha-hikaku-2026'],
  },
  // ---- ⑧ シールDEネーム（2026-06-11 追加 / 既存9記事に本文リンク配置済みの承認案件） ----
  {
    id: 'a8-seal-de-name',
    provider: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5Q81+DLEC1E+5V9K+5YRHE',
    title: 'シールDEネーム（名前シール・名前スタンプ）',
    subtitle: '入園準備の名前書きをシール・スタンプで時短。耐水でコップ・お弁当箱もOK',
    price: '¥1,000前後〜',
    slugs: [
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
      'onamae-seal-7sha-hikaku-2026',
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
    slugs: [
      'ehon-yomikikase-kotsu',
      'chiiku-toys-3brand-2-4sai',
      'ehon-subsc-hikaku-2026',
      'nekashitsuke-ehon-10sen-2026',
    ],
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
      // 2026-05 追加：知育玩具・プレゼント記事にも高単価サブスク導線を併載
      'chiiku-toys-2-3sai-5sen',
      'omocha-year-by-age',
      'chiiku-asobi-ie-de-10',
      'xmas-present-nenrei-0-6',
      'christmas-present-kodomo-nenrei-betsu',
      // 2026-06-11 追加
      'chiiku-omocha-subsc-5sha-hikaku-2026',
      'toysub-tettei-kaisetsu-2026',
    ],
  },
]);

PRODUCTS.push(...MOSHIMO_PROGRAMS_2026_05);

// トイサブ解説記事にも本体サービスのカードを表示
PRODUCTS.push(
  ...PRODUCTS.filter((p) => p.id === 'cs-toysub' && p.slug === 'chiiku-subsc-hikaku-4sha').map(
    (p) => ({
      ...p,
      slug: 'toysub-tettei-kaisetsu-2026' as AffiliateTargetSlug,
    }),
  ),
);

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
