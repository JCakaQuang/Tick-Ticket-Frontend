'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await apiRequest<any[]>(`/admin/payments${query}`);
    if (res.success && Array.isArray(res.data)) {
      setPayments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản Lý Giao Dịch & Thanh Toán • UC21</h2>
          <p className="text-xs text-gray-400">Theo dõi thông tin thanh toán từ Payment Gateway Sandbox (VNPAY, MoMo, Thẻ)</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo TXN ID, mã đơn..."
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
            <option value="paid">PAID (Thành công)</option>
            <option value="pending">PENDING (Chờ)</option>
            <option value="failed">FAILED (Thất bại)</option>
            <option value="cancelled">CANCELLED (Hủy)</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-400">Đang tải giao dịch...</p>
        ) : payments.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">Không có giao dịch nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Mã Giao Dịch (TXN)</th>
                  <th className="p-4">Mã Đơn Hàng</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Cổng TT</th>
                  <th className="p-4">Số Tiền</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/30">
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {p.paymentTransactionId || 'N/A (Chưa tạo)'}
                    </td>
                    <td className="p-4 font-mono font-semibold text-white">{p.orderCode}</td>
                    <td className="p-4">
                      <p className="text-white font-medium">{p.userId?.fullName || 'Khách'}</p>
                      <p className="text-[11px] text-gray-500">{p.userId?.email || ''}</p>
                    </td>
                    <td className="p-4 uppercase font-bold text-amber-400">{p.paymentMethod || 'MOCK'}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {(p.totalAmount || p.subtotal || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('vi-VN')} {new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
