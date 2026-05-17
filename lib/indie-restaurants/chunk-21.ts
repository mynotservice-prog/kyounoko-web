/**
 * 駅別 個人店マッピング — chunk-21（東京・主要ターミナル駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_21: StationIndieMap = {
  // ===========================================================
  // 渋谷（渋谷区）
  // ===========================================================
  'shibuya': [
    {
      name: 'ディズニーハーベストマーケット 渋谷ヒカリエ店',
      genre: 'yoshoku',
      area: '渋谷駅から徒歩3分（渋谷ヒカリエ 7F）',
      description:
        'ディズニーをテーマにしたビュッフェレストラン。ミニー・デイジーをテーマにした要予約の個室があり、世界観を楽しみながら子連れで食事できる。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'TOMBOY（トムボーイ）渋谷',
      genre: 'yoshoku',
      area: '渋谷駅ハチ公口から徒歩3分',
      description:
        '洋食ダイニング。扉付きの完全個室は6名から、座敷は12〜28名対応で、大人数の子連れランチやママ会に使いやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'エマノン ザ ソウル シェア キッチン',
      genre: 'others',
      area: '渋谷駅から徒歩5分',
      description:
        '1階は広々としたソファー席でベビーカーのまま入れるダイニング。カーテンで仕切られた完全個室もあり、赤ちゃん連れでも落ち着いて過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新宿（新宿区）
  // ===========================================================
  'shinjuku': [
    {
      name: 'するり 新宿本店',
      genre: 'washoku',
      area: '新宿駅から徒歩7分（歌舞伎町）',
      description:
        '和食店。2〜10名対応の完全個室と広めのダイニングテーブル席があり、子連れでも周りを気にせず食事できる。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 池袋（豊島区）
  // ===========================================================
  'ikebukuro': [
    {
      name: '音音 池袋',
      genre: 'washoku',
      area: '池袋駅東口から徒歩3分（MI PLAZA 5F）',
      description:
        '落ち着いた和食店。ベビーカーのまま入店でき、座敷や個室も多い。おこさま御膳（1,000円）などキッズメニューも充実。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'GOOD MORNING CAFE ルミネ池袋',
      genre: 'cafe',
      area: '池袋駅から徒歩1分（ルミネ池袋 8F）',
      description:
        '中庭に面した窓から自然光が入る明るいカフェ。ベビーカーのまま入店でき、赤ちゃん連れでも過ごしやすい。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Kimi Natural 73+ CAFE',
      genre: 'cafe',
      area: '池袋駅西口から徒歩5分',
      description:
        '旅館併設のカフェ。2階はお座敷の和個室が12部屋あり、エレベーターでベビーカーのまま上がれる。ランチ・キッズメニューも豊富。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 上野（台東区）
  // ===========================================================
  'ueno': [
    {
      name: '音音 上野バンブーガーデン店',
      genre: 'washoku',
      area: '上野駅から徒歩3分（上野バンブーガーデン 2F）',
      description:
        '353席と広く個室もある和食店。エビフライやうどん、デザートが付く「パンダおこさま膳」が子どもに人気。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ルーキスガーデン（LUCIS GARDEN）',
      genre: 'chinese',
      area: '上野駅から徒歩5分（東天紅 上野本店 9F）',
      description:
        '上野公園や不忍池を望む眺めが自慢の中華。広めの個室があり、動き盛りの子がいても落ち着いて食事できる。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 錦糸町（墨田区）
  // ===========================================================
  'kinshicho': [
    {
      name: 'Cielo y Rio HIGASHI（シエロイリオ ヒガシ）',
      genre: 'italian',
      area: '錦糸町駅直結（テルミナ 5F）',
      description:
        '駅直結のイタリアン。個室とテラス席があり開放感がある。本格石窯で焼くピザが人気で、子連れランチに使いやすい。',
      privateRoom: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '四季の蔵 錦糸町',
      genre: 'washoku',
      area: '錦糸町駅南口から徒歩2分',
      description:
        '和食店。いろいろな人数で使える個室がそろい、座敷席もあるので子連れでもゆったり過ごせる。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 恵比寿（渋谷区）
  // ===========================================================
  'ebisu': [
    {
      name: 'クンビラ（KHUMBILA）',
      genre: 'asian',
      area: '恵比寿駅から徒歩2分',
      description:
        'ネパール料理専門店。5階と6階に個室ランチがあり、おしゃれな個室で子連れのママ会が楽しめる。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Tsunami Ebisu TOKYO',
      genre: 'asian',
      area: '恵比寿駅から徒歩4分',
      description:
        'ハワイ料理が楽しめる店。個室やソファー席があり、子連れでもゆっくりくつろげる。子どもも食べやすいメニューも。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 中目黒（目黒区）
  // ===========================================================
  'naka-meguro': [
    {
      name: 'Malkovich（マルコヴィッチ）',
      genre: 'bakery',
      area: '中目黒駅から徒歩5分',
      description:
        '中目黒のベーカリーカフェ。焼きたてパンとともにランチが楽しめ、子連れのママ会利用も多い。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
