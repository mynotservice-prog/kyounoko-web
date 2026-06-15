import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';
import {
  AFFILIATE_TARGET_SLUGS,
  getAffiliateProducts,
} from '@/lib/affiliate-products';
import {
  CATALOG_ITEMS,
  getPopularItemsForArticleCategory,
  type CatalogCategory,
  type CatalogItem,
} from '@/lib/items-catalog';

/**
 * 記事 -> 関連商品 自動マッピング
 *
 * - AFFILIATE_TARGET_SLUGS の記事は affiliate-products.ts の手作りデータ（画像付き）を返す。
 * - それ以外の記事は slug / category / title のキーワードから
 *   items-catalog.ts のカテゴリを推定し、そのカテゴリの商品を返す。
 * - キーワードにマッチしなければ、記事カテゴリ単位のフォールバックで関連商品を返す。
 *
 * 旧実装は affiliate-products.ts の5 slug だけをソースにしていたため、
 * 時短家電→ベビーチェア / 絵本→知育サブスク のような的外れな代替が発生していた。
 * items-catalog.ts に12カテゴリ85商品が揃ったので、こちらを正規ソースにする。
 */

/** CatalogItem を AffiliateLinkProps に変換。 */
function catalogToProps(item: CatalogItem): AffiliateLinkProps {
  return {
    href: item.href,
    title: item.name,
    subtitle: item.subtitle,
    price: item.price,
    provider: item.provider,
    pr: false,
  };
}

/** 指定カテゴリ群から順に最大 limit 件ピック（重複 id 除去）。 */
function pickFromCategories(
  cats: CatalogCategory[],
  limit: number,
): AffiliateLinkProps[] {
  const picked: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const cat of cats) {
    for (const it of CATALOG_ITEMS) {
      if (it.category !== cat || seen.has(it.id)) continue;
      picked.push(it);
      seen.add(it.id);
      if (picked.length >= limit) break;
    }
    if (picked.length >= limit) break;
  }
  return picked.map(catalogToProps);
}

/**
 * 与えられた文字列配列のいずれかにキーワードが含まれるか。
 * 全角・半角・大文字小文字の違いを吸収するため簡易正規化。
 */
function containsAny(haystacks: string[], needles: string[]): boolean {
  const normalized = haystacks
    .map((s) => (s ?? '').toString().toLowerCase())
    .join(' ');
  return needles.some((n) => normalized.includes(n.toLowerCase()));
}

/**
 * キーワード -> カタログカテゴリ の推定ルール。
 * 上から順に評価し、最初にマッチしたルールのカテゴリ群を使う。
 * 具体的・限定的なルールを上に、汎用的なものを下に置く。
 */
const HINT_RULES: { cats: CatalogCategory[]; needles: string[] }[] = [
  // 外食・子連れ攻略・キッズメニュー（最大トラフィック群 → 外食お助けグッズ）
  // 店名・「子連れ攻略」「キッズメニュー」等を最優先で拾い、抱っこ紐/ベビーカーへの
  // 的外れな代替を防ぐ。restaurant固有トークンに限定し、純粋なベビーチェア記事
  // （home用ハイチェア）は下の baby-chair ルールに残す。
  {
    cats: ['gaishoku'],
    needles: [
      'kodzure', 'koryaku', 'kids-menu', 'kidsmenu', 'famires',
      'family-restaurant', 'gaishoku', 'gaisyoku', 'shokudo',
      'rinyushoku-mochikomi', 'tabekoboshi', 'bebycar-ok-cafe',
      'morning-cafe', 'kids-cafe', 'kodzure-cafe',
      'ohsho', 'saize', 'bamiyan', 'gusto', 'yayoiken', 'cocos',
      'tenya', 'sushiro', 'hamasushi', 'hama-sushi', 'kappazushi',
      'kurazushi', 'jonathan', 'shabuyou', 'yakiniku', 'gyukaku',
      'gyu-kaku', 'sukiya', 'matsuya', 'yoshinoya', 'maido',
      'royalhost', 'joyfull', 'dennys',
      '外食', 'ファミレス', 'キッズメニュー', '回転寿司', '食べこぼし',
    ],
  },
  // ベビーシッター・一時保育
  {
    cats: ['babysitter'],
    needles: [
      'shitter', 'sitter', 'ichiji-hoiku', 'ichijihoiku', 'azukari',
      'azuke', 'byoji', 'kyukan', 'oyacare', 'kazoku-tayori',
    ],
  },
  // 食育・野菜嫌い・好き嫌い
  {
    cats: ['shokuiku'],
    needles: [
      'yasai', 'sukikirai', 'suki-kirai', 'henshoku', 'tabenai',
      'shokuiku', 'eiyou', 'kanshoku', 'mukashoku',
    ],
  },
  // ベビー洗剤・肌・洗濯
  {
    cats: ['senzai'],
    needles: [
      'senzai', 'sentaku', 'hada', 'atopi', 'arai', 'shimi',
      'bihada', 'kabure',
    ],
  },
  // 絵本・読み聞かせ・シールブック
  {
    cats: ['ehon'],
    needles: ['ehon', 'yomikikase', 'yomi-kikase', 'seal', 'book', 'zukan'],
  },
  // 宅食・ごはん・レシピ・お弁当
  {
    cats: ['takushoku'],
    needles: [
      'asagohan', 'bento', 'obento', 'kyaraben', 'reitou', 'reitougyoza',
      'tsukurioki', 'gaisyoku', 'recipe', 'jitan-recipe', 'kondate',
      'gohan', 'yuushoku', 'rinyuushoku', 'youjishoku', 'yojishoku',
      'shumatsu-gohan', 'hoikuen-kaeri', 'takushoku',
    ],
  },
  // ベビーチェア・離乳食まわりの椅子
  {
    cats: ['baby-chair'],
    needles: ['baby-chair', 'shokuji-isu', 'highchair', 'hai-chair'],
  },
  // 知育サブスク・知育玩具・遊び・工作
  {
    cats: ['educational-toy', 'chiiku-subsc'],
    needles: [
      'chiiku', 'monte', 'omocha', 'asobi', 'kousaku', 'craft',
      'subsc', 'rental', 'youtube-kawari', 'kyoudai-asobi',
      'iyaiya-shuuchu', 'tsumiki', 'block-asobi',
    ],
  },
  // 時短家電・キッズ家電
  {
    cats: ['jitan-kaden', 'kids-appliance'],
    needles: [
      'jitanhaden', 'jitan-kaden', 'kashitsu', 'monitor', 'baby-monitor',
      'hamigaki', 'taion', 'roomba', 'shokusenki', 'kansouki', 'kaden',
    ],
  },
  // ベビーカー・お出かけ・スポット
  {
    cats: ['babycar'],
    needles: [
      'odekake', 'stroller', 'babycar', 'sakura-ohanami', 'ohanami',
      'spots', 'moushobi', 'shizen-spot', 'amenohi-stroller',
      'amenohi-indoor', 'kosodate-muryou', 'kouen', 'park',
    ],
  },
  // 抱っこ紐・赤ちゃん・寝かしつけ
  {
    cats: ['dakkohimo'],
    needles: [
      'akachan', '0-1sai', 'baby-', 'dakkohimo', 'yonaki', 'ohirune',
      'ko-ga-nenai', 'nenne', 'nezukashi',
    ],
  },
  // 平日・保育園・ワンオペ（汎用の時短系を最後に）
  {
    cats: ['jitan-kaden', 'takushoku'],
    needles: [
      'hoikuen', 'heijitsu', 'wanope', 'routine', '19ji', 'asa-30pun',
      'oyasumi-ato', 'youchien-nyuuen', 'jitan',
    ],
  },
];

/**
 * 記事の slug / category / title から関連商品を推定して返す。
 * マッチしなかった場合は空配列。呼び出し側は length===0 で非表示制御すること。
 *
 * @param slug     記事 slug
 * @param category 記事 category slug
 * @param title    記事タイトル（任意・精度を上げるための補助情報）
 * @param opts.allowCategoryFallback
 *   キーワード未マッチ時に記事カテゴリ単位のフォールバックを許可するか（既定 true）。
 *   本文途中の控えめなインライン CTA では false を渡し、的確にマッチした記事のみに絞る。
 */
export function getRelatedItemsForArticle(
  slug: string,
  category?: string,
  title?: string,
  opts: { allowCategoryFallback?: boolean } = {},
): AffiliateLinkProps[] {
  const { allowCategoryFallback = true } = opts;

  // 1) 既存の明示的マッピング対象なら手作りデータ（画像付き）を返す。
  //    ただし対象スラッグでも商品カードが0件の記事（本文リンク型の収益記事）は、
  //    空配列で打ち切らずキーワード推定（2以降）へフォールスルーさせる。
  //    → これらの記事も上部/末尾の関連商品CTAを得てCVRの取りこぼしを防ぐ。
  if ((AFFILIATE_TARGET_SLUGS as readonly string[]).includes(slug)) {
    const explicit = getAffiliateProducts(slug).map((p) => ({
      href: p.href,
      title: p.title,
      subtitle: p.subtitle,
      price: p.price,
      imageUrl: p.imageUrl,
      provider: p.provider,
      pr: p.pr,
    }));
    if (explicit.length > 0) return explicit;
  }

  // 2) slug / category / title からキーワード推定
  const hay = [slug, category ?? '', title ?? ''];
  for (const rule of HINT_RULES) {
    if (containsAny(hay, rule.needles)) {
      const items = pickFromCategories(rule.cats, 3);
      if (items.length > 0) return items;
    }
  }

  // 3) キーワード未マッチ -> 記事カテゴリ単位のフォールバック
  //    （items-catalog.ts の ARTICLE_CATEGORY_TO_CATALOG を再利用）
  if (allowCategoryFallback && category) {
    const catItems = getPopularItemsForArticleCategory(category, 2);
    if (catItems.length > 0) return catItems.map(catalogToProps);
  }

  // どれにも該当しない -> 空配列（CTA セクションそのものを出さない）
  return [];
}
