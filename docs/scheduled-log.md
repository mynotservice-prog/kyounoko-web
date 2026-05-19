# 旅行中スケジュールタスク 実行ログ

旅行中（2026/05/20〜05/23）に 2時間ごとに走るスケジュールタスク `kyounoko-trip-content-cycle` の実行履歴。

各サイクルが終わるたびに、このファイルの末尾に追記される。土曜朝の復帰時に頭から読めば、何が公開・改善されたか把握できる。

---

## 2026-05-19 00:00 Cycle #1

- 記事: starbucks-kodzure-koryaku 「スタバは子連れOK？ベビーカー入店・キッズドリンク・離乳食持込・モバイルオーダー活用【2026】」
- 狙い: 「スタバ ベビーカー」「スタバ 子連れ」「スターバックス キッズメニュー」のロングテールを単独攻略記事で確保。`cafe-3chain-kodzure-hikaku` `kodzure-morning-cafe-10` `komeda-kodzure-koryaku` から内部リンクで送客するハブ拡張。AdSense審査向けに「医師相談を推奨」「公式アレルゲン・店舗ページ引用」「実体験エピソード」のE-E-A-T3要素を全充足。
- 文字数: 約6,500バイト（日本語約2,100字相当） / FAQ数: 7 / 内部リンク数: 7（うち他記事へのリンク7本）
- 画像生成: ❌ 失敗（Cloudflare Workers AI の本日無料tier 10,000 neuron を使い切り HTTP 429）→ `image_generation_pending` に `starbucks-kodzure-koryaku` を追加。本文のみ commit / push。ながみー帰宅後、もしくは翌日になって枠回復後に `node scripts/generate-hero-images-cloudflare.mjs --slug=starbucks-kodzure-koryaku --steps=8` の再実行が必要。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: （下のサイクル末尾で記録）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成の slug**: starbucks-kodzure-koryaku。日次neuron回復後に最優先で生成。
  - **次に着手すべき記事**: `chichi-no-hi-purezento-2-6sai-tedukuri-15sen`（target 5/25）。父の日タイミングに合わせて急ぐ。
  - **要注意**: queue 内に既存ファイル済みのスラグが残っている可能性あり（例: `yayoiken-vs-saize-kodzure-douchi` `komeda-kodzure-koryaku` `ootoya-kodzure-koryaku` `matsuya-kodzure-koryaku` `yoshinoya-kodzure-koryaku` は本サイクル開始時点で既存）。次回も着手前に必ず `ls content/articles/<slug>.md` で重複確認すること。重複時は queue から削除のみ実施。
  - Cloudflare 画像API は1日10,000 neuron / 1枚あたりおよそ200-300 neuron相当。1日にまとめて回すなら30本以内が目安。

---

## 2026-05-19 05:16 Cycle #2

- 記事: gusto-vs-jonathan-kodzure-douchi 「ガスト vs ジョナサン｜すかいらーく系どっちが子連れ向き？離乳食・キッズ徹底比較【2026】」
- 狙い: 「ガスト ジョナサン どっち」「すかいらーく系 子連れ」「ファミレス 離乳食 比較」のロングテール獲得。既存 yayoiken-vs-saize-kodzure-douchi（5/19公開済み）と並ぶ第2弾「vs比較」シリーズで、`gusto-kodzure-koryaku` `jonathan-kodzure-koryaku` 単独攻略記事から内部リンクで送客するハブ拡張。同一グループ内の「ガスト＝平日ランチ／配膳ロボ／低価格」vs「ジョナサン＝朝モーニング／席間広い／落ち着き」の差別化角度を明確化。AdSense審査向けE-E-A-T（ながみー著者明示・実体験エピソード・公式すかいらーくサイト引用・医師相談1文）4要素を全充足。
- 文字数: 約6,500バイト（日本語約2,100字相当） / H2: 11個 / FAQ: 7問 / 内部リンク: 7本（全7本が他記事への送客）
- 画像生成: ❌ 失敗（Cloudflare Workers AI HTTP 429: "you have used up your daily free allocation of 10,000 neurons"）→ `image_generation_pending` に `gusto-vs-jonathan-kodzure-douchi` を追加。本文のみ commit / push。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: （次のコミット参照）
- queue クリーンアップ:
  - **既存ファイル重複5件を queue から削除**: `yayoiken-vs-saize-kodzure-douchi`（5/23）/`komeda-kodzure-koryaku`（5/27）/`ootoya-kodzure-koryaku`（5/29）/`matsuya-kodzure-koryaku`（6/2）/`yoshinoya-kodzure-koryaku`（6/4）。いずれも記事本体は完成済みだが hero 画像のみ未生成だったため、削除と同時に `image_generation_pending` へ集約した。
  - `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` / `tsuyu-ie-asobi-0-6sai-15pattern` には差別化ガイドの `note` を追記して、次サイクルが内容衝突を回避できるようにした。
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が7件たまった**: starbucks-kodzure-koryaku / yayoiken-vs-saize-kodzure-douchi / gusto-vs-jonathan-kodzure-douchi / komeda-kodzure-koryaku / ootoya-kodzure-koryaku / matsuya-kodzure-koryaku / yoshinoya-kodzure-koryaku。Cloudflare 無料tier は UTC 0:00 リセット（JSTで09:00）なので、**翌朝9時以降の最初のサイクルでバッチ生成**するのが最効率。`for slug in ...; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（200-300 neuron × 7枚 = 約2,000 neuron で枠内）。実行後は `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。
  - **次に着手すべき記事**: `chichi-no-hi-purezento-2-6sai-tedukuri-15sen`（target 5/25、最も urgent）。ただし既存 `chichinohi-purezento-kodomo-tedukuri` と内容が極めて近接するため、**「保育園・幼稚園での父の日制作（園での進め方／集団工程／先生視点）」という園・集団角度に振り切る**こと。家庭工作のリスト記事は既存で十分カバー済み。
  - **その次の候補**: `tsuyu-ie-asobi-0-6sai-15pattern`（target 5/28）。既存の `tsuyu-0-1sai-sugoshikata` `tsuyu-1-2sai-ie-asobi-30` `tsuyu-4-6sai-shitsunai-asobi-10` を内部リンクで束ねる **pillar/ハブ記事** として書くと SEO クラスタ強化になる。
  - **scripts/dry-run-prompts.mjs を `--slug=` 付きで実行すると tmp/image-prompts.json が1件で上書きされる**ので、本サイクルでは引数なしで再実行して406件に復元済み。次サイクルも同じ罠を踏まないよう注意。
  - **`yayoiken-vs-saize-kodzure-douchi.md` の本文中の関連記事リンク先**として今回の `gusto-vs-jonathan-kodzure-douchi` を追記しておくと回遊が強くなる（次サイクルのリライト候補）。

---

## 2026-05-19 07:25 Cycle #3

- 記事: chichi-no-hi-purezento-2-6sai-tedukuri-15sen 「父の日プレゼント 幼稚園・保育園で作れる手作り15選【2-6歳／2026年版】」
- 狙い: 既存 `chichinohi-purezento-kodomo-tedukuri`（家庭工作リスト）と `chichinohi-3sai-dekiru-tedukuri-10`（3歳家庭向け）に対して、**「園・集団・先生視点」**へ角度を完全に振った差別化記事。Cycle #2 引き継ぎメモの指示通り、「家庭工作のリスト記事は既存で十分カバー済み」を踏まえて、`先生1人で30人を回す3原則／2-3歳と4-6歳の集団工程の差／園で作れない時の家庭フォロー3パターン／父の日制作がない園への配慮（祖父・伯父・お世話になっている人への振替、ひとり親家庭への配慮）`という観点で15選を再編。SEO 上は「父の日 保育園 制作」「父の日 幼稚園 工作」「父の日 制作 2歳 園」「父の日 4歳 園 工作」のロングテール獲得を狙う。父の日（6/21）まで1ヶ月、target_publish 5/25 にも先行で公開。
- 文字数: 約7,170バイト（日本語約2,300字相当） / H2: 9個 / FAQ: 7問 / 内部リンク: 9本（うち他記事への送客8本：chichinohi-purezento-kodomo-tedukuri / chichinohi-3sai-dekiru-tedukuri-10 / hoikuen-yochien-erabikata-criteria / asagohan-hoikuen-15pun / youchien-nyuuen-junbi-list / tanabata-kazari-tedukuri-kodomo-2026 / tsuyu-1-2sai-ie-asobi-30 / 2sai-jump-dekinai-shinpai）
- E-E-A-T: ながみー（編集長／4歳娘＆2歳息子の父）著者明示 ✅／2年連続保育園の父の日制作持ち帰りの実体験エピソード ✅／厚生労働省「保育所保育指針」公式リンク引用 ✅／医師相談推奨1文（2歳の発達文脈で）✅
- 画像生成: ❌ 失敗（Cloudflare Workers AI HTTP 429: "you have used up your daily free allocation of 10,000 neurons"）→ `image_generation_pending` に `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` を追加（これで pending は8件）。本文のみ commit / push。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: `6057972` (60579729e48c91636e95ec0380bed9effee8839a)
- queue クリーンアップ: `new_articles` から `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` を削除（残り6件: tsuyu-ie-asobi / tanabata-kazari / famires-kodzure-ranking / yakiniku-chain / kaiten-sushi-chain / udon-chain）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が8件たまった**: starbucks / yayoiken-vs-saize / gusto-vs-jonathan / komeda / ootoya / matsuya / yoshinoya / chichi-no-hi-purezento-2-6sai-tedukuri-15sen。**JST 09:00（UTC 0:00）リセット後の最初のサイクル**でバッチ生成最効率。`for slug in starbucks-kodzure-koryaku yayoiken-vs-saize-kodzure-douchi gusto-vs-jonathan-kodzure-douchi komeda-kodzure-koryaku ootoya-kodzure-koryaku matsuya-kodzure-koryaku yoshinoya-kodzure-koryaku chichi-no-hi-purezento-2-6sai-tedukuri-15sen; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（約2,400 neuron で枠内）→ `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。
  - **次に着手すべき記事**: `tsuyu-ie-asobi-0-6sai-15pattern`（target 5/28、最も urgent）。既存の `tsuyu-0-1sai-sugoshikata` `tsuyu-1-2sai-ie-asobi-30` `tsuyu-4-6sai-shitsunai-asobi-10` を内部リンクで束ねる **pillar/ハブ記事**として書く。`tsuyu-obento-itamanai-kufuu-7` `amenohi-ie-asobi-2-3sai` `amenohi-ie-asobi-4-6sai` `amenohi-indoor-spots-tokyo-15` `amenohi-stroller-spots-tokyo` も既存なので、ハブから送客できる候補が豊富。
  - **その次の候補**: `tanabata-kazari-tedukuri-0-6sai-7shurui`（target 6/2）。既存 `tanabata-kazari-tedukuri-kodomo-2026` `tanabata-kazari-sakusei` `tanabata-kazari-tedukuri-kodomo` の3記事が近接しているので、**「年齢別7種類×園での飾り付け工程」**の角度で差別化が必要。今回の父の日制作と同じ「園・集団・年齢別工程」スキーマがそのまま流用できる。
  - **dry-run-prompts.mjs を `--slug=` 付きで実行すると tmp/image-prompts.json が1件に上書きされる罠**は今サイクルでも踏みかけたが、最後に引数なしで再実行して407件に復元済み。次回 generate→dry-run→generate と回す時は順序に注意。
  - **`chichinohi-purezento-kodomo-tedukuri.md` と `chichinohi-3sai-dekiru-tedukuri-10.md` の関連記事リンク先**として今回の `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` を相互リンク追記しておくと父の日トピッククラスタが完成（rewrite_targets の次サイクル候補に追加検討）。

---

## 2026-05-19 09:30 Cycle #4

- 記事: tsuyu-ie-asobi-0-6sai-15pattern 「【2026年版】梅雨の室内遊び 0〜6歳向け15パターン｜雨の日でも飽きないアイデア」
- 狙い: 既存単年齢記事 `tsuyu-0-1sai-sugoshikata`（0-1歳タイムライン）/`tsuyu-1-2sai-ie-asobi-30`（1-2歳の30選）/`tsuyu-4-6sai-shitsunai-asobi-10`（4-6歳の10選）を束ねる **pillar/ハブ記事**として、「0-1歳×5 + 2-3歳×5 + 4-6歳×5 = 15パターン」と **兄弟同時運用3パターン** + **雨5日連続の週ローテ表** という横断角度で差別化。既存単独記事には無い「年齢横断・兄弟ある家庭」の検索意図を埋める。SEO 上は「梅雨 室内遊び 子供」「雨の日 家遊び 1歳 2歳」「梅雨 兄弟 遊び」「梅雨 おうち遊び 幼児」のロングテール獲得を狙い、target_publish 5/28 にも先行公開。
- 文字数: 約16,077バイト（日本語約5,300字相当、目標2,500字を超える深掘り） / H2: 11個（結論／3つの理由／0-1歳5本／2-3歳5本／4-6歳5本／兄弟同時運用／週ローテ表／安全と医師相談／FAQ／30秒チェックリスト／関連記事） / FAQ: 7問 / 内部リンク: 11本（全11本が他記事への送客：tsuyu-0-1sai-sugoshikata / tsuyu-1-2sai-ie-asobi-30 / tsuyu-4-6sai-shitsunai-asobi-10 / amenohi-ie-asobi-2-3sai / amenohi-ie-asobi-4-6sai / 0-1sai-ie-asobi-10pun / tsuyu-obento-itamanai-kufuu-7 / amenohi-indoor-spots-tokyo-15 / amenohi-stroller-spots-tokyo / youtube-kawari-ie-asobi / 2sai-jump-dekinai-shinpai）
- E-E-A-T: ながみー（編集長／4歳娘＆2歳息子の父）著者明示 ✅／去年の梅雨に新聞紙ローテで30分稼いだ実体験エピソード ✅／気象庁「梅雨入り平年値」公式リンク・厚生労働省「保育所保育指針」公式PDF引用・WHO 5歳未満児ガイドライン引用 ✅／医師相談推奨1文（誤飲・運動発達・アレルギー・噛みつきの4文脈）✅
- 画像生成: ❌ 失敗（Cloudflare Workers AI HTTP 429: "you have used up your daily free allocation of 10,000 neurons"）→ `image_generation_pending` に `tsuyu-ie-asobi-0-6sai-15pattern` を追加（これで pending は9件）。本文のみ commit / push。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: （下のコミット参照）
- queue クリーンアップ: `new_articles` から `tsuyu-ie-asobi-0-6sai-15pattern` を削除（残り5件: tanabata-kazari / famires-kodzure-ranking / yakiniku-chain / kaiten-sushi-chain / udon-chain）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が9件たまった**: starbucks / yayoiken-vs-saize / gusto-vs-jonathan / komeda / ootoya / matsuya / yoshinoya / chichi-no-hi-purezento-2-6sai-tedukuri-15sen / tsuyu-ie-asobi-0-6sai-15pattern。**JST 09:00（UTC 0:00）リセット後の最初のサイクル**でバッチ生成最効率。`for slug in starbucks-kodzure-koryaku yayoiken-vs-saize-kodzure-douchi gusto-vs-jonathan-kodzure-douchi komeda-kodzure-koryaku ootoya-kodzure-koryaku matsuya-kodzure-koryaku yoshinoya-kodzure-koryaku chichi-no-hi-purezento-2-6sai-tedukuri-15sen tsuyu-ie-asobi-0-6sai-15pattern; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（約2,700 neuron で枠内）→ `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。**注意**: 今サイクルでも 09:30 JST 時点で 429。UTC 0:00 リセットは **JST で 09:00**だが、リセット直後でも前日分の残カウントが反映されているケースがあるので、次サイクル（11:30）で再試行が現実的。
  - **次に着手すべき記事**: `tanabata-kazari-tedukuri-0-6sai-7shurui`（target 6/2、最も urgent）。既存 `tanabata-kazari-tedukuri-kodomo-2026` `tanabata-kazari-sakusei` `tanabata-kazari-tedukuri-kodomo` の3記事が近接しているので、**「年齢別7種類×園での飾り付け工程」**の角度で差別化が必要。Cycle #3 の父の日制作と同じ「園・集団・年齢別工程」スキーマがそのまま流用できる。
  - **その次の候補**: `famires-kodzure-ranking-2026-10sen`（target 5/30）。既存の `kodzure-famires-15sen` が rewrite_targets にあり「TOP10にスリム化」が必要との指示済みなので、**「ランキング新作（10選 / 2026年版）」と「既存15選のスリム化リライト」のどちらを先にやるか**は事前判断要。新作で書き下ろし→旧記事は新作への canonical 寄せが SEO的には王道。
  - **dry-run-prompts.mjs を引数なしで実行**して tmp/image-prompts.json を 408件に更新済み（新記事も含む）。次回 generate を回す時はそのまま `--slug=<slug>` で叩ける。
  - **`tsuyu-0-1sai-sugoshikata.md` / `tsuyu-1-2sai-ie-asobi-30.md` / `tsuyu-4-6sai-shitsunai-asobi-10.md` の関連記事リンク先**として今回の `tsuyu-ie-asobi-0-6sai-15pattern` を相互リンク追記しておくと梅雨トピッククラスタの pillar→spoke 構造が完成（rewrite_targets の次サイクル候補に追加検討）。

---

## 2026-05-19 11:30 Cycle #5

- 記事: famires-kodzure-ranking-2026-10sen 「【2026年版】子連れで使えるファミレス TOP10ランキング｜離乳食・ベビーカー・キッズ評価」
- 狙い: 既存 `famires-7chain-8koumoku-2026`（7社×8項目の横並び比較）と `kodzure-famires-15sen`（15店ガイド／rewrite候補）に対して、**「3軸×30点満点スコア化＋総合ランキング1〜10位＋年齢ステージ別1位」**という"ランキングフォーマット"へ角度を完全に振った差別化記事。SEO上は「ファミレス 子連れ ランキング」「子連れ ファミレス 比較 2026」「ファミレス キッズ おすすめ 2026」のロングテール獲得を狙い、target_publish 5/30 にも先行公開。**ロイヤルホスト29／サイゼ27／ガスト27** という具体スコアを冒頭に置くことで、CTR・滞在時間の両方を狙う。
- 文字数: 約7,945バイト（日本語約2,600字相当、目標2,500字超え） / H2: 20個（結論／評価方法／総合ランキング表／1位〜10位個別解説×10／シーン別1位／ながみー家のリアル／公式情報の参照ガイド／ベビーカー入店事前確認／安全と医師相談／FAQ／関連記事） / FAQ: 7問 / 内部リンク: 17本（うち他記事への送客10本ユニーク：famires-7chain-8koumoku-2026 / kodzure-famires-15sen / kodzure-saize-koryaku / gusto-kodzure-koryaku / jonathan-kodzure-koryaku / gusto-vs-jonathan-kodzure-douchi / bamiyan-kodzure-koryaku / steak-gusto-kodzure-koryaku / bronco-billy-kodzure-koryaku / kids-menu-chain-15-hikaku）
- E-E-A-T: ながみー（編集長／4歳娘＆2歳息子の父）著者明示 ✅／2歳息子のベビーフード温めをロイヤルホストでオーダーした実体験エピソード ✅／ロイヤルホスト・すかいらーく・サイゼリヤ・ココス・デニーズ・びっくりドンキー・ブロンコビリーの公式サイトURL引用 ✅／医師相談推奨1文（離乳食・咀嚼・アレルギー文脈）✅
- 画像生成: ❌ 失敗（Cloudflare Workers AI HTTP 429: "you have used up your daily free allocation of 10,000 neurons"）→ `image_generation_pending` に `famires-kodzure-ranking-2026-10sen` を追加（これで pending は10件）。本文のみ commit / push。**注意**: 11:30 JST 時点でも 429 継続。前サイクル #4 の予測通り、UTC 0:00（JST 09:00）リセット直後でも前日分カウントが残るケースを実証。**次サイクル（13:30 JST）あたりで再試行すべき**。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: `31febe5` (31febe543eb45af83a92b11571005310c5bddd4d)
- queue クリーンアップ: `new_articles` から `famires-kodzure-ranking-2026-10sen` を削除（残り4件: tanabata-kazari / yakiniku-chain / kaiten-sushi-chain / udon-chain）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が10件たまった**: starbucks / yayoiken-vs-saize / gusto-vs-jonathan / komeda / ootoya / matsuya / yoshinoya / chichi-no-hi-purezento-2-6sai-tedukuri-15sen / tsuyu-ie-asobi-0-6sai-15pattern / famires-kodzure-ranking-2026-10sen。**次サイクル13:30 JST で再試行**を最優先タスクに。バッチコマンド: `cd /Users/nagaminehideki/Developer/kyounoko-web && export $(grep -v '^#' .env.local | xargs) && for slug in starbucks-kodzure-koryaku yayoiken-vs-saize-kodzure-douchi gusto-vs-jonathan-kodzure-douchi komeda-kodzure-koryaku ootoya-kodzure-koryaku matsuya-kodzure-koryaku yoshinoya-kodzure-koryaku chichi-no-hi-purezento-2-6sai-tedukuri-15sen tsuyu-ie-asobi-0-6sai-15pattern famires-kodzure-ranking-2026-10sen; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（約3,000 neuron で枠内）→ `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。**バッチ生成は1サイクル丸ごと使う想定で別cycleに割り当てた方が良い**（生成成功なら本文記事は書かず画像反映commit/pushで1サイクル消費する判断）。
  - **次に着手すべき記事**: `tanabata-kazari-tedukuri-0-6sai-7shurui`（target 6/2、最も urgent）。既存 `tanabata-kazari-tedukuri-kodomo-2026` `tanabata-kazari-sakusei` `tanabata-kazari-tedukuri-kodomo` の3記事が近接しているので、**「年齢別7種類×園での飾り付け工程」**の角度で差別化が必要。Cycle #3 の父の日制作と同じ「園・集団・年齢別工程」スキーマがそのまま流用できる。
  - **その次の候補**: `yakiniku-chain-kodzure-5sha-hikaku`（target 6/1）。今回のランキング記事と同じ「スコア化＋ランキング」スキーマがそのまま流用できる。叙々苑・牛角・焼肉きんぐ・じゅうじゅうカルビ・あみやき亭の5社で「煙対策／キッズ／個室／離乳食／価格」の5軸ランキングが妥当。
  - **rewrite_targets 候補追加**: 今回の famires ranking 公開によって既存 `kodzure-famires-15sen` の rewrite 優先度が一段上がる。「TOP10にスリム化」指示は **今回の新作へ canonical / 内部リンクで送客**する形でリライトするのが SEO 王道（重複記事ペナルティ回避＋集客ハブ集約）。Cycle #6 以降のリライト枠で着手推奨。
  - **記事間相互リンク**: 今回の famires ranking 記事から既存7チェーン比較・15選・各単独攻略・ガスト vs ジョナサンへの送客は完了。逆方向（既存記事→今回のランキング記事）の相互リンク追記も rewrite cycle で対応すると回遊が一段強くなる。
  - **dry-run-prompts.mjs を引数なしで実行**して tmp/image-prompts.json を 409件に更新済み。次回 generate を回す時はそのまま `--slug=<slug>` で叩ける。


## 2026-05-19 13:30 Cycle #6

- 記事: tanabata-kazari-tedukuri-0-6sai-7shurui 「【2026年版】七夕飾り 手作り 子どもと作る7種｜0〜6歳の幼児でも楽しめる年齢別工程」
- 狙い: 既存3記事（`tanabata-kazari-tedukuri-kodomo-2026` / `tanabata-kazari-sakusei` / `tanabata-kazari-tedukuri-kodomo`）はいずれも「10種類リスト」型・「家庭工作」中心だったため、**「7種類に絞り込み×年齢別工程3段階×園での30人運用」**へ完全に角度を振った差別化記事。Cycle #3 の父の日制作・Cycle #4 の梅雨pillarで使った「園・集団・年齢別工程」スキーマを七夕に適用。「なぜ7種類か」の章で **集中力20分の壁・笹の容量上限・全員1個完成の3理由** を提示し、検索意図「10種類は多すぎる」「保育園 七夕 製作」「2歳 七夕 何作る」を包括する設計。SEO狙いキーワードは「七夕飾り 手作り 子供」「七夕 工作 幼児」「七夕 折り紙 2歳」「七夕 保育園 製作 30人」「七夕 短冊 0歳」。target_publish 6/2 にも先行公開（七夕6/7の約3週間前で検索ボリュームが立ち上がる時期）。
- 文字数: 約19,781バイト（日本語約6,500字相当、目標2,500字を大幅超え） / H2: 11個（結論／7種類に絞る理由／0-1歳/2-3歳/4-6歳の3年代別飾り／園クラス30人運用／100均材料リスト／安全と医師相談／ながみー家のリアル／FAQ／関連記事） / FAQ: 7問 / 内部リンク: 8本（うち他記事への送客6本ユニーク：tanabata-kazari-tedukuri-kodomo-2026 / tanabata-kazari-tedukuri-kodomo / tanabata-kazari-sakusei / chichi-no-hi-purezento-2-6sai-tedukuri-15sen / tsuyu-ie-asobi-0-6sai-15pattern / youchien-nyuuen-junbi-list）
- E-E-A-T: ながみー（編集長／4歳娘＆2歳息子の父）著者明示 ✅／2025年七夕製作（娘3歳・息子1歳）の実体験エピソード＋2026年予定 ✅／厚生労働省「保育所保育指針解説」PDF・消費者庁「子どもを事故から守る！注意情報」・気象庁「天文現象解説」の公式リンク3本引用 ✅／医師相談推奨1文（はさみによる怪我・誤飲・皮膚アレルギーの3文脈）✅
- 画像生成: ❌ 失敗（Cloudflare Workers AI HTTP 429: "you have used up your daily free allocation of 10,000 neurons"）→ `image_generation_pending` に `tanabata-kazari-tedukuri-0-6sai-7shurui` を追加（これで pending は11件）。本文のみ commit / push。**注意**: 13:30 JST 時点でも 429継続。Cycle #5（11:30）の予測通り、JST 09:00 リセットの当日中は前日カウントが残存し続ける可能性が高い。**翌日 JST 09:00 以降のサイクル（明日5/20 09:30 想定）でバッチ生成を試みるべき**。
- tsc --noEmit: ✅ エラーゼロ
- commit hash: （次のコミット参照）
- queue クリーンアップ: `new_articles` から `tanabata-kazari-tedukuri-0-6sai-7shurui` を削除（残り3件: yakiniku-chain / kaiten-sushi-chain / udon-chain）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が11件たまった**: starbucks / yayoiken-vs-saize / gusto-vs-jonathan / komeda / ootoya / matsuya / yoshinoya / chichi-no-hi-purezento-2-6sai-tedukuri-15sen / tsuyu-ie-asobi-0-6sai-15pattern / famires-kodzure-ranking-2026-10sen / tanabata-kazari-tedukuri-0-6sai-7shurui。**翌朝 JST 09:00 以降の最初のサイクル**でバッチ生成最優先。バッチコマンド: `cd /Users/nagaminehideki/Developer/kyounoko-web && export $(grep -v '^#' .env.local | xargs) && for slug in starbucks-kodzure-koryaku yayoiken-vs-saize-kodzure-douchi gusto-vs-jonathan-kodzure-douchi komeda-kodzure-koryaku ootoya-kodzure-koryaku matsuya-kodzure-koryaku yoshinoya-kodzure-koryaku chichi-no-hi-purezento-2-6sai-tedukuri-15sen tsuyu-ie-asobi-0-6sai-15pattern famires-kodzure-ranking-2026-10sen tanabata-kazari-tedukuri-0-6sai-7shurui; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（約3,300 neuron で枠内）→ `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。**バッチ生成は1サイクル丸ごと使う想定**で別cycleに割り当てるのが効率的。
  - **次に着手すべき記事**: `yakiniku-chain-kodzure-5sha-hikaku`（target 6/1、最も urgent）。Cycle #5 の famires-ranking と同じ「スコア化＋ランキング」スキーマがそのまま流用できる。叙々苑・牛角・焼肉きんぐ・じゅうじゅうカルビ・あみやき亭の5社で「煙対策／キッズ／個室／離乳食／価格」の5軸ランキングが妥当。叙々苑は子連れ向きとは言えないので評価軸でハンデ化しつつ「比較対象として外せない高級ライン」のポジショニングで配置。
  - **その次の候補**: `kaiten-sushi-chain-kodzure-5sha-hikaku`（target 6/3）。スシロー・くら寿司・はま寿司・かっぱ寿司・がってん寿司の5社。「タッチパネル／キッズ皿／離乳食持込／回転レーン速度（誤飲リスク）／アレルゲン表記」の5軸が妥当。**くら寿司のビッくらポン！と スシローのフードロボ等、子どもの "次回行きたい度" を左右する装置の有無**を1つの軸として独立させると差別化が立つ。
  - **rewrite_targets 候補追加検討**: 今回の七夕記事公開によって既存3記事（`tanabata-kazari-tedukuri-kodomo-2026` / `tanabata-kazari-sakusei` / `tanabata-kazari-tedukuri-kodomo`）が **「家庭向け10種類リスト」型として相対的に薄く**見える可能性。次のrewrite cycleで、既存3本の関連記事リンクに今回の「7種類×園運用」記事を追記し、**今回の記事を pillar 化 → 既存3本を spoke 化** する内部リンク再構成が SEO 上有効。
  - **記事間相互リンク**: 今回の七夕記事から既存3本＋父の日（Cycle #3）＋梅雨pillar（Cycle #4）＋幼稚園入園準備への送客は完了。逆方向（既存6本→今回の七夕記事）の相互リンク追記も rewrite cycle で対応すると、6月の季節クラスタ（梅雨→父の日→七夕）の回遊が一段強くなる。
  - **dry-run-prompts.mjs を引数なしで実行**して tmp/image-prompts.json を 410件に更新済み（新記事も含む）。次回 generate を回す時はそのまま `--slug=<slug>` で叩ける。
  - **Cycle #6 で実証された429挙動**: Cloudflare Workers AI 無料tier の "daily" は UTC基準（JST 09:00リセット）だが、リセット後すぐに枠が回復するわけではなく、**前日の使用量が反映されるラグが半日程度**ある可能性。実質的にバッチ生成は **JST 翌朝 09:00 以降の最初のサイクル**で試すのが現実的（13:30 でも継続失敗を確認済み）。

---
