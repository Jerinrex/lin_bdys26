"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import FlyingBird from "@/components/bird/FlyingBird";
import GoldHeart from "@/components/common/GoldHeart";

const FLIGHT = 3.4; // seconds for the bird to cross the screen
const W = 280;
const H = 190;

// A golden bird flies across carrying a sealed letter, drops it, and the envelope opens.
export default function LetterEnvelope({ onOpened }) {
  const [dropped, setDropped] = useState(false);
  const [open, setOpen] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const timers = useRef([]);
  const reduced = useRef(false);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // drop the letter around the middle of the flight
    later(() => setDropped(true), reduced.current ? 100 : FLIGHT * 0.42 * 1000);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // once dropped and settled, open the envelope, then hand over to the letter
  useEffect(() => {
    if (!dropped) return;
    later(() => setOpen(true), reduced.current ? 200 : 1700);
    later(() => setFlapBehind(true), reduced.current ? 300 : 2100);
    later(() => onOpened?.(), reduced.current ? 700 : 3500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropped]);

  return (
    <div className="relative flex min-h-[70dvh] w-full items-center justify-center">
      <FlyingBird variant="across" carry="letter" size={92} duration={FLIGHT} topPct={14} />

      {dropped && (
        <motion.div
          initial={{ y: -260, rotate: -14, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 11, mass: 1 }}
          style={{ width: W, height: H, perspective: 900 }}
          className="relative"
        >
          {/* back of the envelope */}
          <div className="absolute inset-0 rounded-md border border-gold bg-[#1a1407] shadow-glow-lg" />

          {/* the letter, sliding up out of the envelope */}
          <motion.div
            className="absolute left-3 right-3 top-3 bottom-3 rounded-sm bg-ink"
            style={{ zIndex: 1 }}
            animate={{ y: open ? -78 : 0 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
          >
            <div className="mx-auto mt-5 h-1 w-2/3 rounded bg-gold-deep/40" />
            <div className="mx-auto mt-3 h-1 w-1/2 rounded bg-gold-deep/30" />
          </motion.div>

          {/* front pocket */}
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" style={{ zIndex: 2 }} aria-hidden="true">
            <defs>
              <linearGradient id="env-front" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a2210" />
                <stop offset="1" stopColor="#17120a" />
              </linearGradient>
            </defs>
            <path d={`M0 ${H * 0.34} L${W / 2} ${H * 0.66} L${W} ${H * 0.34} L${W} ${H} L0 ${H} Z`} fill="url(#env-front)" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" />
            <path d={`M0 ${H} L${W * 0.42} ${H * 0.58}`} stroke="#A67C00" strokeWidth="1" />
            <path d={`M${W} ${H} L${W * 0.58} ${H * 0.58}`} stroke="#A67C00" strokeWidth="1" />
          </svg>

          {/* flap */}
          <motion.div
            className="absolute left-0 top-0 w-full"
            style={{
              height: H * 0.66,
              transformOrigin: "50% 0%",
              transformStyle: "preserve-3d",
              zIndex: flapBehind ? 0 : 3,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(135deg, #F5E6A8, #D4AF37 55%, #A67C00)",
              backfaceVisibility: "visible",
            }}
            animate={{ rotateX: open ? 180 : 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />

          {/* heart seal */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: H * 0.66 - 20, zIndex: 4 }}
            animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <GoldHeart size={34} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
