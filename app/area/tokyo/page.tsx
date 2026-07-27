import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { WARD_NAMES } from '@/lib/tokyo-stations';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: '東京都のおでかけ｜区市町村から探す',
  description:
    '東京23区＋多摩エリアの市区町村から、0〜6歳の子連れで楽しめるおでかけ先を探せます。',
  alternates: { canonical: '/area/tokyo' },
};

const TAMA_CITIES = [
  '八王子市', '立川市', '町田市', '武蔵野市', '三鷹市',
  '調布市', '府中市', '国分寺市', '小金井市', '西東京市',
  '青梅市', '昭島市', '日野市', '東村山市', '国立市',
];

const WARD_ENTRIES = Object.entries(WARD_NAMES) as [string, string][];

export default function TokyoPage() {
  return (
    <V2Frame header="sub" active="area" backHref="/area">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="tower" size={24} color="var(--v2-orange)" />
          東京都
        </h1>
        <p className="v2-page-lead">区市町村から、おでかけ先を探せます。</p>
        <Link
          href="/today"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, textDecoration: 'none' }}
        >
          ✨ 東京で「今日の流れ」を作る（午前あそぶ→お昼→午後）→
        </Link>
      </div>

      <div className="v2-section" style={{ marginTop: 6 }}>
        <Link href="/search" className="v2-searchbar">
          <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
          区市町村名で検索
        </Link>
      </div>

      <div className="v2-sec-head" style={{ marginTop: 18 }}>
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>23区
        </div>
      </div>
      <div className="v2-section">
        <div className="v2-ward-list">
          {WARD_ENTRIES.map(([slug, name]) => (
            <Link key={slug} href={`/area/${slug}`} className="v2-ward-item">
              {name}
              <V2Icon name="chevron-right" size={18} color="#ccc" />
            </Link>
          ))}
        </div>
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>多摩エリア
        </div>
      </div>
      <div className="v2-section">
        <div className="v2-ward-list">
          {TAMA_CITIES.map((c) => (
            <Link
              key={c}
              href={`/area/${encodeURIComponent(c)}`}
              className="v2-ward-item"
            >
              {c}
              <V2Icon name="chevron-right" size={18} color="#ccc" />
            </Link>
          ))}
        </div>
      </div>

      <V2SectionHead title="人気エリア" more="" icon="sparkle" accent="rain" />
      <div className="v2-chip-scroll">
        {['toshima', 'itabashi', 'nerima', 'setagaya', 'shinjuku'].map((slug) => (
          <Link key={slug} href={`/area/${slug}`} className="v2-pop-chip">
            {WARD_NAMES[slug as keyof typeof WARD_NAMES]}
          </Link>
        ))}
      </div>

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
