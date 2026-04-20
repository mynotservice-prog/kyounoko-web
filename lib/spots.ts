/**
 * 47都道府県の子連れおすすめスポットデータ。
 *
 * 方針:
 * - 全国的に知名度の高い、閉業リスクの低い大型施設/公園を中心にキュレーション
 * - 各スポットに年齢適性・屋内/屋外・ざっくりカテゴリを付与
 * - Plan/記事ページで area が絞られているときに具体的な場所を提示する用途
 * - いこーよ等の情報サイトを参考に、「2026年時点で営業していると思われる」代表的な場所に絞る
 * - 住所・電話番号は意図的に持たない（変更リスクがあるため）。
 *   ユーザーは公式サイトで必ず最新情報を確認する前提。
 */

import type { AreaSlug } from './area';

export type SpotCategory =
  | 'zoo'          // 動物園
  | 'aquarium'     // 水族館
  | 'park'         // 公園・大型緑地
  | 'museum'       // 博物館・科学館
  | 'amusement'    // 遊園地・テーマパーク
  | 'indoor'       // 屋内遊戯施設（雨の日）
  | 'farm'         // 牧場
  | 'seasonal';    // 季節体験（いちご狩り等）

export type SpotPlace = 'indoor' | 'outdoor' | 'mixed';

export type AgeTag = '0-1' | '2-3' | '4-6';

export type Spot = {
  name: string;
  category: SpotCategory;
  place: SpotPlace;      // 屋内なら雨天OK
  ages: AgeTag[];        // 特に楽しめる年齢層
  city?: string;         // 市区町村（ざっくり）
  note?: string;         // 一言メモ（30-50文字）
  budget?: 'free' | 'low' | 'mid' | 'high';  // 入園料目安
  // ---- Instagram人気アカウントから学んだ情報密度UP項目 ----
  pricing?: {
    adult?: string;      // '2,300円'
    elementary?: string; // '1,100円'
    preschool?: string;  // '400円（3歳以上）'
    infant?: string;     // '無料（3歳未満）'
  };
  reservation?: 'required' | 'recommended' | 'none';  // 予約制の有無
  crowdLevel?: {
    weekday?: 'low' | 'mid' | 'high';
    holiday?: 'low' | 'mid' | 'high';
  };
  hiddenTip?: string;    // 穴場ポイント「予約制で混雑回避」「平日午前が狙い目」等
  nearby?: string;       // 近隣セット提案「徒歩10分の海の中道海浜公園と1日セット」等
};

/** 47都道府県分のスポットマップ。不足県は一般的な推奨のみ。 */
export const SPOTS: Partial<Record<AreaSlug, Spot[]>> = {
  // ===== 北海道・東北 =====
  hokkaido: [
    { name: '旭山動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '旭川市', note: '行動展示で動物の動きが間近、雪の中のペンギン散歩も有名', budget: 'low' },
    { name: '札幌市円山動物園', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '札幌市', note: '屋内展示も多く悪天候でも遊べる', budget: 'low' },
    { name: 'のぼりべつクマ牧場', category: 'zoo', place: 'outdoor', ages: ['4-6'], city: '登別市', note: 'ロープウェイで山頂へ、ヒグマに餌やり体験', budget: 'mid' },
    { name: 'サンピアザ水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '札幌市', note: '駅直結、コンパクトで小さい子も疲れない', budget: 'low' },
    { name: '北海道こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '砂川市', note: '世界の七不思議を再現した遊具群', budget: 'free' },
  ],
  aomori: [
    { name: '浅虫水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', note: 'イルカショーとトンネル水槽', budget: 'low' },
    { name: '青森県営浅虫水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '青森市', note: '本州最北の水族館', budget: 'low' },
  ],
  iwate: [
    { name: '盛岡市動物公園 ZOOMO', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '盛岡市', note: '自然豊かでゾウ・キリンも', budget: 'low' },
    { name: '岩手県立児童館 いわて子どもの森', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '一戸町', note: '雨の日・冬の屋内遊び場の定番', budget: 'free' },
  ],
  miyagi: [
    { name: '仙台うみの杜水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '仙台市', note: 'イルカのダイナミックショーと三陸の海水槽', budget: 'mid' },
    { name: '八木山動物公園 フジサキの杜', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '仙台市', note: '地下鉄でアクセス良好、アフリカ園が人気', budget: 'low' },
    { name: '仙台アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '仙台市', note: '0〜3歳に最適、雨天OK', budget: 'mid' },
    { name: 'スリーエム仙台市科学館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '仙台市', note: '体験型展示で4歳以上が楽しめる', budget: 'low' },
  ],
  akita: [
    { name: '秋田市大森山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '秋田市', note: 'ゾウ・キリンに近づける設計', budget: 'low' },
    { name: '男鹿水族館 GAO', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '男鹿市', note: '日本海の大水槽、シロクマも', budget: 'mid' },
  ],
  yamagata: [
    { name: '加茂水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鶴岡市', note: 'クラゲ展示数世界一、幻想的で静か', budget: 'low' },
  ],
  fukushima: [
    { name: 'アクアマリンふくしま', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: 'いわき市', note: '海底トンネルと体験型展示が充実', budget: 'mid' },
    { name: 'スパリゾートハワイアンズ', category: 'amusement', place: 'indoor', ages: ['2-3', '4-6'], city: 'いわき市', note: '年中温水プール、雨天・冬もOK', budget: 'high' },
  ],

  // ===== 関東 =====
  ibaraki: [
    { name: 'アクアワールド茨城県大洗水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大洗町', note: 'サメ展示種数日本一、マンボウも', budget: 'mid' },
    { name: '国営ひたち海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: 'ひたちなか市', note: 'ネモフィラ・コキアの絶景、遊具も充実', budget: 'low' },
  ],
  tochigi: [
    { name: '那須どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '那須町', note: '室内外で動物と触れ合える、雨天も楽しい', budget: 'mid' },
    { name: '那須ハイランドパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '那須町', note: '小さい子向けアトラクションも多い', budget: 'high' },
    { name: '宇都宮動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宇都宮市', note: '遊園地併設、動物との距離が近い', budget: 'low' },
  ],
  gunma: [
    { name: '群馬サファリパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '富岡市', note: '車から動物に餌やりできる', budget: 'mid' },
    { name: 'ぐんまこどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '太田市', note: '大型遊具と体験施設、入園無料', budget: 'free' },
  ],
  saitama: [
    { name: '東武動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮代町', note: '動物園＋遊園地のハイブリッド', budget: 'mid' },
    { name: '鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: 'さいたま市', note: '実車展示と運転シミュレータ、雨天OK', budget: 'mid' },
    { name: 'トーベ・ヤンソンあけぼの子どもの森公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: 'ムーミン童話の世界観を再現した無料公園', budget: 'free' },
    { name: 'ムーミンバレーパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: '湖畔のテーマパーク、散策も楽しい', budget: 'mid' },
  ],
  chiba: [
    { name: '鴨川シーワールド', category: 'aquarium', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '鴨川市', note: 'シャチのショーが圧巻、海岸併設', budget: 'high' },
    { name: 'マザー牧場', category: 'farm', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '富津市', note: '動物と触れ合い＋収穫体験＋ミニ遊園地', budget: 'mid' },
    { name: 'ふなばしアンデルセン公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '船橋市', note: '大型遊具とアスレチック、一日遊べる', budget: 'low' },
    { name: 'キッザニア東京（※千葉寄り）', category: 'indoor', place: 'indoor', ages: ['4-6'], city: '江東区', note: '職業体験の定番、雨天OK（※東京都内）', budget: 'high' },
  ],
  tokyo: [
    {
      name: '上野動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '台東区', note: 'ジャイアントパンダに会える、駅近', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '平日10時開園直後が狙い目。パンダ舎は整理券配布制のため公式サイトで当日の運用を確認',
      nearby: '上野公園の噴水広場・国立科学博物館と組み合わせて1日コース',
    },
    {
      name: '多摩動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '日野市', note: '広大で歩きがい、ライオンバスが名物', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ベビーカー貸出あり。園内は坂が多いため抱っこ紐併用推奨',
    },
    {
      name: '葛西臨海水族園', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '江戸川区', note: 'マグロの群泳大水槽、広い公園に併設', budget: 'low',
      pricing: { adult: '700円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '雨の日の平日は空いていてのんびり回れる。ペンギン舎の裏側が穴場',
      nearby: '葛西臨海公園の芝生広場（無料）でピクニックとセット',
    },
    {
      name: 'サンシャイン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '豊島区', note: '屋上「天空のペンギン」が人気、池袋直結', budget: 'mid',
      pricing: { adult: '2,600〜2,800円', elementary: '1,300〜1,400円', preschool: '800〜900円（4歳〜）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '公式サイトで日時指定券が購入可能、休日は予約必須レベル',
      nearby: '同ビル内のプラネタリウム・ショッピングモールで雨天1日コース',
    },
    {
      name: 'キッザニア東京', category: 'indoor', place: 'indoor', ages: ['4-6'], city: '江東区', note: '100種以上の職業体験、人気で予約推奨', budget: 'high',
      pricing: { adult: '2,000〜3,500円', elementary: '4,500〜7,000円', preschool: '4,500〜7,000円', infant: '無料（2歳以下）' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '公式予約サイトで3ヶ月前から受付、平日第2部（16-21時）が比較的取りやすい',
    },
    {
      name: '井の頭恩賜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '武蔵野市', note: '池のボート・動物園・散策、無料で過ごせる', budget: 'free',
      pricing: { adult: '無料（公園入場）', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '桜シーズンは朝7-9時が狙い目。ボート（別料金700〜800円/30分）は休日混雑',
      nearby: '吉祥寺駅徒歩5分、ランチは駅前のアトレでベビーカーOKの店多数',
    },
    {
      name: '国立科学博物館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '台東区', note: '恐竜化石と日本の自然史、雨天の鉄板', budget: 'low',
      pricing: { adult: '630円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '特別展開催中は混雑、常設展目当てなら比較的空いている。ベビーカーOK',
    },
    {
      name: 'アネビートリムパーク（ららぽーと各所等）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '複数', note: 'ヨーロッパ遊具の屋内パーク、0-3歳に最適', budget: 'mid',
      pricing: { adult: '600円（保護者）', preschool: '1,200円（平日フリーパス）', infant: '600円（6ヶ月〜）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '雨の日の休日は整理券配布で入場制限、平日午前がベスト',
    },
  ],
  kanagawa: [
    { name: '横浜・八景島シーパラダイス', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '横浜市', note: '水族館＋遊園地＋海、1日コース', budget: 'high' },
    { name: 'よこはま動物園ズーラシア', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '横浜市', note: '世界の気候帯別展示、広大', budget: 'low' },
    { name: '横浜アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '横浜市', note: 'みなとみらい直結、0-3歳の定番', budget: 'mid' },
    { name: '新江ノ島水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '藤沢市', note: '相模湾大水槽とクラゲ展示', budget: 'mid' },
    { name: '箱根彫刻の森美術館', category: 'museum', place: 'outdoor', ages: ['2-3', '4-6'], city: '箱根町', note: '野外彫刻＋子ども向けアート遊具', budget: 'mid' },
  ],

  // ===== 中部 =====
  niigata: [
    { name: '新潟県立自然科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '新潟市', note: '恐竜ロボット・プラネタリウム', budget: 'low' },
    { name: 'マリンピア日本海', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '新潟市', note: '日本海側最大級、イルカショー', budget: 'low' },
  ],
  toyama: [
    { name: '魚津水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '魚津市', note: '富山湾の深海魚展示', budget: 'low' },
    { name: 'ミラージュランド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '魚津市', note: '小規模で0-6歳に丁度良い遊園地', budget: 'low' },
  ],
  ishikawa: [
    { name: 'のとじま水族館', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '七尾市', note: 'ジンベエザメ展示、能登半島の景色も', budget: 'mid' },
    { name: '石川県立自然史資料館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '金沢市', note: '化石・動植物標本', budget: 'free' },
  ],
  fukui: [
    { name: '福井県立恐竜博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '勝山市', note: '国内最大級の恐竜展示、子どもに大人気', budget: 'low' },
    { name: '越前松島水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '坂井市', note: 'イルカにタッチできる', budget: 'mid' },
  ],
  yamanashi: [
    { name: '富士急ハイランド', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '富士吉田市', note: 'トーマスランドは0-6歳向け', budget: 'high' },
    { name: '山梨県立富士湧水の里水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '忍野村', note: '淡水魚の水族館、入館料安い', budget: 'low' },
  ],
  nagano: [
    { name: '茶臼山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '長野市', note: 'レッサーパンダ発祥の動物園', budget: 'low' },
    { name: '軽井沢おもちゃ王国', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '嬬恋村※隣県寄り', note: '室内プレイスペースとミニ遊園地', budget: 'mid' },
  ],
  gifu: [
    { name: '世界淡水魚園水族館 アクア・トトぎふ', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '各務原市', note: '世界最大級の淡水魚水族館', budget: 'mid' },
    { name: '各務原市民公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '各務原市', note: 'アクア・トトに隣接、併せて1日', budget: 'free' },
  ],
  shizuoka: [
    { name: '富士サファリパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '裾野市', note: '車から動物観察＋ふれあい', budget: 'mid' },
    { name: '伊豆アニマルキングダム', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '東伊豆町', note: 'ホワイトタイガーに大接近、遊具もあり', budget: 'mid' },
    { name: '東海大学海洋科学博物館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '静岡市', note: '機械の博物館併設', budget: 'low' },
    { name: 'ぐりんぱ（富士山2合目）', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '裾野市', note: 'シルバニアビレッジ等、小さい子向け', budget: 'mid' },
  ],
  aichi: [
    { name: 'レゴランド・ジャパン', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '名古屋市', note: '2-12歳ターゲット、駅直結', budget: 'high' },
    { name: '名古屋港水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'シャチとベルーガ、屋内広い', budget: 'mid' },
    { name: '東山動植物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'コアラ・イケメンゴリラ、遊園地併設', budget: 'low' },
    { name: 'モリコロパーク', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '長久手市', note: '愛・地球博記念公園、広大で無料', budget: 'free' },
    { name: 'ジブリパーク', category: 'amusement', place: 'mixed', ages: ['4-6'], city: '長久手市', note: 'モリコロパーク内、予約制', budget: 'mid' },
  ],

  // ===== 関西 =====
  mie: [
    { name: '鳥羽水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鳥羽市', note: '飼育種類数日本一、ジュゴン展示', budget: 'mid' },
    { name: '志摩スペイン村', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '志摩市', note: 'スペイン村パルケエスパーニャ', budget: 'high' },
  ],
  shiga: [
    { name: '琵琶湖博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '草津市', note: '淡水魚展示と琵琶湖の歴史、広い', budget: 'low' },
    { name: 'ブルーメの丘', category: 'farm', place: 'outdoor', ages: ['2-3', '4-6'], city: '日野町', note: '動物ふれあい＋収穫体験＋遊具', budget: 'low' },
  ],
  kyoto: [
    { name: '京都水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: 'オオサンショウウオ、梅小路公園直結', budget: 'mid' },
    { name: '京都市動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '岡崎エリア、平安神宮や美術館も近い', budget: 'low' },
    { name: '梅小路公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '水族館＋鉄道博物館のハブ、芝生広場', budget: 'free' },
    { name: '京都鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '京都市', note: 'SL展示と運転シミュレータ', budget: 'mid' },
  ],
  osaka: [
    { name: '海遊館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市', note: 'ジンベエザメの大水槽、世界最大級', budget: 'mid' },
    { name: 'ニフレル', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '「生きるミュージアム」、動物と間近', budget: 'mid' },
    { name: 'キッズプラザ大阪', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '大阪市', note: '体験型のこども博物館、雨天OK', budget: 'low' },
    { name: '天王寺動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大阪市', note: '都心の動物園、駅近', budget: 'low' },
    { name: 'ひらかたパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '枚方市', note: '0-3歳向けエリアもある老舗遊園地', budget: 'mid' },
    { name: '万博記念公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '太陽の塔と広大な自然文化園', budget: 'low' },
  ],
  hyogo: [
    { name: '神戸どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '神戸市', note: '全天候型、動物と距離が近い', budget: 'mid' },
    { name: '姫路セントラルパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '姫路市', note: 'サファリ＋遊園地＋プール', budget: 'mid' },
    { name: '須磨海浜水族園（スマスイ新）', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '神戸市', note: '2024年リニューアルの水族館', budget: 'mid' },
    { name: 'ニジゲンノモリ（淡路島）', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '淡路市', note: 'クレヨンしんちゃんアドベンチャーパーク等', budget: 'mid' },
  ],
  nara: [
    { name: '奈良公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '奈良市', note: '鹿と触れ合える、東大寺と一緒に', budget: 'free' },
    { name: '生駒山上遊園地', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '生駒市', note: '小さい子向けレトロ遊園地', budget: 'low' },
  ],
  wakayama: [
    { name: 'アドベンチャーワールド', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '白浜町', note: 'パンダ・サファリ・遊園地の複合型', budget: 'high' },
    { name: '和歌山県立自然博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '海南市', note: '大水槽と化石展示', budget: 'low' },
  ],

  // ===== 中国・四国 =====
  tottori: [
    { name: '鳥取砂丘', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '鳥取市', note: '砂遊びの究極形、らくだ体験も', budget: 'free' },
    { name: '鳥取砂丘こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '鳥取市', note: 'アスレチックと体験工房', budget: 'low' },
  ],
  shimane: [
    { name: '島根県立しまね海洋館アクアス', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '浜田市', note: 'シロイルカのバブルリングが名物', budget: 'low' },
  ],
  okayama: [
    { name: 'おもちゃ王国（岡山）', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: 'おもちゃの部屋が多数、0-6歳に最適', budget: 'mid' },
    { name: '渋川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '玉野市', note: '動物にエサやり、リーズナブル', budget: 'low' },
  ],
  hiroshima: [
    { name: '安佐動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '広島市', note: '起伏ある園内、キリン舎が見どころ', budget: 'low' },
    { name: 'みろくの里', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '福山市', note: '昭和レトロなミニ遊園地', budget: 'mid' },
    { name: '広島市こども文化科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '広島市', note: 'プラネタリウムと体験展示、入館無料', budget: 'free' },
  ],
  yamaguchi: [
    { name: '秋吉台サファリランド', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '美祢市', note: 'マイカーサファリと遊園地', budget: 'mid' },
    { name: '下関市立しものせき水族館 海響館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '下関市', note: 'フグ展示種類世界一', budget: 'mid' },
  ],
  tokushima: [
    { name: '徳島県立あすたむらんど', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '板野町', note: '科学館と大型遊具、無料エリアあり', budget: 'free' },
  ],
  kagawa: [
    { name: 'NEWレオマワールド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '丸亀市', note: '0-6歳向けアトラクション充実', budget: 'mid' },
    { name: '四国水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '宇多津町', note: '2020年開業、瀬戸内海の生き物', budget: 'mid' },
  ],
  ehime: [
    { name: 'とべ動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '砥部町', note: '西日本有数の動物園、ホッキョクグマ', budget: 'low' },
  ],
  kochi: [
    { name: 'のいち動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '香南市', note: '展示のクオリティ高さで評価高い', budget: 'low' },
    { name: '桂浜水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '高知市', note: '小規模だが見せ方が独創的', budget: 'low' },
  ],

  // ===== 九州・沖縄 =====
  fukuoka: [
    { name: 'マリンワールド海の中道', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: 'イルカ・アシカショーとパノラマ水槽', budget: 'mid' },
    { name: '海の中道海浜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: '動物の森＋大型遊具＋花、1日遊べる', budget: 'low' },
    { name: '福岡市動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '福岡市', note: 'リニューアル後の植物園併設', budget: 'low' },
    { name: 'ボーネルンドあそびのせかい（ららぽーと等）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '複数', note: '屋内遊び場、雨天の救世主', budget: 'mid' },
  ],
  saga: [
    { name: '佐賀県立宇宙科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '武雄市', note: 'プラネタリウムと体験展示', budget: 'low' },
  ],
  nagasaki: [
    { name: 'ハウステンボス', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '佐世保市', note: 'ヨーロッパ風テーマパーク、1日コース', budget: 'high' },
    { name: '長崎バイオパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '西海市', note: 'カバや鹿に直接触れられる', budget: 'mid' },
    { name: '長崎ペンギン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '長崎市', note: 'ペンギン種類数日本一', budget: 'low' },
  ],
  kumamoto: [
    { name: '熊本市動植物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '熊本市', note: '動物園＋植物園＋遊園地の複合', budget: 'low' },
    { name: '阿蘇カドリー・ドミニオン', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '阿蘇市', note: 'クマ牧場とミニブタショー', budget: 'mid' },
  ],
  oita: [
    { name: 'うみたまご', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大分市', note: 'セイウチショーとタッチプール', budget: 'mid' },
    { name: '高崎山自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大分市', note: '野生の猿の群れが来る、うみたまご隣接', budget: 'low' },
    { name: 'ハーモニーランド', category: 'amusement', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '日出町', note: 'サンリオの屋外テーマパーク', budget: 'mid' },
  ],
  miyazaki: [
    { name: '宮崎市フェニックス自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮崎市', note: '遊園地併設、フラミンゴショー', budget: 'low' },
  ],
  kagoshima: [
    { name: 'いおワールドかごしま水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鹿児島市', note: 'ジンベエザメ展示、桜島も望める', budget: 'mid' },
    { name: '平川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '鹿児島市', note: 'コアラ舎と遊園地併設', budget: 'low' },
  ],
  okinawa: [
    { name: '沖縄美ら海水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '本部町', note: 'ジンベエザメとマンタの大水槽', budget: 'mid' },
    { name: '沖縄こどもの国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '沖縄市', note: '動物園＋こどもの遊具、リーズナブル', budget: 'low' },
    { name: 'ネオパークオキナワ', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '名護市', note: '鳥類メイン、放し飼いで近い', budget: 'low' },
    { name: 'DMMかりゆし水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '豊見城市', note: '2020年開業、プロジェクションマッピング演出', budget: 'mid' },
  ],
};

/**
 * エリアに紐づくスポット一覧を取得。
 * 未登録の都道府県は空配列を返す。
 */
export function getSpotsForArea(area: string | undefined): Spot[] {
  if (!area || area === 'all') return [];
  return SPOTS[area as AreaSlug] ?? [];
}

/**
 * 条件フィルタでスポットを絞り込む。
 *
 * @param area 都道府県 slug
 * @param opts 絞り込み条件
 */
export function filterSpots(
  area: string | undefined,
  opts: {
    age?: AgeTag;
    place?: 'indoor' | 'outdoor';
    budget?: 'free' | 'low' | 'mid' | 'high';
    limit?: number;
  } = {}
): Spot[] {
  let list = getSpotsForArea(area);
  if (opts.age) list = list.filter((s) => s.ages.includes(opts.age!));
  if (opts.place === 'indoor') list = list.filter((s) => s.place === 'indoor' || s.place === 'mixed');
  if (opts.place === 'outdoor') list = list.filter((s) => s.place === 'outdoor' || s.place === 'mixed');
  if (opts.budget) {
    const order = { free: 0, low: 1, mid: 2, high: 3 };
    const cap = order[opts.budget];
    list = list.filter((s) => (s.budget ? order[s.budget] <= cap : true));
  }
  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

/** スポットカテゴリを日本語ラベルに変換 */
export const SPOT_CATEGORY_LABEL: Record<SpotCategory, string> = {
  zoo: '動物園',
  aquarium: '水族館',
  park: '公園',
  museum: '博物館・科学館',
  amusement: '遊園地',
  indoor: '屋内施設',
  farm: '牧場',
  seasonal: '季節体験',
};
