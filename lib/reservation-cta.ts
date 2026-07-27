/**
 * 外食予約（ホットペッパーグルメ）等のネット予約CTAを、記事文脈に応じて出すための
 * env ゲート付きオファー生成ユーティリティ。
 *
 * ## 設計意図（「env を差すだけで点灯」）
 * きょうのこの流入主力は「子連れで○○（チェーン店）に行ける？」系の外食記事（GSC実データで約8割）。
 * しかし現状この勝ちトラフィックには「家用の物販／幼児食宅配」しか導線が無く、
 * 読者の意図（=今から外食する）に最も近い「ネット予約」の収益導線が欠けている。
 *
 * 本命のホットペッパーグルメはバリューコマース（VC）経由の成果報酬で、
 * 提携審査が下りるまで実リンクを貼れない。そこで:
 *   - 審査前: env 未設定 → オファーは null（CTA枠は描画されない＝無害）
 *   - 審査後: VC の MyLink URL を env に1行入れるだけで、外食文脈の全記事に予約CTAが点灯
 * という運用にして、承認到着＝即収益化できる状態を先に用意する。
 *
 * ## 必要な環境変数（VC 提携承認後に設定）
 *   NEXT_PUBLIC_VC_HOTPEPPER_URL
 *     ホットペッパーグルメの VC アフィリエイトURL（MyLinkで「子連れ・キッズメニュー」等の
 *     検索結果に深くリンクすると成約率が上がる）。
 *     形式例: https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=...&pid=...&vc_url=...
 *
 * provider='valuecommerce' は wrap 不要でそのまま href に使う（lib/moshimo の楽天とは異なる）。
 */

import { isRestaurantContext } from '@/lib/article-product-hints';
import {
  asoviewGenreForSpotCategory,
  buildAsoviewLanding,
  resolveAsoviewLanding,
} from '@/lib/asoview-deeplink';

export type ReservationOffer = {
  /** 遷移先（VCアフィリエイトURL。env から取得） */
  href: string;
  /** カード見出し */
  heading: string;
  /** 補足説明 */
  note: string;
  /** ボタン文言 */
  cta: string;
  /** GA4 トラッキング用の識別子 */
  itemId: string;
};

/**
 * タイアップ（広告主の協力・内容確認を受けて制作した）記事の slug。
 *
 * この面には「他店をネット予約」系の競合導線を出さない。タイアップ先の記事内で
 * 読者を競合他店の予約に送るのは広告主に対する背信であり、契約上の独占条項が
 * あった場合の違反リスクにもなる。掲載可否は面ごとに人が判断するため、
 * 判定は明示 allowlist のみ（自動推定はしない）。
 */
const TIEUP_ARTICLE_SLUGS = new Set<string>([
  'ichiran-kodzure-koryaku', // 株式会社一蘭（2026-07 公式写真提供・掲載内容確認）
]);

/** 明示 allowlist に載ったタイアップ記事か。 */
export function isTieupArticle(slug: string): boolean {
  return TIEUP_ARTICLE_SLUGS.has(slug);
}

/** http(s) の正規URLか（壊れた env 値で空カードを出さないための防御）。 */
function isValidUrl(url: string | undefined): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

/** slug/category/title のいずれかに needle が含まれるか（全角・大小無視の簡易判定）。 */
function ctxIncludes(
  haystacks: (string | undefined)[],
  needles: string[],
): boolean {
  const hay = haystacks.map((s) => (s ?? '').toLowerCase()).join(' ');
  return needles.some((n) => hay.includes(n.toLowerCase()));
}

/**
 * 生協（コープデリ／おうちコープ／パルシステム等）の資料請求オファー（A8・高単価）。
 *
 * GSC実数で離乳食意図が月2,885imp、外食kodzureページに集中（=0-1歳の親）。この層は
 * 「家用の離乳食・時短食材を宅配でストックしたい」ニーズが強く、生協の資料請求は
 * A8で1件¥1,000〜3,000の高単価。外食・離乳食・宅食文脈に「家のストック」導線として正直に橋渡しする。
 *
 * env `NEXT_PUBLIC_A8_COOP_URL` 未設定なら null（=描画されない＝無害）。
 * A8で生協プログラムの提携承認後、発行アフィリンクを env に1行入れるだけで全食文脈に点灯。
 */
export function getCoopOffer(
  slug: string,
  category?: string,
  title?: string,
): ReservationOffer | null {
  // 2026-07-27 実測にもとづく絞り込み（旧実装は isRestaurantContext を OR で含めていた）。
  //
  // 本番HTMLを上位198記事ぶん取得して数えたところ、この生協CTA（A8 a8mat=4B65SE+PLNSI+…）は
  // **94本・14,195clk/28日** の外食チェーン面の「記事末尾スロット」を独占していた。
  // 一方 ASP実測では **A8は全体で26クリック・成果0件**（もしも楽天 EPC¥12.6／
  // アソビュー VC 2件¥588 と対照的）。＝最大の露出枠を、換金実績のない導線が押さえていた。
  // 外食チェーン記事の読者意図は「今から子連れでこの店に行けるか」であって
  // 「家に生協を引く」ではないため、外食“文脈”という広い条件を外し、
  // **離乳食・宅食・幼児食が記事の主題である面に限定**する。
  // （その面では生協の資料請求は文脈的に正直な導線なので残す。）
  const isFoodContext = ctxIncludes(
    [slug, category, title],
    ['rinyushoku', 'rinyuushoku', '離乳食', 'takushoku', '宅食', '時短', 'jitan', 'youjishoku', 'yojishoku', '幼児食'],
  );
  if (!isFoodContext) return null;
  const href = process.env.NEXT_PUBLIC_A8_COOP_URL?.trim();
  if (!isValidUrl(href)) return null;
  return {
    href,
    heading: '生協の宅配で離乳食・時短食材を家にストック',
    note: '裏ごし野菜・国産食材・温めるだけのミールキットを玄関先まで。資料請求・お試しが無料の生協が多数。',
    cta: '生協の無料資料請求・お試しを見る →',
    itemId: 'coop-shiryou-seikyu',
  };
}

/**
 * 旅行・おでかけ・レジャー文脈の判定トークン（子連れ宿予約ブリッジの出し分け用）。
 *
 * 2026-07-27 修正: needle から **'spot' を削除** した。
 * 本番HTML実測で `tokyo-kodomo-mushiyoke-spot`（624clk/28日・都内の虫よけスポット記事）に
 * 「じゃらんで宿を探す」CTAが点灯していた。slug末尾の `-spot` を 'spot' needle が拾って
 * いたためで、虫よけ対策を調べている読者に宿泊予約は意図がまったく合わない
 * （A8のじゃらん枠は9本721clkのうち624clkがこの1本＝露出の86%が誤爆だった）。
 * 意図した「子連れスポットまとめ」面は 'kodzure-spot' で引き続き拾える。
 *
 * ※以前このコメントにあった「カテゴリ today-doko は needle にしない」は現行コードでも
 *   維持されている（today-doko は元から needle に無い）。実際に誤爆していたのは 'spot'。
 */
const LEISURE_NEEDLES = [
  'kodzure-spot', 'odekake', 'ryokou', 'ryoko', 'ryokan',
  'onsen', 'hotel', 'yado', 'leisure', 'pool', 'aquarium', 'camp',
  'natsuyasumi', 'kazoku-ryokou', '旅行', '宿', '温泉', 'おでかけ', '家族旅行',
  // 夏の水遊び（季節ピーク・GSC実流入あり: mizuasobi-* / 舎人公園じゃぶじゃぶ池）。
  // カテゴリ 'today-doko' は外食チェーン攻略ページも含むため needle にはしない。
  // slug/title に現れる具体トークンのみを追加し、水遊び記事だけを拾う。
  'mizuasobi', '水遊び', 'じゃぶじゃぶ', 'プール',
];

/**
 * `'宿'`（＝泊まり意図）の部分一致で誤爆する語の除去パターン。
 *
 * 実測（2026-07-27・全1,071記事に対する before/after 検証）で、`'宿'` の素の部分一致が
 * 以下5本を旅行文脈と誤判定し、じゃらん宿予約CTA（A8・実績26clk/成果0＝死に導線）を
 * 点灯させていた:
 *   - 新宿: shinjuku-station-babyroom / shitsunai-asobi-shinjuku-tokyo / tokyo-shinjuku-kodzure-lunch
 *   - 原宿: tokyo-omotesando-kodzure-lunch
 *   - 宿題: kumon-vs-gakken-hikaku
 *
 * `'宿'` そのものを消すのではなく地名・別語だけを除去するのは、`'宿'` の一致に依存している
 * 正当な旅行記事（fuji-q-area-kosodate / fuji-safari-park-kosodate / kawaguchiko-kodzure /
 * shimoda-kosodate ＝ タイトル末尾が「…・宿【2026年版】」型）を落とさないため。
 * この除去を入れた場合の一致本数は 110 → 105 本で、減るのは上記5本のみ（検証済み）。
 */
const LEISURE_FALSE_POSITIVES = /新宿|原宿|宿題|下宿/g;

/**
 * 日帰りレジャー意図の判定トークン（水遊び・プール・水族館）。
 * この意図は「泊まり」商材のじゃらんより、前売りチケットの「アソビュー！」が構造的に一致する
 * （じゃぶじゃぶ池等の無料面でも「近くの水遊び施設の前売り」への誘導として泊まりより意図が近い）。
 * 夏の水遊びは季節ピーク・GSC実流入あり（mizuasobi-* 各200-265clk）。
 */
const DAYTRIP_NEEDLES = [
  'mizuasobi', '水遊び', 'じゃぶじゃぶ', 'プール', 'pool', 'aquarium', '水族館',
];

/**
 * じゃらん等の「子連れ歓迎の宿」予約オファー（A8/VC・高単価）。
 *
 * スポット詳細(/spot)はコード内でも「アフィ最大未開拓面」と明記。旅行・おでかけ記事と
 * スポットは宿予約と相性が良く、宿予約は単価が高い。
 *
 * 意図別の出し分け（2026-07・GSC実測でmizuasobi群が夏ピーク流入）:
 *  - 日帰りトークン（水遊び/プール/水族館）を含む面は「泊まり」のじゃらんより
 *    アソビュー！（前売りチケット/VC）が意図一致。NEXT_PUBLIC_VC_ASOVIEW_URL があれば最優先。
 *  - それ以外の旅行・宿・温泉トークンは従来どおりじゃらん（NEXT_PUBLIC_TRAVEL_URL）。
 * どちらも env 未設定なら null（=描画されない・無害）。
 * 2026-06: A8 のじゃらんnet宿泊予約が提携済みのため、A8 アフィリンク（px.a8.net/...）を設定。
 * 着地はじゃらんトップのため文言は「探せます」とし、絞り込み済みを過度に約束しない。
 */
export function getTravelOffer(
  slug: string,
  category?: string,
  title?: string,
  area?: string,
): ReservationOffer | null {
  // 「新宿 / 原宿 / 宿題」等の誤爆語を先に除去してから泊まり意図を判定する。
  const leisureCtx = [slug, category, title].map((s) =>
    (s ?? '').replace(LEISURE_FALSE_POSITIVES, ''),
  );
  if (!ctxIncludes(leisureCtx, LEISURE_NEEDLES)) return null;
  // 外食チェーン面はレジャー面ではない（末尾のレジャー枠は getLeisureBridgeOffer が担当）。
  // ここで拾うと1ページに同じアソビュー枠が2つ出るため明示的に除外する。
  if (isRestaurantContext(slug, category, title)) return null;

  // 日帰り（水遊び/プール/水族館）意図はアソビュー前売りが最適。あれば最優先で返す。
  if (ctxIncludes([slug, category, title], DAYTRIP_NEEDLES)) {
    const asoview = process.env.NEXT_PUBLIC_VC_ASOVIEW_URL?.trim();
    if (isValidUrl(asoview)) {
      // 着地を「アソビュートップ」から面の意図に合う一覧へ深リンクする（実測の改善点）。
      // 例: mizuasobi-kawasaki → 神奈川県のプール・ウォーターパーク一覧。
      const href = buildVcDeepLink(
        asoview,
        resolveAsoviewLanding(slug, category, title, area),
      );
      return {
        href,
        heading: '近くの水遊び・プールを前売りでチェック',
        note: 'プール・じゃぶじゃぶ池・水族館など、近くの水遊びスポットを前売りチケットで。当日券の行列を避けて予約できる施設もあります。',
        cta: 'アソビュー！で水遊びスポットを探す →',
        itemId: 'asoview-mizuasobi-daytrip',
      };
    }
  }

  const href = process.env.NEXT_PUBLIC_TRAVEL_URL?.trim();
  if (!isValidUrl(href)) return null;
  return {
    href,
    heading: '子連れ歓迎の宿をチェック',
    note: 'おむつ替え・離乳食対応・添い寝無料など、子連れ歓迎の宿を探せます。早めの予約が安心です。',
    cta: 'じゃらんで宿を探す →',
    itemId: 'jalan-kodzure-yado',
  };
}

/**
 * kids-menu 勝ち型面（GSC実クリックのある外食チェーンの `{chain}-kids-menu` 記事）に、
 * じゃらんのレジャー/おでかけ予約CTAを1枠だけ併載するための明示 allowlist。
 *
 * 背景（2026-07 中間PDCA・GSC page-dim 28d 実測）: 王将/スシロー等のキッズメニュー面が
 * 爆伸び（ohsho-kids-menu 2,565clk・sushiro-kids-menu 622clk ほか）だが、この勝ち
 * トラフィックに「外食ついでに近場でおでかけ」意図に合う予約系アフィリCTAが乗っておらず
 * 素通りだった。じゃらん（NEXT_PUBLIC_TRAVEL_URL）の予約枠を1つ足して回収する。
 *
 * 設計（2500ecb の FOOD_BRIDGE_COEXIST_SLUGS と同じ「明示allowlist＋併載」を踏襲）:
 *  - 明示列挙のみ。クリック0の死蔵 kids-menu ページ（全37本中の未流入分）には出さない。
 *    列挙は GSC page-dim 28d でクリック実績のある外食チェーン記事に限定（テーマパーク
 *    disney/legoland は宿泊意図が薄く低流入のため除外）。
 *  - page.tsx で endOffer / showBridge とは独立した専用スロットに描画するため、
 *    既存の冷凍宅配ブリッジ枠（getRestaurantBridgeOffer）を一切奪わない（純加算）。
 *
 * 着地オファーの選定（2026-07 A8実データ・面ごとの意図適合）:
 *  kids-menu 読者＝「外食ついでに近場でおでかけ」＝日帰りレジャー意図。提携済みの
 *  じゃらんnet宿泊予約（NEXT_PUBLIC_TRAVEL_URL・A8で正常トラッキング）は「泊まり」商材で、
 *  日帰り意図とはCVRが構造的に合わない（A8実測: 旅行系 click有り・成果0）。日帰りの本命は
 *  レジャーチケットの「アソビュー！」（NEXT_PUBLIC_VC_ASOVIEW_URL / VC）。
 *  そこで本枠は getKidsMenuLeisureOffer で「アソビューが使えればアソビュー、未提携の間は
 *  暫定でじゃらん宿泊」に出し分ける（Task A の目的＝アフィリンク到達クリックの母数増を
 *  即効で満たすため、暫定でも点灯させる）。両env未設定なら null（=無害）。
 */
export const KIDS_MENU_LEISURE_SLUGS: readonly string[] = [
  'ohsho-kids-menu',
  'sushiro-kids-menu',
  'tenya-kids-menu',
  'ringerhut-kids-menu',
  'bamiyan-kids-menu',
  'saizeriya-kids-menu',
  'cocoichi-kids-menu',
  'cocos-kids-menu',
  'kappa-sushi-kids-menu',
  'bikkuri-donkey-kids-menu',
  'bigboy-kids-menu',
  'dennys-kids-menu',
  'kfc-kids-menu',
  'kurasushi-kids-menu',
  'mos-burger-kids-menu',
  'yayoiken-kids-menu',
  'gusto-kids-menu',
  'hamasushi-kids-menu',
  'marukame-kids-menu',
  'nakau-kids-menu',
  'steakgusto-kids-menu',
];

/**
 * 2026-07-27 追加: レジャー枠を kids-menu の21本から「面」へ拡張する。
 *
 * 本番HTML実測（上位198記事・20,595clk/28日）で、アソビュー枠が出ていたのは
 * 53本・9,196clk のみ。同じ「外食ついでに近場でおでかけ」意図を持つ面が丸ごと抜けていた:
 *   - 子連れ攻略面 `*-kodzure-koryaku`（saize 901 / cocos 624 / yayoiken 525 /
 *     royal-host 392 / bamiyan 356 / gyukaku 332 / gusto 302 …）
 *   - モーニング面 `*-morning-kosodate`（hoshino 882 …）・`kodzure-morning-cafe-*`（374）
 *   - 室内あそび場面 `shitsunai-asobi-*`（suginami 114 / meguro 105 …）
 *     ※室内あそび場はアソビューの「キッズパーク」ジャンルと意図が完全一致する面なのに
 *       枠自体が無かった。
 * これらは slug のパターンで安定して判別できるため、以後の新記事にも自動で枠が付く
 * （slug列挙だと新記事に永久に付かない、という旧設計の欠陥を解消する）。
 *
 * 除外: 離乳食持ち込み等の「食の主題」面は生協/宅配ブリッジが末尾を使うので重ねない。
 */
const LEISURE_SURFACE_PATTERNS: RegExp[] = [
  /-kids-menu$/,
  /-kodzure-koryaku$/,
  /^kodzure-.*-koryaku$/,
  /-morning-kosodate$/,
  /^kodzure-morning-cafe/,
  /^shitsunai-asobi-/,
  /^kodzure-famires-/,
];

/** kids-menu 勝ち型面か（じゃらんレジャー枠の併載対象・明示allowlist）。 */
export function allowsKidsMenuLeisureOffer(slug: string): boolean {
  return KIDS_MENU_LEISURE_SLUGS.includes(slug);
}

/** レジャー枠を出す面か（明示allowlist または 面パターン）。 */
export function allowsLeisureBridgeOffer(slug: string): boolean {
  if (KIDS_MENU_LEISURE_SLUGS.includes(slug)) return true;
  const s = slug.toLowerCase();
  // 離乳食主題の面は末尾スロットを生協/宅配ブリッジが使うため重ねない。
  if (/rinyushoku|rinyuushoku/.test(s)) return false;
  return LEISURE_SURFACE_PATTERNS.some((re) => re.test(s));
}

/**
 * kids-menu 勝ち型面向けの「外食ついでに近場でおでかけ」予約CTA。
 *
 * allowlist（KIDS_MENU_LEISURE_SLUGS）外、または両env未設定なら null。
 * page.tsx では末尾の endOffer（生協/宿予約）・冷凍宅配ブリッジとは独立した専用スロットに
 * 描画するため、既存枠を奪わずに1枠だけ純加算する。
 *
 * 着地の出し分け（日帰り意図に最適化・暫定フォールバック付き）:
 *  1. NEXT_PUBLIC_VC_ASOVIEW_URL（アソビュー！/VC）があれば最優先＝日帰りレジャーの本命。
 *     文言も「おでかけ先・前売りチケット」の日帰り訴求にする。
 *  2. 無ければ暫定で NEXT_PUBLIC_TRAVEL_URL（じゃらん宿泊/A8・現在稼働中）にフォールバック。
 *     着地が宿のため文言も「子連れ歓迎の宿・週末プチ旅行」に正直に合わせる（日帰り体験を
 *     約束しない）。アソビュー提携が下り次第 env を入れれば自動で1へ格上げ。
 *  3. どちらも無ければ null（=非表示・無害）。
 */
export function getLeisureBridgeOffer(
  slug: string,
  category?: string,
  title?: string,
  area?: string,
): ReservationOffer | null {
  if (!allowsLeisureBridgeOffer(slug)) return null;

  const asoview = process.env.NEXT_PUBLIC_VC_ASOVIEW_URL?.trim();
  if (isValidUrl(asoview)) {
    // 着地をアソビュートップから面の意図＋都道府県の一覧へ深リンクする。
    // 外食チェーン面は全国一覧、`shitsunai-asobi-{区}-tokyo` のような面は
    // 「東京都のキッズパーク」へ落ちる。
    const href = buildVcDeepLink(
      asoview,
      resolveAsoviewLanding(slug, category, title, area),
    );
    const isIndoorPlay = /^shitsunai-asobi-/.test(slug.toLowerCase());
    return {
      href,
      heading: isIndoorPlay ? '室内あそび場は前売りが早い' : '外食のあとは近くでおでかけ',
      note: isIndoorPlay
        ? '雨の日・猛暑日は室内あそび場が混みます。前売りチケットなら窓口の行列を避けて入れる施設があります。'
        : '水族館・動物園・室内あそび場など、近くのレジャーを前売りでサクッと。当日券の行列を避けて予約できます。',
      cta: 'アソビュー！でおでかけ先を探す →',
      itemId: isIndoorPlay ? 'asoview-indoor-play' : 'asoview-kids-menu-leisure',
    };
  }

  // 暫定フォールバック: アソビュー未提携の間はじゃらん宿泊で母数を確保（泊まり寄り・正直な文言）。
  const jalan = process.env.NEXT_PUBLIC_TRAVEL_URL?.trim();
  if (isValidUrl(jalan)) {
    return {
      href: jalan,
      heading: '週末は近くでおでかけ・お泊まりも',
      note: '外食ついでに、子連れ歓迎の宿もチェック。おむつ替え・離乳食対応・添い寝無料の宿を近場で探せます。',
      cta: 'じゃらんで子連れ歓迎の宿を探す →',
      itemId: 'jalan-kids-menu-leisure',
    };
  }

  return null;
}

/** @deprecated 面ベースの getLeisureBridgeOffer を使う。既存呼び出し互換のため残置。 */
export function getKidsMenuLeisureOffer(slug: string): ReservationOffer | null {
  return allowsKidsMenuLeisureOffer(slug) ? getLeisureBridgeOffer(slug) : null;
}

/** スポット詳細ページ向けの宿予約オファー（park/restaurant 以外のレジャー全般）。 */
export function getSpotTravelOffer(category: string): ReservationOffer | null {
  if (category === 'park' || category === 'restaurant') return null;
  const href = process.env.NEXT_PUBLIC_TRAVEL_URL?.trim();
  if (!isValidUrl(href)) return null;
  return {
    href,
    heading: '近くの子連れ歓迎の宿を探す',
    note: '泊まりで遊ぶなら、おむつ替え・離乳食対応・添い寝無料など子連れ歓迎の宿が安心です。',
    cta: 'じゃらんで宿を探す →',
    itemId: 'jalan-kodzure-yado-spot',
  };
}

/**
 * ホットペッパーグルメの「子連れOK」絞り込み済み着地URL。
 * 汎用トップ（hotpepper.jp/）に飛ばすより、子連れ条件で絞り込んだ一覧に着地させる方が
 * 読者の意図（=今から子連れで外食）に近く、予約成約率が上がるという仮説に基づく。
 *
 * 既定値は「全国・子連れ可ランチ特集」(top_party38/U031/) ＝ エリア非依存で常設（実在確認済み）。
 * チェーン店記事はエリアを持たないためこの全国ハブが最適。
 * env で上書き可能（例: 特定エリアの SA11/U031/ など、VCで動作確認した着地URLを指定）。
 */
const HOTPEPPER_CHILD_FRIENDLY_URL =
  process.env.NEXT_PUBLIC_VC_HOTPEPPER_DEEPLINK?.trim() ||
  'https://www.hotpepper.jp/top_party38/U031/';

/**
 * VC の MyLink（referral URL）の `vc_url` パラメータを、同一マーチャントドメイン内の
 * 別の着地URL（=子連れ絞り込みページ）に差し替える。VCトラッキング（sid/pid）は維持される。
 *
 * 安全設計（壊れたアフィリンクを本番に出さないための防御）:
 *  - VC referral URL でない / vc_url が無い / パース失敗 → 元の myLink をそのまま返す（no-op）。
 *  - 着地URLのホストが元の vc_url と異なる場合は差し替えない（承認外ドメインへ飛ばさない）。
 *  - 元の vc_url が持つ vos 等のトラッキングクエリは新着地URLにも引き継ぐ。
 */
export function buildVcDeepLink(myLink: string, landingUrl: string): string {
  try {
    const ref = new URL(myLink);
    const origVcUrl = ref.searchParams.get('vc_url');
    if (!origVcUrl) return myLink;
    const orig = new URL(origVcUrl);
    const landing = new URL(landingUrl);
    if (landing.host !== orig.host) return myLink; // 承認マーチャント外には飛ばさない
    // 元の着地URLのクエリ（vos 等）を引き継ぐ（新URL側に無いものだけ）
    orig.searchParams.forEach((v, k) => {
      if (!landing.searchParams.has(k)) landing.searchParams.set(k, v);
    });
    ref.searchParams.set('vc_url', landing.toString());
    return ref.toString();
  } catch {
    return myLink;
  }
}

/**
 * 外食文脈の記事に出す「ネット予約」CTA（ホットペッパーグルメ / VC）。
 *
 * - 非外食文脈、または env 未設定なら null（=描画しない）。
 * - env が設定されていれば、子連れOK店のネット予約へ橋渡しするオファーを返す。
 */
export function getRestaurantReservationOffer(
  slug: string,
  category?: string,
  title?: string,
): ReservationOffer | null {
  if (!isRestaurantContext(slug, category, title)) return null;
  // タイアップ記事には競合他店への予約導線を出さない（下記 TIEUP_ARTICLE_SLUGS を参照）。
  if (isTieupArticle(slug)) return null;

  const base = process.env.NEXT_PUBLIC_VC_HOTPEPPER_URL?.trim();
  if (!isValidUrl(base)) return null;
  const href = buildVcDeepLink(base, HOTPEPPER_CHILD_FRIENDLY_URL);

  return {
    href,
    heading: '子連れOKのお店をネット予約',
    note: 'キッズメニュー・個室・ベビーカー入店など、子連れ向け条件でお店を探して当日席を確保。',
    cta: 'ホットペッパーで子連れOK店を予約 →',
    itemId: 'hotpepper-reservation',
  };
}

/**
 * スポット詳細ページ向けのネット予約/チケットCTA（カテゴリ別）。
 *
 * メモリ「最大の未開拓面」= /spot/[slug] はアフィゼロ。流入文脈に合わせて出し分ける:
 *   - restaurant → ホットペッパーグルメ予約（NEXT_PUBLIC_VC_HOTPEPPER_URL）
 *   - aquarium / amusement / zoo / museum / farm / seasonal / indoor
 *       → アソビュー！のレジャーチケット（NEXT_PUBLIC_VC_ASOVIEW_URL）
 *   - park → 予約導線なし（基本無料施設）
 *
 * env 未設定 or 該当カテゴリ外なら null（=描画しない）。VC承認後に env を入れるだけで点灯。
 */
const ASOVIEW_CATEGORIES = new Set([
  'aquarium',
  'amusement',
  'zoo',
  'museum',
  'farm',
  'seasonal',
  'indoor',
]);

export function getSpotReservationOffer(category: string): ReservationOffer | null {
  if (category === 'restaurant') {
    const base = process.env.NEXT_PUBLIC_VC_HOTPEPPER_URL?.trim();
    if (!isValidUrl(base)) return null;
    const href = buildVcDeepLink(base, HOTPEPPER_CHILD_FRIENDLY_URL);
    return {
      href,
      heading: 'このお店をネット予約',
      note: '子連れ向けの席・コースを確認して、当日の席を確保。',
      cta: 'ホットペッパーで予約 →',
      itemId: 'hotpepper-reservation-spot',
    };
  }
  if (ASOVIEW_CATEGORIES.has(category)) {
    const base = process.env.NEXT_PUBLIC_VC_ASOVIEW_URL?.trim();
    if (!isValidUrl(base)) return null;
    // スポットのカテゴリに一致するアソビューのジャンル一覧へ深リンク（トップ着地をやめる）。
    const href = buildVcDeepLink(
      base,
      buildAsoviewLanding(asoviewGenreForSpotCategory(category)),
    );
    return {
      href,
      heading: 'チケット・前売りをチェック',
      note: '当日券の行列を避けて、事前にレジャーチケットを購入できる場合があります。',
      cta: 'アソビュー！で前売り券を見る →',
      itemId: 'asoview-ticket-spot',
    };
  }
  return null;
}
