import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: '画像クレジット｜きょうのこ',
  description: '本サイトで使用している外部ライセンス画像の出典・作者・ライセンス一覧。',
  alternates: { canonical: '/credits' },
  robots: { index: true, follow: true },
};

type Credit = {
  name: string;
  source: string;
  source_url: string;
  author: string;
  license: string;
  license_url: string;
  attribution_required: boolean;
  modified?: string;
};

type CreditMap = Record<string, Credit | string>;

function loadFacilityCredits(): Array<[string, Credit]> {
  const file = path.join(process.cwd(), 'public/img/facilities/_credits.json');
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as CreditMap;
  return Object.entries(raw)
    .filter((entry): entry is [string, Credit] =>
      entry[0].startsWith('/') && typeof entry[1] === 'object' && entry[1] !== null && 'license' in entry[1])
    .sort(([a], [b]) => a.localeCompare(b));
}

export default function CreditsPage() {
  const facilities = loadFacilityCredits();
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px', lineHeight: 1.85 }}>
      <nav style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 16 }}>
        <Link href="/">HOME</Link> / 画像クレジット
      </nav>
      <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 8px' }}>
        画像クレジット
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-sub)', margin: '0 0 28px' }}>
        本サイトで使用している外部ライセンス画像の出典・作者・ライセンスを掲載します。CC BY / CC BY-SA は表示義務に基づく掲載です。
      </p>

      <section>
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 12px' }}>
          公共施設の写真（Wikimedia Commons）
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {facilities.map(([imgPath, c]) => (
            <li
              key={imgPath}
              style={{
                display: 'flex',
                gap: 16,
                padding: '14px 0',
                borderTop: '1px solid var(--line)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: '0 0 120px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgPath} alt={c.name} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                <div style={{ color: 'var(--ink-sub)' }}>
                  Author: <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.author}</a>
                </div>
                <div style={{ color: 'var(--ink-sub)' }}>
                  License: <a href={c.license_url} target="_blank" rel="noopener noreferrer">{c.license}</a>
                </div>
                {c.modified ? (
                  <div style={{ color: 'var(--ink-mute)', fontSize: 12, marginTop: 2 }}>
                    Modified: {c.modified}
                  </div>
                ) : null}
                <div style={{ color: 'var(--ink-mute)', fontSize: 12, marginTop: 2 }}>
                  Source: <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.source}</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 12px' }}>
          その他の画像について
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-sub)' }}>
          サイト内のヒーロー画像の大半は、編集部または委託先が撮影・生成したオリジナルです。
          編集部宛のお問い合わせは <Link href="/contact">お問い合わせ</Link> ページから。
        </p>
      </section>
    </main>
  );
}
