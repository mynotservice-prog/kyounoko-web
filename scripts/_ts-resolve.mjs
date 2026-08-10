/**
 * Node から lib/*.ts を直接 import するための解決フック。
 *
 * Node 24 は TypeScript の型注釈を自前で剥がせるが、ESM の仕様どおり
 * 拡張子なしの相対 import（`./spots`）と `@/` エイリアスは解決できない。
 * ここを補うだけの薄いフック。トランスパイルはしない（Node 本体に任せる）。
 *
 * 使い方:
 *   node --import ./scripts/_ts-resolve.mjs scripts/spot-freshness-report.mjs
 *   ※ Node 22 以前では `--experimental-strip-types` が必要。
 */
import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = ['.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'];

/** ディレクトリを掴まないようにファイルだけを見る（'./spots-extra' はディレクトリ）。 */
function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function tryFiles(base) {
  for (const ext of CANDIDATES) {
    const p = base + ext;
    if (isFile(p)) return pathToFileURL(p).href;
  }
  return null;
}

/** TS 側は `import x from './y.json'` と書けるが、ESM は type 属性を要求するので補う。 */
function withJsonAttr(result) {
  if (result?.url?.endsWith('.json')) {
    return { ...result, importAttributes: { type: 'json' } };
  }
  return result;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // '@/lib/spots' → <root>/lib/spots.ts
    if (specifier.startsWith('@/')) {
      const target = resolvePath(ROOT, specifier.slice(2));
      const url = isFile(target) ? pathToFileURL(target).href : tryFiles(target);
      if (url) return withJsonAttr({ url, shortCircuit: true });
    }
    // './spots' → 同ディレクトリの spots.ts
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      const parent = context.parentURL?.startsWith('file:')
        ? dirname(fileURLToPath(context.parentURL))
        : ROOT;
      const base = resolvePath(parent, specifier);
      if (isFile(base)) {
        return withJsonAttr({ url: pathToFileURL(base).href, shortCircuit: true });
      }
      const url = tryFiles(base);
      if (url) return withJsonAttr({ url, shortCircuit: true });
    }
    try {
      return withJsonAttr(nextResolve(specifier, context));
    } catch (e) {
      // 'next/cache' のように拡張子なしのサブパスは Node では解決できない。'.js' を足して再試行。
      if (e?.code === 'ERR_MODULE_NOT_FOUND' && !/\.[a-z]+$/i.test(specifier)) {
        return withJsonAttr(nextResolve(`${specifier}.js`, context));
      }
      throw e;
    }
  },
});
