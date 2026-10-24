'use client';

import React, { useState } from 'react';

interface Props {
  currentYear: number;
  hourly: { hour: string; hourNum: number; views: number; uniqueVisitors: number }[];
  monthly: { month: string; monthLabel: string; views: number; uniqueVisitors: number }[];
  daily: { date: string; views: number; uniqueVisitors: number }[];
}

export const TrafficChartSection: React.FC<Props> = ({ currentYear, hourly = [], monthly = [], daily = [] }) => {
  const [tab, setTab] = useState<'today' | 'year' | 'daily'>('today');

  const maxH = Math.max(...hourly.map((h) => h.views), 1);
  const maxM = Math.max(...monthly.map((m) => m.views), 1);
  const maxD = Math.max(...daily.map((d) => d.views), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📊</span> Phổ Biến Thiên Lưu Lượng Truy Cập
          </h3>
          <p className="text-xs text-gray-400">Xem biến động lượt truy cập theo giờ hôm nay, 12 tháng hoặc 14 ngày</p>
        </div>
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['today', 'year', 'daily'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                tab === t ? 'bg-emerald-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'today' ? 'Hôm nay (24h)' : t === 'year' ? `Năm ${currentYear}` : '14 Ngày'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'today' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Hôm nay (00:00 - 23:00)</span>
            <span className="text-emerald-400 font-mono">Đỉnh: {maxH} lượt/h</span>
          </div>
          <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-2 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
            {hourly.map((h) => {
              const pct = Math.max(Math.round((h.views / maxH) * 100), h.views > 0 ? 8 : 2);
              return (
                <div key={h.hour} className="flex-1 min-w-[16px] flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {h.hour}: {h.views}
                  </div>
                  <div style={{ height: `${pct}%` }} className={`w-full rounded-t ${h.views > 0 ? 'bg-emerald-500' : 'bg-slate-800/40'}`} />
                  <span className="text-[9px] text-gray-400 mt-1 font-mono">{h.hourNum % 3 === 0 ? h.hour.slice(0, 2) : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'year' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>12 tháng năm {currentYear}</span>
            <span className="text-blue-400 font-mono">Đỉnh: {maxM} lượt/tháng</span>
          </div>
          <div className="h-44 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-4 bg-slate-950/60 rounded-xl border border-slate-800">
            {monthly.map((m) => {
              const pct = Math.max(Math.round((m.views / maxM) * 100), m.views > 0 ? 8 : 2);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {m.monthLabel}: {m.views}
                  </div>
                  <div style={{ height: `${pct}%` }} className={`w-full rounded-t ${m.views > 0 ? 'bg-blue-500' : 'bg-slate-800/40'}`} />
                  <span className="text-[10px] text-gray-300 mt-1 font-semibold">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'daily' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>14 ngày gần nhất</span>
            <span className="text-purple-400 font-mono">Đỉnh: {maxD} lượt/ngày</span>
          </div>
          <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
            {daily.map((d) => {
              const pct = Math.max(Math.round((d.views / maxD) * 100), d.views > 0 ? 8 : 2);
              return (
                <div key={d.date} className="flex-1 min-w-[26px] flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {d.date}: {d.views}
                  </div>
                  <div style={{ height: `${pct}%` }} className="w-full rounded-t bg-purple-500" />
                  <span className="text-[9px] text-gray-400 mt-1 font-mono">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
