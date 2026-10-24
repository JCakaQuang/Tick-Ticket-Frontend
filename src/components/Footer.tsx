'use client';

import React from 'react';
import Link from 'next/link';
import { TickTicketLogo } from './TickTicketLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#131a29] text-gray-400 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <TickTicketLogo variant="dark" size="md" />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tick Ticket là nền tảng phân phối vé sự kiện và quản lý vé trực tuyến hàng đầu. Hệ thống kiểm soát vé công nghệ cao, giữ chỗ nguyên tử chống nghẽn và ngăn chặn phe vé &amp; bán lại.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-950/60 border border-green-800/80 rounded-full text-[11px] text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Bảo mật giao dịch &amp; Giới hạn tối đa 5 vé/người
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Về Tick Ticket
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link href="/my-tickets" className="hover:text-white transition-colors">Quản lý vé của tôi</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Chủ đề sự kiện
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Live Concert Âm nhạc</span></li>
              <li><span className="hover:text-white cursor-pointer">Sân khấu kịch &amp; Nghệ thuật</span></li>
              <li><span className="hover:text-white cursor-pointer">Giải đấu Thể thao</span></li>
              <li><span className="hover:text-white cursor-pointer">Hội thảo &amp; Workshop</span></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Hỗ trợ khách hàng
            </h4>
            <p className="text-xs text-gray-400 mb-2">
              Hotline: <strong className="text-white">1900 6408</strong> (8h00 - 21h00)
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Email: <strong className="text-white">support@tickticket.vn</strong>
            </p>
            <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-xs">
              <p className="font-semibold text-gray-300 mb-1">Cơ chế đặt vé an toàn</p>
              <p className="text-gray-400 text-[11px]">
                Giữ chỗ 10 phút nguyên tử - Không lo giật vé hay trùng ghế.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Tick Ticket - Vé sự kiện trực tuyến. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Điều khoản sử dụng</span>
            <span>•</span>
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">Chính sách hoàn hủy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
