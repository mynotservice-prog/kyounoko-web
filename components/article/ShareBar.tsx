'use client';

import { CopyLinkButton } from './CopyLinkButton';
import { trackEvent } from '@/lib/analytics';

type Props = {
  url: string;
  title: string;
  label?: string;
};

/**
 * 記事のシェアバー。
 * X (Twitter), LINE, Facebook, リンクコピー。
 * GA4 イベント送信のため client component 化。
 */
export function ShareBar({ url, title, label = 'この記事をシェアする' }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const xHref = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  return (
    <section className="share-bar" aria-label={label}>
      <span className="share-bar-label">{label}</span>
      <div className="share-bar-btns">
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn share-btn-x"
          aria-label="Xでシェア"
          onClick={() => trackEvent('share_click', { platform: 'x' })}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.97 6.817H1.677l7.73-8.836L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
          </svg>
          <span>X</span>
        </a>
        <a
          href={lineHref}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn share-btn-line"
          aria-label="LINEでシェア"
          onClick={() => trackEvent('share_click', { platform: 'line' })}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 3C6.477 3 2 6.636 2 11.12c0 4.023 3.552 7.393 8.348 8.031.325.07.768.215.88.493.1.252.065.647.032.902l-.143.854c-.044.252-.2.987.867.538 1.067-.45 5.753-3.39 7.85-5.805C21.307 14.574 22 12.94 22 11.12 22 6.636 17.523 3 12 3Zm-3.893 10.55H6.173a.415.415 0 0 1-.414-.414V9.283c0-.228.186-.414.414-.414.228 0 .414.186.414.414v3.439h1.52c.229 0 .415.186.415.414a.415.415 0 0 1-.415.414Zm1.598-.414a.415.415 0 0 1-.414.414.415.415 0 0 1-.414-.414V9.283c0-.228.186-.414.414-.414.228 0 .414.186.414.414v3.853Zm4.62 0a.415.415 0 0 1-.283.393.41.41 0 0 1-.132.021.415.415 0 0 1-.332-.165l-1.975-2.689v2.44a.415.415 0 0 1-.414.414.415.415 0 0 1-.414-.414V9.283c0-.178.113-.336.283-.393a.41.41 0 0 1 .132-.021c.13 0 .253.063.332.165l1.975 2.69V9.283c0-.228.186-.414.414-.414.228 0 .414.186.414.414v3.853Zm3.127-2.342a.415.415 0 0 1 0 .828h-1.52v.934h1.52a.415.415 0 0 1 0 .828h-1.935a.415.415 0 0 1-.414-.414V9.283c0-.228.186-.414.414-.414h1.935a.415.415 0 0 1 0 .828h-1.52v.934h1.52Z" />
          </svg>
          <span>LINE</span>
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn share-btn-fb"
          aria-label="Facebookでシェア"
          onClick={() => trackEvent('share_click', { platform: 'facebook' })}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.772 22.772 0 0 0 14.212 3c-2.43 0-4.099 1.485-4.099 4.204v2.385H7.332v3.209h2.781v8.199h3.284Z" />
          </svg>
          <span>Facebook</span>
        </a>
        <CopyLinkButton url={url} />
      </div>
    </section>
  );
}
