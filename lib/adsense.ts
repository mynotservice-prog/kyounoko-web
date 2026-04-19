/**
 * AdSense 共通設定。
 *
 * Publisher ID は公開情報なので、コードにデフォルト値として埋め込む。
 * Vercel env NEXT_PUBLIC_ADSENSE_PUB_ID で上書き可能。
 *
 * 現在の状態: AdSense 審査中（ads.txt/meta/script 配信で審査通過を待つ）
 */

const DEFAULT_PUB_ID = 'pub-4445473825791494';

const raw = (process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? DEFAULT_PUB_ID).trim();

/** ca-pub-XXX 正規化済みの client。常に有効値。 */
export const ADSENSE_CLIENT: string = raw.startsWith('ca-') ? raw : `ca-${raw}`;

/** pub-XXX 形式（ads.txt 用）。 */
export const ADSENSE_PUB_ID: string = raw.startsWith('ca-') ? raw.slice(3) : raw;

/** スクリプトの src URL。 */
export const ADSENSE_SCRIPT_SRC: string = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/** AdSense が有効化されているかのフラグ（常に true、コンポーネント側の条件分岐互換用）。 */
export const ADSENSE_ENABLED = true;
