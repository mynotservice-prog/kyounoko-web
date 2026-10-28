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
    officialUrl: 'https://hkc.or.jp/takaosan/momiji_fes/',
    area: 'tokyo',
    category: 'matsuri',
    typicalPeriod: '10月下旬〜12月中旬',
    checkFromMonth: 9,
    lastChecked: '2026-10-12',
    lastCheckedState:
      '2026-10-12確認: 発表済み。協会の専用ページに「日時 2026年10月24日(土)～12月13日(日)」「場所 高尾山」と明記され、同じ会期がくじ引き・インスタキャンペーン欄にも出て計3か所で一致、曜日も2026年の暦と一致＝takaosan-momiji-matsuri-2026 として投入。料金の記載はページ上になし。※確認先URLを差し替えた: 旧 www.hachioji-kankoukyoukai.or.jp はDNSが引けなくなっており、同一パスが hkc.or.jp（協会の観光情報サイト「いこうよ八王子・高尾山」）に移っている。高尾登山電鉄側（最新のお知らせ2026年10月6日）にはもみじまつりの告知がなく、紅葉ライトアップは一次情報が出ていないため未投入＝ライトアップは引き続きウォッチ。同ページの「秋の高尾山を盛りあげる関連イベント」節は曜日が2026年と合わず前年の残存と判断し採らなかった。',
    status: 'added',
    addedSlug: 'takaosan-momiji-matsuri-2026',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: 冬・クリスマスは未発表。ニュース最新は2026.10.09（登録博物館に登録）のまま。トップ・/news/・/event/ の3ページでHTMLコメント除去後も「クリスマス」「イルミ」「冬」「11月」「12月」0件。/event/ の会期つき告知はオットセイ展示休止（10/18〜10/29）のみ。前年の初報は会期開始当日（2025.11.18）＝11月第3週が本命。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: マザーイルミ2026-2027は未発表。/information/illumination2026/ と /illumination2025/ はともにトップへ302。お知らせ1ページ目20件の最新は2026/10/25（来場案内）で「イルミ」「クリスマス」「冬」0件。トップの「クリスマス」はクリスマストレイルラン（小4以上の大会）のバナーでイルミではない。台風25号の影響で JR内房線（姉ケ崎〜長浦）は11/9始発から再開見込み、佐貫町駅からの路線バス全便運休・君津IC側に通行止めとの告知あり（既投入 motherfarm-kokia-houki-2026 の来場に影響しうる）。次回も /information/illumination2026/ を直接叩く。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: クリスマス・冬は未発表。お知らせ最新は2026/10/23「須磨イル防災2026」で「クリスマス」「イルミ」「冬」0件。冬以外の新規として須磨イル防災2026（「2026年11月3日（火・祝）10:30～12:30」）を kobesuma-seaworld-suma-iru-bousai-2026 として投入。初報は例年11月下旬〜12月上旬＝11月第4週が本命。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: 冬イルミ・クリスマスは未発表。LIGHTIAページの生HTMLは「クリスマス」23件・「イルミ」4件だが <!-- --> 除去後は0件（前シーズン2025の会期がコメント内に残存したまま）。お知らせAPI（infoList.jsp?site=ha）38件の最新は2026年10月23日（すいすいパス・わんこ島）で冬の会期なし。花火シンフォニアの公式日程表に「11月：21(土)、22(日)」「10月以降：20:00～(約10分間)」があり hakkeijima-hanabi-symphonia-november-2026 として投入。グソグソパニック（10/22〜10/31）は年表記がないため見送り。',
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
    eventName: '冬・クリスマスの季節企画',
    officialUrl: 'https://prtimes.jp/companyrdf.php?company_id=102762',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '冬企画は12月開催（発表は11月下旬〜12月中旬）',
    checkFromMonth: 11,
    lastChecked: '2026-10-12',
    lastCheckedState:
      '2026-10-12確認: 冬・クリスマスは未発表。※前週の記録を2点訂正する。(1)「/events は描画しても一覧が空」は誤り。kawa-sui.com は STUDIO製の完全クライアントレンダリングSPAで、curl・WebFetchは本文ゼロ、内蔵ブラウザもレンダラが落ちるため、描画結果が空なのはこちら側の失敗で「掲載なし」の証拠にならない。実際CMSにはイベント14件が入っている。(2)「秋企画の発表なし」も誤りで、秋季企画「ハリモグラ フェス」（2026年9月11日〜10月31日）は2026-09-01に発表済みで kawasui-harimogura-fes-2026 として既に投入されていた。今回は公式CMSを直接読んでニュース108件・イベント14件を全件取得し、「ハロウィ／クリスマス／イルミネーション／冬季／冬限定／ウィンター／サンタ／Xmas」で全文検索＝クリスマス・イルミネーションは0件。ニュース最新は2026-10-09の4件。イベントCMSの14件はすべて常設プログラムで、季節企画は /events ではなく /news に出る運用。新規のREALITYコラボ（2026年10月12日〜10月25日）はVTuberアプリのコラボで子連れ向けでないため見送り。※運用の変更3点: (a) ハロウィンは監視対象から外した — ニュース108件とPR TIMES 94件（2023-12まで遡及）に「ハロウィン」が0件で、この施設はハロウィン企画をやっていない。(b) 冬企画の発表は11月下旬〜12月中旬（前年は2025-11-21にラグジュアリークリスマス、2025-12-12に開運カメ展）なので checkFromMonth を9→11にした。(c) 終了分は公式ニュースから消される運用なので、冬企画の検知はMOFFのPR TIMES RSSを主にする（確認先URLをそちらに変更）。公式サイトを見る必要があるときはCMS APIを直接叩く: HTML内のNuxtペイロードから publishedUid と resources.cmsProjectId（7A3Snn20ATQLG77bFkoW）を取り、schema_key（ニュース hY_6bHAU / イベント PZo2Zwv3）とあわせてbase64化したクエリを api.cms.studiodesignapp.com/v2/search?q= に渡す。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: クリスマス・冬は未発表。aquarium/js/event.js は4件（タチウオの日〜11/15・夜の性いっぱい展〜11/03・ざんねんないきもの展３〜11/23・エサカプセル）で「クリスマス」「イルミ」「冬」0件。全館 js/event.js 41件のうち venue に水族館を含む5件も同0件（「冬」1件は展望台のビーバームーン観賞会）。',
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
    officialUrl: 'https://www.tokyo-midtown.com/jp/news/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月下旬〜12月25日（光の散歩道とアイスリンクは翌2月下旬まで）',
    checkFromMonth: 10,
    lastChecked: '2026-10-12',
    lastCheckedState:
      '2026-10-12確認: 発表済み。公式お知らせ（掲載日2026/10/9・前週の確認後に出た）に「2026年11月26日(木)から12月25日(金)の期間、「MIDTOWN CHRISTMAS 2026（ミッドタウン クリスマス）」を開催いたします」と明記。プレスリリースPDF（pressrelease_261007.pdf）でも同じ会期で、「※光の散歩道は2027年2月23日（火・祝）まで」「RALPH LAUREN MIDTOWN ICE RINK【期間】2026年12月5日（土）～2027年2月23日（火・祝）」も確認＝midtown-christmas-2026 / midtown-ice-rink-2026 として投入。※確認先URLを差し替えた: /jp/information/ は実体のない空ページ（データ元JSONが空配列）で、/jp/event/ 系にもまだ個別ページがない。公式お知らせの正は /jp/news/ で、今回の発表もそこにしか出ていなかった。※会期が前年と違う（2025年は11/13開始、2026年は11/26開始＝13日遅い。アイスリンクも11/21→12/5）ので前年日付の流用は今年は全部外れる。アイスリンクのオフィシャルサイトは公式に「11月12日（木）に公開予定」とあり、料金は公開後に再照合する。',
    status: 'added',
    addedSlug: 'midtown-christmas-2026',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: 公式プレスリリース（/press/post/721/・2026.10.14掲載）に「２０２６年１１月５日（木）～１２月２５日（金）の期間、「東京スカイツリータウン®ドリームクリスマス２０２６」を開催」と明記。skytree-town-dream-christmas-2026 として投入。告知は前年（10/15）とほぼ同時期。点灯時間・マーケット料金はリリースに記載なし。',
    status: 'added',
    addedSlug: 'skytree-town-dream-christmas-2026',
  },
  {
    venue: 'よこはまコスモワールド',
    eventName: '冬・クリスマスの企画',
    officialUrl: 'https://cosmoworld.jp/topics/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '12月（クリスマス前後）',
    checkFromMonth: 12,
    lastChecked: '2026-10-12',
    lastCheckedState:
      '2026-10-12確認: トピックス最新は2026.10.10（パンプキンカステラ）。前週から2本増えたが2026.10.09の新テニスの王子様コラボ（2026年10月9日〜11月4日）＝秋のコラボで、冬企画ではない。営業カレンダーにも12月の日付は0件。クリスマス関連の投稿は一覧100件中2025.12.18の1本のみで画像パスも /uploads/2025/12/ ＝前年分。2026年版は未発表。前年の初報が2025.12.08・2025.12.18だったことから、この会場は12月に入ってから告知する型と判断し checkFromMonth を10→12に変更（10〜11月の週次確認は空振りする）。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: ノスタルジック・クリスマス2026は未発表。お知らせ最新は2026.10.16（ウルトラマンウィーク/ゴジラウィーク）・10.14（夜のイマーシブショー等）。一覧のクリスマス関連リンクは nostalgic-christmas2025 と illumination_2024 の過去分だけで、推測URL /event/nostalgic-christmas2026/ は404のまま。初報の実績は10/24（前々年）・11/11（前年）＝11月第1〜2週が本命。',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: 公式お知らせ（/news/events/32975・2026.10.16）に「【予告】特別展「エリック・カールといのちの色」COLORFUL CHRISTMAS」、開催期間「2026年11月14日(土) 〜2026年12月25日(金)※休館日を除く」と明記。shinagawa-aquarium-colorful-christmas-2026 として投入。公式に「11月10日(火)〜11月13日(金)まで展示変更のため本特別展は休止」。ハロウィン企画の告知はなかった。',
    status: 'added',
    addedSlug: 'shinagawa-aquarium-colorful-christmas-2026',
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
    lastChecked: '2026-10-26',
    lastCheckedState:
      '2026-10-26確認: ハロウィン・クリスマスの来園者向け告知はなし。press.bindcloud.jp の一次データで、お知らせ（3U4nEb-MqAqO）最新は2026/10/24（落ち葉ベッドづくり中止）、直近40件で「ハロウィン」「クリスマス」0件。当日申込（U2TUCFli7Mic）の最新は2026/11/14「落ち葉で巨大絵づくり」で12月の告知なし。生きものアートキャンペーンは依然として出店者募集ページのみ。手法: BiND製でHTMLは本文ゼロ、https://press.bindcloud.jp/posts?b=<sid>&limit=40 で全件取得（sid: お知らせ 3U4nEb-MqAqO / 当日申込 U2TUCFli7Mic / 定期 rXZA2hQCdbJ）。',
    status: 'waiting',
  },
];
