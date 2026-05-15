/**
 * AdSense 共通設定。
 *
 * Publisher ID は公開情報なので、コードにデフォルト値として埋め込む。
 * Vercel env NEXT_PUBLIC_ADSENSE_PUB_ID で上書き可能。
 *
 * ## 表示制御
 * - ads.txt / meta / pub-id は常に配信（AdSense 審査用）
 * - 広告スロット（<ins>）とスクリプト読み込みは ADSENSE_ENABLED が true のときのみ表示
 * - 審査通過前は env `NEXT_PUBLIC_ADSENSE_ENABLED=true` を設定しない限り非表示
 *   → 空の「広告」ラベルだけが残るUX劣化を防ぐ
 */

const DEFAULT_PUB_ID = 'pub-4445473825791494';

const raw = (process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? DEFAULT_PUB_ID).trim();

/** ca-pub-XXX 正規化済みの client。常に有効値。 */
export const ADSENSE_CLIENT: string = raw.startsWith('ca-') ? raw : `ca-${raw}`;

/** pub-XXX 形式（ads.txt 用）。 */
export const ADSENSE_PUB_ID: string = raw.startsWith('ca-') ? raw.slice(3) : raw;

/** スクリプトの src URL。 */
export const ADSENSE_SCRIPT_SRC: string = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/**
 * AdSense 広告を実際にレンダリングするかどうか。
 * 審査通過後に Vercel env `NEXT_PUBLIC_ADSENSE_ENABLED=true` を設定することで有効化。
 * デフォルト false（広告枠は非表示）。
 */
export const ADSENSE_ENABLED: boolean =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED?.trim().toLowerCase() === 'true';

/**
 * 有効な Publisher ID（pub-XXXXXXXXXXXXXXXX）が設定されているか。
 *
 * 【重要】AdSense の審査・承認には、サイトに AdSense コード（adsbygoogle.js）が
 * 常時設置されていることが前提。審査用クローラがコードを検出できないと、
 * サイトのステータスが「準備中」から進まない。
 * そのため <script> の読み込みは ADSENSE_ENABLED ではなくこのフラグで制御し、
 * pub ID さえあれば審査前から常にスクリプトを設置する。
 *
 * 一方、実際に表示される広告枠 <ins>（AdSlot コンポーネント）は引き続き
 * ADSENSE_ENABLED で制御するため、審査前に空の広告枠が出ることはない。
 */
export const ADSENSE_PUB_ID_CONFIGURED: boolean = /^pub-\d{10,}$/.test(
  ADSENSE_PUB_ID,
);

/**
 * Auto Ads（自動広告）を有効にするか。
 * 審査通過後 env `NEXT_PUBLIC_ADSENSE_AUTO_ADS=true` で有効化。
 * Auto Ads はGoogleが最適な位置に自動で広告を配置する仕組み。
 * 個別 AdSlot より管理が楽だが、配置の自由度は下がる。
 */
export const ADSENSE_AUTO_ADS: boolean =
  process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS?.trim().toLowerCase() === 'true';

/**
 * AdSense 広告ユニットのスロットID（pub-4445473825791494 配下）。
 *
 * - DISPLAY: 一般的なディスプレイ広告（auto / レスポンシブ）
 * - IN_ARTICLE: 記事本文中インライン広告（in-article fluid）
 * - IN_FEED: 一覧・フィード用ネイティブ広告（in-feed fluid + layout-key）
 *
 * 公開情報なのでデフォルト値をハードコード。env で上書き可能。
 */
export const ADSENSE_SLOT_DISPLAY: string =
  (process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY ?? '7826131694').trim();

export const ADSENSE_SLOT_IN_ARTICLE: string =
  (process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? '1853643928').trim();

export const ADSENSE_SLOT_IN_FEED: string =
  (process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED ?? '5792888939').trim();

/**
 * Multiplex 広告（関連コンテンツ風グリッド）のスロットID。
 * 記事末尾やページ末尾でユーザー回遊が止まる場所に最適。
 * data-ad-format="autorelaxed" で配信される。
 */
export const ADSENSE_SLOT_MULTIPLEX: string =
  (process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX ?? '7598900988').trim();

/** インフィード広告ユニットの layout-key（AdSense管理画面で発行された値）。 */
export const ADSENSE_IN_FEED_LAYOUT_KEY: string =
  (process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY ?? '-7b+d9+1p+m+22').trim();
