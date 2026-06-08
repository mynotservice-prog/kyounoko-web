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
#   1) content/articles/ や content/plans/ の .md だけの編集 → ビルドスキップ
#      （on-demand revalidate で即時反映するので build 不要）
#   2) コード/設定（app, lib, components, public/, next.config 等）に変更があれば必ずビルド
#   3) docs/, README, .gitignore など補助ファイルのみ → スキップ
#
# Build CPU Minutes 削減目的（過去 $12.97/$20 = 65% 消化の主因）。

set -u

echo "[ignore-build] Checking diff between HEAD^ and HEAD..."

# 全ての変更ファイル一覧
ALL_CHANGED=$(git diff --name-only HEAD^ HEAD 2>/dev/null || echo "")

if [ -z "$ALL_CHANGED" ]; then
  echo "[ignore-build] No changed files detected → SKIP BUILD"
  exit 0
fi

# 「コードを伴うパス」（ここに変更があれば必ずビルド）
CODE_PATHS=(
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
  "middleware.ts"
)

# コードに変更があれば必ずビルド
if ! git diff --quiet HEAD^ HEAD -- "${CODE_PATHS[@]}" 2>/dev/null; then
  echo "[ignore-build] Code/config changes detected → PROCEED BUILD"
  git diff --name-only HEAD^ HEAD -- "${CODE_PATHS[@]}" 2>/dev/null | head -10
  exit 1
fi

# content/ の中で「.md ファイル以外」（例: content/spots/*.json）の変更があればビルド
NON_MD_CONTENT=$(git diff --name-only HEAD^ HEAD -- content/ 2>/dev/null | grep -v "\.md$" || true)
if [ -n "$NON_MD_CONTENT" ]; then
  echo "[ignore-build] Non-markdown content changes detected → PROCEED BUILD"
  echo "$NON_MD_CONTENT" | head -10
  exit 1
fi

# content/articles/*.md, content/plans/*.md などの .md だけなら on-demand revalidate に任せて build スキップ
MD_CONTENT_CHANGES=$(git diff --name-only HEAD^ HEAD -- 'content/**/*.md' 2>/dev/null | head -5)
if [ -n "$MD_CONTENT_CHANGES" ]; then
  echo "[ignore-build] Only markdown content changes detected → SKIP BUILD (handled by on-demand revalidate)"
  echo "$MD_CONTENT_CHANGES"
  exit 0
fi

# それ以外（docs/, README.md 等のみ）もスキップ
echo "[ignore-build] No build-relevant changes detected → SKIP BUILD"
exit 0
