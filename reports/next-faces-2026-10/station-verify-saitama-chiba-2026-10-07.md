# 駅の実在店舗照合（松戸・流山おおたかの森・柏の葉キャンパス・浦和・所沢）2026-10-07

調査エージェントの報告をそのまま保存。公式店舗検索のみで判定。

5駅×56チェーンの照合が終わりました。未確認のチェーンは0で、駅前商業施設のうちキテミテマツドとプラーレ松戸だけ公式サイトのURLを特定できず設備が未確認です。ファイルは書いていません（作業用キャッシュはスクラッチパッドのみ）。

## 先に知っておくべき注意
- **距離区分は住所の町名・番地と公式APIの座標から私が判断したもの**で、地図上の実測はしていません。「境界」と書いた店は掲載前に地図で確認してください。
- **URLの型を私が組み立てただけで、開いて確認していないもの**があります: モス（`/shop/detail/?shop_cd=`）、CoCo壱（`/map/{key}/`）、デニーズ（`/map/{key}/`）、KFC（`/points/{id}`）、コメダ（`detail.html?id=`）、プロントの `detail/{storeCode}/`。ほかは一覧HTMLから抜いたか、開いて店名を確認しました。
- **日高屋は店名一覧（list.html）を駅名キーワードで拾った**ので、店名に地名が入らない店は拾えません。「無い」判定は他チェーンより弱いです。
- ロッテリアは `lotteria.jp` が `zetteria.jp` に転送され、店舗検索は `maps.zetteria.jp/shop/` の1本だけでした。ここに載る店は「ゼッテリア」として記録しています。
- しゃぶしゃぶ温野菜 浦和店は公式一覧の店名が「【10月9日オープン】」で、今日（10/7）時点では未開店です。

---

## 1. 松戸

### 1-1. 実在を確認できた店（30チェーン）
| チェーン | 店名（公式表記） | 住所 | 距離 | 館・階 | 公式URL |
|---|---|---|---|---|---|
| サイゼリヤ | サイゼリヤ キテミテマツド | 松戸市松戸1307-1 | 徒歩圏 | キテミテマツド11F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=1583 |
| ガスト | ガスト 松戸駅東口店 | 松戸市松戸1230-1 | 駅前 | ピアザ松戸7F | https://store-info.skylark.co.jp/map/018996/ |
| スターバックス | プラーレ松戸店 | 松戸市松戸1149-1 | 駅前 | プラーレ松戸（階の記載なし） | https://store.starbucks.co.jp/detail-1426/ |
| タリーズ | アトレ松戸店 | 松戸市松戸1181 | 駅前 | アトレ松戸5F | https://shop.tullys.co.jp/detail/1000659 |
| タリーズ | キテミテマツド店 | 松戸市松戸1307-1 | 徒歩圏 | 1階 | https://shop.tullys.co.jp/detail/5453110 |
| ドトール | ドトールコーヒーショップ 松戸東口店 | 松戸市松戸1226-5 | 駅前 | 桐林ビル2F・3F・4F | https://shop.doutor.co.jp/doutor/spot/detail?code=1010097 |
| ドトール | ドトールコーヒーショップ 松戸店 | 松戸市松戸1305-2 | 徒歩圏 | — | https://shop.doutor.co.jp/doutor/spot/detail?code=1010985 |
| マクドナルド | 松戸駅前店 | 松戸市松戸1230-1 | 駅前 | ピアザ松戸ビル3階 | https://map.mcdonalds.co.jp/map/12690 |
| モスバーガー | モスバーガー松戸駅東口店 | 松戸市松戸1178-8 | 駅前 | — | https://www.mos.jp/shop/detail/?shop_cd=02386 |
| 吉野家 | 吉野家 松戸西口店 | 松戸市本町20-2 | 駅前 | — | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_048395 |
| 吉野家 | 吉野家 松戸東口店 | 松戸市松戸1230-1 | 駅前 | ニュートウキョウセブンプラザ（公式表記） | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_048443 |
| 松屋 | 松屋 松戸店 | 松戸市本町1-18 | 駅前〜徒歩圏 | 第37東京ビル | https://pkg.navitime.co.jp/matsuyafoods/spot/detail?code=0000000125 |
| 松のや | 松のや 松戸店 | 松戸市本町4-4 | 駅前〜徒歩圏 | GK松戸ビル | https://pkg.navitime.co.jp/matsuyafoods/spot/detail?code=0000001220 |
| すき家 | すき家 松戸駅西口店 | 松戸市本町19-23 | 駅前 | 宝星ビル1F | https://maps.sukiya.jp/jp/detail/1810.html |
| はなまるうどん | はなまるうどん イトーヨーカドー松戸店 | 松戸市松戸1149 | 駅前 | 2Fフードコート | https://stores.hanamaruudon.com/hanamaru/spot/detail?code=2149 |
| リンガーハット | リンガーハット イトーヨーカドー松戸店 | 松戸市松戸1149 | 駅前 | イトーヨーカドー松戸2Fフードコート | https://shop.ringerhut.jp/detail/r1011/ |
| 日高屋 | 日高屋 松戸西口駅前店 | 松戸市本町20-16 | 駅前 | — | https://hidakaya.hiday.co.jp/hits/ja/shop/1/detail/559.html |
| 日高屋 | 日高屋 松戸東口店 | 松戸市松戸1176-1 | 駅前 | — | https://hidakaya.hiday.co.jp/hits/ja/shop/1/detail/186.html |
| 大阪王将 | 松戸西口店 | 松戸市本町3-13 | 駅前〜徒歩圏 | こべにビル1階 | https://www.osaka-ohsho.com/store/store_detail.php?shop_id=515 |
| ミスタードーナツ | 松戸東口ショップ | 松戸市松戸1-1225 | 駅前 | — | https://md.mapion.co.jp/b/misterdonut/info/0426/ |
| サンマルクカフェ | サンマルクカフェ プラーレ松戸店 | 松戸市松戸1149-1 | 駅前 | プラーレ松戸（階の記載なし） | https://www.saint-marc-hd.com/saintmarccafe/shop/826/ |
| ベローチェ | カフェ・ベローチェ 松戸店 | 松戸市本町5-9 | 駅前〜徒歩圏 | 浅野ビル1・2F | https://c-united.co.jp/store/detail/000255/ |
| 串カツ田中 | 串カツ田中 松戸店 | 松戸市松戸1292-1 | 駅前 | — | https://restaurant.kushi-tanaka.com/detail/1237/ |
| ロイヤルホスト | ロイヤルホスト松戸駅前店 | 松戸市根本5-2 | 駅前 | — | https://locations.royalhost.jp/detail/105406/ |
| バーミヤン | バーミヤン 松戸駅西口店 | 松戸市松戸1287-1 | 駅前 | サントロペ松戸ビル2F | https://store-info.skylark.co.jp/map/171608/ |
| コメダ珈琲店 | 松戸駅西口店 | 松戸市松戸1286-1 | 駅前 | 北辰ビル2F | https://www.komeda.co.jp/shop/detail.html?id=553 |
| ケンタッキー | 松戸店 | 松戸市本町18-9 | 駅前 | 軍次屋ビル | https://search.kfc.co.jp/points/532 |
| サブウェイ | サブウェイ 松戸駅西口店 | 松戸市本町18-13 | 駅前 | — | https://subway.co.jp/shop/5752/ |
| CoCo壱番屋 | ＪＲ松戸駅西口店 | 松戸市根本5-1 | 駅前 | 根本グリーンコーポ1階 | https://tenpo.ichibanya.co.jp/map/1554/ |
| やよい軒 | やよい軒 松戸本町店 | 松戸市本町17-7 | 駅前 | 松葉ビル1F | https://store.yayoiken.com/b/yayoiken/info/1759/ |
| 牛角 | 牛角 松戸アネックス店 | 松戸市本町20-13 | 駅前 | 東進ビル2F | https://map.reins.co.jp/gyukaku/detail/473675871 |
| 星乃珈琲店 | 松戸駅前店 | 松戸市本町（番地の記載なし） | 駅前 | 流鉄松戸ビル2F | https://www.hoshinocoffee.com/shop.html |
| 鎌倉パスタ | 鎌倉パスタ アトレ松戸店 | 松戸市松戸1181 | 駅前 | アトレ松戸7F | https://www.saint-marc-hd.com/kamakura/shop/460/ |
| とんかつ和幸 | 和幸松戸西口店 | 松戸市根本5-1 | 駅前 | 根本グリーンコーポ1F | https://wako-group.co.jp/shop/detai/shop_1169/ |

「駅前〜徒歩圏」は本町の番地だけでは300mの内外を切れなかった店です（本町は西口側の狭い町域で、800m圏内なのは確かです）。

### 1-2. 圏内に無いと確認できたチェーン（26）
スシロー、丸亀製麺、びっくりドンキー、なか卯、かつや、天丼てんや、プロント、かっぱ寿司、フレッシュネスバーガー、ジョナサン、デニーズ、ココス、エクセルシオールカフェ、ロッテリア／ゼッテリア、大戸屋、餃子の王将、くら寿司、はま寿司、魚べい、しゃぶ葉、焼肉きんぐ、しゃぶしゃぶ温野菜、ブロンコビリー、むさしの森珈琲、洋麺屋五右衛門、不二家レストラン。
陽性対照と方法は末尾の共通表を見てください。松戸市内の別の場所にある店（圏外）: 丸亀（二十世紀が丘・栗ヶ沢）、びっくりドンキー松戸店（二ツ木）、スシロー（高塚新田・五香・八ケ崎）、くら寿司（二十世紀が丘・五香）、王将 新松戸店、温野菜 北小金ボウル店、ゼッテリア（日暮1-1-2＝八柱）、五右衛門 松戸きよしヶ丘店、すき家・松屋・松のや 古ヶ崎（約1km）。

### 1-3. 未確認
なし。

### 1-4. 駅前の商業施設の設備
**アトレ松戸**（https://www.atre.co.jp/matsudo/service/）
- 授乳室: ベビールーム5F。授乳室1部屋、給水設備・調乳用給湯設備、おむつ交換台、おむつ専用ゴミ箱。
- おむつ替え: ベビーシートは1F・7Fの多目的トイレ内、1F・3F・4F・5F・6F・7Fの女性化粧室内、3Fの男性化粧室内。オムツ自販機は5F授乳室横。
- ベビーカー貸出: インフォメーションでの無料貸出は2026/3/31で終了。2026/4/1から有料の「ベビカル」（3階 北口改札横、10:00〜21:00）。
- キッズスペース: 名称としては記載なし。8Fガーデンテラスに「お子様用の遊具」あり（4〜9月 10:00〜18:00、10〜3月 10:00〜17:00、荒天時閉園）。

**キテミテマツド / プラーレ松戸**: 館の公式サイトのURLを特定できず未確認（推測ドメインは全て不通、検索でも公式は出ず）。テナント公式の住所で館の実在だけ確認しています。

---

## 2. 流山おおたかの森

### 2-1. 実在を確認できた店（21チェーン）
| チェーン | 店名（公式表記） | 住所 | 距離 | 館・階 | 公式URL |
|---|---|---|---|---|---|
| サイゼリヤ | サイゼリヤ 流山おおたかの森駅前店 | 流山市おおたかの森東1-2-1 | 駅前 | ライフガーデン流山おおたかの森2F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=1219 |
| ガスト | ガスト 流山おおたかの森駅前店 | 流山市おおたかの森西1-1-1 | 駅前 | こかげテラス1階 | https://store-info.skylark.co.jp/map/017727/ |
| スターバックス | 流山おおたかの森S.C.店 | 流山市おおたかの森南1-5-1 | 駅前 | 流山おおたかの森S.C. 本館1階 | https://store.starbucks.co.jp/detail-1444/ |
| スターバックス | 流山おおたかの森S.C. FLAPS店 | 流山市おおたかの森南1-2-1 | 駅前 | FLAPS 1階 | https://store.starbucks.co.jp/detail-4583/ |
| マクドナルド | 流山おおたかの森店 | 流山市おおたかの森南1-6-4 | 徒歩圏 | — | https://map.mcdonalds.co.jp/map/12685 |
| モスバーガー | モスバーガーTXGA流山おおたかの森店 | 流山市おおたかの森北1-1-1 | 駅前 | TXグランドアベニューおおたかの森2F | https://www.mos.jp/shop/detail/?shop_cd=04947 |
| 吉野家・はなまるうどん | 吉野家×はなまるうどん ＴＸＧＡ流山おおたかの森店 | 流山市おおたかの森北1-1-1 | 駅前 | （階の記載なし） | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_048466 ／ https://stores.hanamaruudon.com/hanamaru/spot/detail?code=2169 |
| 大阪王将 | TXGAおおたかの森店 | 流山市おおたかの森北1-1-1 | 駅前 | TXグランドアベニューおおたかの森1階 | https://www.osaka-ohsho.com/store/store_detail.php?shop_id=503 |
| ミスタードーナツ | TXグランドアベニューおおたかの森ショップ | 流山市おおたかの森北1-1-1 | 駅前 | — | https://md.mapion.co.jp/b/misterdonut/info/2039/ |
| フレッシュネスバーガー | フレッシュネスバーガー流山おおたかの森S.C.店 | 流山市おおたかの森南1-5-1 | 駅前 | 流山おおたかの森SC 1階 | https://search.freshnessburger.co.jp/detail/3032477/ |
| 串カツ田中 | 串カツ田中 流山おおたかの森店 | 流山市おおたかの森西1-1-1 | 駅前 | こかげテラス内 | https://restaurant.kushi-tanaka.com/detail/0095/ |
| コメダ珈琲店 | 流山おおたかの森店 | 流山市おおたかの森南1-19-2 | 徒歩圏 | — | https://www.komeda.co.jp/shop/detail.html?id=379 |
| ケンタッキー | 流山おおたかの森店 | 流山市流山おおたかの森西1-1-1（公式表記のまま） | 駅前 | — | https://search.kfc.co.jp/points/3341 |
| サブウェイ | サブウェイ 流山おおたかの森ショッピングセンター店 | 流山市おおたかの森南1-5-1 | 駅前 | 流山おおたかの森ショッピングセンター アネックス1F | https://subway.co.jp/shop/5734/ |
| 大戸屋 | 大戸屋ごはん処 コトエ流山おおたかの森店 | 流山市おおたかの森西1-15-3 | 徒歩圏 | コトエ流山おおたかの森 飲食棟2F | https://store.ootoya.com/detail/67016/ |
| 餃子の王将 | 餃子の王将 コトエ流山おおたかの森店 | 流山市おおたかの森西1-15-3 | 徒歩圏 | 1階 | https://map.ohsho.co.jp/b/ohsho/attr/?t=attr_con&citycode=12220 （市の一覧。個別URLは未取得） |
| 魚べい | 流山おおたかの森店 | 流山市おおたかの森東2-2-2 | 徒歩圏 | — | https://www.uobei.info/store/?prefecture=12 （個別ページなし） |
| しゃぶ葉 | しゃぶ葉 流山おおたかの森店 | 流山市おおたかの森北2-50-9 | 徒歩圏 | — | https://store-info.skylark.co.jp/map/198387/ |
| むさしの森珈琲 | むさしの森珈琲 流山おおたかの森店 | 流山市おおたかの森東2-4-2 | 徒歩圏（座標で約660m） | — | https://store-info.skylark.co.jp/map/198247/ |
| 鎌倉パスタ | 鎌倉パスタ 流山おおたかの森S･C店 | 流山市おおたかの森南1-2-1 | 駅前 | FLAPS 4F | https://www.saint-marc-hd.com/kamakura/shop/472/ |
| とんかつ和幸 | 和幸流山おおたかの森店 | 流山市おおたかの森南1-5-1 | 駅前 | 流山おおたかの森S・C 3F | https://wako-group.co.jp/shop/detai/shop_2133/ |

### 2-2. 圏内に無いと確認できたチェーン（35）
スターバックス以外のカフェ系: タリーズ、ドトール、サンマルクカフェ、ベローチェ、プロント、エクセルシオールカフェ、星乃珈琲店。
その他: 松屋、すき家、スシロー、丸亀製麺、びっくりドンキー、なか卯、松のや、かつや、天丼てんや、リンガーハット、日高屋、かっぱ寿司、ジョナサン、デニーズ、ロイヤルホスト、ココス、バーミヤン、ロッテリア／ゼッテリア、CoCo壱番屋、やよい軒、くら寿司、はま寿司、牛角、焼肉きんぐ、しゃぶしゃぶ温野菜、ブロンコビリー、洋麺屋五右衛門、不二家レストラン。
- **ブロンコビリー おおたかの森店は境界〜圏外**: 流山市おおたかの森南三丁目8番地 LEVEN流山おおたかの森1F（https://www.bronco.co.jp/shop/chiba/ootakanomori_ten/）。駅から約1kmと見ましたが地図確認を。
- 圏外の例: 丸亀製麺流山（市野谷117-1、座標で約1.6km）、スタバ流山市野谷店、松屋 初石店、すき家3店、コメダ以外のカフェなし。ドトール系は「カフェ レクセル 流山おおたかの森店」（こかげテラス）があるが、56チェーンの対象外ブランドです。

### 2-3. 未確認
なし。

### 2-4. 駅前の商業施設の設備
**流山おおたかの森S・C**（https://www.otakanomori-sc.com/service_guide/）
- 授乳室: ベビー休憩室が本館1F（中央階段通路。授乳・調乳室／おむつ替え室に分かれる）、本館3F（西駐車場口通路）、ANNEX1 1F。ベビーベッド、調乳用温水器、飲料自販機、授乳室完備、男性も利用可。女性専用授乳室は本館3F・ANNEX2 4F・FLAPS 3F（各ベビー休憩室内）。本館2F（西側エレベーター前）に完全個室の「ママロ」。
- おむつ替え: 本館1F・2F・3F（授乳室・多目的トイレ）、ANNEX1 1F（授乳室）ほか各階トイレ。キッズトイレは本館3F・ANNEX1 1F・FLAPS 3F。
- ベビーカー貸出: 本館1F・2F・3F、ANNEX1 1F・4F・5F・6F、FLAPS 1Fのベビーカー置き場。コインリターン式。対象月齢は記載なし。
- キッズスペース: 記載なし（service_guide と /sc_kids/ を確認）。
こかげテラス・TXグランドアベニュー・コトエ・ライフガーデンは館の公式設備ページを調べていません。

---

## 3. 柏の葉キャンパス

### 3-1. 実在を確認できた店（10チェーン）
| チェーン | 店名（公式表記） | 住所 | 距離 | 館・階 | 公式URL |
|---|---|---|---|---|---|
| サイゼリヤ | サイゼリヤ ららぽーと柏の葉 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=1516 |
| スターバックス | 柏の葉 蔦屋書店 | 柏市若柴227-1 | 徒歩圏 | （柏の葉T-SITE。階の記載なし） | https://store.starbucks.co.jp/detail-2091/ |
| タリーズ | TX柏の葉キャンパス駅前店 | 柏市若柴174 | 駅前 | — | https://shop.tullys.co.jp/detail/1000992 |
| タリーズ | ららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F | https://shop.tullys.co.jp/detail/1350377 |
| タリーズ | ららぽーと柏の葉北館店 | 柏市若柴178-4 柏の葉キャンパス148街区2 | 駅前 | ららぽーと柏の葉北館1階 | https://shop.tullys.co.jp/detail/1000782 |
| マクドナルド | 柏の葉キャンパス駅前店 | 柏市若柴174 | 駅前 | — | https://map.mcdonalds.co.jp/map/12661 |
| モスバーガー | モスバーガーららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3階フードコート内 | https://www.mos.jp/shop/detail/?shop_cd=05000 |
| 丸亀製麺 | 丸亀製麺ららぽーと柏の葉 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F | https://stores.marugame.com/110834 |
| サンマルクカフェ | サンマルクカフェ ららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉2F | https://www.saint-marc-hd.com/saintmarccafe/shop/783/ |
| サブウェイ | サブウェイ ららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F（フードコート内） | https://subway.co.jp/shop/5693/ |
| 大戸屋 | 大戸屋ごはん処 ららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F | https://store.ootoya.com/detail/27242/ |
| 鎌倉パスタ | 鎌倉パスタ ららぽーと柏の葉店 | 柏市若柴175 | 駅前 | ららぽーと柏の葉3F | https://www.saint-marc-hd.com/kamakura/shop/311/ |

### 3-2. 圏内に無いと確認できたチェーン（46）
上の10チェーン以外の全部です。ガスト、ドトール、吉野家、松屋、すき家、スシロー、びっくりドンキー、なか卯、松のや、かつや、天丼てんや、はなまるうどん、リンガーハット、日高屋、大阪王将、ミスタードーナツ、ベローチェ、プロント、かっぱ寿司、フレッシュネスバーガー、串カツ田中、ジョナサン、デニーズ、ロイヤルホスト、ココス、バーミヤン、コメダ珈琲店、エクセルシオールカフェ、ケンタッキー、ロッテリア／ゼッテリア、CoCo壱番屋、やよい軒、餃子の王将、くら寿司、はま寿司、魚べい、牛角、しゃぶ葉、焼肉きんぐ、しゃぶしゃぶ温野菜、ブロンコビリー、むさしの森珈琲、星乃珈琲店、洋麺屋五右衛門、不二家レストラン、とんかつ和幸。
**境界（地図確認が要る）**
- すき家 柏松葉町店（柏市松葉町7-36-1、座標で約780m）https://maps.sukiya.jp/jp/detail/1331.html
- 松屋 柏松葉町店／松のや 柏松葉町店（柏市松葉町7丁目36番4、座標で約1,170m。すき家と同じ区画なのに座標が400mずれており、どちらかが狂っています）
- すき家 柏十余二店（柏市十余二380-60、座標で約900m）https://maps.sukiya.jp/jp/detail/6333.html
**圏外と判断したもの**: ロイヤルホスト若柴店（若柴5-31）、ドトール パークカフェ 柏の葉公園店（柏の葉4-1）、ドトール 国立がん研究センター東病院店（柏の葉6-5-1）、はま寿司 柏十余二店、ブロンコビリー「柏の葉店」（住所は流山市青田60-1。店名に柏の葉と付くが駅圏外）、CoCo壱 ヨークマート柏花野井店。

### 3-3. 未確認
なし。

### 3-4. 駅前の商業施設の設備
**ららぽーと柏の葉**
- 授乳室（https://mitsui-shopping-park.com/lalaport/kashiwa/service/babyroom.html）: 本館は2F総合案内所前、2F ZELE AVEDA横、3Fアカチャンホンポ内（おむつ替えシート、紙パック飲料自販機、給湯設備等）。北館は2Fモンベル横（おむつ替えシート、給湯設備等）。
- おむつ替え（.../service/diaper.html）: 各フロアのトイレで交換可。
- ベビーカー貸出（.../service/babycar.html）: 100円硬貨のリターン式、B型、生後2ヵ月〜3歳（36ヵ月）。場所は本館立体駐車場P1・P3・P6各連絡通路、本館1階 千葉銀行連絡口通路、本館2階メインエントランス（クリスタルコート横入口）、北館2階キッズプレイエリア前。予約不可。
- キッズスペース: 専用の案内ページは見つからず。ベビーカーのページに「北館2階 キッズプレイエリア」の名前だけ出てきます（条件の記載なし）。

**柏の葉T-SITE**（https://store.tsite.jp/kashiwanoha/floor/）
- フロアガイドの凡例に「授乳室」「おむつ替えシート」「多目的トイレ」があるが、階はテキストでは読めず（地図画像側）。ベビーカー貸出・キッズスペースは記載なし（フロアガイド1F・2F・屋外の3ページ）。

---

## 4. 浦和

### 4-1. 実在を確認できた店（30チェーン）
| チェーン | 店名（公式表記） | 住所（さいたま市浦和区） | 距離 | 館・階 | 公式URL |
|---|---|---|---|---|---|
| サイゼリヤ | サイゼリヤ 浦和西口店 | 仲町1-3-10 | 駅前 | なかまち壱番館2F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=1477 |
| サイゼリヤ | サイゼリヤ 浦和東口店 | 東高砂町9-5 | 駅前 | スミダワン別館1F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=0884 |
| ガスト | ガスト 浦和駅西口店 | 高砂1-13-12 | 駅前 | ミリスクエアー2F | https://store-info.skylark.co.jp/map/018909/ |
| スターバックス | 浦和 蔦屋書店 | 高砂1-16-12 | 駅前 | アトレ浦和 | https://store.starbucks.co.jp/detail-2071/ |
| スターバックス | 浦和西口店 | 高砂2-5-1 | 駅前〜徒歩圏 | KOMON | https://store.starbucks.co.jp/detail-1882/ |
| スターバックス | 浦和パルコ店 | 東高砂町11-1 | 駅前 | 浦和パルコ1階 | https://store.starbucks.co.jp/detail-1616/ |
| タリーズ | 浦和仲町店 | 仲町1-4-10 | 駅前 | — | https://shop.tullys.co.jp/detail/1000958 |
| タリーズ | 浦和パルコ店 | 東高砂町11-1 | 駅前 | 浦和パルコB1F | https://shop.tullys.co.jp/detail/1000989 |
| タリーズ | 浦和さくら草通り店 | 高砂2-5-11 | 駅前〜徒歩圏 | — | https://shop.tullys.co.jp/detail/1000786 |
| ドトール | ドトールコーヒーショップ 浦和東口店 | 東高砂町2-3 | 駅前 | — | https://shop.doutor.co.jp/doutor/spot/detail?code=1011158 |
| エクセルシオールカフェ | エクセルシオール カフェ 浦和コルソ店 | 高砂1-12-1 | 駅前 | 浦和コルソ1F | https://shop.doutor.co.jp/doutor/spot/detail?code=5000300 |
| マクドナルド | 浦和仲町店 | 仲町1-2-14 | 駅前 | — | https://map.mcdonalds.co.jp/map/11033 |
| 吉野家 | 吉野家 浦和仲町店 | 仲町2-3-22 | 徒歩圏 | — | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_049418 |
| 吉野家 | 吉野家 浦和駅東口店（テイクアウト・デリバリー専門店） | 東仲町1-22 | 駅前〜徒歩圏 | — | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_049569 |
| 松屋 | 松屋 浦和仲町店（松のや併設） | 仲町1-2-9 | 駅前 | EGUCHIビルディング | https://pkg.navitime.co.jp/matsuyafoods/spot/detail?code=0000001944 |
| 松のや | 松のや 浦和仲町店（松屋併設） | 仲町1-2-9 | 駅前 | EGUCHIビルディング | https://pkg.navitime.co.jp/matsuyafoods/spot/detail?code=0000011944 |
| すき家 | すき家 浦和仲町店 | 仲町1-4-12 | 駅前 | — | https://maps.sukiya.jp/jp/detail/1663.html |
| 丸亀製麺 | 丸亀製麺浦和コルソ | 高砂1-12-1 | 駅前 | 浦和コルソB1F | https://stores.marugame.com/111117 |
| 天丼てんや | 浦和店 | 高砂1-14-14 | 駅前 | たけふじビル1F | https://www.tenya.co.jp/shop/saitama/urawa.html |
| 日高屋 | 日高屋 浦和東口店 | 東仲町11-1 | 駅前 | — | https://hidakaya.hiday.co.jp/hits/ja/shop/1/detail/005.html |
| 日高屋 | 日高屋 浦和さくら草通店 | 高砂2-6-13 | 駅前〜徒歩圏 | — | https://hidakaya.hiday.co.jp/hits/ja/shop/1/detail/056.html |
| ミスタードーナツ | 浦和西口ショップ | 仲町1-1-10 | 駅前 | — | https://md.mapion.co.jp/b/misterdonut/info/0522/ |
| ミスタードーナツ | 浦和東口ショップ | 東高砂町2-3 | 駅前 | — | https://md.mapion.co.jp/b/misterdonut/info/0399/ |
| ベローチェ | カフェ・ベローチェ 浦和さくら草通り店 | 高砂2-6-13 | 駅前〜徒歩圏 | ヨシナガビル1F | https://c-united.co.jp/search/ （個別URLは未取得） |
| ベローチェ | カフェ・ベローチェ 浦和市民文化センター店 | 高砂2-4-6 | 徒歩圏 | 市民文化センター1F | 同上 |
| プロント | PRONTO アトレ浦和店 | 高砂1-16-12 | 駅前 | アトレ浦和 | https://shop.pronto.co.jp/detail/63/ |
| フレッシュネスバーガー | フレッシュネスバーガー浦和店 | 仲町1-5-8 | 徒歩圏 | 1階 | https://search.freshnessburger.co.jp/detail/3033119/ |
| 串カツ田中 | 串カツ田中 浦和店 | 東仲町8-1 | 駅前 | — | https://restaurant.kushi-tanaka.com/detail/1090/ |
| ジョナサン | ジョナサン 浦和西口店 | 仲町1-6-13 | 駅前 | — | https://store-info.skylark.co.jp/map/909503/ |
| デニーズ | デニーズ 浦和駅前店 | 高砂1-16-7 | 駅前 | JR東日本ホテルメッツ浦和1F | https://shop.dennys.jp/map/21828/ |
| ケンタッキー | 浦和仲町店 | 仲町1-2-7 | 駅前 | — | https://search.kfc.co.jp/points/4258 |
| ゼッテリア | 埼玉県庁前店 | 高砂3-6-15 | 徒歩圏 | — | https://maps.zetteria.jp/shop/shop2118.html |
| CoCo壱番屋 | ＪＲ浦和駅西口店 | 高砂二丁目6-6 | 駅前 | 秩父屋ビル1階 | https://tenpo.ichibanya.co.jp/map/2527/ |
| 大戸屋 | 大戸屋ごはん処 浦和店 | 仲町1-1-10 | 駅前 | 浦和ウイングビル2F | https://store.ootoya.com/detail/27207/ |
| 牛角 | 牛角 浦和店 | 仲町1-10-7 | 徒歩圏 | 尾張屋第一ビル3F | https://map.reins.co.jp/gyukaku/detail/488264229 |
| しゃぶしゃぶ温野菜 | 【10月9日オープン】しゃぶしゃぶ温野菜 浦和店 | 仲町1-1-1 | 駅前 | 吉野ビル2F | https://map.reins.co.jp/onyasai/detail/487115555 （10/7時点で未開店） |
| 星乃珈琲店 | 浦和店 | 高砂1-13-12 | 駅前 | MiRiスクエア1階 | https://www.hoshinocoffee.com/shop.html |
| 鎌倉パスタ | 鎌倉パスタ 浦和パルコ店 | 東高砂町11-1 | 駅前 | 浦和パルコ5F | https://www.saint-marc-hd.com/kamakura/shop/318/ |
| とんかつ和幸 | 和幸伊勢丹浦和店 | 高砂1-15-1 | 駅前 | 伊勢丹浦和店7F | https://wako-group.co.jp/shop/detai/shop_2011/ |

### 4-2. 圏内に無いと確認できたチェーン（26）
モスバーガー、スシロー、びっくりドンキー、なか卯、かつや、はなまるうどん、リンガーハット、大阪王将、サンマルクカフェ、かっぱ寿司、ロイヤルホスト、ココス、バーミヤン、コメダ珈琲店、サブウェイ、やよい軒、餃子の王将、くら寿司、はま寿司、魚べい、しゃぶ葉、焼肉きんぐ、ブロンコビリー、むさしの森珈琲、洋麺屋五右衛門、不二家レストラン。
**境界（地図確認が要る）**
- ココス 浦和店（前地3-17、座標で約900m）https://maps.cocos-jpn.co.jp/jp/detail/2800.html
- 吉野家 17号線浦和常盤店（常盤6-2-15、座標は約700mだが吉野家の座標は他店で数百mずれている）
**圏外**: ロイヤルホスト浦和常盤店（常盤7-1-17）、コメダ 北浦和駅前店、スタバ 浦和別所店（南区）、不二家 浦和田島店（桜区）。プロント系の「ディプント浦和店」（仲町1-1-8）は別ブランドです。

### 4-3. 未確認
なし。

### 4-4. 駅前の商業施設の設備
**アトレ浦和**（https://www.atre.co.jp/urawa/service/）
- 授乳室: ベビールームが South Area 1F と West Area 3F。授乳用個室が各1室、調乳用給湯設備・給水設備。
- おむつ替え・ベビーカー貸出・キッズスペース: 記載なし（同ページ）。

**浦和パルコ**（https://urawa.parco.jp/page/baby_kids_guide/）
- 授乳室: ベビールームが3F・5Fの青のエスカレーター側。おむつ替え交換台、授乳室、給湯設備等。
- おむつ替え: 各階のトイレにも交換台。4F（青のエスカレーター側）に親子トイレ（お子様用トイレ、ベビーキープ、おむつ替え交換台。性別問わず利用可）。
- ベビーカー貸出: コインリターン式（100円、返却時に戻る。生後2か月〜3歳0か月）と3輪タイプ（1Fインフォメーションカウンターで受付。生後1ヶ月〜3歳0か月）。設置場所は1F緑のエスカレーター横、B2F駐輪場入口横、B2F〜B4F正面シースルーエレベーターホール、5F正面シースルーエレベーター横。
- キッズスペース: 4Fシースルーエレベーター前。保護者同伴で無料。

**伊勢丹浦和店**（https://www.mistore.jp/store/urawa/service.html）
- 授乳室: 6階「ベビー休憩所」。おむつ交換・授乳・調乳。授乳コーナー以外は子連れの男性も利用可。
- おむつ替え: ベビーシート・ベビーキープは1階を除く各階。6階（女性用）に子供用トイレ（子連れの男性も利用可）。
- ベビーカー貸出: 無料。1階 正面玄関・南側玄関、6階ベビー子供用品フロア（フロア内専用）。対象月齢は記載なし。
- キッズスペース: 記載なし（同ページ）。

**浦和コルソ**（https://urawa-corso.com/guide/）
- ベビーカー: 1F伊勢丹側出入り口、B2Fエレベーターホール（条件の記載なし）。
- 授乳室・おむつ替え・キッズスペース: 記載なし（総合案内ページ）。

---

## 5. 所沢

### 5-1. 実在を確認できた店（28チェーン）
| チェーン | 店名（公式表記） | 住所（所沢市） | 距離 | 館・階 | 公式URL |
|---|---|---|---|---|---|
| サイゼリヤ | サイゼリヤ 所沢プロペ通り店 | 日吉町4-2 | 駅前〜徒歩圏 | 所沢サンプラザB1F | https://shop.saizeriya.co.jp/sz_restaurant/spot/detail?code=0730 |
| ガスト | ガスト 所沢プロぺ通り店 | 日吉町8-4 | 駅前 | — | https://store-info.skylark.co.jp/map/017920/ |
| スターバックス | グランエミオ所沢西口1階店 | くすのき台1-14-5 | 駅前 | グランエミオ所沢 | https://store.starbucks.co.jp/detail-1585/ |
| スターバックス | グランエミオ所沢東口2階店 | くすのき台1-14-5 | 駅前 | グランエミオ所沢 | https://store.starbucks.co.jp/detail-1531/ |
| タリーズ | 所沢駅店 | くすのき台1-14-5 | 駅前 | 西武鉄道所沢駅改札内 | https://shop.tullys.co.jp/detail/5660705 |
| タリーズ | エミテラス所沢店 | 東住吉10-1 | 徒歩圏 | エミテラス所沢3階 | https://shop.tullys.co.jp/detail/1003270 |
| ドトール | ドトールコーヒーショップ グランエミオ所沢店 | くすのき台1-14-5 | 駅前 | （階の記載なし） | https://shop.doutor.co.jp/doutor/spot/detail?code=1012263 |
| ドトール | ドトールコーヒーショップ 所沢店 | 日吉町3-5 | 駅前 | 第3E-Fビル | https://shop.doutor.co.jp/doutor/spot/detail?code=1011048 |
| マクドナルド | 所沢店 | 日吉町2-2 | 駅前 | — | https://map.mcdonalds.co.jp/map/11003 |
| マクドナルド | グランエミオ所沢店 | くすのき台1-14-5 | 駅前 | （階の記載なし） | https://map.mcdonalds.co.jp/map/11747 |
| モスバーガー | モスバーガー所沢西口店 | 日吉町12-1 | 駅前 | （住所は西武所沢S.C.と同じ。館名の記載なし） | https://www.mos.jp/shop/detail/?shop_cd=08193 |
| 吉野家 | 吉野家 所沢駅前店 | 日吉町11-20 | 駅前〜徒歩圏 | 富士ビル1F | https://stores.yoshinoya.com/yoshinoya/spot/detail?code=ysn_049448 |
| 丸亀製麺 | 丸亀製麺エミテラス所沢 | 東住吉10 | 徒歩圏 | エミテラス所沢1F | https://stores.marugame.com/111449 |
| なか卯 | なか卯 所沢東町店 | 東町12-3 | 徒歩圏 | — | https://maps.nakau.co.jp/jp/detail/2377.html |
| リンガーハット | リンガーハット 西武所沢S.C.店 | 日吉町12-1 | 駅前 | 西武所沢S.C. 1F とこうまキッチン | https://shop.ringerhut.jp/detail/r1032/ |
| 日高屋 | 日高屋 所沢プロぺ通店 | 日吉町8-2 | 駅前 | — | https://hidakaya.hiday.co.jp/hits/ja/shop/1/detail/577.html |
| ミスタードーナツ | 所沢駅西口ショップ | くすのき台1-14-5 | 駅前 | グランエミオ所沢1階 | https://md.mapion.co.jp/b/misterdonut/info/1013/ |
| プロント | PRONTO グランエミオ所沢店 | くすのき台1-14-5 | 駅前 | （階の記載なし） | https://shop.pronto.co.jp/detail/273/ |
| フレッシュネスバーガー | フレッシュネスバーガー エミテラス所沢店 | 東住吉10 | 徒歩圏 | （階の記載なし） | https://search.freshnessburger.co.jp/detail/3031510/ |
| 串カツ田中 | 串カツ田中 所沢店 | 日吉町8-6 | 駅前 | — | https://restaurant.kushi-tanaka.com/detail/1116/ |
| ココス | ココス 所沢中央店 | くすのき台3-17-4 | 徒歩圏（座標で約410m） | — | https://maps.cocos-jpn.co.jp/jp/detail/2819.html |
| コメダ珈琲店 | グランエミオ所沢店 | くすの木台1-14-5（公式表記） | 駅前 | — | https://www.komeda.co.jp/shop/detail.html?id=981 |
| コメダ珈琲店 | 所沢プロペ通り店 | 日吉町10-17 | 駅前〜徒歩圏 | 第9兼七ビル2階 | https://www.komeda.co.jp/shop/detail.html?id=1100 |
| ケンタッキー | 所沢駅前店 | 日吉町2-2 | 駅前 | — | https://search.kfc.co.jp/points/247 |
| ケンタッキー | ソコラ所沢店 | 北秋津592番地 | 徒歩圏（座標で約530m） | — | https://search.kfc.co.jp/points/4378 |
| サブウェイ | サブウェイ エミテラス所沢店 | 東住吉10-1 | 徒歩圏 | エミテラス所沢1F こもれびフードホール | https://subway.co.jp/shop/5828/ |
| CoCo壱番屋 | 所沢駅東口店 | くすのき台一丁目9-8 | 駅前 | エシール所沢2号館106号 | https://tenpo.ichibanya.co.jp/map/1613/ |
| 大戸屋 | 大戸屋ごはん処 所沢プロペ通り店 | 日吉町8番地 | 駅前 | プロペ所沢II 3F | https://store.ootoya.com/detail/27452/ |
| やよい軒 | やよい軒 所沢日吉町店 | 日吉町15-12 | 徒歩圏 | — | https://store.yayoiken.com/b/yayoiken/info/1902/ |
| 餃子の王将 | 餃子の王将 所沢プロペ通り店 | 日吉町8-5 | 駅前 | フジノビル1階 | https://map.ohsho.co.jp/b/ohsho/attr/?t=attr_con&citycode=11208 （市の一覧。個別URLは未取得） |
| はま寿司 | はま寿司 所沢トコトコスクエア店 | 東町5-22 | 徒歩圏 | トコトコスクエア地下1F | https://maps.hama-sushi.co.jp/jp/detail/5282.html |
| 牛角 | 牛角 所沢店 | 日吉町8-3 | 駅前 | 三上ビル1F | https://map.reins.co.jp/gyukaku/detail/429264129 |
| むさしの森珈琲 | むさしの森珈琲 所沢住吉店 | 南住吉21-40 | 徒歩圏（座標で約650m） | — | https://store-info.skylark.co.jp/map/198216/ |
| 星乃珈琲店 | 所沢プロペ通り店 | 日吉町11-16 | 駅前〜徒歩圏 | TOM'Sビル2F | https://www.hoshinocoffee.com/shop.html |

### 5-2. 圏内に無いと確認できたチェーン（28）
松屋、すき家、スシロー、びっくりドンキー、松のや、かつや、天丼てんや、はなまるうどん、大阪王将、サンマルクカフェ、ベローチェ、かっぱ寿司、ジョナサン、デニーズ、ロイヤルホスト、バーミヤン、エクセルシオールカフェ、ロッテリア／ゼッテリア、鎌倉パスタ、くら寿司、魚べい、しゃぶ葉、焼肉きんぐ、しゃぶしゃぶ温野菜、ブロンコビリー、洋麺屋五右衛門、不二家レストラン、とんかつ和幸。
圏外の例: くら寿司 所沢有楽町店、サイゼリヤ ヤオコー所沢有楽町店、びっくりドンキー・星乃珈琲 新所沢、コメダ 所沢牛沼店・新所沢店、魚べい 所沢牛沼店・小手指店、スシロー 所沢北原店、リンガーハット 所沢航空公園店、てんや 新所沢店、串カツ田中 所沢牛沼店。プロント系「和カフェTsumugiエミテラス所沢店」は別ブランド。

### 5-3. 未確認
なし。

### 5-4. 駅前の商業施設の設備
**グランエミオ所沢**（https://et-ge-tokorozawa.com/grandemio/services/）
- 授乳室: 2階に1箇所、3階に2箇所（3階は女性専用）。
- おむつ替え: 記載なし（同ページ）。キッズトイレは3階。
- ベビーカー貸出: 2Fインフォメーションカウンター。数に限りあり。料金・対象月齢は記載なし。
- キッズスペース: 記載なし（同ページ）。

**西武所沢S.C.**（https://www.sogo-seibu.jp/tokorozawa/service-guide の「お子さま連れのお客さま」）
- 授乳室: 4階ベビー休憩室。ベビーベッド、ミルク用温水器、飲料自販機、電子レンジ、授乳室。無料。
- おむつ替え: 4・7・8階の紳士用化粧室と、2階を除く婦人用化粧室にベビーベッド。7階婦人用化粧室が子供同伴化粧室。
- ベビーカー貸出: 1階 駅側正面入口。無料。対象月齢は記載なし。
- ベビーチェア貸出: 1階フードホール「とこうまキッチン」。無料、生後7か月〜3歳目安。
- キッズスペース: 記載なし（同ページ）。

**エミテラス所沢**（https://et-ge-tokorozawa.com/emiterrace/services/）
- 授乳室: 1・2・3階に各2箇所、4階に1箇所。混雑状況をWebで確認可。
- おむつ替え: 記載なし（同ページ）。キッズトイレは各トイレ。
- ベビーカート貸出: 1F・2F各3か所、3F 1箇所、4F 2箇所。コイン式（100円投入、返却時に戻る）。
- キッズスペース: サービスページには記載なし。4階の遊び場の話は報道記事でしか見ておらず、公式では未確認。

---

## 6. 使えた公式データ源（別の駅で再利用する用）

「陽性対照」欄は、0件判定の前に同じ方法で実在店が返ることを確かめた内容です。

| チェーン | URLの型 | 陽性対照・注意 |
|---|---|---|
| ガスト／バーミヤン／ジョナサン／しゃぶ葉／むさしの森珈琲 | `https://store-info.skylark.co.jp/api/point/{geohash5桁}/`（Referer必須）。駅セル＋周囲セルを取る | 21セルで129店。パラメータなしの `/api/point/` は50件しか返さない |
| デニーズ | `https://shop.dennys.jp/api/point/{geohash5桁}/` | 浦和駅前店が返る。パラメータなしは404 |
| CoCo壱番屋 | `https://tenpo.ichibanya.co.jp/api/point/` | 全国1,230店一括 |
| ケンタッキー | `https://search.kfc.co.jp/api/points/{geohash5桁}` | 5駅周辺で36店 |
| モスバーガー | `https://www.mos.jp/data/shop/shop.json` | 全国1,325店・座標つき |
| マクドナルド | `https://map.mcdonalds.co.jp/api/poi?bounds=南,西,北,東&uuid=任意` | 住所・座標つきで返る |
| コメダ | `https://eu.komeda.co.jp/v1/hp/shop?brand_type=1&all=true`（Origin/Referer必須） | 1,050店。`prefecture=` 指定は20件で打ち切られる（page指定も効かない）ので使わない |
| 吉野家 | `https://stores.yoshinoya.com/yoshinoya/api/proxy2/shop/list?coord=緯度,経度&radius=2000&limit=100&c_d1=0` | 座標は数百mずれる（松戸東口店が539m表示） |
| 松屋／松のや | `https://pkg.navitime.co.jp/matsuyafoods/api/proxy2/shop/list?coord=…` | 同じ区画のすき家と400mずれた例あり |
| かつや | `https://shop.arclandservice.co.jp/ae-shop/api/proxy2/shop/list?coord=…` | 柏駅3kmで「かつや 柏東口店」「南柏店」が返る |
| はなまるうどん | `https://stores.hanamaruudon.com/hanamaru/api/proxy2/shop/list?coord=…` | 座標ずれ大（IY松戸が621m表示） |
| ドトール／エクセルシオール | `https://shop.doutor.co.jp/doutor/api/proxy2/shop/list?coord=…` | カテゴリ名でブランドを見分ける（レクセル、コロラド等が混ざる） |
| すき家／はま寿司／なか卯／ココス | `POST https://maps.{sukiya.jp|hama-sushi.co.jp|nakau.co.jp|cocos-jpn.co.jp}/jp/api/search` に `address=千葉県松戸市`（X-Requested-With: XMLHttpRequest） | 新宿区で13／1／3／0件。**`address.html?q=` のHTMLは空の枠でcurlでは使えない**（writing-rules §3 の記載は要修正）。住所は `/jp/detail/{id}.html` |
| ロッテリア／ゼッテリア | `POST https://maps.zetteria.jp/shop/` に `pref=11`（都道府県コード） | 埼玉26店・千葉18店。lotteria.jp は zetteria.jp に転送 |
| サイゼリヤ | `https://shop.saizeriya.co.jp/sz_restaurant/spot/list?address={都道府県コード2桁}&search=address&limit=500` | 市名を入れると400。県コードで全件 |
| スターバックス | `https://hn8madehag.execute-api.ap-northeast-1.amazonaws.com/prd-2019-08-21/storesearch?size=100&q.parser=structured&q=(and ver:10000 record_type:1 pref_code:12 address_2:'松戸市')&fq=(and data_type:'prd')&sort=zip_code asc,store_id asc&start=0` | **`/pref/…?city=` のHTMLは空の枠になった**（§3の記載は要修正）。括弧と引用符をエンコードしすぎると403。座標は `location` がWGS84 |
| タリーズ | `https://shop.tullys.co.jp/all` の `data-store` | 849店。詳細URLは直後の `href="/detail/{数字}"`（data-storeのidとは別物） |
| 牛角／温野菜 | `https://map.reins.co.jp/{gyukaku|onyasai}/{県}` の `data-store` | 県ページでも全国分が入る。詳細URLは直後のhref |
| くら寿司 | `https://shop.kurasushi.co.jp/all` の `data-store` | 559店 |
| 大戸屋／フレッシュネス／ロイヤルホスト | `https://g9ey9rioe.api.hp.can-ly.com/v2/companies/{522|630|872}/shops/search` | 459／153／222店・座標つき |
| リンガーハット／串カツ田中／プロント | `https://api.site.can-ly.com/v2/directories/{84|49|62}/shops/search`（Origin必須） | 553／356／279店。プロントは別ブランド（Di PUNTO、Tsumugi）が混ざる |
| 丸亀製麺 | `https://stores.marugame.com/{県}/{市}` のHTMLをURLデコードし `dm_directoryChildren` の `line1` と `slug` を読む | 政令市は区でなく市単位（さいたま市）。店名の並びは別項目と混ざるので個別ページで確認 |
| ミスド／やよい軒／餃子の王将 | `https://{md.mapion.co.jp/b/misterdonut|store.yayoiken.com/b/yayoiken|map.ohsho.co.jp/b/ohsho}/attr/?t=attr_con&citycode={市区町村コード5桁}` | 全件ページ送りより速い。王将は全国726件 |
| 大阪王将 | 公式JS（`/assets/js/search_shops__response.js`）にあるGraphQLへ `getShopListByKeyword(keyword:"千葉県")` | 千葉12・埼玉5 |
| かっぱ寿司 | `https://www.kappasushi.jp/master_data/json/shoplist.json` | 298店 |
| サンマルクカフェ／鎌倉パスタ | `POST https://www.saint-marc-hd.com/api/shop/search/{saintmarccafe|kamakura}/` に `{"limit":500}` | 291／217店。limitなしは20件、`l` や `location` は効かない |
| ベローチェ | `https://c-united.co.jp/store/request_search/?bounds=南緯,北緯,西経,東経` | 新宿で14店。brand=1がカフェ・ベローチェ、4が珈琲館。詳細は `/store/detail/{code6桁}/` |
| 焼肉きんぐ | `https://shop.monogatari.co.jp/api/v1/shops/?brandId[]=yakiniku_king&perPage=1000` | 372店。5駅とも2.5km以内に0 |
| スシロー | `https://www.akindo-sushiro.co.jp/shop/?mode=service` | 全店が1ページ・住所つき |
| びっくりドンキー | `https://www.bikkuri-donkey.com/shop/?from=shop&pref=tokyo` | 全国分が入る |
| サブウェイ | `https://subway.co.jp/shop/search/` の `data-name` `data-address` | 全店が1ページ |
| 星乃珈琲店 | `https://www.hoshinocoffee.com/shop.html` | 全店が1ページ |
| 洋麺屋五右衛門 | `https://www.yomenya-goemon.com/store/kanto/` | 地方ごと |
| 不二家レストラン | `https://www.fujiya-peko.co.jp/restaurant/shop-list/` | 浦和田島店が載る（一覧が生きている） |
| とんかつ和幸 | `https://wako-group.co.jp/shop/result/?brand=0&type=0&paged=1〜15` | HTTP 404で本文が返る。145店 |
| 天丼てんや | `https://www.tenya.co.jp/shop/{県}/` | 県ページに店名、個別ページに住所 |
| ブロンコビリー | `https://www.bronco.co.jp/shop/` → `/shop/{県}/{店}/` | 店名が駅名でも住所が遠い例あり（柏の葉店＝流山市青田） |
| 日高屋 | `https://hidakaya.hiday.co.jp/hits/ja/shop/1/list.html` → `detail/{番号}.html` | 一覧は店名のみ |
| 魚べい | `https://www.uobei.info/store/?prefecture={県コード}` を実ブラウザで開く | 公開トークン方式のAPIは401になった（リポジトリの `scripts/chain-coverage/uobei.mjs` も動かない可能性あり） |

リポジトリの `scripts/chain-coverage/*.mjs` が各チェーンの取得方法を持っているので、今回はそこからエンドポイントを借りました。

Skill化候補の判定はしていません（メモリ検索を行っていないため）。
