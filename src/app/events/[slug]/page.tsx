'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Event, TicketTier, Seat } from '../../../types';
import { apiRequest } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

interface EventPageProps {
  params?: { slug?: string };
}

export default function EventDetailPage({ params }: EventPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const slug = (routeParams?.slug as string) || params?.slug || '';

  const { user } = useAuth();
  const { setActiveOrder, activeOrder, secondsRemaining, formatCountdown } = useCart();

  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selection states
  // For GA: { [tierId: string]: number }
  const [gaQuantities, setGaQuantities] = useState<Record<string, number>>({});
  // For SEATED: array of seat IDs
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEventDetails(true);
  }, [slug]);

  const fetchEventDetails = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setErrorMsg(null);
    }

    const evRes = await apiRequest<Event>(`/events/${slug}`);
    if (!evRes.success || !evRes.data) {
      if (isInitial) {
        setErrorMsg(evRes.message || evRes.error || 'Không tìm thấy sự kiện');
        setLoading(false);
      }
      return;
    }

    const currentEvent = evRes.data;
    setEvent(currentEvent);

    // Fetch tiers
    const tierRes = await apiRequest<TicketTier[]>(`/events/${currentEvent._id}/tiers`);
    if (tierRes.success && tierRes.data) {
      setTiers(tierRes.data);
    }

    // If SEATED or HYBRID, fetch seats
    const evType = (currentEvent.seatingType || currentEvent.type || '').toUpperCase();
    if (evType === 'SEATED' || evType === 'HYBRID') {
      const seatRes = await apiRequest<Seat[]>(`/events/${currentEvent._id}/seats`);
      if (seatRes.success && seatRes.data) {
        setSeats(seatRes.data);
      }
    }

    if (isInitial) {
      setLoading(false);
    }
  };

  // GA Quantity handlers
  const handleGaChange = (tierId: string, delta: number, maxAvailable: number) => {
    const current = gaQuantities[tierId] || 0;
    const nextVal = current + delta;
    if (nextVal < 0) return;

    // Check tier stock
    if (nextVal > maxAvailable) {
      alert(`Hạng vé này chỉ còn lại ${maxAvailable} vé!`);
      return;
    }

    // Check total tickets limit (5 per user per event)
    const currentTotal = Object.values(gaQuantities).reduce((a, b) => a + b, 0);
    const newTotal = selectedSeatIds.length + currentTotal + delta;
    if (newTotal > 5) {
      alert('Chính sách Ticketbox: Giới hạn tối đa 5 vé trên một đơn hàng / tài khoản để chống đầu cơ!');
      return;
    }

    setGaQuantities((prev) => ({
      ...prev,
      [tierId]: nextVal,
    }));
  };

  // Seat Click handler
  const handleSeatClick = (seat: Seat) => {
    const sStatus = seat.status?.toLowerCase();
    if (sStatus === 'sold' || sStatus === 'reserved' || sStatus === 'booked' || sStatus === 'locked') {
      return; // Cannot select
    }

    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat._id));
    } else {
      const currentGaTotal = Object.values(gaQuantities).reduce((a, b) => a + b, 0);
      if (selectedSeatIds.length + currentGaTotal >= 5) {
        alert('Chính sách Ticketbox: Bạn chỉ được chọn tối đa 5 vé/ghế trong một giao dịch.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat._id]);
    }
  };

  const rawType = (event?.seatingType || event?.type || '').toUpperCase();
  const isHybridEvent = rawType === 'HYBRID';
  const isSeatedEvent = rawType === 'SEATED';
  const isGaEvent = !isHybridEvent && !isSeatedEvent;

  const showSeatMap = (isSeatedEvent || isHybridEvent) && seats.length > 0;
  const showGaSection = isGaEvent || (isHybridEvent && tiers.some((t) => t.type?.toLowerCase() === 'ga'));

  const gaTiersToDisplay = isHybridEvent
    ? tiers.filter((t) => t.type?.toLowerCase() === 'ga')
    : tiers;

  // Calculate totals
  const totalTickets = selectedSeatIds.length + Object.values(gaQuantities).reduce((a, b) => a + b, 0);

  const totalPrice =
    selectedSeatIds.reduce((sum, sId) => {
      const s = seats.find((x) => x._id === sId);
      const tierIdStr = typeof s?.tierId === 'object' && s?.tierId ? (s.tierId as any)._id : s?.tierId;
      const t = tiers.find((x) => x._id === tierIdStr);
      return sum + (t?.price || 0);
    }, 0) +
    Object.entries(gaQuantities).reduce((sum, [tId, qty]) => {
      const t = tiers.find((x) => x._id === tId);
      return sum + (t?.price || 0) * qty;
    }, 0);

  // Submit hold
  const handleHoldReservation = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`);
      return;
    }

    if (totalTickets === 0) {
      alert('Vui lòng chọn ít nhất 1 vé hoặc ghế!');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload: any = {
      eventId: event!._id,
    };

    if (selectedSeatIds.length > 0) {
      payload.seatIds = selectedSeatIds;
    }

    const gaItems = Object.entries(gaQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }));

    if (gaItems.length > 0) {
      payload.gaItems = gaItems;
    }

    const res = await apiRequest<any>('/bookings/hold', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      const targetOrderId = res.data._id || res.data.orderId;
      setActiveOrder(res.data);
      router.push(`/checkout/${targetOrderId}`);
    } else {
      const errorText = Array.isArray(res.message)
        ? res.message.join(', ')
        : (res.message || res.error || 'Không thể giữ chỗ. Ghế hoặc vé có thể vừa được người khác chọn. Vui lòng thử lại!');
      setErrorMsg(errorText);
      // Soft background refresh of seat/tier status without wiping errorMsg or resetting UI
      fetchEventDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Đang tải thông tin sơ đồ & hạng vé sự kiện...</p>
      </div>
    );
  }

  if (errorMsg && !event) {
    return (
      <div className="py-16 text-center">
        <div className="bg-red-900/30 border border-red-700/50 p-6 rounded-2xl max-w-lg mx-auto">
          <p className="text-red-400 text-sm font-semibold">{errorMsg}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Event Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80'}
            alt={event.title}
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="bg-[#00b14f] text-white text-[11px] font-bold px-2.5 py-0.5 rounded">
                  {event.category}
                </span>
                <span className="bg-slate-800/80 backdrop-blur-md text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/30">
                  {event.seatingType === 'SEATED' ? 'Sơ đồ ghế ngồi có số' : 'Khu vực vé đứng (GA)'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {event.title}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm flex items-center gap-2">
                <span>📍 {(typeof event.venue === 'object' && event.venue?.name) || (typeof event.location === 'object' && (event.location as any)?.name) || event.venueName || 'Ticketbox Arena'}, {(typeof event.venue === 'object' && event.venue?.address) || (typeof event.location === 'object' && (event.location as any)?.address) || ''}, {(typeof event.venue === 'object' && event.venue?.city) || (typeof event.location === 'object' && (event.location as any)?.city) || ''}</span>
                <span>•</span>
                <span>🗓️ {new Date(event.startDate || event.startTime || '').toLocaleString('vi-VN')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-4 bg-red-900/40 border border-red-600/50 rounded-xl text-red-300 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Booking Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Map / Tier Selection (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SEATED: Interactive Seatmap */}
          {showSeatMap && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Sơ Đồ Ghế Ngồi Trực Quan</h2>
                  <p className="text-xs text-gray-400">
                    Bấm trực tiếp vào ghế để chọn. Ghế được khóa nguyên tử chống trùng lặp.
                  </p>
                </div>

                {/* Seat Map Legend */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600"></div>
                    <span>Trống</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-[#00b14f]"></div>
                    <span>Đang chọn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-amber-950/50 border border-amber-500/50"></div>
                    <span className="text-amber-400">Đang giữ chỗ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-red-950/60 border border-red-700/50"></div>
                    <span className="text-red-400">Đã bán</span>
                  </div>
                </div>

              </div>

              {/* Stage Visual */}
              <div className="w-full bg-gradient-to-b from-slate-700 to-slate-800 py-2 text-center rounded-xl text-xs font-extrabold uppercase tracking-widest text-emerald-400 shadow-inner">
                SÂN KHẤU CHÍNH (STAGE)
              </div>

              {/* Seats Grid */}
              <div className="overflow-x-auto p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-center">
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2.5 sm:gap-3 p-2">
                  {seats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat._id);
                    const seatStatus = (seat.status || '').toLowerCase();
                    const isSold = seatStatus === 'sold';
                    const isReserved = seatStatus === 'reserved' || seatStatus === 'locked' || seatStatus === 'booked';
                    const isOccupied = isSold || isReserved;
                    const seatTierId = (seat.tierId as any)?._id || seat.tierId;
                    const tier = tiers.find((t) => t._id === seatTierId);

                    return (
                      <button
                        key={seat._id}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#00b14f] text-white ring-2 ring-emerald-300 shadow-lg shadow-emerald-500/30 scale-105'
                            : isSold
                            ? 'bg-red-950/60 text-red-500/80 border border-red-900/60 cursor-not-allowed line-through'
                            : isReserved
                            ? 'bg-amber-950/40 text-amber-500/80 border border-amber-800/50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700/80 hover:border-emerald-500'
                        }`}
                        title={`${seat.seatCode} - ${tier?.name || ''} - ${(tier?.price || 0).toLocaleString('vi-VN')} đ ${isSold ? '(Đã bán)' : isReserved ? '(Đang giữ chỗ)' : ''}`}
                      >
                        <span>{seat.seatCode}</span>
                        <span className="text-[8px] opacity-75">{tier?.name ? tier.name.substring(0, 3) : ''}</span>
                      </button>
                    );

                  })}
                </div>
              </div>

              {/* Tier Price Summary Badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {tiers.map((t) => (
                  <div key={t._id} className="bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="font-semibold text-white">{t.name}:</span>
                    <span className="text-[#00b14f] font-bold">{t.price.toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* GA Ticket Selector */}
          {showGaSection && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Chọn Số Lượng Vé Đứng (GA)</h2>
                <p className="text-xs text-gray-400">
                  Hệ thống kiểm soát tồn kho thời gian thực với cơ chế Atomic Decrement chống quá bán.
                </p>
              </div>

              <div className="space-y-4">
                {gaTiersToDisplay.map((tier) => {
                  const qty = gaQuantities[tier._id] || 0;
                  const availableCount = tier.availableQty ?? tier.availableQuantity ?? tier.availableCapacity ?? 0;
                  const isSoldOut = availableCount <= 0;

                  return (
                    <div
                      key={tier._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/50 border border-slate-700/70 rounded-xl gap-4 hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm">{tier.name}</h3>
                          {isSoldOut ? (
                            <span className="bg-red-900/60 text-red-300 border border-red-700/40 text-[10px] px-2 py-0.5 rounded font-bold">
                              Hết vé
                            </span>
                          ) : (
                            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 text-[10px] px-2 py-0.5 rounded font-bold">
                              Còn {availableCount} vé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{tier.description || 'Vé vào cổng tự do theo khu vực'}</p>
                        <p className="text-base font-extrabold text-[#00b14f]">
                          {tier.price.toLocaleString('vi-VN')} đ
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          disabled={qty <= 0}
                          onClick={() => handleGaChange(tier._id, -1, availableCount)}
                          className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-white text-base">
                          {qty}
                        </span>
                        <button
                          disabled={isSoldOut || (selectedSeatIds.length + Object.values(gaQuantities).reduce((a, b) => a + b, 0)) >= 5}
                          onClick={() => handleGaChange(tier._id, 1, availableCount)}
                          className="w-9 h-9 rounded-lg bg-[#00b14f] hover:bg-[#009241] text-white font-bold text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event description & venue guidelines */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-white text-sm">Thông tin sự kiện & Quy định ban tổ chức</h3>
            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
            <div className="pt-2 text-[11px] text-gray-400 space-y-1 border-t border-slate-800">
              <p>• Vé mua không được hoàn trả hoặc bán lại (Anti-resale policy).</p>
              <p>• Vui lòng xuất trình mã QR e-ticket hợp lệ tại cổng để nhân viên soát vé quét mã.</p>
              <p>• Trẻ em dưới 12 tuổi phải có người lớn đi kèm.</p>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary / Sticky Box (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Thông Tin Đặt Chỗ
            </h3>

            {/* Selected items breakdown */}
            <div className="space-y-3 text-xs">
              {selectedSeatIds.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-1">Ghế đã chọn ({selectedSeatIds.length}/5):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeatIds.map((sId) => {
                      const s = seats.find((x) => x._id === sId);
                      return (
                        <span
                          key={sId}
                          className="bg-[#00b14f]/20 border border-[#00b14f]/40 text-[#00b14f] px-2 py-0.5 rounded font-bold"
                        >
                          {s?.seatCode}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.entries(gaQuantities).some(([_, q]) => q > 0) && (
                <div>
                  <p className="text-gray-400 mb-1">Vé đứng (GA) đã chọn:</p>
                  <div className="space-y-1.5">
                    {Object.entries(gaQuantities)
                      .filter(([_, q]) => q > 0)
                      .map(([tId, qty]) => {
                        const t = tiers.find((x) => x._id === tId);
                        return (
                          <div key={tId} className="flex justify-between text-gray-300">
                            <span>{t?.name} x {qty}</span>
                            <span className="font-semibold text-white">
                              {((t?.price || 0) * qty).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {selectedSeatIds.length === 0 && !Object.entries(gaQuantities).some(([_, q]) => q > 0) && (
                <p className="text-gray-400 italic">Chưa chọn vé hoặc ghế nào</p>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
                <span className="font-bold text-white">Tổng tiền tạm tính:</span>
                <span className="font-extrabold text-[#00b14f] text-lg">
                  {totalPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Active Hold Alert in Event Page */}
            {activeOrder && secondsRemaining > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[11px] text-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Bạn đang có đơn hàng giữ chỗ</span>
                  <span className="text-amber-400 font-mono">{formatCountdown(secondsRemaining)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/checkout/${activeOrder._id}`)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors text-xs"
                >
                  Đi đến trang thanh toán đơn hàng này
                </button>
              </div>
            )}

            {/* Error Message Toast */}
            {errorMsg && (
              <div className="p-3 bg-red-950/70 border border-red-700/60 rounded-xl text-red-200 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Invalidation note */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 space-y-1">
              <p className="font-bold">⏱️ Thời gian giữ chỗ: 10 phút</p>
              <p className="text-gray-400">
                Sau khi nhấn "Tiếp tục thanh toán", hệ thống sẽ khóa giữ vé cho bạn trong 10 phút để hoàn tất thủ tục thanh toán.
              </p>
            </div>

            {/* Action CTA */}
            <button
              disabled={totalTickets === 0 || submitting}
              onClick={handleHoldReservation}
              className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009241] text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang khóa giữ vé...</span>
                </>
              ) : (
                <span>Tiếp tục thanh toán ({totalTickets} vé)</span>
              )}
            </button>

            {!user && (
              <p className="text-center text-[11px] text-gray-400">
                Bạn cần đăng nhập để tiến hành giữ chỗ và xuất vé điện tử.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
