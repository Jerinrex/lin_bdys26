"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GALLERY_PHOTOS, FALLBACK_PHOTOS } from "@/data/galleryData";
import { SITE, ROUTES } from "@/config/site";
import GoldenBird from "@/components/bird/GoldenBird";
import Button from "@/components/common/Button";

function checkImageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = encodeURI(decodeURI(src));
  });
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 340 : -340,
    opacity: 0,
    scale: 0.82,
    rotate: direction > 0 ? 12 : -12,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    zIndex: 10,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 26,
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -340 : 340,
    opacity: 0,
    scale: 0.82,
    rotate: direction > 0 ? -14 : 14,
    zIndex: 0,
    transition: {
      duration: 0.32,
      ease: "easeInOut",
    },
  }),
};

const ROMANTIC_NOTES = [
  "My favorite view in the whole world 🤍",
  "Every memory with you is my treasure ✨",
  "That smile will always have my heart 🥹",
  "Holding your hand is my safest home 🫶",
  "I still choose you, every single day ❤️",
  "Nothing feels as sweet as you, Kuyilu 💛",
  "Forever grateful for every moment with you 🤍",
];

export default function PolaroidGallery() {
  const [photos, setPhotos] = useState([]);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(false);

  // Load and validate photos
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const valid = [];
      for (const src of GALLERY_PHOTOS) {
        const exists = await checkImageExists(src);
        if (exists) valid.push(src);
        else {
          const pngSrc = src.replace(/\.(jpg|jpeg)$/i, ".png");
          const pngExists = await checkImageExists(pngSrc);
          if (pngExists) valid.push(pngSrc);
        }
      }

      if (cancelled) return;

      if (valid.length > 0) {
        setPhotos(shuffle(valid));
      } else {
        setPhotos(FALLBACK_PHOTOS);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = photos.length;
  const currentIndex = total > 0 ? ((page % total) + total) % total : 0;

  const paginate = useCallback(
    (newDirection) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (!isPlaying || total <= 1 || lightbox) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, total, lightbox, paginate]);

  // Touch / swipe drag handler
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -8000 || offset.x < -70) {
      paginate(1);
    } else if (swipe > 8000 || offset.x > 70) {
      paginate(-1);
    }
  };

  const currentPhoto = photos[currentIndex];
  const nextPhoto = total > 1 ? photos[(currentIndex + 1) % total] : null;
  const note = ROMANTIC_NOTES[currentIndex % ROMANTIC_NOTES.length];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Golden Bird perched on top */}
      <div className="mb-4">
        <GoldenBird size={68} carry="heart" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GoldenBird mode="fly" size={64} />
          <p className="mt-4 font-script text-3xl text-gold-light">Opening our memory collection…</p>
        </div>
      ) : (
        <>
          {/* Slideshow Showcase Stage */}
          <div className="relative w-full flex items-center justify-center py-6 px-4 select-none min-h-[480px] sm:min-h-[560px]">
            {/* Background 3D Stacked Shadow Cards (Depth Illusion) */}
            <div
              className="absolute w-[290px] h-[390px] sm:w-[360px] sm:h-[470px] rounded-sm bg-[#1c1811] border border-gold/20 shadow-2xl opacity-40 -rotate-6 scale-90 pointer-events-none transition-transform"
            />
            <div
              className="absolute w-[290px] h-[390px] sm:w-[360px] sm:h-[470px] rounded-sm bg-[#221d15] border border-gold/30 shadow-2xl opacity-60 rotate-4 scale-95 pointer-events-none transition-transform"
            />

            {/* Main Polaroid Frame with Spring Animation */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.65}
                onDragEnd={handleDragEnd}
                className="relative w-[300px] sm:w-[375px] rounded-sm bg-[#faf6ed] p-3 sm:p-4 pb-7 sm:pb-9 shadow-[0_0_55px_rgba(212,175,55,0.32),0_25px_60px_rgba(0,0,0,0.88)] border border-[#ede1c7] cursor-grab active:cursor-grabbing"
              >
                {/* Photo Glass Container */}
                <div
                  onClick={() => setLightbox(true)}
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-xs bg-[#1f1a13] cursor-zoom-in group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={encodeURI(decodeURI(currentPhoto))}
                    alt="Memory"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                  />
                  {/* Gloss Highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/15" />

                  {/* Zoom hint badge */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm text-gold-light text-[10px] px-2 py-0.5 rounded-full border border-gold/40">
                    tap to zoom
                  </div>
                </div>

                {/* Polaroid Bottom Note Area */}
                <div className="mt-3.5 sm:mt-4 text-center px-2">
                  <p className="font-script text-2xl sm:text-3xl text-[#6b4e1b] leading-tight transition-colors">
                    {note}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1.5 opacity-60">
                    <span className="h-1 w-1 rounded-full bg-[#8c6722]" />
                    <span className="text-[11px] text-[#8c6722]">🤍</span>
                    <span className="h-1 w-1 rounded-full bg-[#8c6722]" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls Bar (Black & Gold luxury theme) */}
          <div className="mt-2 flex items-center justify-center gap-6 z-20">
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous memory"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/70 bg-[#16120a] text-gold-light shadow-glow hover:scale-110 hover:bg-gold/15 active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Play / Pause Autoplay */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              className="flex items-center gap-2 rounded-full border border-gold/50 bg-[#16120a]/80 px-4 py-2 font-body text-xs text-gold-light shadow-glow backdrop-blur hover:bg-gold/10 transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${isPlaying ? "bg-gold animate-pulse" : "bg-ink/40"}`} />
              <span>{isPlaying ? "Slideshow Playing" : "Paused"}</span>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next memory"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/70 bg-[#16120a] text-gold-light shadow-glow hover:scale-110 hover:bg-gold/15 active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Photo Counter & Dot Progress */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="font-heading text-sm text-gold-light tracking-widest tabular-nums">
              <span className="text-gold font-bold text-base">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="mx-1 text-ink/40">/</span>
              <span className="text-ink/60">{String(total).padStart(2, "0")}</span>
            </span>

            {/* Little golden dots */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs px-4">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const diff = idx - currentIndex;
                    if (diff !== 0) paginate(diff);
                  }}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 bg-gold shadow-glow"
                      : "w-1.5 bg-gold/25 hover:bg-gold/50"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 font-body text-[11px] text-ink/50">Swipe left or right to flip through our memories</p>
          </div>

          {/* Final Call to Action to Letter */}
          <div className="mt-12 mb-6 text-center">
            <Button href={ROUTES.letter}>One more surprise for you 🤍</Button>
          </div>
        </>
      )}

      {/* Full-Screen Zoom Lightbox */}
      <AnimatePresence>
        {lightbox && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] max-w-lg rounded-sm bg-[#faf6ee] p-4 pb-10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.3)] border border-[#ede3cb]"
            >
              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close"
                className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/70 bg-[#141009] text-gold-light shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
              >
                ✕
              </button>

              <div className="overflow-hidden rounded-xs bg-[#241e15]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(decodeURI(currentPhoto))}
                  alt="Expanded memory"
                  className="max-h-[72vh] w-auto object-contain mx-auto"
                />
              </div>

              <div className="mt-4 flex items-center justify-between px-2">
                <span className="font-heading text-xs text-[#7c5f22]/70">
                  {currentIndex + 1} / {total}
                </span>
                <p className="font-script text-2xl text-[#7c5f22]">
                  {note}
                </p>
                <span className="w-8" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
