'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const Group1BasicInfo: React.FC<Props> = ({ form, setForm }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
          1
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Nhóm 1 — Thông Tin Cơ Bản
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-300">Tên sự kiện *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
              setForm({ ...form, title, slug });
            }}
            placeholder="VD: Hà Anh Tuấn - Sketch A Rose"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Danh mục *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="CONCERT">🎤 Live Concert / Âm nhạc</option>
            <option value="THEATER">🎭 Sân Khấu & Kịch</option>
            <option value="SPORTS">⚽ Thể Thao</option>
            <option value="SEMINAR">🎓 Hội Thảo</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-300">Mô tả sự kiện *</label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Giới thiệu nội dung sự kiện, dàn nghệ sĩ, điểm nổi bật..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-300">Ảnh Banner Ngang (16:9) *</label>
          <input
            type="url"
            required
            value={form.bannerUrl}
            onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-300">Ảnh Đại Diện / Poster *</label>
          <input
            type="url"
            value={form.posterUrl}
            onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
          />
        </div>
      </div>
    </div>
  );
};
