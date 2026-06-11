# LINE公式アカウント立ち上げキット（kyounoko.jp）

最終更新: 2026-06-11
対象: 運営者ながみー（1人運用前提）
目的: サイト流入をLINE友だちとして資産化し、金曜夕方の「週末どこ行く？」配信で再訪・回遊を作る。

> 情報の正確性について: 料金・通数・審査条件は2026年6月時点のWeb調査に基づく。LINEヤフーは2026年10月1日に追加メッセージ料金の改定を予定しているため、**契約前に必ず公式（lycbiz.com）で最新情報を確認すること**。

---

# 1. 開設手順（30分でやる作業）

## 1-1. LINE Business ID登録 → 公式アカウント作成 → ベーシックID取得

所要時間の目安: 登録〜アカウント作成15分、初期設定15分。

1. **LINE Business IDを作る**（約5分）
   - https://entry.line.biz/start/jp/ にアクセス →「アカウントを作成」
   - 登録方法は2択。**個人LINEアカウントで登録**（ログイン連携、最速）か、**メールアドレスで登録**（届いたメール内リンクからビジネスID登録に進む）
   - 運用が属人化しないよう、事業用メール（service@remegift.jp）でのメールアドレス登録を推奨
   - 名前・パスワード設定 → 利用規約同意 → SMS認証で完了
2. **公式アカウントを作成する**（約5分）
   - ビジネスIDでログイン後、アカウント作成フォームに入力:
     - アカウント名: 下記1-2の推奨案を使用
     - 業種: 大業種「メディア」/ 小業種「情報サイト・ポータルサイト」あたりを選択（選択肢は画面で要確認）
     - 会社/事業者名・メールアドレスを入力
   - 作成完了と同時に **ベーシックID（@xxxやyyy 形式のランダムID）が自動付与される**。取得作業は不要。管理画面の「設定 > アカウント設定」で確認できる
   - ※「プレミアムID」（@kyounoko など好きな文字列）は有料・任意。最初は不要
3. **管理画面（LINE Official Account Manager）に入る**
   - https://manager.line.biz/ がWeb版管理画面。以後の設定・配信はすべてここから行う
4. **料金プランの確認**
   - 開設直後は無料の**コミュニケーションプラン（月200通まで・0円）**。当面このままでよい（→ 第2章）
5. **（任意・後日）認証済アカウントの申請**
   - 管理画面右上「設定」→「アカウント認証をリクエスト」
   - 事業の実在性を示す情報（サイトURL: https://kyounoko.jp、事業内容など）を入力して申請
   - 審査は**5〜10営業日程度**。通過すると緑バッジが付き、**LINEアプリ内検索の結果に表示される**ようになる（未認証は検索に出ない）
   - 詳細な審査基準は非公開部分があるため、却下時は公式ヘルプで要確認。個人事業でも通る事例は多い

## 1-2. 推奨初期設定（このサイト向け具体文言）

### アカウント名（20文字以内）

```
きょうのこ｜0-6歳きょうどうする？
```

代替案: `きょうのこ。子連れおでかけ即答`

### プロフィール（ステータスメッセージ等）

```
雨の日も猛暑日も「今日どうする？」に10秒で答えます。スポット445件・記事1,000本超
```

### あいさつメッセージ（友だち追加直後に自動送信・通数カウント外）

```
友だち追加ありがとうございます🌱
「きょうのこ。」は0〜6歳の子育て家庭の
「今日どうする？」に即答するサイトです。

📅 毎週金曜17:00に
「週末どこ行く？」をお届けします。
お天気に合わせた3択でサクッと決められます◎

▼ まずは今日の過ごし方をチェック
https://kyounoko.jp/today?utm_source=line&utm_medium=greeting

▼ 雨の日の家あそびを年齢で絞るならこちら
https://kyounoko.jp/today?weather=rain&place=home&utm_source=line&utm_medium=greeting
```

設定場所: 管理画面「ホーム > トークルーム管理 > あいさつメッセージ」

### リッチメニュー（トーク画面下部の固定メニュー）

設定場所: 管理画面「ホーム > トークルーム管理 > リッチメニュー」。テンプレート「大」の6分割 or 「小」の3分割。まずは3分割で十分。

| 位置 | ラベル | リンク先 |
|---|---|---|
| 左 | ☀️ 今日どうする？ | https://kyounoko.jp/today?utm_source=line&utm_medium=richmenu |
| 中 | 📍 スポットを探す | https://kyounoko.jp/spots?utm_source=line&utm_medium=richmenu |
| 右 | ☔ 雨の日の家あそび | https://kyounoko.jp/today?weather=rain&place=home&utm_source=line&utm_medium=richmenu |

- メニューバーのテキスト: `タップしてメニューを開く ▼`
- 画像はCanva等で 2500×843px（3分割テンプレの場合。サイズは管理画面の指定に従う）

## 1-3. 友だち追加URL・QRコードの取得場所

- 管理画面「ホーム > 友だちを増やす > 友だち追加ガイド」
- ここに **友だち追加URL（https://lin.ee/xxxxx 形式）**、**QRコード画像（ダウンロード可）**、**ボタン用HTMLタグ** がまとまっている
- URLとQRコードの両方を控えておく（QRはサイトのフッターや配布物用）

## 1-4. サイトへの反映（Vercel環境変数）

取得した友だち追加URLをVercelに設定すると、**サイトに友だち追加バナーが自動表示される**。

1. https://vercel.com → kyounoko-web プロジェクト → Settings → Environment Variables
2. 以下を追加:
   - Key: `NEXT_PUBLIC_LINE_ADD_FRIEND_URL`
   - Value: `https://lin.ee/xxxxx`（1-3で取得したURL）
   - Environment: Production / Preview / Development すべてにチェック
3. **Save後、再デプロイが必要**（環境変数はビルド時に焼き込まれるため）。Deployments → 最新デプロイの「…」→ Redeploy
4. ローカル開発用に `.env.local` にも同じ行を追加しておく:
   ```
   NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://lin.ee/xxxxx
   ```

---

# 2. 配信設計

## 2-1. 基本リズム: 金曜17:00「週末どこ行く？」固定

- **週1回・金曜17:00** に固定。保育園お迎え前後にスマホを見る時間帯で、週末の予定を考え始めるタイミング
- 構成は毎週同じ「**天気 × 3択**」フォーマット:
  1. 導入1行（今週末の天気をひとこと）
  2. ☀️晴れたら → 外あそび系のリンク
  3. ☔雨なら → 屋内・家あそび系のリンク
  4. 🥵猛暑なら／👜持ち物 → 季節系のリンク
- 予約配信を使う: 管理画面「メッセージ配信 > 作成」→ 配信日時を金曜17:00に指定。**週の好きなタイミングに書いて予約**しておけば金曜に手が空く
- フォーマット固定のメリット: 制作10分以内で回せる／読者が「金曜のあれ」と認識して開封が安定する

## 2-2. 無料プラン（コミュニケーションプラン）の通数制限内での運用

**前提となる仕様**（2026年6月時点・公式で要確認）:

- コミュニケーションプラン: **月額0円・月200通まで**。**追加メッセージの購入は不可**（上限到達でその月は配信不能）
- 通数のカウント: **配信人数 × 配信回数**。1回の配信で3吹き出しまで送っても**1通**とカウント（吹き出し数ではなく送信先の人数で数える）
- あいさつメッセージ・応答メッセージ（自動返信）は**通数にカウントされない**
- 上位プラン: ライトプラン 月5,000円・5,000通／スタンダードプラン 月15,000円・30,000通＋追加可。※2026年10月1日に追加メッセージ料金の改定が予定されているため、有料化検討時は必ず公式の最新料金表を確認

**計算例（週1配信＝月4〜5回）**:

| 友だち数 | 月4回配信 | 月5回ある月 | 判定 |
|---|---|---|---|
| 40人 | 160通 | 200通 | ◎ 無料枠ぴったり |
| 50人 | 200通 | 250通 | △ 5週ある月は超過 |
| 100人 | 400通 | 500通 | ✕ 無料枠では不可 |

**運用ルール**:

1. **友だち40人までは何も考えず全員配信×週1** でよい
2. 40人を超えたら、月5週ある月（2026年は7月・10月など金曜が5回ある月）は **4回に間引く** か、絞り込み配信（属性で対象を絞ると通数を節約できる）を使う
3. **友だち100人到達が有料化の検討ライン**。ライトプラン5,000円で5,000通＝友だち1,000人×週1相当までカバーできる。月100万円目標のサイトとしては、LINE経由の再訪→アフィリエイト収益が月5,000円を超える見込みが立った時点で移行
4. ステップ配信（第4章）を本格運用するのも有料化以降。無料期間中は金曜配信1本に集中する

---

# 3. 金曜配信テンプレ 初月4週分（コピペ用完成原稿）

- 想定開始: 2026年6月中旬。第1週=6/19(金)、以降 6/26・7/3・7/10 の17:00予約配信
- 各原稿はそのまま1吹き出しで送る（200〜300字）。URLは実在ページ＋utm付き

## 第1週（6/19配信）梅雨まっただ中

```
こんばんは、きょうのこ。です🌱
今週末は雨予報の地域が多そうです☔

【週末どこ行く？3択】

☔ 雨なら → おうちで過ごす2〜3歳の遊びネタ
https://kyounoko.jp/today?weather=rain&age=2-3&place=home&utm_source=line&utm_campaign=fri0619

🏢 外に出たいなら → 屋内あそび場の持ち物チェックリスト
https://kyounoko.jp/article/shitsunaiasobiba-kozure-mochimono?utm_source=line&utm_campaign=fri0619

🌂 平日の送迎がしんどい人へ → 梅雨の保育園送迎 便利グッズ
https://kyounoko.jp/article/tsuyu-hoikuen-soutei-grocery?utm_source=line&utm_campaign=fri0619

よい週末を☺️
```

## 第2週（6/26配信）晴れ間を狙う

```
こんばんは、きょうのこ。です🌱
梅雨の晴れ間、逃したくないですよね☀️

【週末どこ行く？3択】

☀️ 晴れたら → 公園へ！子連れ持ち物の必須リスト
https://kyounoko.jp/article/kouen-kozure-mochimono?utm_source=line&utm_campaign=fri0626

☔ 雨に変わったら → 0〜1歳と家で何する？
https://kyounoko.jp/today?weather=rain&age=0-1&place=home&utm_source=line&utm_campaign=fri0626

📍 ちょっと遠出するなら → 条件で探せるスポット一覧
https://kyounoko.jp/spots?utm_source=line&utm_campaign=fri0626

天気アプリとセットでどうぞ☺️
```

## 第3週（7/3配信）水遊びシーズン開幕

```
こんばんは、きょうのこ。です🌱
7月！じゃぶじゃぶ池の開放が始まる季節です💦

【週末どこ行く？3択】

⛲ 無料で水遊びなら → 東京のじゃぶじゃぶ池30選（開放期間・水深つき）
https://kyounoko.jp/article/jabujabuike-mizuasobi-tokyo-30?utm_source=line&utm_campaign=fri0703

👜 行く前に → 水遊びの持ち物リスト（年齢別）
https://kyounoko.jp/article/natsu-mizuasobi-mochimono?utm_source=line&utm_campaign=fri0703

☔ 雨なら → 4〜6歳の雨の日おうち遊び
https://kyounoko.jp/today?weather=rain&age=4-6&place=home&utm_source=line&utm_campaign=fri0703

水分補給を忘れずに☺️
```

## 第4週（7/10配信）猛暑シフト

```
こんばんは、きょうのこ。です🌱
そろそろ猛暑日が出てくる頃。無理しない週末プランを🥵

【週末どこ行く？3択】

🥵 暑すぎる日は → 猛暑日OKの過ごし方（2〜3歳）
https://kyounoko.jp/today?weather=heat&age=2-3&utm_source=line&utm_campaign=fri0710

🐠 涼しい屋内なら → 水族館 子連れ持ち物リスト
https://kyounoko.jp/article/suizokukan-kozure-mochimono?utm_source=line&utm_campaign=fri0710

⛲ 朝イチ勝負なら → じゃぶじゃぶ池30選（午前中がすいてます）
https://kyounoko.jp/article/jabujabuike-mizuasobi-tokyo-30?utm_source=line&utm_campaign=fri0710

帽子と凍らせた飲み物が効きます☺️
```

**運用メモ**: 配信前に当該週の実際の天気予報を見て、導入1行と3択の順番だけ差し替える（雨予報なら雨リンクを先頭に）。本文の使い回しはOK。

---

# 4. 月齢別ステップ配信テンプレ（13通）

将来Lステップ等のステップ配信ツール導入時、友だち登録時アンケート（子の生年月）で分岐してそのまま使える雛形。各通200字程度。無料プラン期間中は使わない（通数を金曜配信に温存）。

URLのutmは `utm_source=line&utm_medium=step` で統一（以下では省略表記。実装時は各URLに付与すること）。

### ① 0歳前半（0〜5か月）

```
{0歳前半}の今月は、おでかけより「家でどう過ごすか」が主役の時期🍼
ねんね期でも刺激になる遊びを、家・短時間の条件で探せます。

▼ 0〜1歳×家で → https://kyounoko.jp/today?age=0-1&place=home

外気浴デビューの準備に、ベビーカー散歩の持ち物も少しずつ。
▼ 公園の持ち物 → https://kyounoko.jp/article/kouen-kozure-mochimono
```

### ② 0歳後半（6〜11か月）

```
{0歳後半}の今月は、おすわり〜はいはいで世界が広がる時期🌱
初めての動物園・水族館は「いつから行ける？」が気になりますよね。

▼ 動物園はいつから？ → https://kyounoko.jp/article/kodomo-doubutsuen-itsukara
▼ 水族館はいつから？ → https://kyounoko.jp/article/kodomo-suizokukan-itsukara

近場で試すなら屋内あそび場が安心です。
```

### ③ 1歳前半（12〜17か月）

```
{1歳前半}の今月は、よちよち歩きでおでかけ本番スタート👟
1歳から楽しめる動物園、実はけっこうあります。

▼ 1歳からの動物園ランキング（関東） → https://kyounoko.jp/article/kanto-doubutsuen-1sai-kara-ranking
▼ 動物園の持ち物 → https://kyounoko.jp/article/doubutsuen-kozure-mochimono

帰りの昼寝対策に、ベビーカーは必携です。
```

### ④ 1歳後半（18〜23か月）

```
{1歳後半}の今月は、「歩きたい！」が爆発する時期🚶
公園あそびが一気に楽しくなる一方、持ち物も増えます。

▼ 公園 子連れ持ち物リスト → https://kyounoko.jp/article/kouen-kozure-mochimono
▼ 雨の日の代替プラン → https://kyounoko.jp/today?weather=rain&age=0-1&place=home

着替え1セット多め、が合言葉です。
```

### ⑤ 2歳前半（24〜29か月）

```
{2歳前半}の今月は、イヤイヤ期×おでかけの両立がテーマ🌀
「外に出たほうがお互いラク」な日のために、即決できる行き先リストを。

▼ 2〜3歳×外あそび → https://kyounoko.jp/today?age=2-3&place=outside
▼ 屋内あそび場の持ち物 → https://kyounoko.jp/article/shitsunaiasobiba-kozure-mochimono

雨の日プランも同じページで切り替えられます。
```

### ⑥ 2歳後半（30〜35か月）

```
{2歳後半}の今月は、外食デビュー・再挑戦にいい時期🍴
座って待てる時間が少しずつ伸びてきます。

▼ 外食の子連れ持ち物 → https://kyounoko.jp/article/shokuji-gaishoku-kozure-mochimono
▼ 2〜3歳の今日の過ごし方 → https://kyounoko.jp/today?age=2-3

ごほうびシール的な「小さな楽しみ」を1つ忍ばせると安定します。
```

### ⑦ 3歳前半（36〜41か月）

```
{3歳前半}の今月は、行動範囲がぐっと広がる時期🚄
電車や新幹線での帰省・旅行も現実的になってきます。

▼ 帰省・新幹線の持ち物 → https://kyounoko.jp/article/kisei-shinkansen-kozure-mochimono
▼ 飛行機の持ち物 → https://kyounoko.jp/article/hikouki-kozure-mochimono

移動中の「ひま対策」が成否の9割です。
```

### ⑧ 3歳後半（42〜47か月）

```
{3歳後半}の今月は、「自分でやりたい」をおでかけに活かす時期🎒
自分のリュックに自分の荷物を1つ、から始めましょう。

▼ 公園の持ち物（年齢別） → https://kyounoko.jp/article/kouen-kozure-mochimono
▼ 4〜6歳の遊びも先取り → https://kyounoko.jp/today?age=4-6

水筒とハンカチは「自分の係」にすると喜びます。
```

### ⑨ 4歳

```
{4歳}の今月は、初めての本格アウトドアにちょうどいい時期⛺
デイキャンプから試すと親の負担が少なめです。

▼ キャンプの子連れ持ち物 → https://kyounoko.jp/article/kyanpu-kozure-mochimono
▼ 外あそびスポットを探す → https://kyounoko.jp/spots

虫よけ・日焼け止めは年齢に合うものを忘れずに。
```

### ⑩ 5歳

```
{5歳}の今月は、子どもの「行きたい」をプランに組み込める時期🗺
動物園・水族館も「見たいもの」を先に決めると満足度が段違いです。

▼ 動物園の持ち物 → https://kyounoko.jp/article/doubutsuen-kozure-mochimono
▼ 水族館の持ち物 → https://kyounoko.jp/article/suizokukan-kozure-mochimono

帰りに「今日のベスト3」を聞くのがおすすめです。
```

### ⑪ 6歳

```
{6歳}の今月は、就学前ラストイヤーの思い出づくり🌟
少し遠くへ、少し長く。飛行機デビューにも向いた時期です。

▼ 飛行機の子連れ持ち物 → https://kyounoko.jp/article/hikouki-kozure-mochimono
▼ 4〜6歳の週末プラン → https://kyounoko.jp/today?age=4-6

小学生になると土日の習い事が始まりがち。今のうちに。
```

### ⑫ 入園準備期（特別号・1〜3月に配信）

```
【入園準備号】4月入園が決まったご家庭へ🌸
持ち物の名前つけと同じくらい大事なのが「雨の日送迎」の装備です。

▼ 梅雨の保育園送迎 便利グッズ → https://kyounoko.jp/article/tsuyu-hoikuen-soutei-grocery

レインカバー・レインコートはサイズ欠けしやすいので早めの準備が吉。
入園後の平日あそびネタはこちら → https://kyounoko.jp/today
```

### ⑬ 夏特別号（特別号・6月下旬〜7月に配信）

```
【夏特別号】水遊びシーズン開幕です💦
無料で遊べるじゃぶじゃぶ池、開放期間が始まりました。

▼ 東京のじゃぶじゃぶ池30選 → https://kyounoko.jp/article/jabujabuike-mizuasobi-tokyo-30
▼ 水遊びの持ち物リスト → https://kyounoko.jp/article/natsu-mizuasobi-mochimono

熱中症アラートの日は屋内に切り替えを。
▼ 猛暑日の過ごし方 → https://kyounoko.jp/today?weather=heat
```

---

# 5. 効果測定

## 5-1. 友だち追加数の目標感

- 業界相場感: メディアサイトの友だち登録率は**サイト訪問者の1〜3%程度**（バナー設置位置・訴求文言に大きく依存。あくまで目安）
- kyounoko.jpへの当てはめ（月間訪問者数は GA4/Search Console の実数で置き換えること）:

| 月間訪問者 | 登録率1% | 登録率3% |
|---|---|---|
| 3,000 | 30人/月 | 90人/月 |
| 10,000 | 100人/月 | 300人/月 |

- **初月目標: 30人**（バナー＋記事内導線のみ）。3か月で100人＝有料プラン検討ラインに到達が現実的なシナリオ
- 登録率を上げる打ち手: 記事末尾に「金曜17時に週末プランが届きます」と具体的なベネフィットを書く／雨の日記事にだけ出すなど文脈マッチ

## 5-2. LINE経由流入の計測方法

**運用ルール: LINEに貼るURLには必ず `?utm_source=line` を付ける**（本ドキュメントのテンプレはすべて付与済み）。

- パラメータ規約:
  - `utm_source=line`（固定・必須）
  - `utm_medium=`: `greeting`（あいさつ）/ `richmenu`（リッチメニュー）/ `step`（ステップ配信）。金曜配信は省略可
  - `utm_campaign=`: 金曜配信は `fri0619` 形式（配信日）
- 既にクエリがあるURLは `&` で連結する（例: `/today?weather=rain&utm_source=line`）。`?` を2つ付けないこと
- 計測の見方:
  - GA4: 「集客 > トラフィック獲得」でセッションのソースが `line` の行を確認。`utm_campaign` 別に見れば**どの週の配信が効いたか**が分かる
  - LINE管理画面側: 「分析 > メッセージ配信」で開封数・クリック数（クリック計測はLINE側の短縮URL経由。仕様は公式で要確認）
- 月次でチェックする3指標:
  1. 友だち追加数（純増。ブロック数も見る）
  2. 配信クリック率（クリック数 ÷ 配信数。10%超なら良好の目安）
  3. LINE経由セッション数とそこからのアフィリエイト発生（GA4のコンバージョン設定）

---

# 付録: 「行ったよ」レポートのMicroCMSセットアップ（5分・任意）

スポット詳細の「🙋 ここ行ったよ！」ボタンは実装済み。env未設定でも動作し件数はGA4
（`spot_visited_report`）で計測されるが、以下を設定すると投稿の保存→公開表示まで有効になる。

1. MicroCMS管理画面 → API作成 → **リスト形式** → エンドポイント名 `spot-reports`
2. フィールド定義（すべて必須にしない）:
   | フィールドID | 種類 |
   |---|---|
   | spotSlug | テキストフィールド |
   | spotName | テキストフィールド |
   | rating | 数値 |
   | comment | テキストフィールド |
   | ageRange | テキストフィールド |
3. 権限管理 → APIキー → 新規作成 → `spot-reports` の **POST のみ許可**
4. Vercel環境変数 `MICROCMS_REPORTS_API_KEY` に設定 → Redeploy
5. 投稿は**下書き**として届く → 管理画面で内容確認して「公開」にしたものだけが
   スポット詳細の「みんなの行ったよ」に表示される（荒らし対策の目視モデレーション）

## 参考ソース（2026年6月時点）

- 料金プラン公式: https://www.lycbiz.com/jp/service/line-official-account/plan/
- 開設マニュアル公式: https://www.lycbiz.com/jp/manual/OfficialAccountManager/new_account/
- アカウント作成入口: https://entry.line.biz/start/jp/
- 認証済アカウント公式: https://www.lycbiz.com/jp/service/line-official-account/verified-account/
- 2026年10月料金改定の解説（非公式）: https://note.com/fourglobe_uz/n/n4007bf310e1a
