// 赤ちゃん歓迎マップ（LINEリードマグネット）用の店舗/スポットCSVを生成する。
// 既存の実データ（lib/spots.ts の SPOTS）から、子連れ外食に強い restaurant カテゴリを中心に
// Googleマイマップへ import できるCSVを出力する。住所は持たないため「店名＋市区町村」で
// ジオコーディングさせる想定（大型商業施設/駅ビルなので名前解決の精度は高い）。
//
// 実行: npx tsx scripts/babyfriendly-map-export.ts
// 出力: 標準出力にCSV（UTF-8, BOM付き）。ファイル化は `> out.csv` でリダイレクト。
import { SPOTS, TOKYO_RESTAURANTS, type Spot } from '@/lib/spots';

type Row = {
  area: string;
  spot: Spot;
};

// 首都圏を先頭に、外食動線として価値の高いエリア順で並べる（それ以外も後ろに全部出す）。
const AREA_PRIORITY = ['tokyo', 'kanagawa', 'saitama', 'chiba', 'osaka', 'aichi', 'fukuoka', 'hyogo'];

// ward:'複数' / city:'…チェーン' は全国チェーンで単一ピンにできない＝地図でなく早見表向き。
function isChain(spot: Spot): boolean {
  return spot.ward === '複数' || Boolean(spot.city && spot.city.includes('チェーン'));
}

function flatten(): Row[] {
  const rows: Row[] = [];
  for (const [area, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    for (const spot of list) rows.push({ area, spot });
  }
  // 外食データの本体は TOKYO_RESTAURANTS（tokyo 相当）。SPOTS 未収録なので明示合流。
  for (const spot of TOKYO_RESTAURANTS) rows.push({ area: 'tokyo', spot });
  return rows;
}

function fac(spot: Spot, key: 'diaperChange' | 'nursingRoom' | 'strollerRental'): string {
  const v = spot.facilities?.[key];
  if (v === 'yes') return '○';
  if (v === 'no') return '×';
  return '';
}

function yn(v: unknown): string {
  return v === true ? '○' : '';
}

function esc(v: string): string {
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function areaRank(area: string): number {
  const i = AREA_PRIORITY.indexOf(area);
  return i === -1 ? AREA_PRIORITY.length : i;
}

const HEADERS = [
  'グループ',     // マイマップのレイヤ/色分け用（実訪問 / 外食（施設）/ おでかけ施設）
  '名前',        // ピンのタイトル
  '場所検索用',   // Googleマイマップのジオコーディング列（店名＋市区町村）
  'エリア',
  '市区町村',
  'カテゴリ',
  '授乳室',
  'おむつ替え',
  '座敷・個室',   // 動き回る子をおろせる/寝かせられる（親の判断軸）
  '離乳食',       // 提供 or 持ち込みOK
  'ベビーチェア',
  'キッズメニュー',
  'ベビーカー',
  '予算',
  '実訪問',      // 運営者が実際に訪問して確認（kidReport）
  '説明',        // ★ピンの説明。実訪問は一次情報を全文、その他はメモ＋拾えた事実
];

function groupOf(spot: Spot): string {
  if (spot.kidReport) return '① 実際に行って確認';
  if (spot.category === 'restaurant') return '② 子連れ外食（施設）';
  return '③ おでかけ施設';
}

// メモ/裏技テキストから親の判断軸を拾う（無理に'yes'にしない。拾えた時だけ○）。
function textOf(spot: Spot): string {
  return [spot.note, spot.hiddenTip].filter(Boolean).join(' ');
}
function hasTatami(spot: Spot): string {
  return /座敷|個室|掘りごたつ|小上がり/.test(textOf(spot)) ? '○' : '';
}
function hasBabyFood(spot: Spot): string {
  if (spot.babyFood === true) return '○';
  return /離乳食/.test(textOf(spot)) ? '○' : '';
}

// ピン説明。実訪問(kidReport)は「実際に行って確認」した一次情報を全文載せる＝ここが堀。
function describe(spot: Spot): string {
  const r = spot.kidReport;
  if (r) {
    const parts = [
      `【実際に行って確認｜訪問時: ${r.visitAge}】`,
      `🚼 ベビーカー動線: ${r.strollerNote}`,
      `🕐 混雑と狙い目: ${r.crowdNote}`,
      `🍼 おむつ・授乳: ${r.diaperNote}`,
      `⏱ 滞在の目安: ${r.stayNote}`,
      `⚠️ 注意: ${r.cautionNote}`,
    ];
    return parts.join('\n');
  }
  return spot.note ?? '';
}

const CAT_JA: Record<string, string> = {
  restaurant: '子連れ外食',
  indoor: '室内あそび',
  aquarium: '水族館',
  zoo: '動物園',
  park: '公園',
  museum: '博物館・科学館',
  amusement: '遊園地',
  farm: '牧場',
  seasonal: '季節体験',
};

function toCsv(rows: Row[]): string {
  const lines = [HEADERS.map(esc).join(',')];
  for (const { area, spot } of rows) {
    const where = spot.ward ?? spot.city ?? area;
    const line = [
      groupOf(spot),
      spot.name,
      `${spot.name} ${where}`,
      area,
      spot.ward ?? spot.city ?? '',
      CAT_JA[spot.category] ?? spot.category,
      fac(spot, 'nursingRoom'),
      fac(spot, 'diaperChange'),
      hasTatami(spot),
      hasBabyFood(spot),
      yn(spot.babyChair),
      yn(spot.kidsMenu),
      fac(spot, 'strollerRental') || yn(spot.strollerAccess),
      spot.budget ?? '',
      spot.kidReport ? '○' : '',
      describe(spot),
    ];
    lines.push(line.map((c) => esc(String(c))).join(','));
  }
  return lines.join('\n');
}

function main() {
  const mode = process.argv[2] ?? 'map';
  let rows = flatten();

  if (mode === 'map') {
    // ★推奨v1: 「赤ちゃん歓迎」実在スポット統合マップ（全国。地図化できる単一店舗のみ）。
    // チェーン（ward:'複数'）は地図化不可なので除外し早見表(chain)へ回す。
    // グループ列で ①実訪問 / ②子連れ外食（施設）/ ③おでかけ施設 に色分けできる。
    // ※エリア絞り込みは市区町村列でフィルタして記事/地域別マップに切り出す運用。
    rows = rows.filter((r) => {
      if (isChain(r.spot)) return false;
      const s = r.spot;
      const mappableBaby =
        s.facilities?.nursingRoom === 'yes' || s.facilities?.diaperChange === 'yes';
      return Boolean(s.kidReport) || s.category === 'restaurant' || mappableBaby;
    });
  } else if (mode === 'restaurant') {
    // 子連れ外食マップ（実在の駅ビル・商業施設のみ。チェーンは除外）
    rows = rows.filter((r) => r.spot.category === 'restaurant' && !isChain(r.spot));
  } else if (mode === 'baby') {
    // 授乳室 or おむつ替えが確認できる「赤ちゃんOK」全カテゴリ（チェーン除外）
    rows = rows.filter(
      (r) =>
        !isChain(r.spot) &&
        (r.spot.facilities?.nursingRoom === 'yes' || r.spot.facilities?.diaperChange === 'yes'),
    );
  } else if (mode === 'visited') {
    // 運営者が実際に訪問して確認したスポットのみ（一次情報バッジ）
    rows = rows.filter((r) => Boolean(r.spot.kidReport));
  } else if (mode === 'chain') {
    // 地図でなくPDF早見表向き: 全国チェーン（ファミレス等）だけを抽出
    rows = rows.filter((r) => r.spot.category === 'restaurant' && isChain(r.spot));
  }

  rows.sort((a, b) => areaRank(a.area) - areaRank(b.area) || a.spot.name.localeCompare(b.spot.name, 'ja'));

  const csv = toCsv(rows);
  process.stdout.write('﻿' + csv + '\n');
  process.stderr.write(`\n[mode=${mode}] ${rows.length} 件を出力\n`);
}

main();
