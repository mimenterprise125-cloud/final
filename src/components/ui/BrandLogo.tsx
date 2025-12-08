import React from "react";

const BrandLogo: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feBlend in="SourceGraphic" in2="b" />
        </filter>
      </defs>

      <circle cx="32" cy="32" r="28" fill="url(#g1)" />

      <g filter="url(#f1)" opacity="0.96">
        <path
          d="M20 44 L32 20 L44 44 Z"
          fill="white"
          opacity="0.95"
          transform="translate(0,0) scale(0.9) translate(3,3)"
        />
        <path d="M24 40 L32 26 L40 40 Z" fill="#06b6d4" opacity="0.92" />
      </g>
    </svg>
  );
};

export default BrandLogo;
