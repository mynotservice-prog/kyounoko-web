#!/usr/bin/env bash
# Vercel Ignored Build Step
#
# このスクリプトを vercel.json の ignoreCommand に指定。
# - exit 0 → ビルドを SKIP
# - exit 1 → ビルドを実行
#
# Vercel 公式: https://vercel.com/docs/projects/overview#ignored-build-step
#
# 戦略:
#   ビルド成果物（公開サイト）に影響する可能性のあるパス
#   (content/, lib/, app/, components/, public/, next.config.*, package*.json, tsconfig.json)
#   に変更があった場合のみビルドする。
#   それ以外（docs/, scripts/ の補助スクリプト, README, .gitignore など）のみの
#   変更ならビルドをスキップして Build CPU Minutes を節約する。
#
# Build CPU Minutes 削減目的（前サイクル $12.97 / $20 = 65%消化の主因）。

set -u  # 未定義変数は禁止（あえて set -e は使わない／exit code 制御のため）

echo "[ignore-build] Checking diff between HEAD^ and HEAD..."

# 比較対象のパス（公開サイトに影響するもの）
PATHS=(
  "content"
  "lib"
  "app"
  "components"
  "public"
  "scripts/build-hero-manifest.mjs"
  "scripts/check-affiliate-links.mjs"
  "scripts/check-kid-reports.mjs"
  "next.config.ts"
  "next.config.js"
  "next.config.mjs"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "vercel.json"
)

# git diff --quiet:
#   - 差分なし → exit 0
#   - 差分あり → exit 1
# 上記パスに何か変更があれば exit 1 を返してビルドさせる
if git diff --quiet HEAD^ HEAD -- "${PATHS[@]}" 2>/dev/null; then
  echo "[ignore-build] No relevant changes detected → SKIP BUILD"
  echo "[ignore-build] (docs/, README.md, .github/ などのみの変更とみなされました)"
  exit 0
else
  echo "[ignore-build] Relevant changes detected → PROCEED BUILD"
  # デバッグ用：実際に何が変わったか出力
  git diff --name-only HEAD^ HEAD -- "${PATHS[@]}" 2>/dev/null | head -10
  exit 1
fi
