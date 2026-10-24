'use client';


import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../../lib/api';

export default function PublicShareTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.id as string) || '';
  const [shareData, setShareData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      setLoading(true);
      const res = await apiRequest<any>(`/tickets/share/${ticketId}`);
      if (res.success && res.data) {
        setShareData(res.data);
      }
      setLoading(false);
    })();
  }, [ticketId]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Đang xác thực chứng chỉ vé chia sẻ...</p>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Không tìm thấy thông tin vé chia sẻ</h2>
        <Link href="/" className="inline-block px-5 py-2.5 bg-[#00b14f] text-white text-xs font-bold rounded-xl">
          Khám phá sự kiện
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#00b14f]/20 border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            ✨ Chứng Nhận Sở Hữu Vé Chính Hãng
          </span>
          <span className="font-mono text-[11px] text-gray-300 bg-slate-900/80 px-2.5 py-1 rounded-full">
            #{shareData.ticketCode?.slice(0, 14)}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs text-emerald-400 font-semibold">
              Chủ sở hữu xác thực: {shareData.maskedOwner}
            </p>
            <h1 className="text-2xl font-black text-white mt-1">{shareData.event?.title}</h1>
            <p className="text-xs text-gray-400 mt-2">
              📍 {shareData.event?.location?.name}, {shareData.event?.location?.city}
            </p>
            {shareData.event?.startTime && (
              <p className="text-xs text-gray-400 mt-1">
                🗓️ {new Date(shareData.event.startTime).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Hạng vé</span>
              <span className="text-sm font-bold text-emerald-400">{shareData.tier?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase block">Vị trí</span>
              <span className="text-sm font-black text-white">{shareData.seatCode}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-300">🔒 Mã QR Check-in Đã Được Bảo Vệ</p>
              <p className="text-[11px] text-gray-400">
                Thẻ chia sẻ công khai ẩn mã QR gốc để chống chụp màn hình & đánh cắp vé. Chữ ký xác thực:{' '}
                <code className="text-emerald-400">{shareData.shareVerificationHash}</code>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all"
            >
              {copied ? '✅ Đã sao chép liên kết chia sẻ!' : '🔗 Sao chép link khoe vé'}
            </button>
            <button
              onClick={() =>
                router.push(shareData.event?.slug ? `/events/${shareData.event.slug}` : '/')
              }
              className="flex-1 py-3 bg-[#00b14f] hover:bg-[#009241] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              🎟️ Đặt vé cùng tham gia sự kiện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
