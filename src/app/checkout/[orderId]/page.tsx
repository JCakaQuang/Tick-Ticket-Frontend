'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Order } from '../../../types';
import { apiRequest } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { VNPaySandboxModal } from '../../../components/VNPaySandboxModal';

interface CheckoutPageProps {
  params?: { orderId?: string };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const orderId = (routeParams?.orderId as string) || params?.orderId || '';

  const { user } = useAuth();
  const { secondsRemaining, formatCountdown, clearCart, setActiveOrder } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'VNPAY' | 'ZALOPAY' | 'CREDIT_CARD'>('VNPAY');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showVnpaySandboxModal, setShowVnpaySandboxModal] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [applyingUpsell, setApplyingUpsell] = useState(false);

  const upsellCatalog = [
    { addonCode: 'TICKET_PROTECT', name: 'Bảo hiểm hoàn vé linh hoạt 100%', unitPrice: 35000, badge: 'Phổ biến' },
    { addonCode: 'LIGHTSTICK_COMBO', name: 'Combo Lightstick cổ vũ & dây đeo LED', unitPrice: 99000, badge: 'Hot' },
    { addonCode: 'FAST_TRACK_VIP', name: 'Lối đi ưu tiên Fast-Track Check-in', unitPrice: 59000, badge: 'VIP' },
  ];

  const toggleUpsellAddon = async (addonCode: string) => {
    if (!order || applyingUpsell) return;
    const nextState = { ...selectedAddons, [addonCode]: !selectedAddons[addonCode] };
    setSelectedAddons(nextState);
    setApplyingUpsell(true);
    const items = upsellCatalog
      .filter((a) => nextState[a.addonCode])
      .map((a) => ({ addonCode: a.addonCode, name: a.name, quantity: 1, unitPrice: a.unitPrice }));
    const res = await apiRequest<any>(`/bookings/${order._id}/upsell`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    if (res.success && res.data?.order) {
      setOrder(res.data.order);
      void apiRequest('/events/funnel/track', {
        method: 'POST',
        body: JSON.stringify({ step: 'UPSELL_ADDON', orderId: order._id }),
      });
    }
    setApplyingUpsell(false);
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    const res = await apiRequest<Order>(`/bookings/${orderId}`);
    if (res.success && res.data) {
      const orderData = res.data;
      setOrder(orderData);
      if (orderData.couponCode) {
        setCouponCode(orderData.couponCode);
      }
      const exp = (orderData as any).expiresAt || orderData.reservationExpiresAt;
      if (exp) {
        setActiveOrder({
          ...orderData,
          reservationExpiresAt: exp,
        });
      }
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage(null);

    const res = await apiRequest<any>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({
        code: couponCode.trim(),
        orderId: order!._id,
      }),
    });

    setApplyingCoupon(false);

    if (res.success && res.data) {
      setOrder(res.data.order);
      if (res.data.order?.couponCode) {
        setCouponCode(res.data.order.couponCode);
      }
      setCouponMessage({
        text: `Áp dụng thành công! Giảm ${res.data.discountAmount?.toLocaleString('vi-VN')} đ`,
        isError: false,
      });
    } else {
      setCouponMessage({
        text: res.message || 'Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.',
        isError: true,
      });
    }
  };

  const handleProcessPayment = async (action: 'success' | 'fail' = 'success') => {
    setProcessingPayment(true);
    setPaymentError(null);
    const idempotencyKey = `idem-${order!._id}-${action}`;

    const res = await apiRequest<any>('/payments/process', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        orderId: order!._id,
        paymentMethod,
        action,
        idempotencyKey,
      }),
    });

    setProcessingPayment(false);

    if (res.success && res.data) {
      clearCart();
      router.push('/my-tickets');
    } else {
      if (action === 'fail') {
        clearCart();
      }
      setPaymentError(res.message || 'Thanh toán không thành công hoặc phiên giữ chỗ đã hết hạn.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Đang tải thông tin đơn hàng giữ chỗ...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-4">
          <p className="text-red-400 font-bold">Không tìm thấy đơn hàng hoặc đơn đã bị hủy.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#00b14f] text-white text-xs font-bold rounded-lg"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const expTime = (order as any).expiresAt || order.reservationExpiresAt;
  const isTimeUp = expTime ? new Date(expTime).getTime() <= Date.now() : secondsRemaining <= 0;
  const isExpired = order.status === 'EXPIRED' || (order.status?.toUpperCase() === 'PENDING' && isTimeUp);

  const eventObj: any = typeof order.eventId === 'object' ? order.eventId : null;
  const vnpayTmn = eventObj?.vnpayTmnCode || 'VNPAY_SANDBOX';
  const vnpayAccName = eventObj?.vnpayAccountName || 'BAN TO CHUC SU KIEN';
  const vnpayBank = eventObj?.vnpayBankName || 'VNPAY - Vietcombank';
  const vnpayQrCodeUrl =
    eventObj?.vnpayQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `VNPAYQR*${vnpayTmn}*${order.orderCode || order._id}*${order.totalAmount || 0}*VND`
    )}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 10-Minute Cart Hold Countdown Bar */}
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border shadow-lg ${
        isExpired
          ? 'bg-red-950/70 border-red-800 text-red-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg ${
            isExpired ? 'bg-red-900' : 'bg-amber-500/20 text-amber-400'
          }`}>
            ⏱️
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {isExpired ? 'Thời gian giữ chỗ đã kết thúc' : 'Vé của bạn đang được khóa giữ an toàn'}
            </h4>
            <p className="text-xs opacity-80">
              {isExpired
                ? 'Vé đã được giải phóng tự động bởi BullMQ Dual-Layer. Vui lòng chọn lại.'
                : 'Vui lòng hoàn tất thanh toán trước khi hết thời gian đếm ngược.'}
            </p>
          </div>
        </div>

        {!isExpired && (
          <div className="px-4 py-1.5 bg-black/40 rounded-xl font-mono text-xl font-black text-amber-300 tracking-wider">
            {formatCountdown(secondsRemaining)}
          </div>
        )}
      </div>

      {paymentError && (
        <div className="p-4 bg-red-900/50 border border-red-600 rounded-xl text-red-200 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{paymentError}</span>
          </div>
          {eventObj?.slug && (
            <Link
              href={`/events/${eventObj.slug}`}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow"
            >
              Chọn lại vé & vị trí ghế →
            </Link>
          )}
        </div>
      )}

      {/* Main Grid: Details & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order breakdown & Contact info (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Chi Tiết Đơn Hàng</span>
              <span className="text-xs font-mono text-gray-400">Mã đơn: #{order._id.substring(order._id.length - 8)}</span>
            </h2>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs py-2 border-b border-slate-800/60">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {item.seatCode ? `Ghế ${item.seatCode}` : 'Vé đứng (General Admission)'}
                    </p>
                    <p className="text-gray-400">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#00b14f] text-sm">
                     {((item.price ?? (item as any).unitPrice ?? 0) * item.quantity).toLocaleString('vi-VN')} đ
                    </p>
                   <p className="text-[10px] text-gray-500">{(item.price ?? (item as any).unitPrice ?? 0).toLocaleString('vi-VN')} đ / vé</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Tạm tính ({order.items.reduce((s, i) => s + i.quantity, 0)} vé):</span>
                <span>
                  {(
                    order.subtotal ??
                    order.items.reduce(
                      (s, i) => s + ((i.price ?? (i as any).unitPrice ?? 0) * i.quantity),
                      0
                    )
                  ).toLocaleString('vi-VN')}{' '}
                  đ
                </span>
              </div>
              {((order as any).upsellAmount || 0) > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Dịch vụ đi kèm:</span>
                  <span>+ {((order as any).upsellAmount).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Giảm giá ({order.couponCode || 'Coupon'}):</span>
                  <span>- {order.discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Số tiền thanh toán:</span>
                <span className="text-[#00b14f] text-lg">
                  {(order.totalAmount ?? order.finalAmount ?? 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Mã Ưu Đãi / Voucher</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nhập mã coupon (Ví dụ: WELCOME2026)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isExpired || order.discountAmount > 0}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-[#00b14f]"
              />
              <button
                disabled={applyingCoupon || !couponCode.trim() || isExpired || order.discountAmount > 0}
                onClick={handleApplyCoupon}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-colors"
              >
                {applyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>
            {couponMessage && (
              <p className={`text-xs ${couponMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Step 3 BCX Funnel: Upsell / Cross-sell Add-ons */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>🎁 Nâng Cấp Trải Nghiệm & Dịch Vụ Đi Kèm (Ưu Đãi Độc Quyền)</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Tùy chọn thêm tiện ích bảo vệ vé hoặc phụ kiện cổ vũ chính hãng
                </p>
              </div>
              {(order as any).upsellAmount > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  +{((order as any).upsellAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {upsellCatalog.map((addon) => {
                const checked = !!selectedAddons[addon.addonCode];
                return (
                  <div
                    key={addon.addonCode}
                    onClick={() => !isExpired && toggleUpsellAddon(addon.addonCode)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      checked
                        ? 'border-[#00b14f] bg-emerald-950/30'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        disabled={isExpired || applyingUpsell}
                        className="accent-[#00b14f] w-4 h-4 rounded"
                      />
                      <div>
                        <span className="font-bold text-white">{addon.name}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          {addon.badge}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">
                      +{addon.unitPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer E-Ticket Delivery Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-white">Thông Tin Nhận Vé Điện Tử (E-Ticket)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
              <div className="bg-slate-800/50 p-3 rounded-xl">
                <span className="text-gray-500 block mb-1">Họ tên người nhận:</span>
                <span className="font-bold text-white">{user?.fullName || 'Khách hàng'}</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl">
                <span className="text-gray-500 block mb-1">Email nhận vé QR:</span>
                <span className="font-bold text-white">{user?.email || 'N/A'}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 italic">
              * Mã QR ký số HMAC-SHA256 sẽ được tạo ngay lập tức và gửi vào mục "Vé của tôi" sau khi thanh toán thành công.
            </p>
          </div>
        </div>

        {/* Right Column: Payment Methods & Action Button (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl sticky top-24">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              {[
                { id: 'MOMO', name: 'Ví MoMo', desc: 'Quét mã QR MoMo tức thì', icon: '🔴' },
                { id: 'VNPAY', name: 'VNPAY-QR', desc: 'Ứng dụng ngân hàng / VNPAY', icon: '🔵' },
                { id: 'ZALOPAY', name: 'Ví ZaloPay', desc: 'Thanh toán qua ví ZaloPay', icon: '🟢' },
                { id: 'CREDIT_CARD', name: 'Thẻ Quốc Tế', desc: 'Visa, MasterCard, JCB', icon: '💳' },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'border-[#00b14f] bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as any)}
                    className="accent-[#00b14f]"
                  />
                  <div className="text-xl">{m.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Event-Specific VNPAY QR Payment Box */}
            {paymentMethod === 'VNPAY' && (
              <div className="p-4 bg-blue-950/30 border border-blue-600/40 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-blue-800/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔵</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Cổng Thanh Toán VNPAY-QR</p>
                      <p className="text-[10px] text-blue-300">
                        Mã riêng sự kiện: <span className="font-mono font-bold text-white">{vnpayTmn}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold text-[10px] rounded border border-blue-500/30">
                    VNPAY QR
                  </span>
                </div>

                {/* QR Display */}
                <div className="flex flex-col items-center bg-white p-3.5 rounded-xl shadow text-center">
                  <img
                    src={vnpayQrCodeUrl}
                    alt="VNPAY QR Code"
                    className="w-44 h-44 object-contain"
                  />
                  <p className="text-[11px] font-bold text-slate-800 mt-1.5">
                    Quét mã bằng app Ngân hàng hoặc ví VNPAY
                  </p>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Đơn vị thụ hưởng:</span>
                    <span className="font-semibold text-white truncate max-w-[170px]">{vnpayAccName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngân hàng / Cổng:</span>
                    <span className="font-semibold text-blue-400">{vnpayBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nội dung chuyển khoản:</span>
                    <span className="font-mono font-bold text-emerald-400">{order.orderCode || order._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số tiền thanh toán:</span>
                    <span className="font-bold text-amber-400">{(order.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowVnpaySandboxModal(true)}
                    className="w-full py-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>🚀 Mở Giao Diện Cổng VNPay Sandbox</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  * Sau khi quét mã QR hoặc nhập thẻ test NCB, nhấn nút xác nhận bên dưới để hệ thống cấp vé điện tử HMAC-SHA256 ngay lập tức.
                </p>
              </div>
            )}

            {/* Pay Button */}
            <button
              disabled={isExpired || processingPayment}
              onClick={() => {
                if (paymentMethod === 'VNPAY') {
                  setShowVnpaySandboxModal(true);
                } else {
                  handleProcessPayment('success');
                }
              }}
              className={`w-full py-4 text-white font-extrabold rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 ${
                paymentMethod === 'VNPAY'
                  ? 'bg-[#005baa] hover:bg-[#004887] shadow-blue-500/30'
                  : 'bg-[#00b14f] hover:bg-[#009241] shadow-emerald-500/30'
              }`}
            >
              {processingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý giao dịch...</span>
                </>
              ) : isExpired ? (
                <span>Đơn hàng đã hết hạn</span>
              ) : paymentMethod === 'VNPAY' ? (
                <span>🚀 Thanh Toán Qua VNPay Sandbox (NCB)</span>
              ) : (
                <span>Xác nhận & Thanh toán (Thành công)</span>
              )}
            </button>

            <p className="text-center text-[10px] text-gray-500 leading-tight">
              Bằng việc xác nhận thanh toán, bạn đồng ý với Điều khoản phân phối vé và chính sách không hoàn hủy/bán lại của Tick Ticket.
            </p>
          </div>
        </div>
      </div>

      {/* VNPay Sandbox Payment Gateway Modal */}
      <VNPaySandboxModal
        isOpen={showVnpaySandboxModal}
        onClose={() => setShowVnpaySandboxModal(false)}
        onConfirmSuccess={async () => {
          await handleProcessPayment('success');
          setShowVnpaySandboxModal(false);
        }}
        order={order}
        vnpayTmn={vnpayTmn}
        vnpayBank={vnpayBank}
        vnpayAccName={vnpayAccName}
        qrUrl={vnpayQrCodeUrl}
        totalAmount={order.totalAmount || order.finalAmount || 0}
      />
    </div>
  );
}