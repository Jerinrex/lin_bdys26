"use client";

import { useMusic } from "@/context/MusicContext";

// Mute / unmute and Next song button, visible on every page once the popup has been answered.
export default function MusicToggle() {
  const { choice, playing, toggle, nextTrack } = useMusic();
  if (choice === null) return null;

  return (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mute music" : "Play music"}
        aria-pressed={playing}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 bg-bg-soft/80 text-gold-light shadow-glow backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" fillOpacity="0.2" />
          {playing ? (
            <>
              <path d="M15.5 9a4 4 0 0 1 0 6" />
              <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
            </>
          ) : (
            <>
              <path d="M16 9.5l5 5" />
              <path d="M21 9.5l-5 5" />
            </>
          )}
        </svg>
      </button>

      {/* Skip to next song */}
      <button
        type="button"
        onClick={nextTrack}
        aria-label="Next song"
        title="Next song"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-bg-soft/75 text-gold-light/80 shadow-glow backdrop-blur transition-transform hover:scale-110 hover:text-gold active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M5 4l10 8-10 8V4zm11 0h3v16h-3V4z" />
        </svg>
      </button>
    </div>
  );
}
