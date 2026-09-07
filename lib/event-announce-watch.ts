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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 「秋の夜散歩」は依然として2025年の情報のまま（2025-10-30〜11-30／16:30〜20:30）で2026年版は未掲載。同園の「コスモスまつり2026」（2026-09-12〜10-25）は会期が出ていたので showa-kinen-cosmos-2026 として投入した。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 2026年秋のイベント告知は依然として記載なし。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: ハロウィンなど秋冬の季節企画は未掲載（検索上位に出る公式ハロウィン記事は2020年のもの。2020年も2026年も10月1日が木曜で曜日一致するため誤読しやすい）。会期の明記があったVRアトラクション（2026-09-01〜11-30）は sumida-aquarium-vr-2026 として投入した。季節企画は引き続き待ち。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 年間案内の「10月中旬〜2月中旬」の常時表記のみ。今シーズンの確定日は未掲載。',
    status: 'waiting',
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
    eventName: '光の王国（ウインターイルミネーション）',
    officialUrl: 'https://www.huistenbosch.co.jp/event/',
    area: 'nagasaki',
    category: 'illumination',
    typicalPeriod: '11月上旬〜翌2月下旬',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: イベントページに2026-2027シーズンの光の王国の会期記載なし（年間カレンダーへの導線のみ）。',
    status: 'waiting',
  },
  {
    venue: 'マザー牧場',
    eventName: 'マザーイルミ（冬のイルミネーション）',
    officialUrl: 'https://www.motherfarm.co.jp/',
    area: 'chiba',
    category: 'illumination',
    typicalPeriod: '11月上旬〜翌3月上旬の土日祝＋年末年始',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 2026-2027シーズンのマザーイルミは未発表のまま（公開は2025-2026シーズンの案内まで）。秋の在庫としては「第25回 秋のこども写生大会」（2026-09-01〜11-30）を motherfarm-shasei-2026 として投入した。',
    status: 'waiting',
  },
  {
    venue: '国営ひたち海浜公園',
    eventName: 'コキアカーニバル',
    officialUrl: 'https://hitachikaihin.jp/',
    area: 'ibaraki',
    category: 'seasonal',
    typicalPeriod: '10月上旬〜10月末',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 「コキアカーニバル」本体の2026年会期は公式に未掲載（2026年用URLは403で本文を取得できず、お知らせ一覧にも会期の明記なし）。一方「コキアライトアップ2026」は会期（2026-09-18〜09-27）が発表されていたので、そちらは hitachi-kochia-lightup-2026 として投入済み。カーニバル本体は引き続き待ち。',
    status: 'waiting',
  },
  {
    venue: '奈良の鹿愛護会 / 春日大社 鹿苑',
    eventName: '古式「鹿の角きり」',
    officialUrl: 'https://naradeer.com/event/tsunokiri.html',
    area: 'nara',
    category: 'seasonal',
    typicalPeriod: '10月または11月の土日2日間',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 公式は2025年（11月8日(土)・9日(日)）の情報のまま。2026年の日程は未掲載のため入れない。',
    status: 'waiting',
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
    officialUrl: 'https://www.kobesuma-seaworld.jp/guide/event/',
    area: 'hyogo',
    category: 'show',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07再確認: 掲載はシャチのテールバースト延長・生きものスマシースクール（9月）等の通年プログラムのみで、開始日・終了日が明記された秋イベントは未掲載。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 2026年のハロウィンナイトZOOは未発表（旧イベントページは404、実在確認できるのは2025年10月25・26・31日の告知のみ）。イルミネーションのページも2025-2026シーズン（2025-11-01〜2026-02-23）のまま。前年は10/15にリリースが出ているので10月上旬に再確認する。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 2026年秋の企画は1件も掲載なし。イルミ「LIGHTIA」のページは前シーズンの残置（11/15〜3/1表記）で今季の会期なし。過去は9月下旬にリリースが出ている。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 公式サイトがJavaScript描画のSPAで、イベント詳細のHTMLに本文が含まれず会期を取得できなかった（curl・WebFetchとも不可）。ブラウザ経由なら取れる可能性あり。10月に再確認する。',
    status: 'waiting',
  },
  {
    venue: 'カワスイ 川崎水族館',
    eventName: '秋冬の季節企画',
    officialUrl: 'https://kawa-sui.com/',
    area: 'kanagawa',
    category: 'seasonal',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 公式がNuxtのSPAでイベント一覧・お知らせがブラウザ描画でも空。トップのPICK UPに出るのは2025年冬の残置コンテンツ。公式ドメインで会期を確認できず。10月に再訪する。',
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
    lastChecked: '2026-09-07',
    lastCheckedState:
      '2026-09-07: 公式イベント一覧に掲載されている現行イベントは6本のみで、ハロウィン企画は未掲載。特別展「ざんねんないきもの展３」（〜11/23）は別途投入済み。',
    status: 'waiting',
  },
];
