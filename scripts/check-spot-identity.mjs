#!/usr/bin/env node
/**
 * 上書き（lib/spot-overrides.json）で name を変えている枠を全部出し、
 * 「同じ施設の表記違い」と確認済みのもの・差し替え枠として名寄せ済みのもの以外があれば失敗する。
 *
 * なぜ: name を変える上書きが別の施設への差し替えだと、SPOTS を直接読む一覧・「今日の流れ」が
 * 元の施設名で案内する（lib/spots.ts 末尾「差し替え枠の名寄せ」）。
 *
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-spot-identity.mjs   （Node 24）
 *
 * 新しく出たら、同じ施設なら下の SAME_FACILITY に slug を足す。別の施設なら
 * lib/spots.ts の IDENTITY_SWAP_EXTRA_SLUGS に足す（市区町村も変えていれば自動で入る）。
 */
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sp = await import(path.join(ROOT, 'lib/spots.ts'));
const { BUNDLED_SPOT_OVERRIDES } = await import(path.join(ROOT, 'lib/spot-overrides.ts'));

// 2026-10-08 に1件ずつ見て「同じ施設の表記違い・タイトル整形」と確認した枠
const SAME_FACILITY = new Set([
  "-4fto", // 二子玉川ライズ・ショッピングセンター → 二子玉川ライズ
  "-iw08", // 麻布台ヒルズ → 麻布台ヒルズ
  "IKEA-Tokyo-Bay-br0b", // IKEA Tokyo-Bay（船橋） → IKEA Tokyo-Bay（船橋）
  "-r3xz", // 日本橋三越本店 → 日本橋三越本店
  "-k8xz", // 渋谷スクランブルスクエア → 渋谷スクランブルスクエア
  "-7573", // 東京ミッドタウン（六本木） → 東京ミッドタウン六本木
  "-o76e", // 東京ミッドタウン日比谷 → 東京ミッドタウン日比谷
  "-cy8p", // ダイバーシティ東京プラザ → ダイバーシティ東京プラザ
  "-mjpp", // グランベリーパーク（南町田） → 南町田グランベリーパーク
  "-5rxm", // 東京ソラマチ → 東京ソラマチ
  "-l907", // ららぽーと立川立飛 → ららぽーと立川立飛
  "-dcg2", // ららテラス武蔵小杉 → ららテラス武蔵小杉
  "-53zt", // 吉祥寺アトレ・キラリナ京王吉祥寺 → キラリナ京王吉祥寺
  "-uxp3", // ルミネ町田 → ルミネ町田
  "-diob", // キドキドよみうりランド店 → キドキド よみうりランド店
  "-2wza", // カワスイ 川崎水族館 → カワスイ　川崎水族館
  "-xur8", // 東京スカイツリー展望デッキ → 東京スカイツリー®
  "-j3uv", // 昭和記念公園 こどもの森レインボーハンモック → 昭和記念公園 こどもの森
  "-huf2", // 東京競馬場（パドックひろば） → 東京競馬場 馬場内エリア
  "-irhu", // 舎人公園 じゃぶじゃぶ池（浮球の池） → 舎人公園じゃぶじゃぶ池「浮球の池」
  "-mdr8", // 鹿児島県立吉野公園 → オアシスケア吉野公園
  "-51de", // 鹿児島ふれあいスポーツランド → フレッシュ青果スポーツランド
]);

const rows = [];
for (const [area, list] of Object.entries(sp.SPOTS)) {
  for (const s of list ?? []) {
    const slug = sp.spotToSlug(s, area);
    const ov = BUNDLED_SPOT_OVERRIDES[slug];
    if (!ov?.name) continue;
    const swapped = sp.IDENTITY_SWAP_SLUGS.has(slug);
    if (swapped) {
      if (s.name !== ov.name) rows.push(`NG 名寄せ漏れ ${slug}: 素データ「${s.name}」/ 上書き「${ov.name}」`);
      continue;
    }
    if (ov.name !== s.name && !SAME_FACILITY.has(slug)) rows.push(`NG 未確認の改名 ${slug}: 「${s.name}」→「${ov.name}」`);
  }
}
console.log(`差し替え枠 ${sp.IDENTITY_SWAP_SLUGS.size}件 / 同じ施設と確認済みの改名 ${SAME_FACILITY.size}件`);
if (rows.length) {
  console.error(rows.join('\n'));
  process.exit(1);
}
console.log('OK: 別の施設名で案内される枠はありません');
