/**
 * 神奈川観光ファミリー駅（辻堂・片瀬江ノ島・向ヶ丘遊園）。
 * 各店は2026-08-24に公式フロアガイド/店舗公式で実在確認済み。
 *
 * - 辻堂: テラスモール湘南 公式ショップガイド（shonan.terracemall.com/shopguide/detail/?scd=…）
 *   の各店詳細ページで店名・フロア・対応サービス（キッズメニュー/キッズチェア等）を確認
 * - 片瀬江ノ島: 各店舗公式サイト（tobiccho.com / enoshima-koya.com / enoshimatei.com）で確認
 * - 向ヶ丘遊園: 各店舗公式サイト/公式ページ（giorgio-it.com / gax4104.gorp.jp）で確認
 * - 設備フィールドは出典に明記があるもののみ true。記載が無い項目は undefined のまま
 */

import type { StationIndieMap } from './types';

export const CHUNK_41: StationIndieMap = {
  // ===========================================================
  // 辻堂（テラスモール湘南）
  // ===========================================================

  'tsujido': [
    {
      // 出典: https://shonan.terracemall.com/shopguide/detail/?scd=000437（2026-08-24確認）
      name: 'しらす問屋 とびっちょ テラスモール湘南店',
      genre: 'sushi',
      area: '辻堂駅周辺（テラスモール湘南3F フードコート「潮風キッチン」）',
      description:
        '江の島の有名しらす専門店のフードコート店。釜揚げしらすの丼が看板で、生しらすは1月〜3月中旬の禁漁期間は提供なし。施設公式ガイドにキッズメニュー・キッズチェア・アレルギー対応表の記載がある。',
      kidsMenu: true,
      kidsChair: true,
      allergenInfo: true,
      popular: true,
    },
    {
      // 出典: https://shonan.terracemall.com/shopguide/detail/?scd=000443（2026-08-24確認）
      name: '里のうどん テラスモール湘南店',
      genre: 'noodles',
      area: '辻堂駅周辺（テラスモール湘南3F フードコート「潮風キッチン」）',
      description:
        '施設公式ガイドいわく全国丼グランプリ金賞を3年連続受賞した「バラ丼」が名物のうどん店。季節限定うどんや天ぷらもあり、公式ガイドにキッズメニュー・キッズチェアの記載がある。フードコートで子連れでも使いやすい。',
      kidsMenu: true,
      kidsChair: true,
      popular: true,
    },
    {
      // 出典: https://shonan.terracemall.com/shopguide/detail/?scd=000483（2026-08-24確認）
      name: 'いしがまやハンバーグ Farm to Table',
      genre: 'yoshoku',
      area: '辻堂駅周辺（テラスモール湘南4F）',
      description:
        '石窯で焼くハンバーグ＆ステーキ専門店の新レーベル。専用石窯でふっくら焼き上げるハンバーグに、こだわりの米と新鮮野菜を合わせる。施設公式ガイドに88席、キッズメニュー・キッズチェアの記載がある。',
      kidsMenu: true,
      kidsChair: true,
    },
    {
      // 出典: https://shonan.terracemall.com/shopguide/detail/?scd=000644（2026-08-24確認）
      name: 'Hawaiian Cafe & Restaurant Merengue テラスモール湘南店',
      genre: 'cafe',
      area: '辻堂駅周辺（テラスモール湘南4F）',
      description:
        'ハワイアンロコフードと自家製スイーツのカフェ＆レストラン。ふわふわパンケーキが一番人気（施設公式ガイドより）。子供向け設備の記載は公式ガイドに無いため、利用前に店舗へ確認したい。',
    },
  ],

  // ===========================================================
  // 片瀬江ノ島（江の島・新江ノ島水族館エリア）
  // ===========================================================

  'katase-enoshima': [
    {
      // 出典: http://enoshima-koya.com/access/access.html ほか公式サイト（2026-08-24確認）
      name: '江ノ島小屋',
      genre: 'sushi',
      area: '片瀬江ノ島駅から徒歩2分（片瀬海岸）',
      description:
        '片瀬海岸の海鮮食事処。名物「まかない丼」や釜揚げしらす丼を朝8時からの通し営業で提供する。公式サイトに小上がり8席・テーブル12席・デッキ32席・カウンター4席の記載があり、座敷スタイルの席が選べる。',
      seatingType: ['zashiki', 'table', 'terrace', 'counter'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      // 出典: http://tobiccho.com/shops/tobiccho（2026-08-24確認）
      name: 'しらす問屋 とびっちょ 江の島本店',
      genre: 'sushi',
      area: '片瀬江ノ島駅周辺（江の島島内）',
      description:
        '行列のできる江の島のしらす料理専門店。釜揚げしらす丼や名物とびっちょ丼が看板で、公式メニューに小学生以下対象のお子様セット（770円〜）とお子様ランチがある。生しらすは1月〜3月中旬の禁漁期間は提供なし。',
      kidsMenu: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      // 出典: https://www.enoshimatei.com/shop / menu1（2026-08-24確認）
      name: '江之島亭',
      genre: 'washoku',
      area: '片瀬江ノ島駅周辺（江の島島内）',
      description:
        '明治42年創業の老舗。名物はさざえの卵とじをのせた「江之島丼」で、富士と湘南を望む眺望も売り。公式メニューにお子様丼（オレンジジュース付き）の記載がある。予約は不可で、入口の発券機で番号札を取る方式。',
      kidsMenu: true,
      popular: true,
    },
  ],

  // ===========================================================
  // 向ヶ丘遊園（藤子・F・不二雄ミュージアム最寄り）
  // ===========================================================

  'mukogaoka-yuen': [
    {
      // 出典: https://giorgio-it.com/about（2026-08-24確認）
      name: 'クッチーナ イタリアーナ サンジョルジョ',
      genre: 'italian',
      area: '向ヶ丘遊園駅から徒歩3分（多摩区役所近く）',
      description:
        'ナポリから直輸入した薪窯で焼くナポリピッツァと、イタリア各地の郷土料理の店。公式サイトに総席数40席（1F12席・2F28席）、ランチ11:30〜15:00の記載がある。定休日は月曜（祝日の場合は翌火曜）。',
      seatingType: ['table'],
    },
    {
      // 出典: https://gax4104.gorp.jp/（店舗オフィシャルページ、2026-08-24確認）
      name: 'セテュヌボンニデー ベイクドカフェ',
      genre: 'bakery',
      area: '向ヶ丘遊園駅から徒歩4分（登戸）',
      description:
        '国産小麦にこだわる人気ベーカリー「セテュヌ・ボンニデー」併設のカフェ。公式ページに「お子様連れ大歓迎」・席数20席の記載があり、焼きたてのパンをその場で楽しめる。営業日は変わることがあるため事前確認が安心。',
    },
  ],
};
