import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { TodayFinder } from '@/components/top/TodayFinder';
import { getAllFileArticles } from '@/lib/articles';

export const revalidate = 3600; // 1時間ごとに再生成

// MicroCMS カテゴリ slug → 日本語名フォールバック
const CATEGORY_LABEL: Record<string, string> = {
  'today-doko': '今日どこ行く',
  'today-nani': '今日何する',
  'today-taberu': '今日何食べる',
  'today-mawasu': '今日どう回す',
  'shippai-shinai': '失敗しない外出',
  tenki: '天気で決める',
  'heijitsu-yoru': '平日夜を回す',
  gyouji: '季節と行事',
  narai: '習い事と学び',
  yakudatsu: '役立つもの',
};

export default function HomePage() {
  // Dynamic date for hero's today card
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
  const dateLine = `${month}月${day}日（${weekday}）`;
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // 最新記事（ファイルベース）
  const latestArticles = getAllFileArticles().slice(0, 6);

  return (
    <>
      <SiteHeader showLiveChip />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">今日を3分で決める</span>
              <h1>
                <span>親の毎日を、</span><br />
                <span className="accent">ちょっと軽く</span><span>。</span>
                <span className="small">
                  子育て家庭の「今日どうする？」を、<br />
                  条件から3分で決めるサイトです。
                </span>
              </h1>
              <p className="lead">
                0〜6歳の子と過ごす毎日は、選択が多すぎる。天気、年齢、時間、予算、余裕度。きょうのこは、その条件から今日の答えをひとつだけ返します。情報を増やさず、選択肢を絞る。それだけ。
              </p>
              <div className="hero-actions">
                <Link href="#finder" className="btn-primary">
                  条件で探す
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/about" className="btn-ghost">
                  このサイトについて
                </Link>
              </div>
            </div>

            <div className="today-card">
              <div className="label">Today / 今日</div>
              <div className="date-line">{dateLine}</div>
              <div className="date-meta">{monthsEn[now.getMonth()]}</div>
              <div className="hint-rows">
                <div className="hint-row"><span className="key">時間帯</span><span className="val">夕方〜夜</span></div>
                <div className="hint-row"><span className="key">おすすめ</span><span className="val">家で過ごす</span></div>
                <div className="hint-row"><span className="key">今夜のヒント</span><span className="val">保育園後15分ごはん</span></div>
              </div>
              <Link href="#finder" className="cta">
                <span>今日の候補を見る</span>
                <span className="arrow">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Finder */}
      <div className="container">
        <div className="finder-wrap">
          <TodayFinder />
        </div>
      </div>

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Latest</span>
                <h2>最新の記事</h2>
              </div>
              <span className="hint">{latestArticles.length} articles</span>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              }}
            >
              {latestArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/article/${a.slug}`}
                  className="related-card"
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: a.hero ? `url(${a.hero})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div
                    style={{
                      padding: '16px 18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 10,
                        letterSpacing: '.16em',
                        textTransform: 'uppercase',
                        color: 'var(--clay)',
                        fontWeight: 600,
                      }}
                    >
                      {a.categoryName ?? CATEGORY_LABEL[a.category] ?? a.category}
                    </span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-mincho), "Shippori Mincho", serif',
                        fontSize: 15.5,
                        fontWeight: 600,
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {a.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 'auto',
                      }}
                    >
                      {a.quickInfo?.ageRanges?.slice(0, 1).map((age) => (
                        <span key={age} className="meta-chip clay">{age}歳</span>
                      ))}
                      {a.quickInfo?.durationMin ? (
                        <span className="meta-chip ochre">{a.quickInfo.durationMin}分</span>
                      ) : null}
                      {a.quickInfo?.place?.slice(0, 1).map((p) => (
                        <span key={p} className="meta-chip sage">
                          {p === 'home' ? '家' : p === 'indoor' ? '屋内' : '外'}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today's Picks */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Today&apos;s picks</span>
              <h2>今日のおすすめ</h2>
            </div>
            <span className="hint">{monthsEn[now.getMonth()]} {day}, {now.getFullYear()}</span>
          </div>

          <div className="bento">
            <Link href="/article/rainy-2yo-home-play" className="pick pick-a">
              <span className="ribbon">Featured</span>
              <div className="thumb" />
              <div className="body">
                <div className="meta" style={{ marginBottom: 12 }}>
                  <span className="meta-chip clay">2〜3歳</span>
                  <span className="meta-chip sky">雨OK</span>
                  <span className="meta-chip sage">家</span>
                </div>
                <h3>雨の日、2歳と家でできる10分遊び。家にあるものだけで7つ。</h3>
              </div>
            </Link>

            <Link href="/article/hoikuen-kaeri-15min" className="pick pick-b">
              <div className="thumb" />
              <div className="body">
                <h3>保育園帰りの15分ごはん</h3>
                <div className="meta">
                  <span className="meta-chip clay">2〜3歳</span>
                  <span className="meta-chip ochre">平日夜</span>
                </div>
              </div>
            </Link>

            <Link href="/article/babycar-lunch-kichijoji" className="pick pick-c">
              <div className="thumb" />
              <div className="body">
                <h3>吉祥寺ベビーカーOKランチ9選</h3>
                <div className="meta">
                  <span className="meta-chip clay">0〜1歳</span>
                  <span className="meta-chip sky">外</span>
                </div>
              </div>
            </Link>

            <Link href="/article/indoor-spot-tokyo" className="pick pick-d">
              <div className="thumb" />
              <div className="body">
                <h3>雨でも行ける東京の屋内10か所</h3>
                <div className="meta">
                  <span className="meta-chip sky">雨OK</span>
                  <span className="meta-chip sage">屋内</span>
                </div>
              </div>
            </Link>

            <Link href="/article/craft-4yo-home" className="pick pick-e">
              <div className="thumb" />
              <div className="body">
                <h3>4〜5歳の雨の日工作6つ</h3>
                <div className="meta">
                  <span className="meta-chip clay">4〜6歳</span>
                  <span className="meta-chip sage">家</span>
                </div>
              </div>
            </Link>

            <Link href="/article/tsukareta-hi-saitekikai" className="pick pick-f">
              <div className="thumb" />
              <div className="body">
                <h3>疲れた日のための「やらないこと」</h3>
                <div className="meta">
                  <span className="meta-chip ochre">平日夜</span>
                  <span className="meta-chip sage">家</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Seasonal Panel */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="seasonal-panel">
            <div className="seasonal-head">
              <div className="side">
                <span className="month-num">{month}</span>
                <div>
                  <span className="eyebrow">Seasonal</span>
                  <h2 style={{ marginTop: 6 }}>今月の季節と行事</h2>
                  <div className="month-label" style={{ marginTop: 4 }}>{monthsEn[now.getMonth()]} · {month}月</div>
                </div>
              </div>
              <Link href="/category/gyouji" className="btn-ghost" style={{ borderColor: 'var(--clay)', color: 'var(--clay-deep)', whiteSpace: 'nowrap' }}>
                一年を見る
              </Link>
            </div>

            <div className="seasonal-grid">
              <Link href="/article/nyuuen-junbi-list" className="seasonal-card">
                <span className="tag-s">Apr · 入園準備</span>
                <h3>入園準備リスト。<br />名前つけ・持ち物の完全版</h3>
                <div className="meta-s">0〜3歳</div>
              </Link>
              <Link href="/article/kodure-hanami-tokyo" className="seasonal-card">
                <span className="tag-s">Apr · 花見</span>
                <h3>子連れで行ける<br />東京の花見スポット</h3>
                <div className="meta-s">0〜6歳</div>
              </Link>
              <Link href="/article/gw-kodure-tokyo" className="seasonal-card">
                <span className="tag-s">May · GW</span>
                <h3>ゴールデンウィーク<br />疲れない家族計画</h3>
                <div className="meta-s">全年齢</div>
              </Link>
              <Link href="/article/kodomo-no-hi-kyaraben" className="seasonal-card">
                <span className="tag-s">May · 端午の節句</span>
                <h3>こどもの日<br />簡単キャラ弁と飾り</h3>
                <div className="meta-s">2〜6歳</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="concerns-wrap">
            <div className="section-head" style={{ borderBottom: 0, marginBottom: 24, paddingBottom: 0 }}>
              <div>
                <span className="eyebrow">By concern</span>
                <h2>今日の「困った」から</h2>
              </div>
              <span className="hint">Index / 01〜06</span>
            </div>

            <div className="concerns">
              <Concern num="01" title="雨の日で詰んでいる" desc="屋内スポット・家遊び・代替案を年齢別に" href="/issue/rainy-day" />
              <Concern num="02" title="平日夜が回らない" desc="15分ごはん・保育園後の段取り・寝かしつけ" href="/issue/heijitsu-yoru" />
              <Concern num="03" title="子連れ外出で失敗したくない" desc="ベビーカー・子ども椅子・おむつ替え台あり" href="/issue/shippai-shinai" />
              <Concern num="04" title="家で何して遊ぶか決まらない" desc="10分でできる・家にあるもので・準備1分" href="/issue/home-play" />
              <Concern num="05" title="今日のごはんが決まらない" desc="時短・子どもが食べる・宅食・ミールキット" href="/issue/dinner" />
              <Concern num="06" title="休日の予定が立たない" desc="年齢別・天気別・半日で戻れる・疲れない" href="/issue/weekend" />
            </div>
          </div>
        </div>
      </section>

      {/* Outing filter */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="outing-panel">
            <div className="section-head" style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }}>
              <div>
                <span className="eyebrow">Filter by</span>
                <h2>失敗しない外出</h2>
              </div>
              <span className="hint">Tag-based</span>
            </div>
            <div className="outing-chips">
              {OUTING_TAGS.map(tag => (
                <Link key={tag.href} href={tag.href} className="outing-chip">
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Age picker - TODO: /age/* ページ未実装のため一時非表示 */}

      {/* Warm Panel */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="warm-panel">
            <div className="warm-image" role="img" aria-label="あたたかな家庭のイメージ" />
            <div className="warm-text">
              <span className="eyebrow">For you</span>
              <h2>
                毎日、選ぶことが<br />多すぎる。<br />
                <span className="accent">その一部を、</span>ちょっとだけ軽く。
              </h2>
              <p>子育て中の毎日は、小さな決定の連続です。今日の過ごし方、今夜のごはん、明日の準備。きょうのこは、その一部を引き受けます。</p>
              <ul className="for-list">
                <li>共働きで、保育園後の夕飯に毎日困っている</li>
                <li>雨の日や猛暑日に、代替案が思い浮かばない</li>
                <li>初めての子育てで、毎日の判断が重い</li>
                <li>ワンオペで、外出の動線設計が大変</li>
              </ul>
            </div>
          </div>

          <div className="voices-strip">
            <div className="voice-scene voice-s-1">
              <div className="vline">小さな手を握って歩く、<br />今日の数分を大切にしたい。</div>
            </div>
            <div className="voice-scene voice-s-2">
              <div className="vline">帰ってきて、すぐに<br />ごはんを出せる日。</div>
            </div>
            <div className="voice-scene voice-s-3">
              <div className="vline">疲れた日は、<br />疲れたままでいい。</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Index */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">All categories</span>
              <h2>カテゴリ</h2>
            </div>
            <span className="hint">07 sections</span>
          </div>

          <div className="cat-index">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.slug} href={cat.href} className="cat-item">
                <span className="cat-idx">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </span>
                <svg className="cat-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav active="today-doko" />
    </>
  );
}

function Concern({ num, title, desc, href }: { num: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="concern">
      <span className="num">{num}</span>
      <div className="concern-body">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </Link>
  );
}

const OUTING_TAGS = [
  { label: 'ベビーカーOK', href: '/tag/babycar' },
  { label: '雨でもいける', href: '/tag/rain-ok' },
  { label: '子ども椅子あり', href: '/tag/kids-chair' },
  { label: 'おむつ替え台', href: '/tag/diaper-table' },
  { label: 'ワンオペ向き', href: '/tag/onep-friendly' },
  { label: '兄弟連れ向き', href: '/tag/brothers-ok' },
  { label: 'ランチしやすい', href: '/tag/lunch-friendly' },
  { label: '屋内', href: '/tag/indoor' },
  { label: '猛暑日OK', href: '/tag/heat-ok' },
  { label: '駅近', href: '/tag/close' },
  { label: 'エレベーター有', href: '/tag/elevator' },
];

const CATEGORIES = [
  { slug: 'today-doko', href: '/category/today-doko', name: '今日どこ行く', desc: 'おでかけ / 屋内 / 雨でも行ける' },
  { slug: 'today-nani', href: '/category/today-nani', name: '今日何する', desc: '家遊び / 工作 / 10分 / 絵本' },
  { slug: 'today-taberu', href: '/category/today-taberu', name: '今日何食べる', desc: '幼児食 / 時短 / 保育園後' },
  { slug: 'today-mawasu', href: '/category/today-mawasu', name: '今日どう回す', desc: '夜の段取り / 平日夜 / 寝かしつけ' },
  { slug: 'gyouji', href: '/category/gyouji', name: '季節と行事', desc: '入園 / 運動会 / 七五三 / ハロウィン' },
  { slug: 'narai', href: '/category/narai', name: '習い事と学び', desc: '教室選び / 絵本 / 知育' },
  { slug: 'yakudatsu', href: '/items', name: '役立つもの', desc: '宅食 / ミールキット / 時短家電' },
];
