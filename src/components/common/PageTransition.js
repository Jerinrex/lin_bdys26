"use client";

import { motion } from "framer-motion";

// Fade + slight upward slide for every page.
export default function PageTransition({ children, className = "" }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative z-10 min-h-[100dvh] w-full ${className}`}
    >
      {children}
    </motion.main>
  );
}
