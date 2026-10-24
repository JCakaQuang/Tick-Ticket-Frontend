'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Coupon } from '../../types';
import { X, Percent, Tag, Calendar, AlertCircle, Check, Sparkles } from 'lucide-react';

interface AdminCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  coupon: Coupon | null;
  events: Array<{ _id: string; title: string; slug?: string }>;
}

const formatForDateTimeLocal = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const AdminCouponModal: React.FC<AdminCouponModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  coupon,
  events,
}) => {
  const isEdit = Boolean(coupon);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: 10,
    maxDiscountAmount: null as number | null,
    minOrderValue: 0,
    usageLimit: 100,
    validFrom: formatForDateTimeLocal(new Date()),
    validUntil: formatForDateTimeLocal(new Date(Date.now() + 30 * 86400000)),
    applicableEvents: [] as string[],
    isActive: true,
  });

  const [allEvents, setAllEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      const eventIds = Array.isArray(coupon.applicableEvents)
        ? coupon.applicableEvents.map((e: any) => (typeof e === 'string' ? e : e._id))
        : [];
      setForm({
        code: coupon.code || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue ?? 10,
        maxDiscountAmount: coupon.maxDiscountAmount ?? null,
        minOrderValue: coupon.minOrderValue ?? 0,
        usageLimit: coupon.usageLimit ?? 100,
        validFrom: formatForDateTimeLocal(coupon.validFrom || new Date()),
        validUntil: formatForDateTimeLocal(coupon.validUntil || new Date(Date.now() + 30 * 86400000)),
        applicableEvents: eventIds,
        isActive: coupon.isActive ?? true,
      });
      setAllEvents(eventIds.length === 0);
    } else {
      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: null,
        minOrderValue: 0,
        usageLimit: 100,
        validFrom: formatForDateTimeLocal(new Date()),
        validUntil: formatForDateTimeLocal(new Date(Date.now() + 30 * 86400000)),
        applicableEvents: [],
        isActive: true,
      });
      setAllEvents(true);
    }
    setError(null);
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Vui lòng nhập mã code giảm giá');
      return;
    }

    if (form.discountValue <= 0) {
      setError('Mức giảm giá phải lớn hơn 0');
      return;
    }

    if (form.discountType === 'percentage' && form.discountValue > 100) {
      setError('Giảm giá phần trăm không được vượt quá 100%');
      return;
    }

    if (form.usageLimit < 1) {
      setError('Giới hạn sử dụng tối thiểu là 1 lượt');
      return;
    }

    if (new Date(form.validUntil) <= new Date(form.validFrom)) {
      setError('Thời hạn kết thúc phải sau thời gian bắt đầu hiệu lực');
      return;
    }

    setSubmitting(true);

    const payload: any = {
      code: cleanCode,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: Number(form.usageLimit),
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      applicableEvents: allEvents ? [] : form.applicableEvents,
      isActive: form.isActive,
    };

    if (form.discountType === 'percentage') {
      payload.maxDiscountAmount =
        form.maxDiscountAmount && Number(form.maxDiscountAmount) > 0
          ? Number(form.maxDiscountAmount)
          : null;
    } else {
      payload.maxDiscountAmount = null;
    }

    const endpoint = isEdit ? `/admin/coupons/${coupon!._id}` : '/admin/coupons';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiRequest<any>(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || 'Không thể lưu mã giảm giá. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const toggleEvent = (eventId: string) => {
    setForm((prev) => {
      const exists = prev.applicableEvents.includes(eventId);
      return {
        ...prev,
        applicableEvents: exists
          ? prev.applicableEvents.filter((id) => id !== eventId)
          : [...prev.applicableEvents, eventId],
      };
    });
  };

  const sampleOrderAmount = 500000;
  let sampleDiscount = 0;
  if (form.discountType === 'percentage') {
    sampleDiscount = Math.round((sampleOrderAmount * (form.discountValue || 0)) / 100);
    if (form.maxDiscountAmount && Number(form.maxDiscountAmount) > 0 && sampleDiscount > Number(form.maxDiscountAmount)) {
      sampleDiscount = Number(form.maxDiscountAmount);
    }
  } else {
    sampleDiscount = Number(form.discountValue) || 0;
  }
  const sampleFinal = Math.max(0, sampleOrderAmount - sampleDiscount);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {form.discountType === 'percentage' ? <Percent className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isEdit ? 'Chỉnh Sửa Mã Giảm Giá' : 'Thêm Phiếu Giảm Giá Mới'}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                  {isEdit ? coupon?.code : 'VOUCHER'}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {isEdit ? 'Cập nhật điều kiện và thời hạn áp dụng voucher' : 'Tạo mã voucher khuyến mãi áp dụng cho thanh toán đặt vé'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Xem trước Voucher hiển thị
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-white tracking-widest bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
                  {form.code.trim().toUpperCase() || 'MÃ_CODE'}
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {form.discountType === 'percentage'
                    ? `Giảm ${form.discountValue || 0}%`
                    : `Giảm ${(form.discountValue || 0).toLocaleString('vi-VN')} đ`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Đơn tối thiểu: {Number(form.minOrderValue) > 0 ? `${Number(form.minOrderValue).toLocaleString('vi-VN')} đ` : '0 đ'}
                {form.discountType === 'percentage' && form.maxDiscountAmount
                  ? ` • Tối đa: ${Number(form.maxDiscountAmount).toLocaleString('vi-VN')} đ`
                  : ''}
              </p>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-gray-300 space-y-0.5 sm:text-right shrink-0">
              <p className="text-gray-400">Thử nghiệm đơn 500.000 đ:</p>
              <p className="text-rose-400 font-semibold">- {sampleDiscount.toLocaleString('vi-VN')} đ</p>
              <p className="text-emerald-400 font-bold">Thanh toán: {sampleFinal.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <span>Mã Code Voucher *</span>
                <span className="text-gray-500 font-normal text-[11px]">(Tự động viết hoa)</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: WELCOME2026, SUMMER50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Hình Thức Giảm Giá *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: 'percentage' })}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    form.discountType === 'percentage'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Phần Trăm (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: 'fixed_amount' })}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    form.discountType === 'fixed_amount'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Số Tiền (VNĐ)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                {form.discountType === 'percentage' ? 'Tỷ Lệ Giảm (%):' : 'Số Tiền Giảm (VNĐ):'} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={form.discountType === 'percentage' ? 100 : 100000000}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-bold pr-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {form.discountType === 'percentage' ? '%' : 'VNĐ'}
                </span>
              </div>
            </div>

            {form.discountType === 'percentage' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span>Mức Giảm Tối Đa (VNĐ)</span>
                  <span className="text-[11px] text-gray-500 font-normal">Trống = Không giới hạn</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    placeholder="VD: 50000"
                    value={form.maxDiscountAmount ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxDiscountAmount: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none pr-12"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VNĐ</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Số Tiền Áp Dụng Cố Định</label>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-bold">
                  Giảm trực tiếp {(form.discountValue || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Giá Trị Đơn Tối Thiểu (VNĐ)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none pr-12"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VNĐ</span>
              </div>
              <p className="text-[11px] text-gray-500">Đơn hàng cần đạt mức tiền này để áp dụng coupon</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Tổng Lượt Dùng Tối Đa *</span>
                {isEdit && coupon && (
                  <span className="text-[11px] text-emerald-400 font-normal">
                    Đã dùng: {coupon.usedCount || 0} lượt
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                min={isEdit && coupon ? Math.max(1, coupon.usedCount || 0) : 1}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <p className="text-[11px] text-gray-500">Số lần mã có thể được áp dụng trên toàn hệ thống</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Bắt Đầu Hiệu Lực *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Hết Hạn Hiệu Lực *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">Phạm Vi Áp Dụng Sự Kiện</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-300">
                  <input
                    type="radio"
                    name="eventScope"
                    checked={allEvents}
                    onChange={() => {
                      setAllEvents(true);
                      setForm((prev) => ({ ...prev, applicableEvents: [] }));
                    }}
                    className="accent-emerald-500"
                  />
                  <span>Tất cả sự kiện</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-300">
                  <input
                    type="radio"
                    name="eventScope"
                    checked={!allEvents}
                    onChange={() => setAllEvents(false)}
                    className="accent-emerald-500"
                  />
                  <span>Chỉ định sự kiện</span>
                </label>
              </div>
            </div>

            {!allEvents && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                {events.length === 0 ? (
                  <p className="text-xs text-gray-500">Chưa có sự kiện nào trong hệ thống.</p>
                ) : (
                  events.map((ev) => {
                    const selected = form.applicableEvents.includes(ev._id);
                    return (
                      <div
                        key={ev._id}
                        onClick={() => toggleEvent(ev._id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          selected
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-white'
                            : 'bg-slate-900/50 hover:bg-slate-800 text-gray-400'
                        }`}
                      >
                        <span className="truncate pr-2 font-medium">{ev.title}</span>
                        {selected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
            <div>
              <p className="text-xs font-semibold text-white">Trạng thái kích hoạt</p>
              <p className="text-[11px] text-gray-400">Cho phép người dùng nhập và áp dụng mã voucher ngay</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#00b14f] hover:bg-[#009643] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEdit ? 'Lưu Thay Đổi' : 'Tạo Mã Giảm Giá'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
