import { Geist, Geist_Mono } from 'next/font/google';
import { Metadata } from 'next';
import '@repo/ui/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@repo/ui/lib/utils';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PayPro - Payment Management',
  description: 'Secure payment management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        geist.variable,
      )}>
      <body>
        <ThemeProvider enableSystem={false} defaultTheme='light'>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
