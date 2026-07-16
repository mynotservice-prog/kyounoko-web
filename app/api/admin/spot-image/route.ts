import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isBlobConfigured, uploadToBlob } from '@/lib/blob-store';

/**
 * 管理画面の画像アップロード API（スポット編集・記事/プランのhero共用）。
 *
 * 機能:
 *  - POST (multipart/form-data) { slug, file, dir? } → 画像を保存しパスを返す
 *      dir: 'spots'（既定） | 'articles'
 *      レスポンス: { ok: true, path: '/img/<dir>/<slug>-<ts>.<ext>' }（Blob設定時は公開URL）
 *
 * 保存先:
 *  - ローカル開発: public/img/spots/ に直接書き込み
 *  - 本番: GitHub Contents API で public/img/spots/ にバイナリ commit → 自動デプロイ
 *    （Vercel の /public は実行時書き込みが永続化されないため、リポジトリへ commit する）
 *
 * 返ってきた path を spot-overrides の image フィールドに保存すると hero 画像が差し替わる。
 *
 * セキュリティ:
 *  - 開発時は無条件許可、本番は ALLOW_ADMIN_EDIT≠'0' + /admin 配下 referer
 *  - slug は [a-z0-9_-]+、画像のみ（webp/jpeg/png/gif）、最大 5MB
 */

const ROOT = process.cwd();
// 保存先ディレクトリ。呼び出し元が dir で指定（spot編集=spots / 記事・プランのhero=articles）。
const ALLOWED_DIRS = ['spots', 'articles'] as const;
type UploadDir = (typeof ALLOWED_DIRS)[number];
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

function isValidSlug(s: unknown): s is string {
  // slug は spotToSlug() が name の ASCII を encodeURIComponent 経由でそのまま残すため、
  // 大文字に加えて encodeURIComponent が非エスケープにする記号（! . ~ * ' ( )）も含みうる。
  // 例: ASOBono!（東京ドームシティ アソボーノ）→ slug "ASOBono!-a463"。
  // これらを弾くと当該スポットだけ画像アップロード/保存が 400 になるため許可する。
  // '/' は含まれないためパストラバーサルは起きない。
  return typeof s === 'string' && /^[A-Za-z0-9_.!~*'()-]+$/.test(s);
}

async function ghPutBinary(
  fileRel: string,
  base64: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return { ok: false, error: 'GITHUB_TOKEN/REPO not set' };
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(fileRel)}`;
  const body: Record<string, unknown> = { message, content: base64, branch };
  const author = process.env.GITHUB_AUTHOR_NAME;
  const email = process.env.GITHUB_AUTHOR_EMAIL;
  if (author && email) body.committer = { name: author, email };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kyounoko-admin',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: `github ${res.status}: ${errText.slice(0, 200)}` };
  }
  return { ok: true };
}

export async function POST(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 });
  }

  const slug = form.get('slug');
  const file = form.get('file');
  const dirRaw = form.get('dir');
  const dir: UploadDir = ALLOWED_DIRS.includes(dirRaw as UploadDir) ? (dirRaw as UploadDir) : 'spots';
  if (!isValidSlug(slug)) return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: '対応形式は webp / jpeg / png / gif です' },
      { status: 400 },
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) return NextResponse.json({ error: 'empty file' }, { status: 400 });
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: '画像は5MBまでです' }, { status: 400 });
  }

  // 衝突しないファイル名（slug + 短いタイムスタンプ）
  const ts = Date.now().toString(36);
  const filename = `${slug}-${ts}.${ext}`;
  const publicDirRel = `public/img/${dir}`;
  const fileRel = `${publicDirRel}/${filename}`;
  const publicPath = `/img/${dir}/${filename}`;

  // Blob 設定時: Blob にアップロードして公開URLを返す（git commit不要・デプロイ不要）。
  if (isBlobConfigured()) {
    const url = await uploadToBlob(`${dir}/${filename}`, buf, file.type);
    if (!url) return NextResponse.json({ error: 'blob upload failed' }, { status: 500 });
    return NextResponse.json({ ok: true, mode: 'blob', path: url });
  }

  // ローカル開発: public へ直接書き込み
  if (process.env.NODE_ENV === 'development') {
    try {
      const dirAbs = path.join(ROOT, publicDirRel);
      await fs.mkdir(dirAbs, { recursive: true });
      await fs.writeFile(path.join(ROOT, fileRel), buf);
    } catch (e) {
      return NextResponse.json(
        { error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, mode: 'local', path: publicPath });
  }

  // 本番: GitHub に commit
  const r = await ghPutBinary(fileRel, buf.toString('base64'), `chore(admin): upload image ${fileRel}`);
  if (!r.ok) {
    return NextResponse.json({ error: r.error || 'github upload failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'github', path: publicPath });
}
