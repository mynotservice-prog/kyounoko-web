# 金曜配信テンプレ 第15〜20週分（2026-09-25〜10-30・コピペ用完成原稿）

- 前作 `line-friday-w5-w14-2026.md`（第5〜14週）の続き。型・文体・utm規則は同一。
- 各原稿はそのまま1吹き出しで送る（200〜300字）。URLは実在ページ＋utm付き（`utm_source=line&utm_campaign=friMMDD`）。
- **運用メモ**: 配信前に当該週の実際の天気予報を見て、導入1行と3択の順番だけ差し替える（雨予報なら雨リンクを先頭に）。
- **⚠️通数注意**: 2026年10月は金曜が5回ある月（2・9・16・23・30）。友だち40人超なら launch-kit §2-2 の間引きルールを適用。**落とすなら第18週10/16が候補**（第17週=3連休直前、第19週=ハロウィン準備、第20週=ハロウィン当日直前はいずれも落とさない）。
- **リンク検証**: 本バッチの全URLは2026-08-16に本番へHTTPリクエストして200を確認済み。`lib/article-redirects.ts` との衝突が無いことも確認済み。
- **noindex記事について**: `undoukai-obento-jitan-recipe` と `yobou-sesshu-schedule-0-6sai` は noindex（検索非登録）だがページは200で生きている。LINEは検索流入ではなく直リンクなので使って問題ない（第13週で `kouen-kozure-mochimono` を使ったのと同じ扱い）。

## 配信は「金曜20:00・手動予約配信」に一本化済み（2026-08-16 決定）

以前は cron `/api/cron/line-weekend` が毎週金曜20:00 JSTに自動broadcastしており、本ファイルの原稿を予約配信すると**同じ金曜に2通**届いて無料枠200通/月を倍速で消費する状態だった。

社長判断で**cronの自動配信を停止**（`vercel.json` から当該行を削除）し、**本ファイルの手書き原稿を予約配信する運用に一本化**した。時刻は実配信に合わせて**17:00 → 20:00 に統一**（`line-launch-kit.md` §1・§2-1、`components/common/LineCta.tsx` のサイト表記も修正済み）。

したがって**本ファイルの原稿は、毎週金曜20:00に予約配信する**。

⚠️ **LINE公式アカウントの「あいさつメッセージ」だけは管理画面にしか無い**ので、「毎週金曜17:00に」と書いてある箇所を20:00に手動で直すこと（リポジトリ側を直しても本番の挨拶文は変わらない）。

## ⚠️ 作成時の申し送り（2026-08-16 実測）

前バッチ末尾の指示「GSC/LINEの反応（utm_campaign別の流入）を見て当たった型に寄せる」を実行したが、**寄せる先が無かった**。

GA4（property 533628127・`sessionSource=line`・2026-06-15〜08-16）の実測は**全6セッション**：

```
   1 (not set)    /
   1 (not set)    /events
   1 (not set)    /spots
   1 (not set)    /today
   1 (not set)    /today?weather=rain&place=home
   1 fri0731      /article/indoor-cool-spots-kodzure-2026natsu
```

`fri*` campaign が付いたセッションは**第7週(7/31)の1件のみ**。第1〜14週の原稿の当たり外れは統計的に判定不能。

つまり**律速は原稿の質ではなく友だち数**。原稿を厚くしても到達が増えないので、本バッチは前バッチの型をそのまま踏襲し、内容の実験はしていない。次に投資すべきは原稿ではなく友だち獲得導線（`components/common/LineCta.tsx` の露出面）。

## 第15週（9/25配信）運動会シーズン

```
こんばんは、きょうのこ。です🌱
運動会シーズンですね。今週末に控えているご家庭も🏃

【運動会の3択】

📋 まず何から準備する？ → 親の事前準備リスト（服装・場所取り・撮影）
https://kyounoko.jp/article/undoukai-9gatsu-oya-junbi-list?utm_source=line&utm_campaign=fri0925

🍱 お弁当がしんどい人へ → 時短レシピ8品（前日仕込みOK）
https://kyounoko.jp/article/undoukai-obento-jitan-recipe?utm_source=line&utm_campaign=fri0925

🍂 運動会がない週末は → 秋の自然遊び10選（どんぐり・落ち葉）
https://kyounoko.jp/article/aki-iro-asobi-kodomo?utm_source=line&utm_campaign=fri0925

場所取りはゴール正面より、入退場門のそばが撮りやすいです☺️
```

## 第16週（10/2配信）衣替え・芋掘り解禁

```
こんばんは、きょうのこ。です🌱
10月に入りました。衣替えと芋掘りの季節です🍠

【10月はじめの3択】

👕 衣替えのついでに → 子供服の収納と「手放す基準」
https://kyounoko.jp/article/koromogae-kodomofuku-shuunou-shobun?utm_source=line&utm_campaign=fri1002

🍠 芋掘りに行くなら → 東京で予約不要の農園／予約が要る農園
https://kyounoko.jp/article/imohori-kanto-kodzure?utm_source=line&utm_campaign=fri1002

📍 まだ決めてないなら → 条件で探せるスポット一覧
https://kyounoko.jp/spots?utm_source=line&utm_campaign=fri1002

サイズアウトした服は今のうちに出すと、来年がラクです☺️
```

## 第17週（10/9配信）スポーツの日3連休

```
こんばんは、きょうのこ。です🌱
明日から3連休（10/10〜12）。月曜はスポーツの日です🏅

【3連休の3択】

🍠 芋掘りに行く人は → 持ち物と服装（汚れ方が想像の3倍）
https://kyounoko.jp/article/imohori-kodzure-mochimono-fukusou?utm_source=line&utm_campaign=fri1009

🗓 予定が白紙なら → 年齢と天気から1日プランを作る
https://kyounoko.jp/today?utm_source=line&utm_campaign=fri1009

☔ 雨の連休になったら → 雨の日OK屋内スポット15選
https://kyounoko.jp/article/amenohi-indoor-spots-tokyo-15?utm_source=line&utm_campaign=fri1009

長靴と着替え一式、車に積んでおくと安心です☺️
```

## 第18週（10/16配信）七五三準備・体調管理

```
こんばんは、きょうのこ。です🌱
朝晩が冷えてきました。11/15の七五三も、そろそろ準備の時期です👘

【今週の3択】

👘 七五三が今年の人は → 服装・写真・お参りの完全ガイド
https://kyounoko.jp/article/shichigosan-fukusou-shashin-kanzen?utm_source=line&utm_campaign=fri1016

💉 インフルの予防接種は → 0〜6歳の接種スケジュール一覧
https://kyounoko.jp/article/yobou-sesshu-schedule-0-6sai?utm_source=line&utm_campaign=fri1016

🍂 秋の過ごし方に迷ったら → 3〜6歳の秋、行事ラッシュの乗り切り方
https://kyounoko.jp/article/aki-3-6sai-sugoshikata?utm_source=line&utm_campaign=fri1016

写真スタジオの土日は10月中に埋まります。予約はお早めに☺️
```

## 第19週（10/23配信）ハロウィン準備週

```
こんばんは、きょうのこ。です🌱
ハロウィンまであと1週間。仮装の準備はお済みですか🎃

【ハロウィン準備の3択】

🎃 衣装をこれから作るなら → 100均で作れる仮装・飾り15アイデア
https://kyounoko.jp/article/halloween-kasou-junbi?utm_source=line&utm_campaign=fri1023

🍬 イベントに行くなら → 子連れハロウィンイベント東京10選
https://kyounoko.jp/article/halloween-kodzure-events-2026?utm_source=line&utm_campaign=fri1023

🍄 今週末どこか行くなら → 雨でも行けるきのこ狩り3選
https://kyounoko.jp/article/kinokogari-kanto-kodzure?utm_source=line&utm_campaign=fri1023

予約が要るイベントは今日明日が締切のことが多いです☺️
```

## 第20週（10/30配信）ハロウィン当日直前

```
こんばんは、きょうのこ。です🌱
明日はハロウィン当日（10/31・土）です🎃

【ハロウィン当日の3択】

👻 まだ間に合う衣装は → 手作り衣装・飾り・おうちパーティのアイデア
https://kyounoko.jp/article/halloween-isho-tedukuri-kazari-kodomo?utm_source=line&utm_campaign=fri1030

📅 近くの催しを探すなら → 今週末のイベント一覧
https://kyounoko.jp/events?utm_source=line&utm_campaign=fri1030

👘 次の行事は11/15 → 七五三の準備ガイド（3歳・5歳・7歳）
https://kyounoko.jp/article/shichigosan-nenrei-junbi?utm_source=line&utm_campaign=fri1030

小さい子はお菓子より「配る側」が楽しいこともあります☺️
```

---

**次バッチの作成タイミング**: 第20週の配信予約を入れる頃（10月下旬）に、11〜12月分（七五三本番・紅葉・クリスマス・年末年始）を作成する。

**ただし作成の前に友だち数を確認すること。** 上の申し送りのとおり、2026-08時点でLINE経由の到達はほぼゼロ。友だちが増えていなければ、原稿を6本増やすより `LineCta` の露出面を増やすほうが先。
