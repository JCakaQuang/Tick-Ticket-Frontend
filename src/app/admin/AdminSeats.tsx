'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminSeats: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [seats, setSeats] = useState<any[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await apiRequest<any[]>('/admin/events');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setEvents(res.data);
      const seated = res.data.find((e) => {
        const t = (e.seatingType || e.type || '').toUpperCase();
        return t === 'SEATED' || t === 'HYBRID';
      });
      const target = seated || res.data[0];
      if (target) {
        setSelectedEventId(target._id);
        fetchSeats(target._id);
      }
    }
  };

  const fetchSeats = async (eventId: string) => {
    setLoadingSeats(true);
    const res = await apiRequest<any[]>(`/admin/events/${eventId}/seats`);
    if (res.success && Array.isArray(res.data)) {
      setSeats(res.data);
    }
    setLoadingSeats(false);
  };

  const handleToggleSeatLock = async (seat: any) => {
    const newStatus = seat.status === 'locked' ? 'available' : 'locked';
    const res = await apiRequest<any>(`/admin/seats/${seat._id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setSeats((prev) =>
        prev.map((s) => (s._id === seat._id ? { ...s, status: newStatus } : s))
      );
    } else {
      alert(res.message || 'Không thể cập nhật ghế.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản Lý Sơ Đồ Ghế & Khóa Ghế</h2>
          <p className="text-xs text-gray-400">
            Xem trạng thái ghế thời gian thực và khóa ghế ngoại giao (LOCKED)
          </p>
        </div>
        <select
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            fetchSeats(e.target.value);
          }}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
        >
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title} ({ev.seatingType || ev.type || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {loadingSeats ? (
          <p className="text-xs text-gray-400 text-center py-8">Đang tải sơ đồ ghế...</p>
        ) : seats.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">
            Sự kiện này không có sơ đồ ghế hoặc chưa được tạo ghế.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span> Còn trống ({seats.filter(s => s.status === 'available').length})
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500"></span> Đã bán ({seats.filter(s => s.status === 'sold').length})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span> Giữ chỗ ({seats.filter(s => s.status === 'reserved').length})
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500"></span> Khóa ngoại giao ({seats.filter(s => s.status === 'locked').length})
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[450px] overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
              {seats.map((seat) => (
                <button
                  key={seat._id}
                  onClick={() => handleToggleSeatLock(seat)}
                  disabled={seat.status === 'sold'}
                  title={`Ghế: ${seat.seatCode} - Hàng ${seat.row} - Trạng thái: ${seat.status} (Click để Khóa/Mở)`}
                  className={`p-2 rounded-lg text-center font-mono text-[11px] font-bold transition-all border ${
                    seat.status === 'available'
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      : seat.status === 'sold'
                      ? 'bg-slate-800 text-gray-500 border-slate-700 cursor-not-allowed opacity-50'
                      : seat.status === 'reserved'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-purple-950/60 text-purple-300 border-purple-500/50 hover:bg-purple-900/60'
                  }`}
                >
                  {seat.seatCode}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 italic">
              * Click vào một ghế để chuyển đổi giữa Còn trống (Available) và Khóa ngoại giao (Locked).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
