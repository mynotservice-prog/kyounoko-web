/**
 * 駅別 個人店マッピング — chunk-20（東京・子連れランチ拡充 第1弾）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜19 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_20: StationIndieMap = {
  // ===========================================================
  // 吉祥寺（武蔵野市）
  // ===========================================================
  'kichijoji': [
    {
      name: '點心茶室 吉祥寺店',
      genre: 'chinese',
      area: '吉祥寺駅から徒歩1分（東急百貨店吉祥寺店9階）',
      description:
        '東急百貨店9階の中華。点心や麺のランチコースがあり、5〜24名対応の個室も。同フロアのトイレにベビーシートがあり、百貨店内で動線が楽。',
      privateRoom: true,
      kidsCutlery: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'Bistrante SHAFT（ビストランテ シャフト）',
      genre: 'french',
      area: '吉祥寺駅から徒歩6分（中道通り）',
      description:
        '中道通りのビストロ。ガレットや肉料理のランチがサラダ・スープ・ドリンク付きで1,000円台。奥に4〜5名の個室が1部屋あり、子連れでも落ち着ける。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'SHUTTERS（シャッターズ）吉祥寺',
      genre: 'yoshoku',
      area: '吉祥寺駅北口から徒歩4分',
      description:
        '北口から徒歩4分の洋食店。パスタや焼きカレーのランチがあり、4〜8名のガラス張り個室を予約できる。グループでの子連れランチに使いやすい。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ペパカフェ・フォレスト',
      genre: 'cafe',
      area: '吉祥寺駅から徒歩10分（井の頭恩賜公園内）',
      description:
        '井の頭公園の中にあるカフェ。広い店内はベビーカーで入りやすく、キッズチェアや子ども用カトラリーを用意。公園あそびの前後の休憩に。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'マザーズ 吉祥寺',
      genre: 'cafe',
      area: '吉祥寺駅から徒歩5分',
      description:
        'ベビーカーのまま入れるカフェ。ソファ席は間隔が広めで開放感があり、子連れでもゆったり過ごせる。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '日本酒ラボ 吉祥寺',
      genre: 'washoku',
      area: '吉祥寺駅から徒歩5分',
      description:
        'ベビーカーのまま入店できる和食店。小上がり席やおもちゃ、子ども椅子、おむつ替え台まで揃い、赤ちゃん連れに配慮された造り。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 三鷹（三鷹市・武蔵野市）
  // ===========================================================
  'mitaka': [
    {
      name: '武蔵野カンプス',
      genre: 'yoshoku',
      area: '三鷹駅北口から徒歩5分',
      description:
        '店内が広くベビーカーのまま入店でき、子ども用食器・おむつ替え台あり。ランチはサラダバー・ドリンクバー付きで1,000円前後とコスパが良く、子連れ客で賑わう人気店。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['box', 'table'],
      diaperChangingTable: true,
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '車（くるま）三鷹店',
      genre: 'washoku',
      area: '三鷹駅から徒歩5分',
      description:
        '本格地鶏料理の和食店。落ち着いた雰囲気で、個室や広い座敷席があり子連れママ会にも。ランチは900円台からと意外と手頃。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '定食あさひ',
      genre: 'washoku',
      area: '三鷹駅から徒歩約13分',
      description:
        '2階が座敷席で絵本も置いてあり、子連れでもくつろぎやすい定食店。子連れなら2階の座敷がおすすめ。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 中野（中野区）
  // ===========================================================
  'nakano': [
    {
      name: 'さらしな総本店 北口店',
      genre: 'noodles',
      area: '中野駅北口から徒歩4分',
      description:
        '純手打ちそばが人気の老舗系そば店。落ち着いた店内に座敷席があり、子連れでも使いやすい。そばは取り分けにも向く。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'bistro & grill me at park',
      genre: 'yoshoku',
      area: 'JR中野駅北口から徒歩5分',
      description:
        'お得なランチメニューがあるビストロ。キッズチェア・キッズメニューがあり、ベビーカーOK。施設内におむつ替え・授乳室も。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'cafeLOU（カフェ ルー）',
      genre: 'cafe',
      area: '中野駅北口から徒歩5分',
      description:
        'カウンター・テーブル・テラス席に分かれたカフェ。ベビーカーで入りやすく、公園散歩の前後の休憩にも。',
      strollerOk: true,
      seatingType: ['counter', 'table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 二子玉川（世田谷区）
  // ===========================================================
  'futako-tamagawa': [
    {
      name: '100本のスプーン 二子玉川',
      genre: 'yoshoku',
      area: '二子玉川駅から徒歩4分（玉川髙島屋S・C内）',
      description:
        'シェフが当日に月齢別の離乳食を作って無料で提供する子連れランチの定番。ベビーカーのまま着席でき、0歳の外食デビューにも使いやすい。',
      strollerOk: true,
      strollerToSeat: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'Cafe&Meal MUJI 二子玉川',
      genre: 'cafe',
      area: '二子玉川駅から徒歩3分（二子玉川ライズ内）',
      description:
        '無印良品のカフェ。スペースが広くベビーカー入店でゆったり過ごせ、テラス席も。素材重視の味付けで子どもと取り分けやすい。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Ron Herman Cafe 二子玉川店',
      genre: 'cafe',
      area: '二子玉川駅から徒歩3分（二子玉川ライズ内）',
      description:
        'テラス・テーブル・ソファ席いずれもベビーカーOK。ストッケのベビーチェアや授乳室があり、赤ちゃん連れでも安心して滞在できる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'gelato pique cafe bio concept 二子玉川',
      genre: 'cafe',
      area: '二子玉川駅から徒歩4分（玉川髙島屋S・C内）',
      description:
        'キッズスペースがあり、授乳・調乳室・おむつ替え台を完備。離乳食・キッズメニュー・大人向けメニューが揃う子連れ向きカフェ。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'bills 二子玉川',
      genre: 'cafe',
      area: '二子玉川駅から徒歩4分（玉川髙島屋S・C内）',
      description:
        '席の間隔にゆとりがありベビーカーで通りやすい。キッズメニューもあり、人気のリコッタパンケーキを家族で楽しめる。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],
};
