# 流入ミックス突合 2026-08-12 〜 2026-09-08（28日・GSC遅延3日に合わせて同一期間）

GSC site=sc-domain:kyounoko.jp / GA4 property=533628127 / SA=kyounoko-readonly@kyounoko-website.iam.gserviceaccount.com

## 1. 突合（ここが本題）

| 指標 | 実数 |
|---|---:|
| GSC クリック | 55,508 |
| GSC 表示 | 1,190,703 |
| GA4 セッション（全体） | 73,555 |
| GA4 うち Organic Search | 70,336 |
| GA4 PV | 92,431 |
| PV / セッション | 1.26 |

- **GA4全体 ÷ GSCクリック = 1.33倍**
- **Organic Search ÷ GSCクリック = 1.27倍**

読み方: 後者が 1.0〜1.3 に収まっていれば、乖離の主因は「検索以外のチャネル」で健全。
後者が 2倍以上なら Organic Search の中身（Google以外の検索・自己参照・計測仕様）を疑う。

## 2. チャネル別

| チャネル | セッション | 構成比 | PV | PV/セッション |
|---|---:|---:|---:|---:|
| Organic Search | 70,336 | 95.6% | 87,984 | 1.25 |
| Direct | 1,570 | 2.1% | 2,277 | 1.45 |
| AI Assistant | 826 | 1.1% | 1,036 | 1.25 |
| Referral | 768 | 1.0% | 1,004 | 1.31 |
| Unassigned | 74 | 0.1% | 96 | 1.30 |
| Organic Social | 12 | 0.0% | 32 | 2.67 |
| Organic Shopping | 1 | 0.0% | 1 | 1.00 |
| Organic Video | 1 | 0.0% | 1 | 1.00 |

## 3. source / medium（上位40）

| source | medium | 種別 | セッション | PV/セッション |
|---|---|---|---:|---:|
| google | organic | 検索 | 52,218 | 1.25 |
| yahoo | organic | 検索 | 14,939 | 1.28 |
| bing | organic | 検索 | 2,207 | 1.20 |
| (direct) | (none) | 直接 | 1,570 | 1.45 |
| chatgpt.com | ai-assistant | AI | 788 | 1.24 |
| service.smt.docomo.ne.jp | referral | その他 | 678 | 1.26 |
| openai | organic | AI | 209 | 1.41 |
| duckduckgo | organic | 検索 | 107 | 1.39 |
| websearch.rakuten.co.jp | referral | その他 | 98 | 1.52 |
| ecosia.org | organic | 検索 | 57 | 1.07 |
| copilot.com | (not set) | AI | 28 | 1.29 |
| openai | (not set) | AI | 26 | 1.62 |
| search.google.com | referral | 検索 | 24 | 9.92 |
| search.fenrir-inc.com | referral | その他 | 23 | 1.04 |
| copilot.com | ai-assistant | AI | 19 | 1.11 |
| sp-search.jp | referral | その他 | 19 | 1.37 |
| gemini.google.com | ai-assistant | AI | 18 | 2.11 |
| blog.livedoor.jp | referral | その他 | 13 | 4.23 |
| search.portal.auone.jp | referral | その他 | 12 | 1.33 |
| (not set) | (not set) | その他 | 11 | 1.00 |
| portal.uqmobile.jp | referral | その他 | 9 | 1.33 |
| perplexity | (not set) | AI | 7 | 1.00 |
| line | richmenu | その他 | 5 | 5.00 |
| line | (not set) | その他 | 4 | 1.00 |
| preview.asoview.com | referral | その他 | 4 | 1.50 |
| teams.public.onecdn.static.microsoft | referral | その他 | 4 | 1.00 |
| cn.bing.com | referral | 検索 | 3 | 1.33 |
| gfoodd.com | referral | その他 | 3 | 1.00 |
| safe.menlosecurity.com | referral | その他 | 3 | 1.00 |
| chatgpt.com | (none) | AI | 2 | 0.00 |
| foodsokuhou.com | referral | その他 | 2 | 1.00 |
| line | greeting | その他 | 2 | 1.00 |
| startpage.com | referral | その他 | 2 | 1.00 |
| tw.search.yahoo.com | referral | 検索 | 2 | 2.00 |
| 104.21.20.151:6080 | referral | その他 | 1 | 1.00 |
| clipping-v1.clipmaster.jp | referral | その他 | 1 | 1.00 |
| etsy.com | referral | その他 | 1 | 1.00 |
| fmv.com | referral | その他 | 1 | 1.00 |
| ichiran.com | referral | その他 | 1 | 1.00 |
| ichiran.cybozu.com | referral | その他 | 1 | 2.00 |

### 種別の合計（上位40行の範囲）

| 種別 | セッション |
|---|---:|
| AI | 1,097 |
| 検索 | 69,557 |
| SNS | 0 |
| 直接 | 1,570 |
| その他 | 898 |

## 4. Direct の着地ページ（上位20）

Direct が多い場合、本当に指名で来ているのか、計測漏れ（リファラ落ち）か、
内部遷移の計上かをここで見分ける。記事URLが並ぶなら「リファラ落ちした検索/AI流入」の可能性が高い。

| 着地ページ | セッション |
|---|---:|
| / | 98 |
| /article/tokyo-kodomo-mushiyoke-spot | 30 |
| /article/hoshino-morning-kosodate | 29 |
| /article/ohsho-kids-menu | 24 |
| /article/kurasushi-kids-menu | 22 |
| (not set) | 19 |
| /article/kodzure-famires-15sen | 16 |
| /article/shitsunai-asobi-shibuya-tokyo | 16 |
| /article/sushiro-kids-menu | 16 |
| /article/babycar-osusume-2026-15model-hikaku | 14 |
| /article/mcdonalds-tsukimi | 14 |
| /article/sukesan-udon-kodzure-koryaku | 14 |
| /category/today-doko | 14 |
| /article/babycar-ranking-2026 | 13 |
| /spot/Gateway-Park-fn5c | 12 |
| /spots | 12 |
| /article/mizuasobi-kawasaki | 10 |
| /article/saizeriya-kids-menu | 10 |
| /article/bikkuri-donkey-kids-menu | 9 |
| /article/kfc-kids-menu | 9 |

## 5. 次の判断

- Organic Search ≒ GSCクリック なら、伸ばす対象は「検索クリック」で正しい（戦略どおり）
- AI が数千セッション規模なら、GEO（llms.txt・構造化・一次データ）の優先度を上げる
- Direct が過半で着地が記事URLなら、まず計測を直す（施策の効果測定が全部ずれる）
