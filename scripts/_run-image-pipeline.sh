#!/bin/bash
# ============================================================
# 新規記事の hero画像 一括生成パイプライン
#
# 使い方(初回):
#   1. /Users/nagaminehideki/Developer/kyounoko-web/.env.local に下記を追記
#         CLOUDFLARE_ACCOUNT_ID=f9e83dcbdc0fcdacf9bc56288cac5429
#         CLOUDFLARE_API_TOKEN=<発行したトークン>
#      (.env.local は .gitignore で git 対象外)
#
#   2. このスクリプトを実行
#      bash scripts/_run-image-pipeline.sh
#
# 使い方(2回目以降):
#   - .env.local がそのまま使われるので、コマンド1発:
#       bash scripts/_run-image-pipeline.sh
#
# 動作:
#   - .env.local の認証情報を自動読込
#   - tmp/image-prompts.json から未生成の記事を検出
#   - Cloudflare Workers AI (flux-1-schnell) で画像生成
#   - WebP変換
#   - 各記事の frontmatter `hero:` に反映
#   - git add → commit → push まで自動
# ============================================================

set -e

cd "$(dirname "$0")/.."

# git の一時ロックファイルが前回中断で残っていた場合、安全に掃除
# (.git/{index,HEAD,refs/heads/*}.lock は git 進行中だけ作られる一時ファイルで、
#  通常は処理終了時に自動で消える。残骸はデータではないので消して安全。)
for lock in .git/index.lock .git/HEAD.lock; do
  if [ -f "$lock" ]; then
    # 5分以上前のロックは確実に残骸(短いものは別プロセス動作中の可能性ありで触らない)
    if [ -n "$(find "$lock" -mmin +5 2>/dev/null)" ]; then
      echo "⚠ 古い $lock を検出、削除して続行"
      rm -f "$lock"
    fi
  fi
done
# refs 配下も(ブランチごとに別ファイル)
find .git/refs -name "*.lock" -mmin +5 -delete 2>/dev/null || true

# .env.local があれば自動読込
# CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN をここに書いておけば、
# 毎回 export する必要なし。
# .env.local は .gitignore で git 対象外。
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

# 認証チェック
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Cloudflare認証情報が未設定です"
  echo ""
  echo "プロジェクトルートの .env.local に下記を追記してください:"
  echo "  CLOUDFLARE_ACCOUNT_ID=f9e83dcbdc0fcdacf9bc56288cac5429"
  echo "  CLOUDFLARE_API_TOKEN=<発行したトークン>"
  echo ""
  echo "API Token の発行:"
  echo "  https://dash.cloudflare.com/profile/api-tokens"
  echo "    Create Custom Token → Permissions: Account → Workers AI → Read"
  echo ""
  echo "次回からは .env.local が自動読込されるので、このスクリプトを叩くだけでOK"
  exit 1
fi

# Account IDが '<...>' や 'xxxxxx' のままになっていないかチェック(よくあるコピペミス)
case "$CLOUDFLARE_ACCOUNT_ID" in
  *xxxxxx*|*\<*\>*)
    echo "❌ CLOUDFLARE_ACCOUNT_ID がサンプル値のままです: $CLOUDFLARE_ACCOUNT_ID"
    echo "   .env.local を編集して実IDに置換してください"
    exit 1
    ;;
esac

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
# sharp のネイティブモジュールが現在のOS用に入っているかチェック
# 入ってなければ Apple Silicon / Intel 用バイナリを自動再インストール
if ! node -e "require('sharp')" 2>/dev/null; then
  echo "  ⚠ sharp のネイティブモジュールが見つからないため再インストール中..."
  npm install --include=optional sharp >/dev/null 2>&1 || npm rebuild sharp >/dev/null 2>&1
  echo "  ✓ sharp 再インストール完了"
fi
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
