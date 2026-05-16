/**
 * 埼玉・千葉エリアの駅マスタデータ（東京通勤圏）。
 *
 * 方針:
 * - 関西/神奈川と同じパターンで、prefecture で埼玉/千葉を分ける
 * - slug は lib/indie-restaurants/chunk-40.ts のキーと完全一致
 * - 既存の東京/関西/神奈川の駅機能を一切変更しない
 */

export type SaiChiPrefecture = 'saitama' | 'chiba';

export type SaiChiStation = {
  /** スラグ（URL用、英字小文字＋ハイフン） */
  slug: string;
  /** 日本語駅名 */
  name: string;
  /** 駅名のカナ */
  kana: string;
  /** 所属する県 */
  prefecture: SaiChiPrefecture;
  /** エリア名（市区町村ベース） */
  area: string;
  /** 路線リスト */
  lines: string[];
  /** 駅規模 */
  scale: 'terminal' | 'major' | 'minor';
  /** ファミリー客が多いエリアか */
  familyFriendly?: boolean;
  /** 駅周辺の特徴（80字程度） */
  description?: string;
};

/**
 * 埼玉15駅 + 千葉15駅 = 30駅。slug は lib/indie-restaurants/chunk-40.ts と一致。
 */
export const SAICHI_STATIONS: SaiChiStation[] = [
  // ===== 埼玉県 =====
  {
    slug: 'omiya',
    name: '大宮',
    kana: 'おおみや',
    prefecture: 'saitama',
    area: 'さいたま市大宮区',
    lines: ['JR東北本線', 'JR京浜東北線', 'JR埼京線', 'JR川越線', 'JR上越新幹線', 'JR東北新幹線', '東武野田線', 'ニューシャトル'],
    scale: 'terminal',
    familyFriendly: true,
    description: '埼玉県最大のターミナル。ルミネ大宮・大宮タカシマヤ・そごう大宮にベビールーム多数。鉄道博物館の最寄り。',
  },
  {
    slug: 'urawa',
    name: '浦和',
    kana: 'うらわ',
    prefecture: 'saitama',
    area: 'さいたま市浦和区',
    lines: ['JR東北本線', 'JR京浜東北線', 'JR湘南新宿ライン', 'JR上野東京ライン'],
    scale: 'major',
    familyFriendly: true,
    description: 'さいたま市の県庁所在地中心駅。アトレ浦和・伊勢丹浦和にベビールーム完備。文教地区で子育て世帯が多い。',
  },
  {
    slug: 'kawaguchi',
    name: '川口',
    kana: 'かわぐち',
    prefecture: 'saitama',
    area: '川口市',
    lines: ['JR京浜東北線'],
    scale: 'major',
    familyFriendly: true,
    description: '川口市の中央駅。キュポ・ラ川口・アリオ川口にファミリー対応の施設が集中。',
  },
  {
    slug: 'nishi-kawaguchi',
    name: '西川口',
    kana: 'にしかわぐち',
    prefecture: 'saitama',
    area: '川口市',
    lines: ['JR京浜東北線'],
    scale: 'minor',
    familyFriendly: true,
    description: '川口市の住宅地駅。子育て世帯が多く、個人店・カフェが点在。',
  },
  {
    slug: 'soka',
    name: '草加',
    kana: 'そうか',
    prefecture: 'saitama',
    area: '草加市',
    lines: ['東武スカイツリーライン'],
    scale: 'major',
    familyFriendly: true,
    description: '草加市の中心駅。VARIE草加・LL.PIA草加にファミリー対応設備。草加せんべいの本場。',
  },
  {
    slug: 'kawagoe',
    name: '川越',
    kana: 'かわごえ',
    prefecture: 'saitama',
    area: '川越市',
    lines: ['JR川越線', '東武東上線', '西武新宿線（本川越）'],
    scale: 'major',
    familyFriendly: true,
    description: '小江戸川越の玄関口。アトレマルヒロ・ウニクス川越が徒歩圏。蔵造り通り観光も楽しめる。',
  },
  {
    slug: 'tokorozawa',
    name: '所沢',
    kana: 'ところざわ',
    prefecture: 'saitama',
    area: '所沢市',
    lines: ['西武池袋線', '西武新宿線'],
    scale: 'major',
    familyFriendly: true,
    description: '西武鉄道の分岐駅。グランエミオ所沢・西武所沢S.C.にファミリー向け店舗が集中。',
  },
  {
    slug: 'kasukabe',
    name: '春日部',
    kana: 'かすかべ',
    prefecture: 'saitama',
    area: '春日部市',
    lines: ['東武スカイツリーライン', '東武野田線'],
    scale: 'major',
    familyFriendly: true,
    description: '東武の主要駅。ララガーデン春日部にファミリー向け施設。クレヨンしんちゃんの舞台で知られる。',
  },
  {
    slug: 'koshigaya',
    name: '越谷',
    kana: 'こしがや',
    prefecture: 'saitama',
    area: '越谷市',
    lines: ['東武スカイツリーライン'],
    scale: 'major',
    familyFriendly: true,
    description: '越谷市中央の駅。マルイファミリー越谷など子育て世帯向け施設が充実。',
  },
  {
    slug: 'koshigaya-laketown',
    name: '越谷レイクタウン',
    kana: 'こしがやれいくたうん',
    prefecture: 'saitama',
    area: '越谷市',
    lines: ['JR武蔵野線'],
    scale: 'major',
    familyFriendly: true,
    description: 'イオンレイクタウンの最寄り駅。日本最大級のショッピングモールで、子連れ施設が圧倒的に充実。',
  },
  {
    slug: 'musashi-urawa',
    name: '武蔵浦和',
    kana: 'むさしうらわ',
    prefecture: 'saitama',
    area: 'さいたま市南区',
    lines: ['JR武蔵野線', 'JR埼京線'],
    scale: 'major',
    familyFriendly: true,
    description: '武蔵野線と埼京線の乗換駅。マーレ・ビバモール武蔵浦和でファミリー対応。',
  },
  {
    slug: 'kita-urawa',
    name: '北浦和',
    kana: 'きたうらわ',
    prefecture: 'saitama',
    area: 'さいたま市浦和区',
    lines: ['JR京浜東北線'],
    scale: 'minor',
    familyFriendly: true,
    description: '浦和の北側、北浦和公園と埼玉県立近代美術館の最寄り。子育て層に人気の住宅街。',
  },
  {
    slug: 'asaka',
    name: '朝霞',
    kana: 'あさか',
    prefecture: 'saitama',
    area: '朝霞市',
    lines: ['東武東上線'],
    scale: 'major',
    familyFriendly: true,
    description: '東武東上線の主要駅。マルエツ朝霞店ほか日常生活に密着した店舗が並ぶファミリーエリア。',
  },
  {
    slug: 'wako-shi',
    name: '和光市',
    kana: 'わこうし',
    prefecture: 'saitama',
    area: '和光市',
    lines: ['東武東上線', '東京メトロ有楽町線', '東京メトロ副都心線'],
    scale: 'major',
    familyFriendly: true,
    description: '東上線と東京メトロの乗換駅。サミット和光・イオン和光ショッピングセンターでファミリー対応。',
  },
  {
    slug: 'shiki',
    name: '志木',
    kana: 'しき',
    prefecture: 'saitama',
    area: '新座市',
    lines: ['東武東上線'],
    scale: 'major',
    familyFriendly: true,
    description: '東武東上線の準急停車駅。マルイファミリー志木にベビールーム完備。文教地区で子育て層が多い。',
  },

  // ===== 千葉県 =====
  {
    slug: 'chiba',
    name: '千葉',
    kana: 'ちば',
    prefecture: 'chiba',
    area: '千葉市中央区',
    lines: ['JR総武本線', 'JR外房線', 'JR内房線', 'JR成田線', 'JR京葉線', '京成千葉線', '千葉モノレール'],
    scale: 'terminal',
    familyFriendly: true,
    description: '千葉県の中央ターミナル。そごう千葉・千葉パルコ・C-oneでベビールーム完備。',
  },
  {
    slug: 'funabashi',
    name: '船橋',
    kana: 'ふなばし',
    prefecture: 'chiba',
    area: '船橋市',
    lines: ['JR総武本線', 'JR総武快速線', '東武野田線', '京成本線'],
    scale: 'terminal',
    familyFriendly: true,
    description: '千葉県西部の最大ターミナル。シャポー船橋・東武百貨店・シャポー船橋にファミリー向け施設多数。',
  },
  {
    slug: 'kashiwa',
    name: '柏',
    kana: 'かしわ',
    prefecture: 'chiba',
    area: '柏市',
    lines: ['JR常磐線', 'JR上野東京ライン', '東武野田線'],
    scale: 'major',
    familyFriendly: true,
    description: '常磐線と東武野田線の主要駅。柏マルイ・髙島屋柏店・柏そごうが徒歩圏でファミリーニーズに対応。',
  },
  {
    slug: 'matsudo',
    name: '松戸',
    kana: 'まつど',
    prefecture: 'chiba',
    area: '松戸市',
    lines: ['JR常磐線', '新京成電鉄'],
    scale: 'major',
    familyFriendly: true,
    description: '松戸市の中央駅。アトレ松戸・キテミテマツドにベビールーム完備。市民が日常的に利用するファミリー駅。',
  },
  {
    slug: 'tsudanuma',
    name: '津田沼',
    kana: 'つだぬま',
    prefecture: 'chiba',
    area: '習志野市',
    lines: ['JR総武本線', 'JR総武快速線', '新京成電鉄'],
    scale: 'major',
    familyFriendly: true,
    description: '習志野市・船橋市にまたがる主要駅。モリシア津田沼・パルコ・イトーヨーカドーが集積する子育てエリア。',
  },
  {
    slug: 'ichikawa',
    name: '市川',
    kana: 'いちかわ',
    prefecture: 'chiba',
    area: '市川市',
    lines: ['JR総武本線', 'JR総武快速線'],
    scale: 'major',
    familyFriendly: true,
    description: '市川市の中央駅。シャポー市川にベビールーム完備。文教地区で子育て層に人気。',
  },
  {
    slug: 'urayasu',
    name: '浦安',
    kana: 'うらやす',
    prefecture: 'chiba',
    area: '浦安市',
    lines: ['東京メトロ東西線'],
    scale: 'major',
    familyFriendly: true,
    description: '浦安市中央の駅。エスカマーレ・アトレ浦安にベビールーム完備。子育て世帯満足度が高い都市。',
  },
  {
    slug: 'maihama',
    name: '舞浜',
    kana: 'まいはま',
    prefecture: 'chiba',
    area: '浦安市',
    lines: ['JR京葉線'],
    scale: 'terminal',
    familyFriendly: true,
    description: '東京ディズニーリゾートの最寄り駅。イクスピアリ・オフィシャルホテル群で家族旅行の聖地。',
  },
  {
    slug: 'minami-funabashi',
    name: '南船橋',
    kana: 'みなみふなばし',
    prefecture: 'chiba',
    area: '船橋市',
    lines: ['JR京葉線', 'JR武蔵野線'],
    scale: 'major',
    familyFriendly: true,
    description: 'ららぽーとTOKYO-BAY最寄り駅。広大なモールにベビールーム・キッズスペース多数で子連れの聖地。',
  },
  {
    slug: 'kaihimmakuhari',
    name: '海浜幕張',
    kana: 'かいひんまくはり',
    prefecture: 'chiba',
    area: '千葉市美浜区',
    lines: ['JR京葉線'],
    scale: 'major',
    familyFriendly: true,
    description: '幕張メッセ・幕張海浜公園の最寄り。三井アウトレットパーク幕張・イオンモール幕張新都心で子連れ施設が集中。',
  },
  {
    slug: 'nishi-funabashi',
    name: '西船橋',
    kana: 'にしふなばし',
    prefecture: 'chiba',
    area: '船橋市',
    lines: ['JR総武本線', 'JR武蔵野線', 'JR京葉線', '東京メトロ東西線', '東葉高速鉄道', '京成本線'],
    scale: 'major',
    familyFriendly: true,
    description: '6路線が集まるターミナル機能。シャポー西船橋にファミリー対応設備。子育て層の住宅地。',
  },
  {
    slug: 'nagareyama-otakanomori',
    name: '流山おおたかの森',
    kana: 'ながれやまおおたかのもり',
    prefecture: 'chiba',
    area: '流山市',
    lines: ['つくばエクスプレス', '東武野田線'],
    scale: 'major',
    familyFriendly: true,
    description: '近年人口急増の子育て街。流山おおたかの森S.C.が駅直結、ベビールーム・キッズスペース完備。',
  },
  {
    slug: 'kashiwa-no-ha-campus',
    name: '柏の葉キャンパス',
    kana: 'かしわのはきゃんぱす',
    prefecture: 'chiba',
    area: '柏市',
    lines: ['つくばエクスプレス'],
    scale: 'major',
    familyFriendly: true,
    description: '柏の葉スマートシティ最寄り。ららぽーと柏の葉・東京大学キャンパスがあるファミリー新興エリア。',
  },
  {
    slug: 'inage',
    name: '稲毛',
    kana: 'いなげ',
    prefecture: 'chiba',
    area: '千葉市稲毛区',
    lines: ['JR総武本線', 'JR総武快速線'],
    scale: 'major',
    familyFriendly: true,
    description: '千葉市稲毛区の中央駅。アトレ稲毛・稲毛シーサイドにファミリー向け店舗が並ぶ。',
  },
  {
    slug: 'abiko',
    name: '我孫子',
    kana: 'あびこ',
    prefecture: 'chiba',
    area: '我孫子市',
    lines: ['JR常磐線', 'JR成田線'],
    scale: 'major',
    familyFriendly: true,
    description: '我孫子市の中心駅。アビイクオーレ・イトーヨーカドー我孫子南口店にベビールーム完備。手賀沼観光も近い。',
  },
];

/** slug から駅情報を取得。 */
const SAICHI_STATION_MAP = new Map(SAICHI_STATIONS.map((s) => [s.slug, s]));

export function getSaiChiStationBySlug(slug: string): SaiChiStation | undefined {
  return SAICHI_STATION_MAP.get(slug);
}

/** 県別駅一覧。 */
export function getSaiChiStationsByPrefecture(p: SaiChiPrefecture): SaiChiStation[] {
  return SAICHI_STATIONS.filter((s) => s.prefecture === p);
}

/** 県の日本語名マッピング。 */
export const SAICHI_PREFECTURE_NAMES: Record<SaiChiPrefecture, string> = {
  saitama: '埼玉県',
  chiba: '千葉県',
};

/** 表示用の地域ラベル。 */
export const SAICHI_PREFECTURE_LABEL: Record<SaiChiPrefecture, string> = {
  saitama: '埼玉',
  chiba: '千葉',
};
