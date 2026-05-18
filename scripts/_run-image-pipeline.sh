#!/bin/bash
# ============================================================
# 新規記事の hero画像 一括生成パイプライン
#
# 使い方:
#   1. Cloudflare認証情報を環境変数で設定(初回のみ)
#      export CLOUDFLARE_ACCOUNT_ID=xxxxxx
#      export CLOUDFLARE_API_TOKEN=xxxxxx
#
#   2. このスクリプトを実行
#      bash scripts/_run-image-pipeline.sh
#
# 動作:
#   - tmp/image-prompts.json から未生成の記事を検出
#   - Cloudflare Workers AI (flux-1-schnell) で画像生成
#   - WebP変換
#   - 各記事の frontmatter `hero:` に反映
#   - git add → commit → push まで自動
# ============================================================

set -e

# 認証チェック
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Cloudflare認証情報が未設定です"
  echo ""
  echo "下記を実行してから再実行してください:"
  echo "  export CLOUDFLARE_ACCOUNT_ID=xxxxxx"
  echo "  export CLOUDFLARE_API_TOKEN=xxxxxx"
  echo ""
  echo "認証情報の取得手順:"
  echo "  1. https://dash.cloudflare.com/ にログイン"
  echo "  2. 右下の Account ID をコピー"
  echo "  3. https://dash.cloudflare.com/profile/api-tokens で API Token 発行"
  echo "     Permissions: Account → Workers AI → Read"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "============================================"
echo "▶ きょうのこ hero画像 生成パイプライン"
echo "============================================"
echo ""

echo "▶ Step 1/5: プロンプト最新化"
node scripts/dry-run-prompts.mjs > /tmp/dry-run.log 2>&1
echo "  ✓ tmp/image-prompts.json 更新済"
echo ""

echo "▶ Step 2/5: Cloudflare Workers AI で画像生成"
echo "  (新規分のみ生成、既存は --force を付けない限りスキップ)"
node scripts/generate-hero-images-cloudflare.mjs
echo ""

echo "▶ Step 3/5: WebP 変換"
node scripts/convert-hero-ai-to-webp.mjs
echo ""

echo "▶ Step 4/5: frontmatter に hero: を反映"
node scripts/apply-hero-ai.mjs
echo ""

echo "▶ Step 5/5: ビルド確認"
npx tsc --noEmit
echo "  ✓ TypeScript エラーなし"
echo ""

echo "▶ git コミット&プッシュ"
if git diff --quiet && git diff --staged --quiet; then
  echo "  ⚠ 変更なし、コミットはスキップ"
else
  git add public/hero-ai/ content/articles/
  git commit -m "feat(images): 新規記事の hero画像を生成 + frontmatter反映

Cloudflare Workers AI (flux-1-schnell) でバッチ生成。
WebP変換+frontmatter反映+ビルド確認まで自動実行。"
  git push origin main
  echo "  ✓ プッシュ完了"
fi

echo ""
echo "============================================"
echo "✓ パイプライン完了"
echo "============================================"
echo ""
echo "次のステップ(任意):"
echo "  - IndexNow送信:"
echo "      npx tsx scripts/notify-indexnow.ts"
echo "  - Vercel自動デプロイの確認"
