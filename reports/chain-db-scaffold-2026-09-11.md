# 未登録チェーンのDB化 記入シート

生成: 2026-09-10 / `node scripts/chain-db-scaffold.mjs`

- 登録済み: **43** チェーン
- 記事のある未登録エンティティ: **57** 件
- うち除外: **25** 件（施設 19 / 非エンティティ 3 / 綴り違い 3）
- **DB化の対象チェーン: 32 件 × 12設備キー = 384 セル**

## 記入ルール

| 列 | 入れるもの |
|---|---|
| `value` | `yes` = 公式に「ある」と書いてある / `partial` = 店舗による・条件付き / `no` = 公式に「ない」と書いてある / **空欄 = 公式に記載がない（これが正しい既定値）** |
| `note` | 補足（例: モール内店舗は施設の授乳室を利用）。`partial` のときは必須 |
| `source_url` | 値の根拠になった公式ページのURL。`value` を入れたら必須 |

**空欄のまま残すことを恐れないこと。** `items` は Partial なので、書かなければ表示されない。
「公式に記載がない」を「ない(`no`)」と書くのが、過去に1,109本へ同じ型の誤りを入れた原因。

## 対象チェーン

| # | key | 推定表示名 | 記事 | noindex | 攻略記事slug | 公式ドメイン候補 | 記述のある設備キー |
|---:|---|---|---:|---:|---|---|---:|
| 1 | `ajinomingei` | 味 | 1 | 0 | `ajino-mingei-kodzure-koryaku` | www.ajinomingei.com | 12/12 |
| 2 | `amiyakitei` | あみやき亭 | 1 | 0 | `amiyakitei-kodomo-ryokin` | amiyakitei.jp | 2/12 |
| 3 | `anrakutei` | 安楽亭 | 5 | 0 | `anrakutei-kodzure-koryaku` | anrakutei.jp | 12/12 |
| 4 | `bandotaro` | ばんどう太郎 | 1 | 0 | `bandotaro-kodzure-koryaku` | bandotaro.co.jp | 10/12 |
| 5 | `choushimaru` | すし銚子丸 | 1 | 0 | `choushimaru-kodzure-koryaku` | www.choushimaru.co.jp | 11/12 |
| 6 | `doutor` | ドトール | 1 | 0 | `doutor-kodzure-koryaku` | www.doutor.co.jp | 8/12 |
| 7 | `flyinggarden` | フライングガーデン | 1 | 0 | `flying-garden-kodzure-koryaku` | www.fgarden.co.jp | 12/12 |
| 8 | `gattensushi` | が | 1 | 0 | `gatten-sushi-kodzure-koryaku` | www.rdc.co.jp | 10/12 |
| 9 | `hanayayohei` | 華屋与兵衛 | 1 | 0 | `hanaya-yohei-kodzure-koryaku` | **要調査** | 8/12 |
| 10 | `hidakaya` | 日高屋 | 1 | 0 | `hidakaya-kodzure-koryaku` | hidakaya.hiday.co.jp | 10/12 |
| 11 | `hottomotto` | ほっともっと | 1 | 0 | `hottomotto-kodzure-koryaku` | www.hottomotto.com | 7/12 |
| 12 | `ichiran` | 一蘭 | 2 | 0 | `ichiran-kodzure-koryaku` | ichiran.com | 9/12 |
| 13 | `kagonoya` | かご | 1 | 1 | `kagonoya-kodzure-koryaku` | kagonoya.food-kr.com | 11/12 |
| 14 | `kushikatsutanaka` | 串カツ田中 | 2 | 0 | `kushikatsu-tanaka-kodzure-koryaku` | kushi-tanaka.com | 6/12 |
| 15 | `marugenramen` | 丸源ラーメン | 1 | 0 | `marugen-ramen-kodzure-koryaku` | www.syodai-marugen.jp | 12/12 |
| 16 | `onyasai` | しゃぶしゃぶ温野菜 | 2 | 0 | `onyasai-kodzure-koryaku` | www.onyasai.com | 10/12 |
| 17 | `originbento` | オリジン弁当 | 1 | 1 | `origin-bento-kodzure-koryaku` | www.toshu.co.jp | 7/12 |
| 18 | `ringerhut` | リンガーハット | 6 | 0 | `ringer-hut-kodzure-koryaku` | www.ringerhut.jp | 12/12 |
| 19 | `sanmarccafe` | サンマルクカフェ | 1 | 0 | `sanmarc-cafe-kodzure-koryaku` | www.saint-marc-hd.com | 8/12 |
| 20 | `sawayaka` | 炭焼きレストランさわやか | 1 | 0 | `sawayaka-kodzure-koryaku` | www.genkotsu-hb.com | 12/12 |
| 21 | `starbucks` | スタバ | 1 | 0 | `starbucks-kodzure-koryaku` | store.starbucks.co.jp | 10/12 |
| 22 | `steakmiya` | ステーキ宮 | 1 | 0 | `steak-miya-kodzure-koryaku` | www.miya.com | 11/12 |
| 23 | `sukesanudon` | 資さんうどん | 1 | 0 | `sukesan-udon-kodzure-koryaku` | www.sukesanudon.com | 11/12 |
| 24 | `tenkaippin` | 天下一品 | 1 | 0 | `tenkaippin-kodzure-koryaku` | www.tenkaippin.co.jp | 11/12 |
| 25 | `tenya` | てんや | 4 | 2 | `tenya-baby-chair` | www.tenya.co.jp | 10/12 |
| 26 | `tullyscoffee` | タリーズコーヒー | 1 | 0 | `tullys-coffee-kodzure-koryaku` | www.tullys.co.jp | 8/12 |
| 27 | `ueshimacoffee` | 上島珈琲店 | 1 | 1 | `ueshima-coffee-kodzure-koryaku` | www.ueshima-coffee-ten.jp | 9/12 |
| 28 | `uobei` | 魚べい・元気寿司 | 1 | 0 | `uobei-kodzure-koryaku` | **要調査** | 9/12 |
| 29 | `washokusato` | 和食さと | 2 | 0 | `washoku-sato-kodzure-koryaku` | sato-res.com | 11/12 |
| 30 | `yakinikuking` | 焼肉きんぐ | 5 | 0 | `yakiniku-king-kodzure-koryaku` | www.yakiniku-king.jp | 12/12 |
| 31 | `yamadaudon` | 山田うどん食堂 | 1 | 0 | `yamada-udon-kodzure-koryaku` | www.yamada-udon.co.jp | 12/12 |
| 32 | `yuzuan` | ゆず庵 | 2 | 0 | `yuzuan-kodzure-koryaku` | www.shabu-yuzuan.jp | 10/12 |

※ 推定表示名は攻略記事タイトルからの機械抽出。**そのままDBに入れず必ず確認する**。

## 除外したもの（理由つき）

| key | 種別 | 理由 |
|---|---|---|
| `akimatsuri` | 非エンティティ | カテゴリ語（秋祭り） |
| `costco` | 施設 | 単一施設（倉庫店） |
| `disney` | 施設 | 単一施設（TDL） |
| `fujiq` | 施設 | 単一施設（遊園地） |
| `hakone` | 施設 | 単一エリア |
| `hanamarudon` | 綴り違い | はなまるうどん（DB key: hanamaru-udon） |
| `haneda` | 施設 | 単一施設（空港） |
| `ikea` | 施設 | 単一施設（店舗ごとに別施設） |
| `ikearestaurant` | 施設 | 施設内レストラン |
| `kaitenzushi` | 非エンティティ | カテゴリ語（回転寿司） |
| `kamogawaseaworld` | 施設 | 単一施設（水族館） |
| `karuizawa` | 施設 | 単一エリア |
| `karuizawaoutlet` | 施設 | 単一施設 |
| `kasaiaquarium` | 施設 | 単一施設（水族館） |
| `laketown` | 施設 | 単一施設（モール） |
| `legoland` | 施設 | 単一施設 |
| `marukame` | 綴り違い | 丸亀製麺（DB key: marugame） |
| `natsumatsuri` | 非エンティティ | カテゴリ語（夏祭り） |
| `puroland` | 施設 | 単一施設 |
| `shabuyo` | 綴り違い | しゃぶ葉（DB key: shabuyou） |
| `shinagawaaquarium` | 施設 | 単一施設（水族館） |
| `showakinenkoen` | 施設 | 単一施設（公園） |
| `takaosan` | 施設 | 単一エリア（山） |
| `tds` | 施設 | 単一施設（TDS） |
| `uenozoo` | 施設 | 単一施設（動物園） |

綴り違いの3件はDB化ではなく**キーの正規化**で解決する（しゃぶ葉・はなまるうどん・丸亀製麺）。
施設19件は別DB（`lib/spots.ts` 系）の管轄。チェーンDBに単一施設を混ぜると「店舗差」の意味が壊れる。
