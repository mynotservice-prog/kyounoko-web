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

const SURFACES: Surface[] = [
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
