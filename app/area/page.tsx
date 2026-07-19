import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'エリアから探す｜きょうのこ',
  description:
    '東京都・関東エリアの子連れおでかけ先を地域別に探せます。23区・多摩・神奈川・埼玉・千葉まで網羅。',
  alternates: { canonical: '/area' },
};

type Pref = {
  id: string;
  name: string;
  sub: string;
  icon: V2IconName;
  color: string;
  href: string;
};

const PREFECTURES: Pref[] = [
  { id: 'tokyo', name: '東京都', sub: '23区＋多摩エリアのおでかけ情報', icon: 'tower', color: '#E0561F', href: '/area/tokyo' },
  { id: 'saitama', name: '埼玉県', sub: '埼玉県全域のおでかけ情報', icon: 'leaf', color: '#2E9D6B', href: '/area/saitama' },
  { id: 'kanagawa', name: '神奈川県', sub: '神奈川県全域のおでかけ情報', icon: 'ship', color: '#2E8BD4', href: '/area/kanagawa' },
  { id: 'chiba', name: '千葉県', sub: '千葉県全域のおでかけ情報', icon: 'boat', color: '#3DB5C9', href: '/area/chiba' },
  { id: 'ibaraki', name: '茨城県', sub: '茨城県全域のおでかけ情報', icon: 'flower', color: '#9B7BE0', href: '/area/ibaraki' },
  { id: 'tochigi', name: '栃木県', sub: '栃木県全域のおでかけ情報', icon: 'clover', color: '#7BB553', href: '/area/tochigi' },
  { id: 'gunma', name: '群馬県', sub: '群馬県全域のおでかけ情報', icon: 'onsen', color: '#E08A2E', href: '/area/gunma' },
];

const POPULAR_AREAS = [
  { t: '池袋・豊島区', icon: 'building' as V2IconName, accent: 'rain' as const, href: '/area/toshima' },
  { t: '世田谷区', icon: 'house' as V2IconName, accent: 'sun' as const, href: '/area/setagaya' },
  { t: '新宿区', icon: 'building' as V2IconName, accent: 'lunch' as const, href: '/area/shinjuku' },
  { t: '渋谷区', icon: 'building' as V2IconName, accent: 'event' as const, href: '/area/shibuya' },
  { t: '横浜市', icon: 'ship' as V2IconName, accent: 'rain' as const, href: '/station' },
];

const JSONLD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
    { '@type': 'ListItem', position: 2, name: 'エリアから探す', item: 'https://kyounoko.jp/area' },
  ],
};

export default function AreaPage() {
  return (
    <V2Frame header="sub" active="area" backHref="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_BREADCRUMB) }} />
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="pin" size={24} color="var(--v2-orange)" />
          エリアから探す
        </h1>
        <p className="v2-page-lead">
          お住まいの地域・おでかけ先からスポットを探せます。
        </p>
        <Link
          href="/today"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, textDecoration: 'none' }}
        >
          ✨ 駅をえらんで「今日の流れ」を作る（午前あそぶ→お昼→午後）→
        </Link>
      </div>

      <div className="v2-section" style={{ marginTop: 6 }}>
        <Link href="/search" className="v2-searchbar">
          <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
          エリア名・駅名で検索
        </Link>
      </div>

      <div className="v2-sec-head" style={{ marginTop: 18 }}>
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>都県から探す
        </div>
      </div>
      <div className="v2-section v2-pref-grid">
        {PREFECTURES.map((p) => (
          <Link key={p.id} href={p.href} className="v2-pref-card">
            <span
              className="v2-pref-ico"
              style={{ background: p.color + '1A', color: p.color }}
            >
              <V2Icon name={p.icon} size={24} />
            </span>
            <span className="v2-pref-info">
              <span className="v2-pref-name">{p.name}</span>
              <span className="v2-pref-sub">{p.sub}</span>
            </span>
            <V2Icon name="chevron-right" size={20} color="#ccc" />
          </Link>
        ))}
      </div>

      <V2SectionHead title="人気エリア" more="" icon="sparkle" accent="rain" />
      <div className="v2-section v2-pop-area-grid">
        {POPULAR_AREAS.map((ar) => {
          const a = V2_ACCENT[ar.accent];
          return (
            <Link key={ar.t} href={ar.href} className="v2-pop-area">
              <span className="v2-pop-area-ico" style={{ background: a.bg, color: a.c }}>
                <V2Icon name={ar.icon} size={20} />
              </span>
              {ar.t}
            </Link>
          );
        })}
      </div>
      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
