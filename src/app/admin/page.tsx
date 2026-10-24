'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminEvents } from './AdminEvents';
import { AdminSeats } from './AdminSeats';
import { AdminOrders } from './AdminOrders';
import { AdminCoupons } from './AdminCoupons';
import { AdminTiers } from './AdminTiers';
import { AdminPayments } from './AdminPayments';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminTraffic } from './AdminTraffic';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { AdminBackupRestore } from './AdminBackupRestore';
import { recordClientTraffic } from '../../components/TrafficTracker';


type AdminTab =
  | 'dashboard'
  | 'traffic'
  | 'users'
  | 'events'
  | 'tiers'
  | 'seats'
  | 'orders'
  | 'payments'
  | 'coupons'
  | 'security'
  | 'backup'
  | 'audit-logs';


export default function AdminPortalPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'admin' && (user as any).role !== 'ADMIN') {
      alert('Bạn không có quyền truy cập vào Cổng Quản Trị Viên!');
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    setAuthError(null);
    const res = await apiRequest<any>('/admin/dashboard');
    if (res.success && res.data) {
      setStatsData(res.data);
    } else {
      if (res.statusCode === 401 || res.statusCode === 403) {
        setAuthError(
          'Phiên làm việc Quản trị viên đã hết hạn hoặc không đủ quyền. Vui lòng đăng nhập lại tài khoản Quản Trị Viên (admin@ticketbox.vn).'
        );
      } else {
        setAuthError(res.message || 'Không thể kết nối đến máy chủ.');
      }
    }
    setLoadingStats(false);
  };

  if (authLoading || (loadingStats && !statsData && !authError)) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm">Đang tải dữ liệu Trung Tâm Quản Trị...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: '📊' },
    { id: 'traffic', label: 'Lưu Lượng Web', icon: '📈' },
    { id: 'users', label: 'Quản Lý Khách Hàng', icon: '👥' },
    { id: 'events', label: 'Quản Lý Sự Kiện', icon: '🎪' },
    { id: 'tiers', label: 'Quản Lý Loại Vé', icon: '🎫' },
    { id: 'seats', label: 'Sơ Đồ Ghế & Khóa Ghế', icon: '🪑' },
    { id: 'orders', label: 'Đơn Hàng & Doanh Thu', icon: '📦' },
    { id: 'payments', label: 'Quản Lý Thanh Toán', icon: '💳' },
    { id: 'coupons', label: 'Mã Giảm Giá', icon: '🏷️' },
    { id: 'security', label: 'Bảo Mật Đăng Nhập', icon: '🔒' },
    { id: 'backup', label: 'Sao Lưu & Khôi Phục', icon: '💾' },
    { id: 'audit-logs', label: 'Nhật Ký Hệ Thống', icon: '🛡️' },
  ];


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xl">
              ⚡
            </span>
            TICK TICKET • Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Hệ thống quản trị và giám sát vận hành sàn vé sự kiện trực tuyến
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            title="Tải lại dữ liệu"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Làm mới</span>
          </button>
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-gray-300">
            Quản trị: <strong className="text-emerald-400">{user?.fullName}</strong>
          </span>
        </div>
      </div>

      {authError && (
        <div className="p-4 bg-amber-950/70 border border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200 text-xs shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-300">Thông báo truy cập quản trị viên</p>
              <p className="text-amber-200/90 mt-0.5">{authError}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl whitespace-nowrap shadow-md transition-all shrink-0"
          >
            Đăng Nhập Lại Admin
          </button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as AdminTab);
              recordClientTraffic(`/admin#${tab.id}`);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00b14f] text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900/60 hover:bg-slate-800 text-gray-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'dashboard' && (
          <AdminDashboard
            stats={statsData?.stats}
            recentOrders={statsData?.recentOrders || []}
            recentLogs={statsData?.recentLogs || []}
          />
        )}
        {activeTab === 'traffic' && <AdminTraffic />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'tiers' && <AdminTiers />}
        {activeTab === 'seats' && <AdminSeats />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'payments' && <AdminPayments />}
        {activeTab === 'coupons' && <AdminCoupons />}
        {activeTab === 'security' && <AdminSecuritySettings />}
        {activeTab === 'backup' && <AdminBackupRestore />}
        {activeTab === 'audit-logs' && <AdminAuditLogs />}
      </div>

    </div>
  );
}
