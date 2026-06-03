import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import {
  V2SpotCardV,
  V2EventCard,
  V2FeatureCardV,
  V2ArticleRow,
} from '@/components/v2/V2Cards';
import {
  V2Img,
  V2SectionHead,
  V2Tag,
} from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT } from '@/components/v2/V2Icon';
import {
  ARTICLES,
  EVENTS,
  FEATURES,
  IMG,
  POPULAR_AREAS,
  QUICK_SEARCH,
  SPOTS,
} from './_data';

export default function V2TopPage() {
  return (
    <V2Frame header="home" active="home">
      {/* Hero */}
      <div className="v2-hero">
        <div className="v2-hero-photo">
          <V2Img src={IMG.family[0]} seed="hero-family" alt="親子おでかけ" />
        </div>
        <div className="v2-hero-copy">
          <div className="v2-hero-h1">
            今日、
            <br />
            どこ行く？
          </div>
          <div className="v2-hero-sub">
            年齢・天気・エリアから
            <br />
            ぴったりのおでかけ先が見つかる！
          </div>
        </div>
      </div>

      {/* Search panel */}
      <div className="v2-search-panel">
        <div className="v2-sp-fields">
          <Link href="/v2/search" className="v2-sp-field">
            <span className="v2-sp-field-ico" style={{ background: 'var(--v2-c-sun-bg)' }}>
              <V2Icon name="baby" size={16} color="var(--v2-c-sun)" />
            </span>
            <span className="v2-sp-field-txt">
              <span className="v2-sp-field-lab">年齢</span>
              <span className="v2-sp-field-val">
                1〜3歳 <V2Icon name="chevron-down" size={12} color="#bbb" />
              </span>
            </span>
          </Link>
          <Link href="/v2/search" className="v2-sp-field">
            <span className="v2-sp-field-ico" style={{ background: 'var(--v2-c-rain-bg)' }}>
              <V2Icon name="umbrella" size={15} color="var(--v2-c-rain)" />
            </span>
            <span className="v2-sp-field-txt">
              <span className="v2-sp-field-lab">天気</span>
              <span className="v2-sp-field-val">
                雨の日 <V2Icon name="chevron-down" size={12} color="#bbb" />
              </span>
            </span>
          </Link>
          <Link href="/v2/search" className="v2-sp-field">
            <span className="v2-sp-field-ico" style={{ background: 'var(--v2-c-lunch-bg)' }}>
              <V2Icon name="pin" size={15} color="var(--v2-c-lunch)" />
            </span>
            <span className="v2-sp-field-txt">
              <span className="v2-sp-field-lab">エリア</span>
              <span className="v2-sp-field-val">
                豊島区 <V2Icon name="chevron-down" size={12} color="#bbb" />
              </span>
            </span>
          </Link>
        </div>
        <Link
          href="/v2/search"
          className="v2-btn-primary"
          style={{ marginTop: 12 }}
        >
          <V2Icon name="search" size={19} color="#fff" /> 探す
        </Link>
      </div>

      {/* Quick search */}
      <div className="v2-sec-head" style={{ marginTop: 24 }}>
        <div className="v2-sec-title">クイック検索</div>
        <span className="v2-sec-more mute" style={{ fontSize: 12 }}>
          タップでかんたん検索！
        </span>
      </div>
      <div className="v2-quick-grid">
        {QUICK_SEARCH.map((q) => {
          const a = V2_ACCENT[q.accent];
          return (
            <Link key={q.t} href="/v2/search" className="v2-quick-item">
              <span className="v2-quick-ico" style={{ background: a.bg }}>
                <V2Icon name={q.icon} size={26} color={a.c} />
              </span>
              <span className="v2-quick-label">{q.t}</span>
            </Link>
          );
        })}
      </div>

      {/* 人気スポット */}
      <V2SectionHead title="人気スポット" moreHref="/v2/search" />
      <div className="v2-hscroll">
        {SPOTS.slice(0, 5).map((s, i) => (
          <V2SpotCardV key={s.id} spot={s} rank={i + 1} />
        ))}
      </div>

      {/* Event banner */}
      <Link href="/v2/search" className="v2-banner">
        <span className="v2-banner-ico">
          <V2Icon name="calendar" size={22} color="var(--v2-c-event)" />
        </span>
        <span className="v2-banner-txt">
          <span className="v2-banner-title">今週のイベントをチェック！</span>
          <span className="v2-banner-sub">親子で楽しめるイベントがたくさん</span>
        </span>
        <V2Icon name="chevron-right" size={20} color="#c9b9a8" />
      </Link>

      {/* 今週のイベント */}
      <V2SectionHead title="今週のイベント" moreHref="/v2/search" />
      <div className="v2-hscroll">
        {EVENTS.slice(0, 5).map((ev) => (
          <V2EventCard key={ev.id} ev={ev} href="/v2/search" />
        ))}
      </div>

      {/* 特集 */}
      <V2SectionHead title="特集" moreHref="/v2/feature" />
      <div className="v2-hscroll">
        {FEATURES.map((f) => (
          <V2FeatureCardV key={f.id} f={f} />
        ))}
      </div>

      {/* 人気の記事 */}
      <V2SectionHead title="人気の記事" moreHref="/v2/feature" />
      <div className="v2-section">
        {ARTICLES.map((a) => (
          <V2ArticleRow
            key={a.id}
            a={a}
            href={a.goLunch ? '/v2/lunch' : '/v2/feature/rainy'}
          />
        ))}
      </div>

      {/* エリアから探す */}
      <V2SectionHead title="エリアから探す" moreHref="/v2/area" />
      <div className="v2-area-chips">
        {POPULAR_AREAS.map((ar) => {
          const a = V2_ACCENT[ar.accent];
          return (
            <Link
              key={ar.t}
              href="/v2/area/toshima"
              className="v2-area-chip"
            >
              <span className="v2-area-chip-ico" style={{ background: a.bg }}>
                <V2Icon name={ar.icon as 'building'} size={22} color={a.c} />
              </span>
              <span className="v2-area-chip-lab">{ar.t}</span>
            </Link>
          );
        })}
      </div>

      {/* 最近見たスポット */}
      <V2SectionHead title="最近見たスポット" muteMore />
      <div className="v2-hscroll">
        {[SPOTS[0], SPOTS[4], SPOTS[2], SPOTS[3]].map((s, i) => (
          <Link
            key={s.id + i}
            href={`/v2/spot/${s.id}`}
            className="v2-card-mini"
            style={{ width: 148 }}
          >
            <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
              <V2Img src={s.img} seed={s.id + 'r'} alt={s.name} />
            </div>
            <div className="v2-card-mini-title">{s.name}</div>
            <div className="v2-tag-row">
              {s.tags.slice(0, 2).map((t, j) => (
                <V2Tag key={j} label={t.t} tone={t.k} />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="v2-foot">
        <div className="v2-foot-links">
          <a>運営者情報</a>
          <a>お問い合わせ</a>
          <a>利用規約</a>
          <a>プライバシーポリシー</a>
        </div>
        <div className="v2-foot-copy">© 2026 きょうのこ</div>
      </div>
    </V2Frame>
  );
}
