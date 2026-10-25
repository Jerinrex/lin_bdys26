"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

const HEART =
  "M16 28 C4 19 1 12 1 8.5 C1 4.3 4.3 1 8.5 1 C11.6 1 14.4 2.8 16 5.6 C17.6 2.8 20.4 1 23.5 1 C27.7 1 31 4.3 31 8.5 C31 12 28 19 16 28 Z";

/**
 * Kuyilu, the little golden bird.
 * mode:    "perch" (gentle bob) | "fly" (wings flapping)
 * carry:   null | "heart" | "letter"
 * reactKey: increment to make the bird hop / tilt its head (quiz reactions)
 */
export default function GoldenBird({ mode = "perch", size = 96, carry = null, flip = false, reactKey = 0, className = "" }) {
  const id = useId().replace(/:/g, "");
  const controls = useAnimationControls();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reactKey % 2 === 1) {
      controls.start({ y: [0, -18, 0, -7, 0], transition: { duration: 0.6, ease: "easeOut" } });
    } else {
      controls.start({ rotate: [0, -14, 10, -4, 0], transition: { duration: 0.8, ease: "easeInOut" } });
    }
  }, [reactKey, controls]);

  const flying = mode === "fly";

  return (
    <motion.div animate={controls} className={`inline-block ${className}`} style={{ width: size, height: size * (100 / 120) }}>
      <motion.div
        animate={flying ? { y: [0, -6, 0] } : { y: [0, -2.5, 0], rotate: [0, -1.5, 0] }}
        transition={{ duration: flying ? 0.68 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 120 100"
          width={size}
          height={size * (100 / 120)}
          className={flying ? "bird-flap" : ""}
          style={{
            overflow: "visible",
            transform: flip ? "scaleX(-1)" : undefined,
            filter: "drop-shadow(0 0 9px rgba(212,175,55,0.5))",
          }}
          role="img"
          aria-label="Kuyilu, the little golden bird"
        >
          <defs>
            <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F5E6A8" />
              <stop offset="0.55" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
          </defs>
          {/* tail */}
          <path d="M32 62 L6 74 L12 60 L2 56 L30 52 Z" fill={`url(#bg-${id})`} />
          {/* body + head */}
          <path d="M30 62 C30 40 50 28 72 32 C90 35 98 48 94 60 C90 74 70 82 52 80 C40 79 30 73 30 62 Z" fill={`url(#bg-${id})`} />
          <circle cx="88" cy="40" r="16" fill={`url(#bg-${id})`} />
          {/* beak */}
          <path d="M102 38 L116 43 L102 47 Z" fill="#A67C00" />
          {/* wing */}
          <path className="bird-wing" d="M54 52 C44 30 24 22 10 26 C26 34 36 48 40 62 Z" fill="#F5E6A8" opacity="0.92" />
          {/* eye */}
          <circle cx="93" cy="36" r="2.6" fill="#0A0A0A" />
          <circle cx="94" cy="35" r="0.8" fill="#fff" />
          {/* little legs when perched */}
          {!flying && (
            <g stroke="#A67C00" strokeWidth="2" strokeLinecap="round">
              <path d="M58 80 L58 90" />
              <path d="M68 80 L68 90" />
            </g>
          )}
          {/* carried item */}
          {carry === "heart" && (
            <g transform="translate(100 48) scale(0.55)">
              <path d={HEART} fill={`url(#bg-${id})`} stroke="#A67C00" strokeWidth="1" />
            </g>
          )}
          {carry === "letter" && (
            <g transform="translate(98 47)">
              <rect width="20" height="13" rx="1.5" fill="#F4EBD0" stroke="#A67C00" strokeWidth="1" />
              <path d="M0.5 1 L10 8 L19.5 1" fill="none" stroke="#A67C00" strokeWidth="1" />
              <circle cx="10" cy="8.2" r="1.8" fill="#B03A5B" />
            </g>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}
