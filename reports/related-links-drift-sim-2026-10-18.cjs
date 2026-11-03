// usage: node sim.cjs <repoDir> <isoDate> <outJson>
const [repo, iso, out] = process.argv.slice(2);
process.chdir(repo);
const fixed = new Date(iso).getTime(); Date.now = () => fixed;
const _fs=require('fs'); const _rf=_fs.readFileSync; const _c=new Map(); _fs.readFileSync=function(p,o){const k=String(p)+'|'+JSON.stringify(o||''); if(_c.has(k)) return _c.get(k); const v=_rf.apply(this,arguments); _c.set(k,v); return v;}; const _rd=_fs.readdirSync; let _rdc=new Map(); _fs.readdirSync=function(p,o){const k=String(p); if(_rdc.has(k)) return _rdc.get(k).slice(); const v=_rd.apply(this,arguments); _rdc.set(k,v); return v.slice();};
const jiti = require('/Users/nagaminehideki/Developer/kyounoko-web/node_modules/jiti')(repo + '/x.js', { alias: { '@': repo }, interopDefault: true });
const mod = jiti(repo + '/lib/articles.ts');
const fs = require('fs');
const all = mod.getAllFileArticles().filter(a => !a.noindex);
const res = {};
for (const a of all) res[a.slug] = mod.getRelatedFileArticles(a.slug, a.category, 3).map(x => x.slug);
fs.writeFileSync(out, JSON.stringify(res));
console.log('pages', Object.keys(res).length, 'at', iso);
