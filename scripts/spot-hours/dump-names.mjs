import { writeFileSync } from 'node:fs';
const root = process.argv[2];
const sp = await import(root + '/lib/spots.ts');
const rawBySlug = {};
for (const [area, list] of Object.entries(sp.SPOTS)) for (const s of list ?? []) { const k = sp.spotToSlug(s, area); if (!(k in rawBySlug)) rawBySlug[k] = s.name; }
const out = {};
for (const x of sp.getAllSpotsWithSlug()) if (rawBySlug[x.slug]) out[x.spot.name] = rawBySlug[x.slug];
writeFileSync(process.argv[3], JSON.stringify(out));
const diff = Object.entries(out).filter(([a, b]) => a !== b);
console.log(Object.keys(out).length, 'diff', diff.length, diff.filter(([a]) => /あらかわ|上柚木|新河岸|二子玉川|カワスイ/.test(a)));
