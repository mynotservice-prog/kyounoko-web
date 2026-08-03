import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';

/**
 * 「面（surface）」単位のアフィリオファー定義。
 *
 * ## なぜ slug 個別指定ではなく面単位なのか
 * 従来のオファー在庫は `lib/affiliate-products.ts` の `AFFILIATE_TARGET_SLUGS`（51本）に
 * 手書きで紐付いていた。GSC page次元（2026-06-27〜07-24）と突合すると、この51本のうち
 * GSCに現れたのは31本・合計13clk（1本0.4clk/28日）で、実質の死蔵在庫だった。
 * 一方でクリックは `mizuasobi-*`（45本 3,672clk）のような「面」に集まる。slug列挙では
 * 新しい記事が増えるたびにオファーが付かない面が増え続けるので、面（slug/カテゴリの
 * パターン）にオファーを紐付ける。
 *
 * ## このファイルが直している具体的な意図ミスマッチ（本番HTML実測・2026-07-27）
 *  - `mizuasobi-*` / `shitsunai-asobi-*` 計45本・3,672clk に、
 *    **木製積み木（ボーネルンド／PlanToys／I'm Toy）** が出ていた。
 *    原因は `lib/article-product-hints.ts` の知育玩具ルールが needle `'asobi'` を持つため
 *    `mizu-asobi` / `shitsunai-asobi` を誤爆していたこと。夏の水遊びに出かける親に
 *    室内用の木製積み木を出しても意図が合わない。
 *  - `tokyo-kodomo-mushiyoke-spot`（624clk・虫よけスポット記事）に
 *    **アップリカ／コンビのベビーカー（¥48,000）** が出ていた。
 *    原因は今日どこ行く？カテゴリの既定フォールバック（babycar）。
 *
 * ## href の方針
 * 個別商品URLではなく **楽天市場の検索結果URL** を使う。理由:
 *  - 在庫切れ・商品ページ消滅で死にリンクにならない（個別URLは腐る）
 *  - 「検索意図ど真ん中の検索結果へ着地させる」（リメギフの affiliate-max で、汎用
 *    ランキング/特集ページ着地は EPC¥0.3 だったのに対し意図一致の検索結果が勝った）
 *  - provider='rakuten' なので `wrapMoshimoRakuten()` が自動でもしも経由にラップする。
 *    もしもは実測で EPC¥12.6（4件 ¥1,884）＝当サイトで唯一発生しているASP。
 * 掲載する検索URLは全て2026-07-27に実HTTPで件数を確認済み（下の各コメント）。
 * 価格は検索結果ページで幅があるため意図的に持たない（推測の価格を書かない）。
 */

/** 楽天市場の検索結果URLを作る（クエリはスペース区切りで渡す）。 */
function rakutenSearch(query: string): string {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(
    query.trim().replace(/\s+/g, '+'),
  ).replace(/%2B/g, '+')}/`;
}

function rakutenItem(
  id: string,
  query: string,
  title: string,
  subtitle: string,
): AffiliateLinkProps & { id: string } {
  return {
    id,
    href: rakutenSearch(query),
    title,
    subtitle,
    provider: 'rakuten',
    pr: true,
  };
}

/**
 * 面の定義。`match` が true を返した最初の面のオファーを使う。
 * 上ほど具体的な面を置く。
 */
type Surface = {
  id: string;
  /** この面が拾う想定の記事（コメント用。判定はmatchが正） */
  note: string;
  match: (ctx: { slug: string; category: string; title: string }) => boolean;
  items: (AffiliateLinkProps & { id: string })[];
};

/**
 * レバー1（アフィリ配線の移植・2026-08-04 デプロイ）の治療群スラッグ。
 * 設計正本: ~/.claude/company/reports/2026-08-03/kyounoko-affiliate-transplant.md §3-§4。
 *
 * 面のmatchを意味論（`-baby-chair` で終わる / title に離乳食 等）ではなく
 * **明示スラッグに限定**しているのは実験統制のため:
 *  - §4 で治療群8本・対照群2本（ohsho-kids-menu / sushiro-kids-menu）のA/Bを組んでおり、
 *    意味論matchにすると治療群外の兄弟記事（ohsho-baby-chair 等15面・
 *    marukame-rinyushoku-mochikomi 等）へ波及して対照が壊れる。
 *  - D+28判定（治療群PV比1.2%以上 かつ 対照群横ばい）が合格したら、
 *    このセットを意味論match（slug末尾 `-baby-chair` / `rinyushoku-mochikomi` 含む）へ
 *    広げて全面展開する（§5 の天井 1,472clk/月 の検証はその後）。
 *
 * A面/B面の振り分けは設計 §3 のmatch規則そのまま:
 *  A面（外食先の椅子）= slugが `-baby-chair` で終わる、または title に
 *    ベビーチェア|子供椅子 を含む外食記事（kodzure-koryaku 3本は全て title に
 *    「ベビーチェア」を含むためA面）。
 *  B面（外食先の離乳食）= slug に `rinyushoku-mochikomi`。
 */
const VENUE_CHAIR_TREATMENT_SLUGS = new Set([
  'hamasushi-baby-chair',
  'sukiya-baby-chair',
  'kurasushi-baby-chair',
  'sushiro-baby-chair',
  'cocos-kodzure-koryaku',
  'royal-host-kodzure-koryaku',
  'gyukaku-kodzure-koryaku',
]);

const VENUE_RINYUSHOKU_TREATMENT_SLUGS = new Set([
  'hamasushi-rinyushoku-mochikomi',
]);

const SURFACES: Surface[] = [
  // =====================================================================
  // A面「外食先の椅子」（レバー1治療群・2026-08-04）
  // GSC実クエリ（28日・例はま寿司）: ベビーチェア132clk / 子供椅子67 / 赤ちゃん椅子42 /
  // キッズチェア29。読者は「その店に椅子があるか」を調べている＝持っていく携帯品が意図一致。
  // 楽天検索の実在は 2026-08-03（設計時）と 2026-08-04（実装時）の両日 HTTP 200 で確認済み。
  // =====================================================================
  {
    id: 'venue-chair',
    note: 'レバー1治療群A面: {chain}-baby-chair 4本 + kodzure-koryaku 3本（明示スラッグ限定）',
    match: ({ slug }) => VENUE_CHAIR_TREATMENT_SLUGS.has(slug),
    items: [
      // 楽天検索 327件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-venue-chairbelt',
        'チェアベルト 携帯',
        '携帯チェアベルト',
        '店にベビーチェアが無い・ベルト無しタイプだった時に、大人用の椅子へ巻いて座らせられる。カバンに入る軽さ',
      ),
      // 楽天検索 8,795件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-venue-tablechair',
        'テーブルチェア 折りたたみ',
        'テーブルチェア（折りたたみ）',
        'テーブルに挟んで固定する携帯チェア。ベビーチェアの用意が無い店や座敷席でも使える',
      ),
      // 楽天検索 611件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-venue-chair-fabric',
        'ベビーチェア 携帯 布',
        '布製の携帯ベビーチェア',
        '軽量でカバンに入る布製の補助チェア。外食が続く時期の持ち歩き用に',
      ),
    ],
  },

  // =====================================================================
  // B面「外食先の離乳食」（レバー1治療群・2026-08-04）
  // GSC実クエリ（28日・はま寿司）: 離乳食147clk / 離乳食 持ち込み86 / 赤ちゃん56 /
  // ベビーフード12 / ミルク お湯5。「持ち込めるか」を調べている読者に持ち込み用品を出す。
  // =====================================================================
  {
    id: 'venue-rinyushoku',
    note: 'レバー1治療群B面: hamasushi-rinyushoku-mochikomi（明示スラッグ限定）',
    match: ({ slug }) => VENUE_RINYUSHOKU_TREATMENT_SLUGS.has(slug),
    items: [
      // 楽天検索 3,648件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-rinyu-freezer-tray',
        '離乳食 保存容器 小分け 冷凍',
        '離乳食の小分け冷凍保存容器',
        '家で小分けして冷凍しておけば、外出時にそのまま持って出られる。持ち込みOKの店での定番スタイル',
      ),
      // 楽天検索 811件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-rinyu-pouch',
        'ベビーフード パウチ 持ち運び',
        'ベビーフード（パウチタイプ）',
        '持ち込みOKの店なら常温のまま食べさせられる。外出用に数個ストックしておくと急な外食でも安心',
      ),
      // 楽天検索 267件（2026-08-03 実測・2026-08-04 HTTP 200 再確認）
      rakutenItem(
        'sf-rinyu-epron',
        'お食事エプロン 使い捨て 個包装',
        '使い捨てお食事エプロン（個包装）',
        '外食先の食べこぼし対策。使い捨てなら汚れたエプロンを持ち帰らずに済む',
      ),
    ],
  },

  // =====================================================================
  // 水遊び面（mizuasobi-* / じゃぶじゃぶ池 / 川遊び / プール）
  // GSC 28日: 45本 3,672clk。夏季ピークの最大級の面。
  // 現状は木製積み木が出ていた（'asobi' 誤爆）。
  // =====================================================================
  {
    id: 'mizuasobi',
    note: 'mizuasobi-* / jabujabu-ike-* / kawaasobi / pool-asobi',
    match: ({ slug, title }) =>
      /mizuasobi|jabujabu|kawaasobi|pool-asobi/.test(slug) ||
      /水遊び|じゃぶじゃぶ|川遊び/.test(title),
    items: [
      // 楽天検索 327件（2026-07-27 実測）
      rakutenItem(
        'sf-mizu-swimpants',
        '水遊びパンツ 使い捨て',
        '使い捨て水遊びパンツ',
        'おむつが取れていない子の水遊びに。じゃぶじゃぶ池・幼児プールは着用必須の施設が多い',
      ),
      // 楽天検索 25,959件（2026-07-27 実測）
      rakutenItem(
        'sf-mizu-rashguard',
        'キッズ ラッシュガード 上下',
        'キッズ ラッシュガード（上下）',
        '日焼けと擦り傷から守る。屋外の水遊び場は日陰が少なく、長袖タイプが結局ラク',
      ),
      // 楽天検索 1,173件（2026-07-27 実測）
      rakutenItem(
        'sf-mizu-popuptent',
        'ポップアップテント 子供 日よけ',
        'ポップアップテント（日よけ）',
        '荷物置き・着替え・昼寝スペースに。無料の水遊び場は日陰の取り合いになりがち',
      ),
    ],
  },

  // =====================================================================
  // 室内あそび場面（shitsunai-asobi-*）
  // GSC 28日（2026-07-04〜07-31・アンカー行除外）: 16面 1,052clk。
  //
  // 【2026-08-03 実測・不具合の修正】このファイルの冒頭コメントは「mizuasobi-* /
  // shitsunai-asobi-* 計45本に木製積み木が出ていたのを直した」と書いていたが、
  // 実際に修正されていたのは mizuasobi 側だけで、`shitsunai-asobi-*` は
  // `lib/article-product-hints.ts` の知育玩具ルール（needle 'asobi' の誤爆）に
  // 落ちたままだった。本番HTMLで実測（HTTP 200）:
  //   shitsunai-asobi-suginami-tokyo → ボーネルンド 積み木 / プラントイ / アイムトイ
  // 「今日どこの室内あそび場へ行くか」を調べている親に、自宅用の木製玩具は意図が合わない。
  //
  // 出すのは mizuasobi 面と同じ設計思想＝「そこへ持っていくもの」。
  // 掲載する検索URLは全て2026-08-03に実HTTP（200）で件数を確認済み（各コメント）。
  // 断定を避ける文言にしている（施設ごとの規定を当方で確認していないため）。
  //
  // 注意: `natsu-yasumi-kodomo-asobi-ie-de`（家で遊ぶ面）は知育玩具ルールのままが正しいので、
  // match は `shitsunai-asobi` に限定し `asobi` 全般には広げない。
  // =====================================================================
  {
    id: 'shitsunai-asobi',
    note: 'shitsunai-asobi-*（区市別の室内あそび場）',
    match: ({ slug, title }) =>
      /shitsunai-asobi/.test(slug) || /室内あそび場|室内遊び場/.test(title),
    items: [
      // 楽天検索 29,805件（2026-08-03 実測）
      rakutenItem(
        'sf-indoor-socks',
        'キッズ 靴下 滑り止め',
        '滑り止め付きキッズ靴下',
        '室内あそび場は靴下の着用を求める施設が多く、現地調達だと選べない。滑り止め付きだと走り回っても転びにくい',
      ),
      // 楽天検索 17,653件（2026-08-03 実測）
      rakutenItem(
        'sf-indoor-bottle',
        '子供 水筒 ストロー 軽量',
        '子ども用ストロー水筒（軽量）',
        '空調の効いた室内でも動き回ると汗をかく。自分で飲める軽さだと親の手がふさがらない',
      ),
      // 楽天検索 6,496件（2026-08-03 実測）
      rakutenItem(
        'sf-indoor-raincoat',
        'レインコート キッズ 上下',
        'キッズ レインコート（上下）',
        '室内あそび場は雨の日の行き先として選ばれることが多い。上下セパレートだと自分で着られて動きやすい',
      ),
    ],
  },

  // =====================================================================
  // 虫よけ面（虫よけスポット・虫刺され）
  // GSC 28日: tokyo-kodomo-mushiyoke-spot 単体で624clk。
  // 現状はベビーカー（¥48,000）が出ていた。
  // =====================================================================
  {
    id: 'mushiyoke',
    note: 'tokyo-kodomo-mushiyoke-spot ほか虫よけ・虫刺され面',
    match: ({ slug, title }) =>
      /mushiyoke|mushisasare/.test(slug) || /虫よけ|虫除け|虫刺され/.test(title),
    items: [
      // 楽天検索 1,418件（2026-07-27 実測）
      rakutenItem(
        'sf-mushi-spray',
        '子供 虫除けスプレー 天然',
        '子ども用 虫除けスプレー',
        'ディートの月齢制限が気になる家庭向けに、天然由来タイプの選択肢も含めて比較できます',
      ),
      // 楽天検索 3,276件（2026-07-27 実測）
      rakutenItem(
        'sf-mushi-seal',
        '虫よけ シール 子供',
        '虫よけシール・ワッペン',
        '肌に直接つけないタイプ。服やベビーカーに貼れるので、スプレーを嫌がる子に',
      ),
      // 楽天検索 2,352件（2026-07-27 実測）
      rakutenItem(
        'sf-mushi-hakka',
        'ハッカ油 スプレー 虫除け',
        'ハッカ油スプレー',
        '手作り派の定番。公園・河川敷など蚊が多い水辺のおでかけに持っていく家庭が多い',
      ),
    ],
  },
];

/**
 * 記事の面に対応するアフィリオファーを返す（該当なしなら null）。
 * `lib/article-product-hints.ts` の `getRelatedItemsForArticle()` が
 * 従来のキーワード推定より先にこれを参照する（＝面が最優先）。
 */
export function getSurfaceOffers(
  slug: string,
  category?: string,
  title?: string,
): AffiliateLinkProps[] | null {
  const ctx = {
    slug: (slug ?? '').toLowerCase(),
    category: (category ?? '').toLowerCase(),
    title: title ?? '',
  };
  for (const s of SURFACES) {
    if (s.match(ctx)) {
      return s.items.map(({ id, ...rest }) => ({ ...rest, itemId: id }));
    }
  }
  return null;
}

/**
 * レバー1（移植物3）: 本文中に「1枚だけ」差し込むオファーを返す。
 *
 * 対象は治療群の venue-chair / venue-rinyushoku 面のみ。面の items[0] を
 * 本文の意図ピークH2セクション末尾（splitBodyAtSection で分割した位置）に出し、
 * 末尾の RelatedItemsCTA 側は items[1..2] の2点に減らす（＝ページあたりの
 * もしもリンク総数3本・PR枠数を1つも純増させない。設計 §3 移植物3）。
 *
 * 分割見出しパターンは設計どおり /ベビーチェア|子供椅子|離乳食/。
 * 治療群8本のH2構成は実ファイルで確認済み（全8本に一致H2が存在する）:
 *   - {chain}-baby-chair 4本: 「◯◯のベビーチェア 詳細」
 *   - kodzure-koryaku 3本: 「離乳食・ベビーチェア・取り分け…」等
 *   - hamasushi-rinyushoku-mochikomi: 「はま寿司 離乳食持ち込み 詳細」
 * 一致H2が無い場合は呼び出し側で分割せず従来どおり末尾3点にフォールバックする。
 */
export type BodySurfaceOffer = {
  item: AffiliateLinkProps;
  headingPattern: RegExp;
  note: string;
};

const BODY_OFFER_SURFACE_IDS = new Set(['venue-chair', 'venue-rinyushoku']);
const BODY_OFFER_HEADING = /ベビーチェア|子供椅子|離乳食/;

export function getBodySurfaceOffer(
  slug: string,
  category?: string,
  title?: string,
): BodySurfaceOffer | null {
  const ctx = {
    slug: (slug ?? '').toLowerCase(),
    category: (category ?? '').toLowerCase(),
    title: title ?? '',
  };
  const surface = SURFACES.find((s) => s.match(ctx));
  if (!surface || !BODY_OFFER_SURFACE_IDS.has(surface.id)) return null;
  const first = surface.items[0];
  if (!first) return null;
  const { id, ...rest } = first;
  return {
    item: { ...rest, itemId: id },
    headingPattern: BODY_OFFER_HEADING,
    note:
      surface.id === 'venue-chair'
        ? '外食先の椅子まわりで使うアイテム'
        : '離乳食の持ち込みで使うアイテム',
  };
}

/** デバッグ/監査用: 面IDを返す（オファーが付く面かの判定に使う）。 */
export function getSurfaceId(
  slug: string,
  category?: string,
  title?: string,
): string | null {
  const ctx = {
    slug: (slug ?? '').toLowerCase(),
    category: (category ?? '').toLowerCase(),
    title: title ?? '',
  };
  return SURFACES.find((s) => s.match(ctx))?.id ?? null;
}
