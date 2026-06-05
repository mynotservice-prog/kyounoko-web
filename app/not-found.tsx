import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Icon } from '@/components/v2/V2Icon';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  description: 'お探しのページは移動または削除された可能性があります。',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <V2Frame header="sub" backHref="/" active="home">
      <div
        style={{
          padding: '60px 24px 80px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--v2-orange-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <V2Icon name="search" size={42} color="var(--v2-orange)" />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--v2-ink)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          ページが見つかりませんでした
        </h1>
        <p
          style={{
            color: 'var(--v2-ink-mute)',
            fontSize: 13.5,
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 360,
          }}
        >
          URLが間違っているか、記事が移動・削除された可能性があります。
          <br />
          トップから探すか、条件で再検索してください。
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <Link
            href="/"
            className="v2-btn-primary"
            style={{ minWidth: 140, padding: '12px 24px' }}
          >
            トップへ戻る
          </Link>
          <Link
            href="/search"
            style={{
              minWidth: 140,
              padding: '12px 24px',
              borderRadius: 'var(--v2-r-pill)',
              border: '1.5px solid var(--v2-orange)',
              color: 'var(--v2-orange-deep)',
              fontWeight: 800,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <V2Icon name="search" size={15} color="var(--v2-orange-deep)" />
            検索する
          </Link>
        </div>
      </div>
    </V2Frame>
  );
}
