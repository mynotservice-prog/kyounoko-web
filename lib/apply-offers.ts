/**
 * 申込型アフィリエイト（撮影の予約・習い事の体験）の導線。
 *
 * 読者の次の行動が「撮影を予約する」「体験に申し込む」である記事にだけ、記事末尾の
 * 「読了後の高単価CTAは1枚だけ」の枠（page.tsx の endOffer）へ1枚出す。
 * 物販型（楽天）やチケット型（購入額の3.3%）と違い、1件あたりの報酬が大きい型を
 * 意図の合う面に絞って置く（2026-11-10 社長指示・SR-1）。
 *
 * ## 描画される条件（3つとも満たしたときだけ）
 *  1. 記事の slug が APPLY_PLACEMENTS に載っている（明示の一覧。パターンでは拾わない）
 *  2. その案件の `href` にアフィリエイトのリンクが入っている
 *  3. その案件の `copyVerifiedAt` に、文言を公式で確かめた日が入っている
 * どれかが欠ければ null（何も描画しない）。提携の承認待ち・リンク未取得の案件は
 * `href: ''` のまま置いてあり、リンクを入れるまで本番の HTML は変わらない。
 *
 * ## 案件を有効にする手順
 *  1. ASP の管理画面でリンクを取り、`href` に入れる（テキスト素材の URL。https:// で始まるもの）
 *  2. 公式サイトでサービスの種類を確かめ、`heading`・`cta` を書き、`copyVerifiedAt` に日付を入れる。
 *     料金・特典・体験談は書かない（公式で確かめていないことを書かない＝docs/writing-rules.md）
 *  3. `node --import ./scripts/_ts-resolve.mjs scripts/check-apply-offers.mjs`（Node 24）を通す
 *
 * ## 置き場所の決まり
 *  - 凍結中・判定中の記事（docs/experiments-active.md）は一覧に入れない。検査スクリプトが止める。
 *  - noindex の記事・タイアップ記事には出さない。
 *  - AdSense の枠は触らない。位置は記事末尾（関連商品の下・FAQ の上）だけで、本文の途中には置かない
 *    （「アフィリ枠は In-article 広告の直前直後に置かない」2026-08-24 D-5・08-31 P-3）。
 */

import type { ReservationOffer } from '@/lib/reservation-cta';

export type ApplyProgram = {
  /** GA4 の item_id（`apply-<id>`）にも使う識別子 */
  id: string;
  asp: 'a8' | 'moshimo';
  /** アフィリエイトのリンク。空なら描画しない */
  href: string;
  /** 文言を公式サイトで確かめた日（YYYY-MM-DD）。空なら描画しない */
  copyVerifiedAt: string;
  /** PR ラベルの横の短い見出し */
  eyebrow: string;
  heading: string;
  cta: string;
};

/** 補足文は全案件で共通。内容・料金を当サイトでは言い切らず、公式へ送る。 */
const NOTE = '撮影の内容・料金・予約の空きは、公式サイトで確認してください。';
const NOTE_LESSON = '教室の内容・料金・体験の受付は、公式サイトで確認してください。';

export const APPLY_PROGRAMS: readonly (ApplyProgram & { note: string })[] = [
  // ---- 撮影（A8 提携中・リンクは既にリポジトリにあるもの） ----
  {
    // 提携 2026-06-22（広告主: ピクスタ株式会社）。リンクは本文中で 2026-06 から使用中のもの
    // （content/articles/shichigosan-fukusou-shashin-kanzen.md ほか）。
    // 文言の根拠: https://fotowa.com/ の title「出張撮影・出張カメラマンならfotowa」（2026-11-10 取得）
    id: 'fotowa',
    asp: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5WGE+BTOYB6+2NLY+HV7V6',
    copyVerifiedAt: '2026-11-10',
    eyebrow: '記念写真の撮影',
    heading: '出張撮影のfotowa（フォトワ）',
    cta: 'fotowa の公式サイトを見る →',
    note: NOTE,
  },
  {
    // 提携 2026-06-15（広告主: 株式会社うるる）。リンクは docs/a8-affiliate-urls.md の表にあるもの。
    // 文言の根拠: https://our-photo.co/ の title「出張撮影・家族写真のOurPhoto」（2026-11-10 取得）
    id: 'ourphoto',
    asp: 'a8',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5WGE+BT3IPE+58O8+64JTE',
    copyVerifiedAt: '2026-11-10',
    eyebrow: '記念写真の撮影',
    heading: '出張撮影のOurPhoto',
    cta: 'OurPhoto の公式サイトを見る →',
    note: NOTE,
  },

  // ---- 以下はリンク未取得。href が空のあいだは描画されない ----
  {
    // A8 提携中（広告主: 株式会社ファインネクスト・2026-05-15）。サービス名とリンクは未取得。
    id: 'a8-finenext',
    asp: 'a8',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '記念写真の撮影',
    heading: '',
    cta: '',
    note: NOTE,
  },
  {
    // A8 申請中（2026-11-10）。スタジオキャラット
    id: 'studio-caratt',
    asp: 'a8',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '記念写真の撮影',
    heading: '',
    cta: '',
    note: NOTE,
  },
  {
    // もしも 提携中（2026-11-10）。ラブグラフ（出張撮影のギフト購入）。リンク未取得
    id: 'lovegraph',
    asp: 'moshimo',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '記念写真の撮影',
    heading: '',
    cta: '',
    note: NOTE,
  },
  {
    // A8 申請中（2026-11-10）。ビースタジオ（こども英語教室）
    id: 'bestudio',
    asp: 'a8',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '習い事の体験',
    heading: '',
    cta: '',
    note: NOTE_LESSON,
  },
  {
    // A8 申請中（2026-11-10）。ペッピーキッズクラブ
    id: 'peppy',
    asp: 'a8',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '習い事の体験',
    heading: '',
    cta: '',
    note: NOTE_LESSON,
  },
  {
    // A8 申請中（2026-11-10）。椿音楽教室
    id: 'tsubaki-ongaku',
    asp: 'a8',
    href: '',
    copyVerifiedAt: '',
    eyebrow: '習い事の体験',
    heading: '',
    cta: '',
    note: NOTE_LESSON,
  },
];

/**
 * 記事 slug → 出す案件（左から順に、描画できる最初の1件を出す）。
 *
 * 選んだ基準（2026-11-10・origin/main と GSC 2026-10-10〜11-06 で確認）:
 *  - 行事（七五三・お宮参り・お食い初め・百日・ハーフバースデー・誕生日）が主題で、本文が記念写真に触れている
 *  - index（noindex でない）
 *  - docs/experiments-active.md の凍結 slug・処置・対照のどれでもない
 * 外したもの（理由は PR 本文）: 外食チェーンのお祝い膳の面（`*-okuizome-shichigosan`）、
 * 判定中の2本（bandotaro / sagami・実験32）、noindex の撮影・習い事の記事。
 *
 * 七五三・お宮参り（参拝の日に撮る）は fotowa、家で祝う行事は OurPhoto に分けた。
 * どちらも出張撮影のサービスで、優劣の根拠は無い。案件ごとにクリックを読めるようにするための割り振り。
 */
export const APPLY_PLACEMENTS: Readonly<Record<string, readonly string[]>> = {
  // 七五三・お宮参り
  'shichigosan-shokujikai-dokode': ['fotowa'],
  'shichigosan-fukusou-shashin-kanzen': ['fotowa'],
  'shichigosan-nenrei-junbi': ['fotowa'],
  'omiyamairi-ato-lunch-0saidzure': ['fotowa'],
  // お食い初め・百日・ハーフバースデー・誕生日
  '100ka-iwai-yarikata': ['ourphoto'],
  'okuizome-itsu-yarikata': ['ourphoto'],
  'kodomo-shokumeisai-yarikata': ['ourphoto'],
  'half-birthday-jun': ['ourphoto'],
  'tanjoubi-iwai-1sai': ['ourphoto'],
  // 習い事（リンク未取得のため、いまは何も出ない）
  'benesse-vs-dwe': ['bestudio'],
};

function isValidUrl(url: string): boolean {
  return /^https:\/\//i.test(url.trim());
}

/** 描画できる状態の案件か（リンクと、公式で確かめた文言の両方がある）。 */
export function isApplyProgramLive(p: ApplyProgram): boolean {
  return isValidUrl(p.href) && p.copyVerifiedAt !== '' && p.heading !== '' && p.cta !== '';
}

/**
 * 記事末尾に出す申込型の導線。対象外の記事・描画できる案件が無い記事は null。
 * タイアップ記事と noindex の記事の除外は呼び出し側（page.tsx）で行う。
 */
export function getApplyOffer(slug: string): ReservationOffer | null {
  const ids = APPLY_PLACEMENTS[slug];
  if (!ids) return null;
  for (const id of ids) {
    const p = APPLY_PROGRAMS.find((x) => x.id === id);
    if (!p || !isApplyProgramLive(p)) continue;
    return {
      href: p.href.trim(),
      heading: p.heading,
      note: p.note,
      cta: p.cta,
      itemId: `apply-${p.id}`,
      eyebrow: p.eyebrow,
      provider: p.asp,
    };
  }
  return null;
}
