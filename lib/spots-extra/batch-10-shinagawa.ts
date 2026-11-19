import type { Spot } from '../spots';
import type { AreaSlug } from '../area';

/**
 * スポット拡充バッチ10（品川区の児童センター・子育て施設・公園・博物館・図書館・屋内の遊び場 65件）。
 * 2026-11-20 に区・都・施設の公式ページで1件ずつ確認（verification.verifiedAt）。
 * 公園の選び方は品川区オープンデータ「都市公園・都立公園一覧」（CC BY 4.0）の面積3,000㎡以上と、区の公式に遊具の記載がある公園。
 * 遊具は lib/spot-playground.ts、駐車場は lib/spot-parking.ts に同じ name で持つ。
 */
export const SPOTS_EXTRA_10: Partial<Record<AreaSlug, Spot[]>> = {
  tokyo: [
    {
      "name": "東品川児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "天王洲アイル駅から徒歩9分の、保育園と併設した区立の児童センター（3階・4階・屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。3階に乳幼児親子専用の「親子サロン」「ふれあいサロン」があり、開館時間はいつでも使える。4階の遊戯室は午前中に乳幼児親子の「親子のひろば」に使われ、屋上にはバスケットゴールとサッカーゴールがある。日曜・祝日も開く8館の1つ（公式）。",
      "nearestStation": "tennozu-isle",
      "walkMinutes": 9,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S017",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "りんかい線「天王洲アイル駅」から徒歩9分、京急「新馬場駅」から徒歩10分（公式）。保育園と併設で、児童センターは3階・4階・屋上。所在地は品川区東品川1-34-9。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "一本橋児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "大井町駅から徒歩10分の区立児童センター。改築を経て2024年4月にリニューアルし、エレベーターでベビーカーでも使いやすくなった（公式）。0〜18歳の子どもと保護者が無料で使える。3階に乳幼児親子専用の「親子サロン」、本を読める図書室、工作やボードゲームができる集会室、スラックラインや卓球ができる遊戯室がある。広い屋上ではバスケットボールやサッカーができる（公式）。",
      "nearestStation": "oimachi",
      "walkMinutes": 10,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S001",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "bathroom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「だれでもトイレ」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「エレベーターもあるので、ベビーカーの方も利用しやすくなります」の記載。ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "「大井町駅」から徒歩10分で、大井第二地域センター・大井保健センターの北側（公式）。一本橋保育園と併設。エレベーターがある。所在地は品川区大井2-25-1。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。区内で2番目に小さい館（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "伊藤児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "JR西大井駅から徒歩5分の区立児童センター。区内でいちばん小さい館で、伊藤保育園と併設（公式）。0〜18歳の子どもと保護者が無料で使える。乳幼児専用の「親子サロン」には授乳コーナーとおむつ交換台があり、おもちゃや絵本がそろう。卓球やピアノのあるプレイルームには乳幼児向けの遊具もあり、親子のひろばもここで行う。屋上からは飛行機や新幹線がよく見える（公式）。",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S002",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「サロンの中には授乳コーナーやおむつ交換台があります」の記載。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "JR「西大井駅」から徒歩5分（公式）。伊藤保育園・オアシスルーム（一時保育）と併設。所在地は品川区西大井6-13-1。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。ベランダでは子どもたちと野菜を育てている（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "後地児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "武蔵小山駅から徒歩7分の、シルバーセンターと併設した区立児童センター（2階・3階・屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。2階に陽当たりのよい乳幼児親子向けの「親子サロン」がある。3階のゆうぎ室は天井が高くボール遊びができ、屋上にはバスケットゴールが2つある。おもちゃで親子一緒に遊ぶ「おもちゃのひろば」も開いている（公式）。",
      "nearestStation": "musashi-koyama",
      "walkMinutes": 7,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S004",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "「武蔵小山駅」から徒歩7分（公式）。シルバーセンターと併設で、児童センターは2階・3階・屋上。所在地は品川区小山2-9-19。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。おもちゃの催しは、館ページは毎週月曜10:30〜13:00、区のページは毎週土曜10:30〜11:30で違うので館に確認を。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。区の「おもちゃの広場」ページとおもちゃの催しの曜日が館ページと食い違うことも確認"
      }
    },
    {
      "name": "大井倉田児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "大井町駅から徒歩5分の区立児童センター。区内の児童センターではめずらしく庭があり、野菜の栽培や七輪での火起こし体験、草花や昆虫とのふれあいができる（公式）。0〜18歳の子どもと保護者が無料で使える。「木のおもちゃであそべるおへや」では国産の木のおもちゃで遊べる木育事業を行う。屋上ではバスケットボールや野球、サッカーができる（公式）。",
      "nearestStation": "oimachi",
      "walkMinutes": 5,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S005",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "JR「大井町駅」から徒歩5分、池上通りとJRの線路に挟まれた住宅街（公式）。大井倉田保育園と併設で、入口は別。所在地は品川区大井4-11-34。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。区の「おもちゃの広場」は毎週月曜10:00〜11:15（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。区の「おもちゃの広場」ページ（開催日時）も確認"
      }
    },
    {
      "name": "大原児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "中延駅・戸越公園駅から徒歩5分の区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。遊戯室ではバスケットボールや卓球、集会室・図書室では読書や工作ができ、「親子のクラブ」も行う。2025年9月から建物2階の児童発達支援センターに「インクルーシブひろばベル」が移り、児童センターと一体で運営している。障害のある子もない子も一緒に過ごせる場で、児童センターの利用者も使える（公式）。",
      "nearestStation": "nakanobu",
      "walkMinutes": 5,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S006",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載（2026-11-20確認）。館ページに「2階の児童発達支援センターにインクルーシブひろばベル（親子サロン）があります」の記載。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "都営浅草線・東急大井町線「中延駅」、東急大井町線「戸越公園駅」からそれぞれ徒歩5分、大原小学校のすぐ近く（公式）。所在地は品川区戸越6-16-1。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。ベルは月〜金10:00〜17:00（土日祝・年末年始休み）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。区の「インクルーシブひろばベル」のページ（移転・開所日時・利用対象・無料）も確認。ベルは独立スポットにせず、この館に含めた"
      }
    },
    {
      "name": "北品川児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "新馬場駅から徒歩5分、旧東海道沿いの聖跡公園の中にある、保育園と併設した区立児童センター（3階・4階・屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。3階は乳幼児専用のフロアで、乳幼児向けの遊具や絵本が充実している。4階は小学生以上が優先のフロアで卓球や一輪車ができ、屋上ではボール遊びやバドミントンができる（公式）。",
      "nearestStation": "shimbamba",
      "walkMinutes": 5,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S007",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "京急「新馬場駅」から徒歩5分、旧東海道沿いの聖跡公園内（公式）。北品川保育園と併設で、児童センターは3階・4階・屋上。所在地は品川区北品川2-7-21。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。3階が乳幼児専用、4階は小学生以上優先（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "小関児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "大崎駅から徒歩7分ほど、目黒川沿いのマンションにある区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。2階の乳幼児専用の親子サロン（ゆうゆうルーム）には冷蔵庫・ベビーベッド・授乳スペースがある。地下1階の遊戯室は午前中に幼児向けの大型遊具が出る。トランポリンがあり、講師が教える幼児親子向けの「トランポリンクラブ」も行う（公式）。",
      "nearestStation": "osaki",
      "walkMinutes": 7,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S008",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「冷蔵庫やベビーベッド、授乳スペースがあり」「1階フリールームには、冷蔵庫、電子レンジが備えられ、調乳や飲食ができます」の記載。エレベーター・ベビーカー置き場は公式記載なし。"
      },
      "accessTips": "「大崎駅」から徒歩7分ほど、目黒川沿いのマンションの1階（公式）。近くに公園がある。所在地は品川区北品川5-8-15。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。1階のフリールームは冷蔵庫・電子レンジがあり調乳・飲食ができる（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "水神児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "立会川駅・大森駅から徒歩約10分、マンションの1階にある区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。乳幼児向けに「親子サロン」と、机・いす・おもちゃを木製でそろえた0〜2歳児親子専用の「ベビーサロン0・1・2」がある。ほかに図書室・集会室・遊戯室があり、いつ来ても自由に遊べる。中庭の小さな畑で野菜を育てている（公式）。",
      "nearestStation": "tachiaigawa",
      "walkMinutes": 10,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S009",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "京急「立会川駅」・JR「大森駅」から徒歩約10分、JR「大井町駅」から徒歩約20分（公式）。マンションの1階。所在地は品川区南大井5-13-19。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。区の子育てポータルの「親子サロン」のページ（ベビーサロン0・1・2の対象）も確認"
      }
    },
    {
      "name": "滝王子児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "西大井駅から徒歩10分、大井図書館と滝王子公園の隣にある区立児童センター。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ（公式）。2階に乳幼児親子専用の「ベビールーム」と、靴を脱いでくつろげる「フリーコーナー」がある。3階のホールにもバスケットゴールがあり、雨の日でもボール遊びができる。火曜はトランポリン、水曜はスラックラインを体験できる（公式）。",
      "nearestStation": "oimachi",
      "walkMinutes": 15,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S010",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "JR「西大井駅」から徒歩10分、「大井町駅」「大森駅」から徒歩15分、大井警察署の南西（公式）。大井図書館・滝王子公園に隣接。所在地は品川区大井5-19-14。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。小さな畑で野菜を育てている（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "中延児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "荏原中延駅から徒歩6分ほどの区立児童センター（建物の3・4階と屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。3階の親子サロンは窓が多く明るい部屋で、おもちゃや本がそろう。4階の遊戯室には滑り台やトンネルのついた「中延ぶハウス」がある。ボール遊びができるベランダや、バスケットボールができる屋上もある（公式）。",
      "nearestStation": "ebara-nakanobu",
      "walkMinutes": 6,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S011",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。設備欄に「授乳スペース」の記載はない（公式記載なし）。エレベーター・ベビーカー置き場・飲食のルールも公式記載なし。"
      },
      "accessTips": "東急池上線「荏原中延駅」から徒歩6分ほど、荏原文化センター・中延小学校の近く（公式）。4階建てで1・2階が中延保育園、3・4階と屋上が児童センター。所在地は品川区西中延1-6-16。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。衣類や雑貨のリユースコーナーがある（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "中原児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "不動前駅の近く、桐ケ谷通り沿いの区立児童センター。改築を経て2025年8月25日にリニューアルし、エレベーター付きでベビーカーでも入りやすい（公式）。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ。室内で運動遊びができる「ゆうぎ室」、畳の「図書室」、卓球ができる「クラブ室」、楽器を試せる「スタジオ」、ナイター設備のある屋上がある（公式）。",
      "nearestStation": "fudomae",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S012",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「エレベーター付きで、べビーカーも安心！」の記載。ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急目黒線「不動前駅」の近く、桐ケ谷通り沿い（公式）。中原保育園と併設で、受付は3階。エレベーターがある。所在地は品川区小山1-4-1。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。受付は3階（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "西中延児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "荏原町駅から徒歩8分、住宅地の中にある区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。午前中は親子のひろばや講座、自由遊びでにぎわう。親子サロンでは乳幼児親子がボードゲームや遊具で遊び、食事やおやつも食べられる。遊戯室ではドッジボールや卓球、屋上ではサッカーやバスケットボールができる（公式）。",
      "nearestStation": "ebara-machi",
      "walkMinutes": 8,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S013",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「親子サロンでは乳幼児親子が…食事やおやつを食べたりと楽しく交流しています」の記載。エレベーター・ベビーカー置き場は公式記載なし。"
      },
      "accessTips": "東急大井町線「荏原町駅」から徒歩8分、静かな住宅地の中（公式）。西中延保育園と併設。所在地は品川区西中延3-8-5。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。服や雑貨のリユースコーナーがある（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "旗の台児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "旗の台駅の近く、文化センター・保育園と同じ建物に入る区立児童センター。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ（公式）。幼児向けの親子サロンとクッキングルームがあり、ホールではボール遊びや一輪車、遊戯室では卓球ができる。隣の旗の台公園には大きなすべり台やブランコがある（公式）。",
      "nearestStation": "hatanodai",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S014",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "「旗の台駅」の近くで、旗の台文化センター・旗の台保育園と同じ建物（公式）。隣に旗の台公園がある。所在地は品川区旗の台5-19-5。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "東大井児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "鮫洲駅から徒歩3分、東大井保育園との複合施設にある区立児童センター（2〜4階・屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。京急鮫洲駅のホームが見える位置にあり、「親子のひろば事業」「あかちゃんふれあい事業」「鉄道関連事業」などに力を入れている。中高生の活動を応援するティーンズプラザの1つでもある（公式）。",
      "nearestStation": "samezu",
      "walkMinutes": 3,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S015",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "bathroom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「だれでもトイレ」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "京急「鮫洲駅」から徒歩3分、JR「大井町駅」から徒歩12分（公式）。東大井保育園との複合施設で、児童センターは2階〜4階と屋上。所在地は品川区東大井1-22-16。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "東五反田児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "不動前駅から徒歩7分の区立児童センター。改築工事のため2026年7月21日から仮設で運営している（公式）。0〜18歳の子どもと保護者が無料で使える。乳幼児親子専用の「親子サロン」は広々としていて、赤ちゃんが優先で使えるスペースがある。土曜には法政大学の学生による、体を動かす「忍者修行道場」を開いている（公式）。",
      "nearestStation": "fudomae",
      "walkMinutes": 7,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S016",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急目黒線「不動前駅」から徒歩7分（公式）。改築工事のため2026年7月21日から仮設で運営しており、東五反田保育園と併設。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。仮設での運営中（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。仮設の場所は館ページに書かれておらず、所在地は区の一覧（2026-10-15更新）の西五反田6-6-18を使った"
      }
    },
    {
      "name": "東中延児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "中延駅の近く、第二京浜国道沿いにある区立児童センター（3階・4階・屋上）。0〜18歳の子どもと保護者が無料で使える（公式）。遊戯室のトランポリンは競技用と同じ大きさで、大人も跳べる。広い屋上ではバスケットボールやドッジボールができ、ギターや電子ドラムを試せる時間もある。乳幼児親子向けの親子サロンがある（区の子育てポータルの設備欄）。",
      "nearestStation": "nakanobu",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S018",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急大井町線・都営浅草線「中延駅」の近く、第二京浜国道沿い（公式）。児童センターは3階・4階・屋上。所在地は品川区東中延2-5-10。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "平塚児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "中原街道と第二京浜国道の間、平塚中央公園の隣にある、保育園と併設した区立児童センター（3階・4階・屋上）。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ（公式）。乳幼児専用の「親子サロン」があり、4階には競技用トランポリン・スラックライン・大型マットを常設している。大画面で映像を見られる「ふれあいシアター」もある（公式）。",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S019",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "中原街道と第二京浜国道の間にあり、隣に平塚中央公園がある（公式）。平塚保育園と併設で、児童センターは3階・4階・屋上。駅からの道順は公式記載なし。所在地は品川区平塚2-2-3。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。公式に最寄駅の記載がないため nearestStation は空"
      }
    },
    {
      "name": "冨士見台児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "中延駅から徒歩10分、東急バス「荏原営業所」から徒歩1分の、保育園と併設した区立児童センター（3階・4階・屋上）。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ（公式）。屋上は区内の児童センターでいちばん広い。鏡のあるスタジオや照明・音響のある多目的ホールがあり、インラインスケートやバスケットボールなどの運動も応援している（公式）。",
      "nearestStation": "nakanobu",
      "walkMinutes": 10,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S020",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急大井町線・都営浅草線「中延駅」から徒歩10分、東急バス「荏原営業所」バス停から徒歩1分（公式）。保育園と併設で、児童センターは3階・4階・屋上。所在地は品川区西大井6-1-8。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "三ツ木児童センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越銀座商店街の東端、三ツ木公園の隣にある区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。3階に乳幼児と保護者が使える広い親子サロンがあり、常設の大きなボールプール、赤ちゃん専用スペース、プラ電車、おままごと、絵本コーナーがある。2階では卓球やボール遊び、鏡を使ったダンス、1階では卓上ゲームや読書ができる（公式）。",
      "nearestStation": "osaki",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S021",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "戸越銀座商店街の東端、「大崎駅」から徒歩10分圏内で、三ツ木公園に隣接（公式）。所在地は品川区西品川2-6-13。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "南大井児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "大森海岸駅から徒歩10分、保育園・シルバーセンター・図書館の複合施設の5階にある区立児童センター。0〜18歳の子どもと保護者が無料で使える（公式）。乳幼児親子専用の親子サロンはおもちゃが豊富で、遊戯室（ホール）には幼児用の滑り台がある。大人も跳べるトランポリンがあり、乳幼児親子向けのトランポリンイベントも行う。夏は乳幼児向けの水遊び場を開放している（公式）。",
      "nearestStation": "omori-kaigan",
      "walkMinutes": 10,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S022",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「エレベーターがあるので、ベビーカーのまま中までお入り頂けます」の記載。飲食のルールは公式記載なし。"
      },
      "accessTips": "京急「大森海岸駅」から徒歩10分、JR「大森駅」から徒歩15分、東急バス「桜新道」から徒歩3分（公式）。保育園・シルバーセンター・図書館の複合施設の5階で、エレベーターがありベビーカーのまま入れる。所在地は品川区南大井3-7-13。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。エレベーターでベビーカーのまま中まで入れる（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "南ゆたか児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越公園駅から徒歩6分の、南ゆたか保育園と併設した区立児童センター。自動ドアとエレベーターがあり、雨の日もベビーカーのまま入館できる（公式）。0〜18歳の子どもと保護者が無料で使える。乳幼児専用の親子サロンの前には衣類や雑貨のリユースコーナーがある。遊戯室には卓球台やスラックライン、広い屋上ではバスケットボールやプラズマカーで遊べる（公式）。",
      "nearestStation": "togoshi-koen",
      "walkMinutes": 6,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S024",
      "businessHours": "月〜土 9:00〜18:00（日曜・祝日・年末年始12月29日〜1月3日は休館）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「自動ドアやエレベーターが設置してあり、雨の日も安心してベビーカーのまま入館することができます」の記載。飲食のルールは公式記載なし。"
      },
      "accessTips": "東急大井町線「戸越公園駅」から徒歩6分、駅の南側の住宅街（公式）。南ゆたか保育園と併設。自動ドアとエレベーターがある。所在地は品川区豊町4-17-21。開館は月〜土の9:00〜18:00で、日曜・祝日・年末年始は休館（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。週末は家族連れやパパの来館も多い（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "八潮児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "八潮団地の中にある、区内でいちばん広い区立児童センター。図書館と併設で、エレベーターがある（公式）。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ。乳幼児専用ルームのほか、工作や裁縫ができるクラフトルーム、スポーツ室、ミニサッカーやミニバスケットができる屋上の「スカイコート」がある（公式）。",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S025",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。館ページに「エレベーターがあります」の記載。ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "八潮団地の中にあり、バスやモノレールで来館できる（公式）。図書館と併設で、エレベーターがある。駅名と分数は公式記載なし。所在地は品川区八潮5-10-27。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。スタジオの利用には事前の登録が要る（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認。公式に最寄駅の記載がないため nearestStation は空"
      }
    },
    {
      "name": "ゆたか児童センター",
      "category": "indoor",
      "place": "mixed",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜18歳の子どもと保護者（就学前は保護者同伴）",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越公園駅北口から徒歩8分、2〜5階まである区内で2番目に大きい区立児童センター。0〜18歳の子どもと保護者が無料で使え、日曜・祝日も開く8館の1つ（公式）。2階に親子サロンと、幼児向け遊具のある屋外スペース「キッズガーデン」がある。3階のプレイルームには跳び箱・エアマットとボルダリング、5階屋上にはバスケットボールができる「スカイコート」がある（公式）。",
      "nearestStation": "togoshi-koen",
      "walkMinutes": 8,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa-pocket.city-hc.jp/nursery/detail/S026",
      "businessHours": "9:00〜18:00（日曜・祝日も開館。休館は年末年始12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の館ページの設備欄に「おむつ替え」・「授乳スペース」・「おむつ真空パック機」の記載、「親子サロン（児童センター）」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急大井町線「戸越公園駅」北口から徒歩8分（公式）。保育園と隣接し、ゆたか図書館の隣。児童センターは2階〜5階。所在地は品川区豊町1-18-15。開館は9:00〜18:00で、日曜・祝日も開館し、休館は年末年始（公式）。駐車場は公式記載なし。",
      "hiddenTip": "利用は無料。初めての来館時は受付で職員に声をかけ、仮登録用紙を記入する（入退館管理システム「しなログ」。QRコードは全館共通）。就学前の子どもは保護者と一緒でないと使えない。クラブ・イベントは事前予約や実費が要る場合がある（公式）。子育てネウボラ相談員がいる館（区の一覧）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「児童センターの案内」（対象0〜18歳・開館時間・休館日・日曜開館8館・しなログ）、区の「児童センター一覧」（所在地・日曜開館・ネウボラ相談員）、区の子育てポータル「しながわこどもぽけっと」の館ページ（アクセス・部屋・設備欄）と「じどうセンターってどんなところ？」（利用は無料・就学前は保護者同伴）を確認"
      }
    },
    {
      "name": "IKUMOやしお（品川区立八潮子育て支援施設）",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "乳幼児とその保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "大井競馬場前駅から徒歩8分の、区立の子育て支援施設。乳幼児と保護者が無料で使える（公式）。木育をテーマにした遊び場があり、0〜2歳向けに人工芝の上を転がって遊べる「ころころウッドルーム」、3〜5歳向けにツリーハウスなどの大型遊具がある「きのぼりひろば」、光と影で遊ぶ「デジタルルーム」、絵本のなる木のある「えほんのもり」、人工芝の広場「うみそらテラス」がある（公式）。",
      "nearestStation": "oi-keibajo-mae",
      "walkMinutes": 8,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://shinagawa.g-asuka.co.jp/",
      "businessHours": "9:00〜18:00（祝日も開館。休館は12月29日〜1月3日）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "bathroom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の施設ページの設備欄に「授乳スペース」「おむつ替え」「だれでもトイレ」「おむつ真空パック機」の記載（2026-11-20確認）。区のページに「えほんのもり」は「飲食が可能です」の記載。エレベーター・ベビーカー置き場は公式記載なし。"
      },
      "accessTips": "東京モノレール「大井競馬場前駅」から徒歩8分。大井町駅・品川駅からバス「八潮パークタウン（循環）」行きで約15分、「大井消防署八潮出張所前」下車徒歩1分（公式）。所在地は品川区八潮5-8-41。駐車場はない（公式）。開館は9:00〜18:00で、休館は年末年始（公式）。",
      "hiddenTip": "入館は無料だが、イベント・講座は参加費がかかる場合がある。一時預かりの「オアシスルーム」は区内在住で保育園などに通っていない生後4か月〜就学前が対象で、1時間500円・事前登録と予約が必要（月〜土9:30〜17:30）。台風などの災害時は臨時休館することがあり、当日7時ごろに施設のホームページとInstagramで知らせる（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の施設ページ（所在地・交通・駐車場なし・入館無料・開館日時・部屋構成）、運営事業者の公式トップ（最寄駅・バス・部屋）とご利用案内（対象・料金・オアシスルーム）、区の子育てポータルの施設ページ（設備欄）を確認。うみそらテラスが屋外かは公式に明記がないため place は indoor"
      }
    },
    {
      "name": "フラっと広場（品川区立家庭あんしんセンター）",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3"
      ],
      "agesLabel": "おおむね0〜3歳の子どもと保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越銀座駅から徒歩5分、区立の家庭あんしんセンターの中にある、親子で遊べる小さな部屋。おおむね0〜3歳向けのおもちゃや絵本が用意されていて、予約なしで立ち寄れる（公式）。季節や行事に合わせた工作、読み聞かせ、手遊びなどの活動も行う。家庭あんしんセンターは子育ての相談窓口で、子どもショートステイやトワイライトステイも行っている（公式）。",
      "nearestStation": "togoshi-ginza",
      "walkMinutes": 5,
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kodomo/kosodate/1009438/1001918.html",
      "businessHours": "月〜土 10:00〜12:00・13:00〜16:00（日曜・祝日は休み）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」の家庭あんしんセンターのページの設備欄に「おむつ替え」「授乳スペース」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "東急池上線「戸越銀座駅」から徒歩5分、都営浅草線「戸越駅」A3出口から徒歩10分。東急バス（反11）「平塚二丁目」から徒歩2分（運営法人の公式）。所在地は品川区平塚2-12-2。開場は月〜土の10:00〜12:00と13:00〜16:00で、日曜・祝日は休み（区の公式）。駐車場は公式記載なし。",
      "hiddenTip": "使うときは入館カードに記入する。体調の悪い人や発熱などの症状がある人は利用を控えるよう区が案内している。工作などの活動は先着5組の事前予約制で、来館時に職員へ伝えるか、広場の予約表か電話で予約する。当日空きがあれば予約なしでも参加できる（公式）。料金は公式記載なし。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「フラっと広場」の利用ページ（開場日時・注意事項）、区の家庭あんしんセンターの施設ページ（所在地・事業）、運営法人（福栄会）の施設ページ（アクセス）と「フラっとひろば ご案内」PDF（対象年齢・予約なし・活動の予約方法）、区の子育てポータルの施設ページ（設備欄）を確認。料金の記載が見つからず budget は空"
      }
    },
    {
      "name": "ポップンルーム 荏原保健センター",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "主に区内在住の就学前の子どもと保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越銀座駅から徒歩6分、区の荏原保健センターの中にある、子育て中の親子が無料で予約なしに遊べる部屋「ポップンルーム」（公式）。対象は主に区内在住の就学前の子どもと保護者。保育士に子育ての相談ができるほか、手遊びや絵本の読み聞かせ、カレンダーづくり、工作、季節の行事を行っている。開いているのは月〜金の10:00〜16:00（公式）。",
      "nearestStation": "togoshi-ginza",
      "walkMinutes": 6,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kodomo/kodomoshisetsu/1002225.html",
      "businessHours": "月〜金 10:00〜16:00（日曜・祝日・年末年始は休み。土曜も実施日に含まれない）",
      "facilities": {
        "kidsSpace": "yes",
        "note": "区のページ・PDF、区の子育てポータルの施設ページに授乳・おむつ替え・エレベーターの記載は見当たらない（公式記載なし。2026-11-20確認）。"
      },
      "accessTips": "東急池上線「戸越銀座駅」から徒歩6分、都営浅草線「戸越駅」から徒歩10分、東急目黒線「武蔵小山駅」から徒歩15分（荏原保健センターの公式の交通）。所在地は品川区荏原2-9-6（荏原保健センター内）。開いているのは月〜金の10:00〜16:00（公式）。駐車場は公式記載なし。",
      "hiddenTip": "初回は施設で登録する。予約は要らないが、イベントによっては事前予約が要る。対象は主に区内在住の就学前の子どもと保護者。日曜・祝日・年末年始は休み（公式）。催しの詳しい内容は施設に直接問い合わせるよう区が案内している（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「ポップンルーム（地域交流室）のご案内」のページとPDF（2026年5月7日付。対象・実施日時・無料・予約不要・初回登録）、区の子育てポータルの施設ページを確認。交通は区の荏原保健センターのページ。毎月の通信は画像で、文字では確かめられなかった"
      }
    },
    {
      "name": "ポップンルーム 北品川第二保育園",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "主に区内在住の就学前の子どもと保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "新馬場駅が最寄りの区立北品川第二保育園の中にある、子育て中の親子が無料で予約なしに遊べる部屋「ポップンルーム」（公式）。保育園そのものではなく、地域の親子に開いた交流室。対象は主に区内在住の就学前の子どもと保護者で、保育士に子育ての相談ができる。手遊びや絵本の読み聞かせ、カレンダーづくり、工作、季節の行事を行っている。開いているのは月〜金の10:00〜16:00（公式）。",
      "nearestStation": "shimbamba",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kodomo/kodomoshisetsu/1002225.html",
      "businessHours": "月〜金 10:00〜16:00（日曜・祝日・年末年始は休み。土曜も実施日に含まれない）",
      "facilities": {
        "kidsSpace": "yes",
        "note": "区のページ・PDF、区の子育てポータルの施設ページに、ポップンルームの授乳・おむつ替え・エレベーターの記載は見当たらない（公式記載なし。2026-11-20確認）。"
      },
      "accessTips": "区の子育てポータルでは、北品川第二保育園の最寄り駅は京浜急行線「新馬場駅」（徒歩の分数は公式記載なし）。所在地は品川区北品川3-7-43（北品川第二保育園内）。開いているのは月〜金の10:00〜16:00で、日曜・祝日・年末年始は休み（公式）。駐車場は公式記載なし。",
      "hiddenTip": "初回は施設で登録する。予約は要らないが、イベントによっては事前予約が要る。対象は主に区内在住の就学前の子どもと保護者。日曜・祝日・年末年始は休み（公式）。催しの詳しい内容は施設に直接問い合わせるよう区が案内している（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「ポップンルーム（地域交流室）のご案内」のページとPDF（2026年5月7日付。対象・実施日時・無料・予約不要・初回登録）、区の子育てポータルの施設ページを確認。最寄駅は区の子育てポータルの北品川第二保育園のページ（分数の記載なし）。毎月の通信は画像で、文字では確かめられなかった"
      }
    },
    {
      "name": "ポップンルーム 平塚ゆうゆうプラザ",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "主に区内在住の就学前の子どもと保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "戸越銀座駅から徒歩5分、区立の多世代交流施設「平塚ゆうゆうプラザ」の中にある、子育て中の親子が無料で予約なしに遊べる部屋「ポップンルーム」（公式）。対象は主に区内在住の就学前の子どもと保護者で、保育士に子育ての相談ができる。手遊びや読み聞かせ、工作、季節の行事を行い、2026年11月の通信では木曜にボールプールとトンネルを交互に出していた（公式）。",
      "nearestStation": "togoshi-ginza",
      "walkMinutes": 5,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kodomo/kodomoshisetsu/1002225.html",
      "businessHours": "月〜土 9:00〜16:30（日曜・祝日・年末年始は休み）",
      "facilities": {
        "kidsSpace": "yes",
        "note": "区のページ・PDF、運営法人の施設ページに授乳・おむつ替え・エレベーターの記載は見当たらない（公式記載なし。2026-11-20確認）。"
      },
      "accessTips": "東急池上線「戸越銀座駅」から徒歩5分、都営浅草線「戸越駅」A3出口から徒歩10分、東急目黒線「武蔵小山駅」から徒歩25分。東急バス（反11）「平塚二丁目」から徒歩3分（運営法人の公式）。所在地は品川区平塚2-10-20。開いているのは月〜土の9:00〜16:30（公式）。駐車場は公式記載なし。",
      "hiddenTip": "初回は施設で登録する。予約は要らないが、イベントによっては事前予約が要る。対象は主に区内在住の就学前の子どもと保護者。日曜・祝日・年末年始は休み（公式）。同じ建物に一時預かりのオアシスルーム（事前登録・1時間500円）がある。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「ポップンルーム（地域交流室）のご案内」のページとPDF（2026年5月7日付。対象・実施日時・無料・予約不要・初回登録）、区の子育てポータルの施設ページを確認。運営法人（福栄会）の施設ページ（アクセス・開所日時・オアシスルーム）と11月のポップン通信も確認"
      }
    },
    {
      "name": "ふれあい交流室ポップンルーム（ぷりすくーる西五反田内）",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "主に区内在住の就学前の子どもと保護者",
      "city": "品川区",
      "ward": "品川区",
      "note": "区立の幼保一体施設「ぷりすくーる西五反田」の2階にある「ふれあい交流室」の、親子で自由に来てのんびり過ごせる子育てのひろば（公式）。区のポップンルームの1つで、無料・予約なしで使える。対象は主に区内在住の就学前の子どもと保護者。月2回、0歳・1歳・2〜3歳の年齢別に「親子であそぼう！」を開き、ベビーマッサージや離乳食などの講座も行う。子育て相談もできる（公式）。",
      "budget": "free",
      "reservation": "none",
      "officialUrl": "http://www.preschool.jp/senter.html",
      "businessHours": "月〜土 9:30〜16:30（日曜・祝日・年末年始は休み。都合で休む日・時間帯あり）",
      "facilities": {
        "diaperChange": "yes",
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "区の子育てポータル「しながわこどもぽけっと」のふれあい交流室のページの設備欄に「おむつ替え」「授乳スペース」の記載（2026-11-20確認）。エレベーター・ベビーカー置き場・飲食のルールは公式記載なし。"
      },
      "accessTips": "区の子育てポータルでは、ぷりすくーる西五反田の最寄りは東急バス「大崎郵便局」バス停（徒歩の分数は公式記載なし）。所在地は品川区西五反田3-9-9（ぷりすくーる西五反田2階）。ポップンルームは月〜土の9:30〜16:30（公式）。駐車場は公式記載なし。",
      "hiddenTip": "初回は施設で登録する。予約は要らないが、イベントによっては事前予約が要る。対象は主に区内在住の就学前の子どもと保護者。日曜・祝日・年末年始は休み（公式）。「親子であそぼう！」は随時登録できる。休む日は園のお知らせで確かめる（公式）。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の「ポップンルーム（地域交流室）のご案内」のページとPDF（2026年5月7日付。対象・実施日時・無料・予約不要・初回登録）、区の子育てポータルの施設ページを確認。施設（社会福祉法人福栄会）の「ふれあい交流室」のページ（開室時間・親子であそぼう・相談）、区の子育てポータルの施設ページ（設備欄・最寄バス停）も確認。公式に最寄駅の記載がないため nearestStation は空"
      }
    },
    {
      "name": "しながわ区民公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "京急立会川駅・大森海岸駅から各徒歩約5分の、区立で最大規模の総合公園（約12.7ha）。園内は北側・中央・南側の3ゾーンに分かれ、子どもの遊び場、プレイワーカーがいるプレイパーク「しながわこども冒険ひろば」、サイクリングロード（無料の貸し自転車）、バーベキュー場（デイキャンプ場）、芝生広場、海水を利用した約6,500㎡の人工湖「勝島の海」がある（区の公式）。しながわ水族館が併設されている。開園時間は6:00〜20:30。",
      "nearestStation": "tachiaigawa",
      "walkMinutes": 5,
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/shisetsu/chiikishisetsu/1008264/1008265.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表で、園内7か所のトイレすべてに「バリアフリー」の便房があり、うち桜の広場（北側入口）・水族館口・潮のゾーン（南駐車場）の3か所に「おむつ交換台」、5か所に「ベビーチェア」の記号がある（2026-11-20確認）。区の公園ページは「トイレ有り」。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "京浜急行「立会川駅」「大森海岸駅」から各徒歩約5分（区の公式）。しながわ水族館へはJR大井町駅前から無料送迎バスがある。駐車場は「有り（有料）」で、台数・料金・利用時間は区の公式に記載がない。開園時間は午前6時〜午後8時30分。所在地は品川区勝島3-2-2。",
      "hiddenTip": "貸し自転車（大人用・子供用・幼児用・補助付き幼児用 各10台）は無料・先着順・最大1時間。3〜11月は無休、12〜2月は土日祝のみ、貸出は10:00〜16:00で雨天は貸出なし。デイキャンプ場（3/1〜11/30・9:00〜16:00・無料）は区内在住・在勤・在学の20歳以上が代表者の予約制。冒険ひろばは月〜水・土・日の10:30〜17:30（木・金・年末年始は休み）。園内は指定喫煙所以外禁煙。",
      "playgroundFeatures": [
        "cycling",
        "bbq"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の公園ページ（ゾーン・施設・開園時間・駐車場有り（有料）・交通・トイレ有り）、冒険ひろばのページ（内容・開園日時）、貸し自転車・デイキャンプ場の利用案内、公園調書（遊戯施設・全面改修・公園便所7か所の仕様）を確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。屋外プールは夏季のみで2027年の会期が未公表のため本文に書いていない（P3もスポットにしていない）。budget は公式に入園無料の明記がないため付けていない（貸し自転車とデイキャンプ場は無料の明記あり）。"
      }
    },
    {
      "name": "東品川海上公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "目黒川が天王洲南運河に注ぎ込む河口部にある、全体に芝生を張った親水性の区立公園（約2.3ha）。北側にクジラをイメージした滑り台と運河沿いのボードウォークがあり、南側は噴水のある広々としたスペースと雑木林になっている（区の公式）。2026年10月4日からPark-PFIで整備した飲食施設やドッグラン（登録制）の運営が始まり、公園の公式サイトによると夏向けのクールスポットも新設された。",
      "nearestStation": "tennozu-isle",
      "walkMinutes": 7,
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/shisetsu/chiikishisetsu/1008264/1008271.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、東品川海上公園（東品川3-9-21）のトイレは子供用小便器とバリアフリーの便房があり、「オストメイト」「おむつ交換台」「非常ボタン」の記号がある（2026-11-20確認）。区の公園ページは「トイレ有り」。公園の公式サイトに「トイレには品川区のブランドアートをラッピング」。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "りんかい線「天王洲アイル駅」から徒歩7分、東京モノレール「天王洲アイル駅」から徒歩8分、京急線「新馬場駅」から徒歩10分（区の公式）。駐車場は区の公園ページが「有り（有料）」、公園の公式サイトが「園内に駐車場はございません」と記載が分かれるため、公共交通での来園が確実。開園時間は公式記載なし。",
      "hiddenTip": "園内のドッグラン（約525㎡・9:00〜21:00）は事前登録の月額制で、区民は1匹月550円・区外は1,100円（税込）。イベントで使えない日がある。犬を連れて通るときは芝生・植栽帯・花壇に入らず舗装路を通る。飲食施設はクラフトビール店「WCB The Ballpark」（ピザ・BBQ）。区の公園共通ルールで、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の公園ページ（滑り台・ボードウォーク・交通・駐車場有り（有料）・トイレ有り）、公園調書（北側の滑り台・南側の噴水と雑木林・トイレの仕様）、Park-PFIのページ（運営開始日・ドッグラン）、工事中の公園のページ（Park-PFI工事は令和8年9月頃まで）、公園の公式サイト（アクセス・駐車場なし・ドッグラン・クールスポット）を確認。駐車場は区と公園公式で食い違うので parking は null にし、両方の文言を accessTips に書いた。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "東品川公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "京急新馬場駅から徒歩約8分の、地域の核となる区立公園（約0.9ha）。一般的な公園の機能に加えて交通公園・運動公園の機能も持ち、子どもたちのアイデアを取り入れた遊具を数多く置いている（区の公式）。弓道場とテニスコート2面がある。区の案内では、東品川公園としながわ区民公園には自転車の貸し出しがある。遊具の種類・対象年齢は区の公式に記載がない。",
      "nearestStation": "shimbamba",
      "walkMinutes": 8,
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/shisetsu/chiikishisetsu/1008264/1008279.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、東品川公園のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「非常ボタン」「鏡」の記号がある（平成28年改築・2026-11-20確認）。区の公園ページは「トイレ有り」。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "京急本線「新馬場駅」から徒歩約8分（区の公式）。有料駐車場あり（区の公式。台数・料金・利用時間は記載なし）。開園時間は公式記載なし。所在地は品川区東品川3-14-9。トイレはバリアフリーの便房とおむつ交換台・ベビーチェアのあるものが1か所（区の公園調書）。",
      "hiddenTip": "区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。自転車の貸し出しの条件（時間・料金）は区の公園ページに記載がない。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区の公園ページ（遊具・弓道場・テニスコート・駐車場・交通・トイレ有り）、公園調書（概要・トイレの仕様）、区の公園利用ルール（自転車の貸し出し）を確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "鮫洲運動公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "京浜急行鮫洲駅の東側にある、地域の核となる区立公園（約1.4ha）。園内の北半分は、子どものアイデアを取り入れた様々な遊具が置かれた遊戯ゾーン、南側は少年野球用のバックネットがある人工芝の多目的広場になっている（区の公園調書）。トイレは園内2か所で、どちらもバリアフリーの便房とおむつ交換台・ベビーチェアがあり、北側入口のトイレには子供用の小便器もある。遊具の種類・対象年齢は公式に記載がない。",
      "nearestStation": "samezu",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、鮫洲運動公園内2か所（広場側・北側入口）のトイレはどちらもバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「非常ボタン」の記号がある。北側入口は子供用小便器あり（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "京浜急行「鮫洲駅」の東側（区の公園調書。駅からの分数は公式記載なし）。所在地は品川区東大井1-4-11。区には公園ごとの案内ページが無く、駐車場・開園時間は公式に記載がない。遊具のある遊戯ゾーンは園内の北半分。",
      "hiddenTip": "区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には鮫洲運動公園の公園ページが無いため、公園調書（概要・トイレの仕様）と区の公園利用ルールで確認。nearestStation は調書の「京浜急行鮫洲駅東側にある」による（分数は無いので walkMinutes は空）。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "大井水神公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "東海道線沿いにある細長い区立公園（約1.3ha）で、道路で3つの区域に分かれている。大森駅寄りの南側区域に、水神にちなんだ龍をモチーフにした遊具が置かれている（区の公園調書）。“品川”をモチーフにしたモニュメントもある。キャッチボール場（77m×12m）がある（区の案内）。園内のトイレは4か所で、うち2か所にバリアフリーの便房とおむつ交換台がある。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の便所の表で、大井水神公園内の4か所のうち、公衆便所「大井水神南」（南大井6-15-11）はバリアフリーの便房と「オストメイト」「おむつ交換台」「ベビーチェア」、公園便所「大井水神公園」（南大井5-16-1）はバリアフリーの便房と「おむつ交換台」の記号がある。「大井水神北」「水神」の2か所はバリアフリーの記載なし（2026-11-20確認）。授乳室は公式記載なし。"
      },
      "accessTips": "所在地は品川区南大井5-16-1ほか（南大井6-14-2・6-15-2）。東海道線沿いの細長い公園で、龍の遊具は大森駅寄りの南側区域にある（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅と徒歩分数・駐車場・開園時間は公式に記載がない。",
      "hiddenTip": "キャッチボール場は77m×12mで、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には大井水神公園の公園ページが無いため、公園調書（概要・便所4か所の仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。最寄駅は公式に「駅から◯分」の記載がないため空にした。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "しおじ公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "八潮団地の南端にある区立公園（約1.0ha）。道路で東西に分かれ、西側は広場と遊具を備えた公園、東側は遊戯型の緑道として整備され、両者は歩道橋で結ばれている。一部は都立の京浜運河緑道公園と合わせて計画決定されている（区の公園調書）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがある。遊具の種類・対象年齢、最寄駅、開園時間は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、しおじ公園（八潮5-6-9）のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「非常ボタン」の記号がある（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "所在地は品川区八潮5-8-1・5-6-9（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。広場と遊具は西側にあり、東側の緑道とは道路をはさんで歩道橋で行き来する。",
      "hiddenTip": "区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区にはしおじ公園の公園ページが無いため、公園調書（概要・トイレの仕様）と公園利用ルールで確認。遊具の記載は「広場と遊具を備えた」だけで情報は薄い。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "権現山公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "江戸時代の桜の名所・御殿山に連なる高台（権現山）にある、細長い区立公園（約4,200㎡）。様々な遊具が置かれた遊戯ゾーンと、桜の木を中心とした林のゾーンに分かれている（区の公園調書）。園内に公衆トイレが1か所あるが、調書の仕様欄にバリアフリーの便房・おむつ交換台の記載はない。遊具の種類・対象年齢、最寄駅、開園時間は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公衆便所の表に、公衆便所「権現山」（権現山公園内・男子大1・女子1）があるが、バリアフリー・おむつ交換台などの仕様の記号はない（2026-11-20確認）。多目的トイレ・おむつ替えの有無は公式で確定できないため未設定。"
      },
      "accessTips": "所在地は品川区北品川3-9-5（区の公園調書）。御殿山に連なる高台にある細長い公園。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "おむつ替えができるトイレは公式に記載がないので、おむつ替えの用意をして行く。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には権現山公園の公園ページが無いため、公園調書（概要・公衆便所の仕様）と公園利用ルールで確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "荏原南公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "面積は中規模（約3,300㎡）だが地域の核となる区立公園。霧を発生させる噴水、大型複合遊具、多目的広場、キャッチボール場など、幅広い年齢層が利用できる施設を備えている（区の公園調書）。キャッチボール場の広さは22m×9m（区の案内）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがある。対象年齢・最寄駅・開園時間は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、荏原南公園のトイレはバリアフリーの便房があり「おむつ交換台」「ベビーチェア」「鏡」「非常ボタン」「災害時対応型」「オストメイト」の記号がある（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "所在地は品川区荏原6-16-4（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "キャッチボール場（22m×9m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には荏原南公園の公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。噴水は「霧を発生させる」とだけあり水遊びの記載はないので waterPlay は付けていない。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "鈴ヶ森公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "幼児用遊具、複合遊具、キャッチボール場、健康遊具など、幅広い年齢層が利用できる施設を備えた中規模の区立公園（約3,100㎡）。何本ものケヤキの大木が緑陰を作っている（区の公園調書）。キャッチボール場は20m×26m（区の案内）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがあり、防災用のかまどベンチとマンホールトイレもある。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、鈴ヶ森公園のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「鏡」「非常ボタン」の記号がある（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "所在地は品川区南大井4-18-14（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "キャッチボール場（20m×26m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には鈴ヶ森公園の公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。年齢は「幼児用遊具」の記載から2-3・4-6にした（年齢の上限・下限の記載はない）。"
      }
    },
    {
      "name": "浜川公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "複合遊具、健康遊具、多目的広場、キャッチボール場など、幅広い年齢層が利用できる施設を備えた区立公園（約4,400㎡）。さまざまな種類の桜が植えられており、違いを楽しめる（区の公園調書）。キャッチボール場は10m×20m（区の案内）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがある。対象年齢・最寄駅・開園時間は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、浜川公園のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「鏡」「非常ボタン」「災害時対応型」の記号がある（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "所在地は品川区南大井4-8-22（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "キャッチボール場（10m×20m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "区には浜川公園の公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "大井中央公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "大井町駅の南西側にある遊具中心の区立公園（約1,650㎡）。傾斜地にあるため三段に分かれ、上段は大型複合遊具のある児童ゾーン、中段は砂場のある幼児ゾーン、下段は広場ゾーンになっている（区の公園調書）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがある。駅からの分数・駐車場・開園時間は公式に記載がない。",
      "nearestStation": "oimachi",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、大井中央公園のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「鏡」「非常ボタン」「災害時対応型」の記号がある（2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "大井町駅の南西側（区の公園調書。駅からの分数は公式記載なし）。所在地は品川区大井1-46-8。傾斜地の公園で三段に分かれ、上段が児童ゾーン、中段が幼児ゾーン。区には公園ごとの案内ページが無く、駐車場・開園時間は公式に記載がない。",
      "hiddenTip": "小さい子向けの砂場は中段の幼児ゾーン、大型複合遊具は上段の児童ゾーンにある（区の公園調書）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic",
        "sandbox"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "3,000㎡未満だが公園調書の遊具の記載が詳しいので加えた。区には公園ページが無いため、公園調書（概要・トイレの仕様）と公園利用ルールで確認。年齢は「児童ゾーン」「幼児ゾーン」の記載から2-3・4-6にした。nearestStation は調書の「大井町駅の南西側」による（分数は無いので walkMinutes は空）。調書の「中断」は「中段」の誤記と判断した。"
      }
    },
    {
      "name": "大井坂下公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "JR大森駅の東側にある遊具主体の区立公園（約2,300㎡）。令和3年度に、子どもたちのアイデアを活かしたユニバーサルデザイン遊具（複合遊具、ブランコ、砂場など）を整備した（区の公園調書）。キャッチボール場（25m×11m）もある（区の案内）。トイレには幼児用の便器と、バリアフリーの便房・多目的ベッド・ベビーチェアがある。駅からの分数・開園時間は公式に記載がない。",
      "nearestStation": "omori",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、大井坂下公園のトイレは幼児用（大1・小1）とバリアフリーの便房があり「オストメイト」「ベビーチェア」「フィッティングボード」「非常ボタン」「鏡」「多目的ベッド」「災害時対応型」の記号がある（令和4年改築・2026-11-20確認）。「おむつ交換台」の記号はないため diaperChange は未設定。授乳室は公式記載なし。"
      },
      "accessTips": "JR大森駅の東側（区の公園調書。駅からの分数は公式記載なし）。所在地は品川区南大井6-23-11。区には公園ごとの案内ページが無く、駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "キャッチボール場（25m×11m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic",
        "sandbox"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "3,000㎡未満だが公園調書の遊具の記載が詳しいので加えた。区には公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。nearestStation は調書の「JR大森駅の東側にある」による（分数は無いので walkMinutes は空）。ブランコは「大型・複数」の記載がないので swing タグは付けていない。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "荏原中央公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "3本のケヤキの大木がシンボルの区立公園（約1,100㎡）。令和5年度の改修工事で、園内中央の広場空間を囲むようにブランコやターザンロープなどの遊具を整備した（区の公園調書）。トイレにはバリアフリーの便房があり、オストメイト・ベビーチェア・多目的ベッドの記号がある（令和5年に内装を改修）。最寄駅・開園時間・駐車場は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、荏原中央公園のトイレはバリアフリーの便房があり「オストメイト」「ベビーチェア」「鏡」「非常ボタン」「災害時対応型」「多目的ベッド」の記号がある（令和5年に内装改修・2026-11-20確認）。「おむつ交換台」の記号はないため diaperChange は未設定。授乳室は公式記載なし。"
      },
      "accessTips": "所在地は品川区荏原5-1-2（区の公園調書）。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。遊具は園内中央の広場空間を囲むように置かれている。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "tarzan"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "3,000㎡未満だが公園調書の遊具の記載が詳しいので加えた。区には公園ページが無いため、公園調書（概要・トイレの仕様）と公園利用ルールで確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "西五反田公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "氷川神社に隣接する区立公園（約2,400㎡）。令和6年度の改修工事で、多目的トイレや、子どものアイデアを採用した目玉焼き型のインクルーシブ遊具などを整備し、区内で唯一の迷路遊具もリニューアルした（区の公園調書）。キャッチボール場（18m×23m）がある（区の案内）。最寄駅・開園時間・駐車場は公式に記載がない。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、西五反田公園のトイレはバリアフリーの便房があり「オストメイト」「ベビーチェア」「フィッティングボード」「非常ボタン」「鏡」「多目的ベッド」「災害時対応型」の記号がある（令和7年2月改築・2026-11-20確認）。「おむつ交換台」の記号はないため diaperChange は未設定。授乳室は公式記載なし。"
      },
      "accessTips": "所在地は品川区西五反田5-6-4（区の公園調書）。氷川神社の隣。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。公園についての問い合わせ先は区の公園課 公園維持担当（電話03-5742-6789）。",
      "hiddenTip": "キャッチボール場（18m×23m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "3,000㎡未満だが公園調書の遊具の記載が詳しいので加えた。区には公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "源氏前公園",
      "category": "park",
      "place": "outdoor",
      "ages": [
        "2-3",
        "4-6"
      ],
      "city": "品川区",
      "ward": "品川区",
      "note": "源氏前小学校の南東にある遊戯型の区立公園（約1,070㎡）。令和4年度の改修工事で、子どもたちのアイデアを活かしたユニバーサルデザイン遊具（複合遊具）を整備した。隣の特定児童遊園を抜けて第二京浜国道に出られる（区の公園調書）。キャッチボール場（19m×15m）がある（区の案内）。トイレにはバリアフリーの便房とおむつ交換台・ベビーチェアがある。",
      "reservation": "none",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/kankyo/koenryokka/1009600/1004631.html",
      "facilities": {
        "bathroom": "yes",
        "diaperChange": "yes",
        "note": "区の「しながわの公園（公園調書）令和8年度版」（令和8年4月1日現在・PDF）の公園便所の表に、源氏前公園のトイレはバリアフリーの便房があり「オストメイト」「おむつ交換台」「ベビーチェア」「非常ボタン」「鏡」「災害時対応型」の記号がある（令和5年改築・2026-11-20確認）。授乳室・ベビーカー貸出は公式記載なし。"
      },
      "accessTips": "所在地は品川区中延6-4-15（区の公園調書）。源氏前小学校の南東で、隣の特定児童遊園を抜けると第二京浜国道に出られる。区には公園ごとの案内ページが無く、最寄駅・徒歩分数・駐車場・開園時間は公式に記載がない。",
      "hiddenTip": "キャッチボール場（19m×15m）では、フェンスにボールをぶつけたり傷つけたりしない、危険な遊びをしないのがルール（区の案内）。区の公園共通ルールでは、園内は指定喫煙所以外禁煙、自転車・バイクの乗り入れは原則禁止（駐輪場のある公園は少ない）。幼児の自転車練習は保護者の安全管理のもと広場や園路で、幼児と保護者のゴムボールなど柔らかいボール遊びは可。木登りは禁止で、ごみは持ち帰り。",
      "playgroundFeatures": [
        "athletic"
      ],
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "3,000㎡未満だが公園調書の遊具の記載が詳しいので加えた。区には公園ページが無いため、公園調書（概要・トイレの仕様）とキャッチボールができる公園の案内・公園利用ルールで確認。対象年齢は公式に記載がないため、遊具を使う年齢として2-3・4-6を付けた（0-1は付けていない）。"
      }
    },
    {
      "name": "エコルとごし（品川区立環境学習交流施設）",
      "category": "museum",
      "place": "indoor",
      "categoryLabel": "区立の環境学習施設（入館無料・キッズスペースあり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "キッズスペースは0〜3歳推奨・映像展示「いきものタッチ」は4歳から・「バランスプラネット」は小学生以上（公式）",
      "note": "戸越公園駅・下神明駅から徒歩7分、戸越公園の中にある品川区立の環境学習交流施設で、展示を含め入館無料（公式）。1階のキッズスペース（推奨0〜3歳）は木のおもちゃと壁一面の「しながわパズルウォール・マグネットウォール」で遊べ、屋外の遊具広場には砂場・すべり台がある。3階は床・壁一面の映像展示で、未就学児も楽しめる「いきものタッチ」（推奨4歳から）と小学生向けの「バランスプラネット」を時間割で上映する（公式）。",
      "nearestStation": "togoshi-koen",
      "walkMinutes": 7,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://ecoru-togoshi.jp/",
      "pricing": {
        "adult": "無料（展示を含め入館無料。体験イベントは材料費などの参加費が要る場合あり）",
        "child": "無料"
      },
      "facilities": {
        "nursingRoom": "yes",
        "diaperChange": "yes",
        "kidsSpace": "yes",
        "bathroom": "yes",
        "strollerRental": "no",
        "note": "公式に「1Fキッズスペースに授乳室（個室）があります。中にはおむつ交換台・給湯器・子ども用おむつ真空パック機を設置しています」「ベビーカーの貸出はございません」の記載（2026-11-20確認）。授乳室は搾乳にも使える。おむつ交換台は1F男女トイレ・ユニバーサルトイレ・3F男女トイレにもある。ベビーカー置き場は1Fキッズスペース入口（6台程度）と3F。館内はエレベーターで移動でき、ベビーカーのまま使えるが、3F映像展示はベビーカーで入れない。1F・3Fの女子トイレに幼児用小便器と補助便座。"
      },
      "accessTips": "東急大井町線「戸越公園駅」「下神明駅」から徒歩7分、都営浅草線「戸越駅」から徒歩12分、東急池上線「戸越銀座駅」から徒歩15分（公式）。戸越公園駅からは商店街を北へ進み、戸越公園の広場口（ベビーカーが通れる幅）か薬医口（正面玄関）から入る。19時以降は薬医口から。一般の駐車場はない。開館7:00〜21:30、展示・キッズスペースは9:00〜18:00（公式）。",
      "hiddenTip": "キッズスペースは保護者の付き添いが必要で、中では飲食できない（公式）。館内にレストランはなく、食事は1Fコミュニティラウンジで。ごみ箱がないので、おむつなどのごみは持ち帰る（授乳室におむつ真空パック機あり）。「バランスプラネット」は入れ替え制・先着順で、社会科見学の受け入れで利用が制限される日がある。キックボード・キャリーバッグを持ったままの利用は控える（公式）。",
      "businessHours": "7:00〜21:30（環境学習展示・キッズスペースは9:00〜18:00）・第4月曜休館（祝日なら翌平日）・年末年始（12/29〜1/3）",
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・入館無料・開館時間（エリア別）・休館日・駐車場・交通・各階の施設と映像展示の推奨年齢（区の施設ページ）、キッズスペースの推奨年齢と利用上のお願い（交流スペースのページ）、授乳室・おむつ交換台・ベビーカー置き場・幼児用トイレ（バリアフリー情報）、ベビーカー貸出なし・館内のベビーカー・飲食・ごみ（よくあるご質問）、道順（アクセス）、上映の時間割と入れ替え制（映像展示のページ）を公式で確認。"
      }
    },
    {
      "name": "品川区立五反田文化センター プラネタリウム",
      "category": "museum",
      "place": "indoor",
      "categoryLabel": "区立プラネタリウム",
      "ages": [
        "2-3",
        "4-6"
      ],
      "agesLabel": "4歳〜中学生は子ども料金・3歳以下は座席を使わなければ無料（公式）",
      "note": "不動前駅から徒歩7分、品川区立五反田文化センター5階のプラネタリウム（各回定員86名・先着）。土日祝の11時からは当日の星空解説と季節のアニメーション番組の「親子向け番組」、13時30分・15時30分からは星空解説と特集のお話の「一般向け番組」を投影する（各約50分・公式）。観覧料は大人200円・4歳〜中学生50円で、3歳以下は座席を使わなければ無料。区内在住の子は子ども使用料免除カード「しなか」の提示で対象の投影が無料（公式）。",
      "nearestStation": "fudomae",
      "walkMinutes": 7,
      "budget": "low",
      "reservation": "none",
      "officialUrl": "https://shinagawa-gotanda-planetarium.com/",
      "pricing": {
        "adult": "200円",
        "elementary": "50円（4歳〜中学生。区内在住で「しなか」提示なら対象の投影は無料）",
        "preschool": "50円（4歳以上）",
        "infant": "3歳以下は座席を使う場合50円・使わない場合は無料（無料券は1階受付で）"
      },
      "facilities": {
        "note": "公式に「ベビーカーはラウンジにおいてください」「ドーム内では飲食禁止です」の記載（2026-11-20確認）。授乳室・おむつ替え・エレベーターは公式記載なし。"
      },
      "accessTips": "東急目黒線「不動前駅」から徒歩7分、東急池上線「大崎広小路駅」から徒歩10分、JR山手線・都営浅草線「五反田駅」から徒歩15分。東急バス（大井町駅〜渋谷駅）「大崎郵便局」下車徒歩5分（公式）。施設利用者用の有料駐車場は8台で、車での来館は控えるよう案内している。一般の投影は土日祝で、休館は第4月曜と年末年始（公式）。",
      "hiddenTip": "観覧券は当日10時から1階受付横の券売機で販売し、一万円札・五千円札・キャッシュレスは使えず両替もできないので小銭を用意する（公式）。ラウンジは投影20分前、ドームは10分前に開き、開始後は途中入場できず、ドームから出ると再入場できない。トイレは投影前に。水・木12:35からの約15分の「おひるのくつろぎプラネタリウム」は無料（公式）。",
      "businessHours": "投影は土日祝11:00（親子向け）・13:30・15:30（一般向け）ほか・館は月〜土8:30〜21:30、日祝8:30〜17:00・第4月曜・年末年始（12/29〜1/3）休館",
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "入場料（4歳〜中学生・大人・3歳以下）・投影日・休館日・ベビーカー・飲食（ご利用案内）、番組と投影時刻（プラネタリウム番組）、券売・定員・入場時刻（ご来館されるお客様へ）、「しなか」の対象と使い方（トピックス）、交通・駐車場（アクセス）、開館時間（五反田文化センターについて・区の施設ページ）を公式で確認。対象年齢は公式に区切りがなく、3歳以下も入れるが、約50分の暗いドームでの投影で、親子向け番組がある2-3・4-6を付けた（0-1は付けない判断）。"
      }
    },
    {
      "name": "品川区立品川歴史館",
      "category": "museum",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "公式に対象年齢の記載なし（授乳室・ベビールームあり・小中学生料金あり）",
      "note": "大森駅北口から徒歩10分の品川区立の歴史博物館（2024年4月リニューアル）。常設展示室は原始・古代から近現代までの4つの時代を、大型模型と映像の「ライブステージ」と資料の「ライブウォール」で紹介する（公式）。無料エリアには昔の道具を間近で見られる1階のライブラボ、大森貝塚を発掘したモース博士のコーナー、区内5地区を紹介する「しながわナビ」があり、庭園では水琴窟の音を楽しめる。常設展は一般100円・小中学生50円（公式）。",
      "nearestStation": "omori",
      "walkMinutes": 10,
      "budget": "low",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/historyhp/index.html",
      "pricing": {
        "adult": "100円（常設展。特別展の会期中は別料金）",
        "elementary": "50円（小中学生。区立・区内在住の小中学生は無料）",
        "preschool": "公式サイトで確認（未就学児の観覧料は公式に記載なし）"
      },
      "facilities": {
        "nursingRoom": "yes",
        "diaperChange": "yes",
        "bathroom": "yes",
        "note": "公式に「2階に授乳室、1階と2階にベビールーム（個室）があります。室内にはおむつ交換台のご用意もございます」「ミルクを作るためのお湯が必要な方は受付までお声がけください」の記載（2026-11-20確認）。授乳室は搾乳にも使える。1階・2階にユニバーサルトイレ（ベビーチェアあり）、車イス対応のエレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "JR京浜東北線「大森駅」北口から池上通りを大井町駅方面へ徒歩10分、「大井町駅」から大森駅方面へ徒歩15分、京急「立会川駅」から徒歩13分（公式）。大井町駅・大森駅から東急バス（井03・井09）「鹿島神社前」下車徒歩1分、西大井駅からしなバス「品川歴史館北」下車徒歩1分。玄関前に駐車スペース3台。開館9:00〜17:00（入館16:30まで）（公式）。",
      "hiddenTip": "常設展示は写真撮影ができる（フラッシュは不可）が、特別展・企画展は撮影できない（公式）。館内では飲食できない。庭園だけの利用なら観覧料は要らない。特別展の会期中は観覧料が変わる。休館は月曜（祝日なら開館し次の平日）と年末年始で、臨時休館もあるので公式の開館日カレンダーで確かめる（公式）。",
      "businessHours": "9:00〜17:00（入館16:30まで）・月曜休館（祝日なら開館し次の平日）・年末年始",
      "notice": {
        "text": "特別展「品川湾から東京港へ－未完の港湾都市－」を2026年12月20日（日）まで開催中。会期中の観覧料は一般300円・小中学生100円で、70歳以上・障害者手帳等を提示する方と付き添い1名・品川区内在住の18歳までは無料（公式）。",
        "until": "2026-12-20",
        "source": "https://www.city.shinagawa.tokyo.jp/historyhp/event/moyoshi/1011337.html"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "交通・駐車スペース・開館時間・休館日・観覧料・撮影と飲食のルール（利用案内）、展示（有料・無料エリア）・授乳室・ベビールーム・おむつ交換台・お湯・ユニバーサルトイレ・エレベーター（展示のページ）、庭園と水琴窟（庭園）、リニューアルの時期（品川歴史館について）、特別展の会期と観覧料（特別展のページ）を公式で確認。対象年齢は公式に記載がなく、授乳室・ベビールームなど乳児向けの設備が公式にあるため0-1・2-3・4-6を付けた。"
      }
    },
    {
      "name": "しながわ防災体験館",
      "category": "museum",
      "place": "indoor",
      "categoryLabel": "区立の防災体験施設",
      "ages": [
        "4-6"
      ],
      "agesLabel": "避難姿勢体験・防災展示・シアターは年齢制限なし、消火器体験は小学3年生以上（保護者と一緒なら3年生未満も可）（公式）",
      "note": "大井町駅から徒歩8分、品川区役所の防災センター2階にある区の防災体験施設。訓練用消火器での初期消火、煙の中の避難姿勢、心肺蘇生・AED、車椅子での避難誘導、VRでの災害体験と、防災展示・シアターがそろう（公式）。避難姿勢体験・展示・シアターは年齢制限がなく、消火器体験は小学3年生以上（保護者と一緒なら3年生未満も可）。4歳〜小学生の親子向け防災ワークショップも開いている。料金は公式ページに記載がない。",
      "nearestStation": "oimachi",
      "walkMinutes": 8,
      "reservation": "recommended",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/bosai/bosai/1009491/1003357/1003359.html",
      "facilities": {
        "note": "公式ページに授乳室・おむつ替え・ベビーカーの記載なし（2026-11-20確認）。日本語のほか英語・中国語・韓国語に対応し、各コーナーのタッチパネルで約2分の紹介映像とおさらいのクイズを見られる。"
      },
      "accessTips": "JR線・東急線・りんかい線「大井町駅」から徒歩8分、東急大井町線「下神明駅」から徒歩5分（公式）。所在地は品川区広町2-1-36（品川区役所 防災センター2階）。来館者の駐車場は公式ページに記載がない。開館9:00〜17:00で、月曜・土曜・祝日・年末年始と第3土曜の翌日曜が休館。日曜は開館している（公式）。",
      "hiddenTip": "団体の予約が入っている時間は貸し切りや体験の制限があり、10〜11月は学校の社会科見学で貸し切りの日がある。スムーズに体験したいときは事前に電話（03-5742-9098）を（公式）。AED体験は小学4年生以上（未満は見学）、PC版の防災VRは13歳以上（スマホ版は年齢制限なし）。スタッフの指示に従えないときは退館を求められることがある（公式）。",
      "businessHours": "9:00〜17:00・月曜・土曜・祝日・年末年始・第3土曜の翌日曜休館（日曜は開館）",
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・開館時間・休館日（2026年4月からの第3土曜の翌日曜の休館を含む）・交通・各コーナーの内容・体験ごとの対象年齢・団体予約・親子ワークショップ（4歳〜小学生）を区の公式ページで確認。料金と授乳・おむつ・ベビーカー・来館者の駐車場は公式ページに記載なし（パンフレットPDFは画像のみで文字を読めず）。対象年齢は体験ごとの制限から、年齢制限のない体験と親子ワークショップの対象に合わせて4-6だけを付けた。"
      }
    },
    {
      "name": "ニコンミュージアム",
      "category": "museum",
      "place": "indoor",
      "categoryLabel": "企業ミュージアム（入館無料）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "公式に対象年齢の記載なし（ベビーカー貸出・授乳室あり）",
      "note": "西大井駅から徒歩約4分、株式会社ニコン本社/イノベーションセンター1階の企業ミュージアム（2024年10月開館・展示資料約1,300点）で、入館無料・予約不要（公式）。2027年2月27日までは、カメラのファインダーをのぞき、実機やカットモデル・模型に触れながら像が正しい向きに見える仕組みを体感する企画展「ファインダーの秘密」を開催している（入場無料・公式）。ベビーカー・車いすの無料貸出と授乳室がある。",
      "nearestStation": "oimachi",
      "walkMinutes": 12,
      "budget": "free",
      "reservation": "none",
      "officialUrl": "https://www.jp.nikon.com/company/corporate/museum/",
      "pricing": {
        "adult": "無料（予約不要）",
        "child": "無料"
      },
      "facilities": {
        "nursingRoom": "yes",
        "strollerRental": "yes",
        "bathroom": "yes",
        "note": "公式に「ベビーカー・車いす貸出（無料）」「多目的トイレ・授乳室・AED（同フロアー内にあります）」「スロープ（建屋入口）」の記載（2026-11-20確認）。無料ロッカーあり。おむつ替えの設備は公式記載なし。"
      },
      "accessTips": "JR横須賀線・湘南新宿ライン「西大井駅」から徒歩約4分、JR京浜東北線・りんかい線・東急大井町線「大井町駅」から徒歩約12分、東急大井町線「下神明駅」から徒歩約10分（公式）。所在地は品川区西大井1-5-20。客用の駐車場はない。開館10:00〜17:30（最終入館17:00）で、日曜・月曜・祝日は休館（公式）。",
      "hiddenTip": "土曜は開館するが、土曜が祝日のときは休館（公式）。荒天や交通機関の状況で休館・開館時間の変更をすることがある。スタッフのガイドツアーは無料・完全予約制で、3営業日前までに公式の予約フォームから申し込む。30名を超える団体は事前に問い合わせフォームで連絡する（公式）。",
      "businessHours": "10:00〜17:30（最終入館17:00）・日曜・月曜・祝日（土曜が祝日の場合も）休館",
      "notice": {
        "text": "企画展「ファインダーの秘密―のぞいてみる。カメラで見る世界。」を2027年2月27日（土）まで開催（入場無料・公式）。",
        "until": "2027-02-27",
        "source": "https://www.jp.nikon.com/company/news/2026/0910_01/"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "開館時間・休館日・入館料・予約・所在地・展示資料数・ベビーカー貸出・授乳室・多目的トイレ・駐車場・交通・ガイドツアー（ご利用案内・アクセス）、企画展の会期と内容（2026-09-10の報道資料）を公式で確認。公式の最寄りは西大井駅（徒歩約4分）だが、駅のslugが lib/tokyo-stations.ts に無いため、公式に載っている大井町駅（徒歩約12分）を nearestStation にした。対象年齢は公式に記載がなく、ベビーカー貸出・授乳室が公式にあるため0-1・2-3・4-6を付けた。"
      }
    },
    {
      "name": "品川区立荏原文化センター温水プール",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立温水プール",
      "ages": [
        "4-6"
      ],
      "agesLabel": "4歳以上（4歳〜小学3年生は高校生以上の付き添いが必要・4歳未満は入場不可）（公式）",
      "note": "荏原中延駅から徒歩5分、荏原文化センターの中にある品川区立の室内温水プール（通年開放）。一般開放の全面開放では完泳（片道）2コース・自由3コース、土日祝はウォーキング1コースを設ける（公式）。料金は2時間で大人350円・4歳〜中学生170円で、区内在住の子は子ども使用料免除カード「しなか」の提示で無料。4歳未満は入れず、4歳〜小学3年生は高校生以上の付き添いが必要（付き添い1人に子ども2人まで）（公式）。",
      "nearestStation": "ebara-nakanobu",
      "walkMinutes": 5,
      "budget": "low",
      "officialUrl": "https://www.city.shinagawa.tokyo.jp/shisetsu/bunkasportsshisetsu/1008281/1008282.html",
      "pricing": {
        "adult": "350円（2時間・超過30分ごと80円）",
        "child": "170円（4歳〜中学生・2時間・超過30分ごと40円。区内在住で「しなか」提示なら無料）"
      },
      "facilities": {
        "note": "公式に「4歳未満の幼児は入場できません」「オムツ着用の方は入場できません」の記載（2026-11-20確認）。授乳室・おむつ替え・ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急池上線「荏原中延駅」から徒歩5分（公式）。所在地は品川区中延1-9-15。一般開放は9:30〜13:00・13:30〜17:00・17:30〜21:00の枠（終わりは更衣室の退室時間）で、開放する日と面は公式の予定表で確かめる。休館は第4月曜・年末年始と、水替えのある5月・9月（公式）。",
      "hiddenTip": "水泳帽が必要（窓口で販売）。水着以外は着用できず、オムツ着用の子は入れない。スマートフォンなどは場内に持ち込めず、ロッカーは1回10円。シャワーでシャンプー類は使えない。飲み物は中身の見える容器の水・お茶・スポーツドリンクだけ（公式）。17:30からの回は小学4〜6年生にも付き添いが必要。回数券は11枚で大人3,500円・子ども1,700円（公式）。",
      "businessHours": "一般開放 9:30〜13:00・13:30〜17:00・17:30〜21:00（日ごとの開放は予定表）・第4月曜・年末年始・5月と9月の水替え時は休館",
      "notice": {
        "text": "2026年12月1日（火）〜2027年4月30日（金）は外壁改修工事のため、荏原文化センターの駐車場を利用できない（公式）。",
        "until": "2027-04-30",
        "source": "https://www.city.shinagawa.tokyo.jp/shisetsu/bunkasportsshisetsu/1008281/1008282.html"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・休館日・交通・コース・料金・回数券・利用上の注意（4歳未満不可・付き添い）・駐車場の工事による休止（区の施設ページ）、「しなか」による子どもの無料化（区立プールのご案内）、開放の時間帯・オムツ着用不可・17:30以降の付き添い・水泳帽の販売（12〜2月の予定表PDF）を公式で確認。"
      }
    },
    {
      "name": "日野学園温水プール",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立温水プール（学校プールの区民開放）",
      "ages": [
        "4-6"
      ],
      "agesLabel": "4歳以上（4歳〜小学3年生は高校生以上の付き添いが必要・4歳未満は入場不可）（公式）",
      "note": "大崎駅・五反田駅から徒歩6分、品川区立総合体育館と同じ所在地（東五反田2-11-2）にある日野学園の温水プールで、学校教育で使わない時間に区民に開放している（25m×13.9m・可動床6コース）（公式）。一般開放は2時間で高校生以上350円・中学生以下170円、区内在住の18歳までは「しなか」で無料。4歳未満は入れず、4歳〜小学3年生は高校生以上の付き添いが必要（1人で2人まで）。水深は1・2回目1.1m、3回目1.2m（公式）。",
      "nearestStation": "osaki",
      "walkMinutes": 6,
      "budget": "low",
      "officialUrl": "https://ssa.or.jp/sougou/introduction/hinopool/index.html",
      "pricing": {
        "adult": "350円（高校生以上・一般開放2時間）",
        "child": "170円（中学生以下・2時間。区内在住の18歳までは「しなか」提示で無料）"
      },
      "facilities": {
        "note": "公式に「プール場内では、水着以外(オムツ等を含む）の着用はできません」の記載（2026-11-20確認）。授乳室・おむつ替え・ベビーカーの扱いは公式記載なし。シューズボックス・ロッカー・洗面室・プールサイドの暖房室がある。"
      },
      "accessTips": "JR山手線・りんかい線「大崎駅」から徒歩6分、JR山手線・都営浅草線・東急池上線「五反田駅」から徒歩6分（同じ所在地の品川区立総合体育館の交通案内・公式）。所在地は品川区東五反田2-11-2。開館9:30〜20:50で、学校が使わない時間に開放する。休館は第3月曜（祝日なら翌日）と年末年始（12/29〜1/3）（公式）。",
      "hiddenTip": "開放は入れ替え制で、日ごとの時間は公式の「一般公開予定表」で確かめる。プールキャップをかぶらないと入れない。場内での撮影・飲食（ガムも）はできず、シャワーでシャンプー類は使えない（公式）。3回目の枠は小学4〜6年生だけでは使えない。毎週水曜13:30〜14:40は水中エアロビクスのため遊泳できない（7・8月や祝休日などを除く）。ロッカーは10円（公式）。",
      "businessHours": "9:30〜20:50（学校教育で使わない時間に開放・日ごとの時間は予定表）・第3月曜（祝日なら翌日）・年末年始（12/29〜1/3）休館",
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "規格・開館時間・休館日・料金・「しなか」・利用上の注意（品川区スポーツ協会の施設紹介）、開放の時間帯・水深・水中エアロビクスの時間・付き添い（11月〜1月の一般公開予定表PDF）、交通（区の「区立体育館の利用」の総合体育館の欄。施設内容に「温水プール(日野学園のプールを区民開放)」とあり所在地が同じ）を公式で確認。プールのページ自体には交通の記載がない。駐車場は、総合体育館の「駐車場は予約制」の記載がプール利用に当てはまるか公式で確かめられないため入れていない。"
      }
    },
    {
      "name": "品川区立品川図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "新馬場駅北口から徒歩3分の品川区立図書館（区立図書館11館の中央館）。閲覧席211席のうち児童用は62席（公式）。赤ちゃん向けは第2・4土曜10:30〜10:50の「0・1・2歳おはなし会」、幼児〜小学生向けのおはなし会は毎週水曜15:00と毎週土曜14:30から開く（公式）。館内には授乳スペースとベビーシートがある（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/146/Default.aspx",
      "facilities": {
        "nursingRoom": "yes",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース 〇」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "京急本線「新馬場駅」北口から徒歩3分、東急バス「新馬場駅前」から徒歩3分（公式）。所在地は品川区北品川2-32-3。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第4月曜・特別整理期間・年末年始・施設点検日が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3471-4667）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第4月曜・特別整理期間・年末年始・施設点検日休館",
      "nearestStation": "shimbamba",
      "walkMinutes": 3,
      "notice": {
        "text": "2026年12月28日（月）〜2027年1月6日（水）は図書館システムのメンテナンスで全館休館。品川図書館は2027年1月25日（月）〜1月29日（金）も特別整理で休館する（公式）。",
        "until": "2027-01-29",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=806&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立二葉図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "下神明駅から徒歩1分の品川区立図書館。閲覧席37席のうち児童用は16席（公式）。赤ちゃん向けは第4木曜11:00〜11:30の「0・1・2歳おはなし会」、幼児〜小学生向けのおはなし会は毎週水曜15:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/147/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター ×（※）」「※ 車椅子専用の昇降機があります。」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターはないが車椅子専用の昇降機がある。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急大井町線「下神明駅」から徒歩1分（公式）。所在地は品川区二葉1-4-25。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3782-2036）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "shimo-shimmei",
      "walkMinutes": 1,
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立荏原図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "荏原中延駅から徒歩5分の品川区立図書館（荏原文化センター3階）。閲覧席57席のうち児童用は17席（公式）。赤ちゃん向けは第1・3水曜の「0・1・2歳おはなし会」（10:00〜10:20と10:40〜11:00の2回）、幼児〜小学生向けのおはなし会は毎週水曜15:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/148/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急池上線「荏原中延駅」から徒歩5分（公式）。所在地は品川区中延1-9-15（荏原文化センター3階）。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第4月曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3784-2557）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第4月曜・特別整理期間・年末年始休館",
      "nearestStation": "ebara-nakanobu",
      "walkMinutes": 5,
      "notice": {
        "text": "荏原図書館は2026年12月21日（月）〜12月24日（木）が特別整理で休館。12月28日（月）〜2027年1月6日（水）は全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=806&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立南大井図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "大森海岸駅から徒歩7分の品川区立図書館。閲覧席34席のうち児童用は6席（公式）。赤ちゃん向けは第1日曜11:00〜11:20の「あつまれ、赤ちゃん！おはなし会」、幼児〜小学生向けのおはなし会は毎週土曜15:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/149/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "no",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ ×」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "京急本線「大森海岸駅」から徒歩7分、JR京浜東北線「大森駅」から徒歩10分（公式）。所在地は品川区南大井3-7-13。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3761-6780）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "omori-kaigan",
      "walkMinutes": 7,
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立源氏前図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0・1歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "中延駅・荏原町駅から徒歩5分の品川区立図書館。閲覧席36席のうち児童用は12席（公式）。赤ちゃん向けは第1・3金曜10:30〜10:50の0・1歳向け「0・1 にっこりのわ！」、幼児〜小学生向けのおはなし会は毎週金曜16:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/150/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "no",
        "note": "公式の施設案内に「エレベーター ×」「誰でもトイレ ×」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターなし。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急大井町線「中延駅」「荏原町駅」から徒歩5分（公式）。所在地は品川区中延4-14-17。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3781-6273）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "nakanobu",
      "walkMinutes": 5,
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立ゆたか図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "戸越公園駅から徒歩7分の品川区立図書館。閲覧席35席のうち児童用は10席（公式）。赤ちゃん向けは第3土曜10:30〜10:50の「みんなニコニコおはなしかい」、幼児〜小学生向けのおはなし会は毎週日曜10:30から開く（公式）。館内には授乳スペースとベビーシートがある（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/151/Default.aspx",
      "facilities": {
        "nursingRoom": "yes",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター ×」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース 〇」の記載（2026-11-20確認）。エレベーターなし。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急大井町線「戸越公園駅」から徒歩7分（公式）。所在地は品川区豊町1-17-7。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3785-6677）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "togoshi-koen",
      "walkMinutes": 7,
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立大井図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "東急バス「大井第一小学校」から徒歩2分の品川区立図書館。閲覧席67席のうち児童用は29席（公式）。赤ちゃん向けは第3月曜の「赤ちゃんおはなし会」（10:30〜10:50と11:10〜11:30の2回・各回先着約10組）、幼児〜小学生向けのおはなし会は毎週水曜15:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/152/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター ×」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターなし。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急バス「大井第一小学校」から徒歩2分（公式）。所在地は品川区大井5-19-14。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3777-7151）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。 公式の交通案内がバス停だけのため、nearestStation・walkMinutes は空にした。"
      }
    },
    {
      "name": "品川区立五反田図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "不動前駅から徒歩7分の品川区立図書館（五反田文化センター2階（5階にプラネタリウム））。閲覧席121席のうち児童用は47席（公式）。赤ちゃん向けは第1水曜15:00〜15:20と第3日曜11:00〜11:20の「おひざのうえでおはなし会」、幼児〜小学生向けのおはなし会は毎週日曜15:00から開く（公式）。館内には授乳スペースとベビーシートがある（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/153/Default.aspx",
      "facilities": {
        "nursingRoom": "yes",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース 〇」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "東急目黒線「不動前駅」から徒歩7分、JR山手線「五反田駅」から徒歩15分（公式）。所在地は品川区西五反田6-5-1（五反田文化センター2階）。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第4月曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3492-2131）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第4月曜・特別整理期間・年末年始休館",
      "nearestStation": "fudomae",
      "walkMinutes": 7,
      "notice": {
        "text": "五反田図書館は2026年12月1日（火）〜12月4日（金）が特別整理で休館。12月28日（月）〜2027年1月6日（水）は全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=806&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。 空調工事による休館（11/12〜11/28）は公開日（12/2）より前に終わるため notice に入れていない。"
      }
    },
    {
      "name": "品川区立大崎図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "大崎駅東口から徒歩8分の品川区立図書館。閲覧席111席のうち児童用は32席（公式）。赤ちゃん向けは第1金曜11:00〜11:30の「あかちゃんおはなし会」、幼児〜小学生向けのおはなし会は毎週土曜14:00から開く（公式）。館内には授乳スペースとベビーシートがある（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/154/Default.aspx",
      "facilities": {
        "nursingRoom": "yes",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース 〇」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "JR山手線「大崎駅」東口から徒歩8分（公式）。所在地は品川区北品川5-2-1 2階。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3440-5600）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "osaki",
      "walkMinutes": 8,
      "notice": {
        "text": "品川区立図書館は2026年12月28日（月）〜2027年1月6日（水）、図書館システムのメンテナンスで全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=1255&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立大崎図書館分館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "大崎駅西口から徒歩5分の品川区立図書館。閲覧席34席のうち児童用は12席（公式）。赤ちゃん向けは第2日曜11:00〜11:20の「すくすく０１２おはなし会」、幼児〜小学生向けのおはなし会は毎週水曜15:30から開く（公式）。館内には授乳スペースとベビーシートがある（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/314/Default.aspx",
      "facilities": {
        "nursingRoom": "yes",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター ×」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース 〇」の記載（2026-11-20確認）。エレベーターなし。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "JR山手線「大崎駅」西口から徒歩5分（公式）。所在地は品川区大崎3-12-22。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3491-3430）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始休館",
      "nearestStation": "osaki",
      "walkMinutes": 5,
      "notice": {
        "text": "大崎図書館分館は2026年12月14日（月）〜12月16日（水）が特別整理で休館。12月28日（月）〜2027年1月6日（水）は全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=806&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。"
      }
    },
    {
      "name": "品川区立八潮図書館",
      "category": "indoor",
      "place": "indoor",
      "categoryLabel": "区立図書館（おはなし会あり）",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0〜2歳向けと幼児〜小学生向けのおはなし会あり（おはなし会は中学生未満が対象）（公式）",
      "note": "都営・京急バス「八潮パークタウン」から徒歩1分の品川区立図書館。閲覧席72席のうち児童用は29席（公式）。赤ちゃん向けは第3土曜11:00〜11:30の「おひざのうえのおはなし会」、幼児〜小学生向けのおはなし会は毎週水曜15:00から開く（公式）。館内にはベビーシートはあるが、授乳スペースはない（公式）。利用カードは0歳から作れ、区外に住む人も作れる（公式）。",
      "officialUrl": "https://library.city.shinagawa.tokyo.jp/tabid/155/Default.aspx",
      "facilities": {
        "nursingRoom": "no",
        "bathroom": "yes",
        "note": "公式の施設案内に「エレベーター 〇」「誰でもトイレ 〇」「ベビーシート 〇」「授乳スペース ×」の記載（2026-11-20確認）。エレベーターあり。ベビーカーの扱いは公式記載なし。"
      },
      "accessTips": "都営・京急バス「八潮パークタウン」から徒歩1分（公式）。所在地は品川区八潮5-10-27。図書館には駐車場がなく、近くの有料駐車場か公共交通機関を使うよう案内している。開館は月〜土9:00〜20:00、日曜・祝日9:00〜19:00で、第2木曜・特別整理期間・年末年始・施設点検日が休館（公式）。",
      "hiddenTip": "おはなし会は中学生未満の子が対象で、保護者も一緒に参加できる（公式）。日時が変わることもあるので、行く前に館へ電話（03-3799-1414）で確かめると確実。利用カードを作るには住所・氏名・生年月日のわかる証明書が要り、子どもは子ども医療証・乳幼児医療証も使える。小学1年生以下は保護者が子の証明書を持てば作れる（公式）。",
      "businessHours": "月〜土 9:00〜20:00、日曜・祝日 9:00〜19:00・第2木曜・特別整理期間・年末年始・施設点検日休館",
      "notice": {
        "text": "八潮図書館は2026年12月7日（月）〜12月10日（木）が特別整理で休館。12月28日（月）〜2027年1月6日（水）は全館休館（公式）。",
        "until": "2027-01-06",
        "source": "https://library.city.shinagawa.tokyo.jp/tabid/243/Default.aspx?itemid=806&dispmid=595"
      },
      "city": "品川区",
      "ward": "品川区",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "所在地・交通・休館日・開館時間・面積・閲覧席（児童用）・エレベーター・誰でもトイレ・ベビーシート・授乳スペース（施設案内の当館ページ）、おはなし会の曜日・時間・対象（おはなし会のページ）、開館時間・休館日の区分・利用カードの作り方（図書館利用ガイド）、駐車場（よくある質問）、特別整理休館と年末年始の休館（お知らせ）を公式で確認。「ベビーシート」がおむつ替え台かベビーチェアかは公式に説明がないため、diaperChange は付けず公式の文言だけ引用した。入館・利用の料金について公式に「無料」の記載を見つけられなかったため budget は付けていない。 公式の交通案内がバス停だけのため、nearestStation・walkMinutes は空にした。"
      }
    },
    {
      "name": "キッズランドUS mini 東京大森店（キッズランドユーエス ミニ）",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "0歳〜小学4年生（10歳）まで",
      "city": "品川区",
      "ward": "品川区",
      "note": "JR大森駅東口から徒歩4分の西友大森店3階にある、約495㎡の室内遊園地（品川区南大井）。対象は0歳〜小学4年生で、0歳は無料。ふわふわドーム・トランポリン・スーパージャングルジム・サイバーホイール・乗り物・ままごとコーナー・ベビーコーナーなどがあり、遊具は追加料金なしで遊び放題（公式）。料金は税込で子ども1時間700円、平日は1日900円・休日は3時間1,200円、保護者は1日600円。予約なしで当日受付。",
      "nearestStation": "omori",
      "walkMinutes": 4,
      "budget": "low",
      "reservation": "none",
      "officialUrl": "https://kidslandus.com/shop/tokyo-omori/",
      "pricing": {
        "adult": "保護者1日パック600円（平日・休日とも・保護者は18歳以上・税込）",
        "child": "1時間パック700円（平日・休日とも）、平日1日パック900円、休日3時間パック1,200円（0歳〜小4・超過は差額・税込）",
        "infant": "0歳は無料（公式）"
      },
      "businessHours": "10:00〜19:00（定休日は公式記載なし。休日料金は土日祝と当社指定期間）",
      "facilities": {
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "bathroom": "yes",
        "note": "店舗ページの遊具・設備一覧に「授乳室」「ベビーコーナー」「ロッカー」の記載（2026-11-20確認）。入っている西友大森店の公式の「利用できるサービス・施設」に「ベビー休憩室」「多目的トイレ」の記載（階は記載なし）。おむつ替えの場所・ベビーカーの置き場・ベビーカー貸出は公式記載なし。飲食物は持ち込み可（飲食コーナーで・アルコール不可）。"
      },
      "accessTips": "JR京浜東北線「大森駅」東口から徒歩4分（西友大森店の公式）。所在地は品川区南大井6-27-25 西友大森店3階。駐車場は西友大森店の151台（2,000円以上の買い物で2時間無料、一般は8:00〜24:00が30分200円・24:00〜8:00が60分100円）。営業は10:00〜19:00（公式）。",
      "hiddenTip": "保護者（18歳以上）の同伴が必要で、子どもだけを残して外に出られない。利用時間内は子どもと一緒なら出入り自由で、保護者は1名分の料金で交代できる。時間を超えると差額がかかる。入場前に利用規約・免責事項への同意が必要（店頭の二次元コードか公式LINE）。マットの場所は靴を脱ぐ。mini店は中学生以上は入れない。支払いはクレジットカード・コード決済・交通系IC等の電子マネー。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "キッズランドUS公式の東京大森店ページ（所在地・駐車場・面積・営業時間・遊具設備一覧・平日/休日料金・対象年齢・0歳無料・支払い方法）、ご利用案内（入場の条件・利用規約）、よくある質問（予約不要・出入り・保護者交代・飲食持ち込み・mini店の年齢）、西友大森店の公式店舗ページ（アクセス「大森駅東口から徒歩4分」・駐車場・フロアガイドの3階にキッズランドUSと営業時間10:00〜19:00・ベビー休憩室と多目的トイレ）を確認。店舗名は店舗ページの見出しが「キッズランドUS mini 東京大森店」、ページ題と西友のフロアガイドは「キッズランドUS東京大森店」。最寄駅の大森駅は大田区（slug omori・ward ota）。定休日は公式に記載がない。"
      }
    },
    {
      "name": "La Pause（ラ・ポーズ）",
      "categoryLabel": "親子の遊び場",
      "category": "indoor",
      "place": "indoor",
      "ages": [
        "0-1",
        "2-3",
        "4-6"
      ],
      "agesLabel": "遊び場は0歳〜小学6年生",
      "city": "品川区",
      "ward": "品川区",
      "note": "京急本線 鮫洲駅東口から徒歩1分の、3フロアの親子の遊び場・カフェ・一時保育（品川区東大井）。遊び場の対象は0歳〜小学6年生。1階が親子の遊び場と一時保育、2階は大きなりんごの木と畳の広いあそび場で、色々な素材を使える工作コーナー（年長〜小学生に人気）があり、3階がカフェ（公式）。料金は遊び場スポットが1家族2時間1,800円、30日間の月額パスもある（2026年9月改定）。予約なしでも使えるが、初めてはWEB予約（会員登録）がおすすめ。",
      "nearestStation": "samezu",
      "walkMinutes": 1,
      "budget": "low",
      "budgetLabel": "1家族2時間1,800円",
      "reservation": "recommended",
      "officialUrl": "https://www.lapause.or.jp/",
      "pricing": {
        "adult": "遊び場スポットは1家族2時間1,800円。月額パスは大人3,500円（購入日から30日間）",
        "elementary": "月額パス2,500円（購入日から30日間）。スポット利用は1家族2時間1,800円",
        "preschool": "月額パス1,500円（購入日から30日間）。スポット利用は1家族2時間1,800円"
      },
      "facilities": {
        "nursingRoom": "yes",
        "kidsSpace": "yes",
        "note": "公式FAQに「（授乳室は）2階にございます。ご利用される場合は、スタッフまでお声がけください」「3階のみ飲食(持ち込み可)ができます」「自転車置き場のご用意があります」の記載（2026-11-20確認）。おむつ替えの場所・ベビーカーの置き場・エレベーターは公式記載なし。"
      },
      "accessTips": "京急本線「鮫洲駅」東口から徒歩1分（公式）。所在地は品川区東大井1-20-6 まつやビル1〜3階。公式FAQに「駐車場はございません」、自転車置き場はあり（入口でスタッフに声をかける）。営業時間・休業日は公式サイトに文章での記載がなく、予約カレンダーで空きを確かめる。",
      "hiddenTip": "飲食は3階だけ（持ち込み可・ゴミは持ち帰り）。大人だけで使えるのは3階のみ。初回はWEBの「予約兼会員登録」から（受付は14日前の0時から当日1時間前まで）、キャンセル料はかからない。区外の人も使える。一時保育は1時間1,500円（料金表では6か月〜未就学児・最大3時間）。月額パスの「ゲスト」500円は家族かシッターのみ。",
      "relatedArticleSlugs": [
        "shitsunai-asobi-shinagawa-tokyo",
        "mizuasobi-shinagawa-tokyo",
        "tokyo-shinagawa-ooimachi-weekend",
        "shinagawa-aquarium-kosodate",
        "maxell-aquapark-shinagawa-kosodate",
        "tokyo-kawaasobi-spots-10"
      ],
      "verification": {
        "verifiedAt": "2026-11-20",
        "method": "official",
        "note": "公式サイトのトップ（所在地・3フロアの構成・予約フォームの受付期間・料金表の画像「2026年9月改定 料金のご案内」の遊び場スポット1家族2時間1,800円、月額パス大人3,500円・小学生2,500円・未就学児1,500円・ゲスト500円、一時保育1時間1,500円・6か月〜未就学児・最大3時間、「鮫洲駅 徒歩1分」）、2階のページ（りんごの木・畳・工作コーナー）、お問い合わせページ（京急本線鮫洲駅東口徒歩1分）、FAQ（各タブを開いて年齢・授乳室・飲食・予約・キャンセル・駐車場・自転車置き場）、公式の予約ページ（Airリザーブ・スポット利用は所要2時間）を内蔵ブラウザで読み取りのみ確認。FAQの一時預かりの対象「８か月～５歳児」は料金表（6か月〜未就学児）と食い違うため、新しい料金表の方を書いた。営業時間・定休日は文章の記載がなく書いていない。1階の遊具（ボルダリングの柱・ボールプール）は公式の写真に写っているが文章の記載がないため紹介文に入れていない。"
      }
    }
  ],
};
