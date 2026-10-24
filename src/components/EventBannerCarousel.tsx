'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Event } from '../types';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket, Sparkles, ArrowRight } from 'lucide-react';

interface EventBannerCarouselProps {
  events: Event[];
  loading?: boolean;
}

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80';

export default function EventBannerCarousel({ events, loading }: EventBannerCarouselProps) {
  // Lọc 5 sự kiện mới tạo gần nhất theo thời gian createdAt giảm dần
  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [events]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = recentEvents.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Chạy tự động 5s (5000ms) một ảnh, tạm dừng khi hover chuột
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused, nextSlide]);

  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  if (loading) {
    return (
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 animate-pulse border border-slate-800" />
    );
  }

  if (recentEvents.length === 0) return null;

  const activeEvent = recentEvents[currentIndex];
  const venueName =
    (typeof activeEvent.venue === 'object' && activeEvent.venue?.name) ||
    (typeof activeEvent.location === 'object' && (activeEvent.location as any)?.name) ||
    activeEvent.venueName ||
    'Ticketbox';
  const venueCity =
    (typeof activeEvent.venue === 'object' && activeEvent.venue?.city) ||
    (typeof activeEvent.location === 'object' && (activeEvent.location as any)?.city) ||
    activeEvent.city ||
    'Việt Nam';

  const startingPrice = activeEvent.minPrice || activeEvent.startingPrice || 0;
  const eventDate = activeEvent.startDate || activeEvent.startTime;

  return (
    <section
      aria-label="Banner 5 sự kiện mới nhất"
      className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      {recentEvents.map((ev, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={ev._id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={ev.bannerUrl || DEFAULT_BANNER}
              alt={ev.title}
              className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                isCurrent && !isPaused ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none md:hidden" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent w-full md:w-[42%] lg:w-[36%] pointer-events-none" />

      {/* 5-second progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
        <div
          key={`${currentIndex}-${isPaused}`}
          className="h-full bg-gradient-to-r from-[#00b14f] to-teal-400 origin-left"
          style={{
            animation: !isPaused ? 'bannerProgress 5000ms linear forwards' : 'none',
            width: isPaused ? '100%' : undefined,
          }}
        />
      </div>

      {/* Content - occupying only 1/3 of banner */}
      <div className="relative z-30 h-full flex flex-col justify-end p-5 sm:p-7 md:p-8 w-full md:w-[36%] lg:w-[33%] max-w-sm space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 bg-[#00b14f] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-md shadow-emerald-600/30">
            <Sparkles className="w-3 h-3" />
            Sự kiện #{currentIndex + 1}
          </span>
          {activeEvent.category && (
            <span className="bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium text-[10px]">
              {activeEvent.category}
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md text-gray-300 border border-slate-700/60 px-2 py-0.5 rounded-full font-medium text-[10px]">
            {activeEvent.seatingType === 'SEATED' || activeEvent.type === 'SEATED' ? '💺 Ghế ngồi' : '🧍 Vé đứng'}
          </span>
        </div>

        <Link href={`/events/${activeEvent.slug}`} className="group/title block">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-snug line-clamp-2 group-hover/title:text-[#00b14f] transition-colors drop-shadow-sm">
            {activeEvent.title}
          </h2>
        </Link>

        {activeEvent.description && (
          <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
            {activeEvent.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-gray-200 pt-0.5">
          <div className="flex items-center gap-2">
            {eventDate && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-[#00b14f]" />
                <span>{new Date(eventDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            {startingPrice > 0 && (
              <div className="flex items-center gap-1 bg-[#00b14f]/20 border border-[#00b14f]/40 px-2.5 py-1 rounded-lg text-emerald-300 font-bold text-[11px]">
                <Ticket className="w-3.5 h-3.5 text-[#00b14f]" />
                <span>Từ {startingPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-300 text-[11px] truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{venueName} • {venueCity}</span>
          </div>
        </div>

        <div className="pt-1.5 flex items-center gap-2.5">
          <Link
            href={`/events/${activeEvent.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#00b14f] hover:bg-[#009241] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Đặt Vé Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/events/${activeEvent.slug}`}
            className="inline-flex items-center bg-slate-900/80 hover:bg-slate-800 text-gray-300 font-medium text-xs px-3 py-2 rounded-xl border border-slate-700 backdrop-blur-md transition-all"
          >
            <span>Chi Tiết</span>
          </Link>
        </div>
      </div>

      {/* Nav Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Sự kiện trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/60 hover:bg-[#00b14f] text-white border border-slate-700/80 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Sự kiện tiếp theo"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/60 hover:bg-[#00b14f] text-white border border-slate-700/80 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicator Dots & Counter */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 right-6 z-30 flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800">
          <span className="text-[11px] font-mono text-gray-400 font-bold">
            0{currentIndex + 1} / 0{totalSlides}
          </span>
          <div className="flex items-center gap-1.5">
            {recentEvents.map((ev, idx) => (
              <button
                key={ev._id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Chuyển tới sự kiện ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-[#00b14f] shadow-md shadow-emerald-500/50'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
