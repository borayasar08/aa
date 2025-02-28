import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AA Oyunu',
  description: 'AA Oyunu - Çubukları Daire Etrafına Yerleştir',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}
          <Analytics />
      </body>
    </html>
  );
} 