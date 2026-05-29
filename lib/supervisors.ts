/**
 * 監修者マスタ。
 *
 * 記事 frontmatter で `supervisor: doctor-yamada` のように参照する。
 * E-E-A-T（特に Expertise）強化のため、YMYL寄りの記事（医療・栄養・金融・教育）に
 * 監修者を設定する。
 *
 * 監修者は実在の専門家のみ登録（医師・栄養士・保育士・FP 等の有資格者）。
 * 監修依頼はクラウドソーシング（ココナラ等）で1記事¥3,000〜¥5,000が相場。
 *
 * 設定例（frontmatter）:
 * ```yaml
 * supervisor: doctor-yamada
 * ```
 */

export type Supervisor = {
  id: string;
  name: string;
  /** 「小児科医」「管理栄養士」「保育士」「FP」「歯科医」など */
  qualification: string;
  /** 100文字以内の経歴・特徴 */
  bio: string;
  /** 所属（病院・大学・事務所など） */
  affiliation?: string;
  /** 公式サイト・SNS（信頼性確認用） */
  url?: string;
};

/**
 * 監修者のマスタリスト。
 * 新しい監修者を追加するときは、必ず本人の同意・資格証明を確認すること。
 */
export const SUPERVISORS: Supervisor[] = [
  // 例：実在の監修者ではないテンプレ
  // {
  //   id: 'doctor-yamada',
  //   name: '山田 太郎',
  //   qualification: '小児科医',
  //   bio: '都内総合病院 小児科医長。3児の父。育児・予防接種・乳児健診に詳しい。',
  //   affiliation: '○○総合病院',
  //   url: 'https://example.com',
  // },
];

export function getSupervisor(id: string | undefined): Supervisor | undefined {
  if (!id) return undefined;
  return SUPERVISORS.find((s) => s.id === id);
}
