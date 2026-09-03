# 表示0ページの再クロール要請候補（2026-09-03 診断）

**この一覧は Indexing API に送るためのものではない。** 2026-09-03 に社長判断で
Indexing API 送信は中止し、正攻法（修正版sitemapの本番公開 → Search Consoleで
sitemap再送信 → 内部リンク経由での発見）に切り替えた。Indexing API は公式には
JobPosting / BroadcastEvent 用途で、Google 自身が URL 発見を早める方法として
案内しているのは sitemap 送信である。

この一覧は **「発見されていない面」のワークリスト**として残す。
内部リンクをどこに張るか、どの面を強化するかの優先順位付けに使う。

## 母集団

サイトマップ 3,785本のうち表示0が663本(17.5%)。URL検査APIで全数検査した内訳:

| 状態 | 本数 | 割合 |
|---|---|---|
| URL が Google に認識されていません（未発見） | 431 | 65% |
| クロール済み - インデックス未登録 | 124 | 19% |
| 送信して登録されました（登録済みだが表示0） | 73 | 11% |
| 404（古いクロール記録・本番は全て200） | 23 | 3% |
| noindex 残骸（解除済みなのに再クロールされず） | 12 | 2% |

`reindex-candidates-2026-09-03.txt` は上記のうち「到達の問題」に該当する590本
（未発見431＋未登録124＋古い404の23＋noindex残骸12）。うち180本は方針転換前に
Indexing API へ送信済み（`docs/indexing-submitted.log` の 2026-09-03 分）。
残り410本は送信していない。

## 種別

| 種別 | 本数 |
|---|---|
| 駅（トップ170・駅×条件252） | 422 |
| 記事（勝ちカテゴリ88・負けカテゴリ15） | 103 |
| スポット | 56 |
| イベント | 5 |
| その他（business/supervisors/downloads/external-transmission） | 4 |

## 再計測

`node scripts/seo-zero-impression-audit.mjs --days=90 --inspect --out=/tmp/zero` で
この表を丸ごと再生成できる。判定は 2026-10-01（scheduled task
`kyounoko-zero-impression-verdict-1001`）。
