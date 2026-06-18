# バリューコマース導入セットアップ（アソビュー！／ホットペッパーグルメ）

> 目的: AdSense審査が厳しいため、**広告内容を100%自分で選べる成果報酬型**でPV→収益化を強化する。
> きょうのこの流入主力（外食子連れ ≒ 74% / GSC診断）に合わせ、**外食予約**と**レジャーチケット**の2軸で攻める。
> 既存ASP（A8・楽天・もしも）と同じ `lib/affiliate-products.ts` の仕組みに乗せるだけで動く（`valuecommerce` provider は実装済み）。

---

## STEP 1: 登録・提携（**要・本人作業**。私が代行不可）

### 1-1. バリューコマース アカウント登録
- https://www.valuecommerce.ne.jp/ から「サイト運営者(アフィリエイト)登録」
- 必要物: サイトURL（https://きょうのこ本番ドメイン）、口座情報、本人情報
- **サイト審査あり（通常2〜3営業日）**。きょうのこは1,000本超の記事＋スポットDBがあるので審査は通りやすい

### 1-2. 提携申請する広告主（優先順）

| 優先 | 広告主 | 種別 | きょうのこでの設置先 | 成果地点の目安 |
|---|---|---|---|---|
| ★★★ | **ホットペッパーグルメ** | 外食ネット予約 | 外食/ファミレス系記事（74%流入とドンピシャ） | ネット予約完了 |
| ★★★ | **アソビュー！** | レジャーチケット | 水遊び/室内/地域おでかけ記事・スポット | チケット購入 |
| ★★☆ | **じゃらん 遊び・体験** | 体験予約 | 地域おでかけ記事（箱根/伊豆/軽井沢等） | 体験予約完了 |
| ★☆☆ | Yahoo!トラベル / Yahoo!ショッピング | 旅行/物販 | 地域おでかけ・物販記事の補完 | 予約/購入 |

> 提携承認は広告主ごとに即時〜数日。**まず上3つ**を申請すればよい。

### 1-3. リンクの取り出し方（承認後）
- VC管理画面 →「広告」→ 該当広告主 →「広告リンクをコピー」
- **「MyLink」機能**を使うと、特定ページURL（例: ホットペッパーの東京×子連れ検索結果）に対して成果報酬リンクを生成できる → 記事内容に合わせた深いリンクが貼れて成約率UP
- 生成される `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=...&pid=...` 形式のURLを、後述の `href` にそのまま貼る（provider='valuecommerce' は wrap 不要で直書き）

**承認が下りてリンクが取れたら、その文字列を私に渡してください。STEP2のコードを即差し込みます（ビルドチェックまで実施）。**

---

## STEP 2: コードへの設置（**リンク到着後に私が実施**）

### 2-1. 設置の仕組み（既存と同じ）
- `lib/affiliate-products.ts` の `AFFILIATE_TARGET_SLUGS` に対象記事 slug を追加
- 同ファイルに `provider: 'valuecommerce'` の商品エントリを追加
- → `app/article/[slug]/page.tsx` が自動で「PICK UP」カード／インラインCTAとして描画（追加のJSX不要）

### 2-2. 設置先マップ（実在 slug ベース・確定）

**A. ホットペッパーグルメ予約 → 外食系記事（最優先）**
```
famires-7chain-8koumoku-2026
famires-kodzure-ranking-2026-10sen
kodzure-famires-15sen
kodzure-famires-zenkoku-kanzen-2026
gaishoku-chain-kodomo-anzen-guide
kodzure-restaurant-erabikata-kanzen-guide
kodzure-fukuro-mall-restaurants
ikea-restaurant-kodzure-koryaku
gaisyoku-ko-ga-taberu
```
> ここは現状 mogumo（幼児食宅配）ブリッジのみ。**「今から外食予約」の方が読者の意図に近い**ため、ホットペッパー予約カードを併設すると高成約が期待できる。

**B. アソビュー！／じゃらん体験 → 水遊び・室内・地域おでかけ記事**
```
jabujabuike-mizuasobi-tokyo-30      （水遊び）
amenohi-indoor-spots-tokyo-15        （雨の日室内）
fuji-safari-park-kosodate
atami-kodzure-spot / hakone-kodzure-spot / izu-kodzure-spot
kamakura-kodzure-spot / karuizawa-kodzure-spot / hokkaido-kodzure-spot
kosodate-muryou-spots-osaka
1sai-pool-debut-motimono / kodomo-pool-keiken-debut
```

### 2-3. コード雛形（リンク確定後にこれを貼る）
```ts
// lib/affiliate-products.ts

// 1) AFFILIATE_TARGET_SLUGS に外食/おでかけ slug を追記
//    （上の設置先マップの slug をそのまま追加）

// 2) VC商品エントリを追加（href は VC管理画面で取得した実URLに置換）
const VALUECOMMERCE_PROGRAMS_2026_06: AffiliateProduct[] = [
  {
    id: 'vc-hotpepper-famires',
    slug: 'famires-kodzure-ranking-2026-10sen',
    provider: 'valuecommerce',
    href: 'https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=XXX&pid=XXX&vc_url=...', // ← 実URL
    title: 'ホットペッパーグルメで子連れOKのお店を予約',
    subtitle: '個室・キッズメニュー・ベビーチェアで絞り込み。ネット予約でポイントも貯まる',
    price: 'ネット予約 無料',
  },
  // アソビュー！等も同様に追加
];

// 3) getAffiliateProducts が参照する配列に統合（既存の A8/もしも と同じ箇所に spread）
```

> `href: '#'` はビルドを止める（`scripts/check-affiliate-links.mjs`）。**実URLが無いエントリはコミットしない。**

---

## STEP 3: 効果測定（売上がどこまで伸びるか）

### 既に計測の仕込みは完了している
- 全アフィリエイトクリックは GA4 に `affiliate_click`（provider別）で送信済み（[AffiliateLink.tsx:111](components/affiliate/AffiliateLink.tsx:111)）
- → 設置後、GA4で `provider=valuecommerce` のクリック数を即追跡できる

### 収益の目安（単価ベンチマーク）
| 広告主 | 想定単価/成果 | 想定CVR | 備考 |
|---|---|---|---|
| ホットペッパーグルメ | 〜50〜100円/予約 | 高（来店意図が強い） | 単価低・件数で稼ぐ |
| アソビュー！ | チケット額の数%（¥40〜200/件） | 中 | 客単価次第で伸びる |
| じゃらん体験 | 予約額の2〜3% | 中 | 地域記事で効く |

### ざっくり試算式
```
月間収益 ≒ 対象記事の月間PV × CTR(1〜3%) × CVR(2〜10%) × 単価
```
> **対象記事（外食系）の月間PVを教えてもらえれば、具体的な月額レンジを試算します。**
> 例: 外食系で月3万PV → クリック300〜900 → 予約20〜90件 → 月¥1,000〜9,000（ホットペッパー単独）。
> アソビュー/じゃらんの高単価が乗ると伸びる。

---

## 将来拡張（STEP4 / 今後検討）
- **スポットページへの設置**: 現状 `/spot/[slug]` はアフィリエイトゼロ。
  レストラン系スポット → ホットペッパー予約、レジャー系スポット → アソビューチケット、を当てれば大きな未開拓面になる。
- i-mobile 等のディスプレイ補完（アダルト等NGカテゴリ除外設定込み）。
