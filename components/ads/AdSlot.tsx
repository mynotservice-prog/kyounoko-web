import * as React from 'react';
import {
  ADSENSE_CLIENT,
  ADSENSE_ENABLED,
  ADSENSE_SLOT_DISPLAY,
  ADSENSE_SLOT_IN_ARTICLE,
  ADSENSE_SLOT_IN_FEED,
  ADSENSE_SLOT_MULTIPLEX,
  ADSENSE_IN_FEED_LAYOUT_KEY,
} from '@/lib/adsense';

/**
 * AdSense 広告スロット。
 *
 * Publisher ID は lib/adsense.ts のデフォルト（ca-pub-4445473825791494）、
 * env NEXT_PUBLIC_ADSENSE_PUB_ID で上書き可能。
 *
 * ## 配置タイプ → AdSenseユニットの対応
 * - home-below-finder / article-end / plan-below-hero
 *   → Display 広告（slot 7826131694）。レスポンシブで auto format。
 * - article-mid
 *   → 記事内（in-article）広告（slot 1853643928）。data-ad-layout="in-article"。
 * - sidebar
 *   → in-feed 広告（slot 5792888939）。layout-key 指定必須。
 *
 * AdSense審査未通過時は env `NEXT_PUBLIC_ADSENSE_ENABLED=true` 未設定なら非表示。
 *
 * =========================================================================
 * 手動広告枠ONの配置計画（2026-07-27 実測・**適用は8/13のAd intentsテスト終了後**）
 * =========================================================================
 * env `NEXT_PUBLIC_ADSENSE_ENABLED` は本番で未設定（本番HTMLに data-ad-slot が0件で確認済）。
 * 以下は「ONにする日に何をどこへ置くか」を実測geometryで確定させたもの。ONにする判断と
 * env設定は社長承認事項。
 *
 * ## 実測（kyounoko.jp/article/ohsho-kids-menu・375x812・実ブラウザで計測）
 *   本文総高 ≈ 10,400px ≈ **12.8画面**
 *   自動広告（充填済・高さ200px） ...... top 1,919px（screen 2.4）
 *   本文H2「結論」 ...................... top 2,159px（screen 2.7）
 *   本文H2「子連れで行く時のコツ」 ...... top 4,085px（screen 5.0）
 *   アフィリCTA（楽天3点） ............. top 6,902〜7,402px（screen 8.5〜9.1）
 *   ネット予約CTA（VC） ................ top 8,112px（screen 10.0）
 *   AdSlot 'article-end' の位置 ........ 上記直後（screen ≈10.0）
 *   AdSlot 'article-related' の位置 .... screen ≈12.4
 *   現在レンダリングされている広告 ...... 4 <ins> のうち充填1（＝自動広告のみで低密度）
 *
 * ## 重要な帰結（そのままONにしてはいけない理由）
 * 記事ページに定義済みの手動枠は 'article-end'(screen10.0) と 'article-related'(screen12.4)
 * の**2つだけで、どちらも全12.8画面の下位22%**にある。このままONにすると
 * 「ほぼ見られない位置のインプレッション」を大量に発生させ、
 * **視認可能率（実測 92.54%→65.69% に低下済）をさらに押し下げる**。
 * 視認可能率が下がるとCPMも下がるため、枠を増やせばRPMが上がるとは限らない。
 *
 * ## 上限の根拠（実測と公式ポリシーの両方）
 * - AdSense の広告掲載ポリシーは**枚数の数値上限を定めていない**（ポップアップ3個の記述を除く）。
 *   規定は定性的（誤クリック誘発の禁止・コンテンツと広告の紛らわしい配置の禁止・
 *   コンテンツがほぼ無いページへの掲載禁止）。
 * - 客観的な数値上限は **Better Ads Standards のモバイル広告密度 30%**
 *   （メインコンテンツ内の広告高さ合計 ÷ メインコンテンツ高さ。メインコンテンツより下の
 *   広告は分子に含めない。スティッキーは1回だけ数える）。
 *   本サイトの実測: メインコンテンツ ≈9,000px → 許容広告高 ≈2,700px。
 *   下記3枠構成でも広告高は約1,000px＝**11%** で余裕がある。
 *   **＝ 上限を縛るのは密度ではなく「位置」。よって枚数ではなく配置ルールで上限を決める。**
 *
 * ## 配置ルール（ONにする日はこの通りにする）
 *  1. **記事ページの手動枠は最大3枠**。うち2枠は本文の上半分に置く。
 *     ① 'article-mid' A: 「結論」H2の直後（実測 top≈2,629px / screen 3.2）
 *     ② 'article-mid' B: 本文中盤のH2直前（実測 top≈4,085px / screen 5.0）
 *     ③ 'article-end'（既存・screen 10.0）はそのまま
 *  2. **'article-related'（multiplex・screen 12.4）は同時に点けない。**
 *     最も見られない位置に最も背の高いユニット（autorelaxed で600〜1,000px）が入るため、
 *     密度の分子を最も食いながら視認可能率を最も下げる。効果検証は①〜③が済んでから。
 *  3. **ファーストビュー（screen 0〜1.5）には枠を置かない。** 誤クリック誘発は
 *     AdSense広告掲載ポリシーの明確な違反領域で、かつ既存のアンカー広告と重なる。
 *  4. **最小間隔**: 広告ユニット同士は1画面（812px）以上、アフィリCTA（PRブロック）とは
 *     400px以上離す。広告とPRブロックの近接は「広告と紛らわしい配置」に当たりうる。
 *  5. **ONは1枠ずつ**。①→7日観測→②→7日観測。同時に3枠点けると
 *     RPM変化の原因（枠追加なのか視認可能率低下なのか）が切り分けられない。
 *  6. 撤退条件: 追加した枠の投入後7日で**ページRPMが下がる、または視認可能率が60%を割る**なら
 *     その枠を戻す。
 *
 * ## 前提（未取得・ONの前に取ること）
 *  面別RPMが未取得（AdSense管理画面はSites単位までしか読めていない）。
 *  `lib/adsense-report.ts` の `ADSENSE_OAUTH_*` を配線すれば面別で取れる。
 *  これが無いと①②の効果を記事面だけで測れない。
 * =========================================================================
 */

type AdPlacement =
  | 'article-mid'        // 記事中途（TL;DR直後）
  | 'article-end'        // 記事末尾（FAQ後）
  | 'article-related'    // 関連記事ブロック上（Multiplex）
  | 'plan-below-hero'    // プランhero下
  | 'home-below-finder'  // トップFinder下
  | 'sidebar';

/**
 * 配置タイプごとに使う「広告ユニット種別」と「スロットID」を決定する。
 * 同じ広告ユニットを複数の配置で再利用してOK（AdSense規約上問題なし）。
 */
type UnitType = 'display' | 'in-article' | 'in-feed' | 'multiplex';

const PLACEMENT_TO_UNIT: Record<AdPlacement, { type: UnitType; slot: string }> = {
  'home-below-finder': { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'article-end':       { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'plan-below-hero':   { type: 'display', slot: ADSENSE_SLOT_DISPLAY },
  'article-mid':       { type: 'in-article', slot: ADSENSE_SLOT_IN_ARTICLE },
  'article-related':   { type: 'multiplex', slot: ADSENSE_SLOT_MULTIPLEX },
  sidebar:             { type: 'in-feed', slot: ADSENSE_SLOT_IN_FEED },
};

export function AdSlot({
  placement,
  style,
}: {
  placement: AdPlacement;
  style?: React.CSSProperties;
}) {
  // AdSense 審査通過前は広告枠自体を非表示にする（空の「広告」ラベルだけ残るのを防ぐ）。
  if (!ADSENSE_ENABLED) return null;

  const unit = PLACEMENT_TO_UNIT[placement];
  if (!unit.slot) return null;

  // 各広告ユニットタイプ別の <ins> 属性とスタイルを組み立てる
  const insProps: Record<string, string> = {
    'data-ad-client': ADSENSE_CLIENT,
    'data-ad-slot': unit.slot,
  };
  let insStyle: React.CSSProperties = { display: 'block' };

  if (unit.type === 'display') {
    insProps['data-ad-format'] = 'auto';
    insProps['data-full-width-responsive'] = 'true';
    insStyle = { display: 'block', minHeight: 100 };
  } else if (unit.type === 'in-article') {
    insProps['data-ad-layout'] = 'in-article';
    insProps['data-ad-format'] = 'fluid';
    insStyle = { display: 'block', textAlign: 'center' };
  } else if (unit.type === 'in-feed') {
    insProps['data-ad-format'] = 'fluid';
    insProps['data-ad-layout-key'] = ADSENSE_IN_FEED_LAYOUT_KEY;
    insStyle = { display: 'block' };
  } else if (unit.type === 'multiplex') {
    insProps['data-ad-format'] = 'autorelaxed';
    insStyle = { display: 'block' };
  }

  return (
    <div className="ad-slot" data-placement={placement} style={style}>
      <span className="ad-label" aria-label="広告">広告</span>
      <ins className="adsbygoogle" style={insStyle} {...insProps} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
}
