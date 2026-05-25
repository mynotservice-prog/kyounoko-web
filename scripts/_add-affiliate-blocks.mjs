#!/usr/bin/env node
/**
 * 物販系の高購入意欲記事に、楽天・Amazonの検索アフィリンクブロックを追記する。
 * 追記したリンクは lib/articles.ts の wrapAffiliateLinksInHtml で
 * 自動的にもしも経由（楽天）/ tag付き（Amazon）に変換され収益化される。
 * PRBadge も bodyHasAffiliateUrl 判定で自動表示される。
 *
 * 方針:
 *   - 各記事のメイン商材に合った検索キーワードで楽天/Amazon検索リンクを設置
 *   - 末尾に「商品を探す」セクションを追加（既にアフィリンクがある記事はスキップ）
 *   - 押し売りにならないよう1記事1ブロック・2リンク（楽天/Amazon）に抑制
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/articles';

// slug -> { kw: 検索キーワード, label: 商材名 }
const MAP = {
  // ベビーカー
  'babycar-erabikata': { kw: 'ベビーカー A型 B型', label: 'ベビーカー' },
  'babycar-a-b-buggy-3type-7koumoku': { kw: 'ベビーカー 軽量 A型', label: 'ベビーカー' },
  'babycar-itsukara-tsukau': { kw: 'ベビーカー A型 新生児', label: 'ベビーカー' },
  // チャイルドシート / ジュニアシート
  'child-seat-0-7sai-5brand': { kw: 'チャイルドシート ISOFIX', label: 'チャイルドシート' },
  'booster-3type-2-7sai': { kw: 'ジュニアシート ブースター', label: 'ジュニアシート' },
  'junior-seat-2-3sai-hikaku-15': { kw: 'ジュニアシート 2歳 ハイバック', label: 'ジュニアシート' },
  // 抱っこ紐
  'dakkohimo-3brand-7koumoku-2026': { kw: '抱っこ紐 エルゴ ビョルン', label: '抱っこ紐' },
  'dakkohimo-itsukara-shinseiji': { kw: '抱っこ紐 新生児 OK', label: '抱っこ紐' },
  // 安全グッズ
  'babygate-kaidan-ranking-7-2026': { kw: 'ベビーゲート 階段用 突っ張り', label: 'ベビーゲート' },
  'bedlight-3type-kodomo': { kw: '子供 ベッドライト 常夜灯', label: 'ベッドライト' },
  'denshi-mosquito-4brand-anzen': { kw: '電子 蚊取り器 赤ちゃん', label: '電子蚊取り' },
  // 洗剤
  'baby-senzai-ranking': { kw: 'ベビー洗剤 新生児', label: 'ベビー洗剤' },
  // 知育・教材
  'chiiku-toys-2-3sai-5sen': { kw: '知育玩具 2歳 3歳', label: '知育玩具' },
  'omocha-year-by-age': { kw: '知育玩具 幼児 人気', label: '知育玩具' },
  'programming-kodomo-5-7sai': { kw: 'プログラミング 知育 子供', label: 'プログラミング教材' },
  // 紫外線・日焼け止め
  'kodomo-shigaisen-taisaku-2026': { kw: '子供 日焼け止め 敏感肌', label: '日焼け止め' },
  'akachan-hiyakedome-itsukara-erabikata': { kw: '赤ちゃん 日焼け止め 無添加', label: '日焼け止め' },
  // プール
  'puuru-mizuasobi-debut': { kw: 'ベビープール 家庭用', label: 'プール用品' },
  'veranda-pool-4sai-asobi-kata': { kw: 'ベランダ プール 家庭用', label: 'ベランダプール' },
  '1sai-pool-debut-motimono': { kw: 'ベビー 水着 スイムパンツ', label: 'プール用品' },
  // クリスマス・プレゼント
  'xmas-present-nenrei-0-6': { kw: 'クリスマスプレゼント 幼児', label: 'クリスマスプレゼント' },
  'christmas-present-kodomo-nenrei-betsu': { kw: 'クリスマスプレゼント 子供 人気', label: 'クリスマスプレゼント' },
};

function rakuten(kw) {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(kw)}/`;
}
function amazon(kw) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(kw)}`;
}

let done = 0;
const skipped = [];

for (const [slug, { kw, label }] of Object.entries(MAP)) {
  const fp = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) { skipped.push(slug + ' (not found)'); continue; }
  let raw = fs.readFileSync(fp, 'utf8');
  // 既にアフィリンクがあるならスキップ（重複防止）
  if (/rakuten\.co\.jp|amazon\.co\.jp|af\.moshimo\.com/.test(raw)) { skipped.push(slug + ' (already has aff)'); continue; }
  // 既にこのブロックを追加済みならスキップ
  if (/## 商品を探す｜/.test(raw)) { skipped.push(slug + ' (block exists)'); continue; }

  const block = [
    '',
    `## 商品を探す｜${label}`,
    '',
    `記事で紹介した${label}は、各通販サイトの最新price・レビューを見比べて選ぶのがおすすめです。型番や在庫は時期で変わるため、購入前に必ず最新情報をご確認ください。`,
    '',
    `- [楽天で「${kw}」を探す](${rakuten(kw)})`,
    `- [Amazonで「${kw}」を探す](${amazon(kw)})`,
    '',
    '> ※ 上記リンクには広告（アフィリエイト）を含みます。価格・仕様は各販売店の表示が最新です。',
    '',
  ].join('\n');

  // 「## 関連記事」セクションがあればその直前、なければ末尾に挿入
  if (/\n## 関連記事/.test(raw)) {
    raw = raw.replace(/\n## 関連記事/, block + '\n## 関連記事');
  } else {
    raw = raw.replace(/\s*$/, '\n') + block;
  }
  fs.writeFileSync(fp, raw);
  done++;
}

console.log(`アフィブロック追加: ${done} / 対象${Object.keys(MAP).length}`);
if (skipped.length) console.log('スキップ:\n  ' + skipped.join('\n  '));
