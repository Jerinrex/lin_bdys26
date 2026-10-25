"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Golden sparkles that fly in and assemble into one large heart.
export default function SparkleHeart({ size = 280, count = 90, onFormed }) {
  const [mounted, setMounted] = useState(false);

  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const k = size / 38;
      const angle = Math.random() * Math.PI * 2;
      const far = size * (0.9 + Math.random() * 0.8);
      return {
        i,
        x: hx * k,
        y: hy * k,
        fx: Math.cos(angle) * far,
        fy: Math.sin(angle) * far,
        r: 2 + Math.random() * 3.2,
        delay: Math.random() * 0.9,
      };
    });
  }, [count, size]);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => onFormed?.(), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return <div style={{ width: size, height: size }} />;

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <div className="absolute left-1/2 top-1/2">
        {points.map((p) => (
          <motion.span
            key={p.i}
            className="absolute block rounded-full"
            style={{
              width: p.r * 2,
              height: p.r * 2,
              marginLeft: -p.r,
              marginTop: -p.r,
              background: "radial-gradient(circle, #FFF4C2 0%, #D4AF37 60%, rgba(212,175,55,0) 100%)",
              boxShadow: "0 0 10px rgba(245,230,168,0.8)",
            }}
            initial={{ x: p.fx, y: p.fy, opacity: 0, scale: 0.2 }}
            animate={{ x: p.x, y: p.y, opacity: [0, 1, 0.85], scale: 1 }}
            transition={{ duration: 1.3, delay: p.delay, ease: "easeOut" }}
          />
        ))}
      </div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <span className="font-script text-4xl text-gold-light drop-shadow-[0_0_12px_rgba(245,230,168,0.6)]">I love you</span>
      </motion.div>
    </div>
  );
}
