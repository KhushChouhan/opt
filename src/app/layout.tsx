import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import HeritageLaunchAlert from '@/components/HeritageLaunchAlert';

const cormorant = localFont({
  src: './fonts/CormorantGaramond-Variable.ttf',
  weight: '300 700',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
});

const dmSans = localFont({
  src: './fonts/DMSans-Variable.ttf',
  weight: '300 800',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hariyana Watch & Opticals | Virtual Try-On Store',
  description: 'Try on premium eyeglasses, sunglasses, and watches virtually from your browser. Retail store in Hanumangarh Town, Rajasthan. Contact: 98282-07999.',
  keywords: 'optical shop Hanumangarh, virtual try-on, eyeglasses online, sunglasses, watches, Hariyana Watch Opticals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FCF8F4] text-[#121212] font-sans">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <HeritageLaunchAlert />
        </Providers>
      </body>
    </html>
  );
}
