import React from 'react';
import type { Metadata } from 'next';

interface ShareTicketLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({ params }: ShareTicketLayoutProps): Promise<Metadata> {
  const id = params?.id || '';
  const backendOrigin =
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';
  const apiUrl = backendOrigin.endsWith('/api/v1')
    ? `${backendOrigin}/tickets/share/${id}`
    : `${backendOrigin.replace(/\/$/, '')}/api/v1/tickets/share/${id}`;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const share = json?.data || json;
      if (share && share.event?.title) {
        const title = `${share.maskedOwner} đã sở hữu vé ${share.event.title} | Tick Ticket`;
        const description = `Hạng vé: ${share.tier?.name} (${share.seatCode}) — Chứng nhận vé điện tử chính hãng xác thực HMAC-SHA256 trên Tick Ticket.`;
        const image = share.event?.bannerUrl || '/events/special-1.webp';
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            locale: 'vi_VN',
            siteName: 'Tick Ticket',
            images: [{ url: image, width: 1200, height: 630, alt: share.event.title }],
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
    // Fallback metadata if backend is offline
  }

  return {
    title: 'Chứng Nhận Sở Hữu Vé Điện Tử | Tick Ticket',
    description: 'Chứng nhận vé điện tử chính hãng đã xác thực chữ ký số HMAC-SHA256 trên Tick Ticket.',
  };
}

export default function ShareTicketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
