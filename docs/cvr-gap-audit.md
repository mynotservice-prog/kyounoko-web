# 収益記事 CVRギャップ監査（2026-06-14）

> 目的：43本の収益重点記事（`AFFILIATE_TARGET_SLUGS`）の「取りこぼし」を潰す。
> 月100万のエンジンはこの43本。流入があった時に確実に成約させる状態を作る。

## 収益化の2モデル（混同しないこと）

| モデル | 仕組み | 例 | 本文リンク数の意味 |
|---|---|---|---|
| **カード型** | `lib/affiliate-products.ts` に手作り商品（画像付き）を登録。上部InlineItemCTA＋末尾AffiliateLinkGroupで表示 | ベビーカー/抱っこ紐/ベビーチェア各ランキング, shussan-junbi-rakuten-0sai | 本文リンク0でもOK（カードで収益化） |
| **本文リンク型** | 記事markdown内にA8/もしもリンクを直書き | onamae-seal-7sha比較, ehon-subsc比較, takuhai-shoku比較 | リンク数＝そのまま導線数 |

## 2026-06-14 にコードで自動解消した分 ✅

カード型でもなく本文リンクも薄かった約25本（対象スラッグだが手作り商品0件）は、
従来 `getRelatedItemsForArticle` が空配列で打ち切られ **上部・末尾CTAがゼロ** だった。
→ `lib/article-product-hints.ts` をフォールスルー化し、`app/article/[slug]/page.tsx` の
   inlineCtaItem / 末尾ブロックを「カード無ければキーワード推定の正規カタログ商品」を出すよう変更。
   実行検証で全件トピック適合を確認（例：rinyuushoku-frozen→モグモ/ファーストスプーン、
   onamae-seal→シールDEネーム、toysub→トイサブ！）。**捏造ゼロ・既存検証済みURLのみ。**

## 残ギャップ＝比較記事の「行ごとブランドCTA」（手動・要ASP URL）

長大な比較記事（8,000〜13,000字）で、レビューしたブランド数に対し本文アフィリンクが少ない。
読者が選んだブランドに飛べない＝最大の取りこぼし。各ブランド節の末尾に「公式サイトで見る」を置く。

| 記事 | 字数 | 本文リンク | 対応 |
|---|---|---|---|
| onamae-seal-7sha-hikaku-2026 | 12,009 | 3 | 7社中4社分のCTA欠落 → 各社ASP申請 or 既存URL流用 |
| ehon-subsc-hikaku-2026 | 12,836 | 3 | WORLDLIBRARY以外の定期便CTA追加 |
| kodomochalle-vs-smile-zemi-hikaku | 7,649 | 2 | こどもちゃれんじ/スマイルゼミ両方にCTA（スマイルゼミ資料請求あり） |
| takushoku-service-hikaku-3sha | 13,320 | 2 | 3社それぞれにCTA |
| chiku-naraigoto-kumon-shichida-monte | 12,577 | 1 | くもん/七田/モンテ各CTA |
| eigo-kyouzai-3brand-2-6sai | 7,832 | 1 | 3ブランド各CTA |

## 提携済みの検証済みURL在庫（流用パレット・捏造禁止／ここから配線）

- **A8**: Oisix（`a8mat=4B41ZB+9H5EEQ+3RK+2TWC6P`）, QQEnglish（`+9FYJ76+`）, NovaKid（`+9GJYSY+`）, ヨシケイ, スマイルゼミ資料請求 ほか計20プログラム
- **もしも**: モグモ, ファーストスプーン, シールDEネーム, WORLDLIBRARY, トイサブ！, Baby English Labo ほか計8案件
- **楽天**: ベビーカー/抱っこ紐/チャイルドシート/子供靴/絵本 等の商品直URL多数（`lib/affiliate-products.ts`）
- 全URLの棚卸し：`grep -rhoE 'https?://(px\.a8\.net|af\.moshimo\.com|item\.rakuten\.co\.jp)[^ ")<]*' content/ lib/affiliate-products.ts | sort -u`

## 次にユーザーがやること
1. 上表の比較記事で「リンク欠落ブランド」のASPプログラムを申請（未提携分）
2. 提携できたら本文の各ブランド節にCTAを配線（既存URLで埋められる分は依頼すれば反映）
3. デプロイ後、自動補完された25本のCTA表示を本番で確認
