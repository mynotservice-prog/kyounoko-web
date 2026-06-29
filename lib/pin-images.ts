// Pinterest 用の縦長(2:3, 1000x1500)Pin画像を持つ記事 slug。
// public/pins/<slug>.jpg に配置し、記事ページの og:image に「横長の後」へ追加して露出する。
// LINE/Twitter/FB は1枚目の横長を使うので共有カードは不変。
// Pinterest の「ウェブサイトから保存」ピッカーや訪問者のピン保存で、この縦長が選べる。
export const PIN_IMAGE_SLUGS = new Set<string>([
  '2sai-kanshaku-koekake-top10',
  'babyfood-vs-tedukuri',
  'bebycar-ok-cafe-15',
  'bamiyan-kodzure-koryaku',
  '0-1sai-ie-asobi-10pun',
]);

/** 縦長Pin画像の絶対URL（無ければ null） */
export function pinImageUrl(slug: string): string | null {
  return PIN_IMAGE_SLUGS.has(slug) ? `https://kyounoko.jp/pins/${slug}.jpg` : null;
}
