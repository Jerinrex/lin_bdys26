"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Howl } from "howler";
import { SITE } from "@/config/site";

const STORAGE_KEY = "kuyilu:music-choice"; // "yes" | "no"
const TARGET_VOLUME = 0.5;

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const soundRef = useRef(null);
  const wantsMusic = useRef(false); // she turned it on and has not muted it
  const pausedByHidden = useRef(false);

  const [choice, setChoice] = useState(null); // null until she answers the popup
  const [hydrated, setHydrated] = useState(false);
  const [playing, setPlaying] = useState(false);

  const ensureSound = useCallback(() => {
    if (!soundRef.current) {
      const sound = new Howl({
        src: [encodeURI(SITE.musicSrc), SITE.musicSrc],
        format: ["mp3"],
        loop: true,
        volume: TARGET_VOLUME,
        html5: true,
        onload: () => {
          if (wantsMusic.current && !sound.playing()) {
            sound.volume(TARGET_VOLUME);
            sound.play();
            setPlaying(true);
          }
        },
        onloaderror: (id, err) => {
          console.error("Audio load error:", err);
        },
        onplayerror: (id, err) => {
          console.warn("Audio play error (awaiting gesture):", err);
          sound.once("unlock", () => {
            sound.volume(TARGET_VOLUME);
            sound.play();
            setPlaying(true);
          });
        },
      });
      soundRef.current = sound;
    }
    return soundRef.current;
  }, []);

  const start = useCallback(() => {
    const sound = ensureSound();
    wantsMusic.current = true;
    sound.volume(TARGET_VOLUME);
    if (!sound.playing()) {
      sound.play();
    }
    setPlaying(true);
  }, [ensureSound]);

  const stop = useCallback(() => {
    const sound = soundRef.current;
    wantsMusic.current = false;
    setPlaying(false);
    if (!sound) return;
    sound.pause();
  }, []);

  const chooseMusic = useCallback(
    (yes) => {
      const value = yes ? "yes" : "no";
      setChoice(value);
      try {
        sessionStorage.setItem(STORAGE_KEY, value);
      } catch {}
      if (yes) start();
      else stop();
    },
    [start, stop]
  );

  const toggle = useCallback(() => {
    if (wantsMusic.current) {
      stop();
      try {
        sessionStorage.setItem(STORAGE_KEY, "no");
      } catch {}
    } else {
      start();
      try {
        sessionStorage.setItem(STORAGE_KEY, "yes");
      } catch {}
    }
  }, [start, stop]);

  // Restore the choice after a refresh within the same session.
  useEffect(() => {
    let saved = null;
    try {
      saved = sessionStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved === "yes" || saved === "no") {
      setChoice(saved);
      if (saved === "yes") start(); // may be blocked by autoplay policy; Howler retries on unlock
    }
    setHydrated(true);
  }, [start]);

  // Pause when the tab is hidden, resume when visible if she had it on.
  useEffect(() => {
    const onVisibility = () => {
      const sound = soundRef.current;
      if (!sound) return;
      if (document.hidden) {
        if (wantsMusic.current && sound.playing()) {
          pausedByHidden.current = true;
          sound.pause();
        }
      } else if (pausedByHidden.current && wantsMusic.current) {
        pausedByHidden.current = false;
        sound.play();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Ensure audio plays as soon as user clicks anywhere if autoplay was restricted
  useEffect(() => {
    const unlockOnGesture = () => {
      if (wantsMusic.current && soundRef.current) {
        soundRef.current.volume(TARGET_VOLUME);
        if (!soundRef.current.playing()) {
          soundRef.current.play();
          setPlaying(true);
        }
      }
    };
    window.addEventListener("click", unlockOnGesture, { passive: true });
    window.addEventListener("touchstart", unlockOnGesture, { passive: true });
    return () => {
      window.removeEventListener("click", unlockOnGesture);
      window.removeEventListener("touchstart", unlockOnGesture);
    };
  }, []);

  useEffect(() => {
    return () => {
      soundRef.current?.unload();
      soundRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({ choice, hydrated, playing, chooseMusic, toggle }),
    [choice, hydrated, playing, chooseMusic, toggle]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}
