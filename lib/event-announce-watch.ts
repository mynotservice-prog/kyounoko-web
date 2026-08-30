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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '2026-08-31再確認: まだ2025年の情報のまま（2025-10-30〜11-30／16:30〜20:30／入園450円・中学生以下無料）。2026年版は未掲載。',
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
    lastChecked: '2026-08-27',
    lastCheckedState: '2026年秋のライトアップの記載なし。',
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
    lastChecked: '2026-08-31',
    lastCheckedState: '2026-08-31再確認: 2026年秋のイベント告知は依然として記載なし。',
    status: 'waiting',
  },
  {
    venue: '日比谷公園',
    eventName: '東京クリスマスマーケット',
    officialUrl: 'https://tokyochristmas.net/',
    area: 'tokyo',
    category: 'market',
    typicalPeriod: '11月下旬〜12月下旬',
    checkFromMonth: 10,
    lastChecked: '2026-08-27',
    lastCheckedState: '2025年の開催情報のみ。2026年の期間・会場は未掲載。',
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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '2026-08-31再確認: 掲載は「すみすい花火2026」（〜2026-09-14）までのまま。9月15日以降の企画は未掲載。',
    status: 'waiting',
  },
  {
    venue: '東京ドイツ村',
    eventName: 'ウインターイルミネーション',
    officialUrl: 'https://t-doitsumura.co.jp/illumination/',
    area: 'chiba',
    category: 'illumination',
    typicalPeriod: '10月下旬〜翌3月ごろ',
    checkFromMonth: 9,
    lastChecked: '2026-08-31',
    lastCheckedState: '2026-08-31再確認: 「次回予告 詳細が決まり次第お知らせいたします」のまま。会期未発表。',
    status: 'waiting',
  },
  {
    venue: 'あしかがフラワーパーク',
    eventName: '光の花の庭（イルミネーション）',
    officialUrl: 'https://www.ashikaga.co.jp/',
    area: 'tochigi',
    category: 'illumination',
    typicalPeriod: '10月中旬〜2月中旬',
    checkFromMonth: 9,
    lastChecked: '2026-08-31',
    lastCheckedState:
      '2026-08-31再確認: 年間案内の「10月中旬〜2月中旬 イルミネーション」の常時表記のみで変化なし。今シーズンの確定日は未掲載。',
    status: 'waiting',
  },
  {
    venue: '江の島（江の島シーキャンドル）',
    eventName: '湘南の宝石',
    officialUrl: 'https://enoshima-seacandle.com/',
    area: 'kanagawa',
    category: 'illumination',
    typicalPeriod: '11月下旬〜翌2月ごろ',
    checkFromMonth: 10,
    lastChecked: '2026-08-27',
    lastCheckedState:
      '掲載は「江の島灯籠2026」（2026-08-01〜09-23）のみ。冬のイルミネーションは記載なし。',
    status: 'waiting',
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
      '2026-08-31: 公式サイト（tdl/tds いずれも）へアクセスできず未確認（WebFetch・curl とも接続タイムアウト）。検索結果には「2026-09-16〜10-31」とする二次情報があるが公式で裏取りできていないため投入しない。前回2026-08-27時点で公式から確認できていたのは「全身仮装可能期間」（2026-09-15〜09-30、2026-10-16〜10-31）と「ホーンテッドマンション“ホリデーナイトメアー”」（2026-09-15〜2027-01-07）のみ。次回、公式で会期の記載を確認できたら投入する。',
    status: 'waiting',
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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '検索で出てくるのは2025-2026シーズン（2025-11-07〜2026-02-26）の情報まで。2026-2027シーズンの会期は未確認のため未投入。',
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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '公開されているのは2025-2026シーズン（2025-11-01〜2026-03-01の土日祝ほか）の案内まで。2026-2027シーズンは未発表。',
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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '2026年の会期・ライトアップ日程は未発表（確認できたのは2025年の10月開催情報のみ）。スポットページがある施設なので発表され次第入れる。',
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
    lastChecked: '2026-08-31',
    lastCheckedState:
      '公式・奈良市観光協会とも2025年（2025-11-08〜09）の情報のままで2026年の日程は未掲載。検索結果に「2026-11-07〜08」とあるが公式で裏取りできないため入れない。',
    status: 'waiting',
  },
  {
    venue: '四国水族館',
    eventName: '秋の延長営業「誰そ彼時」・秋の企画展',
    officialUrl: 'https://shikoku-aquarium.jp/news/',
    area: 'kagawa',
    category: 'show',
    typicalPeriod: '8月末〜9月末（日の入り10分後まで延長）',
    checkFromMonth: 9,
    lastChecked: '2026-08-31',
    lastCheckedState:
      '公式ニュースに「秋の誰そ彼時…今年も日の入り10分後まで延長営業をします」（2026-08-25掲載）はあるが、記事本文から会期を確定できず未投入。会期の記載を確認してから入れる。',
    status: 'waiting',
  },
  {
    venue: '神戸須磨シーワールド',
    eventName: '秋・冬の季節イベント',
    officialUrl: 'https://www.kobesuma-seaworld.jp/guide/event/',
    area: 'hyogo',
    category: 'show',
    typicalPeriod: '不定（季節ごとに企画が入れ替わる）',
    checkFromMonth: 9,
    lastChecked: '2026-08-31',
    lastCheckedState:
      '掲載は「生きものスマシースクール（9月）」等の通年プログラムのみ。会期のある秋イベントは未掲載。',
    status: 'waiting',
  },
];
