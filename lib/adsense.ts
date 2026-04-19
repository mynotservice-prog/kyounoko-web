/**
 * AdSense 共通設定。
 *
 * Publisher ID は公開情報なので、Vercel env 未設定時のデフォルトとして
 * コードに埋め込んでおく（環境変数が優先）。
 */

const DEFAULT_PUB_ID = 'pub-4445473825791494';

const raw = (process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? DEFAULT_PUB_ID).trim();

/** ca-pub-XXX 正規化済みの client param。常に有効値（フォールバック込み）。 */
export const ADSENSE_CLIENT = raw.startsWith('ca-') ? raw : `ca-${raw}`;

/** pub-XXX 形式（ads.txt 用）。 */
export const ADSENSE_PUB_ID = raw.startsWith('ca-') ? raw.slice(3) : raw;

/** スクリプトタグで使う src URL。 */
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
