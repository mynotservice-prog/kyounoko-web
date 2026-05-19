import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

/**
 * /admin/image-gen から呼ばれる単発画像再生成API。
 *
 * セキュリティ:
 *  - localhost / dev only：本番 Vercel では画像生成しても /public/ への書き込みが
 *    永続化されないので無効化。代わりに ALLOW_REMOTE_GEN=1 をVercel env に
 *    入れたときだけ動作させる（基本オフ）。
 *  - referrer が /admin/* であることを念のため確認。
 *
 * 仕様:
 *  - POST { slug: string, steps?: 1-8 }
 *  - レスポンス: { ok: boolean, log: string, manifestEntry?: object }
 *  - 内部で scripts/generate-hero-images-cloudflare.mjs を子プロセスとして起動
 *  - 1リクエスト1枚ずつ。並列実行は許可しない（同一slug連打防止）。
 */

const PROJECT_ROOT = process.cwd();
const inflight = new Set<string>(); // 連打防止

function isAllowedToRun(req: NextRequest): { ok: boolean; reason?: string } {
  // ローカル開発時のみ動作
  if (process.env.NODE_ENV === 'development') return { ok: true };
  // 本番でも明示的に許可された場合だけ動作
  if (process.env.ALLOW_REMOTE_GEN === '1') {
    // referrerが /admin/image-gen 由来かを軽く確認（CSRF対策）
    const ref = req.headers.get('referer') || '';
    if (!/\/admin\/image-gen/.test(ref)) return { ok: false, reason: 'invalid referer' };
    return { ok: true };
  }
  return { ok: false, reason: 'remote gen disabled (set ALLOW_REMOTE_GEN=1 to enable)' };
}

export async function POST(req: NextRequest) {
  const guard = isAllowedToRun(req);
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });
  }

  let body: { slug?: string; steps?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }
  const slug = (body.slug || '').trim();
  const steps = Math.min(Math.max(body.steps ?? 8, 1), 8);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  }
  if (inflight.has(slug)) {
    return NextResponse.json({ ok: false, error: 'already generating this slug' }, { status: 429 });
  }
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN 未設定' },
      { status: 500 }
    );
  }

  inflight.add(slug);
  try {
    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'generate-hero-images-cloudflare.mjs');
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ ok: false, error: 'generator script not found' }, { status: 500 });
    }
    const log = await runChild(
      'node',
      [scriptPath, `--slug=${slug}`, `--steps=${steps}`, '--force'],
      PROJECT_ROOT,
      60_000 // 60s タイムアウト
    );

    // manifestから対象の生成結果を確認
    const manifestPath = path.join(PROJECT_ROOT, 'public', 'hero-ai', 'manifest.json');
    let manifestEntry: unknown = null;
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifestEntry = m[slug] ?? null;
      } catch {
        /* noop */
      }
    }
    const jpgExists = fs.existsSync(path.join(PROJECT_ROOT, 'public', 'hero-ai', `${slug}.jpg`));

    return NextResponse.json({
      ok: jpgExists,
      log: log.slice(-3000), // 末尾3000字
      manifestEntry,
      hasImage: jpgExists,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    inflight.delete(slug);
  }
}

function runChild(cmd: string, args: string[], cwd: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let buf = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('timeout'));
    }, timeoutMs);
    child.stdout.on('data', (d) => { buf += d.toString(); });
    child.stderr.on('data', (d) => { buf += d.toString(); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(buf);
      else reject(new Error(`exit ${code}\n${buf.slice(-1500)}`));
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
