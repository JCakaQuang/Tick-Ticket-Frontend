'use client';

import React from 'react';

interface Props {
  topPages?: { path: string; views: number; percentage: number }[];
  devices?: { type: string; label: string; views: number; percentage: number }[];
  browsers?: { name: string; views: number; percentage: number }[];
  recentVisits?: any[];
}

export const TrafficBreakdowns: React.FC<Props> = ({
  topPages = [],
  devices = [],
  browsers = [],
  recentVisits = [],
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">📄 Top Trang Xem Nhiều</h4>
            <span className="text-[10px] text-gray-400">Lượt</span>
          </div>
          <div className="space-y-2.5">
            {topPages.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-300 truncate max-w-[170px]">{p.path}</span>
                  <span className="font-bold text-emerald-400">{p.views}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-sm text-white">💻 Phân Bổ Thiết Bị</h4>
          <div className="space-y-2.5">
            {devices.map((d, idx) => (
              <div key={idx} className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{d.label}</span>
                  <span className="text-cyan-400 font-bold">{d.percentage}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-sm text-white">🌐 Trình Duyệt</h4>
          <div className="space-y-2.5">
            {browsers.map((b, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{b.name}</span>
                  <span className="text-amber-400 font-bold">{b.percentage}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Visits */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <span>🕒</span> Các Phiên Truy Cập Mới Nhất
          </h4>
          <span className="text-[11px] text-gray-400">Tự động gắn nhãn phiên thực tế & mẫu</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-950/80 text-gray-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2.5">Thời Gian</th>
                <th className="p-2.5">Đường Dẫn</th>
                <th className="p-2.5">IP</th>
                <th className="p-2.5">Thiết Bị</th>
                <th className="p-2.5">Nguồn</th>
                <th className="p-2.5 text-center">Phân Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {recentVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Chưa có nhật ký truy cập nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                recentVisits.map((v, i) => (
                  <tr key={i} className={`hover:bg-slate-800/30 ${!v.isSample ? 'bg-emerald-950/10' : ''}`}>
                    <td className="p-2.5 text-gray-400">
                      {new Date(v.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}{' '}
                      {new Date(v.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                    <td className="p-2.5 text-emerald-400 font-bold truncate max-w-[180px]">{v.path}</td>
                    <td className="p-2.5 text-cyan-400">{v.ipAddress}</td>
                    <td className="p-2.5 text-gray-300 capitalize">{v.deviceType} • {v.browser}</td>
                    <td className="p-2.5 text-gray-400 truncate max-w-[120px]">{v.referrer || 'Trực tiếp'}</td>
                    <td className="p-2.5 text-center">
                      {!v.isSample ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 shadow-sm shadow-emerald-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Thực tế
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-gray-400 bg-slate-800/80 border border-slate-700/60">
                          Dữ liệu mẫu
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
