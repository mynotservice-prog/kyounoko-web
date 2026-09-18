import {
  SEASON_ACTIVITY_LABEL,
  formatSeasonPeriod,
  getSeasonState,
  type SeasonState,
  type SpotSeasonWindow,
} from '@/lib/spot-season';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';

/**
 * 季節営業の会期ブロック（lib/spot-season.ts 駆動）。
 *
 * 2026-09-18 まで SPOT_SEASON は spots.ts にマージされるだけで画面に出ていなかった。
 * 「舎人公園 じゃぶじゃぶ池」が90日で58,029表示を取った一方、果物狩りは「関東の果物狩り20選」型の
 * 記事が8表示で負けている。勝ち筋は施設名ページなので、農園・じゃぶじゃぶ池の**年つきの会期**を
 * 施設ページに表で出す。事実はデータ層からのみ描画し、ここに直書きしない。
 *
 * 年が古い会期（stale-year）は「今年の情報は未確認」と正直に表示する（去年の日付を今年として見せない）。
 */
const STATE_LABEL: Record<SeasonState, string> = {
  open: '開催中',
  upcoming: 'これから',
  ended: '今年は終了',
  'stale-year': '今年の情報は未確認',
};

export function SpotSeasonBox({ spotName, windows, now = new Date() }: { spotName: string; windows: SpotSeasonWindow[]; now?: Date }) {
  if (!windows.length) return null;
  const rows = windows.map((w) => ({ w, state: getSeasonState(w, now) }));
  const labels = Array.from(new Set(windows.map((w) => SEASON_ACTIVITY_LABEL[w.activity])));
  return (
    <div className="kk-sec sv3-sec">
      <KkSectionTitle as="h2" title={`${spotName}の${labels.join('・')}｜今年の会期`} />
      <div className="sv3-measure">
        <div style={{ overflowX: 'auto' }}>
          <table className="kk-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>内容</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', whiteSpace: 'nowrap' }}>会期</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>時間・休み</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', whiteSpace: 'nowrap' }}>状態</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ w, state }, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>
                    <strong>{SEASON_ACTIVITY_LABEL[w.activity]}</strong>
                    {w.ageLimit && <div style={{ fontSize: 12, marginTop: 2 }}>対象: {w.ageLimit}</div>}
                  </td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{formatSeasonPeriod(w)}</td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', fontSize: 13 }}>
                    {[w.hours, w.closedDays?.length ? `休み: ${w.closedDays.join('・')}` : ''].filter(Boolean).join('／') || '公式記載なし'}
                  </td>
                  <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <span className={`kk-pill ${state === 'open' ? 'is-on' : ''}`}>{STATE_LABEL[state]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.some(({ w }) => w.note) && (
          <ul style={{ margin: '10px 0 0', paddingLeft: '1.2em', fontSize: 13 }}>
            {rows.filter(({ w }) => w.note).map(({ w }, i) => (
              <li key={i}>
                {SEASON_ACTIVITY_LABEL[w.activity]}: {w.note}
              </li>
            ))}
          </ul>
        )}
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-mute)' }}>
          出典: {Array.from(new Set(windows.map((w) => w.source))).join('／')}（
          {Array.from(new Set(windows.map((w) => w.checkedAt))).join('・')} 確認）。会期・料金は天候や生育で変わるため、出発前に公式でご確認ください。
        </p>
      </div>
    </div>
  );
}
