"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function Feather({ size }) {
  return (
    <svg viewBox="0 0 24 60" width={size} height={size * 2.5} aria-hidden="true">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5E6A8" />
          <stop offset="1" stopColor="#A67C00" />
        </linearGradient>
      </defs>
      <path d="M12 2 C22 16 22 38 12 58 C2 38 2 16 12 2 Z" fill="url(#fg)" opacity="0.9" />
      <path d="M12 6 L12 58" stroke="#0A0A0A" strokeOpacity="0.45" strokeWidth="0.8" />
    </svg>
  );
}

// Golden feathers drift down when the book opens.
export default function Feathers({ count = 14 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = reduced ? 0 : window.innerWidth < 640 ? Math.ceil(count / 2) : count;
    setItems(
      Array.from({ length: n }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 10,
        delay: Math.random() * 3,
        duration: 7 + Math.random() * 5,
        sway: (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 50),
        spin: (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 120),
      }))
    );
  }, [count]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {items.map((f) => (
        <motion.span
          key={f.id}
          className="absolute -top-16 block"
          style={{ left: `${f.left}%` }}
          initial={{ y: -80, x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: "110vh", x: [0, f.sway, -f.sway / 2, f.sway / 3], rotate: f.spin, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: f.duration, delay: f.delay, ease: "easeInOut" }}
        >
          <Feather size={f.size} />
        </motion.span>
      ))}
    </div>
  );
}
