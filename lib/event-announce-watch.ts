/**
 * イベントの「発表待ち」ウォッチリスト。
 *
 * ── なぜ必要か（2026-08-27 の実測）─────────────────────────────────────
 * イベントDBは 156件中79件（51%）が終了済み・今後開催が6件という状態になっていた。
 * 原因は「補填を忘れた」ではない。**秋冬イベントは公式発表そのものが9〜11月まで出ない**
 * ので、8月にどれだけ探しても入れられない。実際にこの日、主要会場を公式で確認すると:
 *
 *   昭和記念公園「秋の夜散歩」   → 2025年の情報のまま
 *   六義園 紅葉ライトアップ       → 記載なし
 *   東京クリスマスマーケット      → 2025年の情報のみ
 *   東京ドイツ村 イルミネーション → 「次回予告 詳細が決まり次第お知らせいたします」
 *   江の島 湘南の宝石            → 記載なし
 *
 * つまり必要なのは「今まとめて入れる」ではなく **「発表される月に取りに行く」** 仕組み。
 * このファイルは、会場ごとの公式URLと「何月に見に行くか」を持ち、
 * scripts/events-maintenance.mjs が今月チェックすべきものを一覧に出す。
 *
 * ── 運用 ────────────────────────────────────────────────────────────
 * 1. 週次で `npx tsx scripts/events-maintenance.mjs` を回す。
 * 2. 「今月チェック」に出た会場の officialUrl を開く。
 * 3. 会期が発表されていれば lib/events.ts に追加し、ここの status を 'added' にして
 *    addedSlug を書く。まだなら lastChecked / lastCheckedState を更新するだけでよい。
 * 4. 新規イベントを足したら **`app/sitemap.ts` に自動で載る**（会期終了のものは noindex なので除外される）。
 *    2026-08-27 まで個別イベントページは sitemap に1本も入っていなかった。
 * 5. **公式に載っていない日付は絶対に書かない。** 去年の日付を+1年した推測を入れない
 *    （docs/writing-rules.md）。会期が出るまでは「例年◯月ごろ」で待つ。
 */

import type { AreaSlug } from './area';
import type { EventCategory } from './events';

export type AnnounceWatch = {
  /** 会場・主催の表示名 */
  venue: string;
  /** 例年のイベント名（年号は入れない） */
  eventName: string;
  /** 確認先の公式URL。ここを開けば判断できる状態にしておくこと */
  officialUrl: string;
  area: AreaSlug;
  category: EventCategory;
  /**
   * 例年の会期。年に依存しない表現だけを書く（「10月下旬〜11月末」）。
   * 出典は lastCheckedState に書いた観測、または過去に公式で確認した会期。
   */
  typicalPeriod: string;
  /**
   * この月に入ったら公式を見に行く（1〜12）。発表実績から決める。
   * 早すぎると空振りし、遅いと会期の頭を逃す。
   */
  checkFromMonth: number;
  /** 最終確認日（YYYY-MM-DD） */
  lastChecked: string;
  /** そのとき公式がどうなっていたか。ここが「推測でない」ことの担保になる */
  lastCheckedState: string;
  /** 'waiting' = 発表待ち / 'added' = lib/events.ts に投入済み */
  status: 'waiting' | 'added';
  /** status='added' のときの events.ts 側の slug */
  addedSlug?: string;
};

export const ANNOUNCE_WATCH: AnnounceWatch[] = [
  // ── 発表済み・投入済み ──────────────────────────────────────────────
  {
    venue: '遊園地よみうりランド',
    eventName: 'ジュエルミネーション',
    officialUrl: 'https://www.yomiuriland.com/jewellumination/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '10月下旬〜翌4月上旬',
    checkFromMonth: 8,
    lastChecked: '2026-08-27',
    lastCheckedState:
      '公式ニュースリリース（2026-08-25）で2026-10-29〜2027-04-04・138日間と発表済み。投入済み。',
    status: 'added',
    addedSlug: 'yomiuriland-jewellumination-2026',
  },
  {
    venue: '遊園地よみうりランド',
    eventName: 'よみラン ハロウィン（Jump in Party）',
    officialUrl: 'https://www.yomiuriland.com/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '9月下旬〜11月上旬',
    checkFromMonth: 8,
    lastChecked: '2026-08-27',
    lastCheckedState:
      '公式ニュースリリース（2026-08-26）で2026-09-26〜2026-11-01と発表済み。投入済み。',
    status: 'added',
    addedSlug: 'yomiuriland-halloween-2026',
  },
  {
    venue: '相模湖リゾート プレジャーフォレスト',
    eventName: 'さがみ湖イルミリオン',
    officialUrl: 'https://www.sagamiko-resort.jp/illumillion/',
    area: 'kanagawa',
    category: 'illumination',
    typicalPeriod: '11月中旬〜翌5月上旬',
    checkFromMonth: 8,
    lastChecked: '2026-08-27',
    lastCheckedState:
      '公式「2026-2027シーズン営業のお知らせ」で2026-11-14〜2027-05-09と発表済み。投入済み。',
    status: 'added',
    addedSlug: 'sagamiko-illumillion-2026',
  },

  // ── 発表待ち（2026-08-27 に公式を確認して未発表だったもの）─────────────
  {
    venue: '国営昭和記念公園',
    eventName: '秋の夜散歩（黄葉・紅葉まつり）',
    officialUrl: 'https://www.showakinen-koen.jp/autumn-night-walk/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '10月下旬〜11月末',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: /autumn-night-walk/ が「秋の夜散歩2026」に更新され「2026年10月29日(木) - 11月29日(日)」「点灯時間 16：30〜20：30（最終入園20：30・閉園21：00）」と明記。料金欄は公園入園券 大人￥450、日本庭園観賞券（事前販売）大人￥1,200・小中学生￥600、窓口券 大人￥1,300・小中学生￥700。同ページに前年以前の残置文（夜間バスの日付など）が混じるので日付と料金以外は採っていない。投入した。',
    status: 'added',
    addedSlug: 'showa-kinen-aki-no-yosanpo-2026',
  },
  {
    venue: '六義園（都立庭園）',
    eventName: '紅葉と大名庭園のライトアップ',
    officialUrl: 'https://www.tokyo-park.or.jp/park/rikugien/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '11月下旬〜12月上旬',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 六義園お知らせ（2026/09/03付）に「庭紅葉の六義園 夜間特別観賞」「令和 8 年 11 月 25 日(水)～12 月 6 日(日) 18時～20時30分（最終入園は19時30分まで）」、前売券1,000円・当日券1,200円と明記。チケット発売日は未発表。投入した。同時期の「秋の六義園」（10/17〜12/6）はパネル展の終了日が「12 月６日（土）」と暦に合わない表記のため見送り。次回から公園トップでなく /news/ を見る（9/7は見落としていた）。',
    status: 'added',
    addedSlug: 'rikugien-niwamomiji-night-2026',
  },
  {
    venue: '高尾山（高尾登山電鉄）',
    eventName: '高尾山もみじまつり',
    officialUrl: 'https://www.takaotozan.co.jp/',
    area: 'tokyo',
    category: 'matsuri',
    typicalPeriod: '11月',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 八王子観光コンベンション協会の専用ページ（/takaosan/momiji_fes/）は「2025年10月25日(土)～12月14日(日)」の2025年版のまま。高尾登山電鉄のお知らせ最新は9/28（天狗焼の催事販売）と9/27（10月の山上施設休業日）で、もみじまつり2026の告知なし。',
    status: 'waiting',
  },
  {
    venue: '新豊洲・芝公園',
    eventName: '東京クリスマスマーケット',
    officialUrl: 'https://tokyochristmas.net/',
    area: 'tokyo',
    category: 'market',
    typicalPeriod: '11月下旬〜12月下旬',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 公式トップが「東京クリスマスマーケット2026」に更新。「in 新豊洲 2026年11月20日(金)〜12月25日(金)」「in 芝公園（御成門駅前広場） 2026年12月4日(金)〜12月25日(金)」と明記し、2026年は明治神宮外苑ではなく新豊洲が会場（venue を修正）。チケットは10月1日発売。2会場を tokyo-christmas-market-shintoyosu-2026 / tokyo-christmas-market-shiba-2026 として投入。トップ下部のアクセス欄は日比谷時代の残置なので採っていない。',
    status: 'added',
    addedSlug: 'tokyo-christmas-market-shintoyosu-2026',
  },
  {
    venue: 'すみだ水族館',
    eventName: '秋冬の特別展示・季節イベント',
    officialUrl: 'https://www.sumida-aquarium.com/',
    area: 'tokyo',
    category: 'show',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: ニュース最新は2026.09.29。2026.09.28付で「※チンアナゴではありま展」を発表し「【開催期間】2026年10月1日（木）～11月16日（月）」「【料金】無料※ 水族館入場料別。」と明記＝sumida-aquarium-chinanago-2026 として投入。クリスマス・冬の企画は未発表のため引き続きウォッチ。',
    status: 'waiting',
  },
  {
    venue: '東京ドイツ村',
    eventName: 'ウインターイルミネーション',
    officialUrl: 'https://t-doitsumura.co.jp/event/irodori2026/',
    area: 'chiba',
    category: 'illumination',
    typicalPeriod: '10月下旬〜翌3月ごろ',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: /illumination/ は「次回予告 詳細が決まり次第お知らせいたします」のままだが、別URL（/event/irodori2026/）で後継企画「東京ランタンフェスティバル」の会期「2026年10月31日(土)〜2027年4月4日(日)　点灯時間：日没〜20:00」が発表されていたので投入した。ウインターイルミネーションはこのランタンイベントに置き換わった模様。',
    status: 'added',
    addedSlug: 'tokyo-german-village-lantern-2026',
  },
  {
    venue: 'あしかがフラワーパーク',
    eventName: '光の花の庭（イルミネーション）',
    officialUrl: 'https://www.ashikaga.co.jp/',
    area: 'tochigi',
    category: 'illumination',
    typicalPeriod: '10月中旬〜2月中旬',
    checkFromMonth: 9,
    lastChecked: '2026-09-14',
    lastCheckedState:
      '2026-09-14: 公式の入園料ページ（fee.html）に「2026年10月17日～2月14日予定 【光の花の庭】」と夜の部の時間・料金が掲載。2026/09/11のハロウィン告知にも「10/17（土）からはライトアップも開催」とあり一致。会期は「予定」表記。投入済み。',
    status: 'added',
    addedSlug: 'ashikaga-hikari-no-hana-no-niwa-2026',
  },
  {
    venue: '江の島（江の島シーキャンドル）',
    eventName: '湘南の宝石',
    officialUrl: 'https://enoshima-seacandle.com/event/shonannohoseki/',
    area: 'kanagawa',
    category: 'illumination',
    typicalPeriod: '11月下旬〜翌2月ごろ',
    checkFromMonth: 10,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 公式イルミネーションページに「2026年12月1日（火）〜2027年2月28日（日）」と2026-2027シーズンの会期が掲載されたため投入した。点灯時間・料金は「詳細は随時更新します」で前年度分のみ。',
    status: 'added',
    addedSlug: 'shonan-no-hoseki-2026',
  },
  {
    venue: '東京ディズニーランド／東京ディズニーシー',
    eventName: 'ディズニー・ハロウィーン',
    officialUrl: 'https://www.tokyodisneyresort.jp/treasure/halloween2026/tdl/',
    area: 'chiba',
    category: 'seasonal',
    typicalPeriod: '9月中旬〜10月末',
    checkFromMonth: 7,
    lastChecked: '2026-08-31',
    lastCheckedState:
      '2026-08-31: 会期は2026-09-16〜10-31、ランド・シー両パークで開催（社長が公式サイトで直接確認）。全身仮装が可能なのは2026-09-15〜09-30と2026-10-16〜10-31の2期間で、10-01〜10-15は全身仮装不可。投入済み。※このマシンからは tokyodisneyresort.jp へ WebFetch・curl とも接続できない（タイムアウト）ため、次回以降もブラウザ経由で確認すること。',
    status: 'added',
    addedSlug: 'tokyo-disney-halloween-2026',
  },
  {
    venue: 'なばなの里（ナガシマリゾート）',
    eventName: 'ウインターイルミネーション',
    officialUrl: 'https://www.nagashima-onsen.co.jp/nabana/illumination/index.html',
    area: 'mie',
    category: 'illumination',
    typicalPeriod: '10月中旬〜翌5月末',
    checkFromMonth: 8,
    lastChecked: '2026-08-31',
    lastCheckedState:
      '公式イルミネーションページに「2026.10/17〜 2027.5/31」と掲載済み。投入済み。',
    status: 'added',
    addedSlug: 'nabana-no-sato-illumination-2026',
  },
  {
    venue: 'ハウステンボス',
    eventName: 'ザ・スターライト・ミリオン（旧 光の王国）',
    officialUrl: 'https://www.huistenbosch.co.jp/event/illumination/',
    area: 'nagasaki',
    category: 'illumination',
    typicalPeriod: '11月上旬〜翌2月下旬',
    checkFromMonth: 9,
    lastChecked: '2026-09-14',
    lastCheckedState:
      '2026-09-14: /event/illumination/ の「光の王国」が「ザ・スターライト・ミリオン」に名称変更され、「2026. 11/6 Fri.― 2027. 2/25 Thu.」と会期掲載。点灯時間・料金は未掲載。投入済み。',
    status: 'added',
    addedSlug: 'huis-ten-bosch-starlight-million-2026',
  },
  {
    venue: 'マザー牧場',
    eventName: 'マザーイルミ（冬のイルミネーション）',
    officialUrl: 'https://www.motherfarm.co.jp/information/news/',
    area: 'chiba',
    category: 'illumination',
    typicalPeriod: '11月上旬〜翌3月上旬の土日祝＋年末年始',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: インフォメーション一覧にイルミネーションの告知なし（/illumination/ はトップへリダイレクトのまま）。新着は2026/10/02と10/01の秋の催しのみ。前回告知を見ただけだったアグロドーム30周年・マザーファームツアー20周年（いずれも「2026年10月3日（土）～2027年1月11日（月・祝）」）は motherfarm-agrodome-30th-2026 / motherfarm-farmtour-20th-2026 として投入。マザーイルミ2026-2027は未発表＝引き続きウォッチ。',
    status: 'waiting',
  },
  {
    venue: '国営ひたち海浜公園',
    eventName: 'コキアカーニバル',
    officialUrl: 'https://www.hitachikaihin.jp/event/kochiacarnival2026/kochia.html',
    area: 'ibaraki',
    category: 'seasonal',
    typicalPeriod: '10月上旬〜10月末',
    checkFromMonth: 9,
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21確認: 専用ページ（/event/kochiacarnival2026/kochia.html）が開設され「2026年9月18日金曜日から11月3日火曜日まで」と掲載。運営の一般財団法人公園財団も9月16日に同会期を発表しており、9/14時点で未開設だったものが9/16に出た。名称は現役なのでウォッチ外し候補は撤回し、hitachi-kaihin-kochia-carnival-2026 として投入。お知らせ一覧に残る2025年のスタッフブログ（news/park/page000455.html）は曜日が2025年の暦で残置なので出典にしないこと。',
    status: 'added',
    addedSlug: 'hitachi-kaihin-kochia-carnival-2026',
  },
  {
    venue: '奈良の鹿愛護会 / 春日大社 鹿苑',
    eventName: '古式「鹿の角きり」',
    officialUrl: 'https://naradeer.com/event/tsunokiri.html',
    area: 'nara',
    category: 'seasonal',
    typicalPeriod: '10月または11月の土日2日間',
    checkFromMonth: 9,
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21確認: 公式の角きりページの見出しが「2025年概要／11月8日(土)・9日(日)」から「2026年概要／11月7日(土)・8日(日)」に更新された（曜日照合OK、Waybackの2026-04-22版は2025年表記だったので前週以降の更新）。nara-shika-tsunokiri-2026 として投入。次は2027年分を9月中旬以降に見る。',
    status: 'added',
    addedSlug: 'nara-shika-tsunokiri-2026',
  },
  {
    venue: '四国水族館',
    eventName: '秋の延長営業「誰そ彼時」・秋の企画展',
    officialUrl: 'https://shikoku-aquarium.jp/news/archive/1519/',
    area: 'kagawa',
    category: 'show',
    typicalPeriod: '8月末〜9月末（日の入り10分後まで延長）',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 公式ニュースの詳細記事に「期間：2026年8月31日（月）〜9月30日（水）」「9：00〜日没10分後まで（最終入館は17：30）」と会期が出ていたので投入した。イルカサンセットプログラムの実施はなしと注記あり。',
    status: 'added',
    addedSlug: 'shikoku-aquarium-tasokare-2026',
  },
  {
    venue: '神戸須磨シーワールド',
    eventName: '秋・冬の季節イベント',
    officialUrl: 'https://www.kobesuma-seaworld.jp/news/',
    area: 'hyogo',
    category: 'show',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: お知らせ一覧の最新は2026/10/02（10月12日の1日限りの子ども靴コラボ・料金と対象の記載なしのため見送り）。その次が2026/09/16のハロウィン（投入済み）で、クリスマス・冬の企画の告知なし。',
    status: 'waiting',
  },
  // ── 2026-09-07 追加: 9月上旬時点で秋企画が未発表だった関東の主要施設 ──
  // 過去の告知タイミングを見ると、東武動物公園は前年10/15、八景島は9月下旬にリリースが出ている。
  // 9月下旬〜10月上旬にこの5件を回すと、あと5〜8件は拾える見込み。
  {
    venue: '東武動物公園',
    eventName: 'ハロウィンナイトZOO・ウインターイルミネーション',
    officialUrl: 'https://www.tobuzoo.com/newsrelease/',
    area: 'saitama',
    category: 'seasonal',
    typicalPeriod: 'ハロウィンは10月下旬の週末、イルミは11月上旬〜翌2月下旬',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 2026.10.01付リリースとイベントページ（/event/13759.html）に「2026年10月24日（土）～2027年2月28日（日）」「開催時間 17：00～20：00」、イルミネーション入園券 大人1,700円・小人800円と明記＝tobu-zoo-winter-illumination-2026 として投入。『ハロウィンゆうえんち2026』（2026年10月1日（木）～10月31日（土））も tobu-zoo-halloween-yuenchi-2026 として投入。「ハロウィンナイトZOOパレード」「仮装パレード」は年の記載が無いページのままで見送り。国際ジャガーの日コラボ（11/1〜11/30）はイベントページ本文を未読のため見送り。',
    status: 'added',
    addedSlug: 'tobu-zoo-winter-illumination-2026',
  },
  {
    venue: '横浜・八景島シーパラダイス',
    eventName: '秋・ハロウィン企画／冬のイルミネーション',
    officialUrl: 'https://www.seaparadise.co.jp/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: 'ハロウィンは10月、イルミは11月中旬〜翌3月',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: お知らせ一覧APIの最新は2026年10月03日で、35件中に冬イルミ・クリスマスの見出しなし。トップのピックアップは秋パラ（〜11/13・投入済み）など。LIGHTIAは「土日祝と特定日で開催」とあるだけで冬の会期は未記載。',
    status: 'waiting',
  },
  {
    venue: '国営武蔵丘陵森林公園',
    eventName: '紅葉見ナイト（光と森のStory）',
    officialUrl: 'https://www.shinrinkoen.jp/',
    area: 'saitama',
    category: 'illumination',
    typicalPeriod: '11月上旬〜11月末',
    checkFromMonth: 9,
    lastChecked: '2026-09-14',
    lastCheckedState:
      '2026-09-14: ブラウザ描画で公式イベントページを確認。光と森のStory第2章「紅葉見ナイト」は「2026年11月14日(土)～29日(日)」（点灯16:30〜20:30）。第1章「森のハロウィンナイト」も「2026年10月11日(土)～10月31日(土)の土日祝のみ」で掲載があり、musashi-kyuryo-halloween-night-2026 として同時に投入。',
    status: 'added',
    addedSlug: 'musashi-kyuryo-momijimi-night-2026',
  },
  {
    venue: 'カワスイ 川崎水族館',
    eventName: '秋冬の季節企画',
    officialUrl: 'https://kawa-sui.com/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 運営元MOFFのPR TIMES（RSS company_id=102762）の最新は9/25「MOFFネコ総選挙」のままで新規リリースなし。公式サイトの /events は描画しても一覧が空。ハロウィン・クリスマス・冬企画の発表なし。',
    status: 'waiting',
  },
  {
    venue: 'サンシャイン水族館',
    eventName: 'ハロウィン企画',
    officialUrl: 'https://sunshinecity.jp/aquarium/event_performance/event/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '9月下旬〜10月末',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: aquarium/js/event.js の水族館イベントは6件。新規の「11月11日はタチウオの日 制定記念イベント」（「2026/10/09(金)～2026/11/15(日)」）を sunshine-aquarium-tachiuo-day-2026 として投入。ほかは会員向け感謝祭、大人向け夜間営業、ざんねんないきもの展３（〜11/23）など。ハロウィン・クリスマス・冬の企画はなし。',
    status: 'waiting',
  },

  // ── 2026-09-22 に新規登録（首都圏の大型冬イルミ。発表は例年10月中旬〜下旬に集中する）──
  {
    venue: '丸の内（三菱地所・丸の内イルミネーション実行委員会）',
    eventName: '丸の内イルミネーション',
    officialUrl: 'https://www.marunouchi.com/pickup/event/10727/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月中旬〜翌2月中旬',
    checkFromMonth: 9,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 三菱地所の2026年9月17日付リリースと丸の内ドットコム掲載版の両方に「2026年11月12日（木）～2027年2月14日（日）」「開催場所 丸の内仲通り」「今年で25回目」と明記。marunouchi-illumination-2026 として投入した。同リリースの上位企画「MARUNOUCHI BRIGHT HOLIDAY」（2026-11-12〜12-25）も marunouchi-bright-holiday-2026 として別レコードで投入。点灯時間・クリスマスマーケットの個別会期は「10月下旬にお知らせ」とされ未発表なので、10月下旬に再確認する。2025年は10/20発表だったので今年は約1か月前倒し。',
    status: 'added',
    addedSlug: 'marunouchi-illumination-2026',
  },
  {
    venue: '東京ミッドタウン',
    eventName: 'MIDTOWN CHRISTMAS（イルミネーション）',
    officialUrl: 'https://www.tokyo-midtown.com/jp/event/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月中旬〜12月25日',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: イベント一覧にクリスマス項目なし。MIDTOWN CHRISTMASページ（/jp/event/7657/）は「2025/11/13(木)〜12/25(木)」の前年分のまま。お知らせ最新は2026/9/29（11月の工事に伴う営業日程変更）。2026年版は未発表。',
    status: 'waiting',
  },
  {
    venue: '六本木ヒルズ（けやき坂）',
    eventName: '六本木ヒルズ クリスマス／けやき坂イルミネーション',
    officialUrl: 'https://www.roppongihills.com/events/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月上旬〜12月25日',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: 森ビル2026年9月30日付リリース「CHRISTMAS HILLS 2026」（PDF）に、けやき坂イルミネーション「日程：11月5日（木）～12月25日（金）時間：17:00～22:00」、六本木ヒルズ クリスマスマーケット 2026「日程：11月21日（土）～12月25日（金）時間：11:00～21:00場所：大屋根プラザ」と明記。roppongi-keyakizaka-illumination-2026 / roppongi-hills-christmas-market-2026 として投入。特設サイトの詳細は10月22日公開予定。',
    status: 'added',
    addedSlug: 'roppongi-keyakizaka-illumination-2026',
  },
  {
    venue: '東京スカイツリータウン',
    eventName: 'ドリームクリスマス（イルミネーション）',
    officialUrl: 'https://www.tokyo-skytree.jp/press/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月中旬〜12月25日',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: tokyo-skytree.jp/press/ の最新は2026.09.02のまま。東京ソラマチ側（tokyo-solamachi.jp/news/）に2026年9月29日付でハロウィンイベント（「2026年10月1日 ～ 2026年10月31日」）が出ており skytree-town-halloween-2026 として投入。ドリームクリスマス2026は未発表。タウン全体のリリースはソラマチ側の一覧に先に載るので、次回はそちらも見る。',
    status: 'waiting',
  },
  {
    venue: 'よこはまコスモワールド',
    eventName: '冬・クリスマスの企画',
    officialUrl: 'https://cosmoworld.jp/topics/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '12月（クリスマス前後）',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: トピックス最新は2026.09.27（秋のカード）。クリスマス関連は2025.12.18／12.31付の投稿のみ＝前年分。2026年版は未発表。',
    status: 'waiting',
  },
  {
    venue: '西武園ゆうえんち',
    eventName: 'ノスタルジック・クリスマス',
    officialUrl: 'https://www.seibuen-amusement-park.jp/news/',
    area: 'saitama',
    category: 'seasonal',
    typicalPeriod: '11月中旬〜12月下旬',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: お知らせ最新は2026.09.29の『ハイカラ・ハロウィン』（「2026年10月3日（土） ～ 31日（土）」）と『秋のバラフェスタ』（「2026年10月26日(月)～11月23日(月･祝)」）で、seibuen-haikara-halloween-2026 / seibuen-autumn-rose-festa-2026 として投入。クリスマスのリンクは『ノスタルジック・クリスマス 2025』のまま＝前年分。2026年版は未発表。',
    status: 'waiting',
  },
  {
    venue: '鴨川シーワールド',
    eventName: 'ハロウィン・クリスマス・年末年始の企画',
    officialUrl: 'https://www.kamogawa-seaworld.jp/event/',
    area: 'chiba',
    category: 'seasonal',
    typicalPeriod: '不定（10月・12月〜1月に企画が入る）',
    checkFromMonth: 9,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 「秋のナイトアドベンチャー」（2026-10-03〜10-25の指定9日）と「ベルーガ50th Anniversary」記念営業（2026-09-01〜2027-06-30）を公式で確認し、それぞれ kamogawa-seaworld-night-adventure-2026 / kamogawa-seaworld-beluga-50th-2026 として投入した。ハロウィン・クリスマス・年末年始は2026年分が未発表。検索上位に出る /event/event_info/8870/ は全日付が2022年12月〜2023年1月の残存ページなので流用しないこと。',
    status: 'added',
    addedSlug: 'kamogawa-seaworld-night-adventure-2026',
  },
  {
    venue: '新江ノ島水族館（えのすい）',
    eventName: 'クリスマス・冬のナイトアクアリウム',
    officialUrl: 'http://www.enosui.com/show_index.php',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '11月中旬〜12月下旬',
    checkFromMonth: 10,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 公式イベント一覧は10月31日までで、11月以降の冬企画（クリスマス／ナイトアクアリウム等）は未発表。10月分から「秋だ！祭りだ！ecoまつり！」（10/10〜10/12・公式に「年に一度！」と明記）を enosui-eco-matsuri-2026 として投入した。注意点2つ: (1) えのすいの公式イベントページは西暦を書かない形式なので、曜日で年を照合すること。(2) evententry.php?eid=02581（サンゴツリー）は本文が空の期限切れページで流用不可。イベント一覧の実体は /show_index.php（/event.php は301リダイレクト）。',
    status: 'added',
    addedSlug: 'enosui-eco-matsuri-2026',
  },
  {
    venue: 'しながわ水族館',
    eventName: '開館35周年の記念イベント・ハロウィン・クリスマス',
    officialUrl: 'https://www.aquarium.gr.jp/news/events/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '不定（周年は2026-10-19、クリスマスは12月）',
    checkFromMonth: 9,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: イベント系お知らせの最新は2026.10.02「10月18日(日)しながわ水族館開館35周年記念セレモニー」（10:15～10:40予定の1日のみ＝会期レコードにならないため見送り）。会期つきの周年イベント・ハロウィン・クリスマスは未発表。',
    status: 'waiting',
  },
  {
    venue: '羽村市動物公園（ヒノトントンZOO）',
    eventName: 'ハロウィン・クリスマスの企画',
    officialUrl: 'https://hamurazoo.jp/event/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '不定（10月・12月）',
    checkFromMonth: 10,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 「夜の動物園をまわろう！2026ナイトツアー」（2026/10/10、11、17、18、24、25、31・18:20〜20:30・1,000円＋入園料・要事前申込）を公式で確認し hamura-zoo-night-tour-2026 として投入した。イベント一覧の他の掲載は定例イベント（さるのエサ／モルモット教室等）と令和8年度営業日のお知らせのみで、ハロウィン・クリスマスは未発表。',
    status: 'added',
    addedSlug: 'hamura-zoo-night-tour-2026',
  },
  {
    venue: '埼玉県こども動物自然公園',
    eventName: '秋冬のイルミネーション・クリスマス企画',
    officialUrl: 'https://www.parks.or.jp/sczoo/event/',
    area: 'saitama',
    category: 'illumination',
    typicalPeriod: '不定（11月〜12月）',
    checkFromMonth: 10,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 公式ドメインは www.parks.or.jp/sczoo/（parks.or.jp/sakado/ は404なので注意）。アートフェスタ2026（2026-10-01〜12-29・公式に「今年で第14回」）とオーストラリアフェア2026（10/24〜10/25）を投入した。10〜12月のイルミネーション・クリスマス・ハロウィンは2026年分が未掲載＝未発表。ナイトズー2026は9月で終了済み。',
    status: 'added',
    addedSlug: 'saitama-kodomo-zoo-art-festa-2026',
  },
  {
    venue: '足立区生物園',
    eventName: 'ハロウィン・クリスマスの企画',
    officialUrl: 'https://seibutuen.jp/cn1/index.html',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '不定（10月・12月）',
    checkFromMonth: 10,
    lastChecked: '2026-10-05',
    lastCheckedState:
      '2026-10-05確認: ブラウザ描画で確認。お知らせ最新は2026.10.02。イベントページは10月の単日イベントのみで、ハロウィン・クリスマスの告知はゼロ。出店者募集ページに「2027年1月より『生きものアートキャンペーン』」「2027年1月16日（土）～3月14日（日）の土日祝」とあるが出店者向け要項で、来園者向けの会期告知は未掲載。',
    status: 'waiting',
  },
];
