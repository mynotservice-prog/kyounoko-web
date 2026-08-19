/**
 * スポットの子連れ向け設備データ（公式ソース確認済み）。
 *
 * ※ここは「運営者の実訪問」ではなく、各施設の公式サイト・公式バリアフリー情報で
 *   確認できた事実のみを入れる（Track B）。実訪問の一次情報は KID_REPORTS に入れる。
 * ※キー（スポット名）は lib/spots.ts の name と完全一致させること。
 *   spots.ts 側で name 一致により facilities が自動マージされる。
 * ※確認できなかった項目は値を入れない（undefined のまま）。UI は未確認を △「公式で確認」
 *   と正直に表示するため、嘘の 'yes'/'no' は絶対に入れないこと。
 *
 * 値: 'yes' = 公式に明記あり / 'no' = 公式に「なし」と明記 / 省略 = 未確認
 * note: 公式情報に基づく補足。実訪問を装う表現は使わない。
 *
 * 初回バッチ（2026-06）: 関東の目的地施設48件を5体の調査で公式裏取り。
 * 主な一次ソース = 各施設公式サイト/FAQ、東京都公式バリアフリーDB「だれでも東京」、
 * 各自治体公式ページ。公式で確認できなかった施設は意図的に未登録のまま。
 */
import type { Spot } from './spots';

type Facilities = NonNullable<Spot['facilities']>;

export const SPOT_FACILITIES: Record<string, Facilities> = {
  // ===== 東京都 =====
  '砧公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '東京都公式「だれでも東京」に車椅子対応トイレ9・おむつ交換台7・授乳室の記載。ベビーカー貸出はなし（車いす貸出8台）。' },
  'ASOBono!（東京ドームシティ アソボーノ）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '東京ドームシティ公式にベビーケアルーム・バリアフリートイレ・おむつ替えの記載。ベビーカー貸出は後楽園ホールビル1F無料／ラクーアはコイン式。アソボーノ自体が屋内キッズ施設。' },
  '浅草寺・仲見世': { bathroom: 'yes', diaperChange: 'yes', note: '浅草寺公式に宝蔵門右側・本堂裏の2か所の多目的トイレ（手すり・おむつ替えシート・ベビーチェア）の記載。授乳室は公式記載なし。' },
  '多摩動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '東京ズーネット公式にバリアフリートイレ15・授乳室4・おむつ替えベッド・ベビーカー貸出（1日500円・B型）の記載。' },
  'サンシャイン水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式に本館2Fのベビールーム（授乳用個室・おむつ替え・ミルク用お湯）の記載。水族館ではベビーカー貸出なし（サンシャインシティ内で別途貸出）。' },
  'マクセル アクアパーク品川': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQにザ スタジアム2Fの授乳室、各所のおむつ替え台・ユニバーサルシート付多目的トイレの記載。ベビーカー貸出なし（1F入口に置場あり）。' },
  'カワスイ 川崎水族館': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '運営公式リリースに完全個室ベビーケアルーム「mamaro」（授乳・おむつ替え・離乳食）、各トイレのおむつ台、無料キッズルームの記載。' },
  'しながわ水族館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式「赤ちゃん連れ」案内に授乳室・調乳用温水器、男女トイレ各1のベビーシートの記載。公式に「ベビーカー貸出なし（館内使用は可）」と明記。' },
  '板橋区立こども動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '板橋区公式に個室授乳室2部屋・調乳器・おむつ交換スペース・だれでもトイレ（多機能トイレ）の記載。' },
  '高尾山': { nursingRoom: 'yes', strollerRental: 'yes', note: '高尾登山電鉄公式FAQに山上「高尾山スミカ」店内の授乳スペース、清滝駅でのベビーカー預かり（1台500円）の記載。' },
  '羽村市動物公園': { nursingRoom: 'yes', strollerRental: 'yes', note: 'ヒノトントンZOO公式FAQに管理事務所・スタディホールの授乳室、ベビーカー貸出200円（7か月頃〜2歳・予約不可・数量限定）の記載。' },
  '井の頭自然文化園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '東京ズーネット公式に正門横・管理事務所内の授乳室、資料館を除く全トイレのおむつ交換台、多目的トイレ8か所の記載。公式に「ベビーカー貸出なし」と明記。' },
  '駒沢オリンピック公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '東京都公式「だれでも東京」に車椅子対応トイレ6・おむつ交換台6・授乳室（サービスセンター）の記載。ベビーカー貸出なし。' },
  '小金井公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ13・オストメイト7・おむつ交換台11・授乳室の記載。ベビーカー貸出なし。' },
  '木場公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ7・おむつ交換台5・授乳室の記載。屋内キッズスペース「木場キッズリアム」あり。ベビーカー貸出なし。' },
  '大井町トラックス（OIMACHI TRACKS）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式インフォメーション／「小さなお子さまと楽しむ」にベビー休憩室3か所（1F TRACKS PARK建物内・2F TRACKS STREET-WEST通路脇・3Fフードコート「WELLSIDE TABLE」内／おむつ替え台・調乳専用給湯器・授乳室）、多目的トイレ5か所（1F・2F・3F×2・4F／車いす可・オストメイト・おむつ替え台・ベビーチェア）の記載。授乳室は女性とお子さまのみ入室可で施錠できる。ベビーカー貸出とキッズスペースは公式に記載がないため未確認。' },
  '有明ガーデン': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式「お子様をお連れのお客様へ」に4F・5FのFエレベーター横の赤ちゃん休憩室（おむつ交換台4台・着替え台1台・授乳コーナー5室・ミルク用給湯器・電子レンジ・シンク）、同じ場所のこども用トイレ、車イス対応トイレの記載。ベビーカーは2Fインフォメーション横のシェアリング「Share Buggy」5台（有料）と、1F・2F・5Fのセルフ式（100円コインキーロック式・返却時返金）。4Fに無料の屋内キッズスペース「キッズ有明ガーデン」（0〜6歳）。' },
  '石神井公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ8・おむつ交換台8。公式施設ページにサービスセンターの赤ちゃん・ふらっと（授乳スペース）の記載。ベビーカー貸出なし。' },
  '野川公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ6・おむつ交換台7・授乳室の記載。サービスセンターは赤ちゃん・ふらっと登録。ベビーカー貸出なし。' },
  '武蔵野公園': { bathroom: 'yes', nursingRoom: 'yes', note: 'むさしのの都立公園公式バリアフリー一覧に車椅子使用者用便房・授乳室・赤ちゃん・ふらっとの記載。' },
  '府中の森公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ4・おむつ交換台4・授乳室の記載。赤ちゃん・ふらっと登録施設。ベビーカー貸出なし。' },
  '武蔵国分寺公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '「だれでも東京」に車椅子対応トイレ3・おむつ交換台3・授乳室の記載。赤ちゃん・ふらっと登録施設。' },
  '神代植物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '「だれでも東京」に車椅子対応トイレ14・おむつ交換台13・授乳室・ベビーカー貸出8台の記載。' },
  '林試の森公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ4・ユニバーサルシート付1・おむつ交換台4・授乳室の記載。ベビーカー貸出なし。' },
  '葛西臨海公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '「だれでも東京」に車椅子対応トイレ19・おむつ交換台17・授乳室・ベビーカー貸出3台の記載。サービスセンターは赤ちゃん・ふらっと登録。' },
  '浮間公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '「だれでも東京」に車椅子対応トイレ4・おむつ交換台6・授乳室の記載。サービスセンターは赤ちゃん・ふらっと登録。ベビーカー貸出なし。' },

  // ===== 神奈川県 =====
  '辻堂海浜公園 ジャンボプール': { bathroom: 'yes', diaperChange: 'yes', note: '公式バリアフリー案内に身障者用トイレ（スライドドア・広いスペース・おむつ交換台・手すり）を数か所設置の記載。' },
  'よこはま動物園ズーラシア': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に多目的トイレ（ベビーシート・ベビーチェア）、授乳室5か所、B型ベビーカー貸出600円（正門・北門）の記載。' },
  '新江ノ島水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに館内2か所の授乳室、各多目的トイレのおむつ替えシート、個室授乳室mamaro（1F出口横）、B型ベビーカー貸出300円の記載。' },

  // ===== 千葉県 =====
  '東京ディズニーランド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '園内2か所のベビーセンターに授乳室・おむつ交換ベッドを完備。ベビーカーは1日1,000円でレンタル可（フード付B型）。' },
  '千葉市動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '動物科学館2Fに育児ルーム（授乳室・キッズスペース）、館内トイレ等にベビーシート、多目的トイレあり。ベビーカーはレンタル可。' },
  'ふなばしアンデルセン公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '授乳室・おむつ交換台を複数施設に設置。花の城レストハウスに屋内プレイルーム。車イス対応トイレ15か所。ベビーカー貸出1回100円（B型）。' },
  '県立青葉の森公園 水の広場': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '園内「つくしんぼの家」に授乳室・おむつ替えベッド・多目的トイレ・屋内遊びスペースあり（千葉市「赤ちゃんの駅」登録）。' },
  '袖ケ浦公園 じゃぶじゃぶ池': { bathroom: 'yes', diaperChange: 'yes', note: 'おむつ替え用ベビーベッドとチャイルドチェアを備えた多目的トイレを2か所設置（8:00〜17:00）。' },
  '柏の葉公園 噴水広場': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公園センターに授乳室、多目的トイレ内および公園センター・体育館・レストハウスの女子トイレにおむつ替えシートの記載。' },

  // ===== 栃木県 =====
  'あしかがフラワーパーク': { nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに授乳室あり（給湯設備なし）、ベビーカー貸出「なし」（車イスは無料貸出）の記載。' },
  '那須ハイランドパーク': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式の子連れ案内に授乳室・おむつ替え台、有料ベビーカーレンタル（当日申込可）の記載。' },
  'ツインリンクもてぎ（モビリティリゾートもてぎ）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に授乳・おむつ交換ができる無料個室ベビールーム5か所、ベビーシート設置化粧室・親子個室トイレ、ベビーカー貸出1日500円の記載。' },
  'なかがわ水遊園': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式におもしろ魚館2Fキッズルーム奥の授乳室、前室のおむつ交換ベッド・水道、屋内キッズルームの記載。' },
  '那須サファリパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'no', strollerRental: 'yes', note: '公式FAQにサファリショップ横の多目的トイレ（ベビーシート設置）、入場ゲートでのベビーカー無料貸出（バギー型）の記載。授乳室は「なし」と明記。' },

  // ===== 埼玉県 =====
  'ムーミンバレーパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室（インフォメーション・コケムス1F等）、オストメイト対応の広い多目的トイレ5か所、おむつ替え台8か所、コケムス内キッズスペース、有料ベビーカー貸出の記載。' },
  'むさしの村': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式案内に授乳室2か所、園内各トイレのおむつ替え、中央ゲートでのベビーカー有料貸出300円の記載。多目的トイレは公式観光情報で確認。' },
  '東武動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「お子様のための設備・サービス」に多目的トイレ、全女性用トイレのベビーシート、授乳室、ベビーカー有料貸出（1日500円）の記載。' },
  '埼玉県こども動物自然公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式お役立ち情報に授乳室3か所、各女子トイレ・一部多目的トイレのおむつ交換台、園内3か所でのベビーカー有料貸出の記載。' },
  'トーベ・ヤンソンあけぼの子どもの森公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '飯能市公式情報にホール下の広いトイレ・おむつ替えスペース・授乳室の記載。' },
  '武蔵丘陵森林公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に多目的トイレ複数、授乳室（おむつ台併設）、各ゲートでのベビーカー無料貸出の記載。' },
  'NACK5スタジアム大宮・大宮公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '埼玉県大宮公園公式・さいたま市情報に多目的トイレ、おむつ交換台、事務所内授乳室、ベビーカー無料貸出の記載（スタジアム内は持込不可・ゲート前預かり）。' },

  // ===== 群馬県 =====
  '群馬サファリパーク': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQ（乳幼児をお連れの方へ）に授乳室3か所（総合案内所・売店マルシェ・無料休憩所）、おむつ交換、ベビーカー有料貸出（1回100円）の記載。' },

  // ===== 茨城県 =====
  '国営ひたち海浜公園 大観覧車': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '公式バリアフリー案内に身障者用トイレ併設、ベビーベッド設置トイレ、各ゲートでのベビーカー無料貸出の記載。' },
  '日立市かみね動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '日立市公式に授乳室2か所（ふれあいプラザ1F・エレファントカフェ内）、全トイレのおむつ交換台・ベビーチェア、ベビーカー貸出200円、多目的トイレ2か所の記載。' },

  // ===== 第2バッチ（2026-06）: 関西＋関東次点 81件 =====
  // 三重県
  '志摩スペイン村': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「お子様連れの方へ」にベビールーム（授乳室）3か所、おむつ替えコーナー、A型ベビーカー貸出（1台700円・約90台）の記載。' },
  '名古屋アンパンマンこどもミュージアム＆パーク': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'no', note: '公式Q&Aに施設内2か所の授乳・おむつ替え室、館内の遊具・巨大ジオラマ等の屋内展示の記載。公式に「ベビーカー貸出なし」と明記。' },
  'ナガシマスパーランド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに園内7か所のユニバーサルデザイントイレ、各女子トイレのおむつ替えシート、ベビールーム3か所の個室授乳、メインゲート案内所でのベビーカー貸出500円の記載。' },
  '鈴鹿サーキット': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式の子連れ案内に「だれでもトイレ」、おむつ交換台3台・着替え台、授乳室3部屋＋ベビーセンター、ベビーカー貸出1台600円の記載。' },
  'おやつタウン': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに園内2か所の多機能レストルーム、各所のおむつ交換台、ベビーラウンジ（授乳室）の記載。公式に「車いす・ベビーカー貸出なし（持込可）」と明記。' },
  '伊勢シーパラダイス': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設サービスに1階の車椅子対応多目的トイレ、おむつ替え台2台付き授乳室、デポジット制（1,000円）ベビーカー貸出の記載。' },
  'ミキモト真珠島': { bathroom: 'yes', note: '公式島内図にパールプラザ・記念館等の車椅子対応トイレの表示。おむつ替え・授乳室・ベビーカー貸出は公式で確認できず。' },
  '三重県総合博物館 MieMu': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内に館内3か所の車椅子対応トイレ、3階こども体験展示室横の子ども用便器・おむつ交換ベッド・授乳室、2階カウンターでのベビーカー貸出の記載。' },
  'そらんぽ四日市（四日市市立博物館・プラネタリウム）': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '四日市市公式バリアフリー情報に1〜5階のバリアフリートイレ、各階のおむつ替えベビーシート＋1階個室ベビーベッド、ベビーカー貸出3台の記載。' },
  'ラウンドワンスタジアム みえ・川越IC店': { kidsSpace: 'yes', note: '公式施設紹介に小学3年生まで利用可のキッズ専用エリア「きゅーびーず」の記載。' },

  // 大阪府
  'ひらかたパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「ファミリーサービス」にベビールーム（オムツ交換台・調乳用温水器・授乳室）、多目的トイレ、B型ベビーカー貸出の記載。' },
  'ニフレル': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに1F・2F各1の多目的トイレ、おむつ替え計4か所、女性専用授乳室1F/2F各1の記載。公式に「ベビーカー貸出なし（ EXPOCITYで貸出）」と明記。' },
  '天王寺動物園': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サービス案内に授乳室4か所、各授乳室・園内トイレ各所のベビーベッド、有料ベビーカー貸出（新世界ゲート側・てんしばゲート）の記載。' },
  '万博記念公園': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式「乳幼児連れの方へ」に授乳室5か所、ベビーカー無料貸出（先着順・対象1か月〜24か月未満）の記載。' },
  'キッズプラザ大阪': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式FAQに各階の多目的トイレのベビーシート、4F授乳室、1Fでのベビーカー無料貸出20台（館内のみ）の記載。施設自体が屋内のこども博物館。' },
  'ATCあそびマーレ': { bathroom: 'no', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式FAQにベビールーム・おむつ交換台の記載。公式に「園内に多目的トイレなし」と明記。施設自体が屋内遊園地。' },
  'ピュアハートキッズランド フレスポしんかな': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式店舗ページにおむつ替え専用スペース、個室授乳スペース（調乳・女性限定）、屋内遊具エリアの記載。' },
  'キッズランドUS 大阪ベイタワー店': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式店舗ページに授乳室、ベビーコーナーの記載。屋内遊園地。' },

  // 兵庫県
  'ニジゲンノモリ（淡路島）': { strollerRental: 'yes', note: '公式FAQにベビーカー貸出（大芝生ショップ・数量限定）の記載。' },
  '東条湖おもちゃ王国': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式「小さなお子さま向けサービス」に授乳スペース、各トイレのおむつ替え、ベビーカー貸出（1日1,200円＋保証金）、冷暖房完備の屋内「おもちゃのお部屋」（雨天OK）の記載。' },
  '神戸どうぶつ王国': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設案内に授乳カーテンスペース2か所、おむつ替えシート3か所、多機能トイレ「だれでもトイレ」、ベビーカー有料貸出500円（返却時100円返金）の記載。' },
  '姫路セントラルパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室2か所（ベビーベッド・水道・空調完備）、各所のおむつ替えベッド、ベビーカー貸出（A型6台/B型15台・500円）、多目的トイレ7か所の記載。' },
  '須磨シーワールド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式館内サービス・FAQに各棟1階の授乳室、おむつ替え台、各棟の車イス対応トイレ、ベビーカー有料貸出1日300円の記載（2024年開業）。' },
  '神戸市立須磨離宮公園': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '公式に本園4か所・植物園1か所の車椅子用トイレ、本園トイレのおむつ替えシート、各入口でのベビーカー無料貸出（リクライニング付・生後2か月〜）の記載。' },
  '西猪名公園': { bathroom: 'yes', note: '公式施設案内に多目的トイレの記載。' },
  '神戸アンパンマンこどもミュージアム&モール': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式ファミリー案内・Q&Aに2Fミュージアム/1Fモールの授乳室・おむつ替えベッド、多目的トイレ3か所の記載。公式に「ベビーカー貸出なし」（2F持込不可・置き場あり／1Fモール使用可）と明記。' },
  'ピュアハートキッズランド尼崎つかしん': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式店舗ページに個室授乳スペース（女性限定）・調乳スペース、おむつ替え専用スペース、つかしん南館6Fの完全屋内キッズパークの記載。' },
  '神崎農村公園ヨーデルの森': { strollerRental: 'yes', note: '公式ご利用案内にベビーカー貸出（200円・数量限定）の記載。' },

  // 奈良県
  '生駒山上遊園地': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'no', note: '公式に屋内施設「PLAY PEAK ITADAKI」のおむつ交換室・授乳/調乳室・屋内休憩スペース、FAQに授乳室2か所の記載。公式に「ベビーカー貸出なし」と明記。' },
  '橿原市昆虫館': { bathroom: 'yes', nursingRoom: 'yes', note: '橿原市公式に新館2階の多目的トイレ（オストメイト対応）、本館1階の救護室・授乳室の記載。' },
  '奈良県立民俗博物館・大和民俗公園': { bathroom: 'yes', strollerRental: 'yes', note: '奈良県公式に多目的トイレ、ベビーカー1台の貸出の記載。※博物館は2024年7月から休館中（2027年度再開予定）。' },
  '橿原市立こども科学館': { bathroom: 'yes', note: '橿原市公式の館内案内に車椅子用トイレの記載。' },
  '平城宮跡歴史公園 朱雀門ひろば': { bathroom: 'yes', strollerRental: 'yes', note: '国営公園公式FAQに主なトイレへの多目的トイレ併設、平城宮いざない館でのベビーカー無料貸出の記載。' },
  '生駒山麓公園 ふれあいセンター': { nursingRoom: 'yes', note: '生駒山麓公園公式（ふれあいセンター施設案内）の「その他の施設」に授乳室の記載。' },
  'キッズランドUS 奈良香芝店': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式店舗ページに「室内遊園地」、設備一覧に授乳室・ベビーコーナーの記載。' },
  'うだ・アニマルパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '奈良県公式「こどもとおでかけ情報」に多目的トイレ3か所（オムツ替えシート併設）、動物学習館内の授乳室2部屋、ベビーカー無料貸出3台の記載。' },

  // 和歌山県
  'ポルトヨーロッパ': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQ・設備一覧に授乳室、男女トイレ内のおむつ替えベッド、東西インフォメーションでのベビーカー有料貸出、車椅子用トイレの記載。' },
  'アドベンチャーワールド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サービス施設案内に授乳室（ベビーケアルーム）、女子トイレのおむつ交換台、ベビーカー貸出（900〜1,200円）、主なトイレの車イス用ブースの記載。' },
  '串本海中公園': { bathroom: 'yes', note: '公式営業案内に水族館入口側とレストラン店内の車椅子用トイレ（多目的トイレ）の記載。' },
  '和歌山県立自然博物館': { bathroom: 'yes', note: '公式ご利用案内（バリアフリー）に多目的トイレ／車椅子トイレの記載。' },
  '太地町立くじらの博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に本館1階の授乳室、本館・マリナリュウムのおむつ交換台、受付でのベビーカー無料貸出、多目的トイレの記載。' },
  'さぎのせ公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '岩出市公式に管理事務所内の授乳室、多目的トイレ（オストメイト・ベビーチェア・ベビーシート完備）の記載。' },

  // 京都府
  '京都水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに多目的ルーム併設トイレ4か所、おむつ替え台6台、給湯付き授乳室3か所の記載。公式に「貸し出し用ベビーカーなし」と明記。' },
  '京都市動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に多目的トイレ5か所、授乳室3か所、ベビーシート、正面・東エントランスでの無料貸出ベビーカーの記載。' },
  '京都鉄道博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式お子様連れ案内にベビーベッド備付トイレ、おむつ交換台付き授乳室、屋内キッズパーク、エントランスでの無料ベビーカー貸出の記載。' },
  '宝が池公園 子どもの楽園': { nursingRoom: 'yes', note: '公式（京都市都市緑化協会）ご利用案内に園内の授乳室の記載。' },
  '京都府立植物園': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式（京都府）総合案内に授乳室3か所（北山門・植物園会館・大芝生地南側）、各門でのベビーカー配置の記載。' },
  'けいはんな記念公園': { nursingRoom: 'yes', diaperChange: 'yes', note: '公式に完全個室のベビーケアルーム「mamaro」（授乳・おむつ替え対応、横にベビーベッド）の記載。' },
  'LOGOS LAND（ロゴスランド）': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式に簡易的な授乳室、プラムイン城陽2Fの屋内フリースペース（小さなお子様の遊び場）の記載。' },
  '京都府立 丹波自然運動公園': { nursingRoom: 'yes', note: '公式（指定管理者）にこども広場近くの駐車場付近の授乳室の記載。' },
  'アクトパル宇治': { nursingRoom: 'yes', note: '公式施設紹介に医務室（赤ちゃんの授乳も可）の記載。' },
  'ピュアハートキッズランド伏見桃山': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式店舗ページに多目的トイレ、おむつ替え専用スペース、個室の授乳・調乳スペース（女性限定）、室内遊び場の記載。' },

  // 滋賀県（「琵琶湖博物館」「ブルーメの丘」は表記ゆれ同一施設のため両キーに同データ）
  '琵琶湖博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に車椅子対応トイレ6か所、各トイレのベビーベッド、1Fの授乳室（給湯設備あり）、車いす・ベビーカー無料貸出の記載。' },
  '滋賀県立琵琶湖博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に車椅子対応トイレ6か所、各トイレのベビーベッド、1Fの授乳室（給湯設備あり）、車いす・ベビーカー無料貸出の記載。' },
  'ヤンマーミュージアム': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '滋賀県公式観光サイトの施設情報に車椅子対応トイレ・授乳スペース・オムツ交換スペースの記載。' },
  '滋賀県立びわ湖こどもの国': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '滋賀県公式観光サイトに車椅子対応トイレ・授乳・オムツ交換スペース、運営法人公式に屋内施設「虹の家」（プレイルーム等）の記載。' },
  '草津市立水生植物公園みずの森': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQにロータス館の授乳室、園内3か所のトイレの簡易ベビーベッド、ベビーカー貸出5台の記載。滋賀県公式に車椅子対応トイレの記載。' },
  'ロクハ公園': { diaperChange: 'yes', nursingRoom: 'yes', note: '指定管理者公式FAQに更衣室前トイレを「赤ちゃんの駅」とし授乳・オムツ交換スペースを設置との記載。' },
  '滋賀県立陶芸の森': { bathroom: 'yes', diaperChange: 'yes', note: '滋賀県公式観光サイトの施設情報に車椅子対応トイレ・オムツ交換スペースの記載。' },
  'ブルーメの丘': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設サービスに身障者用トイレ、入園ゲート等の授乳スペース、ベビーカー有料貸出20台の記載。滋賀県公式にオムツ交換スペースの記載。' },
  '滋賀農業公園ブルーメの丘': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設サービスに身障者用トイレ、入園ゲート等の授乳スペース、ベビーカー有料貸出20台の記載。滋賀県公式にオムツ交換スペースの記載。' },

  // 東京都（博物館・科学館・見学施設）
  '江戸川区自然動物園（行船公園）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: 'GO TOKYO（東京都公式観光サイト）の施設情報にバリアフリートイレ・おむつ交換台・授乳室・ベビーカー貸出の記載。' },
  '足立区生物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サイトに2階のおむつ替え室・授乳室、GO TOKYOにバリアフリートイレ・おむつ交換台・授乳室・ベビーカー貸出の記載。' },
  '国立科学博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報および「だれでも東京」に車椅子対応トイレ・おむつ交換台・授乳室・ベビーカー貸出（2台）の記載。' },
  '東京おもちゃ美術館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式FAQにエントランス横「だれでもトイレ」・館内おむつ替えコーナー・赤ちゃん木育ひろば内の授乳スペースの記載。ベビーカーは館内持込不可。' },
  '科学技術館（北の丸公園）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式ご利用案内に多機能トイレ・ベビーシート（1/3/4階）・5階授乳スペースの記載。ベビーカーは1階で預かり。' },
  '日本科学未来館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式バリアフリー/FAQに多目的トイレ・各階おむつ替え台・5階授乳室・1階ベビーカー貸出・キッズスペース「“おや？”っこひろば」の記載。' },
  'がすてなーに ガスの科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに1F・2Fバリアフリートイレ・おむつ交換・1F授乳室・ベビーカー貸出3台の記載。※2026年9月23日閉館予定。' },
  '東京都現代美術館 こどもアトリエ': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式バリアフリーページにバリアフリートイレ・おむつ交換台・授乳室（B1F/1F）・こどもとしょしつ・ベビーカー貸出6台の記載。' },
  'トリックアートミュージアム高尾山': { nursingRoom: 'no', note: '公式FAQで授乳室は「ご用意ありません」と明記。ベビーカーは館内持込不可。' },
  '東京消防庁 消防博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: 'GO TOKYO（東京都公式観光サイト）の施設情報にバリアフリートイレ・おむつ交換台・授乳室の記載。' },
  '地下鉄博物館（葛西）': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQにトイレのベビーベッド（おむつ交換）・授乳室・ベビーカー無料レンタルの記載。' },
  '多摩六都科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: 'GO TOKYO（東京都公式観光サイト）の施設情報にバリアフリートイレ・おむつ交換台・授乳室・ベビーカー貸出の記載。' },

  // 関東（その他）
  '鉄道博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式FAQに多目的トイレ、キッズプラザ・車両ステーション等のおむつ替え台、授乳室、屋内キッズプラザ、ベビーカー貸出「ベビカル」の記載。' },
  '所沢航空発祥記念館': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に1階ロビーの多目的トイレ（オストメイト対応）、全トイレ・展示館女子トイレのオムツ交換台、貸出用ベビーカーの記載。※2025年9月〜2027年3月末予定で大規模改修のため長期休館中。' },
  '航空科学博物館': { nursingRoom: 'yes', note: '公式「展示物・館内のご案内」に明るい雰囲気の授乳室を設置との記載。' },
  'アクアワールド茨城県大洗水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式バリアフリー/キッズサービスに多目的トイレ6か所、おむつ交換台、3階の授乳室＋個室ベビーケアルームmamaro、5階キッズランド、ベビーカー無料貸出13台の記載。' },
  'とちのきファミリーランド': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに正面入口トイレ内のおむつ換え台、案内所裏の赤ちゃんルーム（授乳可）、案内所でのベビーカー無料貸出（B型10台）の記載。' },
  '前橋市中央児童遊園 るなぱあく': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式（指定管理者）園内マップに売店（管理棟）の授乳室・ベビーバギー貸出、おむつ交換スペースの記載。' },

  // ===== 第3バッチ（2026-06）: 中国・四国・九州・沖縄 103件 =====
  // 鳥取県
  'かにっこ館': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式アクセスページに多目的トイレ（オストメイト）・授乳室・ベビーカー貸出の記載。' },
  'わらべ館': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内に授乳室（1F）・オストメイト対応バリアフリートイレ（2F）・ベビーカー8台無料貸出の記載。' },
  'とっとり花回廊': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式案内に授乳室・ベビーカー9台無料貸出（生後半年〜2歳ごろ）の記載。' },
  '倉吉パークスクエア': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '倉吉未来中心公式アクセシビリティ案内に多目的トイレ・おむつ交換シート・授乳室（よりん彩内）・ベビーカー貸出（正面玄関2台）の記載。' },
  // 島根県
  '島根県立しまね海洋館アクアス': { nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式の小さなお子様向け案内に授乳室3か所・キッズルーム・ベビーカー無料貸出の記載。' },
  '松江フォーゲルパーク': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '公式に障がい者用個室トイレ・おむつ交換台（園内6か所）、ベビーカー無料貸出（正面入口）の記載。' },
  '島根県立宍道湖自然館 ゴビウス': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内に多目的トイレ・おむつ替え台（計4か所）・授乳室（女性トイレ内）・ベビーカー貸出の記載。' },
  '島根県立三瓶自然館サヒメル': { diaperChange: 'yes', strollerRental: 'yes', note: '公式の幼児のご利用案内におむつ交換台付トイレ・ベビーカー無料貸出の記載。' },
  '島根県立古代出雲歴史博物館': { bathroom: 'yes', strollerRental: 'yes', note: '公式の身体の不自由な方へ案内に多目的トイレ・車イス/ベビーカー無料貸出の記載。※2025/4〜2026/9リニューアル休館中。' },
  '出雲科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に車いす対応トイレ・おむつ替えベッド・授乳室1か所・ベビーカー無料レンタル2台の記載。' },
  '浜山公園': { nursingRoom: 'yes', kidsSpace: 'yes', note: '島根県公式の施設概要にカミアリーナ（県立浜山体育館）の授乳室・幼児室の記載。' },
  '島根県立しまね花の郷': { strollerRental: 'yes', note: '公式ご利用案内にベビーカー8台貸出（受付申込・予約不可）の記載。' },

  // 岡山県
  'ヒルゼン高原センター ジョイフルパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに園内トイレ3か所・おむつ替え3か所・母乳室2か所、ベビーカー有料貸出300円（B型・生後7〜24か月）の記載。' },
  '池田動物園': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設紹介に園内2か所のベビールーム（授乳スペース・ベビーベッド）、ベビーカー貸出200円の記載。岡山市公式子育てページにも記載。' },
  '渋川マリン水族館': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '玉野市公式FAQにおみやげ売り場横の多目的トイレ（ベビーシート付）、ベビーカー無料貸出2台の記載。' },
  '岡山シティミュージアム': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '岡山市公式バリアフリー情報に5階の授乳室、4・5階の多目的トイレ内おむつ交換設備、貸出用ベビーカー（無料）の記載。' },
  // 広島県
  'みろくの里': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式Q&Aに授乳室、女性用トイレ等のおむつ替え台、ベビーカー貸出300円（保証金1,000円）の記載。' },
  '安佐動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式園内マップにベビールーム、ベビーシート付トイレ、動物科学館横の多目的トイレ、ベビーカー貸出350円の記載。' },
  'みやじマリン 宮島水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに1階インフォメーション横の授乳室、各トイレのおむつ交換台、1・2階の多目的トイレ、ベビーカー無料貸出の記載。' },
  'マリホ水族館': { diaperChange: 'yes', nursingRoom: 'no', strollerRental: 'no', note: '公式FAQ（シン・マリホ水族館）に館内トイレのおむつ交換台の記載。授乳室・ベビーカー貸出は館内になく隣接アルパークで提供と明記。' },
  '福山市立動物園': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式Q&Aに入口ゲート下・管理棟内の授乳室2室、管理棟・改札口・ペンギン舎横の多目的トイレ、ベビーカー貸出100円の記載。' },
  'ヌマジ交通ミュージアム': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに1階の授乳室（受付に声かけ）、各階トイレ内のおむつ替えスペース、エントランスホールの貸出用ベビーカーの記載。' },
  '湯本豪一記念日本妖怪博物館 三次もののけミュージアム': { strollerRental: 'yes', note: '公式利用案内に無料貸出ベビーカー1台（受付申出）の記載。多機能トイレは隣接の交流館にある旨の記載。' },
  '備北丘陵公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室・おむつ替え場所（ビジターセンター・湖畔レストハウス等）、園内各所の多目的トイレ、ベビーカー無料貸出（約50台・3歳まで）の記載。' },

  // 山口県（「海響館」「秋吉台サファリランド」は表記ゆれ同一施設のため両キーに同データ）
  '秋吉台サファリランド': { kidsSpace: 'yes', strollerRental: 'yes', note: '公式園内案内「キッズサファリ」、公式営業案内にベビーカー貸出100円の記載。' },
  '秋吉台自然動物公園サファリランド': { kidsSpace: 'yes', strollerRental: 'yes', note: '公式園内案内「キッズサファリ」、公式営業案内にベビーカー貸出100円の記載。' },
  '下関市立しものせき水族館 海響館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式フロアマップにバリアフリートイレ（各階）、1・3階多目的トイレのおむつ替え台、女性専用授乳室、1・2階キッズコーナー、A型ベビーカー貸出10台の記載。' },
  '海響館（下関市立しものせき水族館）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式フロアマップにバリアフリートイレ（各階）、1・3階多目的トイレのおむつ替え台、女性専用授乳室、1・2階キッズコーナー、A型ベビーカー貸出10台の記載。' },
  'ときわ動物園': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: 'ときわ公園公式ご来園ガイドに動物園入口ほかのオムツ替えコーナー・授乳室・ベビーカー無料貸出の記載。' },
  '防府市青少年科学館ソラール': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '防府市公式「赤ちゃんの駅」・公式施設案内にバリアフリートイレ・おむつ交換台・授乳室・貸出用ベビーカーの記載。' },
  '山口県立山口博物館': { strollerRental: 'yes', note: '公式バリアフリー案内にベビーカー（3台）貸出の記載。' },
  '愛宕山ふくろう公園': { bathroom: 'yes', kidsSpace: 'yes', note: '岩国市公式にバリアフリートイレ、大型複合遊具・インクルーシブ遊具広場の記載。' },
  '長門おもちゃ美術館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'no', note: '公式ご利用案内に多目的トイレ（隣接センザキッチン）、おむつ替え、さじき広場の授乳コーナー、赤ちゃん広場の記載。公式に「館内はベビーカー入館不可」と明記。' },
  // 徳島県
  'とくしまファミリーランド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式施設案内にお手洗い・おむつ交換台・キッズステーション（休憩所・授乳室）の記載。' },
  'とくしま動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '徳島県UDマップ・公式設備ページに多機能トイレ（車いす対応・ベビーシート）、授乳室、貸出用ベビーカーの記載。' },
  '鳴門市ドイツ館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式館内施設ページに1階の車イス用トイレ、インフォメーションのベビーベッド・授乳室の記載。' },
  '徳島県立あすたむらんど': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式利用案内・徳島県UDマップに多機能トイレ（オストメイト対応）・ベビーシート・授乳室・キッズタウン・ベビーカー貸出の記載。' },
  '月見ヶ丘海浜公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式ビジターセンターページにトイレ・手洗い完備、赤ちゃんのお世話スペース（おむつ替えシート・授乳室）の記載。' },
  '鳴門ウチノ海総合公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '徳島県UDマップに車いす使用者用トイレ（オストメイト対応）・ベビーシート・授乳室、公式サイトに海底の船をテーマにした遊具の記載。' },

  // 香川県
  'NEWレオマワールド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に園内7か所の車イス対応化粧室、チケット売り場南側等の授乳室、複数箇所のおむつ替えシート、総合案内所のベビーカー貸出の記載。' },
  '四国水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式バリアフリー情報に多目的トイレ4か所（オストメイト対応）、給湯シンク付き授乳室、おむつ替え室のベビーシート3台の記載。' },
  'しろとり動物園': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室、ベビーカー・車椅子の貸出、駐車場トイレの多目的室の記載。' },
  '香川県立ミュージアム': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内にB1・1・2階の多目的トイレ・おむつ替えシート、1階の授乳室、各階のベビーカー（計3台）の記載。' },
  '高松市こども未来館': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式に3階子育て支援ゾーンの授乳室、プレイルーム・みんなのひろば等の遊びスペースの記載。' },
  '国営讃岐まんのう公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に多目的トイレ7か所内のベビーシート、案内所・北案内所の授乳室、ベビーカー無料貸出の記載。' },
  'さぬきこどもの国': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「乳幼児連れの方へ」に各トイレ・授乳コーナーのおむつ交換台、1階等の授乳コーナー、貸出用ベビーカー4台の記載。' },
  '讃岐おもちゃ美術館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式館内案内に多目的トイレ、赤ちゃん木育ひろば内の授乳室・おむつ替え室、木育ひろば等の遊びスペースの記載。' },
  // 愛媛県（「とべ動物園」は表記ゆれ同一施設のため両キーに同データ）
  'とべ動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サービスガイドに各トイレの障がい者用個室・おむつ交換台、正面ゲート等3か所の授乳室、ベビーカー貸出60台（100円）の記載。' },
  '愛媛県立とべ動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サービスガイドに各トイレの障がい者用個室・おむつ交換台、正面ゲート等3か所の授乳室、ベビーカー貸出60台（100円）の記載。' },
  'タオル美術館': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設詳細に障がい者用トイレ・授乳室、貸出用車いす・ベビーカーの記載。' },
  '愛媛県総合科学博物館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内に1階ミュージアムショップ奥の授乳室、展示棟1階女性用トイレのベビーベッド、総合案内でのベビーカー・車椅子無料貸出の記載。' },
  'えひめこどもの城': { strollerRental: 'yes', note: '公式利用案内にベビーカー（1台100円）・車椅子の貸出（あいあい児童館 総合案内所）の記載。' },

  // 高知県
  'のいち動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式ご利用案内に多目的トイレ8か所（ベビーベッド・ユニバーサルシート）、どうぶつ科学館内の授乳室、ベビーカー貸出200円（2歳まで）の記載。' },
  '桂浜水族館': { diaperChange: 'yes', nursingRoom: 'yes', note: '高知県公式観光バリアフリーサイトに授乳室、車いす対応トイレのベビーシート（おむつ替え）の記載。' },
  '高知みらい科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式施設案内に多機能トイレ、おむつ交換台・授乳室・調乳用給湯器を備えたベビールーム、3歳未満向けの遊び場、ベビーカート貸出の記載。' },
  '高知県立牧野植物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式ご利用案内に本館・展示館等の多目的トイレ、おむつ換えベッド、授乳室、車いす・ベビーカー無料貸出の記載。' },
  '香美市立やなせたかし記念館 アンパンマンミュージアム': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに地下1階の多機能トイレ（オストメイト対応）、1階授乳室、おむつ交換台の記載。通路が狭く階段が多いためベビーカー利用不可・入口で預かり。' },
  '創造広場アクトランド': { nursingRoom: 'yes', note: '公式FAQに授乳室（ベビーベッド・ポット・除菌シート）の記載。' },
  '佐川おもちゃ美術館': { bathroom: 'no', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式FAQ・館内ガイドに「館内にトイレなし（隣接の道の駅を利用）」、受付前の授乳室・おむつ替室、0〜2歳専用の赤ちゃん木育ひろばの記載。' },
  // 福岡県
  '福岡市動物園': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '福岡市公式「赤ちゃんの駅」登録（授乳・おむつ替え可）。公式に小さな子ども向け遊具施設、総合案内のベビーカー貸出330円（2歳未満）の記載。' },
  '到津の森公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「小さなお子様をお連れの方へ」に授乳室（おむつ替えベッド・お湯）、簡易ベッド設置トイレ、B型ベビーカー貸出1日100円の記載。' },
  '大牟田市動物園': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式「小さなお子さまをお連れの方へ」にレクチャールームの授乳室（おむつ替えベッド付）、ちびっこ遊園地、正面入口のベビーカー貸出の記載。' },
  '北九州市立いのちのたび博物館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「お子様連れの方へ」に2階授乳室（給湯・ベビーベッド）、多目的トイレのおむつ交換台、1階インフォメーションのベビーカー貸出の記載。' },
  '海の中道海浜公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー案内にバリアフリートイレ、園内6か所の「赤ちゃんの駅」（女性専用授乳室含む）、各入口の無料ベビーカー貸出50台の記載。' },
  '響灘緑地（グリーンパーク）': { strollerRental: 'yes', note: '公式ご利用案内に北・南ゲートでのベビーカー貸出（100円・台数限定）の記載。' },

  // 佐賀県（「佐賀県立宇宙科学館」は表記ゆれ同一施設のため両キーに同データ）
  '神野公園こども遊園地': { nursingRoom: 'yes', note: '佐賀県公式観光サイト「あそぼーさが」の施設紹介に授乳スペース（ベッド付き）の掲載。' },
  '森とリスの遊園地 メルヘン村': { nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式・FAQに入場口付近の完全個室授乳室2室（ミルク用ホットウォーターサーバー・冷暖房）、ベビーカー貸出300円、屋内「ちびっ子ハウス」の記載。' },
  '佐賀県立宇宙科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式UD案内に多目的トイレ2か所（おむつ交換台付・3Fオストメイト対応）、車イス・ベビーカー無料貸出（各8台）、屋内「こどもの広場」奥の授乳・おむつ交換スペースの記載。' },
  '佐賀県立宇宙科学館「ゆめぎんが」': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式UD案内に多目的トイレ2か所（おむつ交換台付・3Fオストメイト対応）、車イス・ベビーカー無料貸出（各8台）、屋内「こどもの広場」奥の授乳・おむつ交換スペースの記載。' },
  '吉野ヶ里歴史公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQ・入口ゾーン案内に各入園口3か所＋古代の森ゾーン2か所の授乳室、バリアフリートイレ（ベビーシート・オストメイト対応）、各入口のベビーカー無料貸出の記載。' },
  // 長崎県
  'ハウステンボス': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに完全個室ベビーケアルーム「mamaro2」4か所、各インフォメーションの授乳室、ベビーカー貸出1回1,000円の記載。' },
  '長崎バイオパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式バリアフリー情報に園内2か所の授乳室（おむつ替えベッド・冷暖房）、多目的トイレ3か所（おむつ替えシート付）、入園口のベビーカー貸出300円の記載。' },
  '長崎ペンギン水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式ガイドマップに1F売店横の授乳室、多目的トイレのベビーシート、総合受付のベビーカー無料貸出、2階キッズルームの記載。' },
  '九十九島水族館海きらら': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室3か所、多目的トイレ3か所、館内専用ベビーカーの無料貸出の記載。' },
  '九十九島動植物園森きらら': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設案内に授乳室（ベビーフィーディングルーム）、多目的トイレ2か所、ベビーカー無料貸出15台の記載。' },
  '長崎市科学館': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '長崎市公式観光サイトのバリアフリー情報にバリアフリートイレ・オストメイトトイレ、おむつ交換台、ベビーカー貸出の記載。' },
  'あぐりの丘': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '長崎市公式子育て応援サイトに授乳室、オムツ替えスペース、ベビーカー無料貸出、キッズスペースの記載。' },
  '長崎県立総合運動公園': { bathroom: 'yes', note: '公式バリアフリーページに身障者用トイレを公園内便所のほとんどに設置との記載。' },

  // 熊本県
  '阿蘇ファームランド': { strollerRental: 'yes', note: '公式「施設案内」にベビーカーレンタル（300円＋保証金700円、総合インフォメーション・宿泊フロント）の記載。' },
  '熊本市動植物園': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式「営業案内」に園内3か所の授乳室、無料ベビーカー貸出（7〜24か月・台数限定）の記載。' },
  '岡岳公園': { bathroom: 'yes', kidsSpace: 'yes', note: '宇城市公式の公園一覧にトイレ有、複合遊具・アスレチック施設・ローラースライダーの記載。' },
  'ユウベルキッズランド熊本店': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式「ご利用案内」FAQに男女別トイレ・専用授乳室・オムツ替えコーナー、屋内キッズ施設（ふわふわ・ボールプール・赤ちゃん専用コーナー）の記載。' },
  // 大分県（「うみたまご」は表記ゆれ同一施設のため両キーに同データ）
  'ハーモニーランド': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式サイトに授乳室（ホワイトバーズスクエア）・ベビールーム（ハーモニービレッジ）・ベビーカーレンタルの専用案内ページの記載。' },
  '城島高原パーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「休憩室・授乳室のご案内」に授乳室3か所・園内トイレのおむつ交換ベビーベッド、ベビーカー貸出（500円/日・生後1か月〜4才）の記載。' },
  'うみたまご': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式「みんなにやさしい水族館」に授乳室3か所・多機能トイレ7か所（おむつ交換シート）・1Fキッズコーナー・館内専用ベビーカー貸出（1回300円）の記載。' },
  '大分マリーンパレス水族館「うみたまご」': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式「みんなにやさしい水族館」に授乳室3か所・多機能トイレ7か所（おむつ交換シート）・1Fキッズコーナー・館内専用ベビーカー貸出（1回300円）の記載。' },
  '高崎山自然動物園': { bathroom: 'yes', note: '公式「便利なサービス」に多目的トイレ2か所（入園窓口裏・サル寄せ場近く）の記載。' },
  '九州自然動物公園アフリカンサファリ': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室2か所（総合案内所・アローザ売店内）、ベビーカー貸出300円（総合案内所）の記載。' },
  'るるパーク（大分農業文化公園）': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式サイトに豊の国物産館入口の授乳室（個室3室）、館内「木のこどもエリア」（小さな子向け遊具・無料）の記載。' },

  // 宮崎県
  '宮崎市フェニックス自然動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「お子さま連れの方」案内に多目的トイレ5か所、トイレの乳児用おむつ替えシート、レストラン内の授乳室、ベビーカー有料貸出の記載。' },
  '宮崎科学技術館': { bathroom: 'yes', nursingRoom: 'yes', note: '宮崎県公式アクセシビリティ情報マップに多目的トイレ3か所・授乳室3か所の記載。' },
  'ヘルストピア延岡': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式に1階キッズランド授乳室・更衣室のおむつ交換台、授乳室、屋内キッズランド（0歳〜小学生）の記載。' },
  // 鹿児島県
  'いおワールドかごしま水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に本館1〜4階の多目的トイレ、各階トイレのベビーシート、本館1階の個室授乳室2室、ベビーカー無料貸出13台（2歳以下）の記載。' },
  '平川動物公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式「乳幼児向け情報」にバリアフリートイレ、園内複数か所のベビーシート、給湯器・ベビーベッド付き授乳スペース、入口ゲートのベビーカー貸出の記載。' },
  '鹿児島県立吉野公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '鹿児島県公式すいすいナビに障害者優先トイレ6か所・ベビーベッド、申し出による授乳室利用、ベビーカー2台貸出の記載。' },
  'リトルプラネット イオンモールKAGOSHIMA BAY': { kidsSpace: 'yes', note: '公式店舗ページに体験型アトラクションが集まる屋内型テーマパークの記載。' },
  '霧島市こども館 すかいぴあ': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式「屋内の紹介」に授乳室、あそびの草原（ハイハイ・よちよちルーム）・あそびの森（運動・絵本ルーム）の記載。' },

  // 沖縄県
  'ナゴパイナップルパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'no', strollerRental: 'yes', note: '沖縄県バリアフリーマップに車いす利用可能トイレ・ベビーベッド・授乳室・ベビーカー無料貸出の記載（キッズスペースは「無」と明記）。' },
  'おきなわワールド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式料金ページ・沖縄県バリアフリーマップに多目的トイレ・ベビーベッド・授乳室・ベビーカー有料貸出の記載。' },
  '沖縄こどもの国': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式アクセス/ご利用案内に車椅子用トイレ・授乳室・ベビーカー貸出の記載。' },
  'DMMかりゆし水族館': { diaperChange: 'yes', nursingRoom: 'yes', note: '公式FAQに水族館1Fの授乳室・おむつ替えスペースの記載。' },

  // ===== 第4バッチ（2026-06）: 中部・東北・北海道 =====
  // 愛知県
  'ジブリパーク': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式利用案内に全5エリアのバリアフリートイレ（おむつ替え台付）、大倉庫・魔女の谷の授乳室、大倉庫内「子どもの街」、各案内所でのベビーカー貸出の記載。' },
  '名古屋港水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに多目的トイレ11か所（ベビーチェア等）、北館・南館2階のベビーコーナー（北館は調乳可）、ベビーカー貸出1回100円（7〜24か月）の記載。' },
  '東山動植物園': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '名古屋市公式の乳幼児向けサービスに園内10か所以上の授乳室、おむつ替え台、ベビーカー貸出300円（7か月〜3歳）の記載。' },
  '名古屋市科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式に各階の多機能トイレ（オストメイト対応・ベビーチェア）、理工館3階ベビールーム（女性専用・おむつ替え可）の記載。公式に「ベビーカー貸出・預かりなし」と明記。' },
  'モリコロパーク': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に北口案内所のバリアフリートイレ（オストメイト・ベビーチェア）、授乳室2部屋（調乳給湯器）、A型2台・B型10台の無料ベビーカー貸出の記載。' },
  '安城産業文化公園デンパーク': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式FAQに園内トイレ7か所のおむつ替えベビーシート、デンパーク館等の授乳室、室内あそび場「あそボ〜ネ」、無料ベビーカー貸出の記載。' },
  '愛知こどもの国': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '愛知県公式「乳幼児をお連れの方へ」におむつ替え台、ゆうひ棟2階等の授乳室、ゆうひ棟キッズルーム、ベビーカー無料貸出の記載。' },
  '愛知県児童総合センター': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式館内マップに「だれでもトイレ」、とことこのへやの授乳室・おむつ替えコーナー、屋内児童館の遊びスペースの記載。' },

  // 北海道
  '札幌市円山動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '札幌市公式に園内7か所の授乳室（ミルク用白湯）、ベビーシート付き多目的トイレ10か所以上、ベビーカー貸出（通常250円・冬用無料）の記載。' },
  'のぼりべつクマ牧場': { bathroom: 'yes', diaperChange: 'yes', strollerRental: 'yes', note: '公式「入園情報」に山頂・山麓駅トイレのおむつ交換台、ロープウェイ山頂駅のベビーカー2台貸出の記載。' },
  'サンピアザ水族館': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに1階ベビーケアルーム、2階の車椅子対応トイレ、無料ベビーカー貸出3台の記載。' },
  '旭川市旭山動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '旭川市公式に授乳室4か所、中央あざらし館横のおむつ交換台、各門のベビーカー無料貸出（夏期計70台）、多目的トイレの記載。' },
  'おたる水族館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に正面玄関横の授乳室（個室2部屋・給湯設備）、室外のベビーベッドでのおむつ交換、無料ベビーカー貸出の記載。' },
  'AOAO SAPPORO': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'no', note: '公式FAQに5階有料ゾーン内のベビールーム、館内の多目的トイレの記載。公式に「ベビーカー貸出なし（車いす貸出あり）」と明記。' },
  '国営滝野すずらん丘陵公園': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式「お子様連れ・車いすの方へ」に計5か所の授乳室、東口休憩所等の靴を脱いで遊べるキッズスペースの記載。' },
  'モエレ沼公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '札幌市公式子育てサイト（ガラスのピラミッド）に1階の授乳室（ミルク用お湯）、1・2階のおむつ交換台、多目的トイレの記載。' },
  'ファンタジーキッズリゾート新さっぽろ': { diaperChange: 'yes', nursingRoom: 'yes', note: '公式FAQに授乳室・おむつ替えスペース・調乳用サーバーの記載（新さっぽろ店は対象店舗）。' },
  // 青森県
  '八戸公園（こどもの国）': { kidsSpace: 'yes', note: '八戸市公式に屋内遊び場「三八五・こども館」（室内遊具・通年・無料）の記載。' },
  '浅虫水族館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '青森県公式観光サイトに1・2階の授乳室、各階・いるか館のおむつ交換台、ベビーカー10台貸出（10か月〜2歳）の記載。' },
  '青森県立三沢航空科学館': { diaperChange: 'yes', nursingRoom: 'yes', note: '青森県公式観光サイトに1階のおむつ交換台3か所・授乳室1か所の記載。' },
  'ねぶたの家 ワ・ラッセ': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '青森県公式観光サイトに2階の授乳室、1・2階多目的トイレのおむつ交換台、1階総合案内のベビーカー2台貸出の記載。' },
  '八食センター': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式キッズガイドに厨スタジアム1・2Fの授乳室・おむつ替え、2階の多目的トイレ・子ども用トイレ、無料キッズスペース「わんぱく広場」の記載。' },
  'カクヒログループスーパーアリーナ キッズルーム': { nursingRoom: 'yes', kidsSpace: 'yes', note: '公式キッズルームページに約760㎡の大型遊具キッズルームと隣接する授乳室の記載。' },
  'The Kids（ザ・キッズ）': { kidsSpace: 'yes', note: '公式サイトに0歳から遊べる全天候型の室内遊び場（トランポリン・ボールプール等）の記載。' },

  // 秋田県（「大森山動物園」「男鹿水族館GAO」は表記ゆれ同一施設のため両キーに同データ）
  '秋田市大森山動物園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: 'ビジターセンター・ミルヴェ館のキッズコーナー、授乳室・おむつ替え対応トイレ・無料貸出ベビーカー（秋田市公式＋秋田県観光連盟公式バリアフリー情報）。' },
  '秋田市大森山動物園ミルヴェ': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: 'ビジターセンター・ミルヴェ館のキッズコーナー、授乳室・おむつ替え対応トイレ・無料貸出ベビーカー（秋田市公式＋秋田県観光連盟公式バリアフリー情報）。' },
  '男鹿水族館 GAO': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に1階の授乳室（ミルク用お湯）、各階の多目的トイレのベビーベッド、無料貸出ベビーカー（台数限定）の記載。' },
  '男鹿水族館GAO': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に1階の授乳室（ミルク用お湯）、各階の多目的トイレのベビーベッド、無料貸出ベビーカー（台数限定）の記載。' },
  'ポンポコ山公園': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '八峰町公式に管理棟の室内遊具、乳幼児のオムツ替え・授乳ができる部屋の記載。' },
  '秋田県立博物館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式施設利用に母子室・ベビーベッド、ベビーカー5台の無料貸出、全館バリアフリーの記載。' },
  '鳥海山 木のおもちゃ館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '由利本荘市公式に授乳室・おむつ交換台・障がい者用トイレの記載。館内はベビーカー利用不可で玄関預かり。' },
  '秋田県立中央公園': { nursingRoom: 'yes', kidsSpace: 'yes', note: '指定管理者公式にトレーニングセンター（アリーナ棟）内の授乳室・幼児室の記載。' },
  '秋田県児童会館 みらいあ': { diaperChange: 'yes', nursingRoom: 'yes', note: '公式授乳室ページに1階事務室隣の授乳室（おむつ替えにも利用可）の記載。' },
  // 山形県
  'リナワールド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: 'やまがたバリアフリーMAP（山形県公式UD施設情報）にイベントホール1階のベビールーム（授乳・おむつ交換）、多目的トイレ、無料貸出ベビーカーの記載。' },
  '鶴岡市立加茂水族館': { strollerRental: 'yes', note: '公式FAQに貸出用ベビーカー（台数限定）の記載。※2026年4月「東北エプソンアクアリウムかもすい」へリニューアル。' },
  '月山あさひサンチュアパーク': { bathroom: 'yes', note: '公式施設案内に車椅子使用者用トイレ（スロープ付き）の記載。' },
  '西蔵王公園': { bathroom: 'yes', diaperChange: 'yes', note: '指定管理者公式に森の遊び場・芝生広場のおむつ替えのできる多目的トイレの記載。' },
  'べにっこひろば': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '山形市公式に授乳室（ミルク用お湯・独立した母乳室）、各トイレのおむつ交換台、多目的トイレ、年齢別あそびエリアの記載。' },
  '天童市子育て未来館 げんキッズ': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式施設概要に授乳・オムツ替ルーム、年齢別の遊び広場の記載。' },
  'やまぎん県民ホール（やまぎんこども館）': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: 'やまがたバリアフリーMAP（山形県公式UD施設情報）に館内2か所の授乳室、各階多目的トイレのおむつ交換用ベビーシートの記載。' },

  // 石川県
  'いしかわ動物園': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に管理事務所以外すべての多目的トイレ、管理事務所棟・レストラン下の授乳室、A型ベビーカー貸出（1回100円）の記載。' },
  'のとじま水族館': { bathroom: 'yes', nursingRoom: 'yes', note: '公式に多目的お手洗い、本館入口の授乳室の記載。※ベビーカー無料貸出は現在中止。' },
  '石川県ふれあい昆虫館': { nursingRoom: 'yes', strollerRental: 'yes', note: '公式に1階休憩コーナーの授乳室、入口での無料ベビーカー貸出（台数限定）の記載。' },
  '石川県立航空プラザ': { kidsSpace: 'yes', note: '公式に飛行機型遊具のこども広場「ぶ〜んぶんワールド」の記載。' },
  '石川県西田幾多郎記念哲学館': { bathroom: 'yes', note: '公式に多目的トイレ（エレベーターあり）の記載。' },
  'こどもっちパークかなざわ': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '公式設備欄に授乳室・おむつ替え（イオンタウン金沢示野内）、全天候型の屋内こども遊び場の記載。' },
  '手取フィッシュランド': { strollerRental: 'yes', note: '公式にベビーカーレンタル300円（1台）の記載。' },
  'あそびの森 かほっくる': { kidsSpace: 'yes', strollerRental: 'no', note: '公式にこども屋内運動施設の記載。公式に「館内でのベビーカー利用はご遠慮ください」と明記。' },
  'あめるんパーク': { kidsSpace: 'yes', note: '公式に乳幼児エリア（よちよち広場0〜1才等）を含む屋内遊び場の記載。' },
  // 福井県
  '福井県児童科学館 エンゼルランドふくい': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '公式に車いす対応トイレ、幼児コーナー横の授乳室（個室2部屋・おむつ交換台）、各トイレのおむつ交換台、幼児コーナー、ベビーカー2台貸出の記載。' },
  '越前松島水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に多目的トイレ、おむつ替えもできる授乳室4か所（計9室）、ベビーカー無料貸出の記載。' },
  '福井県立こども歴史文化館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に1階の多目的お手洗い（オストメイト対応）、2階の授乳部屋2室・おむつ交換ベッド、1階のベビーカー3台無料貸出の記載。' },
  '福井県立一乗谷朝倉氏遺跡博物館': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に車いす対応トイレ（オストメイト対応）、授乳室、ベビーカー貸出サービスの記載。' },
  '武生中央公園 だるまちゃん広場': { kidsSpace: 'yes', note: '越前市公式に乳幼児用遊戯広場「まめちゃんえん」の記載。' },

  // 岩手県（ZOOMOは表記ゆれ同一施設のため両キーに同データ）
  '盛岡市動物公園 ZOOMO': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に牧場エリアFARM INFOの授乳室・休憩スペース、屋外トイレ、ZOOMO STATIONでのベビーカー貸出20台（500円）の記載。' },
  '盛岡市動物公園ZOOMO': { bathroom: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式に牧場エリアFARM INFOの授乳室・休憩スペース、屋外トイレ、ZOOMO STATIONでのベビーカー貸出20台（500円）の記載。' },
  '歴史公園えさし藤原の郷': { diaperChange: 'yes', nursingRoom: 'yes', note: '岩手県公式子育てポータルに授乳スペース・おむつ替えコーナー・ミルク用お湯の記載。' },
  '盛岡市子ども科学館': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '岩手県公式子育てポータルに授乳スペース・おむつ換えコーナー・ベビーカー貸出の記載。' },
  '岩手県立美術館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式利用案内に多目的トイレ（おむつ交換台付）、乳児室（授乳・おむつ交換、受付申出）、ベビーカー貸出の記載。' },
  '県立御所湖広域公園': { bathroom: 'yes', diaperChange: 'yes', kidsSpace: 'yes', note: '運営（小岩井）公式にファミリーランドのトイレ・おむつ交換台、海賊船等の大型遊具・ジャブジャブ池の記載。' },
  '小岩井農場': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '岩手県公式子育てポータルにまきば園管理センターでの授乳、おむつ換えコーナー、ベビーカー貸出の記載。' },
  '龍泉洞': { bathroom: 'yes', strollerRental: 'no', note: '公式に身障者用トイレ（園地内・観光センター2階）の記載。洞内は階段がありベビーカー入洞不可と明記。' },
  // 宮城県（八木山動物公園は表記ゆれ同一施設のため両キーに同データ）
  '八木山ベニーランド': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室3か所、授乳室・多目的トイレのおむつ替えシート、トイレ8か所、ベビーカー無料貸出の記載。' },
  '仙台うみの杜水族館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式館内サービスに給湯シンク付き授乳室2か所、多目的トイレ4か所・ベビーベッド、1階総合案内のB型ベビーカー無料貸出の記載。' },
  '八木山動物公園 フジサキの杜': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '仙台市公式に授乳室2か所、おむつ交換台7か所、幼児用トイレ、ビジターセンターの絵本コーナー、ベビーカー有料貸出の記載。' },
  '八木山動物公園フジサキの杜': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', strollerRental: 'yes', note: '仙台市公式に授乳室2か所、おむつ交換台7か所、幼児用トイレ、ビジターセンターの絵本コーナー、ベビーカー有料貸出の記載。' },
  '宮城蔵王キツネ村': { strollerRental: 'no', note: '公式に「ベビーカーでの入場不可（抱っこひも利用）」の記載。' },
  '仙台市科学館': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに授乳室（2・3・4階）、各階のベビーベッド・おむつ入れ・ひろびろトイレ、総合受付のベビーカー貸出の記載。' },
  '仙台市天文台': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式フロアマップにインフォメーション隣の授乳室2部屋（おむつ交換ベッド・給湯設備）、ベビーカー貸出の記載。' },
  '国営みちのく杜の湖畔公園': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '公式バリアフリーガイドに授乳室（南ゲート他複数）、トイレ内のおむつ交換台多数、多目的トイレ多数の記載。' },
  '海岸公園冒険広場': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', note: '運営公式に授乳室2か所（管理棟・プレーリーダーハウス）、多目的トイレ3か所、トイレ3か所の記載。' },
  '感性の森': { kidsSpace: 'yes', note: '公式に木の室内創造あそび場（屋内の遊び場）の記載。' },

  // 福島県
  'スパリゾートハワイアンズ': { diaperChange: 'yes', nursingRoom: 'yes', note: '公式FAQにお子さま向けゾーン「ワイワイオハナ」の授乳室・オムツ替えスペースの記載。' },
  'アクアマリンふくしま': { bathroom: 'yes', diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式案内に多目的トイレ（チャイルドシート・ベビーベッド・オストメイト対応）、ベビーケアルーム（授乳・おむつ交換）、メインゲートのベビーカー無料貸出の記載。' },
  'コミュタン福島（福島県環境創造センター交流棟）': { diaperChange: 'yes', nursingRoom: 'yes', note: '公式FAQに館内2階の授乳室・おむつ替えベッドの記載。' },
  '郡山市ふれあい科学館 スペースパーク': { diaperChange: 'yes', nursingRoom: 'yes', strollerRental: 'yes', note: '公式FAQに各階トイレのおむつ替え台、20階医務室を授乳に利用可、受付のベビーカー貸出の記載。' },
  '安達ヶ原ふるさと村': { diaperChange: 'yes', nursingRoom: 'yes', kidsSpace: 'yes', note: '郡山市公式・施設公式に屋内施設「げんきキッズパークにほんまつ」の授乳室・おむつ交換台・屋内遊び場の記載。' },
  '鶴ヶ城（会津若松城）': { bathroom: 'yes', diaperChange: 'yes', note: '会津若松観光ナビ（公式）に城公園内の多目的トイレ・おむつ交換台の記載。天守閣内部は階段のためベビーカー見学不可。' },

  // ===== 外食チェーン（2026-08-11 公式裏取り）=====
  // ※チェーンは店舗ごとに設備が違うため、**公式が全店について断定している場合だけ** 'yes' を入れる。
  //   「設置を進めています」のような推進中の表現は 'yes' にしない（note に原文を残す）。
  'スシロー': {
    diaperChange: 'yes',
    note: '公式FAQ（akindo-sushiro.co.jp/faq/）に「子供椅子、おむつ台はありますか？」→「設置しております。」の記載。子供椅子も同FAQで設置と明記。2026-08-11確認。',
  },
  'ココス': {
    note: '公式のバリアフリー案内に「トイレは出入口の段差を極力なくし、手すり、ベビーベッド、ベビーキープの設置を進めています」＝全店断定ではないため yes は入れない。おこさまメニューは「小学校6年生までのおこさま限定」と明記。2026-08-11確認。',
  },

  // ===== 商業施設のレストランフロア（2026-08-11 各店公式のサービス案内で裏取り）=====
  // ※チェーンと違い、百貨店・駅ビルは公式のサービス案内ページに設置階まで明記している。
  //   トップページには無く、/service-guide などの下層ページにあるので、そこまで見に行くこと。
  'そごう大宮': {
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス・施設案内に「ベビー休憩室（ベビーベッド、授乳室、ジュース自動販売機）」5階、「ベビーカー 1階・2階＝大宮駅側入口」の記載。5階に親子化粧室（婦人）あり。おむつ替え台単体の記載はなし。2026-08-11確認。',
  },
  '東京ドームシティ ラクーア内 キッズOK店舗群': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式FAQに「おむつ替えシートはありますか？→1Fエレベーターホール横 子ども用トイレ内、1Fサーティーワンアイスクリーム女性トイレ内、2F誰でもトイレ内、3F女性トイレ内」「授乳室はありますか？→3F 女性トイレ隣のベビー休憩室。※授乳室をのぞくベビー休憩室は男性も利用可」、ベビーカー貸出は100円硬貨を入れて利用し返却時に戻る方式（1F 7:00〜23:00／2F 11:00〜21:00）の記載。2026-08-11確認。',
  },
  'なんばパークス（難波）': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    note: '公式フロアマップに「オムツ交換台(5F)」「授乳室」「キッズトイレ」「おむつ替えベッド(3F)」「車椅子利用可能トイレ(5F)」の記載。公式の子連れ向け案内「パパママ手帳」に授乳室＆おむつ替えスペースの検索がある。2026-08-11確認。',
  },
  'あべのキューズモール（天王寺・阿倍野）': {
    nursingRoom: 'yes',
    diaperChange: 'yes',
    kidsSpace: 'yes',
    note: '公式「施設・サービス案内」に「授乳室＆オムツ交換」「キッズトイレ」「キッズスペース」の項目、FAQに「授乳室にお湯はありますか？」「ベビーカーの貸出はありますか？」の設問がある（貸出の可否そのものは当該ページに記載なし）。2026-08-11確認。',
  },
  'ルクア大阪（梅田）': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    note: '公式サービス案内に「ベビールーム ルクア8F／ルクア イーレ7F／ルクア サウス14F」「おむつ替え台（ルクア8F:3台、イーレ7F:4台、10F:2台、サウス14F:1台）男性利用可」「授乳室（8F:3ブース、イーレ7F:6ブース、サウス14F:1ブース）女性利用のみ／サウスは個室型のため男性利用可」「シンク付き調乳設備(2台)」の記載。おむつ替え台はトイレにも設置（B2Fイーレ側、ルクアB1Fを除く）。2026-08-11確認。',
  },
  '大丸札幌店 レストランフロア': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    kidsSpace: 'yes',
    note: '公式サービスガイドに「赤ちゃん休憩室」「ベビーカーの貸し出し」「お子様が遊べるスペース」「お子様用トイレ」「ベビーキープのある化粧室」「ベビーシートのある化粧室」の記載。授乳室の空き状況を調べる機能もある。2026-08-11確認。',
  },
  'サッポロファクトリー レストラン': {
    bathroom: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    kidsSpace: 'yes',
    note: '公式サービス案内に「授乳室 2条館B1／3条館B1／3条館2F」「ベビーカーのお貸し出し（2条館2Fエレベーター前ほか4か所・コインリターン式100円硬貨が必要）」「キッズルーム 3条館2F ベビーベッド、休憩コーナー、プレイルーム」「キッズステーション Produced by LOGOS 2条館1F」「幼児用トイレ」「多目的トイレ 各館」の記載。おむつ替え台単体の記載はなし。2026-08-11確認。',
  },
  '新千歳空港 ターミナルビル ファミリーレストラン': {
    bathroom: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式（北海道エアポート）の「お子様連れの方へ」に「授乳室」「ベビーカー貸出」「多機能トイレ」「多目的シート」の項目がある。2026-08-11確認。',
  },
  '蒲田グランデュオ レストランフロア': {
    bathroom: 'yes',
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス案内に「授乳室 東館5F おむつ交換台、お着替え台、授乳専用室、調乳専用給湯器付シンクをご用意」「ベビーカー貸出し インフォメーション 西館2F」「ベビーベッド（婦人化粧室 東館B1F〜西館9Fの各階）」「ベビーキープ」「多目的化粧室・オストメイト対応化粧室 東館6F／西館7F／西館9F」の記載。2026-08-11確認。',
  },
  '姫路駅前 ピオレ姫路 レストランフロア': {
    bathroom: 'yes',
    nursingRoom: 'yes',
    kidsSpace: 'yes',
    note: '公式サービス案内に「授乳室 ピオレ1[3F・5F]、ピオレ2に計3カ所。男性の方もご利用いただけます」「多目的トイレ ピオレ1[B1F・4F・6F]、ピオレ2、ごちそう館、おみやげ館の計6カ所」「キッズパーク ピオレ1[3F]」の記載。おむつ替え台単体の記載はなし。2026-08-11確認。',
  },
  'アトレ吉祥寺 レストランフロア': {
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス案内に「授乳スペース」「ベビーベッド」「ベビーカー貸出」「化粧室（車椅子、お子様同伴対応）」の項目、インフォメーションカウンター（本館1F・10:00〜21:00）のサービス内容に「ベビーカー貸出」の記載。おむつ替え台は「ベビーベッド」表記のため yes は入れない。2026-08-11確認。',
  },
  '三井ショッピングパーク ららぽーとTOKYO-BAY': {
    bathroom: 'yes',
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式フロアガイドの凡例に「ベビールーム」「おむつ交換室」「ベビーカー貸出し」「こどもトイレ」「優先トイレ（オストメイト）」がある。サービス案内にも「お子さま連れのお客さま ベビーカー／ベビールーム／お子様向けあそび場（無料・有料）」の記載。2026-08-11確認。',
  },
  'そごう横浜 レストラン街（横浜駅東口）': {
    diaperChange: 'yes',
    strollerRental: 'yes',
    note: '公式サービス・施設案内にベビー休憩室8階、ベビーシート「各階（屋上を除く）」、ベビーカー貸出「地下2階＝シースルーエレベーター前」の記載。授乳室単体の記載はなし。2026-08-11確認。',
  },
  'ペリエ千葉': {
    bathroom: 'yes',
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス案内に「ベビールーム 5F おむつ替えベッド3台、授乳室2室」「多目的トイレ（オストメイト対応あり）1F／4F／5F／6F／エキナカ4F／ストリート2／ペリチカ」、インフォメーション業務に「ベビーカーの貸出し」の記載。6Fに託児所あり。2026-08-11確認。',
  },
  '新宿高島屋 14Fダイニング': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス案内に「赤ちゃん休憩室 9階／14階 おむつ替えや授乳をしていただける休憩室」「授乳室 9階 …個室のほか、調乳に適した温度のお湯が出る給湯設備、電子レンジ、オゾン生成器」「ベビーカー貸し出し(A型) 1階明治通り口／2階JR口／9階／駐車場」「ベビーカーと一緒に利用できるトイレ 各階(3階を除く)」の記載。ダイニングのある14階にも赤ちゃん休憩室がある。2026-08-11確認。',
  },
  'クイーンズスクエア横浜（みなとみらい）': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式フロア案内に「ベビーシートはクイーンモール・ステーションコア各フロアの多目的ブース内にあります」「授乳室はみなとみらい東急スクエア①4F（11:00〜19:00）にあります」「ベビーカー・車いす有料レンタルサービス『ベビカル』を導入」の記載。授乳室は1か所・時間限定なので注意。2026-08-11確認。',
  },
  'ジョイナス（横浜駅西口）': {
    diaperChange: 'yes',
    nursingRoom: 'yes',
    note: '公式施設案内に「ベビー休憩室 3F オムツ替えベッド、授乳室(共有)、給湯設備 ※授乳室以外は、男性もご利用いただけます」「ベビーベッド付トイレ B2、B1、1F、2F、3F、4F ※一部男性トイレは対応しておりません」「ベビーチェア付トイレ B2〜4F」「こどもトイレ B2、3F」の記載。2026-08-11確認。',
  },
  'ルミネ大宮': {
    bathroom: 'yes',
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式インフォメーションに「授乳室 ＜ルミネ2＞3F 給湯設備有」「ベビー休憩室 ＜ルミネ2＞3F」「ベビーカー貸出 ＜ルミネ1＞2F ＜ルミネ2＞2F・5F 100円（返却時に戻ります）※30台まで」「多目的トイレ ＜ルミネ2＞3F（オストメイト機能なし）／4F（あり）」の記載。おむつ替え台単体の記載はなし。2026-08-11確認。',
  },
  'そごう千葉（千葉そごう）': {
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '公式サービス・施設案内に「ベビー休憩室（ベビーベッド・授乳室）6階」「授乳室 6階・10階（女性用化粧室内）」「ベビーカー貸し出し 地階・1階（店内ご案内所）※対象年齢：2か月〜4歳 ※2026年6月24日からコインリターン式（100円硬貨が必要）」の記載。2026-08-11確認。',
  },

  // ── 2026-08-19: 流入のある水遊び場を公式で裏取り（会期が9月末で終わるため優先）──
  // 一次ソース = 東京都公園協会「公園へ行こう！」各公園のお知らせ／公園公式X。
  // 設備フラグは今回確認していないので入れない（note のみ）。
  // キーは spots-extra 側の素の名前。spot-overrides で表示名を変えているスポットは
  // 表示名で引くと一致せず、確認日が付かないまま「未確認」に残る（実際に踏んだ）。
  '舎人公園 じゃぶじゃぶ池（浮球の池）': {
    note: '公園公式のお知らせで、2026年の開放期間は7月3日（金）〜9月29日（火）、利用時間10時〜16時、休みは毎週水曜と8月13日・9月17日と確認。2026年7月18日から12時30分〜13時30分はメンテナンスのため閉鎖、午前・午後それぞれ入場者500人超で入場制限（出入口で整理券配布）。対象は小学3年生以下で水着着用・おむつ不可（水泳用紙おむつも不可）。2026-08-19確認。',
  },
  '水元公園 水遊び場': {
    note: '公園公式「噴水広場開放のお知らせ」で、令和8年（2026年）7月1日（水）〜9月30日（水）、9時〜16時（12時〜13時は噴水休止）と確認。8月12日・8月18日・9月4日・9月15日は噴水点検日・清掃日のため中止。2026-08-19確認。',
  },
  '駒沢オリンピック公園 ジャブジャブ池': {
    note: '公園公式「ジャブジャブ池 ご利用のご案内」で、2026年7月1日（水）〜9月30日（水）、午前10時〜午後4時と確認。2026-08-19確認。',
  },

  // ── 2026-08-19 第2便: 水遊び場の会期を公式で裏取り（記載は3件とも公式と一致していた）──
  '光が丘公園 水景施設': {
    note: '公園公式「2026年 光が丘公園 水景施設のご利用について」で、2026年7月1日（水）〜9月30日（水）10時〜16時と確認。休止は7月14日〜21日・8月12日〜14日・9月14日〜16日。水遊び用を含めおむつを着けたままの入水は不可、裸足は危険なのでサンダル等を推奨、更衣室なし。2026-08-19確認。',
  },
  '井の頭自然文化園 ジャブジャブ池': {
    note: '園公式のお知らせ（2026年6月1日付）で、2026年7月1日（水）〜9月30日（水）9時30分〜16時と確認。昨年までは8月末までだったが暑さのため9月末まで延長し、頭上に日除けを設置。対象は小学校低学年以下、水深20cmほど。おむつのままは不可だが水遊び用おむつなら利用できる（園内売店で販売）。靴・サンダルを履いたままの入水は不可。舎人公園や光が丘公園は水遊び用おむつも不可なので、公園ごとにルールが真逆になる点に注意。2026-08-19確認。',
  },
  '日暮里南公園 じゃぶじゃぶ池': {
    note: '荒川区公式「水遊びができる公園」で、令和8年（2026年）6月26日（金）〜9月6日（日）10時〜16時と確認。熱中症特別警戒アラート発令時は中止、荒天時とその翌日も中止になることがあり、電力需給ひっ迫警報時は時間短縮。2026-08-19確認。',
  },

  // ── 2026-08-19 屋内施設バッチ: 守りキューの屋内施設を公式で裏取り ──
  'コレットマーレ桜木町': {
    nursingRoom: 'yes',
    strollerRental: 'yes',
    note: '施設公式のサービス案内で、授乳室は2F・4F・6F、ベビールームは2F（女性専用）と4F、ベビーカー貸出は2F桜木町側（100円・返却時返金）と確認。おむつ台の有無は公式に明記が無いため未確認のままにしてある。※旧記載の「5階のキッズエリアと授乳室」は公式と食い違っていたため訂正した。2026-08-19確認。',
  },
  'Jump862': {
    note: '運営元ハローズ公式および施設公式Instagramで営業中と確認。イオンモール新発田2階（GiGO内）。営業時間はアスレチックが平日13:00〜18:00・土日祝10:00〜18:00、キッズアスレチックとキッズパークが毎日10:00〜18:00、最終入場は各エリア17:00。GW・夏休み・冬休みは変更あり。子連れ設備は公式に記載が無いため未確認。2026-08-19確認。',
  },
  'IKEA Tokyo-Bay（船橋）': {
    nursingRoom: 'yes',
    kidsSpace: 'yes',
    note: 'IKEA公式のスモーランド案内で、対象は満4歳以上満11歳未満、1日1回最大60分まで無料、事前予約はなく発券での先着順と確認。おむつ・トレーニングパンツを使用せず自分でトイレに行けることが利用条件（年齢を公的証明書で確認される場合あり）。授乳室は1Fエントランス付近と2Fイケアレストラン&カフェ横。2026-08-19確認。',
  },
  '夢見が丘キッズパーク': {
    note: '施設公式サイトで、キッズパークは月曜・火曜・水曜・木曜が定休日と確認（実質は金土日祝の営業）。屋内のふわふわ遊具のほか、アスレチックパークやトランポリン、ロープコースはすべて屋根付き。都城市まで行って閉まっていることがあるので、平日に行くなら必ず公式で営業日を確認すること。2026-08-19確認。',
  },
  '別府こどもあそびめぐり': {
    note: 'トキハ別府店公式のショップページで、西館4階・あそびめぐりは10:00〜18:00と確認。対象は6か月〜12歳。料金は平日が子ども最初30分550円・大人330円、休日が子ども660円・大人440円（各種フリーパスあり）。別府の地獄めぐりをモチーフにした屋内遊び場。2026-08-19確認。',
  },
  'ザ・キッズ 山形イオンモール三川店': {
    note: 'The Kids公式の店舗ページで営業中と確認。イオンモール三川2階、平日10:00〜18:00（最終受付17:30）、休日10:00〜19:00（最終受付18:30）。休日扱いは土日祝と春・夏・冬休み等の特定日。料金は子ども1日パックが平日1,200円・休日1,500円、保護者1日パック500円、お試し30分500円。2026-08-19確認。',
  },
  'ASOBI PARK': {
    note: '宮崎県公式観光サイトおよび宮崎市観光サイトで営業中と確認。宮崎市昭栄町8番、10:00〜18:30、定休日なし。屋内外の複合キッズパークで、7万球のボールプール、エア遊具、トランポリン、ボルダリングのほか0〜3歳向けのベビーコーナーがある。2026-08-19確認。',
  },
};
