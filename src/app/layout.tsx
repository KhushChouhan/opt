import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#060b13] text-[#f3f4f6]">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
