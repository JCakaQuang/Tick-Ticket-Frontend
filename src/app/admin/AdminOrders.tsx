'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    let query = '';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (params.toString()) query = `?${params.toString()}`;

    const res = await apiRequest<any[]>(`/admin/orders${query}`);
    if (res.success && Array.isArray(res.data)) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản Lý Đơn Hàng & Doanh Thu</h2>
          <p className="text-xs text-gray-400">Theo dõi toàn bộ giao dịch đặt vé trên nền tảng</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán (PAID)</option>
            <option value="pending">Đang giữ chỗ (PENDING)</option>
            <option value="cancelled">Đã hủy (CANCELLED)</option>
            <option value="expired">Hết hạn (EXPIRED)</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-400">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">Không tìm thấy đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Mã Đơn</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Sự Kiện</th>
                  <th className="p-4">Số Lượng Vé</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-800/30">
                    <td className="p-4 font-mono font-bold text-white">{o.orderCode}</td>
                    <td className="p-4">
                      <p className="text-white font-medium">{o.userId?.fullName || 'Khách'}</p>
                      <p className="text-[11px] text-gray-500">{o.userId?.email || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-gray-300 truncate max-w-[200px]">
                      {o.eventId?.title || 'Sự kiện'}
                    </td>
                    <td className="p-4 text-center font-bold">
                      {o.items?.reduce((sum: number, it: any) => sum + it.quantity, 0) || 1}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {(o.totalAmount || o.subtotal || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
