'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminTiers: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTier, setNewTier] = useState({ name: '', type: 'ga', price: 350000, totalQuantity: 100 });

  useEffect(() => {
    apiRequest<any[]>('/admin/events').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
        setSelectedEventId(res.data[0]._id);
        loadTiers(res.data[0]._id);
      }
    });
  }, []);

  const loadTiers = async (eid: string) => {
    if (!eid) return;
    setLoading(true);
    const res = await apiRequest<any[]>(`/admin/events/${eid}/tiers`);
    if (res.success && Array.isArray(res.data)) setTiers(res.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest<any>(`/admin/events/${selectedEventId}/tiers`, {
      method: 'POST',
      body: JSON.stringify({
        ...newTier,
        type: (newTier.type || 'ga').toLowerCase(),
        price: Number(newTier.price),
        totalQuantity: Number(newTier.totalQuantity),
        availableQuantity: Number(newTier.totalQuantity),
      }),
    });
    if (res.success) {
      setShowAdd(false);
      loadTiers(selectedEventId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa hạng vé này?')) return;
    const res = await apiRequest<any>(`/admin/tiers/${id}`, { method: 'DELETE' });
    if (res.success) setTiers((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản Lý Loại Vé (Ticket Classes) • UC18</h2>
          <p className="text-xs text-gray-400">Cấu hình tên vé, mức giá, tồn kho và hình thức Seated / GA</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              loadTiers(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-[#00b14f] text-white text-xs font-bold rounded-xl"
          >
            {showAdd ? 'Đóng' : '+ Thêm Loại Vé'}
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              required
              placeholder="Tên hạng vé"
              value={newTier.name}
              onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <select
              value={newTier.type}
              onChange={(e) => setNewTier({ ...newTier, type: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="ga">GA (Tự Do)</option>
              <option value="seated">SEATED (Có Ghế)</option>
            </select>
            <input
              type="number"
              required
              min={0}
              placeholder="Giá vé"
              value={newTier.price}
              onChange={(e) => setNewTier({ ...newTier, price: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              type="number"
              required
              min={1}
              placeholder="Số lượng"
              value={newTier.totalQuantity}
              onChange={(e) => setNewTier({ ...newTier, totalQuantity: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
            Lưu Hạng Vé
          </button>
        </form>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-400">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Hạng Vé</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Giá</th>
                  <th className="p-4">Tổng</th>
                  <th className="p-4">Đã Bán</th>
                  <th className="p-4">Giữ Chỗ</th>
                  <th className="p-4">Còn Lại</th>
                  <th className="p-4 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tiers.map((t) => {
                  const total = t.totalQuantity || t.totalCapacity || 0;
                  const sold = t.soldQuantity || 0;
                  const res = t.reservedQuantity || 0;
                  const avail = Math.max(0, total - (sold + res));
                  return (
                    <tr key={t._id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-white">{t.name}</td>
                      <td className="p-4 text-emerald-400 font-semibold">{t.type}</td>
                      <td className="p-4 font-bold">{(t.price || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-4 font-mono">{total}</td>
                      <td className="p-4 font-mono text-emerald-400">{sold}</td>
                      <td className="p-4 font-mono text-amber-400">{res}</td>
                      <td className="p-4 font-mono font-bold text-cyan-400">{avail}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="px-2 py-1 bg-red-950 text-red-300 rounded text-[10px]"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
