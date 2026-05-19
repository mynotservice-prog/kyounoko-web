# Admin編集機能 セットアップ（スマホからの本番反映つき）

`/admin/articles` `/admin/plans` の各記事/プランカードにある **「✏️ 編集」** から、フロントマターと本文を編集できます。スマホでも快適に編集できるよう、フォントサイズ16px+、保存ボタンは画面下部に固定。

## 動作モード

| 環境 | 保存先 | 反映タイミング |
|---|---|---|
| ローカル `npm run dev` | `content/*.md` 直接書込 | `git push` → Vercel自動デプロイ |
| 本番（Vercel） + GitHub設定済み | GitHub Contents API で **直接 commit** | Vercel自動デプロイ（1〜3分） |

→ **本番＋GitHub設定モードがスマホ運用のキモ**。タップで commit され、自動的に本番反映されます。

## 本番モードのセットアップ（一度だけ・5分）

### 1. GitHub Fine-grained Personal Access Token を発行

1. https://github.com/settings/personal-access-tokens/new を開く
2. **Token name**: `kyounoko-admin-editor`
3. **Expiration**: 1年（運用に合わせて）
4. **Repository access**: 「Only select repositories」→ `kyounoko-web` を選択
5. **Permissions** → **Repository permissions**:
   - **Contents**: **Read and write**
   - **Metadata**: **Read-only**（必須）
6. 「Generate token」→ 出てきたトークン文字列をコピー（`github_pat_...` で始まる）

### 2. Vercel に環境変数を追加

https://vercel.com/ → kyounoko-web → Settings → Environment Variables で以下を追加（Production / Preview / Development すべてにチェック）。

| Key | Value |
|---|---|
| `ALLOW_ADMIN_EDIT` | `1` |
| `GITHUB_TOKEN` | `github_pat_...`（上で取得したトークン） |
| `GITHUB_REPO` | `<owner>/kyounoko-web`（例: `nagamy/kyounoko-web`） |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_AUTHOR_NAME` | `ながみー`（任意、commit著者名） |
| `GITHUB_AUTHOR_EMAIL` | `service@kyounoko.jp`（任意） |

保存後、最新デプロイの「Redeploy」を実行して環境変数を反映。

### 3. スマホで動作確認

1. スマホで https://kyounoko.jp/admin/articles を開く
2. 任意の記事カードの「✏️ 編集」をタップ
3. 上部に「**GitHub直接編集モード**」と表示されることを確認
4. タイトルやmetaを軽く編集して「💾 保存して反映」
5. 緑色のメッセージで `commit: xxxxxxx` と表示されればOK
6. 「commitを見る↗」リンクで GitHub の差分を確認できる
7. 1〜3分後 https://kyounoko.jp/article/<slug> で反映確認

## トラブルシュート

| 症状 | 原因と対処 |
|---|---|
| 「admin edit disabled」 | `ALLOW_ADMIN_EDIT=1` が未設定 |
| 「invalid referer」 | `/admin/` 経由でアクセスしていない（CSRFガード） |
| 「GitHub PUT failed: 401」 | トークンが無効・期限切れ |
| 「GitHub PUT failed: 404」 | `GITHUB_REPO` が `owner/repo` 形式になっていない |
| 「GitHub PUT failed: 422」 | `sha` 不一致（誰かが先に変更した） → 一度リロードして再保存 |
| ローカルで編集後 push し忘れ | ローカル `git status` で content/*.md の変更を確認、commit & push |

## セキュリティ注意

- **トークンは GitHub Contents の read/write 専用**。他の権限は付けない。
- **Repository は kyounoko-web のみ**。他リポジトリへのアクセス権は与えない。
- 万一漏れたら https://github.com/settings/tokens で即 revoke。
- `/admin/*` は noindex 済みなので公開検索からは見つからない。それでもURL推測されないよう、社内/個人運用に留める。

## スマホ運用フロー（理想）

1. 通勤中などに記事のtypoを発見
2. スマホで https://kyounoko.jp/admin/articles を開く
3. 該当記事の「✏️ 編集」タップ
4. 該当箇所を直して「💾 保存して反映」タップ
5. 1〜3分後、本番に反映済み

ローカルPCを開く必要なし。Claude/私への依頼も不要。
