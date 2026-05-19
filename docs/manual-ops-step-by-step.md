# 6つの手動作業 — ステップバイステップ手順

各タスクの **「どこをクリックするか」** まで具体的に書いた手順。コピペで進められるレベル。

---

## ① GA4 — 内部トラフィック除外（5分）

**狙い**: `/admin/*` 訪問が GA4 を汚しているのを止める。

1. https://analytics.google.com/ を開く
2. 左下 **「管理（歯車アイコン）」** をクリック
3. プロパティ列で **「データストリーム」** → きょうのこ Web ストリーム をクリック
4. 中段の **「拡張計測機能」** の右端の歯車をクリック
5. ポップアップ最下部の **「詳細設定を表示」** をクリック
6. **「内部トラフィックの定義」** → **「ルールを作成」** ボタンをクリック
7. 入力フォーム:
   - ルール名: `Admin Pages`
   - traffic_type 値: `internal`
   - 一致条件: `page_path` 「含む」`/admin`
8. 右上 **「作成」** クリック
9. ブラウザ「戻る」を2回押して **管理 → データ設定 → データフィルタ** へ
10. **「フィルタを作成」** ボタンをクリック
11. フィルタの種類: **「内部トラフィック」** を選ぶ
12. 入力:
    - フィルタ名: `Exclude Admin`
    - フィルタ オペレーション: **「除外」**
    - パラメータ値 `internal`
    - フィルタの状態: 最初は **「テスト中」** → 動作確認後に **「有効」** に切替
13. **「作成」** クリック

> 検証: 自分が `/admin` を訪問した直後、リアルタイムレポートに自分が表示されなければOK（テスト中だと traffic_type=internal で表示される、有効化すると非表示）。

---

## ② GA4 — カスタムディメンション7個を登録（10分）

**狙い**: 新しく追加したイベントのパラメータをレポートで分析可能にする。

1. https://analytics.google.com/ を開く → **管理 → カスタム定義**
2. **「カスタムディメンションを作成」** をクリック、以下7個を **すべて** 同じ手順で登録:

| ディメンション名 | スコープ | イベント パラメータ | 説明（任意） |
|---|---|---|---|
| variant | イベント | `variant` | A/Bテストの割当バリアント |
| experiment_id | イベント | `experiment_id` | A/Bテストの実験ID |
| percent | イベント | `percent` | スクロール深度の到達% |
| action | イベント | `action` | PWAインストール選択肢 |
| provider | イベント | `provider` | アフィリエイト提供元 |
| item_id | イベント | `item_id` | アフィリエイト商品ID |
| page_path | イベント | `page_path` | 手動page_viewのpath |

各登録ごとに:
- 「ディメンション名」: 上記列1
- 「スコープ」: 上記列2を選ぶ
- 「説明」: 上記列4
- 「イベント パラメータ」: 上記列3
- 「保存」

> 集計反映は登録から **24時間後**。土曜帰宅時にはほぼ反映されている。

---

## ③ GA4 — キーイベント（旧コンバージョン）に登録（3分）

**狙い**: A/BテストとCTRをコンバージョン指標としてレポート上に集計する。

1. https://analytics.google.com/ → **管理 → イベント**
2. **イベント一覧** から以下を見つけて **「キーイベントとしてマーク」** の右側スイッチをONにする:
   - `hero_cta_click`
   - `affiliate_click`
   - `pwa_install_prompt_action`
3. 出てこないイベントは、まだ実本番で発火していない可能性。明日以降に確認。

---

## ④ Search Console — 週次インデックスリクエスト（10分／週）

**狙い**: 「検出 - インデックス未登録」73件を消化する。毎週月曜の運用ルール。

1. https://search.google.com/search-console を開く
2. プロパティ: **`https://kyounoko.jp/`** を選択
3. 左サイドバー **「ページ」**（インデックス作成セクション）をクリック
4. 「ページがインデックスに登録されなかった理由」一覧から **「検出 - インデックス未登録」** をクリック
5. URL一覧から **上位20件を impressions が多い順 or 公開が新しい順** でピック
6. 各URLについて:
   - URL左の **「外部リンクアイコン」** または上部の検索ボックスに URL貼り付け
   - 「URL検査」画面で **「公開URLをテスト」** クリック
   - 結果が「URL は Google に登録できます」になったら **「インデックス登録をリクエスト」** クリック
   - 完了したら「URL検査ホーム」に戻る
7. 1日あたりリクエスト上限は ~10件、週単位では ~20件まで。月曜に20件消化のルーチンに。

> ポイント: 同じURLを連続でリクエストしても無効。1週間に1回まで。

---

## ⑤ Bing Webmaster Tools 登録（10分）

**狙い**: Yahoo + Bing 流入 27% の最適化。IndexNow は既にpostbuildで自動pingしているが、Bing Webmasterに登録するとサイトマップ送信などができる。

1. https://www.bing.com/webmasters を開く
2. **「Sign In」** → 既存Googleアカウントで連携サインイン（Microsoft, Facebook, Google が選べる）
3. **「Add a site」**:
   - 推奨: **「Import from Google Search Console」** ボタン（GSCと同じ認証情報で一括取り込み）
   - 手動なら **「Add a site manually」** に `https://kyounoko.jp/` を入力
4. 認証方式を選ぶ（GSCインポートなら自動完了、手動なら meta タグ or DNS）
5. 認証完了後、左サイドバー **「Sitemaps」** → **「Submit sitemap」** に `https://kyounoko.jp/sitemap.xml` を入力 → Submit
6. 数日後、左サイドバー **「Search Performance」** で Bing/Yahoo からの実際のクエリ・順位が見える

> 補足: Yahoo は Bing のインデックスを使っているので、Bing Webmaster だけで Yahoo もカバー。

---

## ⑥ Vercel — 5xx 9件の調査（15分）

**狙い**: Search Console が報告している 5xx をログから特定して対処要否を判断。

1. https://vercel.com/ を開く → kyounoko-web プロジェクト
2. 上部メニュー **「Logs」** をクリック
3. 右上 **「Filters」** をクリック
4. フィルタを設定:
   - **Status Code**: `500`, `502`, `503`, `504` を選択
   - **Time Range**: 「Last 30 days」
5. 出てきたログのURL列を確認:
   - 同じパスが何度も出てくる → そのエンドポイントに問題あり
   - バラバラ → コールドスタート由来の一過性、放置でOK
6. 5xx の出るパスを Search Console の「サーバーエラー（5xx）」一覧と突合
7. 問題のあるエンドポイントが特定できたら、Issue にメモ。コード修正が必要なら ながみーさん帰宅後に対応 or 私（次セッション）に共有

> 補足: Vercel無料tier は関数のコールドスタートで一時的に5xxを返すことがあり、Search Console の9件中の半分以上はそれの可能性。

---

## ⑦ 収益化セットアップ — 楽天77本＋Amazon を有効化（30〜45分）

詳細は **[`monetization-setup.md`](./monetization-setup.md)** 参照。

旅行から帰宅後の最優先タスク。現状、楽天商品URL 77本が記事に埋め込み済みだが、もしもアフィリエイト経由のENV未設定のため**収益化されていない**。3つの環境変数（`NEXT_PUBLIC_MOSHIMO_A_ID` / `NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID` / `NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID`）を設定するだけで一気に収益化開始。

ざっくり流れ:
1. もしもアフィリエイト無料登録 → 楽天市場プロモ提携申請（即時承認）
2. 広告コードから a_id / pc_id / pl_id を取得
3. `.env.local` と Vercel Environment Variables の両方に追加
4. Vercel Redeploy で本番反映

Amazonアソシエイト も同時に登録すると `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` がもう1つ増えるが、こちらは販売実績3件が必要なので登録だけ先に。

---

## 旅行前にやっておくべきこと

優先度順に：

1. **`bash scripts/_pre-trip-cleanup.sh` を実行**（5分）
   - ローカルから不要ファイル642MB削除
   - 終わったら git push しておく

2. **Cloudflare Workers AI トークン取得**（5分）
   - https://dash.cloudflare.com/sign-up で無料アカウント作成（クレカ不要）
   - 右下「Account ID」をコピー
   - https://dash.cloudflare.com/profile/api-tokens で「Create Token」→ Custom token → Permissions: Account → Workers AI → Read
   - `.env.local` に追記:
     ```
     CLOUDFLARE_ACCOUNT_ID=xxxxxxxx
     CLOUDFLARE_API_TOKEN=xxxxxxxxxx
     ```
   - 同じ内容を `~/.zshrc` に `export` して `source ~/.zshrc`

3. **37記事の画像を一括生成**（30分）
   ```bash
   cd /Users/nagaminehideki/Developer/kyounoko-web
   node scripts/dry-run-prompts.mjs    # tmp/image-prompts.json 再生成
   node scripts/generate-hero-images-cloudflare.mjs --concurrency=2 --steps=8
   # 37本生成 → public/hero-ai/<slug>.jpg
   node scripts/apply-hero-ai.mjs       # hero フィールドを記事に注入
   git add -A
   git commit -m "feat(images): add hero images for 37 missing articles"
   git push
   ```

4. **スケジュールタスクのトークン承認（重要）**
   - Claude Desktop の左サイドバー「Scheduled」を開く
   - `kyounoko-trip-content-cycle` を選んで **「Run now」** ボタンをクリック
   - 最初の1サイクルを手動実行することで、Bash や Write などのツール承認が記録される
   - 以降の自動サイクルは承認なしで走る
   - 1サイクル目で1記事完成（commit & push）されることも確認

5. **Macが旅行中も起動状態であることを確認**
   - スリープしないように設定: システム設定 → ロック画面 → スリープまでの時間を「しない」に
   - 電源接続もキープ

これら全部終わったら、安心して旅行へ。
