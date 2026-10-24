'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const Group6RulesConfig: React.FC<Props> = ({ form, setForm }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
          6
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Nhóm 6 — Điều Khoản & Giới Hạn Vé
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Giới hạn vé / tài khoản *</label>
          <select
            value={form.maxTicketsPerUser}
            onChange={(e) => setForm({ ...form, maxTicketsPerUser: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value={1}>Tối đa 1 vé / người</option>
            <option value={2}>Tối đa 2 vé / người</option>
            <option value={4}>Tối đa 4 vé / người</option>
            <option value={5}>Tối đa 5 vé / người (Tiêu chuẩn)</option>
          </select>
          <span className="text-[10px] text-gray-500">Chống đầu cơ, phe vé</span>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-300">Quy định & Điều khoản tham gia</label>
          <textarea
            rows={2}
            value={form.termsAndConditions}
            onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
            placeholder="Quy định độ tuổi, thời gian check-in trước giờ diễn, đồ dùng được phép mang theo..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};
