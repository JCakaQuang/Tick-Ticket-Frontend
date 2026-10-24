'use client';

import React from 'react';

export interface TrafficOverview {
  totalViews: number;
  totalUniqueVisitors: number;
  todayViews: number;
  todayUniqueVisitors: number;
  yearViews: number;
  yearUniqueVisitors: number;
  currentYear: number;
  realViews?: number;
  realUniqueVisitors?: number;
  sampleViews?: number;
  hasRealData?: boolean;
  filter?: string;
}

export const TrafficOverviewCards: React.FC<{ overview?: TrafficOverview }> = ({ overview }) => {
  return (
    <div className="space-y-4">
      {/* Sub-banner showing real traffic count status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-gray-300">
            Hệ thống đang ghi nhận thời gian thực:{' '}
            <strong className="text-emerald-400 font-bold">
              {(overview?.realViews || 0).toLocaleString('vi-VN')} lượt truy cập thực tế
            </strong>{' '}
            từ {(overview?.realUniqueVisitors || 0).toLocaleString('vi-VN')} IP.
          </span>
        </div>
        {(overview?.sampleViews || 0) > 0 && (
          <div className="text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-medium">
            ⚠️ Bao gồm {(overview?.sampleViews || 0).toLocaleString('vi-VN')} lượt dữ liệu mẫu minh họa
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* Today Card */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            HÔM NAY (DAILY)
          </span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            GMT+7
          </span>
        </div>
        <div className="text-3xl font-black text-white">
          {(overview?.todayViews || 0).toLocaleString('vi-VN')}
          <span className="text-xs font-normal text-gray-400 ml-1.5">lượt xem</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
          <span>Khách truy cập duy nhất:</span>
          <span className="font-bold text-emerald-300">
            {(overview?.todayUniqueVisitors || 0).toLocaleString('vi-VN')} IP
          </span>
        </div>
      </div>

      {/* This Year Card */}
      <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <span>📅</span>
            NĂM {overview?.currentYear || new Date().getFullYear()} (YEARLY)
          </span>
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            12 Tháng
          </span>
        </div>
        <div className="text-3xl font-black text-white">
          {(overview?.yearViews || 0).toLocaleString('vi-VN')}
          <span className="text-xs font-normal text-gray-400 ml-1.5">lượt xem</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
          <span>Khách truy cập trong năm:</span>
          <span className="font-bold text-blue-300">
            {(overview?.yearUniqueVisitors || 0).toLocaleString('vi-VN')} IP
          </span>
        </div>
      </div>

      {/* Overall Card */}
      <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <span>🌐</span>
            TOÀN THỜI GIAN (OVERALL)
          </span>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            Lũy kế
          </span>
        </div>
        <div className="text-3xl font-black text-white">
          {(overview?.totalViews || 0).toLocaleString('vi-VN')}
          <span className="text-xs font-normal text-gray-400 ml-1.5">tổng lượt</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
          <span>Tổng khách truy cập:</span>
          <span className="font-bold text-purple-300">
            {(overview?.totalUniqueVisitors || 0).toLocaleString('vi-VN')} IP
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};


