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
/**
 * 外食・子連れ攻略・キッズメニュー文脈を判定するキーワード群。
 * 店名・「子連れ攻略」「キッズメニュー」等の restaurant 固有トークンに限定し、
 * 純粋なベビーチェア記事（home用ハイチェア）は誤検出しない。
 * gaishoku 商品ルートと高単価ブリッジ（幼児食宅配）の両方で共有する。
 */
const RESTAURANT_NEEDLES = [
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
];

const HINT_RULES: { cats: CatalogCategory[]; needles: string[] }[] = [
  // 外食・子連れ攻略・キッズメニュー（最大トラフィック群 → 外食お助けグッズ）
  // 抱っこ紐/ベビーカーへの的外れな代替を防ぐため最優先で拾う。
  {
    cats: ['gaishoku'],
    needles: RESTAURANT_NEEDLES,
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

/**
 * 外食文脈か判定する。記事 slug / category / title に restaurant トークンが
 * 含まれれば true。外食トラフィック → 高単価ブリッジの出し分けに使う。
 */
export function isRestaurantContext(
  slug: string,
  category?: string,
  title?: string,
): boolean {
  return containsAny([slug, category ?? '', title ?? ''], RESTAURANT_NEEDLES);
}

/**
 * 離乳食（0-1歳期）シグナルの判定トークン。
 * GSC実数で「ガスト 離乳食」「サイゼ 離乳食 持ち込み」等の離乳食意図が
 * 外食kodzureページに月2,885imp集中している（=0-1歳の親）。
 * この層には1-3歳向け幼児食（mogumo）より、月齢別の離乳食宅配が年齢一致で刺さる。
 */
const RINYUSHOKU_NEEDLES = ['離乳食', 'rinyushoku', 'rinyuushoku'];

/**
 * 外食文脈向けの「高単価ブリッジ」オファーを1点返す（非外食文脈なら null）。
 *
 * 外食トラフィック（全体の約7割）は楽天低単価グッズしか刺さらず収益天井が低い。
 * 「外食が続く週は家では宅配でラクに」という文脈的に正直な導線で、
 * 1件¥1,000〜の高単価アフィ（冷凍宅配 / A8）へ橋渡しする。
 * 低単価グッズCTAとは別枠で、控えめな1点に絞って表示する。
 *
 * 意図ズレ対策（2026-06）: ページが離乳食(0-1歳)シグナルを持つなら
 * 離乳食宅配「ファーストスプーン」、それ以外は幼児食(1-3歳)「mogumo」に出し分け。
 * 0-1歳の親に1-3歳幼児食を出しても年齢が合わず成約しないため。
 */
export function getRestaurantBridgeOffer(
  slug: string,
  category?: string,
  title?: string,
  body?: string,
): AffiliateLinkProps | null {
  if (!isRestaurantContext(slug, category, title)) return null;

  // 離乳食が「記事の主題」のときだけ離乳食宅配に出し分ける。判定は
  //  - タイトル/slug に離乳食トークンを含む、または
  //  - 本文に離乳食 H2 セクションを持つ（= 中盤挿入が起きるページと一致）
  // 本文テキストの通りすがり言及（キッズメニュー記事内の一言等）では反応させない。
  const hasRinyushokuSection = body
    ? splitBodyAtRinyushokuSection(body) !== null
    : false;
  const isRinyushoku =
    containsAny([slug, title ?? ''], RINYUSHOKU_NEEDLES) || hasRinyushokuSection;
  if (isRinyushoku) {
    const firstspoon = CATALOG_ITEMS.find((it) => it.id === 'sk-firstspoon');
    if (firstspoon) {
      return {
        href: firstspoon.href,
        title: '離乳食の冷凍宅配「ファーストスプーン」',
        subtitle:
          '外出先は持ち込み、家では解凍するだけ。月齢に合わせて届く0-1歳の冷凍離乳食（国産食材・アレルゲン明記）',
        price: firstspoon.price,
        provider: firstspoon.provider,
        pr: true,
      };
    }
  }

  const mogumo = CATALOG_ITEMS.find((it) => it.id === 'ts-mogumo');
  if (!mogumo) return null;
  return {
    href: mogumo.href,
    title: '幼児食の冷凍宅配「mogumo」',
    subtitle:
      '外食が続く週も、家ではチンするだけで栄養バランス。1-3歳向け・栄養士監修の幼児食宅配',
    price: mogumo.price,
    provider: mogumo.provider,
    pr: true,
  };
}

/**
 * 生協(資料請求)の末尾CTAが出ている食文脈ページのうち、冷凍離乳食/幼児食宅配ブリッジ
 * (getRestaurantBridgeOffer・A8高EPC)を「併載」してよい濃い意図面(GSC実流入あり)の明示allowlist。
 *
 * 背景: これらの離乳食持ち込み/子連れ攻略ページは isFoodContext のため getCoopOffer が
 * 末尾スロットを取り、getRestaurantBridgeOffer が page.tsx の showBridge=false で抑制されていた
 * (本番curl実測: 生協◯ / 宅配ブリッジ0)。生協=資料請求、宅配ブリッジ=実食材の宅配で補完関係のため、
 * この濃い意図面に限り両方を1枠ずつ点灯させる。王将等の高AdSense面には広げない(明示列挙のみ)。
 * 併載されるブリッジのオファーは getRestaurantBridgeOffer の年齢一致ロジックに従う
 * (タイトル/slug が離乳食=0-1歳意図を含む → ファーストスプーン / それ以外 → mogumo)。
 */
export const FOOD_BRIDGE_COEXIST_SLUGS: readonly string[] = [
  'hamasushi-rinyushoku-mochikomi',
  'gusto-kodzure-koryaku',
  'cocos-kodzure-koryaku',
  'royal-host-kodzure-koryaku',
  'marukame-rinyushoku-mochikomi',
  'kurasushi-rinyushoku-mochikomi',
  'saizeriya-rinyushoku-mochikomi',
  'dennys-rinyushoku-mochikomi',
];

/** 上記 allowlist に含まれ、生協CTAと冷凍宅配ブリッジを併載してよいページか。 */
export function allowsFoodBridgeAlongsideCoop(slug: string): boolean {
  return FOOD_BRIDGE_COEXIST_SLUGS.includes(slug);
}

/**
 * 本文HTMLを「離乳食」H2セクションの末尾で2分割する（中盤に高単価ブリッジを挿す用）。
 *
 * 離乳食意図の読者は離乳食セクションで意図がピークに立つが、ブリッジは従来FAQより下の
 * 最下部にしか無く見られていなかった。離乳食H2の直後にある次のH2の手前（=離乳食セクション
 * 末尾）で分割し、そこへ離乳食宅配ブリッジを差し込むことで、意図ピーク位置で訴求する。
 *
 * 離乳食H2が見つからなければ null（=分割せず、従来どおり末尾ブリッジにフォールバック）。
 */
export function splitBodyAtRinyushokuSection(
  bodyHtml: string,
): [string, string] | null {
  if (!bodyHtml) return null;
  const h2Re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  let rinyuHeadingEnd = -1;
  while ((m = h2Re.exec(bodyHtml)) !== null) {
    const headingText = m[1].replace(/<[^>]+>/g, '');
    if (headingText.includes('離乳食')) {
      rinyuHeadingEnd = m.index + m[0].length;
      break;
    }
  }
  if (rinyuHeadingEnd === -1) return null;
  const nextH2Rel = bodyHtml.slice(rinyuHeadingEnd).search(/<h2\b/i);
  const splitAt = nextH2Rel === -1 ? bodyHtml.length : rinyuHeadingEnd + nextH2Rel;
  return [bodyHtml.slice(0, splitAt), bodyHtml.slice(splitAt)];
}

/**
 * 本文HTMLから「子連れチェックリスト」H2セクションを抜き出し、残り本文と分離する。
 *
 * 戦略(docs/strategy-2026-07.md §7): 親は説明文でなくGO/NO-GO判定をしたい。
 * 判定ボックス(チェックリスト表)を1画面目=ヒーロー直下に前出しするため、
 * 本文中の該当H2セクション(次のH2手前まで)を抽出する。
 * 対象見出しは「子連れチェックリスト」を含むもののみ(「30秒チェックリスト」等は対象外)。
 * 見つからなければ null(=従来どおり本文をそのまま描画)。
 */
export function extractChecklistSection(
  bodyHtml: string,
): { checklist: string; rest: string } | null {
  if (!bodyHtml) return null;
  const h2Re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  let start = -1;
  let headingEnd = -1;
  while ((m = h2Re.exec(bodyHtml)) !== null) {
    const headingText = m[1].replace(/<[^>]+>/g, '');
    if (headingText.includes('子連れチェックリスト')) {
      start = m.index;
      headingEnd = m.index + m[0].length;
      break;
    }
  }
  if (start === -1) return null;
  const nextH2Rel = bodyHtml.slice(headingEnd).search(/<h2\b/i);
  const end = nextH2Rel === -1 ? bodyHtml.length : headingEnd + nextH2Rel;
  return {
    checklist: bodyHtml.slice(start, end),
    rest: bodyHtml.slice(0, start) + bodyHtml.slice(end),
  };
}

/** 外食記事 → 食事系の高単価ハブ記事への回遊リンク1件分。 */
export type HubLink = {
  href: string;
  title: string;
  description: string;
  eyebrow: string;
};

/**
 * 食事文脈の高単価ハブ記事（宅食/幼児食/離乳食の比較・宅配）。アンカーは
 * 商用クエリに寄せた説明的文言にする。集客の弱い money ページへ、外食という
 * 勝っているトラフィックから内部リンク（権益＋回遊）を流すための導線。
 */
const RESTAURANT_FOOD_HUBS: HubLink[] = [
  {
    href: '/article/yojishoku-reitou-tsukurioki',
    title: '幼児食の冷凍作り置き・宅配で平日をラクに',
    description: '外食続きで栄養が気になる週に。1〜5歳の幼児食を冷凍でまわす方法と宅配サービス。',
    eyebrow: '食事の準備',
  },
  {
    href: '/article/takushoku-service-hikaku-3sha',
    title: '宅食サービス比較3社｜共働きの夜ごはん',
    description: '温めるだけで一食完結。料金・品数・対応エリアで主要3社を比較。',
    eyebrow: '食事の準備',
  },
  {
    href: '/article/rinyuushoku-frozen-gekkabetsu',
    title: '離乳食の冷凍宅配を月齢別に比較',
    description: '5〜6か月のゴックン期から完了期まで。月齢に合う冷凍離乳食の選び方。',
    eyebrow: '食事の準備',
  },
];

/**
 * 外食文脈の記事に出す「食事の準備に役立つ記事」回遊リンク（高単価ハブ）。
 * 非外食文脈、または自身が対象ハブの場合は空配列。
 */
export function getRestaurantFoodHubLinks(
  slug: string,
  category?: string,
  title?: string,
): HubLink[] {
  if (!isRestaurantContext(slug, category, title)) return [];
  return RESTAURANT_FOOD_HUBS.filter((h) => !h.href.endsWith(`/${slug}`));
}

/**
 * チェーン店 slug → 日本語表示名。
 * `{chain}-kids-menu` と `{chain}-baby-chair` の両方が実在するチェーンのみ列挙する
 * （= 姉妹記事クロスリンクを張れるペア）。ここに無いチェーンには姉妹リンクを出さない。
 */
const CHAIN_DISPLAY_NAMES: Record<string, string> = {
  anrakutei: '安楽亭',
  bamiyan: 'バーミヤン',
  bigboy: 'ビッグボーイ',
  cocoichi: 'CoCo壱番屋',
  cocos: 'ココス',
  dennys: 'デニーズ',
  disney: '東京ディズニーランド',
  gusto: 'ガスト',
  gyukaku: '牛角',
  hanamarudon: 'はなまるうどん',
  jonathan: 'ジョナサン',
  legoland: 'レゴランド・ジャパン',
  matsuya: '松屋',
  nakau: 'なか卯',
  ohsho: '餃子の王将',
  ringerhut: 'リンガーハット',
  'royal-host': 'ロイヤルホスト',
  saizeriya: 'サイゼリヤ',
  shabuyo: 'しゃぶ葉',
  steakgusto: 'ステーキガスト',
  sukiya: 'すき家',
  sushiro: 'スシロー',
  tenya: 'てんや',
  'yakiniku-king': '焼肉キング',
  yayoiken: 'やよい軒',
  yoshinoya: '吉野家',
};

/** テーマパーク（ファミレス系チェーン比較ハブの対象外にする）。姉妹リンクは出す。 */
const THEME_PARK_CHAINS = new Set(['disney', 'legoland']);

/**
 * `{chain}-kodzure-koryaku`（来店ロジ記事）と `{chain}-kids-menu`（メニュー記事）が
 * **同一stemで両方実在する**チェーン。来店ロジ記事は流入主力で pos4-6 と強く、
 * メニュー記事は pos7-8 で停滞しがち。強→弱へ「キッズメニュー」アンカーの内部リンクを
 * 降らせて menu クラスタの順位を押し上げる（getChainCrossLinks の kodzure 分岐で使用）。
 * スラッグ命名が一致する16チェーンのみ列挙（denny-s/dennys 等の不一致stemは対象外）。
 */
const CHAINS_WITH_KIDS_MENU = new Set([
  'anrakutei', 'bamiyan', 'cocoichi', 'cocos', 'gusto', 'gyukaku', 'jonathan',
  'matsuya', 'nakau', 'ohsho', 'royal-host', 'sukiya', 'sushiro',
  'yakiniku-king', 'yayoiken', 'yoshinoya',
]);

/**
 * チェーン×子連れ記事（`{chain}-kids-menu` / `{chain}-baby-chair`）から、
 * 勝ちクラスタ内部を相互リンクする回遊リンクを返す。
 *
 * 流入の主力である「○○に子連れで行ける？」系の個別チェーン記事は、これまで
 * 同じチェーンの姉妹記事（キッズメニュー↔ベビーチェア）や比較ハブへの内部リンクが
 * 欠落しており、クラスタとしてのSEO評価が分散していた。レンダリング層でクロスリンクを
 * 補うことで、本文（markdown）を一切編集せず58記事に一貫した導線を張る。
 *
 * - 姉妹リンク: CHAIN_DISPLAY_NAMES に登録（=両記事が実在）したチェーンのみ。
 * - 比較ハブ: キッズメニュー記事→キッズメニュー比較/早見表、ベビーチェア記事→自宅用ランキング。
 * - 自分自身・テーマパークの不適合ハブは除外する。
 */
export function getChainCrossLinks(slug: string): HubLink[] {
  const isKidsMenu = slug.endsWith('-kids-menu');
  const isBabyChair = slug.endsWith('-baby-chair');

  // 来店ロジ記事（{chain}-kodzure-koryaku, pos4-6で稼ぐ強ページ）から、同チェーンの
  // メニュー記事（{chain}-kids-menu, pos7-8で停滞）へ「キッズメニュー」アンカーで
  // 内部リンクを降らせ、menuクラスタの順位を押し上げる。markdownを編集せずレンダリング層で
  // 勝ちクラスタの票を集約する（SEOプレイブック §A 内部リンク集中の実装）。
  if (slug.endsWith('-kodzure-koryaku')) {
    const chain = slug.replace(/-kodzure-koryaku$/, '');
    const name = CHAIN_DISPLAY_NAMES[chain];
    if (!name || !CHAINS_WITH_KIDS_MENU.has(chain)) return [];
    return [
      {
        href: `/article/${chain}-kids-menu`,
        title: `${name}のキッズメニューは何歳から？値段・年齢別ガイド`,
        description: `${name}のキッズメニューの値段・対象年齢・アレルゲン対応と、子どもに人気の取り分けメニューを解説。`,
        eyebrow: '同じお店のメニュー',
      },
      {
        href: '/article/kids-menu-chain-15-hikaku',
        title: '子連れOKチェーン店のキッズメニュー比較15選',
        description: '主要ファミレス・チェーンのキッズメニューを価格/対象年齢/アレルゲンで一覧比較。',
        eyebrow: 'チェーン比較',
      },
    ];
  }

  if (!isKidsMenu && !isBabyChair) return [];

  const chain = slug.replace(/-(kids-menu|baby-chair)$/, '');
  const name = CHAIN_DISPLAY_NAMES[chain];
  const links: HubLink[] = [];

  // 1) 同じチェーンの姉妹記事（両記事が実在するペアのみ）
  if (name) {
    if (isKidsMenu) {
      links.push({
        href: `/article/${chain}-baby-chair`,
        title: `${name}のベビーチェア・子ども椅子はある？`,
        description: `${name}にベビーチェアやお座敷席はある？月齢別の入店のしやすさをチェック。`,
        eyebrow: '同じお店の設備',
      });
    } else {
      links.push({
        href: `/article/${chain}-kids-menu`,
        title: `${name}のキッズメニュー・取り分けガイド`,
        description: `${name}にキッズメニューはある？子どもに人気の取り分けと年齢別の食べさせ方。`,
        eyebrow: '同じお店のメニュー',
      });
    }
  }

  // 2) 比較ハブ
  if (isKidsMenu) {
    if (!THEME_PARK_CHAINS.has(chain)) {
      links.push({
        href: '/article/kids-menu-chain-15-hikaku',
        title: '子連れOKチェーン店のキッズメニュー比較15選',
        description: '主要ファミレス・チェーンのキッズメニューを価格/対象年齢/アレルゲンで一覧比較。',
        eyebrow: 'チェーン比較',
      });
      links.push({
        href: '/article/kids-menu-nansai-kara-hayami',
        title: '子供メニューは何歳から？早見表',
        description: 'ファミレス各社の年齢制限・無料/有料を0-6歳の早見表でまとめてチェック。',
        eyebrow: '早見表',
      });
    }
  } else {
    links.push({
      href: '/article/gaishoku-baby-chair-matome',
      title: '子連れOKチェーンのベビーチェア完全まとめ',
      description: '外食チェーン33店のベビーチェア事情を横断比較。何ヶ月から・タイプ・確保のコツ。',
      eyebrow: 'チェーン横断',
    });
    links.push({
      href: '/article/baby-chair-ranking',
      title: '自宅用ベビーチェア 買ってよかった10選',
      description: '外出先でベビーチェアを探すなら、自宅にも1台。0-6歳で長く使える定番を比較。',
      eyebrow: '自宅用に',
    });
  }

  // 自分自身へのリンクは除外
  return links.filter((l) => !l.href.endsWith(`/${slug}`));
}
