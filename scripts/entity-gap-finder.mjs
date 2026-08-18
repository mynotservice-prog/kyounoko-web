#!/usr/bin/env node
/**
 * 固有名詞ギャップ抽出
 *
 * 既存スポットに無い実体名で、GSCに表示があるものを洗い出す。
 * 結果の解釈と着手順は docs/entity-target-backlog-2026-08.md を正本とする。
 *
 * 使い方（Node 24 が必要）:
 *   ~/.nvm/versions/node/v24.14.0/bin/node --import ./scripts/_ts-resolve.mjs scripts/entity-gap-finder.mjs
 *
 * 重要: 表示数の大きさで優先度を決めない。単答型（何時まで/いくら）はAIOが完答するため
 * 順位を上げてもクリックにならない。調達型（キッズメニュー/授乳室/子連れ）の表示で選ぶ。
 */
import { JWT } from 'google-auth-library';
import { readFileSync } from 'fs';
import { getAllSpotsWithSlug } from '../lib/spots.ts';

const creds=JSON.parse(readFileSync('./credentials/google-indexing.json','utf-8'));
const jwt=new JWT({email:creds.client_email,key:creds.private_key,scopes:['https://www.googleapis.com/auth/webmasters.readonly']});
const {token}=await jwt.getAccessToken();
async function q(body){const r=await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:kyounoko.jp')}/searchAnalytics/query`,
 {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  body:JSON.stringify({startDate:'2026-07-18',endDate:'2026-08-15',dataState:'all',...body})});
 const j=await r.json(); if(j.error){console.error(j.error.message);return[];} return j.rows||[];}

const rows = await q({dimensions:['query'], rowLimit:25000});
console.log(`総クエリ数: ${rows.length}`);

// 汎用の修飾語（これを除いた残りが実体名の候補）
const MODIFIER = /子連れ|こづれ|赤ちゃん|ベビーカー|授乳室|おむつ|離乳食|キッズ|子供|こども|子ども|何時|料金|値段|価格|駐車場|個室|メニュー|予約|クーポン|割引|持ち込み|食べ放題|ランチ|モーニング|時間|アクセス|東京|関東|埼玉|千葉|神奈川|大阪|名古屋|近く|周辺|おすすめ|人気|ランキング|選|とは|いつから|何歳|服装|持ち物|雨|室内|屋内|무료|無料|платно/g;
const spots = getAllSpotsWithSlug();
const spotNorm = spots.map(s=>s.spot.name.replace(/[\s　（）()・]/g,''));
function coveredBySpot(qs){
  const n = qs.replace(/[\s　（）()・]/g,'');
  return spotNorm.some(sn => sn.length>=3 && (n.includes(sn) || sn.includes(n)));
}

// 実体名らしさ: 修飾語を落として3文字以上残り、既存スポットに無いもの
const cand = new Map();
for (const r of rows) {
  const qs = r.keys[0];
  if (r.impressions < 30) continue;
  const core = qs.replace(MODIFIER,'').replace(/[\s　]+/g,'').trim();
  if (core.length < 3) continue;
  if (coveredBySpot(core)) continue;
  const prev = cand.get(core) ?? {imp:0,clk:0,pos:[],qs:[]};
  prev.imp += r.impressions; prev.clk += r.clicks; prev.pos.push(r.position); prev.qs.push(qs);
  cand.set(core, prev);
}
const list = [...cand.entries()]
  .map(([k,v])=>({k, imp:v.imp, clk:v.clk, pos:v.pos.reduce((a,b)=>a+b,0)/v.pos.length, n:v.qs.length, sample:v.qs[0]}))
  .sort((a,b)=>b.imp-a.imp);

console.log('\n■ 既存スポットに無い実体名の候補（表示30以上・上位40）');
console.log('  表示   クリック 平均順位 語数  実体候補 / 代表クエリ');
for (const c of list.slice(0,40)) {
  console.log(`  ${String(c.imp).padStart(6)} ${String(c.clk).padStart(6)} ${c.pos.toFixed(1).padStart(6)}位 ${String(c.n).padStart(3)}q  ${c.k}  ←「${c.sample}」`);
}
