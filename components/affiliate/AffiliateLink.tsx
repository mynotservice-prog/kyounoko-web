import * as React from 'react';
import { wrapMoshimoRakuten } from '@/lib/moshimo';

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
}: AffiliateLinkProps) {
  const providerLabel = PROVIDER_LABELS[provider];

  // 楽天プロバイダの場合、env 設定済みなら自動的にもしも経由URLに変換。
  // 未設定 or 楽天URL以外なら href をそのまま使う（wrap 関数が no-op で返す）。
  const finalHref = provider === 'rakuten' ? wrapMoshimoRakuten(href) : href;

  return (
    <a
      href={finalHref}
      className="affiliate-card"
      target="_blank"
      rel="sponsored nofollow noopener"
      data-provider={provider}
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
            {providerLabel}で見る →
          </span>
        </div>
      </div>
    </a>
  );
}
