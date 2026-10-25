"use client";

import { useId } from "react";

const HEART_PATH =
  "M16 28 C4 19 1 12 1 8.5 C1 4.3 4.3 1 8.5 1 C11.6 1 14.4 2.8 16 5.6 C17.6 2.8 20.4 1 23.5 1 C27.7 1 31 4.3 31 8.5 C31 12 28 19 16 28 Z";

// Gold heart: filled gradient or glowing outline.
export default function GoldHeart({ size = 24, filled = true, glow = true, className = "", style }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 32 30"
      width={size}
      height={size * (30 / 32)}
      className={className}
      style={{ filter: glow ? "drop-shadow(0 0 6px rgba(245,230,168,0.55))" : undefined, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`hg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5E6A8" />
          <stop offset="0.55" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#A67C00" />
        </linearGradient>
      </defs>
      <path
        d={HEART_PATH}
        fill={filled ? `url(#hg-${id})` : "none"}
        stroke={filled ? "none" : `url(#hg-${id})`}
        strokeWidth={filled ? 0 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}
