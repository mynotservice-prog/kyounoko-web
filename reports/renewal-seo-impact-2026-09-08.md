# UIリニューアル（renewal/ui-2026-09）SEO/GEO/AdSense 影響監査

監査日: 2026-09-08 / 対象ブランチ: `renewal/ui-2026-09`（未コミット）/ 比較基準: `origin/main`
方式: 読み取り専用。`git diff origin/main`、`scripts/renewal/seo-snapshot.mjs` の snap-before(9/7) vs snap-v4-all(9/8)、
ローカル dev（http://localhost:3000）の実HTML、および本番 https://kyounoko.jp（= 変更前の実測値）を突き合わせた。
`npm run build` は実行していない。

---

## 結論

**インデックス制御・構造化データ・タイトル/ディスクリプション・内部リンクのいずれにも、検索順位を落とす方向の回帰は見つからなかった。** 13URLのスナップショット全件で title / description / robots / canonical が完全一致し、JSON-LD の差分は絵文字1文字削除に伴う `wordCount` の 16039→16038 のみ、見出しの消失は承認済みの絵文字除去1件のみ、内部リンクの消失はゼロ（1件だけ検出された `/article/shinjuku-kodzure-facilities` は `lib/articles.ts:1464-1466` の「更新から7日以内 +2点」という時刻依存スコアがスナップショット取得日の違いで反転したもので、リニューアルとは無関係と特定した）。`app/robots.ts` / `app/sitemap.ts` / `middleware.ts` / `next.config.ts` は1バイトも変わっていない。むしろトップの h2 が 0→16、内部リンクが 91→111、記事・スポットの内部リンクが各 +7〜+8 と増えており、SEO面では純増である。一方で、**新規の `/feature/autumn-kids` が「関東向けメディアなのに推奨スポット12件中12件が北海道・東北」「h2ゼロ・本文2,339字」という状態でindex可能かつサイトマップ登録済み**であること、**`app/globals.css` の `body { padding-bottom: 0 }` がリニューアル対象外の全ページにも効いて下部アンカー広告が最終コンテンツに被る可能性**、**グローバルCSSが約151KB(raw)/約30KB(gzip)増えて全ページで読み込まれる**ことの3点は、放置すると効いてくるリスクとして残る。

---

## 1. インデックス制御

| ファイル | 差分 | 影響 |
|---|---|---|
| `app/robots.ts` | **なし** | — |
| `app/sitemap.ts` | **なし** | — |
| `middleware.ts` | **なし** | — |
| `next.config.ts` | **なし** | — |

```
$ git diff --stat origin/main -- app/robots.ts app/sitemap.ts middleware.ts next.config.ts
（出力なし）
```

- `app/` 配下の差分全体を `noindex|robots|canonical|alternates|generateMetadata|openGraph` で grep しても、ヒットは
  `app/article/[slug]/page.tsx:486` の `.filter((a) => !a.noindex)`（ブロックの並び替えに伴う行移動のみ、ロジック同一）だけ。
- スナップショット13URL全件で `robots` メタが一致。`/today` と `/today?station=...` は前後とも `noindex, follow`、
  トップ・記事・スポット・カテゴリ・駅・一覧は前後とも `index, follow`。
- 実測: `curl` で `/robots.txt` 200 (4,332B) / `/sitemap.xml` 200 (644,322B) を確認。

**判定: 回帰なし。**

---

## 2. 構造化データ / GEO

### JSON-LD
13URL中12URLで JSON-LD がバイト一致（`jsonld:true`）。唯一の差分:

- `/article/kodzure-famires-15sen` の `Article`
  - `wordCount`: `16039` → `16038`（差分はこのキーのみ。他の全キーは一致）
  - 原因: `content/articles/kodzure-famires-15sen.md` の見出しから `⚡` を1文字削除したこと（承認済み）。

型の内訳も前後で同一:

| URL | JSON-LD の型 |
|---|---|
| 記事3本 | WebSite, Organization, Article, BreadcrumbList, FAQPage (+ ItemList 1本) |
| スポット2件 | WebSite, Organization, **Park, TouristAttraction**, BreadcrumbList, FAQPage |
| /category/today-doko | WebSite, Organization, BreadcrumbList, CollectionPage, FAQPage |
| /station/ikebukuro | WebSite, Organization, **ItemList**, BreadcrumbList, FAQPage |

- `aggregateRating` は `app/spot/[slug]/page.tsx` に前後とも1箇所（`git show origin/main:... | grep -c` = 1、現行も 1）。
  1,022行変更された spot ページの diff に `@type` / `jsonLd` / `aggregateRating` の増減は1行もない。
- HowTo は今回のサンプルURLに出現しない（`/today` は noindex のため元から JSON-LD が WebSite/Organization のみ）。

### speakable
`app/article/[slug]/page.tsx:885` の `cssSelector: ['.tldr-text', '.page-head .lead']` は不変。実DOMで両方の存在を確認:

```
$ grep -c 'tldr-text' audit-art.html   → 2（class="tldr-text prose" が実要素）
$ /article/sushiro-kids-menu の DOM: <header class="page-head"> … <p class="lead"> …（79,439〜81,461バイト目、同一 header 内）
```
`.lead` は `app/article/[slug]/page.tsx:1157` で `<header className="page-head">`（同 1053行）の直下に置かれたまま。**セレクタは生きている。**

### FAQ が JS ゲートされていないか
- `curl`（JSなし）で取得した記事HTMLに `<details` が 9個、うち `class="faq-item"` が8個。回答本文はHTMLに含まれる。
- ブラウザ実測でも `details.faq-item` 8個、`open` は 0個 = 閉じた状態でも本文はDOMにある。**回帰なし。**

### llms.txt / feed.xml / atom.xml
- `git diff origin/main -- app/llms.txt app/feed.xml app/atom.xml` は空（実体は `app/*/route.ts`）。
- 実測: `/llms.txt` 200 (32,435B) / `/feed.xml` 200 (35,907B) / `/atom.xml` 200 (36,293B)。
- これら3つは `lib/articles` など今回未変更の lib しか import しておらず、変更された5つの lib
  （`event-day-plan` `feature-pages` `hero-manifest.json` `outing-plan` `spot-day-plan`）への依存はない。
- 補足（今回の回帰ではない既存の穴）: `app/llms.txt/route.ts` に `/feature` の記述が0件。特集ページは5本とも
  llms.txt に載っていない。GEO面の取りこぼしとして別途対応の価値がある。

---

## 3. コンテンツの同一性（テキスト増減）

| URL | 変更前 | 変更後 | 差 | 見出し | 内部リンク | 画像 |
|---|---|---|---|---|---|---|
| `/` | 4,364 | 3,958 | **−406** | h1のみ → **h1+h2×16** | 91 → **111** | 55 → **69** |
| `/article/sushiro-kids-menu` | 7,238 | 6,955 | −283 | 26 → 26 | 45 → **52** | 5 → 5 |
| `/article/famires-kodzure-ranking-2026-10sen` | 9,679 | 9,408 | −271 | 26 → 26 | 54 → **61** | 5 → 5 |
| `/article/kodzure-famires-15sen` | 26,237 | 25,957 | −280 | 88 → 88 (絵文字1件) | 72 → 78 (−1/+7) | 5 → 5 |
| `/spot/-l5nt` | 3,503 | **3,733** | +230 | 9 → 9 | 24 → **32** | 14 → 14 |
| `/spot/-7bh1` | 3,233 | **3,447** | +214 | 9 → 9 | 28 → **36** | 13 → 13 |
| `/today` | 379 | 603 | +224 | **h1追加**（前はh1なし） | 35 → 44 | 1 → 1 |
| `/today?station=...` | 846 | 927 | +81 | 1 → 1 | 21 → 30 | 1 → 1 |
| `/events` | 3,932 | 3,593 | −339 | 1 → 1 | 92 → 88 | 39 → 37 |
| `/articles` `/spots` `/category/today-doko` `/station/ikebukuro` | — | — | **±0（完全一致）** | 一致 | 一致 | 一致 |

### 消えた可視テキストの分類

**(a) 意図的（社長承認済み）**

1. **LINE CTA の書き換え** — 全ページ共通で **−316字**（記事の減少分のほぼ全部）。
   `components/common/LineCta.tsx` の 188行→21行。削除されたのは
   「収録店の一部 / bills 二子玉川 ◎席まで横付け ★4 / ロウリーズ・ザ・プライムリブ恵比寿 / 100本のスプーンTOYOSU」の
   プレビュー表（−249字）と、「編集長が0〜2歳の子を連れて実際に回った50店を、Googleマップにピン留めして…」の
   説明文（−67字）。代わりに `KkLineCard` の1文（+61字）が入る。
   `trackEvent('line_add_click', …)` は `components/kk/KkLineCard.tsx:33` に引き継がれており、計測は失われていない。
   `.kk-line` に `display:none` はなく、PCでも `app/styles/kk.css:477-482` でサイズ調整されて表示される（設計メモ §2-1 の
   「PCでは非表示」という記述は実装と食い違うが、**表示される側**なので損はない）。
2. **記事mdの絵文字除去（115ファイル・120行）** — 変更行は120行すべてが `##` 見出し行で、
   削除された文字は `⚡ 🌶 🍓 🍖 📋 🔴 🥚 🪧` の8種のみ。**見出し文言のテキスト部分・h2タグ・順序は不変**
   （機械照合: 絵文字を除去した旧行と新行が120/120で完全一致、非見出し行の変更 0件）。
3. **トップの人気記事6件→5件** — `app/page.tsx:136` `popularArticles.slice(0, 5)`（旧 `slice(0, 6)`）。
4. **セクション名の言い換え** — 「人気の記事」→「よく読まれています」、「今週のイベント」→「今週末のイベント」、
   「もっと見る」×7 →「すべて見る」×10、「運営者情報」→「運営について」。リンク先は維持。
5. **トップのカードからバッジ/抜粋を削除** — 「0〜6歳」37→2、「雨OK」24→0、「授乳室あり」20→1、
   「ベビーカー貸出」17→0、「★5/また行く度」3→0、記事カードの本文抜粋（「餃子の王将って子供が…」等）。
   これがトップの −406字の主因。カード見た目の刷新に伴うもの。**リンクは1本も減っていない。**

**(b) 時刻依存のデータドリフト（リニューアル起因ではない）**

6. `/events` の −339字・リンク−4・画像−2 — 消えたのは
   `/event/showa-kinen-park-summer-water`（〜9/7終了）、`/event/tobu-zoo-summer-pool`、`/event/saitama-aqua-paradise`、
   `/events?area=saitama`。`app/events/page.tsx` は diff に含まれていない。スナップショット取得日が
   9/7→9/8 に跨いだことによる期限切れ。
7. `/article/kodzure-famires-15sen` の内部リンク `-1` と画像 `-1` — 関連記事枠の1枠が
   `shinjuku-kodzure-facilities`（`updatedAt: 2026-09-01`）から `kodzure-washoku-chain-10` に入れ替わった。
   原因は **`lib/articles.ts:1464-1466`**:
   ```
   const daysOld = (Date.now() - new Date(a.updatedAt).getTime()) / (1000*60*60*24);
   if (daysOld < 30) score += 2;
   if (daysOld < 7)  score += 2;
   ```
   9/7 13:06 時点で shinjuku は 6.5日 = +4点、9/8 13:48 時点では 7.6日 = +2点。
   **2点減って同点候補に抜かれただけで、コード変更とは無関係。** 消えたリンク先も画像も本番で健在。

**(c) 意図しない回帰**

**該当なし。** 唯一疑わしかったスポット本文の「消失」（東京ドイツ村の施設説明・年齢別の過ごし方・混雑・アクセス・雨の日）は、
トークン単位比較の空白再分割による誤検知で、実際には全文が残っていることを部分文字列一致で確認した
（6本のプローブすべて `OK`、空白除去後の文字数 3,317 → 3,522 で **増えている**）。

---

## 4. 内部リンク

- **サイト全体でリンクが消えたURLは検出できなかった。** 13URLのスナップショットで消失リンクはゼロ
  （前述の time-drift 1件を除く）。
- 変更された全 `.tsx` の `href` リテラルを機械比較したところ、消失は `app/page.tsx` の
  `/about` `/contact` `/editorial-policy` `/privacy` `/terms` の5本だけ。これは
  **`components/kk/KkFooter.tsx` に移設**されたもので、同ファイルは上記5本に加えて
  `/business` `/for-facilities` `/external-transmission` を持つ（計8本）。実HTMLでもトップの消失リンクは0件。
  さらに KkFooter は記事・スポット・`/today` にも入ったため、これらのページに **+7〜8本** の内部リンクが新設された。

### トップのエリアチップ
| | リンク先 |
|---|---|
| 変更前 `app/page.tsx:48-54` | 池袋・豊島 / 大塚・巣鴨 / 駒込・田端 / 東京23区 → **全部 `/station`**、関東のスポット → `/spots` |
| 変更後 `app/page.tsx:55-62` | みなとみらい `/station/minato-mirai` / 横浜 `/station/yokohama` / 豊洲 `/station/toyosu` / お台場 `/station/odaiba-kaihinkoen` / 錦糸町 `/station/kinshicho` / 大宮 `/station/omiya` |

実測（ローカル dev, `curl -w "%{http_code}"`）:
```
/station/minato-mirai        200  1,112,967B
/station/yokohama            200  1,242,083B
/station/toyosu              200  1,162,582B
/station/odaiba-kaihinkoen   200    843,064B
/station/kinshicho           200  1,154,345B
/station/omiya               200  1,199,520B
/station                     200    759,791B   ← 旧リンク先も維持
/spots                       200    763,979B   ← 旧リンク先も維持
```
**6ルートすべて 200。旧リンク先 `/station` `/spots` もトップから引き続きリンクされている**
（スナップショットの lost links が空であることで確認）。加えて `components/top/TopAreaTiles.tsx:6-11` の写真タイル4枚が
`/station/ikebukuro` `/station/shinjuku` `/station/shibuya` `/station/ueno` を新規に張っている。

**判定: 純増（トップ 91→111本）。回帰なし。**

---

## 5. AdSense

### 前提（重要）
本番 https://kyounoko.jp の実DOMを調べたところ、**手動枠（`<AdSlot>` = `.ad-slot` / `[data-placement]`）は本番でも1つもレンダリングされていない**。
トップ・記事とも `document.querySelectorAll('.ad-slot').length === 0`、`[data-placement]` も0件で、
表示されている広告はすべて自動広告（`ins.adsbygoogle.adsbygoogle-noablate`）だった。
したがって収益に効くのは「手動枠の位置」ではなく**ページの構造と高さ（自動広告の挿入余地）**である。

### 手動枠（コード上）
`<AdSlot>` は7箇所すべてで **placement 文字列・個数・条件分岐が完全に不変**（`{cond && …}` に入っているものはゼロ）:

| ファイル | placement | 変更前 → 変更後 |
|---|---|---|
| `app/page.tsx` | `home-below-finder` ×1 | L212 → L216 |
| `app/article/[slug]/page.tsx` | `article-end` / `article-related` | L1340,1434 → L1388,1438（前後の要素も同一） |
| `app/spot/[slug]/page.tsx` | `article-mid` | L778 → L682 |
| `app/event/[slug]/page.tsx` | `article-mid` | L386 → L387（ブロックはバイト一致） |
| `app/today/page.tsx` | `article-mid` / `article-related` | L835,1007 → L822,988 |

`components/ads/AdSlot.tsx:98-105` の `PLACEMENT_TO_UNIT` は閉じたユニオン型なので未定義文字列はコンパイルエラーになる（silent null にはならない）。

### ローダースクリプト
`app/layout.tsx` の diff は2ハンク（フォント差し替え、CSS import 5行）だけで、AdSense ブロック（現 `:345-372`）はバイト一致:
```
<Script id="adsense-loader" src={ADSENSE_SCRIPT_SRC} strategy="afterInteractive"
        crossOrigin="anonymous" data-overlays="bottom" />
```
`ADSENSE_CLIENT`（`ca-pub-4445473825791494`）、`<meta name="google-adsense-account">`（`:261`）、
`pagead2.googlesyndication.com` への preconnect/dns-prefetch（`:164-165`）、`lib/adsense.ts` すべて不変。

### CLS 予約高さ
`app/globals.css:2219-2241` の `.ad-slot { min-height:250px; content-visibility:auto; contain-intrinsic-size:250px }` と
placement別の 250/280/600px、768px以上の 280/400px は**1バイトも変わっていない**（globals.css の diff は2ハンクのみで、
どちらも広告ブロックに触れていない）。新規 `app/styles/*.css` に `.ad-slot` / `.adsbygoogle` / `ins` / `[data-ad` を
対象にするルールは存在しない（唯一 `app/styles/article-v3.css:793` が `.ad-label` の字形を変えるだけ）。

### スクロール・可視性
- `html` / `body` に `overflow:hidden` を入れるルールは新規CSSに無い。実測で本番・ローカルとも
  `getComputedStyle(document.body).overflow === "clip visible"`（同一）。
- 新規CSS 5ファイル（3,193行）に `position:fixed` は**ゼロ**。ページ全体のラッパに `transform` / `filter` /
  `will-change` / `contain` / `content-visibility` も無いので、下部アンカー広告の固定配置は壊れない。
- `app/globals.css:3530` の `iframe:not([class*="adsbygoogle"]):not([id*="aswift"])` 除外ルールも不変。

### 実測したページ高さ（375px幅、自動広告の挿入余地の代理指標）
| | 本番（変更前） | ローカル（変更後） | 備考 |
|---|---|---|---|
| トップ `docH` | 7,244px（うち自動広告5枠 = 725px）→ 本文実質 **≈6,519px** | **11,668px**（広告なし） | 本文 **+79%** |
| 記事 `docH` | 18,413px（うち自動広告8枠 = 3,000px）→ 本文実質 **≈15,413px** | **16,136px**（広告なし） | 本文 **+4.7%** |
| 記事本文 `.prose` font-size | 13.5px | **15.5px** | 可読性向上 |
| トップ h2 | **0個** | **16個** | 自動広告のセクション境界が増える |

**単純な `docH` 比較（18,413 → 16,136）だけを見ると記事が12%短くなったように見えるが、本番の値には
自動広告8枠×375px=3,000px が含まれている。差し引くと本文は逆に約5%長い。広告在庫が減る根拠は無い。**

### ⚠ 実在するリスク: `body { padding-bottom: 0 }` の全ページ適用
`app/globals.css:95`（`80px → 0`）と `app/globals.css:3533`（モバイル `76px → 0`）は**グローバル**な変更で、
今回デザインし直していないページにも効く。
- `.mobile-nav`（`app/globals.css:1117` の `position:fixed; bottom:0`）は `components/layout/MobileStickyNav.tsx` に
  定義されているだけで **どこからもレンダリングされていない**（`grep -rn MobileStickyNav --include=*.tsx` のヒットは定義のみ）。
  したがって固定ナビとの被りは起きない。**しかし** `data-overlays="bottom"` の下部アンカー広告は常時画面下に居るので、
  従来 76px あった「逃げ」がゼロになる。
- リニューアル済みの4ページ（トップ/記事/スポット/today）は `KkFooter` が
  `padding-bottom: calc(40px + env(safe-area-inset-bottom))`（`app/styles/kk.css:428`）を持つので概ね逃げがあるが、
  **`/events` `/station/*` `/category/*` `/ranking` `/articles` `/spots` など未改修ページは KkFooter を持たない**
  （`grep -rln KkFooter app components` → `app/page.tsx` `app/today/page.tsx` `app/article/[slug]/page.tsx` `app/spot/[slug]/page.tsx` のみ）。
  実測でローカルは `bodyPB: "0px"`、本番は `"76px"`。**未改修ページの最終行がアンカー広告に隠れる可能性がある。**
  「広告がコンテンツを覆う」はAdSenseのポリシー観点でも避けたい形。

### 広告幅
トップの広告ラッパが `.v2-section`（`padding:0 18px`）から `.kk-sec`（モバイル `0 18px` / 920px以上 `0 4px`）に変わり、
モバイルは同一、PCは **14px 広くなる**（レスポンシブ表示広告には微増方向）。
記事本文の `max-width: 42em`（`app/styles/article-v3.css:1050`）は `.article-v3 .prose` にしか掛からず、
`.ad-slot` は `.article-layout` のグリッド列（`minmax(0,720px)`、`app/globals.css:1889`）のまま。

---

## 6. Core Web Vitals

### フォント
| | 変更前 | 変更後 |
|---|---|---|
| 本文 sans | Noto Sans JP `400/500/600/700` | **Zen Kaku Gothic New** `400/500/700/900` |
| 見出し明朝 | Shippori Mincho `500/600/700`（`preload:true`） | 同一・不変 |
| 欧文 | Inter `400/500/600`（`preload:false`） | 同一・不変 |
| v2 の M PLUS Rounded 1c / Yomogi | `app/v2/v2.css:8` の `@import url(fonts.googleapis.com…)` | **削除** |

- ウェイト数は 4 → 4 で同数。Google Fonts の実CSSで @font-face 数を数えると
  **Noto Sans JP 4ウェイト = 496面 / Zen Kaku Gothic New 4ウェイト = 484面**。
  つまり日本語サブセット分割の量はほぼ同じで、head のプリロード量が増える構図にはならない
  （本番の変更前 head は `<link rel=preload as=font>` が 188本。変更後の本番値はビルドしていないので未測定だが、
  面数がわずかに少ない以上、増える方向にはなりにくい）。
- **CSSに残る `@import` はゼロ**（`grep -rn "@import" app/**/*.css app/*.css` のヒットはコメント行のみ）。
  削除された `@import` はバンドル後CSSの途中に出力されていて元から無効だった可能性が高いが、
  いずれにせよ**外部フォントへのレンダリングブロック要求が1本減る**方向。
- `app/layout.tsx:158` の `className` は3変数のまま、`preload` の設定も前後で同じ（sans=既定true / mincho=true / inter=false）。

### 新規のレンダリングブロック資源
**これが今回最大のCWVリスク。** `app/layout.tsx:13-17` で5本のCSSをグローバルに読み込む:
```
import './styles/kk.css';      28,321B
import './styles/top-v3.css';  28,167B
import './styles/article-v3.css'; 45,094B
import './styles/spot-v3.css'; 21,342B
import './styles/today-v3.css'; 28,418B
                        合計 151,342B (raw) / gzip 30,215B
```
- **ページ固有のCSS4本が全ページで読み込まれる。** 記事にしか使わない `article-v3.css`(45KB) が
  `/events` や `/station/*` でも配信される。
- `app/globals.css` と `app/v2/v2.css` は**削られていない**（diff はそれぞれ2ハンク/1ハンクのみ）。
  `.v2-area-chip` `.related-card` など置き換えで使われなくなったルールも残ったまま配信される。
- 本番の現在のアプリCSSは gzip で約 24.5KB（`c53b5ab…` 15,238B + `675f5593…` 8,575B + `e93e540c…` 736B。
  残る2本 125KB/93KB は @font-face 定義）。ここに **+30KB(gzip) は倍増以上**。
  実ビルドでの重複除去・minify後の数値は未測定だが、レンダリングブロックCSSが数十%増えるのは確実。

### LCP / CLS
- **トップのヒーロー画像に `priority` が付いた**（`components/top/TopHero.tsx:66` → `V2Base.tsx:129-131` で
  `loading="eager" fetchPriority="high" decoding="sync"`）。実測で本番は `eager:0 / fetchPriority=high:0`、
  ローカルは `eager:1 / high:1`（`/v2/hero/top-mobile-portrait.webp`, top=71px）。**LCPには改善方向。**
- 記事ヒーローは前後とも CSS `background-image` の div（画像preloadは効かない）。
  インラインで持っていた `aspect-ratio: 16/9` は `app/styles/article-v3.css:90-98` の `.av3-hero-img` に移っただけで
  **維持されている → CLS回帰なし**。
- レイアウトシフト実測（PerformanceObserver, 375px, スクロール往復）: 本番 CLS 0 / ローカル CLS 0。
  ※ observer をロード後に張っているため初期シフトを取り逃している可能性があり、**厳密な比較としては弱い**。
- トップの画像枚数は 67 → 84（+17）。増分はすべて `loading="lazy"`。
- インラインSVG（`KkIcon`）は記事1ページで 52個・15,210B = ドキュメントの **3.19%**。絵文字置換の代償としては軽微。

---

## 7. 新規ページ `/feature/autumn-kids`

**技術的には合格。ただしコンテンツ品質に赤信号。**

| 項目 | 結果 |
|---|---|
| ビルド/表示 | `curl` 200 / 363,157B |
| title | `【2026年】秋の子連れおでかけ・行事まとめ｜いも掘り・運動会・七五三・秋祭り｜きょうのこ`（他の特集4本と重複なし） |
| description | `いも掘り・運動会・七五三・秋祭りと、0〜6歳の秋の過ごし方を年齢別にまとめました。`（ユニーク） |
| robots | `index, follow` |
| canonical | `https://kyounoko.jp/feature/autumn-kids`（自己参照） |
| sitemap | **登録済み**。`app/sitemap.ts:426-431` が `FEATURE_PAGES` を列挙するため自動。`/sitemap.xml` に1件ヒットを実測 |
| JSON-LD | BreadcrumbList / CollectionPage(ItemList) / FAQPage の3本 |
| 内部リンク | `components/top/TopSeasonBanner.tsx:19` からトップに露出（9〜11月）＋ `/feature` 一覧の先頭 |
| 参照記事 | 9本すべて `content/articles/` に実在 |
| 既存ページとの重複 | 該当なし（`/category/gyouji` と主題が近いがカテゴリ名は汎用で年・季節指定なし） |

### ⚠ 見つかった問題

1. **「この特集のおすすめスポット」12件が全部、北海道・青森・岩手。**
   実レンダリング結果:
   `1 旭山動物園(旭川市) / 2 札幌市円山動物園 / 3 のぼりべつクマ牧場 / 4 北海道こどもの国(砂川市) /
    5 おたる水族館 / 6 国営滝野すずらん丘陵公園 / 7 モエレ沼公園 / 8 八戸公園 / 9 新青森県総合運動公園 /
    10 青森県立三沢航空科学館 / 11 モヤヒルズ / 12 盛岡市動物公園ZOOMO`
   原因は `lib/feature-pages.ts:62` の `spotFilter: (s) => s.place === 'outdoor' || s.place === 'mixed'`。
   428件中162件がヒットし、`getAllSpotsWithSlug`（`lib/spots.ts:3657-3669`）は SPOTS を**北海道から**順に返すので
   `.slice(0, 12)` が北から12件を取ってしまう。しかも `app/feature/[slug]/page.tsx:163` で `rank={i+1}` を渡しており
   **1〜12位のランキングとして表示される**。
   他の特集は `isSummerCool(s) || hasWaterPlay(s)` / `isIndoor` / `isFreeSpot` のように意味のある述語を使っている。
   関東中心のメディアで「秋のおすすめ1位=旭山動物園」は、ユーザー体験としても E-E-A-T としても悪い。
2. **h2 が0個。** 本文は2,339字で、「この特集のおすすめスポット」「関連記事」といったセクション見出しが
   h2 になっていない。index可能な新規ページとしては構造が薄い。過去に AdSense で
   「有用性の低いコンテンツ」を指摘された経緯があるサイトなので、薄い新規URLを増やすのは避けたい。
3. llms.txt に載らない（特集5本すべて同様。既存の穴）。

---

## リスクと対策（優先度つき）

### P0 — 公開前に直す
1. **`/feature/autumn-kids` のスポット選定を直すか、スポット節を落とす。**
   `lib/feature-pages.ts:62` の `spotFilter` を `category === 'seasonal'` や関東エリア限定など
   秋・地域に意味のある述語に変える。直せないなら `maxSpots: 0` にしてスポット節を出さない。
   併せて `app/feature/[slug]/page.tsx` の節見出しを h2 にする。
   → そのままindexさせると「北海道の動物園ランキング」を秋の子連れおでかけとして提示することになる。

### P1 — 公開前に判断
2. **`body { padding-bottom: 0 }` を全ページに効かせるのをやめる。**
   `app/globals.css:95` / `:3533`。KkFooter を持たないページ（`/events` `/station/*` `/category/*` `/ranking`
   `/articles` `/spots` ほか）だけ従来の 76px を残すか、`.kk-footer` を持つページに限定したセレクタにする。
   → 下部アンカー広告が最終コンテンツを覆う＝AdSenseポリシー面のリスク。
3. **グローバルCSSの肥大（+151KB raw / +30KB gzip）を抑える。**
   `article-v3.css` `spot-v3.css` `today-v3.css` `top-v3.css` を `app/layout.tsx` ではなく各ページの
   `page.tsx` で import する（Next.js が該当ルートにだけ配信する）。
   併せて `globals.css` / `v2.css` の死んだルール（`.v2-area-chip` `.related-card` など）の棚卸しを次フェーズで。
   → 全5,000ページのレンダリングブロックCSSが倍増する。

### P2 — 公開後に測る
4. **トップの広告位置が2ブロック深くなった。** 変更前は「人気スポット直後（6番目）」、変更後は
   「今日のおすすめプラン / エリアタイル / 種類タイル が上に入って8番目」。
   `app/page.tsx:304` のコメント「位置も旧トップと同じ『人気スポットの直後』に置く」は事実と異なる。
   手動枠は本番でそもそも描画されていないため直接の損はないが、トップの本文高さが +79% になったことと合わせ、
   **公開2週間後にAdSenseのページRPMとトップの広告表示回数を確認する**こと。
5. **フォント差し替え後の本番 head サイズとLCPを実測する。** 面数(496→484)からは悪化しない見込みだが、
   ビルドしていないので確定していない。デプロイ後に PSI（モバイル）でトップ・記事を1本ずつ。
6. **`lib/hero-manifest.json` の `articleSlugs` が 1180 → 1179 に減っている。**
   `articleHero` は前後とも空オブジェクトなので実害はないが、記事が1本減った/重複解消された可能性がある。
   再生成のタイミング差か実データ変化かを確認しておく。
7. **llms.txt に特集ページ5本を追加する**（GEO。今回のリニューアルとは独立の宿題）。

### P3 — 記録
8. 記事mdの絵文字除去115本は見出し文言が変わるため、Googleの再クロール後にタイトル/スニペットの再評価が入る。
   h2テキストの変更は微小（絵文字1文字＋空白）なので順位影響は無視できる範囲と判断するが、
   9月下旬にGSCで対象記事群の平均掲載順位を確認しておくと安心。
9. `docs/renewal-2026-09.md` の記述と実装のズレ2件（①「Klee One を追加」→実際は Zen Kaku Gothic New に統一、
   ②「LINEブロックはPCで非表示」→実際はPCでも表示）。ドキュメント側を実装に合わせて直すこと。

---

## 検証できなかったこと

1. **`npm run build`（本番ビルド）を実行していない**ため、以下は未確定:
   - 本番バンドル後のCSS実サイズ（minify/重複除去後）。gzip 30KB増は**ソース由来の推定値**。
   - 本番 head の `<link rel=preload as=font>` 実本数（変更前の実測値 188本に対する変更後の値）。
   - 5,000ページ規模の静的生成が完走するか（`npx tsc --noEmit` は exit 0 / エラー0で通過済み）。
2. **変更前のコードをローカルで起動して並べて測っていない。** 「変更前」の実測値は本番 kyounoko.jp を使ったので、
   Cloudflare キャッシュ・本番env・自動広告の有無という差が混ざっている。
   特に記事の `docH` 18,413px には自動広告8枠(3,000px)が含まれており、単純比較はできない（本文では補正済み）。
3. **CLS の厳密比較ができていない。** PerformanceObserver をページロード後に張ったため、初期レイアウトシフトを
   取り逃している可能性がある。本番デプロイ後に PSI / CrUX で確認が必要。
4. **自動広告の実挿入数の前後比較ができない。** ローカル dev では自動広告が配信されないため、
   「本文が5%長くなった＝挿入余地は減っていない」は構造からの推定であり、実測ではない。
5. **スナップショットのURLは13本のみ。** `/feature/*` `/plan/*` `/tag/*` `/authors/*` `/line/*` `/ranking`
   `/reports` などはスナップショットに含まれておらず、機械照合していない
   （ただしこれらのページの `.tsx` は diff に含まれていない）。
6. **サイトマップ全URLの前後差分を取っていない。** `/sitemap.xml` は 644KB あり、
   `/feature/autumn-kids` が1件増えたことだけを確認した。総URL数の増減は未確認。
7. **`docs/renewal-2026-09.md` が求める「ローカル dev での 375px / 1280px 目視」は監査側では実施していない**
   （担当エージェントが撮ったスクリーンショットがスクラッチパッドにあるが、内容の妥当性判断は社長レビュー範囲）。
