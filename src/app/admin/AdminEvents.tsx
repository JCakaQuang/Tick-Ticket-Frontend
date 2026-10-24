'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminCreateEventModal } from './AdminCreateEventModal';
import { AdminVnpayModal } from './AdminVnpayModal';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQrEvent, setEditingQrEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/admin/events');
    if (res.success && Array.isArray(res.data)) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    const res = await apiRequest<any>(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setEvents((prev) =>
        prev.map((ev) => (ev._id === eventId ? { ...ev, status: newStatus } : ev))
      );
    }
  };

  const handleToggleSpecial = async (ev: any) => {
    const nextVal = !ev.isSpecial;
    const defaultBadge = ev.specialBadge || (typeof ev.category === 'string' ? ev.category : 'Đặc sắc');
    const res = await apiRequest<any>(`/admin/events/${ev._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        isSpecial: nextVal,
        specialBadge: nextVal ? defaultBadge : '',
      }),
    });
    if (res.success) {
      setEvents((prev) =>
        prev.map((item) =>
          item._id === ev._id
            ? { ...item, isSpecial: nextVal, specialBadge: nextVal ? defaultBadge : '' }
            : item
        )
      );
    }
  };

  const handleToggleTrending = async (ev: any) => {
    const nextVal = !ev.isTrending;
    const nextRank = nextVal ? (ev.trendingRank || 1) : null;
    const res = await apiRequest<any>(`/admin/events/${ev._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        isTrending: nextVal,
        trendingRank: nextRank,
      }),
    });
    if (res.success) {
      setEvents((prev) =>
        prev.map((item) =>
          item._id === ev._id
            ? { ...item, isTrending: nextVal, trendingRank: nextRank }
            : item
        )
      );
    }
  };

  const handleUpdateRank = async (eventId: string, newRank: number) => {
    const res = await apiRequest<any>(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ trendingRank: newRank }),
    });
    if (res.success) {
      setEvents((prev) =>
        prev.map((item) => (item._id === eventId ? { ...item, trendingRank: newRank } : item))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Quản Lý Sự Kiện & Mã VNPAY-QR</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] uppercase font-semibold">
              Admin Exclusive
            </span>
          </h2>
          <p className="text-xs text-gray-400">
            Mỗi sự kiện có mã thanh toán VNPAY riêng biệt. Chỉ Admin mới có quyền cấu hình và điều chỉnh mã QR VNPAY.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#005baa] hover:bg-[#004887] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <span>➕ Thêm Sự Kiện & Gắn VNPAY QR</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Đang tải sự kiện...</div>
        ) : (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Sự Kiện</th>
                <th className="p-4">Địa Điểm / Thể Loại</th>
                <th className="p-4">Mã VNPAY & QR</th>
                <th className="p-4 text-center">Đặc Biệt ✨</th>
                <th className="p-4 text-center">Xu Hướng 🔥</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((ev) => {
                const qrUrl =
                  ev.vnpayQrUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VNPAYQR*${ev.vnpayTmnCode || ev.slug}`;
                return (
                  <tr key={ev._id} className="hover:bg-slate-800/30">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{ev.title}</p>
                      <p className="text-[11px] text-gray-500">{ev.slug}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300">{ev.city || ev.location?.city || 'Hà Nội'}</p>
                      <p className="text-[11px] text-gray-500">{ev.category || 'Âm nhạc'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={qrUrl}
                          alt="VNPAY QR"
                          className="w-10 h-10 rounded border border-blue-500/40 bg-white p-0.5 object-contain"
                        />
                        <div>
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] rounded font-bold">
                            {ev.vnpayTmnCode || 'VNPAY_SANDBOX'}
                          </span>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {ev.vnpayAccountName || 'BTC SỰ KIỆN'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleSpecial(ev)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                          ev.isSpecial
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {ev.isSpecial ? '✨ Đặc biệt' : 'Mặc định'}
                      </button>
                      {ev.isSpecial && ev.specialBadge && (
                        <p className="text-[10px] text-amber-400/80 mt-1 truncate max-w-[100px] mx-auto">
                          {ev.specialBadge}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleToggleTrending(ev)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                            ev.isTrending
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {ev.isTrending ? '🔥 Xu hướng' : 'Không'}
                        </button>
                        {ev.isTrending && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span>Top:</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              defaultValue={ev.trendingRank || 1}
                              onBlur={(e) => handleUpdateRank(ev._id, Number(e.target.value))}
                              className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-white text-[11px]"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={ev.status}
                        onChange={(e) => handleUpdateStatus(ev._id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="SOLD_OUT">SOLD_OUT</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingQrEvent(ev)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <span>⚙️ Sửa QR VNPAY</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <AdminCreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchEvents}
        />
      )}

      {editingQrEvent && (
        <AdminVnpayModal
          event={editingQrEvent}
          onClose={() => setEditingQrEvent(null)}
          onSuccess={(updated) => {
            setEvents((prev) =>
              prev.map((item) => (item._id === updated._id ? updated : item))
            );
          }}
        />
      )}
    </div>
  );
};
