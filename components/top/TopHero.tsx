import { V2Img } from '@/components/v2/V2Base';
import { V2HeroForm } from '@/components/v2/V2HeroForm';
import { V2TodayHero, type AgePick } from '@/components/v2/V2TodayHero';
import type { ChildAge } from '@/hooks/useUserSettings';
import { FINDER_STATIONS, POPULAR_TERMINALS, POPULAR_FAMILY } from '@/lib/finder-stations';

/**
 * トップのファーストビュー（2026-09 リニューアル 第2版）。
 *
 * 構成はモックに合わせる:
 *   写真の帯（スマホは全幅・コピーを写真に重ねる／PCは右カラムの縦長写真）
 *   → 手書き風の H1「今日、どこ行く？」（テキストは従来どおり）→ サブコピー
 *   → 操作UIのパネル1枚（ステータス帯 → 駅の検索欄 → 今日/明日/週末 → 年齢・天気(小) → CTA）
 *
 * 2026-09-10: パネル下のクイック検索チップ（雨の日・晴れの日・室内施設・子連れランチ・イベント・
 * 無料スポット）は社長指示で撤去。
 *
 * 画像・H1テキスト・フォームのロジック・/today のクエリ形は従来のまま。
 *
 * フォント: 仕様どおり Yomogi は「このヒーローだけ」。
 * 2026-09: Yomogi は app/layout.tsx の next/font で自己ホストし、--v2-brush 経由で
 * （@import は先頭以外だとブラウザが無視する）実際には一度も読み込まれていなかったため、
 * H1 にだけ流す（preload なし＝LCP を守る）。
 * ステータス帯は V2TodayHero（登録済ユーザーのみ描画・未登録/クローラには null）が担う。
 */
export function TopHero({
  agePicks,
}: {
  agePicks?: Partial<Record<ChildAge, AgePick[]>>;
}) {
  return (
    <section className="tv3-hero" aria-label="今日の1日プランをつくる">
      <div className="tv3-hero-copy">
        <span className="tv3-hero-eyebrow">0〜6歳の子育ておでかけメディア</span>
        {/* H1 のテキストは従来どおり。span で分割すると抽出時に空白が入るので単一テキストにする。 */}
        <h1 className="tv3-hero-h1">今日、どこ行く？</h1>
        <p className="tv3-hero-sub">
          年齢・駅・天気を選ぶだけで、<br className="v2-br-pc" />
          子連れの「1日プラン」が3分で決まる。
        </p>
      </div>

      <div className="tv3-hero-media">
        {/*
          2026-09-10: 社長支給のファーストビュー写真に差し替え。スマホもPCも同じ1枚。
        */}
        <picture>
          <V2Img
            src="/img/top/hero.webp"
            seed="hero-family"
            alt="親子でおでかけ"
            className="tv3-hero-bg"
            priority
          />
        </picture>
        <span className="tv3-hero-scrim" aria-hidden="true" />
      </div>

      {/* 操作UIのパネル（丸角・面を持ってよい唯一の塊） */}
      <div className="tv3-panel">
        <V2TodayHero agePicks={agePicks} variant="panel-only" />
        <V2HeroForm stations={FINDER_STATIONS} terminals={POPULAR_TERMINALS} family={POPULAR_FAMILY} />
      </div>

    </section>
  );
}
