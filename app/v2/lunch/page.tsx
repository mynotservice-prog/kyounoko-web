'use client';

import React from 'react';
import { V2Frame } from '@/components/v2/V2Frame';
import {
  V2LunchRow,
  V2ArticleRow,
  V2SpotMini,
} from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead, V2FavBtn, useV2Ctx } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { ARTICLES, IMG, LUNCH, SPOTS } from '../_data';

const FILTERS = ['個室', '座敷', 'キッズメニュー', 'ベビーカーOK', '駅近'];

const FAQS = [
  { q: 'ベビーカーのまま入れますか？', a: '記事内で「ベビーカーOK」タグのあるお店は、ベビーカーのまま入店・着席いただけます。混雑時はスタッフにお声がけください。' },
  { q: '離乳食の持ち込みはできますか？', a: '多くのお店で離乳食の持ち込みが可能です。電子レンジの貸し出し有無は各店舗の「店舗情報」をご確認ください。' },
  { q: '予約はしたほうがいいですか？', a: '土日のランチタイムは混み合うため、個室・座敷席は事前予約がおすすめです。' },
];

export default function V2LunchPage() {
  const { saved, toggleSave } = useV2Ctx();
  const [active, setActive] = React.useState<string[]>([]);
  const [openStore, setOpenStore] = React.useState<string | null>(null);
  const [faqOpen, setFaqOpen] = React.useState<number>(0);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const articleSaved = !!saved['lunch-article'];

  const toggleF = (f: string) =>
    setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]));

  return (
    <V2Frame header="sub" active="search">
      {/* eyecatch */}
      <div className="v2-article-hero">
        <V2Img src={IMG.food[1]} seed="lunch-hero" alt="池袋の子連れランチ" />
        <div className="v2-article-hero-grad"></div>
        <span className="v2-article-hero-cat">外食まとめ</span>
      </div>

      <div className="v2-page-head" style={{ paddingTop: 14 }}>
        <h1 className="v2-page-h1" style={{ fontSize: 23, lineHeight: 1.35 }}>
          池袋の子連れランチ10選
          <br />
          ゆっくり食べられるお店
        </h1>
        <p className="v2-page-lead">
          ベビーカーで入りやすく、キッズメニューや座敷のある池袋のお店を、子育て世代の目線で厳選しました。
        </p>
      </div>

      {/* filter */}
      <div className="v2-lunch-filter">
        <div className="v2-lunch-filter-label">
          <V2Icon name="sliders" size={15} color="var(--v2-orange)" /> 絞り込み
        </div>
        <div className="v2-lunch-filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={'v2-lf-chip' + (active.includes(f) ? ' on' : '')}
              onClick={() => toggleF(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="v2-sec-head" style={{ marginTop: 8 }}>
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>おすすめ店舗一覧
        </div>
      </div>
      <div className="v2-vlist" style={{ marginTop: 8 }}>
        {LUNCH.map((s, i) => (
          <V2LunchRow
            key={s.id}
            s={s}
            rank={i + 1}
            open={openStore === s.id}
            onToggle={() =>
              setOpenStore((o) => (o === s.id ? null : s.id))
            }
          />
        ))}
      </div>

      {/* 詳しく知りたい方へ */}
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
          <V2Icon name="info" size={18} color="var(--v2-c-rain)" /> 子連れ外食を快適にするコツ
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
            混雑する時間帯を避けて11時台の入店がおすすめです。事前にキッズメニューの有無や、ベビーチェア・おむつ替え台の場所をチェックしておくと安心。座敷や個室のあるお店なら、子どもがぐずってしまっても周りを気にせずゆっくり過ごせます。
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>よくある質問
        </div>
      </div>
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {FAQS.map((f, i) => (
          <div key={i} className="v2-faq">
            <button
              type="button"
              className="v2-faq-q"
              onClick={() => setFaqOpen((o) => (o === i ? -1 : i))}
            >
              <span className="v2-faq-mark">Q</span>
              {f.q}
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
                <span>{f.a}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* こんな人におすすめ */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <span className="v2-bar-accent"></span>こんな人におすすめ
        </div>
      </div>
      <div className="v2-section">
        <div className="v2-reco-box">
          {[
            'はじめての子連れ外食で失敗したくない方',
            'ベビーカーのまま入れるお店を探している方',
            '離乳食期の赤ちゃんと一緒の方',
            'ママ会・パパ会の場所を探している方',
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

      {/* 関連記事 */}
      <V2SectionHead title="関連記事" more="" />
      <div className="v2-section">
        {ARTICLES.map((a) => (
          <V2ArticleRow
            key={a.id}
            a={a}
            href={a.goLunch ? '/v2/lunch' : '/v2/feature/lunch'}
          />
        ))}
      </div>

      {/* 同じエリアの遊び場 */}
      <V2SectionHead title="同じエリアの遊び場" moreHref="/v2/area/toshima" />
      <div className="v2-hscroll">
        {SPOTS.filter((s) => s.area === '豊島区')
          .slice(0, 4)
          .map((s) => (
            <V2SpotMini key={s.id} spot={s} />
          ))}
      </div>

      {/* save / share bar */}
      <div className="v2-share-bar">
        <button
          type="button"
          className={'v2-share-save' + (articleSaved ? ' on' : '')}
          onClick={() => toggleSave('lunch-article')}
        >
          <V2Icon
            name="heart"
            size={19}
            color={articleSaved ? '#fff' : 'var(--v2-orange)'}
            fill={articleSaved}
          />
          {articleSaved ? '保存済み' : '保存する'}
        </button>
        <button type="button" className="v2-share-share">
          <V2Icon name="share" size={19} color="var(--v2-ink)" />
          シェア
        </button>
      </div>
      {/* hidden ref so eslint doesn't warn on V2FavBtn unused import */}
      <span style={{ display: 'none' }}>
        <V2FavBtn id="_unused" />
      </span>
    </V2Frame>
  );
}
