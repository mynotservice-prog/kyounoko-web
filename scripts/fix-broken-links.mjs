#!/usr/bin/env node
/**
 * items-catalog.ts の href: '#' を、provider に応じた検索URLに置換する。
 *
 * - amazon: https://www.amazon.co.jp/s?k={商品名}
 * - yahoo:  https://shopping.yahoo.co.jp/search?p={商品名}
 *
 * アフィリエイトタグ（アソシエイトID）は未設定なので収益は発生しないが、
 * 少なくとも「#」で動作していなかった問題は解消し、ユーザーが商品ページに辿り着ける。
 * 将来 Amazonアソシエイト取得後、URL にタグを付与する wrapper を作れば即収益化できる。
 */

import fs from 'node:fs';

const PATH = 'lib/items-catalog.ts';
let content = fs.readFileSync(PATH, 'utf8');

// 各エントリの { id:, category:, provider: 'amazon'|'yahoo', href: '#', name: '...' } から
// provider と name を対応させて href を置換する。
// まず provider + href + name のブロックを拾う。

const pattern = /provider:\s*'(amazon|yahoo)',\s*\n\s*href:\s*'#',\s*\n\s*name:\s*'([^']+)',/g;
let replacements = 0;

content = content.replace(pattern, (m, provider, name) => {
  const query = encodeURIComponent(name);
  const url = provider === 'amazon'
    ? `https://www.amazon.co.jp/s?k=${query}`
    : `https://shopping.yahoo.co.jp/search?p=${query}`;
  replacements++;
  return `provider: '${provider}',\n    href: '${url}',\n    name: '${name}',`;
});

fs.writeFileSync(PATH, content, 'utf8');
console.log(`Replaced ${replacements} broken '#' hrefs with functional search URLs.`);
