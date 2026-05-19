# 収益化セットアップ手順 — 楽天77本＋Amazon を有効化

旅行から帰宅後の最優先タスク。**所要時間: 30〜45分**で楽天77本のアフィリエイト収益が動き出します。

---

## 現状

- 楽天商品URL（`https://item.rakuten.co.jp/...`）が **77件** 記事内に埋め込み済み
- もしもアフィリエイト経由URLへ自動変換する仕組みは **コード実装済み**（`lib/moshimo.ts`）
- ただし **環境変数3つ（a_id / pc_id / pl_id）が未設定** のため、現在は素のリンクのまま遷移 = 収益ゼロ
- Amazonアソシエイトの方も `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` 未設定なら同様

---

## ① もしもアフィリエイト登録（10分）

楽天市場の収益化は **もしもアフィリエイト経由** が業界標準（直接の楽天アフィリエイトより還元率が高いケースが多い）。

### 1-1. もしもアフィリエイトに無料登録

1. https://af.moshimo.com/ を開く
2. 右上「無料会員登録（アフィリエイトを始める）」
3. メールアドレス → 認証メール → パスワード設定
4. プロフィール入力（運営者情報・サイト情報）
   - サイト名: `きょうのこ`
   - サイトURL: `https://kyounoko.jp`
   - サイトカテゴリ: `子育て / 育児`
   - 月間PV: 申告どおりに（少なくても問題なし）
5. **本人確認書類**は不要（後で報酬1000円突破時に必要）

### 1-2. 楽天市場プロモーションに提携申請

1. ログイン後の検索バーで「楽天市場」検索
2. 「楽天市場の商品購入 プロモーション」（promotion_id=54）をクリック
3. 「提携申請する」→ 即時承認（楽天は審査なし）
4. **「広告リンクを作成」** タブに進む

### 1-3. 広告コードから a_id / pc_id / pl_id を取得

1. プロモーション画面で「広告リンクを作成」
2. 適当な楽天商品URL（例: 任意の絵本URL）を入力し、「リンクコード生成」
3. 生成されたHTMLコードの **URLパラメータ** から3つを取得：

```
https://af.moshimo.com/af/c/click?a_id=AAAAAAAA&p_id=54&pc_id=BBBBBBBB&pl_id=CCCCCCCC&url=...
                                  ^^^^^^^^^^^                  ^^^^^^^^^^^         ^^^^^^^^^^^
                                  a_id を控える                pc_id                pl_id
```

メモ:
- `a_id` (会員ID): 全プロモ共通（一度取得すれば他広告でも使える）
- `pc_id` (プロモコード): 楽天市場固有
- `pl_id` (広告ID): 楽天市場固有

---

## ② Vercel 環境変数を設定（5分）

### 2-1. ローカル `.env.local` に追記

```bash
cd /Users/nagaminehideki/Developer/kyounoko-web
cat >> .env.local <<'EOF'

# もしもアフィリエイト（楽天）
NEXT_PUBLIC_MOSHIMO_A_ID=AAAAAAAA
NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID=BBBBBBBB
NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID=CCCCCCCC
EOF
```

`AAAAAAAA` `BBBBBBBB` `CCCCCCCC` を ①-3 で取得した値に置き換える。

### 2-2. Vercel 環境変数（本番デプロイで効くように）

1. https://vercel.com/ → kyounoko-web プロジェクト → Settings → Environment Variables
2. **「Add New」** を3回繰り返して以下を追加（Production / Preview / Development すべてにチェック）:

| Key | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_MOSHIMO_A_ID` | (a_idの値) | All |
| `NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID` | (pc_idの値) | All |
| `NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID` | (pl_idの値) | All |

3. 「Save」後、**「Deployments」→ 最新デプロイの右上 ⋯ → 「Redeploy」** で env を反映

### 2-3. 動作確認

ローカルで:

```bash
cd /Users/nagaminehideki/Developer/kyounoko-web
node -e "
require('dotenv').config({path:'.env.local'});
const {wrapMoshimoRakuten, isMoshimoRakutenConfigured} = require('./lib/moshimo.ts');
console.log('Configured:', isMoshimoRakutenConfigured());
console.log('Test URL:', wrapMoshimoRakuten('https://item.rakuten.co.jp/shopname/code/'));
"
```

→ `Configured: true` で `https://af.moshimo.com/af/c/click?a_id=...&p_id=54&pc_id=...&pl_id=...&url=https%3A%2F%2Fitem.rakuten.co.jp%2F...` が表示されれば成功。

> **注**: 上記の `require('./lib/moshimo.ts')` は素のNodeでは動かない可能性あり。動かない場合は本番デプロイ後、`view-source:https://kyounoko.jp/article/chiiku-toys-rakuten-1-3sai-ranking` で楽天リンクのhrefが `af.moshimo.com/af/c/click?...` に変換されているか確認すればOK。

---

## ③ Amazon アソシエイト（任意、15分）

もしもアフィリエイトでもAmazonは扱えるが、**Amazonアソシエイト直接**の方が紹介料率が安定しているケースあり。両方使えるよう実装済み。

### 3-1. Amazonアソシエイト登録

1. https://affiliate.amazon.co.jp/ で登録
2. **180日以内に3件の販売実績**を作る必要あり（審査要件）。きょうのこのトラフィックなら問題なくクリア見込み
3. 承認後、トラッキングID（例: `kyounoko-22`）を取得

### 3-2. 環境変数追加

```bash
cat >> .env.local <<'EOF'

# Amazonアソシエイト
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=kyounoko-22
EOF
```

Vercel側も同じく `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` を Environment Variables に追加。

---

## ④ AdSense 自動広告の有効化（審査通過後）

AdSense審査が通ったら、サイト内の `AdSlot` コンポーネントが自動的に広告を配信し始めます（コード実装済み）。

加えて、自動広告（記事内・全画面・サイドバー）を有効化すると追加収益：

1. https://adsense.google.com/adsense/u/4/pub-4445473825791494/ads
2. 「サマリー」→ 「自動広告」→ kyounoko.jp を有効化
3. 配置: 「広告内」「アンカー」「全画面」をすべてON

最初の3日は様子見、その後Search Consoleの順位影響を見ながらON/OFF微調整。

---

## ⑤ 収益化以降の維持運用

- もしもアフィリエイト管理画面で、月初に前月の発生報酬を確認（最低 1,000円から振込）
- Amazonアソシエイトは月次成果レポートをCSVダウンロード可能
- AdSenseは$100到達で振込開始

---

## トラブルシュート

| 症状 | 原因と対処 |
|---|---|
| Vercel本番でmoshimo URLに変換されない | env3つすべてセット済みか確認。Production環境にチェックが入っているか確認。Redeployを実行 |
| もしも管理画面で発生報酬がゼロのまま | 提携申請が「承認済み」になっているか確認。クリックは記録されているか（通常24時間で反映） |
| Amazon広告が表示されない | アソシエイト審査前の状態。リンク自体は機能するが、紹介料は付かない |
