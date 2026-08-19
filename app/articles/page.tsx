import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2ArticleRow } from '@/components/v2/V2Cards';
import { V2SectionHead } from '@/components/v2/V2Base';
import { getAllFileArticles } from '@/lib/articles';
import { articleToV2 } from '@/lib/v2-adapters';
import { articlePopularityRank } from '@/lib/article-popularity';
import { AdSlot } from '@/components/ads/AdSlot';
import { articleCategoryLabel } from '@/lib/article-categories';

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
 */

const PER_CATEGORY_PREVIEW = 8;

export const metadata: Metadata = {
  title: '記事一覧｜子連れ外食・おでかけの人気記事【きょうのこ】',
  description:
    'きょうのこの記事を人気順に一覧化。ファミレスのキッズメニュー・離乳食の持ち込み・ベビーチェアの有無から、区ごとの室内遊び場・水遊びスポットまで、0〜6歳の子連れで使える情報をまとめています。',
  alternates: { canonical: '/articles' },
  openGraph: {
    title: '記事一覧｜子連れ外食・おでかけの人気記事',
    description: '0〜6歳の子連れで使える記事を人気順に。',
    url: 'https://kyounoko.jp/articles',
  },
};

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
      <div className="v2-section" style={{ paddingTop: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>記事一覧</h1>
        <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', margin: 0 }}>
          0〜6歳の子連れで使える記事を、よく読まれている順に並べています。全{all.length}本。
        </p>
      </div>

      <div className="v2-section">
        <V2SectionHead title="よく読まれている記事" />
        {popular.map((a) => (
          <V2ArticleRow key={a.slug} a={articleToV2(a)} href={`/article/${a.slug}`} />
        ))}
      </div>

      <AdSlot placement="home-below-finder" />

      {categories.map(([slug, list]) => {
        const name = articleCategoryLabel(slug, list[0].categoryName);
        return (
        <div className="v2-section" key={slug}>
          <V2SectionHead title={name} />
          {list.slice(0, PER_CATEGORY_PREVIEW).map((a) => (
            <V2ArticleRow key={a.slug} a={articleToV2(a)} href={`/article/${a.slug}`} />
          ))}
          {list.length > PER_CATEGORY_PREVIEW && (
            <div style={{ padding: '8px 18px 0' }}>
              <Link
                href={`/category/${encodeURIComponent(list[0].category)}`}
                style={{ fontSize: 13, color: 'var(--v2-orange-deep)', fontWeight: 700 }}
              >
                {name}の記事をすべて見る（{list.length}本）
              </Link>
            </div>
          )}
        </div>
        );
      })}
    </V2Frame>
  );
}
