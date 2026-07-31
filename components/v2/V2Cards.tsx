'use client';

import Link from 'next/link';
import React from 'react';
import { V2Icon } from './V2Icon';
import { V2Img, V2FavBtn, V2Tag } from './V2Base';

type Tag = { t: string; k?: '' | 'age' | 'rain' | 'feat' };

/**
 * 保存ボタンに渡すIDを、スポット詳細ページと同じ「URL slug」に揃える（2026-07-31）。
 *
 * バグの内容: 一覧カードは spotToV2() の id（= spotIdFromName、日本語名がそのまま入る
 * 例:「東京ドイツ村」）で保存していたが、詳細ページは id={slug}（例:「-l5nt」）で保存し、
 * /favorites は slug でしか照合していなかった。
 * → 一覧から保存したものは kk_saved_v2 に入っても保存一覧に絶対に出ない。
 *
 * 一覧カードは全呼び出し元から href={`/spot/${slug}`} を受け取っているため、
 * そこから slug を取り出せば呼び出し側を変更せずに詳細ページと一致させられる。
 */
function spotSaveId(href: string | undefined, fallbackId: string): string {
  const PREFIX = '/spot/';
  if (href && href.startsWith(PREFIX)) {
    const slug = href.slice(PREFIX.length);
    if (slug) return slug;
  }
  return fallbackId;
}

export type V2Spot = {
  id: string;
  name: string;
  cat: string;
  area: string;
  station: string;
  age: string;
  img: string;
  price?: string;
  tags: Tag[];
  desc?: string;
};

export type V2Event = {
  id: string;
  name: string;
  date: string;
  place: string;
  age?: string;
  status: '開催中' | 'まもなく開催' | string;
  img: string;
};

export type V2Feature = {
  id: string;
  title: string;
  short: string;
  sub?: string;
  icon: 'umbrella' | 'baby' | 'free' | 'fork' | string;
  accent: 'rain' | 'sun' | 'indoor' | 'lunch' | 'event' | 'free' | 'purple';
  img: string;
  desc?: string;
  lead?: string;
  tags?: string[];
  spotIds?: string[];
};

export type V2Article = {
  id: string;
  title: string;
  img: string;
  sub?: string;
  tags?: string[];
  goLunch?: boolean;
};

export type V2LunchItem = {
  id: string;
  name: string;
  area: string;
  img: string;
  tags: string[];
  desc?: string;
  hours?: string;
  site?: string;
};

function rankClass(rank?: number) {
  if (!rank) return '';
  if (rank === 1) return 'g1';
  if (rank === 2) return 'g2';
  if (rank === 3) return 'g3';
  return 'gn';
}

/* ===========================================================
   Vertical spot card (TOP/エリア横スクロール用)
   =========================================================== */
export function V2SpotCardV({
  spot,
  rank,
  w = 168,
  href,
}: {
  spot: V2Spot;
  rank?: number;
  w?: number;
  href?: string;
}) {
  const link = href || `/v2/spot/${spot.id}`;
  return (
    <Link href={link} className="v2-card-v" style={{ width: w }}>
      <div className="v2-imgwrap" style={{ aspectRatio: '16/9', borderRadius: '14px 14px 0 0' }}>
        {rank ? <span className={`v2-rank ${rankClass(rank)}`}>{rank}</span> : null}
        <V2FavBtn id={spotSaveId(href, spot.id)} />
        <V2Img src={spot.img} seed={spot.id} alt={spot.name} />
      </div>
      <div className="v2-card-v-body">
        <div className="v2-card-v-title">{spot.name}</div>
        <div className="v2-tag-row">
          {spot.tags.slice(0, 2).map((t, i) => (
            <V2Tag key={i} label={t.t} tone={t.k} />
          ))}
        </div>
        {spot.tags[2] && (
          <div className="v2-tag-row">
            <V2Tag label={spot.tags[2].t} tone={spot.tags[2].k} />
          </div>
        )}
        <div className="v2-card-v-loc">
          <V2Icon name="pin" size={13} color="var(--v2-orange)" />
          {spot.station}
        </div>
      </div>
    </Link>
  );
}

/* ===========================================================
   Mini card (エリア詳細 人気スポット)
   =========================================================== */
export function V2SpotMini({
  spot,
  rank,
  w = 150,
  areaTag,
  href,
}: {
  spot: V2Spot;
  rank?: number;
  w?: number;
  areaTag?: string;
  href?: string;
}) {
  const link = href || `/v2/spot/${spot.id}`;
  return (
    <Link href={link} className="v2-card-mini" style={{ width: w }}>
      <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
        {rank ? <span className={`v2-rank ${rankClass(rank)}`}>{rank}</span> : null}
        <V2Img src={spot.img} seed={spot.id} alt={spot.name} />
      </div>
      <div className="v2-card-mini-title">{spot.name}</div>
      <div className="v2-row" style={{ justifyContent: 'space-between' }}>
        <span className="v2-tag rain">{areaTag || spot.area}</span>
        <V2FavBtn id={spotSaveId(href, spot.id)} variant="static" />
      </div>
    </Link>
  );
}

/* ===========================================================
   Row card (検索結果・特集記事)
   =========================================================== */
export function V2SpotRow({
  spot,
  rank,
  cat = true,
  href,
}: {
  spot: V2Spot;
  rank?: number;
  cat?: boolean;
  href?: string;
}) {
  const link = href || `/v2/spot/${spot.id}`;
  return (
    <Link href={link} className="v2-card-row">
      <div
        className="v2-imgwrap"
        style={{ width: 118, minWidth: 118, aspectRatio: '1/1', borderRadius: 14, position: 'relative' }}
      >
        {rank ? <span className={`v2-rank ${rankClass(rank)}`}>{rank}</span> : null}
        <V2Img src={spot.img} seed={spot.id} alt={spot.name} />
      </div>
      <div className="v2-card-row-body">
        <div
          className="v2-row"
          style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            {cat && <div className="v2-card-row-cat">{spot.cat}</div>}
            <div className="v2-card-row-title">{spot.name}</div>
          </div>
          <V2FavBtn id={spotSaveId(href, spot.id)} variant="static" />
        </div>
        <div className="v2-tag-row">
          {spot.tags.map((t, i) => (
            <V2Tag key={i} label={t.t} tone={t.k} />
          ))}
        </div>
        <div className="v2-card-v-loc">
          <V2Icon name="pin" size={13} color="var(--v2-orange)" />
          {spot.station}
        </div>
      </div>
    </Link>
  );
}

/* ===========================================================
   Event card
   =========================================================== */
export function V2EventCard({
  ev,
  w = 150,
  href,
}: {
  ev: V2Event;
  w?: number;
  href?: string;
}) {
  const sBg = ev.status === '開催中' ? 'var(--v2-c-event-bg)' : 'var(--v2-c-sun-bg)';
  const sFg = ev.status === '開催中' ? 'var(--v2-c-event)' : 'var(--v2-c-sun)';
  return (
    <Link href={href || '#'} className="v2-card-v" style={{ width: w }}>
      <div className="v2-imgwrap" style={{ aspectRatio: '16/9', borderRadius: '14px 14px 0 0' }}>
        <span className="v2-ev-badge" style={{ background: sBg, color: sFg }}>
          {ev.status}
        </span>
        <V2Img src={ev.img} seed={ev.id} alt={ev.name} />
      </div>
      <div className="v2-card-v-body">
        <div className="v2-card-v-title" style={{ minHeight: 42 }}>
          {ev.name}
        </div>
        <div className="v2-ev-date">{ev.date}</div>
        <div className="v2-ev-place">{ev.place}</div>
        {ev.age && (
          <div className="v2-tag-row">
            <V2Tag label={ev.age} tone="age" />
          </div>
        )}
      </div>
    </Link>
  );
}

/* ===========================================================
   Feature card (vertical)
   =========================================================== */
export function V2FeatureCardV({
  f,
  w = 150,
  href,
}: {
  f: V2Feature;
  w?: number;
  href?: string;
}) {
  const accentColor = `var(--v2-c-${f.accent})`;
  const link = href || `/v2/feature/${f.id}`;
  const iconName = (f.icon === 'umbrella' || f.icon === 'baby' || f.icon === 'free' ? f.icon : 'fork') as 'umbrella' | 'baby' | 'free' | 'fork';
  return (
    <Link href={link} className="v2-card-v" style={{ width: w }}>
      <div className="v2-imgwrap" style={{ aspectRatio: '16/9', borderRadius: '14px 14px 0 0' }}>
        <span className="v2-feat-chip" style={{ color: accentColor }}>
          <V2Icon name={iconName} size={20} />
        </span>
        <V2Img src={f.img} seed={f.id} alt={f.title} />
      </div>
      <div className="v2-card-v-body">
        <div className="v2-card-v-title">{f.short}</div>
        {f.sub && <div className="v2-feat-sub">{f.sub}</div>}
      </div>
    </Link>
  );
}

/* ===========================================================
   Feature row (特集一覧 おすすめ)
   =========================================================== */
export function V2FeatureRow({ f, href }: { f: V2Feature; href?: string }) {
  const link = href || `/v2/feature/${f.id}`;
  return (
    <Link href={link} className="v2-feat-row">
      <div
        className="v2-imgwrap"
        style={{ width: 120, minWidth: 120, aspectRatio: '3/4', borderRadius: '14px 0 0 14px' }}
      >
        <V2Img src={f.img} seed={f.id} alt={f.title} />
      </div>
      <div className="v2-feat-row-body">
        <div
          className="v2-row"
          style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div className="v2-feat-row-title">{f.title}</div>
          <V2FavBtn id={'feat-' + f.id} shape="bookmark" variant="static" />
        </div>
        {f.desc && <div className="v2-feat-row-desc">{f.desc}</div>}
        {f.tags && (
          <div className="v2-tag-row">
            {f.tags.map((t, i) => (
              <V2Tag key={i} label={t} tone={i === 0 ? 'rain' : ''} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ===========================================================
   Article row (人気の記事)
   =========================================================== */
export function V2ArticleRow({ a, href }: { a: V2Article; href?: string }) {
  return (
    <Link href={href || '#'} className="v2-art-row">
      <div className="v2-imgwrap r" style={{ width: 76, minWidth: 76, height: 60 }}>
        <V2Img src={a.img} seed={a.id} alt={a.title} />
      </div>
      <div className="v2-art-body">
        <div className="v2-art-title">{a.title}</div>
        {a.sub && <div className="v2-art-sub">{a.sub}</div>}
        {a.tags && (
          <div className="v2-tag-row">
            {a.tags.map((t, i) => (
              <V2Tag key={i} label={t} tone={i === 0 ? 'age' : ''} />
            ))}
          </div>
        )}
      </div>
      <V2Icon name="chevron-right" size={20} color="#cfcfcf" />
    </Link>
  );
}

/* ===========================================================
   Lunch row (used by 外食まとめ)
   =========================================================== */
export function V2LunchRow({
  s,
  rank,
  open,
  onToggle,
}: {
  s: V2LunchItem;
  rank?: number;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="v2-store-card">
      <div className="v2-store-top">
        <div className="v2-imgwrap r" style={{ width: 96, minWidth: 96, aspectRatio: '1/1' }}>
          {rank ? <span className={`v2-rank ${rankClass(rank)}`}>{rank}</span> : null}
          <V2Img src={s.img} seed={s.id} alt={s.name} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v2-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="v2-store-name">{s.name}</div>
            <V2FavBtn id={s.id} variant="static" />
          </div>
          <div className="v2-card-v-loc">
            <V2Icon name="pin" size={13} color="var(--v2-orange)" />
            {s.area}
          </div>
          <div className="v2-tag-row" style={{ marginTop: 6 }}>
            {s.tags.slice(0, 3).map((t, j) => (
              <V2Tag key={j} label={t} tone={t.includes('OK') ? 'rain' : ''} />
            ))}
          </div>
        </div>
      </div>
      {s.desc && <div className="v2-store-desc">{s.desc}</div>}
      <button className="v2-store-toggle" onClick={onToggle} type="button">
        店舗情報を見る
        <V2Icon
          name="chevron-down"
          size={16}
          color="var(--v2-orange)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        />
      </button>
      {open && (
        <div className="v2-store-detail">
          <div className="v2-sd-row">
            <V2Icon name="clock" size={16} color="var(--v2-ink-mute)" />
            <span>
              <b>営業時間</b>　{s.hours || '11:00〜22:00'}
            </span>
          </div>
          <div className="v2-sd-row">
            <V2Icon name="milk" size={16} color="var(--v2-ink-mute)" />
            <span>
              <b>設備</b>　ベビーチェア・おむつ替え台・授乳スペース
            </span>
          </div>
          <div className="v2-sd-map">
            <V2Icon name="pin" size={18} color="var(--v2-orange)" /> Google Map で見る
          </div>
          <div className="v2-sd-links">
            <a className="v2-sd-link" href={s.site || '#'}>
              <V2Icon name="link" size={15} /> 公式サイト
            </a>
            <a className="v2-sd-link" href="#">
              <V2Icon name="star" size={15} /> 食べログ
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
