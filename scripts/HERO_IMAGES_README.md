# Hero画像 AI生成パイプライン

全記事のヒーロー画像をDALL-E 3で「温かみあるイラスト風」に統一するためのスクリプト群。

## 全体フロー

```
1. ドライラン（プロンプト確認）
   ↓
2. 本番生成（OpenAI APIコール）
   ↓
3. frontmatter更新（hero: を新画像に切り替え）
   ↓
4. git commit & push（Vercel自動デプロイ）
```

## 1. 事前準備

### OpenAI APIキーの取得

ChatGPT Plusだけでは不可。**OpenAI Platform** で別途APIキーが必要です。

1. https://platform.openai.com/api-keys にアクセス
2. 「Create new secret key」でキー発行
3. https://platform.openai.com/account/billing で **少なくとも$30程度をクレジット入金**（HD画質で約$26、+余裕）

### 環境変数の設定

```bash
export OPENAI_API_KEY=sk-proj-xxxx
```

`.env.local`に書く場合:
```
OPENAI_API_KEY=sk-proj-xxxx
```

## 2. ドライラン（無料）

プロンプトをすべて確認できます。APIは叩きません。

```bash
# 全記事のプロンプト確認
node scripts/dry-run-prompts.mjs

# 5本だけプレビュー
node scripts/dry-run-prompts.mjs --limit 5

# 特定記事のプロンプトだけ見る
node scripts/dry-run-prompts.mjs --slug=babycar-ranking-2026

# HD画質想定でコスト計算
node scripts/dry-run-prompts.mjs --quality=hd
```

実行後、`tmp/image-prompts.json` に全プロンプトが保存されます。

## 3. 本番生成

⚠️ **コスト発生**します。実行前に必ずドライラン+コスト確認。

```bash
# まず1本だけテスト
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --slug=babycar-ranking-2026

# 結果を確認: public/hero-ai/babycar-ranking-2026.png

# 良ければ全件
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs

# HD画質で
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --quality=hd

# 並列数を上げる（DALL-E 3のレート制限注意）
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --concurrency=3

# 既存も強制再生成
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --force
```

### コスト目安（DALL-E 3 / 1792x1024）

| 画質 | 1枚あたり | 320本フル |
|---|---|---|
| standard | $0.04 | **$12.80（約¥2,000）** |
| hd | $0.08 | **$25.60（約¥4,100）** |

### 中断・再開について

`generate-hero-images.mjs` は **1件ずつ manifest を保存** し、デフォルトで **既存ファイルがある記事はスキップ** します。途中で止まっても再実行すれば続きから走ります。

```bash
# 1回目で半分だけ生成
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs --limit=160

# 2回目で残り（既存スキップで自動的に160本目以降）
OPENAI_API_KEY=sk-... node scripts/generate-hero-images.mjs
```

## 4. frontmatterに反映

生成された画像を記事の `hero:` フィールドに反映します。

```bash
# まず変更プレビュー（実ファイル変更なし）
node scripts/apply-hero-ai.mjs --dry-run

# 適用
node scripts/apply-hero-ai.mjs

# 1本だけ反映
node scripts/apply-hero-ai.mjs --slug=babycar-ranking-2026
```

元の `hero:` は `legacyHero:` に退避されるので、戻したい時は手動で書き戻し可能。

## 5. デプロイ

```bash
git add public/hero-ai/ content/articles/
git commit -m "feat(images): 全記事ヒーロー画像をDALL-E 3生成イラストに差し替え"
git push origin main
```

Vercelが自動でビルドして本番反映。

## トラブルシューティング

### `Rate limit exceeded`
- DALL-E 3 のtier 1だと 5 req/min。`--concurrency=1` に下げる
- 数分待って再実行（resume で続きから走る）

### `Insufficient quota`
- OpenAI billingに残高不足。https://platform.openai.com/account/billing で入金

### `Content policy violation`
- プロンプトが性的/暴力/政治判定された。`lib/image-prompts.ts` のキーワード抽出ロジックを調整

### 生成された画像が記事内容と合わない
- `lib/image-prompts.ts` の `extractTopic()` にキーワード追加
- 個別記事だけ再生成: `--slug=xxx --force`

## 比較UI

`/admin/image-gen` で記事ごとに「現在のhero」と「生成画像」を並べて見比べできます。

## 関連ファイル

- `lib/image-prompts.ts` — プロンプトビルダー（TS版、Next.jsから利用）
- `scripts/dry-run-prompts.mjs` — ドライラン（無料）
- `scripts/generate-hero-images.mjs` — DALL-E 3バッチ生成
- `scripts/apply-hero-ai.mjs` — frontmatter更新
- `tmp/image-prompts.json` — 中間データ
- `public/hero-ai/manifest.json` — 生成記録
- `public/hero-ai/<slug>.png` — 生成画像
