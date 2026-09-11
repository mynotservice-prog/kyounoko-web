/**
 * 焼肉きんぐ: 公式店舗検索（www.yakiniku-king.jp/shop/、物語コーポレーション共通API）。
 * 店舗詳細ページの「店舗設備」欄（入り口スロープ/車椅子対応のトイレ/おむつ替えシート/店内禁煙…）を店舗ごとに集計。
 * 詳細は _monogatari.mjs。
 */
import { runAdapter } from './_lib.mjs';
import { crawlMonogatari } from './_monogatari.mjs';

// 公式「店舗設備」の表記 → 設備キー。店内禁煙・車椅子対応の駐車場・車椅子対応の座席・その他 は無視する
const LABELS = {
  stepFree: '入り口スロープ',
  diaperTable: 'おむつ替えシート',
  multiToilet: '車椅子対応のトイレ',
};

export async function crawl() {
  return crawlMonogatari({
    chain: 'yakinikuking',
    name: '焼肉きんぐ',
    brandKey: 'yakiniku_king',
    site: 'https://www.yakiniku-king.jp/',
    labels: LABELS,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
