# きょうのこ (kyounoko.jp)

子連れ外食・おでかけ情報メディア。Next.js (App Router) / Vercel / Cloudflare 経由。収益は AdSense が主、アフィリ（もしも楽天 > VC）が従。
このファイルは入口。中身の正本は下のポインタ先にあり、ここには複製しない。

## 最初に読む（作業の種類ごと）

| 作業 | 読むもの |
|---|---|
| 事業の現在地・進行中の判定・やらないと決めたこと | `~/.claude/company/divisions/kyounoko.md`（GMが毎週更新） |
| 記事を書く・書き換える | **`docs/writing-rules.md`**（捏造ガード。無かったせいで1,109本に同じ誤りが入った） |
| 既存記事を編集する | **`docs/experiments-active.md`**（凍結記事と対照群。判定日まで触らない。特に対照群） |
| SEOの判断（新規面・改稿・タイトル） | スキル `search-growth`（着手前ゲート）→ `.claude/skills/kyounoko-seo`（固有手順） |
| AI検索からの流入・robots・AIボット | スキル `geo-max`、`docs/bot-cost-defense.md` |

## 絶対に守ること

- **公式に記載がないものを「ある」とも「ない」とも書かない。** 体験談に金額・階数・貸出の有無・休館日・台数を書かない。「エリアに複数店舗あり」は公式店舗検索で引く。施設の在否は運営元公式で確認する（推測ドメインのNXDOMAINは閉館の証拠ではない）。
- **Vercelインフラ費ガード（社長指示・外すな）**: robots.txt／`middleware.ts`／CDN-Cache-Control／ISR・revalidate／クエリを持つ動的ルートを変えるときは、コミットメッセージに費用影響の見立てを書き、デプロイ後72時間以内に Usage 画面で実測突合する。コスト対策を外す変更は代替ガードを同じ変更に入れる。ボット遮断は列挙でなくデフォルト拒否＋許可リスト、Googlebot系は必ず除外。
- **AdSenseの枠は触らない**（AdSense:アフィリ = 10.6:1。カニバリしたら負け）。
- コミット・プッシュ・デプロイは明示的に頼まれたときだけ。

## 本番に出ない／変わらない罠

- 記事mdは `git push` では本番に出ない（ignore-build）。正規手順は `./scripts/deploy-md.sh`（= `npm run deploy:md`。`--archive=tgz`・ビルド15〜18分なのでバックグラウンド実行）。**`vercel --prod` は作業ツリーをそのまま出す**ので、デプロイ前に `git status` を見る。`.vercelignore` を消さない（CLIは `.gitignore` を読まない）。
- 記事・スポットの本文は **md／KV上書き／chain-facilities の3経路**。mdを直しても本番が変わらないときは `node scripts/kv-article-overrides.mjs --list`。スポット本文はKVが正で、override は消せない。
- CloudflareのCDN TTLは24時間。パージは**本番の `POST /api/admin/purge-cf` が唯一動く経路**（1回最大200パス。ローカルのCFトークンはゾーンを見られず `scripts/cf-purge.mjs`／`npm run cf:purge` は通らない。手順は memory `kyounoko-cf-purge-via-prod-api-2026-08-07`）。確認はCFを通らないVercelデプロイURLで。**デプロイ待ちのURLポーリングはしない**（CFが404をキャッシュする）。
- 301統合済みのslugで新記事を書くと到達不能になる（`lib/article-redirects.ts` を先に見る）。
- 作業前に `git fetch` して `origin/main` との関係を確認する（古いブランチで誤分析した前例）。
- devと本番でフォントが違う。折返しの確認は本番相当で。

## 計測

```bash
node scripts/gsc-report.mjs                 # 直近28日 vs 前28日
node scripts/seo-article-audit.mjs --days=90
node ~/.claude/skills/geo-max/scripts/ai-referrals.mjs --site=kyounoko   # AI経由流入（scripts/geo-ai-report.mjs は過小に出るので使わない）
```

GA4 は `--property=533628127` 必須。数字を報告する前に `~/.claude/skills/search-growth/references/measurement-traps.md` を通す。

## 検証スクリプト（記事を触ったら該当するものを回す）

`scripts/check-fabricated-claims.mjs` / `check-parking-claims.mjs` / `check-cross-article-facts.mjs` / `check-internal-links.mjs` / `check-affiliate-links.mjs`
