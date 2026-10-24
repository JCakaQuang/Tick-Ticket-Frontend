'use client';

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';

interface AdminVnpayModalProps {
  event: any;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export const AdminVnpayModal: React.FC<AdminVnpayModalProps> = ({ event, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const code = event.vnpayTmnCode || `VNPAY_${event.slug?.replace(/-/g, '_')?.toUpperCase() || 'EVENT'}`;
  const [form, setForm] = useState({
    vnpayTmnCode: code,
    vnpayAccountName: event.vnpayAccountName || `BAN TO CHUC ${event.title?.toUpperCase() || ''}`,
    vnpayBankName: event.vnpayBankName || 'VNPAY - Vietcombank',
    vnpayQrUrl: event.vnpayQrUrl || '',
  });

  const previewQrUrl =
    form.vnpayQrUrl.trim() ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VNPAYQR*${form.vnpayTmnCode}*${encodeURIComponent(event.title)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalUrl = previewQrUrl;
    const res = await apiRequest<any>(`/admin/events/${event._id}`, {
      method: 'PUT',
      body: JSON.stringify({
        vnpayTmnCode: form.vnpayTmnCode,
        vnpayAccountName: form.vnpayAccountName,
        vnpayBankName: form.vnpayBankName,
        vnpayQrUrl: finalUrl,
      }),
    });
    setSaving(false);

    if (res.success) {
      alert('Đã cập nhật mã QR VNPAY riêng cho sự kiện thành công!');
      onSuccess({ ...event, ...form, vnpayQrUrl: finalUrl });
      onClose();
    } else {
      alert(res.message || 'Lỗi cập nhật mã QR VNPAY');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>⚙️ Điều Chỉnh Mã VNPAY-QR</span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px]">
                Admin
              </span>
            </h3>
            <p className="text-xs text-gray-400 truncate max-w-xs">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-blue-900/40">
            <img
              src={previewQrUrl}
              alt="VNPAY QR Preview"
              className="w-20 h-20 rounded bg-white p-1 border border-blue-500/50 object-contain shadow"
            />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-white">Xem Trước QR Thanh Toán</p>
              <p className="text-[11px] text-gray-400">Khách hàng sẽ quét mã này tại Checkout.</p>
              <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] rounded font-bold">
                {form.vnpayTmnCode}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Mã Terminal / TMN Code *</label>
            <input
              type="text"
              required
              value={form.vnpayTmnCode}
              onChange={(e) => setForm({ ...form, vnpayTmnCode: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-blue-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Tên đơn vị thụ hưởng *</label>
            <input
              type="text"
              required
              value={form.vnpayAccountName}
              onChange={(e) => setForm({ ...form, vnpayAccountName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Ngân hàng / Cổng VNPAY</label>
            <input
              type="text"
              value={form.vnpayBankName}
              onChange={(e) => setForm({ ...form, vnpayBankName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">URL ảnh QR thanh toán VNPAY (Tùy chọn)</label>
            <input
              type="text"
              value={form.vnpayQrUrl}
              onChange={(e) => setForm({ ...form, vnpayQrUrl: e.target.value })}
              placeholder="Để trống để tự sinh theo TMN Code"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#005baa] hover:bg-[#004887] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Mã VNPAY QR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
