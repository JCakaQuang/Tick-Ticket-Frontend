'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Event } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import EventBannerCarousel from '../components/EventBannerCarousel';
import { FeaturedSections } from '../components/FeaturedSections';
import { EventCard } from '../components/EventCard';
import { ChevronRight, Filter } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN');
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearch();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedDateRange, setSelectedDateRange] = useState<string>('ALL');
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
    if (isAuthenticated && !isAdmin) {
      fetchWishlist();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchWishlist = async () => {
    const res = await apiRequest<any[]>('/users/wishlist');
    if (res.success && Array.isArray(res.data)) {
      setWishlistIds(res.data.map((item) => (typeof item === 'string' ? item : item._id)));
    }
  };

  const toggleWishlist = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu sự kiện vào danh sách yêu thích!');
      return;
    }
    const res = await apiRequest<{ inWishlist: boolean }>(`/users/wishlist/${eventId}`, {
      method: 'POST',
    });
    if (res.success && res.data) {
      if (res.data.inWishlist) {
        setWishlistIds((prev) => [...prev, eventId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== eventId));
      }
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiRequest<Event[]>('/events');
    if (res.success && Array.isArray(res.data)) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  const cities = ['ALL', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];

  const priceRanges = [
    { id: 'ALL', label: 'Mọi mức giá' },
    { id: 'UNDER_500K', label: '< 500.000đ', min: 0, max: 500000 },
    { id: '500K_1M', label: '500k - 1.000.000đ', min: 500000, max: 1000000 },
    { id: 'OVER_1M', label: '> 1.000.000đ', min: 1000000, max: Infinity },
  ];

  // Helper filter function for city, price and search
  const isMatchFilter = (ev: Event) => {
    const venueName = (typeof ev.venue === 'object' && ev.venue?.name) || (typeof ev.location === 'object' && (ev.location as any)?.name) || ev.venueName || '';
    const venueCity = (typeof ev.venue === 'object' && ev.venue?.city) || (typeof ev.location === 'object' && (ev.location as any)?.city) || ev.city || '';
    const matchCity = selectedCity === 'ALL' || venueCity.toLowerCase().includes(selectedCity.toLowerCase());

    const startingPrice = (ev as any).minPrice || (ev as any).startingPrice || 0;
    const currentPriceRange = priceRanges.find((p) => p.id === selectedPriceRange);
    const matchPrice =
      !currentPriceRange ||
      currentPriceRange.id === 'ALL' ||
      (startingPrice >= (currentPriceRange.min ?? 0) && startingPrice <= (currentPriceRange.max ?? Infinity));

    const matchSearch =
      !searchQuery.trim() ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venueCity.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCity && matchPrice && matchSearch;
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCity !== 'ALL') params.set('city', selectedCity);
    if (selectedPriceRange !== 'ALL') params.set('price', selectedPriceRange);
    if (selectedDateRange !== 'ALL') params.set('date', selectedDateRange);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    const qs = params.toString();
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', qs ? `/?${qs}` : '/');
    }
  }, [selectedCity, selectedPriceRange, selectedDateRange, searchQuery]);

  useEffect(() => {
    const fetchRecs = async () => {
      const currentPriceRange = priceRanges.find((p) => p.id === selectedPriceRange);
      const maxP = currentPriceRange?.max && Number.isFinite(currentPriceRange.max) ? currentPriceRange.max : undefined;
      const qs = new URLSearchParams();
      if (selectedCity !== 'ALL') qs.set('city', selectedCity);
      if (selectedCategory && selectedCategory !== 'ALL') qs.set('category', selectedCategory);
      if (maxP) qs.set('maxPrice', String(maxP));
      qs.set('limit', '3');
      const res = await apiRequest<any>(`/events/recommendations?${qs.toString()}`);
      if (res.success && res.data?.recommendations) {
        setRecommendedEvents(res.data.recommendations);
      }
    };
    fetchRecs();
  }, [selectedCity, selectedPriceRange, selectedCategory, searchQuery]);

  // Group events by category
  const categorySections = [
    {
      id: 'CONCERT',
      title: 'Live Concert',
      matcher: (cat: string) => cat.includes('CONCERT') || cat.includes('ÂM NHẠC') || cat.includes('MUSIC'),
    },
    {
      id: 'THEATER',
      title: 'Sân khấu & kịch',
      matcher: (cat: string) => cat.includes('THEATER') || cat.includes('KỊCH') || cat.includes('SÂN KHẤU'),
    },
    {
      id: 'SPORTS',
      title: 'Thể thao',
      matcher: (cat: string) => cat.includes('SPORT') || cat.includes('THỂ THAO') || cat.includes('BÓNG ĐÁ'),
    },
    {
      id: 'SEMINAR',
      title: 'Hội thảo',
      matcher: (cat: string) => cat.includes('SEMINAR') || cat.includes('HỘI THẢO') || cat.includes('WORKSHOP'),
    },
  ];

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return events.filter(isMatchFilter);
  }, [events, searchQuery, selectedCity, selectedPriceRange]);

  return (
    <div className="space-y-12 pb-16">
      {/* 3. Phần 5 banner tự động (chữ nhỏ đi, thông tin chỉ chiếm 1/3 ảnh) */}
      <EventBannerCarousel events={events} loading={loading} />

      {/* 4. Dưới banner là Sự kiện đặc biệt, Sự kiện xu hướng như ảnh mẫu */}
      {!isSearching && <FeaturedSections events={events} />}

      {/* Secondary Quick Filter Toolbar: Location & Price */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Filter className="w-4 h-4 text-[#00b14f]" />
          <span>Bộ lọc sự kiện:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-300">
            <span className="text-gray-400">📍 Địa điểm:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-slate-900 text-white">
                  {city === 'ALL' ? 'Tất cả khu vực' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-300">
            <span className="text-gray-400">💰 Khoảng giá:</span>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            >
              {priceRanges.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {(selectedCity !== 'ALL' || selectedPriceRange !== 'ALL' || isSearching) && (
            <button
              onClick={() => {
                setSelectedCity('ALL');
                setSelectedPriceRange('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-[#00b14f] hover:underline px-2 py-1"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS VIEW (if user searches in Header) */}
      {isSearching && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
              <span>Kết quả tìm kiếm cho:</span>
              <span className="text-[#00b14f] italic">"{searchQuery}"</span>
              <span className="text-xs font-normal text-gray-400 ml-2">
                ({searchResults.length} sự kiện)
              </span>
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Xem tất cả danh mục
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-slate-800/60 rounded-2xl h-80 border border-slate-800" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="space-y-8">
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                <p className="text-gray-400 text-sm">Không tìm thấy sự kiện nào phù hợp với từ khóa.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-[#00b14f] hover:bg-[#009241] text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Xóa tìm kiếm
                </button>
              </div>
              {recommendedEvents.length > 0 && (
                <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="text-emerald-400">✨</span>
                        <span>Gợi ý sự kiện tương tự dành cho bạn</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Đề xuất thông minh theo thuật toán nới lỏng tiêu chí (Multi-Stage Constraint Relaxation)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedEvents.map((ev) => (
                      <EventCard
                        key={`rec-${ev._id}`}
                        event={ev}
                        isAdmin={isAdmin}
                        wishlistIds={wishlistIds}
                        toggleWishlist={toggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((ev) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  isAdmin={isAdmin}
                  wishlistIds={wishlistIds}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. MỖI DANH MỤC SỰ KIỆN LÀ MỘT SECTION RIÊNG */}
      {!isSearching && (
        <div className="space-y-12">
          {categorySections.map((cat) => {
            // Filter events belonging to this category
            const categoryEvents = events
              .filter((ev) => {
                const evCat = ((ev as any).category || '').toUpperCase();
                return cat.matcher(evCat) && isMatchFilter(ev);
              });

            if (categoryEvents.length === 0 && !loading) {
              return null; // Don't show empty category if filtered out
            }

            const isExpanded = !!expandedCategories[cat.id];
            // Desktop 3 cards per row: show 3 cards initially, expand if "Xem thêm >" is clicked
            const displayedEvents = isExpanded ? categoryEvents : categoryEvents.slice(0, 3);

            return (
              <section
                key={cat.id}
                id={`section-${cat.id.toLowerCase()}`}
                className="scroll-mt-36 space-y-4"
              >
                {/* Header section: Tiêu đề danh mục góc trái (chữ trắng, font đậm, ~20px) + Nút "Xem thêm >" bên phải */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-[20px] font-bold text-white tracking-tight">
                    {cat.title}
                  </h2>

                  <button
                    onClick={() => toggleCategoryExpand(cat.id)}
                    className="text-sm font-semibold text-[#00b14f] hover:text-emerald-400 flex items-center gap-1 transition-colors group/more cursor-pointer"
                  >
                    <span>{isExpanded ? 'Thu gọn <' : 'Xem thêm >'}</span>
                    {!isExpanded && (
                      <ChevronRight className="w-4 h-4 group-hover/more:translate-x-0.5 transition-transform" />
                    )}
                  </button>
                </div>

                {/* Danh sách event card: Desktop hiển thị 3 card trên một hàng, giao diện card giữ nguyên như hiện tại */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-slate-800/60 rounded-2xl h-80 border border-slate-800" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        isAdmin={isAdmin}
                        wishlistIds={wishlistIds}
                        toggleWishlist={toggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Architecture Highlights Section */}
      <section className="bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-[#00b14f]"></span>
          Đặc điểm kỹ thuật kiến trúc hệ thống Ticketbox
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-emerald-400 text-sm mb-1">CC01 - Chống Trùng Ghế</h4>
            <p className="text-gray-400">
              Sử dụng MongoDB <code>findOneAndUpdate</code> nguyên tử với điều kiện <code>status: AVAILABLE</code> hoặc lazy expired, tương đương Row-Level Lock giải quyết triệt để race condition.
            </p>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-teal-400 text-sm mb-1">CC02 - Chống Quá Bán GA</h4>
            <p className="text-gray-400">
              Sử dụng <code>$inc: -qty</code> kèm điều kiện kiểm tra tồn kho <code>availableQty: &#123; $gte: qty &#125;</code>, đảm bảo tuyệt đối không bán vượt sức chứa.
            </p>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-blue-400 text-sm mb-1">QR HMAC-SHA256 & Check-in</h4>
            <p className="text-gray-400">
              Mã vé QR được ký bảo mật chống giả mạo. Cổng soát vé kiểm tra nguyên tử <code>status: ISSUED &rarr; USED</code> ngăn chặn quét trùng vé tại cổng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}