# 既存記事の SEO / GEO / AIO 一括改善スプリント（2026-09-04〜05）

目的: 年内100万PVに向け、既存の上位記事（GSC 90日で imp≥1,500 の212本のうち凍結を除く191本）から
「表示（順位）・クリック（CTR）・回遊（PV/セッション）」の伸び代を取りに行く。新規記事は書かない。

## 診断（着手前の実測）

- GSC 直近28日: 22,830clk / 263,828imp / CTR 8.65% / pos 6.0（前期比 clicks +48%）
- GA4 直近28日: 93,784PV / 74,736sess = **PV/セッション 1.25**。記事着地に限ると **1.21**、
  流入主力のチェーン記事（王将・くら寿司・スシロー…）は 1.15〜1.25。室内遊び場記事は 1.46〜1.61。
  → 既存の回遊モジュール（同チェーン姉妹・比較ハブ・ライバル）は全て本文末尾にあり、平均滞在 70〜90 秒の読者に届いていない。
- AI経由流入（GA4 AI Assistant）: 直近28日 752sess・週次49→240（ChatGPT 98%）。着地Topは室内遊び場×エリア・駅ページ。
- 上位212本の構造スキャン: 確認日なし **136本**／出典節なし **192本**／FAQなし 18本／主意図H2が本文25%より深い 95本。
  GEOの装備インフラ（FAQPage・Speakable・llms.txt）は完備済みで、**欠けていたのはコンテンツ側の一次情報の裏取り**。

## 実施したこと

### A. 描画層（コード）— 全記事に一括適用
- `lib/article-cluster-links.ts` + `components/article/ClusterNav.tsx`: 結論ボックス直下に「同じお店／同じ区の姉妹記事」チップを自動生成。
  チェーン記事160本（デニーズ7本・ジョナサン/ガスト6本…）＋東京23区記事45本の計205本に適用。既存 `getChainCrossLinks` は
  kids-menu↔baby-chair の固定ペアしか張れなかった。
- `lib/chain-facilities.ts`: 大戸屋 kidsMenu を「公式一覧に掲載なし・店舗による」に、はま寿司 kidsChair 注記に「公式FAQで全店舗」を追記。

### B. 記事md — 12エージェント並列で133本を編集（凍結記事はゼロ）
各記事で: ①GSC駆動クエリの最大意図に答えるH2を上部へ移動 ②結論を「固有名詞＋答え＋確認日」の自己完結文に
③検索者の語彙（お子様メニュー／子供椅子／何歳から）を見出しに併記 ④`## よくある質問` を `### Q.` 書式で5〜8問
⑤公式ページを curl で照合した事実にだけ確認日、`## 出典` 節にURL（全URL 200確認） ⑥体験談の数字削除 ⑦同チェーン姉妹・ハブへの文脈リンク。

# chainA 完了(10) ohsho-kids-menu gusto-kodzure-koryaku sushiro-kids-menu burger-king-kodzure-koryaku kurasushi-kids-menu mos-burger-kodzure-koryaku sukesan-udon-kodzure-koryaku kfc-kids-menu burger-king-kids-menu royal-host-kodzure-koryaku
- 王将: 餃子260円→公式363/341円に修正。キッズメニューは全国共通メニューに掲載なし(公式確認)
- ガスト: キッズメニュー表を公式現行(362〜824円)に差替。title「399〜599円」/meta「未就学児ドリンクバー無料」(公式:3歳以下無料・130円)が誤り→タイトル/メタ改題で解消予定。他記事に旧情報: famires-7chain-8koumoku-2026 gusto-vs-jonathan-kodzure-douchi kids-menu-chain-15-hikaku kodzure-famires-zenkoku-kanzen-2026 kodzure-famires-15sen steak-gusto-kodzure-koryaku yumean-kodzure-koryaku famires-kodzure-ranking-2026-10sen jonathan-kodzure-koryaku kodzure-saize-koryaku(凍結) steak-gusto-kodomo-ryokin
- BK攻略: title/meta「410円〜」が誤り(公式460〜490)→改題で解消予定。くら寿司: 「お子様セットはなくなった？」H2新設(2,200imp未回答意図)
- ロイホ: 「編集部に届いた声(約120件・82%)」節は根拠不明統計→要判断(削除候補)。faq.myroyal.jp は403
# chainB 完了(10) torikizoku-kids-menu hamasushi-rinyushoku-mochikomi sushiro-kodzure-koryaku hamasushi-baby-chair kfc-kodzure-koryaku hottomotto-kodzure-koryaku dennys-kids-menu saizeriya-rinyushoku-mochikomi cocoichi-kodzure-koryaku jonathan-kodzure-koryaku
- 鳥貴族350円→390円均一に修正(torikizoku-kodzure-koryaku noindexに旧値残存)。はま寿司補助いす「全店舗」公式明記
- KFC攻略: title/meta主軸「低アレルゲンチキンセット」が公式メニューに無い(「なくなった」299imp)→改題で解消予定(新titleに低アレルゲンを入れない)
- デニーズ: meta「小学生以下」公式で確認できず(未修正)
# chainE 完了(10) yayoiken-kids-menu washoku-sato-kodzure-koryaku yakiniku-king-koshitsu cocos-koshitsu gyukaku-kids-menu anrakutei-kids-menu bandotaro-kodzure-koryaku tenya-kids-menu marukame-rinyushoku-mochikomi hidakaya-kodzure-koryaku
- 牛角/安楽亭の推定リスト撤去済。ばんどう太郎はhttps不可→httpで出典
- 未修正: yakiniku-king-kids-menu title/meta/lede「キッズメニュー・未就学児無料」(公式:専用キッズメニューなし・幼児無料)／kodzure-famires-zenkoku-kanzen-2026に牛角旧品名／kids-menu-chain-15-hikaku(noindex)てんや価格帯
# miscK2 完了(12)
- 公文月謝7,150→7,480/8,030円、学研8,800→9,680円に修正。新幹線こども料金の誤り2件修正。moony-vs-goon旧商品名→現行名
- 旧情報残存: eigo-naraigoto-nansai-kara kodomo-online-eikaiwa-osusume-2026 chiku-naraigoto-kumon-shichida-monte kumon-vs-shichida-vs-monte-comparison(公文/学研月謝)／shussan-junbi-rakuten-0sai(エアフィット)
- 自己カニバリ候補: kosodate-shien-toha と kosodate-shien-center-toha が同一タイトル
# chainC 完了(10) kurasushi-baby-chair bigboy-kids-menu mcdonalds-kids-menu marugame-kodzure-koryaku jonathan-kids-menu gyukaku-kodzure-koryaku marukame-kids-menu misdo-kodzure-koryaku kappa-sushi-kids-menu marugen-ramen-kodzure-koryaku
- かっぱ寿司価格を現行(セット540/プレート290)に修正。旧価格残存: kaitenzushi-kids-menu(→修正済み)
- bigboy meta「お子様プレート、キッズハンバーグ」公式に無い名称(→修正済み)
- 新規ERROR: shitsunai-asobi-shibuya-tokyo (indoorJ担当・要確認)
# chainF 完了(12) komeda-kodzure-koryaku hama-sushi-kodzure-koryaku flying-garden shabuyo-koshitsu starbucks sanmarc-cafe doutor(改題33字) steakgusto-baby-chair steakgusto-kids-menu dennys-rinyushoku-mochikomi sukiya-baby-chair ohsho-baby-chair
- しゃぶ葉個室: 公式店舗APIで23区55店照合→個室=錦糸町PARCOのみ・座敷=武蔵小山のみ
- 旧情報残存: laketown-kids-menu(サンマルク470円→公式490円)／cafe-chain-kodzure-ranking-2026-6sha(ドトール260円×3)／lib/chain-facilities.ts はま寿司kidsChair注記(公式は全店設置)
# spotG 完了(14) kasai-aquarium costco×2 karuizawa-shopping-mall ikea×2 puroland×2 disney×2 tds-stroller haneda×2 fuji-safari
- 修正した食い違い: 葛西所要時間(公式FAQ1.5〜2h)・お弁当レストラン持込可／軽井沢あそびパーク大人200→250円／IKEAスモーランド4〜10歳→満4歳以上11歳未満／ピューロ10月開園時刻・休館日追記／富士サファリ授乳室・ベビーカー貸出1,000円・駐車台数削除
- 照合不可(SPA): コストコ全般。旧情報残存: haneda-stroller-kids-space(1F→B1F表記)
# hubH 完了(12) famires-15sen morning-cafe-10 deli-takeout-10 gaishoku-baby-chair-matome rinyuushoku-mochikomi-ok-tokyo-15 bebycar-ok-cafe-15 kaiten-sushi-4chain gyudon×2 yakiniku-5chain kodzure-yakiniku-shabu-7 gusto-vs-jonathan
- ハブの値を個別記事の公式確認値に揃えた(ガスト362円〜/ドリンクバー130円3歳以下無料、しゃぶ葉未就学児無料・小学生1,099円、デニーズ704円、ココス594円 等)。「朝食バー」(公式に無い)3箇所を確認できずに書換。「多店舗」表記を撤去
- 旧情報残存(要目視): ガスト399円系→famires-7chain-8koumoku-2026 kodzure-famires-zenkoku-kanzen-2026 shumatsu-gohan-tsukurioki-nashi kids-menu-chain-15-hikaku(noindex)／しゃぶ葉3歳以下無料系→kagonoya onyasai yuzuan tabehoudai-kodomo-ryokin-hikaku shabushabu-yakiniku-buffet-3chain kodzure-restaurant-erabikata-kanzen-guide kids-menu-nansai-kara-hayami(noindex) ＋凍結(bamiyan-kodzure-koryaku, kodzure-saize-koryaku)／IKEA「離乳食無料提供」未確認(ikea-restaurant-kodzure-koryaku等)
# areaI 完了(7) tokyo-station/shinagawa/ginza/kichijoji/ikebukuro-kodzure-lunch, tokyo-kodomo-mushiyoke-spot, kosodate-muryou-spots-tokyo
- 「複数店舗あり」を全撤去し公式店舗検索で店名確定。東京駅サイゼ→コメダ京橋に差替、品川はスタバ/コメダを外した節へ
- title「8か所」vs本文7か所 (tokyo-shinagawa) →要修正
- 照合できず: 井の頭自然文化園等の「中学生以下無料」(都立園は都内在住在学限定の可能性)
# itsukaraK1 完了(11) grape onsen-tamago aisu ramen lemon tkg yakiniku peanut nuts petit-tomato chocolate
- 一次情報13件(消費者庁/日本小児科学会Ver.3/こども家庭庁CDR/厚労省ガイド/食品安全委員会/農水省)で全記事に出典節・免責を完備
- 事実誤り修正: ナッツ「3歳以下」→公式「5歳以下」(2021改定)／くるみ特定原材料2025→2023-03-09／生レバー「18歳以上推奨」→2012年販売禁止／TKG「熱々ご飯で殻の菌が死ぬ」撤回
- 見出し前出し: grape品種別43%→上／aisuかき氷42%→上／yakiniku部位別38%→上／nuts種類50%→上／chocolate種類別49%→上
- 旧情報残存: kodomo-petittomato-itsukara(noindex重複)
# chainD 完了（10本）sushiro-baby-chair / hamasushi-kids-menu / ootoya-kodzure-koryaku / yakiniku-king-kids-menu / saizeriya-baby-chair / nakau-kids-menu / yoshinoya-kodzure-koryaku / marukame-baby-chair / ringerhut-kids-menu / tenkaippin-kodzure-koryaku
- 見出し移動: ootoya(29%→上部), tenkaippin(29%→上部)。新H2: yakiniku-king-kids-menu「子供料金」, ringerhut「何歳から」
- 局所修正: 大戸屋「お子様膳」→公式に掲載なし／きんぐ「専用キッズメニューなし」「幼児無料」表記
- 未修正の食い違い: yoshinoya-kodzure-koryaku metaの「キッズ牛丼セット」(公式名ミニ牛丼セット)／lib/chain-facilities.ts ootoya kidsMenu:V(true) が公式不整合
- 他記事に残る旧情報: kids-menu-nansai-kara-hayami, teishoku-chain-kodzure-ranking-4sha(大戸屋お子様膳)／「未就学児無料」表記: tabehoudai-kodomo-ryokin-hikaku, yuzuan-kodzure-koryaku, shabushabu-chain-kodzure-ranking-2026-5sha, kids-menu-chain-15-hikaku, shabushabu-yakiniku-buffet-3chain, anrakutei-kodzure-koryaku, yakiniku-5chain-kodomo-2026／yoshinoya-kids-menu「キッズ牛丼セット」

## タイトル変更（17本）
承認済みの60字超15本のうち14本（びっくりドンキーは実験2対照群で除外）＋ドトール（価格誤りの改題）＋事実誤りの2本（焼肉きんぐ「未就学児無料」→公式「幼児無料」／品川「8か所」→本文7か所）。

| slug | 旧title（字数） | 新title（字数） |
|---|---|---|
| burger-king-kodzure-koryaku | バーガーキングのキッズメニュー（キッズセット）は410円〜の3種・2歳前後から｜子供向けの中身はポテトS＋ドリンクS・おもちゃなし・何歳から【2026】（76） | バーガーキングは子連れOK？キッズセットの今のおもちゃと取り分け術【2026】（39） |
| cocoichi-kodzure-koryaku | CoCo壱番屋（ココイチ）は子連れOK？お子さまカレー・甘口・1歳からのやさしい野菜カレー・アレルギー対応を徹底解説【2026】（64） | ココイチは子連れOK？離乳食・ベビーフード持ち込みと1歳からのカレー【2026】（40） |
| disney-omutsu-gae | ディズニーのおむつ替えは園内ほぼ全レストルーム（男女とも）｜シーのベビーセンターは2026年10月2日まで休止【2026年】（62） | ディズニーランドのおむつ替えはどこ？交換台の場所とおむつの捨て方【2026】（38） |
| doutor-kodzure-koryaku | ドトールコーヒーは子連れにラク？価格最強だけど席間タイト＝動線が勝負・ミラノサンドの取り分け・ロイヤルミルクティーのカフェイン注意まで徹底解説【2026】（77） | ドトールにキッズメニューはある？子連れ・ベビーカー攻略【2026】（33） |
| gusto-kodzure-koryaku | ガストの離乳食は温め依頼OK・持込も可｜キッズメニュー399〜599円・ベビーチェアは6ヶ月〜・子連れベビーカー入店【2026】（64） | ガストは赤ちゃん連れOK？離乳食持ち込み・ベビーチェア・ベビーカー解説【2026】（41） |
| haneda-rinyushoku-milk | 羽田空港のミルク用のお湯は全ベビールームで70℃以上｜離乳食の温めはT1・T2に集中・T3は公式PDFに1店だけ【2026年】（63） | 羽田空港で離乳食はどこで食べる？販売・温め・ミルクのお湯の場所【2026】（37） |
| hottomotto-kodzure-koryaku | ほっともっとは子連れにラク？ネット注文・お子さまメニュー・のり弁は何歳から・持ち歩きの食中毒対策まで徹底解説【2026】（60） | ほっともっとにキッズメニュー・お子様メニューはある？何歳からOK？【2026】（39） |
| kfc-kids-menu | ケンタッキーのキッズメニューは590円の2種｜キッズナゲットセット／キッズオリジナルチキンセットの値段・グッズ・骨なしの選び方・何歳から【2026年8月確認】（79） | ケンタッキーのキッズセット｜今のおもちゃ・グッズは？値段と何歳から【2026】（39） |
| kfc-kodzure-koryaku | ケンタッキー（KFC）の低アレルゲンチキンセットは特定原材料7品目不使用｜子連れは骨なしチキン・ナゲット一択・キッズメニューは何歳から【2026】（73） | ケンタッキーは何歳から？1歳半・2歳の取り分けと骨なしチキンの選び方【2026】（40） |
| mcdonalds-kids-menu | マクドナルドのハッピーセットは何歳から？公式の年齢下限はなし・1歳半〜2歳が目安｜何歳まで・値段510円〜・おもちゃ・メニューの選び方【2026】（73） | ハッピーセットは何歳から何歳まで？年齢制限・値段・おもちゃの選び方【2026】（39） |
| misdo-kodzure-koryaku | ミスタードーナツ（ミスド）は子連れOK？キッズセット・グッズ・もちもち系の窒息対策・低アレルゲンドーナツの選び方を徹底解説【2026】（67） | ミスドのキッズセットは今何がある？値段・グッズ・何歳からを解説【2026】（37） |
| mos-burger-kodzure-koryaku | モスバーガーの低アレルゲンメニューは8大アレルゲン不使用｜モスワイワイセットは何歳から・オニオン/マスタード抜き＋おもちゃ・キッズメニューと待ち対策【2026】（80） | モスバーガーは1歳・1歳半から食べられる？低アレルゲンと子連れ攻略【2026】（39） |
| nakau-kids-menu | なか卯のキッズメニューはお子様うどん200円から｜うき卯きセットの中身とおもちゃ・1歳から取り分けOK・何歳から【2026】（62） | なか卯のキッズメニュー（お子様セット）は何歳から？おもちゃ・値段【2026】（38） |
| sanmarc-cafe-kodzure-koryaku | サンマルクカフェは子連れにラク？看板チョコクロの「中が熱い」やけど注意・キッズセット・ベビーカー入店まで徹底解説【2026】（62） | サンマルクカフェのキッズセットは何歳まで？大人も頼める？中身と値段【2026】（39） |
| tokyo-shinagawa-kodzure-lunch | 品川 子連れランチ8か所｜授乳室はアトレ品川3F・4F【2026年8月 公式確認】（41） | 品川 子連れランチ7か所｜授乳室はアトレ品川3F・4F【2026年9月 公式確認】（41） |
| yakiniku-king-kids-menu | 焼肉キングのキッズメニュー・未就学児無料｜年齢別の中身と注文のコツ完全ガイド（38） | 焼肉きんぐのキッズメニューは？幼児無料・小学生半額の年齢別ガイド【2026】（38） |
| yayoiken-kids-menu | やよい軒のお子様メニューは税込490円・おもちゃ付き・7歳以下｜お子様ランチ／子供メニュー／低アレルゲンカレーの値段と何歳から【2026】（69） | やよい軒の子供メニュー（お子様ランチ）は何歳まで？値段・おもちゃ【2026】（38） |
# indoorJ 完了(12) shitsunai-asobi-{shibuya,nakano,suginami,shinjuku,itabashi,sumida,ota,bunkyo,minato,koto,setagaya,kita}-tokyo（+1,252/−936行、出典URL119本すべて200）
- 架空・誤記の施設を多数是正: 恵比寿/幡ヶ谷児童館(存在せず)、新宿3施設名、板橋3館名、港区2施設名、北区2館名、押上児童館(存在せず)、リトルプラネット有明(無し)
- 重要な鮮度: 蒲田児童館2026-09-01から改修休館／がすてなーに2026-09-23閉館／新宿ミロード閉館／ネウボラ土曜休
- 3ビル(虎ノ門ヒルズ・ミッドタウン・麻布台)のベビールーム設備を公式記載に縮小
- 未修正: suginami title/meta「入館無料」(公式で確認できず)／natsuyasumi-hakubutsukan-jiyukenkyu-2026(がすてなーに閉館)／アネビートリムパーク言及5本(営業状況未確認)
- 実験7注記: 杉並記事の「荻窪」(処置群)言及30→36

## メインセッションで追随した修正（エージェント報告を受けて）
- 焼肉きんぐ kids-menu の title/meta/lede「未就学児無料」→公式「幼児無料」・「専用キッズメニューなし」に修正
- 吉野家攻略 meta/lede「キッズ牛丼セット」→公式名「ミニ牛丼セット（お子様セット）」
- ビッグボーイ meta の公式に無い品名→「おこさまプレミアムセット・キッズ手ごねハンバーグ」
- 品川ランチ title「8か所」→本文と一致する「7か所」・確認日を9月に
- ガスト攻略の本文に残っていた「399円」「未就学児ドリンクバー無料」を公式（362円〜・130円・3歳以下無料）に全置換
- ハブ追随: cafe-chain-kodzure-ranking-2026-6sha（ドトール260→300円）／laketown-kids-menu（サンマルク470→490円）／kaitenzushi-kids-menu（かっぱ寿司310/510→290/540円）／
  famires-7chain-8koumoku-2026・kodzure-famires-zenkoku-kanzen-2026・shumatsu-gohan-tsukurioki-nashi・yumean・steak-gusto-kodzure-koryaku（ガスト399円系→362円〜）／
  yuzuan・kagonoya・onyasai・kodzure-restaurant-erabikata・shabushabu-yakiniku-buffet-3chain（しゃぶ葉「3歳以下無料」→未就学児無料・小学生1,099円）
- natsuyasumi-hakubutsukan-jiyukenkyu-2026 に「がすてなーに 2026-09-23閉館」を追記
- 杉並室内の meta/lede「入館無料」（公式で確認できず）を削除
- `lib/chain-facilities.ts`: 大戸屋 kidsMenu を店舗判断に、はま寿司 kidsChair に公式FAQ全店設置を追記
- `scripts/check-cross-article-facts.mjs`: 「ベビーカー貸出」「フロアガイド」が施設名として拾われる誤検知を停止語に追加

## 最終検証（2026-09-05）
- gray-matter: 編集した記事md全件で slug/title/updatedAt を読めることを確認
- check-fabricated-claims ✓／check-cross-article-facts ERROR 0／check-parking-claims 新規0／check-internal-links 切れ0
- `tsc --noEmit` exit 0

## 未対応（次の宿題）
- KFC攻略: 旧titleの主軸だった低アレルゲンチキンセットは公式メニューから消えている（本文は「確認できず」に書換済み。新titleは骨なしチキン軸）
- ロイヤルホスト攻略「編集部に届いた声（約120件・82%）」は根拠不明の統計→削除候補（捏造統計撤去方針）
- 旧情報が残る記事: torikizoku-kodzure-koryaku（350円均一・noindex）／kids-menu-nansai-kara-hayami・kids-menu-chain-15-hikaku（noindex・複数）／eigo-naraigoto-nansai-kara ほか公文・学研の旧月謝4本／shussan-junbi-rakuten-0sai（ムーニー旧商品名）／haneda-stroller-kids-space（B1F表記）／アネビートリムパーク言及5本（営業状況未確認）／kodzure-famires-zenkoku-kanzen-2026 のガスト個別メニュー（公式に無い品名が本文に多数）
- 自己カニバリ候補: kosodate-shien-toha と kosodate-shien-center-toha が同一タイトル
- 実験7注記: 杉並記事の「荻窪」言及が30→36（処置群）。判定時に考慮
- 実験判定の予定: 実験5/6 9/30、今回の15本title 10/05頃、回遊チップは GA4 pages/session（記事着地1.21→）を9月中旬・10月上旬に
