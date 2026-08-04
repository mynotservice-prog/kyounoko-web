# 掲載順位 押し上げキャンペーン 施策設計（設計・分析のみ）

- 作成: 2026-07-21 / GM(きょうのこ)
- 対象リポジトリ: `~/Developer/kyounoko-web`
- **スコープ制約**: 本ドキュメントは設計・分析のみ。記事`.md`の編集・commit・deployは含まない（クラスタCはCOOが本セッションで並行実施中のため、ファイル競合回避）。適用はCOO承認後。
- データ出所: GSC実測（readonly SA `credentials/google-indexing.json`、`node scripts/gsc-report.mjs --days=28`＝2026-06-21〜07-18、および同SAを流用したpage/page×query次元の使い捨てクエリ）。内部リンク本数は`grep -rl "/article/<slug>" content/articles/`の実測。競合SERPはWebSearch軽確認。

---

## 0. 全体像（3クラスタの実測サマリ）

| クラスタ | 代表クエリ / 受けページ | imp | pos | CTR | 現inbound内部リンク数 | 律速 |
|---|---|---|---|---|---|---|
| **C 外食kodzure（収益直結）** | 各`*-kodzure-koryaku` | 2,500〜8,700/本 | **5.1〜7.2** | 4.0〜12.1% | saize42 / gusto35 / bamiyan22 / royal18 / mos14 / gyukaku9 / sushiro8 / **burger-king4** | 順位（1p目中段→上段）。CTRは既に高い＝押し上げが素直にクリック増に変換される |
| **A モーニング** | 星乃珈琲店 モーニング → `hoshino-morning-kosodate` | **28,409（サイト最大imp）** | 8.9〜9.7 | 1.1〜1.9% | **hoshino5 / komeda2 / dennys1**（極端に薄い） | 順位＋支配的検索意図（時間/値段/メニュー）の充足。**整流A（KV→md）未完のため.md編集が本番に効かないのが前提ブロッカー** |
| **B 水遊び（季節・今が旬）** | 舎人公園 じゃぶじゃぶ池 → `toneri-koen-jabujabuike` | 1,385〜4,598/本 | 5.9〜8.1 | 5.1〜11.4% | toneri3 / itabashi2 / kobe3 / taito2（薄い） | 順位＋季節ピーク（残り約10週）。QDFで即効性が最も高い |

**サイト地力**（参考・別軸）: 直近28日 clicks 8,759（前期比+644%）、王将クラスタが牽引（餃子の王将キッズ451clk pos1.4 CTR52%）。One Metric週次は8,075clk/週（7/12〜18）で9月末目標6,000を既に超過。本キャンペーンは「頭打ちしている1p目中段〜下段の埋蔵金」を狙う上乗せ策。

---

## 1. 優先順位と着手順 — 「C → B →（整流A後）A」を**一部修正して採用**

### 検証結論
- **C を最優先**は妥当（収益直結・CTR既に高い・pos5-6で押し上げがそのままクリック増に転換・COO実施中）。**維持**。
- **B は「C と並走／今週内着手」に格上げ**を推奨。理由は季節デッドライン: 舎人公園じゃぶじゃぶ池の2026開催は**7/3〜9/29**（公式X @ParksToneri で確認）、需要ピークは7月下旬〜8月。内部リンク補強は"効き始めるまで2-4週"のラグがあるため、**8月ピークに間に合わせるには着手は今週（〜7/27）が事実上の締切**。ROI永続性ではCに劣るが、時限性がBを引き上げる。純粋逐次のC完了待ちにするとBの窓を逃す。
- **A は「整流A完了を待ってから」で妥当**。ただしAは着手順が最後でも**ポテンシャルは最大**（サイト最大imp 28,409、hoshino単体で既に528clk/pos8.9の権威あり）。順位を8.9→5に押せれば数百clk/月の上乗せ余地。一方で(a)整流A（後述）が未完だと.md編集が空振り、(b)支配意図が情報系（時間/何時まで/値段）でヘビー競合（ヨムーノ/macaroni/cafe-tatsujin/menuramen等の専門まとめ）、の2点で最難。**"高天井だが硬い"ので最後に腰を据えて取り組むのが正しい**。

### 推奨タイムライン
| 週 | C（収益・COO主導） | B（季節・時限） | A（高天井・要解凍） |
|---|---|---|---|
| 今週 7/21-27 | 内部リンク再配分＋データ深掘り（本設計を適用） | **内部リンク補強を今週中に適用**（季節締切） | 整流A（`reconcile-kv-to-md`）の実装・実行を先行（COO/社長） |
| 7/28-8/3 | 効果を待ちつつ低inbound勢（burger-king/sushiro/gyukaku）を追補 | 兵庫/千葉駅など失点セクション補強 | 整流A完了後にAの順位レバー適用 |
| 8/4以降 | +2週測定→追撃 | +2週測定（ピーク実測） | 測定は9月（authority/時間待ち込み） |

### ⚠️ Aの前提ブロッカー（重要・要COO/社長判断）
- タスクで前提とされた `scripts/reconcile-kv-to-md.mjs` は**現在リポジトリに存在しない**（`ls scripts/ | grep -iE reconcile|kv` が0件）。整流Aは「スクリプトを実行するだけ」ではなく**スクリプト自体の新規実装が先**。
- 機序（[[kyounoko-cannibal-consolidation-2026-06]]の"KV override罠"）: `getAllFileArticlesWithOverrides`/`getFileArticle`が`article:overrides`KVをmdより常に優先するため、morning系がKV-aheadだと.md編集もフルビルドも永久に無視される。整流A＝KV値を正としてmdへ書き戻し＋override解除、で「md=正」に統一してからでないと、Aの本文増強・schema・内部リンク（本文内リンクはmd由来）が本番に反映されない。
- **したがってAの本文系レバーは整流A後**。ただし**Aの内部リンク補強のうち"他記事→hoshino"方向（発リンク元がKV-aheadでない記事）は整流A前でも有効**（後述の§2-Aで前倒し可の行を明示）。

---

## 2. 順位押し上げの具体レバー（記事ごと）

内部リンク機構（実装確認済み）:
1. **`injectInternalLinks`**（`lib/auto-internal-links.ts`）: `LINK_RULES`のkeyword→targetSlugを本文HTMLに自動注入。各keywordは記事内**最初の1回だけ**、見出し/`<a>`/`pre`/`code`/`blockquote`内はスキップ。長語優先＋priority順。**chain名（例「スシロー」）の自動ルール追加は非推奨**（チェーン名は多数記事に頻出＋kids-menu/kodzureどちらを指すか曖昧→誤リンク量産）。既存の水遊びルール（「じゃぶじゃぶ池」→hub、「舎人公園」→toneri）は活きているので**Bはこの機構を活用**。
2. **`seoRelated`フロントマター**（1記事1slug・文字列）: 関連記事スコアで+100（双方向）。関連ブロック先頭固定に近い強い相互参照。
3. **手動本文リンク** `[アンカー](/article/slug)`: アンカーテキストを狙いクエリに一致させられる最強の手段（[[kyounoko-cannibal-consolidation-2026-06]]で「勝つ自ページ＝内部リンク本数が多い方」と実証済み）。
4. **関連記事の自動スコア**（`getRelatedArticlesFor…`）: category/quickInfo/title重複で自動。設計不要。

> アンカー設計の鉄則（実証済みの教訓）: **kodzure-koryakuページへのアンカーに「キッズメニュー」語を使わない**。kids-menu専用ページとのカニバリを再発させる。kodzureページのアンカーは「子連れ / ベビーカー / 座席 / 個室 / 来店」語に寄せる。「◯◯ キッズメニュー」アンカーは`◯◯-kids-menu`へだけ張る。

### 2-C. クラスタC（外食kodzure）— source→target 内部リンクマップ

狙い: 低inbound勢（burger-king4 / sushiro8 / gyukaku9 / royal-host18）を、既存の高権威ページ・同チェーン兄弟・カテゴリハブから増リンクして本数を底上げ→pos5-6→上段。saize(42)/gusto(35)/bamiyan(22)は本数十分＝**触らない**（過剰リンクは希釈）。

**利用可能な高権威ソース（page次元 clicks 実測）**:
- `ohsho-kids-menu`（2,802clk pos2.7・サイト最強）
- `sushiro-kids-menu`（917clk pos4.6）
- `kids-menu-chain-15-hikaku`（inbound102・最大ハブ）
- `famires-kodzure-ranking-2026-10sen`（inbound50・358clk相当のfamiresハブ）※`kodzure-famires-15sen`（358clk pos7.1）も併用
- `burger-chain-kodzure-ranking-2026-5sha`（バーガーハブ）
- `yakiniku-5chain-kodomo-2026` / `kodzure-yakiniku-anzen-kanzen-guide`（焼肉ハブ）
- 同チェーン兄弟: `*-kids-menu` / `*-baby-chair` / `*-stroller` / `*-koshitsu`

| # | source（権威） | → target | アンカーテキスト（案） | 機構 | 前倒し可 |
|---|---|---|---|---|---|
| C1 | `sushiro-kids-menu`（917clk） | `sushiro-kodzure-koryaku` | スシローは子連れで行きやすい？ベビーカー・座席・離乳食まとめ | 手動本文＋seoRelated | ✅ |
| C2 | `sushiro-baby-chair` | `sushiro-kodzure-koryaku` | スシロー 子連れ来店ガイド（席・ベビーカー） | 手動本文 | ✅ |
| C3 | `kids-menu-chain-15-hikaku`（hub102） | `sushiro-kodzure-koryaku` / `burger-king-kodzure-koryaku` / `gyukaku-kodzure-koryaku` | 各「◯◯の子連れ攻略はこちら」 | ハブ関連ブロック | ✅ |
| C4 | `burger-chain-kodzure-ranking-2026-5sha` | `burger-king-kodzure-koryaku` / `mos-burger-kodzure-koryaku` | バーガーキング／モス 子連れ攻略（ベビーカー・席・キッズ対応） | 手動本文＋seoRelated | ✅ |
| C5 | `burger-king-kids-menu` | `burger-king-kodzure-koryaku` | バーガーキングに子連れで行くなら（席・ベビーカー） | 手動本文 | ✅ |
| C6 | `mos-burger-kids-menu` | `mos-burger-kodzure-koryaku` | モスバーガー 子連れ来店ガイド | 手動本文 | ✅ |
| C7 | `yakiniku-5chain-kodomo-2026` / `kodzure-yakiniku-anzen-kanzen-guide` | `gyukaku-kodzure-koryaku` | 牛角は子連れで行ける？座席・個室・安全対策 | 手動本文＋seoRelated | ✅ |
| C8 | `gyukaku-kids-menu` / `gyukaku-koshitsu` / `gyukaku-stroller` | `gyukaku-kodzure-koryaku` | 牛角 子連れ攻略（個室・ベビーカー・安全） | 手動本文 | ✅ |
| C9 | `famires-kodzure-ranking-2026-10sen`（hub50） | `royal-host-kodzure-koryaku` | ロイヤルホストの子連れ攻略（席・ベビーカー・個室） | ハブ本文＋seoRelated | ✅ |
| C10 | `royal-host-kids-menu` / `royal-host-baby-chair` / `royal-host-koshitsu` / `royal-host-stroller` | `royal-host-kodzure-koryaku` | ロイヤルホスト 子連れ来店ガイド | 手動本文 | ✅ |
| C11 | 高CTR兄弟 `yayoiken-kodzure-koryaku`(503clk) / `cocos-kodzure-koryaku`(454clk) | 各famires target（sushiro除く） | 「他チェーンの子連れ攻略」関連リンク群に低inbound勢を優先配置 | 関連ブロック | ✅ |

**本数目標**: burger-king 4→10前後、sushiro 8→14前後、gyukaku 9→14前後、royal-host 18→22前後。saize/gusto/bamiyanは据え置き。
**注意（KV罠）**: source側にKV overrideを持つ記事（過去にadmin編集した記事）が含まれると本文編集が空振る。COO適用時は各source記事で`GET /api/admin/edit-content?kind=article&slug=…`のKV有無を確認し、KVありは本番admin経由で反映（[[kyounoko-cannibal-consolidation-2026-06]]の確立手順）。**mdだけ編集して満足しないこと**。

### 2-A. クラスタA（モーニング）— レバー（**整流A後に本文系を適用**）

狙い受けページ（page×query実測で単一に確定）:
- 「星乃珈琲店 モーニング」11,354imp pos9.7 → `hoshino-morning-kosodate`（121clk）
- 「コメダモーニング何時まで」1,001imp pos9.6 → `komeda-morning-kosodate`（3clk）
- 「デニーズ モーニング 時間」835imp pos9.6 → `dennys-morning-kosodate`（2clk）

**重要な意図分解**: 「星乃珈琲店 モーニング」（頭語・11,354imp）と「◯◯ 何時まで/時間」（情報系サブ・CTR0.2-0.3%）は別物。後者はkosodate角度の記事ではスニペットで勝てない純情報クエリ＝**深追いしない**。Aの金脈は**ブランド+モーニングの頭語で順位を8.9→5帯へ押すこと**（imp母数が桁違い）。

| レバー | 内容 | 機構 | タイミング |
|---|---|---|---|
| A1 内部リンク（他→hoshino） | 現inbound5→12へ。source: `kodzure-morning-cafe-10`(275clk hub・既に2本ありもう1-2本文脈追加)、`cafe-chain-kodzure-ranking-2026-6sha`(既1本)、`cafe-3chain-kodzure-hikaku`、`famires-kodzure-ranking`系、外食hub。アンカー=「星乃珈琲店のモーニングは子連れで行きやすい？時間・値段まとめ」 | 手動本文＋seoRelated | **整流A前でも前倒し可**（発リンク元がKV-aheadでない限り。source記事のKV有無を確認） |
| A2 内部リンク（komeda/dennys） | komeda 2→8、dennys 1→6。`kodzure-morning-cafe-10`ハブから各社への発リンクを均等化（現状hoshinoに集中） | 手動本文 | A1同様前倒し可 |
| A3 本文の支配意図充足 | ヨムーノ/macaroni等が押さえる「時間・値段・メニュー・おかわり・土日祝」を**記事冒頭の早見表（H2＋table）で即答**。競合SERPは情報網羅で勝っている＝kosodate角度に情報網羅を足す（title通りの中身にする） | md本文増強 | **整流A後**（KV空振り回避） |
| A4 構造化データ | 「モーニング実施時間（平日/土日祝）」をFAQ/`OpeningHours`寄りに整備。ただし店舗差があるため断定回避（[[kyounoko-article-no-assertion]]） | md frontmatter/schema | **整流A後** |
| A5 鮮度（QDF） | title/本文の「2026年◯月最新」更新＋更新日反映。星乃はメニュー改定頻度が高くQDFが効く（既に「星乃珈琲 モーニング 土日 メニュー 2026」57clk NEWが伸びている） | md本文 | **整流A後** |

**競合現実（WebSearch軽確認）**: 「星乃珈琲店 モーニング」SERPは`hoshino-morning-kosodate`が上位に出るが、ヨムーノ・ライフスタイルウェガジン・cafe-tatsujin(メニューガイド)・macaroni・menuramen・専門ファンブログが密集。若ドメインには重い頭語で、**コンテンツ単発では動きにくい＝内部リンク＋鮮度＋時間**の合わせ技前提。過度な即効期待はしない（[[kyounoko-seo-winning-pattern]]の「モーニングはauthority/時間待ち」判断と整合。ただし今回は"内部リンクが極端に薄い(5/2/1)"という未着手レバーが残っている点が新しく、ここは実施価値あり）。

### 2-B. クラスタB（水遊び）— レバー（**今週着手・季節時限**）

受けページ実測（page×query）:
- 「舎人公園 じゃぶじゃぶ池」→ **`toneri-koen-jabujabuike` が主受け（84clk pos6.9）に浮上**、`/spot/-irhu`（45clk pos9.5）を既に上回った（メモリ時点の"spotが受け皿"から前進）。ただし両方ランク＝**まだ割れている**。
- 「じゃぶじゃぶ池 兵庫」→ `mizuasobi-kobe` pos30.7・imp65のみ（兵庫セクション未浮上・失点継続）。
- 隠れ勝者（タスクのB候補外だが最大流入）: **`mizuasobi-kawasaki` 372clk pos5.4 CTR16.1%**、`mizuasobi-itabashi-tokyo` 340clk pos6.1。この2本が実はサイトの水遊び最大流入。

| レバー | 内容 | 機構 | 対象 |
|---|---|---|---|
| B1 spot→article一本化の総仕上げ | `/spot/-irhu`の「舎人公園 じゃぶじゃぶ池」意図を`toneri-koen-jabujabuike`へ完全集約。spot側の見出し/本文からじゃぶじゃぶ池の詳述を要約化しarticleへcanonical的アンカー誘導、article側の内部リンク本数を増やしspotを上回らせる（現toneri inbound3→8） | spot本文＋手動リンク | toneri |
| B2 30選ハブ→各都市の相互リンク補強 | `jabujabuike-mizuasobi-tokyo-30`(inbound39 hub)から低inbound勢（itabashi2/taito2/kobe3）へ「◯◯区の水遊び」アンカーで発リンク。ハブ→下層の一方通行/被リンク薄を解消（[[kyounoko-mizuasobi-summer-2026]]の学び） | ハブ本文＋auto-rule | itabashi/taito/kobe |
| B3 auto-ruleの活用 | `lib/auto-internal-links.ts`の既存ルール「じゃぶじゃぶ池」→hub、「舎人公園」→toneri は稼働中。**「板橋 水遊び」「台東 水遊び」等の都市キーワードはauto-rule非対象**なのでB2の手動リンクで補う | 既存auto＋手動 | 全B |
| B4 兵庫の失点回収 | `mizuasobi-kobe`で「じゃぶじゃぶ池 兵庫」pos30.7＝兵庫県内固有スポット名の本文露出が弱い。県内H2の固有名（元浜緑地/加古川等・[[kyounoko-mizuasobi-summer-2026]]で既追加）を見出しに昇格＋「兵庫 じゃぶじゃぶ池」語の本文露出強化 | md本文 | kobe |
| B5 kawasaki/itabashiの保護と押上げ | 最大流入`mizuasobi-kawasaki`(pos5.4)・`mizuasobi-itabashi`(pos6.1)へハブ＋近隣都市記事からの内部リンクを厚くしpos上段固定（触りすぎ注意・良記事保護） | 手動リンク | kawasaki/itabashi |

---

## 3. 各記事「独自データ深掘り」案（きょうのこの勝ち筋＝一次体験・家庭N件・実測）

> 原則: 行っていない施設の体験は書かない（憲章）。以下は**きょうのこが実際に保有／取得可能な一次情報**に限定。

### C（外食kodzure）
- **「ベビーカー実測」表**: 各チェーンの入口段差・通路幅・ベビーカー入店可否を**実店舗で計測した数値**（cm）で提示。競合（食べログ/公式）に無い一次データ。既存の`lib/chain-facilities.ts`（10チェーン×12項目DB）を数値強化し記事に反映（[[kyounoko-chain-facilities-db]]）。
- **「離乳食持ち込み可否の電話確認ログ」**: チェーン本部/店舗へ確認した日付つき事実（「2026-◯-◯ 店舗確認」）。はま寿司の離乳食系（97clk/pos3.7）が伸びている＝持ち込み実務情報の需要が実証済み。
- **「子連れ来店 家庭Nの声」**: きょうのこ運営者＋読者アンケート（LINEリードマグネット導線活用・[[kyounoko-line-lead-magnet]]）で「0-2歳連れで実際どうだったか」をN件掲載。E-E-A-Tの"Experience"直撃。
- **座席実測**: ボックス席/ベビーチェア台数/オムツ替え台の有無を店舗実測。gyukaku/royal-hostは個室訴求（`*-koshitsu`記事あり）と接続。

### A（モーニング）
- **モーニング時間の店舗別実査表**: 「星乃珈琲店 モーニング 時間」系の情報意図に対し、公式店舗検索で開店時刻がバラつく事実を**複数店舗の実データ**で表化（断定せず「店舗による／確認方法」を提示）。競合まとめは"一律◯時"と書きがちで、そこが差別化点。
- **子連れ実食レポ**: 星乃のモーニングを実際に0-2歳連れで利用した一次レポ（席間・ベビーチェア有無・待ち時間・おかわり運用）。ヨムーノ/macaroniは"実食"はやるが"子連れ運用"は薄い＝隙間。
- **平日/土日祝のメニュー差＆値段の最新実査**（QDF）。「星乃珈琲店 メニュー 値段 2026」369imp pos8.5 CTR4.3%が既に反応＝価格鮮度に需要。

### B（水遊び）
- **おむつ可否ルールの一次確認**（差別化の核）: 舎人公園は**おむつ不可**（公式X @ParksToneri 実測確認済）。競合（いこーよ/るるぶ/公式）は"1歳向け"等で曖昧に出すが、**「おむつが取れた子のみ」という制約を正面から扱っているのは実質きょうのこだけ**（WebSearchで確認）。0-2歳親の"行ってがっかり"を防ぐ独自価値＝この角度をB全記事で強化。
- **2026開催情報の一次ソース明記**: 期間7/3〜9/29・時間10-16時（12-13時スライダー休止）・水曜/8/13/9/17休園（公式X由来）。日付は公式X vs るるぶで差が出やすいので**出所と確認日を明記**して信頼性を担保。
- **水深・床面・日陰の実測**: 実訪問済みスポット（舎人/板橋/川崎など既存記事の裏付けがある範囲）で水深cm・床の滑りやすさ・オムツ替え/授乳導線を一次記載。

---

## 4. クラスタBの季節タイミング

- **開催窓**: 2026年 7/3〜9/29（舎人公園・公式確認）。需要ピークは**7月下旬〜8月**（[[kyounoko-mizuasobi-summer-2026]]: 28日で71→3,128impの季節QDF）。
- **内部リンク／本文施策の効き始めラグ**: 経験則で2-4週。よって**8月ピークにクリックを乗せるには着手は今週（〜7/27）が事実上の締切**。
- **推奨**: B1〜B4を**今週中にCOO適用**（Cと並走）。8月第1週に+2週測定、8月中旬にピーク実測。9月中旬以降は季節減衰に入るため、9月末で本キャンペーンのB分は締めて評価（QDFなので翌夏2027へ知見繰越）。
- **来夏への布石**: 兵庫/千葉駅/名古屋駅の失点クエリ（[[kyounoko-mizuasobi-summer-2026]]）は今夏中に潰しておくと2027夏の初速に効く。

---

## 5. 効果測定の設計

**ベースライン（2026-07-21固定・本レポートの値）**。再測定は`node scripts/gsc-report.mjs --days=28`＋page×query使い捨てクエリ（本レポート§で使用したもの）で同手順反復。

**測定点**: +2週 = **2026-08-04**、+4週 = **2026-08-18**（Bは季節ゆえ+2週を主判定）。Aは整流A完了日を起点に+2/+4週（着手が遅れる前提で9月測定込み）。

| クラスタ | 監視クエリ / 受けページ | ベースライン(pos / CTR / clk) | 成功条件（+4週、Bは+2週） |
|---|---|---|---|
| C | サイゼリヤ 子連れ系 → `kodzure-saize-koryaku` | pos5.9 / 9.6% / 833clk | 据え置き（過剰リンク回避の検証＝悪化させない） |
| C | 各低inbound勢 `sushiro/gyukaku/burger-king/royal-host-kodzure-koryaku` | sushiro pos5.5・gyukaku pos5.1・burger-king pos7.2・royal pos5.1 | **pos -0.5〜-1.5**（1p上段化）、clk合計 +30〜80/月 |
| C | inbound本数（`grep -rl`実測） | burger-king4/sushiro8/gyukaku9 | 目標本数到達（10/14/14）を適用直後に確認 |
| A | 星乃珈琲店 モーニング → `hoshino-morning-kosodate` | pos9.7 / 1.1% / 121clk（page全体528clk pos8.9） | **pos8台→6-7台**（imp母数大ゆえ0.5改善でもclk +50超期待）。整流A完了が前提 |
| A | inbound本数 | hoshino5/komeda2/dennys1 | hoshino12/komeda8/dennys6 |
| B | 舎人公園 じゃぶじゃぶ池 → `toneri-koen-jabujabuike` vs `/spot/-irhu` | article 84clk pos6.9 / spot 45clk pos9.5 | **articleへ一本化（spotのclkシェア低下）**＋article **pos6.9→5台** |
| B | じゃぶじゃぶ池 兵庫 → `mizuasobi-kobe` | pos30.7 / imp65 | **pos30→15以内**（兵庫語の露出改善で二桁化） |
| B | mizuasobi-itabashi / taito / kobe（inbound） | 2/2/3 | ハブ発リンク後 5前後 |

**判定ロジック**:
- **効いた**: 上記posが目標帯へ改善しclk増。→ 横展開（Cは残チェーン、Bは来夏布石）。
- **効かない（pos据え置き）**: [[kyounoko-cannibal-consolidation-2026-06]]の再現＝「pos5-7では内部リンク・オンページでは動かず、律速はドメイン権威/時間」。その場合は**内部リンク以外のレバー（被リンク獲得＝施設営業[[kyounoko-outreach-strategy]]・Pinterest/SNSからの外部リンク）へ切替**、記事側の追加投下は停止（工数を溶かさない）。
- **切り分け注意**: 同一ページに複数レバーを同時投下すると寄与分離が不能。C/Bは"内部リンク主"で束ね、A3-A5（本文増強）は整流A後に内部リンクと**1-2週ずらして**投下すると内部リンク単独効果を測れる。

---

## 付録: 参照メモリ / 実装
- 機構: `lib/auto-internal-links.ts`（injectInternalLinks / LINK_RULES）、`lib/articles.ts:1266-1329`（seoRelated関連スコア）、`lib/cross-links.ts`（plan↔article・本件は非対象）。
- データ取得: `scripts/gsc-report.mjs`（readonly SA）、page×query使い捨てクエリ（同SA流用）。
- 関連メモリ: kyounoko-seo-winning-pattern / kyounoko-cannibal-consolidation-2026-06（KV罠・pos5-7頭打ち機序）/ kyounoko-mizuasobi-summer-2026 / kyounoko-hotpepper-deeplink / kyounoko-article-no-assertion / kyounoko-chain-facilities-db / kyounoko-line-lead-magnet。
- **未解決の前提**: `scripts/reconcile-kv-to-md.mjs` は未実装。整流Aの実装・実行（COO/社長）が完了するまでクラスタAの本文系レバー（A3-A5）は着手不可。
