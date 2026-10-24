import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Request-time rendering lets Next.js attach the CSP nonce to inline scripts.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tick Ticket - Vé Sự Kiện Trực Tuyến | Live Concert, Thể thao, Sân khấu',
  description: 'Tick Ticket - Nền tảng bán vé sự kiện trực tuyến hàng đầu Việt Nam. Giữ chỗ nguyên tử trong 10 phút, kiểm soát vé an toàn và chống đầu cơ.',
  icons: {
    icon: '/favicon.ico',
  },
};

import { SearchProvider } from '../context/SearchContext';
import { TrafficTracker } from '../components/TrafficTracker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[#0f172a] text-slate-100 flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <TrafficTracker />
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
              <Footer />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

