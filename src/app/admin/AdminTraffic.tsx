'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { TrafficOverviewCards, TrafficOverview } from './traffic/TrafficOverviewCards';
import { TrafficChartSection } from './traffic/TrafficChartSection';
import { TrafficBreakdowns } from './traffic/TrafficBreakdowns';

interface TrafficStatsData {
  overview: TrafficOverview;
  today: {
    views: number;
    uniqueVisitors: number;
    hourly: any[];
  };
  thisYear: {
    views: number;
    uniqueVisitors: number;
    year: number;
    monthly: any[];
  };
  daily: any[];
  topPages: any[];
  devices: any[];
  browsers: any[];
  recentVisits: any[];
}

export const AdminTraffic: React.FC = () => {
  const [data, setData] = useState<TrafficStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'real' | 'sample'>('all');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTraffic = async (targetFilter: 'all' | 'real' | 'sample' = filter) => {
    setLoading(true);
    const query = targetFilter !== 'all' ? `?filter=${targetFilter}` : '';
    const res = await apiRequest<TrafficStatsData>(`/admin/traffic-stats${query}`);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTraffic(filter);
  }, [filter]);

  const handleClearSampleData = async () => {
    if (!confirm('Bạn có chắc muốn xóa dữ liệu mẫu? Toàn bộ chỉ số sẽ chỉ hiển thị lưu lượng do bạn và người dùng thao tác.')) return;
    setActionLoading(true);
    try {
      const res = await apiRequest('/admin/traffic/clear-sample', { method: 'POST' });
      if (res.success) {
        setNotice({ type: 'success', message: 'Đã xóa dữ liệu mẫu thành công! Hệ thống hiện hiển thị 100% dữ liệu thao tác thật.' });
        await fetchTraffic(filter);
      } else {
        setNotice({ type: 'error', message: res.message || 'Không thể xóa dữ liệu mẫu' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Lỗi kết nối khi xóa dữ liệu mẫu' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedSampleData = async () => {
    setActionLoading(true);
    try {
      const res = await apiRequest('/admin/traffic/seed-sample', { method: 'POST' });
      if (res.success) {
        setNotice({ type: 'success', message: 'Đã tạo lại dữ liệu mẫu minh họa!' });
        await fetchTraffic(filter);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Đang tải dữ liệu phân tích lưu lượng truy cập...
      </div>
    );
  }


  return (
    <div className="space-y-7">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📈</span> Phân Tích & Thống Kê Lưu Lượng Truy Cập
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Ghi nhận thời gian thực mọi thao tác truy cập trên web. Tự động tách biệt và quản lý dữ liệu thực tế & mẫu.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-gray-400'}`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilter('real')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filter === 'real' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-gray-400 hover:text-emerald-400'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Chỉ Lưu Lượng Thật
            </button>
            <button
              onClick={() => setFilter('sample')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'sample' ? 'bg-slate-800 text-gray-300 font-bold' : 'text-gray-400'}`}
            >
              Dữ Liệu Mẫu
            </button>
          </div>

          {/* Clear Sample Button */}
          {(data?.overview?.sampleViews || 0) > 0 && (
            <button
              onClick={handleClearSampleData}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>🧹</span>
              <span>Xóa Dữ Liệu Mẫu</span>
            </button>
          )}

          {/* Seed Sample if no sample */}
          {(data?.overview?.sampleViews || 0) === 0 && (
            <button
              onClick={handleSeedSampleData}
              disabled={actionLoading}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-gray-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <span>🌱</span>
              <span>Tạo Thêm Mẫu</span>
            </button>
          )}

          <button
            onClick={() => fetchTraffic(filter)}
            disabled={loading || actionLoading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-gray-300 hover:text-white transition-all flex items-center gap-2 shrink-0 font-medium"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>{loading ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${notice.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border-red-500/30 text-red-300'}`}>
          <div className="flex items-center gap-2">
            <span>{notice.type === 'success' ? '✅' : '❌'}</span>
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-white font-bold text-sm">×</button>
        </div>
      )}


      {/* 3 Overview Cards: Daily, Yearly, Overall */}
      <TrafficOverviewCards overview={data?.overview} />

      {/* Interactive Charts: 24h Hourly Curve, 12-Month Year, 14-Day Daily */}
      <TrafficChartSection
        currentYear={data?.overview?.currentYear || new Date().getFullYear()}
        hourly={data?.today?.hourly || []}
        monthly={data?.thisYear?.monthly || []}
        daily={data?.daily || []}
      />

      {/* Breakdowns: Top Pages, Devices, Browsers & Live Stream */}
      <TrafficBreakdowns
        topPages={data?.topPages || []}
        devices={data?.devices || []}
        browsers={data?.browsers || []}
        recentVisits={data?.recentVisits || []}
      />
    </div>
  );
};
