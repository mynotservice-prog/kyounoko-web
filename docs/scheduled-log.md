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

