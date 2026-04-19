import { NextRequest, NextResponse } from 'next/server';

/**
 * /admin 配下を Basic 認証で保護する。
 *
 * 環境変数:
 *   ADMIN_USER     ... 管理ユーザー名（Vercel env で設定）
 *   ADMIN_PASSWORD ... 管理パスワード（Vercel env で設定）
 *
 * 未設定時は 503 を返し、誤って公開されないようにする。
 * HTTPS 前提（Vercel 本番は常時 HTTPS）なので Basic Auth で十分。
 */
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse('Admin is not configured. Set ADMIN_USER and ADMIN_PASSWORD env vars.', {
      status: 503,
    });
  }

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    const encoded = auth.slice(6).trim();
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      // fallthrough
    }
    const idx = decoded.indexOf(':');
    if (idx !== -1) {
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (constantTimeEqual(user, expectedUser) && constantTimeEqual(pass, expectedPass)) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin area", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};

/** タイミング攻撃を弱めるための定数時間比較（Edge Runtime 互換） */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
