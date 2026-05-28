#!/usr/bin/env node
/**
 * アフィリエイトリンクの健全性チェッカー。
 *
 * lib/affiliate-products.ts と lib/items-catalog.ts の全 href を静的検査する。
 *  - ハードエラー（exit 1 / ビルド中断）:
 *      # / 空文字 / https:// で始まらない / 明らかに壊れた href
 *  - 警告（exit 0）:
 *      env が無いと収益化されない provider（rakuten はもしも経由、amazon はタグ）
 *
 * prebuild に組み込んであるため、壊れたアフィリンクが本番に出る前に検出できる。
 * 手動実行: node scripts/check-affiliate-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILES = ['lib/affiliate-products.ts', 'lib/items-catalog.ts'];

// データ行の `href: '...'` / `provider: '...'` だけを拾う（型定義は引用符が無いので拾わない）
const HREF_RE = /href:\s*'([^']*)'/g;
const PROVIDER_RE = /provider:\s*'([^']*)'/g;

const hardErrors = [];
const warnings = [];
let total = 0;
const providerCount = {};

for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    hardErrors.push(`${rel}: ファイルが見つかりません`);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');

  let m;
  while ((m = HREF_RE.exec(src)) !== null) {
    const href = (m[1] ?? '').trim();
    total++;
    if (!href || href === '#') {
      hardErrors.push(`${rel}: 空 または # の href → "${href}"`);
    } else if (!/^https:\/\//i.test(href)) {
      hardErrors.push(
        `${rel}: https:// で始まらない href → "${href.slice(0, 70)}"`,
      );
    } else {
      try {
        // URL としてパースできない文字列を弾く
        new URL(href);
      } catch {
        hardErrors.push(`${rel}: URL として不正 → "${href.slice(0, 70)}"`);
      }
    }
  }

  while ((m = PROVIDER_RE.exec(src)) !== null) {
    const p = m[1];
    providerCount[p] = (providerCount[p] || 0) + 1;
  }
}

// env 依存（リンクは動くが収益化されない）provider の警告
const hasMoshimo = Boolean(
  process.env.NEXT_PUBLIC_MOSHIMO_A_ID &&
    process.env.NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID &&
    process.env.NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID,
);
const hasMoshimoAmazon = Boolean(
  process.env.NEXT_PUBLIC_MOSHIMO_A_ID &&
    process.env.NEXT_PUBLIC_MOSHIMO_AMAZON_PC_ID &&
    process.env.NEXT_PUBLIC_MOSHIMO_AMAZON_PL_ID,
);
const hasAmazonTag = Boolean(process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG);
const hasAmazon = hasMoshimoAmazon || hasAmazonTag;

if ((providerCount.rakuten || 0) > 0 && !hasMoshimo) {
  warnings.push(
    `rakuten ${providerCount.rakuten}件: もしも経由の env（NEXT_PUBLIC_MOSHIMO_A_ID / RAKUTEN_PC_ID / RAKUTEN_PL_ID）が未設定 — リンクは遷移するが収益化されません`,
  );
}
if ((providerCount.amazon || 0) > 0 && !hasAmazon) {
  warnings.push(
    `amazon ${providerCount.amazon}件: もしも経由Amazon（NEXT_PUBLIC_MOSHIMO_AMAZON_PC_ID/PL_ID）または NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG のどちらも未設定 — リンクは遷移するが収益化されません`,
  );
}

// レポート出力
console.log(`[check-affiliate-links] href ${total}件を検査`);
console.log(
  `  provider内訳: ` +
    Object.entries(providerCount)
      .map(([k, v]) => `${k}=${v}`)
      .join(', '),
);
for (const w of warnings) console.warn(`  ⚠ ${w}`);

if (hardErrors.length > 0) {
  for (const e of hardErrors) console.error(`  ✗ ${e}`);
  console.error(
    `[check-affiliate-links] ${hardErrors.length}件のエラー — 壊れたアフィリンクがあります`,
  );
  process.exit(1);
}

console.log('[check-affiliate-links] ✓ 不正な href なし');
