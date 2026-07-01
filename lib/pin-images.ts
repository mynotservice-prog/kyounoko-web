// Pinterest 用の縦長(2:3, 1000x1500)Pin画像を持つ記事 slug。
// public/img/pins/<slug>.jpg に配置する。
//  - og:image: 横長の「後」へ縦長を追加（共有カードは1枚目の横長で不変）。
//  - 本文内に実 <img> としても描画する。Pinterestの「URLから保存」ピッカーは
//    og:image を拾わず本文 <img> を拾うため、これが無いと縦長を選べない（検証済 2026-06-30）。
//  - /pins/ ではなく /img/ 配下に置くのは、Pinterest画像プロキシ/CFで /img/ が確実に取得できるため。
export const PIN_IMAGE_SLUGS = new Set<string>([
  '2sai-kanshaku-koekake-top10',
  'babyfood-vs-tedukuri',
  'bebycar-ok-cafe-15',
  'bamiyan-kodzure-koryaku',
  '0-1sai-ie-asobi-10pun',
]);

/** 縦長Pin画像のパス（無ければ null）。本文 <img src> 用。 */
export function pinImagePath(slug: string): string | null {
  return PIN_IMAGE_SLUGS.has(slug) ? `/img/pins/${slug}.jpg` : null;
}

/** 縦長Pin画像の絶対URL（無ければ null）。og:image 用。 */
export function pinImageUrl(slug: string): string | null {
  const p = pinImagePath(slug);
  return p ? `https://kyounoko.jp${p}` : null;
}
