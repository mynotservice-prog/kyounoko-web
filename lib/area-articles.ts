/**
 * 駅ページ → エリア記事（室内遊び場・水遊び）への内部リンク。
 *
 * 背景（2026-09-12 GSC実測）: 「エリア×子供×遊び場」記事（shitsunai-asobi-*）は1本あたり
 * 28日69クリックでチェーン記事の4倍の効率だが、平均順位が6〜7位で止まっている。
 * 順位を分けるのは被リンクと内部リンク（docs/strategy-2026-09.md §2）。
 * 駅ページは区・市ごとに数十本あり、そこからエリア記事へ張ることで内部リンクを集める。
 *
 * 対応づけは slug の規則ではなく**記事タイトルの先頭「〇〇区の／〇〇市の」**で行う。
 * 駅側の regionLabel（東京23区=区名、神奈川=市名）と、記事タイトルの地名が一致するものだけ出す。
 * 埼玉・千葉の駅は regionLabel が県名なので対象外（該当記事が無ければ何も出さない）。
 */
import { getAllFileArticles, type FileArticleMeta } from './articles';

export type AreaArticleLink = { href: string; label: string; title: string };

const SERIES: Array<{ re: RegExp; label: string; order: number }> = [
  { re: /^shitsunai-asobi-/, label: '室内遊び場', order: 0 },
  { re: /^mizuasobi-/, label: '水遊び・じゃぶじゃぶ池', order: 1 },
];

let cache: Map<string, AreaArticleLink[]> | null = null;

function build(): Map<string, AreaArticleLink[]> {
  const map = new Map<string, Array<AreaArticleLink & { order: number }>>();
  for (const a of getAllFileArticles() as FileArticleMeta[]) {
    if (a.noindex) continue;
    const s = SERIES.find((x) => x.re.test(a.slug));
    if (!s) continue;
    const m = a.title.match(/^(.+?(?:区|市))の/);
    if (!m) continue;
    const list = map.get(m[1]) ?? [];
    list.push({ href: `/article/${a.slug}`, label: s.label, title: a.title, order: s.order });
    map.set(m[1], list);
  }
  const out = new Map<string, AreaArticleLink[]>();
  for (const [k, v] of map) {
    v.sort((x, y) => x.order - y.order);
    out.set(k, v.map(({ href, label, title }) => ({ href, label, title })));
  }
  return out;
}

/** regionLabel（例: '中野区' '川崎市'）に対応するエリア記事。無ければ空配列 */
export function getAreaArticleLinks(regionLabel: string): AreaArticleLink[] {
  if (!regionLabel) return [];
  if (!cache) cache = build();
  return cache.get(regionLabel) ?? [];
}
