# ボットのクエリ総当たりに対するコスト防御（2026-09-03 実測版）

AIクローラーが `/today?age=…&station=…` のようなクエリ組合せ空間を総当たりし、
Vercel の Function 起動と Origin 転送を直撃してインフラ費が急騰する問題への恒久対策。

## 経緯

| 日付 | 出来事 |
|---|---|
| 8/27〜9/2 | ClaudeBot + GPTBot が 42万req/12h。6日で $39（月換算$200ペース） |
| 9/2 18:44 | robots.txt に**ボットUAを列挙**して Disallow（`9d91336`） |
| 9/2 21時頃 | 列挙に無い新UA **claude-searchbot** が出現し 34K req/12h で再開 |
| 9/3 朝 | 日次 $6.19（月換算$186ペース）。列挙方式の敗北を確認 |
| 9/3 09時 | robots.txt をデフォルト拒否に反転 ＋ middleware 第2層を追加（`e647987`） |
| 9/3 10時 | 301+public cache の妥当性を実測再検証し 302+no-store に修正（`f3a3239`） |

**教訓: ボットUAの列挙は必ず破られる。**新UAが来るたび「1日分の課金を払ってから気づく」
構造になるため、名前を知らないボットが初手から止まる設計にする。

## 現在の防御層

### 第1層: robots.txt（`app/robots.ts`）— デフォルト拒否

`*` グループに `/today?` `/events?` `/ranking?` `/spots?` の Disallow を置き、
**未知のボットも名前を知らずにブロックする**。`Googlebot` だけ専用グループを持ち、
クエリ変種も従来どおりクロール可（8/17の教訓＝noindex+canonical を読ませないと
インデックス残骸が剥がせない）。robots.txt は「最も具体的にマッチする1グループのみ適用」
という仕様なので、Googlebot グループがある限り Google が `*` の追加 Disallow を読むことはない。

**限界: 紳士協定。**robots.txt 取得前の初回アクセス、取得ラグ中、非準拠ボットには効かない。

### 第2層: middleware（`middleware.ts` の `botQueryGuard`）

ボットUA × クエリ付きの `/today|/events|/ranking|/spots|/search` を
edge で **302** してクリーンURLへ送る。ページ Function も HTML 転送も発生しない。

**限界: UAは自己申告。**偽装されれば素通りする。今回の犯人（claude-searchbot 等）は
正直にUAを名乗る正規クローラーなので実効はあるが、悪意ある相手には効かない。
そこを止めたい場合は第3層（CF）が要る。

## キャッシュ汚染の検証結果（2026-09-03 本番実測）

第2層の応答は **UAによって内容が変わる**ため、共有キャッシュに保存されると
ボット向けリダイレクトが一般ユーザーに配信されフィルタ操作が壊れる。実測した結果:

| 検証 | 結果 |
|---|---|
| bot UA 8連打 → 人間UA 5回（同一URL） | bot=全302、人間=全200。**汚染なし** |
| リダイレクト応答の `x-vercel-cache` | **ヘッダ自体が付かない**（middleware応答はVercel CDN層を通らない） |
| リダイレクト応答の `cf-cache-status` | 常に `DYNAMIC`（CFも保存していない） |
| `/today` `/events` 等の `cf-cache-status` | すべて `DYNAMIC`（CFはこれらを一切キャッシュしていない） |
| `/`（トップ）の `cf-cache-status` | **`HIT`**。origin は `private, no-cache, no-store` を返しているのに |

### ここから導かれる2つの結論

1. **以前の `Cache-Control: public, max-age=86400` は一度も効いていなかった。**
   「CFにも再訪を止めさせる」という当初の説明は誤り。利得ゼロだったので撤回した。

2. **キャッシュ制御ヘッダはこのゾーンの防御に使えない。**
   `/` の実測が示すとおり、このゾーンには **origin の Cache-Control を無視して
   HTML をキャッシュする CF Cache Rule が実在する**（Cache Everything 系）。
   そのルールの対象が将来 `/today` に広がれば、ヘッダに何を書いても汚染されうる。
   さらに **CF は `Vary: User-Agent` を標準キャッシュのキーに使わない**
   （CFが尊重する Vary は実質 `Accept-Encoding` のみ）ので、Vary も CF 対策にならない。

したがって現在の実装は「ヘッダを防御の主役にしない」方針で組んである:

- `Cache-Control: private, no-store` ＋ `CDN-Cache-Control: no-store` ＋
  `Cloudflare-CDN-Cache-Control: no-store` で**保存を促す指示を一切出さない**
  （`next.config.ts` の `headers()` が `/today` に付ける
  `CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=604800` が
  この応答にも乗ってしまうため、明示的に打ち消す必要がある。これが最も危険だった）
- `Vary: User-Agent` は CF 以外の準拠キャッシュには正しく効くので付ける
- ステータスは **302**。301 はクライアント側に半永久的に焼き付き、UA判定を
  万一取りこぼした利用者がフィルタを二度と使えなくなる。実測でも301に
  ボット再訪の抑止効果は無かった（適用後も同レートで再クロール）ため利得が無い

**⚠️ 将来 CF の Cache Rule を触る人へ:** `/today` `/events` `/ranking` `/spots` `/search`
を「Cache Everything」の対象に入れないこと。入れる場合は先に第2層を
CF側（第3層）へ移すか、middleware の UA 分岐を廃止すること。

## Cloudflare の実構成（2026-09-03 ダッシュボード実査）

- **アカウント: `Service@remegift.jp's Account`**（`Mynot.service@gmail.com` の方ではない。
  あちらはドメイン0件で kyounoko.jp が見えない）
- **プラン: Free Website** → `cf.client.bot_score`（Bot Management）は**使えない**
- 24時間の総リクエスト 1.14M / ユニーク訪問者 8.92k / Percent Cached 73.01%

### Cache Rules（6本・全て Active）

| # | 名前 | 対象 | Edge TTL |
|---|---|---|---|
| 1 | Bypass: admin/mypage/api/hearing | `/admin` `/mypage` `/api/` `/hearing` | Bypass |
| 2 | Cache _next/static | `/_next/static/` | 30日 `override_origin` |
| 3 | Cache images/fonts/css/js + OG | 拡張子マッチ | 30日 `override_origin` |
| 4 | Cache article/column/top HTML | `/articles` `/columns` `/gifts` `/stories` `/gift-guide` `/gift-type` `/diagnosis` **`/`** `/anniversary-gift` `/birthday-gift` | **1時間 `override_origin`** |
| 5 | Cache sitemap/robots/ads/llms/manifest | 個別ファイル | 10分 `override_origin` |
| 6 | Cache HTML pages | `/article/` `/spot/` `/category/` `/tag/` `/station/` `/feature/` `/plan/` `/kid-reports` `/feature` | `bypass_by_default` |

- **`/` が origin の `no-store` を無視して HIT する犯人はルール4**
  （`edge_ttl: {default: 3600, mode: override_origin}`）。`override_origin` は
  文字どおりオリジンのキャッシュ指示を上書きする。
- **`/today` `/events` `/ranking` `/spots` `/search` はどのルールにも一致しない**
  （全ルールの `starts_with` を総当たりで突き合わせ、前方一致の巻き込みもゼロを確認）。
  よって第2層のUA依存応答がCFにキャッシュされる経路は**現時点で存在しない**。
- ルール4の `/gifts` `/gift-guide` `/gift-type` `/diagnosis` `/anniversary-gift`
  `/birthday-gift` は **remegift.jp のパス**。kyounoko ゾーンに設定がコピペされている。
  kyounoko 側に該当パスが無いので実害は無いが、読むときの混乱の元。

### WAF Custom Rules（4本使用 / Free上限5本 → **残り1枠**）

1. Block /admin from non-Japan — `block`
2. Block /admin requests from bot/script user-agents — `block`
3. Block common file scanner paths (WP/PHP/dotfile probes) — `block`
4. Challenge non-JP visitors on /mypage — `managed_challenge`

Rate Limiting ルールセットと Managed WAF は未設定（Freeのため）。

## 第3層（未実施・要判断）: Cloudflare で Vercel 到達前に遮断

現状はボットのリクエストが CF を素通りして Vercel まで届き、middleware invocation として
課金される（ページ Function 起動よりはるかに安いが、ゼロではない）。
CF WAF で落とせば **Vercel には1リクエストも届かない**。

### 提案ルール（Security → WAF → Custom rules・残り1枠を使う）

Free プランのため `cf.client.bot_score` は使えない。UAベースで書く:

```
(http.request.uri.query ne ""
 and (starts_with(http.request.uri.path, "/today")
   or starts_with(http.request.uri.path, "/events")
   or starts_with(http.request.uri.path, "/ranking")
   or starts_with(http.request.uri.path, "/spots")
   or starts_with(http.request.uri.path, "/search"))
 and any(lower(http.user_agent)[*] contains {"bot" "crawler" "spider" "gpt" "claude" "anthropic" "perplexity"})
 and not any(lower(http.user_agent)[*] contains {"googlebot" "adsbot-google" "mediapartners-google" "bingbot"}))
→ Action: Block
```

### 優先度の判断（2026-09-03 時点の結論: 急がない）

middleware（第2層）で**課金の本丸である Function 起動は既に約85%落ちている**。
CF WAF を足して追加で消せるのは middleware invocation ぶんだけで、
実測レート（/today 約6.2K req/h）から見積もると月$2〜3程度にすぎない。
**Free枠の最後の1本を使う価値としては弱い。**

CF側に移す意義があるのは次のいずれかに当てはまる場合:
- ボットのレートが一段跳ね上がり、Edge Requests（Pro込み10M/月）や
  Middleware invocations（Pro込み1M/月）の枠を脅かし始めたとき
- UA偽装する相手が現れたとき（ただしFreeでは bot_score が無いので
  CFに移してもUA判定のままで、検出力は上がらない。その場合はプラン変更が要る）

枠を空けたいなら、既存の `/admin` 系2本（非日本ブロック＋bot UAブロック）は
1本の `or` 条件に統合できる。

### やってはいけないこと

- **Bot Fight Mode を有効化しない。**過去に順位急落の原因になった実績がある。
- **「Block AI training bots」を有効化しない**（Overview の Manage AI bot access。
  現在は "Do not block (allow crawlers)"）。AI経由の流入は既に実在し、
  GEO戦略上クリーンURLはクロールさせ続ける必要がある。遮断したいのは
  「クエリ変種の総当たり」だけであって、AIクローラーそのものではない。

### 実施手段

現行の `CLOUDFLARE_API_TOKEN` はパージ専用スコープでルールの読み書き不可
（zone読み取りすら 9109 Unauthorized）。API経由で入れるならトークンのスコープに
`Zone / Firewall Services / Edit` を追加するか、ダッシュボードで手動追加する。

## 再発時の切り分け手順

1. Vercel → Usage → By Project で費用の出所を特定（日次$2.0黄/$3.5赤）
2. Observability → Edge Requests → **Bot Name** タブで犯人UAを特定
   （Paths タブはクエリを剥がすので「同一パスに数十万req」はクエリ総当たりを疑う）
3. **Cached 率を見る。**1桁%ならクエリ変種が Function を起動している
4. 対策後は Observability → Functions の Invocations グラフに断崖が出るかで効果判定
   （費用グラフは最大1時間のラグがあり即時判定に使えない）
