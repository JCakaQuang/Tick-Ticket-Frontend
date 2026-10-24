'use client';

import React from 'react';
import Link from 'next/link';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  isAdmin?: boolean | null;
  wishlistIds: string[];
  toggleWishlist: (eventId: string, e: React.MouseEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isAdmin,
  wishlistIds,
  toggleWishlist,
}) => {
  const venueName =
    (typeof event.venue === 'object' && event.venue?.name) ||
    (typeof event.location === 'object' && (event.location as any)?.name) ||
    event.venueName ||
    'Ticketbox';

  const venueCity =
    (typeof event.venue === 'object' && event.venue?.city) ||
    (typeof event.location === 'object' && (event.location as any)?.city) ||
    event.city ||
    'Việt Nam';

  return (
    <div className="group flex flex-col bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-[#00b14f]/50 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300">
      {/* Thumbnail Image */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        <img
          src={event.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-slate-900/80 backdrop-blur-md text-[#00b14f] border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md">
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={(e) => toggleWishlist(event._id, e)}
              title={wishlistIds.includes(event._id) ? 'Bỏ yêu thích' : 'Yêu thích sự kiện'}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                wishlistIds.includes(event._id)
                  ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-950'
                  : 'bg-slate-900/80 hover:bg-slate-900 text-gray-400 hover:text-rose-400 border border-slate-700/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
              event.seatingType === 'SEATED' ? 'bg-indigo-900/80 text-indigo-300' : 'bg-amber-900/80 text-amber-300'
            }`}
          >
            {event.seatingType === 'SEATED' ? 'Ghế ngồi' : 'Vé đứng'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#00b14f] transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 text-xs text-gray-300 border-t border-slate-700/60 pt-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(event.startDate || event.startTime || '').toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {venueName} - {venueCity}
            </span>
          </div>
        </div>

        {/* Booking CTA */}
        <Link
          href={`/events/${event.slug}`}
          className="w-full text-center bg-[#00b14f] hover:bg-[#009241] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 group-hover:shadow-emerald-600/40 transition-all"
        >
          Xem Chi Tiết & Mua Vé
        </Link>
      </div>
    </div>
  );
};
