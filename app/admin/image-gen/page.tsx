import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { getAllArticleInsights } from '@/lib/article-insights';
import { RegenerateHeroButton } from '@/components/admin/RegenerateHeroButton';
import { PageHeader, StatCard, StatGrid, Card, Badge, Mono } from '@/components/admin/ui';

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
  const rate = articles.length > 0 ? Math.round((generated.length / articles.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Image Gen"
        subtitle="ヒーロー画像のAI生成管理 — 生成画像と現行画像の比較ビュー"
      />

      {/* KPI */}
      <StatGrid columns={4}>
        <StatCard label="記事総数" value={articles.length.toLocaleString('en-US')} sub="対象記事" />
        <StatCard label="生成済み" value={generated.length.toLocaleString('en-US')} sub="AI画像あり" />
        <StatCard
          label="未生成"
          value={pending.length.toLocaleString('en-US')}
          sub={pending.length > 0 ? '要対応' : '完了'}
        />
        <StatCard label="生成済率" value={`${rate}%`} sub={`${generated.length} / ${articles.length} 本`} />
      </StatGrid>

      {/* 手順説明 */}
      <Card title="実行手順（ローカルマシンから）" bodyPadding={18} style={{ marginBottom: 22 }}>
        <pre
          style={{
            background: 'var(--bg-subtle)',
            color: 'var(--ink-700)',
            border: '1px solid var(--border)',
            padding: 16,
            borderRadius: 'var(--r-md)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            overflow: 'auto',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
{`# === 推奨: Cloudflare Workers AI / flux-1-schnell（完全無料・クレカ不要） ===

# 1. https://dash.cloudflare.com/sign-up で無料アカウント作成
#    Account ID をコピー
# 2. https://dash.cloudflare.com/profile/api-tokens で API Token 発行
#    Permissions: Account → Workers AI → Read
export CLOUDFLARE_ACCOUNT_ID=xxxxxxxxx
export CLOUDFLARE_API_TOKEN=xxxxxxxxx

# 3. ドライラン（無料・プロンプト確認）
node scripts/dry-run-prompts.mjs

# 4. 1本だけテスト生成
node scripts/generate-hero-images-cloudflare.mjs --slug=babycar-ranking-2026

# 5. 全件生成（30〜60分、¥0）
node scripts/generate-hero-images-cloudflare.mjs

# 6. frontmatter に反映
node scripts/apply-hero-ai.mjs

# 7. コミット & デプロイ
git add public/hero-ai/ content/articles/
git commit -m "feat(images): hero画像をAIイラストに差し替え"
git push origin main


# === 代替: DALL-E 3（有料・$13〜26、30〜60分） ===
# export OPENAI_API_KEY=sk-...
# node scripts/generate-hero-images.mjs`}
        </pre>
        <p style={{ fontSize: 11.5, color: 'var(--ink-400)', marginTop: 10, marginBottom: 0 }}>
          詳細: <Mono>scripts/HERO_IMAGES_README.md</Mono>
        </p>
      </Card>

      {/* 生成済み記事一覧 */}
      {generated.length > 0 && (
        <Card
          title="生成履歴 — before / after 比較"
          right={<Badge tone="ok">{generated.length} 本</Badge>}
          bodyPadding={18}
          style={{ marginBottom: 22 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {generated.slice(0, 30).map((a) => (
              <CompareCard key={a.slug} article={a} entry={manifest[a.slug]} />
            ))}
          </div>
          {generated.length > 30 && (
            <p style={{ fontSize: 12, color: 'var(--ink-400)', textAlign: 'center', marginTop: 14 }}>
              ※ 先頭30件表示。残り {generated.length - 30}本は <Mono>manifest.json</Mono> で確認。
            </p>
          )}
        </Card>
      )}

      {/* 未生成記事一覧 */}
      {pending.length > 0 && (
        <Card title="未生成" right={<Badge tone="warn">{pending.length} 本</Badge>}>
          <div style={{ overflow: 'auto', maxHeight: 400 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <Th>現画像</Th>
                  <Th>タイトル</Th>
                  <Th>カテゴリ</Th>
                  <Th>アクション</Th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.slug} className="admin-row">
                    <Td>
                      <div
                        style={{
                          width: 56,
                          height: 32,
                          background: a.hero ? `url(${a.hero}) center/cover` : 'var(--bg-app)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r-sm)',
                        }}
                      />
                    </Td>
                    <Td>
                      <Link
                        href={`/article/${a.slug}`}
                        target="_blank"
                        style={{ color: 'var(--ink-900)', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {a.title}
                      </Link>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: 'var(--ink-400)',
                          marginTop: 2,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {a.slug}
                      </div>
                    </Td>
                    <Td>{a.categoryName}</Td>
                    <Td>
                      <RegenerateHeroButton slug={a.slug} currentHero={a.hero} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function CompareCard({ article, entry }: { article: { slug: string; title: string; hero: string; categoryName: string }; entry: ManifestEntry }) {
  return (
    <article
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 8px',
              background: 'var(--bg-subtle)',
              color: 'var(--ink-500)',
              textAlign: 'center',
            }}
          >
            BEFORE（現行）
          </div>
          <div
            style={{
              aspectRatio: '16/9',
              background: article.hero ? `url(${article.hero}) center/cover` : 'var(--bg-app)',
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              padding: '4px 8px',
              background: 'var(--ok-bg)',
              color: 'var(--ok-fg)',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
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
      <div style={{ padding: '11px 13px' }}>
        <Link
          href={`/article/${article.slug}`}
          target="_blank"
          style={{ color: 'var(--ink-900)', textDecoration: 'none' }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--ink-900)' }}>{article.title}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-400)', marginTop: 3 }}>
            {article.categoryName} · {entry.quality} · <Mono>{entry.generatedAt?.slice(0, 10)}</Mono>
          </div>
        </Link>
        {/* 画像が微妙なときの再生成ボタン */}
        <div style={{ marginTop: 10 }}>
          <RegenerateHeroButton slug={article.slug} currentHero={article.hero} />
        </div>
      </div>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '9px 16px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ink-400)',
        letterSpacing: '.02em',
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--border-divider)',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: '8px 16px',
        fontSize: 12.5,
        color: 'var(--ink-700)',
        verticalAlign: 'middle',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      {children}
    </td>
  );
}
