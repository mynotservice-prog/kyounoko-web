'use client';

import * as React from 'react';
import { wrapMoshimoRakuten } from '@/lib/moshimo';
import { wrapAmazonAssociate } from '@/lib/amazon';
import { trackEvent } from '@/lib/analytics';

export type AffiliateProvider =
  | 'amazon'
  | 'rakuten'
  | 'yahoo'
  | 'a8'
  | 'moshimo'
  | 'valuecommerce'
  | 'other';

export type AffiliateLinkProps = {
  href: string;
  title: string;
  subtitle?: string;
  price?: string;
  imageUrl?: string;
  provider: AffiliateProvider;
  /** PR バッジを表示するか（デフォルト true） */
  pr?: boolean;
  /** GA4 イベントで item_id として送る識別子（任意）。商品ID / slug など。 */
  itemId?: string;
};

const PROVIDER_LABELS: Record<AffiliateProvider, string> = {
  amazon: 'Amazon',
  rakuten: '楽天',
  yahoo: 'Yahoo!',
  a8: 'A8.net',
  moshimo: 'もしも',
  valuecommerce: 'バリューコマース',
  other: '公式サイト',
};

/**
 * provider 別の CTA 文言（買う動機を明示）。
 * 「○○で見る」だと弱いので、楽天はポイント還元、Amazon は配送、A8/もしもは特典を訴求。
 */
const PROVIDER_CTA: Record<AffiliateProvider, string> = {
  amazon: 'Amazonで価格を見る →',
  rakuten: '楽天で価格・ポイント還元を見る →',
  yahoo: 'Yahoo!ショッピングで見る →',
  a8: '公式サイトで詳細を見る →',
  moshimo: '公式サイトで詳細を見る →',
  valuecommerce: 'お得な購入先を見る →',
  other: '公式サイトを見る →',
};

/**
 * provider 別の補足キャッチコピー（CTA下に表示）。
 * 楽天: ポイント還元
 * Amazon: プライム配送
 * A8/もしも: 公式特典
 */
const PROVIDER_SUBCTA: Record<AffiliateProvider, string> = {
  amazon: 'プライム会員なら最短翌日着',
  rakuten: 'お買い物マラソン期間でポイントUP',
  yahoo: 'PayPayポイント還元あり',
  a8: '公式特典・キャンペーン適用可',
  moshimo: '公式特典・キャンペーン適用可',
  valuecommerce: '比較してお得な店舗で購入',
  other: '',
};

/**
 * アフィリエイトリンクの共通カード UI。
 * 景品表示法・ステマ規制対応のため、rel="sponsored nofollow noopener" と PR 表示を強制する。
 */
export function AffiliateLink({
  href,
  title,
  subtitle,
  price,
  imageUrl,
  provider,
  pr = true,
  itemId,
}: AffiliateLinkProps) {
  const providerLabel = PROVIDER_LABELS[provider];

  // href の健全性チェック（ランタイム防御）。
  // # / 空文字 / http(s) 以外のスキームは「遷移しない壊れたリンク」なので
  // カードごと描画しない。データ側は scripts/check-affiliate-links.mjs が
  // ビルド時に検査するが、ここでも二重に防御して壊れたリンクをユーザーに見せない。
  if (typeof href !== 'string' || !/^https?:\/\//i.test(href.trim())) {
    return null;
  }

  // provider別にアフィリエイトトラッキングを自動付与:
  //  - rakuten: もしも経由URL（NEXT_PUBLIC_MOSHIMO_* が設定されていれば）
  //  - amazon : アソシエイトtag（NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG が設定されていれば）
  // env 未設定 or 対象ドメイン外なら wrap関数は元URLをそのまま返す（no-op）。
  let finalHref = href;
  if (provider === 'rakuten') finalHref = wrapMoshimoRakuten(href);
  else if (provider === 'amazon') finalHref = wrapAmazonAssociate(href);

  return (
    <a
      href={finalHref}
      className="affiliate-card"
      target="_blank"
      rel="sponsored nofollow noopener"
      data-provider={provider}
      // クリックを GA4 に送る。item_id は明示渡しがなければ title をフォールバックに使う
      // （タイトル文字列でも識別性は十分。長すぎる場合は呼び出し側で itemId を明示すること）。
      onClick={() => {
        trackEvent('affiliate_click', { provider, item_id: itemId ?? title });
      }}
    >
      {imageUrl && (
        <div
          className="affiliate-card-thumb"
          role="img"
          aria-label={title}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="affiliate-card-body">
        <div className="affiliate-card-meta">
          <span className="affiliate-provider-tag">{providerLabel}</span>
          {pr && <span className="pr-label">PR</span>}
        </div>
        <h4 className="affiliate-card-title">{title}</h4>
        {subtitle && <p className="affiliate-card-subtitle">{subtitle}</p>}
        <div className="affiliate-card-footer">
          {price && <span className="affiliate-card-price">{price}</span>}
          <span className="affiliate-card-cta" aria-hidden="true">
            {PROVIDER_CTA[provider]}
          </span>
        </div>
        {PROVIDER_SUBCTA[provider] && (
          <p className="affiliate-card-subcta" aria-hidden="true">
            {PROVIDER_SUBCTA[provider]}
          </p>
        )}
      </div>
    </a>
  );
}
