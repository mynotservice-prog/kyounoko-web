'use client';

import React from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2FavBtn, useV2Ctx } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { FEATURES, IMG, LUNCH, SPOTS } from '../_data';

type Tab = 'spot' | 'lunch' | 'feat';

export default function V2FavoritesPage() {
  const { saved } = useV2Ctx();
  const [tab, setTab] = React.useState<Tab>('spot');

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日に保存`;
  };

  const spotItems = SPOTS.filter((s) => saved[s.id]).map((s) => ({
    id: s.id,
    name: s.name,
    area: s.area,
    img: s.img,
    ts: saved[s.id],
    kind: 'spot' as const,
  }));
  const lunchItems = [
    ...LUNCH.filter((s) => saved[s.id]).map((s) => ({
      id: s.id,
      name: s.name,
      area: s.area,
      img: s.img,
      ts: saved[s.id],
      kind: 'lunch' as const,
    })),
    ...(saved['lunch-article']
      ? [
          {
            id: 'lunch-article',
            name: '池袋の子連れランチ10選',
            area: '豊島区・池袋',
            img: IMG.food[1],
            ts: saved['lunch-article'],
            kind: 'article' as const,
          },
        ]
      : []),
  ];
  const featItems = FEATURES.filter((f) => saved['feat-' + f.id]).map((f) => ({
    id: f.id,
    name: f.title,
    area: '特集',
    img: f.img,
    ts: saved['feat-' + f.id],
    kind: 'feat' as const,
  }));

  const tabs: { k: Tab; t: string; n: number }[] = [
    { k: 'spot', t: 'スポット', n: spotItems.length },
    { k: 'lunch', t: '外食', n: lunchItems.length },
    { k: 'feat', t: '特集', n: featItems.length },
  ];
  const items = tab === 'spot' ? spotItems : tab === 'lunch' ? lunchItems : featItems;

  return (
    <V2Frame header="saved" active="saved">
      <div className="v2-saved-tabs">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            className={'v2-saved-tab' + (tab === t.k ? ' on' : '')}
            onClick={() => setTab(t.k)}
          >
            {t.t}
            <span className="v2-saved-count">{t.n}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <V2SavedEmpty tab={tab} />
      ) : (
        <div className="v2-vlist" style={{ marginTop: 16 }}>
          {items.map((it) => {
            const href =
              it.kind === 'feat'
                ? `/v2/feature/${it.id}`
                : it.kind === 'article'
                ? '/v2/lunch'
                : it.kind === 'lunch'
                ? '/v2/lunch'
                : `/v2/spot/${it.id}`;
            const favId = it.kind === 'feat' ? 'feat-' + it.id : it.id;
            return (
              <Link key={it.id} href={href} className="v2-saved-card">
                <div
                  className="v2-imgwrap r"
                  style={{ width: 104, minWidth: 104, aspectRatio: '16/9' }}
                >
                  <V2Img src={it.img} seed={it.id} alt={it.name} />
                </div>
                <div className="v2-saved-body">
                  <div className="v2-saved-title">{it.name}</div>
                  <div className="v2-card-v-loc">
                    <V2Icon name="pin" size={13} color="var(--v2-orange)" />
                    {it.area}
                  </div>
                  <div className="v2-saved-date">
                    <V2Icon name="clock" size={12} color="#bbb" />
                    {fmt(it.ts)}
                  </div>
                </div>
                <V2FavBtn id={favId} variant="static" />
              </Link>
            );
          })}
        </div>
      )}
    </V2Frame>
  );
}

function V2SavedEmpty({ tab }: { tab: Tab }) {
  const label = tab === 'spot' ? 'スポット' : tab === 'lunch' ? '外食記事' : '特集';
  const dest = tab === 'feat' ? '/v2/feature' : tab === 'lunch' ? '/v2/lunch' : '/v2/search';
  return (
    <div className="v2-empty-state" style={{ paddingTop: 56 }}>
      <div className="v2-empty-ill">
        <V2Icon name="bookmark" size={38} color="#e9c9ac" />
      </div>
      <div className="v2-empty-title">
        まだ保存した{label}が
        <br />
        ありません
      </div>
      <div className="v2-empty-sub">
        気になる{label}は
        <V2Icon
          name="heart"
          size={13}
          color="var(--v2-orange)"
          style={{ verticalAlign: '-2px', margin: '0 2px' }}
        />
        をタップ。
        <br />
        あとから見返せます。
      </div>
      <Link
        href={dest}
        className="v2-btn-primary"
        style={{ maxWidth: 260, marginTop: 18 }}
      >
        {label}をさがす
      </Link>
    </div>
  );
}
