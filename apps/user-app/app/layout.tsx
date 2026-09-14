import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Metadata } from 'next';
import '@repo/ui/globals.css';
import { Toaster } from '@repo/ui/components/toast';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@repo/ui/lib/utils';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const fontBrand = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-brand',
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
        geist.variable,
        fontBrand.variable,
        'font-sans',
      )}>
      <body>
        <ThemeProvider defaultTheme='system'>
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
