"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GoldHeart from "@/components/common/GoldHeart";

// Small burst of gold hearts. Change `burstKey` to fire it. `origin` is in % of the parent box.
// The parent must be `relative`.
export default function HeartBurst({ burstKey, origin = { x: 50, y: 50 }, count = 9 }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!burstKey) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = reduced ? 4 : count;
    const id = burstKey;
    const hearts = Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 50 + Math.random() * 60;
      return {
        i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 24,
        size: 12 + Math.random() * 14,
        rot: (Math.random() - 0.5) * 60,
      };
    });
    setBursts((b) => [...b, { id, hearts, origin }]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      <AnimatePresence>
        {bursts.map((b) =>
          b.hearts.map((h) => (
            <motion.span
              key={`${b.id}-${h.i}`}
              className="absolute block"
              style={{ left: `${b.origin.x}%`, top: `${b.origin.y}%` }}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
              animate={{ x: h.dx, y: h.dy, scale: 1, opacity: 0, rotate: h.rot }}
              transition={{ duration: 0.95, ease: "easeOut" }}
            >
              <GoldHeart size={h.size} />
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
