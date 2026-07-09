#!/usr/bin/env node
/**
 * note 転用エクスポートスクリプト
 *
 * 目的:
 *   - 既存の content/articles/*.md を note (note.com) へ転載可能なフォーマットに変換
 *   - 各転載記事の末尾に kyounoko.jp への被リンクを必ず埋め込み、ドメインオーソリティ向上を狙う
 *   - 著者プロフィール文を末尾に追加し、E-E-A-T + 自然な誘導を両立
 *
 * 使い方:
 *   node scripts/note-export.mjs              # ピラー4本＋キラー記事を一括変換
 *   node scripts/note-export.mjs --all        # 全記事を変換（数百本注意）
 *   node scripts/note-export.mjs --slug=foo   # 特定slugのみ
 *   node scripts/note-export.mjs --limit=20   # ピラー＋キラー以外、最新20本
 *
 * 出力:
 *   docs/note-export/{slug}.md
 *   docs/note-export/_index.md   # 一覧（コピペ転載順管理用）
 *
 * note 投稿の運用:
 *   1. このスクリプトで md を生成
 *   2. note.com の新規記事作成画面に開く
 *   3. docs/note-export/{slug}.md の中身を貼り付け
 *   4. タイトル・タグ・公開設定を行い投稿
 *
 * 設計方針:
 *   - 内部リンク（/article/xxx）は全て絶対URL（https://kyounoko.jp/article/xxx）に変換
 *     → これでnoteから kyounoko.jp への被リンクが自然に量産される
 *   - 画像も絶対URL化（note CDN へのアップロードは手動。代替として参照リンク方式）
 *   - 末尾に必ず「より詳しくはきょうのこで」のCTAブロック
 *   - SEO的な重複ペナルティ回避のため、冒頭に独自の「note版オリジナルリード」を追加
 *
 * これにより:
 *   - note の被リンク (DR 90+) が kyounoko.jp に大量に飛ぶ
 *   - note 内検索からの新規ユーザー獲得
 *   - 著者ブランド構築
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const OUT_DIR = path.join(ROOT, 'docs', 'note-export');
const SITE_URL = 'https://kyounoko.jp';

// ピラー4本＋キラー記事（高権威記事を優先的にnoteで露出させる）
const PRIORITY_SLUGS = new Set([
  '0sai-ikuji-kanzen-map',
  '1-2sai-ikuji-kanzen-map',
  '3-6sai-ikuji-kanzen-map',
  'natsu-kosodate-kanzen-map',
  'kodzure-famires-zenkoku-kanzen-2026',
  'rinyuushoku-toha-kanzen-guide',
  'shokumotsu-allergy-toha-kanzen-guide',
  'sango-utsu-toha-kanzen-guide',
  'yonaki-toha-kanzen-guide',
  'sotsunyu-toha-kanzen-guide',
  'iyaiya-ki-toha-kanzen-guide',
  'akachan-nekashitsuke-kanzen-guide-0-1sai',
  'tsuyu-shitsunai-asobi-0-6sai-hozonban-2026',
  'kodomo-netsuchusho-3sain-real-2026',
  'natsuyasumi-kazoku-ryokou-kodzure-2026',
  'shichigosan-nenrei-junbi',
  'randoseru-erabikata-osusume-2026',
  'shougakkou-nyugaku-junbi-kanzen-list',
  'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
  'hoikuen-vs-youchien-hikaku',
  'kaiten-sushi-4chain-comparison',
  'famires-kodzure-ranking-2026-10sen',
  'kids-menu-chain-15-hikaku',
]);

// CLI引数パース
const args = process.argv.slice(2);
const argMap = new Map();
for (const a of args) {
  if (a.startsWith('--')) {
    const [k, v = 'true'] = a.slice(2).split('=');
    argMap.set(k, v);
  }
}
const MODE = argMap.get('all') ? 'all' : argMap.get('slug') ? 'slug' : 'priority';
const SPECIFIC_SLUG = argMap.get('slug');
const LIMIT = parseInt(argMap.get('limit') || '0', 10);

// 著者プロフィール（note版CTA）
const AUTHOR_BIO = `
---

### 🌱 きょうのこ：子育て家庭の「今日どうする？」を3分で決める

私たち「きょうのこ」は、0〜6歳の子がいる家庭向けに、天気・年齢・時間帯・予算から今日の過ごし方を3分で決められる意思決定サイトを運営しています。

- 🏠 [きょうのこ 公式サイト](https://kyounoko.jp)
- 📷 [Instagram @kyounoko_family_plan](https://www.instagram.com/kyounoko_family_plan/)
- 📧 [お問い合わせ](https://kyounoko.jp/contact)

子育てのリアルな悩みに、根拠ある情報と運営者の体験で答えます。よろしければ、サイトの方もぜひ覗いてみてください。

#育児 #子育て #ワンオペ育児 #育児ブログ #子育てママ #子育てパパ
`.trim();

/**
 * フロントマターをパース
 */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const metaRaw = m[1];
  const body = m[2];
  const meta = {};
  for (const line of metaRaw.split('\n')) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) {
      let val = mm[2].trim();
      // 簡易: クォート/シングルクォート除去
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      // YAML 複数行値の最初の行（>- の場合）
      if (val === '>-' || val === '>') val = '';
      meta[mm[1]] = val;
    }
  }
  return { meta, body };
}

/**
 * 内部リンクと画像を絶対URLに変換
 *   [テキスト](/article/foo) → [テキスト](https://kyounoko.jp/article/foo)
 *   ![alt](/hero/foo.webp) → ![alt](https://kyounoko.jp/hero/foo.webp)
 */
function absolutizeLinks(body) {
  return body
    .replace(/\]\((\/[^)\s]+)\)/g, (_, p) => `](${SITE_URL}${p})`)
    .replace(/\]\((?:\.\/)?(?:\.\.\/)?(\/[^)\s]+)\)/g, (_, p) => `](${SITE_URL}${p})`);
}

/**
 * 著者バナー＆FAQ などの自動挿入要素を除去（noteで重複させない）
 */
function cleanBody(body) {
  // 著者ライン (例: [著者: ながみー...](/authors/nagamy)・最終更新 2026年5月)
  body = body.replace(/^\[著者:[^\]]+\]\([^)]+\)[^\n]*\n?/gm, '');
  // 末尾のフッター "*本記事は一般的な情報提供..." はそのまま残す（責任明示として価値あり）
  return body;
}

/**
 * note版オリジナルリードを冒頭に挿入（重複コンテンツ回避）
 */
function buildNoteIntro(meta) {
  const updated = meta.updatedAt || '2026-05';
  return `
（この記事は「きょうのこ」サイト掲載の記事を、note読者向けに再編集してお届けします。最終更新：${updated}）

`.trimStart();
}

/**
 * 末尾CTAブロック
 */
function buildOutroCTA(slug, meta) {
  const originalUrl = `${SITE_URL}/article/${slug}`;
  return `
---

## 📖 元記事はこちら（オリジナル版）

この記事の最新版・関連記事・年齢別マップは、きょうのこの該当ページからアクセスできます。

▶︎ **[${meta.title || slug}](${originalUrl})**

きょうのこではこの他にも、

- [0歳の育児 完全マップ](${SITE_URL}/article/0sai-ikuji-kanzen-map)
- [1〜2歳の育児 完全マップ](${SITE_URL}/article/1-2sai-ikuji-kanzen-map)
- [3〜6歳の育児 完全マップ](${SITE_URL}/article/3-6sai-ikuji-kanzen-map)
- [夏の子育て完全マップ](${SITE_URL}/article/natsu-kosodate-kanzen-map)

など、年齢別・季節別の総合ガイドを公開しています。
`;
}

/**
 * 1記事を note 用に変換
 */
function convertOne(slug) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { meta, body: rawBody } = parseFrontmatter(raw);
  if (meta.noindex === 'true') return null; // noindex記事はnoteにも転載しない

  let body = rawBody;
  body = cleanBody(body);
  body = absolutizeLinks(body);

  const title = meta.title || slug;
  const intro = buildNoteIntro(meta);
  const outro = buildOutroCTA(slug, meta);

  // note向け：H1にタイトル、その下に本文（本文内にも H2/H3 がある想定）
  const noteContent = `# ${title}

${intro}
${body}

${outro}

${AUTHOR_BIO}
`;

  return { slug, title, content: noteContent };
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let targetSlugs = [];

  if (MODE === 'slug') {
    targetSlugs = [SPECIFIC_SLUG];
  } else if (MODE === 'all') {
    targetSlugs = fs.readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));
  } else {
    // priority: ピラー＋キラー中心、LIMIT指定なら追加で最新記事も
    targetSlugs = Array.from(PRIORITY_SLUGS);
    if (LIMIT > 0) {
      const allFiles = fs.readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => ({
          slug: f.replace(/\.md$/, ''),
          mtime: fs.statSync(path.join(ARTICLES_DIR, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);
      for (const x of allFiles) {
        if (PRIORITY_SLUGS.has(x.slug)) continue;
        if (targetSlugs.length >= PRIORITY_SLUGS.size + LIMIT) break;
        targetSlugs.push(x.slug);
      }
    }
  }

  const results = [];
  for (const slug of targetSlugs) {
    const converted = convertOne(slug);
    if (!converted) {
      console.warn(`[skip] ${slug} (not found or noindex)`);
      continue;
    }
    const outPath = path.join(OUT_DIR, `${slug}.md`);
    fs.writeFileSync(outPath, converted.content, 'utf8');
    results.push({ slug: converted.slug, title: converted.title, chars: converted.content.length });
    console.log(`✓ ${slug} (${converted.content.length} chars)`);
  }

  // 一覧 _index.md（コピペ転載順を管理）
  const indexMd = `# note 転載キュー

このディレクトリは「note 転用エクスポートスクリプト」（scripts/note-export.mjs）が生成した、note 投稿用 markdown のキューです。

## 運用フロー

1. note.com にログイン
2. 新規記事作成
3. 下記の md ファイルから順にコピペして投稿
4. 投稿完了したら「✅」マークを付ける（手動）

## 投稿キュー

| No. | slug | タイトル | 文字数 | 投稿状況 |
| --- | ---- | -------- | -----: | -------- |
${results.map((r, i) => `| ${i + 1} | ${r.slug} | ${r.title} | ${r.chars} | ☐ |`).join('\n')}

合計: ${results.length} 本（${results.reduce((s, r) => s + r.chars, 0)} 文字）

## 投稿時の注意

- **タイトル**: 元記事タイトルの一部を変えて重複ペナルティ回避（例: 「【完全保存版】」を冒頭に追加）
- **ハッシュタグ**: 各記事末尾に推奨タグ #育児 #子育て #ワンオペ育児 等を入れる
- **公開設定**: 全文無料公開推奨（バックリンク強化が主目的）
- **画像**: note 上で別途アップロード（記事内の画像URLはきょうのこへの参照リンク）
`;
  fs.writeFileSync(path.join(OUT_DIR, '_index.md'), indexMd, 'utf8');

  console.log(`\n✓ ${results.length}本 → ${OUT_DIR}`);
  console.log(`  キュー: ${path.join(OUT_DIR, '_index.md')}`);
}

main();
