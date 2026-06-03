/**
 * /v2 で使う画像の取得リスト。
 *
 * カテゴリごとに、画像キー（=ファイル名）と検索クエリを定義する。
 * scripts/fetch-v2-images.mjs から読み込まれて Pexels API でダウンロードされる。
 *
 * - query は英語推奨（Pexels の方がヒット率が高い）
 * - 保存先: public/v2/<category>/<key>.jpg
 * - 既にファイルが存在する場合はスキップ（API リクエスト節約）
 */

export const MANIFEST = [
  // ============ TOP / エリア詳細で使う人気スポット ============
  {
    category: 'spots',
    items: [
      { key: 'sunshine-aquarium', query: 'aquarium child family fish tank' },
      { key: 'galaxy-city', query: 'children indoor playground colorful' },
      { key: 'toshima-kidspark', query: 'kids indoor playroom toddler' },
      { key: 'asobono', query: 'children playing balls colorful indoor' },
      { key: 'nanmokyu-park', query: 'family park playground children japan' },
      { key: 'tokyo-zoo', query: 'zoo elephant family kids' },
      { key: 'science-museum', query: 'science museum children exhibition' },
      { key: 'big-slide', query: 'children long slide park' },
    ],
  },
  // ============ 人気ランチ・外食 ============
  {
    category: 'lunch',
    items: [
      { key: 'kitchen-abc', query: 'family restaurant interior japan bright' },
      { key: 'cafe-myiema', query: 'cozy cafe interior warm light' },
      { key: 'racines', query: 'italian restaurant pasta plate' },
      { key: 'wa-cafe-toshima', query: 'japanese cafe matcha plate' },
      { key: 'kid-friendly-cafe', query: 'family cafe kids menu lunch' },
      { key: 'family-italian', query: 'kids pizza plate restaurant' },
      { key: 'family-washoku', query: 'japanese set meal teishoku' },
      { key: 'kids-restaurant', query: 'children eating restaurant family' },
      // 外食まとめ記事用ヒーロー
      { key: 'lunch-hero', query: 'family lunch restaurant bright window' },
      // 個別店舗カード用
      { key: 'gusto', query: 'family restaurant table set plates' },
      { key: 'jonathan', query: 'family diner pancakes drinks' },
      { key: 'ootoya', query: 'japanese teishoku grilled fish rice' },
      { key: 'saizeriya', query: 'italian family pasta budget cheap' },
    ],
  },
  // ============ イベント ============
  {
    category: 'events',
    items: [
      { key: 'kidsfes', query: 'children festival event balloons happy' },
      { key: 'oyako-rhythm', query: 'baby music class mother singing' },
      { key: 'ehon-yomi', query: 'reading picture book children library' },
      { key: 'toshima-marche', query: 'farmers market family bread food' },
      { key: 'event-hero', query: 'children outdoor event summer festival' },
    ],
  },
  // ============ 特集（カード + ヒーロー両用） ============
  {
    category: 'features',
    items: [
      { key: 'rainy-indoor', query: 'children indoor play rainy day' },
      { key: 'rainy-indoor-hero', query: 'children playing colorful balls ball pit' },
      { key: 'baby-debut', query: 'baby first outdoor walk parent' },
      { key: 'free-spots', query: 'family picnic park free outdoor' },
      { key: 'kid-lunch', query: 'children lunch family table happy' },
      { key: 'summer-2026', query: 'summer festival fireworks family japan' },
      { key: 'mizu-asobi', query: 'children water play splash fountain' },
      { key: 'new-indoor', query: 'modern indoor kids facility bright' },
      { key: 'age-0-1', query: 'baby toddler 1 year old playing' },
      { key: 'age-1-3', query: 'toddler 2 year old playing happy' },
      { key: 'age-4-6', query: 'kindergarten child 5 year old smile' },
      { key: 'age-elem', query: 'elementary school child japanese' },
      { key: 'weather-rain', query: 'children playing window rain inside' },
      { key: 'weather-hot', query: 'summer day children popsicle sunny' },
      { key: 'weather-cold', query: 'winter children warm coat snow' },
      { key: 'weather-indoor', query: 'indoor playroom bright children' },
      { key: 'purpose-park', query: 'children running park green grass' },
      { key: 'purpose-water', query: 'kids splash pool water play' },
      { key: 'purpose-event', query: 'children carnival happy event' },
      { key: 'purpose-zoo', query: 'family zoo animals children watching' },
      { key: 'budget-free', query: 'family park free outdoor play' },
      { key: 'budget-low', query: 'children craft cheap fun activity' },
      { key: 'budget-cospa', query: 'happy family activity affordable' },
      { key: 'budget-allday', query: 'theme park family day out' },
    ],
  },
  // ============ エリア（都県・区市町村） ============
  {
    category: 'areas',
    items: [
      { key: 'tokyo', query: 'tokyo skyline cityscape modern' },
      { key: 'saitama', query: 'saitama park nature japan' },
      { key: 'kanagawa', query: 'yokohama bay bridge sunset' },
      { key: 'chiba', query: 'chiba beach coast japan' },
      { key: 'ibaraki', query: 'ibaraki nature flower park' },
      { key: 'tochigi', query: 'tochigi mountain nikko japan' },
      { key: 'gunma', query: 'gunma mountain hot spring japan' },
      // エリア詳細ヒーロー
      { key: 'toshima-hero', query: 'ikebukuro tokyo city skyline' },
      { key: 'shinjuku-hero', query: 'shinjuku tokyo skyscraper' },
      { key: 'shibuya-hero', query: 'shibuya crossing tokyo busy' },
      { key: 'setagaya-hero', query: 'tokyo residential leafy street' },
      { key: 'yokohama-hero', query: 'yokohama minato mirai waterfront' },
    ],
  },
  // ============ ヒーロー画像（TOP用） ============
  {
    category: 'hero',
    items: [
      { key: 'top-hero', query: 'happy family parent child smiling outdoor' },
      { key: 'top-hero-alt', query: 'mother child japanese walking holding hand' },
    ],
  },
  // ============ 新着記事・関連記事サムネ ============
  {
    category: 'articles',
    items: [
      { key: 'aquarium-tips', query: 'aquarium dark blue water fish' },
      { key: 'one-day-plan', query: 'family map planning travel notebook' },
      { key: 'lunch-guide', query: 'family dining restaurant overhead' },
      { key: 'rainy-bag', query: 'umbrella raincoat children rain gear' },
      { key: 'cafe-tips', query: 'cafe child stroller coffee table' },
      { key: 'indoor-tips', query: 'children indoor activity tips' },
    ],
  },
];

/** カテゴリごとのデフォルト除外キーワード（広告風画像などをはじく用） */
export const NEGATIVE_HINT = '';
