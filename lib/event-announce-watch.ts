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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: 専用ページ（/autumn-night-walk/）は「秋の夜散歩2025」（2025年10月30日〜11月30日・曜日も2025年の暦）のまま。トップのイベント一覧はコスモスまつり2026（9/12〜10/25）・秋のフォトスポット2026・秋のフードコンテストのみで、黄葉／紅葉まつりと夜散歩の2026年版は未掲載。前週から変化なし。',
    status: 'waiting',
  },
  {
    venue: '六義園（都立庭園）',
    eventName: '紅葉と大名庭園のライトアップ',
    officialUrl: 'https://www.tokyo-park.or.jp/park/rikugien/',
    area: 'tokyo',
    category: 'seasonal',
    typicalPeriod: '11月下旬〜12月上旬',
    checkFromMonth: 10,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07に前倒しで確認: 都立庭園公式に2026年秋のライトアップ日程の記載なし。10月以降に再確認する。',
    status: 'waiting',
  },
  {
    venue: '高尾山（高尾登山電鉄）',
    eventName: '高尾山もみじまつり',
    officialUrl: 'https://www.takaotozan.co.jp/',
    area: 'tokyo',
    category: 'matsuri',
    typicalPeriod: '11月',
    checkFromMonth: 9,
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: 高尾登山電鉄のお知らせ最新は2026年9月20日の台風25号運行案内で、もみじまつりの告知なし。八王子観光コンベンション協会の専用ページ（hkc.or.jp/takaosan/momiji_fes/）は「2025年10月25日(土)〜12月14日(日)」の残置（曜日が2025年の暦と一致）。前週から変化なし。',
    status: 'waiting',
  },
  {
    venue: '明治神宮外苑・芝公園',
    eventName: '東京クリスマスマーケット',
    officialUrl: 'https://tokyochristmas.net/',
    area: 'tokyo',
    category: 'market',
    typicalPeriod: '11月下旬〜12月下旬',
    checkFromMonth: 10,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 公式トップは2025年の情報のみ（神宮外苑11/21〜12/25・芝公園12/5〜12/25）。2026年の会場・会期は未発表。会場は2023年以降 日比谷公園ではなく明治神宮外苑＋芝公園なので venue を修正した。',
    status: 'waiting',
  },
  {
    venue: 'すみだ水族館',
    eventName: '秋冬の特別展示・季節イベント',
    officialUrl: 'https://www.sumida-aquarium.com/',
    area: 'tokyo',
    category: 'show',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: ニュース一覧の最新は2026.09.19（アオウミガメの命名）で、ハロウィン・クリスマス・秋冬の特別展示の告知はニュース一覧・イベントページとも掲載なし。前週から変化なし。',
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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: インフォメーション一覧（/information/news/）の最新は2026/09/20の臨時休園案内で、1・2ページ目とトップのいずれにも「イルミ」を含む記事は0件。旧URL /information/illumination2025/ と /illumination/ はトップへ302リダイレクトのまま。2026-2027の告知はなし。',
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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21確認: お知らせに2026年9月16日付「水族館で楽しむハロウィン！秋の装いで限定メニューが登場」(/news/10273/)が新規掲載、会期2026年10月1日(木)〜10月31日(土)。suma-seaworld-halloween-2026 として投入した。クリスマス・冬の企画はお知らせ一覧・イベント情報ページとも依然なし＝引き続きウォッチ。/pressroom/ は404なので監視先はお知らせ一覧 /news/ に一本化する。',
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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: ニュースリリース一覧の最新は2026.09.08で前週から更新なし。ハロウィンナイトZOO・ウインターイルミネーションの2026年分リリースは0件（残るのは2025.10.15と2025.10.10の前年分）。別企画の「オータムナイトZOO 2026」は公式イベントページに9/19〜23と10/10〜12の日付があり、今後の分を tobu-zoo-autumn-night-zoo-2026 として投入した。前年のリリース時期どおり10月上旬に再確認する。',
    status: 'waiting',
  },
  {
    venue: '横浜・八景島シーパラダイス',
    eventName: '秋・ハロウィン企画／冬のイルミネーション',
    officialUrl: 'https://www.seaparadise.co.jp/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: 'ハロウィンは10月、イルミは11月中旬〜翌3月',
    checkFromMonth: 9,
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21確認: お知らせ元データに2026年09月18日付「秋パラ！」が新規追加され、運営の株式会社横浜八景島のリリースでも会期2026年10月1日〜11月13日を確認、seaparadise-akipara-2026 として投入。冬のLIGHTIAは単独項目が2024年09月01日付のままで会期未発表（秋パラのページ内も「土日祝日のみ」で日付なし）＝引き続きウォッチ。取得は api/cache/v1/infoList.jsp?site=ha に Referer を付ける（site 指定がないと "require (site)" だけが返る）。WebFetchは403。',
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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: 公式はNuxt+STUDIOのクライアント描画で /news/・/event/ ともHTMLから項目を取得できない状態が継続、sitemap.xmlは404。運営元 株式会社MOFF のPR TIMESは最新が2026年09月01日の「ハリモグラ フェス」（投入済み kawasui-harimogura-fes-2026）で、以降ハロウィン・クリスマス・冬企画のリリースなし。',
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
    lastChecked: '2026-09-21',
    lastCheckedState:
      '2026-09-21再確認: 水族館のイベント実データ（aquarium/js/event.js）全8件にハロウィンの語は0件で、水族館単独のハロウィン企画は未発表（新規は会員向けのアクアリウムクラブ感謝祭10/17-18のみ）。一方サンシャインシティ全館の「FUN! FUN! HALLOWEEN 2026」（10/1〜10/31）は公式特設ページと9/17のリリースで確認でき、sunshine-city-halloween-2026 として別レコードで投入した。水族館はそのラリーの立寄り施設として名前が出るだけ。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: イベント一覧の最遠は「LOUVRE meets TOKYO MIDTOWN 2026/9/9(水)〜12/13(日)」でクリスマス項目なし。MIDTOWN CHRISTMASページ（/jp/event/7657/）は「2025/11/13(木)〜12/25(木)」＝前年分の残置。2026年版は未発表。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 六本木ヒルズのイベント一覧にクリスマス項目なし。特設サイト christmas.hills-site.com は「11.4 tue - 12.25 thu」＝2025年の暦（2025-11-04が火曜）と一致する前年分の残置。2026年版は未発表。',
    status: 'waiting',
  },
  {
    venue: '東京スカイツリータウン',
    eventName: 'ドリームクリスマス（イルミネーション）',
    officialUrl: 'https://www.tokyo-skytree.jp/press/',
    area: 'tokyo',
    category: 'illumination',
    typicalPeriod: '11月中旬〜12月25日',
    checkFromMonth: 10,
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 公式プレスリリース最新は2026-09-02で、秋イベントが「2026年9月4日（金）～10月26日（月）」まで。ドリームクリスマス2026の発表なし。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: トピックス最新は2026-09-16（秋のカード）。クリスマス関連の掲載は2025-12-18/12-31の投稿のみ＝前年分。2026年版は未発表。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: お知らせ最新は2026-09-18（秋のイベント）。クリスマス関連の最新は2025-11-11「ノスタルジック・クリスマス 2025」＝前年分。2026年版は未発表。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 周年ページ（/news/events/29136）は「しながわ水族館は2026年10月19日（月）に開館35周年を迎えます。」「1年を通して、四季折々の表情を見せる季節のイベントや特別展の開催を予定しています。」にとどまり、会期を持つ周年イベントは未発表。ハロウィン・クリスマスも未発表で、2025年版「しな水のクリスマス2025」（/news/events/17380）は404＝削除済みなので流用不可。「秋の大運動祭」は全体の会期欄が無くコラボ2日（10/3・10/17）だけが確定のため、会期レコードとしては見送った。既存の特別展 shinagawa-aquarium-eric-carle-2026（〜2026-12-25）は投入済み。',
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
    lastChecked: '2026-09-22',
    lastCheckedState:
      '2026-09-22確認: 企画展2本（お仕事展 2026-09-03〜11-08／虫から見る外来種 2026-09-09〜11-15）を公式の常設展・企画展ページで確認し投入した。お知らせ一覧は最新2026-09-20分まで見て、2026年秋冬のハロウィン・クリスマス告知はゼロ＝未発表。注意: イベントページ（/event/event.html）はJavaScript描画で、WebFetchだとテンプレート変数しか返らないためブラウザでのDOM取得が必要。',
    status: 'waiting',
  },
];
