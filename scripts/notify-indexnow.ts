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

import { submitToIndexNow, submitAllArticlesToIndexNow, INDEXNOW_HOST } from '../lib/indexnow';

function normalizeArg(arg: string): string {
  if (arg.startsWith('http://') || arg.startsWith('https://')) return arg;
  if (!arg.startsWith('/')) return `https://${INDEXNOW_HOST}/${arg}`;
  return `https://${INDEXNOW_HOST}${arg}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.INDEXNOW_KEY) {
    console.error('[notify-indexnow] INDEXNOW_KEY is not set. abort.');
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
