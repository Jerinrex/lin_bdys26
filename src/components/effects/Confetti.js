"use client";

import { useEffect } from "react";

const GOLD_COLORS = ["#F5E6A8", "#D4AF37", "#A67C00", "#FFF4C2", "#E8C766"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Imperative helper (lazy-loads canvas-confetti). `soft` = a small golden burst.
export async function fireGoldConfetti({ soft = false } = {}) {
  if (typeof window === "undefined") return;
  const reduced = prefersReducedMotion();
  const { default: confetti } = await import("canvas-confetti");
  const base = { colors: GOLD_COLORS, disableForReducedMotion: true, zIndex: 80, scalar: 1 };

  if (soft) {
    confetti({ ...base, particleCount: reduced ? 12 : 40, spread: 70, startVelocity: 22, origin: { x: 0.5, y: 0.45 }, scalar: 0.8 });
    return;
  }

  confetti({ ...base, particleCount: reduced ? 20 : 120, spread: 80, origin: { x: 0.5, y: 0.55 } });
  if (reduced) return;
  const end = Date.now() + 2200;
  const frame = () => {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...base, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// Declarative wrapper: fires whenever `fire` becomes true.
export default function Confetti({ fire, soft = false }) {
  useEffect(() => {
    if (fire) fireGoldConfetti({ soft });
  }, [fire, soft]);
  return null;
}
