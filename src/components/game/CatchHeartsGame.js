"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/config/site";
import Button from "@/components/common/Button";
import GoldCard from "@/components/common/GoldCard";
import GoldenBird from "@/components/bird/GoldenBird";

const BIRD_SRC = "/images/bird/bird.svg";

function heartPath(ctx, x, y, s) {
  // heart centred at (x, y), roughly s wide
  const k = s / 32;
  ctx.save();
  ctx.translate(x - 16 * k, y - 14 * k);
  ctx.scale(k, k);
  ctx.beginPath();
  ctx.moveTo(16, 28);
  ctx.bezierCurveTo(4, 19, 1, 12, 1, 8.5);
  ctx.bezierCurveTo(1, 4.3, 4.3, 1, 8.5, 1);
  ctx.bezierCurveTo(11.6, 1, 14.4, 2.8, 16, 5.6);
  ctx.bezierCurveTo(17.6, 2.8, 20.4, 1, 23.5, 1);
  ctx.bezierCurveTo(27.7, 1, 31, 4.3, 31, 8.5);
  ctx.bezierCurveTo(31, 12, 28, 19, 16, 28);
  ctx.closePath();
  ctx.restore();
}

export default function CatchHeartsGame({ onContinue }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const birdImgRef = useRef(null);

  const [phase, setPhase] = useState("ready"); // ready | playing | done
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SITE.gameSeconds);

  // ---------- game loop ----------
  const startRound = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.hearts = [];
    s.pops = [];
    s.sparks = [];
    s.score = 0;
    s.elapsed = 0;
    s.spawnIn = 0.4;
    s.targetX = s.w / 2;
    s.birdX = s.w / 2;
    s.keys = { left: false, right: false };
    s.lastTs = 0;
    s.running = true;
    setScore(0);
    setTimeLeft(SITE.gameSeconds);
    setPhase("playing");

    const loop = (ts) => {
      if (!s.running) return;
      const dt = s.lastTs ? Math.min((ts - s.lastTs) / 1000, 0.05) : 0;
      s.lastTs = ts;
      step(s, dt);
      draw(s);
      if (s.elapsed >= SITE.gameSeconds) {
        s.running = false;
        setScore(s.score);
        setTimeLeft(0);
        setPhase("done");
        return;
      }
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
  }, []);

  function step(s, dt) {
    s.elapsed += dt;

    // keyboard movement
    const speed = s.w * 0.9;
    if (s.keys.left) s.targetX -= speed * dt;
    if (s.keys.right) s.targetX += speed * dt;
    s.targetX = Math.max(s.birdW / 2, Math.min(s.w - s.birdW / 2, s.targetX));
    s.birdX += (s.targetX - s.birdX) * Math.min(1, dt * 14);

    // spawn hearts (gentle pace)
    s.spawnIn -= dt;
    if (s.spawnIn <= 0) {
      const special = Math.random() < 0.1;
      const size = special ? s.unit * 1.9 : s.unit * (0.8 + Math.random() * 0.35);
      s.hearts.push({
        x: size / 2 + Math.random() * (s.w - size),
        y: -size,
        size,
        vy: s.h * (special ? 0.2 : 0.26 + Math.random() * 0.12),
        sway: Math.random() * Math.PI * 2,
        special,
      });
      s.spawnIn = 0.55 + Math.random() * 0.3;
    }

    // move + catch (missed hearts just drift away, no penalty)
    const catchY = s.h - s.birdH * 0.85;
    for (const h of s.hearts) {
      h.y += h.vy * dt;
      h.sway += dt * 2;
      h.x += Math.sin(h.sway) * 12 * dt;
      const withinX = Math.abs(h.x - s.birdX) < s.birdW * 0.5 + h.size * 0.3;
      const withinY = h.y + h.size * 0.4 > catchY && h.y < s.h - s.birdH * 0.2;
      if (!h.caught && withinX && withinY) {
        h.caught = true;
        const pts = h.special ? 5 : 1;
        s.score += pts;
        s.pops.push({ x: h.x, y: h.y, text: `+${pts}`, life: 0.9 });
        for (let i = 0; i < (h.special ? 14 : 7); i++) {
          const a = Math.random() * Math.PI * 2;
          const v = 40 + Math.random() * 90;
          s.sparks.push({ x: h.x, y: h.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 0.6 });
        }
        s.scoreDirty = true;
      }
    }
    s.hearts = s.hearts.filter((h) => !h.caught && h.y < s.h + h.size);
    for (const p of s.pops) {
      p.y -= 40 * dt;
      p.life -= dt;
    }
    s.pops = s.pops.filter((p) => p.life > 0);
    for (const p of s.sparks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.life -= dt;
    }
    s.sparks = s.sparks.filter((p) => p.life > 0);

    // sync a couple of numbers to React (cheap)
    if (s.scoreDirty) {
      s.scoreDirty = false;
      setScore(s.score);
    }
    const left = Math.max(0, Math.ceil(SITE.gameSeconds - s.elapsed));
    if (left !== s.lastLeft) {
      s.lastLeft = left;
      setTimeLeft(left);
    }
  }

  function draw(s) {
    const ctx = s.ctx;
    ctx.clearRect(0, 0, s.w, s.h);

    // hearts
    for (const h of s.hearts) {
      ctx.save();
      const g = ctx.createLinearGradient(h.x - h.size / 2, h.y - h.size / 2, h.x + h.size / 2, h.y + h.size / 2);
      g.addColorStop(0, "#F5E6A8");
      g.addColorStop(0.55, "#D4AF37");
      g.addColorStop(1, "#A67C00");
      ctx.shadowColor = h.special ? "rgba(255,244,194,0.95)" : "rgba(245,230,168,0.6)";
      ctx.shadowBlur = h.special ? 22 : 10;
      ctx.fillStyle = g;
      heartPath(ctx, h.x, h.y, h.size);
      ctx.fill();
      ctx.restore();
    }

    // sparks
    for (const p of s.sparks) {
      ctx.globalAlpha = Math.max(0, p.life / 0.6);
      ctx.fillStyle = "#F5E6A8";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // bird
    const img = birdImgRef.current;
    const bob = Math.sin(s.elapsed * 6) * 2;
    if (img && img.complete) {
      ctx.save();
      ctx.shadowColor = "rgba(212,175,55,0.55)";
      ctx.shadowBlur = 14;
      ctx.drawImage(img, s.birdX - s.birdW / 2, s.h - s.birdH - 6 + bob, s.birdW, s.birdH);
      ctx.restore();
    }

    // +N pops
    ctx.font = `600 ${Math.round(s.unit * 0.8)}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    for (const p of s.pops) {
      ctx.globalAlpha = Math.min(1, p.life / 0.5);
      ctx.fillStyle = "#F5E6A8";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- setup / teardown ----------
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = BIRD_SRC;
    birdImgRef.current = img;

    const s = {
      ctx,
      w: 0,
      h: 0,
      unit: 28,
      birdW: 72,
      birdH: 60,
      birdX: 0,
      targetX: 0,
      hearts: [],
      pops: [],
      sparks: [],
      keys: { left: false, right: false },
      running: false,
      raf: 0,
      elapsed: 0,
      score: 0,
    };
    stateRef.current = s;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.floor(s.w * dpr);
      canvas.height = Math.floor(s.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.unit = Math.max(22, Math.min(34, s.w / 11));
      s.birdW = Math.max(60, Math.min(88, s.w / 5));
      s.birdH = s.birdW * (100 / 120);
      s.targetX = Math.min(Math.max(s.targetX || s.w / 2, s.birdW / 2), s.w - s.birdW / 2);
      s.birdX = s.targetX;
      draw(s);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    img.onload = () => draw(s);

    const moveTo = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      s.targetX = Math.max(s.birdW / 2, Math.min(s.w - s.birdW / 2, clientX - rect.left));
    };
    const onPointer = (e) => moveTo(e.clientX);
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") s.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = true;
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") s.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = false;
    };
    const onVisibility = () => {
      s.lastTs = 0; // avoid a time jump after the tab was hidden
    };

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      s.running = false;
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.max(0, Math.min(1, timeLeft / SITE.gameSeconds));

  return (
    <div className="mx-auto w-full max-w-md">
      {/* HUD */}
      <div className="mb-3 flex items-center justify-between gap-4 px-1 font-body text-sm text-gold-light">
        <span aria-live="polite">Hearts: <b className="font-semibold">{score}</b></span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gold/20" aria-hidden="true">
          <div className="h-full rounded-full bg-gold-gradient transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
        </div>
        <span>{timeLeft}s</span>
      </div>

      <div
        ref={wrapRef}
        className="gold-card relative h-[min(62dvh,520px)] min-h-[320px] w-full overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ touchAction: "none" }} aria-label="Catch the falling gold hearts with the little bird" />

        <AnimatePresence>
          {phase === "ready" && (
            <motion.div
              key="ready"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 px-6 text-center backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GoldenBird size={84} />
              <p className="mt-3 font-script text-4xl text-gold-light">Ready, my girl?</p>
              <p className="mt-2 font-body text-sm text-ink/80">Drag to move Kuyilu and catch the hearts. No pressure, just play.</p>
              <div className="mt-6">
                <Button onClick={startRound}>Start</Button>
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/65 px-6 text-center backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GoldenBird size={84} carry="heart" />
              <p className="mt-3 font-script text-4xl leading-snug text-gold-light">
                You caught {score} {score === 1 ? "heart" : "hearts"}, my girl.
              </p>
              <p className="mt-1 font-script text-3xl text-gold">You already caught mine 🤍</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={startRound}>
                  Play again
                </Button>
                <Button onClick={onContinue}>Continue</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-center font-body text-xs text-ink/50">Drag with your finger or mouse, or use the arrow keys</p>
    </div>
  );
}
