#!/usr/bin/env node
/**
 * D-3 thin掃除 第1バッチ: today-mawasu × クリック0 の薄記事に noindex: true を付与。
 * 可逆（AdSense承認後に外して再index可能）。COO承認後にのみ --apply で実行。
 * 既定は dry-run（差分プレビューのみ・書き込みなし）。
 *   node scripts/_thin-noindex-batch1.mjs           # dry-run（差分表示）
 *   node scripts/_thin-noindex-batch1.mjs --apply   # 実書き込み（COO承認後）
 */
import fs from 'node:fs';
import path from 'node:path';
const APPLY = process.argv.includes('--apply');
const DIR = path.resolve('content/articles');

// 第1バッチ: mawasu×click0 薄記事の薄い順50本のうち、
// 需要顕在（impr>=80/28d）で加筆に回す3本を除いた47本。
const SLUGS = [
  'kodomo-smartphone-itsukara','kodomo-kami-kirikata','kodomo-hitoride-nerenai','kodomo-tsume-kirikata',
  'kodomo-shashin-kotsu','kodomo-bento-tsumekata','kodomo-omorashi-gakkou','kodomo-kyuni-kowagaru',
  'kodomo-mono-kowashita','kodomo-akumu-tsuduku','hana-suiki-tsukaikata','kodomo-taionkei-tsukaikata',
  'kodomo-geri-tsuduku','kodomo-hanaji-tomaranai','kodomo-teashikuchi-taisho','kodomo-sashimi-itsukara',
  'gw-0-6sai-sugoshikata','kodomo-strider-itsukara','omutsu-kaekata','kodomo-zensoku-sign',
  'kodomo-seki-tomaranai','kodomo-hojorin-nashi-itsukara','kodomo-outo-tomaranai','baby-oil-tsukaikata',
  'kodomo-rs-shoujou','kodomo-kafunsho-taisho','kodomo-tsuresari-taisaku','kodomo-chujien-sign',
  'kodomo-adeno-shoujou','kodomo-asa-kigen-warui','kodomo-toppatsu-taisho','kodomo-atopy-taisho',
  'kodomo-hayagui-kaizen','kodomo-ijime-sign','kodomo-tsume-kamu','kodomo-tomodachi-tataita',
  'baby-rucksack-erabikata','kodomo-mizubousou-taisho','kodomo-arerugi-bien','kodomo-allergy-hannou',
  'obon-0-6sai-sugoshikata','nenmatsu-nenshi-0-6sai','kodomo-nebote-okiru','aki-2sai-sugoshikata',
  'aki-3-6sai-sugoshikata','aki-1sai-sugoshikata','kodomo-kigae-iyagaru',
];

let ok = 0, already = 0, missing = [], notMawasu = [], hasClicks = [];
for (const slug of SLUGS) {
  const fp = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) { missing.push(slug); continue; }
  let raw = fs.readFileSync(fp, 'utf8');
  // 安全ガード: カテゴリがtoday-mawasu以外なら中断
  if (!/^category:\s*today-mawasu\s*$/m.test(raw)) { notMawasu.push(slug); continue; }
  if (/^noindex:\s*true/m.test(raw)) { already++; continue; }
  const before = raw.split('\n').slice(0, 3);
  raw = raw.replace(/^---\n/, '---\nnoindex: true\n');
  const after = raw.split('\n').slice(0, 4);
  if (!APPLY) {
    console.log(`--- content/articles/${slug}.md`);
    before.forEach((l) => console.log(`  ${l}`));
    console.log(`+ noindex: true`);
    console.log('');
  } else {
    fs.writeFileSync(fp, raw);
  }
  ok++;
}
console.log(`\n${APPLY ? 'APPLIED' : 'DRY-RUN'}: noindex付与=${ok}  既存noindex=${already}  対象=${SLUGS.length}`);
if (missing.length) console.log('見つからない:', missing.join(', '));
if (notMawasu.length) console.log('!! mawasu以外(中断):', notMawasu.join(', '));
