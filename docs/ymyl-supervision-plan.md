# YMYL監修プラン（E-E-A-T強化）

> 0〜6歳サイトはYMYL領域。健康/安全/栄養/発達の記事は専門家監修が無いと検索評価が伸びにくく、誤情報は子の安全に直結する。
> 監修システムは実装済み（`lib/supervisors.ts` の SUPERVISORS に追加→記事frontmatter `supervisor: <id>` で反映、reviewedBy JSON-LDも自動出力）。**現状 監修者0人・YMYL該当168本が全て無監修。**

## コスト現実：全168本監修は¥50-84万。→ 優先順位で段階投資する。

## 監修者の採用（まずこの2名）
- **小児科医 1名**（発熱・予防接種・アレルギー・事故対応）— ココナラ等で¥3,000〜5,000/記事 or 月額監修
- **管理栄養士 1名**（離乳食・幼児食・栄養）— 同上
採用したら `lib/supervisors.ts` の SUPERVISORS に {id,name,qualification,bio,affiliation,url} を追加。

## 🔴 Tier1：医療・安全（最優先・13本）— 小児科医監修
誤情報が子の安全に直結。Googleが最も監修を要求する層。ここから着手。

- `9gatsu-yobosesshu-4sai-made-checklist`
- `child-seat-0-7sai-5brand`
- `child-seat-shinseiji-osusume-5sen-2026`
- `childseat-toritsuke`
- `kodomo-allergy-bien`
- `kodomo-allergy-hannou`
- `kodomo-hatsunetsu-byouin-iku-me`
- `kodomo-hatsunetsu-kyu-taisho`
- `kodomo-no-kaze-hatsunetsu-taiou`
- `kurasi-taisaku-kodomo-jidou-jiko`
- `shokumotsu-allergy-toha-kanzen-guide`
- `sozai-kodomo-daibutsu-yobou`
- `yobou-sesshu-schedule-0-6sai`

## 🟡 Tier2：栄養・発達・生活（次・29本）— 管理栄養士／専門家監修
- `1sai-hattatsu-kanzen-guide`
- `babyfood-toha-kanzen-guide`
- `babyfood-vs-tedukuri`
- `eiyou-bento-hoikuen-1week`
- `kodomo-asa-udon-tamagotoji-rinyuushoku-go`
- `kodomo-atopy-taisho`
- `kodomo-benpi-shokuji-kaizen`
- `kodomo-geri-tsuduku`
- `kodomo-gerizamu-moudiarrhea-taiou`
- `kodomo-outo-stop`
- `kodomo-outo-tomaranai`
- `kodomo-suiminji-mokuyasu`
- `kodomo-tofu-hamburger-rinyuushoku-otona`
- `kotoba-okureru-taiou-2sai`
- `mizuasobi-omocha-osusume-2026`
- `reitougyoza-plus-alpha-3pattern`
- `rinyuushoku-dekinai-kao-awanai-baby`
- `rinyuushoku-frozen-gekkabetsu`
- `rinyuushoku-mochikomi-chain-15`
- `rinyuushoku-mochikomi-ok-tokyo-15`
- `rinyuushoku-reitou`
- `rinyuushoku-shokuzai-takuhai-hikaku-2026`
- `rinyuushoku-toha-kanzen-guide`
- `sotsunyu-danyu-susumekata`
- `sotsunyu-toha-kanzen-guide`
- `tsukamaridachi-toha-kanzen-guide`
- `yonaki-taisaku-0-1sai`
- `yonaki-toha-kanzen-guide`
- `youjishoku-kanryouki-1week-rota`

## 🟢 Tier3：周辺YMYL（外食安全ガイド等・126本）
医療リスクは低め。監修より「一次情報・出典明記」で十分なものが多い。後回し可。

## 進め方
1. 小児科医を1名確保 → Tier1の上位10本（発熱・予防接種・アレルギー・事故）に `supervisor:` を設定
2. 反映後、該当記事に監修者名・資格・reviewedByが表示されることを本番で確認
3. 効果（順位）を見つつ Tier1残り→Tier2へ拡大
