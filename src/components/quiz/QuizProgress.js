"use client";

import { motion } from "framer-motion";
import GoldHeart from "@/components/common/GoldHeart";

// Heart-shaped progress: hearts fill with gold as she answers.
export default function QuizProgress({ total, answered }) {
  const size = total > 10 ? 18 : 24;
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1.5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={answered}
      aria-label={`Question ${Math.min(answered + 1, total)} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const filled = i < answered;
        const current = i === answered;
        return (
          <motion.span
            key={i}
            animate={filled ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            className={current ? "[animation:soft-pulse_1.8s_ease-in-out_infinite]" : ""}
          >
            <GoldHeart size={size} filled={filled} glow={filled} style={{ opacity: filled || current ? 1 : 0.45 }} />
          </motion.span>
        );
      })}
    </div>
  );
}
