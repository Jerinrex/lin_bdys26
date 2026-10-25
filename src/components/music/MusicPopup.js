"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";
import GoldHeart from "@/components/common/GoldHeart";
import Button from "@/components/common/Button";

// Shown first on "/" until she answers. The click also satisfies the browser's autoplay policy.
export default function MusicPopup() {
  const { choice, hydrated, chooseMusic } = useMusic();
  const open = hydrated && choice === null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="music-popup"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          role="dialog"
          aria-modal="true"
          aria-label="Music choice"
        >
          <div className="relative w-full max-w-sm">
            {/* gentle heart pulse around the card */}
            <GoldHeart
              size={64}
              filled={false}
              className="absolute -left-3 -top-8 [animation:soft-pulse_2.6s_ease-in-out_infinite]"
            />
            <GoldHeart
              size={44}
              filled={false}
              className="absolute -right-2 -bottom-7 [animation:soft-pulse_3.1s_ease-in-out_infinite_0.6s]"
            />
            <motion.div
              initial={{ scale: 0.9, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className="gold-card relative px-6 py-8 text-center"
            >
              <p className="font-heading text-2xl leading-snug text-gold-light">Do you want to enter my world with music?</p>
              <div className="mt-7 flex items-center justify-center gap-3">
                <Button onClick={() => chooseMusic(true)}>Yes 🎵</Button>
                <Button variant="outline" onClick={() => chooseMusic(false)}>
                  No 🤍
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
