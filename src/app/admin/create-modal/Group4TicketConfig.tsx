'use client';

import React from 'react';

interface Props {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const Group4TicketConfig: React.FC<Props> = ({ form, setForm }) => {
  return (
    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
            4
          </span>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Nhóm 4 — Kiểu Vé & Sơ Đồ Ghế
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label
          onClick={() => setForm({ ...form, type: 'SEATED', tierName: 'Ghế VIP Khán Đài' })}
          className={`p-3 rounded-xl border cursor-pointer ${
            form.type === 'SEATED' ? 'border-blue-500 bg-blue-950/40' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.type === 'SEATED'}
              onChange={() => setForm({ ...form, type: 'SEATED', tierName: 'Ghế VIP Khán Đài' })}
              className="accent-blue-500"
            />
            <span className="text-xs font-bold text-white">💺 Có Sơ Đồ Ghế (Seated)</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Chọn vị trí theo Hàng và Ghế</p>
        </label>

        <label
          onClick={() => setForm({ ...form, type: 'GA', tierName: 'Vé Đứng Fanzone (GA)' })}
          className={`p-3 rounded-xl border cursor-pointer ${
            form.type === 'GA' ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.type === 'GA'}
              onChange={() => setForm({ ...form, type: 'GA', tierName: 'Vé Đứng Fanzone (GA)' })}
              className="accent-emerald-500"
            />
            <span className="text-xs font-bold text-white">🧍 Vé Đứng (GA)</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Không ghế, theo sức chứa</p>
        </label>
      </div>

      {form.type === 'SEATED' ? (
        <div className="grid grid-cols-4 gap-2 pt-2">
          <div>
            <label className="text-[10px] text-gray-400">Số hàng ghế</label>
            <input
              type="number"
              min={1}
              max={15}
              value={form.rows}
              onChange={(e) => setForm({ ...form, rows: Math.max(1, Math.min(15, Number(e.target.value) || 1)) })}
              className="w-full text-center bg-slate-900 border border-slate-700 rounded py-1 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Số ghế/hàng</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.cols}
              onChange={(e) => setForm({ ...form, cols: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
              className="w-full text-center bg-slate-900 border border-slate-700 rounded py-1 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Giá vé (VNĐ)</label>
            <input
              type="number"
              step={10000}
              value={form.tierPrice}
              onChange={(e) => setForm({ ...form, tierPrice: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Tên hạng vé</label>
            <input
              type="text"
              value={form.tierName}
              onChange={(e) => setForm({ ...form, tierName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div>
            <label className="text-[10px] text-gray-400">Sức chứa tối đa</label>
            <input
              type="number"
              min={10}
              value={form.gaCapacity}
              onChange={(e) => setForm({ ...form, gaCapacity: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Giá vé đứng (VNĐ)</label>
            <input
              type="number"
              step={10000}
              value={form.tierPrice}
              onChange={(e) => setForm({ ...form, tierPrice: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Tên hạng vé đứng</label>
            <input
              type="text"
              value={form.tierName}
              onChange={(e) => setForm({ ...form, tierName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
