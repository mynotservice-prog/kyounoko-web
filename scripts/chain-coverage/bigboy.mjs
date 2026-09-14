/**
 * ビッグボーイ: 公式店舗検索（maps.bigboyjapan.co.jp、ゼンショー系）。詳細は _zensho.mjs。
 * 同じ検索にヴィクトリアステーションも載るので、ブランド「ビッグボーイ」（brand=6）だけを数える。
 */
import { runAdapter } from './_lib.mjs';
import { crawlZensho } from './_zensho.mjs';

export async function crawl() {
  return crawlZensho({ chain: 'bigboy', name: 'ビッグボーイ', base: 'https://maps.bigboyjapan.co.jp', brandName: 'ビッグボーイ', brandParam: '6' });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
