# 新設コホート（チェーン攻略112本＋水族館・動物園ガイド25本）の判定計画

登録: 2026-09-26（社長裁可「判定日11/24でYES」「公開ペース上限（月60〜80本）を守る」）。
このファイルが判定の正本。判定日まで条件を書き換えない。

## 対象

- **A群 112本**（2026-09-25 公開・PR #266〜#270）: 子連れ攻略 99本・子ども料金 9本・離乳食持ち込み 4本
- **B群 25本**（2026-09-26 公開・PR #271）: 水族館・動物園の子連れガイド

slug 一覧は末尾。公開時点で noindex は0本。

## 判定

- **判定日: 2026-11-24**（A群の公開から60日）
- **窓**: GSC（final）2026-11-14(土)〜11-20(金) の7日。page 次元でこの137URLだけを集計する。
- **成功条件（2026-09-26 社長裁可）**: 137本のうち**表示のある記事が69本以上**、**かつ** 137本合計の**クリックが週500以上**。
- **不合格時の行動**: この2つの型（チェーン攻略の長尾横展開、施設ガイドの追加）の新規追加をやめる。
- **合否にかかわらず併記するもの**: A群・B群それぞれの「表示のある本数」「週クリック」「1本あたり週クリックの中央値」。既存の子連れ攻略（公開60日超）の1本あたり週クリックは p25=4.9／p50=15.5（2026-09-26 集計）なので、群ごとにこれと比べる。
- 期待値の目安（事前）: A群は既存と同じ分布なら週+500〜1,500クリック。B群は既存ページ経由でこの25施設名の表示が90日で約5,000回あった（主に7〜10位）ので、立ち上がれば月数百クリックから。

## 運用ルール（判定日まで）

- **凍結はしない。** 事実誤りの修正と、公式の変更への追従は行ってよい。
- ただし**改題・統合・noindex・大幅な改稿はしない**。やむを得ず行ったら `docs/experiments-active.md` の「汚染の記録」に書き、判定時にその記事を分母から外す。
- **公開ペース**: 9月はこの2日で上限を超えたため、**11/24 の判定までこの2つの型の新規追加はしない**。
- 交絡として判定文に書くもの: Q4の季節性、10/05〜10/21 の各判定後の処置、2026-09-26 に B群6本へ入れた言い回しの修正（`hakkeijima` `ichihara` `kobe` `maxell` `oarai` の断定を公式の表現に合わせた・`inokashira` のトップ画像差し替え）。

## 取得方法

```bash
# GSC page 次元（final）。URL は https://kyounoko.jp/article/<slug>
node scripts/gsc-report.mjs --days=7 --json=/tmp/gsc7.json   # 目安。判定は下の137URLで page フィルタして集計する
```

## slug 一覧

### A群（112本）
- 551-horai-kodzure-koryaku
- aiya-kodzure-koryaku
- akiyoshi-kodzure-koryaku
- aw-okinawa-kodzure-koryaku
- bannai-kodzure-koryaku
- benitora-gyozabo-kodzure-koryaku
- botejyu-kodzure-koryaku
- capricciosa-kodzure-koryaku
- chibo-kodzure-koryaku
- coffeekan-kodzure-koryaku
- daiki-suisan-kodzure-koryaku
- daishogun-kodzure-koryaku
- dengana-kodzure-koryaku
- dohtonbori-kodzure-koryaku
- domdom-hamburger-kodzure-koryaku
- excelsior-caffe-kodzure-koryaku
- fujiya-restaurant-kodzure-koryaku
- furaibou-kodzure-koryaku
- gindaco-kodzure-koryaku
- gogo-curry-kodzure-koryaku
- gyoza-no-mansyu-kodzure-koryaku
- gyushige-kodzure-koryaku
- gyutan-rikyu-kodzure-koryaku
- hachiban-ramen-kodzure-koryaku
- hamakatsu-kodzure-koryaku
- heijoen-kodzure-koryaku
- heiroku-sushi-kodzure-koryaku
- hinoya-curry-kodzure-koryaku
- ichikakuya-kodzure-koryaku
- ikinari-steak-kodzure-koryaku
- ippudo-kodzure-koryaku
- isomaru-suisan-kodzure-koryaku
- jojoen-kodzure-koryaku
- jolly-pasta-kodzure-koryaku
- joyfull-kodzure-koryaku
- jujukarubi-kodomo-ryokin
- jujukarubi-kodzure-koryaku
- jukusei-yakiniku-ichiban-kodomo-ryokin
- jukusei-yakiniku-ichiban-kodzure-koryaku
- kairikiya-kodzure-koryaku
- kaitenzushi-misaki-kodzure-koryaku
- kamakura-pasta-kodzure-koryaku
- kamimura-bokujo-kodomo-ryokin
- kamimura-bokujo-kodzure-koryaku
- kanazawa-maimon-sushi-kodzure-koryaku
- karayama-kodzure-koryaku
- katsuya-kodzure-koryaku
- kineya-kodzure-koryaku
- komoro-soba-kodzure-koryaku
- kourakuen-rinyushoku-mochikomi
- krispy-kreme-kodzure-koryaku
- kuidon-kodzure-koryaku
- kurashiki-coffee-kodzure-koryaku
- kushiya-monogatari-kodomo-ryokin
- kushiya-monogatari-kodzure-koryaku
- lucky-pierrot-kodzure-koryaku
- machikadoya-kodzure-koryaku
- makino-udon-kodzure-koryaku
- marugenramen-rinyushoku-mochikomi
- matsunoya-kodzure-koryaku
- miraizaka-kodzure-koryaku
- motomachi-coffee-kodzure-koryaku
- moukotanmen-nakamoto-kodzure-koryaku
- my-curry-shokudo-kodzure-koryaku
- negishi-kodzure-koryaku
- nemuro-hanamaru-kodzure-koryaku
- nikusho-sakai-kodzure-koryaku
- one-karubi-kodomo-ryokin
- one-karubi-kodzure-koryaku
- osaka-ohsho-kodzure-koryaku
- pietro-kodzure-koryaku
- popolamama-kodzure-koryaku
- pronto-kodzure-koryaku
- rairaitei-kodzure-koryaku
- sekai-no-yamachan-kodzure-koryaku
- shabusai-kodomo-ryokin
- shabusai-kodzure-koryaku
- shabuyou-rinyushoku-mochikomi
- shakeys-kodzure-koryaku
- shichirinbo-kodzure-koryaku
- shinjuku-saboten-kodzure-koryaku
- steak-miya-kodomo-ryokin
- steak-no-don-kodzure-koryaku
- subway-kodzure-koryaku
- sugakiya-kodzure-koryaku
- sutadonya-kodzure-koryaku
- sutamina-taro-kodomo-ryokin
- sutamina-taro-kodzure-koryaku
- sweets-paradise-kodomo-ryokin
- sweets-paradise-kodzure-koryaku
- takakuramachi-coffee-kodzure-koryaku
- tempura-makino-kodzure-koryaku
- tonkatsu-wako-kodzure-koryaku
- torimero-kodzure-koryaku
- toriton-kodzure-koryaku
- totomaru-kodzure-koryaku
- tsubakiya-coffee-kodzure-koryaku
- tsukada-nojo-kodzure-koryaku
- udon-west-kodzure-koryaku
- volks-kodzure-koryaku
- wendys-first-kitchen-kodzure-koryaku
- yabaton-kodzure-koryaku
- yakiniku-anan-kodzure-koryaku
- yakiniku-like-kodzure-koryaku
- yakiniku-nabeshima-kodzure-koryaku
- yakiniku-watami-kodzure-koryaku
- yamaokaya-kodzure-koryaku
- yappari-steak-kodzure-koryaku
- yomenya-goemon-kodzure-koryaku
- yudetaro-kodzure-koryaku
- yuzuan-rinyushoku-mochikomi
- zundouya-kodzure-koryaku

### B群（25本）
- adventure-world-kosodate
- asahiyama-zoo-kosodate
- edogawa-shizen-doubutsuen-kosodate
- enoshima-aquarium-kosodate
- hakkeijima-sea-paradise-kosodate
- hamura-zoo-kosodate
- higashiyama-zoo-kosodate
- ichihara-zounokuni-kosodate
- inokashira-shizen-bunkaen-kosodate
- kaiyukan-kosodate
- kanazawa-zoo-kosodate
- kobe-animal-kingdom-kosodate
- kyoto-aquarium-kosodate
- maxell-aquapark-shinagawa-kosodate
- nagoya-aquarium-kosodate
- nasu-doubutsu-oukoku-kosodate
- nogeyama-zoo-kosodate
- notojima-aquarium-kosodate
- oarai-aquaworld-kosodate
- sumida-aquarium-kosodate
- sunshine-aquarium-kosodate
- tama-zoo-kosodate
- tennoji-zoo-kosodate
- yumemigasaki-zoo-kosodate
- zoorasia-kosodate
