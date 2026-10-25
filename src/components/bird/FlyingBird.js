"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import GoldenBird from "./GoldenBird";
import GoldHeart from "@/components/common/GoldHeart";

const STEPS = 10;
const easeOut = (t) => 1 - Math.pow(1 - t, 2);

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Flight wrapper around GoldenBird.
 *  variant="land"   flies in from off-screen left and lands where this element sits (hearts trail behind)
 *  variant="away"   perched here until `go` is true, then flies off-screen
 *  variant="across" fixed-position pass from the left edge to the right edge (letter delivery)
 */
export default function FlyingBird({
  variant = "land",
  size = 96,
  carry = null,
  duration = 3.2,
  go = true,
  topPct = 16,
  trail = true,
  onDone,
  className = "",
}) {
  const ref = useRef(null);
  const doneRef = useRef(false);
  const [geo, setGeo] = useState(null);
  const [phase, setPhase] = useState("wait"); // wait | flying | landed

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  };

  // measure where we are, then start
  useEffect(() => {
    if (variant === "across") {
      if (reducedMotion()) {
        setPhase("landed");
        finish();
        return;
      }
      setGeo({ w: window.innerWidth });
      setPhase("flying");
      return;
    }
    if (variant === "land") {
      if (reducedMotion()) {
        setPhase("landed");
        finish();
        return;
      }
      const r = ref.current.getBoundingClientRect();
      setGeo({ dx0: -(r.left + size + 40), dy0: -Math.min(170, r.top + size) });
      setPhase("flying");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (variant !== "away" || !go) return;
    if (reducedMotion()) {
      setPhase("landed");
      finish();
      return;
    }
    const r = ref.current.getBoundingClientRect();
    setGeo({ dx1: window.innerWidth - r.left + size, dy1: -220 });
    setPhase("flying");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, variant]);

  const path = useMemo(() => {
    if (!geo) return null;
    if (variant === "land") {
      const pts = Array.from({ length: STEPS + 1 }, (_, k) => {
        const p = easeOut(k / STEPS);
        return { x: geo.dx0 * (1 - p), y: geo.dy0 * (1 - p) - 55 * Math.sin(Math.PI * p) };
      });
      return { xs: pts.map((p) => p.x), ys: pts.map((p) => p.y), pts };
    }
    if (variant === "across") {
      const total = geo.w + size * 2 + 40;
      const pts = Array.from({ length: STEPS + 1 }, (_, k) => {
        const p = k / STEPS;
        return { x: -size - 20 + total * p, y: Math.sin(p * Math.PI * 2) * 22 };
      });
      return { xs: pts.map((p) => p.x), ys: pts.map((p) => p.y), pts };
    }
    return null;
  }, [geo, variant, size]);

  const flying = phase === "flying";

  // ---- across ----
  if (variant === "across") {
    return (
      <div className="pointer-events-none fixed left-0 z-30" style={{ top: `${topPct}%` }} aria-hidden="true">
        {path && flying && (
          <motion.div
            initial={{ x: path.xs[0], y: path.ys[0] }}
            animate={{ x: path.xs, y: path.ys }}
            transition={{ duration, ease: "linear" }}
            onAnimationComplete={() => {
              setPhase("landed");
              finish();
            }}
          >
            <GoldenBird mode="fly" size={size} carry={carry} />
          </motion.div>
        )}
      </div>
    );
  }

  // ---- away ----
  if (variant === "away") {
    return (
      <div ref={ref} className={`relative inline-block ${className}`} style={{ width: size, height: size * 0.83 }}>
        {phase !== "landed" && (
          <motion.div
            animate={flying && geo ? { x: geo.dx1, y: geo.dy1, opacity: [1, 1, 0] } : { x: 0, y: 0, opacity: 1 }}
            transition={{ duration: duration, ease: "easeIn" }}
            onAnimationComplete={() => {
              if (flying) {
                setPhase("landed");
                finish();
              }
            }}
          >
            <GoldenBird mode={flying ? "fly" : "perch"} size={size} carry={carry} />
          </motion.div>
        )}
      </div>
    );
  }

  // ---- land ----
  return (
    <div ref={ref} className={`relative inline-block ${className}`} style={{ width: size, height: size * 0.83 }}>
      {path && flying && trail &&
        path.pts.slice(1, STEPS).map((pt, k) => (
          <motion.span
            key={k}
            className="pointer-events-none absolute left-0 top-0 block"
            style={{ x: pt.x + size * 0.1, y: pt.y + size * 0.45 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.4, 1, 0.8], translateY: [0, -22] }}
            transition={{ delay: ((k + 1) / STEPS) * duration, duration: 1.3, ease: "easeOut" }}
          >
            <GoldHeart size={10 + (k % 3) * 4} />
          </motion.span>
        ))}
      <motion.div
        initial={path ? { x: path.xs[0], y: path.ys[0], opacity: 0 } : { opacity: phase === "landed" ? 1 : 0 }}
        animate={
          flying && path
            ? { x: path.xs, y: path.ys, opacity: 1 }
            : { x: 0, y: 0, opacity: phase === "wait" ? 0 : 1 }
        }
        transition={{
          x: { duration, ease: "linear" },
          y: { duration, ease: "linear" },
          opacity: { duration: 0.5 },
        }}
        onAnimationComplete={() => {
          if (flying) {
            setPhase("landed");
            finish();
          }
        }}
      >
        <GoldenBird mode={flying ? "fly" : "perch"} size={size} carry={flying ? carry : null} />
      </motion.div>
    </div>
  );
}
