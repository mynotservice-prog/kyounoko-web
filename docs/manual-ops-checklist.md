# 運用チェックリスト（ながみー手動作業）

コード変更で対応できない、GA4/Search Console/SNS の管理画面側で手を動かす必要がある作業。Wave 1〜6 の打ち手の補完。

---

## ① GA4 — 内部トラフィック除外（P0-7）

**目的**: `/admin/*` 訪問が GA4 に混入し、データを汚しているのを止める。

1. GA4 (https://analytics.google.com/) → きょうのこプロパティ
2. 管理 → データストリーム → きょうのこ web ストリームをクリック
3. **拡張計測機能** の歯車 → 詳細設定
4. **内部トラフィックの定義** → 「ルールを作成」
   - ルール名: `Admin Pages`
   - traffic_type 値: `internal`
   - 一致条件: `page_path 含む /admin`
5. 保存
6. 上に戻り **データ設定 → データフィルタ**
7. 「フィルタを作成」→ タイプ「内部トラフィック」
   - フィルタ名: `Exclude Admin`
   - フィルタ オペレーション: 「除外」
   - パラメータ値 `internal`
   - フィルタの状態: **有効**（最初は「テスト中」になるので「有効」に切り替え）
8. 保存

これで `/admin/*` ページの page_view / イベントが GA4 から除外される。**過去データは消えない**点に注意（フィルタは反映時点以降のみ）。

参考: https://support.google.com/analytics/answer/10104470

---

## ② Search Console — インデックスリクエストの週次運用

**目的**: 「検出 - インデックス未登録」73件を消化する。

毎週月曜の運用ルール:

1. Search Console → ページ → 未登録 → 「検出 - インデックス未登録」を開く
2. 上位 20 URL をピックアップ（impressions が多い順）
3. それぞれ「URL検査」→「公開URLをテスト」→「インデックス登録をリクエスト」
4. 同じ URL は 1 週間に 1 回まで（連続リクエストは無効化される）

参考: https://search.google.com/search-console/welcome

---

## ③ GA4 — カスタムディメンション登録

**目的**: `scroll_depth` / `pwa_install_prompt_action` / `affiliate_click` / `hero_cta_click` / `ab_assignment` のイベントパラメータを GA4 上で分析可能にする。

1. GA4 → 管理 → カスタム定義 → 「カスタムディメンションを作成」
2. 以下を **すべて** 登録（範囲: イベント）

| ディメンション名 | スコープ | イベント パラメータ |
|---|---|---|
| variant | イベント | variant |
| experiment_id | イベント | experiment_id |
| percent | イベント | percent |
| action | イベント | action |
| provider | イベント | provider |
| item_id | イベント | item_id |
| page_path | イベント | page_path |

3. 各ディメンションは登録してから集計に反映されるまで **24時間** かかる

---

## ④ GA4 — キーイベント（旧コンバージョン）に登録

**目的**: A/B テスト評価とアフィリエイトCTRをコンバージョン指標として可視化。

1. GA4 → 管理 → イベント → イベント一覧から該当イベントを選び「キーイベントとしてマーク」
   - `hero_cta_click`
   - `affiliate_click`
   - `pwa_install_prompt_action`（`action=accepted` のみ望ましいがGA4はパラメータ条件キーイベントが弱いので暫定で全マーク）

---

## ⑤ Search Console — Pinterest 連携の確認

**目的**: Pinterest からの流入を取りに行く前提整備。

1. https://www.pinterest.jp/ で「ビジネスアカウント」化
2. **ドメインの確認** → kyounoko.jp の TXT レコード or meta タグで認証
3. 認証後、各記事の OGP image が Pinterest で Rich Pin（recipe / article）になる

実投稿運用は次フェーズで。月10ピンの単純運用で成立する。

---

## ⑥ Instagram — Bio URL を /start に変更

**目的**: Instagram → 直URL 流入のエンゲージメントが平均0秒で詰まっている問題の解消。

`/start` という「初めての方へ」専用ランディングを作るか、当面は `/category/today-doko` など現実的な記事ハブに張り替える。

Bio URL 変更の手順:
1. Instagram アプリ → プロフィール → 編集
2. ウェブサイト欄を `https://kyounoko.jp/start` に変更
3. 投稿時、本文＋画像でリンク先を匂わせる（「Bio リンクから保存版へ」など）

---

## ⑦ Bing/Yahoo Webmaster Tools

きょうのこは Yahoo / Bing 流入が合計 27% と無視できない比率。

1. https://www.bing.com/webmasters でサイト登録
2. サイトマップを送信: `https://kyounoko.jp/sitemap.xml`
3. IndexNow API キーは既に postbuild に組み込み済 → 自動 ping される

Yahoo は Bing 検索を使っているので、Bing Webmaster Tools 一本で兼用できる。

---

## ⑧ Vercel — 5xx エラー 9件の調査

Search Console が 5xx を 9件報告している。Vercel ダッシュボードで該当 URL のログを確認。

1. Vercel → kyounoko-web プロジェクト → Logs
2. Status code: 500 / 502 / 504 で絞り込み
3. 該当 URL を Search Console と突合
4. コールドスタート由来なら気にしない、特定エンドポイントの問題なら対処
