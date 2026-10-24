'use client';

import React from 'react';

export const AdminDashboard: React.FC<{ stats: any; recentOrders: any[]; recentLogs: any[] }> = ({
  stats,
  recentOrders,
  recentLogs,
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 uppercase">Tổng Doanh Thu</span>
          <div className="text-2xl font-black text-emerald-400">
            {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-gray-500">{(stats?.confirmedOrdersCount ?? stats?.paidOrdersCount ?? 0)} đơn thanh toán</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 uppercase">Khách Hàng</span>
          <div className="text-2xl font-black text-cyan-400">{stats?.totalUsers || 0}</div>
          <p className="text-[11px] text-gray-500">Tài khoản khách hàng</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 uppercase">Sự Kiện Đang Chạy</span>
          <div className="text-2xl font-black text-amber-400">{stats?.totalEvents || 0}</div>
          <p className="text-[11px] text-gray-500">Concert & Sự kiện</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 uppercase">Vé Phát Hành</span>
          <div className="text-2xl font-black text-purple-400">{stats?.totalTicketsIssued || 0}</div>
          <p className="text-[11px] text-gray-500">E-Ticket QR ký số</p>
        </div>
      </div>

      {/* Traffic Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-400 font-semibold uppercase">Lưu Lượng Hôm Nay</span>
            <div className="text-xl font-bold text-white">{(stats?.todayTrafficViews || 0).toLocaleString('vi-VN')} views</div>
            <p className="text-[10px] text-gray-400">{(stats?.todayTrafficVisitors || 0)} khách duy nhất</p>
          </div>
          <span className="text-2xl">📈</span>
        </div>

        <div className="bg-gradient-to-r from-blue-950/30 to-slate-900 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-400 font-semibold uppercase">Lưu Lượng Trong Năm</span>
            <div className="text-xl font-bold text-white">{(stats?.yearTrafficViews || 0).toLocaleString('vi-VN')} views</div>
            <p className="text-[10px] text-gray-400">Năm hiện tại</p>
          </div>
          <span className="text-2xl">📅</span>
        </div>

        <div className="bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-400 font-semibold uppercase">Tổng Lưu Lượng Toàn Sàn</span>
            <div className="text-xl font-bold text-white">{(stats?.totalTrafficViews || 0).toLocaleString('vi-VN')} views</div>
            <p className="text-[10px] text-gray-400">Toàn thời gian</p>
          </div>
          <span className="text-2xl">🌐</span>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white">Đơn Hàng Gần Đây</h3>
          <div className="space-y-2.5">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <p className="font-bold text-white">{o.orderCode}</p>
                    <p className="text-gray-400 truncate max-w-[200px]">{o.userId?.fullName || 'Khách'} • {o.eventId?.title || 'Sự kiện'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{(o.totalAmount || o.subtotal || 0).toLocaleString('vi-VN')} đ</p>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{o.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">Chưa có đơn hàng nào.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white">Hoạt Động Hệ Thống (Audit Logs)</h3>
          <div className="space-y-2.5">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.slice(0, 6).map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <p className="font-mono text-cyan-400 font-semibold">{log.action}</p>
                    <p className="text-[11px] text-gray-500">Bởi: {log.userId?.fullName || 'Hệ thống'}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">Chưa có nhật ký hoạt động.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
