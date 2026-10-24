'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await register({
      fullName,
      email,
      phoneNumber,
      password,
    });
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message || 'Đăng ký tài khoản thất bại, vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-[#00b14f] text-2xl font-bold">
            👤
          </div>
          <h1 className="text-2xl font-black text-white">Tạo Tài Khoản Mới</h1>
          <p className="text-xs text-gray-400">
            Đặt vé dễ dàng, quản lý vé điện tử và nhận thông báo sự kiện
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
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="0912345678"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00b14f]"
              placeholder="••••••••"
            />
          </div>

          <div className="text-[11px] text-gray-500 leading-relaxed">
            Bằng việc nhấn Đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật chống phe vé của Ticketbox.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009241] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý tạo tài khoản...</span>
              </>
            ) : (
              <span>Đăng Ký Tài Khoản</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#00b14f] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}