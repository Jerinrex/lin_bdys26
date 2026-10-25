"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Black-and-gold birthday cake. Tap the candle (or the cake) to blow it out.
// The microphone is optional: the tap always works.
export default function Cake({ onBlown }) {
  const [lit, setLit] = useState(true);
  const [listening, setListening] = useState(false);
  const [micFailed, setMicFailed] = useState(false);
  const micRef = useRef({ stream: null, ctx: null, raf: 0 });

  const stopMic = useCallback(() => {
    const m = micRef.current;
    cancelAnimationFrame(m.raf);
    m.stream?.getTracks().forEach((t) => t.stop());
    m.ctx?.close?.().catch(() => {});
    micRef.current = { stream: null, ctx: null, raf: 0 };
    setListening(false);
  }, []);

  const blow = useCallback(() => {
    setLit((wasLit) => {
      if (wasLit) setTimeout(() => onBlown?.(), 0);
      return false;
    });
    stopMic();
  }, [onBlown, stopMic]);

  useEffect(() => () => stopMic(), [stopMic]);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let hits = 0;
      micRef.current = { stream, ctx, raf: 0 };
      setListening(true);
      const loop = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const x = (buf[i] - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / buf.length);
        hits = rms > 0.12 ? hits + 1 : Math.max(0, hits - 1);
        if (hits > 8) {
          blow();
          return;
        }
        micRef.current.raf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setMicFailed(true);
      setListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={blow}
        disabled={!lit}
        aria-label={lit ? "Blow out the candle" : "The candle is out"}
        className="relative block rounded-xl p-2 transition-transform active:scale-95 disabled:cursor-default"
      >
        <svg viewBox="0 0 240 270" width="240" height="270" className="max-w-full" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="cake-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F5E6A8" />
              <stop offset="0.55" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#A67C00" />
            </linearGradient>
            <linearGradient id="cake-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a2210" />
              <stop offset="1" stopColor="#120e06" />
            </linearGradient>
            <radialGradient id="flame-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFF4C2" stopOpacity="0.9" />
              <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* plate */}
          <ellipse cx="120" cy="248" rx="108" ry="12" fill="url(#cake-gold)" opacity="0.9" />
          <ellipse cx="120" cy="244" rx="100" ry="9" fill="#17120a" stroke="#D4AF37" strokeWidth="1" />

          {/* bottom tier */}
          <rect x="28" y="170" width="184" height="72" rx="12" fill="url(#cake-body)" stroke="#D4AF37" strokeWidth="2" />
          <path d="M28 182 q 15 14 30 0 q 15 14 30 0 q 15 14 30 0 q 15 14 30 0 q 15 14 30 0 q 15 14 30 0 q 4 4 4 0" fill="none" stroke="url(#cake-gold)" strokeWidth="3.5" strokeLinecap="round" />
          {/* middle tier */}
          <rect x="56" y="118" width="128" height="56" rx="10" fill="url(#cake-body)" stroke="#D4AF37" strokeWidth="2" />
          <path d="M56 130 q 12.8 12 25.6 0 q 12.8 12 25.6 0 q 12.8 12 25.6 0 q 12.8 12 25.6 0 q 12.8 12 25.6 0" fill="none" stroke="url(#cake-gold)" strokeWidth="3.5" strokeLinecap="round" />
          {/* top tier */}
          <rect x="84" y="78" width="72" height="44" rx="9" fill="url(#cake-body)" stroke="#D4AF37" strokeWidth="2" />
          <path d="M84 89 q 9 10 18 0 q 9 10 18 0 q 9 10 18 0 q 9 10 18 0" fill="none" stroke="url(#cake-gold)" strokeWidth="3.5" strokeLinecap="round" />

          {/* little hearts on the cake */}
          {[
            [58, 214],
            [94, 222],
            [132, 214],
            [170, 222],
            [196, 208],
            [96, 154],
            [144, 154],
          ].map(([x, y], i) => (
            <path
              key={i}
              transform={`translate(${x - 6} ${y - 6}) scale(0.4)`}
              d="M16 28 C4 19 1 12 1 8.5 C1 4.3 4.3 1 8.5 1 C11.6 1 14.4 2.8 16 5.6 C17.6 2.8 20.4 1 23.5 1 C27.7 1 31 4.3 31 8.5 C31 12 28 19 16 28 Z"
              fill="url(#cake-gold)"
            />
          ))}

          {/* candle */}
          <rect x="115" y="46" width="10" height="34" rx="2" fill="url(#cake-gold)" />
          <path d="M115 56 L125 52 M115 64 L125 60 M115 72 L125 68" stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="2" />
          <path d="M120 46 L120 42" stroke="#0A0A0A" strokeWidth="1.4" />

          {/* flame */}
          {lit && (
            <g style={{ transformOrigin: "120px 42px", transformBox: "view-box", animation: "flame-flicker 0.9s ease-in-out infinite" }}>
              <circle cx="120" cy="30" r="24" fill="url(#flame-glow)" />
              <path d="M120 14 C128 24 130 32 120 42 C110 32 112 24 120 14 Z" fill="#F5E6A8" />
              <path d="M120 24 C124 30 125 35 120 40 C115 35 116 30 120 24 Z" fill="#fff8d6" />
            </g>
          )}

          {/* smoke after blowing */}
          {!lit &&
            [0, 1, 2].map((i) => (
              <motion.path
                key={i}
                d={`M${116 + i * 4} 40 q ${i % 2 ? 8 : -8} -12 0 -24 q ${i % 2 ? -8 : 8} -12 0 -22`}
                fill="none"
                stroke="#F4EBD0"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ opacity: 0.7, y: 0 }}
                animate={{ opacity: 0, y: -26 }}
                transition={{ duration: 1.8, delay: i * 0.18, ease: "easeOut" }}
              />
            ))}
        </svg>
      </button>

      {lit && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="font-script text-3xl text-gold-light">Make a wish, Kuyilu… then tap the candle</p>
          {!listening && !micFailed && (
            <button
              type="button"
              onClick={startMic}
              className="min-h-[44px] rounded-full border border-gold/50 px-4 font-body text-xs text-ink/75 transition-colors hover:bg-gold/10"
            >
              Or blow into the mic 🎤
            </button>
          )}
          {listening && <p className="font-body text-xs text-ink/70">Listening… blow gently (you can still tap)</p>}
          {micFailed && <p className="font-body text-xs text-ink/60">No mic? No problem, just tap the candle.</p>}
        </div>
      )}
    </div>
  );
}
