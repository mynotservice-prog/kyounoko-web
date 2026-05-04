/**
 * Plan / Article 両方で使うヒーロー画像のユニファイドライブラリ。
 *
 * v3: ChatGPT (DALL-E 3) で生成したローカル画像に移行（2026年4月）。
 *     - 全21カテゴリ×3枚 = 61枚（kid-learnは1枚）
 *     - すべて /public/hero/ に配置、静的配信
 *     - Unsplash レート制限・URL変更リスクから解放
 *     - 足りないカテゴリは類似カテゴリにフォールバック
 */

type PhotoCat =
  | 'baby'            // 0-1歳 / 赤ちゃん
  | 'toddler-play'    // 2-3歳 / おもちゃ・ブロック
  | 'kid-study'       // 4-6歳 / 学習・読書
  | 'kid-craft'       // 工作・絵・色塗り
  | 'family-dinner'   // 夕食・家族食卓
  | 'home-cozy'       // 家・夜・リラックス
  | 'food-japan'      // 和食・お弁当・魚
  | 'food-kitchen'    // キッチン・調理
  | 'food-fruit'      // 果物・野菜・朝食・健康食
  | 'food-sweet'      // デザート・おやつ
  | 'park'            // 公園・外遊び
  | 'nature'          // 自然・散歩
  | 'autumn'          // 秋・紅葉
  | 'winter-snow'     // 冬・雪遊び
  | 'summer-water'    // 夏・水遊び・プール
  | 'sakura'          // 桜・春
  | 'tokyo'           // 都市景観・ネオン
  | 'japan-rural'     // 地方都市・田園風景
  | 'sleeping'        // 寝かしつけ
  | 'bath'            // お風呂
  | 'kid-learn'       // 読書・机・学び
  | 'classroom'       // 教室・運動
  | 'piano'           // ピアノ・音楽
  | 'stroller'        // ベビーカー・ベビー用品
  | 'medical'         // 病院・薬・発熱
  | 'parent-child'    // 親子の対話・しつけ
  | 'screen-time'     // スマホ・タブレット・デジタル
  | 'commerce'        // 買い物・ランキング・比較
  | 'outdoor-generic';

/** カテゴリ別のローカル画像プール（/public/hero/ 配下） */
const POOL: Record<PhotoCat, string[]> = {
  baby: ['/hero/baby-01.png', '/hero/baby-02.png', '/hero/baby-03.png'],
  'toddler-play': ['/hero/toddler-play-01.png', '/hero/toddler-play-02.png', '/hero/toddler-play-03.png'],
  'kid-study': ['/hero/kid-study-01.png', '/hero/kid-study-02.png', '/hero/kid-study-03.png'],
  'kid-craft': ['/hero/kid-craft-01.png', '/hero/kid-craft-02.png', '/hero/kid-craft-03.png'],
  'family-dinner': ['/hero/family-dinner-01.png', '/hero/family-dinner-02.png', '/hero/family-dinner-03.png'],
  'home-cozy': ['/hero/home-cozy-01.png', '/hero/home-cozy-02.png', '/hero/home-cozy-03.png'],
  'food-japan': ['/hero/food-japan-01.png', '/hero/food-japan-02.png', '/hero/food-japan-03.png'],
  'food-kitchen': ['/hero/food-kitchen-01.png', '/hero/food-kitchen-02.png', '/hero/food-kitchen-03.png'],
  'food-fruit': ['/hero/food-fruit-01.png', '/hero/food-fruit-02.png', '/hero/food-fruit-03.png'],
  'food-sweet': ['/hero/food-sweet-01.png', '/hero/food-sweet-02.png', '/hero/food-sweet-03.png'],
  park: ['/hero/park-01.png', '/hero/park-02.png', '/hero/park-03.png'],
  nature: ['/hero/nature-01.png', '/hero/nature-02.png', '/hero/nature-03.png'],
  autumn: ['/hero/autumn-01.png', '/hero/autumn-02.png', '/hero/autumn-03.png'],
  'winter-snow': ['/hero/winter-snow-01.png', '/hero/winter-snow-02.png', '/hero/winter-snow-03.png'],
  'summer-water': ['/hero/summer-water-01.png', '/hero/summer-water-02.png', '/hero/summer-water-03.png'],
  sakura: ['/hero/sakura-01.png', '/hero/sakura-02.png', '/hero/sakura-03.png'],
  tokyo: ['/hero/tokyo-01.png', '/hero/tokyo-02.png', '/hero/tokyo-03.png'],
  'japan-rural': ['/hero/japan-rural-01.png', '/hero/japan-rural-02.png', '/hero/japan-rural-03.png'],
  sleeping: ['/hero/sleeping-01.png', '/hero/sleeping-02.png', '/hero/sleeping-03.png'],
  bath: ['/hero/bath-01.png', '/hero/bath-02.png', '/hero/bath-03.png'],
  'kid-learn': ['/hero/kid-learn-01.png', '/hero/kid-learn-02.png', '/hero/kid-learn-03.png'],
  classroom: ['/hero/classroom-01.png', '/hero/classroom-02.png', '/hero/classroom-03.png'],
  piano: ['/hero/piano-01.png', '/hero/piano-02.png', '/hero/piano-03.png'],
  stroller: ['/hero/stroller-01.png', '/hero/stroller-03.png'],
  medical: ['/hero/medical-01.png', '/hero/medical-02.png', '/hero/medical-03.png'],
  'parent-child': ['/hero/parent-child-01.png', '/hero/parent-child-02.png', '/hero/parent-child-03.png'],
  'screen-time': ['/hero/screen-time-01.png', '/hero/screen-time-02.png', '/hero/screen-time-03.png'],
  commerce: ['/hero/commerce-01.png', '/hero/commerce-02.png', '/hero/commerce-03.png'],
  'outdoor-generic': ['/hero/park-01.png', '/hero/nature-01.png', '/hero/park-02.png'],
};

function photoUrl(path: string): string {
  return path;
}

/** slug 文字列からカテゴリを推定する（優先度順に判定）。 */
function inferCategoryFromSlug(slug: string): PhotoCat {
  const s = slug.toLowerCase();

  // 医療
  if (/hatsunetsu|netsu|kaze|gerizam|diarrhea|byouin|ishi-sagashi|arerugi|allergy|aleergi|yobou-sesshu|vaccine|senpuu|influenza|corona|covid/.test(s)) return 'medical';
  if (/shindansho|shinsatsu|aleergi-meal|aleergi-food|mugi-ale|ranshoku/.test(s)) return 'medical';

  // スクリーンタイム
  if (/smartphone|sumaho|tablet|youtube-ruleset|screen-time|digital/.test(s)) return 'screen-time';

  // 親子・しつけ
  if (/shitsuke|shikaru|oshiri|iyaiya|tantrum|kenka|chuusai|mama-tomo|oya-.*kouka|oya-ko|kodomo-suki/.test(s)) return 'parent-child';
  if (/hanashikake|komyunikeshon|kotoba-kake|shitsumon|kosodate-sutoresu/.test(s)) return 'parent-child';

  // 季節イベント
  if (/hanami|sakura|ohanami/.test(s)) return 'sakura';
  if (/kouyou|momiji|autumn|aki-/.test(s)) return 'autumn';
  if (/shichigosan/.test(s)) return 'autumn';
  if (/yuki|snow|fuyu-|xmas|christmas|kurisumasu/.test(s)) return 'winter-snow';
  if (/mizuasobi|puuru|pool|suiei|natsu-|summer|moushobi|atsui|suzushii/.test(s)) return 'summer-water';
  if (/halloween|hanabi|oshougatsu|natsumatsuri|hinamatsuri|tanabata|kodomonohi|setsubun/.test(s)) return 'park';

  // 食事
  if (/asagohan|breakfast|asa-/.test(s)) return 'food-fruit';
  if (/bento|obento|kyaraben|reitou-shokuhin|reitougyoza/.test(s)) return 'food-japan';
  if (/rinyuushoku|youjishoku|ikji|hoshokushoku/.test(s)) return 'food-japan';
  if (/sakana|gyoyu|fish|shake|saba/.test(s)) return 'food-japan';
  if (/dessert|okashi|sweets|suitsu|oyatsu/.test(s)) return 'food-sweet';
  if (/yasai|vegetable|vegi|shokumotsu|health-food|kenko-shoku/.test(s)) return 'food-fruit';
  if (/chicken|toriniku|gyuuniku|butaniku|meat|niku-/.test(s)) return 'food-kitchen';
  if (/yaki|cooking|tsukurioki|ryouri|recipe|reshipi/.test(s)) return 'food-kitchen';
  if (/gohan|taberu|shokuji|sukikira|sukikirai|shoushoku|gaishoku|takushoku|dinner|lunch|ranchi|yuuhan/.test(s)) return 'family-dinner';

  // ルーティン
  if (/shoutou|nene|sleep|yonaki|oyasumi|ohirune|nenai|nemuri|nezuke/.test(s)) return 'sleeping';
  if (/ofuro|bath|nyuuyoku|shampoo|senzai-/.test(s)) return 'bath';
  if (/routine|yoru|kaeri|wanope|heijitsu|shumatsu|weekday|hoikuen-sougei|hoikuen-kaeri/.test(s)) return 'home-cozy';

  // 年齢別
  if (/0-1sai|akachan|baby-|yubi-syabu|hatsuzekku/.test(s)) return 'baby';
  if (/aitei-ashi|ayumi|hattatsu|hattaku|gotsugo|hatattsu|mileage.*0-6/.test(s)) return 'baby';
  if (/vegetarian|vege-meal|veji-meal/.test(s)) return 'food-fruit';
  if (/kodomo-hitori.*tabe|hitoride-tabe|hitori-shokuji/.test(s)) return 'family-dinner';
  if (/1-2sai|2-3sai/.test(s)) return 'toddler-play';
  if (/kotoba-okureru|gengo-hattatsu|speech/.test(s)) return 'kid-learn';
  if (/4-6sai|kumon|gakken|shichida|monte|naraigoto|chiku|piano/.test(s)) {
    if (/piano/.test(s)) return 'piano';
    if (/kumon|gakken|shichida|tsuushin|eigo|kyouzai|programming/.test(s)) return 'kid-study';
    return 'classroom';
  }

  // 習い事
  if (/swimming|soccer|yakyu|taisou|sports|undoukai/.test(s)) return 'classroom';
  if (/ehon|yomikikase|reading/.test(s)) return 'kid-learn';
  if (/programming|coding|eigo-asobi|eigo-narai/.test(s)) return 'kid-study';

  // 遊び
  if (/kousaku|craft|tegami|origami|seisaku/.test(s)) return 'kid-craft';
  if (/asobi|chiiku|seal|omocha|toys|youtube/.test(s)) return 'toddler-play';
  if (/kyoudai/.test(s)) return 'toddler-play';

  // 地方
  if (/tokyo/.test(s)) return 'tokyo';
  if (/osaka|kansai|kyoto|kobe/.test(s)) return 'japan-rural';
  if (/nagoya|aichi|shizuoka/.test(s)) return 'japan-rural';
  if (/hokkaido|sapporo|sendai|tohoku/.test(s)) return 'nature';
  if (/fukuoka|kyushu|okinawa|hiroshima/.test(s)) return 'japan-rural';
  if (/yokohama|kanagawa|saitama|chiba/.test(s)) return 'japan-rural';
  if (/niigata|yamanashi|nagano|gifu/.test(s)) return 'nature';
  if (/kanto|shikoku|chugoku/.test(s)) return 'nature';

  // 自然・公園
  if (/doko|odekake|park|stroller-spots|spot/.test(s)) return 'park';
  if (/shizen|nature|plant|hana-|flower/.test(s)) return 'nature';
  if (/indoor|amenohi/.test(s)) return 'park';

  // 商品
  if (/babycar|stroller|dakkohimo|chair|seat/.test(s)) return 'stroller';
  if (/ranking|hikaku|erabi|subsc|comparison/.test(s)) return 'commerce';

  // 安全
  if (/anzen|safety|jiko|yobou|daibutsu|gomu-chi|kurasi-taisaku/.test(s)) return 'home-cozy';
  if (/kankaku-kabin|hattatsu-shougai/.test(s)) return 'parent-child';

  // 入園
  if (/youchien|hoikuen|nyuuen|sotsuen/.test(s)) return 'classroom';
  if (/motimono|junbi-list/.test(s)) return 'home-cozy';

  return 'home-cozy';
}

/**
 * 日本語タイトル / 本文込みでカテゴリ推定する強化版。
 * inferCategoryFromSlug は slug（英字スラグ）前提なので、日本語の plan title /
 * shortAnswer を渡してもマッチが弱い。これを補うため、日本語キーワードを直接見る
 * 別レイヤーを追加。slug 推定で 'home-cozy'（汎用フォールバック）になった場合のみ
 * 日本語キーワードで上書きする。
 */
function inferCategoryFromText(text: string): PhotoCat {
  const fromSlug = inferCategoryFromSlug(text);
  if (fromSlug !== 'home-cozy') return fromSlug;

  const t = text;
  // 食事系（既存hero設定を優先するためplan側でガード予定だが、念のため）
  if (/朝ごはん|朝食/.test(t)) return 'food-fruit';
  if (/お弁当|キャラ弁|弁当/.test(t)) return 'food-japan';
  if (/おやつ|デザート|お菓子|スイーツ/.test(t)) return 'food-sweet';
  if (/夕食|夕ごはん|晩ごはん|ディナー/.test(t)) return 'family-dinner';
  if (/離乳食|幼児食|赤ちゃん.*食/.test(t)) return 'food-japan';
  if (/野菜|果物|フルーツ/.test(t)) return 'food-fruit';
  if (/魚|肉|料理|レシピ|調理|キッチン/.test(t)) return 'food-kitchen';

  // 工作・お絵かき
  if (/工作|折り紙|お絵かき|絵を描|塗り絵|ぬりえ|シール|シール遊び|粘土|貼り絵/.test(t)) return 'kid-craft';

  // 絵本・読書
  if (/絵本|読み聞かせ|読書/.test(t)) return 'kid-learn';

  // 音楽
  if (/音楽|ピアノ|リトミック|歌|楽器|ダンス/.test(t)) return 'piano';

  // 学習・知育
  if (/知育|文字|ひらがな|数字|英語|学習|ドリル/.test(t)) return 'kid-study';

  // 室内運動
  if (/体操|ジャンプ|跳ぶ|走る|サーキット|室内運動|身体|運動遊び/.test(t)) return 'classroom';

  // お風呂
  if (/お風呂|シャワー|入浴/.test(t)) return 'bath';

  // 水遊び・夏
  if (/水遊び|プール|プール開き|ホース|びしょ濡れ/.test(t)) return 'summer-water';

  // 自然・公園
  if (/公園|外遊び|遊具|滑り台|砂場/.test(t)) return 'park';
  if (/散歩|お散歩|自然|花|植物|虫取り/.test(t)) return 'nature';

  // 季節
  if (/秋|紅葉|どんぐり|落ち葉|松ぼっくり/.test(t)) return 'autumn';
  if (/雪|冬|スキー|そり/.test(t)) return 'winter-snow';
  if (/桜|お花見|春/.test(t)) return 'sakura';

  // 寝かしつけ
  if (/夜泣き|寝かしつけ|お昼寝|睡眠|寝ない/.test(t)) return 'sleeping';

  // 医療
  if (/熱|発熱|風邪|病気|薬|アレルギー/.test(t)) return 'medical';

  // しつけ
  if (/イヤイヤ|しつけ|声かけ|叱る|きょうだい|ケンカ|喧嘩|友達/.test(t)) return 'parent-child';

  // 商品
  if (/ベビーカー|抱っこ紐|チャイルドシート|ベビー用品/.test(t)) return 'stroller';
  if (/ランキング|比較|選び方|おすすめ.*選/.test(t)) return 'commerce';

  // 室内遊び（汎用）
  if (/紙コップ|風船|積み木|ブロック|お絵かき|手遊び|室内|秘密基地|テント|お店屋さん|ごっこ遊び/.test(t)) return 'toddler-play';

  // 0-1歳系
  if (/赤ちゃん|0歳|1歳/.test(t)) return 'baby';

  // 2-6歳系
  if (/2歳|3歳|4歳|5歳|6歳/.test(t)) return 'toddler-play';

  // 親子コミュニケーション
  if (/家族|親子|ふれあい|スキンシップ/.test(t)) return 'parent-child';

  return fromSlug; // home-cozy のまま
}

/**
 * テキスト（タイトル+本文）からヒーロー画像URLを決定する。
 * plan/article のタイトル+短答を渡せば、内容に合った画像を deterministic に返す。
 */
export function pickHeroForText(text: string, seed?: string): string {
  const category = inferCategoryFromText(text);
  const pool = POOL[category];
  const seedStr = seed ?? text;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

/**
 * slug からヒーロー画像URLを決定する。
 * 同じslugは常に同じ画像を返す（deterministic）。
 */
export function pickHeroForSlug(slug: string): string {
  const category = inferCategoryFromSlug(slug);
  const pool = POOL[category];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

/** 手動で指定したカテゴリから画像を取得（agent用） */
export function pickHeroForCategory(category: PhotoCat, seed: string): string {
  const pool = POOL[category];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

export const AVAILABLE_CATEGORIES = Object.keys(POOL) as PhotoCat[];
