'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest<any[]>(`/admin/users${query}`);
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    const res = await apiRequest<any>(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } else {
      alert(res.message || 'Không thể thay đổi trạng thái người dùng.');
    }
    setActionLoading(null);
  };

  const handleUnlockLogin = async (userId: string) => {
    setActionLoading(`unlock-${userId}`);
    const res = await apiRequest<any>(`/admin/users/${userId}/unlock-login`, {
      method: 'PUT',
    });
    if (res.success) {
      alert(res.message || 'Đã mở khóa đăng nhập thành công!');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, failedLoginAttempts: 0, lockedUntil: null } : u))
      );
    } else {
      alert(res.message || 'Không thể mở khóa đăng nhập.');
    }
    setActionLoading(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Quản Lý Khách Hàng</h2>
          <p className="text-xs text-gray-400">
            Xem danh sách tài khoản, khóa hoặc mở khóa tài khoản (Mật khẩu được bảo mật tuyệt đối)
          </p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Đang tải danh sách khách hàng...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">Không tìm thấy người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Số Điện Thoại</th>
                  <th className="p-4">Vai Trò</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-white">{u.fullName}</td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4 text-gray-400">{u.phoneNumber || 'N/A'}</td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-slate-800 text-gray-300 font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>

                        {u.lockedUntil && new Date(u.lockedUntil) > new Date() && (
                          <div className="mt-1 text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                            <span>🔒 Tạm khóa đến:</span>
                            <span>{new Date(u.lockedUntil).toLocaleTimeString('vi-VN')}</span>
                          </div>
                        )}

                        {Boolean(u.failedLoginAttempts && u.failedLoginAttempts > 0) && (
                          <div className="mt-0.5 text-[10px] text-gray-400">
                            Sai MK: <span className="text-amber-400 font-mono font-bold">{u.failedLoginAttempts}</span> lần
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' ? (
                        <div className="flex items-center justify-end gap-2">
                          {((u.lockedUntil && new Date(u.lockedUntil) > new Date()) || (u.failedLoginAttempts && u.failedLoginAttempts > 0)) && (
                            <button
                              disabled={actionLoading === `unlock-${u._id}`}
                              onClick={() => handleUnlockLogin(u._id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 transition-colors"
                              title="Đặt lại số lần nhập sai và mở khóa ngay"
                            >
                              {actionLoading === `unlock-${u._id}` ? 'Đang mở...' : '🔓 Mở khóa MK'}
                            </button>
                          )}
                          <button
                            disabled={actionLoading === u._id}
                            onClick={() => handleToggleStatus(u._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.isActive
                                ? 'bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/50'
                                : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50'
                            }`}
                          >
                            {actionLoading === u._id
                              ? 'Đang xử lý...'
                              : u.isActive
                              ? 'Khóa tài khoản'
                              : 'Mở kích hoạt'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">Quản trị viên</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
