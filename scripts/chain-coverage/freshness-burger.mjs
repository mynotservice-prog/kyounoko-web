/**
 * フレッシュネスバーガー: 公式店舗検索（search.freshnessburger.co.jp、MEO Cloud製）。詳細は _canly.mjs。
 * 絞り込み条件「設備」（FREE-WiFi／コンセントあり／完全禁煙／喫煙専用室あり／モバイル席注文／モバイルオーダー／フードコート）には
 * 家族向け項目が無い。絞り込み条件「メニュー」（モーニング／生ビール／瓶ビール／キッズセット／ベーカリー／Plus＋カフェ／
 * ロングポテト／ジェラート／クレープ）の「キッズセット」を、店舗ごとのお子様メニュー取扱い（kidsMenu）として数える。
 * ※ キッズセットは設備ではなくメニューの取扱い有無なので、記事側では「キッズセット取扱店」と読む。
 */
import { runAdapter } from './_lib.mjs';
import { crawlCanly } from './_canly.mjs';

export async function crawl() {
  return crawlCanly({
    chain: 'freshness-burger',
    name: 'フレッシュネスバーガー',
    source: 'https://search.freshnessburger.co.jp/',
    companyId: 630,
    categoryId: 1467,
    categoryTitle: 'メニュー',
    labels: { kidsMenu: 'キッズセット' },
    note: '絞り込み条件「設備」（FREE-WiFi・コンセントあり・完全禁煙・喫煙専用室あり・モバイル席注文・モバイルオーダー・フードコート）には家族向け項目が無い。「キッズセット」はメニュー取扱いの有無であり設備ではない',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
