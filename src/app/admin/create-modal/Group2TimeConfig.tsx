'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const Group2TimeConfig: React.FC<Props> = ({ form, setForm }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
            2
          </span>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Nhóm 2 — Thời Gian Sự Kiện & Mở Bán
          </h4>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Nhập trực tiếp mốc thời gian thực tế
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mở bán / Đóng bán */}
        <div className="space-y-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span>🎟️</span>
            <span>Thời Gian Bán Vé</span>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-gray-400">Thời gian mở bán vé *</label>
            <input
              type="datetime-local"
              required
              value={form.saleStartTime}
              onChange={(e) => setForm({ ...form, saleStartTime: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-gray-400">Thời gian đóng bán vé *</label>
            <input
              type="datetime-local"
              required
              value={form.saleEndTime}
              onChange={(e) => setForm({ ...form, saleEndTime: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Diễn ra sự kiện */}
        <div className="space-y-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
            <span>🎪</span>
            <span>Thời Gian Diễn Ra Sự Kiện</span>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-gray-400">Bắt đầu sự kiện *</label>
            <input
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-gray-400">Kết thúc sự kiện *</label>
            <input
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
