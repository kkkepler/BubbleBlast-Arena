import type { Metadata, Viewport } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';
import React from 'react';

const PlatformBridge = dynamic(() => import('@/components/PlatformBridge'), { ssr: false });
const OrientationLock = dynamic(() => import('@/components/game/OrientationLock'), { ssr: false });
const I18nProvider = dynamic(() => import('@/hooks/useI18n').then(mod => mod.I18nProvider), { ssr: false });
const LanguageManager = dynamic(() => import('@/hooks/useI18n').then(mod => mod.LanguageManager), { ssr: false });

export const metadata: Metadata = {
  title: 'BubbleBlast Arena',
  description: 'Aim, shoot, and pop colorful bubbles!',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
  other: { 'mobile-web-app-capable': 'yes', 'apple-mobile-web-app-capable': 'yes' }
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1.0, maximumScale: 1.0, userScalable: false,
  viewportFit: 'cover', interactiveWidget: 'resizes-content', themeColor: '#7c3aed',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('RootLayout rendering...');
  return (
    <html lang="ru" suppressHydrationWarning className="h-full">
      <head>
        <link rel="icon" href="data:;base64,=" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="font-body antialiased overflow-hidden h-full">
        <I18nProvider>
          <PlatformBridge />
          <LanguageManager />
          <OrientationLock />
          <div id="__next" className="h-full w-full overflow-hidden">
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}