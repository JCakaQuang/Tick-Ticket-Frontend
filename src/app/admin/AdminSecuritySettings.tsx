'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminSecuritySettings: React.FC = () => {
  const [maxAttempts, setMaxAttempts] = useState<number>(5);
  const [lockoutMinutes, setLockoutMinutes] = useState<number>(15);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/admin/settings/security');
    if (res.success && res.data) {
      setMaxAttempts(res.data.maxFailedLoginAttempts ?? 5);
      setLockoutMinutes(res.data.lockoutDurationMinutes ?? 15);
      setUpdatedAt(res.data.updatedAt || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const res = await apiRequest<any>('/admin/settings/security', {
      method: 'PUT',
      body: JSON.stringify({
        maxFailedLoginAttempts: Number(maxAttempts),
        lockoutDurationMinutes: Number(lockoutMinutes),
      }),
    });

    if (res.success) {
      setMsg({ type: 'ok', text: 'Cập nhật cấu hình bảo mật thành công!' });
      if (res.data?.settings?.updatedAt) setUpdatedAt(res.data.settings.updatedAt);
    } else {
      setMsg({ type: 'err', text: res.message || 'Không thể lưu cài đặt.' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🛡️</span> Cài Đặt Giới Hạn Đăng Nhập & Bảo Mật
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Thiết lập số lần nhập sai mật khẩu tối đa và thời gian khóa tạm thời.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'ok'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
          }`}
        >
          <span>{msg.type === 'ok' ? '✅' : '❌'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-200 flex justify-between">
              <span>Số lần nhập sai tối đa</span>
              <span className="text-emerald-400 font-mono font-bold">{maxAttempts} lần</span>
            </label>
            <input
              type="number"
              min="1"
              max="20"
              required
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
            />
            <p className="text-[11px] text-gray-500">Giới hạn 1 đến 20 lần trước khi tạm khóa.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-200 flex justify-between">
              <span>Thời gian tạm khóa (phút)</span>
              <span className="text-cyan-400 font-mono font-bold">{lockoutMinutes} phút</span>
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              required
              value={lockoutMinutes}
              onChange={(e) => setLockoutMinutes(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
            />
            <p className="text-[11px] text-gray-500">Thời gian khóa từ 1 đến 1440 phút (24h).</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs text-gray-400">
          <p className="font-semibold text-gray-300">ℹ️ Cơ Chế Bảo Vệ:</p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>Cảnh báo số lần còn lại cho người dùng khi nhập sai mật khẩu.</li>
            <li>Vượt quá {maxAttempts} lần sai, tài khoản tự động khóa {lockoutMinutes} phút.</li>
            <li>Admin có thể mở khóa ngay trong mục "Quản Lý Khách Hàng".</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 gap-4">
          <span className="text-[11px] text-gray-500">
            {updatedAt ? `Cập nhật: ${new Date(updatedAt).toLocaleString('vi-VN')}` : 'Cấu hình mặc định'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || saving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow"
            >
              {saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
