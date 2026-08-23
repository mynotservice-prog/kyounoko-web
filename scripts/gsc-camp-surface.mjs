/**
 * 子連れキャンプ場・宿泊面（2026-08-23 新設 camp- / stay- 記事）の効果検証。
 *
 *   node scripts/gsc-camp-surface.mjs [--days=28]
 *
 * 見るもの（判定は固有名詞×設備クエリの順位とCTR。概要型・金額型はAIOに取られるため主指標にしない）:
 *   1. ページ別: 表示/クリック/平均順位（camp-*, stay-* のみ）
 *   2. クエリ別 上位30: 施設名を含むクエリの順位分布
 * 基準線（着手前 2026-07-25〜08-22）: キャンプ 4imp / グランピング 0 / 宿泊系 36imp。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, readdirSync } from 'fs';
const days = Number((process.argv.find(a=>a.startsWith('--days='))||'--days=28').split('=')[1]);
const creds = JSON.parse(readFileSync('./credentials/google-indexing.json','utf-8'));
const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
const { token } = await jwt.getAccessToken();
const end = new Date(); const start = new Date(end.getTime() - days*86400000);
const fmt = d => d.toISOString().slice(0,10);
const slugs = readdirSync('./content/articles').filter(f=>/^(camp|stay)-.*\.md$/.test(f)).map(f=>f.replace(/\.md$/,''));
async function q(body){
  const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:kyounoko.jp')}/searchAnalytics/query`,
    { method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dataState:'all', rowLimit:5000, ...body }) });
  return (await r.json()).rows || [];
}
const pages = await q({ dimensions:['page'], dimensionFilterGroups:[{ filters:[{ dimension:'page', operator:'includingRegex', expression:'/article/(camp|stay)-' }] }] });
const tot = pages.reduce((a,r)=>({ i:a.i+r.impressions, c:a.c+r.clicks }),{ i:0,c:0 });
console.log(`■ 面合計 (${fmt(start)}〜${fmt(end)}): 記事${slugs.length}本 / 表示${tot.i} / クリック${tot.c} / 表示あり${pages.length}本`);
pages.sort((a,b)=>b.impressions-a.impressions).forEach(r=>console.log(`  ${String(r.impressions).padStart(5)}imp ${String(r.clicks).padStart(3)}clk ${r.position.toFixed(1).padStart(5)}位 ${r.keys[0].replace('https://kyounoko.jp/article/','')}`));
const queries = await q({ dimensions:['query','page'], dimensionFilterGroups:[{ filters:[{ dimension:'page', operator:'includingRegex', expression:'/article/(camp|stay)-' }] }] });
console.log(`\n■ クエリ上位30（${queries.length}クエリ）`);
queries.sort((a,b)=>b.impressions-a.impressions).slice(0,30).forEach(r=>console.log(`  ${String(r.impressions).padStart(5)}imp ${String(r.clicks).padStart(3)}clk ${r.position.toFixed(0).padStart(3)}位 「${r.keys[0]}」 → ${r.keys[1].replace('https://kyounoko.jp/article/','')}`));
const top10 = queries.filter(r=>r.position<=10).length, top20 = queries.filter(r=>r.position<=20).length;
console.log(`\n■ 順位分布: 10位以内 ${top10} / 11〜20位 ${top20-top10} / 21位以下 ${queries.length-top20}`);
