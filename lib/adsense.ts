/**
 * AdSense 共通設定。
 *
 * Publisher ID は環境変数 NEXT_PUBLIC_ADSENSE_PUB_ID から取得。
 * 未設定時は null → 全ての AdSense 関連出力が無効化される。
 *
 * AdSense の再登録/申請時は:
 *   1. AdSense 管理画面でサイトを登録して Publisher ID を取得
 *   2. Vercel env に NEXT_PUBLIC_ADSENSE_PUB_ID を設定（ca- あり/なしどちらでも可）
 *   3. Redeploy
 *   4. 以降、ads.txt / meta / script / AdSlot 全てが自動配信
 */

const raw = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim();

/** ca-pub-XXX 正規化済みの client。未設定時は null（AdSense完全無効）。 */
export const ADSENSE_CLIENT: string | null = raw
  ? raw.startsWith('ca-')
    ? raw
    : `ca-${raw}`
  : null;

/** pub-XXX 形式（ads.txt 用）。未設定時は null。 */
export const ADSENSE_PUB_ID: string | null = raw
  ? raw.startsWith('ca-')
    ? raw.slice(3)
    : raw
  : null;

/** スクリプトの src URL。未設定時は null。 */
export const ADSENSE_SCRIPT_SRC: string | null = ADSENSE_CLIENT
  ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  : null;

/** AdSense が有効化されているかのフラグ（テンプレート側の条件分岐用）。 */
export const ADSENSE_ENABLED = Boolean(ADSENSE_CLIENT);
