"use client";

import { motion } from "framer-motion";
import { SITE, ROUTES } from "@/config/site";
import GoldCard from "@/components/common/GoldCard";
import GoldenBird from "@/components/bird/GoldenBird";
import Button from "@/components/common/Button";

export default function QuizComplete() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="w-full">
      <GoldCard className="px-6 py-10 text-center">
        <div className="flex justify-center">
          <GoldenBird size={92} carry="heart" />
        </div>
        <h2 className="gold-text mt-4 font-script text-5xl leading-tight sm:text-6xl">Every moment with you, {SITE.petName}</h2>
        <p className="mt-3 font-body text-sm text-ink/80">Every memory, every little thing we share means the world to me. Come, our story awaits.</p>
        <div className="mt-8">
          <Button href={ROUTES.story}>Continue</Button>
        </div>
      </GoldCard>
    </motion.div>
  );
}
