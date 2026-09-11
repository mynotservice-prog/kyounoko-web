import Link from 'next/link';
import {
  FACILITY_LABELS,
  type ChainFacilities,
  type FacilityKey,
} from '@/lib/chain-facilities';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';
import { COVERAGE_KEY_ORDER, COVERAGE_LABELS, formatRate, getChainCoverage } from '@/lib/chain-coverage';

/**
 * チェーン×子連れ設備の判定ボックス（lib/chain-facilities.ts からの自動生成）。
 *
 * 従来は各記事md内の手書き表だったが、単一データソース駆動に置き換えることで
 * 記事間の不整合・鮮度切れを構造的に無くす（戦略§7: 外出前のGO/NO-GO判定を
 * 1画面目で完結させる）。最終確認日・確認手段・公式サイトへの一次リンク・
 * 修正依頼導線を必ず添える（E-E-A-T）。
 *
 * 2026-09 リニューアル: 見た目を KkFacilityGrid（設備アイコン＋ピル）に揃えた。
 * 見出し・項目名・判定記号（✓/△/—）・注記・脚注の文言は従来と同一。
 * 2026-09-08: 見出し頭の絵文字（🪧）は線画アイコンへ置き換え（§3-0「絵文字を使わない」）。
 */
const FACILITY_ICONS: Record<FacilityKey, KkIconName> = {
  stepFree: 'walk',
  zashiki: 'home',
  boxSeat: 'kids-space',
  kidsChair: 'baby-chair',
  kidsMenu: 'kids-menu',
  kidsCutlery: 'lunch',
  diaperTable: 'diaper',
  nursingRoom: 'nursing',
  babyFoodBringIn: 'baby',
  toriwake: 'lunch',
  strollerToSeat: 'stroller',
  allergenInfo: 'check',
};

export function ChainFacilitiesBox({
  chain,
  anchorId,
}: {
  chain: ChainFacilities;
  /** 置き換え前のmd見出しのid（目次アンカーを生かすため引き継ぐ） */
  anchorId?: string;
}) {
  const keys = Object.keys(FACILITY_LABELS) as FacilityKey[];
  const verified = formatYm(chain.verifiedAt);
  // 設備カバー率センサス（公式店舗検索の全店集計）。あるチェーンだけ「店舗による」を率で補足し、
  // 調査ハブ /data/chain-facility-coverage へ回遊させる（戦略§5-2: 調査ハブ⇄個別記事の双方向リンク）
  const coverage = getChainCoverage(chain.key);
  const coverageItems = coverage
    ? COVERAGE_KEY_ORDER.filter((k) => coverage.facilities[k]).map((k) => ({
        key: k,
        label: COVERAGE_LABELS[k],
        count: coverage.facilities[k]!.count,
        total: coverage.total,
      }))
    : [];

  return (
    <section
      id={anchorId}
      aria-label={`${chain.name}の子連れ判定ボックス`}
      className="av3-chain"
    >
      <div className="av3-chain-head">
        <h2 className="av3-chain-title">
          <span className="av3-chain-ico" aria-hidden="true">
            <KkIcon name="check" size={19} sw={2} />
          </span>
          {chain.name}の子連れチェックリスト
        </h2>
        <span className="av3-chain-verified">最終確認: {verified}</span>
      </div>

      <div className="kk-fac-grid">
        {keys.map((k) => {
          const v = chain.items[k];
          if (!v) return null;
          const mark = v.ok === true ? '✓' : v.ok === 'partial' ? '△' : '—';
          const pill = v.ok === true ? 'yes' : v.ok === 'partial' ? 'text' : 'no';
          return (
            <div key={k} className={'kk-fac' + (v.ok === false ? ' is-no' : '')}>
              <span className="kk-fac-ico">
                <KkIcon name={FACILITY_ICONS[k]} size={24} />
              </span>
              <span className="kk-fac-label">{FACILITY_LABELS[k]}</span>
              <span className={'kk-pill ' + pill} aria-hidden="true">
                {mark}
              </span>
              {v.note && <span className="av3-fac-note">（{v.note}）</span>}
            </div>
          );
        })}
      </div>

      {chain.extras && chain.extras.length > 0 && (
        <div className="av3-chain-extras">
          {chain.extras.map((e) => (
            <div key={e.label} className="av3-chain-extra">
              <strong>{e.label}:</strong> {e.value}
            </div>
          ))}
        </div>
      )}

      {coverage && coverageItems.length > 0 && (
        <div className="av3-chain-extras" aria-label="公式店舗検索の全店集計">
          <div className="av3-chain-extra">
            <strong>公式店舗検索の全店集計（{coverage.total.toLocaleString()}店・{coverage.countedAt}）:</strong>{' '}
            {coverageItems.map((it, i) => (
              <span key={it.key}>
                {i > 0 && '／'}
                {it.label} {it.count.toLocaleString()}店（{formatRate(it.count / it.total)}）
              </span>
            ))}
            {' '}
            <Link href={`/data/chain-facility-coverage#chain-${chain.key}`}>他チェーンとの比較・出典</Link>
          </div>
        </div>
      )}

      <p className="av3-chain-note">
        ※ 店舗により異なる場合があります。{chain.verifiedMethod}。
        {chain.officialUrl ? (
          <>
            <a href={chain.officialUrl} target="_blank" rel="noopener noreferrer">
              公式サイト
            </a>
            で最新情報をご確認ください。
          </>
        ) : (
          '最新情報は公式サイトでご確認ください。'
        )}
        誤りに気づいた方は
        <Link href="/contact">修正依頼</Link>
        へ。
      </p>
    </section>
  );
}

function formatYm(iso: string): string {
  const [y, m] = iso.split('-');
  return `${y}年${Number(m)}月`;
}
