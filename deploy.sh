#!/bin/bash
# ワンコマンドデプロイスクリプト
# 使い方: ./deploy.sh "コミットメッセージ"
#        ./deploy.sh                     # デフォルトメッセージ

set -e

cd "$(dirname "$0")"

MSG="${1:-chore: update}"

# ロックファイルを自動削除
rm -f .git/*.lock .git/refs/heads/*.lock 2>/dev/null || true

# 変更の有無を確認
if git diff-index --quiet HEAD -- && [ -z "$(git status --porcelain)" ]; then
  echo "✓ 変更なし（working tree clean）"
  exit 0
fi

# ステージ・コミット・push
echo "▶ git add -A"
git add -A

echo "▶ git commit -m \"$MSG\""
git commit -m "$MSG"

echo "▶ git push"
git push

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ デプロイコマンド完了"
echo ""
echo "  Vercel自動ビルドが開始されました。"
echo "  https://vercel.com/kyounoko-7751s-projects/kyounoko-web/deployments"
echo ""
echo "  公開サイト: https://kyounoko.jp"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
