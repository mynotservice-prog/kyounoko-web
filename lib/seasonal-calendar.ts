/**
 * 季節企画カレンダー｜年間イベントとそれに紐づく記事の中央定義。
 *
 * 目的：
 * - 月別に検索ボリュームのピークが来る記事を整理
 * - 「現在の季節特集」をホームに表示
 * - 1ヶ月前にIndexNow送信してインデックス更新
 * - 編集チームの記事更新優先順位の指標
 *
 * 運用：
 * - 月初にスケジュールタスクが自動でその月の `slugs` をIndexNow送信
 * - HOME上部の「今月の特集」セクションがこのデータを参照
 * - 新規記事を追加したら該当月の `slugs` に登録する
 */

export type SeasonalEntry = {
  /** "MM" 形式（"01"〜"12"） */
  month: string;
  /** ホームの特集タイトル */
  label: string;
  /** 主要テーマ（複数キーワード） */
  themes: string[];
  /** その月の検索ボリュームが上がる記事スラッグ */
  slugs: string[];
  /** いつから準備記事を出すか（記事公開ピーク月） */
  prepStart?: string;
  /** その月限定の特集説明（HOME表示用） */
  description: string;
};

export const SEASONAL_CALENDAR: SeasonalEntry[] = [
  {
    month: '01',
    label: '入園準備・お正月',
    themes: ['保育園入園準備', '幼稚園入園準備', 'お正月遊び', '冬の家遊び'],
    slugs: [
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
      'youchien-hoikuen-junbi-rakuten',
      'oshougatsu-kodomo-sugoshikata',
    ],
    prepStart: '11',
    description: '4月入園に向けて準備本格化。お正月の家族時間も大切に。',
  },
  {
    month: '02',
    label: '入学準備・節分',
    themes: ['小学校入学準備', 'ランドセル選び', '節分', 'お名前付け'],
    slugs: [
      'shougakkou-nyugaku-junbi-kanzen-list',
      'randoseru-erabikata-osusume-2026',
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    ],
    prepStart: '12',
    description: '4月入学までの準備ラストスパート。学用品とお名前付けで慌てない。',
  },
  {
    month: '03',
    label: 'ひな祭り・卒園',
    themes: ['ひな祭り', '卒園式', '入学準備仕上げ', 'お別れ会'],
    slugs: [
      'shougakkou-nyugaku-junbi-kanzen-list',
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    ],
    prepStart: '01',
    description: 'ひな祭り・卒園式・新生活準備。3月は別れと始まりの月。',
  },
  {
    month: '04',
    label: '入園・入学・お花見',
    themes: ['入園式', '入学式', 'GW準備', 'お花見', '慣らし保育'],
    slugs: [
      'natsuyasumi-keikaku-2026-kodzure',
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    ],
    description: '入園・入学で生活が大きく変わる月。慣らし保育を乗り越える。',
  },
  {
    month: '05',
    label: 'こどもの日・母の日・GW',
    themes: ['こどもの日', '母の日', 'GW子連れ', '春のお出かけ'],
    slugs: [
      'natsuyasumi-keikaku-2026-kodzure',
    ],
    description: 'GWの過ごし方とこどもの日・母の日の準備。',
  },
  {
    month: '06',
    label: '梅雨・夏準備',
    themes: ['梅雨の室内遊び', '虫除け', '日焼け止め', 'プール準備'],
    slugs: [
      'katei-pool-osusume-ranking-2026',
      'kodomo-hiyakedome-osusume-2026',
      'kodomo-mushiyoke-3shurui-hikaku-real',
      'mizuasobi-omocha-osusume-2026',
      'kodomo-suitou-mugicha-pitcher-2026',
    ],
    prepStart: '04',
    description: '梅雨の室内遊びと、夏本番への準備品の購入ピーク。',
  },
  {
    month: '07',
    label: '夏休み開始・七夕・自由研究',
    themes: ['夏休み', '七夕', '自由研究', 'プール', '海水浴', '夏祭り'],
    slugs: [
      'natsuyasumi-keikaku-2026-kodzure',
      'jiyukenkyu-kit-osusume-2026',
      'jiyukenkyu-1nichi-kodomo-30',
      'tanabata-kazari-tedukuri-0-6sai-7shurui',
      'natsumatsuri-kodzure-koryaku-2026',
      'yukata-jinbei-kodomo-osusume-2026',
      'katei-pool-osusume-ranking-2026',
      'natsuyasumi-hirugohan-mainichi-idea-20',
    ],
    prepStart: '05',
    description: '夏休みが始まる繁忙期。自由研究・夏祭り・プール準備のピーク。',
  },
  {
    month: '08',
    label: 'お盆・夏祭り・花火',
    themes: ['お盆帰省', '夏祭り', '花火大会', '熱中症対策', '自由研究'],
    slugs: [
      'obon-kisei-shintetsu-baby',
      'natsumatsuri-kodzure-koryaku-2026',
      'tokyo-hanabi-taikai-kodzure-2026',
      'yukata-jinbei-kodomo-osusume-2026',
      'kodomo-netsuchusho-3sain-real-2026',
      'jiyukenkyu-1nichi-kodomo-30',
      'natsuyasumi-kazoku-ryokou-kodzure-2026',
    ],
    prepStart: '06',
    description: 'お盆帰省と花火大会・夏祭りで家族イベント満載の月。',
  },
  {
    month: '09',
    label: '運動会・敬老の日',
    themes: ['運動会', '敬老の日', '秋服', '夏休み明け'],
    slugs: [
      'undokai-bentou-mochimono-kamigata',
      'natsuyasumi-ake-hoikuen-guzu-taiou',
    ],
    prepStart: '07',
    description: '運動会シーズン。お弁当・持ち物・敬老の日のプレゼント準備。',
  },
  {
    month: '10',
    label: 'ハロウィン・運動会後半',
    themes: ['ハロウィン', '秋のお出かけ', '七五三準備', '冬支度'],
    slugs: [
      'undokai-bentou-mochimono-kamigata',
      'shichigosan-nenrei-junbi',
    ],
    prepStart: '08',
    description: 'ハロウィン仮装と七五三の準備。秋のお出かけシーズン。',
  },
  {
    month: '11',
    label: '七五三・クリスマス準備',
    themes: ['七五三', 'クリスマスプレゼント', '入園願書', '保育園申込'],
    slugs: [
      'shichigosan-nenrei-junbi',
      'shichigosan-fukusou-shashin-kanzen',
      'xmas-present-nenrei-0-6',
      'christmas-present-kodomo-nenrei-betsu',
      'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    ],
    prepStart: '09',
    description: '七五三本番＋クリスマスプレゼント選び＋保育園申込締切。',
  },
  {
    month: '12',
    label: 'クリスマス・年末',
    themes: ['クリスマス', '年末年始', 'お正月準備', '冬休み'],
    slugs: [
      'xmas-present-nenrei-0-6',
      'christmas-present-kodomo-nenrei-betsu',
      'oshougatsu-kodomo-sugoshikata',
      'osechi-kodomo-kantan-menu',
    ],
    prepStart: '10',
    description: 'クリスマス本番と年末年始準備。冬休みの過ごし方も。',
  },
];

/**
 * 現在の月（"01"〜"12"）の特集を返す。
 * 月初実行のスケジュールタスクからも使われる。
 */
export function getCurrentSeasonalEntry(date: Date = new Date()): SeasonalEntry | undefined {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return SEASONAL_CALENDAR.find((e) => e.month === m);
}

/**
 * 「準備すべき記事」を返す。
 * 例：6月時点では `prepStart='06'` の7月・8月特集記事も対象に。
 */
export function getUpcomingSeasonalSlugs(date: Date = new Date()): string[] {
  const m = date.getMonth() + 1;
  const result = new Set<string>();
  for (const entry of SEASONAL_CALENDAR) {
    const targetMonth = parseInt(entry.month, 10);
    const prepMonth = entry.prepStart ? parseInt(entry.prepStart, 10) : targetMonth - 1;
    // 準備月〜本番月の範囲ならピックアップ
    const isInWindow =
      (m >= prepMonth && m <= targetMonth) ||
      // 年またぎ（11月から1月準備など）
      (prepMonth > targetMonth && (m >= prepMonth || m <= targetMonth));
    if (isInWindow) {
      entry.slugs.forEach((s) => result.add(s));
    }
  }
  return Array.from(result);
}

/**
 * 翌月の準備対象。
 * 例：6月実行時は7月特集の slugs を返す → IndexNowで先取り通知。
 */
export function getNextMonthSeasonalEntry(date: Date = new Date()): SeasonalEntry | undefined {
  const nextMonth = (date.getMonth() + 1) % 12 + 1; // 1-12
  const m = String(nextMonth).padStart(2, '0');
  return SEASONAL_CALENDAR.find((e) => e.month === m);
}
