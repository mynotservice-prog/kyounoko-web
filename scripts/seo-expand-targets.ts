// 勝ちページ深掘りの対象選定をGSC実データで行う。
//
// 目的: 量産せずに既存の当たりページを拡充するため、
//   (1) 流入上位ページ（=勝ちページ）を抽出
//   (2) 各ページが「表示は多いのにCTRが低い / 8〜20位で取りこぼしている」クエリを特定
//   (3) 記事拡充で拾うべきクエリの具体リストを docs に出力
//
// 実行: npx tsx scripts/seo-expand-targets.ts
//   env は @next/env で .env.production.local 等から読み込む（複数行JSON対応）。
//   `vercel env pull .env.production.local --environment=production` で取得済みを想定。
//   GSC認証が無い環境では未設定と表示して終了。秘密情報は一切出力しない。
//
// 必要env: SEARCH_CONSOLE_SITE_URL, GOOGLE_APPLICATION_CREDENTIALS_JSON
import { writeFileSync } from 'node:fs';
import { loadEnvConfig } from '@next/env';

// search-console.ts は module-load 時に process.env を読むため、import より前に env をロードする。
loadEnvConfig(process.cwd(), false); // dev=false → .env.production.local を読む（同期）

type ScModule = typeof import('@/lib/search-console');
let sc: ScModule;

const DAYS = 90; // 開設間もないので28日より90日で母数を確保
const TOP_PAGE_LIMIT = 30; // 深掘り対象の上限
const PER_PAGE_QUERY_LIMIT = 50;

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

async function main() {
  sc = await import('@/lib/search-console');
  if (!sc.isSearchConsoleConfigured()) {
    console.log('GSC_NOT_CONFIGURED');
    console.log('SITE_URL set:', Boolean(process.env.SEARCH_CONSOLE_SITE_URL));
    console.log('CREDS set:', Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON));
    process.exit(0);
  }

  console.log(`[seo-expand] fetching top ${TOP_PAGE_LIMIT} pages over ${DAYS}d...`);
  const topPages = (await sc.getTopPages(DAYS, 200)).slice(0, TOP_PAGE_LIMIT);
  if (topPages.length === 0) {
    console.log('GSC returned 0 pages (credentials valid but no data?).');
    process.exit(0);
  }

  const lines: string[] = [];
  lines.push('# 勝ちページ拡充ターゲット（GSC実データ駆動）');
  lines.push('');
  lines.push(`生成日時(UTC): ${fmtDate(new Date())} / 集計期間: 直近${DAYS}日`);
  lines.push('');
  lines.push('凡例: **CTR機会** = 表示100+・CTR≤5%・20位以内（タイトル/見出し改善で取れる）/ ');
  lines.push('**押し上げ** = 8〜20位・表示50+（本文拡充で1ページ目に入れる）');
  lines.push('');

  const summary: { page: string; clicks: number; impr: number; ctr: number; pos: number; ctrOpp: number; push: number }[] = [];

  for (const p of topPages) {
    const page = p.keys[0];
    const queries = await sc.getQueriesForPage(page, DAYS, PER_PAGE_QUERY_LIMIT);
    const ctrOpp = sc.findCtrOpportunities(queries, { minImpressions: 50, maxCtr: 0.05, maxPosition: 20 });
    const push = sc.findPushUpCandidates(queries);

    summary.push({
      page,
      clicks: p.clicks,
      impr: p.impressions,
      ctr: p.ctr,
      pos: p.position,
      ctrOpp: ctrOpp.length,
      push: push.length,
    });

    lines.push(`## ${page.replace(/^https?:\/\/[^/]+/, '')}`);
    lines.push(`- ページ計: clicks=${p.clicks} / impr=${p.impressions} / CTR=${pct(p.ctr)} / 平均順位=${p.position.toFixed(1)}`);

    if (push.length > 0) {
      lines.push('');
      lines.push('### 🔼 押し上げ候補（8〜20位 → 本文拡充で1ページ目へ）');
      lines.push('| クエリ | impr | CTR | 順位 |');
      lines.push('|---|---:|---:|---:|');
      for (const r of push.slice(0, 12)) {
        lines.push(`| ${r.keys[0]} | ${r.impressions} | ${pct(r.ctr)} | ${r.position.toFixed(1)} |`);
      }
    }

    if (ctrOpp.length > 0) {
      lines.push('');
      lines.push('### 🎯 CTR機会（表示多・CTR低 → タイトル/見出し/メタ改善）');
      lines.push('| クエリ | impr | CTR | 順位 |');
      lines.push('|---|---:|---:|---:|');
      for (const r of ctrOpp.slice(0, 12)) {
        lines.push(`| ${r.keys[0]} | ${r.impressions} | ${pct(r.ctr)} | ${r.position.toFixed(1)} |`);
      }
    }
    lines.push('');
  }

  // 優先順位サマリ: 押し上げ+CTR機会の合計が多い順
  summary.sort((a, b) => (b.push + b.ctrOpp) - (a.push + a.ctrOpp));
  const head: string[] = [];
  head.push('## 拡充優先度ランキング（取りこぼしクエリ数順）');
  head.push('');
  head.push('| # | ページ | clicks | impr | 押上候補 | CTR機会 |');
  head.push('|---:|---|---:|---:|---:|---:|');
  summary.forEach((s, i) => {
    head.push(`| ${i + 1} | ${s.page.replace(/^https?:\/\/[^/]+/, '')} | ${s.clicks} | ${s.impr} | ${s.push} | ${s.ctrOpp} |`);
  });
  head.push('');

  const out = [lines[0], lines[1], lines[2], lines[3], lines[4], lines[5], lines[6], '', ...head, '---', '', ...lines.slice(7)].join('\n');
  const outPath = 'docs/seo-expand-targets.md';
  writeFileSync(outPath, out, 'utf8');
  console.log(`[seo-expand] wrote ${outPath} (${summary.length} pages analyzed)`);
  console.log('\nTop 10 by missed-query count:');
  summary.slice(0, 10).forEach((s, i) => {
    console.log(`${i + 1}. ${s.page.replace(/^https?:\/\/[^/]+/, '')}  clicks=${s.clicks} push=${s.push} ctrOpp=${s.ctrOpp}`);
  });
}

main().catch((e) => {
  console.error('[seo-expand] error:', e instanceof Error ? e.message : e);
  process.exit(1);
});
