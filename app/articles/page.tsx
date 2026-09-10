import '@/app/styles/list-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2Tag } from '@/components/v2/V2Base';
import { getAllFileArticles, type FileArticleMeta } from '@/lib/articles';
import { articleToV2 } from '@/lib/v2-adapters';
import { articlePopularityRank } from '@/lib/article-popularity';
import { AdSlot } from '@/components/ads/AdSlot';
import { articleCategoryLabel } from '@/lib/article-categories';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkFooter } from '@/components/kk/KkFooter';

export const revalidate = 3600;

/**
 * 記事一覧（人気順）。
 *
 * 背景（2026-07-31）: GSC実測で記事はサイト全クリックの81.5%・1ページあたり39クリックを
 * 生んでいる最大の面だが、グローバルナビに導線が1つも無く、記事一覧ページ自体が
 * 存在しなかった。/category/ は7ページ3クリック、/tag/ は0クリックで受け皿になっていない。
 * 検索順位を動かす施策ではなく（内部リンクと順位の相関は実測 r=-0.22）、
 * サイト内回遊＝PV＝AdSense収益を狙う導線として新設する。
 *
 * 並び順は lib/article-popularity.ts（GSC90日のクリック数）。未掲載は更新日の新しい順。
 *
 * 2026-09-10 リニューアル（docs/renewal-2026-09.md §2 / §3-0）:
 * カード（v2-art-row）をやめ、罫線区切りの行リスト（kk-rows / kk-row）に統一。
 * 人気順のブロックだけ順位番号を出し、カテゴリ別は写真＋タイトルの静かな行にする。
 * テキスト・リンク・画像srcは一切変えていない（見出しタグも h1 のみのまま）。
 */

const PER_CATEGORY_PREVIEW = 8;

export const metadata: Metadata = {
  title: '記事一覧｜子連れ外食・おでかけの人気記事',
  description:
    'きょうのこの記事を人気順に一覧化。ファミレスのキッズメニュー・離乳食の持ち込み・ベビーチェアの有無から、区ごとの室内遊び場・水遊びスポットまで、0〜6歳の子連れで使える情報をまとめています。',
  alternates: { canonical: '/articles' },
  openGraph: {
    title: '記事一覧｜子連れ外食・おでかけの人気記事',
    description: '0〜6歳の子連れで使える記事を人気順に。',
    url: 'https://kyounoko.jp/articles',
  },
};

/**
 * 記事1本の行。
 * 旧 V2ArticleRow と同じ要素（サムネ・タイトル・抜粋・タグ）を同じ順序で出す。
 * rank を渡したときだけ順位番号を左に置き、サムネを右に回す（トップの人気ランキングと同じ形）。
 */
function ArticleRow({ a, rank }: { a: FileArticleMeta; rank?: number }) {
  const v = articleToV2(a);
  const thumb = (
    <span className="kk-row-thumb">
      <V2Img src={v.img} seed={a.slug} alt={a.title} />
    </span>
  );
  return (
    <Link href={`/article/${a.slug}`} className="kk-row lv3-row">
      {rank !== undefined ? <span className="kk-row-num">{rank}</span> : thumb}
      <span className="kk-row-body">
        <span className="kk-row-title">{a.title}</span>
        {v.sub && <span className="kk-row-sub">{v.sub}</span>}
        {v.tags && v.tags.length > 0 && (
          <span className="lv3-tags">
            {v.tags.map((t, i) => (
              <V2Tag key={i} label={t} tone={i === 0 ? 'age' : ''} />
            ))}
          </span>
        )}
      </span>
      {rank !== undefined ? thumb : null}
    </Link>
  );
}

export default function ArticlesIndexPage() {
  const all = getAllFileArticles().filter((a) => !a.noindex);

  const sorted = [...all].sort((a, b) => {
    const ra = articlePopularityRank(a.slug);
    const rb = articlePopularityRank(b.slug);
    if (ra !== rb) return ra - rb;
    // 人気データに無いものは更新日の新しい順
    return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
  });

  const popular = sorted.slice(0, 30);

  // カテゴリ別（人気順を保ったままグルーピング）。
  // キーは表示名ではなく category スラッグ。表示名で束ねると frontmatter の表記揺れの数だけ
  // セクションが割れ、見出しに `yakudatsu` のような生スラッグが出る（実際に出ていた）。
  const byCategory = new Map<string, typeof sorted>();
  for (const a of sorted) {
    const key = a.category || 'その他';
    const list = byCategory.get(key);
    if (list) list.push(a);
    else byCategory.set(key, [a]);
  }
  // カテゴリの並びも「そのカテゴリの最上位記事の人気順」に従う
  const categories = [...byCategory.entries()].sort(
    (x, y) => articlePopularityRank(x[1][0].slug) - articlePopularityRank(y[1][0].slug),
  );

  return (
    <V2Frame active="articles">
      <div className="list-v3">
        <header className="lv3-head">
          <h1 className="lv3-h1">記事一覧</h1>
          <p className="lv3-lead">
            0〜6歳の子連れで使える記事を、よく読まれている順に並べています。全{all.length}本。
          </p>
        </header>

        <section className="kk-sec">
          <KkSectionTitle as="div" title="よく読まれている記事">
            {/* 旧実装のダミーボタン（押しても何も起きない「もっと見る」）は文言だけ残して静かな注記にする */}
            <span className="lv3-more-static">もっと見る</span>
          </KkSectionTitle>
          <div className="kk-rows grid2">
            {popular.map((a, i) => (
              <ArticleRow key={a.slug} a={a} rank={i + 1} />
            ))}
          </div>
        </section>

        <div className="lv3-ad">
          <AdSlot placement="home-below-finder" />
        </div>

        {categories.map(([slug, list]) => {
          const name = articleCategoryLabel(slug, list[0].categoryName);
          const hasMore = list.length > PER_CATEGORY_PREVIEW;
          // 「もっと見る」の遷移先は下の「すべて見る」と同じ URL にする（リンク集合を変えない）。
          const moreHref = `/category/${encodeURIComponent(list[0].category)}`;
          return (
            <section className="kk-sec" key={slug}>
              <KkSectionTitle as="div" title={name} moreHref={hasMore ? moreHref : undefined} more="もっと見る">
                {hasMore ? undefined : <span className="lv3-more-static">もっと見る</span>}
              </KkSectionTitle>
              <div className="kk-rows grid2">
                {list.slice(0, PER_CATEGORY_PREVIEW).map((a) => (
                  <ArticleRow key={a.slug} a={a} />
                ))}
              </div>
              {hasMore && (
                <div className="lv3-sec-foot">
                  <Link href={moreHref} className="kk-btn outline sm">
                    {name}の記事をすべて見る（{list.length}本）
                  </Link>
                </div>
              )}
            </section>
          );
        })}

        <KkLineCard placement="list" />
        <KkAddToHomeCard placement="list" />
        <KkFooter />
      </div>
    </V2Frame>
  );
}
