#!/usr/bin/env node
/**
 * AdSense Management API のリフレッシュトークンを取得する（対話式・ローカル実行）。
 *
 * なぜ手作業が要るか:
 *   GA4 / Search Console はサービスアカウント共有ができるので自動化済みだが、
 *   **AdSense はサービスアカウントに非対応**。人間のGoogleアカウントの同意が必須で、
 *   ここだけはブラウザでの承認操作を代行できない。1回やればトークンは永続的に使える。
 *
 * 事前準備（ブラウザ・5分）:
 *   1. https://console.cloud.google.com/apis/library/adsense.googleapis.com
 *      → プロジェクト kyounoko-website を選んで「有効にする」
 *   2. 同意画面（Google Auth Platform）を作る。対象は「外部」。
 *   3. **同意画面の公開ステータスを「本番環境」にする**（Google Auth Platform → 対象 → アプリを公開）。
 *      ここが「テスト中」のままだと、外部アプリに発行されるリフレッシュトークンは
 *      **7日で失効する**。設定した1週間後に /admin/kpi の AdSense が黙って ¥0 に戻るので、
 *      認可の前に必ず本番環境へ切り替えること。
 *      https://developers.google.com/identity/protocols/oauth2#expiration
 *   4. https://console.cloud.google.com/apis/credentials
 *      → 「認証情報を作成」→「OAuth クライアント ID」→ 種類は **デスクトップ アプリ**
 *      → 作成後に出る クライアントID と クライアントシークレット を控える
 *
 * 承認時に「このアプリは Google で確認されていません」と出るのは想定どおり
 * （adsense.readonly は機微スコープで、個人利用では審査を通さないため）。
 * 「詳細」→「（安全ではないページ）に移動」で進む。
 *
 * 使い方:
 *   node scripts/adsense-oauth-setup.mjs
 *   → クライアントID / シークレットを聞かれるので貼る
 *   → 表示されたURLをブラウザで開いて承認
 *   → 最後に Vercel に設定する env が表示される
 *
 * 注意: 出力されるリフレッシュトークンは秘密情報。ファイルに保存せず、
 *       そのまま Vercel の環境変数に貼ること。
 */
import { createServer } from 'node:http';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const PORT = 53682; // デスクトップクライアントのループバック用（任意の空きポート）
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = 'https://www.googleapis.com/auth/adsense.readonly';

const rl = createInterface({ input: stdin, output: stdout });
const clientId = (await rl.question('OAuth クライアントID: ')).trim();
const clientSecret = (await rl.question('OAuth クライアントシークレット: ')).trim();
rl.close();

if (!clientId || !clientSecret) {
  console.error('\nクライアントID / シークレットが空です。中止しました。');
  process.exit(1);
}

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent', // refresh_token を必ず返させる
  });

console.log('\n次のURLをブラウザで開いて承認してください:\n');
console.log(authUrl);
console.log('\n承認待ち...（このターミナルは開いたまま）');

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, REDIRECT_URI);
    const c = url.searchParams.get('code');
    const err = url.searchParams.get('error');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      `<meta charset="utf-8"><p style="font:16px system-ui;padding:40px">${
        c ? '承認できました。ターミナルに戻ってください。' : `失敗: ${err ?? '不明'}`
      }</p>`,
    );
    server.close();
    c ? resolve(c) : reject(new Error(err ?? 'code が返りませんでした'));
  });
  server.listen(PORT);
  setTimeout(() => { server.close(); reject(new Error('5分待っても承認されませんでした')); }, 300_000);
});

const res = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }),
});
const json = await res.json();
if (!res.ok || !json.refresh_token) {
  console.error('\nトークン取得に失敗:', res.status, JSON.stringify(json).slice(0, 400));
  console.error('refresh_token が無い場合は、Googleアカウントの「サードパーティ アクセス」から');
  console.error('このアプリの許可を一度解除してからやり直すと出ます。');
  process.exit(1);
}

// 取得できたトークンで実際に読めるか確認してから env を出す（設定してから動かない、を防ぐ）
const accRes = await fetch('https://adsense.googleapis.com/v2/accounts', {
  headers: { Authorization: `Bearer ${json.access_token}` },
});
const accounts = await accRes.json();
const accountName = accounts?.accounts?.[0]?.name ?? '';
console.log('\n読み取り確認:', accRes.ok ? `OK（${accountName || 'アカウント名不明'}）` : `NG ${accRes.status}`);

console.log('\n===== Vercel に設定する環境変数（kyounoko-web / Production）=====\n');
console.log(`ADSENSE_OAUTH_CLIENT_ID=${clientId}`);
console.log(`ADSENSE_OAUTH_CLIENT_SECRET=${clientSecret}`);
console.log(`ADSENSE_OAUTH_REFRESH_TOKEN=${json.refresh_token}`);
if (accountName) console.log(`ADSENSE_ACCOUNT_ID=${accountName.replace(/^accounts\//, '')}`);
console.log('\n設定後、/admin/kpi の「AdSense」が LIVE になり収益が自動で入ります。');
console.log(
  '\n【確認】同意画面の公開ステータスが「テスト中」のままだと、このリフレッシュトークンは7日で失効します。' +
    '\n        Google Auth Platform →「対象」→「アプリを公開」で本番環境になっているか見てください。',
);
