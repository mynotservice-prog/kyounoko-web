# IndexNow / Search Console 自動化セットアップ

新規追加された4,766ページ（駅×条件）をBing/Yandex経由で迅速にインデックス促進するための仕組み。Google は IndexNow非対応のため、sitemap更新と手動Inspectionで対応する。

## 構成

- `public/c68e60e8f4b025a51c97f20076ce5c09.txt` — IndexNow 認証キーファイル（ファイル名＝中身）
- `scripts/indexnow-build-queue.mjs` — 送信対象URLのキュー生成
- `scripts/indexnow-submit.mjs` — Bing/Yandex/Naver にPOST送信
- `docs/indexnow-queue.txt` — 送信予定URLのリスト（送信後はクリア）
- `docs/indexnow-submitted.log` — 送信履歴

## 初回セットアップ（Vercelデプロイ後に1回だけ）

```bash
cd /Users/nagaminehideki/Developer/kyounoko-web

# 1. キーファイルが本番に公開されているか確認
curl -sI https://kyounoko.jp/c68e60e8f4b025a51c97f20076ce5c09.txt
# → HTTP/2 200 が返ればOK

# 2. spot系の新規URLをキューに生成
node scripts/indexnow-build-queue.mjs --max=8000 --kind=spots

# 3. Bing/Yandexに送信
node scripts/indexnow-submit.mjs
```

## 定期実行（推奨: 週1回 or 大量更新時）

```bash
# 全ページを送信（articles + plans + spot系。max=10000まで）
node scripts/indexnow-build-queue.mjs --max=9000 --kind=all
node scripts/indexnow-submit.mjs
```

## Google Search Console 側の対応

Google は IndexNow非対応。以下を行う:

1. **sitemap.xml** が `/sitemap.xml` で公開されている（自動更新）
2. **Search Console** にログインし、サイトマップ送信:
   - URL: `https://kyounoko.jp/sitemap.xml`
   - 既に送信済みなら、新しいURL一覧を生成して送り直し
3. **URL Inspection** で重要URLを個別に申請（1日10件程度）
   - 優先度高: 駅×spot 系の主要駅（渋谷、新宿、東京、上野、池袋、横浜、大阪駅 等）
   - 例: `https://kyounoko.jp/station/shibuya/asobiba` を inspect → 「インデックス登録をリクエスト」

## トラブルシューティング

- **403 SiteVerificationNotCompleted**: キーファイルがまだ本番に反映されていない。Vercelデプロイ後に再試行。
- **422 InvalidFormat**: URLが host と一致しない / 1リクエストで10,001件超え
- **429 TooManyRequests**: 1日10,000件超過、翌日にリトライ

## 認証キー（紛失時のため記録）

- **Key**: `c68e60e8f4b025a51c97f20076ce5c09`
- **KeyLocation**: `https://kyounoko.jp/c68e60e8f4b025a51c97f20076ce5c09.txt`
- 紛失したら別のランダム32文字を生成し、`public/<key>.txt` と `scripts/indexnow-submit.mjs` の KEY 定数を更新する
