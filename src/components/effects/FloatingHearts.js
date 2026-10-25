"use client";

import { useEffect, useState } from "react";
import GoldHeart from "@/components/common/GoldHeart";

// A few slow floating gold hearts. Used on selected pages only.
export default function FloatingHearts({ count = 7, className = "" }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = reduced ? Math.min(count, 3) : window.innerWidth < 640 ? Math.min(count, 6) : count;
    setHearts(
      Array.from({ length: n }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        size: 14 + Math.random() * 20,
        duration: 14 + Math.random() * 12,
        delay: -Math.random() * 20,
        filled: Math.random() > 0.45,
      }))
    );
  }, [count]);

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[1] overflow-hidden ${className}`}>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-[-40px] block"
          style={{
            left: `${h.left}%`,
            animation: `heart-float ${h.duration}s linear ${h.delay}s infinite`,
          }}
        >
          <GoldHeart size={h.size} filled={h.filled} />
        </span>
      ))}
    </div>
  );
}
