import React from 'react';
import type { Metadata } from 'next';

interface EventLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: EventLayoutProps): Promise<Metadata> {
  const slug = params?.slug || '';
  const backendOrigin =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';
  const apiUrl = backendOrigin.endsWith('/api/v1')
    ? `${backendOrigin}/events/${slug}`
    : `${backendOrigin.replace(/\/$/, '')}/api/v1/events/${slug}`;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const event = json?.data || json;
      if (event && event.title) {
        const title = `${event.title} | Đặt Vé Chính Hãng - Tick Ticket`;
        const city = event.location?.city || '';
        const description =
          event.description?.slice(0, 160) ||
          `Đặt vé sự kiện ${event.title} tại ${city}. Giữ chỗ nguyên tử, vé điện tử QR HMAC-SHA256 chống giả mạo.`;
        const image = event.bannerUrl || '/events/special-1.webp';
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            locale: 'vi_VN',
            siteName: 'Tick Ticket',
            images: [{ url: image, width: 1200, height: 630, alt: event.title }],
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
          },
        };
      }
    }
  } catch {
    // Fallback metadata if backend is not reachable at build time
  }

  return {
    title: 'Chi Tiết Sự Kiện | Tick Ticket',
    description: 'Khám phá và đặt vé sự kiện trực tuyến an toàn với mã QR HMAC-SHA256.',
  };
}

export default function EventSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
