'use client';

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function CheckInPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'SUCCESS' | 'ERROR';
    message: string;
    ticket?: any;
  } | null>(null);

  const isAdmin = user && (user.role === 'admin' || (user as any).role === 'ADMIN');

  if (authLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Đang xác thực quyền quản trị...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-red-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-3xl font-bold">
          🚫
        </div>
        <h2 className="text-xl font-bold text-white">Quyền Truy Cập Bị Từ Chối</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Cổng soát vé được bảo mật nghiêm ngặt và chỉ dành riêng cho tài khoản Quản trị viên (Admin). Khách hàng hoặc người dùng không có quyền truy cập trang này.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-[#00b14f] hover:bg-[#009241] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          Quay Về Trang Chủ
        </a>
      </div>
    );
  }

  const handleCheckIn = async (tokenToUse?: string) => {
    const token = tokenToUse || qrToken;
    if (!token.trim()) {
      alert('Vui lòng nhập hoặc quét mã QR Token của vé!');
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await apiRequest<any>('/tickets/check-in', {
      method: 'POST',
      body: JSON.stringify({ qrToken: token.trim() }),
    });

    setLoading(false);

    if (res.success && res.data) {
      setResult({
        status: 'SUCCESS',
        message: 'Xác thực hợp lệ! Mời khán giả vào cổng.',
        ticket: res.data.ticket,
      });
      setQrToken('');
    } else {
      setResult({
        status: 'ERROR',
        message: res.message || 'Mã vé không hợp lệ, chữ ký số giả mạo hoặc vé đã được quét trước đó!',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Banner / Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#00b14f] flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Cổng Soát Vé Ban Tổ Chức</h1>
            <p className="text-xs text-gray-400">
              Kiểm tra chữ ký số HMAC-SHA256 & Atomic One-time Verification
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
          Mỗi lượt check-in được xử lý bằng câu lệnh nguyên tử <code className="text-emerald-400 font-mono">findOneAndUpdate</code> tại cơ sở dữ liệu. Ngay cả khi 2 cổng quét cùng một mã QR tại cùng 1 phần nghìn giây, chỉ duy nhất 1 yêu cầu được chấp thuận.
        </p>
      </div>

      {/* Input / Scanner Simulation Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
          Nhập mã QR hoặc Sử Dụng Đầu Đọc Cầm Tay
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Mã QR Token / Chuỗi Hash HMAC:
            </label>
            <textarea
              rows={3}
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="Dán mã QR Token hoặc quét trực tiếp từ thiết bị đọc barcode..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
            />
          </div>

          <button
            disabled={loading || !qrToken.trim()}
            onClick={() => handleCheckIn()}
            className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009241] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang đối soát chữ ký số & kiểm tra vé...</span>
              </>
            ) : (
              <span>🔍 Xác Thực & Check-in Ngay</span>
            )}
          </button>
        </div>

        {/* Verification Result Feedback Box */}
        {result && (
          <div
            className={`p-6 rounded-2xl border transition-all space-y-4 ${
              result.status === 'SUCCESS'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
                : 'bg-red-950/40 border-red-500 text-red-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {result.status === 'SUCCESS' ? '✅' : '❌'}
              </span>
              <div>
                <h3 className="font-extrabold text-base">
                  {result.status === 'SUCCESS' ? 'CHECK-IN THÀNH CÔNG' : 'TỪ CHỐI CHECK-IN'}
                </h3>
                <p className="text-xs opacity-90">{result.message}</p>
              </div>
            </div>

            {result.ticket && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mã vé:</span>
                  <span className="font-mono font-bold text-white">#{result.ticket.ticketCode || result.ticket._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sự kiện:</span>
                  <span className="font-bold text-white">{result.ticket.eventId?.title || result.ticket.event?.title || 'Sự kiện Tickticket'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vị trí:</span>
                  <span className="font-bold text-[#00b14f]">
                    {result.ticket.seatCode ? `Ghế ${result.ticket.seatCode}` : 'Vé đứng (GA)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời gian quét:</span>
                  <span className="text-gray-300">
                    {new Date(result.ticket.checkedInAt || Date.now()).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
