/**
 * 店0の試験面（2026-10-28 社長決定: 消えた面のうち1km以内に根拠のある店が0で、GSC 直近90日の表示が多い上位20面）。
 * 「この駅の徒歩圏で公式に確認できた店はありません」と書き、近くの代わりを案内する形で戻し、28日で表示・クリックを見る。
 * docs/station-cond-rebuild-2026-10.md §5-3
 */
export const STATION_COND_ZERO_TRIAL: ReadonlySet<string> = new Set([
  "haneda-airport-t2/kaitenzushi",
  "kyodo/famiresu",
  "kasai-rinkai-koen/kids-menu",
  "ryogoku/kaitenzushi",
  "kasai-rinkai-koen/baby",
  "akasaka-mitsuke/kaitenzushi",
  "meidaimae/kaitenzushi",
  "yoyogi-uehara/kaitenzushi",
  "jiyugaoka/kaitenzushi",
  "shin-kiba/famiresu",
  "kasai-rinkai-koen/famiresu",
  "futako-tamagawa/kaitenzushi",
  "roppongi/kaitenzushi",
  "kiyosumi-shirakawa/kaitenzushi",
  "koenji/kaitenzushi",
  "tameike-sanno/kaitenzushi",
  "gaiemmae/famiresu",
  "tsukijishijo/kaitenzushi",
  "haneda-airport-t1/kaitenzushi",
  "nagatacho/kaitenzushi",
]);
