'use client';

import React, { useState } from 'react';

interface VNPaySandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess: () => Promise<void>;
  order: any;
  vnpayTmn: string;
  vnpayBank: string;
  vnpayAccName: string;
  qrUrl: string;
  totalAmount: number;
}

export const VNPaySandboxModal: React.FC<VNPaySandboxModalProps> = ({
  isOpen,
  onClose,
  onConfirmSuccess,
  order,
  vnpayTmn,
  vnpayBank,
  vnpayAccName,
  qrUrl,
  totalAmount,
}) => {
  const [tab, setTab] = useState<'QR' | 'ATM'>('QR');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CARD' | 'OTP'>('CARD');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fillTestCredentials = () => {
    setCardNumber('9704198526191432198');
    setCardHolder('NGUYEN VAN A');
    setIssueDate('07/15');
    setErrorMsg(null);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard !== '9704198526191432198') {
      setErrorMsg('⛔ CẢNH BÁO: Nghiêm cấm dùng dữ liệu thẻ thật! Hệ thống Sandbox chỉ chấp nhận số thẻ test: 9704 1985 2619 1432 198');
      return;
    }
    setStep('OTP');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (otp.trim() !== '123456') {
      setErrorMsg('Mã OTP Sandbox không hợp lệ. Vui lòng nhập OTP thử nghiệm: 123456');
      return;
    }
    setProcessing(true);
    try {
      await onConfirmSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra trong quá trình xác thực thanh toán.');
    } finally {
      setProcessing(false);
    }
  };

  const handleQrPayment = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setProcessing(true);
    try {
      await onConfirmSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi xác nhận giao dịch quét mã.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !processing) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-blue-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-6 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              VNP
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cổng Thanh Toán VNPAY</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-mono">
                  SANDBOX TEST
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">Terminal: <span className="font-mono text-blue-400">{vnpayTmn}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Order Summary Bar */}
        <div className="bg-blue-950/40 border-b border-blue-900/40 px-5 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400 block text-[10px]">Số tiền giao dịch:</span>
            <span className="text-base font-extrabold text-amber-400">
              {Number(totalAmount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px]">Mã đơn hàng:</span>
            <span className="font-mono text-white text-[11px] font-bold">
              {order?.orderCode || order?._id?.substring(order?._id.length - 8)}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs">
          <button
            onClick={() => { setTab('QR'); setErrorMsg(null); }}
            className={`py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'QR'
                ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <span>📱</span> Quét VNPAY-QR Test
          </button>
          <button
            onClick={() => { setTab('ATM'); setErrorMsg(null); }}
            className={`py-2.5 font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'ATM'
                ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <span>💳</span> Thẻ ATM Thử Nghiệm
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {tab === 'QR' ? (
            <div className="flex flex-col items-center space-y-3.5 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-blue-600/30 relative">
                <img
                  src={qrUrl}
                  alt="VNPAY Sandbox QR"
                  className="w-48 h-48 object-contain"
                />
                <span className="absolute bottom-1 right-1 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                  SANDBOX
                </span>
              </div>

              <div className="text-xs text-gray-300 space-y-1">
                <p className="font-semibold text-white">Quét mã QR bằng App Ngân hàng hoặc VNPAY</p>
                <p className="text-[11px] text-gray-400">
                  Đơn vị thụ hưởng: <span className="text-blue-300 font-bold">{vnpayAccName}</span> ({vnpayBank})
                </p>
              </div>

              <div className="w-full p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-gray-400">
                ⚡ Trong môi trường Sandbox, bạn có thể bấm nút bên dưới để mô phỏng lượt quét thanh toán thành công tức thời.
              </div>

              <button
                disabled={processing}
                onClick={handleQrPayment}
                className="w-full py-3 bg-[#005baa] hover:bg-[#004887] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác nhận với VNPAY Sandbox...</span>
                  </>
                ) : (
                  <span>✅ Xác Nhận Quét Mã VNPAY Sandbox Thành Công</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Presets Box for Testing */}
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                    <span>🧪</span> Dữ liệu thẻ test VNPAY Sandbox chuẩn:
                  </span>
                  <button
                    type="button"
                    onClick={fillTestCredentials}
                    className="text-[10px] font-bold text-amber-300 hover:text-white bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded transition-all"
                  >
                    Điền Tự Động ⚡
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-300">
                  <div>Ngân hàng: <span className="text-white font-bold">NCB (Sandbox)</span></div>
                  <div>Số thẻ: <span className="text-emerald-400 font-bold">9704 1985 2619 1432 198</span></div>
                  <div>Tên: <span className="text-white">NGUYEN VAN A</span></div>
                  <div>Ngày: <span className="text-white">07/15</span> | OTP: <span className="text-amber-400">123456</span></div>
                </div>
              </div>

              {step === 'CARD' ? (
                <form onSubmit={handleNextStep} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400">Số thẻ ATM thử nghiệm *</label>
                    <input
                      type="text"
                      required
                      placeholder="9704 1985 2619 1432 198"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400">Tên in trên thẻ *</label>
                      <input
                        type="text"
                        required
                        placeholder="NGUYEN VAN A"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400">Ngày phát hành (MM/YY) *</label>
                      <input
                        type="text"
                        required
                        placeholder="07/15"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-red-400 italic">
                    * Nghiêm cấm nhập thẻ thật. Mọi số thẻ không khớp với thẻ test sandbox sẽ bị chặn.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#005baa] hover:bg-[#004887] text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Tiếp Tục Xác Thực OTP Sandbox →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                    <p className="text-xs text-gray-300 font-semibold">Nhập mã OTP xác thực giao dịch</p>
                    <p className="text-[11px] text-gray-400">
                      Mã OTP thử nghiệm gửi đến số điện thoại đăng ký NCB: <span className="font-mono text-amber-400 font-bold">123456</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400">Mã OTP (Sandbox) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full text-center text-lg tracking-widest bg-slate-950 border border-slate-700 rounded-xl py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('CARD')}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-semibold"
                    >
                      ← Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={processing || !otp.trim()}
                      className="flex-1 py-2.5 bg-[#00b14f] hover:bg-[#009241] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang xử lý giao dịch NCB Sandbox...</span>
                        </>
                      ) : (
                        <span>Xác Nhận Thanh Toán NCB Sandbox</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Security Note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-gray-500">
          🔒 Kết nối mã hóa mô phỏng cổng VNPAY Test Gateway. Không phát sinh chi phí thực tế.
        </div>
      </div>
    </div>
  );
};
