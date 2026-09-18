#!/usr/bin/env node
/**
 * LINE 金曜配信（手書き原稿・docs/line-friday-*.md）に貼る「今日のおうち遊び」1件を出す。
 *
 * 週末が雨予報の週に、3択の下へ足す用途。lib/home-play.ts の日替わり選定をそのまま使う。
 *   node --import ./scripts/_ts-resolve.mjs scripts/ouchi-line-snippet.mjs            # 2〜3歳・雨
 *   node --import ./scripts/_ts-resolve.mjs scripts/ouchi-line-snippet.mjs --age=0-1 --date=2026-09-26
 * Node 24 で実行すること（_ts-resolve.mjs が registerHooks を使う）。
 */
import { pickHomePlaysForToday, POSTURE_LABEL } from '../lib/home-play.ts';
import { getArticleForHomePlay } from '../lib/home-play-articles.ts';

const arg = (k, d) => { const m = process.argv.find((a) => a.startsWith(`--${k}=`)); return m ? m.split('=').slice(1).join('=') : d; };
const age = arg('age', '2-3');
const date = new Date(arg('date', new Date().toISOString().slice(0, 10)));
const camp = `fri${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

const [p] = pickHomePlaysForToday({ ageRange: age, needs: ['rainy', 'tired'], date, limit: 1 });
const a = getArticleForHomePlay(p.id);
const url = a ? `https://kyounoko.jp/article/${a.slug}?utm_source=line&utm_campaign=${camp}#play-${p.id}` : '';
console.log(`雨なら家で、これ1つ：${p.name}\n${p.summary}\n準備${p.prepMin}分・片付け${p.cleanupMin}分・${POSTURE_LABEL[p.parentPosture]}\n${url}`);
