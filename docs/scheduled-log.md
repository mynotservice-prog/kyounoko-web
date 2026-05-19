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
- queue クリーンアップ: `new_articles` から `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` を削除（残り6件: tsuyu-ie-asobi / tanabata-kazari / famires-kodzure-ranking / yakiniku-chain / kaiten-sushi-chain / udon-chain）
- 次サイクル向け引き継ぎメモ:
  - **画像未生成 slug が8件たまった**: starbucks / yayoiken-vs-saize / gusto-vs-jonathan / komeda / ootoya / matsuya / yoshinoya / chichi-no-hi-purezento-2-6sai-tedukuri-15sen。**JST 09:00（UTC 0:00）リセット後の最初のサイクル**でバッチ生成最効率。`for slug in starbucks-kodzure-koryaku yayoiken-vs-saize-kodzure-douchi gusto-vs-jonathan-kodzure-douchi komeda-kodzure-koryaku ootoya-kodzure-koryaku matsuya-kodzure-koryaku yoshinoya-kodzure-koryaku chichi-no-hi-purezento-2-6sai-tedukuri-15sen; do node scripts/generate-hero-images-cloudflare.mjs --slug=$slug --steps=8; done` で連続実行可（約2,400 neuron で枠内）→ `node scripts/apply-hero-ai.mjs` で frontmatter 反映＆commit。
  - **次に着手すべき記事**: `tsuyu-ie-asobi-0-6sai-15pattern`（target 5/28、最も urgent）。既存の `tsuyu-0-1sai-sugoshikata` `tsuyu-1-2sai-ie-asobi-30` `tsuyu-4-6sai-shitsunai-asobi-10` を内部リンクで束ねる **pillar/ハブ記事**として書く。`tsuyu-obento-itamanai-kufuu-7` `amenohi-ie-asobi-2-3sai` `amenohi-ie-asobi-4-6sai` `amenohi-indoor-spots-tokyo-15` `amenohi-stroller-spots-tokyo` も既存なので、ハブから送客できる候補が豊富。
  - **その次の候補**: `tanabata-kazari-tedukuri-0-6sai-7shurui`（target 6/2）。既存 `tanabata-kazari-tedukuri-kodomo-2026` `tanabata-kazari-sakusei` `tanabata-kazari-tedukuri-kodomo` の3記事が近接しているので、**「年齢別7種類×園での飾り付け工程」**の角度で差別化が必要。今回の父の日制作と同じ「園・集団・年齢別工程」スキーマがそのまま流用できる。
  - **dry-run-prompts.mjs を `--slug=` 付きで実行すると tmp/image-prompts.json が1件に上書きされる罠**は今サイクルでも踏みかけたが、最後に引数なしで再実行して407件に復元済み。次回 generate→dry-run→generate と回す時は順序に注意。
  - **`chichinohi-purezento-kodomo-tedukuri.md` と `chichinohi-3sai-dekiru-tedukuri-10.md` の関連記事リンク先**として今回の `chichi-no-hi-purezento-2-6sai-tedukuri-15sen` を相互リンク追記しておくと父の日トピッククラスタが完成（rewrite_targets の次サイクル候補に追加検討）。

