'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

/**
 * ベビーカー診断 — 5問→3モデル提案。
 *
 * 設計方針:
 * - 各質問の選択肢に「タグ」を持たせ、回答タグの集計でモデル候補にスコアリング
 * - 候補モデルは「軽量A型 / 走行重視A型 / 三輪バギー / B型 / トラベルシステム / セカンドB型」の6カテゴリ
 * - 上位3カテゴリを提示（タイ時はpriority固定順）
 */

type Tag =
  | 'lightweight'
  | 'smooth'
  | 'allterrain'
  | 'compact'
  | 'budget'
  | 'longuse'
  | 'apartment'
  | 'house'
  | 'train'
  | 'car'
  | 'newborn'
  | 'sitting';

type Question = {
  id: string;
  question: string;
  options: { label: string; tags: Tag[] }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'age',
    question: 'お子さんの月齢は？（または購入予定時期）',
    options: [
      { label: '0〜3ヶ月（生後すぐ）', tags: ['newborn', 'longuse'] },
      { label: '4〜7ヶ月（首すわり後）', tags: ['newborn'] },
      { label: '8ヶ月〜1歳（おすわり安定）', tags: ['sitting', 'lightweight'] },
      { label: '1歳半以降（歩き始めOK）', tags: ['sitting', 'compact'] },
    ],
  },
  {
    id: 'place',
    question: 'お住まいの環境は？',
    options: [
      { label: 'マンション・アパート（エレベーターあり）', tags: ['apartment', 'lightweight'] },
      { label: 'マンション（エレベーターなし／少階段）', tags: ['apartment', 'lightweight', 'compact'] },
      { label: '戸建て（玄関アプローチに段差）', tags: ['house', 'allterrain'] },
      { label: '戸建て（フラット）', tags: ['house', 'smooth'] },
    ],
  },
  {
    id: 'transport',
    question: '主な移動手段は？',
    options: [
      { label: '電車・バスが中心（都市部）', tags: ['train', 'lightweight', 'compact'] },
      { label: '車が中心（郊外・地方）', tags: ['car', 'smooth', 'longuse'] },
      { label: '徒歩・自転車が中心', tags: ['lightweight', 'allterrain'] },
      { label: '電車も車もどちらも', tags: ['train', 'car', 'compact'] },
    ],
  },
  {
    id: 'scene',
    question: 'よく行く場所は？',
    options: [
      { label: 'ショッピングモール・駅ナカ', tags: ['smooth', 'compact'] },
      { label: '公園・近所の散歩中心', tags: ['allterrain', 'smooth'] },
      { label: '都心の繁華街（人ごみ多い）', tags: ['lightweight', 'compact'] },
      { label: '旅行・帰省でよく遠出', tags: ['compact', 'longuse'] },
    ],
  },
  {
    id: 'budget',
    question: '予算は？',
    options: [
      { label: '〜3万円（コスパ重視）', tags: ['budget', 'compact'] },
      { label: '3〜6万円（バランス重視）', tags: ['lightweight', 'smooth'] },
      { label: '6〜10万円（長く使いたい）', tags: ['longuse', 'allterrain'] },
      { label: '10万円〜（妥協なし）', tags: ['smooth', 'allterrain', 'longuse'] },
    ],
  },
];

type Recommendation = {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  reason: string;
  pros: string[];
  cons: string[];
  href?: string;
  scoreTags: Tag[];
};

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'lightA',
    name: '軽量A型（5kg前後）',
    category: 'A型・軽量モデル',
    priceRange: '4〜7万円',
    reason: '電車・バス移動が多く、エレベーター無しの階段昇降にも耐えうる軽さ。新生児から使える両対面式が多い。',
    pros: ['片手で持ち上げ可能', '改札・電車内でストレス少', '対面/背面切替で安心'],
    cons: ['走破性は中堅', '荷物カゴが小さめ'],
    href: '/article/babycar-ranking-2026',
    scoreTags: ['lightweight', 'train', 'apartment', 'compact', 'newborn'],
  },
  {
    id: 'smoothA',
    name: '走行重視A型（フルサイズ）',
    category: 'A型・大型モデル',
    priceRange: '7〜12万円',
    reason: '段差・砂利道もスムーズ。長時間の散歩や旅行が多い家庭に。サスペンション搭載で乳児期も快適。',
    pros: ['乗り心地が圧倒的', '長く使える耐久性', '広い座面でゆったり'],
    cons: ['重い（7kg前後）', 'マンション階段では負担'],
    href: '/article/babycar-ranking-2026',
    scoreTags: ['smooth', 'allterrain', 'house', 'car', 'longuse', 'newborn'],
  },
  {
    id: 'tricycle',
    name: '三輪バギー',
    category: 'オールテレイン',
    priceRange: '8〜15万円',
    reason: '砂利道・芝生・公園の坂道を物ともしない走破性。デザイン性も高く、ジョギング派にも。',
    pros: ['段差・悪路に最強', '見た目がスタイリッシュ', '長距離押しても疲れにくい'],
    cons: ['電車では取り回し難', '価格が高め', '畳んでも大きい'],
    href: '/article/babycar-erabikata',
    scoreTags: ['allterrain', 'house', 'car', 'longuse', 'smooth'],
  },
  {
    id: 'B',
    name: '軽量B型（3〜4kg）',
    category: 'B型・セカンド',
    priceRange: '1〜3万円',
    reason: '生後7ヶ月以降向け。圧倒的な軽さと折りたたみのコンパクトさ。お出かけ用のセカンド機としても人気。',
    pros: ['持ち運び・収納がラク', '価格が手頃', '飛行機・新幹線OK'],
    cons: ['新生児期は使えない', 'クッション性は控えめ'],
    href: '/article/babycar-ranking-2026',
    scoreTags: ['sitting', 'compact', 'budget', 'train', 'lightweight'],
  },
  {
    id: 'travelsystem',
    name: 'トラベルシステム対応A型',
    category: 'チャイルドシート連動',
    priceRange: '8〜13万円',
    reason: '車中心の生活なら最強。チャイルドシートからベビーカーへ寝たまま移動可能。',
    pros: ['車↔︎ベビーカー間で寝かせ替え不要', '0歳期の負担激減', 'リセール価値も高い'],
    cons: ['対応シートが必要', '高価'],
    href: '/article/babycar-erabikata',
    scoreTags: ['car', 'newborn', 'house', 'smooth', 'longuse'],
  },
  {
    id: 'budget',
    name: 'コスパ型A型（2〜4万円）',
    category: 'A型・エントリー',
    priceRange: '2〜4万円',
    reason: '最低限の機能を備えつつ価格を抑えたエントリーモデル。短期使用や予算重視家庭に。',
    pros: ['価格が手頃', '基本機能は充足', '万が一壊れても痛くない'],
    cons: ['走行性は控えめ', '耐久性は中堅以下'],
    href: '/article/babycar-erabikata',
    scoreTags: ['budget', 'apartment', 'lightweight', 'train'],
  },
];

const TOOL_ID = 'babycar-shindan';

export function BabycarShindanClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Tag[]>>({});

  const isLast = step >= QUESTIONS.length;
  const currentQ = QUESTIONS[step];

  // 開始イベントは初回マウントで1回のみ
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent('shindan_start', { tool_id: TOOL_ID });
  }, []);

  const handleSelect = (tags: Tag[]) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: tags }));
    setStep((s) => s + 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    completedRef.current = false;
  };

  // 集計してスコアリング
  const allTags: Tag[] = Object.values(answers).flat();
  const tagCounts = new Map<Tag, number>();
  allTags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1));

  const scored = RECOMMENDATIONS.map((rec) => {
    const score = rec.scoreTags.reduce((s, t) => s + (tagCounts.get(t) ?? 0), 0);
    return { rec, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 完了イベント: isLast 遷移時に1度だけ
  useEffect(() => {
    if (!isLast || completedRef.current) return;
    completedRef.current = true;
    trackEvent('shindan_complete', { tool_id: TOOL_ID, result: scored[0]?.rec.id });
  }, [isLast, scored]);

  return (
    <div style={{ marginTop: 32 }}>
      {/* プログレスバー */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-mute)', marginBottom: 6 }}>
          <span>{isLast ? '完了' : `Q${step + 1} / ${QUESTIONS.length}`}</span>
          <span>{isLast ? '結果表示中' : `あと${QUESTIONS.length - step}問`}</span>
        </div>
        <div style={{ height: 6, background: 'var(--paper-card)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--clay), var(--clay-deep))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {!isLast && currentQ && (
        <div
          style={{
            padding: '24px',
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 19, margin: '0 0 18px', lineHeight: 1.5 }}>
            {currentQ.question}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt.tags)}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  background: 'var(--paper)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 15,
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--clay)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              style={{
                marginTop: 16,
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-mute)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← 前の質問に戻る
            </button>
          )}
        </div>
      )}

      {isLast && (
        <div>
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(20,147,209,0.08), rgba(201,96,62,0.05))',
              border: '1.5px solid rgba(201,96,62,0.25)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--clay-deep)', marginBottom: 4 }}>
              診断結果
            </div>
            <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 22, fontWeight: 600, margin: 0 }}>
              あなたに合うベビーカー TOP3
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {scored.map(({ rec }, i) => (
              <article
                key={rec.id}
                style={{
                  padding: 24,
                  background: i === 0 ? 'linear-gradient(135deg, rgba(201,96,62,0.05), rgba(20,147,209,0.03))' : 'var(--paper-card)',
                  border: i === 0 ? '2px solid var(--clay)' : '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: i === 0 ? 'var(--clay)' : 'var(--ink-mute)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.08em' }}>{rec.category}</div>
                    <h3 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 19, fontWeight: 600, margin: 0 }}>
                      {rec.name}
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--paper)', border: '1px solid var(--line)', fontSize: 12 }}>
                    💴 {rec.priceRange}
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', color: 'var(--ink-sub)', fontSize: 14, lineHeight: 1.85 }}>
                  {rec.reason}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay-deep)', marginBottom: 6 }}>○ 強み</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.8 }}>
                      {rec.pros.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', marginBottom: 6 }}>△ 注意</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.8 }}>
                      {rec.cons.map((c, j) => (
                        <li key={j}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {rec.href && (
                  <Link
                    href={rec.href}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: i === 0 ? 'var(--clay)' : 'transparent',
                      color: i === 0 ? '#fff' : 'var(--clay-deep)',
                      border: i === 0 ? 'none' : '1.5px solid var(--clay)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    比較記事で詳しく見る →
                  </Link>
                )}
              </article>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid var(--clay)',
                color: 'var(--clay-deep)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ↺ もう一度診断する
            </button>
            <Link
              href="/tools"
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid var(--line)',
                color: 'var(--ink-sub)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              他の診断ツールを見る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
