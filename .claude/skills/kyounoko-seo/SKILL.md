---
name: kyounoko-seo
description: kyounoko-web のデータ駆動SEO作業。GSC実データ分析→診断（CTR取りこぼし/自己カニバリ/押上げ候補）→勝ちパターンでタイトル最適化→記事mdをデプロイ、までを一気通貫で行う。「SEO改善」「サチコ/GSC分析」「順位やCTRを上げたい」「タイトル見直し」「次の打ち手」等を頼まれたら使う。
---

# kyounoko-web SEO プレイブック

実データ（Google Search Console）から「いま効いていること」を読み取り、**勝っているページ・上位ページのパターンを横展開**して順位とCTRを伸ばすための手順と判断基準。憶測でなく必ずGSC実数で判断する。

## 0. データ取得（毎回ここから）

```bash
node scripts/gsc-report.mjs                       # 直近28日 vs 前28日の一括レポート
node scripts/gsc-report.mjs --days=90 --json=/tmp/gsc.json   # 期間変更＋生データ保存
```
- 認証は `credentials/google-indexing.json`（IndexNow用の読み取り専用SA `kyounoko-readonly@` がGSC **owner** 権限を持つ）を流用。本番envは不要。詳細は memory [[kyounoko-gsc-local-access]]。
- **GA4はローカル不可**（property IDが本番env専用）。PV/アフィ成果は本番 `/admin/kpi` で確認。
- 特定ページ/クエリの深掘りは、`credentials/google-indexing.json` を使う使い捨てスクリプトを **プロジェクト直下** に置いて叩く（`/tmp` だと `google-auth-library` を解決できない）。終わったら消す。

## 1. 診断フレーム（レポートの読み方＝打ち手の仕分け）

| 症状（GSC） | 解釈 | 打ち手 |
|---|---|---|
| pos ≤ 7.5 × imp高 × **CTR低(<3.5%)** | 順位は取れてるがスニペットが弱い | **タイトル/メタ書き換え**（最優先・即効・新規記事不要） |
| 同一クエリを**自社の複数ページ**が pos5-8 で奪い合い、両方CTR≒0% | **自己カニバリ** | ページの**意図分離**（§3） |
| pos 8-15 × imp高 | あと一歩 | 内部リンク強化・本文の網羅性UPで押上げ |
| **pos ≥ 9** × CTR低 | 順位起因（タイトルでは動かない） | タイトルは触らない。順位を上げる施策へ |
| pos12以下 × imp高 が**無い** | 記事のある領域は上位＝質は十分 | **量産は不要**。CTRとカニバリに集中 |

> kyounoko の流入主力は「**チェーン店 × 子連れ条件**（キッズメニュー/離乳食/ベビーカー/ベビーチェア/授乳/取り分け）」。勝ち筋の正体は memory [[kyounoko-seo-winning-pattern]] / [[kyounoko-seo-breakout-2026-06]]。

## 2. 勝ちタイトルのパターン（上位・人気記事から学んだ型）

実証済みの高CTR型（例: `ohsho-kids-menu` がCTR14%超）。これを横展開する。

- **疑問形フックで始める**：「〜は何歳から？」「〜はある？」「〜はOK？」「〜は何時から？」。検索者の疑問とそのまま一致させる。
- **明快な約束 + 年号**：「…完全ガイド【2026】」。中身の保証と鮮度。
- **SERP幅に収める（全角〜40字目安）**：4トピック以上を詰め込まない。過長は途中で切れてフックが埋もれる（`yakiniku-king` を短縮した例）。
- **数字・固有名詞で具体化**：値段・対象年齢・「1歳」など、本文に実在する具体を1つ。

## 3. 自己カニバリの解消（kyounoko特有・最重要）

12+チェーンが `*-kids-menu` と `*-kodzure-koryaku` の**両方**を持ち、同一クエリで共食いする。**意図を分離**して各ページに別クエリ集合を専有させる：

- `*-kids-menu` → **メニュー意図**を専有（キッズメニュー/お子様ランチ/値段/何歳から）
- `*-kodzure-koryaku` → **来店ロジ意図**を専有（子連れOK/ベビーカー/ベビーチェア/離乳食/授乳/個室/取り分け）。**タイトルから「キッズメニュー」を外す**。

### ⚠️ 触る前の必須チェック（bamiyanの教訓）
タイトルの語を消すだけでは共食いは直りきらない。**本文が強いと、タイトルに無くてもその語で1位を取り続ける**（例: `bamiyan-kodzure` は「バーミヤン キッズメニュー」785imp/1位を本文で制覇）。

1. 書き換え前に **そのページの駆動クエリ** をGSCで確認する（page一致フィルタで query を引く）。
2. そのページが**ある語の唯一の強いランカー**なら、タイトルから消すと一時的に流入を失う → **触らない**。完全分離には本文/内部リンクの差別化が必要（別タスク）。
3. 2ページが pos5-8 で**実際に割れている**場合のみ、タイトル分離が有効。

## 4. やらないこと（ROIが低いと実証済み）

- 「子供◯◯ いつから」(`kodomo-X-itsukara`) と morning系(`*-morning-kosodate`)：pos9-11の**順位起因**。タイトルは既に最適化済で変えても無駄、収益も薄い。
- 記事の**量産**：網羅はほぼ完成、コンテンツギャップ≒ゼロ。memory [[kyounoko-seo-priorities]] の量産停止方針。

## 5. 編集と検証

- 記事は `content/articles/<slug>.md`。frontmatter `title` が `<title>` と og/h1 を駆動。
- 編集後、frontmatterが壊れていないか `gray-matter` でパース検証する。
- タイトル変更は **既存記事の安全な改善**。大量編集時も before/after を提示してから適用。

## 6. デプロイ（記事md専用の正規手順）

`content/articles/*.md` はビルド時バンドル。通常の git push は ignore-build でスキップされるため**本番に出ない**。

```bash
./scripts/deploy-md.sh        # vercel --prod --force（フルビルド）→ Cloudflareパージ
```
- vercel未リンク環境では env で非対話実行可：`.vercel/repo.json` の `id`/`orgId` を
  `VERCEL_PROJECT_ID` / `VERCEL_ORG_ID` に入れて `vercel --prod --force --yes`。
- **CFパージが打てない環境**（ローカルトークン配下に kyounoko.jp zone が無い）でも、デプロイ自体で本番反映される。一部URLは CF TTL（最大1h）で遅延 → SEO上は無影響。
- **検証はCloudflareを経由しないVercelデプロイURL**（`https://kyounoko-xxxx-….vercel.app/article/<slug>`）を curl して `<title>` を確認。本番ドメインはCFキャッシュで旧版が残ることがある。
- コミット/プッシュは**明示依頼時のみ**（グローバル規約）。

## 7. 効果測定（次サイクル）

デプロイ2〜4週後に再度 §0 を回し、対象ページのCTR/順位の変化を実数で確認。改善が出た型を §2/§3 に追記して**プレイブックを育てる**。

## 関連メモリ
[[kyounoko-seo-breakout-2026-06]] [[kyounoko-seo-winning-pattern]] [[kyounoko-gsc-local-access]] [[kyounoko-seo-priorities]] [[kyounoko-valuecommerce]] [[kyounoko-hotpepper-deeplink]]
