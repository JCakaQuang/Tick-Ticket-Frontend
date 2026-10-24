'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api';

interface CollectionMeta {
  name: string;
  label: string;
  description: string;
  critical: boolean;
  count: number;
}

interface BackupOverview {
  databaseName: string;
  serverTime: string;
  totalCollections: number;
  totalDocuments: number;
  collections: CollectionMeta[];
  lastBackup: {
    time: string;
    admin: string;
    adminEmail?: string;
    details?: any;
  } | null;
  lastRestore: {
    time: string;
    admin: string;
    adminEmail?: string;
    details?: any;
  } | null;
}

interface InspectionReport {
  valid: boolean;
  version: number;
  exportedAt: string | null;
  database: string | null;
  format: string;
  detectedCollections: Array<{
    name: string;
    label: string;
    count: number;
    sample?: any;
  }>;
  totalDocuments: number;
  warnings: string[];
}

interface RestoreReport {
  mode: string;
  durationMs: number;
  totalRestoredCount: number;
  collections: Array<{
    name: string;
    label: string;
    insertedCount: number;
    status: 'success' | 'warning' | 'error';
    message?: string;
  }>;
}

const COLLECTION_ICONS: Record<string, string> = {
  users: '👥',
  events: '🎪',
  ticket_tiers: '🎫',
  seats: '🪑',
  orders: '📦',
  tickets: '🎟️',
  coupons: '🏷️',
  system_settings: '🔒',
  traffic_logs: '📈',
  audit_logs: '📜',
};

export const AdminBackupRestore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'restore' | 'history'>('export');
  const [overview, setOverview] = useState<BackupOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Export State
  const [selectedExportCols, setSelectedExportCols] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Restore State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [inspection, setInspection] = useState<InspectionReport | null>(null);
  const [selectedRestoreCols, setSelectedRestoreCols] = useState<string[]>([]);
  const [restoreMode, setRestoreMode] = useState<'clean' | 'upsert'>('clean');
  const [preserveAdmin, setPreserveAdmin] = useState(true);
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    report?: RestoreReport;
  } | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    const res = await apiRequest<BackupOverview>('/admin/database/overview');
    if (res.success && res.data) {
      setOverview(res.data);
      if (selectedExportCols.length === 0) {
        setSelectedExportCols(res.data.collections.map((c) => c.name));
      }
    }
    setLoadingOverview(false);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const res = await apiRequest<any[]>('/admin/database/history?limit=25');
    if (res.success && res.data) {
      setHistoryLogs(res.data);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);
  const handleExport = async (all = false) => {
    const colsToExport = all
      ? (overview?.collections.map((c) => c.name) || [])
      : selectedExportCols;

    if (colsToExport.length === 0) {
      alert('Vui lòng chọn ít nhất 1 collection để xuất sao lưu!');
      return;
    }

    setExporting(true);
    setExportMsg(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const url = `${API_BASE}/admin/database/export?collections=${encodeURIComponent(
        colsToExport.join(',')
      )}&download=true`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.message || 'Không thể tải file backup từ máy chủ');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const suffix = all ? 'full' : `${colsToExport.length}-collections`;
      a.download = `tickticket-backup-${suffix}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMsg({
        type: 'ok',
        text: `Xuất sao lưu thành công! Đã tải xuống file JSON chứa ${colsToExport.length} collections.`,
      });
      fetchOverview();
    } catch (err: any) {
      setExportMsg({
        type: 'err',
        text: err.message || 'Lỗi trong quá trình xuất dữ liệu sao lưu.',
      });
    } finally {
      setExporting(false);
    }
  };

  const toggleExportCol = (name: string) => {
    setSelectedExportCols((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const selectAllExportCols = () => {
    if (overview) {
      setSelectedExportCols(overview.collections.map((c) => c.name));
    }
  };

  const deselectAllExportCols = () => {
    setSelectedExportCols([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert('Vui lòng chọn file có định dạng .json');
      return;
    }

    setUploadedFile(file);
    setRestoreResult(null);
    setRestoreError(null);
    setConfirmKeyword('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setParsedData(parsed);

        const inspectRes = await apiRequest<InspectionReport>('/admin/database/inspect', {
          method: 'POST',
          body: JSON.stringify({ data: parsed }),
        });

        if (inspectRes.success && inspectRes.data) {
          setInspection(inspectRes.data);
          setSelectedRestoreCols(inspectRes.data.detectedCollections.map((c) => c.name));
        } else {
          setRestoreError(inspectRes.message || 'File JSON không chứa cấu trúc backup hợp lệ');
        }
      } catch (err: any) {
        setRestoreError(`Không thể đọc file JSON: ${err.message}`);
        setInspection(null);
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const toggleRestoreCol = (name: string) => {
    setSelectedRestoreCols((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };
  const handleExecuteRestore = async () => {
    if (!parsedData || !inspection) {
      alert('Vui lòng chọn và kiểm tra file backup trước khi khôi phục!');
      return;
    }

    if (selectedRestoreCols.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 collection để khôi phục!');
      return;
    }

    if (restoreMode === 'clean' && confirmKeyword.trim().toUpperCase() !== 'RESTORE') {
      alert('Vui lòng nhập chính xác từ khóa "RESTORE" để xác nhận chế độ Làm mới dữ liệu!');
      return;
    }

    const confirmMsg =
      restoreMode === 'clean'
        ? `⚠️ CẢNH BÁO NGUY HIỂM: Bạn đang chọn chế độ XÓA SẠCH và KHÔI PHỤC LẠI ${selectedRestoreCols.length} collections. Dữ liệu hiện tại của các collections này sẽ bị xóa và thay thế bằng file backup. Bạn có chắc chắn muốn thực hiện?`
        : `Xác nhận ghi đè và hợp nhất ${selectedRestoreCols.length} collections từ file backup vào hệ thống?`;

    if (!window.confirm(confirmMsg)) return;

    setRestoring(true);
    setRestoreError(null);
    setRestoreResult(null);

    const res = await apiRequest<any>('/admin/database/restore', {
      method: 'POST',
      body: JSON.stringify({
        data: parsedData,
        collections: selectedRestoreCols,
        mode: restoreMode,
        preserveCurrentAdmin: preserveAdmin,
      }),
    });

    if (res.success && res.data) {
      setRestoreResult({
        success: true,
        message: res.message || 'Khôi phục dữ liệu cơ sở dữ liệu thành công!',
        report: res.data.report,
      });
      fetchOverview();
    } else {
      setRestoreError(res.message || 'Khôi phục thất bại.');
    }
    setRestoring(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💾</span> Sao Lưu & Khôi Phục Cơ Sở Dữ Liệu
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Xuất dữ liệu collections thời gian thực thành file JSON chuẩn (BSON Extended JSON) và tải lên file backup để khôi phục cơ sở dữ liệu khi gặp sự cố.
          </p>
        </div>
        <button
          onClick={() => {
            fetchOverview();
            if (activeTab === 'history') fetchHistory();
          }}
          disabled={loadingOverview}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white border border-slate-700 rounded-xl text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <span className={loadingOverview ? 'animate-spin' : ''}>🔄</span>
          <span>Làm mới trạng thái</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
            🗄️
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Database Atlas</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">
              {overview?.databaseName || 'ticketbox'}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Kết nối ổn định
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 flex items-center justify-center text-lg border border-cyan-500/30">
            📦
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Collections Hệ Thống</p>
            <p className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
              {overview?.totalCollections || 10} bảng
            </p>
            <p className="text-[10px] text-gray-500">Bao phủ toàn diện dữ liệu</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center text-lg border border-purple-500/30">
            📄
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Tổng Tài Liệu (Records)</p>
            <p className="text-sm font-bold text-purple-300 font-mono mt-0.5">
              {overview?.totalDocuments?.toLocaleString() || 0} bản ghi
            </p>
            <p className="text-[10px] text-gray-500">Đã kiểm toán & bảo mật</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center text-lg border border-amber-500/30">
            ⏱️
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Sao Lưu Gần Nhất</p>
            <p className="text-xs font-semibold text-amber-300 mt-0.5">
              {overview?.lastBackup
                ? new Date(overview.lastBackup.time).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Chưa có bản lưu'}
            </p>
            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
              {overview?.lastBackup ? overview.lastBackup.admin : 'Sẵn sàng sao lưu'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'export'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-gray-400 hover:text-white'
          } rounded-t-xl`}
        >
          <span>📥</span>
          <span>Xuất Dữ Liệu (Backup / Export)</span>
        </button>

        <button
          onClick={() => setActiveTab('restore')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'restore'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-gray-400 hover:text-white'
          } rounded-t-xl`}
        >
          <span>📤</span>
          <span>Khôi Phục Dữ Liệu (Upload & Restore)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-gray-400 hover:text-white'
          } rounded-t-xl`}
        >
          <span>📜</span>
          <span>Nhật Ký Sao Lưu & Khôi Phục</span>
        </button>
      </div>
      {/* TAB 1: EXPORT / BACKUP */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {exportMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                exportMsg.type === 'ok'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
              }`}
            >
              <span>{exportMsg.type === 'ok' ? '✅' : '❌'}</span>
              <span>{exportMsg.text}</span>
            </div>
          )}

          {/* Quick Action Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-base font-bold text-white">
                  Sao Lưu Toàn Bộ Cơ Sở Dữ Liệu (Full System Snapshot)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Xuất toàn bộ collections tại thời điểm hiện tại thành một file JSON chuẩn (MongoDB BSON Extended JSON) với đầy đủ định danh và quan hệ dữ liệu.
              </p>
            </div>
            <button
              onClick={() => handleExport(true)}
              disabled={exporting}
              className="px-5 py-2.5 bg-[#00b14f] hover:bg-[#009b45] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 whitespace-nowrap transition-all shrink-0"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tạo bản sao lưu...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Tải Về Toàn Bộ (.JSON)</span>
                </>
              )}
            </button>
          </div>
          {/* Granular Export Option */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Tùy Chọn Collection Cần Xuất
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chọn các collections cụ thể mà bạn muốn đóng gói vào file JSON backup.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={selectAllExportCols}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs transition-colors"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={deselectAllExportCols}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs transition-colors"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            {/* Collection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {overview?.collections.map((col) => {
                const isSelected = selectedExportCols.includes(col.name);
                const icon = COLLECTION_ICONS[col.name] || '📁';
                return (
                  <div
                    key={col.name}
                    onClick={() => toggleExportCol(col.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm shadow-emerald-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <span>{icon}</span>
                          <span>{col.label}</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          {col.count}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                        bảng: <span className="text-gray-300">{col.name}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        {col.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-gray-400">
                Đã chọn:{' '}
                <strong className="text-emerald-400 font-mono">
                  {selectedExportCols.length} / {overview?.totalCollections || 10}
                </strong>{' '}
                collections
              </span>
              <button
                onClick={() => handleExport(false)}
                disabled={exporting || selectedExportCols.length === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>📦</span>
                <span>Xuất {selectedExportCols.length} Collection Đã Chọn (.JSON)</span>
              </button>
            </div>
          </div>

        </div>
      )}
      {/* TAB 2: RESTORE FROM JSON */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          {/* File Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-8 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/30 group-hover:scale-105 transition-transform mb-3">
              📤
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {uploadedFile ? uploadedFile.name : 'Kéo thả hoặc Bấm để tải lên file JSON Backup'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Hỗ trợ file chuẩn sao lưu của Tickticket hoặc MongoDB BSON Extended JSON (.json)
            </p>
            {uploadedFile && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 font-mono">
                <span>Dung lượng: {formatBytes(uploadedFile.size)}</span>
              </div>
            )}
          </div>

          {restoreError && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-3">
              <span className="text-base">❌</span>
              <div className="space-y-0.5">
                <p className="font-bold text-rose-200">Lỗi kiểm tra hoặc khôi phục dữ liệu:</p>
                <p>{restoreError}</p>
              </div>
            </div>
          )}
          {/* Inspection and Execution Section */}
          {inspection && inspection.valid && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Manifest Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Thông Tin Bản Sao Lưu Được Nhận Diện
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>
                      Thời gian sao lưu:{' '}
                      <strong className="text-emerald-400 font-mono">
                        {inspection.exportedAt
                          ? new Date(inspection.exportedAt).toLocaleString('vi-VN')
                          : 'Không xác định'}
                      </strong>
                    </span>
                    <span>
                      Định dạng:{' '}
                      <strong className="text-cyan-400 font-mono">{inspection.format}</strong>
                    </span>
                    <span>
                      Tổng bản ghi:{' '}
                      <strong className="text-purple-400 font-mono">
                        {inspection.totalDocuments}
                      </strong>
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold self-start sm:self-auto">
                  ✓ Cấu trúc JSON Hợp Lệ
                </span>
              </div>

              {/* Collections Selection from File */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>📑</span> Chọn Collection Muốn Khôi Phục
                  </h4>
                  <span className="text-xs text-gray-400">
                    Phát hiện{' '}
                    <strong className="text-emerald-400 font-mono">
                      {inspection.detectedCollections.length}
                    </strong>{' '}
                    collection trong file
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inspection.detectedCollections.map((col) => {
                    const isChecked = selectedRestoreCols.includes(col.name);
                    const icon = COLLECTION_ICONS[col.name] || '📁';
                    return (
                      <div
                        key={col.name}
                        onClick={() => toggleRestoreCol(col.name)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-500/60'
                            : 'bg-slate-950/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{icon}</span>
                              <span>{col.label}</span>
                            </span>
                            <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                              {col.count} docs
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">{col.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Restore Modes & Safeguards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Mode Selector */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>⚙️</span> Chế Độ Khôi Phục (Restore Strategy)
                  </h4>
                  <div className="space-y-2">
                    <label
                      onClick={() => setRestoreMode('clean')}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        restoreMode === 'clean'
                          ? 'bg-rose-950/30 border-rose-500/60 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === 'clean'}
                        onChange={() => setRestoreMode('clean')}
                        className="mt-0.5 text-rose-500 focus:ring-rose-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-rose-300">
                          Xóa Sạch & Khôi Phục Mới (Clean & Replace)
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Xóa trắng các collections được chọn và nạp lại toàn bộ dữ liệu từ file backup (chuẩn khôi phục thảm họa).
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setRestoreMode('upsert')}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        restoreMode === 'upsert'
                          ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="restoreMode"
                        checked={restoreMode === 'upsert'}
                        onChange={() => setRestoreMode('upsert')}
                        className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-emerald-300">
                          Ghi Đè & Hợp Nhất (Upsert / Merge)
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Cập nhật bản ghi theo ID và thêm mới nếu chưa có, giữ nguyên các bản ghi khác hiện có.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Safety Options */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>🛡️</span> Cơ Chế Bảo Vệ An Toàn
                    </h4>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveAdmin}
                        onChange={(e) => setPreserveAdmin(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Bảo toàn tài khoản Admin đang đăng nhập
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Giữ nguyên tài khoản admin hiện tại ngay cả khi bảng users bị xóa hoặc file backup không có tài khoản này.
                        </p>
                      </div>
                    </label>

                    {restoreMode === 'clean' && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <label className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                          <span>⚠️</span> Xác nhận xóa: Nhập &quot;RESTORE&quot; để tiếp tục
                        </label>
                        <input
                          type="text"
                          value={confirmKeyword}
                          onChange={(e) => setConfirmKeyword(e.target.value)}
                          placeholder="Nhập chữ RESTORE"
                          className="w-full bg-slate-900 border border-rose-500/50 focus:border-rose-400 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExecuteRestore}
                    disabled={
                      restoring ||
                      selectedRestoreCols.length === 0 ||
                      (restoreMode === 'clean' && confirmKeyword.trim().toUpperCase() !== 'RESTORE')
                    }
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4 ${
                      restoreMode === 'clean'
                        ? 'bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-[#00b14f] hover:bg-[#009b45] disabled:opacity-40 text-white shadow-lg shadow-emerald-950/50'
                    }`}
                  >
                    {restoring ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang khôi phục dữ liệu vào MongoDB...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>
                          Thực Hiện Khôi Phục ({selectedRestoreCols.length} collections)
                        </span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}
          {/* Restoration Report Result */}
          {restoreResult && (
            <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl">
                  🎉
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    Khôi Phục Dữ Liệu Thành Công!
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">{restoreResult.message}</p>
                </div>
              </div>

              {restoreResult.report && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Chế độ</p>
                      <p className="text-xs font-bold text-white font-mono mt-0.5 uppercase">
                        {restoreResult.report.mode}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Tổng bản ghi nạp
                      </p>
                      <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                        {restoreResult.report.totalRestoredCount} docs
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Thời gian thực thi
                      </p>
                      <p className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
                        {restoreResult.report.durationMs} ms
                      </p>
                    </div>
                  </div>

                  {/* Collections Breakdown */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-gray-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Collection</th>
                          <th className="py-2.5 px-4 font-semibold">Tên Kỹ Thuật</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Số Bản Ghi</th>
                          <th className="py-2.5 px-4 font-semibold text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {restoreResult.report.collections.map((item) => (
                          <tr key={item.name} className="hover:bg-slate-950/40">
                            <td className="py-2.5 px-4 font-medium text-white flex items-center gap-2">
                              <span>{COLLECTION_ICONS[item.name] || '📁'}</span>
                              <span>{item.label}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-gray-400">{item.name}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                              {item.insertedCount}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold">
                                ✓ Hoàn tất
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>
      )}
      {/* TAB 3: AUDIT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📜</span> Lịch Sử Thao Tác Sao Lưu & Khôi Phục
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Nhật ký kiểm toán ghi lại tất cả các lần Admin thực hiện Export hoặc Restore database.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span className={loadingHistory ? 'animate-spin' : ''}>🔄</span>
              <span>Làm mới nhật ký</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Đang tải lịch sử kiểm toán...
            </div>
          ) : historyLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Chưa có lịch sử sao lưu hoặc khôi phục nào được ghi nhận.
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-gray-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Thời Gian</th>
                    <th className="py-3 px-4 font-semibold">Hành Động</th>
                    <th className="py-3 px-4 font-semibold">Quản Trị Viên</th>
                    <th className="py-3 px-4 font-semibold">Chi Tiết Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {historyLogs.map((log) => {
                    const isExport = log.action === 'DATABASE_BACKUP_EXPORT';
                    const adminName = log.userId?.fullName || 'Quản trị viên';
                    const adminEmail = log.userId?.email || '';

                    return (
                      <tr key={log._id} className="hover:bg-slate-950/40">
                        <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isExport ? (
                            <span className="px-2.5 py-1 bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                              <span>📥</span>
                              <span>XUẤT SAO LƯU</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                              <span>🚀</span>
                              <span>KHÔI PHỤC DỮ LIỆU</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{adminName}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{adminEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {isExport ? (
                            <div className="space-y-0.5">
                              <p>
                                Đã xuất{' '}
                                <strong className="text-cyan-400 font-mono">
                                  {log.metadata?.exportedCollections?.length || 0}
                                </strong>{' '}
                                collections (
                                <strong className="text-purple-400 font-mono">
                                  {log.metadata?.totalDocuments || 0}
                                </strong>{' '}
                                bản ghi)
                              </p>
                              <p className="text-[10px] text-gray-500 truncate max-w-md font-mono">
                                {log.metadata?.exportedCollections?.join(', ')}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <p>
                                Chế độ:{' '}
                                <strong className="text-amber-400 font-mono uppercase">
                                  {log.metadata?.mode || 'clean'}
                                </strong>{' '}
                                • Đã nạp:{' '}
                                <strong className="text-emerald-400 font-mono">
                                  {log.metadata?.totalRestoredCount || 0}
                                </strong>{' '}
                                bản ghi ({log.metadata?.durationMs || 0} ms)
                              </p>
                              <p className="text-[10px] text-gray-500 truncate max-w-md font-mono">
                                Collections: {log.metadata?.restoredCollections?.join(', ')}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};






