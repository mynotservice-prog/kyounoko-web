'use client';

import React, { use as usePromise } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag, useV2Ctx } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';
import { IMG, LUNCH, SPOTS, SPOT_DETAILS } from '../../_data';

function Stars({ value }: { value: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      items.push(<V2Icon key={i} name="star" size={17} color="var(--v2-orange)" fill />);
    } else if (value >= i - 0.5) {
      items.push(<V2Icon key={i} name="star" size={17} color="var(--v2-orange)" />);
    } else {
      items.push(<V2Icon key={i} name="star" size={17} color="#E2DCD4" />);
    }
  }
  return <div style={{ display: 'flex', gap: 2 }}>{items}</div>;
}

const DETAIL_ITEMS: Array<{ icon: V2IconName; c: string; q: string; s: string; a: string }> = [
  { icon: 'heart', c: 'var(--v2-orange)', q: '子連れで行くなら？', s: '年齢別の楽しみ方や持ち物のポイント', a: 'ベビーカーで館内をひとまわりでき、エレベーターも完備。授乳室・おむつ替え台があるので、0歳の赤ちゃん連れでも安心して過ごせます。お昼寝の時間を避けた午前中の来館がおすすめです。' },
  { icon: 'baby', c: 'var(--v2-c-event)', q: 'おすすめの年齢は？', s: '0〜6歳の楽しみ方を年齢別に解説', a: '0〜1歳は光る水槽をベビーカーから眺めるだけでも夢中に。2〜3歳はペンギンやアシカのショー、4〜6歳は生きものの名前を覚えながら楽しめます。' },
  { icon: 'crowd', c: 'var(--v2-c-rain)', q: '混雑状況は？', s: '曜日・時間帯ごとの混雑傾向', a: '土日祝の11〜15時が最も混雑します。比較的すいているのは平日や、開館直後の10時台。' },
  { icon: 'umbrella', c: 'var(--v2-c-rain)', q: '雨の日は楽しめる？', s: '屋内での楽しみ方や注意点', a: '全館屋内なので雨の日でも快適。屋上エリアは一部屋根がない場所もあるため、雨具があると安心です。' },
  { icon: 'cart', c: 'var(--v2-c-indoor)', q: '持ち物は？', s: 'あると便利な持ち物リスト', a: 'ベビーカー、抱っこひも、着替え、飲み物、授乳ケープがあると便利。' },
  { icon: 'question', c: 'var(--v2-c-purple)', q: 'よくある質問（FAQ）', s: 'みんなが気になる質問をまとめました', a: '再入館は当日に限り可能です。飲食物の持ち込みは一部エリアで可能。ベビーカー置き場は各フロアに用意があります。' },
];

const FACILITIES: Array<{ t: string; v: string; icon: V2IconName; accent: keyof typeof V2_ACCENT }> = [
  { t: '授乳室', v: 'あり', icon: 'milk', accent: 'event' },
  { t: 'おむつ替え台', v: 'あり', icon: 'baby', accent: 'indoor' },
  { t: 'ベビーカーOK', v: 'OK', icon: 'stroller', accent: 'rain' },
  { t: 'レストラン', v: 'あり', icon: 'fork', accent: 'lunch' },
  { t: '駐車場', v: 'あり（有料）', icon: 'car', accent: 'purple' },
  { t: 'コインロッカー', v: 'あり', icon: 'locker', accent: 'rain' },
];

export default function V2SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const spot = SPOTS.find((s) => s.id === id) || SPOTS[0];
  const d = SPOT_DETAILS[spot.id] || {};
  const galleryImgs = d.gallery || [spot.img, IMG.indoor[0], IMG.park[0], spot.img];
  const [gi, setGi] = React.useState(0);
  const [openAcc, setOpenAcc] = React.useState<number | null>(null);

  const ratings = d.ratings || { 'ベビーカー': 5, '授乳室': 4.5, '雨の日の過ごしやすさ': 5, 'コスパ': 4 };
  const points = d.points || ['ベビーカーでまわれる', '授乳室・おむつ替え完備', '駅チカでアクセス抜群', '一日たっぷり遊べる'];
  const recommend = d.recommend || ['0〜3歳におすすめ', '雨の日でも楽しみたい', 'ベビーカー利用OK', '家族みんなで楽しみたい'];
  const breadcrumb = d.breadcrumb || ['ホーム', spot.area, spot.cat];

  const lat = d.lat || 35.7295;
  const lng = d.lng || 139.7197;
  const bbox = `${(lng - 0.006).toFixed(4)},${(lat - 0.003).toFixed(4)},${(lng + 0.006).toFixed(4)},${(lat + 0.003).toFixed(4)}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;

  const relArticles = [
    { cat: 'スポット攻略', title: spot.name + 'を120%楽しむコツ', img: galleryImgs[0], age: spot.age },
    { cat: 'コラム', title: '子どもが喜ぶ！見どころ7選', img: galleryImgs[1] || IMG.aquarium[1], age: spot.age },
    { cat: 'エリア特集', title: spot.area + 'の子連れおでかけスポット10選', img: IMG.cafe[0], age: spot.age },
    { cat: 'お役立ち', title: 'ベビーカーでのおでかけ完全ガイド', img: IMG.family[0], age: spot.age },
  ];
  const sameArea = SPOTS.filter((s) => s.area === spot.area && s.id !== spot.id).slice(0, 5);
  const sameAreaList = sameArea.length ? sameArea : SPOTS.filter((s) => s.id !== spot.id).slice(0, 5);

  const { saved, toggleSave } = useV2Ctx();
  const isSaved = !!saved[spot.id];

  return (
    <V2Frame header="sub" active="search" backHref="/v2">
      {/* breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap',
          padding: '6px 18px 0',
          fontSize: 12,
          color: 'var(--v2-ink-mute)',
          fontWeight: 600,
        }}
      >
        {breadcrumb.map((b: string, i: number) => (
          <React.Fragment key={i}>
            <span>{b}</span>
            <V2Icon name="chevron-right" size={13} color="#cbb9a8" />
          </React.Fragment>
        ))}
        <span style={{ color: 'var(--v2-ink)', fontWeight: 700 }}>{spot.name}</span>
      </div>

      {/* title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '10px 18px 0',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--v2-orange-soft)',
              color: 'var(--v2-orange-deep)',
              fontSize: 11.5,
              fontWeight: 800,
              padding: '4px 11px',
              borderRadius: 'var(--v2-r-pill)',
              marginBottom: 8,
            }}
          >
            {spot.cat}
          </span>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--v2-ink)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {spot.name}
          </h1>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 18px 0',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--v2-ink-soft)',
        }}
      >
        <V2Icon name="pin" size={15} color="var(--v2-orange)" />
        {spot.station}
      </div>

      {/* gallery */}
      <div style={{ padding: '14px 18px 0' }}>
        <div
          className="v2-imgwrap"
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            borderRadius: 'var(--v2-r-lg)',
          }}
        >
          <V2Img src={galleryImgs[gi]} seed={spot.id + 'g' + gi} alt={spot.name} />
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,.55)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 11px',
              borderRadius: 'var(--v2-r-pill)',
            }}
          >
            {gi + 1} / {galleryImgs.length}
          </span>
          <button
            type="button"
            onClick={() => setGi((g) => (g - 1 + galleryImgs.length) % galleryImgs.length)}
            style={{
              position: 'absolute',
              top: '50%',
              left: 10,
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--v2-sh-soft)',
            }}
          >
            <V2Icon name="chevron-left" size={22} color="var(--v2-ink)" />
          </button>
          <button
            type="button"
            onClick={() => setGi((g) => (g + 1) % galleryImgs.length)}
            style={{
              position: 'absolute',
              top: '50%',
              right: 10,
              transform: 'translateY(-50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--v2-sh-soft)',
            }}
          >
            <V2Icon name="chevron-right" size={22} color="var(--v2-ink)" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 11 }}>
          {galleryImgs.map((_: string, i: number) => (
            <span
              key={i}
              onClick={() => setGi(i)}
              style={{
                width: i === gi ? 18 : 6,
                height: 6,
                borderRadius: i === gi ? 3 : '50%',
                background: i === gi ? 'var(--v2-orange)' : '#ddd4c8',
                transition: 'all .2s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* 基本情報 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 11,
          padding: '18px 18px 0',
        }}
      >
        {[
          { lab: '対象年齢', val: spot.age, icon: 'baby', bg: 'var(--v2-c-event-bg)', c: 'var(--v2-c-event)' },
          { lab: '料金の目安', val: d.price || spot.price || '—', icon: 'yen', bg: 'var(--v2-c-sun-bg)', c: '#E8A100' },
          { lab: '所要時間', val: d.duration || '2〜3時間', icon: 'clock', bg: 'var(--v2-c-indoor-bg)', c: 'var(--v2-c-indoor)' },
          { lab: '雨の日', val: d.rain || '◎ おすすめ', icon: 'umbrella', bg: 'var(--v2-c-rain-bg)', c: 'var(--v2-c-rain)' },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              background: '#fff',
              border: '1px solid var(--v2-line)',
              borderRadius: 'var(--v2-r-card)',
              padding: '13px 14px',
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: b.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <V2Icon name={b.icon as V2IconName} size={20} color={b.c} />
            </span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--v2-ink-mute)', fontWeight: 700 }}>
                {b.lab}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--v2-ink)', lineHeight: 1.25 }}>
                {b.val}
              </div>
              {i === 1 && d.priceNote && (
                <div style={{ fontSize: 9.5, color: 'var(--v2-ink-faint)', marginTop: 2 }}>
                  {d.priceNote}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* きょうのこチェック */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>
          きょうのこチェック
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--v2-ink-mute)', marginLeft: 4 }}>
            運営レビュー
          </span>
        </div>
      </div>
      <div className="v2-section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px 14px',
            background: '#fff',
            border: '1px solid var(--v2-line)',
            borderRadius: 'var(--v2-r-card)',
            padding: '16px 18px',
            boxShadow: 'var(--v2-sh-soft)',
          }}
        >
          {Object.entries(ratings).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--v2-ink-soft)' }}>{k}</div>
              <Stars value={v} />
            </div>
          ))}
        </div>
      </div>

      {/* おすすめポイント */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>おすすめポイント
        </div>
      </div>
      <div className="v2-chip-scroll" style={{ flexWrap: 'wrap' }}>
        {points.map((p: string, i: number) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--v2-orange-tint)',
              color: 'var(--v2-orange-deep)',
              border: '1px solid #f7ddc7',
              fontSize: 12,
              fontWeight: 700,
              padding: '7px 12px',
              borderRadius: 'var(--v2-r-pill)',
            }}
          >
            <V2Icon name="arrow-right" size={12} color="var(--v2-orange)" />
            {p}
          </span>
        ))}
      </div>

      {/* 設備・サービス */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>設備・サービス
        </div>
      </div>
      <div className="v2-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {FACILITIES.map((f, i) => {
            const a = V2_ACCENT[f.accent];
            return (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid var(--v2-line)',
                  borderRadius: 'var(--v2-r-card)',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: 'var(--v2-sh-soft)',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--v2-ink-soft)' }}>
                  {f.t}
                </div>
                <span style={{ color: a.c }}>
                  <V2Icon name={f.icon} size={24} />
                </span>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--v2-ink)' }}>{f.v}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* アクセス */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>アクセス・地図
        </div>
      </div>
      <div className="v2-section">
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--v2-line)',
            borderRadius: 'var(--v2-r-card)',
            overflow: 'hidden',
            boxShadow: 'var(--v2-sh-soft)',
          }}
        >
          <div style={{ height: 180, background: '#e8eef0' }}>
            <iframe title="map" src={mapSrc} loading="lazy" style={{ width: '100%', height: '100%', border: 0 }} />
          </div>
          <div style={{ padding: '15px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 800, color: 'var(--v2-ink)' }}>
              <V2Icon name="pin" size={17} color="var(--v2-orange)" />
              {spot.name}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--v2-ink-soft)', lineHeight: 1.6, margin: '8px 0 12px' }}>
              {d.address || `東京都${spot.area} ${spot.station}`}
            </div>
            {(d.lines || [spot.station]).map((l: string, i: number) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--v2-ink-soft)', fontWeight: 600, marginBottom: 6 }}
              >
                <V2Icon name="train" size={16} color="var(--v2-ink-mute)" />
                {l}
              </div>
            ))}
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                marginTop: 8,
                padding: 12,
                border: '1.5px solid var(--v2-line)',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 800,
                color: 'var(--v2-ink)',
              }}
            >
              Googleマップで開く <V2Icon name="link" size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* 周辺ランチ */}
      <V2SectionHead title="周辺の子連れランチスポット" moreHref="/v2/lunch" />
      <div className="v2-hscroll">
        {LUNCH.slice(0, 5).map((s) => (
          <Link
            key={s.id}
            href="/v2/lunch"
            className="v2-card-mini"
            style={{ width: 170 }}
          >
            <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
              <V2Img src={s.img} seed={s.id + 'sd'} alt={s.name} />
            </div>
            <div className="v2-card-mini-title">{s.name}</div>
            <div className="v2-card-v-loc" style={{ margin: 0 }}>
              <V2Icon name="pin" size={12} color="var(--v2-orange)" />
              {s.area.split(' ').slice(-1)}
            </div>
            <div className="v2-tag-row">
              {s.tags.slice(0, 2).map((t, j) => (
                <V2Tag key={j} label={t} tone={t.includes('OK') ? 'rain' : ''} />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* 詳しく知りたい方へ */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <V2Icon name="book" size={19} color="var(--v2-orange)" />
          詳しく知りたい方へ
        </div>
      </div>
      <div className="v2-section">
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--v2-line)',
            borderRadius: 'var(--v2-r-card)',
            boxShadow: 'var(--v2-sh-soft)',
            overflow: 'hidden',
          }}
        >
          {DETAIL_ITEMS.map((it, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--v2-line-soft)' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  width: '100%',
                  padding: '15px 16px',
                  textAlign: 'left',
                }}
                onClick={() => setOpenAcc((o) => (o === i ? null : i))}
              >
                <span style={{ width: 26, minWidth: 26, display: 'flex', color: it.c }}>
                  <V2Icon name={it.icon} size={18} />
                </span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--v2-ink)' }}>{it.q}</span>
                  <span style={{ fontSize: 11, color: 'var(--v2-ink-mute)' }}>{it.s}</span>
                </span>
                <V2Icon
                  name="chevron-down"
                  size={18}
                  color="#c4bbb0"
                  style={{
                    flex: 'none',
                    transform: openAcc === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s',
                  }}
                />
              </button>
              {openAcc === i && (
                <div
                  style={{
                    padding: '0 16px 16px 53px',
                    fontSize: 12.5,
                    color: 'var(--v2-ink-soft)',
                    lineHeight: 1.75,
                  }}
                >
                  {it.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* こんな人におすすめ */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <V2Icon name="info" size={19} color="var(--v2-orange)" />
          こんな人におすすめ
        </div>
      </div>
      <div className="v2-chip-scroll">
        {recommend.map((r: string, i: number) => {
          const icons: V2IconName[] = ['baby', 'umbrella', 'stroller', 'star', 'heart'];
          return (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#fff',
                border: '1px solid var(--v2-line)',
                boxShadow: 'var(--v2-sh-soft)',
                color: 'var(--v2-ink)',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 13px',
                borderRadius: 'var(--v2-r-pill)',
                whiteSpace: 'nowrap',
              }}
            >
              <V2Icon name={icons[i % 5]} size={13} color="var(--v2-orange)" />
              {r}
            </span>
          );
        })}
      </div>

      {/* 関連記事 */}
      <V2SectionHead title="関連記事" icon="book" moreHref="/v2/feature" more="すべて見る" />
      <div className="v2-hscroll">
        {relArticles.map((a, i) => (
          <Link
            key={i}
            href="/v2/feature/rainy"
            style={{
              width: 158,
              background: '#fff',
              border: '1px solid var(--v2-line)',
              borderRadius: 'var(--v2-r-card)',
              boxShadow: 'var(--v2-sh-soft)',
              overflow: 'hidden',
              padding: '0 0 11px',
              display: 'block',
            }}
          >
            <div className="v2-imgwrap" style={{ aspectRatio: '16/9' }}>
              <V2Img src={a.img} seed={'ra' + i} alt={a.title} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--v2-orange)', padding: '10px 11px 0' }}>
              {a.cat}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--v2-ink)', lineHeight: 1.35, padding: '3px 11px 7px' }}>
              {a.title}
            </div>
            <div className="v2-tag-row" style={{ padding: '0 11px' }}>
              <V2Tag label={a.age} tone="age" />
            </div>
          </Link>
        ))}
      </div>

      {/* 同じエリア */}
      <V2SectionHead title="同じエリアのスポット" icon="pin" moreHref={`/v2/area/${spot.area}`} more="すべて見る" />
      <div className="v2-hscroll">
        {sameAreaList.map((s) => (
          <Link
            key={s.id}
            href={`/v2/spot/${s.id}`}
            className="v2-card-mini"
            style={{ width: 168 }}
          >
            <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
              <V2Img src={s.img} seed={s.id + 'sa'} alt={s.name} />
            </div>
            <div className="v2-card-mini-title">{s.name}</div>
            <div className="v2-card-v-loc" style={{ margin: 0 }}>
              <V2Icon name="pin" size={12} color="var(--v2-orange)" />
              {s.station.split(' ').slice(-1)}
            </div>
            <div className="v2-tag-row">
              {s.tags.slice(0, 2).map((t, j) => (
                <V2Tag key={j} label={t.t} tone={t.k} />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* 保存・シェア */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 18px 8px' }}>
        <button
          type="button"
          onClick={() => toggleSave(spot.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            padding: '16px 18px',
            borderRadius: 'var(--v2-r-lg)',
            border: '2px solid var(--v2-orange)',
            background: isSaved ? 'var(--v2-orange)' : 'var(--v2-orange-tint)',
            textAlign: 'left',
          }}
        >
          <V2Icon
            name="heart"
            size={22}
            color={isSaved ? '#fff' : 'var(--v2-orange)'}
            fill={isSaved}
          />
          <span>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: isSaved ? '#fff' : 'var(--v2-orange-deep)' }}>
              {isSaved ? '保存済み' : 'このスポットを保存する'}
            </span>
            <span style={{ display: 'block', fontSize: 11.5, color: isSaved ? '#fff' : 'var(--v2-ink-mute)', marginTop: 2 }}>
              あとで見返したいときに便利！
            </span>
          </span>
        </button>
      </div>

      <div style={{ height: 14 }}></div>
    </V2Frame>
  );
}
