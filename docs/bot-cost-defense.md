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

## 第3層（未実施・要判断）: Cloudflare で Vercel 到達前に遮断

現状はボットのリクエストが CF を素通りして Vercel まで届き、middleware invocation として
課金される（ページ Function 起動よりはるかに安いが、ゼロではない）。
CF WAF で落とせば **Vercel には1リクエストも届かない**。

### 提案ルール（Security → WAF → Custom rules）

```
(http.request.uri.path in {"/today" "/events" "/ranking" "/spots" "/search"}
 and http.request.uri.query ne ""
 and cf.client.bot_score lt 30
 and not cf.client.bot_score_src eq "verified_bot")
→ Action: Block
```

`cf.client.bot_score` は CF が独自に算出するため **UA偽装で回避できない**のが
middleware との決定的な差。`verified_bot` 除外で Googlebot 等の検証済みクローラーは通す。
Bot Management 未契約プランで bot_score が使えない場合は UA ベースで代替:

```
(http.request.uri.path in {"/today" "/events" "/ranking" "/spots" "/search"}
 and http.request.uri.query ne ""
 and any(lower(http.user_agent)[*] contains {"bot" "crawler" "spider" "gptbot" "claude"})
 and not cf.client.bot_score_src eq "verified_bot")
→ Action: Block
```

### 判断が要る点

- WAF Custom Rules は Free プランで5本まで。既存ルールの本数を確認してから追加する
- `Block` だと link preview（Slack/X/Facebook）も落ちる。気になるなら
  `Managed Challenge` にするか、プレビュー系UAを除外条件に足す
- **実施には社長のCFダッシュボード操作が必要**（現行の `CLOUDFLARE_API_TOKEN` は
  パージ専用スコープでルールの読み書き不可。API経由で入れるならトークンの
  スコープに `Zone / Firewall Services / Edit` を追加する）

## 再発時の切り分け手順

1. Vercel → Usage → By Project で費用の出所を特定（日次$2.0黄/$3.5赤）
2. Observability → Edge Requests → **Bot Name** タブで犯人UAを特定
   （Paths タブはクエリを剥がすので「同一パスに数十万req」はクエリ総当たりを疑う）
3. **Cached 率を見る。**1桁%ならクエリ変種が Function を起動している
4. 対策後は Observability → Functions の Invocations グラフに断崖が出るかで効果判定
   （費用グラフは最大1時間のラグがあり即時判定に使えない）
