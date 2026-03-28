import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { OfflineBanner } from '@/components/OfflineBanner';
import { InstallBanner } from '@/components/InstallBanner';
import { PWAProvider } from '@/components/PWAProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'COFFEZ',
  description: 'Homemade specialty coffee — discover and order from local home coffee sellers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'COFFEZ',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#78350f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PWAProvider />
          <OfflineBanner />
          {children}
          <InstallBanner />
        </Providers>
      </body>
    </html>
  );
}
