'use client';

import React, { use as usePromise } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import {
  V2SpotMini,
  V2EventCard,
  V2ArticleRow,
} from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead, V2FavBtn } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import {
  ARTICLES,
  EVENTS,
  FEATURES,
  IMG,
  LUNCH,
  PREF_META,
  PREFECTURES,
  SPOTS,
} from '../../_data';

const CATS = ['すべて', 'スポット', 'ランチ', 'イベント', '特集'] as const;
type Cat = (typeof CATS)[number];

export default function V2AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = usePromise(params);
  const decoded = decodeURIComponent(slug);

  // pref-xxx の場合は県ページとして扱う
  if (decoded.startsWith('pref-')) {
    const id = decoded.replace('pref-', '');
    return <PrefecturePage id={id} />;
  }

  const name = decoded === 'toshima' ? '豊島区' : decoded;
  const [cat, setCat] = React.useState<Cat>('すべて');
  const areaSpots = SPOTS.filter((s) => s.area === name);
  const spots = (areaSpots.length ? areaSpots : SPOTS).slice(0, 6);
  const show = (c: Cat) => cat === 'すべて' || cat === c;

  return (
    <V2Frame header="sub" active="search" backHref="/v2/area/tokyo">
      <div className="v2-area-hero">
        <V2Img
          src={spots[0] ? spots[0].img : IMG.park[0]}
          seed={'ah' + name}
          alt={name}
        />
        <div className="v2-area-hero-grad"></div>
        <div className="v2-area-hero-copy">
          <div className="v2-area-hero-title">{name}のおでかけ</div>
          <div className="v2-area-hero-sub">
            子どもと楽しめるスポットが{spots.length * 3}件
          </div>
        </div>
      </div>
      <div className="v2-page-head" style={{ paddingTop: 14 }}>
        <p className="v2-page-lead" style={{ marginTop: 0 }}>
          {name}
          で子どもと楽しめるスポット・ランチ・イベントをまとめました。雨の日も晴れの日も、近くのおでかけ先がきっと見つかります。
        </p>
      </div>

      <div className="v2-cat-tabs">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={'v2-cat-tab' + (cat === c ? ' on' : '')}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {show('スポット') && (
        <>
          <V2SectionHead title="人気スポット" moreHref="/v2/search" />
          <div className="v2-hscroll">
            {spots.map((s, i) => (
              <V2SpotMini key={s.id} spot={s} rank={i + 1} />
            ))}
          </div>
        </>
      )}

      {show('ランチ') && (
        <>
          <V2SectionHead title="人気ランチ" moreHref="/v2/lunch" />
          <div className="v2-hscroll">
            {LUNCH.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href="/v2/lunch"
                className="v2-card-mini"
                style={{ width: 158 }}
              >
                <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                  <V2Img src={s.img} seed={s.id + 'a'} alt={s.name} />
                </div>
                <div className="v2-card-mini-title">{s.name}</div>
                <div className="v2-row" style={{ justifyContent: 'space-between' }}>
                  <span className="v2-tag rain">{s.tags[0]}</span>
                  <V2FavBtn id={s.id} variant="static" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {show('イベント') && (
        <>
          <V2SectionHead title="開催中のイベント" moreHref="/v2/search" />
          <div className="v2-hscroll">
            {EVENTS.slice(0, 4).map((ev) => (
              <V2EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </>
      )}

      {show('特集') && (
        <>
          <V2SectionHead title="このエリアの特集" moreHref="/v2/feature" />
          <div className="v2-hscroll">
            {FEATURES.slice(0, 3).map((f) => (
              <Link
                key={f.id}
                href={`/v2/feature/${f.id}`}
                className="v2-feat-overlay"
              >
                <V2Img src={f.img} seed={f.id + 'ad'} alt={f.title} />
                <div className="v2-feat-overlay-grad"></div>
                <div className="v2-feat-overlay-title">{f.short}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      <V2SectionHead title="近隣エリア" more="" />
      <div className="v2-chip-scroll">
        {['板橋区', '練馬区', '北区', '文京区', '新宿区']
          .filter((n) => n !== name)
          .map((c) => (
            <Link key={c} href={`/v2/area/${c}`} className="v2-pop-chip">
              <V2Icon
                name="pin"
                size={14}
                color="var(--v2-orange)"
                style={{ verticalAlign: '-2px', marginRight: 3 }}
              />
              {c}
            </Link>
          ))}
      </div>

      <V2SectionHead title="関連記事" more="" />
      <div className="v2-section">
        {ARTICLES.map((a) => (
          <V2ArticleRow
            key={a.id}
            a={a}
            href={a.goLunch ? '/v2/lunch' : '/v2/feature/rainy'}
          />
        ))}
      </div>

      <div style={{ height: 16 }}></div>
    </V2Frame>
  );
}

/* ---------- 都県ページ（埼玉・神奈川・千葉…） ---------- */
function PrefecturePage({ id }: { id: string }) {
  const pref = PREFECTURES.find((p) => p.id === id);
  const meta = PREF_META[id] || { hero: IMG.park[0], cities: [] as string[] };
  const name = pref?.name || id;
  const [cat, setCat] = React.useState<Cat>('すべて');
  const show = (c: Cat) => cat === 'すべて' || cat === c;

  return (
    <V2Frame header="sub" active="search" backHref="/v2/area">
      <div className="v2-area-hero">
        <V2Img src={meta.hero} seed={'pf' + id} alt={name} />
        <div className="v2-area-hero-grad"></div>
        <div className="v2-area-hero-copy">
          <div className="v2-area-hero-title">{name}のおでかけ</div>
          <div className="v2-area-hero-sub">
            市区町村・カテゴリからスポットを探せます
          </div>
        </div>
      </div>
      <div className="v2-page-head" style={{ paddingTop: 14 }}>
        <p className="v2-page-lead" style={{ marginTop: 0 }}>
          {name}
          で子どもと楽しめるおでかけ先をまとめました。お住まいの市区町村や、雨の日・無料などの条件から探せます。
        </p>
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>市区町村から探す
        </div>
      </div>
      <div className="v2-section v2-pop-area-grid">
        {meta.cities.map((c: string) => (
          <Link key={c} href={`/v2/area/${c}`} className="v2-pop-area">
            <span
              className="v2-pop-area-ico"
              style={{ background: 'var(--v2-orange-soft)', color: 'var(--v2-orange)' }}
            >
              <V2Icon name="pin" size={18} />
            </span>
            {c}
          </Link>
        ))}
      </div>

      <div className="v2-cat-tabs">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={'v2-cat-tab' + (cat === c ? ' on' : '')}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {show('スポット') && (
        <>
          <V2SectionHead title="人気スポット" moreHref="/v2/search" />
          <div className="v2-hscroll">
            {SPOTS.slice(0, 6).map((s, i) => (
              <V2SpotMini key={s.id} spot={s} rank={i + 1} />
            ))}
          </div>
        </>
      )}
      {show('ランチ') && (
        <>
          <V2SectionHead title="人気ランチ" moreHref="/v2/lunch" />
          <div className="v2-hscroll">
            {LUNCH.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href="/v2/lunch"
                className="v2-card-mini"
                style={{ width: 158 }}
              >
                <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                  <V2Img src={s.img} seed={s.id + 'p'} alt={s.name} />
                </div>
                <div className="v2-card-mini-title">{s.name}</div>
                <div className="v2-row" style={{ justifyContent: 'space-between' }}>
                  <span className="v2-tag rain">{s.tags[0]}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {show('イベント') && (
        <>
          <V2SectionHead title="開催中のイベント" moreHref="/v2/search" />
          <div className="v2-hscroll">
            {EVENTS.slice(0, 4).map((ev) => (
              <V2EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </>
      )}
      {show('特集') && (
        <>
          <V2SectionHead title={name + 'の特集'} moreHref="/v2/feature" />
          <div className="v2-hscroll">
            {FEATURES.slice(0, 3).map((f) => (
              <Link
                key={f.id}
                href={`/v2/feature/${f.id}`}
                className="v2-feat-overlay"
              >
                <V2Img src={f.img} seed={f.id + 'pf'} alt={f.title} />
                <div className="v2-feat-overlay-grad"></div>
                <div className="v2-feat-overlay-title">{f.short}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      <V2SectionHead title="近隣の都県" more="" />
      <div className="v2-chip-scroll">
        {PREFECTURES.filter((p) => p.name !== name).map((p) => (
          <Link
            key={p.id}
            href={p.toTokyo ? '/v2/area/tokyo' : `/v2/area/pref-${p.id}`}
            className="v2-pop-chip"
          >
            <V2Icon
              name="pin"
              size={14}
              color="var(--v2-orange)"
              style={{ verticalAlign: '-2px', marginRight: 3 }}
            />
            {p.name}
          </Link>
        ))}
      </div>

      <V2SectionHead title="関連記事" more="" />
      <div className="v2-section">
        {ARTICLES.map((a) => (
          <V2ArticleRow
            key={a.id}
            a={a}
            href={a.goLunch ? '/v2/lunch' : '/v2/feature/rainy'}
          />
        ))}
      </div>
      <div style={{ height: 16 }}></div>
    </V2Frame>
  );
}
