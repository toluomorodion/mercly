import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ToastProvider } from '@/components/shared/Toast';
import { SessionProvider } from 'next-auth/react';
import '../tokens/tokens.css';
import './globals.css';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mercly',
  description: 'Sell anything in seconds using just a link.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={roboto.variable}>
      <body>
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

