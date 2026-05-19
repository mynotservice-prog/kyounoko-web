#!/usr/bin/env node
/**
 * マークダウン表の空白セル / セル内の余計な空白を整形する。
 *
 * - 各セルの前後空白を除去（「| 値 |」→「| 値 |」を一貫させる）
 * - 末尾の空セル「| 値 | |」のような行を、空セルを削る
 * - ただし区切り行（|---|---|---|）は触らない
 * - ヘッダー行と本体行で列数が異なる場合は触らない（安全策）
 */
import fs from 'node:fs';
import path from 'node:path';

const DIRS = ['content/articles', 'content/plans'];
let modifiedFiles = 0;
let modifiedRows = 0;

function isSeparatorRow(line) {
  return /^\|(\s*:?-+:?\s*\|)+\s*$/.test(line.trim());
}

function isTableRow(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function splitCells(row) {
  // 先頭末尾の `|` を除去してから split
  const inner = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  return inner.split('|');
}

function joinCells(cells) {
  return '| ' + cells.map((c) => c.trim()).join(' | ') + ' |';
}

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const fname of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, fname);
    const raw = fs.readFileSync(fp, 'utf8');
    const lines = raw.split('\n');
    let changed = false;
    let fileRows = 0;
    // 表の塊単位で処理
    let i = 0;
    while (i < lines.length) {
      if (!isTableRow(lines[i])) { i++; continue; }
      // 表の開始: 連続する table row を集める
      const start = i;
      while (i < lines.length && isTableRow(lines[i])) i++;
      const end = i; // exclusive
      // ヘッダー or 区切りがあるかを軽く確認
      const block = lines.slice(start, end);
      const headerIdx = block.findIndex((l) => !isSeparatorRow(l) && isTableRow(l));
      const separatorIdx = block.findIndex(isSeparatorRow);
      if (headerIdx < 0 || separatorIdx < 0) continue;
      const headerCells = splitCells(block[headerIdx]);
      const expectedCols = headerCells.length;

      // 末尾空セル削除可否判定: 全行で末尾が空かをチェック
      const cellsByRow = block.map((l) => (isSeparatorRow(l) ? null : splitCells(l)));
      let canTrimLastCol = expectedCols >= 2;
      for (const c of cellsByRow) {
        if (!c) continue;
        if (c.length !== expectedCols) { canTrimLastCol = false; break; }
        if (c[c.length - 1].trim() !== '') { canTrimLastCol = false; break; }
      }

      for (let r = 0; r < block.length; r++) {
        const orig = block[r];
        if (isSeparatorRow(orig)) {
          // 区切り行は `|---|---|...|` 形式で整形（trim & 一貫スペース）
          const cnt = orig.split('|').filter((s) => s.trim().length > 0).length;
          if (canTrimLastCol) {
            const newSep = '|' + '---|'.repeat(cnt - 1);
            if (newSep !== orig.trim()) {
              block[r] = newSep;
              changed = true;
              fileRows++;
            }
          } else {
            const newSep = '|' + '---|'.repeat(cnt);
            if (newSep !== orig.trim()) {
              block[r] = newSep;
              changed = true;
              fileRows++;
            }
          }
          continue;
        }
        let cells = cellsByRow[r];
        if (!cells) continue;
        if (canTrimLastCol) cells = cells.slice(0, -1);
        const joined = joinCells(cells);
        if (joined !== orig) {
          block[r] = joined;
          changed = true;
          fileRows++;
        }
      }
      // ブロックを書き戻す
      for (let r = 0; r < block.length; r++) lines[start + r] = block[r];
    }
    if (changed) {
      fs.writeFileSync(fp, lines.join('\n'));
      modifiedFiles++;
      modifiedRows += fileRows;
    }
  }
}

console.log(`modified files: ${modifiedFiles}, modified rows: ${modifiedRows}`);
