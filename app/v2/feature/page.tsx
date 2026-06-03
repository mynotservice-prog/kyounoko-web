import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2FeatureRow } from '@/components/v2/V2Cards';
import { V2Img, V2SectionHead, V2Tag, V2Logo } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT } from '@/components/v2/V2Icon';
import { FEATURE_CATS, FEATURE_RECENT, FEATURES, IMG } from '../_data';

const POPULAR_CHIPS = ['雨の日', '無料', '公園', '室内あそび', '動物園・水族館', '水遊び'];
const PREFS_CHIPS = ['東京都', '埼玉県', '神奈川県', '千葉県', '茨城県'];

function CatGrid({
  items,
}: {
  items: readonly { t: string; img: string; accent: string }[];
}) {
  return (
    <div className="v2-cat-grid">
      {items.map((c) => {
        const a = V2_ACCENT[c.accent] || V2_ACCENT.rain;
        return (
          <Link
            key={c.t}
            href="/v2/feature/rainy"
            className="v2-cat-card"
          >
            <div
              className="v2-imgwrap"
              style={{ aspectRatio: '16/9', borderRadius: '14px 14px 0 0' }}
            >
              <V2Img src={c.img} seed={c.t} alt={c.t} />
            </div>
            <div className="v2-cat-card-body">
              <span className="v2-cat-dot" style={{ background: a.c }}></span>
              {c.t}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function V2FeaturesPage() {
  const RANKING = [
    { id: 'lunch', title: '子連れランチにおすすめ特集', img: IMG.food[0], tags: ['ランチ', '個室'] },
    { id: 'baby01', title: '0〜1歳向けおでかけ特集', img: IMG.baby[0], tags: ['0〜1歳', '授乳室'] },
    { id: 'rainy', title: '動物園・水族館で会える特集', img: IMG.zoo[0], tags: ['動物', '屋内あり'] },
  ];

  return (
    <V2Frame header="hidden" active="features">
      {/* header overlay */}
      <div className="v2-app-header">
        <V2Logo size={34} />
        <Link href="/v2/favorites" className="v2-header-act">
          <V2Icon name="bookmark" size={22} color="var(--v2-ink)" />
          保存
        </Link>
      </div>

      <div className="v2-page-head" style={{ paddingTop: 4 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="book" size={24} color="var(--v2-orange)" />
          特集
        </h1>
        <p className="v2-page-lead">テーマ別に、ぴったりのおでかけ先を見つけよう。</p>
      </div>

      {/* search */}
      <div className="v2-section" style={{ marginTop: 6 }}>
        <div className="v2-searchbar">
          <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
          特集を検索
        </div>
      </div>

      {/* popular */}
      <div className="v2-sec-head" style={{ marginTop: 18 }}>
        <div className="v2-sec-title">
          <V2Icon name="sparkle" size={19} color="var(--v2-orange)" />
          人気の特集
        </div>
      </div>
      <div className="v2-chip-scroll">
        {POPULAR_CHIPS.map((c) => (
          <Link key={c} href="/v2/feature/rainy" className="v2-pop-chip">
            {c}
          </Link>
        ))}
      </div>

      {/* おすすめの特集 */}
      <V2SectionHead title="おすすめの特集" more="" />
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 13 }}
      >
        <V2FeatureRow f={FEATURES[0]} />
        <V2FeatureRow f={FEATURES[2]} />
      </div>

      {/* ランキング */}
      <div className="v2-sec-head">
        <div className="v2-sec-title">
          <V2Icon name="crown" size={20} color="var(--v2-c-free)" />
          人気特集ランキング
        </div>
      </div>
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        {RANKING.map((r, i) => (
          <Link
            key={r.id}
            href={`/v2/feature/${r.id}`}
            className="v2-rank-row"
          >
            <span
              className={
                'v2-rank-num ' + (i === 0 ? 'g1' : i === 1 ? 'g2' : 'g3')
              }
            >
              {i + 1}
            </span>
            <div
              className="v2-imgwrap r"
              style={{ width: 62, minWidth: 62, aspectRatio: '1/1' }}
            >
              <V2Img src={r.img} seed={'rk' + i} alt={r.title} />
            </div>
            <div className="v2-rank-info">
              <div className="v2-rank-title">{r.title}</div>
              <div className="v2-tag-row">
                {r.tags.map((t, j) => (
                  <V2Tag key={j} label={t} tone={j === 0 ? 'feat' : ''} />
                ))}
              </div>
            </div>
            <V2Icon name="chevron-right" size={18} color="#ccc" />
          </Link>
        ))}
      </div>

      <V2SectionHead title="年齢別特集" more="" />
      <CatGrid items={FEATURE_CATS.age} />
      <V2SectionHead title="天気別特集" more="" />
      <CatGrid items={FEATURE_CATS.weather} />
      <V2SectionHead title="目的別特集" more="" />
      <CatGrid items={FEATURE_CATS.purpose} />
      <V2SectionHead title="料金別特集" more="" />
      <CatGrid items={FEATURE_CATS.price} />

      <V2SectionHead title="エリア別特集" moreHref="/v2/area" />
      <div className="v2-chip-scroll">
        {PREFS_CHIPS.map((c) => (
          <Link key={c} href="/v2/area" className="v2-pop-chip">
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

      <V2SectionHead title="最近追加された特集" more="" />
      <div
        className="v2-section"
        style={{ display: 'flex', flexDirection: 'column', gap: 13 }}
      >
        {FEATURE_RECENT.map((f, i) => (
          <Link
            key={i}
            href="/v2/feature/rainy"
            className="v2-recent-feat"
          >
            <div
              className="v2-imgwrap r"
              style={{ width: 88, minWidth: 88, aspectRatio: '16/9' }}
            >
              <V2Img src={f.img} seed={'rf' + i} alt={f.title} />
            </div>
            <div className="v2-rank-info">
              <div className="v2-rank-title">{f.title}</div>
              <div className="v2-tag-row">
                {f.tags.map((t, j) => (
                  <V2Tag key={j} label={t} tone={j === 0 ? 'feat' : ''} />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ height: 14 }}></div>
    </V2Frame>
  );
}
