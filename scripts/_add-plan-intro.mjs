#!/usr/bin/env node
/**
 * プラン本文の冒頭にブログ記事風の導入段落を自動付与する一回限りスクリプト。
 *
 * 対象: 本文が frontmatter (---...---) 直後に「## 見出し」から始まるプラン
 * 追加: shortAnswer / title から導入文を生成
 *
 * 例:
 *   "## 持ち物" の前に
 *   「花火大会、子連れだと音や混雑が心配ですよね。本記事では...」のような導入。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/plans';
let modified = 0;
let scanned = 0;

function makeIntro({ title, shortAnswer, ageRanges }) {
  const ageHint =
    ageRanges?.length
      ? (ageRanges.includes('0-1') && ageRanges.includes('4-6')
          ? '0〜6歳の幅広い年齢で楽しめます。'
          : ageRanges.includes('0-1')
            ? '特に0〜1歳の小さな子と過ごす時間に役立ちます。'
            : ageRanges.includes('4-6')
              ? '4〜6歳の活発な時期にぴったりのプランです。'
              : '幼児期の子連れにちょうど良い内容です.')
      : '';
  // shortAnswer は基本そのまま使う。タイトルから連想する導入をつける。
  const lead = shortAnswer
    ? `${shortAnswer}`
    : `「${title}」を、子連れで無理なくこなすための段取りです。`;
  return [
    `${lead}`,
    '',
    `準備物・タイムライン・注意点・オススメポイントの順にまとめました。${ageHint}気になる項目だけ拾い読みしてもらっても大丈夫です。`,
    '',
  ].join('\n');
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const body = raw.slice(m[0].length);
  const obj = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!km) continue;
    let v = km[2].trim();
    // クォート除去
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    // 配列リテラル
    if (v.startsWith('[') && v.endsWith(']')) {
      try { v = JSON.parse(v.replace(/'/g, '"')); } catch { /* keep as string */ }
    }
    obj[km[1]] = v;
  }
  return { frontmatter: obj, frontmatterText: m[0], body };
}

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
  scanned++;
  const fp = path.join(DIR, f);
  const raw = fs.readFileSync(fp, 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) continue;
  const { frontmatter, frontmatterText, body } = parsed;
  // 既に導入文がある（## より前に普通の文がある）ならスキップ
  const bodyTrim = body.replace(/^[\s\n]+/, '');
  if (!bodyTrim.startsWith('##')) continue;
  // ## の直前に既に段落がある場合: bodyTrim が ## で始まっているので、frontmatter 直後にいきなり ## がある状態
  const intro = makeIntro({
    title: frontmatter.title,
    shortAnswer: frontmatter.shortAnswer,
    ageRanges: frontmatter.ageRanges,
  });
  // 新 body = intro + 空行 + 元 body の先頭空白を整える
  const newBody = '\n' + intro + '\n' + bodyTrim;
  const newRaw = frontmatterText + newBody;
  fs.writeFileSync(fp, newRaw);
  modified++;
}

console.log(`scanned: ${scanned}, modified: ${modified}`);
