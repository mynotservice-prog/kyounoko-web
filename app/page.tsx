import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { TodayFinder } from '@/components/top/TodayFinder';
import { getAllFileArticles } from '@/lib/articles';
import { getTokyoNow, formatJaLong, monthNameEn } from '@/lib/date';
import { AdSlot } from '@/components/ads/AdSlot';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import { getMonthlyPickedItems } from '@/lib/items-catalog';

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

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
  const now = getTokyoNow();
  const month = now.month;
  const day = now.day;
  const dateLine = formatJaLong(now);
  const monthEn = monthNameEn(now);

  const latestArticles = getAllFileArticles().slice(0, 4);
  const monthlyPicks = getMonthlyPickedItems(month, 6);

  return (
    <>
      <SiteHeader showLiveChip />

      {/* ======================================================================
          First view — Hero + TodayFinder に集中
          ====================================================================== */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">今日を3分で決める</span>
              <h1>
                <span>親の毎日を、</span><br />
                <span className="accent">ちょっと軽く</span><span>。</span>
              </h1>
              <p className="lead" style={{ marginTop: 24 }}>
                子育て家庭の「今日どうする？」を、条件から3分で決めるサイトです。
                0〜6歳の子と過ごす毎日は、選択が多すぎる。天気、年齢、時間、予算、余裕度。
                きょうのこは、その条件から<strong>今日の答えをひとつだけ</strong>返します。
                情報を増やさず、選択肢を絞る。それだけ。
              </p>
              <div className="hero-actions">
                <Link href="#finder" className="btn-primary">
                  条件を入れる
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
              <div className="date-meta">{monthEn}</div>
              <div className="hint-rows">
                <div className="hint-row"><span className="key">提案</span><span className="val">条件を入れる</span></div>
                <div className="hint-row"><span className="key">結果</span><span className="val">答えは1つだけ</span></div>
                <div className="hint-row"><span className="key">時間</span><span className="val">3分で決まる</span></div>
              </div>
              <Link href="#finder" className="cta">
                <span>今日の答えを出す</span>
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

      {/* ======================================================================
          Finder — これがこのサイトの主役
          ====================================================================== */}
      <div className="container">
        <div className="finder-wrap">
          <TodayFinder />
        </div>
      </div>

      {/* AdSense: Finder 下 */}
      <div className="container" style={{ marginTop: 12 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      {/* ======================================================================
          今月の季節と行事（時期性がコンセプトと合致するので残す）
          ====================================================================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="seasonal-panel">
            <div className="seasonal-head">
              <div className="side">
                <span className="month-num">{month}</span>
                <div>
                  <span className="eyebrow">Seasonal</span>
                  <h2 style={{ marginTop: 6 }}>今月の季節と行事</h2>
                  <div className="month-label" style={{ marginTop: 4 }}>{monthEn} · {month}月</div>
                </div>
              </div>
              <Link href="/category/gyouji" className="btn-ghost" style={{ borderColor: 'var(--clay)', color: 'var(--clay-deep)', whiteSpace: 'nowrap' }}>
                一年を見る
              </Link>
            </div>

            <div className="seasonal-grid">
              {getSeasonalPicks(month).map((p) => (
                <Link key={p.slug} href={`/article/${p.slug}`} className="seasonal-card">
                  <span className="tag-s">{p.tag}</span>
                  <h3 dangerouslySetInnerHTML={{ __html: p.title }} />
                  <div className="meta-s">{p.age}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          今日の「困ったから」—— 最重要条件のみプリセット、残りはユーザー入力
          ====================================================================== */}
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
              <Concern num="01" title="雨の日で詰んでいる" desc="屋内スポット・家遊び・代替案を条件で絞る" href="/today?weather=rain&place=home" />
              <Concern num="02" title="平日夜が回らない" desc="15分ごはん・保育園後の段取り・寝かしつけ" href="/today?day=weekday&duration=60&place=home" />
              <Concern num="03" title="子連れ外出で失敗したくない" desc="ベビーカー・子ども椅子・おむつ替え台あり" href="/today?place=outside" />
              <Concern num="04" title="家で何して遊ぶか決まらない" desc="10分でできる・家にあるもので・準備1分" href="/today?place=home&duration=15" />
              <Concern num="05" title="今日のごはんが決まらない" desc="時短・子どもが食べる・宅食・ミールキット" href="/category/today-taberu" />
              <Concern num="06" title="休日の予定が立たない" desc="年齢別・天気別・半日で戻れる・疲れない" href="/today?day=holiday&duration=240" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          カテゴリ（全体マップ。引き続き残す）
          ====================================================================== */}
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

      {/* ======================================================================
          今月、親たちが選んでいるもの — 季節に合わせたアフィ導線
          （4〜6月: 入園・GW / 7〜9月: 暑さ対策・運動会 / 10〜12月: 七五三・XMas
             / 1〜3月: 冬の読み聞かせ・入園準備 など、月数から自動で並び替え）
          ====================================================================== */}
      {monthlyPicks.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="monthly-picks">
              <div className="monthly-picks-head">
                <div>
                  <span className="eyebrow">This month · {monthEn}</span>
                  <h2>今月、親たちが選んでいるもの</h2>
                  <p className="monthly-picks-pr" role="note">
                    <span className="pr-label">PR</span>
                    <span>
                      ※本エリアは広告を含みます。{month}月に特に動きのあるアイテムを編集部が選定。
                    </span>
                  </p>
                </div>
                <Link
                  href="/items"
                  className="btn-ghost"
                  style={{
                    borderColor: 'var(--clay)',
                    color: 'var(--clay-deep)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  カタログ全体を見る →
                </Link>
              </div>

              <div className="monthly-picks-rail">
                {monthlyPicks.map((item) => (
                  <AffiliateLink
                    key={item.id}
                    href={item.href}
                    title={item.name}
                    subtitle={item.subtitle}
                    price={item.price}
                    provider={item.provider}
                    pr={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          Warm panel — ブランド体験強化
          ====================================================================== */}
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

      {/* ======================================================================
          最新の記事（補足。主役ではないのでフッター近くに移動）
          ====================================================================== */}
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
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          失敗しない外出（ショートカット集。主役ではないのでフッター近く）
          ====================================================================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="outing-panel">
            <div className="section-head" style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }}>
              <div>
                <span className="eyebrow">Shortcuts</span>
                <h2>失敗しない外出</h2>
              </div>
              <span className="hint">Quick access</span>
            </div>
            <div className="outing-chips">
              {OUTING_TAGS.map((tag) => (
                <Link key={tag.href} href={tag.href} className="outing-chip">
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav active="today-doko" />
    </>
  );
}

// 月ごとの季節記事プール。各月4件。全て実在するslugのみ。
type SeasonalPick = { slug: string; tag: string; title: string; age: string };
const SEASONAL_POOL: Record<number, SeasonalPick[]> = {
  1: [
    { slug: 'oshougatsu-kodomo-sugoshikata', tag: 'Jan · 正月', title: 'お正月の過ごし方<br />子連れで何する？', age: '1〜6歳' },
    { slug: 'hatsuzekku-sugoshikata', tag: 'Jan · 初節句', title: '初節句の過ごし方と<br />準備リスト', age: '0〜1歳' },
    { slug: 'amenohi-ie-asobi-2-3sai', tag: 'Jan · 家遊び', title: '冬の家遊び10選<br />（2〜3歳）', age: '2〜3歳' },
    { slug: 'kodomo-no-kaze-hatsunetsu-taiou', tag: 'Jan · 風邪対応', title: '子の発熱<br />対応チェックリスト', age: '0〜6歳' },
  ],
  2: [
    { slug: 'hatsuzekku-sugoshikata', tag: 'Feb · 初節句', title: '初節句の過ごし方と<br />準備リスト', age: '0〜1歳' },
    { slug: 'chiiku-asobi-ie-de-10', tag: 'Feb · 家遊び', title: '家でできる知育遊び<br />10選', age: '1〜4歳' },
    { slug: 'kodomo-no-kaze-hatsunetsu-taiou', tag: 'Feb · 感染症', title: '子の発熱<br />対応チェックリスト', age: '0〜6歳' },
    { slug: 'amenohi-indoor-spots-tokyo-15', tag: 'Feb · 屋内', title: '屋内キッズスポット<br />東京15選', age: '0〜6歳' },
  ],
  3: [
    { slug: 'youchien-nyuuen-junbi-list', tag: 'Mar · 入園準備', title: '入園準備リスト。<br />名前つけ・持ち物の完全版', age: '0〜3歳' },
    { slug: 'sakura-ohanami-kodzure-spots', tag: 'Mar · 花見', title: '子連れで行ける<br />東京の花見スポット', age: '0〜6歳' },
    { slug: 'ohanami-keikaku-junbi', tag: 'Mar · 花見準備', title: 'お花見の計画と<br />持ち物チェックリスト', age: '0〜6歳' },
    { slug: 'youji-naraigoto-nansai-kara', tag: 'Mar · 習い事', title: '幼児の習い事<br />何歳から始める？', age: '2〜6歳' },
  ],
  4: [
    { slug: 'youchien-nyuuen-junbi-list', tag: 'Apr · 入園準備', title: '入園準備リスト。<br />名前つけ・持ち物の完全版', age: '0〜3歳' },
    { slug: 'sakura-ohanami-kodzure-spots', tag: 'Apr · 花見', title: '子連れで行ける<br />東京の花見スポット', age: '0〜6歳' },
    { slug: 'kosodate-muryou-spots-tokyo', tag: 'Apr · GW', title: 'GWも行ける<br />東京の無料スポット15選', age: '全年齢' },
    { slug: 'kodomo-no-hi-kyaraben', tag: 'May · 端午の節句', title: 'こどもの日<br />簡単キャラ弁と飾り', age: '2〜6歳' },
  ],
  5: [
    { slug: 'kodomo-no-hi-kyaraben', tag: 'May · 端午の節句', title: 'こどもの日<br />簡単キャラ弁と飾り', age: '2〜6歳' },
    { slug: 'kosodate-muryou-spots-tokyo', tag: 'May · GW', title: 'GWも行ける<br />東京の無料スポット15選', age: '全年齢' },
    { slug: 'hatsuzekku-sugoshikata', tag: 'May · 初節句', title: '初節句の過ごし方と<br />準備リスト', age: '0〜1歳' },
    { slug: 'puuru-mizuasobi-debut', tag: 'May · 水遊び', title: 'プール・水遊び<br />デビューガイド', age: '1〜4歳' },
  ],
  6: [
    { slug: 'amenohi-ie-asobi-2-3sai', tag: 'Jun · 梅雨', title: '雨の日の家遊び<br />10選（2〜3歳）', age: '2〜3歳' },
    { slug: 'amenohi-ie-asobi-4-6sai', tag: 'Jun · 梅雨', title: '雨の日の家遊び<br />（4〜6歳）', age: '4〜6歳' },
    { slug: 'amenohi-indoor-spots-tokyo-15', tag: 'Jun · 屋内', title: '屋内キッズスポット<br />東京15選', age: '0〜6歳' },
    { slug: 'puuru-mizuasobi-debut', tag: 'Jun · 水遊び', title: 'プール・水遊び<br />デビューガイド', age: '1〜4歳' },
  ],
  7: [
    { slug: 'tanabata-kazari-sakusei', tag: 'Jul · 七夕', title: '七夕飾りの作り方<br />（2〜6歳）', age: '2〜6歳' },
    { slug: 'natsumatsuri-kodzure-koryaku', tag: 'Jul · 夏祭り', title: '夏祭りの子連れ攻略<br />持ち物と動線', age: '0〜6歳' },
    { slug: 'puuru-mizuasobi-debut', tag: 'Jul · 水遊び', title: 'プール・水遊び<br />デビューガイド', age: '1〜4歳' },
    { slug: 'moushobi-suzushii-spots', tag: 'Jul · 猛暑', title: '猛暑日ベビーカーで<br />行ける涼しい屋内', age: '0〜6歳' },
  ],
  8: [
    { slug: 'natsumatsuri-kodzure-koryaku', tag: 'Aug · 夏祭り', title: '夏祭りの子連れ攻略<br />持ち物と動線', age: '0〜6歳' },
    { slug: 'moushobi-suzushii-spots', tag: 'Aug · 猛暑', title: '猛暑日ベビーカーで<br />行ける涼しい屋内', age: '0〜6歳' },
    { slug: 'puuru-mizuasobi-debut', tag: 'Aug · 水遊び', title: 'プール・水遊び<br />デビューガイド', age: '1〜4歳' },
    { slug: 'amenohi-indoor-spots-tokyo-15', tag: 'Aug · 屋内', title: '屋内キッズスポット<br />東京15選', age: '0〜6歳' },
  ],
  9: [
    { slug: 'undoukai-motimono-list', tag: 'Sep · 運動会', title: '運動会の持ち物<br />チェックリスト', age: '3〜6歳' },
    { slug: 'undoukai-obento-jitan-recipe', tag: 'Sep · 運動会', title: '運動会のお弁当<br />時短レシピ', age: '3〜6歳' },
    { slug: 'shizen-spot-tokyo-youji', tag: 'Sep · 自然', title: '東京の自然スポット<br />10選', age: '3〜6歳' },
    { slug: 'sakura-ohanami-kodzure-spots', tag: 'Sep · お出かけ', title: '秋の公園デート<br />ベスト候補', age: '0〜6歳' },
  ],
  10: [
    { slug: 'halloween-kodzure-events-2026', tag: 'Oct · ハロウィン', title: '子連れハロウィンイベント<br />2026', age: '2〜6歳' },
    { slug: 'halloween-kasou-junbi', tag: 'Oct · ハロウィン', title: 'ハロウィン仮装の<br />準備と100均活用', age: '1〜6歳' },
    { slug: 'undoukai-motimono-list', tag: 'Oct · 運動会', title: '運動会の持ち物<br />チェックリスト', age: '3〜6歳' },
    { slug: 'shichigosan-nenrei-junbi', tag: 'Nov · 七五三', title: '七五三の年齢と<br />準備ガイド', age: '3〜7歳' },
  ],
  11: [
    { slug: 'shichigosan-nenrei-junbi', tag: 'Nov · 七五三', title: '七五三の年齢と<br />準備ガイド', age: '3〜7歳' },
    { slug: 'amenohi-ie-asobi-4-6sai', tag: 'Nov · 家遊び', title: '秋冬の家遊び<br />（4〜6歳）', age: '4〜6歳' },
    { slug: 'shizen-spot-tokyo-youji', tag: 'Nov · 紅葉', title: '紅葉も楽しめる<br />東京の自然スポット', age: '3〜6歳' },
    { slug: 'xmas-market-kodzure', tag: 'Nov · XMas', title: '子連れクリスマスマーケット<br />攻略ガイド', age: '1〜6歳' },
  ],
  12: [
    { slug: 'xmas-present-nenrei-0-6', tag: 'Dec · XMas', title: 'クリスマスプレゼント<br />年齢別（0〜6歳）', age: '0〜6歳' },
    { slug: 'xmas-market-kodzure', tag: 'Dec · XMas', title: '子連れクリスマスマーケット<br />攻略ガイド', age: '1〜6歳' },
    { slug: 'oshougatsu-kodomo-sugoshikata', tag: 'Dec · 年末年始', title: 'お正月の過ごし方<br />子連れで何する？', age: '1〜6歳' },
    { slug: 'amenohi-ie-asobi-2-3sai', tag: 'Dec · 家遊び', title: '冬の家遊び10選<br />（2〜3歳）', age: '2〜3歳' },
  ],
};

function getSeasonalPicks(month: number): SeasonalPick[] {
  return SEASONAL_POOL[month] ?? SEASONAL_POOL[4];
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
  { label: 'ベビーカー選び', href: '/article/babycar-ranking-2026' },
  { label: '雨でもいける', href: '/today?weather=rain&place=outside' },
  { label: '屋内キッズスポット', href: '/article/amenohi-indoor-spots-tokyo-15' },
  { label: '猛暑日OK', href: '/article/moushobi-suzushii-spots' },
  { label: '自然・公園', href: '/article/shizen-spot-tokyo-youji' },
  { label: '無料スポット', href: '/article/kosodate-muryou-spots-tokyo' },
  { label: '子連れランチ', href: '/article/shumatsu-ranchi-kodzure' },
  { label: 'お花見', href: '/article/sakura-ohanami-kodzure-spots' },
  { label: '0-1歳と外出', href: '/article/akachan-odekake-3months-1year' },
  { label: '抱っこ紐選び方', href: '/article/dakkohimo-ranking-2026' },
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
