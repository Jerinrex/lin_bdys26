"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE, ROUTES } from "@/config/site";
import { LETTER } from "@/data/letterText";
import useUnlockGuard from "@/hooks/useUnlockGuard";
import PageTransition from "@/components/common/PageTransition";
import GoldCard from "@/components/common/GoldCard";
import Button from "@/components/common/Button";
import GoldenBird from "@/components/bird/GoldenBird";
import FloatingHearts from "@/components/effects/FloatingHearts";
import SparkleHeart from "@/components/effects/SparkleHeart";
import { fireGoldConfetti } from "@/components/effects/Confetti";
import LetterEnvelope from "@/components/letter/LetterEnvelope";
import Cake from "@/components/letter/Cake";

// stages: envelope -> letter -> heart -> cake
function Letter() {
  const [stage, setStage] = useState("envelope");
  const [visible, setVisible] = useState(0); // how many paragraphs are showing
  const [blown, setBlown] = useState(false);
  const lastRef = useRef(null);
  const timers = useRef([]);

  const total = LETTER.paragraphs.length;
  const allShown = visible >= total + 2; // paragraphs + sign-off + signature

  // reveal the letter line by line (reading time scales with length)
  useEffect(() => {
    if (stage !== "letter") return;
    let cancelled = false;
    const reveal = (n) => {
      if (cancelled) return;
      setVisible(n);
      if (n >= total + 2) return;
      const text = n === 0 ? "" : LETTER.paragraphs[n - 1] || "";
      const wait = n === 0 ? 900 : Math.min(4200, 1500 + text.length * 22);
      timers.current.push(setTimeout(() => reveal(n + 1), wait));
    };
    reveal(1);
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [stage, total]);

  // keep the newest line in view (only scrolls if it is off-screen)
  useEffect(() => {
    lastRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visible]);

  const goHeart = () => {
    setStage("heart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onHeartFormed = () => {
    fireGoldConfetti();
    timers.current.push(setTimeout(() => setStage("cake"), 3800));
  };

  const onBlown = () => {
    setBlown(true);
    timers.current.push(setTimeout(() => fireGoldConfetti(), 700));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <PageTransition className="flex flex-col items-center px-4 pb-16 pt-16">
      {(stage === "heart" || stage === "cake") && <FloatingHearts count={6} />}

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <AnimatePresence mode="wait">
          {stage === "envelope" && (
            <motion.div key="envelope" className="w-full" exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.5 }}>
              <LetterEnvelope onOpened={() => setStage("letter")} />
            </motion.div>
          )}

          {stage === "letter" && (
            <motion.div key="letter" className="w-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <GoldCard className="px-6 py-8 sm:px-8">
                <p className="gold-text font-script text-4xl leading-snug sm:text-5xl">{LETTER.greeting}</p>
                <div className="mt-5 space-y-4 font-body text-[15px] leading-relaxed text-ink/95 sm:text-base">
                  {LETTER.paragraphs.map((p, i) =>
                    i < visible ? (
                      <motion.p key={i} ref={i === visible - 1 ? lastRef : null} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        {p}
                      </motion.p>
                    ) : null
                  )}
                </div>

                {visible > total && (
                  <motion.p ref={visible === total + 1 ? lastRef : null} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="mt-7 font-heading text-lg text-gold-light">
                    {LETTER.signoff}
                  </motion.p>
                )}
                {visible > total + 1 && (
                  <motion.p ref={lastRef} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="gold-text font-script text-5xl">
                    {LETTER.signature}
                  </motion.p>
                )}
              </GoldCard>

              <div className="mt-6 flex min-h-[48px] justify-center">
                <AnimatePresence>
                  {allShown && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
                      <Button onClick={goHeart}>One more thing 🤍</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {stage === "heart" && (
            <motion.div key="heart" className="flex min-h-[70dvh] items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <SparkleHeart size={Math.min(300, typeof window !== "undefined" ? window.innerWidth - 60 : 280)} onFormed={onHeartFormed} />
            </motion.div>
          )}

          {stage === "cake" && (
            <motion.div key="cake" className="flex w-full flex-col items-center text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Cake onBlown={onBlown} />

              <AnimatePresence>
                {blown && (
                  <motion.div key="final" className="mt-6 flex flex-col items-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.1 }}>
                    <GoldenBird size={72} carry="heart" />
                    <h1 className="gold-text mt-2 font-script text-5xl leading-tight sm:text-6xl">Happy Birthday, {SITE.herName} 🤍</h1>
                    <div className="mt-8">
                      <Button variant="outline" href={ROUTES.welcome}>
                        Replay from the start
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default function LetterPage() {
  const allowed = useUnlockGuard();
  if (!allowed) return null;
  return <Letter />;
}
