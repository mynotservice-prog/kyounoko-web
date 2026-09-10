import fs from 'fs';
const src=fs.readFileSync('lib/chain-facilities.ts','utf8');
const chains=[...src.matchAll(/key: '([^']+)',\s*\n\s*name: '([^']+)'/g)].map(m=>({key:m[1],name:m[2]}));
const files=fs.readdirSync('content/articles').filter(f=>f.endsWith('.md')).map(f=>f.replace(/\.md$/,''));
const isNoindex=f=>/^noindex:\s*true/m.test((fs.readFileSync('content/articles/'+f+'.md','utf8').split('---')[1])||'');
const noindex=new Set(files.filter(isNoindex));
const norm=s=>s.replace(/-/g,'');
const axes={
  'キッズメニュー':/kidsmenu|kodomomenu|okosama/,
  '子供料金':/kodomoryokin|ryokin|muryou|nansaikara/,
  'ベビーチェア':/babychair|kodomoisu/,
  '離乳食持込':/rinyushoku|rinyuushoku/,
  '座敷個室':/koshitsu|zashiki/,
  '子連れ攻略':/kodzurekoryaku/,
  'ベビーカー':/bebycar|babycar/,
  'アレルギー':/allergy|arerugi|teiarerugen/,
  'おむつ授乳':/omutsu|junyu|jyunyu/,
};
// エンティティ = DB43 + 記事にしか存在しないプレフィックス
const entities=new Map();
for(const c of chains) entities.set(norm(c.key),{name:c.name,inDb:true,slugs:[]});
const suffix=/-(kids-menu|kodzure-koryaku|baby-chair|rinyushoku-mochikomi|koshitsu|kodomo-ryokin|kids-chair)$/;
for(const f of files.filter(f=>suffix.test(f))){
  const p=norm(f.replace(suffix,''));
  if(!entities.has(p)) entities.set(p,{name:p,inDb:false,slugs:[]});
}
for(const f of files){
  const nf=norm(f);
  for(const [k,e] of entities) if(nf.startsWith(k)) e.slugs.push(f);
}
const ax=Object.keys(axes);
let cells=0,filled=0,dbCells=0,dbFilled=0;
const rows=[];
for(const [k,e] of entities){
  const have={};
  for(const [a,re] of Object.entries(axes)){
    const hit=e.slugs.filter(f=>re.test(norm(f).slice(k.length)));
    const live=hit.some(f=>!noindex.has(f));
    have[a]=live?'●':(hit.length?'△':'−');
    cells++; if(live)filled++;
    if(e.inDb){dbCells++; if(live)dbFilled++;}
  }
  rows.push({...e,key:k,have,n:e.slugs.length});
}
console.log(`エンティティ総数 ${entities.size}（DB登録 ${chains.length} / DB未登録 ${entities.size-chains.length}）`);
console.log(`DB43チェーン × 9条件 = ${dbCells}セル / 稼働 ${dbFilled} / 空き ${dbCells-dbFilled} (${Math.round((dbCells-dbFilled)/dbCells*100)}%)`);
console.log(`全エンティティ × 9条件 = ${cells}セル / 稼働 ${filled} / 空き ${cells-filled} (${Math.round((cells-filled)/cells*100)}%)`);
console.log('\n条件軸ごとの稼働数（全エンティティ中）');
for(const a of ax){
  const n=rows.filter(r=>r.have[a]==='●').length;
  console.log(`  ${a}\t${n} / ${rows.length}\t空き ${rows.length-n}`);
}
console.log('\n記事数上位20エンティティ');
console.log('エンティティ\tn\t'+ax.join(' '));
for(const r of rows.sort((a,b)=>b.n-a.n).slice(0,20))
  console.log(`${r.name}\t${r.n}\t`+ax.map(a=>r.have[a]).join('  '));
