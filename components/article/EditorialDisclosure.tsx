/**
 * ランキング・比較記事の評価基準開示バナー。
 * 景表法対応: 「No.1」「最強」等の最上級表現を使う記事に必ず配置する。
 */
export function EditorialDisclosure({ variant = 'ranking' }: { variant?: 'ranking' | 'affiliate' | 'pr' } = {}) {
  if (variant === 'ranking') {
    return (
      <div
        style={{
          background: '#fff9ef',
          border: '1px solid #e2b39a',
          borderRadius: 8,
          padding: '10px 14px',
          margin: '16px 0 24px',
          fontSize: 12,
          color: 'var(--ink-sub)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#c4704f' }}>評価基準の開示</strong>
        <br />
        本記事のランキング・No.1等の表記は、<strong>きょうのこ編集部が0-6歳の子育て家庭の実用性観点で主観的に評価した順位</strong>です。
        第三者機関の調査に基づくものではありません。商品の効果・効能は個人差があり、購入前に必ず各公式サイト・販売店でご確認ください。
      </div>
    );
  }

  if (variant === 'pr') {
    return (
      <div
        style={{
          background: '#f5e0d4',
          border: '1px solid #e2b39a',
          borderRadius: 8,
          padding: '10px 14px',
          margin: '0 0 20px',
          fontSize: 12,
          color: '#8a4e2e',
          lineHeight: 1.6,
        }}
      >
        <strong>PR：</strong> 本記事はアフィリエイトリンクを含みます。記事内で紹介した商品が購入された場合、当サイトに収益が発生することがあります。商品選定は編集部独自の基準で行っており、収益の有無が評価順に影響することはありません。
      </div>
    );
  }

  return null;
}
