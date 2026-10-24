'use client';

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Group1BasicInfo } from './create-modal/Group1BasicInfo';
import { Group2TimeConfig } from './create-modal/Group2TimeConfig';
import { Group3LocationConfig } from './create-modal/Group3LocationConfig';
import { Group4TicketConfig } from './create-modal/Group4TicketConfig';
import { Group5VnpayConfig } from './create-modal/Group5VnpayConfig';
import { Group6RulesConfig } from './create-modal/Group6RulesConfig';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const fmt = (d: Date) => {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const AdminCreateEventModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'CONCERT',
    description: '',
    bannerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    saleStartTime: fmt(new Date()),
    saleEndTime: fmt(new Date(Date.now() + 14 * 86400000)),
    startTime: fmt(new Date(Date.now() + 14 * 86400000)),
    endTime: fmt(new Date(Date.now() + 14 * 86400000)),
    venueName: '',
    venueAddress: '',
    city: 'TP. Hồ Chí Minh',
    type: 'SEATED' as 'SEATED' | 'GA',
    rows: 4,
    cols: 6,
    tierName: 'Ghế VIP Khán Đài',
    tierPrice: 500000,
    gaCapacity: 500,
    vnpayTmnCode: 'VNPAY_HN_SANDBOX',
    vnpayAccountName: 'BAN TO CHUC SU KIEN',
    vnpayBankName: 'VNPAY - Vietcombank',
    vnpayQrUrl: '',
    maxTicketsPerUser: 5,
    termsAndConditions: 'Vé đã mua không hoàn lại trừ khi hoãn/hủy sự kiện.',
    isSpecial: false,
    specialBadge: '',
    isTrending: false,
    trendingRank: 1,
  });

  const previewQrUrl =
    form.vnpayQrUrl.trim() ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VNPAYQR*${form.vnpayTmnCode || 'VNPAY'}*${encodeURIComponent(form.title || 'SU_KIEN')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('Vui lòng nhập tên sự kiện');
    if (!form.description.trim()) return alert('Vui lòng nhập mô tả');
    if (!form.venueName.trim()) return alert('Vui lòng nhập tên địa điểm');
    if (!form.venueAddress.trim()) return alert('Vui lòng nhập địa chỉ');

    if (new Date(form.saleEndTime) <= new Date(form.saleStartTime)) {
      return alert('Thời gian đóng bán vé phải sau thời gian mở bán!');
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      return alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
    }

    setCreating(true);
    const slug =
      form.slug.trim() ||
      form.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      ...form,
      slug,
      vnpayTmnCode: form.vnpayTmnCode || `VNPAY_${slug.toUpperCase().replace(/-/g, '_')}`,
      vnpayQrUrl: previewQrUrl,
      rows: Number(form.rows),
      cols: Number(form.cols),
      tierPrice: Number(form.tierPrice),
      capacity: Number(form.gaCapacity),
      maxTicketsPerUser: Number(form.maxTicketsPerUser),
      status: 'PUBLISHED',
    };

    const res = await apiRequest<any>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setCreating(false);
    if (res.success) {
      alert('Đã tạo sự kiện chuẩn 6 nhóm thành công!');
      onSuccess();
      onClose();
    } else {
      alert(res.message || 'Lỗi khi tạo sự kiện');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>➕ Tạo Sự Kiện Mới (Chuẩn 6 Nhóm Thông Tin)</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px]">
                Admin
              </span>
            </h3>
            <p className="text-xs text-gray-400">Thông tin • Thời gian • Địa điểm • Kiểu vé • VNPAY • Quy định</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg px-2">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <Group1BasicInfo form={form} setForm={setForm} />
          <Group2TimeConfig form={form} setForm={setForm} />
          <Group3LocationConfig form={form} setForm={setForm} />
          <Group4TicketConfig form={form} setForm={setForm} />
          <Group5VnpayConfig form={form} setForm={setForm} previewQrUrl={previewQrUrl} />
          <Group6RulesConfig form={form} setForm={setForm} />

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <span>🌟</span>
              <span>Cấu hình Trang Chủ (Sự Kiện Đặc Biệt & Xu Hướng)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSpecial}
                    onChange={(e) => setForm({ ...form, isSpecial: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">✨ Đặt làm Sự kiện đặc biệt</span>
                </label>
                {form.isSpecial && (
                  <input
                    type="text"
                    placeholder="Huy hiệu (VD: Live Show, Kịch Nói, Concert...)"
                    value={form.specialBadge}
                    onChange={(e) => setForm({ ...form, specialBadge: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  />
                )}
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isTrending}
                    onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-white">🔥 Đặt làm Sự kiện xu hướng</span>
                </label>
                {form.isTrending && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Thứ hạng (Rank):</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={form.trendingRank}
                      onChange={(e) => setForm({ ...form, trendingRank: Number(e.target.value) })}
                      className="w-16 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white text-center"
                    />
                  </div>
                )}
              </div>
            </div>
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
              disabled={creating}
              className="px-6 py-2 bg-[#005baa] hover:bg-[#004887] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {creating ? 'Đang tạo...' : 'Tạo Sự Kiện Chuẩn 6 Nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
