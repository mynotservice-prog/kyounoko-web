// チェーン周辺条件フラグメント（baby-chair/stroller/omutsu/rinyushoku-mochikomi/morning-kosodate）を
// 内容を包含する [chain]-kodzure-koryaku へ 301 統合。死蔵ページの被リンク資産を勝ちページに集約する目的。
// 2026-06-25 記事棚卸し監査に基づき生成（scripts/seo-article-audit.mjs）。
export const ARTICLE_REDIRECTS: { from: string; to: string }[] = [
  // 2026-07-15 AdSense薄ページ統合: 誕生日は1saiへprimary昇格統合、くら寿司離乳食はchain-15ハブへ集約
  { from: 'tanjoubi-iwai-2sai', to: 'tanjoubi-iwai-1sai' },
  { from: 'tanjoubi-iwai-3sai', to: 'tanjoubi-iwai-1sai' },
  { from: 'kurasushi-rinyushoku-mochikomi', to: 'rinyuushoku-mochikomi-chain-15' },
  { from: 'cocoichi-stroller', to: 'cocoichi-kodzure-koryaku' },
  { from: 'nakau-stroller', to: 'nakau-kodzure-koryaku' },
  { from: 'anrakutei-stroller', to: 'anrakutei-kodzure-koryaku' },
  { from: 'bamiyan-baby-chair', to: 'bamiyan-kodzure-koryaku' },
  { from: 'bamiyan-omutsu', to: 'bamiyan-kodzure-koryaku' },
  { from: 'bamiyan-rinyushoku-mochikomi', to: 'bamiyan-kodzure-koryaku' },
  { from: 'cocoichi-baby-chair', to: 'cocoichi-kodzure-koryaku' },
  { from: 'cocoichi-omutsu', to: 'cocoichi-kodzure-koryaku' },
  { from: 'cocoichi-rinyushoku-mochikomi', to: 'cocoichi-kodzure-koryaku' },
  { from: 'cocos-baby-chair', to: 'cocos-kodzure-koryaku' },
  { from: 'cocos-omutsu', to: 'cocos-kodzure-koryaku' },
  { from: 'cocos-rinyushoku-mochikomi', to: 'cocos-kodzure-koryaku' },
  { from: 'cocos-stroller', to: 'cocos-kodzure-koryaku' },
  { from: 'costco-baby-chair', to: 'costco-kodzure-koryaku' },
  { from: 'costco-stroller', to: 'costco-kodzure-koryaku' },
  { from: 'doutor-morning-kosodate', to: 'doutor-kodzure-koryaku' },
  { from: 'gusto-baby-chair', to: 'gusto-kodzure-koryaku' },
  { from: 'gusto-omutsu', to: 'gusto-kodzure-koryaku' },
  { from: 'gyukaku-baby-chair', to: 'gyukaku-kodzure-koryaku' },
  { from: 'gyukaku-omutsu', to: 'gyukaku-kodzure-koryaku' },
  { from: 'jonathan-omutsu', to: 'jonathan-kodzure-koryaku' },
  { from: 'jonathan-rinyushoku-mochikomi', to: 'jonathan-kodzure-koryaku' },
  { from: 'matsuya-rinyushoku-mochikomi', to: 'matsuya-kodzure-koryaku' },
  { from: 'matsuya-stroller', to: 'matsuya-kodzure-koryaku' },
  { from: 'nakau-omutsu', to: 'nakau-kodzure-koryaku' },
  { from: 'nakau-rinyushoku-mochikomi', to: 'nakau-kodzure-koryaku' },
  { from: 'ohsho-omutsu', to: 'ohsho-kodzure-koryaku' },
  { from: 'royal-host-morning-kosodate', to: 'royal-host-kodzure-koryaku' },
  { from: 'royal-host-omutsu', to: 'royal-host-kodzure-koryaku' },
  { from: 'royal-host-rinyushoku-mochikomi', to: 'royal-host-kodzure-koryaku' },
  { from: 'starbucks-morning-kosodate', to: 'starbucks-kodzure-koryaku' },
  { from: 'sukiya-omutsu', to: 'sukiya-kodzure-koryaku' },
  { from: 'sukiya-rinyushoku-mochikomi', to: 'sukiya-kodzure-koryaku' },
  { from: 'sukiya-stroller', to: 'sukiya-kodzure-koryaku' },
  { from: 'sushiro-omutsu', to: 'sushiro-kodzure-koryaku' },
  { from: 'sushiro-rinyushoku-mochikomi', to: 'sushiro-kodzure-koryaku' },
  { from: 'sushiro-stroller', to: 'sushiro-kodzure-koryaku' },
  { from: 'yakiniku-king-baby-chair', to: 'yakiniku-king-kodzure-koryaku' },
  { from: 'yakiniku-king-omutsu', to: 'yakiniku-king-kodzure-koryaku' },
  { from: 'yakiniku-king-stroller', to: 'yakiniku-king-kodzure-koryaku' },
  { from: 'yayoiken-baby-chair', to: 'yayoiken-kodzure-koryaku' },
  { from: 'yoshinoya-omutsu', to: 'yoshinoya-kodzure-koryaku' },
  { from: 'yoshinoya-rinyushoku-mochikomi', to: 'yoshinoya-kodzure-koryaku' },
  { from: 'yoshinoya-stroller', to: 'yoshinoya-kodzure-koryaku' },
  // 「いつから」完全重複ペアの統合（牛肉・国内旅行）
  { from: 'kodomo-gyu-itsukara', to: 'kodomo-gyuniku-itsukara' },
  { from: 'kodomo-kokunai-ryokou-itsukara', to: 'kodomo-kokunai-ryoko-itsukara' },
  // 2026-07-21 いつからカニバリ回収: 同義の厚い重複を勝ち記事(正典)へ301統合し検索シグナルの共食いを解消。
  //   ぶどう: grape(8,791字/1,826imp pos8.9)を正典に、budou(6,574字)を吸収。
  //   卵かけご飯: tkg(生卵5〜6歳=最新の答え)を正典に、既にnoindex済のtamago-kake-gohan(生卵3〜5歳=旧値)を301へ格上げ。
  { from: 'kodomo-budou-itsukara', to: 'kodomo-grape-itsukara' },
  { from: 'kodomo-tamago-kake-gohan-itsukara', to: 'kodomo-tkg-itsukara' },
  // 2026-06-30: 統合先(kodzure-koryaku)が在るチェーン周辺フラグメントを noindex から 301 統合へ格上げ。
  { from: 'hamasushi-stroller', to: 'hama-sushi-kodzure-koryaku' },
  { from: 'hamasushi-omutsu', to: 'hama-sushi-kodzure-koryaku' },
  { from: 'marukame-stroller', to: 'marugame-kodzure-koryaku' },
  { from: 'marukame-omutsu', to: 'marugame-kodzure-koryaku' },
  { from: 'ikea-rinyushoku', to: 'ikea-restaurant-kodzure-koryaku' },
  { from: 'steakgusto-stroller', to: 'steak-gusto-kodzure-koryaku' },
  // 2026-07-09: チェーン「-real」記事のカニバリ解消。声データを統合先へ移植した上で301統合。
  { from: 'gusto-rinyu-warm-real', to: 'gusto-kodzure-koryaku' },
  { from: 'shabuyou-3sai-free-real', to: 'shabuyou-kodzure-koryaku' },
  { from: 'yayoiken-toribunke-real', to: 'yayoiken-kodzure-koryaku' },
  { from: 'bamiyan-china-toribunke-real', to: 'bamiyan-kodzure-koryaku' },
  { from: 'cocos-birthday-real', to: 'cocos-kodzure-koryaku' },
  { from: 'royal-host-kinenbi-real', to: 'royal-host-kodzure-koryaku' },
  { from: 'dennys-arerugen-real', to: 'denny-s-kodzure-koryaku' },
  // 2026-07-24 紅葉カニバリ正典統合: 10選(3,430字)を20選(6,250字+独自セクション)へ301。
  // 独自価値(大山・本土寺・持ち物リスト)は勝者へ移植済み。
  { from: 'kouyou-spots-kanto-koduzure', to: 'koyou-kanto-kodzure-20' },
  // 2026-08-31 GEO監査で発見: 旧料金(3歳以下無料/4-6歳数百円/小学生半額)の誤情報が残存し
  // Bing top10で露出、新記事と矛盾。Google側は8月表示ゼロの死蔵。正しい料金を持つ勝者へ301。
  { from: 'shabuyo-kids-menu', to: 'shabuyou-kodzure-koryaku' },
];
