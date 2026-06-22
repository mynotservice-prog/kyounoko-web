import type { Metadata } from 'next';
import { IBM_Plex_Sans_JP, IBM_Plex_Mono } from 'next/font/google';
import { AdminShell } from './AdminShell';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin · きょうのこ',
  robots: { index: false, follow: false },
};

// Admin 専用フォント。next/font の変数を .admin-shell の --admin-font-* に供給する。
const plexSans = IBM_Plex_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--admin-font-sans',
  display: 'swap',
  preload: false,
});
const plexMono = IBM_Plex_Mono({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--admin-font-mono',
  display: 'swap',
  preload: false,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-shell ${plexSans.variable} ${plexMono.variable}`}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
