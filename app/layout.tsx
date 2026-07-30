import type { Metadata, Viewport } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fluxor Studio — Menos aparência. Mais atenção.',
  description:
    'Fluxor Studio — identidade visual, sites e estratégias para marcas que querem crescer de verdade.',
};

export const viewport: Viewport = {
  themeColor: '#09060f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${manrope.variable}`}>
      <body>
        <div className="noise" aria-hidden="true" />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
