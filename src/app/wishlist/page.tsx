'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function WishlistPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && !isAdmin) fetchWishlist();
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchWishlist = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/users/wishlist');
    if (res.success && Array.isArray(res.data)) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  const handleRemove = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await apiRequest<{ inWishlist: boolean }>(`/users/wishlist/${eventId}`, {
      method: 'POST',
    });
    if (res.success) {
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
    }
  };

  if (authLoading || (loading && isAuthenticated && !isAdmin)) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-bold">
          ⚡
        </div>
        <h2 className="text-xl font-bold text-white">Chế Độ Quản Trị Viên</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Tài khoản Admin không sử dụng tính năng lưu sự kiện yêu thích cá nhân. Vui lòng chuyển đến khu vực Quản trị Admin để điều hành sự kiện.
        </p>
        <Link
          href="/admin"
          className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          Đến Bảng Điều Khiển Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span className="text-rose-500">❤️</span> Sự Kiện Yêu Thích Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Lưu lại các Live Concert bạn quan tâm để không bỏ lỡ ngày mở bán vé
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
          {events.length} sự kiện
        </span>
      </div>

      {events.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
            💔
          </div>
          <h3 className="text-lg font-bold text-white">Chưa có sự kiện yêu thích nào</h3>
          <p className="text-xs text-gray-400">
            Hãy khám phá các Live Concert hoặc chương trình kịch nghệ và nhấn yêu thích nhé!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
          >
            Khám phá sự kiện ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden flex flex-col shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={ev.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80'}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => handleRemove(ev._id, e)}
                  title="Xóa khỏi yêu thích"
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-rose-950/80 text-rose-400 border border-rose-500/30 rounded-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <h3 className="font-bold text-sm text-white line-clamp-2">
                  {ev.title}
                </h3>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#00b14f]">
                    {(
                      ev.startingPrice ||
                      ev.minPrice ||
                      (ev.tiers && ev.tiers.length > 0
                        ? Math.min(...ev.tiers.map((t: any) => Number(t.price) || 0))
                        : 0)
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                  <Link
                    href={`/events/${ev.slug}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Đặt vé
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
