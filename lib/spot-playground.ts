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
  // ───────── 新宿区（2026-11-19 公式確認・batch-9） ─────────
  "新宿中央公園": {
    "summary": "「ちびっこ広場」に大型複合遊具・大型すべり台・乳幼児専用の遊び場・インクルーシブ遊具がそろう。",
    "areas": [
      {
        "name": "ちびっこ広場",
        "items": "大型複合遊具、大型すべり台、乳幼児専用の遊び場、小さな子向けの遊具、障害のある子も一緒に遊べるインクルーシブ遊具",
        "ages": "乳幼児専用の遊び場あり"
      }
    ],
    "note": "区の「特色ある遊具の公園」に、くじらの遊具と石の山がある公園として載っている（園内の位置は公式記載なし）。ちびっこ広場の隣にちびっこ休憩室（授乳室・おむつ交換台）がある。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/file15_02_00001.html",
    "confirmedAt": "2026-11-19"
  },
  "おとめ山公園": {
    "summary": "「みんなの原っぱ」に幼児向けの遊具と健康器具、芝斜面がある。",
    "areas": [
      {
        "name": "みんなの原っぱ",
        "items": "幼児向けの遊具、健康器具、芝斜面",
        "ages": "幼児向け",
        "location": "ふれあい広場から「林間デッキ」を通った先"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori02_001013.html",
    "confirmedAt": "2026-11-19"
  },
  "西戸山公園": {
    "summary": "1号地と3号地の2か所に遊具がある。",
    "areas": [
      {
        "name": "1号地",
        "items": "シーソー、グローブジャングル、鉄棒、すべり台、ブランコ、砂場、小動物の遊具",
        "location": "西戸山小学校の西側の四角い敷地"
      },
      {
        "name": "3号地 遊具広場",
        "items": "ブランコ、すべり台",
        "location": "JR山手線・西武新宿線と道路を挟んで隣接した敷地"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002190.html",
    "confirmedAt": "2026-11-19"
  },
  "落合中央公園": {
    "summary": "「ちびっこ広場」にコンビネーション遊具とスプリング遊具がある。",
    "areas": [
      {
        "name": "ちびっこ広場",
        "items": "コンビネーション遊具、スプリング遊具、健康遊具"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori02_001016.html",
    "confirmedAt": "2026-11-19"
  },
  "西落合公園": {
    "summary": "公園の東側に、すべり台や網の橋からなる複合遊具がある。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "すべり台、網の橋など",
        "location": "公園の東側（遊具と広場のエリア）"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002060.html",
    "confirmedAt": "2026-11-19"
  },
  "落合公園": {
    "summary": "区内でも比較的大きな複合遊具に、ターザンロープ2コースと子ども用クライミングウォールが並ぶ。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "すべり台、吊り橋、ロープネットなど",
        "location": "公園の中央から東側"
      },
      {
        "name": "ターザンロープ",
        "items": "ターザンロープ2コース",
        "location": "複合遊具の西側"
      },
      {
        "name": "クライミングウォール",
        "items": "子ども用クライミングウォール（やさしいルートとむずかしいルート）",
        "ages": "子ども用",
        "location": "複合遊具の隣"
      }
    ],
    "note": "ターザンロープは保護者が付き添って利用し、早朝・夜間は控える（区「特色ある遊具の公園」）。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002107.html",
    "confirmedAt": "2026-11-19"
  },
  "みなみもと町公園": {
    "summary": "「森の広場」の複合遊具と、小さな子向けの「ちびっこ広場」の2か所に遊具がある。",
    "areas": [
      {
        "name": "森の広場",
        "items": "複合遊具、健康遊具"
      },
      {
        "name": "ちびっこ広場",
        "items": "ブランコ、すべり台、砂場",
        "ages": "小さな子ども向け"
      }
    ],
    "note": "森の広場は全体に高低差がある。定期的にプレイパークが開かれる（公式）。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori05_001015.html",
    "confirmedAt": "2026-11-19"
  },
  "北新宿公園": {
    "summary": "高低差を利用した長いすべり台と、赤い吊り橋状の遊具がある。",
    "areas": [
      {
        "name": "吊り橋及びすべり台",
        "items": "高低差を利用した長いすべり台、赤い吊り橋状の遊具"
      }
    ],
    "note": "すべり台の長さは公式記載なし。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_001031.html",
    "confirmedAt": "2026-11-19"
  },
  "百人町ふれあい公園": {
    "summary": "スポーツコーナーの横に、すべり台と雲梯の複合遊具と砂場がある。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "すべり台、雲梯、砂場（併設）",
        "location": "スポーツコーナーの横"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002041.html",
    "confirmedAt": "2026-11-19"
  },
  "鶴巻南公園": {
    "summary": "公園の東側にコンビネーション遊具、フェンスで囲われた砂場がある。",
    "areas": [
      {
        "name": "コンビネーション遊具",
        "items": "よじ登ったり滑り降りたりできるコンビネーション遊具",
        "location": "公園の東側"
      },
      {
        "name": "砂場",
        "items": "砂場（周りをフェンスで囲い、中に一人掛けのスツール）"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_001016.html",
    "confirmedAt": "2026-11-19"
  },
  "北柏木公園": {
    "summary": "森をイメージした複合遊具（すべり台・クライミングなど）と砂場がある。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "森をイメージした複合遊具（すべり台、クライミングなど）"
      },
      {
        "name": "中央の広場の周り",
        "items": "砂場など",
        "location": "中央の平らな広場の周り"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002059.html",
    "confirmedAt": "2026-11-19"
  },
  "白銀（しろがね）公園": {
    "summary": "区が「特色ある遊具」に挙げる巨大な「石の山」がある。",
    "areas": [
      {
        "name": "石の山",
        "items": "登ったり、かくれんぼをしたりできる高低差のある石の山"
      }
    ],
    "note": "夏場（7月上旬〜9月中旬）は水遊び用のシャワーがある（子ども連れのみ）。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/kanko/midori01_001006.html",
    "confirmedAt": "2026-11-19"
  },
  "花園公園": {
    "summary": "複合遊具・ブランコ・スプリング遊具・すべり台・鉄棒など、遊具の数が多い。",
    "areas": [
      {
        "name": "児童コーナー",
        "items": "複合遊具、ブランコ、カニやリスのスプリング遊具、すべり台、鉄棒など"
      }
    ],
    "note": "花園小学校の校庭と一体で使う「一体広場」は、学校の使用時間帯は一般利用できない（公式）。遊具が一体広場の中か外かは公式記載なし。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002056.html",
    "confirmedAt": "2026-11-19"
  },
  "戸塚公園": {
    "summary": "スカイウォークとすべり台の大型複合遊具に、ブランコ・すべり台・石の山がある。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "樹木の周囲をまわるスカイウォーク、すべり台からなる大型遊具"
      },
      {
        "name": "そのほかの遊具",
        "items": "ブランコ、すべり台、石の山"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002096.html",
    "confirmedAt": "2026-11-19"
  },
  "高田馬場公園": {
    "summary": "すべり台とネットの複合遊具に砂場が併設され、近くにスプリング遊具がある。",
    "areas": [
      {
        "name": "複合遊具",
        "items": "すべり台、ネット、砂場（併設）"
      },
      {
        "name": "スプリング遊具",
        "items": "ウサギと自動車を模したスプリング遊具",
        "location": "複合遊具の近く"
      }
    ],
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_002103.html",
    "confirmedAt": "2026-11-19"
  },
  "戸山公園": {
    "summary": "公式の園内マップで、大久保地区の幼児コーナー・子供の広場と、箱根山地区のアスレチック広場・児童コーナーに遊具の記号がある。遊具の種類は公式に記載がない。",
    "areas": [
      {
        "name": "幼児コーナー",
        "items": "遊具（種類は公式記載なし・園内マップに遊具の記号）",
        "location": "大久保地区の北端、高田馬場口の近く"
      },
      {
        "name": "子供の広場",
        "items": "遊具（種類は公式記載なし・園内マップに遊具の記号）",
        "location": "大久保地区の西側、子供の広場口の近く"
      },
      {
        "name": "アスレチック広場",
        "items": "遊具（種類は公式記載なし・園内マップに遊具の記号）",
        "location": "箱根山地区の北側、じゃぶじゃぶ池の東・早稲田口の近く"
      },
      {
        "name": "児童コーナー",
        "items": "遊具（種類は公式記載なし・園内マップに遊具の記号）",
        "location": "箱根山地区の南側、スズカケの広場の東"
      }
    ],
    "note": "遊具の種類・対象年齢は公式ページにも園内マップにも書かれていない。園内マップは2021年11月発行。",
    "sourceUrl": "https://www.tokyo-park.or.jp/park/toyama/assets/files/toyama_map.pdf",
    "confirmedAt": "2026-11-19"
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
