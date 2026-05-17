import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'content/articles';
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

const taberuArticles = [];
for (const f of files) {
  const txt = readFileSync(path.join(dir, f), 'utf-8');
  const cat = (txt.match(/^category:\s*['"]?([^'"\n]+)['"]?$/m) || [])[1]?.trim();
  if (cat !== 'today-taberu') continue;
  // Count body chars - after second ---
  const m = txt.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = m ? m[1] : '';
  const chars = body.length;
  taberuArticles.push({ slug: f.replace(/\.md$/, ''), chars });
}
taberuArticles.sort((a, b) => a.chars - b.chars);
console.log(`today-taberu total: ${taberuArticles.length}`);
console.log(`Bottom 25 by body length:`);
taberuArticles.slice(0, 25).forEach((w) => console.log(`${w.slug}\t${w.chars}`));
