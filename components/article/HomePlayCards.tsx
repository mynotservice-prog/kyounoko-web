import {
  ENERGY_LABEL,
  POSTURE_LABEL,
  formatAgeMonths,
  type HomePlay,
} from '@/lib/home-play';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';

/**
 * おうち遊びカード（lib/home-play.ts からの自動生成）。
 *
 * 上位記事82本の実測で欠けていた「準備○分・片付け○分・親の姿勢・月齢・安全の公式根拠」を
 * 全遊びに同じ形で出す。安全注意は一次情報（消費者庁・こども家庭庁・小児科学会）へのリンク付き。
 * 体験談（story）と実写（photo）は運営者の実体験だけ。無いものは描画しない（捏造しない）。
 */
const POSTURE_ICON: Record<HomePlay['parentPosture'], KkIconName> = {
  lying: 'rest-space',
  sitting: 'home',
  standing: 'walk',
};

const MEDIA_LABEL: Record<HomePlay['evidence'][number]['media'], string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  articles: '上位記事',
  qa: 'Q&Aサイト',
};

export function HomePlayCards({ plays }: { plays: HomePlay[] }) {
  if (!plays.length) return null;
  return (
    <div className="av3-plays">
      {plays.map((p, i) => (
        <article key={p.id} id={`play-${p.id}`} className="av3-play">
          <header className="av3-play-head">
            <span className="av3-play-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="av3-play-title">{p.name}</h3>
              <p className="av3-play-summary">{p.summary}</p>
            </div>
          </header>

          <dl className="av3-play-spec">
            <div>
              <dt>
                <KkIcon name="age" size={14} />
                対象
              </dt>
              <dd>{formatAgeMonths(p.ageMonths)}</dd>
            </div>
            <div>
              <dt>
                <KkIcon name="clock" size={14} />
                準備／片付け
              </dt>
              <dd>
                {p.prepMin === 0 ? '0分' : `約${p.prepMin}分`}／{p.cleanupMin === 0 ? '0分' : `約${p.cleanupMin}分`}
              </dd>
            </div>
            <div>
              <dt>
                <KkIcon name={POSTURE_ICON[p.parentPosture]} size={14} />
                親
              </dt>
              <dd>{POSTURE_LABEL[p.parentPosture]}</dd>
            </div>
            <div>
              <dt>
                <KkIcon name="playground" size={14} />
                体力
              </dt>
              <dd>
                {ENERGY_LABEL[p.energy]}・目安{p.durationMin}分
              </dd>
            </div>
          </dl>

          <p className="av3-play-items">
            <strong>使うもの</strong>
            {p.items.length ? p.items.join('／') : 'なし'}
            {p.itemsFrom === 'home+100' && <span className="av3-play-items-note">（100均で足すと広がる）</span>}
          </p>

          {p.photo && (
            <figure className="av3-play-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={`${p.name}（運営者撮影）`} loading="lazy" />
              <figcaption>運営者宅で撮影</figcaption>
            </figure>
          )}

          <ol className="av3-play-steps">
            {p.steps.map((s, j) => (
              <li key={j}>{s}</li>
            ))}
          </ol>

          {p.nextVariants.length > 0 && (
            <p className="av3-play-next">
              <strong>飽きたら</strong>
              {p.nextVariants.join('／')}
            </p>
          )}

          {p.story && (
            <blockquote className="av3-play-story">
              <span className="av3-play-story-lab">我が家では</span>
              {p.story}
            </blockquote>
          )}

          {p.safety.length > 0 && (
            <ul className="av3-play-safety">
              {p.safety.map((s, j) => (
                <li key={j}>
                  {s.text}{' '}
                  <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {s.sourceName}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {p.evidence.length > 0 && (
            <p className="av3-play-evidence">
              {p.evidence.map((e, j) => (
                <span key={j}>
                  {j > 0 && '／'}
                  {MEDIA_LABEL[e.media]}: {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      {e.label}
                    </a>
                  ) : (
                    e.label
                  )}
                </span>
              ))}
            </p>
          )}
        </article>
      ))}
      <p className="av3-play-foot">
        対象月齢は厚生労働省「乳幼児身体発育調査」の90%通過月齢と母子健康手帳の目安、安全注意は消費者庁・こども家庭庁・日本小児科学会などの公開資料に基づいています（2026年9月確認）。準備・片付けの分数は目安で、家庭により前後します。
      </p>
    </div>
  );
}
