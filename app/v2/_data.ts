/**
 * /v2 モックデータ — Claude design プロトタイプ data.js を移植。
 * 実画像は public/v2/photos/ を参照。
 * 本番では lib/spots.ts / lib/indie-restaurants / lib/feature-pages.ts へ接続予定。
 */

import type { V2Article, V2Event, V2Feature, V2LunchItem, V2Spot } from '@/components/v2/V2Cards';

const P = (n: string) => `/v2/photos/${n}`;

export const IMG = {
  aquarium: [P('aquarium1.png'), P('aquarium2.png')],
  indoor: [P('indoor-slide.png'), P('ballpit-girl.png'), P('ballpit-kids.png')],
  park: [P('park-lawn.jpg'), P('park-pond.jpg'), P('kids-run.png')],
  library: [P('library-int.png'), P('hall-ext.png')],
  family: [P('family-walk.png'), P('family-baby.png'), P('family-bubbles.png')],
  baby: [P('babyroom.png'), P('family-baby.png')],
  kids: [P('kids-run.png'), P('ballpit-kids.png'), P('playground-city.png')],
  food: [P('kidsmeal.png'), P('lunch-family.png'), P('restaurant1.png')],
  cafe: [P('cafe1.png'), P('restaurant1.png')],
  famires: [P('lunch-family.png'), P('restaurant1.png'), P('kidsmeal.png')],
  rain: [P('rain-window.png'), P('rainboots.png'), P('rain-walk.png')],
  summer: [P('waterplay.png'), P('park-lawn.jpg')],
  zoo: [P('zoo-giraffe.png'), P('zoo-entrance.png')],
  event: [P('illumination.png'), P('halloween.png'), P('winter-tree.png')],
  winter: [P('winter-tree.png'), P('illumination.png')],
  sakura: [P('field-flower.jpg'), P('park-pond.jpg')],
  amuse: [P('playground-city.png'), P('waterplay.png')],
  waterplay: [P('waterplay.png')],
  flower: [P('field-flower.jpg')],
  hero: P('family-walk.png'),
};

export const SPOTS: V2Spot[] = [
  { id: 'sunshine-aq', name: 'サンシャイン水族館', cat: '水族館', area: '豊島区', station: '東池袋駅から徒歩3分', age: '0〜6歳', img: IMG.aquarium[0], price: '2,600円〜',
    tags: [{ t: '0〜6歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: 'ベビーカーOK', k: '' }],
    desc: '都会の真ん中で海の生きものに出会える！屋内だから雨でもゆっくり楽しめます。' },
  { id: 'galaxcity', name: 'ギャラクシティ', cat: '体験施設', area: '足立区', station: '西新井駅から徒歩3分', age: '0〜12歳', img: P('sciencemuseum.png'), price: '無料〜',
    tags: [{ t: '0〜12歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: '授乳室あり', k: '' }],
    desc: '遊びながら学べる体験型の大型施設！プラネタリウムも人気です。' },
  { id: 'toshimaen-pool', name: 'としまえん（屋内プール）', cat: '体験スポット', area: '練馬区', station: '豊島園駅から徒歩2分', age: '0〜12歳', img: P('waterplay.png'), price: '1,200円〜',
    tags: [{ t: '0〜12歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: 'ベビーカーOK', k: '' }],
    desc: '天候を気にせず一年中楽しめる屋内プール。' },
  { id: 'central-lib', name: '豊島区立中央図書館', cat: '図書館', area: '豊島区', station: '東池袋駅から徒歩7分', age: '0〜6歳', img: IMG.library[0], price: '無料',
    tags: [{ t: '0〜6歳', k: 'age' }, { t: '室内', k: 'rain' }, { t: '授乳室あり', k: '' }],
    desc: '絵本コーナーやおはなし会が充実。雨の日の知育おでかけにぴったり。' },
  { id: 'kids-garden', name: 'キッズ☆ガーデン東池袋', cat: '室内あそび場', area: '豊島区', station: '東池袋駅 徒歩5分', age: '0〜6歳', img: IMG.indoor[2], price: '1,000円〜',
    tags: [{ t: '0〜6歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: '授乳室あり', k: '' }],
    desc: 'はだしで遊べる清潔な室内あそび場。0歳専用のベビーエリアあり。' },
  { id: 'toshima-kids', name: 'としまキッズパーク', cat: '体験スポット', area: '豊島区', station: '東池袋駅 徒歩7分', age: '0〜3歳', img: P('indoor-slide.png'), price: '無料',
    tags: [{ t: '0〜3歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: 'ベビーカーOK', k: '' }],
    desc: '0〜3歳の子どもが安心して遊べる屋内施設。' },
  { id: 'namco-asobi', name: 'あそびパーク Namco池袋店', cat: '室内あそび場', area: '豊島区', station: '池袋駅 徒歩2分', age: '1〜6歳', img: IMG.indoor[1], price: '時間制',
    tags: [{ t: '1〜6歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: '飲食持ち込みOK', k: '' }],
    desc: '砂あそびやボールプールが屋内で楽しめる定番スポット。' },
  { id: 'minamiike-park', name: '南池袋公園', cat: '公園', area: '豊島区', station: '池袋駅 徒歩5分', age: '0〜6歳', img: IMG.park[1], price: '無料',
    tags: [{ t: '0〜6歳', k: 'age' }, { t: '屋外', k: '' }, { t: '芝生広場', k: '' }],
    desc: '芝生が気持ちいい都会のオアシス。' },
  { id: 'aurusupotto', name: 'あうるすぽっと', cat: '劇場', area: '豊島区', station: '東池袋駅 直結', age: '0〜12歳', img: P('hall-ext.png'), price: '公演による',
    tags: [{ t: '0〜12歳', k: 'age' }, { t: '雨OK', k: 'rain' }, { t: '駅直結', k: '' }],
    desc: '親子で楽しめる人形劇や読み聞かせイベントを開催。' },
];

export const LUNCH: V2LunchItem[] = [
  { id: 'gusto-ike', name: 'ガスト 池袋西口店', area: '池袋駅 西口 徒歩3分', img: IMG.famires[0],
    tags: ['キッズメニューあり', 'ベビーカーOK', '徒歩3分', '座敷あり'],
    desc: 'キッズメニューが充実！ベビーカーでの入店もスムーズで、家族連れに人気のファミレスです。',
    hours: '9:00〜翌1:00', site: 'https://www.skylark.co.jp/gusto/' },
  { id: 'jonathan-ike', name: 'ジョナサン 池袋東店', area: '池袋駅 東口 徒歩5分', img: IMG.famires[1],
    tags: ['キッズメニューあり', 'ベビーカーOK', '徒歩5分', '個室あり'],
    desc: '広々とした店内でベビーカーでも快適。ドリンクバーもあり、ゆっくりランチを楽しめます。',
    hours: '7:00〜23:00', site: '#' },
  { id: 'ootoya-ike', name: '大戸屋 池袋サンシャイン通り店', area: '池袋駅 東口 徒歩7分', img: IMG.food[0],
    tags: ['キッズメニューあり', '座敷あり', '徒歩7分', 'ベビーカーOK'],
    desc: '体にやさしい和食が人気。座敷席があるので小さなお子様連れでも安心して利用できます。',
    hours: '11:00〜22:00', site: '#' },
  { id: 'saize-ike', name: 'サイゼリヤ 池袋西口店', area: '池袋駅 西口 徒歩4分', img: IMG.cafe[1],
    tags: ['キッズメニューあり', 'ベビーカーOK', '徒歩4分', 'コスパ◎'],
    desc: 'お手頃価格で気軽に入れるイタリアン。キッズメニューもあり、子連れランチにぴったり。',
    hours: '11:00〜23:00', site: '#' },
  { id: 'kitchen-abc', name: 'キッチンABC 池袋店', area: '池袋駅 西口 徒歩6分', img: IMG.food[2],
    tags: ['子連れ歓迎', '徒歩6分', 'ボリューム◎'],
    desc: '昔ながらの洋食屋さん。子どもも食べやすいオムライスやハンバーグが名物。',
    hours: '11:00〜22:00', site: '#' },
  { id: 'cafe-miyama', name: '珈琲館 ミヤマ 池袋', area: '池袋駅 東口 徒歩3分', img: IMG.cafe[0],
    tags: ['ベビーカーOK', '個室あり', '徒歩3分'],
    desc: '落ち着いた雰囲気の老舗喫茶。ソファ席が多く、授乳ケープがあればゆったり過ごせます。',
    hours: '8:00〜22:30', site: '#' },
];

export const EVENTS: V2Event[] = [
  { id: 'kids-fes', name: 'キッズフェス', date: '5/18(日)まで', place: 'サンシャインシティ', age: '0〜12歳', status: '開催中', img: IMG.event[0] },
  { id: 'ritomic', name: '親子で楽しむリトミック体験', date: '5/24(土)', place: 'としま区民センター', age: '0〜3歳', status: 'まもなく開催', img: P('family-baby.png') },
  { id: 'yomikikase', name: '絵本のよみきかせ会', date: '5/25(日)', place: '中央図書館', age: '0〜6歳', status: 'まもなく開催', img: P('library-int.png') },
  { id: 'toshima-marche', name: 'としまマルシェ', date: '5/31(土)まで', place: '南池袋公園', age: '全年齢', status: '開催中', img: P('park-lawn.jpg') },
  { id: 'usagi', name: 'サンシャインシティ うさぎふれあい広場', date: '5/25(日)まで', place: 'サンシャインシティ', age: '0〜6歳', status: '開催中', img: IMG.zoo[0] },
  { id: 'enten', name: 'としまえんてい2024', date: '5/25(日)〜6/2(日)', place: '豊島園', age: '全年齢', status: '開催中', img: P('waterplay.png') },
  { id: 'sunpark', name: 'IKE・SUNPARK ファーマーズマーケット', date: '毎週土日開催', place: 'IKE・SUNPARK', age: '全年齢', status: '開催中', img: P('field-flower.jpg') },
];

export const FEATURES: V2Feature[] = [
  { id: 'rainy', title: '雨の日でも安心！室内あそび特集', short: '雨の日特集', icon: 'umbrella', accent: 'rain', sub: '室内で楽しめるおでかけ先', img: IMG.indoor[0],
    desc: '天気を気にせず楽しめる室内スポットを厳選！子どもが夢中になる遊び場から、学びにつながる体験ができる施設までご紹介します。',
    lead: '雨の日でも思いっきり楽しめる！', tags: ['雨の日', '室内', '0〜6歳'], spotIds: ['sunshine-aq', 'galaxcity', 'toshima-kids', 'kids-garden', 'central-lib'] },
  { id: 'baby01', title: '0〜1歳向けおでかけ特集', short: '0〜1歳向け特集', icon: 'baby', accent: 'event', sub: '赤ちゃんと一緒に楽しめるスポット', img: IMG.baby[0],
    desc: '赤ちゃんと一緒に安心して楽しめるスポットをまとめました。授乳室やおむつ替えスペースのある施設を中心にご紹介します。',
    lead: 'はじめてのおでかけも安心♪', tags: ['0〜1歳', '授乳室あり', 'ベビーカーOK'], spotIds: ['central-lib', 'kids-garden', 'toshima-kids', 'minamiike-park'] },
  { id: 'free', title: '無料で遊べる！スポット特集', short: '無料スポット特集', icon: 'free', accent: 'free', sub: 'お金をかけずに楽しめるスポット', img: IMG.park[0],
    desc: 'お財布にやさしい無料スポットをエリア別にご紹介します♪公園や図書館など、何度でも通いたくなる場所が見つかります。',
    lead: 'お金をかけずに1日楽しめる！', tags: ['無料', '公園', '0〜6歳'], spotIds: ['minamiike-park', 'toshima-kids', 'central-lib', 'galaxcity'] },
  { id: 'lunch', title: '子連れランチにおすすめ特集', short: '子連れランチ特集', icon: 'fork', accent: 'lunch', sub: 'キッズメニューや座敷のあるお店', img: IMG.food[0],
    desc: 'キッズメニューや座敷・個室のある子連れにやさしいお店を厳選。ママ会やお出かけランチにどうぞ。',
    lead: '子連れでも気兼ねなく♪', tags: ['子連れランチ', 'キッズメニュー', '個室'], spotIds: [] },
];

export const FEATURE_CATS = {
  age:     [{ t: '0〜1歳向け', img: IMG.baby[0], accent: 'event' }, { t: '1〜3歳向け', img: IMG.kids[0], accent: 'sun' }, { t: '4〜6歳向け', img: IMG.kids[1], accent: 'indoor' }, { t: '小学生向け', img: IMG.kids[2], accent: 'rain' }],
  weather: [{ t: '雨の日', img: IMG.rain[0], accent: 'rain' }, { t: '暑い日', img: IMG.summer[0], accent: 'sun' }, { t: '寒い日', img: IMG.sakura[1], accent: 'purple' }, { t: '室内スポット', img: IMG.indoor[0], accent: 'indoor' }],
  purpose: [{ t: '子連れランチ', img: IMG.food[0], accent: 'lunch' }, { t: '公園', img: IMG.park[0], accent: 'indoor' }, { t: '水遊び', img: IMG.waterplay[0], accent: 'rain' }, { t: 'イベント', img: IMG.event[0], accent: 'event' }, { t: '動物園・水族館', img: IMG.zoo[0], accent: 'purple' }],
  price:   [{ t: '無料', img: IMG.park[1], accent: 'free' }, { t: '1000円以下', img: IMG.family[2], accent: 'sun' }, { t: 'コスパ重視', img: IMG.kids[0], accent: 'indoor' }, { t: '1日遊べる', img: IMG.amuse[0], accent: 'rain' }],
} as const;

export const FEATURE_RECENT = [
  { title: '夏限定！子どもと楽しむイベント特集', img: IMG.summer[0], tags: ['イベント', '夏限定', '家族で楽しめる'] },
  { title: '水遊びができるスポット特集', img: IMG.waterplay[0], tags: ['水遊び', '夏', '屋外'] },
  { title: '新しくオープンした室内スポット特集', img: IMG.indoor[2], tags: ['室内', '新オープン', '0〜6歳'] },
];

export const ARTICLES: V2Article[] = [
  { id: 'a1', title: 'サンシャイン水族館を120%楽しむコツ！', img: IMG.aquarium[0], sub: '子連れにやさしい設備や、まわり方のポイントを詳しくご紹介♪', tags: ['0〜6歳', '雨の日', 'ベビーカーOK'] },
  { id: 'a2', title: 'はじめてでも安心！0歳から行けるおでかけ先10選', img: IMG.indoor[0], sub: '赤ちゃん連れでも楽しめるスポットを厳選しました', tags: ['0〜1歳', '室内施設', '授乳室あり'] },
  { id: 'a3', title: '豊島区の子連れランチおすすめ10選', img: IMG.food[0], sub: 'キッズメニュー・座敷・個室があるお店をピックアップ', tags: ['ランチ', '豊島区', 'キッズメニューあり'], goLunch: true },
];

export type Prefecture = {
  id: string;
  name: string;
  sub: string;
  img: string;
  icon: 'tower' | 'leaf' | 'ship' | 'boat' | 'flower' | 'clover' | 'onsen';
  color: string;
  toTokyo?: boolean;
};
export const PREFECTURES: Prefecture[] = [
  { id: 'tokyo', name: '東京都', sub: '23区＋多摩エリアのおでかけ情報', img: IMG.park[0], icon: 'tower', color: '#E0561F', toTokyo: true },
  { id: 'saitama', name: '埼玉県', sub: '埼玉県全域のおでかけ情報', img: IMG.park[0], icon: 'leaf', color: '#2E9D6B' },
  { id: 'kanagawa', name: '神奈川県', sub: '神奈川県全域のおでかけ情報', img: IMG.park[1], icon: 'ship', color: '#2E8BD4' },
  { id: 'chiba', name: '千葉県', sub: '千葉県全域のおでかけ情報', img: IMG.flower[0], icon: 'boat', color: '#3DB5C9' },
  { id: 'ibaraki', name: '茨城県', sub: '茨城県全域のおでかけ情報', img: IMG.flower[0], icon: 'flower', color: '#9B7BE0' },
  { id: 'tochigi', name: '栃木県', sub: '栃木県全域のおでかけ情報', img: IMG.park[1], icon: 'clover', color: '#7BB553' },
  { id: 'gunma', name: '群馬県', sub: '群馬県全域のおでかけ情報', img: IMG.park[0], icon: 'onsen', color: '#E08A2E' },
];

export const POPULAR_AREAS = [
  { t: '池袋駅周辺', icon: 'building', accent: 'rain' as const },
  { t: '大塚・巣鴨', icon: 'train', accent: 'lunch' as const },
  { t: '駒込・田端', icon: 'tree', accent: 'indoor' as const },
  { t: '東池袋・雑司が谷', icon: 'house', accent: 'sun' as const },
  { t: '目白・高田馬場', icon: 'flag', accent: 'purple' as const },
];

export const TOKYO_WARDS = ['豊島区','板橋区','練馬区','北区','文京区','新宿区','中野区','杉並区','世田谷区','渋谷区','港区','中央区','千代田区','台東区','墨田区','江東区','品川区','目黒区','大田区','荒川区','足立区','葛飾区','江戸川区'];
export const TAMA_CITIES = ['八王子市','立川市','町田市','武蔵野市','三鷹市','調布市','府中市','国分寺市','小金井市','西東京市','青梅市','昭島市','日野市','東村山市','国立市'];

export const QUICK_SEARCH = [
  { t: '雨の日', icon: 'umbrella' as const, accent: 'rain' as const },
  { t: '晴れの日', icon: 'sun' as const, accent: 'sun' as const },
  { t: '室内施設', icon: 'house' as const, accent: 'indoor' as const },
  { t: '子連れランチ', icon: 'fork' as const, accent: 'lunch' as const },
  { t: 'イベント', icon: 'party' as const, accent: 'event' as const },
  { t: '無料スポット', icon: 'free' as const, accent: 'free' as const },
];

export const RECENT_CONDITIONS = ['1〜3歳 × 雨の日 × 豊島区', '0〜1歳 × 室内施設 × 豊島区', '無料スポット × 豊島区'];

export const PREF_META: Record<string, { hero: string; cities: string[] }> = {
  saitama: { hero: IMG.park[0], cities: ['さいたま市','川越市','所沢市','越谷市','川口市','春日部市'] },
  kanagawa: { hero: IMG.park[1], cities: ['横浜市','川崎市','藤沢市','鎌倉市','相模原市','横須賀市'] },
  chiba: { hero: IMG.flower[0], cities: ['千葉市','船橋市','市川市','浦安市','柏市','松戸市'] },
  ibaraki: { hero: IMG.park[0], cities: ['水戸市','つくば市','日立市','ひたちなか市','土浦市'] },
  tochigi: { hero: IMG.park[1], cities: ['宇都宮市','那須塩原市','日光市','小山市','足利市'] },
  gunma: { hero: IMG.flower[0], cities: ['前橋市','高崎市','太田市','伊勢崎市','桐生市'] },
};

export const SPOT_DETAILS: Record<string, {
  breadcrumb?: string[];
  gallery?: string[];
  price?: string; priceNote?: string;
  duration?: string; rain?: string;
  ratings?: Record<string, number>;
  points?: string[];
  address?: string;
  lines?: string[];
  lat?: number; lng?: number;
  recommend?: string[];
}> = {
  'sunshine-aq': {
    breadcrumb: ['ホーム', '豊島区', '室内施設'],
    gallery: [IMG.aquarium[0], IMG.aquarium[1], P('family-baby.png'), IMG.indoor[0], P('zoo-giraffe.png'), P('ballpit-kids.png'), P('cafe1.png'), P('family-walk.png')],
    price: '2,400円〜', priceNote: '※大人1名あたり', duration: '2〜3時間', rain: '◎ おすすめ',
    ratings: { 'ベビーカー': 5, '授乳室': 5, '雨の日の過ごしやすさ': 5, 'コスパ': 4.5 },
    points: ['天空のペンギンが人気！', 'ベビーカーでまわれる', '授乳室・おむつ替え完備', '駅チカでアクセス抜群'],
    address: '東京都豊島区東池袋3-1-3 サンシャインシティ ワールドインポートマートビル・屋上',
    lines: ['東池袋駅（有楽町線）徒歩3分', '池袋駅（各線）徒歩8分'],
    lat: 35.7295, lng: 139.7197,
    recommend: ['0〜3歳におすすめ', '雨の日でも楽しみたい', 'ベビーカー利用OK', '初めての水族館デビュー', '家族みんなで楽しみたい'],
  },
};
