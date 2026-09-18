/**
 * 管理画面からアップロードされた Vercel Blob 画像を Next.js 画像最適化（/_next/image）経由で配信する。
 *
 * 背景（2026-09-18 実測）: Blob には 2〜4MB の PNG/JPG 原寸がそのまま入っており、
 * トップページだけで画像 68MB、スポット詳細のヒーローも 3MB だった。
 * /_next/image を通すと表示幅に合わせて縮小＋AVIF/WebP化される（Blob 上の元データや保存済みURLは変えずに済む）。
 *
 * /public の画像は既に軽い webp なので対象外（最適化の変換回数＝コストを増やさない）。
 */
const BLOB_HOST_RE = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i;

// next.config.ts の images.deviceSizes に含まれる幅のみ使える（既定値の部分集合）。
const WIDTHS = [640, 1080, 1920] as const;

export function isBlobImage(src: string | undefined | null): src is string {
  return !!src && BLOB_HOST_RE.test(src);
}

function nextImageUrl(src: string, w: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

/**
 * <img> に展開する属性。Blob 以外は src をそのまま返す（挙動不変）。
 * sizes は表示幅のヒント。カード用途の既定は「スマホ全幅／PCは最大480px」。
 */
export function optimizedImgAttrs(
  src: string,
  sizes = '(max-width: 640px) 100vw, 480px',
): { src: string; srcSet?: string; sizes?: string } {
  if (!isBlobImage(src)) return { src };
  return {
    src: nextImageUrl(src, 1080),
    srcSet: WIDTHS.map((w) => `${nextImageUrl(src, w)} ${w}w`).join(', '),
    sizes,
  };
}
