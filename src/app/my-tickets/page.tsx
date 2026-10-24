'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket } from '../../types';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchTickets();
    }
  }, [user, authLoading]);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await apiRequest<Ticket[]>('/tickets/my-tickets');
    if (res.success && Array.isArray(res.data)) {
      setTickets(res.data);
    }
    setLoading(false);
  };

  const isAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN');

  if (authLoading || loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Đang tải danh sách vé điện tử của bạn...</p>
      </div>
    );
  }

  if (isAdmin && tickets.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-bold">
          ⚡
        </div>
        <h2 className="text-xl font-bold text-white">Chế Độ Quản Trị Viên</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Tài khoản Admin không áp dụng mua vé hoặc lưu trữ vé cá nhân. Vui lòng chuyển đến khu vực Quản trị Admin để quản lý danh sách vé đã phát hành và giám sát hệ thống.
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Vé Điện Tử Của Tôi</h1>
          <p className="text-xs text-gray-400 mt-1">
            Mỗi vé chứa mã QR có chữ ký số HMAC-SHA256, chỉ quét được duy nhất 1 lần tại cổng sự kiện.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          🔄 Làm mới danh sách
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <div className="text-4xl">🎟️</div>
          <p className="text-gray-300 font-bold text-sm">Bạn chưa có vé điện tử nào.</p>
          <p className="text-gray-500 text-xs">Hãy tìm kiếm sự kiện và đặt vé ngay!</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#00b14f] hover:bg-[#009241] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            Khám phá sự kiện
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => {
            const statusUpper = (t.status || '').toUpperCase();
            const isUsed = statusUpper === 'USED';
            const isIssued = statusUpper === 'VALID' || statusUpper === 'ISSUED';

            return (
              <div
                key={t._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/40 transition-all flex flex-col"
              >
                {/* Header Strip */}
                <div className={`p-4 flex items-center justify-between ${
                  isUsed ? 'bg-slate-800/80' : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900'
                }`}>
                  <span className="text-[11px] font-mono text-gray-400">
                    Mã vé: #{t.ticketCode || t._id.substring(t._id.length - 8)}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isIssued
                      ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
                      : isUsed
                      ? 'bg-gray-800 text-gray-400 border border-gray-700'
                      : 'bg-red-900/80 text-red-300 border border-red-700/50'
                  }`}>
                    {isIssued ? 'VÉ HỢP LỆ (CHƯA QUÉT)' : isUsed ? 'ĐÃ CHECK-IN TẠI CỔNG' : 'ĐÃ HỦY'}
                  </span>
                </div>

                {/* Ticket Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {t.event?.title || (t.eventId as any)?.title || 'Sự kiện âm nhạc Ticketbox'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {t.event?.venue?.name || (t.event?.location as any)?.name || (t.eventId as any)?.location?.name || 'Sân vận động Quốc gia'}, {t.event?.venue?.city || (t.event?.location as any)?.city || (t.eventId as any)?.location?.city || 'Hà Nội'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      🗓️ {(t.event?.startDate || t.event?.startTime || (t.eventId as any)?.startTime) ? new Date(t.event?.startDate || t.event?.startTime || (t.eventId as any)?.startTime).toLocaleString('vi-VN') : 'Sắp diễn ra'}
                    </p>
                  </div>

                  {/* Seat / Tier Info */}
                  <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Loại Vé</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {t.tier?.name || 'Tiêu Chuẩn'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Vị Trí Chỗ Ngồi</span>
                      <span className="text-sm font-black text-white">
                        {t.seat?.seatCode ? `Ghế: ${t.seat.seatCode}` : 'Vé đứng (GA)'}
                      </span>
                    </div>
                  </div>

                  {/* Anti-resale Notice */}
                  <div className="text-[10px] text-gray-500 space-y-0.5 border-t border-slate-800/80 pt-3">
                    <p>• Chính sách bảo mật: Không hỗ trợ chuyển nhượng / bán lại.</p>
                    <p>• Xuất trình mã QR dưới đây trực tiếp trên điện thoại tại cổng soát vé.</p>
                  </div>

                  {/* QR Code Action Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      disabled={isUsed}
                      onClick={() => setSelectedTicket(t)}
                      className="w-full py-2.5 bg-slate-800 hover:bg-[#00b14f] text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-transparent font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>📱 Hiển Thị Mã QR E-Ticket</span>
                    </button>
                    <Link
                      href={`/share/tickets/${t._id}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🔗 Chia Sẻ Vé Lên MXH</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                Vé Điện Tử Chính Hãng
              </span>
              <h3 className="text-base font-bold text-white mt-2 line-clamp-1">
                {selectedTicket.event?.title || 'Sự kiện Ticketbox'}
              </h3>
              <p className="text-xs text-gray-400">
                {selectedTicket.seat?.seatCode ? `Ghế: ${selectedTicket.seat.seatCode}` : 'Vé đứng (GA)'}
              </p>
            </div>

            {/* QR Code Graphic container */}
            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-inner">
              {/* Dynamic QR using API or QR SVG representation */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  selectedTicket.qrToken || selectedTicket.qrPayload || selectedTicket._id
                )}`}
                alt="QR Code Ticket"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-[11px] text-gray-400 truncate max-w-xs mx-auto">
                HMAC Token: {selectedTicket.qrToken?.substring(0, 24)}...
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                Sẵn sàng quét tại cổng kiểm soát
              </p>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}