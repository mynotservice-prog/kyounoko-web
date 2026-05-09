import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { getAllArticleInsights } from '@/lib/article-insights';

export const revalidate = 60;
export const metadata = {
  title: 'Image Gen · Admin',
  robots: { index: false, follow: false },
};

type ManifestEntry = {
  slug: string;
  ok: boolean;
  file?: string;
  generatedAt?: string;
  revisedPrompt?: string;
  quality?: string;
};

function loadManifest(): Record<string, ManifestEntry> {
  const p = path.join(process.cwd(), 'public', 'hero-ai', 'manifest.json');
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

export default function ImageGenPage() {
  const manifest = loadManifest();
  const articles = getAllArticleInsights();

  const generated = articles.filter((a) => manifest[a.slug]?.ok);
  const pending = articles.filter((a) => !manifest[a.slug]?.ok);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          🎨 Image Gen — ヒーロー画像 AI生成管理
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          DALL-E 3 で生成した画像と現行画像の比較ビュー
        </p>
      </div>

      {/* KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <KpiCard label="記事総数" value={articles.length} />
        <KpiCard label="生成済み" value={generated.length} accent="ok" />
        <KpiCard label="未生成" value={pending.length} accent={pending.length > 0 ? 'warn' : 'ok'} />
        <KpiCard
          label="生成済率"
          value={articles.length > 0 ? Math.round((generated.length / articles.length) * 100) : 0}
          unit="%"
        />
      </div>

      {/* 手順説明 */}
      <section
        style={{
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          padding: 20,
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 17, margin: '0 0 10px' }}>
          実行手順（ローカルマシンから）
        </h2>
        <pre
          style={{
            background: '#1f1a14',
            color: '#f4ddcf',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
            lineHeight: 1.7,
          }}
        >
{`# === 推奨: Gemini 2.5 Flash Image（無料・1日500枚） ===

# 1. APIキー取得: https://aistudio.google.com/app/apikey
export GEMINI_API_KEY=AIza...

# 2. ドライラン（無料・プロンプト確認）
node scripts/dry-run-prompts.mjs

# 3. 1本だけテスト生成
node scripts/generate-hero-images-gemini.mjs --slug=babycar-ranking-2026

# 4. 全件生成（約3-4時間、¥0）
node scripts/generate-hero-images-gemini.mjs

# 5. frontmatter に反映
node scripts/apply-hero-ai.mjs

# 6. コミット & デプロイ
git add public/hero-ai/ content/articles/
git commit -m "feat(images): hero画像をGemini AIイラストに差し替え"
git push origin main


# === 代替: DALL-E 3（有料・$13〜26、30〜60分） ===
# export OPENAI_API_KEY=sk-...
# node scripts/generate-hero-images.mjs`}
        </pre>
        <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 10, marginBottom: 0 }}>
          詳細: <code>scripts/HERO_IMAGES_README.md</code>
        </p>
      </section>

      {/* 生成済み記事一覧 */}
      {generated.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={SectionH2}>✓ 生成済み（{generated.length}本）— before/after比較</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 16,
            }}
          >
            {generated.slice(0, 30).map((a) => (
              <CompareCard key={a.slug} article={a} entry={manifest[a.slug]} />
            ))}
          </div>
          {generated.length > 30 && (
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 12 }}>
              ※ 先頭30件表示。残り {generated.length - 30}本は manifest.json で確認。
            </p>
          )}
        </section>
      )}

      {/* 未生成記事一覧 */}
      {pending.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={SectionH2}>⏳ 未生成（{pending.length}本）</h2>
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              maxHeight: 400,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--paper-deep)', position: 'sticky', top: 0 }}>
                  <Th>現画像</Th>
                  <Th>タイトル</Th>
                  <Th>カテゴリ</Th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.slug} style={{ borderTop: '1px solid var(--line)' }}>
                    <Td>
                      <div
                        style={{
                          width: 56,
                          height: 32,
                          background: a.hero ? `url(${a.hero}) center/cover` : 'var(--peach-soft)',
                          borderRadius: 4,
                        }}
                      />
                    </Td>
                    <Td>
                      <Link
                        href={`/article/${a.slug}`}
                        target="_blank"
                        style={{ color: 'var(--ink)', textDecoration: 'none' }}
                      >
                        {a.title}
                      </Link>
                      <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{a.slug}</div>
                    </Td>
                    <Td>{a.categoryName}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

const SectionH2: React.CSSProperties = {
  fontFamily: 'var(--font-mincho)',
  fontSize: 18,
  margin: '0 0 12px',
  fontWeight: 600,
};

function KpiCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit?: string;
  accent?: 'ok' | 'warn';
}) {
  const color =
    accent === 'ok' ? 'var(--sage-deep)' : accent === 'warn' ? 'var(--clay-deep)' : 'var(--ink)';
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          letterSpacing: '.04em',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>{value.toLocaleString()}</span>
        {unit && <span style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function CompareCard({ article, entry }: { article: { slug: string; title: string; hero: string; categoryName: string }; entry: ManifestEntry }) {
  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line)' }}>
        <div>
          <div style={{ fontSize: 10, padding: '4px 8px', background: '#f3efe8', color: 'var(--ink-sub)', textAlign: 'center' }}>
            BEFORE（現行）
          </div>
          <div
            style={{
              aspectRatio: '16/9',
              background: article.hero ? `url(${article.hero}) center/cover` : 'var(--peach-soft)',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 10, padding: '4px 8px', background: 'var(--sage-soft)', color: 'var(--sage-deep)', textAlign: 'center', fontWeight: 600 }}>
            AFTER（AI生成）
          </div>
          <div
            style={{
              aspectRatio: '16/9',
              background: `url(/hero-ai/${article.slug}.png) center/cover`,
            }}
          />
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <Link
          href={`/article/${article.slug}`}
          target="_blank"
          style={{ color: 'var(--ink)', textDecoration: 'none' }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{article.title}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>
            {article.categoryName} · {entry.quality} · {entry.generatedAt?.slice(0, 10)}
          </div>
        </Link>
      </div>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '10px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ink-sub)',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--ink)', verticalAlign: 'middle' }}>
      {children}
    </td>
  );
}
