import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';
import {
  AFFILIATE_TARGET_SLUGS,
  getAffiliateProducts,
  type AffiliateProduct,
} from '@/lib/affiliate-products';

/**
 * 記事 -> 関連商品 自動マッピング
 *
 * AFFILIATE_TARGET_SLUGS に該当する記事は元々の getAffiliateProducts の結果をそのまま返す。
 * それ以外の記事については、slug / category / title のキーワードから近しい商品群を推定し、
 * 既存カタログ（affiliate-products の PRODUCTS）を横断参照して AffiliateLinkProps 配列を返す。
 *
 * items-catalog.ts が別途用意された場合は import 経由で優先使用し、
 * 存在しない現状は affiliate-products.ts だけをソースにする fallback 実装。
 */

/**
 * カテゴリ内の代表的な商品を affiliate-products.ts から拾うためのヘルパ。
 * 指定 slug に紐づく商品から先頭 n 件を AffiliateLinkProps 形式で返す。
 */
function pickFromAffiliateSlug(
  sourceSlug: (typeof AFFILIATE_TARGET_SLUGS)[number],
  limit: number,
): AffiliateLinkProps[] {
  const products: AffiliateProduct[] = getAffiliateProducts(sourceSlug);
  return products.slice(0, limit).map((p) => ({
    href: p.href,
    title: p.title,
    subtitle: p.subtitle,
    price: p.price,
    imageUrl: p.imageUrl,
    provider: p.provider,
    pr: p.pr,
  }));
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
 * 記事の slug / category / title から関連商品を推定して返す。
 * マッチしなかった場合は空配列。呼び出し側は length===0 で非表示制御すること。
 *
 * @param slug     記事 slug
 * @param category 記事 category slug
 * @param title    記事タイトル（任意・精度を上げるための補助情報）
 */
export function getRelatedItemsForArticle(
  slug: string,
  category?: string,
  title?: string,
): AffiliateLinkProps[] {
  // 1) 既存の明示的マッピング対象ならそのまま返す
  if ((AFFILIATE_TARGET_SLUGS as readonly string[]).includes(slug)) {
    return getAffiliateProducts(slug).map((p) => ({
      href: p.href,
      title: p.title,
      subtitle: p.subtitle,
      price: p.price,
      imageUrl: p.imageUrl,
      provider: p.provider,
      pr: p.pr,
    }));
  }

  // 2) slug / category / title からキーワード推定
  const hay = [slug, category ?? '', title ?? ''];

  // 宅食（朝ごはん・お弁当・冷凍・作り置き・外食・焼き）
  if (
    containsAny(hay, [
      'asagohan',
      'bento',
      'obento',
      'kyaraben',
      'reitou',
      'reitougyoza',
      'tsukurioki',
      'gaisyoku',
      'yaki',
      'rinyuushoku',
      'yojishoku',
      'youjishoku',
      'shumatsu-gohan',
      'hoikuen-kaeri',
    ])
  ) {
    return pickFromAffiliateSlug('takushoku-service-hikaku-3sha', 3);
  }

  // 知育サブスク（遊び・工作・知育）
  if (
    containsAny(hay, [
      'asobi',
      'kousaku',
      'craft',
      'chiiku',
      'monte',
      'omocha',
      'youtube-kawari',
      'kyoudai-asobi',
      'iyaiya-shuuchu',
    ])
  ) {
    return pickFromAffiliateSlug('chiiku-subsc-hikaku-4sha', 2);
  }

  // 時短家電（保育園・平日・ワンオペ・ルーティン・夜）
  if (
    containsAny(hay, [
      'hoikuen',
      'heijitsu',
      'wanope',
      'routine',
      '19ji',
      'asa-30pun',
      'oyasumi-ato',
      'youchien-nyuuen',
      'jitanhaden',
      'jitan',
    ])
  ) {
    // 時短家電の専用カタログは未登録のため、代替として汎用性の高い
    // ベビーチェア上位2点（家電並みに家庭内定番で共起するもの）を暫定で流用。
    // items-catalog.ts 整備後に差し替え予定。
    return pickFromAffiliateSlug('baby-chair-ranking', 2);
  }

  // ベビーカー（お出かけ・ストローラー・お花見・屋内スポット）
  if (
    containsAny(hay, [
      'odekake',
      'stroller',
      'babycar',
      'sakura-ohanami',
      'ohanami',
      'spots',
      'moushobi',
      'shizen-spot',
      'amenohi-stroller',
      'amenohi-indoor',
      'kosodate-muryou',
    ])
  ) {
    return pickFromAffiliateSlug('babycar-ranking-2026', 2);
  }

  // 抱っこ紐（赤ちゃん・0-1歳・baby-）
  if (
    containsAny(hay, [
      'akachan',
      '0-1sai',
      'baby-',
      'yonaki',
      'ohirune',
      'ko-ga-nenai',
    ])
  ) {
    return pickFromAffiliateSlug('dakkohimo-ranking-2026', 2);
  }

  // 絵本系（読み聞かせ・シール）
  if (containsAny(hay, ['ehon', 'yomikikase', 'seal'])) {
    // 絵本の専用カタログは未整備のため、知育サブスク上位2点で暫定代替。
    return pickFromAffiliateSlug('chiiku-subsc-hikaku-4sha', 2);
  }

  // どれにも該当しない -> 空配列（CTA セクションそのものを出さない）
  return [];
}
