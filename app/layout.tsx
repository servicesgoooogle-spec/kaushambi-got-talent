import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kaushambi Got Talent — Season 2',
  description:
    'Live stage dashboard, schedule, and search for Kaushambi Got Talent Season 2. Grand Finale: 2nd October 2026, Lakhan Lal Resort, Bharwari.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable}`}>
      <head>
        {/* OneSignal SDK — loads on every page */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          id="onesignal-sdk"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || ''}",
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-brand-black text-brand-gold antialiased font-sans">
        {children}
      </body>
    </html>
  );
}