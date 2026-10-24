'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { TickTicketLogo } from './TickTicketLogo';
import { Search, X, Sparkles, Music, Theater, Trophy, Presentation } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeOrder, secondsRemaining, formatCountdown } = useCart();
  const { searchQuery, setSearchQuery, selectedCategory, scrollToCategory } = useSearch();

  const isAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN');
  const isStaffOrAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN' || (user as any).role === 'organizer');

  const categories = [
    { id: 'ALL', label: 'Tất cả sự kiện', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'CONCERT', label: 'Live Concert', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'THEATER', label: 'Sân khấu & kịch', icon: <Theater className="w-3.5 h-3.5" /> },
    { id: 'SPORTS', label: 'Thể thao', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'SEMINAR', label: 'Hội thảo', icon: <Presentation className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1e2329] text-white shadow-md border-b border-gray-800">
      {/* 1. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          {/* Logo, Nav & Search Box (Inline) */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center group py-1 flex-shrink-0">
              <TickTicketLogo variant="dark" size="md" />
            </Link>

            {/* Navigation links & Search Input inline */}
            <nav className="flex items-center gap-3 lg:gap-5 text-sm font-medium">
              <Link href="/" className="text-gray-300 hover:text-[#22c55e] transition-colors whitespace-nowrap">
                Khám phá
              </Link>

              {!isAdmin && (
                <>
                  <Link href="/my-tickets" className="hidden sm:inline text-gray-300 hover:text-[#22c55e] transition-colors whitespace-nowrap">
                    Vé của tôi
                  </Link>
                  <Link href="/wishlist" className="hidden sm:flex text-gray-300 hover:text-[#22c55e] transition-colors items-center gap-1 whitespace-nowrap">
                    <span>❤️</span> Yêu thích
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors whitespace-nowrap"
                >
                  ⚡ Quản trị Admin
                </Link>
              )}

              {isStaffOrAdmin && (
                <Link href="/checkin" className="hidden md:flex text-gray-300 hover:text-[#22c55e] transition-colors items-center gap-1 whitespace-nowrap">
                  <span>🛡️</span> Cổng Soát Vé
                </Link>
              )}
            </nav>

            {/* Ô tìm kiếm sự kiện với icon kính lúp ngang hàng với Khám phá, Vé của tôi, Yêu thích */}
            <div className="relative flex-1 max-w-xs lg:max-w-sm hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện, địa điểm, nghệ sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14181d] border border-gray-700/80 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            {/* Active Hold Cart Timer Alert */}
            {activeOrder && secondsRemaining > 0 && (
              <Link
                href={`/checkout/${activeOrder._id}`}
                className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse hover:bg-amber-500/30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden md:inline">Đang giữ chỗ:</span>
                <span>{formatCountdown(secondsRemaining)}</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white leading-tight">{user.fullName}</p>
                  <p className="text-xs text-[#22c55e] capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-200 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar if on extra small screen */}
        <div className="sm:hidden pb-2.5">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14181d] border border-gray-700/80 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00b14f]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Header phụ của các danh mục sự kiện (Sub-header) */}
      <div className="bg-[#141920] border-t border-gray-800/90 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 sm:gap-2.5 py-2 overflow-x-auto scrollbar-none text-xs">
            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => scrollToCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#00b14f]/20 text-[#00b14f] border border-[#00b14f]/40 font-semibold shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-[#00b14f]' : 'text-gray-400'}>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};