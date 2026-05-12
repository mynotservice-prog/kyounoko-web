/**
 * 個人店レストランの型定義（チェーン店とは別）。
 * lib/station-restaurants.ts のチェーン店マッピングを補完する形で使う。
 */

export type IndieGenre =
  | 'washoku'      // 和食・割烹・定食
  | 'sushi'        // 寿司・海鮮
  | 'tempura'      // 天ぷら
  | 'tonkatsu'     // とんかつ・洋食
  | 'yoshoku'      // 洋食・ハンバーグ・オムライス
  | 'italian'      // イタリアン・パスタ・ピザ
  | 'french'       // フレンチ・ビストロ
  | 'chinese'      // 中華
  | 'korean'       // 韓国・焼肉・サムギョプサル
  | 'yakiniku'     // 焼肉
  | 'cafe'         // カフェ・喫茶店
  | 'bakery'       // パン・ベーカリーカフェ
  | 'sweets'       // スイーツ・ケーキ
  | 'curry'        // カレー・スパイス
  | 'noodles'      // ラーメン・うどん・そば
  | 'shabu'        // しゃぶしゃぶ・すき焼き
  | 'teppan'       // 鉄板焼き・お好み焼き
  | 'asian'        // タイ・ベトナム・エスニック
  | 'others';      // その他

/** 席のタイプ（station-restaurants.ts の SeatingType と互換） */
export type IndieSeatingType =
  | 'box'     // ボックス席
  | 'table'   // 通常テーブル席
  | 'counter' // カウンター席
  | 'zashiki' // 座敷・小上がり
  | 'terrace';// テラス・オープン席

export type IndieRestaurant = {
  /** 店名（実在の店舗名） */
  name: string;
  /** ジャンル */
  genre: IndieGenre;
  /** エリア説明（最寄り駅・徒歩分数等。「渋谷駅から徒歩3分」等） */
  area: string;
  /** 80-120字の店舗紹介。子連れ向きポイントを含める */
  description: string;
  /** ベビーカー入店可（情報がある場合のみ true。要店舗確認の前提） */
  strollerOk?: boolean;
  /** お子様メニュー有無（情報がある場合のみ） */
  kidsMenu?: boolean;
  /** 個室・座敷あり */
  privateRoom?: boolean;
  /** キッズチェア（高さ調整できる子供用椅子）あり */
  kidsChair?: boolean;
  /** 子供用スプーン・フォーク・取り皿の提供あり */
  kidsCutlery?: boolean;
  /** 店内にキッズスペース・遊び場あり */
  kidsSpace?: boolean;
  // ===== 子連れ目線フィールド（v6 追加）=====
  /** 入口・店内に段差なし（ベビーカーそのまま入店可） */
  stepFree?: boolean;
  /** 用意のある席タイプ */
  seatingType?: IndieSeatingType[];
  /** おむつ替え台あり（多目的トイレ含む） */
  diaperChangingTable?: boolean;
  /** 授乳室・授乳スペースあり */
  nursingRoom?: boolean;
  /** 離乳食持ち込みOK（公式・取材ベース） */
  bringBabyFood?: boolean;
  /** 取り分け前提のメニュー（シェア・小皿・小盛り対応） */
  shareDish?: boolean;
  /** ベビーカーで席まで（たたまずに済む通路幅） */
  strollerToSeat?: boolean;
  /** アレルゲン表示あり（公式メニューに記載） */
  allergenInfo?: boolean;
  // =============================================
  /** ランチ価格帯 */
  priceLunch: '〜1,000円' | '〜2,000円' | '〜3,500円' | '〜5,000円' | '5,000円〜';
  /** メディア掲載・SNSで話題等の人気フラグ */
  popular?: boolean;
};

/**
 * 駅slug → その駅周辺の個人店リスト。
 * 各 chunk-*.ts ファイルから集約される。
 */
export type StationIndieMap = Record<string, IndieRestaurant[]>;
