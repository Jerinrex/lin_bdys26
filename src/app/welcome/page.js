"use client";

import { motion } from "framer-motion";
import { SITE, ROUTES } from "@/config/site";
import useUnlockGuard from "@/hooks/useUnlockGuard";
import PageTransition from "@/components/common/PageTransition";
import FlyingBird from "@/components/bird/FlyingBird";
import FloatingHearts from "@/components/effects/FloatingHearts";
import Button from "@/components/common/Button";

// EDIT ME: 2 to 3 loving lines shown under the heading.
const INTRO = [
  "I made this little corner of the internet just for you.",
  "There are a few surprises waiting inside, so take your time and enjoy every one.",
  "Ready, my girl?",
];

function Welcome() {
  return (
    <PageTransition className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <FloatingHearts count={7} />

      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <div className="flex flex-wrap items-end justify-center gap-x-2">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="gold-text font-script text-6xl leading-tight sm:text-7xl md:text-8xl"
          >
            Welcome, {SITE.petName}
          </motion.h1>
          <FlyingBird variant="land" size={84} carry="heart" duration={3.2} className="mb-1" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-2 font-heading text-lg text-gold-light sm:text-xl"
        >
          Happy Birthday, {SITE.herName} 🤍
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="mt-6 space-y-2 font-body text-base leading-relaxed text-ink/90"
        >
          {INTRO.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.8 }}
          className="mt-10"
        >
          <Button href={ROUTES.quiz}>Begin our journey</Button>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default function WelcomePage() {
  const allowed = useUnlockGuard();
  if (!allowed) return null;
  return <Welcome />;
}
