'use client';

import * as React from 'react';
import Link from 'next/link';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import {
  CATALOG_CATEGORIES,
  CATALOG_CATEGORY_META,
  getSeasonalBadgeForCategory,
  type CatalogCategory,
  type CatalogItem,
} from '@/lib/items-catalog';

type TabValue = CatalogCategory | 'all';

type Props = {
  items: CatalogItem[];
  /**
   * 「◯月のおすすめ」バッジ判定に使う現在月 (1-12)。
   * サーバ側で JST から決定して渡す（ハイドレーションの日付差異を防ぐ）。
   */
  currentMonth?: number;
};

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'すべて' },
  ...CATALOG_CATEGORIES.map((c) => ({
    value: c as TabValue,
    label: CATALOG_CATEGORY_META[c].name,
  })),
];

/**
 * /items ページのカテゴリ切替タブ + カタログ表示。
 * 「すべて」タブではカテゴリごとのセクションに分けて表示し、
 * 各セクション末尾に関連比較記事へのリンクを添える。
 */
export function CategoryTabs({ items, currentMonth }: Props) {
  const [active, setActive] = React.useState<TabValue>('all');

  const visibleCategories: CatalogCategory[] =
    active === 'all' ? [...CATALOG_CATEGORIES] : [active];

  return (
    <div className="catalog-tabs-root">
      <div
        className="catalog-category-tabs"
        role="tablist"
        aria-label="カテゴリ切替"
      >
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                'catalog-category-tab' + (isActive ? ' is-active' : '')
              }
              onClick={() => setActive(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="catalog-sections">
        {visibleCategories.map((cat) => {
          const meta = CATALOG_CATEGORY_META[cat];
          const categoryItems = items.filter((item) => item.category === cat);
          if (categoryItems.length === 0) return null;

          const seasonalBadge =
            typeof currentMonth === 'number'
              ? getSeasonalBadgeForCategory(currentMonth, cat)
              : undefined;

          return (
            <section
              key={cat}
              className="catalog-section"
              aria-labelledby={`catalog-section-${cat}`}
            >
              <header className="catalog-section-head">
                <h2 id={`catalog-section-${cat}`}>{meta.name}</h2>
                <p>{meta.tagline}</p>
                {seasonalBadge && (
                  <span className="catalog-seasonal-badge">
                    {currentMonth}月のおすすめ · {seasonalBadge}
                  </span>
                )}
              </header>

              <div className="catalog-grid">
                {categoryItems.map((item) => (
                  <AffiliateLink
                    key={item.id}
                    href={item.href}
                    title={item.name}
                    subtitle={item.subtitle}
                    price={item.price}
                    provider={item.provider}
                    pr={false}
                  />
                ))}
              </div>

              {meta.relatedArticles.length > 0 && (
                <div className="catalog-section-links">
                  {meta.relatedArticles.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/article/${r.slug}`}
                      className="catalog-section-link"
                    >
                      ▶ {r.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
