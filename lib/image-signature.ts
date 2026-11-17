/**
 * 画像ファイルの中身（先頭バイト）から形式を判定する。
 * 送り手が名乗る Content-Type（File.type）は信用せず、ここで jpg / png / webp のどれかであることを確かめる。
 */
export type ImageSignature = 'jpeg' | 'png' | 'webp';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(buf: Uint8Array, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buf[offset + i] !== bytes[i]) return false;
  }
  return true;
}

function ascii(s: string): number[] {
  return Array.from(s, (c) => c.charCodeAt(0));
}

/** jpg（FF D8 FF）・png（89 50 4E 47 0D 0A 1A 0A）・webp（"RIFF"＋4バイト＋"WEBP"）のどれかなら形式名、違えば null。 */
export function detectImageSignature(buf: Uint8Array): ImageSignature | null {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buf, PNG)) return 'png';
  if (startsWith(buf, ascii('RIFF')) && startsWith(buf, ascii('WEBP'), 8)) return 'webp';
  return null;
}
