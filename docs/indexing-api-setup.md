# Google Indexing API セットアップ

リメギフ手法 Tier 1 #2「Indexing API でインデックス申請」を kyounoko に適用する手順。
**1日 200 URL のクォータ**だが、Google から直接「このURLを再クロールしてほしい」と
依頼できる唯一の API。再クロール促進＆インデックス未登録の解消に最も効くレバー。

---

## 全体像

```
[Google Cloud Console]            [Search Console]                  [本リポ]
       │                                  │                                │
       │  ① Indexing API を有効化         │                                │
       │  ② Service Account 作成          │                                │
       │  ③ JSON キー発行                 │                                │
       │                                  │                                │
       │                              ④ 「所有者」追加                      │
       │                              （SA メールアドレス）                   │
       │                                  │                                │
       │                                  │         ⑤ JSON を環境変数に    │
       │                                  │         ⑥ node 実行             │
       │                                  │         ⇒ Indexing API POST    │
       v                                  v                                v
```

---

## ① Google Cloud Console: API 有効化

1. https://console.cloud.google.com/ を開く（service@remegift.jp で）
2. 既存プロジェクト（remegift で作ったもの）を選択、または新規作成
   - 推奨: **同じ Service Account を kyounoko と remegift で共有**。
     ただし Search Console 側で「所有者」を kyounoko にも追加する必要あり。
3. ハンバーガー → 「APIとサービス」→ 「ライブラリ」
4. "Indexing API" を検索 → 「有効にする」

## ② Service Account 作成（remegift で既に作ってあれば再利用）

> remegift 用に作った Service Account があれば、新規作成は不要。
> JSON キーをそのまま使い、Search Console 側に kyounoko 所有者として追加するだけ。

新規に作る場合:

1. 「APIとサービス」 → 「認証情報」
2. 「認証情報を作成」 → 「サービスアカウント」
3. 名前: `kyounoko-indexing-bot`（任意）
4. ロール: 設定不要（Indexing API は Service Account メール単位で SearchConsole 側が認可）
5. 完了 → 一覧に追加された SA をクリック → 「キー」タブ → 「鍵を追加」→ JSON
6. ダウンロードされた `.json` ファイルを安全な場所に保管（**Git にコミット禁止**）

Service Account のメール例: `kyounoko-indexing-bot@<project-id>.iam.gserviceaccount.com`

## ③ Search Console に SA を「所有者」として追加

1. https://search.google.com/search-console を開く
2. プロパティ選択: `https://kyounoko.jp/`（**ドメインプロパティ推奨**）
3. 「設定」 → 「ユーザーと権限」 → 「ユーザーを追加」
4. メール: 上記 SA のメールアドレス
5. 権限: **「所有者」**（Owner）必須。Full / Restricted では Indexing API 不可。
6. 追加

**注意**: SA は確認手続き不要。所有者付与だけで API 利用可能になる。

## ④ ローカル環境変数の設定

JSON ファイルを `~/.config/google/kyounoko-indexing.json` 等に置く（リポジトリ外）。

### .env.local（リポジトリ直下、Git ignore 済）

```bash
# 絶対パス推奨
GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH=/Users/nagaminehideki/.config/google/kyounoko-indexing.json
```

または、CI で使う場合は JSON 文字列をそのまま渡す:

```bash
export GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

## ⑤ キューを作って送信

```bash
cd ~/Developer/kyounoko-web

# A) updatedAt=今日 のものだけ（推奨・Tier 1 #1 とセット）
node scripts/indexing-build-queue.mjs --max=180 --kind=touched

# B) 全 article URL（lastmod 古い順から再クロール促進）
node scripts/indexing-build-queue.mjs --max=180 --kind=articles

# C) sitemap.xml 全体（駅×条件などプログラマティックSEO含む）
node scripts/indexing-build-queue.mjs --max=180 --kind=all

# ドライラン確認
node scripts/request-indexing.mjs --dry

# 実送信（1リクエスト約250msスリープ、180URL ≒ 1分弱で完了）
node scripts/request-indexing.mjs
```

成功すれば `docs/indexing-submitted.log` にURL一覧が追記され、`docs/indexing-queue.txt` から消える。

## ⑥ 効果確認（送信から 1〜3 日後）

Search Console:

- 「URL検査」で個別URLの「最終クロール日時」を確認 → API送信後の日時になっていればOK
- 「ページ」レポートの「インデックス登録済み」が増えているか
- 「インデックス未登録」 → 「クロール済み - インデックス未登録」が減っているか

---

## クォータ

| 項目 | 上限 |
|---|---|
| 1日あたりの publish | 200 リクエスト |
| 1分あたり | 600 リクエスト |
| 1リクエストあたり | 1 URL（バッチ非対応） |

200/日 を超える場合は申請で増枠可能。kyounoko の 5,283 URL を完全カバーするには
理論上 27 日かかるが、実際は「Indexing API はクロール促進のシグナル」なので
**全URL送る必要はない**。優先度の高い URL に絞る運用が推奨。

## おすすめ運用

- **週1〜2回**、`--kind=touched` で前回触れたURLを送信
- **月1回**、`--kind=articles` で全 article URL を巡回送信
- **新規ページ追加時**は即送信（200/日上限内なら）

## トラブルシューティング

| エラー | 原因 | 対処 |
|---|---|---|
| 401 Unauthorized | SA メール未登録 / 権限が「所有者」でない | Search Console で「所有者」付与 |
| 403 Forbidden | API 未有効 / scope ミス | Google Cloud で Indexing API 有効化 |
| 429 quota exceeded | 200/日 超過 | 翌日まで待つ |
| 400 INVALID_ARGUMENT | URL が登録プロパティ配下でない | ドメインプロパティ追加 |

---

## 関連

- IndexNow (Bing/Yandex): `docs/indexnow-setup.md`
- リメギフ手法の出典: `kyounoko-migration-playbook.md` Tier 1 #2
