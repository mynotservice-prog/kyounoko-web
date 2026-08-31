import type { NextConfig } from 'next';
import { SPOT_REDIRECTS } from './lib/spot-redirects';
import { CHAIN_SPOT_REDIRECTS } from './lib/chain-spot-redirects';
import { ARTICLE_REDIRECTS } from './lib/article-redirects';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // /api/admin/edit-content は GitHub 取得失敗時（トークン失効等）に
  // 同梱 md へフォールバックして読むため、関数バンドルに content/ を確実に含める。
  outputFileTracingIncludes: {
    '/api/admin/edit-content': ['./content/articles/**/*', './content/plans/**/*'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },

  async headers() {
    // CDN（Cloudflare）に edge キャッシュを効かせるための共通 Cache-Control。
    // - max-age=0, must-revalidate: ブラウザは毎回再検証（ユーザーに常に新鮮なHTMLを返す）
    // - s-maxage / CDN-Cache-Control: CDN（Cloudflare）には 24h キャッシュさせる
    // - stale-while-revalidate=604800: 24h過ぎても 7日 は古いキャッシュを返しつつ裏で再取得
    // - Cloudflare は CDN-Cache-Control を最優先、なければ s-maxage を尊重する仕様
    //
    // 【コスト最適化 2026-07-19】記事/カテゴリ/タグ等は編集時に on-demand revalidation
    //   （revalidatePath/revalidateTag + CF purge）で即時反映するため、時間ベースの
    //   再検証は 1h → 24h に延長。CF→Vercel の origin 再取得（Fast Origin Transfer）と
    //   ISR バックグラウンド再生成（Function Invocations / Fluid CPU / Observability）を
    //   ~24倍削減する。編集反映は on-demand 側が担保するので鮮度は落ちない。
    const edgeCache = 'public, max-age=0, must-revalidate, s-maxage=86400, stale-while-revalidate=604800';
    const cdnCache = 'public, max-age=86400, stale-while-revalidate=604800';

    // スポット詳細は /admin/spots/edit から画像・本文を編集する。保存時に
    // revalidateTag/revalidatePath でVercelオリジンを即時更新し、さらに purgeCfUrls で
    // Cloudflare も即パージする（app/api/admin/spot-overrides/route.ts）ため、CDNキャッシュは
    // 短命である必要がなくなった。旧 60s は CF 再取得が過剰でコスト源だったため 1h に延長。
    const spotEdgeCache = 'public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=86400';
    const spotCdnCache = 'public, max-age=3600, stale-while-revalidate=86400';

    return [
      // 全パス共通のセキュリティヘッダ
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // 静的HTMLとして扱ってよいページ群を CDN にキャッシュさせる。
      // Next.js の ISR (revalidate=3600) と整合させ、CF edge HIT 率を上げる。
      // article/spot/category/tag/station/plan は全部 HTML 配信＆動的データなしなのでキャッシュOK。
      {
        source: '/article/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/spot/:slug*',
        headers: [
          { key: 'Cache-Control', value: spotEdgeCache },
          { key: 'CDN-Cache-Control', value: spotCdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: spotCdnCache },
        ],
      },
      {
        source: '/category/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/tag/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/station/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/plan/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/feature/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/kid-reports',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      // /today は searchParams を読むため Next.js 上は常に動的レンダリング扱いになり、
      // CDNヘッダが無いと毎リクエストが Vercel Function を起動する（Functions監視で
      // /today が突出して Active CPU を消費していたのはこれが原因）。
      // ページ本体はクエリ→静的データの純粋計算で fetch/cookies/時刻依存なし＝同一URLは
      // 常に同一結果なので、他の静的HTMLページと同様に CDN キャッシュ可。クエリ文字列違いは
      // Cloudflare 側で別キャッシュキーになるため条件別ページも正しく分離される。
      // 24h edge / 7日 SWR。
      {
        source: '/today',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      // 【2026-08-17】/events・/ranking・/spots にも /today と同じ CDN キャッシュを付ける。
      //
      // これらも searchParams を読むため常に動的レンダリング扱いで、ヘッダが無いと
      // 同一URLの2回目以降も Vercel edge に載らず毎回 Function を起動していた
      // （実測: /today は2回目 x-vercel-cache HIT、/events・/ranking は2回とも MISS）。
      //
      // robots.ts から `Disallow: /*?` を外してクエリ変種をクロールさせる（noindex を
      // Google に読ませて 3,845件のインデックス残骸を剥がすため）にあたり、
      // クロール由来の Function 起動を「URLごとに初回1回だけ」に抑える必要がある。
      // ページ本体はクエリ→静的データの純粋計算で fetch/cookies/時刻依存が無く、
      // 同一URLは常に同一結果なのでキャッシュして安全。
      {
        source: '/events',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/ranking',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/spots',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ===== スポット監査(2026-06-18)に伴う旧slug→新slugの301 =====
      // 市区町村修正・改称・都道府県修正・重複統合で slug が変わった分の救済。
      // ⚠️ 2段リダイレクト（308→308）を潰す（2026-08-31）。
      // SPOT_REDIRECTS の to が CHAIN_SPOT_REDIRECTS の from と一致していると、
      //   /spot/A →(308) /spot/B →(308) /article/C
      // という2ホップになる。実際 /spot/COCO-39-S-8lek がこれに該当していた。
      // Google はホップごとに評価を薄めるので、最終到達先へ1ホップで送る。
      // 個別に書き換えるのではなく解決関数にしてあるので、今後どちらの配列に
      // 追記しても自動で1ホップに畳まれる。
      ...SPOT_REDIRECTS.map((r) => {
        const chained = CHAIN_SPOT_REDIRECTS.find((c) => c.from === r.to);
        return {
          source: `/spot/${r.from}`,
          destination: chained ? chained.to : `/spot/${r.to}`,
          permanent: true,
        };
      }),

      // ===== P1-1c: 全国チェーン外食スポット /spot/[slug] → まとめ記事へ 301 =====
      // チェーンは一覧/ランキング/今日の流れ(destination)からは除外済だが、URLが200で
      // 生き続けると低品質・重複・カニバリの温床になるためURLレベルで統合する。
      ...CHAIN_SPOT_REDIRECTS.map((r) => ({
        source: `/spot/${r.from}`,
        destination: r.to,
        permanent: true,
      })),

      // ===== 重複スポットの統合(2026-08-19) =====
      // lib/spots-extra/batch-1.ts が、lib/spots.ts に既にあった施設を「名前の空白だけ違う」
      // 別スポットとして再登録していたため、同じ施設が2つのURLで公開されていた。
      // 情報量の多い元エントリを残し、重複側のURLは301で統合する（301なので流入も引き継がれる）。
      { source: '/spot/ZOOMO-up3y', destination: '/spot/ZOOMO-8ry2', permanent: true }, // 盛岡市動物公園ZOOMO
      { source: '/spot/-xw6m', destination: '/spot/-k352', permanent: true }, // 岩手県立児童館いわて子どもの森
      { source: '/spot/-jr8w', destination: '/spot/-6abk', permanent: true }, // 八木山動物公園フジサキの杜
      { source: '/spot/GAO-wc8y', destination: '/spot/GAO-owbc', permanent: true }, // 男鹿水族館GAO
      { source: '/spot/-2tzt', destination: '/spot/-seao', permanent: true }, // こどもの国（横浜・冬のスケート）→ 本体へ

      // ===== 実在するが子連れおでかけ先として不適/データ除外した施設(2026-07-01) =====
      // データから除去したスポットURLを一覧へ301（被リンク・indexの行き止まり回避）。
      { source: '/spot/-8bbk', destination: '/spots', permanent: true }, // 国立新美術館
      { source: '/spot/ANA-qpn5', destination: '/spots', permanent: true }, // ANA機体工場見学（羽田）
      { source: '/spot/JAL-SKY-MUSEUM-ovgj', destination: '/spots', permanent: true }, // JAL工場見学 SKY MUSEUM（羽田）
      { source: '/spot/AkeruE-6dkq', destination: '/spots', permanent: true }, // パナソニックセンター東京 AkeruE
      { source: '/spot/-2f47', destination: '/spots', permanent: true }, // 東京臨海広域防災公園 そなエリア東京

      // ===== データ除外(2026-07-17)：レストラン街＝スポットでない/遊びスポットでない施設 =====
      // 「レストラン街」は単独スポットとして不適、神社/ビーチ/工場見学等も子連れ遊びスポットではないため
      // データから除去。旧URLは一覧へ301（被リンク・indexの行き止まり回避）。
      { source: '/spot/5-6F-fbjc', destination: '/spots', permanent: true }, // 丸ビル 5・6Fレストラン街
      { source: '/spot/S.C.-xguc', destination: '/spots', permanent: true }, // 二子玉川ライズ S.C. レストラン街
      { source: '/spot/-h60m', destination: '/spots', permanent: true }, // 池袋サンシャインシティ レストラン街
      { source: '/spot/-ln74', destination: '/spots', permanent: true }, // 東京スカイツリータウン ソラマチ レストラン街
      { source: '/spot/-dnpt', destination: '/spots', permanent: true }, // ルミネ新宿 レストラン街
      { source: '/spot/-ejlx', destination: '/spots', permanent: true }, // グランベリーパーク レストラン街
      { source: '/spot/-dov1', destination: '/spots', permanent: true }, // ららぽーと豊洲 レストラン街
      { source: '/spot/-dec1', destination: '/spots', permanent: true }, // マークイズみなとみらい・吉祥寺パルコ系列 レストラン街
      { source: '/spot/-7hg2', destination: '/spots', permanent: true }, // 北千住マルイ レストラン街
      { source: '/spot/-s76h', destination: '/spots', permanent: true }, // 錦糸町オリナス レストラン街
      { source: '/spot/-cwhx', destination: '/spots', permanent: true }, // ららぽーと横浜 レストラン街
      { source: '/spot/-msdt', destination: '/spots', permanent: true }, // ラゾーナ川崎プラザ レストラン街
      { source: '/spot/-avjl', destination: '/spots', permanent: true }, // グランフロント大阪 レストラン街
      { source: '/spot/-95lh', destination: '/spots', permanent: true }, // なんばパークス レストラン街
      { source: '/spot/CITY-iqht', destination: '/spots', permanent: true }, // なんばCITY レストラン街
      { source: '/spot/-l5dp', destination: '/spots', permanent: true }, // あべのキューズモール レストラン街
      { source: '/spot/EXPOCITY-gwj1', destination: '/spots', permanent: true }, // ららぽーとEXPOCITY レストラン街
      { source: '/spot/JR-JR-n68j', destination: '/spots', permanent: true }, // JRゲートタワー・JRセントラルタワーズ レストラン街
      { source: '/spot/-yfre', destination: '/spots', permanent: true }, // ミッドランドスクエア レストラン街
      { source: '/spot/21-b9ak', destination: '/spots', permanent: true }, // オアシス21 レストラン街
      { source: '/spot/-bgpm', destination: '/spots', permanent: true }, // ららぽーと名古屋みなとアクルス レストラン街
      { source: '/spot/JR-zara', destination: '/spots', permanent: true }, // JR博多シティ レストラン街（くうてん）
      { source: '/spot/-iphh', destination: '/spots', permanent: true }, // キャナルシティ博多 レストラン街
      { source: '/spot/-mcc9', destination: '/spots', permanent: true }, // ららぽーと福岡 レストラン街
      { source: '/spot/-6e4v', destination: '/spots', permanent: true }, // マリノアシティ福岡 レストラン街
      { source: '/spot/-05m7', destination: '/spots', permanent: true }, // 札幌ステラプレイス レストラン街
      { source: '/spot/-th24', destination: '/spots', permanent: true }, // イオンモール京都桂川 レストラン街
      { source: '/spot/-3tbc', destination: '/spots', permanent: true }, // ヨドバシ梅田＆ヨドバシ京都 レストラン街
      { source: '/spot/umie-trpj', destination: '/spots', permanent: true }, // 神戸ハーバーランド umie レストラン街
      { source: '/spot/-zm7c', destination: '/spots', permanent: true }, // ららぽーと甲子園 レストラン街
      { source: '/spot/-9jec', destination: '/spots', permanent: true }, // 盛岡駅 フェザン レストラン街
      { source: '/spot/-dxsp', destination: '/spots', permanent: true }, // イーアスつくば レストラン街
      { source: '/spot/FKD-y7id', destination: '/spots', permanent: true }, // FKD宇都宮 インターパーク レストラン街
      { source: '/spot/-323y', destination: '/spots', permanent: true }, // イオンモール高崎 レストラン街
      { source: '/spot/-qeuf', destination: '/spots', permanent: true }, // ららぽーと富士見 レストラン街
      { source: '/spot/-l0wf', destination: '/spots', permanent: true }, // イクスピアリ レストラン街
      { source: '/spot/CoCoLo-npow', destination: '/spots', permanent: true }, // CoCoLo新潟 レストラン街
      { source: '/spot/MIDORI-6u2y', destination: '/spots', permanent: true }, // MIDORI長野 レストラン街
      { source: '/spot/-rgib', destination: '/spots', permanent: true }, // イオンモール津南 レストラン街
      { source: '/spot/-n36t', destination: '/spots', permanent: true }, // フォレオ大津一里山 レストラン街
      { source: '/spot/-01iq', destination: '/spots', permanent: true }, // イオンモール和歌山 レストラン街
      { source: '/spot/-ovj5', destination: '/spots', permanent: true }, // イオンモール岡山 レストラン街
      { source: '/spot/ekie-cw9v', destination: '/spots', permanent: true }, // ekie広島 レストラン街
      { source: '/spot/-hnxg', destination: '/spots', permanent: true }, // イオンモール高知 レストラン街
      { source: '/spot/-e30j', destination: '/spots', permanent: true }, // ゆめタウン佐賀 レストラン街
      { source: '/spot/-pw60', destination: '/spots', permanent: true }, // アミュプラザ長崎 レストラン街
      { source: '/spot/-mo9i', destination: '/spots', permanent: true }, // アミュプラザくまもと レストラン街
      { source: '/spot/-bvkk', destination: '/spots', permanent: true }, // アミュプラザおおいた レストラン街
      { source: '/spot/-w24e', destination: '/spots', permanent: true }, // イオンモール宮崎 レストラン街
      { source: '/spot/-dp3a', destination: '/spots', permanent: true }, // アミュプラザ鹿児島 レストラン街
      { source: '/spot/-npaw', destination: '/spots', permanent: true }, // イオンモール沖縄ライカム レストラン街
      { source: '/spot/-at0y', destination: '/spots', permanent: true }, // 神田明神
      { source: '/spot/-6s3p', destination: '/spots', permanent: true }, // 明治神宮
      { source: '/spot/-tzd6', destination: '/spots', permanent: true }, // 台場海浜公園 ビーチ
      { source: '/spot/-4lrp', destination: '/spots', permanent: true }, // アネビートリムパーク（ららぽーと各所等）
      { source: '/spot/S-C-mchr', destination: '/spots', permanent: true }, // 玉川高島屋S・C
      { source: '/spot/-et68', destination: '/spots', permanent: true }, // ふくろうの杜（流山おおたかの森）

      // ===== 記事棚卸し監査(2026-06-25)：チェーン周辺条件の死蔵フラグメントを =====
      // 内容を包含する [chain]-kodzure-koryaku へ 301 統合（被リンク資産を勝ちページに集約）。
      ...ARTICLE_REDIRECTS.map((r) => ({
        source: `/article/${r.from}`,
        destination: `/article/${r.to}`,
        permanent: true,
      })),

      // ===== Search Console 404 → 301 恒久リダイレクト =====
      // 旧 /issue/* ルート（未実装ながら旧sitemapに入っていた）
      { source: '/issue/rainy-day', destination: '/tag/amenohi', permanent: true },
      { source: '/issue/dinner', destination: '/category/today-taberu', permanent: true },
      { source: '/issue/home-play', destination: '/tag/ie-de', permanent: true },
      { source: '/issue/weekend', destination: '/tag/shumatsu', permanent: true },
      { source: '/issue/heijitsu-yoru', destination: '/tag/heijitsu-yoru', permanent: true },
      { source: '/issue/shippai-shinai', destination: '/', permanent: true },
      { source: '/issue/:slug*', destination: '/', permanent: true }, // それ以外のissue/は全部トップへ

      // 旧 /age/* ルート → 年齢タグへ
      { source: '/age/0-1', destination: '/tag/0-1sai', permanent: true },
      { source: '/age/2-3', destination: '/tag/2-3sai', permanent: true },
      { source: '/age/4-6', destination: '/tag/4-6sai', permanent: true },
      { source: '/age/:slug*', destination: '/', permanent: true },

      // 定義されていない旧タグ → 代替タグ/記事へ
      { source: '/tag/lunch-friendly', destination: '/tag/odekake', permanent: true },
      { source: '/tag/brothers-ok', destination: '/tag/odekake', permanent: true },
      { source: '/tag/elevator', destination: '/tag/odekake', permanent: true },
      { source: '/tag/indoor', destination: '/tag/ie-de', permanent: true },
      { source: '/tag/kids-chair', destination: '/article/baby-chair-ranking', permanent: true },
      { source: '/tag/onep-friendly', destination: '/tag/odekake', permanent: true },
      { source: '/tag/rain-ok', destination: '/tag/amenohi', permanent: true },
      { source: '/tag/babycar', destination: '/article/babycar-ranking-2026', permanent: true },
      { source: '/tag/close', destination: '/tag/odekake', permanent: true },
      { source: '/tag/diaper-table', destination: '/tag/odekake', permanent: true },
      { source: '/tag/heat-ok', destination: '/tag/moushobi', permanent: true },

      // ===== 旧記事URL → 現存する近い記事へ（Search Console 5xx/404対策）=====
      // Search Consoleが「サーバーエラー」として報告していたが実態は404の旧URL群
      { source: '/article/indoor-spot-tokyo', destination: '/article/amenohi-indoor-spots-tokyo-15', permanent: true },
      { source: '/article/kodure-hanami-tokyo', destination: '/article/sakura-ohanami-kodzure-spots', permanent: true },
      { source: '/article/rainy-2yo-home-play', destination: '/article/amenohi-ie-asobi-2-3sai', permanent: true },
      { source: '/article/nyuuen-junbi-list', destination: '/article/youchien-nyuuen-junbi-list', permanent: true },
      { source: '/article/craft-4yo-home', destination: '/article/kousaku-4-6sai-10pattern', permanent: true },
      { source: '/article/tsukareta-hi-saitekikai', destination: '/category/today-mawasu', permanent: true },
      { source: '/article/babycar-lunch-kichijoji', destination: '/article/bebycar-ok-cafe-15', permanent: true },
      { source: '/article/gw-kodure-tokyo', destination: '/article/kosodate-muryou-spots-tokyo', permanent: true },

      // /search はサイト内検索ページ実装に切り替え済（SearchAction 用）。
      // ここでリダイレクトすると WebSite SearchAction が無効化されるので残さない。

      // ===== 2026-05 追加: コンテンツ内 壊れた内部リンク 14個 → 既存記事に301 =====
      // sed で本文内のリンクは置換済みだが、Google が古いURLをキャッシュしている可能性、
      // および外部からの被リンク救済のため 301 リダイレクトを設定する。
      { source: '/article/0sai-ikuji', destination: '/article/0sai-ikuji-kanzen-map', permanent: true },
      { source: '/article/eigo-ie-de-furemase-5kufuu', destination: '/article/eigo-asobi-ie-de-4-6sai', permanent: true },
      { source: '/article/ikukyu-chichi-toru', destination: '/article/ikukyu-fukuki-junbi', permanent: true },
      { source: '/article/kaiten-sushi-chain-kodzure-5sha-hikaku', destination: '/article/kaiten-sushi-4chain-comparison', permanent: true },
      { source: '/article/kodomo-okane-okozukai-itsukara', destination: '/article/kodomo-okozukai-itsukara', permanent: true },
      { source: '/article/kyaraben-kantan-techniques-7', destination: '/article/kodomo-no-hi-kyaraben', permanent: true },
      { source: '/article/naraigoto-ranking', destination: '/article/kodomo-naraigoto-tsuduki-kotsu', permanent: true },
      { source: '/article/satou-kodzure-koryaku', destination: '/article/kodzure-yakiniku-anzen-kanzen-guide', permanent: true },
      { source: '/article/station', destination: '/station', permanent: true },
      { source: '/article/tomobataraki-kaji', destination: '/article/tomobataraki-kaji-bunkatsu', permanent: true },
      { source: '/article/wanope-mawashi-kihon', destination: '/article/wanope-ikuji-toha', permanent: true },
      { source: '/article/yakiniku-chain-kodzure-5sha-hikaku', destination: '/article/kodzure-yakiniku-shabu-7', permanent: true },
      { source: '/article/yojishoku-kanryouki-1week-rota', destination: '/article/yojishoku-reitou-tsukurioki', permanent: true },
      { source: '/article/furusato-nouzei-kosodate-ikuji', destination: '/category/today-mawasu', permanent: true },

      // ===== 旧 /plans, /plan ルート救済 =====
      { source: '/plans', destination: '/', permanent: true },
      { source: '/plan', destination: '/', permanent: true },

      // ===== 大文字混じり URL のフォールバック（削除済） =====
      // 削除理由: Vercel/Next.js の redirects() は path-to-regexp で実装されており、
      // パスマッチが case-insensitive に動作するため、`/Article/:slug*` が
      // `/article/foo` 等にもマッチしてしまい、destination = `/article/:slug*` ＝
      // 自分自身への 308 無限ループを発生させていた。
      // 大文字URLは実質クロールされておらず、削除しても SEO 影響は無視できる。
    ];
  },

  experimental: {
    optimizePackageImports: ['microcms-js-sdk'],
  },

  // Vercel Function バンドルから public/ 配下の静的画像を除外する。
  // lib/articles.ts や lib/plans.ts が hero画像の存在確認のため
  // path.join(process.cwd(), 'public', ...) + fs.existsSync を使うため、
  // Next.js が「実行時に必要な可能性あり」と判断して /api/* のFunctionに
  // 画像ファイルを巻き込み、300MB上限超過でビルド失敗するのを防ぐ。
  outputFileTracingExcludes: {
    '*': [
      'public/hero-ai/**',
      'public/hero/**',
      'public/photos/**',
      'public/icons/**',
      '.next/cache/**',
    ],
  },
};

export default nextConfig;
