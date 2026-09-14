# chain-facilities 未登録エンティティの DB化ワークリスト

生成: 2026-09-10 / `node scripts/db-onboarding-worklist.mjs`

- 登録済み: **43** チェーン
- 未登録だが記事のあるエンティティ: **57** 件（記事 134 本）

## 使い方

1. 「公式ドメイン候補」を開いて、そのエンティティの公式サイトか確認する（記事の出典から機械抽出しただけなので誤りを含む）
2. 12設備キーのうち「記事に記述あり」の列を、公式ページで**照合し直す**。記事の記述をそのままDBへ写さないこと
3. 確認できた項目だけ `lib/chain-facilities.ts` に追加し、`verifiedAt` と `verifiedMethod` を入れる
4. 公式に記載がない項目は**省略する**（`items` は Partial なので、書かなければ表示されない）。
   「ある」とも「ない」とも書かないのが `docs/writing-rules.md` の原則

## 優先順（記事数＝既に検索で当たっている面の多さ）

| # | エンティティ | 記事 | noindex | 出典節 | 公式ドメイン候補 | 記事に記述のある設備キー |
|---:|---|---:|---:|---:|---|---|
| 1 | `disney` | 8 | 2 | 4 | www.tokyodisneyresort.jp | 8/12: kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 2 | `haneda` | 6 | 3 | 2 | tokyo-haneda.com | 7/12: kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 3 | `karuizawa` | 6 | 2 | 2 | www.karuizawa-psp.jp / www.hoshino-area.jp | 8/12: stepFree kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 4 | `ringerhut` | 6 | 0 | 1 | www.ringerhut.jp / www.mhlw.go.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 5 | `anrakutei` | 5 | 0 | 1 | anrakutei.jp / www.mhlw.go.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 6 | `ikea` | 5 | 1 | 2 | www.ikea.com | 10/12: stepFree kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 7 | `shabuyo` | 5 | 0 | 1 | www.skylark.co.jp / store-info.skylark.co.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 8 | `yakinikuking` | 5 | 0 | 2 | www.yakiniku-king.jp / www.mhlw.go.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 9 | `fujiq` | 4 | 3 | 1 | www.fujiq.jp | 6/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat |
| 10 | `hakone` | 4 | 1 | 0 | **なし（要調査）** | 8/12: stepFree kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat allergenInfo |
| 11 | `hanamarudon` | 4 | 0 | 0 | www.hanamaruudon.com | 9/12: boxSeat kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 12 | `legoland` | 4 | 2 | 0 | **なし（要調査）** | 9/12: stepFree kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 13 | `puroland` | 4 | 0 | 2 | www.puroland.jp | 8/12: stepFree kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat allergenInfo |
| 14 | `tenya` | 4 | 2 | 1 | www.tenya.co.jp | 10/12: stepFree kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 15 | `marukame` | 3 | 0 | 3 | jp.marugame.com / www.marugame-seimen.com | 10/12: zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 16 | `natsumatsuri` | 3 | 1 | 0 | www.caa.go.jp / www.mhlw.go.jp | 7/12: stepFree diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 17 | `tds` | 3 | 0 | 1 | www.tokyodisneyresort.jp | 7/12: stepFree kidsChair diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 18 | `uenozoo` | 3 | 2 | 1 | www.tokyo-zoo.net | 6/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat |
| 19 | `costco` | 2 | 0 | 2 | www.costco.co.jp | 8/12: stepFree kidsChair diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 20 | `ichiran` | 2 | 0 | 0 | ichiran.com | 9/12: zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom toriwake strollerToSeat allergenInfo |
| 21 | `kamogawaseaworld` | 2 | 1 | 1 | www.kamogawa-seaworld.jp | 6/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat |
| 22 | `karuizawaoutlet` | 2 | 2 | 0 | **なし（要調査）** | 7/12: kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 23 | `kasaiaquarium` | 2 | 0 | 2 | www.tokyo-zoo.net / www.tokyo-park.or.jp | 6/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat |
| 24 | `kushikatsutanaka` | 2 | 0 | 0 | kushi-tanaka.com | 6/12: zashiki kidsChair kidsMenu kidsCutlery babyFoodBringIn strollerToSeat |
| 25 | `laketown` | 2 | 2 | 0 | **なし（要調査）** | 9/12: zashiki boxSeat kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat allergenInfo |
| 26 | `onyasai` | 2 | 0 | 0 | www.onyasai.com / www.mhlw.go.jp | 10/12: zashiki boxSeat kidsChair kidsMenu kidsCutlery nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 27 | `shinagawaaquarium` | 2 | 1 | 1 | www.aquarium.gr.jp | 7/12: stepFree kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn strollerToSeat |
| 28 | `showakinenkoen` | 2 | 0 | 0 | www.showakinen-koen.jp | 4/12: stepFree diaperTable babyFoodBringIn strollerToSeat |
| 29 | `takaosan` | 2 | 0 | 0 | **なし（要調査）** | 3/12: stepFree nursingRoom strollerToSeat |
| 30 | `washokusato` | 2 | 0 | 1 | sato-res.com | 11/12: zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 31 | `yuzuan` | 2 | 0 | 0 | www.shabu-yuzuan.jp / www.mhlw.go.jp | 10/12: zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 32 | `ajinomingei` | 1 | 0 | 0 | www.ajinomingei.com | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 33 | `akimatsuri` | 1 | 0 | 0 | **なし（要調査）** | 3/12: nursingRoom strollerToSeat allergenInfo |
| 34 | `amiyakitei` | 1 | 0 | 0 | amiyakitei.jp | 2/12: kidsMenu toriwake |
| 35 | `bandotaro` | 1 | 0 | 1 | bandotaro.co.jp | 10/12: stepFree zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 36 | `choushimaru` | 1 | 0 | 0 | www.choushimaru.co.jp | 11/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 37 | `doutor` | 1 | 0 | 1 | www.doutor.co.jp / www.maff.go.jp | 8/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 38 | `flyinggarden` | 1 | 0 | 1 | www.fgarden.co.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 39 | `gattensushi` | 1 | 0 | 0 | www.rdc.co.jp / www.rdcgroup.co.jp | 10/12: stepFree zashiki boxSeat kidsChair kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 40 | `hanayayohei` | 1 | 0 | 0 | **なし（要調査）** | 8/12: zashiki kidsChair diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 41 | `hidakaya` | 1 | 0 | 1 | hidakaya.hiday.co.jp | 10/12: zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 42 | `hottomotto` | 1 | 0 | 1 | www.hottomotto.com / www.mhlw.go.jp | 7/12: kidsMenu kidsCutlery nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 43 | `ikearestaurant` | 1 | 1 | 0 | **なし（要調査）** | 8/12: kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 44 | `kagonoya` | 1 | 1 | 0 | www.mhlw.go.jp / kagonoya.food-kr.com | 11/12: stepFree zashiki kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 45 | `kaitenzushi` | 1 | 0 | 0 | www.hama-sushi.co.jp | 6/12: boxSeat kidsChair kidsMenu babyFoodBringIn toriwake allergenInfo |
| 46 | `marugenramen` | 1 | 0 | 1 | www.syodai-marugen.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 47 | `originbento` | 1 | 1 | 0 | www.toshu.co.jp / www.mhlw.go.jp | 7/12: kidsChair kidsMenu kidsCutlery nursingRoom babyFoodBringIn toriwake allergenInfo |
| 48 | `sanmarccafe` | 1 | 0 | 1 | www.saint-marc-hd.com / www.saint-marc-hd.jp | 8/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 49 | `sawayaka` | 1 | 0 | 0 | www.genkotsu-hb.com | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 50 | `starbucks` | 1 | 0 | 1 | store.starbucks.co.jp / www.starbucks.co.jp | 10/12: stepFree kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 51 | `steakmiya` | 1 | 0 | 0 | www.miya.com | 11/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat |
| 52 | `sukesanudon` | 1 | 0 | 1 | www.sukesanudon.com | 11/12: zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 53 | `tenkaippin` | 1 | 0 | 1 | www.tenkaippin.co.jp | 11/12: zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 54 | `tullyscoffee` | 1 | 0 | 0 | www.tullys.co.jp / www.mhlw.go.jp | 8/12: stepFree kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 55 | `ueshimacoffee` | 1 | 1 | 0 | www.ueshima-coffee-ten.jp / www.ucc.co.jp | 9/12: stepFree boxSeat kidsMenu diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 56 | `uobei` | 1 | 0 | 0 | **なし（要調査）** | 9/12: boxSeat kidsChair kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |
| 57 | `yamadaudon` | 1 | 0 | 0 | www.yamada-udon.co.jp | 12/12: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable nursingRoom babyFoodBringIn toriwake strollerToSeat allergenInfo |

## エンティティ別の詳細

### `disney`（記事 8 本 / 出典節 4 本）

公式ドメイン候補: `www.tokyodisneyresort.jp`(59)

| slug | title |
|---|---|
| `disney-baby-care-center` | ディズニーのベビーセンターはランド2か所・シーは2026年10月2日まで休止｜代 |
| `disney-baby-chair` | ディズニーランドのベビーチェア｜全レストラン設置状況・予約・コツ完全ガイド【20 |
| `disney-jyunyu-shitsu` | ディズニーランドの授乳室はベビーセンター2か所｜シーは2026年10月2日まで休 |
| `disney-kids-menu` | ディズニーランドのキッズメニューは1,000〜1,900円｜何歳まで頼める？うど |
| `disney-kosodate-attractions` | ディズニーランド 0歳〜OKアトラクション完全ガイド｜身長制限なし・親同伴で乗れ |
| `disney-omutsu-gae` | ディズニーランドのおむつ替えはどこ？交換台の場所とおむつの捨て方【2026】 |
| `disney-rinyushoku` | ディズニーランド 離乳食の持ち込み・販売・ベビーセンター完全ガイド【2026年版 |
| `disney-stroller-rental` | ディズニーランドのベビーカーレンタルは1日1,000円｜リクライニング付きB型・ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsCutlery

### `haneda`（記事 6 本 / 出典節 2 本）

公式ドメイン候補: `tokyo-haneda.com`(17)

| slug | title |
|---|---|
| `haneda-kids-menu` | 羽田空港でキッズメニューの公式記載がある店は24店｜全店が保安検査の前・第3ター |
| `haneda-rinyushoku-milk` | 羽田空港で離乳食はどこで食べる？販売・温め・ミルクのお湯の場所【2026】 |
| `haneda-stroller-kids-space` | 羽田空港のベビーカー貸出は無料だが対象は「見学・お見送り」｜キッズスペースは全9 |
| `haneda-t1-babyroom` | 羽田空港第1ターミナルの授乳室は保安検査前に10か所｜制限エリア内は7か所・うち |
| `haneda-t2-babyroom` | 羽田空港第2ターミナルの授乳室は保安検査後に12か所｜検査前は9か所・2F制限エ |
| `haneda-t3-babyroom` | 羽田空港第3ターミナルの授乳室は出国後に多い｜保安検査前は7か所だけ・キッズトイ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsCutlery allergenInfo

### `karuizawa`（記事 6 本 / 出典節 2 本）

公式ドメイン候補: `www.karuizawa-psp.jp`(6), `www.hoshino-area.jp`(3)

| slug | title |
|---|---|
| `karuizawa-akachan-yado` | 軽井沢の赤ちゃん歓迎宿｜0歳OK・離乳食・コテージ完全ガイド【2026年版】 |
| `karuizawa-kodzure-spot` | 軽井沢の子連れスポット｜遊び場・宿・回り方完全ガイド【2026年版】 |
| `karuizawa-outlet-kids-menu` | 軽井沢アウトレットのお子さまメニューは35店中15店｜フードコートは2店だけ |
| `karuizawa-outlet-kids-park` | 軽井沢アウトレットのキッズパークは0〜12才・キャッシュレスのみ｜料金は公式内で |
| `karuizawa-shopping-mall` | 軽井沢アウトレットの子供の遊び場｜キッズパーク・あそびパーク料金と授乳室【202 |
| `karuizawa-stroller` | 軽井沢のベビーカー貸出はプリンスショッピングプラザのコインロック式｜100円が要 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsCutlery allergenInfo

### `ringerhut`（記事 6 本 / 出典節 1 本）

公式ドメイン候補: `www.ringerhut.jp`(10), `www.mhlw.go.jp`(2), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `ringer-hut-kodzure-koryaku` | リンガーハットは子連れにラク？野菜たっぷりちゃんぽんの取り分け・ちびっこメニュー |
| `ringerhut-baby-chair` | リンガーハットのベビーチェア事情｜全店ある？利用のコツ完全ガイド【2026】 |
| `ringerhut-kids-menu` | リンガーハットのキッズメニュー｜ちびっこセット4種・ちゃんぽんの取り分け完全ガイ |
| `ringerhut-koshitsu` | リンガーハットに個室・座敷はある？店舗タイプ別の席事情と子連れの席選び完全ガイド |
| `ringerhut-omutsu` | リンガーハットでオムツ替えできる？店舗タイプ別の設備事情完全ガイド【2026】 |
| `ringerhut-stroller` | リンガーハットはベビーカーで入れる？店舗タイプ別の入店可否と動線完全ガイド【20 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `anrakutei`（記事 5 本 / 出典節 1 本）

公式ドメイン候補: `anrakutei.jp`(12), `www.mhlw.go.jp`(4), `www.anrakutei.co.jp`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `anrakutei-baby-chair` | 安楽亭のベビーチェアは？対応店舗・タイプ・予約時のコツ完全ガイド【2026】 |
| `anrakutei-kids-menu` | 安楽亭のキッズメニューは？プレート・取り分け・年齢別の選び方完全ガイド【2026 |
| `anrakutei-kodomo-ryokin-guide` | 安楽亭の子ども料金｜食べ放題の小学生は半額？幼児は無料？肉の日はさらに安い【20 |
| `anrakutei-kodzure-koryaku` | 安楽亭は子連れにラク？自然肉・無添加で「子に食べさせる肉」を選びやすい・座敷でゆ |
| `anrakutei-koshitsu` | 安楽亭に個室はある？座敷・掘りごたつ・予約のコツ完全ガイド【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `ikea`（記事 5 本 / 出典節 2 本）

公式ドメイン候補: `www.ikea.com`(7)

| slug | title |
|---|---|
| `ikea-baby-chair` | IKEAレストランのベビーチェア｜台数・種類・確保のコツ完全ガイド【2026年】 |
| `ikea-omutsu` | IKEAオムツ替えスポット完全ガイド｜場所・台数・授乳室併設【2026年】 |
| `ikea-restaurant-kodzure-koryaku` | IKEAレストランは子連れ最強？ベビーカー・キッズメニュー・離乳食無料・スモーラ |
| `ikea-smaland` | IKEAスモーランドは予約できない｜当日発券の先着順・4歳〜11歳未満・無料60 |
| `ikea-stroller` | IKEAの子ども用カートは「ひとり座り〜体重15kgまで」｜ベビーカー入店・持ち |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat

### `shabuyo`（記事 5 本 / 出典節 1 本）

公式ドメイン候補: `www.skylark.co.jp`(8), `store-info.skylark.co.jp`(3), `www.mhlw.go.jp`(1)

| slug | title |
|---|---|
| `shabuyo-baby-chair` | しゃぶ葉のベビーチェアは？全店対応・タイプ・予約時のコツ完全ガイド【2026】 |
| `shabuyo-kodomo-ryokin` | しゃぶ葉の子ども料金まとめ｜幼児は何歳まで無料？小学生はいくら？【2026】 |
| `shabuyo-koshitsu` | しゃぶ葉に個室はある？子連れに人気の半個室・席選びのコツ完全ガイド【2026】 |
| `shabuyo-stroller` | しゃぶ葉はベビーカーで入れる？席まで通せる店舗・段差・予約のコツ【2026】 |
| `shabuyou-kodzure-koryaku` | しゃぶ葉の子供料金は何歳まで無料？小学生・幼児・キッズメニュー【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `yakinikuking`（記事 5 本 / 出典節 2 本）

公式ドメイン候補: `www.yakiniku-king.jp`(19), `www.mhlw.go.jp`(3), `www.monogatari.co.jp`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `yakiniku-king-kids-menu` | 焼肉きんぐのキッズメニューは？幼児無料・小学生半額の年齢別ガイド【2026】 |
| `yakiniku-king-kodomo-ryokin` | 焼肉きんぐの子ども料金｜幼児は無料？小学生はいくら？【2026年9月確認】 |
| `yakiniku-king-kodzure-koryaku` | 焼肉きんぐは子連れOK？子供料金・幼児無料・子供椅子・ベビーカー【2026】 |
| `yakiniku-king-koshitsu` | 焼肉キングの個室・半個室・テーブル席｜子連れに向く席タイプ完全ガイド |
| `yakiniku-king-time-system` | 焼肉キング 食べ放題100分制｜子連れの時間配分・ラストオーダー・延長の完全ガイ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `fujiq`（記事 4 本 / 出典節 1 本）

公式ドメイン候補: `www.fujiq.jp`(4)

| slug | title |
|---|---|
| `fuji-q-area-kosodate` | 富士五湖エリアの子連れ完全ガイド｜トーマスランド・遊び場・宿【2026年版】 |
| `fujiq-omutsu` | 富士急ハイランド オムツ替え｜ベビールーム3箇所・全マップ完全ガイド【2026年 |
| `fujiq-stroller` | 富士急ハイランドのベビーカー貸出は保証金込1,000円・返却時に500円返金｜実 |
| `fujiq-thomas-land-kosodate` | 富士急トーマスランド 子連れ攻略｜2〜6歳向け動線・予算・持ち物【2026年】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery toriwake allergenInfo

### `hakone`（記事 4 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `hakone-akachan-yado` | 箱根の赤ちゃん歓迎の宿｜0歳OK・離乳食・ベビー備品まで完全ガイド【2026年版 |
| `hakone-kodzure-spot` | 箱根の子連れおすすめスポット｜宿・回り方・コツ完全ガイド【2026年版】 |
| `hakone-onsen-baby` | 箱根の赤ちゃんOK温泉｜入浴可能月齢・泉質・宿選び完全ガイド【2026年版】 |
| `hakone-stroller` | 箱根のベビーカー観光｜動線・段差・授乳室まで完全ガイド【2026年版】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsCutlery toriwake

### `hanamarudon`（記事 4 本 / 出典節 0 本）

公式ドメイン候補: `www.hanamaruudon.com`(4)

| slug | title |
|---|---|
| `hanamarudon-baby-chair` | はなまるうどんのベビーチェア事情｜種類・対応月齢・店舗差を完全解説【2026】 |
| `hanamarudon-kids-menu` | はなまるうどんのキッズメニュー徹底解説｜にこはなセットの年齢別おすすめと取り分け |
| `hanamarudon-omutsu` | はなまるうどんでオムツ替えできる？店舗タイプ別の設備事情完全ガイド【2026】 |
| `hanamarudon-stroller` | はなまるうどんはベビーカーで入れる？店舗タイプ別の入店可否と動線完全ガイド【20 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki kidsCutlery

### `legoland`（記事 4 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `legoland-baby-chair` | レゴランド・ジャパン ベビーチェア｜レストラン別設置状況完全ガイド【2026年】 |
| `legoland-kids-menu` | レゴランド・ジャパン キッズメニュー｜全レストランの価格・内容・アレルゲン【20 |
| `legoland-kosodate` | レゴランド・ジャパン 子連れ攻略｜2〜6歳向け動線・予算・持ち物【2026年】 |
| `legoland-stroller` | レゴランド・ジャパン ベビーカー｜貸出・置き場・動線完全ガイド【2026年】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsCutlery

### `puroland`（記事 4 本 / 出典節 2 本）

公式ドメイン候補: `www.puroland.jp`(17)

| slug | title |
|---|---|
| `puroland-baby-chair` | サンリオピューロランド ベビーチェア｜レストラン別設置状況ガイド【2026年】 |
| `puroland-kosodate-guide` | サンリオピューロランド 0〜6歳完全攻略｜年齢別動線・予算・持ち物【2026年】 |
| `puroland-omutsu` | サンリオピューロランド オムツ替え｜全フロア設備マップ完全ガイド【2026年】 |
| `puroland-stroller` | ピューロランドは土日祝と18時閉館の平日は1・2階でベビーカーが使えません｜貸出 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsCutlery toriwake

### `tenya`（記事 4 本 / 出典節 1 本）

公式ドメイン候補: `www.tenya.co.jp`(5)

| slug | title |
|---|---|
| `tenya-baby-chair` | てんやのベビーチェア事情｜全店ある？利用のコツ完全ガイド【2026】 |
| `tenya-kids-menu` | てんやのキッズメニュー｜お子様天丼・取り分けの完全ガイド【2026】 |
| `tenya-omutsu` | てんやでオムツ替えできる？店舗タイプ別の設備事情完全ガイド【2026】 |
| `tenya-stroller` | てんやはベビーカーで入れる？店舗タイプ別の入店可否完全ガイド【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat

### `marukame`（記事 3 本 / 出典節 3 本）

公式ドメイン候補: `jp.marugame.com`(10), `www.marugame-seimen.com`(4)

| slug | title |
|---|---|
| `marukame-baby-chair` | 丸亀製麺にベビーチェアはある？種類・ベルト・セルフ動線のコツを解説【2026】 |
| `marukame-kids-menu` | 丸亀製麺に子ども向けメニューはある？かけうどん（小）取り分けのコツ完全ガイド【2 |
| `marukame-rinyushoku-mochikomi` | 丸亀製麺に離乳食持ち込みOK？公式方針・温め対応・うどん取り分け実例【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat

### `natsumatsuri`（記事 3 本 / 出典節 0 本）

公式ドメイン候補: `www.caa.go.jp`(1), `www.mhlw.go.jp`(1)

| slug | title |
|---|---|
| `natsumatsuri-kodzure-koryaku-2026` | 【2026年版】夏祭り子連れ攻略ガイド｜服装・持ち物・トイレ事情 |
| `natsumatsuri-kodzure-koryaku` | 夏祭りの子連れ攻略｜0〜6歳別の歩き方・持ち物・食事 |
| `natsumatsuri-yatai-gourmet-kodzure-guide` | 【2026年版】夏祭り・縁日の屋台グルメ子連れ完全ガイド｜定番15品は何歳から？ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsMenu kidsCutlery

### `tds`（記事 3 本 / 出典節 1 本）

公式ドメイン候補: `www.tokyodisneyresort.jp`(12)

| slug | title |
|---|---|
| `tds-baby-chair` | ディズニーシー ベビーチェア全レストランガイド｜設置状況・予約・コツ【2026年 |
| `tds-jyunyu-shitsu` | ディズニーシー 授乳室完全ガイド｜場所・設備・混雑回避【2026年版】 |
| `tds-stroller` | ディズニーシーのベビーカーレンタルは1日1,000円・借りる場所は2か所｜ベビー |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsMenu kidsCutlery allergenInfo

### `uenozoo`（記事 3 本 / 出典節 1 本）

公式ドメイン候補: `www.tokyo-zoo.net`(8)

| slug | title |
|---|---|
| `ueno-zoo-kosodate` | 上野動物園 子連れ攻略｜0〜6歳向け動線・パンダ予約・予算【2026年】 |
| `ueno-zoo-omutsu` | 上野動物園 オムツ替え｜ベビールーム3箇所・全マップ完全ガイド【2026年】 |
| `ueno-zoo-stroller` | 上野動物園のベビーカー貸出は1台1日500円｜貸出は3か所・生後7か月〜4歳くら |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery toriwake allergenInfo

### `costco`（記事 2 本 / 出典節 2 本）

公式ドメイン候補: `www.costco.co.jp`(2)

| slug | title |
|---|---|
| `costco-kodzure-koryaku` | コストコのカートは何歳から？子連れ攻略ガイド｜カート・フードコート・オムツ替え動 |
| `costco-omutsu` | コストコに授乳室はある？オムツ替え台の場所と店舗差・ミルク用のお湯【2026年】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsMenu kidsCutlery

### `ichiran`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: `ichiran.com`(10)

| slug | title |
|---|---|
| `ichiran-kodomo-muryou` | 一蘭の子どもラーメンは無料？小学生以下の条件と何人までか【2026年9月確認】 |
| `ichiran-kodzure-koryaku` | 一蘭は子供・小学生も無料？お子様ラーメンの条件と味集中カウンター【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat babyFoodBringIn

### `kamogawaseaworld`（記事 2 本 / 出典節 1 本）

公式ドメイン候補: `www.kamogawa-seaworld.jp`(8)

| slug | title |
|---|---|
| `kamogawa-sea-world-kosodate` | 鴨川シーワールド 子連れ攻略｜年齢別動線・シャチショー攻略【2026年】 |
| `kamogawa-sea-world-stroller` | 鴨川シーワールドのベビーカー貸出は1日300円・正面入口｜予約は受け付けていませ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery toriwake allergenInfo

### `karuizawaoutlet`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `karuizawa-outlet-kids-menu` | 軽井沢アウトレットのお子さまメニューは35店中15店｜フードコートは2店だけ |
| `karuizawa-outlet-kids-park` | 軽井沢アウトレットのキッズパークは0〜12才・キャッシュレスのみ｜料金は公式内で |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsCutlery allergenInfo

### `kasaiaquarium`（記事 2 本 / 出典節 2 本）

公式ドメイン候補: `www.tokyo-zoo.net`(15), `www.tokyo-park.or.jp`(2)

| slug | title |
|---|---|
| `kasai-aquarium-kosodate` | 葛西臨海水族園の所要時間と子連れ動線｜ベビーカー置き場は1か所・館内に階段あり・ |
| `kasai-aquarium-stroller` | 葛西臨海水族園にベビーカーの貸出はありません｜持ち込みOK・館内に置き場なし・階 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery toriwake allergenInfo

### `kushikatsutanaka`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: `kushi-tanaka.com`(4)

| slug | title |
|---|---|
| `kushikatsu-tanaka-kodomo-ryokin` | 串カツ田中の子ども料金は？小学生以下の無料サービスと値段【2026年9月確認】 |
| `kushikatsu-tanaka-kodzure-koryaku` | 串カツ田中は子連れに強い｜たこ焼き・ソフトクリームが小学生以下無料・全席禁煙【2 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat diaperTable nursingRoom toriwake allergenInfo

### `laketown`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `laketown-kids-menu` | イオンレイクタウンのキッズメニューは公式一覧がmoriだけ｜57店61品・税込2 |
| `laketown-kodzure-lunch` | イオンレイクタウンの子連れランチは館で決まる｜ミルクルームはmori3か所・ka |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree kidsCutlery toriwake

### `onyasai`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: `www.onyasai.com`(4), `www.mhlw.go.jp`(3), `www.reins.co.jp`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `onyasai-kodomo-ryokin` | しゃぶしゃぶ温野菜の子ども料金まとめ｜幼児は無料？小学生はいくら？【2026】 |
| `onyasai-kodzure-koryaku` | しゃぶしゃぶ温野菜は子連れにラク？二色鍋で薄味だし取り分け・未就学児無料・生焼け |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree diaperTable

### `shinagawaaquarium`（記事 2 本 / 出典節 1 本）

公式ドメイン候補: `www.aquarium.gr.jp`(13)

| slug | title |
|---|---|
| `shinagawa-aquarium-kosodate` | しながわ水族館 子連れ攻略｜0〜6歳向け動線・イルカショー・予算【2026年】 |
| `shinagawa-aquarium-stroller` | しながわ水族館にベビーカーの貸出はありません｜自前を押したまま館内一周OK・土日 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsCutlery toriwake allergenInfo

### `showakinenkoen`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: `www.showakinen-koen.jp`(1)

| slug | title |
|---|---|
| `showa-kinen-koen-kodzure` | 国営昭和記念公園の駐車場3か所を子連れ比較｜中学生以下は入園無料・花の丘は砂川口 |
| `showa-kinen-koen-stroller` | 国営昭和記念公園のベビーカー貸出は3ゲート計35台・無料｜パークトレインは折りた |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsMenu kidsCutlery nursingRoom toriwake allergenInfo

### `takaosan`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `takaosan-kodzure-route` | 高尾山は子連れで何号路を選ぶ？未就学児向けルート比較｜ケーブルカー6分＋1号路6 |
| `takaosan-stroller` | 高尾山にベビーカーで行ける？公式の答えは「清滝駅で1台500円で預ける」｜山頂ま |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable babyFoodBringIn toriwake allergenInfo

### `washokusato`（記事 2 本 / 出典節 1 本）

公式ドメイン候補: `sato-res.com`(6)

| slug | title |
|---|---|
| `washoku-sato-kodomo-ryokin` | 和食さとの子ども料金｜さとしゃぶ食べ放題は幼児いくら？小学生は半額？【2026】 |
| `washoku-sato-kodzure-koryaku` | 和食さとは子連れOK？座敷・離乳食無料・おこさまメニュー・さとしゃぶ食べ放題の攻 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree

### `yuzuan`（記事 2 本 / 出典節 0 本）

公式ドメイン候補: `www.shabu-yuzuan.jp`(4), `www.mhlw.go.jp`(4), `www.monogatari.co.jp`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `yuzuan-kodomo-ryokin` | ゆず庵の子ども料金まとめ｜幼児は無料？小学生はいくら？食べ放題の年齢区分【202 |
| `yuzuan-kodzure-koryaku` | ゆず庵は子連れにラク？寿司＋しゃぶしゃぶ食べ放題の子の好み吸収力・幼児無料・生も |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat

### `ajinomingei`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.ajinomingei.com`(1)

| slug | title |
|---|---|
| `ajino-mingei-kodzure-koryaku` | 味の民芸は子連れOK？座敷・ベビーチェア・離乳食は店舗差｜うどん取り分け【202 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `akimatsuri`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `aki-matsuri-kodzure-koryaku` | 秋祭り 子連れ攻略｜屋台・子供向け縁日・東京近郊の人気10選【0-6歳】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsChair kidsMenu kidsCutlery diaperTable babyFoodBringIn toriwake

### `amiyakitei`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `amiyakitei.jp`(2)

| slug | title |
|---|---|
| `amiyakitei-kodomo-ryokin` | あみやき亭の小学生料金は半額？幼児は無料？食べ放題の子ども料金【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsChair kidsCutlery diaperTable nursingRoom babyFoodBringIn strollerToSeat allergenInfo

### `bandotaro`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `bandotaro.co.jp`(8)

| slug | title |
|---|---|
| `bandotaro-kodzure-koryaku` | ばんどう太郎は子連れOK？座敷・個室・お食い初め・一升餅・みそ煮込みの取り分け【 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: boxSeat allergenInfo

### `choushimaru`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.choushimaru.co.jp`(1)

| slug | title |
|---|---|
| `choushimaru-kodzure-koryaku` | すし銚子丸は子連れOK？子育て支援パスポートでデザート・ベビーチェア・レーンの座 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: allergenInfo

### `doutor`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.doutor.co.jp`(12), `www.maff.go.jp`(1), `www.fsc.go.jp`(1), `www.mhlw.go.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `doutor-kodzure-koryaku` | ドトールにキッズメニューはある？子連れ・ベビーカー攻略【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery

### `flyinggarden`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.fgarden.co.jp`(5)

| slug | title |
|---|---|
| `flying-garden-kodzure-koryaku` | フライングガーデンは子連れOK？爆弾ハンバーグの取り分け注意・お子様メニュー・お |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `gattensushi`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.rdc.co.jp`(1), `www.rdcgroup.co.jp`(1)

| slug | title |
|---|---|
| `gatten-sushi-kodzure-koryaku` | がってん寿司は子連れOK？子ども椅子・回転レーンの座り方・無料おにぎり・取り分け |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: kidsCutlery allergenInfo

### `hanayayohei`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `hanaya-yohei-kodzure-koryaku` | 華屋与兵衛は子連れOK？座敷・おこさまメニュー・離乳食・ベビーカーを実体験で解説 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat kidsMenu kidsCutlery

### `hidakaya`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `hidakaya.hiday.co.jp`(2)

| slug | title |
|---|---|
| `hidakaya-kodzure-koryaku` | 日高屋は子連れOK？駅前店の入りやすさ・お子さまセット・ラーメンの取り分けを実体 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree boxSeat

### `hottomotto`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.hottomotto.com`(10), `www.mhlw.go.jp`(2), `www.plenus.co.jp`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `hottomotto-kodzure-koryaku` | ほっともっとにキッズメニュー・お子様メニューはある？何歳からOK？【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat kidsChair diaperTable

### `ikearestaurant`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `ikea-restaurant-kodzure-koryaku` | IKEAレストランは子連れ最強？ベビーカー・キッズメニュー・離乳食無料・スモーラ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat allergenInfo

### `kagonoya`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.mhlw.go.jp`(3), `kagonoya.food-kr.com`(2), `www.createrestaurants.com`(1), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `kagonoya-kodzure-koryaku` | かごの屋は子連れにラク？座敷・掘りごたつで0-1歳を下ろせる和食しゃぶしゃぶ・御 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: boxSeat

### `kaitenzushi`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.hama-sushi.co.jp`(1)

| slug | title |
|---|---|
| `kaitenzushi-kids-menu` | キッズメニューのある回転寿司はどこ？大手4社を比較【0-6歳・2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki kidsCutlery diaperTable nursingRoom strollerToSeat

### `marugenramen`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.syodai-marugen.jp`(2)

| slug | title |
|---|---|
| `marugen-ramen-kodzure-koryaku` | 丸源ラーメンは子連れOK？座敷・子ども椅子・離乳食・肉そばの取り分け完全ガイド【 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `originbento`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.toshu.co.jp`(4), `www.mhlw.go.jp`(2), `www.jpeds.or.jp`(1), `www.caa.go.jp`(1), `www.maff.go.jp`(1)

| slug | title |
|---|---|
| `origin-bento-kodzure-koryaku` | オリジン弁当は子連れにラク？量り売り惣菜の取り分け・キッチンオリジンのイートイン |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki boxSeat diaperTable strollerToSeat

### `sanmarccafe`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.saint-marc-hd.com`(8), `www.saint-marc-hd.jp`(3), `www.maff.go.jp`(1), `www.fsc.go.jp`(1), `www.mhlw.go.jp`(1)

| slug | title |
|---|---|
| `sanmarc-cafe-kodzure-koryaku` | サンマルクカフェのキッズセットは何歳まで？大人も頼める？中身と値段【2026】 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery

### `sawayaka`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.genkotsu-hb.com`(1)

| slug | title |
|---|---|
| `sawayaka-kodzure-koryaku` | 炭焼きレストランさわやかは子連れOK？げんこつハンバーグの取り分け注意・待ち時間 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

### `starbucks`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `store.starbucks.co.jp`(4), `www.starbucks.co.jp`(4), `menu.starbucks.co.jp`(2)

| slug | title |
|---|---|
| `starbucks-kodzure-koryaku` | スタバは子連れOK？ベビーカー入店・キッズドリンク・離乳食持込・モバイルオーダー |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat

### `steakmiya`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.miya.com`(2)

| slug | title |
|---|---|
| `steak-miya-kodzure-koryaku` | ステーキ宮は子連れOK？テーブル席・子ども椅子は店舗差・ステーキの取り分け注意【 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: allergenInfo

### `sukesanudon`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.sukesanudon.com`(3)

| slug | title |
|---|---|
| `sukesan-udon-kodzure-koryaku` | 資さんうどんのキッズメニューは「おこさまうどん」｜セットの中身とお子様向け設備【 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree

### `tenkaippin`（記事 1 本 / 出典節 1 本）

公式ドメイン候補: `www.tenkaippin.co.jp`(2)

| slug | title |
|---|---|
| `tenkaippin-kodzure-koryaku` | 天下一品は子連れOK？KOTTERIキッズでお子様ラーメン無料・こってりの取り分 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree

### `tullyscoffee`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.tullys.co.jp`(8), `www.mhlw.go.jp`(1), `www.maff.go.jp`(1), `www.fsc.go.jp`(1), `www.caa.go.jp`(1)

| slug | title |
|---|---|
| `tullys-coffee-kodzure-koryaku` | タリーズコーヒーは子連れにラク？ミルク系で取り分け・落ち着いた席・はちみつ/カフ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki boxSeat kidsChair kidsCutlery

### `ueshimacoffee`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.ueshima-coffee-ten.jp`(6), `www.ucc.co.jp`(1), `www.maff.go.jp`(1), `www.fsc.go.jp`(1), `www.mhlw.go.jp`(1)

| slug | title |
|---|---|
| `ueshima-coffee-kodzure-koryaku` | 上島珈琲店は子連れにラク？席間広めの落ち着き・黒糖ミルク珈琲のカフェイン注意・ベ |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: zashiki kidsChair kidsCutlery

### `uobei`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**

| slug | title |
|---|---|
| `uobei-kodzure-koryaku` | 魚べい・元気寿司は子連れOK？高速レーン・タッチパネル・座席の選び方を実体験で解 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: stepFree zashiki kidsMenu

### `yamadaudon`（記事 1 本 / 出典節 0 本）

公式ドメイン候補: `www.yamada-udon.co.jp`(2)

| slug | title |
|---|---|
| `yamada-udon-kodzure-koryaku` | 山田うどん食堂は子連れOK？座敷・子ども椅子は店舗差・お子様セット390円〜・取 |

記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: なし

