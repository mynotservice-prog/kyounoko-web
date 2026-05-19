#!/usr/bin/env bash
# 旅行前クリーンアップ・スクリプト
# 実行方法:
#   bash scripts/_pre-trip-cleanup.sh
#
# やること:
# 1. public/new_hero/ を完全削除（455MB、参照ゼロのunsplash素材）
# 2. public/hero/ を ~/Desktop/kyounoko-hero-legacy-2026-05.zip に退避してから削除（187MB）
# 3. scripts/_archived-*.mjs を削除（既にgitignore済みだが残骸が60KB）
# 4. tmp/ を削除（既にgitignore済み）
# 5. .gitignore に new_hero/ を追加して将来の混入も防ぐ
# 6. legacyHero フロントマターを記事から削除
# 7. git add / commit のドラフトメッセージを表示（push は手動）

set -e

cd "$(dirname "$0")/.." || exit 1

echo "=========================================="
echo "  きょうのこ 旅行前クリーンアップ"
echo "=========================================="
echo ""

# ---------------------------------------------
# 1. public/hero/ を Desktop に退避
# ---------------------------------------------
if [ -d "public/hero" ]; then
  BACKUP="$HOME/Desktop/kyounoko-hero-legacy-$(date +%Y-%m-%d).zip"
  echo "▶ public/hero/ を $BACKUP に退避..."
  cd public && zip -rq "$BACKUP" hero/ && cd ..
  echo "  ✓ ZIP退避完了 ($(du -h "$BACKUP" | cut -f1))"
  rm -rf public/hero
  echo "  ✓ public/hero/ 削除完了"
else
  echo "▶ public/hero/ は既に削除済み（スキップ）"
fi
echo ""

# ---------------------------------------------
# 2. public/new_hero/ を完全削除
# ---------------------------------------------
if [ -d "public/new_hero" ]; then
  echo "▶ public/new_hero/ を完全削除..."
  rm -rf public/new_hero
  echo "  ✓ 完了"
else
  echo "▶ public/new_hero/ は既に削除済み（スキップ）"
fi
echo ""

# ---------------------------------------------
# 3. archived scripts
# ---------------------------------------------
ARCHIVED_COUNT=$(ls scripts/_archived-*.mjs 2>/dev/null | wc -l | tr -d ' ')
if [ "$ARCHIVED_COUNT" -gt "0" ]; then
  echo "▶ scripts/_archived-*.mjs を削除 ($ARCHIVED_COUNT 本)..."
  rm -f scripts/_archived-*.mjs
  echo "  ✓ 完了"
else
  echo "▶ archived scripts は既に削除済み（スキップ）"
fi
echo ""

# ---------------------------------------------
# 4. tmp/
# ---------------------------------------------
if [ -d "tmp" ]; then
  echo "▶ tmp/ を削除..."
  rm -rf tmp
  echo "  ✓ 完了"
else
  echo "▶ tmp/ は既に削除済み（スキップ）"
fi
echo ""

# ---------------------------------------------
# 5. .gitignore に new_hero/ を追加（将来混入防止）
# ---------------------------------------------
if ! grep -q "^public/new_hero/" .gitignore 2>/dev/null; then
  echo "▶ .gitignore に public/new_hero/ を追記..."
  echo "" >> .gitignore
  echo "# 大型unsplash素材（参照ゼロ・2026-05退役）" >> .gitignore
  echo "public/new_hero/" >> .gitignore
  echo "public/hero/" >> .gitignore
  echo "  ✓ 完了"
fi
echo ""

# ---------------------------------------------
# 6. legacyHero を記事フロントマターから削除
# ---------------------------------------------
echo "▶ 記事のlegacyHeroフィールドを除去..."
node - <<'EOF'
const fs = require('fs');
const path = require('path');
const dir = 'content/articles';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
let cnt = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  const orig = fs.readFileSync(fp, 'utf8');
  const next = orig.replace(/^legacyHero:\s*.+\n/gm, '');
  if (next !== orig) {
    fs.writeFileSync(fp, next);
    cnt++;
  }
}
console.log(`  ✓ ${cnt}記事から legacyHero フィールドを除去`);
EOF
echo ""

# ---------------------------------------------
# 7. git status & コミット案
# ---------------------------------------------
echo "=========================================="
echo "  完了！次のステップ:"
echo "=========================================="
echo ""
echo "▶ git status を確認:"
git status --short | head -20
echo ""
echo "▶ コミット推奨コマンド:"
echo "  git add -A"
echo "  git commit -m 'chore: cleanup unused hero assets (~642MB) and archived scripts'"
echo "  git push"
echo ""
echo "▶ サイズ削減:"
du -sh public/ 2>/dev/null | head -1
