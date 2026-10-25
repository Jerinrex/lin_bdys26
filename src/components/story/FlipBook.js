"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { SITE } from "@/config/site";
import GoldenBird from "@/components/bird/GoldenBird";
import GoldCard from "@/components/common/GoldCard";
import Feathers from "@/components/story/Feathers";

const RENDER_WIDTH = 900;
const pageCache = new Map();

// Story pages using Canva images directly
const AMES_STORY_PAGES = [
  "/story/ames.png",
  encodeURI("/story/ames (1).png"),
  encodeURI("/story/ames (2).png"),
  encodeURI("/story/ames (3).png"),
  encodeURI("/story/ames (4).png"),
  encodeURI("/story/ames (5).png"),
  "teaser",
  "back-cover",
];

const Page = forwardRef(function Page({ src, number }, ref) {
  const isTeaser = src === "teaser";
  const isBackCover = src === "back-cover";

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-[#100d08]" data-density="soft">
      {isTeaser ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1a140d] via-[#120f0a] to-[#0a0805] p-7 text-center border-l border-gold/30 shadow-[inset_16px_0_30px_rgba(0,0,0,0.7)] select-none">
          <div className="relative mb-2">
            <GoldenBird size={72} carry="heart" />
          </div>
          <h3 className="gold-text mt-3 font-script text-5xl leading-tight sm:text-6xl">
            To be continued…
          </h3>
          <p className="mt-4 font-body text-sm text-gold-light/95 leading-relaxed max-w-[280px] sm:text-base">
            The remaining story you can&apos;t see here simply, <span className="font-script text-2xl text-gold font-normal">Thanga Kutty</span>…
          </p>
          <p className="mt-2 font-body text-xs text-ink/80 leading-relaxed max-w-[260px] sm:text-sm">
            You have to wait for it, that will reach you soon 🤍
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </div>
        </div>
      ) : isBackCover ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#120f0a] to-[#080604] p-8 text-center border-l border-gold/40 shadow-2xl select-none">
          <GoldenBird size={56} />
          <h4 className="mt-5 font-heading text-lg font-medium text-gold-light/80 tracking-wide">
            Our Story
          </h4>
          <p className="mt-1 font-script text-3xl text-gold">Chapter 1</p>
          <p className="mt-6 font-body text-xs text-ink/50 tracking-wider uppercase">
            Forever & Always 🤍
          </p>
        </div>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Page ${number}`}
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-bg-soft">
          <GoldenBird mode="fly" size={44} />
        </div>
      )}
    </div>
  );
});

function Loader({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <GoldenBird mode="fly" size={96} />
      <p className="font-script text-3xl text-gold-light">{label}</p>
    </div>
  );
}

function checkImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ok: true, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ ok: false });
    img.src = src;
  });
}

export default function FlipBook() {
  const containerRef = useRef(null);
  const bookRef = useRef(null);

  const [status, setStatus] = useState("loading"); // loading | ready | missing
  const [meta, setMeta] = useState(null); // { numPages, aspect }
  const [pages, setPages] = useState([]);
  const [containerW, setContainerW] = useState(0);
  const [current, setCurrent] = useState(0);
  const [opened, setOpened] = useState(false);
  const [feathersKey, setFeathersKey] = useState(0);
  const [loadProgress, setLoadProgress] = useState("");

  // ---- feathers when the book opens ----
  useEffect(() => {
    if (status === "ready" && !opened) {
      setOpened(true);
      setFeathersKey((k) => k + 1);
    }
  }, [status, opened]);

  // ---- measure available width ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- load story (Canva images first, fallback to PDF) ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadProgress("Opening our storybook…");

        // 1. Check if the Canva images exist (ames.png is the cover)
        const amesCheck = await checkImage("/story/ames.png");
        if (amesCheck.ok) {
          const aspect = amesCheck.height / amesCheck.width;
          if (cancelled) return;
          setMeta({ numPages: AMES_STORY_PAGES.length, aspect });
          setPages(AMES_STORY_PAGES);
          setStatus("ready");
          return;
        }

        // 2. Check if numbered images 1.jpg/png exist
        const extensions = ["png", "jpg", "jpeg", "webp"];
        for (const ext of extensions) {
          const test = await checkImage(`/story/1.${ext}`);
          if (test.ok) {
            const aspect = test.height / test.width;
            const renderedPages = [];
            for (let i = 1; i <= 7; i++) {
              renderedPages.push(`/story/${i}.${ext}`);
            }
            renderedPages.push("teaser");
            if (cancelled) return;
            setMeta({ numPages: renderedPages.length, aspect });
            setPages(renderedPages);
            setStatus("ready");
            return;
          }
        }

        // 3. Fallback to PDF if images are not present
        const cached = pageCache.get(SITE.storyPdf);
        if (cached && cached.pages.filter(Boolean).length === cached.numPages) {
          setMeta({ numPages: cached.numPages, aspect: cached.aspect });
          setPages(cached.pages);
          setStatus("ready");
          return;
        }

        const pdfjsModule = await import("pdfjs-dist/build/pdf");
        const pdfjs = pdfjsModule.default || pdfjsModule;
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = SITE.pdfWorkerSrc;
        }

        const doc = await pdfjs.getDocument(SITE.storyPdf).promise;
        if (cancelled) return;

        const maxPages = Math.min(7, doc.numPages);
        const first = await doc.getPage(1);
        const vp1 = first.getViewport({ scale: 1 });
        const aspect = vp1.height / vp1.width;

        const renderedPages = [];
        for (let i = 1; i <= maxPages; i++) {
          if (cancelled) return;
          setLoadProgress(`Binding page ${i} of ${maxPages}…`);
          const page = i === 1 ? first : await doc.getPage(i);
          const origVp = page.getViewport({ scale: 1 });
          const scale = RENDER_WIDTH / (origVp.width || RENDER_WIDTH);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          renderedPages.push(canvas.toDataURL("image/jpeg", 0.85));
          canvas.width = 0;
          canvas.height = 0;
          await new Promise((r) => setTimeout(r, 10));
        }

        renderedPages.push("teaser");
        setMeta({ numPages: renderedPages.length, aspect });
        setPages(renderedPages);
        setStatus("ready");
      } catch (err) {
        console.error("[story] Error loading story:", err);
        if (!cancelled) setStatus("missing");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onFlip = useCallback((e) => {
    setCurrent(e.data);
  }, []);

  // ---- sizing: 1 page on narrow screens, 2-page spread on desktop ----
  const wide = containerW >= 700;
  let pageW = 0;
  let pageH = 0;
  if (meta && containerW) {
    pageW = wide ? Math.min(Math.floor(containerW / 2), 440) : Math.min(containerW - 24, 400);
    pageH = Math.round(pageW * meta.aspect);
    const maxH = typeof window !== "undefined" ? window.innerHeight - 240 : 700;
    if (pageH > maxH && maxH > 280) {
      pageH = maxH;
      pageW = Math.round(pageH / meta.aspect);
    }
  }

  const flipPrev = () => bookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => bookRef.current?.pageFlip()?.flipNext();

  const total = meta?.numPages || 0;
  const counter = total
    ? wide && current > 0 && current < total - 1
      ? `${current + 1}–${Math.min(current + 2, total)} / ${total}`
      : `${current + 1} / ${total}`
    : "";

  return (
    <div ref={containerRef} className="w-full">
      {status === "loading" && <Loader label={loadProgress || "Opening our storybook…"} />}

      {status === "missing" && (
        <GoldCard className="mx-auto max-w-sm px-6 py-10 text-center">
          <div className="flex justify-center">
            <GoldenBird size={80} />
          </div>
          <p className="mt-4 font-script text-4xl text-gold-light">Our story is still being written…</p>
          <p className="mt-2 font-body text-sm text-ink/75">Come back soon, Kuyilu. For now, let&apos;s play a little.</p>
        </GoldCard>
      )}

      {status === "ready" && pageW > 0 && (
        <>
          {feathersKey > 0 && <Feathers key={feathersKey} />}
          <div className="flex justify-center">
            <div className="rounded-md border border-gold/70 bg-[#17120a] p-2 shadow-[0_0_40px_rgba(212,175,55,0.28),0_18px_40px_rgba(0,0,0,0.7)] sm:p-3">
              <HTMLFlipBook
                key={`${pageW}x${pageH}x${wide}`}
                ref={bookRef}
                width={pageW}
                height={pageH}
                size="fixed"
                minWidth={150}
                maxWidth={900}
                minHeight={200}
                maxHeight={1400}
                showCover
                usePortrait
                mobileScrollSupport
                drawShadow
                maxShadowOpacity={0.5}
                flippingTime={750}
                swipeDistance={24}
                startPage={0}
                onFlip={onFlip}
                className="kuyilu-book"
                style={{}}
                startZIndex={0}
                autoSize={false}
                clickEventForward
                useMouseEvents
                showPageCorners
                disableFlipByClick={false}
              >
                {Array.from({ length: total }, (_, i) => (
                  <Page key={i} number={i + 1} src={pages[i]} />
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={flipPrev}
              aria-label="Previous page"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-gold-light transition-transform hover:scale-105 hover:bg-gold/10 active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <span className="min-w-[88px] text-center font-body text-sm text-ink/80" aria-live="polite">
              {counter}
            </span>
            <button
              type="button"
              onClick={flipNext}
              aria-label="Next page"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-gold-light transition-transform hover:scale-105 hover:bg-gold/10 active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center font-body text-xs text-ink/50">Swipe or tap the corners to turn the page</p>

        </>
      )}
    </div>
  );
}
