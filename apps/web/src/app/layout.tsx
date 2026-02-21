import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { OfflineBanner } from '@/components/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'OrderBridge',
  description: 'Marketplace for sellers and orders',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
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
