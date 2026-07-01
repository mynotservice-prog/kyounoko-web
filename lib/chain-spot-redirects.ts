/**
 * 全国チェーン外食スポット（category='restaurant' かつ ward='複数'）の
 * /spot/[slug] → まとめ記事(or 外食カテゴリ)への 301（P1-1c）。
 *
 * チェーンは「どこにでもある＝目的地にならない」ためスポットDBの一覧・ランキング・
 * 今日の流れ(destination)からは getOutingSpotsWithSlug が既に除外している。だが
 * /spot/[slug] は 200 のまま生き、Google がクロール・評価し続ける（低品質・重複・
 * チェーン記事とのカニバリ）。ここで URL レベルに 301 して評価を記事へ統合する。
 *
 * 自動生成: scripts/gen-chain-spot-redirects.mts（TOKYO_RESTAURANTS を走査）。
 * 手編集しないこと。name→記事 の対応が無いチェーンは /category/today-taberu へ。
 */
export const CHAIN_SPOT_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: 'IKEA-8n1o', to: '/article/ikea-restaurant-kodzure-koryaku' }, // IKEA レストラン（新三郷・立川・原宿等）
  { from: '-alsu', to: '/article/cocos-kodzure-koryaku' }, // ココス
  { from: '-1m74', to: '/article/gusto-kodzure-koryaku' }, // ガスト
  { from: '-i7d8', to: '/article/kodzure-saize-koryaku' }, // サイゼリヤ
  { from: '-m40s', to: '/article/kura-sushi-kodzure-koryaku' }, // くら寿司
  { from: '-3lc2', to: '/article/sushiro-kodzure-koryaku' }, // スシロー
  { from: '-zdzy', to: '/article/jonathan-kodzure-koryaku' }, // ジョナサン
  { from: '-sb44', to: '/article/ueshima-coffee-kodzure-koryaku' }, // 上島珈琲店・キッズ向けカフェ
  { from: '-am6l', to: '/article/denny-s-kodzure-koryaku' }, // デニーズ
  { from: '-jknt', to: '/article/bamiyan-kodzure-koryaku' }, // バーミヤン
  { from: '-wgol', to: '/article/bigboy-kids-menu' }, // ビッグボーイ
  { from: '-sj4q', to: '/category/today-taberu' }, // フォルクス
  { from: '-nprj', to: '/article/royal-host-kodzure-koryaku' }, // ロイヤルホスト
  { from: '-cdav', to: '/category/today-taberu' }, // 和食さと
  { from: '-ox8j', to: '/category/today-taberu' }, // 華屋与兵衛
  { from: '-8f7m', to: '/article/steak-gusto-kodzure-koryaku' }, // ステーキガスト
  { from: '-kmph', to: '/article/bikkuri-donkey-kodzure-koryaku' }, // びっくりドンキー
  { from: '-975v', to: '/category/today-taberu' }, // カプリチョーザ
  { from: '-pa4f', to: '/article/mcdonalds-kodzure-koryaku' }, // マクドナルド
  { from: '-cbwc', to: '/article/mos-burger-kodzure-koryaku' }, // モスバーガー
  { from: '-dx7m', to: '/article/kfc-kodzure-koryaku' }, // ケンタッキーフライドチキン
  { from: '-0yef', to: '/article/freshness-burger-kodzure-koryaku' }, // フレッシュネスバーガー
  { from: '-khxc', to: '/article/ringer-hut-kodzure-koryaku' }, // リンガーハット
  { from: '-lxt6', to: '/article/marugame-kodzure-koryaku' }, // 丸亀製麺
  { from: '-yd4d', to: '/article/nakau-kodzure-koryaku' }, // なか卯
  { from: '-9l36', to: '/article/matsuya-kodzure-koryaku' }, // 松屋
  { from: '-vet5', to: '/article/sukiya-kodzure-koryaku' }, // すき家
  { from: '-nhmy', to: '/article/yoshinoya-kodzure-koryaku' }, // 吉野家
  { from: '-7gxd', to: '/category/today-taberu' }, // 築地銀だこ
  { from: '-k6id', to: '/article/misdo-kodzure-koryaku' }, // ミスタードーナツ
  { from: '-u7um', to: '/article/yakiniku-king-kodzure-koryaku' }, // 焼肉きんぐ
  { from: '-2guo', to: '/article/shabuyou-kodzure-koryaku' }, // しゃぶ葉
  { from: '-tb61', to: '/article/kappa-sushi-kodzure-koryaku' }, // かっぱ寿司
  { from: '-z109', to: '/article/hama-sushi-kodzure-koryaku' }, // はま寿司
  { from: '-ovak', to: '/article/komeda-kodzure-koryaku' }, // コメダ珈琲店
  { from: '-pfvi', to: '/category/today-taberu' }, // 一蘭
  { from: '-m0jj', to: '/article/tullys-coffee-kodzure-koryaku' }, // タリーズコーヒー（Tully's）キッズメニュー対応店
];
