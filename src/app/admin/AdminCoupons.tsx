'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../../lib/api';
import { Coupon } from '../../types';
import { AdminCouponModal } from './AdminCouponModal';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
  Percent,
  AlertCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Ticket,
} from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [events, setEvents] = useState<Array<{ _id: string; title: string; slug?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'fixed_amount'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await apiRequest<Coupon[]>('/admin/coupons');
    if (res.success && Array.isArray(res.data)) {
      setCoupons(res.data);
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    const res = await apiRequest<any>('/admin/events');
    if (res.success && Array.isArray(res.data)) {
      setEvents(res.data);
    } else {
      const fallback = await apiRequest<any>('/events');
      if (fallback.success && Array.isArray(fallback.data)) {
        setEvents(fallback.data);
      }
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchEvents();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    const nextState = !coupon.isActive;
    const res = await apiRequest<any>(`/admin/coupons/${coupon._id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: nextState }),
    });
    if (res.success) {
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: nextState } : c))
      );
      showToast('success', `${nextState ? 'Kích hoạt' : 'Tạm dừng'} mã "${coupon.code}" thành công`);
    } else {
      showToast('error', res.message || 'Không thể đổi trạng thái mã giảm giá');
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    setIsDeleting(true);
    const res = await apiRequest<any>(`/admin/coupons/${deletingCoupon._id}`, {
      method: 'DELETE',
    });
    setIsDeleting(false);
    if (res.success) {
      const deletedCode = deletingCoupon.code;
      setCoupons((prev) => prev.filter((c) => c._id !== deletingCoupon._id));
      setDeletingCoupon(null);
      showToast('success', `Đã xóa mã giảm giá "${deletedCode}" thành công`);
    } else {
      showToast('error', res.message || 'Không thể xóa mã giảm giá');
    }
  };

  // Status calculation helpers
  const isExpired = (c: Coupon) => {
    if (!c.validUntil) return false;
    return new Date(c.validUntil).getTime() < Date.now();
  };

  const isExhausted = (c: Coupon) => {
    return (c.usedCount || 0) >= c.usageLimit;
  };

  // Metrics
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive && !isExpired(c) && !isExhausted(c)).length;
    const inactive = coupons.filter((c) => !c.isActive).length;
    const expiredOrExhausted = coupons.filter((c) => isExpired(c) || isExhausted(c)).length;
    return { total, active, inactive, expiredOrExhausted };
  }, [coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        if (!c.code.toLowerCase().includes(query)) return false;
      }

      if (typeFilter !== 'all' && c.discountType !== typeFilter) {
        return false;
      }

      if (statusFilter === 'active') {
        if (!c.isActive || isExpired(c) || isExhausted(c)) return false;
      } else if (statusFilter === 'inactive') {
        if (c.isActive) return false;
      } else if (statusFilter === 'expired') {
        if (!isExpired(c) && !isExhausted(c)) return false;
      }

      return true;
    });
  }, [coupons, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Ticket className="w-5 h-5" />
            </span>
            <span>Quản Lý Mã Giảm Giá (Coupons)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Thêm mới, cấu hình, tạm dừng và xóa mã voucher khuyến mãi trên toàn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCoupons}
            title="Tải lại danh sách"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#00b14f] hover:bg-[#009643] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mã Giảm Giá</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Tổng Mã Voucher</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500">
            <span>Toàn hệ thống</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-2xl">
          <p className="text-xs text-emerald-400 font-medium">Đang Hoạt Động</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400/80">
            <span>Người dùng có thể dùng ngay</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-rose-400 font-medium">Tạm Dừng / Tắt</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{stats.inactive}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500">
            <span>Chưa kích hoạt</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-amber-400 font-medium">Hết Hạn / Hết Lượt</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.expiredOrExhausted}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500">
            <span>Không còn hiệu lực</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã code voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đang tạm dừng</option>
            <option value="expired">Hết hạn / Hết lượt</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả hình thức</option>
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed_amount">Số tiền (VNĐ)</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Đang tải danh sách phiếu giảm giá...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 text-gray-500 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Không tìm thấy mã giảm giá phù hợp</p>
            <p className="text-xs text-gray-400">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bấm nút "Thêm Mã Giảm Giá" để tạo voucher đầu tiên'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Mã Voucher</th>
                  <th className="p-4">Mức Giảm</th>
                  <th className="p-4">Đơn Tối Thiểu</th>
                  <th className="p-4">Lượt Dùng</th>
                  <th className="p-4">Thời Gian Hiệu Lực</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCoupons.map((c) => {
                  const expired = isExpired(c);
                  const exhausted = isExhausted(c);
                  const validFromText = c.validFrom ? new Date(c.validFrom).toLocaleDateString('vi-VN') : '—';
                  const validUntilText = c.validUntil ? new Date(c.validUntil).toLocaleDateString('vi-VN') : '—';
                  const percentUsed = Math.min(100, Math.round(((c.usedCount || 0) / (c.usageLimit || 1)) * 100));

                  return (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                              {c.code}
                            </span>
                            {c.discountType === 'percentage' ? (
                              <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Giảm theo %">
                                <Percent className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Giảm số tiền cố định">
                                <Tag className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          {Array.isArray(c.applicableEvents) && c.applicableEvents.length > 0 ? (
                            <span className="text-[10px] text-gray-400">
                              Áp dụng: {c.applicableEvents.length} sự kiện
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Tất cả sự kiện</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-emerald-400 text-sm">
                            {c.discountType === 'percentage'
                              ? `Giảm ${c.discountValue}%`
                              : `Giảm ${(c.discountValue || 0).toLocaleString('vi-VN')} đ`}
                          </p>
                          {c.discountType === 'percentage' && c.maxDiscountAmount ? (
                            <p className="text-[10px] text-gray-400">
                              Tối đa: {c.maxDiscountAmount.toLocaleString('vi-VN')} đ
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="p-4 text-gray-300 font-medium">
                        {c.minOrderValue && c.minOrderValue > 0
                          ? `${c.minOrderValue.toLocaleString('vi-VN')} đ`
                          : '0 đ (Không giới hạn)'}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-white">{c.usedCount || 0}</span>
                            <span className="text-gray-500">/ {c.usageLimit}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed >= 100
                                  ? 'bg-rose-500'
                                  : percentUsed > 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-gray-300">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>{validFromText} → {validUntilText}</span>
                          </div>
                          {expired ? (
                            <span className="inline-block text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              Đã hết hạn
                            </span>
                          ) : exhausted ? (
                            <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              Hết lượt dùng
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Còn hiệu lực</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            c.isActive
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-800 text-gray-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                            }`}
                          />
                          <span>{c.isActive ? 'Đang bật' : 'Tạm tắt'}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Chỉnh sửa voucher"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCoupon(c)}
                            title="Xóa voucher"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      <AdminCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchCoupons();
          showToast(
            'success',
            editingCoupon
              ? `Cập nhật mã "${editingCoupon.code}" thành công!`
              : 'Tạo mã giảm giá mới thành công!'
          );
        }}
        coupon={editingCoupon}
        events={events}
      />

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa mã giảm giá</h3>
                <p className="text-xs text-gray-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs text-gray-300">
              <p>
                Mã voucher: <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{deletingCoupon.code}</span>
              </p>
              <p>
                Mức giảm: <span className="font-bold text-emerald-400">
                  {deletingCoupon.discountType === 'percentage'
                    ? `${deletingCoupon.discountValue}%`
                    : `${(deletingCoupon.discountValue || 0).toLocaleString('vi-VN')} đ`}
                </span>
              </p>
              <p>
                Lượt đã dùng: <span className="font-bold text-white">{deletingCoupon.usedCount || 0}</span> / {deletingCoupon.usageLimit}
              </p>
            </div>

            {deletingCoupon.usedCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Mã này đã được sử dụng <strong>{deletingCoupon.usedCount}</strong> lần. Việc xóa có thể ảnh hưởng đến lịch sử tra cứu của khách hàng.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Vĩnh Viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

