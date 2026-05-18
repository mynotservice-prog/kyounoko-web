# 02. 記事個別OGP自動生成テンプレ 発注書

## 依頼ゴール

記事個別の OGP 画像を **動的生成** するテンプレートを設計してほしい。現状は全記事共通の `/public/img/ogp-default.jpg` 1枚で、SNSシェア時のCTRが上がらない。

## なぜ動的生成か

記事は約290本、季節記事は毎月追加される。1枚ずつデザイナーが作るのは現実的でない。**Vercel の @vercel/og(satori)** を使えば、サーバー側で SVG → PNG をリクエスト毎に生成できる。

## 納品物

### A. テンプレートデザイン3パターン
記事のカテゴリで自動切替する設計。最低3パターン:

1. **おでかけ系**(category=today-doko / gyouji)
   - 背景: `--paper` + 軽い装飾(地図風・地形風)
   - アクセント: `--sage` (ナチュラル)

2. **食事・レシピ系**(category=today-taberu)
   - 背景: `--paper` + ぼかし
   - アクセント: `--peach` (温かさ)

3. **暮らし・育児系**(category=today-mawasu / today-nani / yakudatsu / narai)
   - 背景: `--paper-deep`
   - アクセント: `--clay` (信頼感)

### B. レイアウト仕様
共通要素:
- サイズ: 1200×630px(OGP標準)
- ロゴ: 左上、横ロゴ、高さ40px
- タイトル: 中央寄り左、最大3行、フォントは Shippori Mincho 太字、48-64px
- カテゴリラベル: タイトル上、Inter 14px、--clay-text 色
- 著者: 右下、「著者: ながみー」+小さなアバター丸、Noto Sans JP 16px
- URL: 右下、kyounoko.jp、Inter 12px、--ink-mute色

### C. Figma または SVG テンプレ
- 上記3パターンを Figma にレイアウトで納品
- 文字位置・サイズ・色は完全に指定してあること
- 開発側で satori 用に JSX へ移植する

### D. アバター画像
- ながみーアイコン(円形・60×60px)
- イラスト or 顔の出ない最低限のシンボル
- ロゴと混同しないシンプルさ

## 実装イメージ(参考)

```tsx
// app/api/og/route.tsx (Vercel @vercel/og)
import { ImageResponse } from 'next/og';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? '';
  const category = searchParams.get('cat') ?? 'default';
  // テンプレ3パターンを category で出し分け
  return new ImageResponse(<OgTemplate title={title} category={category} />, {
    width: 1200, height: 630,
  });
}
```

## 動作確認用URLパターン(参考)

```
/api/og?title=2歳児が嫌がらない離乳食5レシピ&cat=today-taberu
/api/og?title=新宿駅で子連れランチおすすめ10店&cat=today-doko
```

## 注意

- 文字長が長いタイトルでもはみ出さない調整(自動改行・自動縮小)
- 日本語フォント埋め込みは Vercel @vercel/og で扱える形式(Noto Sans JP / Shippori Mincho のサブセット woff2)
- ファイルサイズ・生成速度ともに常識的に

## 期日

- テンプレ第1案: 1週間
- 最終納品: 2週間以内
