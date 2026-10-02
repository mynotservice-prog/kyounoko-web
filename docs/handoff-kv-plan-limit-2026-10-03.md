# 引き継ぎ: Upstash KV が固定プラン上限で停止（2026-10-03）

ブランチ `claude/loving-newton-i14iux`（未マージ）。このファイルが入口。

## 症状と確定した原因

- `/admin/spots/edit` で保存すると「❌ kv write failed」。どのスポットでも同じ。
- Vercel Logs（2026-10-02 23:14 JST ほか）:
  ```
  [kv] get failed spot:overrides ERR This database has reached current Fixed plan limits. Please upgrade manually or enable auto upgrade on Upstash Console, command was: [["get","spot:overrides"]]
  [kv] set failed spot:overrides ERR This database has reached current Fixed plan limits. ...
  ```
- **get も set も止まっている**。保存APIだけでなく、`GET /spot/*` でも毎回 `[kv] set failed` が出ている（`lib/reviews.ts` の `computeRating` が評価キャッシュを書こうとして失敗し続けるため）。
- **どの上限（Bandwidth / Storage / Commands）かは未確認。** Upstash Console → 該当DB → Usage で要確認。

## 本番への影響（いま起きていること）

- KV が読めないと `getRuntimeSpotOverrides()` は `lib/spot-overrides.json`（バンドル。**最終更新 2026-09-04**）にフォールバックする。9/4 以降に管理画面で入れた編集は、unstable_cache が切れたページから順に古い内容に戻って表示されうる。
- 同じ構造で、イベント上書き（`lib/event-overrides.ts`）と記事上書き（`lib/articles.ts` の `ARTICLE_OVERRIDES_KV_KEY`）も影響を受ける。
- 口コミの投稿・レート制限（`lib/reviews.ts`）も KV 依存。

## 上限に当たった構造的な理由（見立て）

- スポット上書きは **全スポット分を1キー `spot:overrides` に1つのJSONで保存**（バンドル版で約1.47MB。faq 33万B・ageGuide 30万B が大半）。
- 読む側: `app/spot/[slug]`, `app/spots`, `app/spots/[cat]`, `app/area/[slug]`, `app/search`, `app/favorites`, `lib/spot-ranking.ts`, `lib/purpose-rankings.ts` がすべて `getRuntimeSpotOverrides()` で **1.4MBを丸ごと get**。unstable_cache（タグ `spot-overrides`）が切れるたび・リージョンごとに丸ごと転送。
- 書く側: 1スポット保存でも 1.4MB を丸ごと set（`app/api/admin/spot-overrides/route.ts`）。
- → 月間 Bandwidth 上限が最有力。ストレージ・コマンド数の可能性も残る。

## ブランチにある未マージの修正（f4b195036）

- `lib/kv-store.ts`: `kvSet` の失敗理由を保持（`getLastKvSetError()`）、読み込み失敗と「キー無し」を区別する `kvGetStrict()` を追加。
- `lib/spot-overrides.ts`: `readSpotOverridesForWrite()` を strict 読みにし、失敗時は例外。**以前は読み込み失敗→バンドルで代用→保存で KV 全体を 9/4 のバンドルで上書きして編集が消える事故が起こりえた。**
- `app/api/admin/spot-overrides/route.ts`: 読み込み失敗は 503 で保存中止、書き込み失敗は理由と保存サイズを画面に返す。
- `npx tsc --noEmit` は通過。同じ「読み込み失敗→バンドルで上書き」の穴が `lib/event-overrides.ts`（`readEventOverridesForWrite` 相当）と `lib/articles.ts` の記事上書き保存にもあるので、同じ直し方を当てる。

## 次にやること（推奨順）

1. **Upstash Console で超えた上限を特定**（Usage）。即時復旧はプラン変更か auto upgrade（費用発生。社長判断）。Bandwidth なら請求サイクルで戻る。
2. **復旧したらすぐ KV の中身をバックアップ**（`spot:overrides` / イベント / 記事上書き）。バンドルJSONは 9/4 で止まっており、KV が唯一の最新版。リポジトリが公開なので、バックアップはリポジトリに入れない。
3. **根本対策: `spot:overrides` を分割**。例: Redis Hash（`HSET spot:ov <slug> <json>`）にして、
   - スポット詳細は `HGET` で自分の分だけ読む
   - 一覧系はカード表示に要る軽い項目だけ（name / category / images / budget 等）を別キーに持つ
   - 保存は該当 slug の `HSET` のみ
   移行時は旧キーからの一括移し替えスクリプトと、読めないときのフォールバック順を決める。
4. `lib/reviews.ts` `computeRating`: 書き込み失敗時に毎リクエスト set を試みない（評価0件は書かない、など）。
5. f4b195036 と 3・4 をまとめて main へ。**CLAUDE.md の Vercelインフラ費ガード対象**（データキャッシュ・読み込み経路の変更）なので、コミットメッセージに費用影響の見立てを書き、デプロイ後72時間以内に Vercel と Upstash の Usage で実測突合する。

## 同じブランチの関連（同日分）

- `reports/kv-fix-list-2026-10-02.{md,xlsx}`: KV で直す料金の修正リスト（23件）。**KV 復旧までは保存できない**。「今の表示」列は本番の表示から取ったもので、KV が読めずバンドルにフォールバックした表示が混ざっている可能性あり。復旧後に KV の実値と照合してから使う。
- `docs/spot-authoring-standard.md`: スポット新規作成の粒度基準（お手本 Kids Base）。
- 予約済み: `trig_013UP8ydNrFGtC41VpE8zkps`（10/3 12:30 JST、PR #289 の IndexNow 送信。KV とは無関係）。
