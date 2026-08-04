#!/usr/bin/env bash
# 記事 md 編集を本番反映する正しい手順（force ビルド → Cloudflare パージ）。
#
# なぜ必要か:
#   - content/articles/*.md はビルド時バンドル。ignoreCommand(scripts/vercel-ignore-build.sh)
#     が「md 編集だけ＝ビルドスキップ」にしているため、通常の git push では本番に出ない。
#   - on-demand revalidate は外部CMS前提で、バンドル済みファイル md には効かない。
#   - さらに Cloudflare が記事HTMLを TTL 3600s でエッジキャッシュしている。
#   → フルビルドを強制（--force）し、デプロイ後に該当URLを CF パージする。
#
# 使い方:
#   ./scripts/deploy-md.sh                       # 直近コミット(HEAD^..HEAD)の変更md を自動パージ
#   ./scripts/deploy-md.sh origin/main..HEAD     # レンジ指定で変更md を算出
#   ./scripts/deploy-md.sh /article/foo bar      # パージ対象を明示（slug/パス/URL混在可）
#
# 前提:
#   - vercel CLI でログイン済み & プロジェクト link 済み
#   - CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID が環境にある（.env.local を読むなら各自 source）

set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ force ビルド: vercel --prod --force --archive=tgz"
echo "  （ignore-build を回避してファイルベース md をフルビルドします）"
# --archive=tgz は必須。リポジトリのファイル数が Vercel CLI のアップロード上限
# （15,000件）を超えており（2026-08 時点で 28,327 件）、付けないと
# "Invalid request: `files` should NOT have more than 15000 items" で即死する。
vercel --prod --force --archive=tgz

echo ""
echo "▶ Cloudflare エッジキャッシュをパージ"
if [ "$#" -gt 0 ] && [[ "$1" == *..* ]]; then
  # 第1引数が a..b 形式ならレンジとして渡す
  node scripts/cf-purge.mjs --range "$1"
elif [ "$#" -gt 0 ]; then
  # それ以外は明示的な slug/パス/URL リスト
  node scripts/cf-purge.mjs "$@"
else
  # 引数なし → 直近コミットの変更 md を自動算出
  node scripts/cf-purge.mjs --auto
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ md 反映 + CF パージ完了"
echo "  確認: curl -sI https://kyounoko.jp/article/<slug> | grep -i cf-cache-status"
echo "        → MISS / EXPIRED になり、本文が新しくなっていれば成功"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
