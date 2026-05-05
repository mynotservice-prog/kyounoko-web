/**
 * 東京23区内の主要路線マスタ。
 * tokyo-stations.ts の各駅の lines[] とマッチさせて、路線別駅一覧を生成する。
 */

import { TOKYO_STATIONS, type TokyoStation } from './tokyo-stations';

export type TokyoLine = {
  /** URL用slug。例: 'yamanote', 'marunouchi' */
  slug: string;
  /** 表示名。lines[] と一致させる */
  matchName: string;
  /** 表示用フルネーム */
  name: string;
  /** 路線カラー（CSS） */
  color: string;
  /** 運営事業者 */
  operator: 'JR' | 'tokyo-metro' | 'toei' | 'private';
};

/**
 * 主要路線。matchName は TOKYO_STATIONS[].lines に部分一致する形で記述。
 * 例: '山手線' は 'JR山手線' と一致するように "山手線" だけでも良い。
 */
export const TOKYO_LINES: TokyoLine[] = [
  // JR
  { slug: 'yamanote', matchName: '山手線', name: 'JR山手線', color: '#9ACD32', operator: 'JR' },
  { slug: 'keihin-tohoku', matchName: '京浜東北線', name: 'JR京浜東北線', color: '#00B2E5', operator: 'JR' },
  { slug: 'chuo-rapid', matchName: '中央線', name: 'JR中央線', color: '#F15A22', operator: 'JR' },
  { slug: 'sobu', matchName: '総武線', name: 'JR総武線', color: '#FFD400', operator: 'JR' },
  { slug: 'saikyo', matchName: '埼京線', name: 'JR埼京線', color: '#00AC9A', operator: 'JR' },
  { slug: 'keiyo', matchName: '京葉線', name: 'JR京葉線', color: '#C9252C', operator: 'JR' },
  { slug: 'joban', matchName: '常磐線', name: 'JR常磐線', color: '#0072BC', operator: 'JR' },
  // 東京メトロ
  { slug: 'ginza', matchName: '銀座線', name: '東京メトロ銀座線', color: '#FF9500', operator: 'tokyo-metro' },
  { slug: 'marunouchi', matchName: '丸ノ内線', name: '東京メトロ丸ノ内線', color: '#F62E36', operator: 'tokyo-metro' },
  { slug: 'hibiya', matchName: '日比谷線', name: '東京メトロ日比谷線', color: '#B5B5AC', operator: 'tokyo-metro' },
  { slug: 'tozai', matchName: '東西線', name: '東京メトロ東西線', color: '#009BBF', operator: 'tokyo-metro' },
  { slug: 'chiyoda', matchName: '千代田線', name: '東京メトロ千代田線', color: '#00BB85', operator: 'tokyo-metro' },
  { slug: 'yurakucho', matchName: '有楽町線', name: '東京メトロ有楽町線', color: '#C1A470', operator: 'tokyo-metro' },
  { slug: 'hanzomon', matchName: '半蔵門線', name: '東京メトロ半蔵門線', color: '#8F76D6', operator: 'tokyo-metro' },
  { slug: 'namboku', matchName: '南北線', name: '東京メトロ南北線', color: '#00AC9B', operator: 'tokyo-metro' },
  { slug: 'fukutoshin', matchName: '副都心線', name: '東京メトロ副都心線', color: '#9C5E31', operator: 'tokyo-metro' },
  // 都営
  { slug: 'asakusa', matchName: '浅草線', name: '都営浅草線', color: '#E85298', operator: 'toei' },
  { slug: 'mita', matchName: '三田線', name: '都営三田線', color: '#0079C2', operator: 'toei' },
  { slug: 'shinjuku-line', matchName: '新宿線', name: '都営新宿線', color: '#6CBB5A', operator: 'toei' },
  { slug: 'oedo', matchName: '大江戸線', name: '都営大江戸線', color: '#B6007A', operator: 'toei' },
  // 私鉄主要
  { slug: 'tokyu-toyoko', matchName: '東急東横線', name: '東急東横線', color: '#EE0011', operator: 'private' },
  { slug: 'tokyu-den-en-toshi', matchName: '東急田園都市線', name: '東急田園都市線', color: '#005BAC', operator: 'private' },
  { slug: 'tokyu-meguro', matchName: '東急目黒線', name: '東急目黒線', color: '#006FBC', operator: 'private' },
  { slug: 'tokyu-oimachi', matchName: '東急大井町線', name: '東急大井町線', color: '#FF6800', operator: 'private' },
  { slug: 'tokyu-ikegami', matchName: '東急池上線', name: '東急池上線', color: '#EC8FA1', operator: 'private' },
  { slug: 'odakyu', matchName: '小田急', name: '小田急小田原線', color: '#0079C0', operator: 'private' },
  { slug: 'keio', matchName: '京王線', name: '京王線', color: '#DA0442', operator: 'private' },
  { slug: 'keio-inokashira', matchName: '井の頭線', name: '京王井の頭線', color: '#1493D1', operator: 'private' },
  { slug: 'seibu-shinjuku', matchName: '西武新宿線', name: '西武新宿線', color: '#7B7C7D', operator: 'private' },
  { slug: 'seibu-ikebukuro', matchName: '西武池袋線', name: '西武池袋線', color: '#006A4E', operator: 'private' },
  { slug: 'tobu-skytree', matchName: '東武スカイツリーライン', name: '東武スカイツリーライン', color: '#0066B3', operator: 'private' },
  { slug: 'tobu-tojo', matchName: '東武東上線', name: '東武東上線', color: '#FAA61A', operator: 'private' },
  { slug: 'keisei', matchName: '京成', name: '京成本線', color: '#003E92', operator: 'private' },
  { slug: 'keikyu', matchName: '京急', name: '京急本線', color: '#CC0033', operator: 'private' },
  // 新交通
  { slug: 'yurikamome', matchName: 'ゆりかもめ', name: 'ゆりかもめ', color: '#0099D9', operator: 'private' },
  { slug: 'rinkai', matchName: 'りんかい線', name: 'りんかい線', color: '#0084CB', operator: 'private' },
  { slug: 'monorail', matchName: '東京モノレール', name: '東京モノレール', color: '#0072BC', operator: 'private' },
  { slug: 'tsukuba-express', matchName: 'つくばエクスプレス', name: 'つくばエクスプレス', color: '#E60012', operator: 'private' },
  { slug: 'nippori-toneri', matchName: '日暮里舎人', name: '日暮里・舎人ライナー', color: '#EAB117', operator: 'private' },
  { slug: 'arakawa', matchName: '都電荒川線', name: '都電荒川線', color: '#86B81B', operator: 'toei' },
];

export function getLineBySlug(slug: string): TokyoLine | undefined {
  return TOKYO_LINES.find((l) => l.slug === slug);
}

/**
 * 指定路線の駅を順序のまま返す（駅は TOKYO_STATIONS 内での出現順を保持）。
 * matchName が lines[] に含まれる駅を抽出する。
 */
export function getStationsOnLine(line: TokyoLine): TokyoStation[] {
  return TOKYO_STATIONS.filter((s) =>
    s.lines.some((ln) => ln.includes(line.matchName)),
  );
}

/**
 * 全路線について駅数を集計（一覧ページ用）。
 */
export function getLinesWithCounts(): { line: TokyoLine; count: number }[] {
  return TOKYO_LINES.map((line) => ({
    line,
    count: getStationsOnLine(line).length,
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}
