'use client';

import React, { use as usePromise } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow, V2ArticleRow } from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { ARTICLES, FEATURES, SPOTS } from '../../_data';

const AREA_CHIPS = ['豊島区', '板橋区', '練馬区', '北区', '文京区'];

const FAQ = [
  { q: '雨の日でもベビーカーで行けますか？', a: '掲載スポットはいずれも屋内中心で、ベビーカーのまま入館できる施設を選んでいます。' },
  { q: '何歳から楽しめますか？', a: '0歳の赤ちゃんから就学前のお子さままで、年齢に合わせて楽しめるスポットを集めています。' },
];

export default function V2FeatureArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = usePromise(params);
  const f = FEATURES.find((x) => x.id === slug) || FEATURES[0];
  const spots = (
    f.spotIds && f.spotIds.length
      ? f.spotIds
      : ['sunshine-aq', 'galaxcity', 'kids-garden', 'central-lib']
  )
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const [faqOpen, setFaqOpen] = React.useState(0);
  const [detailOpen, setDetailOpen] = React.useState(false);

  return (
    <V2Frame header="sub" active="features" backHref="/v2/feature">
      <div className="v2-article-hero" style={{ height: 210 }}>
        <V2Img src={f.img} seed={'fa' + f.id} alt={f.title} />
        <div className="v2-article-hero-grad"></div>
        <span className="v2-article-hero-cat">特集</span>
        <div className="v2-fa-hero-title">{f.lead}</div>
      </div>

      <div className="v2-page-head" style={{ paddingTop: 16 }}>
        <h1 className="v2-page-h1" style={{ fontSize: 23, lineHeight: 1.35 }}>
          {f.title}
        </h1>
        {f.tags && (
          <div className="v2-tag-row" style={{ marginTop: 12 }}>
            {f.tags.map((t, i) => (
              <V2Tag
                key={i}
                label={t}
                tone={i === 0 ? 'rain' : i === 1 ? 'feat' : 'age'}
              />
            ))}
          </div>
        )}
        {f.desc && (
          <p className="v2-page-lead" style={{ marginTop: 13 }}>
            {f.desc}
          </p>
        )}
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>この特集のおすすめスポット
        </div>
      </div>
      <div className="v2-vlist">
        {spots.map((s, i) => (
          <V2SpotRow key={s.id} spot={s} rank={i + 1} />
        ))}
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>こんな人におすすめ
        </div>
      </div>
      <div className="v2-section">
        <div className="v2-reco-box">
          {[
            '雨の日の遊び場に困っている方',
            '体を動かせる室内スポットを探している方',
            '0〜6歳の子どもと一緒におでかけしたい方',
          ].map((t, i) => (
            <div key={i} className="v2-reco-item">
              <span className="v2-reco-check">
                <V2Icon name="arrow-right" size={13} color="#fff" />
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>

      <V2SectionHead title="関連特集" more="" />
      <div className="v2-hscroll">
        {FEATURES.filter((x) => x.id !== f.id).map((x) => (
          <Link
            key={x.id}
            href={`/v2/feature/${x.id}`}
            className="v2-feat-overlay"
          >
            <V2Img src={x.img} seed={x.id + 'rel'} alt={x.title} />
            <div className="v2-feat-overlay-grad"></div>
            <div className="v2-feat-overlay-title">{x.short}</div>
          </Link>
        ))}
      </div>

      <V2SectionHead title="エリア別おすすめ" moreHref="/v2/area" />
      <div className="v2-chip-scroll">
        {AREA_CHIPS.map((c) => (
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

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>詳しく知りたい方へ
        </div>
      </div>
      <div className="v2-section">
        <button
          type="button"
          className="v2-accordion-head"
          onClick={() => setDetailOpen((o) => !o)}
        >
          <V2Icon name="info" size={18} color="var(--v2-c-rain)" /> 雨の日のおでかけを楽しむコツ
          <V2Icon
            name="chevron-down"
            size={18}
            color="#bbb"
            style={{
              marginLeft: 'auto',
              transform: detailOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
        </button>
        {detailOpen && (
          <div className="v2-accordion-body">
            着替えやタオルを多めに持っていくと安心です。屋内施設は開館直後が比較的すいているのでおすすめ。事前に授乳室・おむつ替えスペースの場所を調べておくと、当日あわてずに過ごせます。
          </div>
        )}
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>よくある質問
        </div>
      </div>
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {FAQ.map((q, i) => (
          <div key={i} className="v2-faq">
            <button
              type="button"
              className="v2-faq-q"
              onClick={() => setFaqOpen((o) => (o === i ? -1 : i))}
            >
              <span className="v2-faq-mark">Q</span>
              {q.q}
              <V2Icon
                name="chevron-down"
                size={18}
                color="#bbb"
                style={{
                  marginLeft: 'auto',
                  flex: 'none',
                  transform: faqOpen === i ? 'rotate(180deg)' : 'none',
                  transition: 'transform .2s',
                }}
              />
            </button>
            {faqOpen === i && (
              <div className="v2-faq-a">
                <span className="v2-faq-mark a">A</span>
                <span>{q.a}</span>
              </div>
            )}
          </div>
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
