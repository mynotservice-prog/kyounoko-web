/**
 * ココス: 公式店舗検索（maps.cocos-jpn.co.jp、ゼンショー系）。詳細は _zensho.mjs。
 * 検索APIで全店舗を列挙し、各店舗詳細ページの「サービス・設備」アイコンを集計する。
 */
import { runAdapter } from './_lib.mjs';
import { crawlZensho } from './_zensho.mjs';

export async function crawl() {
  return crawlZensho({ chain: 'cocos', name: 'ココス', base: 'https://maps.cocos-jpn.co.jp', brandName: 'ココス' });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
