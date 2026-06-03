import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT } from '@/components/v2/V2Icon';
import { POPULAR_AREAS, PREFECTURES } from '../_data';

export default function V2AreaListPage() {
  return (
    <V2Frame header="sub" active="search" backHref="/v2">
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
      </div>

      <div className="v2-section" style={{ marginTop: 6 }}>
        <div className="v2-searchbar">
          <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
          エリア名・駅名で検索
        </div>
      </div>

      <div className="v2-sec-head" style={{ marginTop: 18 }}>
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>都県から探す
        </div>
      </div>
      <div className="v2-section v2-pref-grid">
        {PREFECTURES.map((p) => {
          const href = p.toTokyo ? '/v2/area/tokyo' : `/v2/area/pref-${p.id}`;
          return (
            <Link key={p.id} href={href} className="v2-pref-card">
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
          );
        })}
      </div>

      <V2SectionHead title="人気エリア" more="" icon="sparkle" accent="rain" />
      <div className="v2-section v2-pop-area-grid">
        {POPULAR_AREAS.map((ar) => {
          const a = V2_ACCENT[ar.accent];
          return (
            <Link
              key={ar.t}
              href="/v2/area/toshima"
              className="v2-pop-area"
            >
              <span
                className="v2-pop-area-ico"
                style={{ background: a.bg, color: a.c }}
              >
                <V2Icon name={ar.icon as 'building'} size={20} />
              </span>
              {ar.t}
            </Link>
          );
        })}
      </div>
      <div style={{ height: 16 }}></div>
    </V2Frame>
  );
}
