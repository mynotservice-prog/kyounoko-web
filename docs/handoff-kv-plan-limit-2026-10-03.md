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

---

## 追記（2026-10-03 ローカルセッション）

### 上限の特定（Upstash Console で確認済み）

- プランは **Free**。停止理由は **月間 Bandwidth 上限**（`Database is suspended due to monthly bandwidth limit`）。
- 使用量: Bandwidth **18GB / 10GB**、Commands 4万 / 50万（Reads 40,190・Writes 3）、Storage 6MB / 256MB。
  → 1回の読み込みが平均約450KB。小さい rating/reviews の読み込みに混じって、1MB超の上書きマップの読み込みが大量にある。
- 日別転送量（UTC、目盛りからの目視）: 9/28(月) 約11GB・9/29(火) 約5GB・9/30(水) ほぼ0・10/1(木) 約8GB・10/2(金) 約2.5GB（途中で停止）。
  本番デプロイ数（UTC）: 9/28=2・9/29=1・9/30=0・10/1=4・10/2=2。**デプロイ0回の水曜は転送ほぼ0**＝転送はアクセス数でなくデプロイに連動。
- Free の上限はコンソール表示で Bandwidth 10GB/月。Pay as You Go は Bandwidth 欄が Unlimited、$0.2/10万コマンド。リセット日はコンソールに表示がなく未確認。

### 見立ての更新

- 主因は「1キー1.4MB」そのものより、**`next build` の静的生成で unstable_cache がページ間で効かず、数千ページが上書きマップを1ページずつ KV から読み直していた**こと（スポット詳細は generateMetadata と本体で2回）。1デプロイあたり4〜5GB と合う。**ビルド中の読み込み回数そのものは未計測**（ローカルに KV 資格情報が無いため）。
- 停止後の本番ログ（2日分・失敗2,000行）の内訳は get rating 1,294・get reviews 376・ugcImage 21（/spot/*）と、管理画面の spot:overrides get 160・set 80。/spot/* からの spot:overrides 読み込み失敗は出ていない＝実行時はデータキャッシュが効いている。
- もう1つの穴: unstable_cache の中で KV 失敗→バンドルを返すと、**その古い値がデータキャッシュに残り、KV が復旧しても戻らない**（データキャッシュはデプロイを跨いで残る）。

### この回で入れた修正（未コミット・worktree `../kyounoko-kv`）

- `lib/kv-store.ts` `kvGetForCache()`: unstable_cache の中から使う読み込み。失敗は例外（フォールバック値をキャッシュに残さない）。`NEXT_PHASE=phase-production-build` の間はプロセス内で1キー1回だけ読む（失敗は記憶しない）。偽KVサーバーで確認: ビルド時は10回呼んでKVコマンド1回、通常時は従来どおり、失敗後は復旧時に読み直す。
- `lib/spot-overrides.ts` / `lib/event-overrides.ts` / `lib/articles.ts`: 実行時取得を「キャッシュ内は kvGetForCache、失敗時のフォールバックはキャッシュの外」に変更。イベント・記事の保存用読み込みも strict 化（読めなければ例外）。
- 管理API（spot-overrides GET / event-overrides GET・POST / edit-content GET・POST・flush）: 読めないときは 503 で保存中止。書き込み失敗は理由を返す。
- `lib/reviews.ts` `computeRating`: 口コミが読めないときは rating を書かない。
- `tsc --noEmit` 通過。`next build` は未実施。

### Hash 分割（旧 推奨3）は保留にした理由

ビルド時の読み直しを止めれば、1デプロイあたりの読み込みはワーカー数×数キー程度（数十MB）に下がる見込みで、データ移行を伴う Hash 化より小さい変更で済む。デプロイ後の Upstash 日別転送量で効果を確かめ、下がらなければ Hash 化に進む。

### 復旧時の手順

1. KV 再開（Pay as You Go へ切替＝社長判断、または月次リセット待ち）。
2. すぐバックアップ（spot:overrides / event:overrides / article:overrides / reviews:* ほか全キー。リポジトリ外へ。口コミは個人情報を含みうる）。
3. 停止中に古いバンドルがデータキャッシュに入った可能性があるので、管理画面でスポット・イベント・記事をそれぞれ1件ずつ保存して revalidateTag を発火させる（デプロイではデータキャッシュは入れ替わらない）。
4. この修正を main へ。コミットメッセージの費用影響の見立て（案）: 「Vercel: 変更なし（ISR・revalidate・キャッシュ設定は不変、関数呼び出し回数も不変）。Upstash: ビルド中の上書きマップ読み込みを1ページ1回→1プロセス1回にし、1デプロイあたり約4〜5GB→数十MBの見込み。KV停止中は実行時にキャッシュされず毎回KVを試すが、失敗応答は数百バイト」。デプロイ後72時間以内に Upstash の Daily Bandwidth と Vercel Usage を突合する。
