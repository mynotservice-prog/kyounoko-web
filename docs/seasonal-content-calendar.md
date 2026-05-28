# 季節企画カレンダー 2026〜

母の日記事（83ユーザー単月）の再現を狙うための、年間季節企画ストック。各テーマで「[年]年版 ○○○ 子供 [手作り|プレゼント|スポット] 20選」フォーマットで執筆する。

## 2026-05-28 追加：構造化＆自動IndexNow送信

季節企画を **lib/seasonal-calendar.ts** に中央データ化し、ホームに「今月の特集」セクションを追加。
さらに月初に `scripts/seasonal-indexnow.mjs` を実行することで、今月＋翌月の特集記事を自動でIndexNow送信する仕組みを構築。

### 関連ファイル

- `lib/seasonal-calendar.ts` — 中央データ（月→特集・スラッグ）
- `components/top/SeasonalHighlight.tsx` — HOME表示コンポーネント
- `scripts/seasonal-indexnow.mjs` — 月初実行のIndexNow送信スクリプト
- `docs/seasonal-content-calendar.md` — このドキュメント

### 月初の運用

毎月1日に `node scripts/seasonal-indexnow.mjs` を実行 → 今月＋翌月の特集記事をBing/Yandexに通知。

### 新規記事追加時のチェックリスト

新しく季節関連記事を書いたら：

- [ ] `lib/seasonal-calendar.ts` の該当月の `slugs` に追加
- [ ] `scripts/seasonal-indexnow.mjs` の SEASONAL マップにも追加（libと同期）
- [ ] IndexNow 送信
- [ ] 該当ピラーページから内部リンク

## 着手タイミングのルール

- 記事公開は **本番イベントの 6〜8 週間前** （Google にインデックスされる時間 + ロングテール拾われる時間を考慮）
- 公開後、本番週は内部リンクをホーム/カテゴリトップに動的に最上段表示
- 翌年は前年版の URL を保ったまま「【YYYY年版】」を最新年に書き換え（slug は不変、redirect 不要）

## 年間カレンダー

| 月 | 季節キーワード（候補slug） | 公開推奨日 |
|---|---|---|
| 6月 | 父の日プレゼント手作り（chichinohi-purezento-kodomo-tedukuri 既存） | 4月下旬 |
| 6月 | 梅雨の室内遊び0-6歳（tsuyu-ie-asobi） | 4月末 |
| 6月 | 梅雨のおでかけ屋内スポット東京（tsuyu-indoor-tokyo） | 4月末 |
| 7月 | 七夕飾り手作り子ども（tanabata-kazari-tedukuri-kodomo 既存） | 5月末 |
| 7月 | 夏休み準備チェックリスト（natsuyasumi-junbi-list） | 6月中旬 |
| 7月 | プール持ち物・乳幼児向け（pool-mochimono-yoji） | 6月中旬 |
| 8月 | 夏祭り子連れガイド東京（natsumatsuri-kodzure-koryaku 既存） | 6月末 |
| 8月 | お盆帰省のコツ・新幹線/飛行機（obon-kisei-kodzure-tips） | 7月初旬 |
| 8月 | 子供の虫除けスポット選び方（tokyo-kodomo-mushiyoke-spot 既存／更新） | 7月初旬 |
| 9月 | 敬老の日プレゼント子ども手作り（keirou-purezento-kodomo-tedukuri） | 7月末 |
| 9月 | 運動会お弁当キャラ弁（undoukai-bento-kyaraben） | 8月初旬 |
| 10月 | ハロウィン仮装子供手作り（halloween-kasou-kodomo） | 8月末 |
| 10月 | 芋掘りスポット関東子連れ（imohori-kanto-kodzure） | 9月初旬 |
| 11月 | 七五三お祝い準備（shichi-go-san-junbi） | 9月末 |
| 11月 | 紅葉スポット関東子連れ（kouyou-kanto-kodzure） | 9月末 |
| 12月 | クリスマスプレゼント年齢別（christmas-purezento-toshi-betsu） | 10月末 |
| 12月 | 年末年始旅行子連れ（nenmatsu-nenshi-ryokou-kodzure） | 10月末 |
| 1月 | お年玉相場・教育ルール（otoshidama-soba-kyouiku） | 11月末 |
| 1月 | 雪遊びスポット関東子連れ（yukiasobi-kanto-kodzure） | 11月末 |
| 2月 | 節分手作り装飾豆まき（setsubun-tedukuri-kodomo） | 12月末 |
| 2月 | バレンタイン子供手作りお菓子（valentine-kodomo-okashi） | 12月末 |
| 3月 | ひな祭り飾り手作り（hinamatsuri-kazari-tedukuri） | 1月末 |
| 3月 | 入園準備チェックリスト（youchien-nyuuen-junbi-list 既存／更新） | 1月末 |
| 3月 | 卒園プレゼント先生に（sotsuen-purezento-sensei） | 1月末 |
| 5月 | 母の日プレゼント子ども手作り（hahanohi-purezento-kodomo-tedukuri 既存／更新） | 3月末 |
| 5月 | こどもの日キャラ弁（kodomo-no-hi-kyaraben 既存／更新） | 3月末 |

## 内部ルール

- 公開時に **3つの内部リンク先**を必ず張る:
  1. 同テーマの前年版（あれば）
  2. 関連カテゴリトップ
  3. 関連の困った別解タグ
- IndexNow ping は postbuild に組み込み済 → 公開後すぐ Bing/Yandex 通知
- Google には Search Console の「URL検査 → インデックスリクエスト」を **公開当日に手動で**実行
