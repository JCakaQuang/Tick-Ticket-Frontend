'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';

interface FeaturedSectionsProps {
  events: Event[];
}

interface SpecialItem {
  id: string;
  title: string;
  image: string;
  link: string;
  badge?: string;
}

interface TrendingItem {
  id: string;
  rank: number;
  title: string;
  image: string;
  link: string;
  subtitle?: string;
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({ events }) => {
  const specialScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const [canScrollSpecialLeft, setCanScrollSpecialLeft] = useState(false);
  const [canScrollSpecialRight, setCanScrollSpecialRight] = useState(true);

  const [canScrollTrendingLeft, setCanScrollTrendingLeft] = useState(false);
  const [canScrollTrendingRight, setCanScrollTrendingRight] = useState(true);

  // 1. DYNAMIC SPECIAL EVENTS (Sự kiện đặc biệt lấy từ DB)
  const specialEvents: SpecialItem[] = useMemo(() => {
    if (!events || events.length === 0) return [];

    const markedSpecials = events
      .filter((e) => e.isSpecial)
      .sort((a, b) => (a.specialOrder || 99) - (b.specialOrder || 99));

    let combined = [...markedSpecials];
    if (combined.length < 5) {
      const addedIds = new Set(combined.map((e) => e._id));
      const fallbacks = events.filter((e) => !addedIds.has(e._id));
      combined = [...combined, ...fallbacks.slice(0, 5 - combined.length)];
    }

    return combined.map((e) => ({
      id: e._id,
      title: e.title,
      image: e.posterUrl || e.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80',
      link: `/events/${e.slug}`,
      badge: e.specialBadge || (typeof e.category === 'string' ? e.category : 'Sự kiện Hot'),
    }));
  }, [events]);

  // 2. DYNAMIC TRENDING EVENTS (Sự kiện xu hướng xếp hạng 1, 2, 3...)
  const trendingEvents: TrendingItem[] = useMemo(() => {
    if (!events || events.length === 0) return [];

    const markedTrendings = events
      .filter((e) => e.isTrending)
      .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));

    let combined = [...markedTrendings];
    if (combined.length < 5) {
      const addedIds = new Set(combined.map((e) => e._id));
      const fallbacks = events.filter((e) => !addedIds.has(e._id));
      combined = [...combined, ...fallbacks.slice(0, 6 - combined.length)];
    }

    return combined.map((e, idx) => ({
      id: e._id,
      rank: e.trendingRank && e.trendingRank > 0 ? e.trendingRank : idx + 1,
      title: e.title,
      image: e.bannerUrl || e.posterUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
      link: `/events/${e.slug}`,
    }));
  }, [events]);

  // Scroll checking
  const handleScroll = (ref: React.RefObject<HTMLDivElement>, setLeft: (v: boolean) => void, setRight: (v: boolean) => void) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 10);
    setRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const spEl = specialScrollRef.current;
    const trEl = trendingScrollRef.current;
    if (spEl) {
      handleScroll(specialScrollRef, setCanScrollSpecialLeft, setCanScrollSpecialRight);
    }
    if (trEl) {
      handleScroll(trendingScrollRef, setCanScrollTrendingLeft, setCanScrollTrendingRight);
    }
  }, [events]);

  return (
    <div className="space-y-10">
      {/* 1. SỰ KIỆN ĐẶC BIỆT */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Sự kiện đặc biệt
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group/special">
          {/* Left Arrow Button */}
          {canScrollSpecialLeft && (
            <button
              onClick={() => scrollContainer(specialScrollRef, 'left')}
              aria-label="Cuộn sang trái"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#00b14f] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button (matches screenshot circle button with right chevron) */}
          {canScrollSpecialRight && (
            <button
              onClick={() => scrollContainer(specialScrollRef, 'right')}
              aria-label="Cuộn sang phải"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#00b14f] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Posters Row */}
          <div
            ref={specialScrollRef}
            onScroll={() => handleScroll(specialScrollRef, setCanScrollSpecialLeft, setCanScrollSpecialRight)}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 px-1 scroll-smooth"
          >
            {specialEvents.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                title={item.title}
                className="group relative flex-shrink-0 w-[170px] sm:w-[195px] md:w-[210px] aspect-[10/14] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-lg hover:shadow-2xl hover:border-emerald-500/50 hover:scale-[1.03] transition-all duration-300"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Badge if available */}
                {item.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00b14f] text-black shadow-md uppercase tracking-wider backdrop-blur-sm">
                      {item.badge}
                    </span>
                  </div>
                )}
                {/* Subtle top/bottom shadow overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-semibold line-clamp-2 drop-shadow-md group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SỰ KIỆN XU HƯỚNG */}
      <section className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🔥</span>
            <span>Sự kiện xu hướng</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group/trending">
          {/* Left Arrow Button */}
          {canScrollTrendingLeft && (
            <button
              onClick={() => scrollContainer(trendingScrollRef, 'left')}
              aria-label="Cuộn sang trái"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#00b14f] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button (matches screenshot circle button with right chevron) */}
          {canScrollTrendingRight && (
            <button
              onClick={() => scrollContainer(trendingScrollRef, 'right')}
              aria-label="Cuộn sang phải"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#00b14f] text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Trending Row */}
          <div
            ref={trendingScrollRef}
            onScroll={() => handleScroll(trendingScrollRef, setCanScrollTrendingLeft, setCanScrollTrendingRight)}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-2 pt-1 px-1 scroll-smooth"
          >
            {trendingEvents.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                title={item.title}
                className="group flex items-center gap-2 sm:gap-2.5 flex-shrink-0 cursor-pointer"
              >
                {/* Hollow Green Stroke Numeral (1, 2, 3, 4...) matching screenshot design */}
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter select-none font-mono"
                  style={{
                    WebkitTextStroke: '2.5px #00b14f',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  {item.rank}
                </span>

                {/* Landscape Poster Card */}
                <div className="relative w-[210px] sm:w-[245px] md:w-[270px] aspect-[16/10] rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-lg hover:shadow-2xl hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                    <p className="text-white text-[11px] font-semibold line-clamp-1">
                      {item.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


