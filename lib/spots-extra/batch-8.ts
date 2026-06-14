import type { Spot } from '../spots';
import type { AreaSlug } from '../area';

/**
 * スポット拡充バッチ8（全国カバレッジ底上げ・37都道府県 +150施設）。
 *
 * 目的: 各都道府県の掲載数を最低10施設以上にし、全国どこでも「今日どこ行く？」に
 * 答えられる状態にする。Web 調査で実在・営業中を確認した実名スポットのみ（創作なし）。
 * 既存スポットとの重複は spots.ts 側で name 完全一致により除外される。
 *
 * 方針はバッチ1〜7と同じ:
 * - 全国的に知名度が高く閉業リスクの低い大型施設/公園/科学館を中心にキュレーション
 * - 住所・電話は持たない（変更リスク回避、公式サイトで要確認の前提）
 * - note は編集部オリジナルの一言（公式サイトからのコピペ禁止）
 */
export const SPOTS_EXTRA_8: Partial<Record<AreaSlug, Spot[]>> = {
  // ===== 東北 =====
  aomori: [
    { name: '青森県立三沢航空科学館', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '三沢市', budget: 'low', note: '航空・宇宙・科学を体感できる科学館。屋外の大空ひろばには大型遊具もあり晴れでも雨でも遊べる。' },
    { name: 'ねぶたの家 ワ・ラッセ', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '青森市', budget: 'low', note: '本物の大型ねぶたを間近で見られる文化施設。お囃子やハネト体験で青森の夏を一年中味わえる。' },
    { name: 'モヤヒルズ', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '青森市', budget: 'free', note: '八甲田の麓に広がる高原リゾート。夏はチューブそりや芝生広場で体を思いきり動かせる。' },
    { name: 'カクヒログループスーパーアリーナ キッズルーム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', budget: 'low', note: '広々とした室内遊び場。天候に左右されず乳幼児から小学生までのびのび遊べる。' },
    { name: '青森県観光物産館アスパム', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '青森市', budget: 'low', note: '三角形が目印の青森の顔。展望台やパノラマ映画館で海を眺めながら郷土の魅力にふれられる。' },
  ],
  iwate: [
    { name: '盛岡市子ども科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '盛岡市', budget: 'low', note: '体験しながら科学に親しめる定番スポット。プラネタリウムや実験ショーで雨の日も一日楽しめる。' },
    { name: '龍泉洞', category: 'seasonal', place: 'mixed', ages: ['4-6'], city: '岩泉町', budget: 'low', note: '日本三大鍾乳洞のひとつ。ドラゴンブルーに輝く地底湖は神秘的で夏もひんやり探検気分。' },
    { name: '県立御所湖広域公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '盛岡市', budget: 'free', note: '御所湖のほとりに広がる大型公園。水の広場や巨大遊具で家族ゆったり過ごせる。' },
    { name: '岩手県立美術館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '盛岡市', budget: 'low', note: '萬鉄五郎や松本竣介の作品を擁する県の美術拠点。子ども向けワークショップもあり雨天向き。' },
  ],
  miyagi: [
    { name: '仙台市天文台', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '仙台市', budget: 'low', note: '東北最大級のプラネタリウムを備える天文台。星空番組や展示で宇宙への好奇心を育てる。' },
    { name: '八木山ベニーランド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '仙台市', budget: 'mid', note: '地元で愛され続ける老舗遊園地。小さな子向けの乗り物が充実、動物園のとなりでセット遊びも。' },
    { name: '海岸公園冒険広場', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '仙台市', budget: 'free', note: '土や木の素材を生かした冒険型の遊び場。火おこしや工作など五感を使う体験が無料で楽しめる。' },
    { name: '宮城蔵王キツネ村', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '蔵王町', budget: 'low', note: '放し飼いのキツネが間近で見られる人気の動物施設。子ギツネの季節は特にかわいさ満点。' },
  ],
  akita: [
    { name: '秋田県児童会館 みらいあ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '秋田市', budget: 'free', note: '入場無料の県の子ども拠点。プラネタリウムや乳幼児専用スペースもあり雨や雪の日に重宝。' },
    { name: '秋田県立博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '秋田市', budget: 'free', note: '秋田の自然と歴史を学べる入館無料の博物館。実物標本や体験コーナーで自由研究のヒントも。' },
    { name: 'なまはげ館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '男鹿市', budget: 'low', note: '迫力のなまはげが勢ぞろいする男鹿の文化施設。隣の伝承館では実演も見られ大人も見応え十分。' },
    { name: '秋田県立中央公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '秋田市', budget: 'free', note: '広大な敷地にアスレチックや芝生広場が点在。家族でサイクリングやボール遊びを満喫できる。' },
  ],
  yamagata: [
    { name: 'リナワールド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '上山市', budget: 'mid', note: '東北最大級の遊園地。サンリオの仲間に会えるアトラクションや立体迷路で小さな子も大満足。' },
    { name: '天童市子育て未来館 げんキッズ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '天童市', budget: 'free', note: '年齢別エリアと巨大滑り台がある無料の室内遊び場。赤ちゃんから小学生まで天候を気にせず遊べる。' },
    { name: '西蔵王公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '山形市', budget: 'free', note: '蔵王連峰の緑に囲まれた県内最大級の公園。森の中のユニークな遊具で自然遊びを満喫できる。' },
    { name: 'やまぎん県民ホール（やまぎんこども館）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '山形市', budget: 'low', note: '木のぬくもりあふれる屋内ひろば。小さな子が安心して遊べ、雨や雪の日のお出かけ先に人気。' },
    { name: '蔵王温泉', category: 'seasonal', place: 'outdoor', ages: ['2-3', '4-6'], city: '山形市', budget: 'mid', note: '夏は高原のロープウェイ散策やお釜見物が楽しめる山岳リゾート。家族で温泉につかってのんびり。' },
  ],
  fukushima: [
    { name: 'コミュタン福島（福島県環境創造センター交流棟）', category: 'museum', place: 'indoor', ages: ['4-6'], city: '三春町', budget: 'free', note: '環境や放射線を体験しながら学べる無料施設。全球型ドームシアターは迫力満点。' },
    { name: '郡山市ふれあい科学館 スペースパーク', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '郡山市', budget: 'low', note: 'ビルの高層階にある宇宙テーマの科学館。世界一の高さにあるプラネタリウムで満天の星に包まれる。' },
    { name: 'いわき市石炭・化石館 ほるる', category: 'museum', place: 'indoor', ages: ['4-6'], city: 'いわき市', budget: 'low', note: '巨大な恐竜やフタバスズキリュウの化石が並ぶ博物館。炭鉱の歴史も学べ化石好きが夢中になる。' },
    { name: 'リカちゃんキャッスル', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '小野町', budget: 'low', note: '国内唯一のリカちゃん人形のテーマパーク。工場見学やドレス選び体験ができお人形好きに夢の場所。' },
    { name: 'あぶくま洞', category: 'seasonal', place: 'mixed', ages: ['4-6'], city: '田村市', budget: 'low', note: '8000万年かけて生まれた巨大鍾乳洞。多彩な鍾乳石が連なる地下世界は夏でもひんやり涼しい。' },
    { name: '鶴ヶ城（会津若松城）', category: 'park', place: 'mixed', ages: ['4-6'], city: '会津若松市', budget: 'low', note: '会津のシンボルである名城。天守からの眺めや広い城址公園での散策が家族さんぽに最適。' },
    { name: 'さざえ堂', category: 'museum', place: 'indoor', ages: ['4-6'], city: '会津若松市', budget: 'low', note: '上りと下りで人がすれ違わない二重らせん構造の不思議な建物。迷路のような体験が探検心をくすぐる。' },
  ],

  // ===== 中部 =====
  niigata: [
    { name: '上越科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '上越市', budget: 'low', note: '「人間の科学」と「雪の科学」がテーマ。見て触れて確かめる9ゾーンで五感を刺激する体験型館。' },
    { name: '長岡市寺泊水族博物館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '長岡市', budget: 'low', note: '海に浮かぶ八角形の館内で約300種を展示。どの窓からも日本海を望める眺望も魅力。' },
    { name: 'こども創造センター', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '新潟市', budget: 'free', note: 'いくとぴあ食花内の入館無料施設。吹き抜けのネットやすべり台で全身を使って遊べる。' },
    { name: 'サントピアワールド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '阿賀野市', budget: 'mid', note: '田園に囲まれた約30種のアトラクションが揃う遊園地。小さな子向け乗り物も充実。' },
  ],
  toyama: [
    { name: '富山市ファミリーパーク', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '富山市', budget: 'low', note: '里山にある動物園でキリンやヤギへの餌やり体験が人気。遊園地コーナーも併設。' },
    { name: '富山県美術館 オノマトペの屋上', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '富山市', budget: 'free', note: '「ぐるぐる」など擬音語から生まれた遊具が並ぶ無料の屋上庭園。デザイン性も抜群。' },
    { name: '氷見市海浜植物園', category: 'park', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '氷見市', budget: 'low', note: 'リニューアルで一新。100m近いネット遊具やふわふわドーム、木育ルームが揃う。' },
    { name: '富山県中央植物園', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '富山市', budget: 'low', note: '日本海側初の本格植物園。約5000種が育ち、温室や池を巡りながら四季の植物に親しめる。' },
  ],
  ishikawa: [
    { name: 'あめるんパーク', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '金沢市', budget: 'free', note: '金沢城北市民運動公園内の屋内交流広場。人工芝の広場やネット遊具で雨天でも安心。' },
    { name: '石川県ふれあい昆虫館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '白山市', budget: 'low', note: '日本海側初の本格昆虫館。常夏のチョウの園で千匹が舞い、生きた虫を間近で観察できる。' },
    { name: '石川県立航空プラザ', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '小松市', budget: 'free', note: '小松空港前の入館無料の航空博物館。飛行機型大型遊具やシミュレーターで一日遊べる。' },
    { name: '健民海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '金沢市', budget: 'low', note: '金石港近くの広大な公園。夏は9つのプールが開く屋外プールが家族連れに大人気。' },
    { name: '石川県西田幾多郎記念哲学館', category: 'museum', place: 'indoor', ages: ['4-6'], city: 'かほく市', budget: 'free', note: '安藤忠雄設計の建物が印象的。高校生以下無料で、展望ラウンジから日本海を一望できる。' },
  ],
  fukui: [
    { name: 'セーレンプラネット（福井市自然史博物館分館）', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '福井市', budget: 'low', note: '福井駅徒歩1分。8Kドームシアターで星空を映し、宇宙を楽しく学べる展示室も併設。' },
    { name: '福井県立こども歴史文化館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '福井市', budget: 'free', note: '入館無料。漢字や素粒子の3D体験など、見て触れて楽しめる先人紹介の体験型ミュージアム。' },
    { name: '足羽山公園遊園地', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '福井市', budget: 'free', note: '無料のミニ動物園。屋内施設ハピジャンではカピバラやウサギと雨の日でもふれあえる。' },
    { name: '武生中央公園 だるまちゃん広場', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '越前市', budget: 'free', note: 'かこさとし監修の無料公園。絵本モチーフの大型複合遊具やふわふわ雲で思いきり遊べる。' },
    { name: '福井県立一乗谷朝倉氏遺跡博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '福井市', budget: 'low', note: '戦国城下町を復元した博物館。原寸大の町並みジオラマで歴史をリアルに体感できる。' },
    { name: 'トリムパークかなづ', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: 'あわら市', budget: 'free', note: '坂のすべり台や大型トランポリン、芝生広場が揃う無料公園。恐竜の骨格レプリカも登場。' },
  ],
  yamanashi: [
    { name: '山梨県笛吹川フルーツ公園', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '山梨市', budget: 'free', note: '夏は無料のアクアアスレチックで水遊び、雨天はわんぱくドームで遊べる眺望自慢の公園。' },
    { name: 'ハイジの村', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '北杜市', budget: 'mid', note: 'アニメの世界観を再現したテーマビレッジ。季節の花畑とアトラクションで物語に浸れる。' },
    { name: '富士すばるランド', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '富士河口湖町', budget: 'mid', note: '富士の樹海を活かした森のレジャー施設。巨大立体迷路や空中散歩で冒険気分を満喫。' },
    { name: 'ふじさんのぬく森キポキポ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '富士吉田市', budget: 'low', note: '木育がテーマの森林学習施設。木の玉プールやツリーハウスで温もりある木に包まれて遊べる。' },
    { name: '清泉寮ジャージー牧場', category: 'farm', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '北杜市', budget: 'low', note: '八ヶ岳南麓の高原施設。ジャージー牛に会え、名物ソフトクリームも味わえる。' },
  ],
  nagano: [
    { name: '滝沢牧場', category: 'farm', place: 'outdoor', ages: ['2-3', '4-6'], city: '南牧村', budget: 'mid', note: '野辺山高原の牧場で乗馬やトラクター乗車、乳搾りを体験。動物とのふれあいが盛りだくさん。' },
    { name: '八ヶ岳アルパカ牧場', category: 'farm', place: 'outdoor', ages: ['2-3', '4-6'], city: '富士見町', budget: 'low', note: '標高1000mの牧場でモフモフのアルパカと間近にふれあえる。雨天でもオープンの穴場。' },
    { name: '長野市少年科学センター', category: 'museum', place: 'indoor', ages: ['4-6'], city: '長野市', budget: 'low', note: '城山公園内の体験型科学館。見て触れて動かせる展示で科学のふしぎを楽しく学べる。' },
    { name: '軽井沢絵本の森美術館（ムーゼの森）', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '軽井沢町', budget: 'mid', note: '森に佇む絵本専門の美術館。物語の世界に浸れる展示と、散策が心地よい庭園が広がる。' },
  ],
  gifu: [
    { name: '岐阜ファミリーパーク', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '岐阜市', budget: 'free', note: '入園無料の大型公園。180mのローラーすべり台やゴーカート、ミニ遊園地で一日中遊べる。' },
    { name: '岐阜かかみがはら航空宇宙博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '各務原市', budget: 'mid', note: '日本唯一の航空宇宙専門館。実機がずらりと並び、フライト体験など参加型展示も豊富。' },
    { name: 'ひるがの高原 牧歌の里', category: 'farm', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '郡上市', budget: 'mid', note: '標高1000mの高原で花畑が広がり、動物とのふれあいや乗馬体験も楽しめる癒しの里。' },
    { name: 'ぎふワールド・ローズガーデン', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '可児市', budget: 'low', note: '世界のバラが咲き誇る花の公園。芝生広場や遊具エリアもあり花の中をのびのび散策できる。' },
  ],
  shizuoka: [
    { name: '下田海中水族館', category: 'aquarium', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '下田市', budget: 'high', note: '自然の入り江を活かした水族館。イルカに最も近づける環境でショーやふれあいが充実。' },
    { name: '御殿場高原 時之栖 水中楽園AQUARIUM', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '御殿場市', budget: 'low', note: '日本最大級の金魚水族館。幻想的な照明に泳ぐ金魚が美しく、涼しい屋内で楽しめる。' },
    { name: '浜名湖体験学習施設ウォット', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '浜松市', budget: 'low', note: '浜名湖の生き物に出会える小さな水族館。タッチプールで魚にさわれ高校生以下は無料。' },
    { name: '掛川花鳥園', category: 'zoo', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '掛川市', budget: 'mid', note: '全天候型の温室テーマパーク。フクロウやペンギン、インコと間近にふれあえ雨でも快適。' },
  ],

  // ===== 関西 =====
  mie: [
    { name: 'おやつタウン', category: 'amusement', place: 'indoor', ages: ['2-3', '4-6'], city: '津市', budget: 'mid', note: 'ベビースターの工場一体型テーマパーク。巨大アスレチックや味づくり体験が雨でも楽しめる。' },
    { name: 'そらんぽ四日市（四日市市立博物館・プラネタリウム）', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '四日市市', budget: 'low', note: '1億4千万個の星が瞬くプラネタリウムと、昔の町並みを再現した体感展示で親子で学べる。' },
    { name: 'ミキモト真珠島', category: 'museum', place: 'mixed', ages: ['4-6'], city: '鳥羽市', budget: 'mid', note: '真珠養殖発祥の島。白い磯着の海女が潜る実演は迫力満点で、海と真珠の物語に触れられる。' },
    { name: '三重県総合博物館 MieMu', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '津市', budget: 'free', note: '高校生以下無料。三重の自然と歴史の展示に加え、未就学児が遊べる体験室が嬉しい。' },
    { name: 'ラウンドワンスタジアム みえ・川越IC店', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '川越町', budget: 'mid', note: 'エアポリンやボールプール、スライダーがそろう全天候型。きょうだいで思い切り体を動かせる。' },
  ],
  shiga: [
    { name: 'ヤンマーミュージアム', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '長浜市', budget: 'low', note: '頭と体を使って楽しむチャレンジ体験ミュージアム。重機の操縦体験など働くワクワクが詰まる。' },
    { name: 'ロクハ公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '草津市', budget: 'free', note: '無料の大型遊具とじゃぶじゃぶ池が魅力。夏は流れるプールやスライダーで水遊びも楽しめる。' },
    { name: '滋賀県立陶芸の森', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '甲賀市', budget: 'free', note: '信楽焼の里にある広い芝生公園。たぬきの置物を探しながら散歩でき、陶芸鑑賞も気軽にできる。' },
    { name: '水のめぐみ館 アクア琵琶', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '大津市', budget: 'free', note: '入館無料。人工的に大雨を降らせる「雨たいけん室」が大人気で、琵琶湖と治水を遊んで学べる。' },
    { name: '彦根城', category: 'park', place: 'mixed', ages: ['4-6'], city: '彦根市', budget: 'low', note: '現存天守の国宝城。広い城址と玄宮園を散策でき、人気のひこにゃん登場も子どもに大うけ。' },
  ],
  kyoto: [
    { name: 'LOGOS LAND（ロゴスランド）', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '城陽市', budget: 'low', note: 'アウトドアブランド監修の公園。バンクーバー砦やロングローラー滑り台に子どもが大興奮。' },
    { name: '京都府立 丹波自然運動公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '京丹波町', budget: 'free', note: '45mの巨大スライダーや地下迷路など遊具が充実。夏はウォータースライダー付きプールも。' },
    { name: 'アクトパル宇治', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '宇治市', budget: 'free', note: '入園無料の野外活動センター。夏は川遊び、年間を通してアスレチックや天体観測が楽しめる。' },
  ],
  nara: [
    { name: '平城宮跡歴史公園 朱雀門ひろば', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '奈良市', budget: 'free', note: '入場無料。復原された朱雀門や遣唐使船に乗れて、広い芝生で奈良時代を体感しながら走り回れる。' },
    { name: '奈良県立民俗博物館・大和民俗公園', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '大和郡山市', budget: 'low', note: '広大な公園に江戸時代の民家を移築。昔の道具に触れ、四季の花散歩も一緒に楽しめる。' },
    { name: '橿原市立こども科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '橿原市', budget: 'low', note: '触って動かす体験展示が中心の科学館。毎日開かれる実験教室でふしぎを楽しく発見できる。' },
    { name: 'キッズランドUS 奈良香芝店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '香芝市', budget: 'mid', note: '全天候型の室内遊園地。二階建てジャングルジムやふわふわドームで雨の日も思い切り遊べる。' },
    { name: '曽爾高原', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '曽爾村', budget: 'free', note: '一面に広がるすすき草原を親子で散策。爽やかな高原の空気とお亀池の自然観察が気持ちいい。' },
    { name: '生駒山麓公園 ふれあいセンター', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '生駒市', budget: 'low', note: '山あいの自然公園でフィールドアスレチックが充実。木立の中で体を動かし森林浴も味わえる。' },
  ],
  wakayama: [
    { name: '道の駅 四季の郷公園 FOOD HUNTER PARK', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '和歌山市', budget: 'free', note: '食と農がテーマの道の駅。地形を生かした遊具やBBQ、直売所グルメで一日のんびり過ごせる。' },
    { name: '友ヶ島', category: 'park', place: 'outdoor', ages: ['4-6'], city: '和歌山市', budget: 'low', note: '加太港から船で20分の無人島。砲台跡の探検や磯遊びで、冒険気分をたっぷり味わえる。' },
    { name: '白崎海洋公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '由良町', budget: 'free', note: '真っ白な石灰岩と青い海が「日本のエーゲ海」と称される絶景。展望台や道の駅グルメも楽しい。' },
    { name: 'さぎのせ公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '岩出市', budget: 'free', note: '大型アスレチックと巨大なふわふわドームが子どもに大人気。無料で一日たっぷり遊べる公園。' },
  ],

  // ===== 中国・四国 =====
  tottori: [
    { name: '鳥取県立 むきばんだ史跡公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '米子市', budget: 'free', note: '弥生の竪穴住居が並ぶ国内最大級の遺跡。火おこしや勾玉づくり体験ができ広い芝生で駆け回れる。' },
    { name: '倉吉パークスクエア', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '倉吉市', budget: 'low', note: '図書館や子育てひろば、芝生広場が集まる複合施設。雨の日も赤ちゃん連れで一日のんびり。' },
    { name: '日南町オシドリ観察小屋', category: 'park', place: 'outdoor', ages: ['4-6'], city: '日南町', budget: 'free', note: '冬から春に数百羽のオシドリが集う水辺。望遠鏡で野鳥を探す静かな自然体験ができる穴場。' },
    { name: '道の駅 大栄 すいかの里', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '北栄町', budget: 'free', note: 'コナン作者の故郷にある道の駅。芝生広場とすいかソフトが名物で休憩がてら子連れに便利。' },
  ],
  shimane: [
    { name: '島根県立三瓶自然館サヒメル', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '大田市', budget: 'low', note: '三瓶山の自然と宇宙を学べる体験館。触って遊ぶキッズスペースや火山シアターで五感が刺激される。' },
    { name: '島根県立古代出雲歴史博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '出雲市', budget: 'low', note: '出雲大社の隣で巨大な神話の世界を体感。映像や模型が多く小さな子でも飽きずに歴史に触れられる。' },
    { name: 'モニュメントミュージアム 来待ストーン', category: 'museum', place: 'mixed', ages: ['4-6'], city: '松江市', budget: 'low', note: '来待石の彫刻体験ができる工房型ミュージアム。世界に一つの石細工づくりに親子で夢中になれる。' },
    { name: '出雲科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '出雲市', budget: 'free', note: '実験ショーや手作り体験が日替わりで楽しめる入館無料の科学館。雨の日の知的な遊び場に最適。' },
    { name: '浜山公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '出雲市', budget: 'free', note: '松林に囲まれた広大な県立公園。長いローラーすべり台や大型遊具があり一日たっぷり体を動かせる。' },
    { name: '島根県立しまね花の郷', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '出雲市', budget: 'low', note: '四季の花が咲き誇る庭園と屋内温室。芝生や軽食コーナーもあり赤ちゃん連れの散策にやさしい。' },
  ],
  okayama: [
    { name: '笠岡市立カブトガニ博物館・恐竜公園', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '笠岡市', budget: 'low', note: '世界唯一のカブトガニ博物館。実物大の恐竜が並ぶ屋外公園もあり生きた化石と太古の世界に出会える。' },
    { name: 'ヒルゼン高原センター ジョイフルパーク', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '真庭市', budget: 'high', note: '蒜山高原の大自然を望む遊園地。天空の観覧車や幼児向け乗り物がそろい高原の風の中で遊べる。' },
    { name: '岡山シティミュージアム', category: 'museum', place: 'indoor', ages: ['4-6'], city: '岡山市', budget: 'low', note: '岡山駅西口直結の歴史博物館。子ども心をくすぐる企画展が多く雨でもアクセス抜群。' },
    { name: 'つやま自然のふしぎ館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '津山市', budget: 'low', note: '世界の動物のはく製がずらりと並ぶレトロな博物館。本物の迫力に子どもの好奇心が一気に高まる。' },
    { name: '岡山県自然保護センター', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '備前市', budget: 'free', note: '里山にタンチョウが暮らす広大な保護区。湿地や雑木林を歩きながら身近な生きものを観察できる。' },
  ],
  hiroshima: [
    { name: '湯本豪一記念日本妖怪博物館 三次もののけミュージアム', category: 'museum', place: 'indoor', ages: ['4-6'], city: '三次市', budget: 'low', note: '日本初の妖怪博物館。デジタル妖怪遊園地もあり、絵を描くと妖怪が動き出し大興奮。' },
    { name: 'さとうみ科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '江田島市', budget: 'low', note: '廃校を活かした瀬戸内の海の科学館。タッチプールで海の生きものに触れられる地元密着の穴場。' },
    { name: '備北丘陵公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '庄原市', budget: 'low', note: '中国地方唯一の国営公園。ふわふわドームや水遊び場、季節の花畑が広がり一日中遊び尽くせる。' },
    { name: '広島市森林公園こんちゅう館', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '広島市', budget: 'low', note: '一年中チョウが舞う温室が名物の昆虫館。生きた虫とのふれあいで小さな探検家の心をくすぐる。' },
  ],
  yamaguchi: [
    { name: '防府市青少年科学館ソラール', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '防府市', budget: 'low', note: '西日本最大級の太陽望遠鏡を備える科学館。サイエンスショーや体験展示で遊びながら科学に親しめる。' },
    { name: 'ふくふくこども館', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '下関市', budget: 'free', note: '海をイメージした入館無料の子育て支援施設。ボールプールや大型遊具で未就学児が安心して遊べる。' },
    { name: '大平山山頂公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '防府市', budget: 'free', note: '瀬戸内を見下ろす山頂の公園。アスレチック遊具と初夏のあじさいが楽しめる眺望自慢の遊び場。' },
    { name: '山口県立山口博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '山口市', budget: 'low', note: '恐竜骨格やプラネタリウム、屋外のSL展示まで盛りだくさん。理科好きの芽を育てる老舗の総合博物館。' },
  ],
  tokushima: [
    { name: '鳴門市ドイツ館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '鳴門市', budget: 'low', note: '第九初演の地で楽器演奏やドイツ文化を体験できる館。ロボット劇など子ども向け展示も用意。' },
    { name: '鳴門ウチノ海総合公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '鳴門市', budget: 'free', note: '穏やかな内海に面した県立公園。カラフルな大型遊具と芝生広場が広がり潮風の中で遊べる。' },
    { name: '大谷焼 窯元 体験工房', category: 'museum', place: 'indoor', ages: ['4-6'], city: '鳴門市', budget: 'mid', note: '二百年続く大谷焼の里でろくろや手びねり体験。世界に一つの器づくりに親子でじっくり挑戦できる。' },
  ],
  kagawa: [
    { name: '沙弥島', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '坂出市', budget: 'free', note: '瀬戸大橋を望む海辺の景勝地。潮干狩りや磯遊びができ橋の眺めとともに海の自然を満喫できる。' },
    { name: '亀鶴公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: 'さぬき市', budget: 'free', note: '池に浮かぶ島と桜・花菖蒲が美しい憩いの公園。遊具と広場があり四季の散策が親子に人気。' },
    { name: '香川県立ミュージアム', category: 'museum', place: 'indoor', ages: ['4-6'], city: '高松市', budget: 'low', note: '高松城跡そばの歴史美術館。よろい着付けなど体験コーナーがあり遊びながら昔の暮らしを学べる。' },
    { name: '高松市こども未来館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '高松市', budget: 'low', note: 'プラネタリウムや科学体験室を備えた複合施設。雨の日も多彩な展示で一日中知的な遊びが楽しめる。' },
  ],
  ehime: [
    { name: '愛媛県総合科学博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '新居浜市', budget: 'mid', note: '世界最大級のプラネタリウムと動く恐竜ロボットが目玉。体験展示が豊富で一日たっぷり遊べる大型館。' },
    { name: 'えひめ森林公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '伊予市', budget: 'free', note: '長いローラーすべり台やアスレチックが森に広がる公園。木立の中で思いきり体を動かせる遊び場。' },
    { name: '面河山岳博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '久万高原町', budget: 'low', note: '石鎚山系の動植物や昆虫を紹介する山の博物館。渓谷散策とあわせて自然の不思議に出会える穴場。' },
    { name: '松山総合公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '松山市', budget: 'free', note: '松山城を望む丘の上の公園。長いすべり台や大型遊具、芝生広場があり眺望も気持ちいい。' },
  ],
  kochi: [
    { name: '高知みらい科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '高知市', budget: 'free', note: '図書館オーテピア内の入館無料の科学館。触れて学ぶ展示とプラネタリウムで雨の日も知的に楽しめる。' },
    { name: '高知県立牧野植物園', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '高知市', budget: 'low', note: '五台山に広がる植物学者ゆかりの庭園。三千種の植物に囲まれ高校生以下無料で散策できる癒しの空間。' },
    { name: '香美市立やなせたかし記念館 アンパンマンミュージアム', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '香美市', budget: 'mid', note: 'アンパンマン誕生の地にある記念館。原画やアンパンマンワールドに小さな子が目を輝かせる人気スポット。' },
    { name: '月見山こどもの森', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '芸西村', budget: 'free', note: '太平洋を望む丘に広がる森の公園。ローラーすべり台や木の遊具があり海風の中でのびのび遊べる。' },
  ],

  // ===== 九州・沖縄 =====
  fukuoka: [
    { name: '福岡アンパンマンこどもミュージアムinモール', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', budget: 'mid', note: '中洲川端駅直結。ガラス屋根の館内でショーやふれあいを毎日開催、雨でも安心の屋内型。' },
    { name: '大牟田市動物園', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '大牟田市', budget: 'low', note: '「動物福祉を伝える動物園」を掲げ、動物が自然な行動を見せる工夫が随所にある小さな名園。' },
    { name: '諏訪公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '大牟田市', budget: 'free', note: '市内最大の総合公園。リニューアルしたローラー滑り台やアスレチック、せせらぎで一日中遊べる。' },
    { name: 'モーリーファンタジー イオンモール大牟田', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大牟田市', budget: 'low', note: '12歳以下向けの屋内遊園地。雨でも体を動かせるネット遊具やゲームが揃い買い物ついでに寄れる。' },
  ],
  saga: [
    { name: '森とリスの遊園地 メルヘン村', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '武雄市', budget: 'mid', note: '0歳から遊べる遊園地・アスレチック・動物園の複合施設。日本一大きなリスの巨大滑り台が名物。' },
    { name: 'メリッタKid\'s TAKEO', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '武雄市', budget: 'low', note: '武雄温泉エリアの大型室内キッズパーク。小さな子も広々スペースで安心して走り回れる。' },
    { name: '道の駅うれしの まるく', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '嬉野市', budget: 'free', note: '嬉野温泉駅前の観光交流施設。手湯足湯や公園が併設され、温泉旅の合間に立ち寄れる。' },
  ],
  nagasaki: [
    { name: '諫早市こどもの城', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '諫早市', budget: 'free', note: '0歳から年齢制限なく無料で使える学びと遊びの施設。雨の日も安心して長く過ごせる。' },
    { name: '長崎県立総合運動公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '諫早市', budget: 'free', note: '18種の遊具がある「ちびっこ広場」が人気。夏はわいわいプールも開き家族で一日遊べる。' },
    { name: 'のぞみ公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '諫早市', budget: 'free', note: '広い芝生広場と大型複合遊具、ローラースケート場まで揃う開放的な公園。' },
    { name: 'プラザ大村 地域子育て支援センター', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '大村市', budget: 'free', note: '市民交流プラザ内の屋内ひろば。未就学児は無料で、雨の日の乳幼児連れに重宝する。' },
  ],
  kumamoto: [
    { name: 'ユウベルキッズランド熊本店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '熊本市', budget: 'low', note: '大型遊具・ボルダリング・ボールプールが揃う屋内施設。天候を気にせず体を動かせる。' },
    { name: 'キッズユーエスランド 熊本八代店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '八代市', budget: 'low', note: '巨大ボールプールやトランポリン、ゲームまで時間制で遊び放題の全天候型パーク。' },
    { name: '竜北公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '氷川町', budget: 'free', note: '年中無休・無料で開く広々公園。遊具で遊んだあとは芝生でゆっくりピクニックも。' },
    { name: '福連木子守唄公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '天草市', budget: 'free', note: '天草の山あいにある無料の公園。自然に囲まれ、遊具とローラー滑り台でのびのび遊べる。' },
    { name: '阿蘇 元気の森', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '阿蘇市', budget: 'low', note: '阿蘇の大自然を背景にアウトドア体験ができるレジャー施設。広い空の下で思い切り遊べる。' },
  ],
  oita: [
    { name: '大貞公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '中津市', budget: 'free', note: '県内最大級の大型遊具がそろう公園。広い敷地で複合遊具を存分に楽しめる。' },
    { name: 'キッズランドUS 大分由布挾間店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '由布市', budget: 'low', note: '0歳から遊べる全天候型の室内遊園地。無料駐車場が広く車での家族連れに優しい。' },
    { name: '別府こどもあそびめぐり', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '別府市', budget: 'low', note: 'トキハ別府店内の屋内遊び場。別府名物の地獄めぐりをモチーフにした楽しい空間。' },
  ],
  miyazaki: [
    { name: '夢見が丘キッズパーク', category: 'indoor', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '都城市', budget: 'low', note: 'ふわふわ遊具やトランポリン、ロープコースが屋根付き。雨でも親子で思い切り動ける。' },
    { name: 'こどもーる', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '延岡市', budget: 'low', note: '延岡の室内公園。安全な環境で乳幼児が走り回れ、大人もくつろげる屋内空間。' },
    { name: '観音池公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '都城市', budget: 'free', note: '63haの広大な総合公園。池を囲む自然のなかで遊具やローラー滑り台を楽しめる。' },
    { name: 'ヘルストピア延岡', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '延岡市', budget: 'mid', note: 'プール遊びと温泉が一度に楽しめる施設。夏は水遊び、冬も一日のんびり過ごせる。' },
    { name: 'キッズバウンス', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '宮崎市', budget: 'low', note: '0〜6歳専用の宮崎市の室内遊び場。小さな子だけの安心空間でのびのび遊べる。' },
  ],
  kagoshima: [
    { name: '鹿児島県立大隅広域公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '鹿屋市', budget: 'free', note: '実寸大の恐竜遊具が並ぶ「冒険の谷」が名物。ゴーカートや噴水広場まである無料の大公園。' },
    { name: 'リトルプラネット イオンモールKAGOSHIMA BAY', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '鹿児島市', budget: 'mid', note: 'AR砂遊びやデジタルボールプールなど最新技術と遊びが融合した屋内デジタルパーク。' },
    { name: '霧島市こども館 すかいぴあ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '霧島市', budget: 'low', note: '親子がふれあい子育て世代が交流できる屋内施設。雨の日も安心して過ごせる。' },
    { name: '鹿児島ふれあいスポーツランド', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '鹿児島市', budget: 'low', note: '小さな滑り台付きの屋内プールほかスポーツ設備が充実。一日体を動かせる。' },
    { name: '谷山第二中央公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '鹿児島市', budget: 'free', note: '谷山駅近くの公園。遊具で遊んだあとは買い物にも寄りやすい便利な立地。' },
    { name: '知育玩具広場 そだて宇宿店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '鹿児島市', budget: 'low', note: '鹿児島市宇宿の屋内遊び場。知育玩具がそろい、小さな子と落ち着いて過ごせる。' },
  ],
  okinawa: [
    { name: '海軍壕公園（ガジュマルラビリンス）', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '豊見城市', budget: 'free', note: 'ガジュマルをイメージした巨大複合遊具と35mローラー滑り台が登場した人気公園。' },
    { name: 'ちきゅうのにわ イオンモール沖縄ライカム店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '北中城村', budget: 'mid', note: '火山・海・森など自然がテーマの屋内パーク。遊びながら地球の面白さを学べる。' },
    { name: '釣って見つける ぼうけんの国 沖縄', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: 'うるま市', budget: 'low', note: '釣り体験ができる屋内アトラクション施設。天候に関係なく親子でわくわく楽しめる。' },
    { name: 'あそびパーク イオン具志川店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: 'うるま市', budget: 'low', note: '砂遊びや大型遊具が揃う全天候型の屋内遊び場。買い物ついでに立ち寄れて便利。' },
  ],
};
