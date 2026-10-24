'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const Group3LocationConfig: React.FC<Props> = ({ form, setForm }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
          3
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Nhóm 3 — Địa Điểm Tổ Chức
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Tên địa điểm *</label>
          <input
            type="text"
            required
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
            placeholder="VD: Nhà hát Hòa Bình"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Địa chỉ cụ thể *</label>
          <input
            type="text"
            required
            value={form.venueAddress}
            onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
            placeholder="VD: 240 đường 3/2, Phường 12, Quận 10"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Tỉnh / Thành phố *</label>
          <select
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
          >
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Ninh Bình">Ninh Bình</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Khác">Tỉnh thành khác</option>
          </select>
        </div>
      </div>
    </div>
  );
};
