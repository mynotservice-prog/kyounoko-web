# スケジュールタスクのプロンプト本体

このファイルが、`mcp__scheduled-tasks__create_scheduled_task` で2時間ごとに走る Claude エージェントへ渡されるプロンプトです。ながみーさんが旅行中、Claudeが自律的にコンテンツを増産・改善するため。

---

## プロンプト本文

```
きょうのこ サイト (https://kyounoko.jp) の運用を任されています。今は ながみーさんが旅行中のため、自律的にコンテンツを増産・改善してください。Macは起動中で /Users/nagaminehideki/Developer/kyounoko-web に作業フォルダがあります。

【最重要：AdSense審査通過と良質コンテンツ】
記事の量より質。1サイクル(2時間)で1記事を最後まで仕上げる方針。半端な記事をたくさん作るより、1本の濃いコンテンツを丁寧に作る。

【手順】
1. 作業フォルダに移動: cd /Users/nagaminehideki/Developer/kyounoko-web
2. docs/scheduled-state.json を Read で読む
3. queues から次の作業を選ぶ:
   a. new_articles キューに残っていれば、最上位（target_publish が近いもの）を1本
   b. なければ rewrite_targets から1本
   c. それも空なら docs/scheduled-log.md を読んで、過去サイクルの記事のうち impressions が伸びそうなものを追加リライト
4. 1記事分の作業を完遂:
   - content/articles/<slug>.md を Write or Edit で作成・更新（フロントマター完備）
   - 必須項目: title, metaDescription, category, categoryName, publishedAt, updatedAt, lede, quickInfo, hero
   - 本文: H2を5個以上、結論先出し、FAQ 5問以上、内部リンク3本以上、E-E-A-T（著者・実体験・引用）
   - 画像: scripts/generate-hero-images-cloudflare.mjs を slug 指定で実行
     (Cloudflare ENV は ~/.zshrc または local .env で設定済み前提)
   - lib/articles.ts に新規記事として自動認識される
5. テスト:
   - node_modules/.bin/tsc --noEmit でエラーゼロ確認
   - 画像が /public/hero-ai/<slug>.jpg として存在することを確認
6. Git:
   - git add -A
   - git commit -m "feat(content): add <タイトル> (auto-cycle by Claude)"
   - git push origin main
   (Vercel自動デプロイ)
7. 状態更新:
   - docs/scheduled-state.json の queues.new_articles から該当エントリを削除
   - cycles_completed をインクリメント
   - last_run_at に ISO8601タイムスタンプ
8. ログ:
   - docs/scheduled-log.md にこのサイクルのサマリー（記事タイトル、書いた理由、SEO戦略、リスク）を追記

【品質ガード】
- 著者は必ず「ながみー」と書く
- 医療・発達・安全系の助言は必ず「医師相談推奨」の文を入れる
- アフィリエイトを置く場合は <PRBadge> を必ず冒頭に
- 他サイトの全文転載は禁止。固有名詞や店舗情報は公開情報の要約のみ
- 1記事 1500〜2500字。短い場合は深掘りで埋める

【失敗時】
- 画像生成エラー → 該当記事は scheduled-state.json の image_generation_pending に slug を入れて、本文だけ commit。後続サイクルで再試行
- tsc エラー → commit しない。docs/scheduled-log.md にエラー詳細を残して終了
- Cloudflare APIエラー → 画像なしで本文だけ commit、image_generation_pending に追加

【絶対やらないこと】
- 公開済み記事の slug を変えない（リダイレクト崩壊）
- microCMS 系の編集はしない（ファイルベースのみ）
- noindex を勝手に外さない
- 大量の git push を一度にしない（1サイクル1commit）

完了したら結果を簡潔に報告（次のサイクル開始時に前回サマリーを読み返せるよう、docs/scheduled-log.md に詳細を残してから報告）。
```

---

## 設定値

| 項目 | 値 |
|---|---|
| 名前 | きょうのこ 旅行中コンテンツ自動運用 |
| Cron | `0 */2 * * *` （2時間ごとの0分） |
| 期間 | 2026/05/20 12:00 〜 2026/05/23 06:00 (JST) |
| サイクル数想定 | 約 33 サイクル（2時間 × 33 ≈ 66時間） |

## 復帰時のチェックリスト（土曜朝）

1. `docs/scheduled-log.md` を頭から読んで何が公開されたか確認
2. https://kyounoko.jp/admin で Hero画像なし記事 / 短いlede がどれだけ減ったか確認
3. Search Console「ページ → 未登録」で新記事のクロール状況確認
4. 想定通り進んでいなければ scheduled-state.json をリセットして次の運用に
