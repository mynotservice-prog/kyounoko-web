# きょうのこ Next.js 実装

> **ドメイン取得後、このフォルダを GitHub に push → Vercel 連携で即デプロイ可能な状態**まで仕上がっています。

---

## 実装済み（このフォルダの内容）

### ページ
- ✅ `app/page.tsx` — トップ（全セクション実装済）
- ✅ `app/article/[slug]/page.tsx` — 記事（動的生成 + JSON-LD + OGP）
- ✅ `app/category/[slug]/page.tsx` — カテゴリ（動的生成）
- ✅ `app/about/page.tsx` — 運営者情報
- ✅ `app/contact/page.tsx` — お問い合わせ
- ✅ `app/privacy/page.tsx` — プライバシーポリシー
- ✅ `app/terms/page.tsx` — 利用規約
- ✅ `app/not-found.tsx` — 404
- ✅ `app/sitemap.ts` — サイトマップ自動生成
- ✅ `app/robots.ts` — robots.txt 自動生成

### コンポーネント
- ✅ `components/layout/SiteHeader.tsx`
- ✅ `components/layout/SiteFooter.tsx`
- ✅ `components/layout/MobileStickyNav.tsx`
- ✅ `components/common/Logo.tsx`
- ✅ `components/top/TodayFinder.tsx` — 条件エンジン（Client Component）

### ライブラリ
- ✅ `lib/microcms.ts` — MicroCMS クライアント + 条件フィルタ関数
- ✅ `lib/types.ts` — 全型定義（Article / Category / Tag / Author / Spot）

### アセット
- ✅ `public/img/*.jpg` — AI 生成 10 枚（圧縮済み・合計 2MB）
- ✅ `public/img/*.svg` — ロゴ / ファビコン / OGP

### 設定
- ✅ `package.json` — Next.js 15 + React 19
- ✅ `tsconfig.json` — path alias 設定済
- ✅ `next.config.ts` — セキュリティヘッダ + 画像最適化
- ✅ `tailwind.config.ts` — ブランドカラー palette
- ✅ `postcss.config.mjs`
- ✅ `app/globals.css` — 全デザイントークン + コンポーネントCSS
- ✅ `app/layout.tsx` — フォント4種 + GA4 + Clarity 組込済
- ✅ `.env.example` — 環境変数テンプレート
- ✅ `.gitignore`

---

## デプロイ手順（ドメイン取得後 30分）

### 1. GitHub リポジトリ作成（5分）

```bash
# GitHubで `kyounoko-web` private リポジトリを作成
# その後:
git init
git add .
git commit -m "Initial commit: kyounoko v1.0"
git branch -M main
git remote add origin https://github.com/[あなたのusername]/kyounoko-web.git
git push -u origin main
```

### 2. MicroCMS セットアップ（15分）

1. [MicroCMS](https://microcms.io) で無料アカウント作成
2. サービス名を `kyounoko` で作成（またはご希望の名前）
3. `microcms-schema.md`（outputs/ フォルダ内）に沿って以下の API を作成：
   - `categories`（リスト）
   - `tags`（リスト）
   - `authors`（リスト）
   - `articles`（リスト）
   - `spots`（リスト・将来用）
   - `site`（オブジェクト形式）
4. API キーを取得（読み取り用）
5. カテゴリを 7 件登録（下記の「初期データ」参照）
6. 著者を 1 件登録（ながみー）
7. サンプル記事 3 本を投入（T01 / T02 / G02 のマークダウンから）

### 3. Vercel 接続（10分）

1. [Vercel](https://vercel.com) に GitHub でサインイン
2. Import → `kyounoko-web` リポジトリを選択
3. 環境変数を設定（Settings → Environment Variables）：
   ```
   MICROCMS_SERVICE_DOMAIN = kyounoko
   MICROCMS_API_KEY = [取得したキー]
   NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX （後で取得してもOK）
   NEXT_PUBLIC_CLARITY_ID = （後で取得してもOK）
   NEXT_PUBLIC_SITE_URL = https://kyounoko.jp
   ```
4. Deploy ボタン → 自動ビルド

### 4. カスタムドメイン（5分）

1. Vercel のプロジェクト → Settings → Domains
2. `kyounoko.jp` を追加
3. 表示される DNS レコード（`A` または `CNAME`）を お名前.com で設定
4. 5〜60 分待って SSL 証明書が自動発行される
5. `https://kyounoko.jp` にアクセスして確認

---

## 初期データ（MicroCMSで登録）

### categories

```json
[
  { "name": "今日どこ行く？", "slug": "today-doko", "order": 1, "description": "雨の日・猛暑日・ベビーカー前提・ワンオペでも。0〜6歳の子と安心して過ごせる場所を条件で絞り込みます。" },
  { "name": "今日何する？", "slug": "today-nani", "order": 2, "description": "家で過ごす日の家遊び・工作・絵本。10分単位で、家にあるもので。" },
  { "name": "今日何食べる？", "slug": "today-taberu", "order": 3, "description": "保育園帰りの15分ごはんから、冷凍で回すコツまで。毎日のごはんを軽く。" },
  { "name": "今日どう回す？", "slug": "today-mawasu", "order": 4, "description": "夕方〜寝るまでの段取り。平日夜を乗り切る最小限のルーティン。" },
  { "name": "季節と行事", "slug": "gyouji", "order": 5, "description": "入園・運動会・七五三・ハロウィン。季節ごとの準備と過ごし方。" },
  { "name": "習い事と学び", "slug": "narai", "order": 6, "description": "幼児の習い事と知育。何歳から・どう選ぶか。" },
  { "name": "役立つもの", "slug": "yakudatsu", "order": 7, "description": "宅食・ミールキット・時短家電・ベビー用品。毎日を楽にする道具。" }
]
```

### authors（1件）

```json
{
  "name": "ながみー",
  "slug": "nagami",
  "bio": "共働き家庭で子育て中の運営者。このサイトは、同じ立場の親が「今日どうする？」を決めやすくするためにつくっています。",
  "credentials": "Verified in my own home"
}
```

---

## 動作確認コマンド

```bash
# ローカル開発
npm run dev
# → http://localhost:3000

# 本番ビルド確認
npm run build
npm run start

# 型チェック
npx tsc --noEmit

# Lint
npm run lint
```

---

## ディレクトリ構成（実装済）

```
kyounoko-web/
├── app/
│   ├── layout.tsx              ✅ フォント・メタデータ・GA4
│   ├── page.tsx                ✅ トップ（全セクション）
│   ├── globals.css             ✅ デザイントークン + 全CSS
│   ├── sitemap.ts              ✅
│   ├── robots.ts               ✅
│   ├── not-found.tsx           ✅ 404
│   ├── about/page.tsx          ✅
│   ├── contact/page.tsx        ✅
│   ├── privacy/page.tsx        ✅
│   ├── terms/page.tsx          ✅
│   ├── article/[slug]/page.tsx ✅ 動的生成
│   └── category/[slug]/page.tsx ✅ 動的生成
├── components/
│   ├── common/Logo.tsx         ✅
│   ├── layout/
│   │   ├── SiteHeader.tsx      ✅
│   │   ├── SiteFooter.tsx      ✅
│   │   └── MobileStickyNav.tsx ✅
│   └── top/
│       └── TodayFinder.tsx     ✅ 条件エンジン
├── lib/
│   ├── microcms.ts             ✅
│   └── types.ts                ✅
├── public/
│   └── img/                    ✅ 20+ ファイル
├── package.json                ✅
├── tsconfig.json               ✅
├── next.config.ts              ✅
├── tailwind.config.ts          ✅
├── postcss.config.mjs          ✅
├── .env.example                ✅
├── .gitignore                  ✅
└── README.md                   ✅ （これ）
```

---

## 後日の追加実装候補（Phase 2）

公開後、アクセス状況を見ながら追加していくもの：

- `app/today/page.tsx` — 条件絞り込み結果ページ（URLパラメータから記事フィルタ）
- `app/age/[range]/page.tsx` — 年齢別ハブ（0-1 / 2-3 / 4-6）
- `app/area/[pref]/[city]/page.tsx` — エリア別ハブ
- `app/issue/[slug]/page.tsx` — 悩み別ハブ
- `app/items/page.tsx` — 役立つもの（アフィリエイト主力）
- `app/tag/[slug]/page.tsx` — タグ別記事一覧
- フィードバック機能（記事下に「この記事は役に立った？」）
- お気に入り機能（会員登録後）

---

## 公開直前チェックリスト

詳細は [launch-checklist.md](../launch-checklist.md) 参照。必ず実行：

- [ ] Search Console にサイトマップ送信（`/sitemap.xml`）
- [ ] GA4 トラッキング確認（Real-time でアクセス検知）
- [ ] OGP 画像表示確認（[Facebook Debugger](https://developers.facebook.com/tools/debug/)）
- [ ] モバイル表示確認（375px / 390px / 412px）
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) でモバイル 90+ 確認
- [ ] リッチリザルトテスト（JSON-LD 有効化確認）

---

## トラブルシューティング

### MicroCMS 接続エラー

`.env.local` が正しく設定されているか、Vercel の環境変数が合っているか確認。

### ビルド失敗

`npm install` 済みか、Node.js 20+ か確認。

### 画像が表示されない

`public/img/` に .jpg ファイルがあるか確認。`next.config.ts` の `images.remotePatterns` に MicroCMS ドメインが入っているか確認。

### フォントが遅い

`next/font/google` は初回ビルド時に時間がかかる。本番では preload されるので問題なし。

---

## よくある質問

### Q. MicroCMS 以外も使える？

contentful / sanity / notion 等でも同等のことは可能。`lib/microcms.ts` 相当を書き換えて型を合わせれば切り替え可能。

### Q. 記事の書き方は？

[writer-guideline.md](../writer-guideline.md) と サンプル記事 [T01](../article-sample-T01.md) / [T02](../article-sample-T02.md) / [G02](../article-sample-G02.md) を参照。

### Q. 費用は？

| サービス | 月額 |
| --- | --- |
| Vercel Hobby | 無料 |
| MicroCMS Hobby | 無料（記事 10,000 件まで） |
| ドメイン（お名前.com） | ¥250/月（年一括 ¥3,000） |
| GA4 / Clarity | 無料 |
| **合計** | **月 ¥250** |

複数ライターを雇ったら MicroCMS を Team プランへ（¥4,400/月）。

---

## 一行で戻る

> 動くものをまず出す → 測る → 直す のサイクルを回す。
