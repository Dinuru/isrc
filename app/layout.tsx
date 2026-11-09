import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'ISRC Finder — Song Recording Code Search',
  description: 'Fast, minimal web app to search tracks and instantly retrieve their International Standard Recording Code (ISRC).',
  keywords: ['ISRC', 'International Standard Recording Code', 'Spotify', 'music metadata', 'song search', 'recording code'],
  authors: [{ name: 'Dinuru' }],
  creator: 'Dinuru',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'ISRC Finder — Song Recording Code Search',
    description: 'Instantly find and copy the ISRC for any song.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-black text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
