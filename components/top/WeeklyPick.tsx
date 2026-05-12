import Link from 'next/link';
import type { Spot } from '@/lib/spots';
import { SPOTS, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { getAreaName, type AreaSlug } from '@/lib/area';

/**
 * 「今週のおすすめ」セクション。
 * Instagram人気アカウントの「今週末はここ行こう」訴求パターンをサイトに転用。
 *
 * 仕様:
 * - 月（1-12）を基に、季節に合うスポットを4つ pick
 * - 暖色のトーンでトップに配置
 * - 各スポットに「穴場ポイント」があればそれを主訴求
 */

type Props = {
  month: number; // 1-12
};

/** 月→選ぶべきカテゴリのハック的優先順位 */
function monthlyPickStrategy(month: number): {
  intro: string;
  areas: AreaSlug[];
  categoryPriority: string[];
} {
  // 春（3-5月）
  if (month >= 3 && month <= 5) {
    return {
      intro: '桜の季節。外気が気持ちいい時期におすすめの公園と動物園を集めました',
      areas: ['tokyo', 'osaka', 'kyoto', 'fukuoka'],
      categoryPriority: ['park', 'zoo', 'nature', 'aquarium'],
    };
  }
  // 梅雨（6月）
  if (month === 6) {
    return {
      intro: '雨の日でも子どもが飽きない屋内スポットを厳選',
      areas: ['tokyo', 'osaka', 'aichi', 'fukuoka'],
      categoryPriority: ['aquarium', 'museum', 'indoor', 'amusement'],
    };
  }
  // 夏（7-8月）
  if (month >= 7 && month <= 8) {
    return {
      intro: '猛暑でも快適に過ごせる屋内＆水辺スポット特集',
      areas: ['okinawa', 'tokyo', 'osaka', 'kanagawa'],
      categoryPriority: ['aquarium', 'indoor', 'amusement'],
    };
  }
  // 秋（9-11月）
  if (month >= 9 && month <= 11) {
    return {
      intro: '紅葉とアウトドアのベストシーズン。歩き回れる公園と動物園',
      areas: ['tokyo', 'kyoto', 'aichi', 'kanagawa'],
      categoryPriority: ['zoo', 'park', 'nature', 'museum'],
    };
  }
  // 冬（12-2月）
  return {
    intro: '寒い日でも楽しめる屋内スポットと冬限定の体験',
    areas: ['tokyo', 'osaka', 'aichi', 'hokkaido'],
    categoryPriority: ['aquarium', 'museum', 'indoor', 'amusement'],
  };
}

function pickWeekly(month: number, limit: number): { area: AreaSlug; spot: Spot }[] {
  const { areas, categoryPriority } = monthlyPickStrategy(month);
  const pool: { area: AreaSlug; spot: Spot; priority: number }[] = [];
  for (const area of areas) {
    const spots = SPOTS[area] ?? [];
    for (const spot of spots) {
      const priority = categoryPriority.indexOf(spot.category);
      if (priority === -1) continue;
      // 穴場情報があるスポットを優先
      const bonus = spot.hiddenTip ? -10 : 0;
      pool.push({ area, spot, priority: priority + bonus });
    }
  }
  pool.sort((a, b) => a.priority - b.priority);
  // 同じエリアが連続しないようにシャッフル的に選ぶ
  const seen = new Set<AreaSlug>();
  const result: { area: AreaSlug; spot: Spot }[] = [];
  for (const item of pool) {
    if (seen.has(item.area) && result.length < limit) continue;
    result.push({ area: item.area, spot: item.spot });
    seen.add(item.area);
    if (result.length >= limit) break;
  }
  return result.slice(0, limit);
}

export function WeeklyPick({ month }: Props) {
  const picks = pickWeekly(month, 4);
  const { intro } = monthlyPickStrategy(month);
  if (picks.length === 0) return null;

  return (
    <section
      className="cv-auto-section"
      style={{
        background: 'linear-gradient(135deg, var(--peach-soft) 0%, #fff7ee 100%)',
        padding: '56px 0',
        marginTop: 40,
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <span className="eyebrow" style={{ color: 'var(--clay)' }}>
            {month}月の今週推し
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-mincho)',
              fontSize: 26,
              fontWeight: 600,
              margin: '6px 0 10px',
              color: 'var(--ink)',
            }}
          >
            今週末、ここが正解。
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.65, maxWidth: 640 }}>
            {intro}。料金・予約・穴場ポイントまで含めて具体的にご案内します。
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {picks.map(({ area, spot }) => (
            <article
              key={`${area}-${spot.name}`}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    background: 'var(--sage-pale)',
                    color: 'var(--sage-deep)',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {SPOT_CATEGORY_LABEL[spot.category]}
                </span>
                <span style={{ padding: '2px 8px', background: 'var(--peach-soft)', color: 'var(--clay)', borderRadius: 999 }}>
                  {getAreaName(area)}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {spot.name}
              </h3>

              {spot.city && (
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                  {spot.city}・対象 {spot.ages.join('/')}歳
                </div>
              )}

              {spot.hiddenTip && (
                <div
                  style={{
                    background: '#fff9ef',
                    borderLeft: '3px solid #e2b39a',
                    padding: '8px 10px',
                    fontSize: 11,
                    color: 'var(--ink)',
                    lineHeight: 1.6,
                    borderRadius: '0 6px 6px 0',
                  }}
                >
                  <strong style={{ color: '#c4704f', fontSize: 10, letterSpacing: '.08em' }}>穴場ポイント</strong>
                  <br />
                  {spot.hiddenTip}
                </div>
              )}

              {spot.note && !spot.hiddenTip && (
                <p style={{ fontSize: 12, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.6 }}>
                  {spot.note}
                </p>
              )}

              <Link
                href={`/today?area=${area}&place=${spot.place === 'outdoor' ? 'outside' : spot.place === 'indoor' ? 'home' : 'any'}`}
                style={{
                  marginTop: 'auto',
                  fontSize: 12,
                  color: 'var(--sage-deep)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                この条件で今日の答えを見る →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
