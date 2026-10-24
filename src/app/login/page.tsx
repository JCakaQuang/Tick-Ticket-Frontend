'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TickTicketLogo } from '../../components/TickTicketLogo';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('demo.customer@ticketbox.vn');
  const [password, setPassword] = useState('Secret123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TickTicketLogo variant="dark" size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-black text-white">Đăng Nhập Tick Ticket</h1>
          <p className="text-xs text-gray-400">
            Truy cập tài khoản để mua vé, chọn ghế và nhận vé điện tử
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-700/50 rounded-xl text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email hoặc Số điện thoại
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="example@tickticket.vn hoặc 0987654321"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Mật khẩu
              </label>
              <a href="#" className="text-[11px] text-emerald-400 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="••••••••"
            />
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-gray-400 space-y-1">
            <span className="font-bold text-gray-300 block">Tài khoản mẫu có sẵn:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@ticketbox.vn');
                  setPassword('password123');
                }}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[10px] text-amber-300 font-bold"
              >
                ⚡ admin@ticketbox.vn (Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@ticketbox.vn');
                  setPassword('password123');
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-emerald-400"
              >
                user@ticketbox.vn
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo.customer@ticketbox.vn');
                  setPassword('Secret123!');
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-cyan-400"
              >
                demo.customer@ticketbox.vn
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('organizer@ticketbox.vn');
                  setPassword('Secret123!');
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-amber-400"
              >
                organizer@ticketbox.vn
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('0987654321');
                  setPassword('password123');
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-pink-400"
              >
                SĐT: 0987654321
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009241] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý đăng nhập...</span>
              </>
            ) : (
              <span>Đăng Nhập Ngay</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-[#00b14f] font-bold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}