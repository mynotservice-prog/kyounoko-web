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
  popular?: boolean;     // エディターが「ママに人気」として推すスポット（トップページ表示用）
};

/** 47都道府県分のスポットマップ。不足県は一般的な推奨のみ。 */
export const SPOTS: Partial<Record<AreaSlug, Spot[]>> = {
  // ===== 北海道・東北 =====
  hokkaido: [
    {
      name: '旭山動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '旭川市', note: '行動展示で動物の動きが間近、雪の中のペンギン散歩も有名', budget: 'low',
      pricing: { adult: '1,000円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '冬季（12-3月）限定のペンギン散歩は11時・14時半頃、開始30分前に場所取り推奨',
      popular: true,
    },
    {
      name: '札幌市円山動物園', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '札幌市', note: '屋内展示も多く悪天候でも遊べる', budget: 'low',
      pricing: { adult: '800円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内展示多く冬・雨の日でも楽しめる。円山公園（桜の名所）と徒歩5分',
    },
    {
      name: 'のぼりべつクマ牧場', category: 'zoo', place: 'outdoor', ages: ['4-6'], city: '登別市', note: 'ロープウェイで山頂へ、ヒグマに餌やり体験', budget: 'mid',
      pricing: { adult: '3,000円（ロープウェイ込）', elementary: '1,500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '登別温泉と組み合わせて1泊コース。天気悪いとロープウェイ運休の可能性あり、事前確認を',
    },
    {
      name: 'サンピアザ水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '札幌市', note: '駅直結、コンパクトで小さい子も疲れない', budget: 'low',
      pricing: { adult: '1,000円', elementary: '400円', preschool: '200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '新さっぽろ駅直結、1時間で回れる手頃なサイズ。小さい子連れで疲れない',
    },
    {
      name: '北海道こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '砂川市', note: '世界の七不思議を再現した遊具群', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、有料遊具（乗り物各100-200円）のみ任意。砂川ハイウェイオアシス隣接',
    },
  ],
  aomori: [
    {
      name: '浅虫水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '青森市', note: 'イルカショーとトンネル水槽', budget: 'low',
      pricing: { adult: '1,030円', elementary: '510円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '本州最北の水族館、イルカパフォーマンスは1日3回。青森駅から青い森鉄道で20分',
    },
  ],
  iwate: [
    {
      name: '盛岡市動物公園 ZOOMO', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '盛岡市', note: '自然豊かでゾウ・キリンも', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '2023年リニューアルで体験型に進化、盛岡駅からバス35分',
    },
    {
      name: '岩手県立児童館 いわて子どもの森', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '一戸町', note: '雨の日・冬の屋内遊び場の定番', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入館完全無料、大型屋内遊具とアスレチック、雪国の冬に最適',
    },
  ],
  miyagi: [
    {
      name: '仙台うみの杜水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '仙台市', note: 'イルカのダイナミックショーと三陸の海水槽', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,200円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'JR中野栄駅から徒歩15分、シャトルバスあり。イルカパフォーマンスは1日4-5回',
    },
    {
      name: '八木山動物公園 フジサキの杜', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '仙台市', note: '地下鉄でアクセス良好、アフリカ園が人気', budget: 'low',
      pricing: { adult: '480円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '地下鉄東西線八木山動物公園駅直結、駅からスムーズ。園内は坂多めベビーカー必須',
    },
    {
      name: '仙台アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '仙台市', note: '0〜3歳に最適、雨天OK', budget: 'mid',
      pricing: { adult: '2,000〜2,400円', elementary: '2,000〜2,400円', preschool: '2,000〜2,400円（1歳以上全員）', infant: '無料（1歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定入館券制、休日は事前購入必須。1階のショッピングモール部分は無料で入れる',
    },
    {
      name: 'スリーエム仙台市科学館', category: 'museum', place: 'indoor', ages: ['4-6'], city: '仙台市', note: '体験型展示で4歳以上が楽しめる', budget: 'low',
      pricing: { adult: '550円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '地下鉄東西線旭ヶ丘駅から徒歩5分。プラネタリウム別料金250円、小学生以上がおすすめ',
    },
  ],
  akita: [
    {
      name: '秋田市大森山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '秋田市', note: 'ゾウ・キリンに近づける設計', budget: 'low',
      pricing: { adult: '730円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キリンと近接できる数少ない動物園。秋田駅からバスで25分',
    },
    {
      name: '男鹿水族館 GAO', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '男鹿市', note: '日本海の大水槽、シロクマも', budget: 'mid',
      pricing: { adult: '1,300円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本海を望む絶景水族館、ホッキョクグマ「豪太」が人気',
    },
  ],
  yamagata: [
    {
      name: '加茂水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鶴岡市', note: 'クラゲ展示数世界一、幻想的で静か', budget: 'low',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'クラゲ展示種類数世界一、ギネス記録、直径5mのクラゲ水槽が圧巻',
      popular: true,
    },
  ],
  fukushima: [
    {
      name: 'アクアマリンふくしま', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: 'いわき市', note: '海底トンネルと体験型展示が充実', budget: 'mid',
      pricing: { adult: '1,850円', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'タッチプール、海獣展示、屋外遊び場もあり一日遊べる',
    },
    {
      name: 'スパリゾートハワイアンズ', category: 'amusement', place: 'indoor', ages: ['2-3', '4-6'], city: 'いわき市', note: '年中温水プール、雨天・冬もOK', budget: 'high',
      pricing: { adult: '3,570円', elementary: '2,250円', preschool: '1,640円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ウォーターパーク「ウォーターパーク パレス」は小さい子向けプールあり、温泉と組み合わせ1泊2日が王道',
    },
  ],

  // ===== 関東（ibaraki/tochigi/gunma は下部に詳細版あり）=====
  saitama: [
    {
      name: '東武動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮代町', note: '動物園＋遊園地のハイブリッド', budget: 'mid',
      pricing: { adult: '1,900円（入園のみ）', elementary: '1,000円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物園・遊園地・プール（夏季）の複合施設。0-3歳向けアトラクションも充実',
    },
    {
      name: '鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: 'さいたま市', note: '実車展示と運転シミュレータ、雨天OK', budget: 'mid',
      pricing: { adult: '1,600円', elementary: '600円', preschool: '300円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'てっぱく抽選（シミュレータ）は入館時にエントリー必須。D51運転台は常時体験可',
    },
    {
      name: 'トーベ・ヤンソンあけぼの子どもの森公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: 'ムーミン童話の世界観を再現した無料公園', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キノコ型の小屋が点在する無料公園。春は桜、秋は紅葉。近所の隠れスポット',
      nearby: 'ムーミンバレーパークと合わせて1日',
    },
    {
      name: 'ムーミンバレーパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '飯能市', note: '湖畔のテーマパーク、散策も楽しい', budget: 'mid',
      pricing: { adult: '2,800円（1デーパス）', elementary: '1,600円', preschool: '無料（4歳未満）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料（メッツァビレッジ側）、ムーミンバレーパークのみ有料。カフェ・ショップだけなら無料で楽しめる',
    },
  ],
  chiba: [
    {
      name: '鴨川シーワールド', category: 'aquarium', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '鴨川市', note: 'シャチのショーが圧巻、海岸併設', budget: 'high',
      pricing: { adult: '3,300円', elementary: '2,000円', preschool: '1,300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '日本で唯一シャチのパフォーマンスが見られる。最前列は水しぶきで濡れる、レインコート推奨',
      nearby: '鴨川温泉と合わせて1泊プランが鉄板',
      popular: true,
    },
    {
      name: 'マザー牧場', category: 'farm', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '富津市', note: '動物と触れ合い＋収穫体験＋ミニ遊園地', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '800円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '春は菜の花・秋はコスモス畑が圧巻。東京湾アクアラインでアクセス良好',
    },
    {
      name: 'ふなばしアンデルセン公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '船橋市', note: '大型遊具とアスレチック、一日遊べる', budget: 'low',
      pricing: { adult: '900円', elementary: '200円', preschool: '100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ボート池・アスレチック・美術館・動物ふれあい全部ある総合公園。春の花、夏の水遊び、秋の紅葉とオールシーズン',
    },
  ],
  tokyo: [
    {
      name: '上野動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '台東区', note: 'ジャイアントパンダに会える、駅近', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '平日10時開園直後が狙い目。パンダ舎は整理券配布制のため公式サイトで当日の運用を確認',
      nearby: '上野公園の噴水広場・国立科学博物館と組み合わせて1日コース',
      popular: true,
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
      popular: true,
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
    {
      name: '横浜・八景島シーパラダイス', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '横浜市', note: '水族館＋遊園地＋海、1日コース', budget: 'high',
      pricing: { adult: '3,300円（水族館のみ）〜5,600円（全施設）', elementary: '2,000〜4,000円', preschool: '1,150〜2,300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'ワンデーパス（全施設）が割安。夕方17時以降のナイトパスはさらにお得',
      nearby: '八景島駅直結、1日フルで遊べる',
      popular: true,
    },
    {
      name: 'よこはま動物園ズーラシア', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '横浜市', note: '世界の気候帯別展示、広大', budget: 'low',
      pricing: { adult: '800円', elementary: '200円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '53ヘクタールの広さ、ベビーカー貸出あり。オカピ・インドライオンが見どころ',
    },
    {
      name: '横浜アンパンマンこどもミュージアム', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3'], city: '横浜市', note: 'みなとみらい直結、0-3歳の定番', budget: 'mid',
      pricing: { adult: '2,200〜2,600円', elementary: '2,200〜2,600円', preschool: '2,200〜2,600円（1歳以上全員）', infant: '無料（1歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定入館券制、土日は1ヶ月前に売切れも。平日17時以降の半額タイムが狙い目',
    },
    {
      name: '新江ノ島水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '藤沢市', note: '相模湾大水槽とクラゲ展示', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,400円', preschool: '1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカショー最終回（16時台）が空いている。江ノ島観光と組み合わせ',
      nearby: '江ノ島展望台・鎌倉大仏と合わせて1日コース',
    },
    {
      name: '箱根彫刻の森美術館', category: 'museum', place: 'outdoor', ages: ['2-3', '4-6'], city: '箱根町', note: '野外彫刻＋子ども向けアート遊具', budget: 'mid',
      pricing: { adult: '2,000円', elementary: '1,000円（小中）', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '「ネットの森」（巨大ハンモック型遊具）が子どもに大人気。箱根登山鉄道彫刻の森駅から徒歩2分',
      nearby: '箱根湯本温泉と合わせて1泊プラン',
    },
  ],

  // ===== 中部 =====
  niigata: [
    {
      name: '新潟県立自然科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '新潟市', note: '恐竜ロボット・プラネタリウム', budget: 'low',
      pricing: { adult: '580円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内5フロアと屋外遊具で1日遊べる、雨天の鉄板',
    },
    {
      name: 'マリンピア日本海', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '新潟市', note: '日本海側最大級、イルカショー', budget: 'low',
      pricing: { adult: '1,500円', elementary: '600円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本海側最大級、イルカパフォーマンスは1日3-4回',
    },
  ],
  toyama: [
    {
      name: '魚津水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '魚津市', note: '富山湾の深海魚展示', budget: 'low',
      pricing: { adult: '1,100円', elementary: '550円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '富山湾特有のホタルイカやミラージュランド隣接',
    },
    {
      name: 'ミラージュランド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '魚津市', note: '小規模で0-6歳に丁度良い遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各300-500円', preschool: '乗り物各300-500円', infant: '無料（一部乗り物）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、乗り物のみ別料金。小さい子向けアトラクションが揃う',
    },
  ],
  ishikawa: [
    {
      name: 'のとじま水族館', category: 'aquarium', place: 'mixed', ages: ['2-3', '4-6'], city: '七尾市', note: 'ジンベエザメ展示、能登半島の景色も', budget: 'mid',
      pricing: { adult: '1,890円', elementary: '510円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ジンベエザメが日本海側で唯一見られる水族館、能登和倉温泉と組み合わせ',
    },
  ],
  fukui: [
    {
      name: '福井県立恐竜博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '勝山市', note: '国内最大級の恐竜展示、子どもに大人気', budget: 'low',
      pricing: { adult: '1,000円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定の完全予約制、土日は数ヶ月前から埋まる。恐竜ロボットが圧巻',
      popular: true,
    },
    {
      name: '越前松島水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '坂井市', note: 'イルカにタッチできる', budget: 'mid',
      pricing: { adult: '2,200円', elementary: '1,100円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'イルカタッチ＆給餌体験（別料金）、東尋坊から車10分',
    },
  ],
  shizuoka: [
    {
      name: '富士サファリパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '裾野市', note: '車から動物観察＋ふれあい', budget: 'mid',
      pricing: { adult: '3,200円', elementary: '2,000円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'マイカーorジャングルバス（別料金1,500円/人）、天気悪いとライオン等が屋内、朝一10時開園直後が見応えあり',
      popular: true,
    },
    {
      name: '伊豆アニマルキングダム', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '東伊豆町', note: 'ホワイトタイガーに大接近、遊具もあり', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,400円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ホワイトタイガーと至近距離、動物エリア＋遊園地＋プレイゾーンが一体',
    },
    {
      name: '東海大学海洋科学博物館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '静岡市', note: '機械の博物館併設', budget: 'low',
      pricing: { adult: '1,800円（共通券）', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '海洋科学博物館と自然史博物館の共通券でお得、三保の松原もすぐ',
    },
    {
      name: 'ぐりんぱ（富士山2合目）', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '裾野市', note: 'シルバニアビレッジ等、小さい子向け', budget: 'mid',
      pricing: { adult: '1,300円（入園のみ）', elementary: '850円', preschool: '無料（3歳以下）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'シルバニアビレッジがあり0-6歳に最適、冬季休業あり要確認',
    },
  ],
  nagano: [
    {
      name: '茶臼山動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '長野市', note: 'レッサーパンダ発祥の動物園', budget: 'low',
      pricing: { adult: '600円', elementary: '100円（小中）', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'レッサーパンダの飼育頭数日本有数、春秋が動物が活発',
    },
    {
      name: '軽井沢おもちゃ王国', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '嬬恋村※群馬側', note: '室内プレイスペースとミニ遊園地', budget: 'mid',
      pricing: { adult: '1,300円（入園）', elementary: '900円', preschool: '900円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '11エリアの室内おもちゃ部屋、雨天OK、乗り放題パス（3,300円）が断然お得',
    },
  ],
  gifu: [
    {
      name: '世界淡水魚園水族館 アクア・トトぎふ', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '各務原市', note: '世界最大級の淡水魚水族館', budget: 'mid',
      pricing: { adult: '1,780円', elementary: '880円', preschool: '440円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'オアシスパーク（無料遊具広場）隣接、水族館は所要90分',
      nearby: '河川環境楽園オアシスパーク＋アクア・トト＋観覧車で1日コース',
    },
    {
      name: '各務原市民公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '各務原市', note: 'アクア・トトに隣接、併せて1日', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '駐車場無料、芝生広場でピクニック可',
    },
  ],
  shiga: [
    {
      name: '琵琶湖博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '草津市', note: '淡水魚展示と琵琶湖の歴史、広い', budget: 'low',
      pricing: { adult: '800円', elementary: '無料（高校生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '体験型展示「ディスカバリールーム」が人気、水族館と博物館の中間的な施設',
      nearby: '隣接のからすま半島公園で芝生遊び',
    },
    {
      name: 'ブルーメの丘', category: 'farm', place: 'outdoor', ages: ['2-3', '4-6'], city: '日野町', note: '動物ふれあい＋収穫体験＋遊具', budget: 'low',
      pricing: { adult: '1,000円', elementary: '600円', preschool: '300円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '季節ごとの収穫体験（いちご・ブルーベリー・芋掘り）がおすすめ',
    },
  ],
  mie: [
    {
      name: '鳥羽水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鳥羽市', note: '飼育種類数日本一、ジュゴン展示', budget: 'mid',
      pricing: { adult: '2,800円', elementary: '1,600円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '日本で唯一のジュゴン展示、約1,200種の魚。所要2-3時間',
      popular: true,
    },
    {
      name: '志摩スペイン村', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '志摩市', note: 'スペイン村パルケエスパーニャ', budget: 'high',
      pricing: { adult: '5,400円', elementary: '3,600円', preschool: '3,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '他テーマパークに比べて空いていて乗り物に乗りやすい、ナイトチケット（15時〜）2,900円がお得',
    },
  ],
  kagoshima: [
    {
      name: 'いおワールドかごしま水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '鹿児島市', note: 'ジンベエザメ展示、桜島も望める', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '350円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桜島をバックにジンベエザメ、イルカパフォーマンスは1日4回',
    },
    {
      name: '平川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '鹿児島市', note: 'コアラ舎と遊園地併設', budget: 'low',
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桜島を望む絶景動物園、遊園地（乗り物100-200円）併設',
    },
  ],
  tochigi: [
    {
      name: '那須どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '那須町', note: '室内外で動物と触れ合える、雨天も楽しい', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '王国ファーム（屋内）と王国タウン（屋外）、園内バス移動あり。雨天でも楽しめる',
      popular: true,
    },
    {
      name: '那須ハイランドパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '那須町', note: '小さい子向けアトラクションも多い', budget: 'high',
      pricing: { adult: '1,800円（入園）', elementary: '1,300円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '身長制限のない幼児向けアトラクション多数、1DAYパスポート（5,600円）がお得',
    },
    {
      name: '宇都宮動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宇都宮市', note: '遊園地併設、動物との距離が近い', budget: 'low',
      pricing: { adult: '1,400円（遊園地セット）', elementary: '700円', preschool: '700円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'キリンの餌やり100円、動物に近づける小規模動物園の良さ',
    },
  ],
  ibaraki: [
    {
      name: 'アクアワールド茨城県大洗水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大洗町', note: 'サメ展示種数日本一、マンボウも', budget: 'mid',
      pricing: { adult: '2,300円', elementary: '1,100円', preschool: '400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'キッズスペース（1回20分、予約制）が穴場、イルカショー最終回（15-16時）が空いている',
      nearby: '大洗海岸と大洗磯前神社で1日コース',
    },
    {
      name: '国営ひたち海浜公園', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: 'ひたちなか市', note: 'ネモフィラ・コキアの絶景、遊具も充実', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '4月下旬のネモフィラ・10月のコキアはSNS映え絶景、朝8-9時到着推奨',
      popular: true,
    },
  ],
  gunma: [
    {
      name: '群馬サファリパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '富岡市', note: '車から動物に餌やりできる', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,400円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'エサやりバス（別料金1,500円）で至近距離で動物と触れ合える',
    },
    {
      name: 'ぐんまこどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '太田市', note: '大型遊具と体験施設、入園無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園・駐車場無料、有料施設（児童館200円、乗り物100円）のみ別料金',
    },
  ],
  yamanashi: [
    {
      name: '富士急ハイランド', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '富士吉田市', note: 'トーマスランドは0-6歳向け', budget: 'high',
      pricing: { adult: '6,000〜8,000円', elementary: '4,400〜6,000円', preschool: '2,100〜3,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'トーマスランドエリアのフリーパスのみ（2,500円）があり、絶叫マシン苦手な家族にも',
    },
    {
      name: '山梨県立富士湧水の里水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '忍野村', note: '淡水魚の水族館、入館料安い', budget: 'low',
      pricing: { adult: '420円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '忍野八海の近く、淡水魚メインで30-60分で回れるサイズ',
    },
  ],
  aichi: [
    {
      name: 'レゴランド・ジャパン', category: 'amusement', place: 'mixed', ages: ['2-3', '4-6'], city: '名古屋市', note: '2-12歳ターゲット、駅直結', budget: 'high',
      pricing: { adult: '5,000〜7,900円', elementary: '3,700〜5,800円', preschool: '無料（3歳以下の一部）', infant: '無料（2歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '公式サイトで前売り券（最大30%オフ）推奨。平日は待ち時間ほぼなし',
      nearby: '同エリアのメイカーズ・ピア＋シーライフで1日フル',
      popular: true,
    },
    {
      name: '名古屋港水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'シャチとベルーガ、屋内広い', budget: 'mid',
      pricing: { adult: '2,030円', elementary: '1,010円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカパフォーマンスは1日3-4回、最終回が空いている。シャチ公開トレーニングは事前確認必須',
      nearby: '南極観測船ふじ（同敷地内、大人300円）と組み合わせ',
    },
    {
      name: '東山動植物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '名古屋市', note: 'コアラ・イケメンゴリラ、遊園地併設', budget: 'low',
      pricing: { adult: '500円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '園内は広大で坂多し、抱っこ紐推奨。イケメンゴリラ「シャバーニ」を見るなら午前中',
      nearby: '園内の遊園地（乗り物1回100-200円）で半日延長可',
    },
    {
      name: 'モリコロパーク', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '長久手市', note: '愛・地球博記念公園、広大で無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'サツキとメイの家（有料520円、ジブリ好き必見）は事前予約制。芝生広場は自由にピクニック可',
      nearby: 'ジブリパークと組み合わせ、1日フル',
    },
    {
      name: 'ジブリパーク', category: 'amusement', place: 'mixed', ages: ['4-6'], city: '長久手市', note: 'モリコロパーク内、予約制', budget: 'mid',
      pricing: { adult: '1,500〜3,500円', elementary: '750〜1,750円', preschool: '無料（3歳以下）', infant: '無料' },
      reservation: 'required',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '日時指定の完全予約制。各エリア別々のチケットが必要、人気エリアは2-3ヶ月前に抑える',
    },
  ],

  // ===== 関西（mie/shiga は上部に詳細版あり）=====
  kyoto: [
    {
      name: '京都水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: 'オオサンショウウオ、梅小路公園直結', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,200円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'イルカLIVE「キラメキ」は1日3-4回、開園直後が混雑前で狙い目',
      nearby: '梅小路公園＋京都鉄道博物館で半日-1日コース',
    },
    {
      name: '京都市動物園', category: 'zoo', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '岡崎エリア、平安神宮や美術館も近い', budget: 'low',
      pricing: { adult: '750円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '小さめの動物園なのでベビーカーで1時間程度で回れる。南禅寺・平安神宮と組み合わせやすい',
      nearby: '岡崎公園＋ロームシアター＋京都市美術館で大人も楽しめる',
    },
    {
      name: '梅小路公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '京都市', note: '水族館＋鉄道博物館のハブ、芝生広場', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '芝生広場でお弁当、チンチン電車（市電展示）も無料で入れる',
      nearby: '京都水族館＋京都鉄道博物館で1日フル',
    },
    {
      name: '京都鉄道博物館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '京都市', note: 'SL展示と運転シミュレータ', budget: 'mid',
      pricing: { adult: '1,500円', elementary: '500円', preschool: '200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'SLスチーム号（別料金300円）は1日4-5便、午前の回が比較的空いている',
    },
  ],
  osaka: [
    {
      name: '海遊館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大阪市', note: 'ジンベエザメの大水槽、世界最大級', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,400円', preschool: '700円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '閉館2時間前（15時以降）が狙い目、ジンベエザメ給餌タイム狙いなら11時/14時半頃',
      nearby: '天保山マーケットプレース（隣接）でランチ＋観覧車で1日コース',
      popular: true,
    },
    {
      name: 'ニフレル', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '「生きるミュージアム」、動物と間近', budget: 'mid',
      pricing: { adult: '2,200円', elementary: '1,100円', preschool: '650円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '万博記念公園駅直結、ベビーカー可。ホワイトタイガーの展示が圧巻',
      nearby: 'EXPOCITYのららぽーと＋観覧車で雨天1日コース',
    },
    {
      name: 'キッズプラザ大阪', category: 'indoor', place: 'indoor', ages: ['2-3', '4-6'], city: '大阪市', note: '体験型のこども博物館、雨天OK', budget: 'low',
      pricing: { adult: '1,400円', elementary: '800円', preschool: '500円（3歳以上）', infant: '無料（3歳未満）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '5階「こどもタウン」の実際の店舗そっくりな作りが子どもに大ヒット。平日が圧倒的におすすめ',
    },
    {
      name: '天王寺動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大阪市', note: '都心の動物園、駅近', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'あべのハルカス徒歩圏、JR天王寺駅から直結。春秋の朝夕が動物活発で狙い目',
      nearby: 'てんしば（無料芝生広場）でピクニックとセット',
    },
    {
      name: 'ひらかたパーク', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '枚方市', note: '0-3歳向けエリアもある老舗遊園地', budget: 'mid',
      pricing: { adult: '1,900円（入園）', elementary: '1,100円', preschool: '無料（2歳以下）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '身長90cm以下でも乗れる0-3歳向けアトラクション「ちーたのゆうえんち」が充実。平日なら乗り放題パスなしでも十分',
    },
    {
      name: '万博記念公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '吹田市', note: '太陽の塔と広大な自然文化園', budget: 'low',
      pricing: { adult: '260円', elementary: '80円', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '広大すぎるため端から端まで徒歩30分超。ベビーカー必須、無料のドッグラン併設',
      nearby: 'ニフレル＋EXPOCITYと組み合わせ1日フル',
    },
  ],
  hyogo: [
    {
      name: '神戸どうぶつ王国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '神戸市', note: '全天候型、動物と距離が近い', budget: 'mid',
      pricing: { adult: '2,500円', elementary: '1,500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '屋内展示多く雨の日もOK。カピバラやハシビロコウが近い',
      nearby: 'ポートライナー「計算科学センター」駅直結、神戸空港と組み合わせ',
    },
    {
      name: '姫路セントラルパーク', category: 'zoo', place: 'mixed', ages: ['2-3', '4-6'], city: '姫路市', note: 'サファリ＋遊園地＋プール', budget: 'mid',
      pricing: { adult: '3,800円', elementary: '2,000円', preschool: '1,200円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'マイカーサファリ（自家用車で巡回）が人気。夏はプール、冬はアイススケートも併設',
    },
    {
      name: '須磨シーワールド', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '神戸市', note: '2024年リニューアル、西日本初のシャチ展示', budget: 'mid',
      pricing: { adult: '3,700円', elementary: '1,800円', preschool: '1,100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '2024年6月リニューアル、シャチパフォーマンス人気で事前予約必須',
      nearby: '須磨海浜公園でピクニックセット',
    },
    {
      name: 'ニジゲンノモリ（淡路島）', category: 'amusement', place: 'outdoor', ages: ['4-6'], city: '淡路市', note: 'クレヨンしんちゃんアドベンチャーパーク等', budget: 'mid',
      pricing: { adult: '1,000-3,500円（エリア別）', elementary: '500-2,000円', preschool: '無料〜1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'エリアごとのチケット制、小さい子は「クレヨンしんちゃん」と「ドラゴンクエストアイランド」が楽しめる',
    },
  ],
  nara: [
    {
      name: '奈良公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '奈良市', note: '鹿と触れ合える、東大寺と一緒に', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'シカせんべい（200円）で餌やり体験、2歳以降に。小さい子は怖がる場合あり距離感注意',
      popular: true,
      nearby: '東大寺・興福寺・奈良国立博物館と徒歩圏',
    },
    {
      name: '生駒山上遊園地', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '生駒市', note: '小さい子向けレトロ遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各400円', preschool: '乗り物各400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、生駒ケーブルで山頂へ。大阪を一望できる絶景遊園地',
    },
  ],
  wakayama: [
    {
      name: 'アドベンチャーワールド', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '白浜町', note: 'パンダ・サファリ・遊園地の複合型', budget: 'high',
      pricing: { adult: '5,300円', elementary: '3,300円', preschool: '2,000円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: 'ジャイアントパンダ3頭飼育（全国最多）、動物園＋水族館＋サファリ＋遊園地の複合型',
      nearby: '白浜温泉と合わせて1-2泊プラン',
    },
  ],

  // ===== 中国・四国 =====
  tottori: [
    {
      name: '鳥取砂丘', category: 'park', place: 'outdoor', ages: ['2-3', '4-6'], city: '鳥取市', note: '砂遊びの究極形、らくだ体験も', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'ラクダ乗車体験（別料金600円〜）、砂の美術館（有料）併設',
      popular: true,
      nearby: '砂の美術館＋鳥取砂丘こどもの国で1日コース',
    },
    {
      name: '鳥取砂丘こどもの国', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '鳥取市', note: 'アスレチックと体験工房', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '砂丘隣接、大型遊具と屋内プレイエリアの複合',
    },
  ],
  shimane: [
    {
      name: '島根県立しまね海洋館アクアス', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '浜田市', note: 'シロイルカのバブルリングが名物', budget: 'low',
      pricing: { adult: '1,550円', elementary: '500円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'シロイルカのバブルリングは1日4-5回公演、無料で見られる',
    },
  ],
  okayama: [
    {
      name: 'おもちゃ王国（岡山）', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '玉野市', note: 'おもちゃの部屋が多数、0-6歳に最適', budget: 'mid',
      pricing: { adult: '800円（入園）', elementary: '800円', preschool: '800円（2歳以上）', infant: '無料（1歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '室内おもちゃ部屋が11以上、雨天OK、乗り放題パス（3,300円）推奨',
      popular: true,
    },
    {
      name: '渋川動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '玉野市', note: '動物にエサやり、リーズナブル', budget: 'low',
      pricing: { adult: '900円', elementary: '400円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物との距離が近く、餌やり（100円）が豊富。渋川海岸に近い',
    },
  ],
  hiroshima: [
    {
      name: '安佐動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '広島市', note: '起伏ある園内、キリン舎が見どころ', budget: 'low',
      pricing: { adult: '510円', elementary: '170円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '園内坂多し、ベビーカー＋抱っこ紐併用推奨。広島駅から車30分',
    },
    {
      name: 'みろくの里', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '福山市', note: '昭和レトロなミニ遊園地', budget: 'mid',
      pricing: { adult: '1,400円', elementary: '900円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'いつか来た道エリア（昭和30年代再現）が大人も懐かしい。乗り放題パス（4,000円程度）がお得',
    },
    {
      name: '広島市こども文化科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '広島市', note: 'プラネタリウムと体験展示、入館無料', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料', },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入館完全無料、プラネタリウム別料金510円。原爆ドーム隣接でアクセス最高',
    },
  ],
  yamaguchi: [
    {
      name: '秋吉台サファリランド', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '美祢市', note: 'マイカーサファリと遊園地', budget: 'mid',
      pricing: { adult: '2,700円', elementary: '1,700円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'マイカー入園可（動物たちが間近）、遊園地もあり1日コース',
    },
    {
      name: '下関市立しものせき水族館 海響館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '下関市', note: 'フグ展示種類世界一', budget: 'mid',
      pricing: { adult: '2,090円', elementary: '940円', preschool: '410円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フグ展示種類世界一、イルカ・アシカショーは1日3回。下関駅から徒歩7分',
    },
  ],
  tokushima: [
    {
      name: '徳島県立あすたむらんど', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '板野町', note: '科学館と大型遊具、無料エリアあり', budget: 'free',
      pricing: { adult: '無料（入園）', elementary: '科学館別料金', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園完全無料、大型遊具「子ども科学館」（別料金600円）と芝生広場',
    },
  ],
  kagawa: [
    {
      name: 'NEWレオマワールド', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '丸亀市', note: '0-6歳向けアトラクション充実', budget: 'mid',
      pricing: { adult: '1,800円（入園）', elementary: '1,200円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '0-6歳向けアトラクション「ドキドキタウン」が充実、フリーパス4,300円',
    },
    {
      name: '四国水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '宇多津町', note: '2020年開業、瀬戸内海の生き物', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '1,300円', preschool: '600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '2020年開業で綺麗、夕方は夕日シルエットの演出が美しい',
    },
  ],
  ehime: [
    {
      name: 'とべ動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '砥部町', note: '西日本有数の動物園、ホッキョクグマ', budget: 'low',
      pricing: { adult: '500円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '西日本最大級、ホッキョクグマ「ピース」が人気。松山駅から車40分',
    },
    {
      name: 'えひめこどもの城', category: 'park', place: 'mixed', ages: ['2-3', '4-6'], city: '松山市', note: '大型遊具と工作体験、無料入場', budget: 'free',
      pricing: { adult: '無料', elementary: '無料', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入場無料の大型こども向け複合施設。モノレールやボートは別料金300-400円',
    },
  ],
  kochi: [
    {
      name: 'のいち動物公園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '香南市', note: '展示のクオリティ高さで評価高い', budget: 'low',
      pricing: { adult: '470円', elementary: '無料（18歳以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '全国ランキング常連の動物園、展示の質が高く小規模でも見応え十分',
    },
    {
      name: '桂浜水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '高知市', note: '小規模だが見せ方が独創的', budget: 'low',
      pricing: { adult: '1,500円', elementary: '750円', preschool: '400円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '桂浜の海辺、レトロな昭和水族館の味わい、坂本龍馬像とセット',
    },
  ],

  // ===== 九州・沖縄 =====
  fukuoka: [
    {
      name: 'マリンワールド海の中道', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: 'イルカ・アシカショーとパノラマ水槽', budget: 'mid',
      pricing: { adult: '2,500円', elementary: '1,200円', preschool: '700円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'イルカショー後の17時前が比較的空いている。九州の海再現水槽が大人も楽しい',
      nearby: '海の中道海浜公園と1日セット（駅共通）',
      popular: true,
    },
    {
      name: '海の中道海浜公園', category: 'park', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '福岡市', note: '動物の森＋大型遊具＋花、1日遊べる', budget: 'low',
      pricing: { adult: '450円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '300ha超の広大公園、レンタサイクルで周遊推奨。春のネモフィラ、秋のコスモスが絶景',
      nearby: 'マリンワールド海の中道と組み合わせ1日フル',
    },
    {
      name: '福岡市動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '福岡市', note: 'リニューアル後の植物園併設', budget: 'low',
      pricing: { adult: '600円', elementary: '無料（中学生以下）', preschool: '無料', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'リニューアル済、ベビーカー貸出あり。天神から地下鉄＋バスで20分程度',
      nearby: '隣接の福岡市植物園（同入場料共通）も合わせて半日',
    },
    {
      name: 'ボーネルンドあそびのせかい（ららぽーと等）', category: 'indoor', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '複数', note: '屋内遊び場、雨天の救世主', budget: 'mid',
      pricing: { adult: '600円（保護者）', preschool: '600円/30分＋延長料金', infant: '600円（6ヶ月〜）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '平日フリーパス（1,200円程度）がお得。休日は整理券制になることも',
    },
  ],
  saga: [
    {
      name: '佐賀県立宇宙科学館', category: 'museum', place: 'indoor', ages: ['2-3', '4-6'], city: '武雄市', note: 'プラネタリウムと体験展示', budget: 'low',
      pricing: { adult: '520円', elementary: '310円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'プラネタリウム別料金（大人520円）、武雄温泉と組み合わせ',
    },
    {
      name: '神野公園こども遊園地', category: 'amusement', place: 'outdoor', ages: ['2-3', '4-6'], city: '佐賀市', note: '入園無料の昔ながらの遊園地', budget: 'low',
      pricing: { adult: '無料（入園）', elementary: '乗り物各150-250円', preschool: '乗り物各150-250円', infant: '無料（一部）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '入園無料、乗り物のみ別料金。懐かしいレトロ遊具',
    },
  ],
  nagasaki: [
    {
      name: 'ハウステンボス', category: 'amusement', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '佐世保市', note: 'ヨーロッパ風テーマパーク、1日コース', budget: 'high',
      pricing: { adult: '7,400円', elementary: '4,800円', preschool: '4,100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '夜のイルミネーション「光の王国」は17時以降のナイトチケットがお得。佐世保駅から直通バス1時間',
      nearby: '佐世保市内のホテルで1泊必須級の広さ',
    },
    {
      name: '長崎バイオパーク', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '西海市', note: 'カバや鹿に直接触れられる', budget: 'mid',
      pricing: { adult: '1,900円', elementary: '1,100円', preschool: '800円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フリーフライングエリアで鳥が肩に乗る体験。餌やり（エサ代200-300円）が大人気',
    },
    {
      name: '長崎ペンギン水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '長崎市', note: 'ペンギン種類数日本一', budget: 'low',
      pricing: { adult: '520円', elementary: '310円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '世界最多9種類のペンギン展示、ふれあいビーチでペンギン散歩（土日祝）',
    },
  ],
  kumamoto: [
    {
      name: '熊本市動植物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '熊本市', note: '動物園＋植物園＋遊園地の複合', budget: 'low',
      pricing: { adult: '500円', elementary: '100円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '動物園＋遊園地（10種類の乗り物、各100-200円）＋植物園で1日フル。熊本駅から市電で30分',
    },
    {
      name: '阿蘇カドリー・ドミニオン', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '阿蘇市', note: 'クマ牧場とミニブタショー', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,600円', preschool: '1,000円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'みやざわ劇場のミニブタ・犬のパフォーマンスが大人気。阿蘇山観光とセットで1日コース',
      nearby: '阿蘇ファームランドと組み合わせ',
    },
  ],
  oita: [
    {
      name: 'うみたまご', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '大分市', note: 'セイウチショーとタッチプール', budget: 'mid',
      pricing: { adult: '2,600円', elementary: '1,300円', preschool: '850円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'セイウチとのふれあい、タッチプール、高崎山と隣接で1日コース',
    },
    {
      name: '高崎山自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '大分市', note: '野生の猿の群れが来る、うみたまご隣接', budget: 'low',
      pricing: { adult: '520円', elementary: '260円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '野生の猿1000頭以上が山から下りてくる、エサやりタイム11時/14時',
      nearby: 'うみたまごと徒歩5分、セットで半日-1日コース',
    },
    {
      name: 'ハーモニーランド', category: 'amusement', place: 'outdoor', ages: ['0-1', '2-3', '4-6'], city: '日出町', note: 'サンリオの屋外テーマパーク', budget: 'mid',
      pricing: { adult: '3,600円', elementary: '2,600円', preschool: '2,600円（3歳以上）', infant: '無料（2歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: 'サンリオの屋外テーマパーク、小さい子向けアトラクション充実、アフタヌーンパス（昼以降割引）も',
    },
  ],
  miyazaki: [
    {
      name: '宮崎市フェニックス自然動物園', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '宮崎市', note: '遊園地併設、フラミンゴショー', budget: 'low',
      pricing: { adult: '840円', elementary: '420円', preschool: '無料（未就学児）', infant: '無料' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フラミンゴショーが珍しい、遊園地乗り物も別料金100-400円',
    },
  ],
  // kagoshima は上部の詳細版を参照
  okinawa: [
    {
      name: '沖縄美ら海水族館', category: 'aquarium', place: 'indoor', ages: ['0-1', '2-3', '4-6'], city: '本部町', note: 'ジンベエザメとマンタの大水槽', budget: 'mid',
      pricing: { adult: '2,180円', elementary: '710円（小中）', preschool: '無料（6歳未満）', infant: '無料' },
      reservation: 'recommended',
      crowdLevel: { weekday: 'mid', holiday: 'high' },
      hiddenTip: '16時以降の夕方入館券（1,510円、8割価格）が狙い目。那覇から車で約2時間、日帰り強行はキツイ',
      nearby: '海洋博公園内にエメラルドビーチ（無料）、オキちゃん劇場（イルカショー）で1日フル',
      popular: true,
    },
    {
      name: '沖縄こどもの国', category: 'zoo', place: 'mixed', ages: ['0-1', '2-3', '4-6'], city: '沖縄市', note: '動物園＋こどもの遊具、リーズナブル', budget: 'low',
      pricing: { adult: '500円', elementary: '200円', preschool: '100円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: '那覇から車で45分、リーズナブルで1日遊べる。チルドレンズセンター（屋内）も併設',
    },
    {
      name: 'ネオパークオキナワ', category: 'zoo', place: 'outdoor', ages: ['2-3', '4-6'], city: '名護市', note: '鳥類メイン、放し飼いで近い', budget: 'low',
      pricing: { adult: '1,300円', elementary: '700円', preschool: '500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'mid' },
      hiddenTip: 'フラミンゴ・オウムが放し飼いで大接近。餌やり体験（100円）が人気',
      nearby: '名護市内、許田ICから20分。美ら海水族館と組み合わせやすい',
    },
    {
      name: 'DMMかりゆし水族館', category: 'aquarium', place: 'indoor', ages: ['2-3', '4-6'], city: '豊見城市', note: '2020年開業、プロジェクションマッピング演出', budget: 'mid',
      pricing: { adult: '2,400円', elementary: '2,000円（中高）', preschool: '1,500円（4歳以上）', infant: '無料（3歳以下）' },
      reservation: 'none',
      crowdLevel: { weekday: 'low', holiday: 'high' },
      hiddenTip: '那覇空港から車で20分、イーアス沖縄豊崎内で買い物とセット。雨天時の強い味方',
      nearby: 'イーアス沖縄豊崎（大型商業施設）で1日滞在可',
    },
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

/**
 * エディターがキュレーションした人気スポットを返す。
 * - popular: true フラグ付きのスポットを対象
 * - 全都道府県横断で area 情報も併せて返す
 * - 将来 GA4 PV連動に差し替え可能な設計
 */
export function getPopularSpots(limit = 6): { area: AreaSlug; spot: Spot }[] {
  const result: { area: AreaSlug; spot: Spot }[] = [];
  for (const [areaKey, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    for (const spot of list) {
      if (spot.popular) {
        result.push({ area: areaKey as AreaSlug, spot });
      }
    }
  }
  // slug 的ソートで毎回同じ順番（deterministic）
  result.sort((a, b) => a.spot.name.localeCompare(b.spot.name, 'ja'));
  return result.slice(0, limit);
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
