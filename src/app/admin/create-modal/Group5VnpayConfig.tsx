'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  previewQrUrl: string;
}

export const Group5VnpayConfig: React.FC<Props> = ({ form, setForm, previewQrUrl }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
          5
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Nhóm 5 — Cổng Thanh Toán VNPAY Riêng Biệt
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">TMN Code (Mã Terminal Định Danh) *</label>
          <input
            type="text"
            required
            value={form.vnpayTmnCode}
            onChange={(e) => setForm({ ...form, vnpayTmnCode: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-cyan-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-gray-400">Tên đơn vị thụ hưởng *</label>
          <input
            type="text"
            required
            value={form.vnpayAccountName}
            onChange={(e) => setForm({ ...form, vnpayAccountName: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
        <img
          src={previewQrUrl}
          alt="QR Preview"
          className="w-12 h-12 rounded-lg bg-white p-0.5 border border-cyan-500/40 object-contain"
        />
        <div className="text-[10px] space-y-0.5">
          <p className="font-bold text-white">Xem trước mã QR thanh toán động VNPAY của sự kiện:</p>
          <p className="font-mono text-cyan-300">{form.vnpayTmnCode || 'VNPAY_SANDBOX'}</p>
        </div>
      </div>
    </div>
  );
};
