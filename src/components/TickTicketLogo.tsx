'use client';

import React from 'react';

interface TickTicketLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TickTicketLogo: React.FC<TickTicketLogoProps> = ({
  className = '',
  variant = 'dark',
  showText = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-200 group-hover:scale-105`}>
        <svg viewBox="0 0 180 180" className="w-full h-full overflow-visible drop-shadow" fill="none">
          <defs>
            <linearGradient id="tGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="tkGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="30%" stopColor="#15803d" />
              <stop offset="70%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
            <linearGradient id="hGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
              <stop offset="100%" stopColor="#bef264" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <g transform="rotate(-38 90 90)">
            <path
              d="M 40 22 H 138 A 8 8 0 0 1 146 30 V 54 C 141 54, 137 58, 137 64 C 137 70, 141 74, 146 74 V 89 C 141 89, 137 93, 137 99 C 137 105, 141 109, 146 109 V 132 A 8 8 0 0 1 138 140 H 40 A 8 8 0 0 1 32 132 V 109 C 37 109, 41 105, 41 99 C 41 93, 37 89, 32 89 V 74 C 37 74, 41 70, 41 64 C 41 58, 37 54, 32 54 V 30 A 8 8 0 0 1 40 22 Z"
              fill="url(#tGrad)"
              stroke="#14532d"
              strokeWidth="1.5"
            />
            <path d="M 44 32 H 134 V 130 H 44 Z" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.8" strokeDasharray="4 3" />
            <rect x="56" y="42" width="66" height="48" rx="6" fill="#ffffff" fillOpacity="0.95" stroke="#15803d" strokeWidth="1" strokeOpacity="0.4" />
            {/* Silhouettes of cheering audience */}
            <circle cx="69" cy="58" r="3.2" fill="#166534" />
            <path d="M 63 76 C 63 68, 75 68, 75 76 Z" fill="#166534" />
            <path d="M 63 69 Q 59 61 60 56 Q 62 56 65 65" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 71 67 Q 69 60 70 55 Q 72 55 72 64" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="89" cy="54" r="3.8" fill="#15803d" />
            <path d="M 82 76 C 82 66, 96 66, 96 76 Z" fill="#15803d" />
            <path d="M 82 65 Q 76 54 74 47" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 96 65 Q 102 54 104 47" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="108" cy="58" r="3.2" fill="#166534" />
            <path d="M 102 76 C 102 68, 114 68, 114 76 Z" fill="#166534" />
            <path d="M 107 67 Q 107 58 110 54" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 111 69 Q 116 62 118 57" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Swooping Checkmark */}
          <path d="M 48 99 C 55 110, 65 130, 77 144 C 81 149, 87 150, 92 145 C 111 126, 143 78, 179 27 C 182 23, 178 19, 174 21 C 140 38, 107 76, 89 106 C 81 97, 69 88, 61 81 C 56 77, 45 89, 48 99 Z" fill="#ffffff" />
          <path d="M 52 99 C 59 109, 68 127, 79 140 C 82 144, 86 145, 89 141 C 107 122, 138 76, 173 27 C 171 25, 168 26, 164 29 C 134 46, 103 82, 87 110 C 80 102, 70 94, 63 88 C 59 85, 50 94, 52 99 Z" fill="url(#tkGrad)" />
          <path d="M 87 110 C 103 82, 134 46, 164 29 C 168 26, 171 25, 173 27 C 170 30, 140 73, 111 116 C 100 132, 89 141, 89 141 C 86 145, 82 144, 79 140 C 82 133, 85 121, 87 110 Z" fill="url(#hGrad)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight font-black">
            {isDark ? (
              <span className="text-lg sm:text-xl font-extrabold flex items-center gap-1.5">
                <span className="text-white">TICK</span>
                <span className="text-[#22c55e]">TICKET</span>
              </span>
            ) : (
              <span className="text-lg sm:text-xl text-[#1b7a3e] font-extrabold flex items-center gap-1.5">
                <span>TICK TICKET</span>
              </span>
            )}
          </div>
          <span
            className={`text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase ${
              isDark ? 'text-[#4ade80]' : 'text-[#529c32]'
            }`}
          >
            VÉ SỰ KIỆN TRỰC TUYẾN
          </span>
        </div>
      )}
    </div>
  );
};
