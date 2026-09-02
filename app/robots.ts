import type { MetadataRoute } from 'next';

/**
 * robots.txt 設定。
 *
 * 【重要】/_next/ は元々Disallowしていたが、Googleが「robots.txtでブロック」を473件
 * （全て /_next/static/media/*.woff2 フォントファイル）報告していたため修正。
 * /_next/static/ には CSS/JS/フォントが含まれ、Googlebotがページを
 * フルレンダリングするには Allow が必須。
 *
 * 念のため `/_next/` を明示的に Allow して曖昧さを完全排除する。
 * （`Allow: /` だけでも /_next/ は許可されるが、明示することで
 *  Search Console の robots.txt パーサが確実に「許可」と判定する）
 *
 * Disallow するのは /api/ と /admin/ のみ。
 */
export default function robots(): MetadataRoute.Robots {
  // /api/ と /admin/ はサイトの内部・管理画面なので非公開。
  //
  // 【2026-08-17 撤回】`Disallow: /*?`（クエリ付きURLの全面遮断）を外した。
  //
  //   2026-07-19 にコスト最適化として入れたが、GSC の URL 検査 API で実測したところ
  //   狙いと逆の結果を生んでいた：
  //     - /events?... → robotsTxtState: DISALLOWED / 「robots.txt でブロックされましたが
  //       インデックスに登録しました」3,845件 ＋「重複・正規未選択」522件
  //     - /api/og?title=... → robotsTxtState: **DISALLOWED**
  //
  //   絞り込み変種には元から `noindex, follow` + canonical→クリーンURL が付いているが、
  //   **robots.txt でクロールを止めると Google はその noindex を読めない**。結果として
  //   URLだけがインデックスに残り続け、剥がす手段が無くなる（Google の仕様どおり）。
  //   noindex を効かせるにはクロールさせる必要がある。
  //
  //   下の 2026-07-28 のコメントが前提にしていた「より具体的なパスの Allow が優先される」も
  //   実測で否定された。`Allow: /api/og` は `Disallow: /*?` に負けており、OGP画像が
  //   Googlebot から取得できない＝Discover のカード画像が出ない状態が続いていた。
  //
  //   コスト面の手当てはクロール遮断ではなく next.config.ts の CDN-Cache-Control で行う。
  //   /today・/events・/ranking・/spots はクエリ変種も Vercel edge にキャッシュされるため、
  //   同一URLの2回目以降は Function を起動しない（初回のみ 1 起動）。
  //   /search だけは検索語で無限にURLが増えるので引き続き遮断する。
  const baseDisallow = ['/api/', '/admin/', '/search'];
  // Next.js の静的アセット（CSS/JS/フォント/画像）を明示的に許可。
  //
  // 【2026-07-28 追加】/api/og を明示的に許可する。
  //   /api/og は 1200x630 の OGP 画像（image/png）を返すエンドポイントで、
  //   /today・/plan/[id] の全ページと hero の無い記事の og:image に使っている。
  //   ところが上の Disallow: /api/ が Googlebot-Image まで止めてしまい、
  //   **画像を取得できない＝Discover や検索のリッチ表示でカード画像が出ない**状態だった。
  //   robots.txt は「より具体的なパスの Allow」が優先されるので、Disallow: /api/ を
  //   残したまま /api/og だけ通せる。静的な画像生成なのでクロール負荷は軽い。
  //
  //   【2026-08-17 追記】この Allow は当時 `Disallow: /*?` に負けており機能していなかった
  //   （GSC の URL 検査 API で /api/og?title=… が DISALLOWED と確認）。/*? を外したことで
  //   ようやく意図どおり通る。あわせて route 側に `X-Robots-Tag: noindex` を付け、
  //   画像は取得させつつページとしてインデックスされないようにした
  //   （3,845件中 約18% が /api/og?title=… のインデックス残骸だった）。
  const baseAllow = ['/', '/_next/', '/api/og'];

  // 【2026-09-02 追加】AIクローラー専用の追加Disallow。
  //
  //   8/27〜9/2 の6日間で Vercel インフラ費が $39（月換算$200ペース）に急増。
  //   Vercel Observability の実測で、直近12hのエッジリクエスト42.1万件のうち
  //   ClaudeBot 31.6万 + GPTBot 8.9万 = 96% が /today のクエリ変種
  //   （?station=…&age=…&weather=… の組合せ空間）を毎秒〜7reqで総当たりしていた。
  //   /today はクエリごとに別キャッシュキー＝ほぼ毎回 Function 起動
  //   （キャッシュ率1.6%）で、Fluid CPU / Origin転送 / Observabilityイベントを直撃。
  //
  //   8/17 の「/*? 全面遮断の撤回」は Google のインデックス衛生（noindexを読ませる）
  //   のための判断であり、その教訓は Google が従う `*` グループには引き続き適用する。
  //   一方 AIクローラーは Google のインデックスと無関係なので、無限クエリ空間だけを
  //   ピンポイントで遮断してもGEO（記事・スポットの引用獲得）への影響はない。
  //   クリーンURL（/today, /events 等）は引き続きクロール可。
  const aiDisallow = [...baseDisallow, '/today?', '/events?', '/ranking?', '/spots?'];

  return {
    rules: [
      // ===== 一般クローラー（Google等）=====
      // /_next/ を明示 Allow（CSS/JS/フォントを取得してフルレンダリング可能に）
      {
        userAgent: '*',
        allow: baseAllow,
        disallow: baseDisallow,
      },

      // ===== Googleサービス =====
      { userAgent: 'Mediapartners-Google', allow: baseAllow },     // AdSense
      { userAgent: 'AdsBot-Google', allow: baseAllow },
      { userAgent: 'AdsBot-Google-Mobile', allow: baseAllow },
      { userAgent: 'Googlebot-Image', allow: baseAllow, disallow: baseDisallow },  // Google画像検索
      { userAgent: 'Google-Extended', allow: baseAllow, disallow: aiDisallow },  // Gemini/Bard学習

      // ===== AI検索クローラー（AIO対策の中核）=====
      // ChatGPT / ChatGPT Search からの引用を受け入れる
      { userAgent: 'GPTBot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'OAI-SearchBot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'ChatGPT-User', allow: baseAllow, disallow: aiDisallow },

      // Anthropic Claude（ClaudeBot / claude-web）
      { userAgent: 'ClaudeBot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'anthropic-ai', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'claude-web', allow: baseAllow, disallow: aiDisallow },

      // Perplexity（AI検索で成長中）
      { userAgent: 'PerplexityBot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'Perplexity-User', allow: baseAllow, disallow: aiDisallow },

      // CommonCrawl（多くのLLM学習データソース）
      { userAgent: 'CCBot', allow: baseAllow, disallow: aiDisallow },

      // Meta AI（Llama）
      { userAgent: 'Meta-ExternalAgent', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'FacebookBot', allow: baseAllow, disallow: aiDisallow },

      // Bing / Copilot
      { userAgent: 'bingbot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'BingPreview', allow: baseAllow, disallow: aiDisallow },

      // Amazonbot（Alexa。実測11K/12hで/todayクエリを叩いていたため専用グループ化）
      { userAgent: 'Amazonbot', allow: baseAllow, disallow: aiDisallow },

      // Applebot（Siri・Spotlight・Apple Intelligence）
      { userAgent: 'Applebot', allow: baseAllow, disallow: aiDisallow },
      { userAgent: 'Applebot-Extended', allow: baseAllow, disallow: aiDisallow },
    ],
    sitemap: [
      'https://kyounoko.jp/sitemap.xml',
    ],
    host: 'https://kyounoko.jp',
  };
}
