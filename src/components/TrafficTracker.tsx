'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { apiRequest } from '../lib/api';

export async function recordClientTraffic(path: string, referrer?: string) {
  if (!path) return;
  try {
    const ref = referrer !== undefined ? referrer : (typeof document !== 'undefined' ? document.referrer : '');
    const payload = {
      path,
      referrer: ref || '',
    };

    const res = await apiRequest('/traffic/track', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!res.success) {
      await apiRequest('/analytics/track', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tickticket_traffic_tracked', { detail: payload }));
      console.debug('[TrafficTracker] Recorded visit:', path);
    }
  } catch (err) {
    console.warn('[TrafficTracker] Failed to send traffic ping', err);
  }
}

export function TrafficTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const fullPath = search ? `${pathname}${search}` : pathname;

    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    recordClientTraffic(pathname);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__trackTraffic = recordClientTraffic;
    }
  }, []);

  return null;
}


