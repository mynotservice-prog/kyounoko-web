/**
 * スポットの公式サイトURL。**自動生成ファイル（手で編集しない）**。
 *
 *   生成: node scripts/build-official-urls.mjs <verified.tsv>
 *   検証: node scripts/verify-official-urls.mjs <candidates.json> --out=<verified.tsv>
 *
 * 収録しているのは **実際に HTTP 200 で取得し、<title> が施設と対応することを確認できたURL だけ**。
 * 誤った公式リンクは未設定より悪い（別の施設へ送客する）ので、確認できないものは入れない。
 * 行末のコメントは確認時点のページタイトル＝採用の根拠。
 *
 * 調べたうえで意図的に入れていないもの:
 *  - IKEA レストラン（新三郷・立川・原宿等）: 複数店舗の総称で、対応する単一の公式ページが無い（個別店舗ページは別途登録済み）
 *  - コストコ 多摩境倉庫 フードコート: costco.co.jp/store-finder/Tamasakai は JS 描画で本文が取れず、多摩境の店舗ページだと確認できなかった
 *
 * キー（スポット名）は lib/spots.ts の name と完全一致させること。
 * spots.ts 側で name 一致により officialUrl が自動マージされる（overrides で表示名を
 * 変えても外れないよう、上書き前の name でマージしている）。
 */
export const SPOT_OFFICIAL_URLS: Record<string, string> = {
  "551蓬莱": "https://www.551horai.co.jp/", // 551HORAI 蓬莱 大阪名物の豚まん[肉まん]
  "A-FACTORY（青森駅前）カフェ＆レストラン": "https://afactory-abc.com/", // A-FACTORY | 青森ウォーターフロント
  "IKEA 港北 レストラン": "https://www.ikea.com/jp/ja/stores/yokohama/", // IKEA横浜ストア情報（営業時間・アクセスなど）｜IKEA【公式】 - IKEA
  "IKEA 神戸 レストラン": "https://www.ikea.com/jp/ja/stores/kobe/", // IKEA神戸 ストア情報（営業時間・アクセスなど）｜IKEA【公式】 - IKEA
  "IKEA 長久手 レストラン": "https://www.ikea.com/jp/ja/stores/nagakute/", // IKEA長久手 ストア情報（営業時間・アクセスなど）｜IKEA【公式】 - IKEA
  "IKEA 鶴浜 レストラン": "https://www.ikea.com/jp/ja/stores/tsuruhama/", // IKEA鶴浜 ストア情報（営業時間・アクセスなど）｜IKEA【公式】 - IKEA
  "IKEA 立川 レストラン": "https://www.ikea.com/jp/ja/stores/tachikawa/", // IKEA立川 ストア情報（営業時間・アクセスなど）｜IKEA【公式】 - IKEA
  "JRタワー T38 展望レストラン": "https://www.jr-tower.com/t38", // JRタワー展望室 タワー・スリーエイト公式サイト｜JR TOWER Observatory T38
  "アスティ岐阜 レストラン": "https://www.nsk-eki.com/asty-gifu/", // ASTY岐阜【公式】 | 名古屋ステーション開発
  "アトレ吉祥寺 レストランフロア": "https://www.atre.co.jp/kichijoji/", // アトレ吉祥寺-atre-
  "アトレ大森 レストラン": "https://www.atre.co.jp/omori/", // アトレ大森-atre-
  "あべのキューズモール（天王寺・阿倍野）": "https://qs-mall.jp/abeno/", // あべのキューズモール
  "あべのハルカス ダイニングフロア": "https://abenoharukas.d-kintetsu.co.jp/", // あべのハルカス近鉄本店
  "あべのハルカス近鉄本店（天王寺・阿倍野）": "https://abenoharukas.d-kintetsu.co.jp/", // あべのハルカス近鉄本店
  "お好み焼き 鶴橋風月": "https://fugetsu.jp/", // お好み焼き・焼きそばの鶴橋風月
  "ガスト": "https://www.skylark.co.jp/gusto/", // ガスト｜ファミリーレストラン｜すかいらーくグループ
  "かっぱ寿司": "https://www.kappasushi.jp/", // かっぱ寿司 | 回転寿司
  "カプリチョーザ": "https://capricciosa.com/", // カプリチョーザ公式ホームページ
  "クイーンズスクエア横浜（みなとみらい）": "https://www.qsy-tqc.jp/", // クイーンズスクエア横浜［Queen&#039;s Square YOKOHAMA］
  "グランスタ東京 駅構内ダイニング": "https://www.gransta.jp/", // 東京駅 構内のショップ・レストラン グランスタ【公式】 | TOKYOINFO
  "グランフロント大阪（梅田）": "https://www.grandfront-osaka.jp/", // グランフロント大阪｜GRAND FRONT OSAKA
  "くら寿司": "https://www.kurasushi.co.jp/", // くら寿司｜回転寿司｜
  "クレメントプラザ徳島 レストラン": "https://clementplaza.com/", // 徳島駅クレメントプラザ
  "ケンタッキーフライドチキン": "https://www.kfc.co.jp/", // KFC
  "ココス": "https://www.cocos-jpn.co.jp/", // ココス ファミリーレストラン [COCO'S]
  "コメダ珈琲店": "https://www.komeda.co.jp/", // コメダ珈琲店
  "サイゼリヤ": "https://www.saizeriya.co.jp/", // サイゼリヤ | La Buona Tavola! 楽しい食卓
  "サッポロファクトリー レストラン": "https://sapporofactory.jp/", // サッポロファクトリー公式WEBサイト_札幌市
  "シーモール下関 レストラン": "https://www.seamall.jp/", // シーモール（Seamall）のホームページ-下関商業開発株式会社- &#8211; 山口県下関の「Seamall（シーモール）」。ショッピング、グルメ、エンターテイメントと何でも揃うショッピングセンターです。
  "しゃぶ葉": "https://www.skylark.co.jp/syabuyo/", // しゃぶしゃぶ食べ放題 ｜しゃぶ葉 | すかいらーく
  "ジョイナス（横浜駅西口）": "https://www.sotetsu-joinus.com/", // JOINUS | ジョイナス
  "ジョナサン": "https://www.skylark.co.jp/jonathan/", // ジョナサン｜ファミリーレストラン｜すかいらーくグループ
  "スガキヤ（中京圏チェーン）": "https://www.sugakico.co.jp/", // スガキコシステムズ株式会社 | スガキヤ・たこ寿・らー麺金ことぶき。など愛知のグルメブランド
  "すき家": "https://www.sukiya.jp/", // すき家
  "スシロー": "https://www.akindo-sushiro.co.jp/", // 株式会社あきんどスシロー
  "ステーキガスト": "https://www.skylark.co.jp/steak_gusto/", // ステーキガスト｜ステーキ・ハンバーグ｜すかいらーくグループ
  "すみれ（札幌ラーメン）": "http://www.sumireya.com/", // 札幌の味噌ラーメン すみれ
  "そごう横浜 レストラン街（横浜駅東口）": "https://www.sogo-seibu.jp/yokohama/", // そごう横浜店 | 西武・そごう
  "そごう千葉（千葉そごう）": "https://www.sogo-seibu.jp/chiba/", // そごう千葉店 | 西武・そごう
  "そごう大宮": "https://www.sogo-seibu.jp/omiya/", // そごう大宮店 | 西武・そごう
  "タリーズコーヒー（Tully's）キッズメニュー対応店": "https://www.tullys.co.jp/", // Taste The Difference | TULLY'S COFFEE - タリーズコーヒー
  "デニーズ": "https://www.dennys.jp/", // デニーズ公式サイト - いらっしゃいませ、デニーズへようこそ
  "なか卯": "https://www.nakau.co.jp/", // なか卯
  "なんばパークス（難波）": "https://nambaparks.com/", // なんばパークス（なんばPARKS）
  "バーミヤン": "https://www.skylark.co.jp/bamiyan/", // バーミヤン｜中華料理｜すかいらーくグループ
  "はま寿司": "https://www.hamazushi.com/", // TOP｜はま寿司｜回転寿司
  "パルシェ静岡 レストラン": "https://www.parche.co.jp/", // JR静岡駅直結でお買いものに便利！ | パルシェ
  "ビッグボーイ": "https://www.bigboyjapan.co.jp/", // ビッグボーイ公式
  "びっくりドンキー": "https://www.bikkuri-donkey.com/", // びっくりドンキー
  "フォルクス": "https://www.volks-steak.jp/", // フォルクストップページ
  "フレッシュネスバーガー": "https://www.freshnessburger.co.jp/", // FRESHNESS BURGER フレッシュネスバーガー
  "ペリエ千葉": "https://www.perie.co.jp/chiba/", // トップページ｜ペリエ千葉
  "マクドナルド": "https://www.mcdonalds.co.jp/", // マクドナルド公式サイト | マクドナルド公式
  "ミスタードーナツ": "https://www.misterdonut.jp/", // ミスタードーナツ
  "モスバーガー": "https://www.mos.jp/", // モスバーガー公式サイト
  "ランドマークプラザ（みなとみらい）": "https://yokohama-landmark.jp/", // 横浜ランドマークタワー
  "リンガーハット": "https://www.ringerhut.jp/", // 長崎ちゃんぽん リンガーハット
  "ルクア大阪 バルチカ": "https://www.lucua.jp/", // ルクア大阪 | LUCUA osaka
  "ルクア大阪（梅田）": "https://www.lucua.jp/", // ルクア大阪 | LUCUA osaka
  "ルミネ大宮": "https://www.lumine.ne.jp/omiya/", // ルミネ大宮 │ LUMINE
  "ロイズチョコレートワールド": "https://www.royce.com/brand/contents/chocolateworld/", // ロイズ チョコレートワールド｜ロイズ（ROYCE'）公式サイト
  "ロイヤルホスト": "https://www.royalhost.jp/", // ファミリーレストラン ロイヤルホスト - Royal Host -
  "横浜タカシマヤ レストラン（横浜駅西口）": "https://www.takashimaya.co.jp/yokohama/", // 横浜高島屋｜トップページ
  "横浜ランドマークタワー ドックヤードガーデン レストラン": "https://yokohama-landmark.jp/", // 横浜ランドマークタワー
  "横浜赤レンガ倉庫 レストランフロア": "https://www.yokohama-akarenga.jp/", // 横浜赤レンガ倉庫｜横浜の観光、イベント、文化や歴史を楽しめる施設
  "華屋与兵衛": "https://www.hanayayohei.co.jp/", // 華屋与兵衛
  "蒲田グランデュオ レストランフロア": "https://www.granduo.jp/kamata/", // 【グランデュオ蒲田】蒲田駅直結｜ファッション・コスメ・フード・レストランが集うショッピングモール｜GRANDUO
  "丸亀製麺": "https://jp.marugame.com/", // ここのうどんは、生きている。丸亀製麺
  "祇園辻利／都路里": "https://www.giontsujiri.co.jp/", // 祇園辻利・茶寮都路里 公式サイト
  "吉野家": "https://www.yoshinoya.com/", // 吉野家公式ホームページ
  "牛たん炭焼 利久": "https://corp.rikyu-gyutan.co.jp/", // 牛たん炭焼 利久
  "京都ポルタ 地下街レストラン": "https://www.porta.co.jp/", // 京都ポルタ
  "京都駅ビル ザ・キューブ・ジェイアール京都伊勢丹 レストラン": "https://www.kyoto-station-building.co.jp/", // 京都駅ビル [KYOTO STATION BUILDING]
  "近鉄百貨店奈良店 レストランフロア": "https://www.d-kintetsu.co.jp/nara/", // 近鉄百貨店 奈良店
  "金沢百番街 あんと レストラン": "https://www.100bangai.co.jp/", // 金沢百番街（あんと・あんと西・Rinto）
  "元祖長浜屋": "https://www.ganso-nagahamaya.com/", // 福岡市中央区長浜 ラーメン とんこつ 創業昭和27年 元祖長浜屋
  "三井ショッピングパーク ららぽーとTOKYO-BAY": "https://mitsui-shopping-park.com/lalaport/tokyo-bay/", // ららぽーとTOKYO-BAY
  "志津香": "https://kamameshi-shizuka.jp/", // 奈良で創業60余年 直火炊き釜めし「志津香」
  "渋谷ヒカリエ ShinQs ダイニング": "https://www.hikarie.jp/", // 渋谷ヒカリエ｜渋谷駅直結のショッピング・グルメ・イベント複合施設【公式】
  "松屋": "https://www.matsuyafoods.co.jp/", // 松屋フーズ｜牛めし（牛丼）、カレー、定食、その他丼物でおなじみの松屋をはじめ、とんかつ業態、鮨業態、ラーメン業態、カフェ業態を運営
  "松山三越 レストランフロア": "https://www.mitsukoshi.mistore.jp/matsuyama.html", // 松山三越 | 三越 店舗情報
  "松尾ジンギスカン": "https://www.matsuo1956.jp/", // 松尾ジンギスカン公式サイト 北海道の札幌・滝川・千歳などに展開
  "湘南T-SITE（藤沢） カフェ＆レストラン": "https://store.tsite.jp/shonan/", // 湘南T-SITE | 蔦屋書店を中核とした生活提案型商業施設
  "焼肉きんぐ": "https://www.yakiniku-king.jp/", // 焼肉きんぐ公式サイト｜焼肉 食べ放題 飲み放題
  "上島珈琲店・キッズ向けカフェ": "https://www.ueshima-coffee-ten.jp/", // 上島珈琲店
  "上野松坂屋 上野フロンティアタワー レストラン": "https://www.matsuzakaya.co.jp/ueno/", // 松坂屋上野店
  "新宿高島屋 14Fダイニング": "https://www.takashimaya.co.jp/shinjuku/", // 新宿高島屋｜トップページ
  "新千歳空港 ターミナルビル ファミリーレストラン": "https://www.hokkaido-airports.com/ja/new-chitose/", // 新千歳空港
  "神戸三宮センタープラザ レストラン": "https://kscp.co.jp/", // 株式会社神戸サンセンタープラザF | 株式会社神戸さんセンタープラザ
  "世界の山ちゃん": "https://www.yamachan.co.jp/", // 世界の山ちゃん【飲み放題付きコース料理が大人気！】
  "大丸札幌店 レストランフロア": "https://www.daimaru.co.jp/sapporo/", // 大丸札幌店
  "大宮タカシマヤ": "https://www.takashimaya.co.jp/omiya/", // 大宮高島屋｜トップページ
  "築地銀だこ": "https://www.gindaco.com/", // 築地銀だこ公式サイト
  "東京ステーションホテル ロビーラウンジ": "https://www.tokyostationhotel.jp/", // 東京ステーションホテル【公式】｜THE TOKYO STATION HOTEL
  "東京ドームシティ ラクーア内 キッズOK店舗群": "https://www.laqua.jp/", // ラクーア - LaQua
  "姫路駅前 ピオレ姫路 レストランフロア": "https://www.jrw-urban.co.jp/piole-himeji/", // ピオレ姫路 piole HIMEJI
  "富山駅 マルート レストラン": "https://www.toyama-stationcity.jp/maroot/floor.php", // フロアガイド | MAROOT | TOYAMA STATION CITY
  "矢場とん": "https://www.yabaton.com/", // 名古屋名物みそかつ 矢場とん - 名古屋と言えば「みそかつ」。「みそかつ」と言えば「矢場とん」
  "六本木ヒルズ ヒルサイド・レストラン群": "https://www.roppongihills.com/", // 六本木ヒルズ - Roppongi Hills
  "和食さと": "https://sato-res.com/sato/", // 和食さと｜サトフードサービス
};
