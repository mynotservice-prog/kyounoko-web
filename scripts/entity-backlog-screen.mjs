#!/usr/bin/env node
/**
 * 固有名詞バックログ選別
 *
 * 候補ごとに調達型/単答型のCTRを出し、着手可否を判定する。
 * 結果の解釈と着手順は docs/entity-target-backlog-2026-08.md を正本とする。
 *
 * 使い方（Node 24 が必要）:
 *   ~/.nvm/versions/node/v24.14.0/bin/node --import ./scripts/_ts-resolve.mjs scripts/entity-backlog-screen.mjs
 *
 * 重要: 表示数の大きさで優先度を決めない。単答型（何時まで/いくら）はAIOが完答するため
 * 順位を上げてもクリックにならない。調達型（キッズメニュー/授乳室/子連れ）の表示で選ぶ。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, readdirSync } from 'fs';
import { getAllSpotsWithSlug } from '../lib/spots.ts';
const creds=JSON.parse(readFileSync('./credentials/google-indexing.json','utf-8'));
const jwt=new JWT({email:creds.client_email,key:creds.private_key,scopes:['https://www.googleapis.com/auth/webmasters.readonly']});
const {token}=await jwt.getAccessToken();
async function q(w){const r=await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:kyounoko.jp')}/searchAnalytics/query`,
 {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  body:JSON.stringify({startDate:'2026-07-18',endDate:'2026-08-15',dataState:'all',dimensions:['query'],rowLimit:25000,
   dimensionFilterGroups:[{filters:[{dimension:'query',operator:'contains',expression:w}]}]})});
 const j=await r.json(); return j.rows||[];}

// 意図の型で分ける: 調達型=勝てる / 単答型=AIOに食われる
const PROCURE = /キッズ|お子様|子供メニュー|子どもメニュー|離乳食|ベビーチェア|授乳室|おむつ|個室|ベビーカー|持ち込み|子連れ|遊び場|じゃぶじゃぶ|水遊び|プール/;
const ONEANSWER = /何時|いつまで|いつから|時間|値段|料金|いくら|何歳/;

const CANDS = ['星乃珈琲','コメダ','バーガーキング','やよい軒','はなまるうどん','資さんうどん','coco壱','CoCo壱','鳥貴族','一蘭','ほっともっと','丸亀製麺','餃子の王将',
  'じゃぶじゃぶ池','駒沢公園','昭和記念公園','夢見が丘','軽井沢','高輪ゲートウェイ'];

const articles = readdirSync('content/articles');
const spots = getAllSpotsWithSlug().map(s=>s.spot.name);

console.log('候補'.padEnd(16), '表示'.padStart(7), 'clk'.padStart(6), 'CTR'.padStart(7), '順位'.padStart(6), ' 調達型imp/CTR      単答型imp/CTR    既存資産');
for (const c of CANDS) {
  const rows = await q(c);
  if (!rows.length) { console.log(`${c.padEnd(16)}  —`); continue; }
  const S = a => a.reduce((x,r)=>({c:x.c+r.clicks,i:x.i+r.impressions}),{c:0,i:0});
  const all=S(rows);
  const pro=S(rows.filter(r=>PROCURE.test(r.keys[0])));
  const one=S(rows.filter(r=>ONEANSWER.test(r.keys[0])));
  const pos=rows.reduce((a,r)=>a+r.position*r.impressions,0)/all.i;
  const key=c.replace(/[^ぁ-んァ-ヶ一-龠A-Za-z]/g,'');
  const hasArt=articles.filter(f=>f.includes('hoshino')||f.includes('komeda')).length; // 参考
  const hasSpot=spots.some(s=>s.includes(c));
  const artMatch=articles.filter(f=>{
    const m={'星乃珈琲':'hoshino','コメダ':'komeda','バーガーキング':'burger','やよい軒':'yayoi','はなまるうどん':'hanamaru','資さんうどん':'sukesan',
      'coco壱':'cocoichi','CoCo壱':'cocoichi','鳥貴族':'torikizoku','一蘭':'ichiran','ほっともっと':'hottomotto','丸亀製麺':'marugame','餃子の王将':'ohsho',
      'じゃぶじゃぶ池':'jabujabu','駒沢公園':'komazawa','昭和記念公園':'showa','軽井沢':'karuizawa','高輪ゲートウェイ':'gateway','夢見が丘':'yumemi'}[c];
    return m && f.includes(m);
  }).length;
  console.log(
    `${c.padEnd(16)} ${String(all.i).padStart(7)} ${String(all.c).padStart(6)} ${(all.c/all.i*100).toFixed(2).padStart(6)}% ${pos.toFixed(1).padStart(5)}位` +
    `  ${String(pro.i).padStart(6)}/${pro.i?(pro.c/pro.i*100).toFixed(1):'0.0'}%` +
    `   ${String(one.i).padStart(6)}/${one.i?(one.c/one.i*100).toFixed(1):'0.0'}%` +
    `   記事${artMatch} spot:${hasSpot?'有':'無'}`);
}
