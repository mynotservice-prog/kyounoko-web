/**
 * 東京23区内の駅マスタデータ。
 * 駅別子連れランチ/ベビーカーOK店ガイド用。
 *
 * 方針:
 * - 同じ駅名でも路線で別駅の場合は1エントリにまとめる（lines に複数路線）
 * - 接続駅（例: 新宿三丁目と新宿御苑前）は別 slug
 * - scale 判定: terminal=超巨大ターミナル(10駅程度), major=主要乗換/繁華街(80駅程度), minor=その他
 * - familyFriendly: 住宅地・公園・子育て世代多い区の駅は true
 */

export type TokyoWard =
  | 'chiyoda' | 'chuo' | 'minato' | 'shinjuku' | 'bunkyo' | 'taito'
  | 'sumida' | 'koto' | 'shinagawa' | 'meguro' | 'ota' | 'setagaya'
  | 'shibuya' | 'nakano' | 'suginami' | 'toshima' | 'kita' | 'arakawa'
  | 'itabashi' | 'nerima' | 'adachi' | 'katsushika' | 'edogawa';

export type TokyoStation = {
  /** スラグ（URL用、英字小文字＋ハイフン）。例: 'shibuya', 'nishi-shinjuku', 'omote-sando' */
  slug: string;
  /** 日本語駅名。例: '渋谷', '西新宿', '表参道' */
  name: string;
  /** 駅名のカナ */
  kana: string;
  /** 所属する区（複数の区にまたがる場合は主要な区） */
  ward: TokyoWard;
  /** 路線リスト。例: ['JR山手線', 'JR埼京線', '東京メトロ銀座線'] */
  lines: string[];
  /** 乗降客数（万人/日、概算）。'ターミナル駅', '主要駅', '一般駅' の3段階で大体: 50万以上=ターミナル、10-50万=主要、10万未満=一般 */
  scale: 'terminal' | 'major' | 'minor';
  /** ファミリー客が多いエリアか（買い物・公園・住宅地）。 SEOタイトル動的化に使用 */
  familyFriendly?: boolean;
};

export const TOKYO_STATIONS: TokyoStation[] = [
  // ===== 千代田区 =====
  { slug: 'tokyo', name: '東京', kana: 'とうきょう', ward: 'chiyoda', lines: ['JR山手線', 'JR京浜東北線', 'JR中央線', 'JR東海道線', 'JR横須賀線', 'JR総武線快速', 'JR京葉線', 'JR上野東京ライン', '東京メトロ丸ノ内線'], scale: 'terminal', familyFriendly: true },
  { slug: 'akihabara', name: '秋葉原', kana: 'あきはばら', ward: 'chiyoda', lines: ['JR山手線', 'JR京浜東北線', 'JR総武線', '東京メトロ日比谷線', 'つくばエクスプレス'], scale: 'terminal', familyFriendly: false },
  { slug: 'kanda', name: '神田', kana: 'かんだ', ward: 'chiyoda', lines: ['JR山手線', 'JR京浜東北線', 'JR中央線', '東京メトロ銀座線'], scale: 'major', familyFriendly: false },
  { slug: 'yurakucho', name: '有楽町', kana: 'ゆうらくちょう', ward: 'chiyoda', lines: ['JR山手線', 'JR京浜東北線', '東京メトロ有楽町線'], scale: 'major', familyFriendly: false },
  { slug: 'iidabashi', name: '飯田橋', kana: 'いいだばし', ward: 'chiyoda', lines: ['JR中央・総武線', '東京メトロ東西線', '東京メトロ有楽町線', '東京メトロ南北線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'ichigaya', name: '市ケ谷', kana: 'いちがや', ward: 'chiyoda', lines: ['JR中央・総武線', '東京メトロ有楽町線', '東京メトロ南北線', '都営新宿線'], scale: 'major' },
  { slug: 'yotsuya', name: '四ツ谷', kana: 'よつや', ward: 'chiyoda', lines: ['JR中央線', 'JR中央・総武線', '東京メトロ丸ノ内線', '東京メトロ南北線'], scale: 'major' },
  { slug: 'ochanomizu', name: '御茶ノ水', kana: 'おちゃのみず', ward: 'chiyoda', lines: ['JR中央線', 'JR中央・総武線', '東京メトロ丸ノ内線'], scale: 'major' },
  { slug: 'shin-ochanomizu', name: '新御茶ノ水', kana: 'しんおちゃのみず', ward: 'chiyoda', lines: ['東京メトロ千代田線'], scale: 'minor' },
  { slug: 'awajicho', name: '淡路町', kana: 'あわじちょう', ward: 'chiyoda', lines: ['東京メトロ丸ノ内線'], scale: 'minor' },
  { slug: 'ogawamachi', name: '小川町', kana: 'おがわまち', ward: 'chiyoda', lines: ['都営新宿線'], scale: 'minor' },
  { slug: 'iwamotocho', name: '岩本町', kana: 'いわもとちょう', ward: 'chiyoda', lines: ['都営新宿線'], scale: 'minor' },
  { slug: 'otemachi', name: '大手町', kana: 'おおてまち', ward: 'chiyoda', lines: ['東京メトロ丸ノ内線', '東京メトロ東西線', '東京メトロ千代田線', '東京メトロ半蔵門線', '都営三田線'], scale: 'major' },
  { slug: 'nijubashimae', name: '二重橋前', kana: 'にじゅうばしまえ', ward: 'chiyoda', lines: ['東京メトロ千代田線'], scale: 'minor' },
  { slug: 'hibiya', name: '日比谷', kana: 'ひびや', ward: 'chiyoda', lines: ['東京メトロ日比谷線', '東京メトロ千代田線', '都営三田線'], scale: 'major' },
  { slug: 'kasumigaseki', name: '霞ケ関', kana: 'かすみがせき', ward: 'chiyoda', lines: ['東京メトロ丸ノ内線', '東京メトロ日比谷線', '東京メトロ千代田線'], scale: 'major' },
  { slug: 'kokkai-gijidomae', name: '国会議事堂前', kana: 'こっかいぎじどうまえ', ward: 'chiyoda', lines: ['東京メトロ丸ノ内線', '東京メトロ千代田線'], scale: 'minor' },
  { slug: 'nagatacho', name: '永田町', kana: 'ながたちょう', ward: 'chiyoda', lines: ['東京メトロ有楽町線', '東京メトロ半蔵門線', '東京メトロ南北線'], scale: 'major' },
  { slug: 'akasaka-mitsuke', name: '赤坂見附', kana: 'あかさかみつけ', ward: 'chiyoda', lines: ['東京メトロ銀座線', '東京メトロ丸ノ内線'], scale: 'major' },
  { slug: 'hanzomon', name: '半蔵門', kana: 'はんぞうもん', ward: 'chiyoda', lines: ['東京メトロ半蔵門線'], scale: 'minor' },
  { slug: 'kojimachi', name: '麹町', kana: 'こうじまち', ward: 'chiyoda', lines: ['東京メトロ有楽町線'], scale: 'minor' },
  { slug: 'kudanshita', name: '九段下', kana: 'くだんした', ward: 'chiyoda', lines: ['東京メトロ東西線', '東京メトロ半蔵門線', '都営新宿線'], scale: 'major' },
  { slug: 'jimbocho', name: '神保町', kana: 'じんぼうちょう', ward: 'chiyoda', lines: ['東京メトロ半蔵門線', '都営三田線', '都営新宿線'], scale: 'major' },
  { slug: 'takebashi', name: '竹橋', kana: 'たけばし', ward: 'chiyoda', lines: ['東京メトロ東西線'], scale: 'minor' },
  { slug: 'suidobashi', name: '水道橋', kana: 'すいどうばし', ward: 'chiyoda', lines: ['JR中央・総武線', '都営三田線'], scale: 'major' },

  // ===== 中央区 =====
  { slug: 'ginza', name: '銀座', kana: 'ぎんざ', ward: 'chuo', lines: ['東京メトロ銀座線', '東京メトロ丸ノ内線', '東京メトロ日比谷線'], scale: 'terminal', familyFriendly: false },
  { slug: 'ginza-itchome', name: '銀座一丁目', kana: 'ぎんざいっちょうめ', ward: 'chuo', lines: ['東京メトロ有楽町線'], scale: 'minor' },
  { slug: 'higashi-ginza', name: '東銀座', kana: 'ひがしぎんざ', ward: 'chuo', lines: ['東京メトロ日比谷線', '都営浅草線'], scale: 'major' },
  { slug: 'nihombashi', name: '日本橋', kana: 'にほんばし', ward: 'chuo', lines: ['東京メトロ銀座線', '東京メトロ東西線', '都営浅草線'], scale: 'major' },
  { slug: 'mitsukoshimae', name: '三越前', kana: 'みつこしまえ', ward: 'chuo', lines: ['東京メトロ銀座線', '東京メトロ半蔵門線'], scale: 'major' },
  { slug: 'shintomicho', name: '新富町', kana: 'しんとみちょう', ward: 'chuo', lines: ['東京メトロ有楽町線'], scale: 'minor' },
  { slug: 'tsukiji', name: '築地', kana: 'つきじ', ward: 'chuo', lines: ['東京メトロ日比谷線'], scale: 'major', familyFriendly: false },
  { slug: 'tsukijishijo', name: '築地市場', kana: 'つきじしじょう', ward: 'chuo', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'tsukishima', name: '月島', kana: 'つきしま', ward: 'chuo', lines: ['東京メトロ有楽町線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'kachidoki', name: '勝どき', kana: 'かちどき', ward: 'chuo', lines: ['都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'kayabacho', name: '茅場町', kana: 'かやばちょう', ward: 'chuo', lines: ['東京メトロ東西線', '東京メトロ日比谷線'], scale: 'major' },
  { slug: 'hatchobori', name: '八丁堀', kana: 'はっちょうぼり', ward: 'chuo', lines: ['JR京葉線', '東京メトロ日比谷線'], scale: 'major' },
  { slug: 'suitengumae', name: '水天宮前', kana: 'すいてんぐうまえ', ward: 'chuo', lines: ['東京メトロ半蔵門線'], scale: 'minor', familyFriendly: true },
  { slug: 'ningyocho', name: '人形町', kana: 'にんぎょうちょう', ward: 'chuo', lines: ['東京メトロ日比谷線', '都営浅草線'], scale: 'major' },
  { slug: 'kodemmacho', name: '小伝馬町', kana: 'こでんまちょう', ward: 'chuo', lines: ['東京メトロ日比谷線'], scale: 'minor' },
  { slug: 'bakuroyokoyama', name: '馬喰横山', kana: 'ばくろよこやま', ward: 'chuo', lines: ['都営新宿線'], scale: 'minor' },
  { slug: 'bakurocho', name: '馬喰町', kana: 'ばくろちょう', ward: 'chuo', lines: ['JR総武線快速'], scale: 'minor' },
  { slug: 'higashi-nihombashi', name: '東日本橋', kana: 'ひがしにほんばし', ward: 'chuo', lines: ['都営浅草線'], scale: 'minor' },
  { slug: 'hamacho', name: '浜町', kana: 'はまちょう', ward: 'chuo', lines: ['都営新宿線'], scale: 'minor' },

  // ===== 港区 =====
  { slug: 'shinagawa', name: '品川', kana: 'しながわ', ward: 'minato', lines: ['JR山手線', 'JR京浜東北線', 'JR東海道線', 'JR横須賀線', 'JR上野東京ライン', '京急本線', '東海道新幹線'], scale: 'terminal', familyFriendly: false },
  { slug: 'shimbashi', name: '新橋', kana: 'しんばし', ward: 'minato', lines: ['JR山手線', 'JR京浜東北線', 'JR東海道線', 'JR横須賀線', '東京メトロ銀座線', '都営浅草線', 'ゆりかもめ'], scale: 'terminal', familyFriendly: false },
  { slug: 'tamachi', name: '田町', kana: 'たまち', ward: 'minato', lines: ['JR山手線', 'JR京浜東北線'], scale: 'major' },
  { slug: 'mita', name: '三田', kana: 'みた', ward: 'minato', lines: ['都営三田線', '都営浅草線'], scale: 'major' },
  { slug: 'hamamatsucho', name: '浜松町', kana: 'はままつちょう', ward: 'minato', lines: ['JR山手線', 'JR京浜東北線', '東京モノレール'], scale: 'major' },
  { slug: 'daimon', name: '大門', kana: 'だいもん', ward: 'minato', lines: ['都営浅草線', '都営大江戸線'], scale: 'major' },
  { slug: 'shibakoen', name: '芝公園', kana: 'しばこうえん', ward: 'minato', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'onarimon', name: '御成門', kana: 'おなりもん', ward: 'minato', lines: ['都営三田線'], scale: 'minor' },
  { slug: 'akabanebashi', name: '赤羽橋', kana: 'あかばねばし', ward: 'minato', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'roppongi', name: '六本木', kana: 'ろっぽんぎ', ward: 'minato', lines: ['東京メトロ日比谷線', '都営大江戸線'], scale: 'major', familyFriendly: false },
  { slug: 'roppongi-itchome', name: '六本木一丁目', kana: 'ろっぽんぎいっちょうめ', ward: 'minato', lines: ['東京メトロ南北線'], scale: 'minor' },
  { slug: 'azabu-juban', name: '麻布十番', kana: 'あざぶじゅうばん', ward: 'minato', lines: ['東京メトロ南北線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'hiroo', name: '広尾', kana: 'ひろお', ward: 'minato', lines: ['東京メトロ日比谷線'], scale: 'major', familyFriendly: true },
  { slug: 'akasaka', name: '赤坂', kana: 'あかさか', ward: 'minato', lines: ['東京メトロ千代田線'], scale: 'major' },
  { slug: 'aoyama-itchome', name: '青山一丁目', kana: 'あおやまいっちょうめ', ward: 'minato', lines: ['東京メトロ銀座線', '東京メトロ半蔵門線', '都営大江戸線'], scale: 'major' },
  { slug: 'gaiemmae', name: '外苑前', kana: 'がいえんまえ', ward: 'minato', lines: ['東京メトロ銀座線'], scale: 'major', familyFriendly: true },
  { slug: 'omotesando', name: '表参道', kana: 'おもてさんどう', ward: 'minato', lines: ['東京メトロ銀座線', '東京メトロ千代田線', '東京メトロ半蔵門線'], scale: 'major', familyFriendly: false },
  { slug: 'nogizaka', name: '乃木坂', kana: 'のぎざか', ward: 'minato', lines: ['東京メトロ千代田線'], scale: 'minor' },
  { slug: 'shirokanedai', name: '白金台', kana: 'しろかねだい', ward: 'minato', lines: ['東京メトロ南北線', '都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'shirokane-takanawa', name: '白金高輪', kana: 'しろかねたかなわ', ward: 'minato', lines: ['東京メトロ南北線', '都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'takanawadai', name: '高輪台', kana: 'たかなわだい', ward: 'minato', lines: ['都営浅草線'], scale: 'minor' },
  { slug: 'takanawa-gateway', name: '高輪ゲートウェイ', kana: 'たかなわげーとうぇい', ward: 'minato', lines: ['JR山手線', 'JR京浜東北線'], scale: 'minor' },
  { slug: 'sengakuji', name: '泉岳寺', kana: 'せんがくじ', ward: 'minato', lines: ['都営浅草線', '京急本線'], scale: 'minor' },
  { slug: 'shibaura-futo', name: '芝浦ふ頭', kana: 'しばうらふとう', ward: 'minato', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'odaiba-kaihinkoen', name: 'お台場海浜公園', kana: 'おだいばかいひんこうえん', ward: 'minato', lines: ['ゆりかもめ'], scale: 'minor', familyFriendly: true },
  { slug: 'daiba', name: '台場', kana: 'だいば', ward: 'minato', lines: ['ゆりかもめ'], scale: 'minor', familyFriendly: true },
  { slug: 'tameike-sanno', name: '溜池山王', kana: 'ためいけさんのう', ward: 'minato', lines: ['東京メトロ銀座線', '東京メトロ南北線'], scale: 'major' },
  { slug: 'toranomon', name: '虎ノ門', kana: 'とらのもん', ward: 'minato', lines: ['東京メトロ銀座線'], scale: 'major' },
  { slug: 'toranomon-hills', name: '虎ノ門ヒルズ', kana: 'とらのもんひるず', ward: 'minato', lines: ['東京メトロ日比谷線'], scale: 'minor' },
  { slug: 'kamiyacho', name: '神谷町', kana: 'かみやちょう', ward: 'minato', lines: ['東京メトロ日比谷線'], scale: 'minor' },
  { slug: 'hinode', name: '日の出', kana: 'ひので', ward: 'minato', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'takeshiba', name: '竹芝', kana: 'たけしば', ward: 'minato', lines: ['ゆりかもめ'], scale: 'minor' },

  // ===== 新宿区 =====
  { slug: 'shinjuku', name: '新宿', kana: 'しんじゅく', ward: 'shinjuku', lines: ['JR山手線', 'JR中央線', 'JR中央・総武線', 'JR埼京線', 'JR湘南新宿ライン', '東京メトロ丸ノ内線', '都営新宿線', '都営大江戸線', '小田急小田原線', '京王線'], scale: 'terminal', familyFriendly: false },
  { slug: 'shinjuku-sanchome', name: '新宿三丁目', kana: 'しんじゅくさんちょうめ', ward: 'shinjuku', lines: ['東京メトロ丸ノ内線', '東京メトロ副都心線', '都営新宿線'], scale: 'major', familyFriendly: false },
  { slug: 'shinjuku-nishiguchi', name: '新宿西口', kana: 'しんじゅくにしぐち', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'major' },
  { slug: 'nishi-shinjuku', name: '西新宿', kana: 'にししんじゅく', ward: 'shinjuku', lines: ['東京メトロ丸ノ内線'], scale: 'major' },
  { slug: 'nishi-shinjuku-gochome', name: '西新宿五丁目', kana: 'にししんじゅくごちょうめ', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'tochomae', name: '都庁前', kana: 'とちょうまえ', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'major' },
  { slug: 'minami-shinjuku', name: '南新宿', kana: 'みなみしんじゅく', ward: 'shinjuku', lines: ['小田急小田原線'], scale: 'minor' },
  { slug: 'shinjuku-gyoemmae', name: '新宿御苑前', kana: 'しんじゅくぎょえんまえ', ward: 'shinjuku', lines: ['東京メトロ丸ノ内線'], scale: 'major', familyFriendly: true },
  { slug: 'yotsuya-sanchome', name: '四谷三丁目', kana: 'よつやさんちょうめ', ward: 'shinjuku', lines: ['東京メトロ丸ノ内線'], scale: 'minor' },
  { slug: 'akebonobashi', name: '曙橋', kana: 'あけぼのばし', ward: 'shinjuku', lines: ['都営新宿線'], scale: 'minor' },
  { slug: 'wakamatsu-kawada', name: '若松河田', kana: 'わかまつかわだ', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'ushigome-yanagicho', name: '牛込柳町', kana: 'うしごめやなぎちょう', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'ushigome-kagurazaka', name: '牛込神楽坂', kana: 'うしごめかぐらざか', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'kagurazaka', name: '神楽坂', kana: 'かぐらざか', ward: 'shinjuku', lines: ['東京メトロ東西線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-shinjuku', name: '東新宿', kana: 'ひがししんじゅく', ward: 'shinjuku', lines: ['東京メトロ副都心線', '都営大江戸線'], scale: 'major' },
  { slug: 'shin-okubo', name: '新大久保', kana: 'しんおおくぼ', ward: 'shinjuku', lines: ['JR山手線'], scale: 'major', familyFriendly: false },
  { slug: 'okubo', name: '大久保', kana: 'おおくぼ', ward: 'shinjuku', lines: ['JR中央・総武線'], scale: 'major' },
  { slug: 'takadanobaba', name: '高田馬場', kana: 'たかだのばば', ward: 'shinjuku', lines: ['JR山手線', '東京メトロ東西線', '西武新宿線'], scale: 'major' },
  { slug: 'shimo-ochiai', name: '下落合', kana: 'しもおちあい', ward: 'shinjuku', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'nakai', name: '中井', kana: 'なかい', ward: 'shinjuku', lines: ['西武新宿線', '都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'ochiai', name: '落合', kana: 'おちあい', ward: 'shinjuku', lines: ['東京メトロ東西線'], scale: 'minor', familyFriendly: true },
  { slug: 'ochiai-minami-nagasaki', name: '落合南長崎', kana: 'おちあいみなみながさき', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'waseda', name: '早稲田', kana: 'わせだ', ward: 'shinjuku', lines: ['東京メトロ東西線'], scale: 'major' },
  { slug: 'nishi-waseda', name: '西早稲田', kana: 'にしわせだ', ward: 'shinjuku', lines: ['東京メトロ副都心線'], scale: 'minor' },
  { slug: 'shinanomachi', name: '信濃町', kana: 'しなのまち', ward: 'shinjuku', lines: ['JR中央・総武線'], scale: 'minor' },
  { slug: 'sendagaya', name: '千駄ケ谷', kana: 'せんだがや', ward: 'shibuya', lines: ['JR中央・総武線'], scale: 'minor' },
  { slug: 'kokuritsu-kyogijo', name: '国立競技場', kana: 'こくりつきょうぎじょう', ward: 'shinjuku', lines: ['都営大江戸線'], scale: 'minor' },
  { slug: 'seibi-shinjuku', name: '西武新宿', kana: 'せいぶしんじゅく', ward: 'shinjuku', lines: ['西武新宿線'], scale: 'major' },

  // ===== 文京区 =====
  { slug: 'kasuga', name: '春日', kana: 'かすが', ward: 'bunkyo', lines: ['都営三田線', '都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'korakuen', name: '後楽園', kana: 'こうらくえん', ward: 'bunkyo', lines: ['東京メトロ丸ノ内線', '東京メトロ南北線'], scale: 'major', familyFriendly: true },
  { slug: 'hongo-sanchome', name: '本郷三丁目', kana: 'ほんごうさんちょうめ', ward: 'bunkyo', lines: ['東京メトロ丸ノ内線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'yushima', name: '湯島', kana: 'ゆしま', ward: 'bunkyo', lines: ['東京メトロ千代田線'], scale: 'minor' },
  { slug: 'nezu', name: '根津', kana: 'ねづ', ward: 'bunkyo', lines: ['東京メトロ千代田線'], scale: 'minor', familyFriendly: true },
  { slug: 'sendagi', name: '千駄木', kana: 'せんだぎ', ward: 'bunkyo', lines: ['東京メトロ千代田線'], scale: 'minor', familyFriendly: true },
  { slug: 'hakusan', name: '白山', kana: 'はくさん', ward: 'bunkyo', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'sengoku', name: '千石', kana: 'せんごく', ward: 'bunkyo', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'myogadani', name: '茗荷谷', kana: 'みょうがだに', ward: 'bunkyo', lines: ['東京メトロ丸ノ内線'], scale: 'major', familyFriendly: true },
  { slug: 'edogawabashi', name: '江戸川橋', kana: 'えどがわばし', ward: 'bunkyo', lines: ['東京メトロ有楽町線'], scale: 'minor', familyFriendly: true },
  { slug: 'gokokuji', name: '護国寺', kana: 'ごこくじ', ward: 'bunkyo', lines: ['東京メトロ有楽町線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-otsuka', name: '新大塚', kana: 'しんおおつか', ward: 'bunkyo', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'todaimae', name: '東大前', kana: 'とうだいまえ', ward: 'bunkyo', lines: ['東京メトロ南北線'], scale: 'minor', familyFriendly: true },
  { slug: 'hon-komagome', name: '本駒込', kana: 'ほんこまごめ', ward: 'bunkyo', lines: ['東京メトロ南北線'], scale: 'minor', familyFriendly: true },

  // ===== 台東区 =====
  { slug: 'ueno', name: '上野', kana: 'うえの', ward: 'taito', lines: ['JR山手線', 'JR京浜東北線', 'JR東北本線', 'JR常磐線', 'JR上野東京ライン', '東京メトロ銀座線', '東京メトロ日比谷線', '京成本線'], scale: 'terminal', familyFriendly: true },
  { slug: 'okachimachi', name: '御徒町', kana: 'おかちまち', ward: 'taito', lines: ['JR山手線', 'JR京浜東北線'], scale: 'major' },
  { slug: 'ueno-hirokoji', name: '上野広小路', kana: 'うえのひろこうじ', ward: 'taito', lines: ['東京メトロ銀座線'], scale: 'major' },
  { slug: 'naka-okachimachi', name: '仲御徒町', kana: 'なかおかちまち', ward: 'taito', lines: ['東京メトロ日比谷線'], scale: 'minor' },
  { slug: 'ueno-okachimachi', name: '上野御徒町', kana: 'うえのおかちまち', ward: 'taito', lines: ['都営大江戸線'], scale: 'major' },
  { slug: 'shin-okachimachi', name: '新御徒町', kana: 'しんおかちまち', ward: 'taito', lines: ['都営大江戸線', 'つくばエクスプレス'], scale: 'minor' },
  { slug: 'inaricho', name: '稲荷町', kana: 'いなりちょう', ward: 'taito', lines: ['東京メトロ銀座線'], scale: 'minor' },
  { slug: 'tawaramachi', name: '田原町', kana: 'たわらまち', ward: 'taito', lines: ['東京メトロ銀座線'], scale: 'minor' },
  { slug: 'asakusa', name: '浅草', kana: 'あさくさ', ward: 'taito', lines: ['東京メトロ銀座線', '都営浅草線', '東武スカイツリーライン', 'つくばエクスプレス'], scale: 'major', familyFriendly: true },
  { slug: 'kuramae', name: '蔵前', kana: 'くらまえ', ward: 'taito', lines: ['都営浅草線', '都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'asakusabashi', name: '浅草橋', kana: 'あさくさばし', ward: 'taito', lines: ['JR中央・総武線', '都営浅草線'], scale: 'major' },
  { slug: 'iriya', name: '入谷', kana: 'いりや', ward: 'taito', lines: ['東京メトロ日比谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'minowa', name: '三ノ輪', kana: 'みのわ', ward: 'taito', lines: ['東京メトロ日比谷線'], scale: 'minor' },
  { slug: 'uguisudani', name: '鶯谷', kana: 'うぐいすだに', ward: 'taito', lines: ['JR山手線', 'JR京浜東北線'], scale: 'minor' },
  { slug: 'keisei-ueno', name: '京成上野', kana: 'けいせいうえの', ward: 'taito', lines: ['京成本線'], scale: 'major' },

  // ===== 墨田区 =====
  { slug: 'kinshicho', name: '錦糸町', kana: 'きんしちょう', ward: 'sumida', lines: ['JR中央・総武線', 'JR総武線快速', '東京メトロ半蔵門線'], scale: 'major', familyFriendly: true },
  { slug: 'ryogoku', name: '両国', kana: 'りょうごく', ward: 'sumida', lines: ['JR中央・総武線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'oshiage', name: '押上', kana: 'おしあげ', ward: 'sumida', lines: ['東京メトロ半蔵門線', '都営浅草線', '京成押上線', '東武スカイツリーライン'], scale: 'major', familyFriendly: true },
  { slug: 'tokyo-skytree', name: 'とうきょうスカイツリー', kana: 'とうきょうすかいつりー', ward: 'sumida', lines: ['東武スカイツリーライン'], scale: 'major', familyFriendly: true },
  { slug: 'honjo-azumabashi', name: '本所吾妻橋', kana: 'ほんじょあずまばし', ward: 'sumida', lines: ['都営浅草線'], scale: 'minor', familyFriendly: true },
  { slug: 'kikukawa', name: '菊川', kana: 'きくかわ', ward: 'sumida', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-azuma', name: '東あずま', kana: 'ひがしあずま', ward: 'sumida', lines: ['東武亀戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'hikifune', name: '曳舟', kana: 'ひきふね', ward: 'sumida', lines: ['東武スカイツリーライン', '東武亀戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'keisei-hikifune', name: '京成曳舟', kana: 'けいせいひきふね', ward: 'sumida', lines: ['京成押上線'], scale: 'minor', familyFriendly: true },
  { slug: 'yahiro', name: '八広', kana: 'やひろ', ward: 'sumida', lines: ['京成押上線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-mukojima', name: '東向島', kana: 'ひがしむこうじま', ward: 'sumida', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'kanegafuchi', name: '鐘ヶ淵', kana: 'かねがふち', ward: 'sumida', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'omurai', name: '小村井', kana: 'おむらい', ward: 'sumida', lines: ['東武亀戸線'], scale: 'minor', familyFriendly: true },

  // ===== 江東区 =====
  { slug: 'monzen-nakacho', name: '門前仲町', kana: 'もんぜんなかちょう', ward: 'koto', lines: ['東京メトロ東西線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'kiba', name: '木場', kana: 'きば', ward: 'koto', lines: ['東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'toyocho', name: '東陽町', kana: 'とうようちょう', ward: 'koto', lines: ['東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'minami-sunamachi', name: '南砂町', kana: 'みなみすなまち', ward: 'koto', lines: ['東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'kameido', name: '亀戸', kana: 'かめいど', ward: 'koto', lines: ['JR中央・総武線', '東武亀戸線'], scale: 'major', familyFriendly: true },
  { slug: 'kameido-suijin', name: '亀戸水神', kana: 'かめいどすいじん', ward: 'koto', lines: ['東武亀戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'morishita', name: '森下', kana: 'もりした', ward: 'koto', lines: ['都営新宿線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'kiyosumi-shirakawa', name: '清澄白河', kana: 'きよすみしらかわ', ward: 'koto', lines: ['東京メトロ半蔵門線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'shinonome', name: '東雲', kana: 'しののめ', ward: 'koto', lines: ['りんかい線'], scale: 'minor', familyFriendly: true },
  { slug: 'sumiyoshi', name: '住吉', kana: 'すみよし', ward: 'koto', lines: ['東京メトロ半蔵門線', '都営新宿線'], scale: 'major', familyFriendly: true },
  { slug: 'nishi-ojima', name: '西大島', kana: 'にしおおじま', ward: 'koto', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'ojima', name: '大島', kana: 'おおじま', ward: 'koto', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-ojima', name: '東大島', kana: 'ひがしおおじま', ward: 'koto', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'shiomi', name: '潮見', kana: 'しおみ', ward: 'koto', lines: ['JR京葉線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-kiba', name: '新木場', kana: 'しんきば', ward: 'koto', lines: ['JR京葉線', '東京メトロ有楽町線', 'りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'toyosu', name: '豊洲', kana: 'とよす', ward: 'koto', lines: ['東京メトロ有楽町線', 'ゆりかもめ'], scale: 'major', familyFriendly: true },
  { slug: 'tatsumi', name: '辰巳', kana: 'たつみ', ward: 'koto', lines: ['東京メトロ有楽町線'], scale: 'minor', familyFriendly: true },
  { slug: 'shijomae', name: '市場前', kana: 'しじょうまえ', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'shin-toyosu', name: '新豊洲', kana: 'しんとよす', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor', familyFriendly: true },
  { slug: 'ariake', name: '有明', kana: 'ありあけ', ward: 'koto', lines: ['ゆりかもめ', 'りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'ariake-tennis-no-mori', name: '有明テニスの森', kana: 'ありあけてにすのもり', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor', familyFriendly: true },
  { slug: 'kokusai-tenjijo', name: '国際展示場', kana: 'こくさいてんじじょう', ward: 'koto', lines: ['りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'tokyo-big-sight', name: '東京ビッグサイト', kana: 'とうきょうびっぐさいと', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'aomi', name: '青海', kana: 'あおみ', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor', familyFriendly: true },
  { slug: 'telecom-center', name: 'テレコムセンター', kana: 'てれこむせんたー', ward: 'koto', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'tokyo-teleport', name: '東京テレポート', kana: 'とうきょうてれぽーと', ward: 'koto', lines: ['りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'fune-no-kagakukan', name: '船の科学館', kana: 'ふねのかがくかん', ward: 'shinagawa', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'tokyo-international-cruise', name: '東京国際クルーズターミナル', kana: 'とうきょうこくさいくるーずたーみなる', ward: 'shinagawa', lines: ['ゆりかもめ'], scale: 'minor' },
  { slug: 'etchujima', name: '越中島', kana: 'えっちゅうじま', ward: 'koto', lines: ['JR京葉線'], scale: 'minor', familyFriendly: true },

  // ===== 品川区 =====
  { slug: 'osaki', name: '大崎', kana: 'おおさき', ward: 'shinagawa', lines: ['JR山手線', 'JR埼京線', 'JR湘南新宿ライン', 'りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'gotanda', name: '五反田', kana: 'ごたんだ', ward: 'shinagawa', lines: ['JR山手線', '東急池上線', '都営浅草線'], scale: 'major' },
  { slug: 'meguro', name: '目黒', kana: 'めぐろ', ward: 'shinagawa', lines: ['JR山手線', '東京メトロ南北線', '都営三田線', '東急目黒線'], scale: 'major', familyFriendly: true },
  { slug: 'shinagawa-seaside', name: '品川シーサイド', kana: 'しながわしーさいど', ward: 'shinagawa', lines: ['りんかい線'], scale: 'minor', familyFriendly: true },
  { slug: 'tennozu-isle', name: '天王洲アイル', kana: 'てんのうずあいる', ward: 'shinagawa', lines: ['東京モノレール', 'りんかい線'], scale: 'minor' },
  { slug: 'oimachi', name: '大井町', kana: 'おおいまち', ward: 'shinagawa', lines: ['JR京浜東北線', '東急大井町線', 'りんかい線'], scale: 'major', familyFriendly: true },
  { slug: 'shimo-shimmei', name: '下神明', kana: 'しもしんめい', ward: 'shinagawa', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'togoshi-koen', name: '戸越公園', kana: 'とごしこうえん', ward: 'shinagawa', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'togoshi', name: '戸越', kana: 'とごし', ward: 'shinagawa', lines: ['都営浅草線'], scale: 'minor', familyFriendly: true },
  { slug: 'togoshi-ginza', name: '戸越銀座', kana: 'とごしぎんざ', ward: 'shinagawa', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'nakanobu', name: '中延', kana: 'なかのぶ', ward: 'shinagawa', lines: ['都営浅草線', '東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'ebara-machi', name: '荏原町', kana: 'えばらまち', ward: 'shinagawa', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'hatanodai', name: '旗の台', kana: 'はたのだい', ward: 'shinagawa', lines: ['東急大井町線', '東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'kita-shinagawa', name: '北品川', kana: 'きたしながわ', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor' },
  { slug: 'shimbamba', name: '新馬場', kana: 'しんばんば', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor' },
  { slug: 'aomono-yokocho', name: '青物横丁', kana: 'あおものよこちょう', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor' },
  { slug: 'samezu', name: '鮫洲', kana: 'さめず', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor' },
  { slug: 'tachiaigawa', name: '立会川', kana: 'たちあいがわ', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'omori-kaigan', name: '大森海岸', kana: 'おおもりかいがん', ward: 'shinagawa', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'ebara-nakanobu', name: '荏原中延', kana: 'えばらなかのぶ', ward: 'shinagawa', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'fudomae', name: '不動前', kana: 'ふどうまえ', ward: 'shinagawa', lines: ['東急目黒線'], scale: 'minor', familyFriendly: true },
  { slug: 'musashi-koyama', name: '武蔵小山', kana: 'むさしこやま', ward: 'shinagawa', lines: ['東急目黒線'], scale: 'major', familyFriendly: true },
  { slug: 'oi-keibajo-mae', name: '大井競馬場前', kana: 'おおいけいばじょうまえ', ward: 'shinagawa', lines: ['東京モノレール'], scale: 'minor' },

  // ===== 目黒区 =====
  { slug: 'naka-meguro', name: '中目黒', kana: 'なかめぐろ', ward: 'meguro', lines: ['東急東横線', '東京メトロ日比谷線'], scale: 'major', familyFriendly: true },
  { slug: 'yutenji', name: '祐天寺', kana: 'ゆうてんじ', ward: 'meguro', lines: ['東急東横線'], scale: 'minor', familyFriendly: true },
  { slug: 'gakugei-daigaku', name: '学芸大学', kana: 'がくげいだいがく', ward: 'meguro', lines: ['東急東横線'], scale: 'major', familyFriendly: true },
  { slug: 'toritsu-daigaku', name: '都立大学', kana: 'とりつだいがく', ward: 'meguro', lines: ['東急東横線'], scale: 'minor', familyFriendly: true },
  { slug: 'jiyugaoka', name: '自由が丘', kana: 'じゆうがおか', ward: 'meguro', lines: ['東急東横線', '東急大井町線'], scale: 'major', familyFriendly: true },
  { slug: 'midorigaoka', name: '緑が丘', kana: 'みどりがおか', ward: 'meguro', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'ookayama', name: '大岡山', kana: 'おおおかやま', ward: 'meguro', lines: ['東急目黒線', '東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'senzoku', name: '洗足', kana: 'せんぞく', ward: 'meguro', lines: ['東急目黒線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishi-koyama', name: '西小山', kana: 'にしこやま', ward: 'meguro', lines: ['東急目黒線'], scale: 'minor', familyFriendly: true },
  { slug: 'komaba-todaimae', name: '駒場東大前', kana: 'こまばとうだいまえ', ward: 'meguro', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },

  // ===== 大田区 =====
  { slug: 'omori', name: '大森', kana: 'おおもり', ward: 'ota', lines: ['JR京浜東北線'], scale: 'major', familyFriendly: true },
  { slug: 'kamata', name: '蒲田', kana: 'かまた', ward: 'ota', lines: ['JR京浜東北線', '東急池上線', '東急多摩川線'], scale: 'major', familyFriendly: true },
  { slug: 'keikyu-kamata', name: '京急蒲田', kana: 'けいきゅうかまた', ward: 'ota', lines: ['京急本線', '京急空港線'], scale: 'major', familyFriendly: true },
  { slug: 'umeyashiki', name: '梅屋敷', kana: 'うめやしき', ward: 'ota', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'omori-machi', name: '大森町', kana: 'おおもりまち', ward: 'ota', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'heiwajima', name: '平和島', kana: 'へいわじま', ward: 'ota', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'rokugo-dote', name: '六郷土手', kana: 'ろくごうどて', ward: 'ota', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'zoshiki', name: '雑色', kana: 'ぞうしき', ward: 'ota', lines: ['京急本線'], scale: 'minor', familyFriendly: true },
  { slug: 'kojiya', name: '糀谷', kana: 'こうじや', ward: 'ota', lines: ['京急空港線'], scale: 'minor', familyFriendly: true },
  { slug: 'otorii', name: '大鳥居', kana: 'おおとりい', ward: 'ota', lines: ['京急空港線'], scale: 'minor', familyFriendly: true },
  { slug: 'anamori-inari', name: '穴守稲荷', kana: 'あなもりいなり', ward: 'ota', lines: ['京急空港線'], scale: 'minor', familyFriendly: true },
  { slug: 'tenkubashi', name: '天空橋', kana: 'てんくうばし', ward: 'ota', lines: ['京急空港線', '東京モノレール'], scale: 'minor' },
  { slug: 'haneda-airport-t1', name: '羽田空港第1ターミナル', kana: 'はねだくうこうだいいちたーみなる', ward: 'ota', lines: ['京急空港線', '東京モノレール'], scale: 'major', familyFriendly: true },
  { slug: 'haneda-airport-t2', name: '羽田空港第2ターミナル', kana: 'はねだくうこうだいにたーみなる', ward: 'ota', lines: ['京急空港線', '東京モノレール'], scale: 'major', familyFriendly: true },
  { slug: 'haneda-airport-t3', name: '羽田空港第3ターミナル', kana: 'はねだくうこうだいさんたーみなる', ward: 'ota', lines: ['京急空港線', '東京モノレール'], scale: 'major', familyFriendly: true },
  { slug: 'shin-seibijo', name: '新整備場', kana: 'しんせいびじょう', ward: 'ota', lines: ['東京モノレール'], scale: 'minor' },
  { slug: 'seibijo', name: '整備場', kana: 'せいびじょう', ward: 'ota', lines: ['東京モノレール'], scale: 'minor' },
  { slug: 'showajima', name: '昭和島', kana: 'しょうわじま', ward: 'ota', lines: ['東京モノレール'], scale: 'minor' },
  { slug: 'ryutsu-center', name: '流通センター', kana: 'りゅうつうせんたー', ward: 'ota', lines: ['東京モノレール'], scale: 'minor' },
  { slug: 'ikegami', name: '池上', kana: 'いけがみ', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'hasunuma', name: '蓮沼', kana: 'はすぬま', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'chidoricho', name: '千鳥町', kana: 'ちどりちょう', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'ontakesan', name: '御嶽山', kana: 'おんたけさん', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'kugahara', name: '久が原', kana: 'くがはら', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'ishikawadai', name: '石川台', kana: 'いしかわだい', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'yukigaya-otsuka', name: '雪が谷大塚', kana: 'ゆきがやおおつか', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'denenchofu', name: '田園調布', kana: 'でんえんちょうふ', ward: 'ota', lines: ['東急東横線', '東急目黒線'], scale: 'major', familyFriendly: true },
  { slug: 'tamagawa', name: '多摩川', kana: 'たまがわ', ward: 'ota', lines: ['東急東横線', '東急目黒線', '東急多摩川線'], scale: 'major', familyFriendly: true },
  { slug: 'numabe', name: '沼部', kana: 'ぬまべ', ward: 'ota', lines: ['東急多摩川線'], scale: 'minor', familyFriendly: true },
  { slug: 'unoki', name: '鵜の木', kana: 'うのき', ward: 'ota', lines: ['東急多摩川線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimo-maruko', name: '下丸子', kana: 'しもまるこ', ward: 'ota', lines: ['東急多摩川線'], scale: 'minor', familyFriendly: true },
  { slug: 'musashi-nitta', name: '武蔵新田', kana: 'むさしにった', ward: 'ota', lines: ['東急多摩川線'], scale: 'minor', familyFriendly: true },
  { slug: 'yaguchi-no-watashi', name: '矢口渡', kana: 'やぐちのわたし', ward: 'ota', lines: ['東急多摩川線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishi-magome', name: '西馬込', kana: 'にしまごめ', ward: 'ota', lines: ['都営浅草線'], scale: 'minor', familyFriendly: true },
  { slug: 'magome', name: '馬込', kana: 'まごめ', ward: 'ota', lines: ['都営浅草線'], scale: 'minor', familyFriendly: true },
  { slug: 'oimachi-line-okusawa', name: '奥沢', kana: 'おくさわ', ward: 'setagaya', lines: ['東急目黒線'], scale: 'minor', familyFriendly: true },

  // ===== 世田谷区 =====
  { slug: 'shimokitazawa', name: '下北沢', kana: 'しもきたざわ', ward: 'setagaya', lines: ['小田急小田原線', '京王井の頭線'], scale: 'major', familyFriendly: true },
  { slug: 'higashi-kitazawa', name: '東北沢', kana: 'ひがしきたざわ', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'setagaya-daita', name: '世田谷代田', kana: 'せたがやだいた', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'umegaoka', name: '梅ヶ丘', kana: 'うめがおか', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'gotokuji', name: '豪徳寺', kana: 'ごうとくじ', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'kyodo', name: '経堂', kana: 'きょうどう', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'major', familyFriendly: true },
  { slug: 'chitose-funabashi', name: '千歳船橋', kana: 'ちとせふなばし', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'soshigaya-okura', name: '祖師ヶ谷大蔵', kana: 'そしがやおおくら', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'seijogakuen-mae', name: '成城学園前', kana: 'せいじょうがくえんまえ', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'major', familyFriendly: true },
  { slug: 'kitami', name: '喜多見', kana: 'きたみ', ward: 'setagaya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'sangenjaya', name: '三軒茶屋', kana: 'さんげんぢゃや', ward: 'setagaya', lines: ['東急田園都市線', '東急世田谷線'], scale: 'major', familyFriendly: true },
  { slug: 'komazawa-daigaku', name: '駒沢大学', kana: 'こまざわだいがく', ward: 'setagaya', lines: ['東急田園都市線'], scale: 'major', familyFriendly: true },
  { slug: 'sakura-shimmachi', name: '桜新町', kana: 'さくらしんまち', ward: 'setagaya', lines: ['東急田園都市線'], scale: 'minor', familyFriendly: true },
  { slug: 'yoga', name: '用賀', kana: 'ようが', ward: 'setagaya', lines: ['東急田園都市線'], scale: 'major', familyFriendly: true },
  { slug: 'futako-tamagawa', name: '二子玉川', kana: 'ふたこたまがわ', ward: 'setagaya', lines: ['東急田園都市線', '東急大井町線'], scale: 'major', familyFriendly: true },
  { slug: 'kaminoge', name: '上野毛', kana: 'かみのげ', ward: 'setagaya', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'todoroki', name: '等々力', kana: 'とどろき', ward: 'setagaya', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'oyamadai', name: '尾山台', kana: 'おやまだい', ward: 'setagaya', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'kuhonbutsu', name: '九品仏', kana: 'くほんぶつ', ward: 'setagaya', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishi-taishido', name: '西太子堂', kana: 'にしたいしどう', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'wakabayashi', name: '若林', kana: 'わかばやし', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'shoin-jinjamae', name: '松陰神社前', kana: 'しょういんじんじゃまえ', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'setagaya', name: '世田谷', kana: 'せたがや', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'kamimachi', name: '上町', kana: 'かみまち', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'miyanosaka', name: '宮の坂', kana: 'みやのさか', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'yamashita', name: '山下', kana: 'やました', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'matsubara', name: '松原', kana: 'まつばら', ward: 'setagaya', lines: ['東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimo-takaido', name: '下高井戸', kana: 'しもたかいど', ward: 'setagaya', lines: ['京王線', '東急世田谷線'], scale: 'minor', familyFriendly: true },
  { slug: 'sakurajosui', name: '桜上水', kana: 'さくらじょうすい', ward: 'setagaya', lines: ['京王線'], scale: 'minor', familyFriendly: true },
  { slug: 'kami-kitazawa', name: '上北沢', kana: 'かみきたざわ', ward: 'setagaya', lines: ['京王線'], scale: 'minor', familyFriendly: true },
  { slug: 'hachimanyama', name: '八幡山', kana: 'はちまんやま', ward: 'setagaya', lines: ['京王線'], scale: 'minor', familyFriendly: true },
  { slug: 'roka-koen', name: '芦花公園', kana: 'ろかこうえん', ward: 'setagaya', lines: ['京王線'], scale: 'minor', familyFriendly: true },
  { slug: 'chitose-karasuyama', name: '千歳烏山', kana: 'ちとせからすやま', ward: 'setagaya', lines: ['京王線'], scale: 'major', familyFriendly: true },
  { slug: 'shindaita', name: '新代田', kana: 'しんだいた', ward: 'setagaya', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-matsubara', name: '東松原', kana: 'ひがしまつばら', ward: 'setagaya', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'meidaimae', name: '明大前', kana: 'めいだいまえ', ward: 'setagaya', lines: ['京王線', '京王井の頭線'], scale: 'major', familyFriendly: true },
  { slug: 'ikenoue', name: '池ノ上', kana: 'いけのうえ', ward: 'setagaya', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },

  // ===== 渋谷区 =====
  { slug: 'shibuya', name: '渋谷', kana: 'しぶや', ward: 'shibuya', lines: ['JR山手線', 'JR埼京線', 'JR湘南新宿ライン', '東急東横線', '東急田園都市線', '京王井の頭線', '東京メトロ銀座線', '東京メトロ半蔵門線', '東京メトロ副都心線'], scale: 'terminal', familyFriendly: false },
  { slug: 'harajuku', name: '原宿', kana: 'はらじゅく', ward: 'shibuya', lines: ['JR山手線'], scale: 'major', familyFriendly: false },
  { slug: 'meiji-jingumae', name: '明治神宮前', kana: 'めいじじんぐうまえ', ward: 'shibuya', lines: ['東京メトロ千代田線', '東京メトロ副都心線'], scale: 'major', familyFriendly: false },
  { slug: 'yoyogi', name: '代々木', kana: 'よよぎ', ward: 'shibuya', lines: ['JR山手線', 'JR中央・総武線', '都営大江戸線'], scale: 'major' },
  { slug: 'yoyogi-koen', name: '代々木公園', kana: 'よよぎこうえん', ward: 'shibuya', lines: ['東京メトロ千代田線'], scale: 'major', familyFriendly: true },
  { slug: 'yoyogi-uehara', name: '代々木上原', kana: 'よよぎうえはら', ward: 'shibuya', lines: ['小田急小田原線', '東京メトロ千代田線'], scale: 'major', familyFriendly: true },
  { slug: 'yoyogi-hachiman', name: '代々木八幡', kana: 'よよぎはちまん', ward: 'shibuya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'sangubashi', name: '参宮橋', kana: 'さんぐうばし', ward: 'shibuya', lines: ['小田急小田原線'], scale: 'minor', familyFriendly: true },
  { slug: 'hatsudai', name: '初台', kana: 'はつだい', ward: 'shibuya', lines: ['京王新線'], scale: 'minor', familyFriendly: true },
  { slug: 'hatagaya', name: '幡ヶ谷', kana: 'はたがや', ward: 'shibuya', lines: ['京王新線'], scale: 'minor', familyFriendly: true },
  { slug: 'sasazuka', name: '笹塚', kana: 'ささづか', ward: 'shibuya', lines: ['京王線', '京王新線'], scale: 'major', familyFriendly: true },
  { slug: 'shinsen', name: '神泉', kana: 'しんせん', ward: 'shibuya', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'ebisu', name: '恵比寿', kana: 'えびす', ward: 'shibuya', lines: ['JR山手線', 'JR埼京線', 'JR湘南新宿ライン', '東京メトロ日比谷線'], scale: 'major', familyFriendly: false },
  { slug: 'daikanyama', name: '代官山', kana: 'だいかんやま', ward: 'shibuya', lines: ['東急東横線'], scale: 'major', familyFriendly: false },
  { slug: 'kita-sando', name: '北参道', kana: 'きたさんどう', ward: 'shibuya', lines: ['東京メトロ副都心線'], scale: 'minor' },

  // ===== 中野区 =====
  { slug: 'nakano', name: '中野', kana: 'なかの', ward: 'nakano', lines: ['JR中央線', 'JR中央・総武線', '東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'higashi-nakano', name: '東中野', kana: 'ひがしなかの', ward: 'nakano', lines: ['JR中央・総武線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'nakano-fujimicho', name: '中野富士見町', kana: 'なかのふじみちょう', ward: 'nakano', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'nakano-shimbashi', name: '中野新橋', kana: 'なかのしんばし', ward: 'nakano', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'nakano-sakaue', name: '中野坂上', kana: 'なかのさかうえ', ward: 'nakano', lines: ['東京メトロ丸ノ内線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'shin-nakano', name: '新中野', kana: 'しんなかの', ward: 'nakano', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'honancho', name: '方南町', kana: 'ほうなんちょう', ward: 'suginami', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'numabukuro', name: '沼袋', kana: 'ぬまぶくろ', ward: 'nakano', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'arai-yakushimae', name: '新井薬師前', kana: 'あらいやくしまえ', ward: 'nakano', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'saginomiya', name: '鷺ノ宮', kana: 'さぎのみや', ward: 'nakano', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'nogata', name: '野方', kana: 'のがた', ward: 'nakano', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'toritsu-kasei', name: '都立家政', kana: 'とりつかせい', ward: 'nakano', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-egota', name: '新江古田', kana: 'しんえごた', ward: 'nakano', lines: ['都営大江戸線'], scale: 'minor', familyFriendly: true },

  // ===== 杉並区 =====
  { slug: 'koenji', name: '高円寺', kana: 'こうえんじ', ward: 'suginami', lines: ['JR中央線', 'JR中央・総武線'], scale: 'major', familyFriendly: true },
  { slug: 'asagaya', name: '阿佐ケ谷', kana: 'あさがや', ward: 'suginami', lines: ['JR中央線', 'JR中央・総武線'], scale: 'major', familyFriendly: true },
  { slug: 'ogikubo', name: '荻窪', kana: 'おぎくぼ', ward: 'suginami', lines: ['JR中央線', 'JR中央・総武線', '東京メトロ丸ノ内線'], scale: 'major', familyFriendly: true },
  { slug: 'nishi-ogikubo', name: '西荻窪', kana: 'にしおぎくぼ', ward: 'suginami', lines: ['JR中央線', 'JR中央・総武線'], scale: 'major', familyFriendly: true },
  { slug: 'minami-asagaya', name: '南阿佐ケ谷', kana: 'みなみあさがや', ward: 'suginami', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-koenji', name: '新高円寺', kana: 'しんこうえんじ', ward: 'suginami', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-koenji', name: '東高円寺', kana: 'ひがしこうえんじ', ward: 'suginami', lines: ['東京メトロ丸ノ内線'], scale: 'minor', familyFriendly: true },
  { slug: 'iogi', name: '井荻', kana: 'いおぎ', ward: 'suginami', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'kami-igusa', name: '上井草', kana: 'かみいぐさ', ward: 'suginami', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimo-igusa', name: '下井草', kana: 'しもいぐさ', ward: 'suginami', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'eifukucho', name: '永福町', kana: 'えいふくちょう', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishi-eifuku', name: '西永福', kana: 'にしえいふく', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'hamadayama', name: '浜田山', kana: 'はまだやま', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'takaido', name: '高井戸', kana: 'たかいど', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'fujimigaoka', name: '富士見ヶ丘', kana: 'ふじみがおか', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },
  { slug: 'kugayama', name: '久我山', kana: 'くがやま', ward: 'suginami', lines: ['京王井の頭線'], scale: 'minor', familyFriendly: true },

  // ===== 豊島区 =====
  { slug: 'ikebukuro', name: '池袋', kana: 'いけぶくろ', ward: 'toshima', lines: ['JR山手線', 'JR埼京線', 'JR湘南新宿ライン', '東京メトロ丸ノ内線', '東京メトロ有楽町線', '東京メトロ副都心線', '東武東上線', '西武池袋線'], scale: 'terminal', familyFriendly: false },
  { slug: 'mejiro', name: '目白', kana: 'めじろ', ward: 'toshima', lines: ['JR山手線'], scale: 'major', familyFriendly: true },
  { slug: 'otsuka', name: '大塚', kana: 'おおつか', ward: 'toshima', lines: ['JR山手線', '都電荒川線'], scale: 'major' },
  { slug: 'sugamo', name: '巣鴨', kana: 'すがも', ward: 'toshima', lines: ['JR山手線', '都営三田線'], scale: 'major', familyFriendly: true },
  { slug: 'komagome', name: '駒込', kana: 'こまごめ', ward: 'toshima', lines: ['JR山手線', '東京メトロ南北線'], scale: 'major', familyFriendly: true },
  { slug: 'higashi-ikebukuro', name: '東池袋', kana: 'ひがしいけぶくろ', ward: 'toshima', lines: ['東京メトロ有楽町線'], scale: 'major' },
  { slug: 'kanamecho', name: '要町', kana: 'かなめちょう', ward: 'toshima', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'minor', familyFriendly: true },
  { slug: 'senkawa', name: '千川', kana: 'せんかわ', ward: 'toshima', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'minor', familyFriendly: true },
  { slug: 'kita-ikebukuro', name: '北池袋', kana: 'きたいけぶくろ', ward: 'toshima', lines: ['東武東上線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimo-itabashi', name: '下板橋', kana: 'しもいたばし', ward: 'toshima', lines: ['東武東上線'], scale: 'minor', familyFriendly: true },
  { slug: 'shiinamachi', name: '椎名町', kana: 'しいなまち', ward: 'toshima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-nagasaki', name: '東長崎', kana: 'ひがしながさき', ward: 'toshima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },
  { slug: 'zoshigaya', name: '雑司が谷', kana: 'ぞうしがや', ward: 'toshima', lines: ['東京メトロ副都心線'], scale: 'minor', familyFriendly: true },
  { slug: 'mukohara', name: '向原', kana: 'むこうはら', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'kishibojinmae', name: '鬼子母神前', kana: 'きしぼじんまえ', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'gakushuin-shita', name: '学習院下', kana: 'がくしゅういんした', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'omokagebashi', name: '面影橋', kana: 'おもかげばし', ward: 'shinjuku', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'waseda-toden', name: '早稲田 (都電)', kana: 'わせだ', ward: 'shinjuku', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-ikebukuro-yonchome', name: '東池袋四丁目', kana: 'ひがしいけぶくろよんちょうめ', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'koshinzuka', name: '庚申塚', kana: 'こうしんづか', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-koshinzuka', name: '新庚申塚', kana: 'しんこうしんづか', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'sakaecho', name: '栄町', kana: 'さかえちょう', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },

  // ===== 北区 =====
  { slug: 'akabane', name: '赤羽', kana: 'あかばね', ward: 'kita', lines: ['JR京浜東北線', 'JR埼京線', 'JR湘南新宿ライン', 'JR上野東京ライン', 'JR宇都宮線', 'JR高崎線'], scale: 'major', familyFriendly: true },
  { slug: 'higashi-jujo', name: '東十条', kana: 'ひがしじゅうじょう', ward: 'kita', lines: ['JR京浜東北線'], scale: 'minor', familyFriendly: true },
  { slug: 'oji', name: '王子', kana: 'おうじ', ward: 'kita', lines: ['JR京浜東北線', '東京メトロ南北線', '都電荒川線'], scale: 'major', familyFriendly: true },
  { slug: 'kami-nakazato', name: '上中里', kana: 'かみなかざと', ward: 'kita', lines: ['JR京浜東北線'], scale: 'minor', familyFriendly: true },
  { slug: 'jujo', name: '十条', kana: 'じゅうじょう', ward: 'kita', lines: ['JR埼京線'], scale: 'major', familyFriendly: true },
  { slug: 'kita-akabane', name: '北赤羽', kana: 'きたあかばね', ward: 'kita', lines: ['JR埼京線'], scale: 'minor', familyFriendly: true },
  { slug: 'akabane-iwabuchi', name: '赤羽岩淵', kana: 'あかばねいわぶち', ward: 'kita', lines: ['東京メトロ南北線'], scale: 'major', familyFriendly: true },
  { slug: 'shimo', name: '志茂', kana: 'しも', ward: 'kita', lines: ['東京メトロ南北線'], scale: 'minor', familyFriendly: true },
  { slug: 'oji-kamiya', name: '王子神谷', kana: 'おうじかみや', ward: 'kita', lines: ['東京メトロ南北線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishigahara', name: '西ケ原', kana: 'にしがはら', ward: 'kita', lines: ['東京メトロ南北線'], scale: 'minor', familyFriendly: true },
  { slug: 'tabata', name: '田端', kana: 'たばた', ward: 'kita', lines: ['JR山手線', 'JR京浜東北線'], scale: 'major', familyFriendly: true },
  { slug: 'kajiwara', name: '梶原', kana: 'かじわら', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },

  // ===== 荒川区 =====
  { slug: 'nippori', name: '日暮里', kana: 'にっぽり', ward: 'arakawa', lines: ['JR山手線', 'JR京浜東北線', 'JR常磐線', '京成本線', '日暮里・舎人ライナー'], scale: 'major', familyFriendly: true },
  { slug: 'nishi-nippori', name: '西日暮里', kana: 'にしにっぽり', ward: 'arakawa', lines: ['JR山手線', 'JR京浜東北線', '東京メトロ千代田線', '日暮里・舎人ライナー'], scale: 'major', familyFriendly: true },
  { slug: 'mikawashima', name: '三河島', kana: 'みかわしま', ward: 'arakawa', lines: ['JR常磐線'], scale: 'minor', familyFriendly: true },
  { slug: 'minami-senju', name: '南千住', kana: 'みなみせんじゅ', ward: 'arakawa', lines: ['JR常磐線', '東京メトロ日比谷線', 'つくばエクスプレス'], scale: 'major', familyFriendly: true },
  { slug: 'minowabashi', name: '三ノ輪橋', kana: 'みのわばし', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'machiya', name: '町屋', kana: 'まちや', ward: 'arakawa', lines: ['東京メトロ千代田線', '京成本線', '都電荒川線'], scale: 'major', familyFriendly: true },
  { slug: 'machiya-ekimae', name: '町屋駅前', kana: 'まちやえきまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'arakawa-kuyakushomae', name: '荒川区役所前', kana: 'あらかわくやくしょまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'arakawa-nichome', name: '荒川二丁目', kana: 'あらかわにちょうめ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'arakawa-shakomae', name: '荒川車庫前', kana: 'あらかわしゃこまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'arakawa-yuenchi-mae', name: '荒川遊園地前', kana: 'あらかわゆうえんちまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'arakawa-itchumae', name: '荒川一中前', kana: 'あらかわいっちゅうまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'higashi-ogu-sanchome', name: '東尾久三丁目', kana: 'ひがしおぐさんちょうめ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'kumano-mae', name: '熊野前', kana: 'くまのまえ', ward: 'arakawa', lines: ['日暮里・舎人ライナー', '都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'akado-shogakko-mae', name: '赤土小学校前', kana: 'あかどしょうがっこうまえ', ward: 'arakawa', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'odai', name: '小台', kana: 'おだい', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },

  // ===== 板橋区 =====
  { slug: 'itabashi', name: '板橋', kana: 'いたばし', ward: 'itabashi', lines: ['JR埼京線'], scale: 'major', familyFriendly: true },
  { slug: 'itabashi-kuyakushomae', name: '板橋区役所前', kana: 'いたばしくやくしょまえ', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'itabashi-honcho', name: '板橋本町', kana: 'いたばしほんちょう', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'motohasunuma', name: '本蓮沼', kana: 'もとはすぬま', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimura-sakaue', name: '志村坂上', kana: 'しむらさかうえ', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'shimura-sanchome', name: '志村三丁目', kana: 'しむらさんちょうめ', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'hasune', name: '蓮根', kana: 'はすね', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishidai', name: '西台', kana: 'にしだい', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'takashimadaira', name: '高島平', kana: 'たかしまだいら', ward: 'itabashi', lines: ['都営三田線'], scale: 'major', familyFriendly: true },
  { slug: 'shin-takashimadaira', name: '新高島平', kana: 'しんたかしまだいら', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishi-takashimadaira', name: '西高島平', kana: 'にしたかしまだいら', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },
  { slug: 'naka-itabashi', name: '中板橋', kana: 'なかいたばし', ward: 'itabashi', lines: ['東武東上線'], scale: 'minor', familyFriendly: true },
  { slug: 'tokiwadai', name: 'ときわ台', kana: 'ときわだい', ward: 'itabashi', lines: ['東武東上線'], scale: 'major', familyFriendly: true },
  { slug: 'kami-itabashi', name: '上板橋', kana: 'かみいたばし', ward: 'itabashi', lines: ['東武東上線'], scale: 'major', familyFriendly: true },
  { slug: 'tobu-nerima', name: '東武練馬', kana: 'とうぶねりま', ward: 'itabashi', lines: ['東武東上線'], scale: 'major', familyFriendly: true },
  { slug: 'shimo-akatsuka', name: '下赤塚', kana: 'しもあかつか', ward: 'itabashi', lines: ['東武東上線'], scale: 'minor', familyFriendly: true },
  { slug: 'narimasu', name: '成増', kana: 'なります', ward: 'itabashi', lines: ['東武東上線'], scale: 'major', familyFriendly: true },
  { slug: 'chikatetsu-narimasu', name: '地下鉄成増', kana: 'ちかてつなります', ward: 'itabashi', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'major', familyFriendly: true },
  { slug: 'chikatetsu-akatsuka', name: '地下鉄赤塚', kana: 'ちかてつあかつか', ward: 'itabashi', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-itabashi', name: '新板橋', kana: 'しんいたばし', ward: 'itabashi', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },

  // ===== 練馬区 =====
  { slug: 'nerima', name: '練馬', kana: 'ねりま', ward: 'nerima', lines: ['西武池袋線', '西武豊島線', '都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'toshimaen', name: '豊島園', kana: 'としまえん', ward: 'nerima', lines: ['西武豊島線', '都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'nerima-kasugacho', name: '練馬春日町', kana: 'ねりまかすがちょう', ward: 'nerima', lines: ['都営大江戸線'], scale: 'minor', familyFriendly: true },
  { slug: 'hikarigaoka', name: '光が丘', kana: 'ひかりがおか', ward: 'nerima', lines: ['都営大江戸線'], scale: 'major', familyFriendly: true },
  { slug: 'shakujii-koen', name: '石神井公園', kana: 'しゃくじいこうえん', ward: 'nerima', lines: ['西武池袋線'], scale: 'major', familyFriendly: true },
  { slug: 'oizumi-gakuen', name: '大泉学園', kana: 'おおいずみがくえん', ward: 'nerima', lines: ['西武池袋線'], scale: 'major', familyFriendly: true },
  { slug: 'sakuradai', name: '桜台', kana: 'さくらだい', ward: 'nerima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },
  { slug: 'ekoda', name: '江古田', kana: 'えこだ', ward: 'nerima', lines: ['西武池袋線'], scale: 'major', familyFriendly: true },
  { slug: 'fujimidai', name: '富士見台', kana: 'ふじみだい', ward: 'nerima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },
  { slug: 'nerima-takanodai', name: '練馬高野台', kana: 'ねりまたかのだい', ward: 'nerima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },
  { slug: 'kami-shakujii', name: '上石神井', kana: 'かみしゃくじい', ward: 'nerima', lines: ['西武新宿線'], scale: 'major', familyFriendly: true },
  { slug: 'musashi-seki', name: '武蔵関', kana: 'むさしせき', ward: 'nerima', lines: ['西武新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'nakamurabashi', name: '中村橋', kana: 'なかむらばし', ward: 'nerima', lines: ['西武池袋線'], scale: 'minor', familyFriendly: true },

  // ===== 足立区 =====
  { slug: 'kita-senju', name: '北千住', kana: 'きたせんじゅ', ward: 'adachi', lines: ['JR常磐線', '東京メトロ日比谷線', '東京メトロ千代田線', '東武スカイツリーライン', 'つくばエクスプレス'], scale: 'terminal', familyFriendly: true },
  { slug: 'ayase', name: '綾瀬', kana: 'あやせ', ward: 'adachi', lines: ['JR常磐線', '東京メトロ千代田線'], scale: 'major', familyFriendly: true },
  { slug: 'kita-ayase', name: '北綾瀬', kana: 'きたあやせ', ward: 'adachi', lines: ['東京メトロ千代田線'], scale: 'minor', familyFriendly: true },
  { slug: 'gotanno', name: '五反野', kana: 'ごたんの', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'umejima', name: '梅島', kana: 'うめじま', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'nishiarai', name: '西新井', kana: 'にしあらい', ward: 'adachi', lines: ['東武スカイツリーライン', '東武大師線'], scale: 'major', familyFriendly: true },
  { slug: 'daishimae', name: '大師前', kana: 'だいしまえ', ward: 'adachi', lines: ['東武大師線'], scale: 'minor', familyFriendly: true },
  { slug: 'takenotsuka', name: '竹ノ塚', kana: 'たけのつか', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'major', familyFriendly: true },
  { slug: 'kosuge', name: '小菅', kana: 'こすげ', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'horikiri', name: '堀切', kana: 'ほりきり', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'toneri', name: '舎人', kana: 'とねり', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'toneri-koen', name: '舎人公園', kana: 'とねりこうえん', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'minumadai-shinsuikoen', name: '見沼代親水公園', kana: 'みぬまだいしんすいこうえん', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'yazaike', name: '谷在家', kana: 'やざいけ', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'kohoku', name: '江北', kana: 'こうほく', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'nishiarai-daishi-nishi', name: '西新井大師西', kana: 'にしあらいだいしにし', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'adachi-odai', name: '足立小台', kana: 'あだちおだい', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'oji-shinden', name: '扇大橋', kana: 'おうぎおおはし', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },
  { slug: 'ushida', name: '牛田', kana: 'うしだ', ward: 'adachi', lines: ['東武スカイツリーライン'], scale: 'minor', familyFriendly: true },
  { slug: 'keisei-sekiya', name: '京成関屋', kana: 'けいせいせきや', ward: 'adachi', lines: ['京成本線'], scale: 'minor', familyFriendly: true },
  { slug: 'horikiri-keisei', name: '堀切菖蒲園', kana: 'ほりきりしょうぶえん', ward: 'katsushika', lines: ['京成本線'], scale: 'minor', familyFriendly: true },

  // ===== 葛飾区 =====
  { slug: 'kameari', name: '亀有', kana: 'かめあり', ward: 'katsushika', lines: ['JR常磐線'], scale: 'major', familyFriendly: true },
  { slug: 'kanamachi', name: '金町', kana: 'かなまち', ward: 'katsushika', lines: ['JR常磐線'], scale: 'major', familyFriendly: true },
  { slug: 'keisei-kanamachi', name: '京成金町', kana: 'けいせいかなまち', ward: 'katsushika', lines: ['京成金町線'], scale: 'minor', familyFriendly: true },
  { slug: 'shibamata', name: '柴又', kana: 'しばまた', ward: 'katsushika', lines: ['京成金町線'], scale: 'minor', familyFriendly: true },
  { slug: 'keisei-takasago', name: '京成高砂', kana: 'けいせいたかさご', ward: 'katsushika', lines: ['京成本線', '京成金町線', '京成押上線', '北総線'], scale: 'major', familyFriendly: true },
  { slug: 'aoto', name: '青砥', kana: 'あおと', ward: 'katsushika', lines: ['京成本線', '京成押上線'], scale: 'major', familyFriendly: true },
  { slug: 'keisei-tateishi', name: '京成立石', kana: 'けいせいたていし', ward: 'katsushika', lines: ['京成押上線'], scale: 'minor', familyFriendly: true },
  { slug: 'yotsugi', name: '四ツ木', kana: 'よつぎ', ward: 'katsushika', lines: ['京成押上線'], scale: 'minor', familyFriendly: true },
  { slug: 'ohanajaya', name: 'お花茶屋', kana: 'おはなぢゃや', ward: 'katsushika', lines: ['京成本線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-koiwa', name: '新小岩', kana: 'しんこいわ', ward: 'katsushika', lines: ['JR総武線快速', 'JR中央・総武線'], scale: 'major', familyFriendly: true },

  // ===== 江戸川区 =====
  { slug: 'koiwa', name: '小岩', kana: 'こいわ', ward: 'edogawa', lines: ['JR中央・総武線'], scale: 'major', familyFriendly: true },
  { slug: 'keisei-koiwa', name: '京成小岩', kana: 'けいせいこいわ', ward: 'edogawa', lines: ['京成本線'], scale: 'minor', familyFriendly: true },
  { slug: 'edogawa', name: '江戸川', kana: 'えどがわ', ward: 'edogawa', lines: ['京成本線'], scale: 'minor', familyFriendly: true },
  { slug: 'shinozaki', name: '篠崎', kana: 'しのざき', ward: 'edogawa', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'mizue', name: '瑞江', kana: 'みずえ', ward: 'edogawa', lines: ['都営新宿線'], scale: 'minor', familyFriendly: true },
  { slug: 'ichinoe', name: '一之江', kana: 'いちのえ', ward: 'edogawa', lines: ['都営新宿線'], scale: 'major', familyFriendly: true },
  { slug: 'funabori', name: '船堀', kana: 'ふなぼり', ward: 'edogawa', lines: ['都営新宿線'], scale: 'major', familyFriendly: true },
  { slug: 'kasai', name: '葛西', kana: 'かさい', ward: 'edogawa', lines: ['東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'nishi-kasai', name: '西葛西', kana: 'にしかさい', ward: 'edogawa', lines: ['東京メトロ東西線'], scale: 'major', familyFriendly: true },
  { slug: 'kasai-rinkai-koen', name: '葛西臨海公園', kana: 'かさいりんかいこうえん', ward: 'edogawa', lines: ['JR京葉線'], scale: 'major', familyFriendly: true },

  // ===== 追加: 都電荒川線（実在駅で未収録のもの） =====
  { slug: 'oji-ekimae', name: '王子駅前', kana: 'おうじえきまえ', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'asukayama', name: '飛鳥山', kana: 'あすかやま', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'takinogawa-itchome', name: '滝野川一丁目', kana: 'たきのがわいっちょうめ', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'nishigahara-yonchome', name: '西ヶ原四丁目', kana: 'にしがはらよんちょうめ', ward: 'kita', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'sugamo-shinden', name: '巣鴨新田', kana: 'すがもしんでん', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'otsuka-ekimae', name: '大塚駅前', kana: 'おおつかえきまえ', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor' },
  { slug: 'nishi-sugamo', name: '西巣鴨', kana: 'にしすがも', ward: 'toshima', lines: ['都営三田線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 西武池袋線/西武有楽町線（練馬区） =====
  { slug: 'kotake-mukaihara', name: '小竹向原', kana: 'こたけむかいはら', ward: 'nerima', lines: ['東京メトロ有楽町線', '東京メトロ副都心線', '西武有楽町線'], scale: 'major', familyFriendly: true },
  { slug: 'shin-sakuradai', name: '新桜台', kana: 'しんさくらだい', ward: 'nerima', lines: ['西武有楽町線'], scale: 'minor', familyFriendly: true },


  // ===== 追加: 東急池上線（品川区） =====
  { slug: 'osaki-hirokoji', name: '大崎広小路', kana: 'おおさきひろこうじ', ward: 'shinagawa', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: つくばエクスプレス(足立区内) =====
  { slug: 'aoi', name: '青井', kana: 'あおい', ward: 'adachi', lines: ['つくばエクスプレス'], scale: 'minor', familyFriendly: true },
  { slug: 'rokucho', name: '六町', kana: 'ろくちょう', ward: 'adachi', lines: ['つくばエクスプレス'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 京成本線 (足立区/荒川区接続) =====
  { slug: 'senju-ohashi', name: '千住大橋', kana: 'せんじゅおおはし', ward: 'adachi', lines: ['京成本線'], scale: 'minor', familyFriendly: true },
  { slug: 'shin-mikawashima', name: '新三河島', kana: 'しんみかわしま', ward: 'arakawa', lines: ['京成本線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 京王線 (杉並区) =====
  { slug: 'daitabashi', name: '代田橋', kana: 'だいたばし', ward: 'suginami', lines: ['京王線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 京王新線 (新宿区) =====
  { slug: 'shinsen-shinjuku', name: '新線新宿', kana: 'しんせんしんじゅく', ward: 'shinjuku', lines: ['京王新線'], scale: 'major' },

  // ===== 追加: 東武東上線 (板橋区) =====
  { slug: 'oyama', name: '大山', kana: 'おおやま', ward: 'itabashi', lines: ['東武東上線'], scale: 'major', familyFriendly: true },

  // ===== 追加: 東京メトロ有楽町線・副都心線 (練馬区) =====
  { slug: 'hikawadai', name: '氷川台', kana: 'ひかわだい', ward: 'nerima', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'minor', familyFriendly: true },
  { slug: 'heiwadai', name: '平和台', kana: 'へいわだい', ward: 'nerima', lines: ['東京メトロ有楽町線', '東京メトロ副都心線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 東京メトロ有楽町線 (千代田区) =====
  { slug: 'sakuradamon', name: '桜田門', kana: 'さくらだもん', ward: 'chiyoda', lines: ['東京メトロ有楽町線'], scale: 'minor' },

  // ===== 追加: 東急大井町線 (大田区) =====
  { slug: 'kita-senzoku', name: '北千束', kana: 'きたせんぞく', ward: 'ota', lines: ['東急大井町線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 東急田園都市線 (世田谷区) =====
  { slug: 'ikejiri-ohashi', name: '池尻大橋', kana: 'いけじりおおはし', ward: 'setagaya', lines: ['東急田園都市線'], scale: 'major', familyFriendly: true },

  // ===== 追加: 東急池上線 (大田区) =====
  { slug: 'nagahara', name: '長原', kana: 'ながはら', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },
  { slug: 'senzoku-ike', name: '洗足池', kana: 'せんぞくいけ', ward: 'ota', lines: ['東急池上線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 都営浅草線 (中央区) =====
  { slug: 'takaracho', name: '宝町', kana: 'たからちょう', ward: 'chuo', lines: ['都営浅草線'], scale: 'minor' },

  // ===== 追加: 都営三田線 (千代田区) =====
  { slug: 'uchi-saiwaicho', name: '内幸町', kana: 'うちさいわいちょう', ward: 'chiyoda', lines: ['都営三田線'], scale: 'minor' },

  // ===== 追加: 都営大江戸線/ゆりかもめ (港区) =====
  { slug: 'shiodome', name: '汐留', kana: 'しおどめ', ward: 'minato', lines: ['都営大江戸線', 'ゆりかもめ'], scale: 'major' },

  // ===== 追加: 日暮里・舎人ライナー (足立区) =====
  { slug: 'takanosuke', name: '高野', kana: 'こうや', ward: 'adachi', lines: ['日暮里・舎人ライナー'], scale: 'minor', familyFriendly: true },

  // ===== 追加: 都電荒川線 (荒川区) =====
  { slug: 'arakawa-nanachome', name: '荒川七丁目', kana: 'あらかわななちょうめ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'machiya-nichome', name: '町屋二丁目', kana: 'まちやにちょうめ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'miyanomae', name: '宮ノ前', kana: 'みやのまえ', ward: 'arakawa', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },
  { slug: 'toden-zoshigaya', name: '都電雑司ヶ谷', kana: 'とでんぞうしがや', ward: 'toshima', lines: ['都電荒川線'], scale: 'minor', familyFriendly: true },

  // ===== 追加: JR総武線快速 (中央区) =====
  { slug: 'shin-nihombashi', name: '新日本橋', kana: 'しんにほんばし', ward: 'chuo', lines: ['JR総武線快速'], scale: 'minor' },

  // ===== 追加: JR宇都宮線・高崎線 (北区) =====
  { slug: 'oku', name: '尾久', kana: 'おく', ward: 'kita', lines: ['JR上野東京ライン', 'JR宇都宮線', 'JR高崎線'], scale: 'minor', familyFriendly: true },


  // ===== 追加: 北総線 (葛飾区) =====
  { slug: 'shin-shibamata', name: '新柴又', kana: 'しんしばまた', ward: 'katsushika', lines: ['北総線'], scale: 'minor', familyFriendly: true },

];

/** slug から駅情報を取得。 */
const STATION_MAP = new Map(TOKYO_STATIONS.map((s) => [s.slug, s]));

export function getStationBySlug(slug: string): TokyoStation | undefined {
  return STATION_MAP.get(slug);
}

/** 区別駅一覧。 */
export function getStationsByWard(ward: TokyoWard): TokyoStation[] {
  return TOKYO_STATIONS.filter((s) => s.ward === ward);
}

/** ターミナル駅のみ。 */
export function getTerminalStations(): TokyoStation[] {
  return TOKYO_STATIONS.filter((s) => s.scale === 'terminal');
}

/** ファミリー向けエリアの駅のみ。 */
export function getFamilyFriendlyStations(): TokyoStation[] {
  return TOKYO_STATIONS.filter((s) => s.familyFriendly === true);
}

/** 区の日本語名マッピング。 */
export const WARD_NAMES: Record<TokyoWard, string> = {
  chiyoda: '千代田区',
  chuo: '中央区',
  minato: '港区',
  shinjuku: '新宿区',
  bunkyo: '文京区',
  taito: '台東区',
  sumida: '墨田区',
  koto: '江東区',
  shinagawa: '品川区',
  meguro: '目黒区',
  ota: '大田区',
  setagaya: '世田谷区',
  shibuya: '渋谷区',
  nakano: '中野区',
  suginami: '杉並区',
  toshima: '豊島区',
  kita: '北区',
  arakawa: '荒川区',
  itabashi: '板橋区',
  nerima: '練馬区',
  adachi: '足立区',
  katsushika: '葛飾区',
  edogawa: '江戸川区',
};
