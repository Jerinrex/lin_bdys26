"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE, ROUTES } from "@/config/site";
import useCountdown from "@/hooks/useCountdown";
import FlyingBird from "@/components/bird/FlyingBird";
import GoldCard from "@/components/common/GoldCard";
import Button from "@/components/common/Button";
import { fireGoldConfetti } from "@/components/effects/Confetti";

const pad = (n) => String(n).padStart(2, "0");

function Unit({ value, label }) {
  return (
    <div className="flex min-w-[58px] flex-col items-center sm:min-w-[76px]">
      <span className="gold-text font-heading text-4xl font-semibold tabular-nums sm:text-5xl">{value}</span>
      <span className="mt-1 font-body text-[11px] tracking-wide text-ink/70 sm:text-xs">{label}</span>
    </div>
  );
}

// The whole lock screen: perched bird, title, countdown, then "Open" once the time has come.
export default function Countdown({ active = true }) {
  const { ready, done, days, hours, minutes, seconds } = useCountdown(SITE.birthdayISO, { disabled: SITE.devUnlock });
  const [flewAway, setFlewAway] = useState(false);
  const [showOpen, setShowOpen] = useState(false);

  // When the count reaches zero (or the date already passed): soft golden burst, bird leaves, "Open" appears.
  useEffect(() => {
    if (!active || !ready || !done) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("birthday_unlocked", "true");
    }
    const t1 = setTimeout(() => fireGoldConfetti({ soft: true }), 300);
    const t2 = setTimeout(() => setShowOpen(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, ready, done]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-16">
      <div className="relative w-full max-w-md">
        {/* bird perched on top of the card */}
        <div className="absolute -top-[52px] left-1/2 z-10 -translate-x-1/2">
          <AnimatePresence>
            {!flewAway && (
              <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <FlyingBird variant="away" size={78} go={active && ready && done} duration={2.2} onDone={() => setFlewAway(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <GoldCard className="px-5 pb-8 pt-12 text-center sm:px-8">
          <h1 className="font-heading text-2xl leading-snug text-gold-light sm:text-3xl">
            Something special is waiting for you, <span className="font-script text-4xl text-gold sm:text-5xl">{SITE.petName}</span>…
          </h1>

          <div className="mt-8 min-h-[104px] flex items-center justify-center">
            {!ready ? (
              <div className="flex justify-center gap-3 opacity-40">
                <Unit value="--" label="days" />
                <Unit value="--" label="hours" />
                <Unit value="--" label="min" />
                <Unit value="--" label="sec" />
              </div>
            ) : !done ? (
              days === 0 && hours === 0 && minutes === 0 ? (
                <div className="flex flex-col items-center justify-center py-2" role="timer" aria-live="off">
                  <motion.span
                    key={seconds}
                    initial={{ scale: 1.4, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="gold-text font-heading text-6xl font-bold tabular-nums sm:text-7xl"
                  >
                    {seconds}
                  </motion.span>
                  <span className="mt-2 font-body text-xs tracking-widest text-ink/70 uppercase">
                    {seconds === 1 ? "second" : "seconds"}
                  </span>
                </div>
              ) : (
                <div className="flex items-start justify-center gap-1 sm:gap-3" role="timer" aria-live="off">
                  <Unit value={pad(days)} label="days" />
                  <Unit value={pad(hours)} label="hours" />
                  <Unit value={pad(minutes)} label="min" />
                  <Unit value={pad(seconds)} label="sec" />
                </div>
              )
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-script text-4xl text-gold-light sm:text-5xl"
              >
                It&apos;s time, my girl
              </motion.p>
            )}
          </div>

          {!done ? (
            <p className="mt-6 font-body text-sm text-ink/75">Patience, my girl. Good things are worth the wait.</p>
          ) : (
            <div className="mt-6 min-h-[48px]">
              <AnimatePresence>
                {showOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                    <Button href={ROUTES.welcome}>Open</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </GoldCard>
      </div>
    </div>
  );
}
