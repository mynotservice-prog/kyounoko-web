/**
 * トップの「人気の記事」に出す slug（クリック数の多い順）。
 *
 * ⚠ **手で書き換えない。** `scripts/build-popular-articles.mjs` が Search Console の
 * 実クリックから `lib/popular-articles.json` を生成するので、ここはそれを読むだけ。
 *
 * ── なぜ自動化したか（2026-07-28 の実測）────────────────────────────────────
 * ここは元々「2026-05-25 時点のGSCデータを手で書き写した固定リスト」で、2か月放置され
 * 実績と乖離していた。GA4のセッション実測トップ3（ohsho-kids-menu 3,510 /
 * sushiro-kids-menu 1,551 / hoshino-morning-kosodate 1,543）が**1本も入っていなかった。**
 *
 * さらに `pageReferrer` で遷移を追うと、**トップから記事へ進むのは全遷移の12%**で、
 * 残りはトップ・カテゴリ・/today の間を回っていた。**いま読まれている記事を出していない
 * トップ**が、PV/ユーザー1.52の一因になっている。
 *
 * 更新: `node scripts/build-popular-articles.mjs`（週次想定）。ビルド時にAPIは叩かない。
 */
import popular from './popular-articles.json';

/**
 * 生成が失敗している・JSONが空のときに使う保険。
 * ここが使われている状態は「更新スクリプトが回っていない」ことを意味するので、
 * 気づけるように意図的に短くしてある。
 */
const FALLBACK_SLUGS: string[] = [
  'ohsho-kids-menu',
  'sushiro-kids-menu',
  'hoshino-morning-kosodate',
];

type PopularJson = { generatedAt?: string; source?: string; slugs?: string[] };

const data = popular as PopularJson;

export const POPULAR_ARTICLE_SLUGS: string[] =
  Array.isArray(data.slugs) && data.slugs.length > 0 ? data.slugs : FALLBACK_SLUGS;

/** いつ時点の実績か（鮮度を確認したいとき用）。 */
export const POPULAR_ARTICLES_GENERATED_AT: string = data.generatedAt ?? '';
