#!/usr/bin/env bash
# Vercel env を一括セット（Search Console + GA4 用）
#
# 使い方:
#   1. JSONファイルを ~/Downloads/kyounoko-website-f827edf2a407.json に配置（既にあるはず）
#   2. このスクリプトを実行: bash scripts/setup-vercel-env.sh
#   3. 初回のみ vercel login と vercel link を求められる
#
# セットされるenv:
#   - GOOGLE_APPLICATION_CREDENTIALS_JSON (JSONの中身)
#   - SEARCH_CONSOLE_SITE_URL=sc-domain:kyounoko.jp
#   - GA4_PROPERTY_ID=（任意・スクリプト末尾を編集）

set -e

JSON_FILE="${HOME}/Downloads/kyounoko-website-f827edf2a407.json"

if [ ! -f "$JSON_FILE" ]; then
  echo "❌ JSONファイルが見つかりません: $JSON_FILE"
  echo "   ダウンロード先パスを変えた場合は JSON_FILE 変数を編集してください"
  exit 1
fi

# Vercel CLI 確認
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLIがないので npx 経由で実行します（初回は数十秒）..."
  VERCEL="npx vercel"
else
  VERCEL="vercel"
fi

# プロジェクトリンク確認
if [ ! -f .vercel/project.json ]; then
  echo "Vercelプロジェクトをリンクします..."
  $VERCEL link
fi

echo ""
echo "=== Vercel env セットアップ ==="

# 1. Service Account JSON
echo ""
echo "[1/3] GOOGLE_APPLICATION_CREDENTIALS_JSON を設定中..."
# 既存削除（エラー無視）
$VERCEL env rm GOOGLE_APPLICATION_CREDENTIALS_JSON production --yes 2>/dev/null || true
$VERCEL env rm GOOGLE_APPLICATION_CREDENTIALS_JSON preview --yes 2>/dev/null || true
$VERCEL env rm GOOGLE_APPLICATION_CREDENTIALS_JSON development --yes 2>/dev/null || true
# 一行化したJSONを各環境にセット
JSON_ONELINE=$(cat "$JSON_FILE" | tr -d '\n')
echo -n "$JSON_ONELINE" | $VERCEL env add GOOGLE_APPLICATION_CREDENTIALS_JSON production
echo -n "$JSON_ONELINE" | $VERCEL env add GOOGLE_APPLICATION_CREDENTIALS_JSON preview
echo -n "$JSON_ONELINE" | $VERCEL env add GOOGLE_APPLICATION_CREDENTIALS_JSON development

# 2. Search Console site URL
echo ""
echo "[2/3] SEARCH_CONSOLE_SITE_URL を設定中..."
$VERCEL env rm SEARCH_CONSOLE_SITE_URL production --yes 2>/dev/null || true
$VERCEL env rm SEARCH_CONSOLE_SITE_URL preview --yes 2>/dev/null || true
$VERCEL env rm SEARCH_CONSOLE_SITE_URL development --yes 2>/dev/null || true
echo -n "sc-domain:kyounoko.jp" | $VERCEL env add SEARCH_CONSOLE_SITE_URL production
echo -n "sc-domain:kyounoko.jp" | $VERCEL env add SEARCH_CONSOLE_SITE_URL preview
echo -n "sc-domain:kyounoko.jp" | $VERCEL env add SEARCH_CONSOLE_SITE_URL development

# 3. GA4_PROPERTY_ID (任意 - 必要ならコメント外して値をセット)
# echo ""
# echo "[3/3] GA4_PROPERTY_ID を設定中..."
# $VERCEL env rm GA4_PROPERTY_ID production --yes 2>/dev/null || true
# echo -n "YOUR_GA4_PROPERTY_ID" | $VERCEL env add GA4_PROPERTY_ID production
echo "[3/3] GA4_PROPERTY_ID はスキップ（必要ならスクリプト編集）"

echo ""
echo "=== 完了 ==="
echo ""
echo "次のステップ: 再デプロイで反映"
echo "  $ $VERCEL --prod"
echo ""
echo "完了後 https://kyounoko.jp/admin/seo を開けばデータ表示されます。"
