# 引き継ぎメモ Part 2（2026-05-19夜 追加分）

Part 1（`handover-2026-05-19.md`）のコミット後に追加で進めた作業のまとめです。**コミット 925f444 までは push 済み**、その後の作業はローカルに未コミットで残っています（自動cycleタスクと競合して git lock が再発したため）。

## 1. push 済み（コミット 925f444）

### Task #42: 駅×条件ページ +1,179ページ追加
- `STATION_CONDITIONS` に spot 系3条件を追加: `asobiba` / `kouen` / `ame-asobiba`
- restaurant 系と spot 系を `ConditionKind` で分岐
- `getSpotsForStation` で nearestStation完全一致 → ward同一の順に取得
- 駅 × 11条件 で **計 4,566 ページ** 生成（restaurant 3,387 + spot 1,179）
- 3件未満は noindex で薄ページ対策

## 2. ローカル未コミット（手動でコミットお願いします）

### Task #43: spot系を全駅対応に拡張
- `lib/station-spots.ts` の region フォールバックを Tokyo以外（Kanagawa/Kansai/Saichi）にも対応
- `generateMetadata` と `sitemap.ts` も非Tokyo駅 spot 系を含めるよう更新
- +200ページ（Kanagawa 69 + Kansai 41 + Saichi 90）
- **合計 4,766 ページ** に拡大

### Task #44: IndexNow 自動化
- `public/c68e60e8f4b025a51c97f20076ce5c09.txt` — Bing/Yandex 認証キー
- `scripts/indexnow-build-queue.mjs` — URLキュー生成
- `scripts/indexnow-submit.mjs` — Bing/Yandex POST送信
- `docs/indexnow-setup.md` — 詳細手順
- スケジュールタスク `kyounoko-indexnow-weekly`（毎週月曜 6:00）作成済み
- 試験送信実施: Yandex `202 Accepted`、Bing `403 SiteVerificationNotCompleted`（デプロイ後に解消）

## 3. コミット手順

自動 cycle が走っている時間帯に git lock が発生しやすいので、cycle と被らない時間（毎時奇数分以降）に実行してください。

```bash
cd /Users/nagaminehideki/Developer/kyounoko-web

# 1. orphan tempファイル削除（auto-cycleが残した .md.x.* を掃除）
find content/articles -name '*.md.x.*' -delete

# 2. lock 削除（あれば）
rm -f .git/index.lock

# 3. 状態確認
git status --short

# 4. コミット&push
git add -A
git commit -m "feat(seo): spot系全駅対応 + IndexNow自動化"
git push origin main
```

## 4. デプロイ後に1回だけ実行

Vercelデプロイ完了後、認証キーファイルが本番に反映されているか確認してから、IndexNow を本番送信:

```bash
# 1. キーファイル確認
curl -sI https://kyounoko.jp/c68e60e8f4b025a51c97f20076ce5c09.txt
# → HTTP/2 200 が返ればOK

# 2. 駅×spot系の新規URLをIndexNowに送信
node scripts/indexnow-build-queue.mjs --max=9000 --kind=spots
node scripts/indexnow-submit.mjs
# → Bing と Yandex の両方が 200/202 を返せば成功
```

## 5. Google Search Console（手動・優先度高）

IndexNow は Google非対応なので、以下を手動で:

1. https://search.google.com/search-console にログイン
2. プロパティ `kyounoko.jp` を選択
3. **サイトマップ** → `https://kyounoko.jp/sitemap.xml` を送信（既にあれば「再送信」）
4. **URL検査** で主要な新URLを個別申請（1日10件まで）:
   - `https://kyounoko.jp/station/shibuya/asobiba`
   - `https://kyounoko.jp/station/shinjuku/asobiba`
   - `https://kyounoko.jp/station/tokyo/kouen`
   - `https://kyounoko.jp/station/ueno/asobiba`
   - `https://kyounoko.jp/station/ikebukuro/kouen`
   - `https://kyounoko.jp/station/yokohama/kouen`
   - その他、検索ボリュームの高い駅を優先

## 6. 10K clicks/日に向けた次の打ち手（未着手）

1. **被リンク獲得**: プレスリリース、メディア寄稿、Instagram連動
2. **キラー記事1本**: 月間検索10万超の中ワードでTop3を狙う
3. **動画コンテンツ**: YouTube連動でDiscover対応
4. **UGC・口コミ機能**: Firebase/Supabase で MVP

帰宅後にゆっくりお願いします。
