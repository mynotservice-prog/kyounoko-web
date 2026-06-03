# きょうのこ サイトリニューアル デザイン引き継ぎ資料

> **目的**: Claude（または他デザインツール）に新デザインを依頼するときに、既存サイトの構造とデータを壊さないようにするための情報パッケージ。
>
> **読み方**: 「デザイン提案」を作るときは「II. 新デザイン要件」を最重視。「絶対に消してはいけないもの」も読むこと。

---

## I. サイト概要

- **サイト名**: きょうのこ
- **URL**: https://kyounoko.jp
- **コンセプト**: 0〜6歳の子育て家庭向け。「今日どうする？」を3分で決める意思決定サイト
- **対象ユーザー**: 0〜6歳の子どもを持つ保護者（スマホ閲覧が最優先）
- **運営者**: ながみー（個人運営）
- **ビジネスモデル**: AdSense 広告 + アフィリエイト（Amazon / もしも / Yahoo!ショッピング等）
- **SEO 流入を主軸**: 既存 URL は絶対に変えない。Google ／ Bing への IndexNow 通知済み

---

## II. 新デザイン要件（Notion 仕samme より）

参考: https://www.notion.so/374dbef53622804caf0efa46ce2a8642

### デザイン方針
- るるぶKIDS、EPARKおでかけ、いこーよを参考にした、親しみやすく信頼感のある子育て向けメディア
- スマホファースト（PC はスマホ版を基準に最適化）
- メインカラー: **オレンジ**
- 余白を十分に確保
- カードデザイン基本、角丸 16〜20px
- カード画像は **16:9 で統一**
- プレースホルダー画像は禁止、実写真を使用
- アイコン・装飾は最小限、情報量より見やすさ優先

### 新デザインで対象になる 9 ページ
1. **TOP** (`/`) — ヒーロー＋3条件絞り込み＋人気スポット／ランチ／イベント／特集の横スクロール＋エリアから探す
2. **検索結果** (`/search`) — フィルター（年齢/エリア/天気/カテゴリ）、並び替え、Empty State
3. **外食まとめ** (`/feature/<slug>` 内の外食まとめ系) — タグ絞り込み、店舗カード＋アコーディオン（営業時間／GoogleMap／公式／食べログ）、保存・シェア
4. **保存一覧** (`/favorites`) — タブ切替（スポット／外食／特集）
5. **特集一覧** (`/feature`) — 人気／ランキング／年齢別／天気別／目的別／料金別／エリア別
6. **特集記事** (`/feature/<slug>`) — ヒーロー＋スポット一覧＋こんな人におすすめ＋FAQ＋関連
7. **エリア一覧** (`/area` 新規予定) — 7都県カード、駅名・エリア名検索
8. **東京都ページ** (`/area/tokyo` 新規予定) — 23区＋多摩エリアのリスト表示
9. **エリア詳細** (`/area/<slug>` 新規予定) — カテゴリタブ切替、人気スポット・ランチ・イベント

> **モック実装済み**: `/v2` 配下に既にダミーデータで全 9 ページが動くので、デザイナーは挙動の参考にできます。`npm run dev` → http://localhost:3000/v2

---

## III. 現状の技術スタック（変えない）

| レイヤー | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js | 15 (App Router) |
| UI | React | 19 |
| 言語 | TypeScript | 5.6 |
| スタイル | Tailwind CSS | 3.4 |
| CMS | microCMS | 記事の本番格納先 |
| 静的コンテンツ | Markdown (gray-matter + remark) | 1,500+ ファイル |
| ホスティング | Vercel | — |
| 分析 | Google Analytics 4 | 自前イベント定義あり |
| SEO | sitemap / RSS / Atom / IndexNow | 自動生成 |

新デザインは **既存の Next.js + Tailwind 構成に乗せる前提**。React 別ライブラリ（Material UI 等）の導入は基本不可。

---

## IV. 既存サイトのページ構造（67 ルート）

### 公開ページ（壊してはいけない URL）

| URL | 役割 | 動的 | 件数 |
|---|---|---|---|
| `/` | TOP | — | 1 |
| `/article/[slug]` | 記事詳細 | ✅ | ~1,000 |
| `/category/[slug]` | カテゴリ一覧（today-doko 等） | ✅ | 10 |
| `/tag/[slug]` | タグページ（年齢/シーン/テーマ） | ✅ | ~50 |
| `/spot/[slug]` | スポット詳細 | ✅ | 445 |
| `/spots` | スポット一覧 | — | 1 |
| `/feature` | 特集一覧 | — | 1 |
| `/feature/[slug]` | 特集記事 | ✅ | 6（拡張予定） |
| `/station/[slug]` | 駅ページ | ✅ | ~570 |
| `/station/[slug]/[condition]` | 駅×条件ページ | ✅ | 多数 |
| `/station/line/[slug]` | 路線ページ | ✅ | 多数 |
| `/station/line` | 路線一覧 | — | 1 |
| `/station` | 駅一覧 | — | 1 |
| `/today` | 今日決める | — | 1 |
| `/search` | サイト内検索 | — | 1 |
| `/favorites` | お気に入り | — | 1 |
| `/plan/[id]` | プラン詳細 | ✅ | 531 |
| `/items` | 商品比較 | — | 1 |
| `/recipes` | レシピ | — | 1 |
| `/kid-reports` | 運営者訪問レポート集 | — | 1 |
| `/tools/babycar-shindan` | ベビーカー診断 | — | 1 |
| `/tools/naraigoto-match` | 習い事マッチ | — | 1 |
| `/tools/odekake-type` | おでかけタイプ診断 | — | 1 |
| `/tools` | ツール一覧 | — | 1 |
| `/downloads/*` | PDF ダウンロード | — | 5 |
| `/data` `/data/restaurants` `/data/wards` | データ参照ページ | — | 3 |
| `/about` `/contact` `/privacy` `/terms` `/editorial-policy` | 固定ページ | — | 5 |
| `/authors/nagamy` `/supervisors` | 執筆者・監修者 | — | 2 |
| `/v2/*` | **新デザインモック（本稿の対象）** | — | 9 |

### API・フィード
- `/api/admin/edit-content` — 管理用編集 API
- `/api/admin/regenerate-hero` — ヒーロー画像再生成
- `/api/indexnow/submit` — IndexNow 通知
- `/api/weather` — 天気取得
- `/feed.xml` `/atom.xml` `/llms.txt` `/ads.txt` `/robots.txt` `/sitemap.xml`

### 管理画面（非公開、`/admin/*`）
記事 CRUD、画像生成、SEO 分析、AB テスト、プラン編集など。デザインリニューアルの **対象外**。

---

## V. データ構造（壊さないこと）

### 1. 記事（microCMS + 静的 Markdown）

#### microCMS 側スキーマ（`lib/types.ts`）
```ts
type Article = {
  slug: string;              // URL 用、絶対に変えない
  title: string;
  lede: string;              // 導入文
  conclusion: string;
  body: string;              // 本文 HTML/MD
  hero: MicroCMSImage;       // アイキャッチ
  category: Category;
  tags?: Tag[];
  author: Author;
  supervisor?: Author;       // 専門家監修
  quickInfo_ageRanges?: AgeRange[];   // ['0-1','2-3','4-6']
  quickInfo_place?: PlaceType[];      // ['home','indoor','outdoor']
  quickInfo_weather?: Weather[];      // ['rain','heat','cold','sunny']
  quickInfo_durationMin?: number;
  quickInfo_budget?: Budget;          // 'free'|'low'|'mid'|'high'
  faq?: FaqItem[];
  affiliateItems?: AffiliateItem[];
  spots?: Spot[];
  publishedAt: string;
  metaDescription: string;
};
```

#### 静的記事（`content/articles/*.md`）
- **1,035 ファイル**。frontmatter（YAML）+ Markdown 本文
- `slug` フィールドが URL になる → **絶対に変更不可**
- 例:
  ```yaml
  ---
  slug: 0-1sai-ie-asobi-10pun
  title: 0〜1歳と家でできる10分遊び8パターン
  metaDescription: ...
  category: today-nani
  hero: /hero-ai/0-1sai-ie-asobi-10pun.jpg
  quickInfo:
    ageRanges: ['0-1']
    place: ['home']
  ---
  ```

### 2. プラン（`content/plans/*.md`）
- **531 ファイル**。「今日これをする」具体的提案
- `id` がスラグ → `/plan/<id>`
- TodayFinder の検索結果で使われる

### 3. スポット（`lib/spots.ts`）
- **445 件**（47 都道府県全て）
- 主要フィールド: `name`, `category` (zoo/aquarium/park/museum 等), `place` (indoor/outdoor/mixed), `ages`, `city`, `note`, `budget`, `pricing`, `reservation`, `facilities`, `kidReport` ほか
- 詳細フィールド数 30+。子連れ目線の設備情報（授乳室／おむつ替え／ベビーカー貸出など）を持つ

### 4. 個人店レストラン（`lib/indie-restaurants/chunk-*.ts`）
- **4,273 店舗**。46 ファイルにチャンク分割
- フィールド: `name`, `genre`, `area`, `description`, `strollerOk`, `kidsMenu`, `privateRoom`, `kidsChair`, `seatingType`, `priceLunch` ほか

### 5. 特集（`lib/feature-pages.ts`）
- **6 件**。型: `slug`, `title`, `hero`, `lede`, `intro`, `articleSlugs[]`, `spotFilter`, `themeTags`, `faq[]`
- 新デザインで拡張予定（年齢別／天気別／料金別タイル）

### 6. 駅マスタ
- 東京 486、神奈川 32、埼玉・千葉 32、関西 20 駅
- ファイル: `lib/tokyo-stations.ts` / `kanagawa-stations.ts` / `saitama-chiba-stations.ts` / `kansai-stations.ts`
- 各駅に `slug`, `name`, `lines`, `ward` などを保持

### 7. タグ（`lib/tags.ts`）
- 3 種類: `age` / `scene` / `theme`
- 例: `0-1sai`, `rain`, `weekday`, `15min`, `bento`, `dakkohimo` など

### 8. 一次情報（`lib/kid-reports.ts`）
- 運営者が **実際に子連れ訪問して書いた** スポットレポート
- `strollerNote`, `crowdNote`, `diaperNote`, `cautionNote` など
- 信頼性（E-E-A-T）の柱となる資産

### 9. その他データ
- `lib/popular-articles.ts` — 人気記事 slug 一覧
- `lib/supervisors.ts` — 専門家監修者マスタ
- `lib/hero-manifest.json` — 自動生成された記事ヒーロー画像マップ
- `public/hero-ai/` — 記事ヒーロー画像本体（webp/jpg）

---

## VI. 既存コンポーネント（流用可能なもの）

`components/` 配下に既に整備済み。新デザインで再利用 or リファクタする前提。

| ディレクトリ | 内容 |
|---|---|
| `components/top/` | TOP の各セクション（TodayFinder, PopularSpots, WeeklyPick, HeroCTA, StationSearch ほか） |
| `components/layout/` | SiteHeader, SiteFooter, MobileStickyNav |
| `components/article/` | 記事ページ内パーツ（FAQ, 関連記事カード等） |
| `components/common/` | PWA, Analytics, Logo, パーソナライズヒント |
| `components/affiliate/` | AffiliateLink |
| `components/ads/` | AdSlot（AdSense） |
| `components/station/` | 駅ページ用 |
| `components/items/` | 商品比較 |
| `components/interactive/` | 診断ツール |
| `components/plan/` | プランページ |
| `components/admin/` | 管理画面 |
| `components/tools/` | 各種ツール |
| `components/ui/` | 汎用 UI（少なめ） |
| `components/v2/` | **新デザイン用コンポーネント（V2Frame / V2Card / V2Header / V2BottomNav）** |

---

## VII. デザインシステム

### 既存の Tailwind トークン（`tailwind.config.ts`）
温かみのある「紙＋粘土」トーン。新デザイン（オレンジ系）とは別系統。
```
paper(#FBF5E8) / paper-deep / paper-card / line
ink(#25201B) / ink-sub / ink-mute
clay(#C9603E) / peach / honey / sage / sky / ochre
```

### `/v2` 新デザイントークン（`app/v2/v2.css`）
```
--v2-orange: #FF7A2D    メイン
--v2-orange-deep: #ED5A0E
--v2-orange-soft: #FFE7D2
--v2-yellow: #FFC753
--v2-blue: #4A8FE3      室内/雨/水
--v2-pink: #F38EA8      0-1歳
--v2-green: #5DBB6A     公園/自然
--v2-purple: #9B7FE0    イベント
--v2-bg: #FFF7EE        背景
--v2-surface: #FFFFFF   カード
--v2-ink: #2A2118       本文
--v2-r: 16px / --v2-r-lg: 20px / --v2-r-pill: 999px
--v2-frame: 420px       スマホ幅最大
```

### フォント
- **本文**: Noto Sans JP（400/500/600/700）
- **見出し**: Shippori Mincho（500/600/700）
- **英字小**: Inter

---

## VIII. 絶対に消してはいけないもの

> デザイン提案でファイルや URL を整理する際は、以下の存在を前提にしてください。

### URL
- `/`, `/article/[slug]`, `/category/[slug]`, `/spot/[slug]`, `/station/...`, `/feature/[slug]`, `/tag/[slug]`, `/plan/[id]` ほか上記 IV のすべて
- リダイレクトを伴う変更が必要な場合、必ず `next.config.ts` の `redirects` で対応

### コンテンツ（資産）
- `content/articles/*.md` (1,035 ファイル) — 全 SEO 流入の母体
- `content/plans/*.md` (531 ファイル) — TodayFinder の解答源
- `lib/spots.ts` (445 件 + 詳細フィールド)
- `lib/indie-restaurants/chunk-*.ts` (4,273 店舗)
- `lib/feature-pages.ts` (特集 6 件)
- `lib/kid-reports.ts` (一次情報レポート)
- `lib/tokyo-stations.ts` / `kanagawa-stations.ts` / `saitama-chiba-stations.ts` / `kansai-stations.ts` (570 駅)
- `lib/tags.ts` / `lib/popular-articles.ts` / `lib/supervisors.ts`
- `public/hero-ai/**` (記事ヒーロー画像本体)
- microCMS 上の全コンテンツ

### システム的に重要なもの
- `app/sitemap.ts` `app/robots.ts` `app/feed.xml` `app/atom.xml` `app/llms.txt` `app/ads.txt`
- `middleware.ts`
- `scripts/build-hero-manifest.mjs` 他、prebuild スクリプト
- `.env.local` の microCMS / AdSense / GA4 / IndexNow キー
- GA4 イベント体系（`lib/ga4-events.ts`, `lib/ga4-ab.ts`, `lib/ga4-popularity.ts`）
- AdSense スロット（`components/ads/AdSlot.tsx`）— 配置は維持

---

## IX. 新デザインに対応するときの実装ガイドライン

### 推奨アプローチ
1. **既存ファイルを書き換えない**。新ページは `/v2` 配下 → 確認後 `/v2` を本物ルートに昇格
2. **データ取得関数は既存を流用**（`getAllFileArticles()`, `SPOTS`, `FEATURE_PAGES` ほか）
3. **新コンポーネントは `components/v2/` に追加**、命名は `V2*` 接頭辞
4. **CSS は `app/v2/v2.css` の CSS 変数 + クラスベース** で `/v2` 配下に閉じる（Tailwind と併用可）
5. **画像は実写真必須**。プレースホルダー絵文字は本実装フェーズで `public/v2/` に配置した写真へ差し替え
6. **AdSense と AffiliateLink は新デザインにも組み込む**（場所の自由度はある）

### URL 移行戦略
新デザイン適用時の URL は **完全互換** が条件。
- `/` の中身を `/v2` で置き換える場合は `app/page.tsx` を新コンポーネントに差し替える
- `/area/*` などの新 URL を追加する場合は既存ナビ・サイトマップ・IndexNow への追加が必要

### 画像規格
- カード: **16:9**
- ヒーロー: 16:9 推奨、PC で大きめ表示も可
- 形式: **webp 推奨**（既存 hero-ai と同様）
- ファイル命名: kebab-case（既存 hero-ai と同様、英数のみ）

---

## X. デザイン納品時に欲しい成果物

1. **Figma ファイル**（または Sketch / Adobe XD）。9 ページ × スマホ 380〜420px / PC 768px+ の 2 ブレイクポイント
2. **デザイントークン一覧**（カラー／タイポ／角丸／影／余白）
3. **コンポーネント仕様**（共通カード／フィルターチップ／タブ／アコーディオン／下部ナビ）
4. **画像規格指定**（サイズ、aspect ratio、必要な枚数の見積もり）
5. **インタラクション仕様**（横スクロール挙動、フィルター適用フィードバック、空状態）
6. **アクセシビリティチェック**（コントラスト WCAG AA、タップ領域 44px 以上）

---

## XI. リスクと注意点

| リスク | 対策 |
|---|---|
| URL 変更による SEO 流入急減 | 既存 URL は絶対変えない。変える場合は 301 リダイレクトを必ず設定 |
| 記事 frontmatter 構造の破壊 | `slug` `category` `hero` `quickInfo` は固定。新フィールドは追加のみ |
| microCMS スキーマ変更 | スキーマ変更は本番影響大。デザイン都合での変更は事前相談 |
| AdSense 配置の喪失 | 各ページに最低 1 つの `<AdSlot />` を残す |
| 画像 LCP 悪化 | ヒーローは `next/image` の `priority` を維持 |
| GA4 イベント計測の喪失 | クリック計測のあるリンクは `data-ga4` 属性を維持 |

---

## XII. 連絡先・参考

- 仕様書原本: https://www.notion.so/374dbef53622804caf0efa46ce2a8642
- 既存リポジトリ: `kyounoko-web`（Next.js 15）
- モック実装: `app/v2/*`, `components/v2/*`（このフォルダで確認可能）

---

_最終更新: 2026-06-03 — このドキュメントはサイト構造変更時に随時更新してください。_
