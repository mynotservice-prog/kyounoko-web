# 03. UIアイコンセット 発注書

## 依頼ゴール

サイト内のUIアイコンを統一感あるセットに置き換える。現状は inline SVG を場当たり的に書いており、線幅・形状がバラバラ。

## 仕様

- **線幅**: 1.8px 統一(stroke-width)
- **角丸**: stroke-linecap="round" / stroke-linejoin="round"
- **ベース寸法**: 24×24px(viewBox)
- **塗り**: なし(線画スタイル)・必要に応じて塗り版も
- **ファイル形式**: SVG(svgo圧縮済) + ReactComponent化を想定したクリーンなマークアップ
- **命名**: `icon-{機能}.svg`(例: `icon-favorite.svg`)

## 必要アイコン一覧(機能別)

### ナビゲーション(6個)
- icon-home
- icon-search
- icon-menu(ハンバーガー)
- icon-close
- icon-back(左矢印)
- icon-external(外部リンク)

### アクション(8個)
- icon-favorite(♡ outline)
- icon-favorite-filled(♥ fill)
- icon-share
- icon-bookmark
- icon-copy-link
- icon-print
- icon-download
- icon-filter

### 情報(8個)
- icon-clock(読了時間)
- icon-calendar(公開日)
- icon-user(著者)
- icon-tag
- icon-location-pin(駅・スポット)
- icon-info
- icon-alert(注意)
- icon-check

### コンテンツ(8個)
- icon-stroller(ベビーカー)
- icon-baby(0-1歳)
- icon-kid(2-3歳)
- icon-child(4-6歳)
- icon-stars-3(レーティング・お気に入り度)
- icon-restaurant
- icon-park
- icon-toy

### SNS(4個)
- icon-x(旧Twitter)
- icon-line
- icon-instagram
- icon-facebook

**合計: 約34個**

## 既存実装の参考(同じ機能を統一)

下記ファイルに inline SVG が散在している。これらを置換するイメージで:

- `components/article/ShareBar.tsx` (Share系3つ + コピー)
- `components/ui/FavoriteButton.tsx` (♡)
- `components/ui/TriedButton.tsx`
- `components/article/TableOfContents.tsx` (目次系)
- `components/layout/SiteHeader.tsx` (検索・メニュー)
- `components/article/CopyLinkButton.tsx`

## デザインの方向性

- 線画+丸み(温かい紙感を維持)
- 過度に細い(1px未満)・過度に太い(3px以上)は避ける
- 色は単色 stroke のみ。Reactで `color: var(--ink)` 等を CSS から制御可能なように `stroke="currentColor"` で
- 塗り版が必要なアイコンだけ `fill="currentColor"` 別出力

## 納品形式

- 個別 SVG ファイル一式(`/public/icons/ui/` 配下にコミット可能な形)
- React コンポーネント雛形1つ(他は同じパターンでサイト側で作る)
- Figma または Sketch ファイルでセット一覧

## 期日

- ナビゲーション+アクション(14個): 第1陣 1週間
- 残り20個: 2週間以内
