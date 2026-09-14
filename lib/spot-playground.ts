/**
 * 公園の遊具・アスレチックを構造化して持つ（lib/spot-parking.ts と同型のデータ層）。
 *
 * ── なぜ必要か（2026-09-12 の実測）────────────────────────
 * 「〇〇公園 遊具」「〇〇公園 アスレチック」は施設名クエリとして継続的に表示が出ており
 * （葛西臨海公園 遊具 98表示・水元公園 遊具 57表示／90日）、着地は /spot ページで9〜10位。
 * ページには playgroundFeatures のチップ（「アスレチック」等の単語）しかなく、
 * 「どこに・どんな遊具が・何歳向けに」あるかが無い。ここを公式確認の本文で埋めて、
 * 順位が3位圏に上がるかを見る実験（対象10公園）。
 *
 * ── 設計 ───────────────────────────────────────────
 *  - 遊具の事実は**ここだけ**に書く。note・FAQ・記事本文に遊具の一覧を直書きしない。
 *  - キーは lib/spots.ts の name と**完全一致**。マージは読込時に spots.ts 側で行う。
 *  - areas は**公式ページに載っている遊び場・遊具広場の単位**で書く。公式に無いエリアや
 *    遊具を写真や第三者サイトから足さない。対象年齢は公式の記載があるときだけ。
 *  - sourceUrl は公園公式（都立公園は東京都公園協会、区立は区公式）。confirmedAt は
 *    **実際にその生HTMLを確認した日**。
 */

export type SpotPlaygroundArea = {
  /** 公式の呼び名（例: 'わんぱく広場' '冒険広場'）。無ければ公式の見出し語 */
  name: string;
  /** 公式に書かれている遊具（例: '大型複合遊具・ロング滑り台・ターザンロープ'） */
  items: string;
  /** 公式に対象年齢の記載があるときだけ（例: '3〜6歳向け' '幼児向け'） */
  ages?: string;
  /** 公式に位置の記載があるときだけ（例: '西口から徒歩5分' '中央広場の北側'） */
  location?: string;
};

export type SpotPlayground = {
  /** 1〜2文の要約。公式記載の範囲で（例: '幼児向けと児童向けの遊具広場が2か所'） */
  summary: string;
  areas: SpotPlaygroundArea[];
  /** 公式に記載がある注意（例: '雨天後は使用中止になることがある' '改修中'）。無ければ省略 */
  note?: string;
  /** 一次情報のURL（公園公式・自治体公式） */
  sourceUrl: string;
  /** 生HTMLを確認した日 YYYY-MM-DD */
  confirmedAt: string;
  /** 表示用の公園名。園内エリアのスポット（じゃぶじゃぶ池等）に親公園の遊具を出すとき、見出しは親公園名で出す */
  park?: string;
};

/** name（lib/spots.ts と完全一致）→ 遊具情報。実験対象10公園から始める */
export const SPOT_PLAYGROUND: Record<string, SpotPlayground> = {
  葛西臨海公園: {
    summary: '芝生広場に隣接する「わくわく広場」が、7歳未満（未就学児）を対象とした遊び場になっている。',
    areas: [
      {
        name: 'わくわく広場',
        items: 'ロッキング遊具、ネット遊具、スライダー',
        ages: '7歳未満（未就学児）向け',
      },
    ],
    sourceUrl: 'https://www.tokyo-park.or.jp/park/kasairinkai/',
    confirmedAt: '2026-09-12',
  },
  水元公園: {
    summary: '「冒険広場」に滑り台や砦遊具があり、幼児でも楽しめるとされている。',
    areas: [
      {
        name: '冒険広場',
        items: '滑り台、砦遊具など',
        ages: '幼児向け',
      },
    ],
    sourceUrl: 'https://www.tokyo-park.or.jp/park/mizumoto/',
    confirmedAt: '2026-09-12',
  },
  城南島海浜公園: {
    summary: '「波の広場」に幼児から小学生低学年向けの複合遊具がある。',
    areas: [
      {
        name: '波の広場',
        items: '複合遊具',
        ages: '幼児から小学生低学年向け',
      },
    ],
    sourceUrl: 'https://tokyo-south-seaside-parks.com/jonanjima-plaza/',
    confirmedAt: '2026-09-12',
  },
  舎人公園: {
    summary: '南東のC地区にある遊具広場「冒険の丘」で、ユニバーサルデザインのぶらんこや複合遊具などで遊べる。',
    areas: [
      {
        name: '冒険の丘',
        items: 'ユニバーサルデザインのぶらんこ、複合遊具など',
        location: '舎人公園南東のC地区',
      },
    ],
    note: '自転車・三輪車・ストライダー・スケートボード類の走行は不可。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/toneri/facility/',
    confirmedAt: '2026-09-12',
  },
  駒沢オリンピック公園: {
    summary: 'りす・ぶた・うまの動物をモチーフにした遊具のある児童公園が、園内3か所にある。',
    areas: [
      {
        name: '児童公園',
        items: 'りす・ぶた・うまの動物をモチーフにした遊具',
        location: '園内3か所',
      },
    ],
    sourceUrl: 'https://www.tokyo-park.or.jp/park/komazawa-olympic/',
    confirmedAt: '2026-09-12',
  },
  府中の森公園: {
    summary: '「もり公園にじいろ広場」が、車椅子の子どもも遊べるユニバーサル遊具のある遊具広場になっている。',
    areas: [
      {
        name: 'もり公園にじいろ広場',
        items: 'ユニバーサル遊具',
      },
    ],
    note: 'フェンス内利用時間は4/1〜8/31が9:00〜17:00、9/1〜3/31が9:00〜16:00（フェンス外にも遊具がある）。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/fuchunomori/',
    confirmedAt: '2026-09-12',
  },
  光が丘公園: {
    summary: '「ちびっ子広場」に複数の遊具が設置されている。',
    areas: [
      {
        name: 'ちびっ子広場',
        items:
          'エンドレスターザンロープ、コンビネーション遊具（3基）、ザイルクライミング、鉄棒、ぶらんこ、幼児用ぶらんこ、砂場など',
      },
    ],
    sourceUrl: 'https://www.tokyo-park.or.jp/park/hikarigaoka/facility/',
    confirmedAt: '2026-09-12',
  },
};

/**
 * 園内エリアのスポット（じゃぶじゃぶ池・水遊び場）→ 親公園。
 * 「〇〇公園 遊具」で表示が出ているのは水遊び場のページであることが多い（水元公園・舎人公園）。
 * 同じ公園なので親公園の遊具情報を出す。lib/spot-parking.ts の SPOT_PARKING_ALIAS と同型。
 */
export const SPOT_PLAYGROUND_ALIAS: Record<string, string> = {
  '水元公園 水遊び場': '水元公園',
  '舎人公園 じゃぶじゃぶ池（浮球の池）': '舎人公園',
  '駒沢オリンピック公園 ジャブジャブ池': '駒沢オリンピック公園',
  '光が丘公園 水景施設': '光が丘公園',
};

/** name（上書き前）から遊具情報を引く。園内エリアは親公園に寄せ、見出し用に park を付ける */
export function getSpotPlayground(spotName: string): SpotPlayground | undefined {
  if (SPOT_PLAYGROUND[spotName]) return { ...SPOT_PLAYGROUND[spotName], park: spotName };
  const parent = SPOT_PLAYGROUND_ALIAS[spotName];
  return parent && SPOT_PLAYGROUND[parent] ? { ...SPOT_PLAYGROUND[parent], park: parent } : undefined;
}
