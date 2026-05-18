/**
 * IndexNow 手動通知スクリプト。
 *
 * ## 使い方
 *
 * 環境変数を渡して実行:
 *
 *   INDEXNOW_KEY=xxxx npx tsx scripts/notify-indexnow.ts
 *   INDEXNOW_KEY=xxxx npx tsx scripts/notify-indexnow.ts /article/foo /article/bar
 *
 * 引数なしの場合は全記事を IndexNow に通知。
 * 引数あり（パス or 絶対URL）の場合はそれだけを通知する。
 *
 * ## 想定シーン
 * - 新記事公開直後に手動でクロール促進
 * - 大幅リライト直後に手動再通知
 * - GitHub Actions でビルド後に新規スラグだけ通知
 *
 * ## 必要なもの
 * - INDEXNOW_KEY 環境変数（public/{key}.txt と一致）
 *
 * ## 失敗しないこと
 * - 例外が起きてもプロセスは exit code 1 で終わるが、再実行で復旧する設計
 *
 * Note: tsx 等で直接実行できる前提（package.json の script に登録してもよい）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { submitToIndexNow, submitAllArticlesToIndexNow, INDEXNOW_HOST } from '../lib/indexnow';

/**
 * .env.local / .env から KEY=VALUE 形式を簡易ロード。
 * Next.js のように next.config.js を介さなくても env を取れるようにする。
 */
function loadDotenv(): void {
  const candidates = ['.env.local', '.env'];
  for (const f of candidates) {
    const fp = path.resolve(process.cwd(), f);
    if (!fs.existsSync(fp)) continue;
    const txt = fs.readFileSync(fp, 'utf-8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      // 行末コメント除去 (#以降)
      val = val.replace(/\s+#.*$/, '');
      // クォート除去
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function normalizeArg(arg: string): string {
  if (arg.startsWith('http://') || arg.startsWith('https://')) return arg;
  if (!arg.startsWith('/')) return `https://${INDEXNOW_HOST}/${arg}`;
  return `https://${INDEXNOW_HOST}${arg}`;
}

async function main() {
  // .env.local から環境変数を読み込む（インライン INDEXNOW_KEY=... が無くてもOK）
  loadDotenv();

  const args = process.argv.slice(2);

  if (!process.env.INDEXNOW_KEY) {
    console.error('[notify-indexnow] INDEXNOW_KEY is not set.');
    console.error('  -> .env.local に INDEXNOW_KEY=... を書くか、');
    console.error('     INDEXNOW_KEY=xxxx npx tsx scripts/notify-indexnow.ts ... のように渡してください。');
    process.exit(1);
  }

  if (args.length === 0) {
    console.log('[notify-indexnow] submitting all articles ...');
    const r = await submitAllArticlesToIndexNow();
    console.log('[notify-indexnow] result:', r);
    if (!r.ok) process.exit(2);
    return;
  }

  const urls = args.map(normalizeArg);
  console.log('[notify-indexnow] submitting', urls.length, 'urls:');
  for (const u of urls) console.log('  -', u);
  const r = await submitToIndexNow(urls);
  console.log('[notify-indexnow] result:', r);
  if (!r.ok) process.exit(2);
}

main().catch((e) => {
  console.error('[notify-indexnow] error:', e);
  process.exit(1);
});
