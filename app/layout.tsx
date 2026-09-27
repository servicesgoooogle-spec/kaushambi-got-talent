import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
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
      <body className="min-h-screen bg-brand-black text-brand-gold antialiased font-sans">
        {children}
      </body>
    </html>
  );
}