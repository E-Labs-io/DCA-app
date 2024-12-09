import { Providers } from './providers';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

const WalletButton = dynamic(() => import('@/components/WalletButton'), { 
  ssr: false,
  loading: () => <div className="w-[150px] h-[40px] bg-default-100 animate-pulse rounded-lg" />
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <main className="min-h-screen pt-16">
            <div className="fixed top-4 right-4 z-50">
              <WalletButton />
            </div>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}