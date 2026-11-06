import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * ビルド時に作る OGP 画像（app/data/*／opengraph-image.tsx）用の日本語フォント。
 *
 * 以前は Google Fonts から都度取得していたが、取得が一時的に失敗すると
 * 「No fonts are loaded」でビルド全体が落ちた（2026-11-06 #433 のマージ後ビルド）。
 * そのためリポジトリに同梱したフォントを読む。ネットワークには出ない。
 *
 * lib/fonts/NotoSansJP-Bold-og.ttf = Noto Sans JP（SIL OFL 1.1・google/fonts）を
 * wght=700 に固定し、ASCII＋JIS 第1・第2水準（cp932）＋かな・記号に絞ったもの（約2.4MB）。
 * 収録外の字は豆腐になるので、珍しい字を画像に出すときは注意。
 *
 * 置き場所は assets/ ではなく lib/fonts/。.vercelignore が /assets を丸ごと除外しており、
 * assets/ に置くと Vercel のビルドに上がらず ENOENT で落ちる（2026-11-07 #434）。
 */
export async function loadOgFontBold(): Promise<ArrayBuffer> {
  const buf = await readFile(join(process.cwd(), 'lib/fonts/NotoSansJP-Bold-og.ttf'));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
