/**
 * 関西・愛知ファミリー駅。各店は2026-08-24に公式で実在確認済み。
 *
 * 確認に使った一次情報（すべて実際に200で取得済み）:
 * - 万博記念公園: ららぽーとEXPOCITY公式ショップガイド
 *   https://mitsui-shopping-park.com/lalaport/expocity/shopguide/ ＋各店詳細ページ
 * - 大阪港: 天保山マーケットプレース公式ショップJSON
 *   https://www.kaiyukan.com/thv/marketplace/shop/json/list.json ＋各店詳細ページ
 * - トレードセンター前: ATC公式テナントAPI
 *   https://www.atc-co.com/wp-json/atc/v1/tenants?store_type=restaurant
 * - 大阪城公園: JO-TERRACE OSAKA公式ショップ一覧 https://jo-terrace.jp/shop
 * - 神戸: 神戸ハーバーランドumie公式ショップ一覧・各店詳細 https://umie.jp/shops
 * - 須磨海浜公園: 神戸須磨シーワールド公式 https://www.kobesuma-seaworld.jp/restaurant/
 * - 枚方公園: ひらかたパーク公式 https://www.hirakatapark.co.jp/shops/
 * - 計算科学センター: 神戸どうぶつ王国公式 https://www.kobe-oukoku.com/shops
 *
 * 設備フィールドは出典に明記がある場合のみ設定（kidsMenu は公式表記
 * 「お子さまメニューあり」「キッズメニュー」を確認した店のみ）。
 * 価格は一次情報で裏取りしていないため priceLunch は全店未設定。
 */

import type { StationIndieMap } from './types';

export const CHUNK_43: StationIndieMap = {
  // ===========================================================
  // 大阪府
  // ===========================================================

  // 万博記念公園（ららぽーとEXPOCITY）
  'banpaku-kinen-koen': [
    {
      name: '万博食堂',
      genre: 'others',
      area: '万博記念公園駅周辺（ららぽーとEXPOCITY エキスポキッチン1F）',
      description:
        '1970年大阪万博をテーマにしたレストラン。公式ショップ紹介は「1970年3月、大阪に『世界』がやって来ました」と当時の万博を掲げる。ららぽーとEXPOCITYのレストランゾーン・エキスポキッチン内にある。',
      seatingType: ['table'],
    },
    {
      name: 'BUFFET RESTAURANT Atlantic',
      genre: 'others',
      area: '万博記念公園駅周辺（ららぽーとEXPOCITY エキスポキッチン2F）',
      description:
        '公式紹介が「世界の『美味しい』に出会う旅へのご案内」とうたうビュッフェレストラン。好きな料理を好きな量だけ取れるビュッフェ形式は、食べる量が読めない子連れでも調整しやすい。',
      shareDish: true,
      seatingType: ['table'],
    },
    {
      name: 'さわだ飯店',
      genre: 'chinese',
      area: '万博記念公園駅周辺（ららぽーとEXPOCITY グリーンサイド3F フードコート）',
      description:
        'ミシュラン6年連続受賞「エスサワダ」の澤田州平が手掛けるカジュアル中華と公式が紹介する人気店。フードコート内の店舗なので、席の自由度が高く子連れでも利用しやすい。',
      seatingType: ['table'],
      popular: true,
    },
    {
      name: 'BARBARA EXPO RESTAURANT',
      genre: 'cafe',
      area: '万博記念公園駅周辺（ららぽーとEXPOCITY エキスポキッチン2F）',
      description:
        '東京発のレストランカフェ「BARBARA」の関西初上陸店と公式が紹介。家族が食卓を囲んだ昭和の良き時代に思いをはせるダイニングパビリオンがコンセプトで、エキスポキッチン2Fにある。',
      seatingType: ['table'],
    },
  ],

  // 大阪港（海遊館・天保山マーケットプレース）
  'osaka-ko': [
    {
      name: '会津屋',
      genre: 'teppan',
      area: '大阪港駅周辺（天保山マーケットプレース2F フードコート）',
      description:
        '昭和8年創業、公式が「これぞ元祖」と紹介するたこ焼きの店。初代・遠藤留吉のラヂオ焼きが大阪のたこ焼きのはじまりと説明される。フードコート内なので子連れでも気軽に立ち寄れる。',
      seatingType: ['table'],
      popular: true,
    },
    {
      name: '自由軒',
      genre: 'curry',
      area: '大阪港駅周辺（天保山マーケットプレース2F なにわ食いしんぼ横丁）',
      description:
        '創業1910年の名物カレーの店。公式紹介では「大阪人がカレーにソースをかけるのは自由軒がルーツ」と説明される大阪の老舗。昭和の大阪の街並みを再現した食いしんぼ横丁内にある。',
      popular: true,
    },
    {
      name: '北極星',
      genre: 'yoshoku',
      area: '大阪港駅周辺（天保山マーケットプレース2F なにわ食いしんぼ横丁）',
      description:
        '公式が「オムライス発祥の店」と紹介する大阪の老舗洋食店で、2022年4月に創業100年を迎えた。子どもと取り分けやすいオムライスが看板メニューで、海遊館とあわせたランチに使いやすい。',
      popular: true,
    },
    {
      name: 'マザームーンカフェ',
      genre: 'cafe',
      area: '大阪港駅周辺（天保山マーケットプレース2F レストラン・カフェ）',
      description:
        '神戸発祥の老舗カフェ「マザームーンカフェ」がセルフスタイルで出店した店と公式が紹介。公式ショップ一覧の表記はコーヒー＆パンケーキで、水族館帰りの休憩やランチに使いやすい。',
    },
  ],

  // トレードセンター前（ATC）
  'trade-center-mae': [
    {
      name: '鶴橋風月 南港店',
      genre: 'teppan',
      area: 'トレードセンター前駅周辺（ATC O\'s棟南館3F）',
      description:
        '大阪のお好み焼き店「鶴橋風月」の南港店。ATC公式のレストラン一覧に「お好み焼き他」のジャンルで掲載されている。鉄板を囲んで取り分けながら食べられるので家族利用に向く。',
      shareDish: true,
    },
    {
      name: '南港ATC海鮮食堂おーうえすと',
      genre: 'sushi',
      area: 'トレードセンター前駅周辺（ATC O\'s棟北館3F）',
      description:
        'ATC公式のレストラン一覧に「海鮮」ジャンルで掲載される海鮮食堂。大阪港エリアの商業施設ATC内にあり、海側の立地で食事ができる。詳細メニューや設備は店舗への確認が前提。',
    },
    {
      name: '魚とおこめとドンブリと',
      genre: 'sushi',
      area: 'トレードセンター前駅周辺（ATC O\'s棟北館2F シーサイドテラス）',
      description:
        'ATC公式一覧に「海鮮丼」ジャンルで掲載される丼専門店。海側のシーサイドテラス区画にあり、丼ものは提供が早く子連れランチでも待ち時間が短くすみやすい業態。',
    },
    {
      name: '神戸気質 by 神戸珈琲物語',
      genre: 'bakery',
      area: 'トレードセンター前駅周辺（ATC O\'s棟北館2F）',
      description:
        'ATC公式のレストラン一覧に「ベーカリーレストラン」ジャンルで掲載される店。パン主体の業態なので、パン好きの子どもとの軽めのランチや休憩に使いやすい。詳細は店舗確認が前提。',
    },
  ],

  // 大阪城公園（JO-TERRACE OSAKA）
  'osakajo-koen': [
    {
      name: 'Italian Dining NATURA',
      genre: 'italian',
      area: '大阪城公園駅周辺（JO-TERRACE OSAKA内）',
      description:
        'JO-TERRACE OSAKA公式ショップ一覧に「パスタ・パイ生地PIZZA」のジャンルで掲載されるイタリアン。大阪城公園の緑に面したテラス型商業施設内で、公園遊びとセットのランチに使いやすい。',
    },
    {
      name: '名代 千房',
      genre: 'teppan',
      area: '大阪城公園駅周辺（JO-TERRACE OSAKA内）',
      description:
        '大阪のお好み焼き店「千房」の店舗。JO-TERRACE OSAKA公式ショップ一覧に「お好み焼・鉄板焼」のジャンルで掲載されている。お好み焼きは切り分けて家族でシェアしやすいメニュー。',
      shareDish: true,
    },
    {
      name: 'たこ焼道楽わなか',
      genre: 'teppan',
      area: '大阪城公園駅周辺（JO-TERRACE OSAKA内）',
      description:
        '大阪のたこ焼き店「わなか」の店舗で、JO-TERRACE OSAKA公式ショップ一覧に「たこ焼」ジャンルで掲載。公園散策の合間に軽くつまめる大阪名物で、テイクアウトしやすい業態。',
    },
    {
      name: 'good spoon All Day Brunch & Dinner & BBQ Terrace',
      genre: 'cafe',
      area: '大阪城公園駅周辺（JO-TERRACE OSAKA内）',
      description:
        'JO-TERRACE OSAKA公式ショップ一覧に「カフェレストラン＆BBQ」のジャンルで掲載される店。ブランチからディナーまで通し営業の業態名で、大阪城公園でのおでかけランチに合わせやすい。',
    },
  ],

  // 枚方公園（ひらかたパーク）
  'hirakata-koen': [
    {
      name: '洋食屋 ココルト（ノームダイニング内）',
      genre: 'yoshoku',
      area: '枚方公園駅周辺（ひらかたパーク園内 ノームダイニング）',
      description:
        'ひらかたパーク園内のフードコート「ノームダイニング」に入る洋食店。公式ショップ案内に「お子さまメニューあり」と明記されており、遊園地の合間の家族ランチに使いやすい。',
      kidsMenu: true,
    },
    {
      name: '大阪うどん あしかり（ノームダイニング内）',
      genre: 'noodles',
      area: '枚方公園駅周辺（ひらかたパーク園内 ノームダイニング）',
      description:
        'ひらかたパーク園内フードコート「ノームダイニング」のうどん店。公式ショップ案内に「お子さまメニューあり」と明記。やわらかいうどんは幼児と取り分けしやすい定番メニュー。',
      kidsMenu: true,
    },
    {
      name: 'らーめん めんこいや（ノームダイニング内）',
      genre: 'noodles',
      area: '枚方公園駅周辺（ひらかたパーク園内 ノームダイニング）',
      description:
        'ひらかたパーク園内フードコート「ノームダイニング」のラーメン店。公式ショップ案内に「お子さまメニューあり」と明記されており、フードコート形式で席の自由度も高い。',
      kidsMenu: true,
    },
  ],

  // ===========================================================
  // 兵庫県
  // ===========================================================

  // 神戸（JR神戸駅・ハーバーランドumie）
  'kobe': [
    {
      name: 'FISHERMAN\'S MARKET（フィッシャーマンズマーケット）',
      genre: 'others',
      area: '神戸駅周辺（神戸ハーバーランドumie モザイク2F）',
      description:
        '運営会社公式ページでシーフードビュッフェと紹介される店。パスタ・ピザ・寿司などバラエティに富んだ料理をバイキング形式で楽しめるとされ、量を調整しながら取り分けたい子連れに向く。',
      shareDish: true,
      popular: true,
    },
    {
      name: 'にしむら珈琲',
      genre: 'cafe',
      area: '神戸駅周辺（神戸ハーバーランドumie サウスモール1F）',
      description:
        '神戸の珈琲店「にしむら珈琲」のumie店。umie公式ショップ一覧では「Restaurant＆Cafe＆Sweets」と紹介されており、カフェ利用だけでなく食事もできる業態表記になっている。',
    },
    {
      name: 'Mother Moon Cafe*（マザームーンカフェ）',
      genre: 'cafe',
      area: '神戸駅周辺（神戸ハーバーランドumie サウスモールB1F）',
      description:
        'umie公式の店舗ページで1993年創業と紹介される神戸のカフェ。ハーバーランドumieのサウスモール地下1Fにあり、買い物や映画とあわせた子連れランチ・休憩に使いやすい立地。',
    },
  ],

  // 須磨海浜公園（神戸須磨シーワールド）
  'suma-kaihin-koen': [
    {
      name: 'ブルーオーシャン',
      genre: 'others',
      area: '須磨海浜公園駅周辺（神戸須磨シーワールド オルカスタディアム1F）',
      description:
        '公式が「西日本初！シャチが見えるブッフェレストラン」と紹介する施設内レストラン。オルカスタディアム1Fにあり、ビュッフェ形式なので子どもの食べる量に合わせて取り分けやすい。',
      shareDish: true,
      popular: true,
    },
    {
      name: 'ワーフ',
      genre: 'others',
      area: '須磨海浜公園駅周辺（神戸須磨シーワールド ドルフィンスタディアム1F）',
      description:
        '神戸須磨シーワールドのドルフィンスタディアム1Fにある、公式が地産地消フードコートと紹介する飲食エリア。フードコート形式で席の自由度が高く、家族での利用に向いている。',
    },
    {
      name: 'せとうちハーバーレストラン',
      genre: 'others',
      area: '須磨海浜公園駅周辺（神戸須磨シーワールドホテル内）',
      description:
        '神戸須磨シーワールドホテル内のレストラン。公式にひょうご県産食材を活用した施設内レストランと紹介され、食事後に水族館へ再入館できる案内がある。詳細は公式サイトで要確認。',
    },
  ],

  // 計算科学センター（神戸どうぶつ王国）
  'keisan-kagaku-center': [
    {
      name: '王国レストラン 花のキッチン',
      genre: 'others',
      area: '計算科学センター駅周辺（神戸どうぶつ王国内 フラワーシャワー）',
      description:
        '神戸どうぶつ王国内のレストラン。公式案内でランチはワンプレートランチ・丼もの・和定食・カレーライス・ラーメン・キッズメニューなどと紹介されており、家族の昼食に使いやすい。',
      kidsMenu: true,
    },
    {
      name: 'めん処 ふくろう庵',
      genre: 'noodles',
      area: '計算科学センター駅周辺（神戸どうぶつ王国内 北エリア）',
      description:
        '神戸どうぶつ王国の北エリアにある麺処。公式案内では定番のきつねうどんや、神戸のご当地メニューであるぼっかけカレーうどんなどを紹介。うどんは幼児と取り分けしやすい定番。',
    },
    {
      name: 'アルパカフェ',
      genre: 'cafe',
      area: '計算科学センター駅周辺（神戸どうぶつ王国内 フラワーシャワー）',
      description:
        '神戸どうぶつ王国内のカフェ。公式案内で手作りバーガーや、ハシビロまん・カピバラまんなどのオリジナルアニマルフードを紹介。動物モチーフの軽食は子どもが喜びやすい。',
    },
  ],
};
