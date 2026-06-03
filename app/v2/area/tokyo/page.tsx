'use client';

import React from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { TAMA_CITIES, TOKYO_WARDS } from '../../_data';

export default function V2TokyoPage() {
  const [tab, setTab] = React.useState<'ku' | 'tama'>('ku');
  const list = tab === 'ku' ? TOKYO_WARDS : TAMA_CITIES;
  return (
    <V2Frame header="sub" active="search" backHref="/v2/area">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="tower" size={24} color="var(--v2-orange)" />
          東京都
        </h1>
        <p className="v2-page-lead">区市町村から、おでかけ先を探せます。</p>
      </div>

      <div className="v2-section" style={{ marginTop: 6 }}>
        <div className="v2-searchbar">
          <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
          区市町村名で検索
        </div>
      </div>

      <div className="v2-tk-tabs">
        <button
          type="button"
          className={'v2-tk-tab' + (tab === 'ku' ? ' on' : '')}
          onClick={() => setTab('ku')}
        >
          23区
        </button>
        <button
          type="button"
          className={'v2-tk-tab' + (tab === 'tama' ? ' on' : '')}
          onClick={() => setTab('tama')}
        >
          多摩エリア
        </button>
      </div>

      <div className="v2-section">
        <div className="v2-ward-list">
          {list.map((w) => (
            <Link
              key={w}
              href={`/v2/area/${encodeURIComponent(w)}`}
              className="v2-ward-item"
            >
              {w}
              <V2Icon name="chevron-right" size={18} color="#ccc" />
            </Link>
          ))}
        </div>
      </div>

      <V2SectionHead title="人気エリア" more="" icon="sparkle" accent="rain" />
      <div className="v2-chip-scroll">
        {['豊島区', '板橋区', '練馬区', '世田谷区', '新宿区'].map((c) => (
          <Link key={c} href={`/v2/area/${c}`} className="v2-pop-chip">
            {c}
          </Link>
        ))}
      </div>

      <V2SectionHead title="最近追加されたエリア記事" more="" />
      <div className="v2-section">
        {[
          { n: '板橋区', s: '区立公園と室内あそび場が充実' },
          { n: '北区', s: '飛鳥山公園まわりのおでかけ特集' },
          { n: '文京区', s: '図書館・博物館めぐりに' },
        ].map((a) => (
          <Link
            key={a.n}
            href={`/v2/area/${a.n}`}
            className="v2-ward-news"
          >
            <span className="v2-ward-news-pin">
              <V2Icon name="pin" size={16} color="var(--v2-orange)" />
            </span>
            <span>
              <span className="v2-ward-news-n">{a.n}のおでかけ</span>
              <span className="v2-ward-news-s">{a.s}</span>
            </span>
            <V2Icon
              name="chevron-right"
              size={18}
              color="#ccc"
              style={{ marginLeft: 'auto' }}
            />
          </Link>
        ))}
      </div>
      <div style={{ height: 16 }}></div>
    </V2Frame>
  );
}
