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
 * Auto Ads（自動広告）を有効にするか。
 * 審査通過後 env `NEXT_PUBLIC_ADSENSE_AUTO_ADS=true` で有効化。
 * Auto Ads はGoogleが最適な位置に自動で広告を配置する仕組み。
 * 個別 AdSlot より管理が楽だが、配置の自由度は下がる。
 */
export const ADSENSE_AUTO_ADS: boolean =
  process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS?.trim().toLowerCase() === 'true';
