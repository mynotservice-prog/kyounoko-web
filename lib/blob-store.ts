/**
 * Vercel Blob 薄ラッパ（画像アップロード）。
 *
 * 目的: アップロード画像を public/ への git commit ではなく Blob ストレージに置き、
 *   返ってきた公開URLを上書きデータに保存する。リポジトリが太らず、デプロイ不要。
 *
 * セットアップ: Vercel → Storage で Blob を作成すると BLOB_READ_WRITE_TOKEN が自動注入される。
 * 未設定時は isBlobConfigured()=false → 呼び出し側は従来の GitHub commit にフォールバック。
 */
import { put } from '@vercel/blob';

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Blob にアップロードして公開URLを返す。未設定/失敗時は null。
 * pathname は 'spots/<slug>-<ts>.webp' のような相対パス。
 */
export async function uploadToBlob(
  pathname: string,
  data: Buffer | ArrayBuffer,
  contentType?: string,
): Promise<string | null> {
  if (!isBlobConfigured()) return null;
  try {
    const res = await put(pathname, data, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res.url;
  } catch (e) {
    console.error('[blob] put failed', e instanceof Error ? e.message : e);
    return null;
  }
}
