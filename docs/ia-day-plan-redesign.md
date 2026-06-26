# きょうのこ IA再設計 ＋「今日の流れ（1日プラン）」実装計画

> 2026-06-26 策定。記事増ではなく**サイト構成（IA）の見直し**。
> 監査3エージェント（IA/ナビ・ページ一貫性・種別重複）の結果と、オーナー合意済の製品方向を反映。

---

## 0. 背景：監査で判明した3大不整合

1. **ナビ二重化** — `components/layout/SiteHeader.tsx`（NAV_ITEMS 8カテゴリ）はどこからも import されず死蔵。実体は `components/v2/V2Frame.tsx` の5項目（ホーム/探す/イベント/特集/保存）のみ。カテゴリ・駅・年齢・天気への常設入口が無く、`/category` `/station` `/plan`(531) `/ranking` `/recipes` 等が孤児ルート。
2. **「探す」が3系統に分裂し一部壊れている** — ①ヒーロー→`/today`（効く）②トップ QUICK_SEARCH チップ→`/search?weather=rain`（**壊れ＝全記事表示**）③ヘッダー→`/search`（キーワードのみ）。`app/search/page.tsx` は `{q,p}` しか読まない。
3. **視覚3系統が混在** — (a) V2Frame＋v2トークン（大半）(b) 旧 `.container/--clay`（駅×条件レストランページ）(c) `components/station/StationSpotConditionView.tsx` が旧 SiteHeader/Footer を丸ごと描画（別サイト感）。パンくず・activeナビもページごとにバラバラ。

---

# B. IA設計書

## B1. グローバルナビ再編

実体ナビは `V2Frame.tsx` の3箇所（`V2DesktopHeader` items: L366、`V2BottomNav` items: L331、モバイルメニュー items: L37）。**この3配列を同一定義に統一**する（理想は `lib/nav.ts` に単一ソース化）。

| | Before | After |
|---|---|---|
| 1 | ホーム | ホーム |
| 2 | 探す → `/search` | **今日の流れ → `/today`**（メイン機能・ファセット起点） |
| 3 | イベント → `/events` | エリア・駅 → `/area` |
| 4 | **特集 → `/feature`**（4件のみ・死蔵） | イベント → `/events` |
| 5 | 保存 → `/favorites` | 保存 → `/favorites` |

- **特集枠を廃し「今日の流れ」を一等地へ**。特集4件は category の特集枠 or ピラー記事に吸収。
- 「探す」というラベルを廃し、機能名「**今日の流れ**」に。看板コピー「今日どうする？を3分で決める」と一致。
- desktop ヘッダーは枠に余裕があれば「さがす（条件）」を別途残してもよいが、第一は「今日の流れ」。

## B2. URL設計

| ルート | 役割（再定義） | 対応 |
|---|---|---|
| `/today` | **今日の流れ（1日プラン）**。ゼロ設定で着地、ファセット編集、スロット差し替え | 拡張（おでかけmode追加） |
| `/today?slot=lunch` | お昼スロット単体＝子連れOKの店一覧（最多需要） | 新規 |
| `/search` | キーワード横断検索（補助） | 維持。QUICK_SEARCH の死にリンクは `/today?...` へ張替 |
| `/spots` `/spot/[slug]` | 施設の事実DB | 維持 |
| `/area` `/area/[slug]` | **地域の唯一の入口**。都道府県/区→エリア→駅へドリルダウン | 維持・昇格 |
| `/station/*` | 駅×条件ページ | 当面維持→将来 `/area` 配下へ統合（B3/Phase5） |
| `/plan/[id]` | 単発ミニプラン詳細（おうち遊び/食事） | 維持。今日の流れの「午後/おうち」スロット内訳に再利用 |
| `/feature` `/feature/[slug]` | 特集 | ナビから降格。残すなら category 配下 |
| `/category/[slug]` | 記事/プランの分類ハブ | 維持（today/recipes/tag を束ねる） |

## B3. コンテンツ種別の役割（16実質種別 → 6入口）

| 入口 | 1行定義 | 吸収するもの |
|---|---|---|
| **spot** | 施設の事実DB（住所/設備/ベビーカー可否/最寄駅） | ranking・reports は spot の従属ビューへ |
| **article** | 読み物（ノウハウ・季節）。日付/施設に縛られない | recipes は today-taberu のビューへ |
| **event** | 日付つき（行事・期間限定）。唯一「いつ」を持つ | — |
| **plan** | 行動プラン（単発ミニ＝おうち遊び/食事の段取り） | 今日の流れの素材として再利用 |
| **category** | 記事/プランの分類ハブ | today・tag・feature を束ねる |
| **area** | 地域で施設DBを絞る唯一の地域軸 | station を吸収（Phase5） |

## B4. 「今日の流れ」機能仕様

### 入力（ゼロ設定が肝）
- **子の年齢・ホームエリア/駅** … 保存値を初期表示（`V2TodayHero` の登録を流用、localStorage）。未登録時のみ設定カードを出す。
- **天気** … `/api/weather` から自動取得（雨/晴/猛暑/寒）。手動上書き可。
- **任意facet** … 予算・場所（屋内/屋外）・時間帯。

### スロット構成（2モード）
- **おでかけmode（既定・東京terminal駅で強い）**：`午前 あそぶ(spot)` → `お昼 たべる(restaurant)` → `午後 軽め(spot or おうちplan)`。
- **おうちmode（雨/猛暑/0-1歳/エリア薄い時の自動フォールバック）**：既存 `buildDayPlan`（朝食→午前遊び→昼食→…）をそのまま使用。

### 各スロットの要件
- スロット間に**移動表示**（「徒歩7分」「同ビル・移動なし」「○○駅へ2分」）。合計移動が閾値超のプランは出さない（B5）。
- 各スロットに **「⇄ 別の候補に変える」**（`getAlternativePlans` の spot/restaurant 版）。
- **単体利用**：お昼スロットだけ叩く＝`/today?slot=lunch` で子連れ店一覧。
- お昼スロットに **ファセット**（ベビーチェア/キッズメニュー/座敷/個室/ベビーカーOK/離乳食OK）＋ **予約CTA**（ホットペッパー子連れ絞り込み `buildVcDeepLink`、`U031`/`U006`）。
- **保存（♡ この流れ）** と **別の流れ（↻ reroll）** でリピート誘導。

### 年齢・天気連動
- 0-2歳：午後をお昼寝考慮で「帰宅 or おうちplan」に自動。滞在短め・移動回数減。
- 雨/猛暑：屋内同士＋駅直結を優先、外歩き最小。

## B5. 移動現実性ロジック（the coherence engine）

**駅アンカー方式**：プラン全体を1つのアンカー駅（ユーザー選択 or 午前spotの `nearestStation`）に固定し、各スロットの近さを判定。

**近さ判定（強い順に採用）**
1. **手書き `nearby`（最強）** — `lib/spots.ts` の `nearby` フィールド（例「上野公園・科学博物館と1日コース」）。人手キュレーション済の組合せを最優先シードにする。
2. **同一 `nearestStation`** — spot と restaurant が同駅＝徒歩圏。`walkMinutes` の差で移動表示を生成。
3. **同一 `ward` / 共有 `lines[]`** — 1駅圏まで許容。「○○駅へ移動」と明示。

**ハード制約**
- `scale: 'terminal'`（池袋/新宿等）は1拠点完結プランを上位スコア。
- 合計移動 ≤ 閾値（例 徒歩20分相当）。超える組合せは破棄。
- 各ホップを必ずUI表示（隠さない＝信頼）。
- restaurant 在庫が薄い駅は spot 内 `category: restaurant`（150件）→ ホットペッパー全国の順でフォールバック。

**データ素材（確認済）**：spot=`lib/spots.ts` 443件（restaurant 150含む、`nearestStation`/`walkMinutes`/`ward`/`nearby`）。station=`lib/{tokyo,kansai,kanagawa,saitama-chiba}-stations.ts`（`ward`/`lines`/`scale`/`familyFriendly`）。

---

# C. 実装計画

## C0. 現状資産の棚卸し
- `lib/plans.ts::buildDayPlan`（L528）は**おうち1日版**（home plan で全スロット構成、位置情報・移動なし）。→ おでかけ版を**別関数 `buildOutingPlan(q)` として新設**し、`/today` でモード分岐。
- `/today`（`app/today/page.tsx`）は既に `buildDayPlan`/`getKidFriendlyRestaurants` を import 済＝拡張ポイントが明確。
- 予約CTA基盤・ホットペッパー DeepLink（`buildVcDeepLink`）は実装済。流用するだけ。

## Phase 0 — リンク切れ修復（最優先・即効・低工数）
- **対象**：`app/page.tsx`（QUICK_SEARCH の `href`）、`app/search/page.tsx`。
- **作業**：QUICK_SEARCH チップの飛び先を `/today?weather=rain` 等の効くパラメータへ張替（または `/search` に facet 読取を実装）。
- **受け入れ**：「雨の日」「室内施設」「無料スポット」を押して、絞り込まれた結果に着地する。
- **リスク**：低。既存 `/today` は該当 param を解釈済。

## Phase 1 — ナビ再編＋種別役割（低〜中工数）
- **対象**：`components/v2/V2Frame.tsx`（3つの items 配列）。理想は `lib/nav.ts` 新設で単一ソース化。
- **作業**：5項目を `ホーム / 今日の流れ(/today) / エリア・駅(/area) / イベント(/events) / 保存`。`active` 値の規約を定義し各ページに付与。死蔵 `SiteHeader/SiteFooter/MobileStickyNav` は撤去 or 単一ソース参照に。
- **受け入れ**：全ページで現在地ハイライトが正しく、特集が一等地から消え今日の流れが出る。
- **リスク**：active 規約の付け漏れ。`grep` でページ網羅。

## Phase 2 —「今日の流れ」おでかけmode（中工数・東京terminal駅から）
- **対象**：`lib/plans.ts`（`buildOutingPlan` 新設）、`app/today/page.tsx`（モード分岐＋UI）、`lib/spots.ts`（駅アンカーのspot/restaurant抽出ヘルパ）。
- **作業**：B4のスロット構成を生成。まず池袋・新宿等 terminal 駅で `nearby`＋同駅シードを使い「移動少ない3スロット」を組む。お昼にファセット＋予約CTA。
- **受け入れ**：池袋・2歳・雨でモック相当の3スロットが出て、各移動が表示される。
- **リスク**：terminal外でスロットが埋まらない→おうちmodeへフォールバック。

## Phase 3 — 移動判定・差し替え・保存（中工数）
- **対象**：`lib/plans.ts`（B5の近さ判定＋合計移動制約）、差し替え API、保存（localStorage / `/favorites` 連携）。
- **作業**：`buildOutingPlan` に3層近さ判定と閾値破棄を実装。`⇄` の候補返却、`/today?slot=lunch` の単体ビュー、「♡保存」「↻別の流れ」。
- **受け入れ**：合計移動が長い組合せが出ない／スロット差し替えが効く／保存した流れを再表示できる。

## Phase 4 — 視覚一貫性（中工数・違和感の本丸）
- **対象**：`components/station/StationSpotConditionView.tsx`、`app/station/[slug]/[condition]/page.tsx`、共通 `<V2Breadcrumb>` 新設、`app/globals.css`（旧 `.breadcrumb` トークン）。
- **作業**：駅条件ページ2種を V2Frame＋v2トークンへ移植（旧シェル/旧CSS撤去）。パンくずを共通コンポーネント化し全 sub ページ必須。`V2Img` の picsum フォールバックを自前プレースホルダへ。
- **受け入れ**：トップから2クリックで「別サイト感」が消える／全 sub にパンくず。

## Phase 5 — 地域一本化（中〜大工数・SEO自己カニバリ解消）
- **対象**：`/area` を地域トップ階層化、`/station` を `/area/[area]` 配下にドリルダウン or 301。`lib/area.ts`／station 群。
- **作業**：area→駅の親子関係を整理。トップ「エリアから探す」チップの表示と遷移先を一致。サイトマップ上 area を正に。
- **受け入れ**：同一スポットの多重URLが縮小、地域導線が1系統。

---

## 推奨着手順
Phase 0（即効・壊れ修復）→ 1（ナビ）→ 2（おでかけmode MVP・池袋）→ 3 → 4 → 5。
0〜2 で「探しづらさ」と体感の大半が解消。3〜5 は深堀り。**いずれも新規記事は不要**、既存データの繋ぎ替えで完結。
