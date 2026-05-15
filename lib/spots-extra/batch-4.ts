import type { Spot } from '../spots';
import type { AreaSlug } from '../area';

/** スポット拡充バッチ4（近畿・中国西部）。SPOTS に name 単位でマージされる。 */
export const SPOTS_EXTRA_4: Partial<Record<AreaSlug, Spot[]>> = {
  kyoto: [
    { name: '京都水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '京都市下京区', note: '梅小路公園内の大型水族館。大水槽やイルカ展示が見やすく、館内はベビーカー移動もしやすい。', budget: 'mid' },
    { name: '京都鉄道博物館', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '京都市下京区', note: 'SLから新幹線まで実物車両がずらり。運転シミュレータやジオラマで電車好きの子が夢中になる。', budget: 'mid' },
    { name: '京都市動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市左京区', note: 'コンパクトで回りやすい歴史ある動物園。小動物とふれあえる「おとぎの国」が小さな子に人気。', budget: 'low' },
    { name: '梅小路公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市下京区', note: '水族館と鉄道博物館に隣接する広い公園。芝生広場やローラー滑り台でのびのび遊べる。', budget: 'free' },
    { name: '宝が池公園 子どもの楽園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市左京区', note: '自然豊かな大型公園内の遊具ゾーン。迷路やブランコがそろい、入園無料で一日過ごせる。', budget: 'free' },
    { name: '京都府立植物園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市左京区', note: '広大な敷地に四季の花が咲く日本初の公立植物園。どんぐりの森には遊具もあり散策が楽しい。', budget: 'low' },
    { name: 'ピュアハートキッズランド伏見桃山', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '京都市伏見区', note: '巨大ボールプールが目玉の室内遊び場。絵本やおもちゃもあり雨の日でも体を動かして遊べる。', budget: 'low' },
    { name: 'けいはんな記念公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '精華町', note: '里山の風景をテーマにした公園。棚田状の芝生広場にターザンロープなど子ども向け遊具がある。', budget: 'low' },
  ],
  osaka: [
    { name: '海遊館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市港区', note: '世界最大級の水族館でジンベエザメが目玉。カワウソやアザラシなど子ども人気の生きものも豊富。', budget: 'mid' },
    { name: '天王寺動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市天王寺区', note: '110年以上の歴史をもつ街なかの動物園。約170種の動物がいて駅からも近く立ち寄りやすい。', budget: 'low' },
    { name: '万博記念公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '太陽の塔を中心とした広大な公園。立体アスレチックや遊具が多く一日たっぷり遊べる。', budget: 'low' },
    { name: 'ATCあそびマーレ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市住之江区', note: '関西最大級の室内遊園地。ボールプールやトランポリン、サイクルカートで天候を気にせず遊べる。', budget: 'low' },
    { name: 'ピュアハートキッズランド フレスポしんかな', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '堺市', note: '約700坪の大型室内パーク。約10万個のボールプールやエアー滑り台で思いきり体を動かせる。', budget: 'low' },
    { name: 'キッズランドUS 大阪ベイタワー店', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市港区', note: '全天候型の室内遊園地。巨大ジャングルジムやふわふわドームなど家ではできない遊びが充実。', budget: 'low' },
    { name: '天保山大観覧車', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '大阪市港区', note: '高さ112mの世界最大級の観覧車。海遊館のすぐ隣にあり晴れた日の眺めが気持ちいい。', budget: 'low' },
  ],
  hyogo: [
    { name: '神戸どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '神戸市中央区', note: '花と動物のふれあいがテーマの全天候型施設。屋内エリアが多く雨の日でも安心して楽しめる。', budget: 'mid' },
    { name: '神戸市立須磨離宮公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '神戸市須磨区', note: '本格的なフィールドアスレチックと四季のバラが楽しめる公園。体を動かす遊びにぴったり。', budget: 'low' },
    { name: '神崎農村公園ヨーデルの森', category: 'farm', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '神河町', note: '約60種の動物とのふれあいや体験教室が豊富な農村公園。芝すべりやじゃぶじゃぶ池もある。', budget: 'mid' },
    { name: '東条湖おもちゃ王国', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '加東市', note: 'おもちゃがテーマの遊園地。入場料だけで遊べる屋内の「おもちゃのお部屋」が小さな子に人気。', budget: 'mid' },
    { name: 'アネビートリムパーク神戸', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '神戸市東灘区', note: '世界各国のおもちゃや遊具で遊べる室内施設。指先を使う遊びから体を動かす遊びまでそろう。', budget: 'low' },
    { name: '神戸アンパンマンこどもミュージアム&モール', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '神戸市中央区', note: 'アンパンマンのテーマパーク。入場無料のモールもあり小さな子と気軽に立ち寄れる。', budget: 'high' },
    { name: '西猪名公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '伊丹市', note: '広い水遊び広場のある公園。夏は水遊び、ほかの季節も遊具で遊べてファミリーに使いやすい。', budget: 'free' },
    { name: 'ピュアハートキッズランド尼崎つかしん', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '尼崎市', note: 'ボールプールや大型遊具がそろう室内遊び場。ドレスに着替えて撮影できるフォトスタジオも人気。', budget: 'low' },
  ],
  wakayama: [
    { name: 'アドベンチャーワールド', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '白浜町', note: 'サファリ・水族館・遊園地が一体のテーマパーク。パンダが見られイルカのライブも大迫力。', budget: 'high' },
    { name: '和歌山城', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '和歌山市', note: '広い公園に囲まれた城跡。敷地内に無料の動物園があり、のんびり散策しながら楽しめる。', budget: 'free' },
    { name: '串本海中公園', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '串本町', note: '水族館・海中展望塔・海中観光船でサンゴの海を体感。本物の海の生きものを間近に見られる。', budget: 'mid' },
    { name: 'ポルトヨーロッパ', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '和歌山市', note: '中世地中海の港街を再現したテーマパーク。遊園地ゾーンや室内遊び場があり一日遊べる。', budget: 'mid' },
    { name: '和歌山市立こども科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '和歌山市', note: '科学の仕組みを遊びながら体験できる科学館。各階でテーマが違い雨の日にも過ごしやすい。', budget: 'low' },
    { name: '和歌山県立自然博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '海南市', note: '海・山・川の生きものをわかりやすく解説する博物館。水槽展示もあり子どもの好奇心が育つ。', budget: 'low' },
    { name: '太地町立くじらの博物館', category: 'museum', place: 'mixed', ages: ['2-3', '4-6'], city: '太地町', note: 'クジラに特化した博物館。大きな全身骨格標本が並び、海の生きものの迫力を体感できる。', budget: 'mid' },
  ],
  tottori: [
    { name: '鳥取砂丘', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '鳥取市', note: '日本最大級の砂丘。柔らかい砂の上を思いきり走り回れて、転んでも安心の自然の遊び場。', budget: 'free' },
    { name: 'アイエム電子 鳥取砂丘こどもの国', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '鳥取市', note: '広い園内に大型アスレチックや水の遊び場、乗り物、工作工房がそろう自然のなかの遊び場。', budget: 'low' },
    { name: 'わらべ館', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鳥取市', note: '童謡とおもちゃのテーマパーク。高校生以下は入場無料で、雨の日でも一日楽しめる。', budget: 'low' },
    { name: 'かにっこ館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鳥取市', note: 'カニが主役の入場無料のミニ水族館。鳥取の海の魚や珍しい生きものに気軽に出会える。', budget: 'free' },
    { name: '鳥取二十世紀梨記念館 なしっこ館', category: 'museum', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '倉吉市', note: '日本で唯一の梨をテーマにした博物館。ベビーカー貸出や授乳室がそろい赤ちゃん連れも安心。', budget: 'low' },
    { name: 'とっとり花回廊', category: 'park', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '南部町', note: '大山を望む日本最大級のフラワーパーク。屋根付きの展望回廊があり天候に左右されにくい。', budget: 'low' },
    { name: '大山まきばみるくの里', category: 'farm', place: 'mixed', ages: ['2-3', '4-6'], city: '伯耆町', note: '大山のふもとの牧場レジャー施設。乳搾りや乳製品作りなど酪農体験ができ広場でも遊べる。', budget: 'low' },
    { name: '米子水鳥公園', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '米子市', note: '四季を通じて水鳥や生きものの営みを観察できる公園。望遠鏡で野鳥観察を楽しめる。', budget: 'low' },
  ],
  shimane: [
    { name: '島根県立しまね海洋館アクアス', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '浜田市', note: '中四国最大級の水族館。西日本で唯一シロイルカが見られ「幸せのバブルリング」が必見。', budget: 'mid' },
    { name: 'アクアスランド', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '浜田市', note: '水族館アクアスに隣接する大型アスレチック。大型滑り台や乳幼児向け広場、ふわふわ遊具がある。', budget: 'free' },
    { name: '松江フォーゲルパーク', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '松江市', note: '花と鳥の全天候型テーマパーク。屋根付き歩廊でつながりペンギンの散歩やバードショーも楽しめる。', budget: 'mid' },
    { name: '島根県立宍道湖自然館 ゴビウス', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '出雲市', note: '宍道湖や島根の川の生きものを集めた水族館。学びとふれあいが詰まり小さな子にもわかりやすい。', budget: 'low' },
    { name: 'あそび王国ぴぃかぁぶぅ', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '出雲市', note: 'ボールプールやトランポリンなど多彩な遊具がある室内施設。雨の日でも体を動かして遊べる。', budget: 'low' },
  ],
  okayama: [
    { name: '池田動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '岡山市北区', note: '昔から親しまれる動物園。キリンやレッサーパンダへのえさやり体験ができ園内は舗装で歩きやすい。', budget: 'low' },
    { name: '渋川動物公園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: '広い敷地で約80種の動物がのびのび暮らす。抱っこやえさやり、お散歩などふれあいが充実。', budget: 'low' },
    { name: '渋川マリン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: '瀬戸内海の生きものを中心に展示。貝やヒトデにさわれる「ふれあいタイドプール」が人気。', budget: 'low' },
    { name: 'おもちゃ王国', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: '0歳から遊べるおもちゃパビリオンが並ぶ遊園地。屋内施設が多く天候を気にせず楽しめる。', budget: 'mid' },
    { name: '倉敷科学センター', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '倉敷市', note: '中国地方最大級のプラネタリウムをもつ科学館。約100点の体験展示で遊びながら科学を学べる。', budget: 'low' },
    { name: '浦安総合公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '岡山市南区', note: '自然あふれる広大な公園。遊具と芝生広場がそろい、ピクニックがてらのびのび過ごせる。', budget: 'free' },
  ],
};
