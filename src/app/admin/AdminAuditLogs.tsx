'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/admin/audit-logs?limit=100');
    if (res.success && Array.isArray(res.data)) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Nhật Ký Hoạt Động Hệ Thống (Audit Logs) • UC24</h2>
          <p className="text-xs text-gray-400">
            Ghi nhận toàn bộ thao tác nhạy cảm: khóa/mở tài khoản, check-in vé, cập nhật sự kiện & sơ đồ ghế (BR-16)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-400">Đang tải nhật ký...</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500">Chưa có nhật ký hoạt động nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-950/80 text-gray-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4">Hành Động (Action)</th>
                  <th className="p-4">Người Thực Hiện</th>
                  <th className="p-4">Đối Tượng (Target)</th>
                  <th className="p-4">Chi Tiết / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30">
                    <td className="p-4 text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')} {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-white">
                      {log.userId?.fullName || 'Hệ thống'}
                      {log.userId?.email && <span className="block text-[10px] text-gray-500">{log.userId.email}</span>}
                    </td>
                    <td className="p-4 text-gray-400">
                      {log.targetCollection || log.targetEntity || '-'}: {log.targetId ? String(log.targetId).substring(0, 8) + '...' : '-'}
                    </td>
                    <td className="p-4 text-gray-400 max-w-xs truncate" title={JSON.stringify(log.metadata || log.details)}>
                      {JSON.stringify(log.metadata || log.details || {})}
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
