/**
 * おうち遊び（家にあるもので遊ぶ）の構造化DB — 単一データソース。
 *
 * ── なぜ作るか（2026-09-17 調査） ────────────────────────────
 * 当サイトは28日で新規90%・リピーター10%、平日セッションは土日の55%。
 * 「毎日来る仕込み」として、平日の家遊び需要を取りにいく。
 * 2026-04に公開した「雨の日の家遊び10選」型の12本は2か月表示0で noindex 済み
 * （汎用の〇選まとめは失敗している）。上位記事82本を実測すると、準備時間を
 * 全遊びに書いた記事0、片付け欄1本、誤飲の大きさ基準0本、自宅の実写5本、
 * 親の姿勢を軸にした記事1本。Q&A39件で親が本当に困っているのは
 * 「疲れさせて寝かせたい」「夕方の魔の時間」「親が寝転んだまま」
 * 「下の子の授乳中に上の子が10分もつ」。
 *
 * ── 設計 ───────────────────────────────────────────────
 *  - 遊びの事実（月齢・準備/片付けの分数・親の姿勢・安全・SNS根拠）は**ここだけ**に書く。
 *    記事本文には遊びカードとして描画する（frontmatter homePlays: [id,…]）。
 *  - items は「家にあるもの」だけ。100均で買い足すと広がるものは itemsFrom:'home+100' で明示。
 *  - safety は lib/ouchi-safety（公的一次情報）を必ず参照。ここに無い注意は書かない。
 *  - evidence は家庭アカウントの数値つき投稿・視聴回数のみ。保育園公式投稿（数百再生）は根拠にしない。
 *  - story / photo は運営者の実体験だけ。無いものは省略（捏造しない）。
 *  - ageMonths は厚労省 乳幼児身体発育調査（90%通過月齢）と母子健康手帳の目安を根拠にする。
 */

export type ParentPosture = 'lying' | 'sitting' | 'standing';
export type PlayPlace = 'living' | 'futon' | 'bath' | 'kitchen' | 'entrance';
export type PlayNeed =
  | 'tired' // 疲れさせて昼寝・就寝させたい
  | 'evening' // 夕方16〜18時のぐずり
  | 'parentLying' // 親が寝転んだまま・体調不良・妊娠中
  | 'siblingFeeding' // 下の子の授乳・寝かしつけ中に上の子が10分もつ
  | 'rainy' // 雨・猛暑・寒さで外に出られない
  | 'bored' // ネタ切れ・飽きた
  | 'alone10' // 一人で10分集中する
  | 'bath'; // お風呂を嫌がる・お風呂で遊ぶ

export type SafetyNote = {
  /** 読者向けの注意文（公式根拠の範囲内で書く） */
  text: string;
  /** 一次情報のURL（消費者庁・こども家庭庁・小児科学会・玩具協会 等） */
  sourceUrl: string;
  sourceName: string;
};

export type Evidence = {
  media: 'instagram' | 'youtube' | 'articles' | 'qa';
  /** 例: '@macopi_asobi 140万再生' '上位記事15本に登場' */
  label: string;
  url?: string;
};

export type HomePlay = {
  id: string;
  name: string;
  /** 1文の要約（カードの見出し下） */
  summary: string;
  ageMonths: { min: number; max: number };
  /** 月齢の根拠（公式の発達目安）。書けるものだけ */
  ageBasis?: string;
  items: string[];
  itemsFrom: 'home' | 'home+100';
  prepMin: number;
  cleanupMin: number;
  parentPosture: ParentPosture;
  /** 体力発散度 1=静か 2=ふつう 3=ヘトヘト */
  energy: 1 | 2 | 3;
  /** 集中して持つ目安（分） */
  durationMin: number;
  place: PlayPlace;
  season?: 'summer' | 'winter';
  steps: string[];
  /** 飽きたら次の一手 */
  nextVariants: string[];
  safety: SafetyNote[];
  evidence: Evidence[];
  needs: PlayNeed[];
  /** 運営者の実写（/img/ouchi/…）。無ければ省略 */
  photo?: string;
  /** 運営者の体験談（年齢・持った時間・親の位置・失敗）。無ければ省略 */
  story?: string;
};

// ── 公的根拠（lib/ouchi-safety.ts と重複しないよう最小限の定数） ──
const SRC = {
  caaMouth: {
    sourceName: '消費者庁 子ども安全メール Vol.544',
    sourceUrl: 'https://www.caa.go.jp/policies/policy/consumer_safety/child/project_001/mail/20210225/',
  },
  jpedsBalloon: {
    sourceName: '日本小児科学会 Injury Alert No.48',
    sourceUrl: 'https://www.jpeds.or.jp/uploads/files/injuryalert/0048.pdf',
  },
  tfdChoke: {
    sourceName: '東京消防庁「乳幼児の窒息や誤飲に注意！」',
    sourceUrl: 'https://www.tfd.metro.tokyo.lg.jp/lfe/nichijo/children_tissoku.html',
  },
  cfaChoke: {
    sourceName: 'こども家庭庁 事故防止ハンドブック（窒息・誤飲）',
    sourceUrl: 'https://www.cfa.go.jp/policies/child-safety-actions/handbook/content-1',
  },
  cfaFall: {
    sourceName: 'こども家庭庁 事故防止ハンドブック（転落・転倒）',
    sourceUrl: 'https://www.cfa.go.jp/policies/child-safety-actions/handbook/content-4',
  },
  caaFall: {
    sourceName: '消費者庁「子どもの転落事故に注意！」',
    sourceUrl:
      'https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_061/assets/consumer_safety_cms205_220720_01.pdf',
  },
  caaBedding: {
    sourceName: '消費者庁 子ども安全メール Vol.640',
    sourceUrl: 'https://www.caa.go.jp/policies/policy/consumer_safety/child/project_001/mail/20231102/',
  },
  cfaDrown: {
    sourceName: 'こども家庭庁「水の危険は近くにあります」',
    sourceUrl: 'https://www.cfa.go.jp/policies/child-safety-actions/cases/dekisui',
  },
  caaBath: {
    sourceName: '消費者庁 入浴中の事故に注意',
    sourceUrl: 'https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_052',
  },
  cfaBurn: {
    sourceName: 'こども家庭庁 事故防止ハンドブック（やけど）',
    sourceUrl: 'https://www.cfa.go.jp/policies/child-safety-actions/handbook/content-3',
  },
  toysWheat: {
    sourceName: '日本玩具協会 STガイドライン改定（2018-10-03）',
    sourceUrl: 'https://toys.or.jp/st/pdf/2018/st_guide_tuika_20181003.pdf',
  },
  caaBattery: {
    sourceName: '消費者庁 子ども安全メール Vol.547',
    sourceUrl: 'https://www.caa.go.jp/policies/policy/consumer_safety/child/project_001/mail/20210318/',
  },
  jpaMedia: {
    sourceName: '日本小児科医会「子どもとメディア」提言',
    sourceUrl: 'https://www.jpa-web.org/dcms_media/other/ktmedia_teigenzenbun.pdf',
  },
} as const;

const MOUTH: SafetyNote = {
  text: '子どもの口は直径約4cm。それより小さい物は口に入り誤飲の原因になる（消費者庁）。小さい部品は使わない。',
  ...SRC.caaMouth,
};
const BALLOON: SafetyNote = {
  text: '風船は食物以外で窒息の原因になりやすく、割れたゴム片は死亡例の原因物質として多い（日本小児科学会）。割れたら即回収し、口元に持っていかせない。',
  ...SRC.jpedsBalloon,
};
const BAG: SafetyNote = {
  text: '0歳の誤飲・窒息はお菓子の「包み・袋」が多く、9か月がピーク（東京消防庁）。袋類は親が持ち、顔にかぶらないようにする。',
  ...SRC.tfdChoke,
};
const FALL: SafetyNote = {
  text: '家具からの転落で入院した事故は0歳が半数近く、ベッド・椅子が多い（消費者庁）。ソファやベッドの上では遊ばせない。',
  ...SRC.caaFall,
};
const CUSHION: SafetyNote = {
  text: '柔らかいクッションは窒息のおそれがあるため、転落防止のためでも周りに置かない（こども家庭庁）。0歳は布団に顔が埋もれない硬さで。',
  ...SRC.cfaFall,
};
const DROWN: SafetyNote = {
  text: '3cm以上の深さがあれば乳幼児は溺れる。溺れるとき子どもは声を出さず静かに沈む（こども家庭庁）。水を張った容器から目を離さない。',
  ...SRC.cfaDrown,
};
const BATH: SafetyNote = {
  text: '入浴中の溺水は0〜1歳が最も多い。大人が洗髪するときは浴槽から出し、入浴後は浴槽の水を抜く（消費者庁）。',
  ...SRC.caaBath,
};
const WHEAT: SafetyNote = {
  text: '小麦アレルギーの子は小麦粘土に触れるだけで症状が出ることがある（日本玩具協会）。食用ではなく、幼い子は窒息の危険もある。',
  ...SRC.toysWheat,
};
const FILM: SafetyNote = {
  text: '包装フィルムを口に入れてかじると、破片で窒息することがある（こども家庭庁）。シールの台紙や剥がしたテープはすぐ回収する。',
  ...SRC.cfaChoke,
};

export const HOME_PLAYS: HomePlay[] = [
  // ─────────────────────────── 0歳から ───────────────────────────
  {
    id: 'nuno-hirahira',
    name: '布ひらひら・いないいないばあ',
    summary: 'ガーゼやハンカチを顔の上でひらひら。追視と「ばあ」で笑う、寝転んだままの定番。',
    ageMonths: { min: 3, max: 12 },
    ageBasis: '首すわりは4〜5か月未満で90%以上が可能（厚労省 乳幼児身体発育調査）',
    items: ['ガーゼ・ハンカチ・薄いタオル'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 5,
    place: 'futon',
    steps: [
      '親は横に寝転び、赤ちゃんの顔の30cmくらい上で布をゆっくり左右に動かす',
      '布を自分の顔にかけて「いない いない…ばあ」。3回に1回はテンポを変える',
      '布の端を赤ちゃんに握らせて、軽く引っぱりっこ',
    ],
    nextVariants: ['布を赤ちゃんのお腹にふわっと落として「とんだ」', '親の足に布をかけて「あしが消えた」'],
    safety: [
      {
        text: '掛け物は子どもが払いのけられる軽いものにし、顔にかぶらないようにする（消費者庁）。布を顔に置いたまま離れない。',
        ...SRC.caaBedding,
      },
    ],
    evidence: [{ media: 'articles', label: '0〜1歳向け上位記事9本に登場（布遊び・いないいないばあ）' }],
    needs: ['parentLying', 'evening'],
  },
  {
    id: 'teasobi-uta',
    name: '手遊び歌・ふれあい遊び',
    summary: '「いっぽんばし」「あたま かた ひざ ポン」。道具ゼロ・準備ゼロ、寝転んだままでもできる。',
    ageMonths: { min: 2, max: 36 },
    items: [],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 5,
    place: 'futon',
    steps: [
      '0歳: 「いっぽんばし こちょこちょ」を手のひら→足の裏→お腹の順に',
      '1歳: 「あたま かた ひざ ポン」を親が寝転んだまま、子の体を触って進める',
      '2歳〜: 「むすんで ひらいて」で最後の「その手を○○に」を子に決めさせる',
    ],
    nextVariants: ['足で「尺取り虫」（寝転んで両足を伸ばし、子を足の上に乗せて上下）', '親の両足でトンネルを作ってくぐらせる'],
    safety: [],
    evidence: [
      { media: 'articles', label: '上位記事14本に登場' },
      { media: 'qa', label: '知恵袋で「親が疲れない遊び」として推奨（足で尺取り虫）' },
    ],
    needs: ['parentLying', 'evening', 'siblingFeeding'],
  },
  {
    id: 'sensory-bag',
    name: 'センサリーバッグ（ジップロック＋保冷剤のジェル）',
    summary: '袋の上から押す・つぶす。汚れない感触遊びの代表。寝転んだままでも渡せる。',
    ageMonths: { min: 4, max: 24 },
    items: ['ジップロック（冷凍用の厚手）', '保冷剤の中身のジェル、または水＋少しの油', 'ボタン・ビーズ・目玉シール（あれば）', 'テープ'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 0,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 10,
    place: 'futon',
    steps: [
      '袋にジェル（保冷剤1個分）と、動かして遊ぶ物を数個入れ、空気を抜いて閉じる',
      'もう1枚の袋に入れて二重にし、口をテープで留める',
      '床に置いて、上から押す・指で中の物を動かす。0歳は親が手を添える',
    ],
    nextVariants: ['床にテープで固定して「窓」にする（はいはい期）', '中の目玉シールを「モンスター」にして追いかけっこ'],
    safety: [
      {
        text: '袋をかじって破片が出ると窒息のおそれ（こども家庭庁）。二重にしてテープで留め、噛む子は親の目の前だけで。',
        ...SRC.cfaChoke,
      },
      MOUTH,
    ],
    evidence: [
      { media: 'instagram', label: '@renamama_asobi 34万再生／@yuri_chiiku 29万再生' },
      { media: 'youtube', label: 'おりん「ムニムニバッグ」300万回' },
    ],
    needs: ['parentLying', 'siblingFeeding', 'alone10', 'evening'],
  },
  {
    id: 'sensory-bottle',
    name: 'センサリーボトル（ペットボトル＋水＋ビーズ）',
    summary: '振る・転がす・眺める。一度作れば何か月も使え、静かで汚れない。',
    ageMonths: { min: 4, max: 24 },
    items: ['小さめのペットボトル', '水', 'ボタン・ビーズ・ストローの切れ端など', '食紅や絵の具（あれば）', 'テープ'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 0,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 10,
    place: 'futon',
    steps: [
      'ペットボトルに水を7分目、中に入れる物を数個。色をつけるなら食紅を1滴',
      'フタを閉め、フタの周りをテープでぐるぐる巻いて開かないようにする',
      '寝転んだ子の横で転がす／座れる子は振らせる',
    ],
    nextVariants: ['水の代わりに洗濯のりを入れるとゆっくり落ちる（100均）', '2本作って音の違いを聞き比べ'],
    safety: [
      { text: 'フタが開くと中の小物を誤飲するおそれ。フタはテープで固定し、緩んだら作り直す。口は直径約4cm（消費者庁）。', ...SRC.caaMouth },
    ],
    evidence: [{ media: 'youtube', label: 'ゆか「100均オーロラセンサリーボトル」40万回' }],
    needs: ['parentLying', 'siblingFeeding', 'alone10'],
  },
  {
    id: 'mugen-tissue',
    name: '無限ティッシュ（ティッシュ箱＋ハンカチ）',
    summary: '引っぱっても引っぱっても出てくる。ティッシュを全部出したい1歳の欲求を安全に消化。',
    ageMonths: { min: 6, max: 18 },
    ageBasis: 'ひとりすわりは9〜10か月で90%以上（厚労省）。座って両手が使える頃から',
    items: ['空のティッシュ箱', 'ハンカチ・ガーゼ・靴下など布5〜8枚'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 1,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 10,
    place: 'futon',
    steps: [
      '布の端と端を軽く結んで1本につなぐ',
      'ティッシュ箱の取り出し口から端を少し出して、残りを箱に詰める',
      '渡して、出し切ったら親が詰め直す。3回目からは子が詰めようとするので待つ',
    ],
    nextVariants: ['布の代わりにスカーフを使うと長く伸びて盛り上がる', 'ペットボトルの口からリボンを引く「無限リボン」'],
    safety: [{ text: 'ひもや布が首に巻きつかない長さ（1本30cm以内）にして、結び目でつなぐ。', ...SRC.cfaChoke }],
    evidence: [
      { media: 'instagram', label: '「#無限ティッシュ」の家庭アカウント投稿多数／@choko_asobi 3万再生' },
      { media: 'youtube', label: 'りぃ「無限リボン」2.8万回' },
    ],
    needs: ['parentLying', 'alone10', 'siblingFeeding'],
  },
  {
    id: 'shinbun-biribiri',
    name: '新聞紙びりびり→丸めて玉入れ→ゴミ袋ボール',
    summary: '破る・ちらす・丸めて投げる・最後は袋に詰めて大玉に。片付けまでが遊びで、ゴミ袋1枚で終わる。',
    ageMonths: { min: 8, max: 42 },
    items: ['新聞紙・チラシ 10枚以上', '洗濯かご・段ボール箱', 'ゴミ袋（45L）'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 3,
    parentPosture: 'sitting',
    energy: 3,
    durationMin: 20,
    place: 'living',
    steps: [
      '親が最初の1枚を「びりっ」と大きく破ってみせる。1歳は端を持たせて一緒に',
      '破った紙を上から降らせる「新聞の雪」。2歳は自分で投げ上げる',
      '丸めてボールにして、かごに投げ入れる。距離を少しずつ離す',
      '最後に全部ゴミ袋へ詰めて口を縛り、大玉にして蹴る・転がす',
    ],
    nextVariants: ['新聞紙を床に敷いて「島」にし、島から島へジャンプ', '丸めた玉を足の指でつかんで運ぶ', '2歳後半〜: 新聞紙とテープでテントを作って中で絵本'],
    safety: [
      { text: '0歳〜1歳前半は紙を口に入れる。誤飲は9か月がピーク（東京消防庁）。口に入れた紙はその場で取り出し、遊びは親の目の前だけで。', ...SRC.tfdChoke },
    ],
    evidence: [
      { media: 'instagram', label: 'トピック「新聞紙遊び」リール6.9万本／@soramame_kids 18.8万再生／@challenge_kids_otakanomori 9.6万再生' },
      { media: 'youtube', label: 'ぽんちゃんの保育のじかん「新聞テント」120万回／mocaちゃんTime「新聞紙あそび10種類」24万回' },
      { media: 'articles', label: '上位記事15本に登場（0〜2歳で最多クラス）' },
      { media: 'qa', label: '知恵袋の雨の日スレッド8件中4件で回答者が推奨' },
    ],
    needs: ['tired', 'rainy', 'bored', 'evening'],
  },
  {
    id: 'potton-otoshi',
    name: 'ぽっとん落とし（空き箱・ミルク缶に落とす）',
    summary: '穴に入れて「ぽとん」と落ちる音を聞く。1歳前後が黙って10分続ける、SNSで最も伸びている家遊び。',
    ageMonths: { min: 10, max: 30 },
    ageBasis: '「つまむ・つかむ」は乳児の手指の発達の内容（保育所保育指針）。ひとりすわり9〜10か月〜',
    items: ['空き箱（ティッシュ箱・靴箱）またはミルク缶', '落とす物: ペットボトルのキャップを2個貼り合わせた物、ヨーグルトのカップ、洗濯ばさみ など'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 10,
    place: 'living',
    steps: [
      '箱のフタに、落とす物より少し大きい穴をカッターで開ける（縁はテープで覆う）',
      'キャップは2個を背中合わせにテープで貼って、口に入らない大きさにする',
      '親が1個落として音を聞かせる。あとは子のペース。全部落としたらフタを開けて「じゃーん」',
    ],
    nextVariants: ['穴を2種類にして大きい物・小さい物を分ける', 'ミルク缶なら排水口カバーの穴に細い物を差す（100均）', '靴箱の横に出口を作って「無限ぽっとん」'],
    safety: [
      { text: 'キャップ1個は直径約3cmで口（約4cm）に入る（消費者庁）。必ず2個貼り合わせるかヨーグルトのカップなど大きい物を使い、遊びは親の目の前で。', ...SRC.caaMouth },
    ],
    evidence: [
      { media: 'instagram', label: 'トピック「ぽっとん落とし」リール2.8万本／@macopi_asobi 140万再生／@mukun_mama 82万再生／@shachi_asobi 57万再生／@rii_asobi 35万再生' },
      { media: 'articles', label: '上位記事7本に登場' },
    ],
    needs: ['alone10', 'siblingFeeding', 'parentLying', 'evening'],
  },
  {
    id: 'gyunyu-pack-kawarie',
    name: '牛乳パックのおもちゃ（回転変わり絵・ボタン押し・鈴入り積み木）',
    summary: '洗った牛乳パック1本で5分。回す・押す・積むの3種類が作れる。',
    ageMonths: { min: 12, max: 30 },
    items: ['洗って乾かした牛乳パック', 'テープ・はさみ', '鈴やビーズ（積み木用、あれば）', '油性ペン'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 0,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 10,
    place: 'living',
    steps: [
      '回転変わり絵: パックを縦半分に切り、内側に2つの絵を描いて筒状にし、回すと絵が変わる',
      'ボタン押し: パックの底を四角く切り抜き、内側からキャップを押し込んで「ボタン」に',
      '鈴入り積み木: 4分の1に切って鈴を入れ、テープで閉じる。振ると音、積むと崩れる',
    ],
    nextVariants: ['パックを2本つないで踏み台にする（理学療法士の投稿で人気）', '中に米を入れてマラカスに'],
    safety: [{ text: '中の鈴やビーズが出ないよう、テープで全面を覆う。口は直径約4cm（消費者庁）。', ...SRC.caaMouth }],
    evidence: [
      { media: 'instagram', label: '@isamusasagawa 65万再生／@fumi___ikuji 変わり絵 44万再生／@marihana__asobi ボタン 10万再生「5分で完成」／@uta_asobi_ouchi 踏み台 27万再生' },
    ],
    needs: ['alone10', 'bored', 'rainy'],
  },
  {
    id: 'yojo-tape-michi',
    name: '養生テープ・マステの道路と剥がし',
    summary: '床にテープを貼るだけで道路・線路・ジャンプ線になる。10秒で用意でき、剥がすのも遊び。',
    ageMonths: { min: 12, max: 42 },
    items: ['養生テープまたはマスキングテープ', 'ミニカーやぬいぐるみ（あれば）'],
    itemsFrom: 'home',
    prepMin: 1,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 2,
    durationMin: 15,
    place: 'living',
    steps: [
      '床に1〜2mの線を貼る。1歳は線の上を歩く・またぐ',
      '2歳は道路にしてミニカーを走らせる。交差点や駐車場を追加',
      '飽きたら「全部はがして」。1歳半〜は剥がす方が長く続く',
    ],
    nextVariants: ['線と線の間を「川」にしてジャンプ', '壁の低い位置に貼って剥がす（座ったまま）', 'テープを丸めてボールにして的当て'],
    safety: [{ text: '剥がしたテープは丸めて口に入れやすい。剥がした端からすぐ回収する（包装フィルム類の窒息注意）。', ...SRC.cfaChoke }],
    evidence: [
      { media: 'youtube', label: '八朗園長TV「養生テープだけで出来るおもちゃ」39万回「10秒で出来る」' },
      { media: 'articles', label: '上位記事4本に登場（テープ迷路・ジャンプチャレンジ）' },
    ],
    needs: ['tired', 'rainy', 'alone10', 'bored'],
  },
  {
    id: 'balloon-rally',
    name: '風船ラリー・風船ベッド・風船たいこ',
    summary: '風船1袋で3種類。落とさないよう追いかける「ラリー」は2歳の体力を確実に削る。',
    ageMonths: { min: 6, max: 48 },
    items: ['風船（家にあれば）', '布団カバーか大きな袋（ベッド用）', '空き箱（たいこ用）'],
    itemsFrom: 'home+100',
    prepMin: 2,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 3,
    durationMin: 15,
    place: 'living',
    steps: [
      'ラリー: 親は座ったまま風船を上に打つ。子は落とさないように追う。「10回続けよう」で数える',
      'ベッド: 膨らませた風船10個を布団カバーに入れて口を縛る。上に寝転ぶ・座る（0歳〜）',
      'たいこ: 空き箱の上に風船をテープで貼り、手で叩く（1歳）',
    ],
    nextVariants: ['うちわで風船を打つ「風船バレー」（2歳後半〜）', '風船に顔を描いて「追いかけっこ」', '天井近くに投げて落ちてくるまで数える'],
    safety: [BALLOON],
    evidence: [
      { media: 'youtube', label: 'りぃ「風船気球」31万回／トモニテ「暴れる風船」21万回／あいぽん「風船たいこ」6.2万回' },
      { media: 'articles', label: '上位記事15本に登場' },
      { media: 'qa', label: '知恵袋「体力が余って寝ない」スレッドで風船ラリーが推奨' },
    ],
    needs: ['tired', 'rainy', 'bored'],
  },
  {
    id: 'futon-yama',
    name: '布団の山・クッション飛び込み・おうちアスレチック',
    summary: '布団と座布団を積むだけ。登る・転がる・飛び込むで、上位記事に最も多く出る「疲れさせる」遊び。',
    ageMonths: { min: 12, max: 48 },
    ageBasis: 'ひとり歩きは1歳3〜4か月で90%以上（厚労省）。歩き始めからは「登る」が主',
    items: ['敷布団・掛け布団', '座布団・クッション', '（コース用に）椅子'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 3,
    parentPosture: 'standing',
    energy: 3,
    durationMin: 20,
    place: 'futon',
    steps: [
      '敷布団を2つ折りにして山を作り、掛け布団で覆う。周りの硬い物（テーブルの角・おもちゃ）をどける',
      '山を登る→反対側へ転がり降りる。1歳はハイハイで、2歳は歩いて',
      '2歳後半〜: 椅子の下をくぐる→山を登る→座布団の島をジャンプ、のコースにして「3周」',
    ],
    nextVariants: ['布団を筒状に丸めてトンネル', '掛け布団を親が持ち上げて「布団トンネル」を高く低く', '最後は布団に寝転んで絵本に切り替える（動→静）'],
    safety: [
      FALL,
      CUSHION,
      { text: '掛け布団は子が払いのけられる軽いもので、顔にかぶらないように（消費者庁）。0歳は山遊びをしない。', ...SRC.caaBedding },
    ],
    evidence: [
      { media: 'articles', label: '上位記事17本に登場（0〜2歳で最多）' },
      { media: 'instagram', label: '@marika_0asobi 室内運動9選 120万再生' },
      { media: 'qa', label: '知恵袋「雨で体力が余る」スレッドで布団トンネル・お馬さんが推奨' },
    ],
    needs: ['tired', 'rainy', 'bored'],
  },
  {
    id: 'shitsunai-undo',
    name: '室内運動（ジャンプ・ハイハイ競争・線の上バランス・動物歩き）',
    summary: '道具ゼロ。「ペンギン歩き」「くまさん歩き」「線の上を歩く」を親の号令で回す。SNSで120万再生。',
    ageMonths: { min: 12, max: 60 },
    items: [],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'standing',
    energy: 3,
    durationMin: 15,
    place: 'living',
    steps: [
      '1歳: 親と手をつないで「ペンギン歩き」（親の足の甲に子の足を乗せて歩く）',
      '2歳: 「くまさん」（四つんばい）→「うさぎ」（両足ジャンプ）→「へび」（腹ばい）を親が言った順に',
      '3歳〜: 床の線（テープや畳の縁）の上を落ちずに歩く。後ろ向きもやる',
    ],
    nextVariants: ['「音楽が止まったらストップ」のストップゲーム', '親が動物の名前を言い間違えて子に直させる', 'ハイハイ競争は親も本気で'],
    safety: [{ text: 'ジャンプや競争は周囲に硬い物がない場所で。家具からの転落事故は0歳〜1歳に多い（消費者庁）。', ...SRC.caaFall }],
    evidence: [
      { media: 'instagram', label: '@marika_0asobi「室内運動9選」120万再生' },
      { media: 'youtube', label: 'れなまま「準備1分！室内運動遊び」322万回「体力おばけがヘトヘトに」「よく眠る」' },
      { media: 'articles', label: '上位記事13本（ダンス・体操含む）' },
    ],
    needs: ['tired', 'rainy', 'evening'],
  },
  {
    id: 'kaichudento-oikake',
    name: '懐中電灯のライト追いかけ・影絵',
    summary: '部屋を暗くして床に光を当てるだけ。子が光を追いかけて走り回り、親は座ったまま。',
    ageMonths: { min: 12, max: 48 },
    items: ['懐中電灯またはスマホのライト'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'sitting',
    energy: 2,
    durationMin: 10,
    place: 'living',
    steps: [
      'カーテンを閉めて部屋を暗めに。床に光の丸を出して「つかまえて」',
      '光をゆっくり動かし、子が踏んだら「つかまった！」。壁に上げると背伸びする',
      '壁に手の影で犬・鳥を作る。2歳は自分の影で「大きくなった」',
    ],
    nextVariants: ['ぬいぐるみに光を当てて「見つけた」の宝探し', '寝る前は光を天井に当てて動かし、ゆっくり静かに（入眠へ）'],
    safety: [
      { text: '走って追う遊びは家具の角から離れた場所で。転倒・転落は0〜1歳の事故で最も多い（こども家庭庁）。', ...SRC.cfaFall },
      { text: '懐中電灯の電池（特にボタン電池）は誤飲すると化学やけどの危険。電池蓋がねじ止めの物を使い、子に分解させない（消費者庁）。', ...SRC.caaBattery },
    ],
    evidence: [
      { media: 'articles', label: '「2歳を疲れさせる」上位2本で「大人は座ったまま」の遊びとして紹介' },
      { media: 'instagram', label: 'ほいくる「かげ絵」ほか影絵投稿多数' },
    ],
    needs: ['tired', 'evening', 'parentLying', 'rainy'],
  },
  {
    id: 'kamikoppu',
    name: '紙コップ（積む・釣り・ロケット・電話）',
    summary: '紙コップ10個で4種類。積んで崩すは1歳、ストロー釣りとロケットは2歳から。',
    ageMonths: { min: 12, max: 60 },
    items: ['紙コップ 10個', '輪ゴム（ロケット用）', 'ストロー・毛糸・テープ（釣り用）'],
    itemsFrom: 'home',
    prepMin: 2,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 10,
    place: 'living',
    steps: [
      '積む: 逆さにして重ねるだけ。1歳は3個、2歳はピラミッド。崩すのが目的',
      '釣り: 紙コップの縁にテープで毛糸を貼り、ストローに毛糸を結んで釣り竿に。コップを引っかけて釣る',
      'ロケット: コップの縁に切り込み4か所→輪ゴムを十字にかける→別のコップにかぶせて押して離すと飛ぶ',
    ],
    nextVariants: ['コップに数字を書いて「3を釣って」', 'コップの底に穴を開けて糸電話', 'コップを並べてボール（丸めた靴下）を投げ入れる'],
    safety: [{ text: '輪ゴムは口に入る大きさ。ロケットは2歳半〜、輪ゴムは遊び終わりに親が回収する（口は直径約4cm）。', ...SRC.caaMouth }],
    evidence: [
      { media: 'instagram', label: '@shizuku_asobi ストロー毛糸釣り 88万再生／@chiii_asobi ロケット 6.2万再生' },
      { media: 'articles', label: '上位記事6本（タワー・ボウリング・ロケット）' },
    ],
    needs: ['alone10', 'siblingFeeding', 'bored', 'evening'],
  },
  {
    id: 'sentakubasami',
    name: '洗濯ばさみつまみ・紙皿の生き物',
    summary: '洗濯ばさみを紙皿や箱の縁にはさむ。指先を使うので静かに集中し、2歳の「ひとりで10分」に向く。',
    ageMonths: { min: 20, max: 60 },
    ageBasis: '「つまむ、めくるなどの指先の機能」は1歳以上3歳未満の発達（保育所保育指針）',
    items: ['洗濯ばさみ 10個', '紙皿・空き箱・厚紙'],
    itemsFrom: 'home',
    prepMin: 2,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 10,
    place: 'living',
    steps: [
      '親が紙皿の縁に1個はさんでみせる。外す方が簡単なので、最初は「外して」から',
      '紙皿に顔を描き、洗濯ばさみを「たてがみ」「足」にしてライオン・カニに',
      '2歳後半〜: 色つきの洗濯ばさみを色ごとに分けてはさむ',
    ],
    nextVariants: ['自分の服の裾にはさんで「しっぽ」', '洗濯物を一緒に干す（本物の家事へ）'],
    safety: [{ text: 'ばねが強い洗濯ばさみは指をはさむ。弱いもの・大きめのものを選び、最初は親が横で見る。', ...SRC.cfaFall }],
    evidence: [
      { media: 'instagram', label: '@chiii_asobi 紙皿＋洗濯ばさみの生き物 230万再生' },
      { media: 'articles', label: '上位記事5本' },
    ],
    needs: ['alone10', 'siblingFeeding', 'evening'],
  },
  {
    id: 'katakuriko-slime',
    name: '片栗粉スライム（握ると固い・離すと流れる）',
    summary: '片栗粉と水だけ。握ると固まり、手を開くと流れる不思議な感触。袋や風船に入れれば汚れない。',
    ageMonths: { min: 12, max: 60 },
    items: ['片栗粉 1カップ', '水 約半カップ', 'ボウル・トレー', '食紅（あれば）', 'ジップロック（汚れない版）'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 10,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 20,
    place: 'kitchen',
    steps: [
      '片栗粉に水を少しずつ加えて、握ると固まり・離すと流れる固さに',
      '床に新聞紙かレジャーシートを敷き、トレーに入れて手で触らせる',
      '汚れない版: ジップロックに入れて空気を抜き、袋の上から押す（1歳前半向け）',
    ],
    nextVariants: ['色氷を落として溶ける様子を見る', 'スプーンですくって別の容器に移す（1歳半〜）', '風船に入れて口を縛り「ぷにぷにボール」'],
    safety: [
      { text: '食品由来だが食べる物ではない。口に入れたらすぐ出させる。小さい子は親の目の前だけで。', ...SRC.caaMouth },
    ],
    evidence: [
      { media: 'youtube', label: 'あお「カチカチ？とろとろ？不思議な液体」340万回／ねる「とろとろ感触ふうせん」40万回' },
      { media: 'instagram', label: '@aihoikuennishishinjuku 10.7万再生' },
    ],
    needs: ['rainy', 'bored', 'alone10'],
  },
  {
    id: 'kori-asobi',
    name: '氷遊び（卵パックの色氷・宝物氷）',
    summary: '前の晩に卵パックへ水と食紅を入れて凍らせるだけ。夏の室内で30分もつ。',
    ageMonths: { min: 12, max: 60 },
    items: ['卵パックまたは製氷皿', '水', '食紅・絵の具（あれば）', '小さなおもちゃ（宝物氷用・口に入らない大きさ）', 'ボウル・トレー'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 3,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 30,
    place: 'kitchen',
    season: 'summer',
    steps: [
      '前夜: 卵パックに水を入れ、食紅を1滴ずつ違う色に。冷凍庫へ',
      '当日: トレーに出して、触る・並べる・溶けるのを見る。2歳は「どの色が早く溶けるか」',
      '宝物氷: 容器に大きめのおもちゃを入れて凍らせ、ぬるま湯やスプーンで掘り出す',
    ],
    nextVariants: ['氷で画用紙に絵を描く（色氷お絵描き）', 'お風呂に浮かべる', '塩をかけて溶かす（3歳〜）'],
    safety: [
      { text: '宝物氷のおもちゃは口（直径約4cm）に入らない大きさだけ（消費者庁）。冷たすぎるときは手を休ませる。', ...SRC.caaMouth },
    ],
    evidence: [
      { media: 'youtube', label: 'りぃ「捨ててたアレで作るきらきら氷」571万回／おりん「ひんやり氷遊び」201万回「材料2つ準備5分」' },
      { media: 'instagram', label: '@kana_mama1010 氷遊び3選 2.3万再生ほか多数' },
    ],
    needs: ['rainy', 'bored', 'alone10'],
  },
  {
    id: 'kanten-hakkutsu',
    name: '寒天・ゼラチンの発掘遊び',
    summary: '粉寒天を固めて、中に入れたおもちゃをスプーンで掘り出す。ぷるぷるの感触で1歳から。',
    ageMonths: { min: 12, max: 48 },
    items: ['粉寒天またはゼラチン', '水', 'タッパー', 'スプーン', '大きめのおもちゃ', '食紅（あれば）'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 5,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 20,
    place: 'kitchen',
    steps: [
      '前夜: 寒天を袋の表示どおり煮溶かし、タッパーに流しておもちゃを沈める。冷蔵庫で固める',
      '当日: トレーに出し、手でつぶす・スプーンで掘る',
      '掘り出したおもちゃを洗って「救出」',
    ],
    nextVariants: ['色を2層にして「地層」', '氷と一緒に出して温度の違いを触る'],
    safety: [{ text: '中のおもちゃは口に入らない大きさだけ。寒天も口に入れたら出させる（口は直径約4cm）。', ...SRC.caaMouth }],
    evidence: [
      { media: 'instagram', label: '@ai_hoiku_room「2歳の感触遊び5選」12.4万再生／@renamama_asobi ゼラチン発掘 17.9万再生' },
      { media: 'youtube', label: 'ゆか 寒天遊び 12万回' },
    ],
    needs: ['rainy', 'bored', 'alone10'],
  },
  {
    id: 'komugiko-nendo',
    name: '小麦粉粘土',
    summary: '小麦粉・塩・油・水で5分。市販粘土より柔らかく1歳から握れる。小麦アレルギーの子には作らない。',
    ageMonths: { min: 12, max: 60 },
    items: ['小麦粉 2カップ', '塩 大さじ1', 'サラダ油 大さじ1', '水 約半カップ', '食紅（あれば）'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 5,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 20,
    place: 'kitchen',
    steps: [
      'ボウルで粉と塩を混ぜ、油と水を少しずつ加えて耳たぶの固さにこねる',
      '1歳: ちぎる・つぶす・棒状にして「へび」',
      '2歳〜: 型抜き（コップの口）、丸めて「おだんご」、ペットボトルのキャップで模様',
    ],
    nextVariants: ['乾かして色を塗る', '塩を多めにすると日持ちする（冷蔵で数日）'],
    safety: [WHEAT],
    evidence: [{ media: 'articles', label: '上位記事13本に登場（1〜3歳の定番）' }],
    needs: ['rainy', 'bored', 'alone10'],
  },
  {
    id: 'ofuro-rejibukuro',
    name: 'お風呂遊び（レジ袋の水・ペットボトルシャワー・タオルくらげ）',
    summary: 'お風呂を嫌がる日に、家にある3つで「入りたくなる」。夕方の切り替えにも。',
    ageMonths: { min: 12, max: 48 },
    items: ['レジ袋', 'ペットボトル（キリで穴を数か所）', 'フェイスタオル', '（あれば）洗面器・コップ'],
    itemsFrom: 'home',
    prepMin: 1,
    cleanupMin: 0,
    parentPosture: 'standing',
    energy: 2,
    durationMin: 15,
    place: 'bath',
    steps: [
      'レジ袋に水を入れて持たせる。重さ・揺れ・穴を開けて出る水を楽しむ',
      'ペットボトルの側面に穴を開け、水を入れてシャワーに。頭からかけない子は自分の手に',
      'タオルくらげ: 濡らしたタオルを湯に広げ、真ん中を持ち上げて空気を包み「ぷくっ」',
    ],
    nextVariants: ['洗面器に泡ソープでぶくぶく', '食紅1滴で色風呂', 'ペットボトルのキャップを浮かべてコップですくう'],
    safety: [DROWN, BATH],
    evidence: [
      { media: 'youtube', label: 'Yahoo!ニュース ぽん先生（保育士）「お風呂で遊べる家にある4つのもの」', url: 'https://news.yahoo.co.jp/expert/articles/b778d0fce491314545aaa6f696b9a1e2119d3d69' },
      { media: 'articles', label: '「お風呂遊び 家にあるもの」上位9本に登場（溺水の注意を書いた記事は0本）' },
    ],
    needs: ['bath', 'evening', 'tired'],
  },
  {
    id: 'pet-bowling',
    name: 'ペットボトルボウリング・マラカス',
    summary: '空のペットボトルを並べて丸めた靴下や新聞紙ボールで倒す。倒しに行く往復で体力を使う。',
    ageMonths: { min: 15, max: 60 },
    items: ['空のペットボトル 5〜6本', '丸めた靴下・新聞紙ボール', '（マラカス用）米・ビーズ、テープ'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 1,
    parentPosture: 'sitting',
    energy: 2,
    durationMin: 15,
    place: 'living',
    steps: [
      'ペットボトルを三角に並べる。倒れやすいよう空のまま（重くするなら少し水）',
      '1〜2m離れてボールを転がす。1歳は手で押して倒すだけで十分',
      '倒れたら子が自分で立て直す（ここが一番時間を使う）',
    ],
    nextVariants: ['ボトルに顔を描いて「おばけ倒し」', 'ボトルに米を入れてフタを固定し、マラカスにして踊る'],
    safety: [{ text: 'ペットボトルのキャップ（直径約3cm）は口に入る。マラカスはキャップをテープで固定し、外れたキャップはすぐ回収（消費者庁）。', ...SRC.caaMouth }],
    evidence: [
      { media: 'articles', label: '上位記事5本' },
      { media: 'qa', label: '知恵袋「雨続きで体力が余る」スレッドで推奨' },
    ],
    needs: ['tired', 'rainy', 'bored'],
  },
  {
    id: 'danboru-tunnel',
    name: '段ボールトンネル・ハウス',
    summary: '段ボール箱の底を抜いてつなぐだけでトンネル。ハイハイ期から3歳まで使い方が変わる。',
    ageMonths: { min: 8, max: 42 },
    ageBasis: 'はいはいは9〜10か月で90%以上（厚労省）',
    items: ['段ボール箱 2〜3個', 'ガムテープ', 'カッター（親用）'],
    itemsFrom: 'home',
    prepMin: 5,
    cleanupMin: 2,
    parentPosture: 'sitting',
    energy: 2,
    durationMin: 15,
    place: 'living',
    steps: [
      '箱の底と上を開けて筒にし、2〜3個をテープでつなぐ。切り口はテープで覆う',
      'はいはい期: 親が反対側から顔を出して呼ぶ',
      '2歳〜: 箱1個に窓を開けて「おうち」。中で絵本・ぬいぐるみ',
    ],
    nextVariants: ['箱に入って親が引っぱる「電車」', '箱の側面に絵を描く（クレヨン持ち込み）', '箱をつぶして「坂」にして車を転がす'],
    safety: [{ text: '切り口で手を切らないようテープで覆う。上に登る子は箱がつぶれて転倒するので、ハウスは登らせない（転落・転倒はこども家庭庁）。', ...SRC.cfaFall }],
    evidence: [
      { media: 'articles', label: '上位記事14本' },
      { media: 'instagram', label: '@niconico_mamasta 段ボールスマホ 27.6万再生ほか' },
    ],
    needs: ['rainy', 'bored', 'alone10', 'tired'],
  },
  {
    id: 'takara-sagashi',
    name: '宝探し（ぬいぐるみ隠し・色探し）',
    summary: 'ぬいぐるみを3つ隠して「見つけて」。親は座ったままヒントを出すだけで、子は家中を走る。',
    ageMonths: { min: 20, max: 60 },
    items: ['ぬいぐるみ・おもちゃ 3個'],
    itemsFrom: 'home',
    prepMin: 1,
    cleanupMin: 0,
    parentPosture: 'sitting',
    energy: 2,
    durationMin: 10,
    place: 'living',
    steps: [
      '子に目をつぶらせて（最初は親が隠すのを見ていてもよい）3個を隠す',
      '「あったかい／つめたい」でヒント。2歳は「ソファの下」と言葉で',
      '見つけたら今度は子が隠す番。ここから長くなる',
    ],
    nextVariants: ['「赤いものを3つ持ってきて」の色探し', '「音がするものを探して」', '懐中電灯を持たせて暗い部屋で'],
    safety: [{ text: '高い場所・引き出しの中・キッチンには隠さない。家具に登っての転落は0歳〜1歳に多い（消費者庁）。', ...SRC.caaFall }],
    evidence: [{ media: 'articles', label: '上位記事7本' }],
    needs: ['tired', 'bored', 'siblingFeeding'],
  },
  {
    id: 'otetsudai',
    name: 'お手伝い遊び（洗濯物たたみ・雑巾がけ・靴そろえ）',
    summary: '1歳半からは家事そのものが遊び。親の家事が進み、子は満足する。',
    ageMonths: { min: 18, max: 60 },
    items: ['洗濯物', '雑巾・ウェットシート', '靴'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'standing',
    energy: 2,
    durationMin: 10,
    place: 'living',
    steps: [
      '洗濯物: タオルを渡して「半分こ」。たためなくても「かごに入れる」係にする',
      '雑巾がけ: 濡らした雑巾を渡して「線までよーいどん」。床がきれいになるおまけつき',
      '靴そろえ: 玄関で「ぜんぶ並べて」。数を数える',
    ],
    nextVariants: ['米とぎ（水を入れる係）', 'テーブル拭き', '洗濯ばさみを外す係（→洗濯ばさみ遊びへ）'],
    safety: [
      { text: 'キッチンでは電気ケトル・炊飯器の蒸気・コンロから離す。つかまり立ちでコードを引いて熱湯を浴びる事故がある（こども家庭庁）。', ...SRC.cfaBurn },
    ],
    evidence: [
      { media: 'articles', label: '上位記事4本' },
      { media: 'qa', label: '知恵袋3件で「家事を遊びに転用して親の時間も回る」と推奨' },
    ],
    needs: ['tired', 'evening', 'bored'],
  },
  {
    id: 'ehon-netenpo',
    name: '絵本（親は寝転んだまま）・タッチストーリー',
    summary: '親が寝転び、子を隣に。読むのがつらい日は「子どもが主役のお話」を小声でささやくだけ。',
    ageMonths: { min: 6, max: 72 },
    items: ['絵本'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'lying',
    energy: 1,
    durationMin: 10,
    place: 'futon',
    steps: [
      '親が仰向けに寝転び、絵本を胸の上に。子は隣か親の上に',
      '疲れている日は文字を読まず「これなに？」だけで進める',
      'タッチストーリー: 「○○ちゃんが公園に行きました」と子の名前で作り話。背中を指でなぞりながら',
    ],
    nextVariants: ['子に読んでもらう（覚えている本）', '図書館で借りて中身を入れ替える（Q&Aで最多の対処）'],
    safety: [],
    evidence: [
      { media: 'qa', label: '知恵袋の回答で最多（9件）。「親の負担が少ない遊び」として' },
      { media: 'articles', label: '上位記事12本／「疲れさせる」上位で「寝ながら可」と明記' },
    ],
    needs: ['parentLying', 'evening', 'siblingFeeding'],
  },
  {
    id: 'iromizu',
    name: '色水（ペットボトル・ジップロックで混色）',
    summary: '水に食紅や絵の具を1滴。赤と青を混ぜて紫になる瞬間を見る。1歳はボトルを振るだけ。',
    ageMonths: { min: 12, max: 60 },
    items: ['ペットボトル 3本', '水', '食紅・水彩絵の具', 'ジップロック（混色用）'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 3,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 15,
    place: 'kitchen',
    steps: [
      'ペットボトルに水と色をつけ、フタをテープで固定。1歳は振る・転がす',
      '2歳: 赤と黄の色水をジップロックに入れて袋の上からもむ→オレンジに',
      '3歳: コップに移して「ジュース屋さん」',
    ],
    nextVariants: ['お風呂に持ち込む', '氷にして翌日の氷遊びへ'],
    safety: [
      { text: '色水を飲ませない。「ジュース屋さん」は本物と区別がつく容器で。', ...SRC.caaMouth },
      DROWN,
    ],
    evidence: [{ media: 'articles', label: '上位記事5本' }],
    needs: ['rainy', 'bored', 'bath'],
  },
  {
    id: 'youtube-issho',
    name: 'テレビ・動画体操を「一緒に踊る」',
    summary: '見せっぱなしではなく親も一緒に踊る。罪悪感なく使える線引きと、時間の目安。',
    ageMonths: { min: 18, max: 72 },
    items: ['テレビ・スマホ'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 0,
    parentPosture: 'standing',
    energy: 3,
    durationMin: 15,
    place: 'living',
    steps: [
      '体操・ダンス動画を1本（5〜10分）だけ選び、親も立って一緒に踊る',
      '終わったら「もう1回」ではなく、動画で出てきた動きを画面を消してもう1回',
      '家事中に見せるなら「ご飯ができるまで」と終わりを先に言う',
    ],
    nextVariants: ['動画の歌を親が歌って画面なしで踊る', '雨の日の「動」の時間に固定'],
    safety: [
      { text: '日本小児科医会は「2歳までのテレビ・ビデオ視聴は控える」「メディア接触は1日2時間まで」を目安としている。', ...SRC.jpaMedia },
    ],
    evidence: [
      { media: 'qa', label: '知恵袋13件で動画を容認。「一緒に踊るなら罪悪感が薄い」「家事中だけ」の線引きが語られる' },
      { media: 'articles', label: '上位記事13本（ダンス・体操）' },
    ],
    needs: ['tired', 'rainy', 'evening'],
  },
  {
    id: 'gokko-30min',
    name: 'ごっこ遊び（お店・電車・お医者）を30分で切り上げる型',
    summary: '延々と付き合わされるごっこは「タイマーで30分」「親は客役で座る」にすると親がもつ。',
    ageMonths: { min: 24, max: 72 },
    ageBasis: '3歳「ままごと、ヒーローごっこなど、ごっこ遊びができますか」（母子健康手帳）。2歳は大人と一緒に簡単なごっこ（保育所保育指針解説）',
    items: ['家にある物（空き箱・ぬいぐるみ・タオル）'],
    itemsFrom: 'home',
    prepMin: 0,
    cleanupMin: 3,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 30,
    place: 'living',
    steps: [
      '親は「お客さん」「患者さん」の座る役を選ぶ。動く役は子',
      'キッチンタイマーを30分にセットして「鳴ったらおしまい」を先に言う',
      '終わりの5分は「片付けもお店の仕事」にする',
    ],
    nextVariants: ['空き箱にお金（新聞紙を丸めた物）で「お会計」', 'ぬいぐるみを患者にして注射（ストロー）', '段ボールハウスを「お店」に'],
    safety: [],
    evidence: [
      { media: 'qa', label: '知恵袋6件で推奨、一方「延々つき合わされる」悩みも。回答「30分で切り上げでOK」' },
      { media: 'articles', label: '上位記事10本' },
    ],
    needs: ['siblingFeeding', 'bored', 'evening'],
  },
  {
    id: 'harusame-sponge',
    name: '0歳の感触遊び（春雨・スポンジ・プチプチ）',
    summary: 'ゆでた春雨、濡らしたスポンジ、緩衝材。口に入れても比較的安心な物から、6か月ごろ。',
    ageMonths: { min: 6, max: 15 },
    ageBasis: '乳児は「様々なものに触れ、手触りなどに気付き、感覚の働きを豊かにする」（保育所保育指針）',
    items: ['春雨（ゆでて冷ます）', '食器用スポンジ（新品）', '緩衝材のプチプチ', 'トレー'],
    itemsFrom: 'home',
    prepMin: 3,
    cleanupMin: 3,
    parentPosture: 'sitting',
    energy: 1,
    durationMin: 10,
    place: 'kitchen',
    steps: [
      '春雨: ゆでて冷まし、トレーに。手でつかむ・にぎる。食紅で色をつけると見た目で喜ぶ',
      'スポンジ: 濡らして絞る・押す。乾いた物と濡れた物を交互に',
      'プチプチ: 親が押して「ぱちっ」の音。赤ちゃんは手のひらで押す',
    ],
    nextVariants: ['春雨をジップロックに入れて袋の上から', 'スポンジを浴槽で'],
    safety: [
      { text: 'プチプチの破片や春雨をのどに詰めることがある。窒息は0歳の事故で圧倒的に多い（こども家庭庁）。親が向かい合って、口に入れたらすぐ出す。', ...SRC.cfaChoke },
      BAG,
    ],
    evidence: [
      { media: 'instagram', label: '@kidsgardenwakaba 色つき春雨 12.3万再生' },
      { media: 'articles', label: '0歳向け上位記事6本（プチプチ）' },
    ],
    needs: ['rainy', 'bored'],
  },
];

// ─────────────────────────── アクセサ ───────────────────────────

const BY_ID = new Map(HOME_PLAYS.map((p) => [p.id, p]));

export function getHomePlay(id: string): HomePlay | undefined {
  return BY_ID.get(id);
}

export function getHomePlays(ids: string[]): HomePlay[] {
  return ids.map((id) => BY_ID.get(id)).filter((p): p is HomePlay => !!p);
}

/** 記事の quickInfo.ageRanges（'0-1' | '2-3' | '4-6'）→ 月齢レンジ */
export function ageRangeToMonths(range: string): { min: number; max: number } | null {
  switch (range) {
    case '0-1':
      return { min: 0, max: 23 };
    case '2-3':
      return { min: 24, max: 47 };
    case '4-6':
      return { min: 48, max: 83 };
    default:
      return null;
  }
}

function overlaps(a: { min: number; max: number }, b: { min: number; max: number }): boolean {
  return a.min <= b.max && b.min <= a.max;
}

/**
 * 「今日のおうち遊び」: 年齢帯と困りごとに合う遊びを日替わりで3件返す。
 * 同じ日は同じ結果（date の日付でシード）。needs が無ければ年齢だけで絞る。
 */
export function pickHomePlaysForToday(opts: {
  ageRange?: string;
  needs?: PlayNeed[];
  date?: Date;
  limit?: number;
}): HomePlay[] {
  const { ageRange, needs = [], date = new Date(), limit = 3 } = opts;
  const months = ageRange ? ageRangeToMonths(ageRange) : null;
  let pool = HOME_PLAYS.filter((p) => {
    if (months && !overlaps(p.ageMonths, months)) return false;
    if (needs.length && !needs.some((n) => p.needs.includes(n))) return false;
    if (p.season === 'summer' && ![6, 7, 8, 9].includes(date.getMonth() + 1)) return false;
    if (p.season === 'winter' && ![12, 1, 2].includes(date.getMonth() + 1)) return false;
    return true;
  });
  if (pool.length === 0) pool = HOME_PLAYS.filter((p) => !months || overlaps(p.ageMonths, months));
  // 日付シードで回転させ、動（energy 3）と静（energy 1）が混ざるように並べ替える
  const seed = Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`);
  const rotated = pool.map((p, i) => ({ p, k: (i * 7919 + seed) % pool.length })).sort((a, b) => a.k - b.k).map((x) => x.p);
  const out: HomePlay[] = [];
  const active = rotated.find((p) => p.energy === 3);
  const calm = rotated.find((p) => p.energy === 1);
  if (active) out.push(active);
  if (calm && calm !== active) out.push(calm);
  for (const p of rotated) {
    if (out.length >= limit) break;
    if (!out.includes(p)) out.push(p);
  }
  return out.slice(0, limit);
}

export const POSTURE_LABEL: Record<ParentPosture, string> = {
  lying: '親は寝転んだまま',
  sitting: '親は座ったまま',
  standing: '親も立って見守る',
};

export const ENERGY_LABEL: Record<1 | 2 | 3, string> = {
  1: '静かに集中',
  2: 'ほどよく動く',
  3: 'ヘトヘトになる',
};

export const NEED_LABEL: Record<PlayNeed, string> = {
  tired: '疲れさせて寝かせたい',
  evening: '夕方のぐずり',
  parentLying: '親が寝転んだまま',
  siblingFeeding: '下の子の授乳中',
  rainy: '雨・猛暑で外に出られない',
  bored: 'ネタ切れ',
  alone10: 'ひとりで10分',
  bath: 'お風呂',
};

export function formatAgeMonths(a: { min: number; max: number }): string {
  const f = (m: number) => (m < 12 ? `${m}か月` : m % 12 === 0 ? `${m / 12}歳` : `${Math.floor(m / 12)}歳${m % 12}か月`);
  return `${f(a.min)}〜${f(a.max)}`;
}
