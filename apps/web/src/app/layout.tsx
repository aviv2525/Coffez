import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { OfflineBanner } from '@/components/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'COFFEZ',
  description: 'Homemade specialty coffee — discover and order from local home coffee sellers',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#78350f',
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
          <OfflineBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
