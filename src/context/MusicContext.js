"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Howl } from "howler";
import { SITE } from "@/config/site";

const STORAGE_KEY = "kuyilu:music-choice"; // "yes" | "no"
const TARGET_VOLUME = 0.5;

const playlist = SITE.playlist && SITE.playlist.length > 0 ? SITE.playlist : [SITE.musicSrc];

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const soundRef = useRef(null);
  const wantsMusic = useRef(false); // she turned it on and has not muted it
  const pausedByHidden = useRef(false);
  const trackIndexRef = useRef(0);

  const [choice, setChoice] = useState(null); // null until she answers the popup
  const [hydrated, setHydrated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playTrackAtIndex = useCallback((index) => {
    trackIndexRef.current = index;
    setCurrentTrackIndex(index);

    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }

    const trackPath = playlist[index];
    const sound = new Howl({
      src: [encodeURI(trackPath), trackPath],
      format: ["mp3"],
      loop: false,
      volume: TARGET_VOLUME,
      html5: true,
      onload: () => {
        if (wantsMusic.current && !sound.playing()) {
          sound.volume(TARGET_VOLUME);
          sound.play();
          setPlaying(true);
        }
      },
      onend: () => {
        // Automatically play the next song in the playlist
        const nextIndex = (trackIndexRef.current + 1) % playlist.length;
        playTrackAtIndex(nextIndex);
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

    if (wantsMusic.current) {
      sound.volume(TARGET_VOLUME);
      if (!sound.playing()) {
        sound.play();
      }
      setPlaying(true);
    }
  }, []);

  const start = useCallback(() => {
    wantsMusic.current = true;
    if (!soundRef.current) {
      playTrackAtIndex(trackIndexRef.current);
    } else {
      soundRef.current.volume(TARGET_VOLUME);
      if (!soundRef.current.playing()) {
        soundRef.current.play();
      }
      setPlaying(true);
    }
  }, [playTrackAtIndex]);

  const stop = useCallback(() => {
    const sound = soundRef.current;
    wantsMusic.current = false;
    setPlaying(false);
    if (!sound) return;
    sound.pause();
  }, []);

  const nextTrack = useCallback(() => {
    const nextIdx = (trackIndexRef.current + 1) % playlist.length;
    playTrackAtIndex(nextIdx);
  }, [playTrackAtIndex]);

  const prevTrack = useCallback(() => {
    const prevIdx = (trackIndexRef.current - 1 + playlist.length) % playlist.length;
    playTrackAtIndex(prevIdx);
  }, [playTrackAtIndex]);

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

  // Restore choice on refresh
  useEffect(() => {
    let saved = null;
    try {
      saved = sessionStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved === "yes" || saved === "no") {
      setChoice(saved);
      if (saved === "yes") start();
    }
    setHydrated(true);
  }, [start]);

  // Pause when tab hidden, resume when visible
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

  // Unlock audio on first user touch/click
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
    () => ({
      choice,
      hydrated,
      playing,
      chooseMusic,
      toggle,
      nextTrack,
      prevTrack,
      currentTrackIndex,
      playlist,
    }),
    [choice, hydrated, playing, chooseMusic, toggle, nextTrack, prevTrack, currentTrackIndex]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}
